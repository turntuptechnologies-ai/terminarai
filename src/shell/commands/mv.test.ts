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
})
