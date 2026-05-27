import type { CommandHandler } from '../types'
import { invalidOptionError, parseArgs } from './parse-args'

/** EINVAL のメッセージは VFS が "Cannot ..." と大文字で始まることがあるため、
 *  GNU 風 ("cmd: cannot ...") に揃えるために先頭を小文字化する。 */
function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1)
}

/**
 * mv — ファイル / ディレクトリを移動 (リネーム) する。
 *
 * - 形式: `mv SOURCE... DEST`
 *   - SOURCE が複数なら DEST は既存ディレクトリでなければならない
 * - ディレクトリも引数として OK (実 mv 同様、recursive フラグ不要)
 * - `-f` は MVP では no-op として受理 (mv の default 挙動が既に force overwrite)
 * - `-i` / `-n` / `-t` 等は MVP 未対応 (フラグ自体は invalid option エラー)
 */
export const mv: CommandHandler = (args, ctx, vfs) => {
  const parsed = parseArgs(args, { short: 'f', longAliases: { force: 'f' } })
  if (!parsed.ok) {
    return {
      stdout: '',
      stderr: invalidOptionError('mv', parsed.invalidFlag, parsed.isLong),
      exitCode: 1,
    }
  }
  const operands = parsed.positional

  if (operands.length === 0) {
    return {
      stdout: '',
      stderr: "mv: missing file operand\nTry 'mv --help' for more information.\n",
      exitCode: 1,
    }
  }
  if (operands.length === 1) {
    return {
      stdout: '',
      stderr: `mv: missing destination file operand after '${operands[0]}'\nTry 'mv --help' for more information.\n`,
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
        stderr: `mv: target '${dest}' is not a directory\n`,
        exitCode: 1,
      }
    }
  }

  let stderr = ''
  let exitCode = 0
  for (const source of sources) {
    const sourceAbs = vfs.resolve(ctx.cwd, source)
    const result = vfs.move(sourceAbs, destAbs)
    if (!result.ok) {
      if (result.error.code === 'EINVAL') {
        stderr += `mv: ${lowerFirst(result.error.message)}\n`
      } else {
        stderr += `mv: cannot move '${source}' to '${dest}': ${result.error.message}\n`
      }
      exitCode = 1
    }
  }
  return { stdout: '', stderr, exitCode }
}
