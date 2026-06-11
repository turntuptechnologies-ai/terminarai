import type { CommandHandler } from '../types'
import { lowerFirst, runMultiSourceCommand } from './multi-source'
import { invalidOptionError, parseArgs } from './parse-args'

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

  return runMultiSourceCommand(
    'mv',
    parsed.positional,
    ctx,
    vfs,
    (source, sourceAbs, dest, destAbs) => {
      const result = vfs.move(sourceAbs, destAbs)
      if (!result.ok) {
        if (result.error.code === 'EINVAL') {
          return `mv: ${lowerFirst(result.error.message)}\n`
        }
        return `mv: cannot move '${source}' to '${dest}': ${result.error.message}\n`
      }
      return ''
    },
  )
}
