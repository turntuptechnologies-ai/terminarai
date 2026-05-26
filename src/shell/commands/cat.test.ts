import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultVfs, type Vfs } from '../../vfs'
import { defaultContext } from '../types'
import { cat } from './cat'

describe('cat', () => {
  let vfs: Vfs

  beforeEach(() => {
    vfs = createDefaultVfs()
  })

  it('ファイルの内容を出力', () => {
    vfs.writeFile('/home/user/note.txt', 'hello\n')
    const r = cat(['/home/user/note.txt'], defaultContext(), vfs)
    expect(r.stdout).toBe('hello\n')
    expect(r.exitCode).toBe(0)
  })

  it('複数ファイルを連結', () => {
    vfs.writeFile('/home/user/a.txt', 'A\n')
    vfs.writeFile('/home/user/b.txt', 'B\n')
    const r = cat(['/home/user/a.txt', '/home/user/b.txt'], defaultContext(), vfs)
    expect(r.stdout).toBe('A\nB\n')
  })

  it('引数なしは未対応エラー', () => {
    const r = cat([], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('missing file operand')
  })

  it('存在しないファイルは ENOENT', () => {
    const r = cat(['/nope'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('cat: /nope:')
    expect(r.stderr).toContain('No such file or directory')
  })

  it('ディレクトリは EISDIR', () => {
    const r = cat(['/home/user/docs'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('Is a directory')
  })

  it('一部失敗 + 一部成功でも続行', () => {
    vfs.writeFile('/home/user/good.txt', 'OK\n')
    const r = cat(['/nope', '/home/user/good.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stdout).toBe('OK\n')
    expect(r.stderr).toContain('/nope')
  })

  it('相対パスは cwd 起点で解決', () => {
    vfs.writeFile('/home/user/x.txt', 'X\n')
    const r = cat(['x.txt'], defaultContext('/home/user'), vfs)
    expect(r.stdout).toBe('X\n')
  })
})
