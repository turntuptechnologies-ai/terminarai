/**
 * 共通の getopts 風ショートフラグパーサ。
 *
 * - `-l` `-la` `-l -a` を同等に扱う (クラスタリング対応)
 * - `--` 以降はすべて positional 扱い
 * - 単独 `-` (例: `cat -`) は positional として通す (stdin sentinel の慣習)
 * - 未知のフラグ文字を検出したら ParseError を返す (どの文字が悪かったかを保持)
 * - 長フラグ (`--long`) と値付きオプション (`-n 5`, `--lines=5`) は MVP 未対応
 *   将来 `ParseResult` に `values: Map<string, string>` を足して破壊変更する可能性あり
 */

export type ParseResult =
  | { ok: true; flags: Set<string>; positional: string[] }
  | { ok: false; invalidFlag: string }

export function parseShortFlags(args: string[], knownChars: string): ParseResult {
  const known = new Set(knownChars)
  const flags = new Set<string>()
  const positional: string[] = []
  let endFlags = false

  for (const arg of args) {
    if (endFlags) {
      positional.push(arg)
      continue
    }
    if (arg === '--') {
      endFlags = true
      continue
    }
    if (arg.startsWith('-') && arg.length > 1) {
      for (const c of arg.slice(1)) {
        if (!known.has(c)) {
          return { ok: false, invalidFlag: c }
        }
        flags.add(c)
      }
      continue
    }
    positional.push(arg)
  }
  return { ok: true, flags, positional }
}

/** "<cmd>: invalid option -- 'X'\nTry '<cmd> --help' for more information.\n" を組み立てる。 */
export function invalidOptionError(cmd: string, flagChar: string): string {
  return `${cmd}: invalid option -- '${flagChar}'\nTry '${cmd} --help' for more information.\n`
}
