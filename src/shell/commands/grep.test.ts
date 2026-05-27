import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultVfs, type Vfs } from '../../vfs'
import { defaultContext } from '../types'
import { grep } from './grep'

const LOG_CONTENT = `INFO 2026-05-27 user login
ERROR 2026-05-27 disk full
INFO 2026-05-27 user logout
WARN 2026-05-27 slow query
ERROR 2026-05-27 timeout
INFO 2026-05-27 user login
`

describe('grep', () => {
  let vfs: Vfs

  beforeEach(() => {
    vfs = createDefaultVfs()
    vfs.writeFile('/home/user/access.log', LOG_CONTENT)
  })

  it('引数なしは missing pattern', () => {
    const r = grep([], defaultContext(), vfs)
    expect(r.exitCode).toBe(2)
    expect(r.stderr).toContain('missing pattern')
  })

  it('パターンのみは missing file operand', () => {
    const r = grep(['INFO'], defaultContext(), vfs)
    expect(r.exitCode).toBe(2)
    expect(r.stderr).toContain('missing file operand')
  })

  it('単純文字列マッチ', () => {
    const r = grep(['ERROR', 'access.log'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
    const lines = r.stdout.trim().split('\n')
    expect(lines.length).toBe(2)
    for (const line of lines) {
      expect(line).toContain('ERROR')
    }
  })

  it('マッチなしは exit 1 (エラーではない)', () => {
    const r = grep(['NOSUCH', 'access.log'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stdout).toBe('')
    expect(r.stderr).toBe('')
  })

  it('-i で大文字小文字を無視', () => {
    const r = grep(['-i', 'error', 'access.log'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
    const lines = r.stdout.trim().split('\n')
    expect(lines.length).toBe(2)
  })

  it('-i 無しは大小一致のみ', () => {
    const r = grep(['error', 'access.log'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(1)
  })

  it('-n で行番号プレフィクス', () => {
    const r = grep(['-n', 'ERROR', 'access.log'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
    expect(r.stdout).toMatch(/^2:ERROR/m)
    expect(r.stdout).toMatch(/^5:ERROR/m)
  })

  it('-v で一致しない行を出力', () => {
    const r = grep(['-v', 'INFO', 'access.log'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
    // INFO 以外: ERROR ×2 + WARN ×1 = 3 行
    const lines = r.stdout.trim().split('\n')
    expect(lines.length).toBe(3)
    for (const line of lines) {
      expect(line).not.toContain('INFO')
    }
  })

  it('-v + -n で行番号付き除外', () => {
    const r = grep(['-vn', 'INFO', 'access.log'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
    // 2: 5: 4: が含まれる (実際の行番号)
    expect(r.stdout).toMatch(/^2:/m)
    expect(r.stdout).toMatch(/^4:/m)
    expect(r.stdout).toMatch(/^5:/m)
  })

  it('正規表現メタ文字 (^, $)', () => {
    const r = grep(['^WARN', 'access.log'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
    const lines = r.stdout.trim().split('\n')
    expect(lines.length).toBe(1)
    expect(lines[0]).toContain('WARN')
  })

  it('文字クラス [...]', () => {
    const r = grep(['[EW]', 'access.log'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
    // ERROR / WARN いずれかを含む行: ERROR ×2 + WARN ×1
    const lines = r.stdout.trim().split('\n')
    expect(lines.length).toBe(3)
  })

  it('不正パターンは exit 2', () => {
    const r = grep(['[unclosed', 'access.log'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(2)
    expect(r.stderr).toContain('invalid pattern')
  })

  it('不在ファイルは exit 2', () => {
    const r = grep(['INFO', 'nope.txt'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(2)
    expect(r.stderr).toContain('nope.txt')
  })

  it('ディレクトリ指定は Is a directory エラー', () => {
    const r = grep(['INFO', 'docs'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(2)
    expect(r.stderr).toContain('Is a directory')
  })

  it('複数ファイル指定で filename: プレフィクス', () => {
    vfs.writeFile('/home/user/a.txt', 'apple\nbanana\n')
    vfs.writeFile('/home/user/b.txt', 'banana\ncherry\n')
    const r = grep(['banana', 'a.txt', 'b.txt'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
    expect(r.stdout).toContain('a.txt:banana')
    expect(r.stdout).toContain('b.txt:banana')
  })

  it('複数ファイル + -n で filename:lineno: プレフィクス', () => {
    vfs.writeFile('/home/user/a.txt', 'apple\nbanana\n')
    vfs.writeFile('/home/user/b.txt', 'first\nbanana\n')
    const r = grep(['-n', 'banana', 'a.txt', 'b.txt'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
    expect(r.stdout).toContain('a.txt:2:banana')
    expect(r.stdout).toContain('b.txt:2:banana')
  })

  it('複数ファイルで一部だけ不在: 存在分は出力しつつ exit 2', () => {
    vfs.writeFile('/home/user/a.txt', 'apple\n')
    const r = grep(['apple', 'a.txt', 'nope.txt'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(2)
    expect(r.stdout).toContain('a.txt:apple')
    expect(r.stderr).toContain('nope.txt')
  })

  it('--ignore-case (long alias) は -i と同じ', () => {
    const r = grep(['--ignore-case', 'error', 'access.log'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
  })

  it('--line-number / --invert-match の long alias', () => {
    const r = grep(
      ['--invert-match', '--line-number', 'INFO', 'access.log'],
      defaultContext('/home/user'),
      vfs,
    )
    expect(r.exitCode).toBe(0)
    expect(r.stdout).toMatch(/^2:/m)
  })

  it('未知の長フラグは exit 2', () => {
    const r = grep(['--nope', 'foo', 'access.log'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(2)
    expect(r.stderr).toContain('unrecognized option')
  })
})
