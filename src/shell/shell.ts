import type { Vfs } from '../vfs'
import { type CompletionResult, complete as completeImpl } from './completion'
import { expandGlobs } from './glob'
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

/** cwd 変化時に env.PWD / env.OLDPWD を同期した CommandContext を作る。 */
function syncCtx(prev: CommandContext, nextCwd: string): CommandContext {
  if (nextCwd === prev.cwd) return prev
  return {
    cwd: nextCwd,
    env: { ...prev.env, PWD: nextCwd, OLDPWD: prev.cwd },
  }
}

function makeResult(
  result: CommandResult,
  ctx: CommandContext,
  nextCwd: string,
): ShellExecuteResult {
  return { result, nextCwd, nextCtx: syncCtx(ctx, nextCwd) }
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

  commandNames(): string[] {
    return [...this.commands.keys()].sort()
  }

  complete(input: string, ctx: CommandContext): CompletionResult {
    return completeImpl(input, ctx.cwd, this.commands.keys(), this.vfs)
  }

  getVfs(): Vfs {
    return this.vfs
  }

  execute(input: string, ctx: CommandContext): ShellExecuteResult {
    if (input.trim() === '') {
      return makeResult(emptyResult(), ctx, ctx.cwd)
    }

    const tokenResult = tokenize(input)
    if (!tokenResult.ok) {
      return makeResult(shellError(tokenResult.error.message), ctx, ctx.cwd)
    }

    const parseResult = parse(tokenResult.tokens)
    if (!parseResult.ok) {
      return makeResult(shellError(parseResult.error.message), ctx, ctx.cwd)
    }

    if (!parseResult.command) {
      return makeResult(emptyResult(), ctx, ctx.cwd)
    }

    // パス名展開 (グロブ): `*.txt` 等を cwd 基準で実ファイル名に展開する。
    // リダイレクト先は展開しない (リテラルのまま)。
    const { argv: rawArgv, stdoutRedirect } = parseResult.command
    const argv = expandGlobs(rawArgv, ctx.cwd, this.vfs)
    const cmdName = argv[0]
    const args = argv.slice(1)

    const handler = this.commands.get(cmdName)
    if (!handler) {
      return makeResult(
        {
          stdout: '',
          stderr: ensureTrailingNewline(`terminarai: ${cmdName}: command not found`),
          exitCode: 127,
        },
        ctx,
        ctx.cwd,
      )
    }

    // ハンドラの例外は UI まで伝播させない。学習用アプリでシェルが死ぬのは最悪体験。
    let handlerResult: CommandResult
    try {
      handlerResult = handler(args, ctx, this.vfs)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error(`[terminarai] handler '${cmdName}' threw:`, e)
      return makeResult(
        {
          stdout: '',
          stderr: ensureTrailingNewline(`terminarai: ${cmdName}: internal error: ${msg}`),
          exitCode: 1,
        },
        ctx,
        ctx.cwd,
      )
    }
    const nextCwd = handlerResult.cwdAfter ?? ctx.cwd

    if (!stdoutRedirect) {
      return makeResult(handlerResult, ctx, nextCwd)
    }

    // リダイレクト適用: stdout を VFS に書き込み、外部に出さない
    const targetAbs = this.vfs.resolve(ctx.cwd, stdoutRedirect.target)
    const writeRes = stdoutRedirect.append
      ? this.vfs.appendFile(targetAbs, handlerResult.stdout)
      : this.vfs.writeFile(targetAbs, handlerResult.stdout)

    if (!writeRes.ok) {
      return makeResult(
        {
          stdout: '',
          stderr: ensureTrailingNewline(
            `${cmdName}: ${stdoutRedirect.target}: ${writeRes.error.message}`,
          ),
          exitCode: 1,
        },
        ctx,
        nextCwd,
      )
    }

    // clearScreen / cwdAfter 等のシグナル系フィールドは保持する
    return makeResult(
      {
        ...handlerResult,
        stdout: '',
      },
      ctx,
      nextCwd,
    )
  }
}

export function createShell(vfs: Vfs): Shell {
  return new ShellImpl(vfs)
}
