/**
 * 仮想ファイルシステムの型定義。
 *
 * VFS はメモリ上の単純なツリー構造で表現される。
 * ノードは directory または file のいずれかで、共通属性 (name, mtime, mode) を持つ。
 */

export interface VfsBase {
  name: string
  /** Unix epoch ms */
  mtime: number
  /** 表示用パーミッション (例: 0o644, 0o755) */
  mode: number
}

export interface VfsDirectory extends VfsBase {
  type: 'directory'
  children: Record<string, VfsNode>
}

export interface VfsFile extends VfsBase {
  type: 'file'
  content: string
}

export type VfsNode = VfsDirectory | VfsFile

export type VfsErrorCode =
  | 'ENOENT' // No such file or directory
  | 'EEXIST' // File exists
  | 'ENOTDIR' // Not a directory
  | 'EISDIR' // Is a directory
  | 'ENOTEMPTY' // Directory not empty
  | 'EINVAL' // Invalid argument

export interface VfsError {
  code: VfsErrorCode
  message: string
  path?: string
}

export type VfsResult<T> = { ok: true; value: T } | { ok: false; error: VfsError }

export interface Vfs {
  /** cwd を基準に path を解決し、正規化された絶対パスを返す。 */
  resolve(cwd: string, path: string): string

  // --- read ---
  stat(path: string): VfsResult<VfsNode>
  list(path: string): VfsResult<VfsNode[]>
  readFile(path: string): VfsResult<string>

  // --- write ---
  writeFile(path: string, content: string): VfsResult<void>
  appendFile(path: string, content: string): VfsResult<void>
  mkdir(path: string, opts?: { recursive?: boolean }): VfsResult<void>

  // --- delete ---
  remove(path: string, opts?: { recursive?: boolean }): VfsResult<void>

  // --- move / copy ---
  move(src: string, dst: string): VfsResult<void>
  copy(src: string, dst: string, opts?: { recursive?: boolean }): VfsResult<void>

  // --- 永続化 ---
  serialize(): string
  loadFromSerialized(json: string): VfsResult<void>
}

export const DEFAULT_DIR_MODE = 0o755
export const DEFAULT_FILE_MODE = 0o644

/** 仮想ホームディレクトリ。`~` の展開先。 */
export const HOME_PATH = '/home/user'
