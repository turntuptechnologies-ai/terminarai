import {
  DEFAULT_DIR_MODE,
  DEFAULT_FILE_MODE,
  type Vfs,
  type VfsDirectory,
  type VfsFile,
} from './types'
import { createVfs } from './vfs'

const NOW = Date.now()

function dir(name: string, children: Record<string, VfsDirectory | VfsFile> = {}): VfsDirectory {
  return {
    type: 'directory',
    name,
    mtime: NOW,
    mode: DEFAULT_DIR_MODE,
    children,
  }
}

function file(name: string, content: string): VfsFile {
  return {
    type: 'file',
    name,
    mtime: NOW,
    mode: DEFAULT_FILE_MODE,
    content,
  }
}

const README_CONTENT = `terminarai へようこそ！

ここはあなたの仮想ホームディレクトリです。
試しにいくつかのコマンドを打ってみましょう:

  pwd            いまどこにいるか確認します
  ls             このディレクトリの中身を見ます
  cat README.txt このファイルを読みます
`

const HELLO_CONTENT = `Hello, terminarai!

このファイルは練習用です。自由に編集したり削除して構いません。
ブラウザを再読み込みしても、進捗は localStorage に保存されています。
`

/**
 * 初期 VFS を生成する。
 * 学習に必要な最小構成のみを用意し、混乱しないよう余計なファイルは置かない。
 */
export function createDefaultVfs(): Vfs {
  const root: VfsDirectory = dir('/', {
    home: dir('home', {
      user: dir('user', {
        'README.txt': file('README.txt', README_CONTENT),
        'hello.txt': file('hello.txt', HELLO_CONTENT),
        docs: dir('docs'),
      }),
    }),
    tmp: dir('tmp'),
    etc: dir('etc'),
    usr: dir('usr'),
  })
  return createVfs(root)
}
