import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultVfs, type Vfs } from '../../vfs'
import { defaultContext } from '../types'
import { head } from './head'

const LOG_15 = Array.from({ length: 15 }, (_, i) => `line${String(i + 1).padStart(2, '0')}`).join(
  '\n',
)

describe('head', () => {
  let vfs: Vfs

  beforeEach(() => {
    vfs = createDefaultVfs()
    vfs.writeFile('/home/user/log.txt', LOG_15)
  })

  it('引数なしは missing file operand', () => {
    const r = head([], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('missing file operand')
  })

  it('既定で先頭 10 行', () => {
    const r = head(['log.txt'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
    const lines = r.stdout.trim().split('\n')
    expect(lines.length).toBe(10)
    expect(lines[0]).toBe('line01')
    expect(lines[9]).toBe('line10')
  })

  it('-n 5', () => {
    const r = head(['-n', '5', 'log.txt'], defaultContext('/home/user'), vfs)
    expect(r.stdout).toBe('line01\nline02\nline03\nline04\nline05\n')
  })

  it('-n5 (連結) も同じ', () => {
    const r = head(['-n5', 'log.txt'], defaultContext('/home/user'), vfs)
    expect(r.stdout).toBe('line01\nline02\nline03\nline04\nline05\n')
  })

  it('-5 (GNU 短縮) も同じ', () => {
    const r = head(['-5', 'log.txt'], defaultContext('/home/user'), vfs)
    expect(r.stdout).toBe('line01\nline02\nline03\nline04\nline05\n')
  })

  it('--lines=5 も同じ', () => {
    const r = head(['--lines=5', 'log.txt'], defaultContext('/home/user'), vfs)
    expect(r.stdout).toBe('line01\nline02\nline03\nline04\nline05\n')
  })

  it('不在ファイルは ENOENT エラー', () => {
    const r = head(['nope.txt'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain("cannot open 'nope.txt'")
  })

  it('ディレクトリは Is a directory エラー', () => {
    const r = head(['docs'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('Is a directory')
  })

  it('不正な行数指定はエラー', () => {
    const r = head(['-n', 'abc', 'log.txt'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('abc')
  })

  it('複数ファイルは ==> filename <== ヘッダ付き', () => {
    vfs.writeFile('/home/user/a.txt', 'A1\nA2\n')
    vfs.writeFile('/home/user/b.txt', 'B1\nB2\n')
    const r = head(['-n', '1', 'a.txt', 'b.txt'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
    expect(r.stdout).toContain('==> a.txt <==')
    expect(r.stdout).toContain('==> b.txt <==')
    expect(r.stdout).toContain('A1')
    expect(r.stdout).toContain('B1')
    // 順序: a.txt のヘッダが b.txt より前
    expect(r.stdout.indexOf('==> a.txt')).toBeLessThan(r.stdout.indexOf('==> b.txt'))
  })

  it('複数ファイルで一部が不在の場合、存在分は表示しつつ stderr に記録', () => {
    vfs.writeFile('/home/user/a.txt', 'A1\n')
    const r = head(['a.txt', 'nope.txt'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stdout).toContain('A1')
    expect(r.stderr).toContain('nope.txt')
  })
})
