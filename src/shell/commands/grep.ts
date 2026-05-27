import type { CommandHandler } from '../types'
import { invalidOptionError, parseArgs } from './parse-args'

/**
 * grep — ファイル内をパターン (正規表現) で行マッチ検索する。
 *
 * 形式: `grep [-i|-n|-v] PATTERN FILE...`
 *
 * フラグ:
 * - `-i` / `--ignore-case`: 大文字小文字を無視
 * - `-n` / `--line-number`: 各行に行番号プレフィクス
 * - `-v` / `--invert-match`: 一致**しない**行を出力
 *
 * 出力:
 * - 複数ファイル指定時は `filename:line` プレフィクス (GNU 互換)
 * - `-n` 併用時は `filename:lineno:line` / `lineno:line`
 *
 * exit code (GNU 互換):
 * - 0: 少なくとも 1 行マッチ
 * - 1: マッチなし (エラーではない)
 * - 2: パターン不正 / ファイル不在 / 引数不足 / その他
 *
 * セキュリティメモ:
 * - ユーザ入力 PATTERN を `new RegExp()` に直接渡す。学習用アプリなので
 *   ReDoS への積極的な防御 (Web Worker / timeout) はかけない。
 *   不正パターンは try/catch で受けて exit 2 を返す。
 */
export const grep: CommandHandler = (args, ctx, vfs) => {
  const parsed = parseArgs(args, {
    short: 'inv',
    longAliases: {
      'ignore-case': 'i',
      'line-number': 'n',
      'invert-match': 'v',
    },
  })
  if (!parsed.ok) {
    return {
      stdout: '',
      stderr: invalidOptionError('grep', parsed.invalidFlag, parsed.isLong),
      exitCode: 2,
    }
  }

  const positional = parsed.positional
  if (positional.length < 2) {
    return {
      stdout: '',
      stderr:
        positional.length === 0
          ? 'grep: missing pattern\nUsage: grep PATTERN FILE...\n'
          : 'grep: missing file operand\nUsage: grep PATTERN FILE...\n',
      exitCode: 2,
    }
  }

  const [pattern, ...files] = positional
  const ignoreCase = parsed.flags.has('i')
  const showLineNumbers = parsed.flags.has('n')
  const invertMatch = parsed.flags.has('v')

  let re: RegExp
  try {
    re = new RegExp(pattern, ignoreCase ? 'i' : '')
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return {
      stdout: '',
      stderr: `grep: invalid pattern: ${msg}\n`,
      exitCode: 2,
    }
  }

  const showFilenamePrefix = files.length > 1
  let stdout = ''
  let stderr = ''
  let matchedAny = false
  let hadError = false

  for (const file of files) {
    const abs = vfs.resolve(ctx.cwd, file)
    const stat = vfs.stat(abs)
    if (!stat.ok) {
      stderr += `grep: ${file}: ${stat.error.message}\n`
      hadError = true
      continue
    }
    if (stat.value.type === 'directory') {
      stderr += `grep: ${file}: Is a directory\n`
      hadError = true
      continue
    }
    const content = stat.value.content
    // 末尾の改行で末尾に空 element ができるので除外
    const rawLines = content.split('\n')
    const trailingNewline = content.endsWith('\n')
    const lines = trailingNewline && rawLines.length > 0 ? rawLines.slice(0, -1) : rawLines

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const isMatch = re.test(line)
      const include = invertMatch ? !isMatch : isMatch
      if (!include) continue
      matchedAny = true
      let prefix = ''
      if (showFilenamePrefix) prefix += `${file}:`
      if (showLineNumbers) prefix += `${i + 1}:`
      stdout += `${prefix}${line}\n`
    }
  }

  let exitCode: number
  if (hadError) {
    exitCode = 2
  } else if (matchedAny) {
    exitCode = 0
  } else {
    exitCode = 1
  }
  return { stdout, stderr, exitCode }
}
