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
  let i = 0
  // 先頭の連続する `-n` をすべて吸収 (GNU echo の builtin 挙動と同等)
  while (i < args.length && args[i] === '-n') {
    noNewline = true
    i++
  }
  const text = args.slice(i).join(' ')
  return {
    stdout: noNewline ? text : `${text}\n`,
    stderr: '',
    exitCode: 0,
  }
}
