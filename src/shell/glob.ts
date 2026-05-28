import type { Vfs } from '../vfs'

/**
 * グロブ (パス名展開) を行うモジュール。
 *
 * シェルの execute() が parse 後・dispatch 前に argv へ適用する。
 *
 * サポート:
 * - アスタリスク: 任意の文字列 (スラッシュは跨がない)
 * - クエスチョン: 任意の 1 文字
 * - 角括弧の文字クラス (範囲・否定対応、否定は先頭エクスクラメーション)
 * - ディレクトリ prefix 付き (例 docs スラッシュ アスタリスク)
 * - マッチ無しはリテラルのまま (bash の nullglob off 相当)
 * - 隠しファイル (ドット始まり) は pattern がドット始まりでない限り除外
 *
 * 既知の制約 (簡素化):
 * - クォート/エスケープされたグロブも展開してしまう。tokenizer が
 *   クォート情報を捨てるため区別できない。学習用途では稀なので許容。
 * - 中間セグメントのグロブ (アスタリスク スラッシュ file) は未対応 (リテラル維持)。
 * - 末尾セグメントのグロブのみ展開する。
 */

/** glob メタ文字を含むか。 */
function hasGlob(s: string): boolean {
  return s.includes('*') || s.includes('?') || s.includes('[')
}

/** 正規表現の特殊文字 (エスケープが必要なもの)。 */
const REGEX_META = new Set(['.', '+', '^', '$', '{', '}', '(', ')', '|', '\\'])

/**
 * glob パターンを (単一セグメント名にマッチする) RegExp に変換する。
 * セグメント内マッチなので アスタリスク はスラッシュを含まない任意文字列に対応する。
 */
export function globToRegExp(glob: string): RegExp {
  let re = '^'
  let i = 0
  while (i < glob.length) {
    const c = glob[i]
    if (c === '*') {
      re += '[^/]*'
      i++
    } else if (c === '?') {
      re += '[^/]'
      i++
    } else if (c === '[') {
      // 文字クラス: 閉じ括弧を探す
      let j = i + 1
      if (glob[j] === '!' || glob[j] === '^') j++
      if (glob[j] === ']') j++ // 先頭の閉じ括弧はリテラル扱い
      while (j < glob.length && glob[j] !== ']') j++
      if (j >= glob.length) {
        // 閉じない開き括弧はリテラルとして扱う
        re += '\\['
        i++
      } else {
        let cls = glob.slice(i + 1, j)
        // bash の否定 (先頭エクスクラメーション) を正規表現の否定 (先頭ハット) に変換
        if (cls.startsWith('!')) cls = `^${cls.slice(1)}`
        re += `[${cls}]`
        i = j + 1
      }
    } else {
      // 正規表現メタ文字をエスケープ
      re += REGEX_META.has(c) ? `\\${c}` : c
      i++
    }
  }
  re += '$'
  return new RegExp(re)
}

/** ASCII バイト順ソート (C ロケール相当)。 */
function byteCompare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

/** 1 語をグロブ展開する。展開できなければ元の語 1 件を返す。 */
function expandWord(word: string, cwd: string, vfs: Vfs): string[] {
  if (!hasGlob(word)) return [word]

  const slashIdx = word.lastIndexOf('/')
  const dirPart = slashIdx === -1 ? '' : word.slice(0, slashIdx)
  const pattern = slashIdx === -1 ? word : word.slice(slashIdx + 1)

  // 中間セグメントの glob は未対応 → リテラル維持
  if (hasGlob(dirPart)) return [word]
  // 末尾セグメントに glob が無い場合はリテラル
  if (!hasGlob(pattern)) return [word]

  const dirAbs = vfs.resolve(cwd, dirPart === '' ? '.' : dirPart)
  const listing = vfs.list(dirAbs)
  if (!listing.ok) return [word] // ディレクトリ無し等 → リテラル

  const re = globToRegExp(pattern)
  const patternStartsWithDot = pattern.startsWith('.')
  const matched = listing.value
    .map((node) => node.name)
    .filter((name) => {
      // 隠しファイルは pattern がドット始まりでない限り除外 (bash 互換)
      if (name.startsWith('.') && !patternStartsWithDot) return false
      return re.test(name)
    })
    .sort(byteCompare)

  if (matched.length === 0) return [word] // nullglob off: リテラル維持

  const prefix = dirPart === '' ? '' : `${dirPart}/`
  return matched.map((name) => `${prefix}${name}`)
}

/**
 * argv 全語をグロブ展開する。
 * 各語につき、マッチがあれば展開後のパス列に置換、無ければリテラルのまま。
 * 戻り値は必ず 1 語以上を保持する。
 */
export function expandGlobs(words: string[], cwd: string, vfs: Vfs): string[] {
  const out: string[] = []
  for (const word of words) {
    out.push(...expandWord(word, cwd, vfs))
  }
  return out
}
