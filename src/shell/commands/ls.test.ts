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

  it('存在しないパスはエラー (exitCode 2、GNU と同じ)', () => {
    const r = ls(['/nope'], defaultContext(), vfs)
    expect(r.exitCode).toBe(2)
    expect(r.stderr).toContain("ls: cannot access '/nope'")
    expect(r.stderr).toContain('No such file or directory')
  })

  it('一部だけ存在しないパスは stderr に出しつつ存在分は表示', () => {
    const r = ls(['/home/user', '/nope'], defaultContext(), vfs)
    expect(r.exitCode).toBe(2)
    expect(r.stdout).toContain('README.txt')
    expect(r.stderr).toContain("cannot access '/nope'")
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

  it('-a で hidden ファイル + . / .. 擬似エントリを表示', () => {
    vfs.writeFile('/home/user/.bashrc', 'x')
    const r = ls(['-a'], defaultContext('/home/user'), vfs)
    expect(r.stdout).toContain('.bashrc')
    // ASCII 順で `.` `..` `.bashrc` README.txt docs hello.txt の順で出る
    const lines = r.stdout.trim().split('\n')
    expect(lines[0]).toBe('.')
    expect(lines[1]).toBe('..')
    expect(lines).toContain('.bashrc')
    expect(lines).toContain('README.txt')
  })

  it('-A は hidden 表示するが . / .. は出さない (-a と区別)', () => {
    vfs.writeFile('/home/user/.profile', 'x')
    const r = ls(['-A'], defaultContext('/home/user'), vfs)
    expect(r.stdout).toContain('.profile')
    const lines = r.stdout.trim().split('\n')
    expect(lines).not.toContain('.')
    expect(lines).not.toContain('..')
  })

  it('ルート / の -a でも `.` と `..` が出る (`..` は自分自身)', () => {
    const r = ls(['-a', '/'], defaultContext(), vfs)
    const lines = r.stdout.trim().split('\n')
    expect(lines).toContain('.')
    expect(lines).toContain('..')
  })

  it('-la の long 表示で . と .. に詳細情報が付く', () => {
    const r = ls(['-la'], defaultContext('/home/user'), vfs)
    // 各行が drwxr-xr-x で始まる行が含まれていれば OK
    expect(r.stdout).toMatch(/drwxr-xr-x.* \.$/m)
    expect(r.stdout).toMatch(/drwxr-xr-x.* \.\.$/m)
  })

  it('-l で詳細表示 + 先頭に total 行', () => {
    const r = ls(['-l'], defaultContext('/home/user'), vfs)
    expect(r.stdout).toMatch(/^total \d+\n/)
    expect(r.stdout).toContain('-rw-r--r-- 1 user user')
    expect(r.stdout).toContain('drwxr-xr-x 1 user user')
    expect(r.stdout).toContain('README.txt')
    expect(r.stdout).toContain('docs')
  })

  it('-l で空ディレクトリは total 0 のみ', () => {
    vfs.mkdir('/home/user/empty')
    const r = ls(['-l', '/home/user/empty'], defaultContext(), vfs)
    expect(r.stdout).toBe('total 0\n')
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

  it('ファイル + ディレクトリ混在時はファイル先、空行、dir ヘッダの順', () => {
    const r = ls(['/home/user/hello.txt', '/home/user'], defaultContext(), vfs)
    expect(r.exitCode).toBe(0)
    const lines = r.stdout.split('\n')
    expect(lines[0]).toBe('/home/user/hello.txt')
    expect(lines[1]).toBe('') // 空行
    expect(lines[2]).toBe('/home/user:')
  })

  it('未知フラグはエラー + Try --help 案内', () => {
    const r = ls(['-Z'], defaultContext(), vfs)
    expect(r.exitCode).toBe(2)
    expect(r.stderr).toContain("invalid option -- 'Z'")
    expect(r.stderr).toContain("Try 'ls --help'")
  })

  it('-- 以降はフラグとして扱わない', () => {
    vfs.writeFile('/home/user/-l', 'x')
    const r = ls(['--', '-l'], defaultContext('/home/user'), vfs)
    expect(r.exitCode).toBe(0)
    expect(r.stdout).toBe('-l\n')
  })

  describe('長フラグ (GNU 互換)', () => {
    it('--all は -a と同じ挙動', () => {
      vfs.writeFile('/home/user/.dotfile', 'x')
      const a = ls(['-a'], defaultContext('/home/user'), vfs).stdout
      const longA = ls(['--all'], defaultContext('/home/user'), vfs).stdout
      expect(longA).toBe(a)
    })

    it('--long は -l と同じ挙動', () => {
      const short = ls(['-l'], defaultContext('/home/user'), vfs).stdout
      const long = ls(['--long'], defaultContext('/home/user'), vfs).stdout
      expect(long).toBe(short)
    })

    it('--almost-all は -A と同じ挙動', () => {
      vfs.writeFile('/home/user/.dotfile', 'x')
      const short = ls(['-A'], defaultContext('/home/user'), vfs).stdout
      const long = ls(['--almost-all'], defaultContext('/home/user'), vfs).stdout
      expect(long).toBe(short)
    })

    it('未知の長フラグはエラー (unrecognized option)', () => {
      const r = ls(['--nope'], defaultContext(), vfs)
      expect(r.exitCode).toBe(2)
      expect(r.stderr).toContain("unrecognized option '--nope'")
    })
  })
})
