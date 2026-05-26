import type { CommandHandler } from '../types'

/**
 * mv — ファイル / ディレクトリを移動 (リネーム) する。
 *
 * - 形式: `mv SOURCE... DEST`
 *   - SOURCE が複数なら DEST は既存ディレクトリでなければならない
 * - ディレクトリも引数として OK (実 mv 同様、recursive フラグ不要)
 * - `-i` / `-n` / `-f` / `-t` 等は MVP 未対応 (基本的に上書きする default 挙動)
 */
export const mv: CommandHandler = (args, ctx, vfs) => {
  if (args.length === 0) {
    return {
      stdout: '',
      stderr: "mv: missing file operand\nTry 'mv --help' for more information.\n",
      exitCode: 1,
    }
  }
  if (args.length === 1) {
    return {
      stdout: '',
      stderr: `mv: missing destination file operand after '${args[0]}'\nTry 'mv --help' for more information.\n`,
      exitCode: 1,
    }
  }

  const dest = args[args.length - 1]
  const sources = args.slice(0, -1)
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
        stderr += `mv: ${result.error.message}\n`
      } else {
        stderr += `mv: cannot move '${source}' to '${dest}': ${result.error.message}\n`
      }
      exitCode = 1
    }
  }
  return { stdout: '', stderr, exitCode }
}
