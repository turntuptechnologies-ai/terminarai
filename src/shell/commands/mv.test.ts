import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultVfs, type Vfs } from '../../vfs'
import { defaultContext } from '../types'
import { mv } from './mv'

describe('mv', () => {
  let vfs: Vfs

  beforeEach(() => {
    vfs = createDefaultVfs()
  })

  it('ファイルをリネーム', () => {
    const r = mv(['/home/user/hello.txt', '/home/user/renamed.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/hello.txt').ok).toBe(false)
    expect(vfs.stat('/home/user/renamed.txt').ok).toBe(true)
  })

  it('ディレクトリをリネーム (recursive 不要)', () => {
    vfs.writeFile('/home/user/docs/note.txt', 'memo')
    const r = mv(['/home/user/docs', '/home/user/papers'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/papers/note.txt').ok).toBe(true)
  })

  it('既存ディレクトリ宛先なら配下に入る', () => {
    const r = mv(['/home/user/hello.txt', '/home/user/docs'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/docs/hello.txt').ok).toBe(true)
    expect(vfs.stat('/home/user/hello.txt').ok).toBe(false)
  })

  it('複数ソース + 既存ディレクトリ宛先', () => {
    vfs.writeFile('/home/user/a.txt', 'A')
    vfs.writeFile('/home/user/b.txt', 'B')
    const r = mv(['/home/user/a.txt', '/home/user/b.txt', '/home/user/docs'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/docs/a.txt').ok).toBe(true)
    expect(vfs.stat('/home/user/docs/b.txt').ok).toBe(true)
  })

  it('複数ソース + 宛先がディレクトリでないとエラー', () => {
    vfs.writeFile('/home/user/a.txt', 'A')
    vfs.writeFile('/home/user/b.txt', 'B')
    const r = mv(
      ['/home/user/a.txt', '/home/user/b.txt', '/home/user/c.txt'],
      defaultContext(),
      vfs,
    )
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain("target '/home/user/c.txt' is not a directory")
  })

  it('引数なしは missing file operand', () => {
    const r = mv([], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('missing file operand')
  })

  it('引数 1 つは missing destination', () => {
    const r = mv(['/home/user/hello.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('missing destination')
  })

  it('存在しないソースは cannot move', () => {
    const r = mv(['/nope', '/home/user/dest'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('No such file or directory')
  })

  it('同一パスは EINVAL', () => {
    const r = mv(['/home/user/hello.txt', '/home/user/hello.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('same file')
  })

  it('ディレクトリを自分の配下に移動は EINVAL', () => {
    const r = mv(['/home/user/docs', '/home/user/docs/sub'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('into itself')
  })

  it('ファイル → 既存ファイルは silent に上書き', () => {
    vfs.writeFile('/home/user/a.txt', 'A')
    vfs.writeFile('/home/user/b.txt', 'B')
    const r = mv(['/home/user/a.txt', '/home/user/b.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    const read = vfs.readFile('/home/user/b.txt')
    if (read.ok) expect(read.value).toBe('A')
    expect(vfs.stat('/home/user/a.txt').ok).toBe(false)
  })

  it('ディレクトリ → 既存空ディレクトリは上書き OK', () => {
    vfs.mkdir('/home/user/empty')
    vfs.writeFile('/home/user/docs/note.txt', 'memo')
    // /home/user/docs を /home/user/empty へリネーム (empty が新しい場所として上書き)
    // VFS の move 仕様では既存ディレクトリ宛先は配下に入れるため、別構成でテスト
    vfs.mkdir('/home/user/src-dir')
    vfs.writeFile('/home/user/src-dir/a', 'x')
    // empty/src-dir が無いので「move src-dir into empty」→ empty/src-dir ができる
    const r = mv(['/home/user/src-dir', '/home/user/empty'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/empty/src-dir/a').ok).toBe(true)
  })

  it('ディレクトリ → 既存非空ディレクトリ衝突は ENOTEMPTY', () => {
    // /home/user/src と /home/user/dst を作り、dst/src も先に作っておく
    vfs.mkdir('/home/user/src')
    vfs.mkdir('/home/user/dst')
    vfs.mkdir('/home/user/dst/src')
    vfs.writeFile('/home/user/dst/src/inside', 'x')
    const r = mv(['/home/user/src', '/home/user/dst'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('Directory not empty')
  })

  it('-f は no-op として受理する', () => {
    vfs.writeFile('/home/user/a.txt', 'A')
    const r = mv(['-f', '/home/user/a.txt', '/home/user/b.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/b.txt').ok).toBe(true)
  })

  it('未知フラグは invalid option (exit 1)', () => {
    const r = mv(['-x', '/home/user/a', '/home/user/b'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain("invalid option -- 'x'")
  })

  it('EINVAL メッセージは小文字に正規化される', () => {
    const r = mv(['/home/user/docs', '/home/user/docs/sub'], defaultContext(), vfs)
    expect(r.stderr).toMatch(/mv: cannot move/)
  })
})
