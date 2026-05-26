import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultVfs, type Vfs } from '../../vfs'
import { defaultContext } from '../types'
import { touch } from './touch'

describe('touch', () => {
  let vfs: Vfs

  beforeEach(() => {
    vfs = createDefaultVfs()
  })

  it('存在しないファイルを空で作成', () => {
    const r = touch(['/home/user/new.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    const read = vfs.readFile('/home/user/new.txt')
    expect(read.ok).toBe(true)
    if (read.ok) expect(read.value).toBe('')
  })

  it('既存ファイルは内容を保ったまま mtime 更新', () => {
    vfs.writeFile('/home/user/note.txt', 'keep me')
    const before = vfs.stat('/home/user/note.txt')
    if (!before.ok) throw new Error('setup failed')
    const oldMtime = before.value.mtime

    // 1ms 以上経過させるために少し待つ代わりに、mtime を意図的に過去にセットしておく
    if (before.value.type === 'file') before.value.mtime = oldMtime - 1000

    const r = touch(['/home/user/note.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)

    const after = vfs.stat('/home/user/note.txt')
    if (!after.ok) throw new Error('post-touch stat failed')
    expect(after.value.mtime).toBeGreaterThan(oldMtime - 1000)
    expect(vfs.readFile('/home/user/note.txt').ok).toBe(true)
    const read = vfs.readFile('/home/user/note.txt')
    if (read.ok) expect(read.value).toBe('keep me')
  })

  it('既存ディレクトリは no-op で成功 (VFS制限のため mtime は更新しない)', () => {
    const r = touch(['/home/user/docs'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(r.stderr).toBe('')
  })

  it('複数ファイルを一度に処理', () => {
    const r = touch(['/home/user/a.txt', '/home/user/b.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/a.txt').ok).toBe(true)
    expect(vfs.stat('/home/user/b.txt').ok).toBe(true)
  })

  it('親が存在しないと ENOENT', () => {
    const r = touch(['/nope/x.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('No such file or directory')
  })

  it('引数なしはエラー', () => {
    const r = touch([], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('missing file operand')
  })

  it('一部失敗してもほかは続行', () => {
    const r = touch(['/nope/x', '/home/user/ok.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(vfs.stat('/home/user/ok.txt').ok).toBe(true)
  })
})
