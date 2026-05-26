import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultVfs, type Vfs } from '../../vfs'
import { defaultContext } from '../types'
import { rm } from './rm'

describe('rm', () => {
  let vfs: Vfs

  beforeEach(() => {
    vfs = createDefaultVfs()
  })

  it('ファイルを削除', () => {
    const r = rm(['/home/user/hello.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/hello.txt').ok).toBe(false)
  })

  it('複数ファイルを一度に削除', () => {
    vfs.writeFile('/home/user/a.txt', 'x')
    vfs.writeFile('/home/user/b.txt', 'y')
    const r = rm(['/home/user/a.txt', '/home/user/b.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/a.txt').ok).toBe(false)
    expect(vfs.stat('/home/user/b.txt').ok).toBe(false)
  })

  it('ディレクトリは -r なしで EISDIR (exit 1)', () => {
    const r = rm(['/home/user/docs'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain("rm: cannot remove '/home/user/docs'")
    expect(r.stderr).toContain('Is a directory')
  })

  it('-r でディレクトリを再帰削除', () => {
    vfs.writeFile('/home/user/docs/note.txt', 'x')
    const r = rm(['-r', '/home/user/docs'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/docs').ok).toBe(false)
  })

  it('-R も -r と等価', () => {
    const r = rm(['-R', '/home/user/docs'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/docs').ok).toBe(false)
  })

  it('存在しないパスは ENOENT (exit 1)', () => {
    const r = rm(['/nope'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('No such file or directory')
  })

  it('-f は存在しないパスを黙って無視', () => {
    const r = rm(['-f', '/nope'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(r.stderr).toBe('')
  })

  it('-rf でディレクトリを問答無用で削除', () => {
    vfs.writeFile('/home/user/docs/note.txt', 'x')
    const r = rm(['-rf', '/home/user/docs', '/nope'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/docs').ok).toBe(false)
  })

  it('引数なしはエラー', () => {
    const r = rm([], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('missing operand')
  })

  it('-f のみは引数なしでも成功', () => {
    const r = rm(['-f'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(r.stderr).toBe('')
  })

  it('一部失敗しても他は続行', () => {
    vfs.writeFile('/home/user/keep.txt', 'x')
    const r = rm(['/nope', '/home/user/keep.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(vfs.stat('/home/user/keep.txt').ok).toBe(false)
  })

  it('未知フラグは exit 1', () => {
    const r = rm(['-Z', '/x'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain("invalid option -- 'Z'")
  })

  it('ルート (/) の削除は VFS が EINVAL を返す', () => {
    const r = rm(['-rf', '/'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
  })
})
