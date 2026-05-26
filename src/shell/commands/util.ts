import type { VfsNode } from '../../vfs'

const PERM_BITS = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx']

/** ファイルモードを "drwxr-xr-x" 形式の 10 文字に整形する。 */
export function formatMode(node: VfsNode): string {
  const typeChar = node.type === 'directory' ? 'd' : '-'
  const owner = PERM_BITS[(node.mode >> 6) & 0o7]
  const group = PERM_BITS[(node.mode >> 3) & 0o7]
  const others = PERM_BITS[node.mode & 0o7]
  return `${typeChar}${owner}${group}${others}`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Unix epoch ms を `May 26 12:34` 形式に整形する。 */
export function formatMtime(mtime: number): string {
  const d = new Date(mtime)
  const month = MONTHS[d.getMonth()]
  const day = String(d.getDate()).padStart(2, ' ')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${month} ${day} ${hh}:${mm}`
}

/** ディレクトリの表示用サイズ (実 ext4 では typical な値)。 */
export const DEFAULT_DIR_SIZE = 4096

/** ノードの表示用サイズ (ディレクトリは固定値、ファイルは content.length)。 */
export function fileSize(node: VfsNode): number {
  return node.type === 'directory' ? DEFAULT_DIR_SIZE : node.content.length
}

/** 名前が hidden (`.` で始まる) か判定。 */
export function isHidden(name: string): boolean {
  return name.startsWith('.')
}

/** 文字列比較で安定ソートのキーになる比較関数 (C ロケール想定)。 */
export function compareName(a: string, b: string): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
