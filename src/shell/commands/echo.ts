import type { CommandHandler } from '../types'

/**
 * echo — 引数を空白区切りで出力。
 *
 * - 引数なし → 改行のみ
 * - `-n` (先頭の場合のみ) で末尾改行を抑止
 * - `-e` / `-E` (escape sequences) は MVP 未対応
 * - `--` は通常の引数として扱う (bash builtin echo に合わせて特別扱いしない)
 */
export const echo: CommandHandler = (args) => {
  let noNewline = false
  let positional = args
  if (args[0] === '-n') {
    noNewline = true
    positional = args.slice(1)
  }
  const text = positional.join(' ')
  return {
    stdout: noNewline ? text : `${text}\n`,
    stderr: '',
    exitCode: 0,
  }
}
