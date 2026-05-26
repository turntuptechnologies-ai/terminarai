import type { Vfs } from '../vfs'

export interface CommandContext {
  cwd: string
  env: Record<string, string>
}

export interface CommandResult {
  stdout: string
  stderr: string
  exitCode: number
  /** cd だけが使う。他のコマンドは undefined のまま。 */
  cwdAfter?: string
}

export type CommandHandler = (args: string[], ctx: CommandContext, vfs: Vfs) => CommandResult

export interface ShellExecuteResult {
  result: CommandResult
  /** 実行後の cwd (変化なければ ctx.cwd と同じ) */
  nextCwd: string
}

export interface Shell {
  register(name: string, handler: CommandHandler): void
  unregister(name: string): void
  has(name: string): boolean
  execute(input: string, ctx: CommandContext): ShellExecuteResult
}

/** 既定の初期コンテキスト。シェル本体ではなく利用側で使う想定。 */
export function defaultContext(cwd = '/home/user'): CommandContext {
  return {
    cwd,
    env: {
      HOME: '/home/user',
      USER: 'user',
      PWD: cwd,
    },
  }
}
