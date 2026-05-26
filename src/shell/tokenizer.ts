export type Token = { type: 'word'; value: string } | { type: 'redirect'; op: '>' | '>>' }

export interface TokenizeError {
  message: string
}

export type TokenizeResult = { ok: true; tokens: Token[] } | { ok: false; error: TokenizeError }

const WS = new Set([' ', '\t'])

/**
 * MVP では未対応のシェルメタ文字。学習者を混乱させないため、
 * これらが現れたら明示的に "not supported yet" エラーを返す。
 */
const UNSUPPORTED_META: Record<string, string> = {
  '|': 'pipe (|) is not supported yet',
  '<': 'input redirect (<) is not supported yet',
  ';': 'command separator (;) is not supported yet',
  '&': 'background / logical operators (&) are not supported yet',
  '(': 'subshell ((...)) is not supported yet',
  ')': 'subshell ((...)) is not supported yet',
  '`': 'command substitution (`...`) is not supported yet',
  $: 'variable / command substitution ($) is not supported yet',
}

/**
 * シェル入力をトークン列に分解する。
 *
 * - 空白で単語を区切る
 * - シングルクォート '...' : 内部は完全リテラル
 * - ダブルクォート "..."   : \" と \\ のみエスケープ展開
 * - クォート外のバックスラッシュ \ : 次の 1 文字を literal 化（末尾単独は構文エラー）
 * - 隣接する単語片は連結 (foo"bar baz"qux → "foobar bazqux")
 * - リダイレクト > / >> は独立トークン
 * - MVP 未対応メタ文字 (|, <, ;, &, (, ), `, $) は明示的にエラー
 */
export function tokenize(input: string): TokenizeResult {
  const tokens: Token[] = []
  const n = input.length
  let i = 0

  while (i < n) {
    const c = input[i]

    if (WS.has(c)) {
      i++
      continue
    }

    if (c === '>') {
      if (input[i + 1] === '>') {
        tokens.push({ type: 'redirect', op: '>>' })
        i += 2
      } else {
        tokens.push({ type: 'redirect', op: '>' })
        i++
      }
      continue
    }

    // クォート外で MVP 未対応メタ文字に遭遇 → 早期にエラー
    if (c in UNSUPPORTED_META) {
      return {
        ok: false,
        error: { message: `syntax error: ${UNSUPPORTED_META[c]}` },
      }
    }

    // 単語の収集 (途中でクォートが入ることもある)
    let word = ''
    let inWord = true
    while (inWord && i < n) {
      const ch = input[i]
      if (WS.has(ch) || ch === '>') {
        inWord = false
        break
      }
      if (!(ch === "'" || ch === '"' || ch === '\\') && ch in UNSUPPORTED_META) {
        return {
          ok: false,
          error: { message: `syntax error: ${UNSUPPORTED_META[ch]}` },
        }
      }
      if (ch === "'") {
        i++ // skip opening
        while (i < n && input[i] !== "'") {
          word += input[i]
          i++
        }
        if (i >= n) {
          return {
            ok: false,
            error: { message: "syntax error: unterminated quoted string (')" },
          }
        }
        i++ // skip closing
        continue
      }
      if (ch === '"') {
        i++ // skip opening
        while (i < n && input[i] !== '"') {
          if (input[i] === '\\' && i + 1 < n) {
            const next = input[i + 1]
            if (next === '"' || next === '\\') {
              word += next
              i += 2
              continue
            }
          }
          word += input[i]
          i++
        }
        if (i >= n) {
          return {
            ok: false,
            error: { message: 'syntax error: unterminated quoted string (")' },
          }
        }
        i++ // skip closing
        continue
      }
      if (ch === '\\') {
        if (i + 1 >= n) {
          return {
            ok: false,
            error: { message: 'syntax error: trailing backslash' },
          }
        }
        word += input[i + 1]
        i += 2
        continue
      }
      word += ch
      i++
    }
    tokens.push({ type: 'word', value: word })
  }

  return { ok: true, tokens }
}
