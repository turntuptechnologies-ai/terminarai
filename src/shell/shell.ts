import type { Vfs } from '../vfs'
import { parse } from './parser'
import { tokenize } from './tokenizer'
import type {
  CommandContext,
  CommandHandler,
  CommandResult,
  Shell,
  ShellExecuteResult,
} from './types'

function emptyResult(): CommandResult {
  return { stdout: '', stderr: '', exitCode: 0 }
}

function ensureTrailingNewline(s: string): string {
  if (s === '' || s.endsWith('\n')) return s
  return `${s}\n`
}

function shellError(message: string, exitCode = 2): CommandResult {
  return {
    stdout: '',
    stderr: ensureTrailingNewline(`terminarai: ${message}`),
    exitCode,
  }
}

class ShellImpl implements Shell {
  private readonly commands = new Map<string, CommandHandler>()
  private readonly vfs: Vfs

  constructor(vfs: Vfs) {
    this.vfs = vfs
  }

  register(name: string, handler: CommandHandler): void {
    this.commands.set(name, handler)
  }

  unregister(name: string): void {
    this.commands.delete(name)
  }

  has(name: string): boolean {
    return this.commands.has(name)
  }

  execute(input: string, ctx: CommandContext): ShellExecuteResult {
    if (input.trim() === '') {
      return { result: emptyResult(), nextCwd: ctx.cwd }
    }

    const tokenResult = tokenize(input)
    if (!tokenResult.ok) {
      return { result: shellError(tokenResult.error.message), nextCwd: ctx.cwd }
    }

    const parseResult = parse(tokenResult.tokens)
    if (!parseResult.ok) {
      return { result: shellError(parseResult.error.message), nextCwd: ctx.cwd }
    }

    if (!parseResult.command) {
      return { result: emptyResult(), nextCwd: ctx.cwd }
    }

    const { argv, stdoutRedirect } = parseResult.command
    const cmdName = argv[0]
    const args = argv.slice(1)

    const handler = this.commands.get(cmdName)
    if (!handler) {
      return {
        result: {
          stdout: '',
          stderr: ensureTrailingNewline(`terminarai: ${cmdName}: command not found`),
          exitCode: 127,
        },
        nextCwd: ctx.cwd,
      }
    }

    // ハンドラの例外は UI まで伝播させない。学習用アプリでシェルが死ぬのは最悪体験。
    let handlerResult: CommandResult
    try {
      handlerResult = handler(args, ctx, this.vfs)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error(`[terminarai] handler '${cmdName}' threw:`, e)
      return {
        result: {
          stdout: '',
          stderr: ensureTrailingNewline(`terminarai: ${cmdName}: internal error: ${msg}`),
          exitCode: 1,
        },
        nextCwd: ctx.cwd,
      }
    }
    const nextCwd = handlerResult.cwdAfter ?? ctx.cwd

    if (!stdoutRedirect) {
      return { result: handlerResult, nextCwd }
    }

    // リダイレクト適用: stdout を VFS に書き込み、外部に出さない
    const targetAbs = this.vfs.resolve(ctx.cwd, stdoutRedirect.target)
    const writeRes = stdoutRedirect.append
      ? this.vfs.appendFile(targetAbs, handlerResult.stdout)
      : this.vfs.writeFile(targetAbs, handlerResult.stdout)

    if (!writeRes.ok) {
      return {
        result: {
          stdout: '',
          stderr: ensureTrailingNewline(
            `${cmdName}: ${stdoutRedirect.target}: ${writeRes.error.message}`,
          ),
          exitCode: 1,
        },
        nextCwd,
      }
    }

    return {
      result: {
        stdout: '',
        stderr: handlerResult.stderr,
        exitCode: handlerResult.exitCode,
      },
      nextCwd,
    }
  }
}

export function createShell(vfs: Vfs): Shell {
  return new ShellImpl(vfs)
}
