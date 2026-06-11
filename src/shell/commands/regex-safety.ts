/**
 * grep のユーザ入力パターン向けの ReDoS 緩和ヘルパ。
 *
 * シェルは同期実行のため、Web Worker / timeout でマッチを打ち切ることは
 * できない。代わりに「実行前の静的チェック」で典型的な破滅的パターンを弾く:
 *
 * 1. パターン長の上限 (MAX_PATTERN_LENGTH)
 * 2. 無限 repetition (`*` / `+` / `{n,}`) の二重ネスト検出 (star height >= 2)
 *    例: `(a+)+`, `(a*)*`, `(a{2,})+`, `((a+)b)*`
 *
 * これはヒューリスティックであり完全な防御ではない (`(a|aa)+` のような
 * オーバーラップ過多は検出しない)。純クライアントサイドアプリで影響が
 * 「学習者自身のタブが固まる」に限られる前提の、事故防止レベルの緩和策。
 */

/** grep が受け付けるパターンの最大長。学習用途には十分な余裕を持たせる。 */
export const MAX_PATTERN_LENGTH = 256

/** `{...}` の中身が無限 repetition (`{n,}`) かどうか。`{n}` / `{n,m}` は有限。 */
function isUnboundedBrace(body: string): boolean {
  return /^\d+,$/.test(body)
}

/** `{...}` の中身が JS RegExp の量指定子として有効か (無効なら literal の `{`)。 */
function isQuantifierBrace(body: string): boolean {
  return /^\d+(,\d*)?$/.test(body)
}

/**
 * パターン中の無限 repetition のネスト深さ (star height) を返す。
 *
 * - `abc` -> 0、`a+` / `(ab)*` -> 1、`(a+)+` / `(a*)*` -> 2
 * - `?` と有限の `{n}` / `{n,m}` は繰り返し回数が抑えられるため数えない
 * - 文字クラス・エスケープ・グループ前置 (`?:` / `?=` / `?<name>` 等) を考慮する
 * - 不正なパターンでも throw しない (妥当性は new RegExp 側で検証する)
 */
export function starHeight(pattern: string): number {
  let i = 0

  // 現在のグループ内を ')' または末尾までパースし、内部の最大 star height を返す
  function parseSequence(): number {
    let maxHeight = 0
    // 直前のアトムの star height (グループなら内部の最大値、単一文字なら 0)
    let lastHeight = 0
    while (i < pattern.length) {
      const c = pattern[i]
      if (c === ')') break
      if (c === '\\') {
        i += 2
        lastHeight = 0
        continue
      }
      if (c === '[') {
        i++
        while (i < pattern.length && pattern[i] !== ']') {
          if (pattern[i] === '\\') i++
          i++
        }
        i++ // ']'
        lastHeight = 0
        continue
      }
      if (c === '(') {
        i++
        // 非キャプチャ / 先読み / 名前付き等の前置を読み飛ばす:
        // (?: (?= (?! (?<= (?<! (?<name>
        if (pattern[i] === '?') {
          i++
          if (pattern[i] === '<' && pattern[i + 1] !== '=' && pattern[i + 1] !== '!') {
            while (i < pattern.length && pattern[i] !== '>') i++
            i++ // '>'
          } else if (pattern[i] === '<') {
            i += 2 // '<=' / '<!'
          } else {
            i++ // ':' / '=' / '!'
          }
        }
        const inner = parseSequence()
        i++ // ')'
        maxHeight = Math.max(maxHeight, inner)
        lastHeight = inner
        continue
      }
      if (c === '*' || c === '+') {
        const height = lastHeight + 1
        maxHeight = Math.max(maxHeight, height)
        lastHeight = height
        i++
        if (pattern[i] === '?') i++ // lazy 修飾 (`a*?`) は二重に数えない
        continue
      }
      if (c === '{') {
        const close = pattern.indexOf('}', i + 1)
        const body = close === -1 ? '' : pattern.slice(i + 1, close)
        if (isQuantifierBrace(body)) {
          if (isUnboundedBrace(body)) {
            const height = lastHeight + 1
            maxHeight = Math.max(maxHeight, height)
            lastHeight = height
          } else {
            // 有限 repetition はアトムの height を維持したまま消費する
          }
          i = close + 1
          if (pattern[i] === '?') i++
          continue
        }
        // 量指定子でない '{' は literal
        i++
        lastHeight = 0
        continue
      }
      // '?' (optional / lazy) は繰り返しを増やさない。その他は通常文字
      if (c !== '?' && c !== '|') lastHeight = 0
      i++
    }
    return maxHeight
  }

  return parseSequence()
}

/**
 * パターンが破滅的バックトラッキングを起こしやすい形 (無限 repetition の
 * 二重ネスト) かどうか。
 */
export function hasNestedRepetition(pattern: string): boolean {
  return starHeight(pattern) >= 2
}
