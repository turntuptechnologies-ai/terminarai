import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultVfs, type Vfs } from '../../vfs'
import { defaultContext } from '../types'
import { tail } from './tail'

const LOG_15 = Array.from({ length: 15 }, (_, i) => `line${String(i + 1).padStart(2, '0')}`).join(
  '\n',
)

describe('tail', () => {
  let vfs: Vfs

  beforeEach(() => {
    vfs = createDefaultVfs()
    vfs.writeFile('/home/user/log.txt', LOG_15)
  })

  it('引数なしは missing file operand', () => {
    const r = tail([], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('missing file operand')
  })

  it('既定で末尾 10 行', () => {
    const r = tail(['log.txt'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
    const lines = r.stdout.trim().split('\n')
    expect(lines.length).toBe(10)
    expect(lines[0]).toBe('line06')
    expect(lines[9]).toBe('line15')
  })

  it('-n 5 で末尾 5 行', () => {
    const r = tail(['-n', '5', 'log.txt'], defaultContext('/home/user'), vfs)
    expect(r.stdout).toBe('line11\nline12\nline13\nline14\nline15\n')
  })

  it('-5 (GNU 短縮) も同じ', () => {
    const r = tail(['-5', 'log.txt'], defaultContext('/home/user'), vfs)
    expect(r.stdout).toBe('line11\nline12\nline13\nline14\nline15\n')
  })

  it('--lines=5 も同じ', () => {
    const r = tail(['--lines=5', 'log.txt'], defaultContext('/home/user'), vfs)
    expect(r.stdout).toBe('line11\nline12\nline13\nline14\nline15\n')
  })

  it('不在ファイルは ENOENT エラー', () => {
    const r = tail(['nope.txt'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain("cannot open 'nope.txt'")
  })

  it('ディレクトリは Is a directory エラー', () => {
    const r = tail(['docs'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('Is a directory')
  })

  it('複数ファイルは ==> filename <== ヘッダ付き', () => {
    vfs.writeFile('/home/user/a.txt', 'A1\nA2\n')
    vfs.writeFile('/home/user/b.txt', 'B1\nB2\n')
    const r = tail(['-n', '1', 'a.txt', 'b.txt'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
    expect(r.stdout).toContain('==> a.txt <==')
    expect(r.stdout).toContain('==> b.txt <==')
    expect(r.stdout).toContain('A2')
    expect(r.stdout).toContain('B2')
  })
})
