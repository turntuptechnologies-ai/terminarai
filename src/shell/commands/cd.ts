import { HOME_PATH } from '../../vfs'
import type { CommandHandler } from '../types'

/**
 * cd — ディレクトリ移動。
 *
 * - 引数なし / `~` → ホーム (`ctx.env.HOME`、未設定なら HOME_PATH)
 * - 絶対パス・相対パス・`~/...` を許容 (resolve に任せる)
 * - `cd -` (OLDPWD) は MVP 未対応。「未設定」と誤解されないよう明示エラー (followup Issue #11)
 * - `~user` 等のユーザ展開は未対応 (terminarai は単一ユーザ前提)
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
  if (args.length === 0 || args[0] === '~') {
    target = ctx.env.HOME ?? HOME_PATH
  } else if (args[0] === '-') {
    return {
      stdout: '',
      stderr: "cd: '-' (OLDPWD) は MVP 未対応です (Issue #11 で対応予定)\n",
      exitCode: 1,
    }
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
  return { stdout: '', stderr: '', exitCode: 0, cwdAfter: abs }
}
