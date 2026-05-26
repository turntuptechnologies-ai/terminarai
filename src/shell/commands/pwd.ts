import type { CommandHandler } from '../types'

/**
 * pwd — カレントディレクトリの絶対パスを出力する。
 * 引数は受け取らない (GNU pwd の `-L`/`-P` は未対応)。
 */
export const pwd: CommandHandler = (args, ctx) => {
  if (args.length > 0) {
    return {
      stdout: '',
      stderr: 'pwd: too many arguments\n',
      exitCode: 2,
    }
  }
  return { stdout: `${ctx.cwd}\n`, stderr: '', exitCode: 0 }
}
