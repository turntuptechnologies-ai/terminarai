import type { Vfs } from '../../vfs'
import type { CommandContext, CommandResult } from '../types'

/** EINVAL のメッセージは VFS が "Cannot ..." と大文字で始まることがあるため、
 *  GNU 風 ("cmd: cannot ...") に揃えるために先頭を小文字化する。 */
export function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1)
}

/**
 * ソース 1 件を処理し、失敗なら stderr へ追記する行 (改行込み、複数行可) を返す。
 * 成功なら '' を返す。
 */
export type ProcessSource = (
  source: string,
  sourceAbs: string,
  dest: string,
  destAbs: string,
) => string

/**
 * `cmd SOURCE... DEST` 形式 (cp / mv) の共通骨格。
 *
 * - 引数 0 個 / 1 個のときの "missing (destination) file operand" エラー
 * - SOURCE が複数なら DEST は既存ディレクトリでなければならないチェック
 * - SOURCE ごとのループ (1 件失敗しても残りを処理し、exitCode 1 を返す)
 *
 * を一手に引き受け、実際の VFS 操作とコマンド固有のエラー整形は
 * `processSource` に委譲する。
 */
export function runMultiSourceCommand(
  name: string,
  operands: string[],
  ctx: CommandContext,
  vfs: Vfs,
  processSource: ProcessSource,
): CommandResult {
  if (operands.length === 0) {
    return {
      stdout: '',
      stderr: `${name}: missing file operand\nTry '${name} --help' for more information.\n`,
      exitCode: 1,
    }
  }
  if (operands.length === 1) {
    return {
      stdout: '',
      stderr: `${name}: missing destination file operand after '${operands[0]}'\nTry '${name} --help' for more information.\n`,
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
        stderr: `${name}: target '${dest}' is not a directory\n`,
        exitCode: 1,
      }
    }
  }

  let stderr = ''
  let exitCode = 0
  for (const source of sources) {
    const sourceAbs = vfs.resolve(ctx.cwd, source)
    const error = processSource(source, sourceAbs, dest, destAbs)
    if (error) {
      stderr += error
      exitCode = 1
    }
  }
  return { stdout: '', stderr, exitCode }
}
