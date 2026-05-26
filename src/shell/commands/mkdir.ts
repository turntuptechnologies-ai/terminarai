import type { CommandHandler } from '../types'
import { invalidOptionError, parseShortFlags } from './parse-args'

/**
 * mkdir — ディレクトリを作成する。
 *
 * - `-p` で親ディレクトリも含めて再帰作成、既存でもエラーにしない
 * - 複数ターゲット指定可
 */
export const mkdir: CommandHandler = (args, ctx, vfs) => {
  const parsed = parseShortFlags(args, 'p')
  if (!parsed.ok) {
    // GNU mkdir は parse error も missing operand も exit 1 で揃える (ls の exit 2 とは異なる)
    return { stdout: '', stderr: invalidOptionError('mkdir', parsed.invalidFlag), exitCode: 1 }
  }
  const recursive = parsed.flags.has('p')
  const targets = parsed.positional
  if (targets.length === 0) {
    return {
      stdout: '',
      stderr: "mkdir: missing operand\nTry 'mkdir --help' for more information.\n",
      exitCode: 1,
    }
  }
  let stderr = ''
  let exitCode = 0
  for (const target of targets) {
    const abs = vfs.resolve(ctx.cwd, target)
    const result = vfs.mkdir(abs, { recursive })
    if (!result.ok) {
      stderr += `mkdir: cannot create directory '${target}': ${result.error.message}\n`
      exitCode = 1
    }
  }
  return { stdout: '', stderr, exitCode }
}
