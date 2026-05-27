import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultVfs, type Vfs } from '../../vfs'
import { defaultContext } from '../types'
import { vi } from './vi'

describe('vi command', () => {
  let vfs: Vfs

  beforeEach(() => {
    vfs = createDefaultVfs()
  })

  it('引数なしは missing file operand', () => {
    const r = vi([], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('missing file operand')
    expect(r.editor).toBeUndefined()
  })

  it('既存ファイルを指定するとその内容を initialContent に載せて editor シグナルを返す', () => {
    vfs.writeFile('/home/user/note.txt', 'hello\n')
    const r = vi(['note.txt'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
    expect(r.editor).toBeDefined()
    expect(r.editor?.path).toBe('/home/user/note.txt')
    expect(r.editor?.display).toBe('note.txt')
    expect(r.editor?.initialContent).toBe('hello\n')
  })

  it('不在ファイルは新規扱いで initialContent=空、エラー出さず editor を返す', () => {
    const r = vi(['new.txt'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
    expect(r.stderr).toBe('')
    expect(r.editor?.path).toBe('/home/user/new.txt')
    expect(r.editor?.initialContent).toBe('')
  })

  it('ディレクトリを指定すると Is a directory エラー', () => {
    const r = vi(['docs'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('Is a directory')
    expect(r.editor).toBeUndefined()
  })

  it('絶対パスでも動作する', () => {
    const r = vi(['/home/user/README.txt'], defaultContext('/tmp'), vfs)
    expect(r.exitCode).toBe(0)
    expect(r.editor?.path).toBe('/home/user/README.txt')
    expect(r.editor?.display).toBe('/home/user/README.txt')
    expect(r.editor?.initialContent.length).toBeGreaterThan(0)
  })

  it('途中パスが file (ENOTDIR) の場合はエラーで editor は出さない', () => {
    // README.txt は file。それを経由した /home/user/README.txt/x.txt は ENOTDIR
    const r = vi(['/home/user/README.txt/inner.txt'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.editor).toBeUndefined()
  })
})
