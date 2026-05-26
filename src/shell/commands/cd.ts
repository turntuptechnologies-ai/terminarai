import { HOME_PATH } from '../../vfs'
import type { CommandHandler } from '../types'

/**
 * cd — ディレクトリ移動。
 *
 * - 引数なし / `~` → ホーム (`ctx.env.HOME`、未設定なら HOME_PATH)
 * - 絶対パス・相対パス・`~/...` を許容 (resolve に任せる)
 * - `cd -` → `OLDPWD` (前回 cd 前の場所) に戻り、移動先パスを stdout に出力 (bash 互換)
 *   未設定なら `cd: OLDPWD not set` で exit 1
 * - `~user` 等のユーザ展開は未対応 (terminarai は単一ユーザ前提)
 *
 * 注: env.OLDPWD は Shell.execute が cwd 変化時に自動同期する。cd ハンドラ自身は
 *     env を更新しない (純関数として cwdAfter のみを返す)。
 */
export const cd: CommandHandler = (args, ctx, vfs) => {
  if (args.length > 1) {
    return {
      stdout: '',
      stderr: 'cd: too many arguments\n',
      exitCode: 2,
    }
  }

  let target: string
  // bash の `cd -` は移動先を stdout に出力する
  let printDest = false

  if (args.length === 0 || args[0] === '~') {
    target = ctx.env.HOME ?? HOME_PATH
  } else if (args[0] === '-') {
    const oldPwd = ctx.env.OLDPWD
    if (!oldPwd) {
      return {
        stdout: '',
        stderr: 'cd: OLDPWD not set\n',
        exitCode: 1,
      }
    }
    target = oldPwd
    printDest = true
  } else if (args[0] === '') {
    // bash: `cd ''` は ENOENT (resolve は cwd を返してしまうので個別判定)
    return {
      stdout: '',
      stderr: 'cd: : No such file or directory\n',
      exitCode: 1,
    }
  } else {
    target = args[0]
  }

  const abs = vfs.resolve(ctx.cwd, target)
  const stat = vfs.stat(abs)
  if (!stat.ok) {
    return {
      stdout: '',
      stderr: `cd: ${target}: ${stat.error.message}\n`,
      exitCode: 1,
    }
  }
  if (stat.value.type !== 'directory') {
    return {
      stdout: '',
      stderr: `cd: ${target}: Not a directory\n`,
      exitCode: 1,
    }
  }
  return {
    stdout: printDest ? `${abs}\n` : '',
    stderr: '',
    exitCode: 0,
    cwdAfter: abs,
  }
}
