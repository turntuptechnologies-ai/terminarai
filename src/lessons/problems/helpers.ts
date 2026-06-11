import {
  DEFAULT_DIR_MODE,
  DEFAULT_FILE_MODE,
  type VfsDirectory,
  type VfsFile,
} from '../../vfs/types'

// --- VFS 構築ヘルパ (problem 用 initialFs を組み立てるため) ---

const NOW = Date.now()

export function dir(
  name: string,
  children: Record<string, VfsDirectory | VfsFile> = {},
): VfsDirectory {
  return {
    type: 'directory',
    name,
    mtime: NOW,
    mode: DEFAULT_DIR_MODE,
    children,
  }
}

export function file(name: string, content: string): VfsFile {
  return {
    type: 'file',
    name,
    mtime: NOW,
    mode: DEFAULT_FILE_MODE,
    content,
  }
}

/** p10 / p11 用サンプルログ。大文字 ERROR と小文字 error を混在させ、`-i` の効果が分かるようにする。 */
const ACCESS_LOG = `INFO 2026-05-27 user login
ERROR 2026-05-27 disk full
INFO 2026-05-27 user logout
WARN 2026-05-27 slow query
error 2026-05-27 timeout
INFO 2026-05-27 user login
`

/** access.log を含む共通 FS (p10 / p11 用)。 */
export function initialFsWithAccessLog(): VfsDirectory {
  return dir('/', {
    home: dir('home', {
      user: dir('user', {
        'README.txt': file('README.txt', 'ログは access.log にあります。\n'),
        'access.log': file('access.log', ACCESS_LOG),
        docs: dir('docs'),
      }),
    }),
    tmp: dir('tmp'),
    etc: dir('etc'),
    usr: dir('usr'),
  })
}
