/**
 * `head` / `tail` 用の行数フラグパーサ。
 *
 * 受理する書式 (GNU head/tail 互換):
 * - `-n 5`  (空白区切り)
 * - `-n5`   (連結)
 * - `-5`    (短縮形、`head -5 file` のような GNU 慣習)
 * - `--lines=5` (long、値付き)
 * - `--` 以降はすべて positional
 *
 * 不正値 (空文字 / 非数値 / 負数) は ParseError を返す。
 * 学習用なので、正の整数 0 以上のみ許容 (head -n 0 は許容、出力 0 行)。
 *
 * 値付きフラグの一般化は parse-args.ts では未対応なので、ここでは head/tail 専用に手書き。
 */

export type LineCountResult =
  | { ok: true; n: number; positional: string[] }
  | { ok: false; error: string }

const NUM_RE = /^(?:0|[1-9]\d*)$/

function parsePositiveInt(s: string): number | null {
  if (!NUM_RE.test(s)) return null
  return Number.parseInt(s, 10)
}

export function parseLineCount(args: string[], defaultN = 10): LineCountResult {
  let n = defaultN
  const positional: string[] = []
  let endFlags = false

  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (endFlags) {
      positional.push(a)
      continue
    }
    if (a === '--') {
      endFlags = true
      continue
    }
    if (a === '-n') {
      const next = args[i + 1]
      if (next === undefined) {
        return { ok: false, error: "option requires an argument -- 'n'" }
      }
      const parsed = parsePositiveInt(next)
      if (parsed === null) {
        return { ok: false, error: `invalid number of lines: '${next}'` }
      }
      n = parsed
      i++ // skip value
      continue
    }
    if (a.startsWith('-n') && a.length > 2) {
      const num = a.slice(2)
      const parsed = parsePositiveInt(num)
      if (parsed === null) {
        return { ok: false, error: `invalid number of lines: '${num}'` }
      }
      n = parsed
      continue
    }
    if (a.startsWith('--lines=')) {
      const num = a.slice('--lines='.length)
      const parsed = parsePositiveInt(num)
      if (parsed === null) {
        return { ok: false, error: `invalid number of lines: '${num}'` }
      }
      n = parsed
      continue
    }
    // GNU 短縮: -5 (head -5 file)。-n や -- との区別のため、数字オンリーを優先判定
    if (/^-\d+$/.test(a)) {
      const num = a.slice(1)
      const parsed = parsePositiveInt(num)
      if (parsed === null) {
        return { ok: false, error: `invalid number of lines: '${num}'` }
      }
      n = parsed
      continue
    }
    // 単独 - (stdin sentinel) は positional として通す
    if (a === '-') {
      positional.push(a)
      continue
    }
    if (a.startsWith('-')) {
      return { ok: false, error: `unrecognized option: ${a}` }
    }
    positional.push(a)
  }

  return { ok: true, n, positional }
}
