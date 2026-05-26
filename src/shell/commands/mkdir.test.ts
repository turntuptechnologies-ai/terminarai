import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultVfs, type Vfs } from '../../vfs'
import { defaultContext } from '../types'
import { mkdir } from './mkdir'

describe('mkdir', () => {
  let vfs: Vfs

  beforeEach(() => {
    vfs = createDefaultVfs()
  })

  it('ディレクトリを作成', () => {
    const r = mkdir(['/home/user/new'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/new').ok).toBe(true)
  })

  it('既存ディレクトリは EEXIST (exit 1)', () => {
    const r = mkdir(['/home/user/docs'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('File exists')
  })

  it('-p で親ごと作成', () => {
    const r = mkdir(['-p', '/home/user/a/b/c'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/a/b/c').ok).toBe(true)
  })

  it('-p なら既存でもエラーにならない', () => {
    const r = mkdir(['-p', '/home/user/docs'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
  })

  it('複数ターゲット', () => {
    const r = mkdir(['/home/user/x', '/home/user/y'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(vfs.stat('/home/user/x').ok).toBe(true)
    expect(vfs.stat('/home/user/y').ok).toBe(true)
  })

  it('引数なしはエラー', () => {
    const r = mkdir([], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('missing operand')
  })

  it('未知フラグは exit 2 + Try help 案内', () => {
    const r = mkdir(['-Z', '/x'], defaultContext(), vfs)
    expect(r.exitCode).toBe(2)
    expect(r.stderr).toContain("invalid option -- 'Z'")
    expect(r.stderr).toContain("Try 'mkdir --help'")
  })

  it('一部失敗してもほかは続行 + exit 1', () => {
    const r = mkdir(['/home/user/docs', '/home/user/new'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('docs')
    expect(vfs.stat('/home/user/new').ok).toBe(true)
  })
})
