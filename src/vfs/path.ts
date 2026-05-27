import { HOME_PATH } from './types'

/**
 * cwd を基準に path を解決し、正規化された絶対パスを返す。
 *
 * - 絶対パス (`/x`) は cwd を無視
 * - 相対パス (`x`, `./x`, `../x`) は cwd 起点
 * - `~` / `~/...` は HOME_PATH に展開
 * - `.` / `..` / 連続スラッシュ / 末尾スラッシュを正規化
 * - 結果は常に `/` で始まる絶対パス（ルートは `/`）
 *
 * 引数の想定:
 * - **cwd は絶対パス**を期待。空文字 / 空白等は内部で '/' にフォールバック
 *   (型上は string なので undefined は来ないが、空文字経路は許容)
 * - **path === '' は cwd の正規化を返す** (シェルの `cd ""` 相当)
 * - `..` がルートを超える場合 (`/foo/../../..`) は `/` で打ち止め (Unix 互換)
 */
export function resolve(cwd: string, path: string): string {
  if (path === '') {
    return normalize(cwd || '/')
  }

  let p = path
  if (p === '~') {
    p = HOME_PATH
  } else if (p.startsWith('~/')) {
    p = HOME_PATH + p.slice(1)
  }

  const isAbsolute = p.startsWith('/')
  const cwdSafe = (cwd || '/').replace(/\/+$/, '') || '/'
  const joined = isAbsolute ? p : `${cwdSafe === '/' ? '' : cwdSafe}/${p}`

  return normalize(joined)
}

/**
 * 絶対パスを正規化する。
 * - 連続スラッシュを単一スラッシュに
 * - `.` セグメントを削除
 * - `..` セグメントは1つ上のセグメントと相殺（ルートを超えない）
 * - 末尾スラッシュを削除（ただしルートは `/` のまま）
 */
export function normalize(path: string): string {
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`
  const segments = withLeadingSlash.split('/').filter((s) => s !== '' && s !== '.')
  const stack: string[] = []
  for (const seg of segments) {
    if (seg === '..') {
      stack.pop()
    } else {
      stack.push(seg)
    }
  }
  return `/${stack.join('/')}`
}

/** 絶対パスの親ディレクトリパスを返す。ルートの親はルート。 */
export function dirname(path: string): string {
  const normalized = normalize(path)
  if (normalized === '/') return '/'
  const idx = normalized.lastIndexOf('/')
  return idx === 0 ? '/' : normalized.slice(0, idx)
}

/** 絶対パスの末尾セグメントを返す。ルートは `/`。 */
export function basename(path: string): string {
  const normalized = normalize(path)
  if (normalized === '/') return '/'
  return normalized.slice(normalized.lastIndexOf('/') + 1)
}

/** 絶対パスをセグメント配列に分解する。ルートは空配列。 */
export function splitPath(path: string): string[] {
  const normalized = normalize(path)
  if (normalized === '/') return []
  return normalized.slice(1).split('/')
}
