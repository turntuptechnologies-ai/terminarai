import type { CommandHandler } from '../types'
import { invalidOptionError, parseShortFlags } from './parse-args'

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1)
}

/**
 * cp — ファイル / ディレクトリをコピーする。
 *
 * - `-r` / `-R` で再帰コピー (ディレクトリには必須)
 * - 形式: `cp SOURCE... DEST`
 *   - SOURCE が複数なら DEST は既存ディレクトリでなければならない
 *   - SOURCE がディレクトリで `-r` がないと "omitting directory" エラー
 * - `-i` / `-n` / `-p` 等は MVP 未対応
 *
 * 既知の制約: 同名ディレクトリへの再帰コピーは、宛先サブツリーが空でない場合
 * `ENOTEMPTY` で失敗する (VFS が真のマージコピーをサポートしないため)。
 * GNU `cp -r` は子ファイルをマージする挙動なのでここで乖離する。Issue #9 で追跡。
 */
export const cp: CommandHandler = (args, ctx, vfs) => {
  const parsed = parseShortFlags(args, 'rR')
  if (!parsed.ok) {
    return { stdout: '', stderr: invalidOptionError('cp', parsed.invalidFlag), exitCode: 1 }
  }
  const recursive = parsed.flags.has('r') || parsed.flags.has('R')
  const operands = parsed.positional

  if (operands.length === 0) {
    return {
      stdout: '',
      stderr: "cp: missing file operand\nTry 'cp --help' for more information.\n",
      exitCode: 1,
    }
  }
  if (operands.length === 1) {
    return {
      stdout: '',
      stderr: `cp: missing destination file operand after '${operands[0]}'\nTry 'cp --help' for more information.\n`,
      exitCode: 1,
    }
  }

  const dest = operands[operands.length - 1]
  const sources = operands.slice(0, -1)
  const destAbs = vfs.resolve(ctx.cwd, dest)

  if (sources.length > 1) {
    const destStat = vfs.stat(destAbs)
    if (!destStat.ok || destStat.value.type !== 'directory') {
      return {
        stdout: '',
        stderr: `cp: target '${dest}' is not a directory\n`,
        exitCode: 1,
      }
    }
  }

  let stderr = ''
  let exitCode = 0
  for (const source of sources) {
    const sourceAbs = vfs.resolve(ctx.cwd, source)
    const sourceStat = vfs.stat(sourceAbs)
    if (!sourceStat.ok) {
      stderr += `cp: cannot stat '${source}': ${sourceStat.error.message}\n`
      exitCode = 1
      continue
    }
    if (sourceStat.value.type === 'directory' && !recursive) {
      stderr += `cp: -r not specified; omitting directory '${source}'\n`
      exitCode = 1
      continue
    }
    const result = vfs.copy(sourceAbs, destAbs, { recursive })
    if (!result.ok) {
      if (result.error.code === 'EINVAL') {
        // 同一パス / 自身配下コピーは VFS のメッセージが既に src/dst を含むので、prefix だけ付ける
        // (先頭は GNU 風に小文字へ正規化)
        stderr += `cp: ${lowerFirst(result.error.message)}\n`
      } else {
        stderr += `cp: cannot copy '${source}' to '${dest}': ${result.error.message}\n`
      }
      exitCode = 1
    }
  }
  return { stdout: '', stderr, exitCode }
}
