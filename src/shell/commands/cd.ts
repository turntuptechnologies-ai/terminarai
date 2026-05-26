import type { CommandHandler } from '../types'

/**
 * cd — ディレクトリ移動。
 *
 * - 引数なし / `~` → ホーム (`ctx.env.HOME`)
 * - 絶対パス・相対パス・`~/...` を許容 (resolve に任せる)
 * - `cd -` (OLDPWD) は MVP 未対応 (followup Issue #11 で対応予定)
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
    target = ctx.env.HOME ?? '/home/user'
  } else if (args[0] === '-') {
    return {
      stdout: '',
      stderr: 'cd: OLDPWD not set\n',
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
