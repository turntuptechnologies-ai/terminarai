import type { CommandHandler } from '../types'
import { invalidOptionError, parseArgs } from './parse-args'

/**
 * rm — ファイル / ディレクトリを削除する。
 *
 * - `-r` / `-R` / `--recursive` で再帰削除 (ディレクトリ削除には必須)
 * - `-f` / `--force` で存在しないパスを黙って無視 + エラー出力なし
 * - `-i` (interactive) は terminarai に prompt 機構がないため未対応
 */
export const rm: CommandHandler = (args, ctx, vfs) => {
  const parsed = parseArgs(args, {
    short: 'rRf',
    longAliases: { recursive: 'r', force: 'f' },
  })
  if (!parsed.ok) {
    return {
      stdout: '',
      stderr: invalidOptionError('rm', parsed.invalidFlag, parsed.isLong),
      exitCode: 1,
    }
  }
  const recursive = parsed.flags.has('r') || parsed.flags.has('R')
  const force = parsed.flags.has('f')
  const targets = parsed.positional

  if (targets.length === 0) {
    if (force) {
      // GNU rm -f は引数なしを許容する
      return { stdout: '', stderr: '', exitCode: 0 }
    }
    return {
      stdout: '',
      stderr: "rm: missing operand\nTry 'rm --help' for more information.\n",
      exitCode: 1,
    }
  }

  let stderr = ''
  let exitCode = 0
  for (const target of targets) {
    const abs = vfs.resolve(ctx.cwd, target)
    const stat = vfs.stat(abs)
    if (!stat.ok) {
      // GNU rm -f は ENOENT 以外に途中パスが ENOTDIR の場合も silent に許容する
      if ((stat.error.code === 'ENOENT' || stat.error.code === 'ENOTDIR') && force) continue
      stderr += `rm: cannot remove '${target}': ${stat.error.message}\n`
      exitCode = 1
      continue
    }
    const result = vfs.remove(abs, { recursive })
    if (!result.ok) {
      stderr += `rm: cannot remove '${target}': ${result.error.message}\n`
      exitCode = 1
    }
  }
  return { stdout: '', stderr, exitCode }
}
