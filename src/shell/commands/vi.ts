import type { CommandHandler } from '../types'

/**
 * vi — 簡素版エディタを起動する。
 *
 * - 引数 1 個必須 (ファイルパス)
 * - 既存ファイル: 内容をエディタに読み込む
 * - 不在ファイル: 新規 (空文字) で開く。保存時に作成される
 * - ディレクトリを指定するとエラー
 *
 * 実体の編集 UI と保存処理は Terminal + ViEditor 側で行う。
 * このコマンド自体は CommandResult.editor シグナルを返すだけ。
 *
 * 未対応 (簡素化のため):
 * - 複数ファイル同時編集 (`vi a b c`) は最初のファイルのみ扱う
 * - `-R` (read-only)、`+N` (行指定起動) 等のフラグは未対応
 */
export const vi: CommandHandler = (args, ctx, vfs) => {
  if (args.length === 0) {
    return {
      stdout: '',
      stderr: 'vi: missing file operand\n',
      exitCode: 1,
    }
  }

  const target = args[0]
  const abs = vfs.resolve(ctx.cwd, target)
  const stat = vfs.stat(abs)

  let initialContent = ''
  if (stat.ok) {
    if (stat.value.type === 'directory') {
      return {
        stdout: '',
        stderr: `vi: ${target}: Is a directory\n`,
        exitCode: 1,
      }
    }
    initialContent = stat.value.content
  } else if (stat.error.code !== 'ENOENT') {
    // ENOENT 以外 (ENOTDIR 等) は新規作成も不可なのでエラーにする
    return {
      stdout: '',
      stderr: `vi: ${target}: ${stat.error.message}\n`,
      exitCode: 1,
    }
  }

  return {
    stdout: '',
    stderr: '',
    exitCode: 0,
    editor: { path: abs, display: target, initialContent },
  }
}
