import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultVfs, type Vfs } from '../../vfs'
import { defaultContext } from '../types'
import { cp } from './cp'

describe('cp', () => {
  let vfs: Vfs

  beforeEach(() => {
    vfs = createDefaultVfs()
  })

  it('ファイルをコピー (新規パス)', () => {
    const r = cp(['/home/user/hello.txt', '/home/user/copy.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/copy.txt').ok).toBe(true)
    expect(vfs.stat('/home/user/hello.txt').ok).toBe(true)
  })

  it('ファイルを既存ディレクトリへ (配下に作られる)', () => {
    const r = cp(['/home/user/hello.txt', '/home/user/docs'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/docs/hello.txt').ok).toBe(true)
  })

  it('ディレクトリは -r なしで omitting エラー', () => {
    const r = cp(['/home/user/docs', '/home/user/docs2'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain("omitting directory '/home/user/docs'")
  })

  it('-r でディレクトリを再帰コピー', () => {
    vfs.writeFile('/home/user/docs/note.txt', 'memo')
    const r = cp(['-r', '/home/user/docs', '/home/user/docs2'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    const read = vfs.readFile('/home/user/docs2/note.txt')
    expect(read.ok).toBe(true)
    if (read.ok) expect(read.value).toBe('memo')
  })

  it('-R も -r と等価', () => {
    const r = cp(['-R', '/home/user/docs', '/home/user/docs2'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/docs2').ok).toBe(true)
  })

  it('複数ソース + 既存ディレクトリ宛先', () => {
    vfs.writeFile('/home/user/a.txt', 'A')
    vfs.writeFile('/home/user/b.txt', 'B')
    const r = cp(['/home/user/a.txt', '/home/user/b.txt', '/home/user/docs'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/docs/a.txt').ok).toBe(true)
    expect(vfs.stat('/home/user/docs/b.txt').ok).toBe(true)
  })

  it('複数ソース + 宛先がディレクトリでないとエラー', () => {
    vfs.writeFile('/home/user/a.txt', 'A')
    vfs.writeFile('/home/user/b.txt', 'B')
    const r = cp(
      ['/home/user/a.txt', '/home/user/b.txt', '/home/user/c.txt'],
      defaultContext(),
      vfs,
    )
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain("target '/home/user/c.txt' is not a directory")
  })

  it('引数なしは missing file operand', () => {
    const r = cp([], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('missing file operand')
  })

  it('引数 1 つは missing destination', () => {
    const r = cp(['/home/user/hello.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('missing destination')
  })

  it('存在しないソースは cannot stat', () => {
    const r = cp(['/nope', '/home/user/dest.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain("cp: cannot stat '/nope'")
  })

  it('同一パスへのコピーは EINVAL を専用フォーマットで', () => {
    const r = cp(['/home/user/hello.txt', '/home/user/hello.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('same file')
  })

  it('ディレクトリを自身配下にコピーは EINVAL + 小文字 prefix', () => {
    const r = cp(['-r', '/home/user/docs', '/home/user/docs/sub'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toMatch(/cp: cannot copy/)
    expect(r.stderr).toContain('into itself')
  })

  it('既存ファイルへの上書きコピー (silent に置換)', () => {
    vfs.writeFile('/home/user/a.txt', 'A')
    vfs.writeFile('/home/user/b.txt', 'B')
    const r = cp(['/home/user/a.txt', '/home/user/b.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    const read = vfs.readFile('/home/user/b.txt')
    if (read.ok) expect(read.value).toBe('A')
    expect(vfs.stat('/home/user/a.txt').ok).toBe(true)
  })

  it('-r で同名ディレクトリへのコピー: 宛先サブツリーが非空なら ENOTEMPTY (既知の制約)', () => {
    vfs.writeFile('/home/user/docs/note.txt', 'src')
    // 既に同名 docs/docs が存在し、しかも子ファイルがある状況を作る
    vfs.mkdir('/home/user/parent')
    vfs.mkdir('/home/user/parent/docs')
    vfs.writeFile('/home/user/parent/docs/existing.txt', 'EXISTING')
    const r = cp(['-r', '/home/user/docs', '/home/user/parent'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('Directory not empty')
  })
})
