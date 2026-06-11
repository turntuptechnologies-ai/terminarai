import type { CommandHandler } from '../types'
import { lowerFirst, runMultiSourceCommand } from './multi-source'
import { invalidOptionError, parseArgs } from './parse-args'

/**
 * cp — ファイル / ディレクトリをコピーする。
 *
 * - `-r` / `-R` / `--recursive` で再帰コピー (ディレクトリには必須)
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
  const parsed = parseArgs(args, { short: 'rR', longAliases: { recursive: 'r' } })
  if (!parsed.ok) {
    return {
      stdout: '',
      stderr: invalidOptionError('cp', parsed.invalidFlag, parsed.isLong),
      exitCode: 1,
    }
  }
  const recursive = parsed.flags.has('r') || parsed.flags.has('R')

  return runMultiSourceCommand(
    'cp',
    parsed.positional,
    ctx,
    vfs,
    (source, sourceAbs, dest, destAbs) => {
      const sourceStat = vfs.stat(sourceAbs)
      if (!sourceStat.ok) {
        return `cp: cannot stat '${source}': ${sourceStat.error.message}\n`
      }
      if (sourceStat.value.type === 'directory' && !recursive) {
        return `cp: -r not specified; omitting directory '${source}'\n`
      }
      const result = vfs.copy(sourceAbs, destAbs, { recursive })
      if (!result.ok) {
        if (result.error.code === 'EINVAL') {
          // 同一パス / 自身配下コピーは VFS のメッセージが既に src/dst を含むので、prefix だけ付ける
          // (先頭は GNU 風に小文字へ正規化)
          return `cp: ${lowerFirst(result.error.message)}\n`
        }
        return `cp: cannot copy '${source}' to '${dest}': ${result.error.message}\n`
      }
      return ''
    },
  )
}
