import type { CommandHandler } from '../types'

/**
 * cat — ファイル内容を順に連結して出力する。
 *
 * - 1 つでも開けないファイルがあれば exitCode 1 (他のファイルは続行)
 * - 引数なし時の stdin 読み取りは未対応 (terminarai に stdin がない)
 */
export const cat: CommandHandler = (args, ctx, vfs) => {
  if (args.length === 0) {
    return {
      stdout: '',
      stderr: 'cat: missing file operand (stdin reading is not supported in terminarai)\n',
      exitCode: 1,
    }
  }
  let stdout = ''
  let stderr = ''
  let exitCode = 0
  for (const target of args) {
    // `cat -` (stdin sentinel) は学習者が書籍例で打ちがちなので、専用案内を出す
    if (target === '-') {
      stderr += 'cat: -: stdin reading is not supported in terminarai\n'
      exitCode = 1
      continue
    }
    const abs = vfs.resolve(ctx.cwd, target)
    const result = vfs.readFile(abs)
    if (!result.ok) {
      stderr += `cat: ${target}: ${result.error.message}\n`
      exitCode = 1
      continue
    }
    stdout += result.value
  }
  return { stdout, stderr, exitCode }
}
