export { createDefaultVfs } from './initial'
export { basename, dirname, normalize, resolve, splitPath } from './path'
export type {
  Vfs,
  VfsBase,
  VfsDirectory,
  VfsError,
  VfsErrorCode,
  VfsFile,
  VfsNode,
  VfsResult,
} from './types'
export { DEFAULT_DIR_MODE, DEFAULT_FILE_MODE, HOME_PATH } from './types'
export { createVfs } from './vfs'
