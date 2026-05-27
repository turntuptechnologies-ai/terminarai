import {
  DEFAULT_DIR_MODE,
  DEFAULT_FILE_MODE,
  HOME_PATH,
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

/**
 * HOME_PATH のセグメント列から「最深 (= user) ディレクトリの子配下」を
 * 入れ子で組み上げ、ルート直下の最初のセグメント (= home) を返す。
 *
 * 例: HOME_PATH = '/home/user' なら
 *   dir('home', { user: dir('user', { ... children ... }) })
 *
 * これにより HOME_PATH を変更しても初期 FS 構造がそれに追従する。
 */
function buildHomeBranch(deepestChildren: Record<string, VfsDirectory | VfsFile>): VfsDirectory {
  const segments = HOME_PATH.split('/').filter(Boolean)
  if (segments.length === 0) {
    // HOME_PATH === '/' という想定外ケース。学習向け VFS としては不適切なので
    // 名前 'home' の空ダミーディレクトリを返してフォールバック。
    return dir('home')
  }
  // 最深ディレクトリ (HOME_PATH の末尾セグメント) に children を持たせる
  let current = dir(segments[segments.length - 1], deepestChildren)
  // 外側に向けて親をラップしていく
  for (let i = segments.length - 2; i >= 0; i--) {
    current = dir(segments[i], { [segments[i + 1]]: current })
  }
  return current
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
 *
 * ホーム配下の構成は HOME_PATH から導出するため、HOME_PATH の変更に追従する。
 */
export function createDefaultVfs(): Vfs {
  const homeBranch = buildHomeBranch({
    'README.txt': file('README.txt', README_CONTENT),
    'hello.txt': file('hello.txt', HELLO_CONTENT),
    docs: dir('docs'),
  })
  const root: VfsDirectory = dir('/', {
    [homeBranch.name]: homeBranch,
    tmp: dir('tmp'),
    etc: dir('etc'),
    usr: dir('usr'),
  })
  return createVfs(root)
}
