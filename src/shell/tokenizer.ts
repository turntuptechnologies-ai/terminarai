export type Token = { type: 'word'; value: string } | { type: 'redirect'; op: '>' | '>>' }

export interface TokenizeError {
  message: string
}

export type TokenizeResult = { ok: true; tokens: Token[] } | { ok: false; error: TokenizeError }

const WS = new Set([' ', '\t'])

/**
 * シェル入力をトークン列に分解する。
 *
 * - 空白で単語を区切る
 * - シングルクォート '...' : 内部は完全リテラル
 * - ダブルクォート "..."   : \" と \\ のみエスケープ展開
 * - クォート外のバックスラッシュ \ : 次の 1 文字を literal 化
 * - 隣接する単語片は連結 (foo"bar baz"qux → "foobar bazqux")
 * - リダイレクト > / >> は独立トークン
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

    // 単語の収集 (途中でクォートが入ることもある)
    let word = ''
    let inWord = true
    while (inWord && i < n) {
      const ch = input[i]
      if (WS.has(ch) || ch === '>') {
        inWord = false
        break
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
      if (ch === '\\' && i + 1 < n) {
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
