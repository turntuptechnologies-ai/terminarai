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

  it('既存ファイルは内容を保ったまま mtime を更新する', () => {
    vfs.writeFile('/home/user/note.txt', 'keep me')
    const before = vfs.stat('/home/user/note.txt')
    if (!before.ok || before.value.type !== 'file') throw new Error('setup failed')
    // 明確に過去の値を入れて、touch が確実に上書きしたことを検証する
    const OLD = 1_000_000
    before.value.mtime = OLD

    const r = touch(['/home/user/note.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)

    const after = vfs.stat('/home/user/note.txt')
    if (!after.ok) throw new Error('post-touch stat failed')
    expect(after.value.mtime).toBeGreaterThan(OLD)

    const read = vfs.readFile('/home/user/note.txt')
    if (!read.ok) throw new Error('post-touch read failed')
    expect(read.value).toBe('keep me')
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

  it('- で始まる引数もファイル名扱い (現状フラグなし、Issue #13 で方針見直し)', () => {
    const r = touch(['-abc'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/-abc').ok).toBe(true)
  })
})
