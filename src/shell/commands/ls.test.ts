import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultVfs, type Vfs } from '../../vfs'
import { defaultContext } from '../types'
import { ls } from './ls'

describe('ls', () => {
  let vfs: Vfs

  beforeEach(() => {
    vfs = createDefaultVfs()
  })

  it('引数なしで cwd の内容を表示 (アルファベット順、1 行 1 エントリ)', () => {
    const r = ls([], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
    expect(r.stdout).toBe('README.txt\ndocs\nhello.txt\n')
  })

  it('絶対パスを指定', () => {
    const r = ls(['/home/user'], defaultContext('/tmp'), vfs)
    expect(r.stdout).toBe('README.txt\ndocs\nhello.txt\n')
  })

  it('空のディレクトリは出力なし', () => {
    vfs.mkdir('/home/user/empty')
    const r = ls(['/home/user/empty'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(r.stdout).toBe('')
    expect(r.stderr).toBe('')
  })

  it('存在しないパスはエラー (exitCode 2)', () => {
    const r = ls(['/nope'], defaultContext(), vfs)
    expect(r.exitCode).toBe(2)
    expect(r.stderr).toContain("ls: cannot access '/nope'")
    expect(r.stderr).toContain('No such file or directory')
  })

  it('ファイルを指定するとそのファイルを 1 行で表示', () => {
    const r = ls(['/home/user/README.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    expect(r.stdout).toBe('/home/user/README.txt\n')
  })

  it('hidden ファイルはデフォルトで非表示', () => {
    vfs.writeFile('/home/user/.bashrc', 'export X=1')
    const r = ls([], defaultContext('/home/user'), vfs)
    expect(r.stdout).not.toContain('.bashrc')
  })

  it('-a で hidden ファイルも表示', () => {
    vfs.writeFile('/home/user/.bashrc', 'x')
    const r = ls(['-a'], defaultContext('/home/user'), vfs)
    expect(r.stdout).toContain('.bashrc')
  })

  it('-A も hidden 表示 (terminarai では -a と同じ挙動)', () => {
    vfs.writeFile('/home/user/.profile', 'x')
    const r = ls(['-A'], defaultContext('/home/user'), vfs)
    expect(r.stdout).toContain('.profile')
  })

  it('-l で詳細表示', () => {
    const r = ls(['-l'], defaultContext('/home/user'), vfs)
    expect(r.stdout).toContain('-rw-r--r-- 1 user user')
    expect(r.stdout).toContain('drwxr-xr-x 1 user user')
    expect(r.stdout).toContain('README.txt')
    expect(r.stdout).toContain('docs')
  })

  it('-la でフラグ結合', () => {
    vfs.writeFile('/home/user/.bashrc', 'x')
    const r = ls(['-la'], defaultContext('/home/user'), vfs)
    expect(r.stdout).toContain('-rw-r--r--')
    expect(r.stdout).toContain('.bashrc')
  })

  it('複数ターゲットを指定するとセクション分けで表示', () => {
    const r = ls(['/home/user', '/etc'], defaultContext(), vfs)
    expect(r.stdout).toContain('/home/user:')
    expect(r.stdout).toContain('/etc:')
    expect(r.stdout).toContain('README.txt')
  })

  it('未知フラグはエラー', () => {
    const r = ls(['-Z'], defaultContext(), vfs)
    expect(r.exitCode).toBe(2)
    expect(r.stderr).toContain("invalid option -- 'Z'")
  })

  it('-- 以降はフラグとして扱わない', () => {
    vfs.writeFile('/home/user/-l', 'x')
    const r = ls(['--', '-l'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
    expect(r.stdout).toBe('-l\n')
  })
})
