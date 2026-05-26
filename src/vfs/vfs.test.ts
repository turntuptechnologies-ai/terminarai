import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultVfs } from './initial'
import type { Vfs, VfsDirectory, VfsFile } from './types'
import { createVfs } from './vfs'

function expectOk<T>(result: { ok: true; value: T } | { ok: false; error: unknown }): T {
  if (!result.ok) {
    throw new Error(`expected ok but got error: ${JSON.stringify(result.error)}`)
  }
  return result.value
}

function expectErr(result: { ok: boolean; error?: { code?: string } }, code: string) {
  expect(result.ok).toBe(false)
  if (!result.ok) {
    expect(result.error?.code).toBe(code)
  }
}

describe('Vfs', () => {
  let vfs: Vfs

  beforeEach(() => {
    vfs = createDefaultVfs()
  })

  describe('stat', () => {
    it('ルートディレクトリを取得できる', () => {
      const node = expectOk(vfs.stat('/'))
      expect(node.type).toBe('directory')
    })

    it('既存ディレクトリを取得できる', () => {
      const node = expectOk(vfs.stat('/home/user'))
      expect(node.type).toBe('directory')
      expect(node.name).toBe('user')
    })

    it('既存ファイルを取得できる', () => {
      const node = expectOk(vfs.stat('/home/user/README.txt'))
      expect(node.type).toBe('file')
    })

    it('存在しないパスは ENOENT', () => {
      expectErr(vfs.stat('/nope'), 'ENOENT')
    })

    it('ファイルを通過するパスは ENOTDIR', () => {
      expectErr(vfs.stat('/home/user/README.txt/child'), 'ENOTDIR')
    })
  })

  describe('list', () => {
    it('ディレクトリの内容を列挙できる', () => {
      const entries = expectOk(vfs.list('/home/user'))
      const names = entries.map((e) => e.name).sort()
      expect(names).toEqual(['README.txt', 'docs', 'hello.txt'])
    })

    it('ファイルに対しては ENOTDIR', () => {
      expectErr(vfs.list('/home/user/README.txt'), 'ENOTDIR')
    })
  })

  describe('readFile', () => {
    it('ファイル内容を読める', () => {
      const content = expectOk(vfs.readFile('/home/user/README.txt'))
      expect(content).toContain('terminarai')
    })

    it('ディレクトリは EISDIR', () => {
      expectErr(vfs.readFile('/home/user'), 'EISDIR')
    })

    it('存在しないファイルは ENOENT', () => {
      expectErr(vfs.readFile('/home/user/nope.txt'), 'ENOENT')
    })
  })

  describe('writeFile', () => {
    it('新規ファイルを作成できる', () => {
      const r = vfs.writeFile('/home/user/new.txt', 'hello')
      expect(r.ok).toBe(true)
      expect(expectOk(vfs.readFile('/home/user/new.txt'))).toBe('hello')
    })

    it('既存ファイルを上書きできる', () => {
      vfs.writeFile('/home/user/x.txt', 'first')
      vfs.writeFile('/home/user/x.txt', 'second')
      expect(expectOk(vfs.readFile('/home/user/x.txt'))).toBe('second')
    })

    it('ディレクトリ名と同名は EISDIR', () => {
      expectErr(vfs.writeFile('/home/user/docs', 'x'), 'EISDIR')
    })

    it('親が存在しない場合は ENOENT', () => {
      expectErr(vfs.writeFile('/nope/x.txt', 'x'), 'ENOENT')
    })

    it('ルートへの書き込みは EISDIR', () => {
      expectErr(vfs.writeFile('/', 'x'), 'EISDIR')
    })
  })

  describe('appendFile', () => {
    it('既存ファイルに追記できる', () => {
      vfs.writeFile('/home/user/log.txt', 'a')
      vfs.appendFile('/home/user/log.txt', 'b')
      expect(expectOk(vfs.readFile('/home/user/log.txt'))).toBe('ab')
    })

    it('存在しないファイルなら新規作成', () => {
      vfs.appendFile('/home/user/log.txt', 'first')
      expect(expectOk(vfs.readFile('/home/user/log.txt'))).toBe('first')
    })

    it('ディレクトリへの追記は EISDIR', () => {
      expectErr(vfs.appendFile('/home/user/docs', 'x'), 'EISDIR')
    })
  })

  describe('mkdir', () => {
    it('ディレクトリを作成できる', () => {
      vfs.mkdir('/home/user/newdir')
      const node = expectOk(vfs.stat('/home/user/newdir'))
      expect(node.type).toBe('directory')
    })

    it('既存ディレクトリは EEXIST', () => {
      expectErr(vfs.mkdir('/home/user/docs'), 'EEXIST')
    })

    it('親が無い場合は ENOENT', () => {
      expectErr(vfs.mkdir('/home/user/a/b/c'), 'ENOENT')
    })

    it('recursive で親ごと作成できる', () => {
      vfs.mkdir('/home/user/a/b/c', { recursive: true })
      const node = expectOk(vfs.stat('/home/user/a/b/c'))
      expect(node.type).toBe('directory')
    })

    it('recursive なら既存でもエラーにならない', () => {
      const r = vfs.mkdir('/home/user/docs', { recursive: true })
      expect(r.ok).toBe(true)
    })

    it('ファイルを通過する mkdir は ENOTDIR', () => {
      expectErr(vfs.mkdir('/home/user/README.txt/sub', { recursive: true }), 'ENOTDIR')
    })
  })

  describe('remove', () => {
    it('ファイルを削除できる', () => {
      vfs.remove('/home/user/hello.txt')
      expectErr(vfs.stat('/home/user/hello.txt'), 'ENOENT')
    })

    it('ディレクトリは recursive 無しだと EISDIR', () => {
      expectErr(vfs.remove('/home/user/docs'), 'EISDIR')
    })

    it('ディレクトリを recursive で削除できる', () => {
      vfs.mkdir('/home/user/docs/inner', { recursive: true })
      vfs.writeFile('/home/user/docs/inner/note.txt', 'x')
      vfs.remove('/home/user/docs', { recursive: true })
      expectErr(vfs.stat('/home/user/docs'), 'ENOENT')
    })

    it('存在しないパスは ENOENT', () => {
      expectErr(vfs.remove('/nope'), 'ENOENT')
    })

    it('ルートは削除不可 (EINVAL)', () => {
      expectErr(vfs.remove('/'), 'EINVAL')
    })
  })

  describe('move', () => {
    it('ファイルをリネームできる', () => {
      vfs.move('/home/user/hello.txt', '/home/user/renamed.txt')
      expectErr(vfs.stat('/home/user/hello.txt'), 'ENOENT')
      expect(expectOk(vfs.stat('/home/user/renamed.txt')).type).toBe('file')
    })

    it('既存ディレクトリへ移動するとその配下に入る', () => {
      vfs.move('/home/user/hello.txt', '/home/user/docs')
      const node = expectOk(vfs.stat('/home/user/docs/hello.txt'))
      expect(node.type).toBe('file')
    })

    it('元が存在しないと ENOENT', () => {
      expectErr(vfs.move('/nope', '/home/user/x'), 'ENOENT')
    })

    it('ディレクトリを自分の配下に移動するのは EINVAL', () => {
      expectErr(vfs.move('/home/user/docs', '/home/user/docs/sub'), 'EINVAL')
    })

    it('ディレクトリのリネームができる', () => {
      vfs.move('/home/user/docs', '/home/user/papers')
      const node = expectOk(vfs.stat('/home/user/papers'))
      expect(node.type).toBe('directory')
    })
  })

  describe('copy', () => {
    it('ファイルをコピーできる', () => {
      vfs.copy('/home/user/hello.txt', '/home/user/hello-copy.txt')
      expect(expectOk(vfs.readFile('/home/user/hello-copy.txt'))).toContain('terminarai')
      // 元も残っている
      expect(expectOk(vfs.stat('/home/user/hello.txt')).type).toBe('file')
    })

    it('ディレクトリは recursive 無しだと EISDIR', () => {
      expectErr(vfs.copy('/home/user/docs', '/home/user/docs2'), 'EISDIR')
    })

    it('recursive でディレクトリを深くコピーできる', () => {
      vfs.writeFile('/home/user/docs/note.txt', 'memo')
      vfs.copy('/home/user/docs', '/home/user/docs2', { recursive: true })
      expect(expectOk(vfs.readFile('/home/user/docs2/note.txt'))).toBe('memo')
    })

    it('既存ディレクトリへコピーするとその配下に入る', () => {
      vfs.copy('/home/user/hello.txt', '/home/user/docs')
      const node = expectOk(vfs.stat('/home/user/docs/hello.txt'))
      expect(node.type).toBe('file')
    })

    it('同じパスへのコピーは EINVAL', () => {
      expectErr(vfs.copy('/home/user/hello.txt', '/home/user/hello.txt'), 'EINVAL')
    })

    it('ディレクトリを自分の配下にコピーは EINVAL', () => {
      expectErr(vfs.copy('/home/user/docs', '/home/user/docs/sub', { recursive: true }), 'EINVAL')
    })
  })

  describe('resolve (passthrough)', () => {
    it('相対パスを cwd 起点で解決', () => {
      expect(vfs.resolve('/home/user', 'docs')).toBe('/home/user/docs')
    })

    it('~ を HOME_PATH に展開', () => {
      expect(vfs.resolve('/tmp', '~/docs')).toBe('/home/user/docs')
    })
  })

  describe('serialize / loadFromSerialized', () => {
    it('シリアライズ→デシリアライズで内容が復元される', () => {
      vfs.writeFile('/home/user/note.txt', 'hello')
      vfs.mkdir('/home/user/extra')
      const json = vfs.serialize()

      const restored = createVfs()
      const r = restored.loadFromSerialized(json)
      expect(r.ok).toBe(true)

      expect(expectOk(restored.readFile('/home/user/note.txt'))).toBe('hello')
      expect(expectOk(restored.stat('/home/user/extra')).type).toBe('directory')
    })

    it('不正な JSON は EINVAL', () => {
      const v = createVfs()
      expectErr(v.loadFromSerialized('not json'), 'EINVAL')
    })

    it('不正な構造は EINVAL', () => {
      const v = createVfs()
      expectErr(v.loadFromSerialized(JSON.stringify({ foo: 'bar' })), 'EINVAL')
    })

    it('root がファイルなら EINVAL', () => {
      const v = createVfs()
      const fakeFile: VfsFile = {
        type: 'file',
        name: '/',
        mtime: 0,
        mode: 0,
        content: '',
      }
      expectErr(v.loadFromSerialized(JSON.stringify(fakeFile)), 'EINVAL')
    })
  })

  describe('空 Vfs', () => {
    it('createVfs() はルートのみ', () => {
      const v = createVfs()
      const entries = expectOk(v.list('/'))
      expect(entries).toEqual([])
    })

    it('createVfs(initial) で初期ツリーを渡せる', () => {
      const initial: VfsDirectory = {
        type: 'directory',
        name: '/',
        mtime: 0,
        mode: 0o755,
        children: {
          foo: { type: 'file', name: 'foo', mtime: 0, mode: 0o644, content: 'bar' },
        },
      }
      const v = createVfs(initial)
      expect(expectOk(v.readFile('/foo'))).toBe('bar')
    })
  })
})
