import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultVfs, type Vfs } from '../../vfs'
import { defaultContext } from '../types'
import { cd } from './cd'

describe('cd', () => {
  let vfs: Vfs

  beforeEach(() => {
    vfs = createDefaultVfs()
  })

  it('引数なしでホームへ', () => {
    const r = cd([], defaultContext('/tmp'), vfs)
    expect(r.exitCode).toBe(0)
    expect(r.cwdAfter).toBe('/home/user')
  })

  it('~ でホームへ', () => {
    const r = cd(['~'], defaultContext('/tmp'), vfs)
    expect(r.cwdAfter).toBe('/home/user')
  })

  it('~/path で home 配下へ', () => {
    const r = cd(['~/docs'], defaultContext('/tmp'), vfs)
    expect(r.cwdAfter).toBe('/home/user/docs')
  })

  it('絶対パスへ移動', () => {
    const r = cd(['/etc'], defaultContext('/home/user'), vfs)
    expect(r.cwdAfter).toBe('/etc')
  })

  it('相対パスで移動', () => {
    const r = cd(['docs'], defaultContext('/home/user'), vfs)
    expect(r.cwdAfter).toBe('/home/user/docs')
  })

  it('../ で親へ', () => {
    const r = cd(['..'], defaultContext('/home/user'), vfs)
    expect(r.cwdAfter).toBe('/home')
  })

  it('存在しないディレクトリは exitCode 1', () => {
    const r = cd(['/nope'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('cd: /nope:')
    expect(r.stderr).toContain('No such file or directory')
    expect(r.cwdAfter).toBeUndefined()
  })

  it('ファイルを指定すると Not a directory', () => {
    const r = cd(['/home/user/README.txt'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('Not a directory')
  })

  it('引数が多すぎるとエラー', () => {
    const r = cd(['a', 'b'], defaultContext(), vfs)
    expect(r.exitCode).toBe(2)
    expect(r.stderr).toContain('too many arguments')
  })

  it('cd - で OLDPWD 未設定なら "OLDPWD not set" エラー', () => {
    const r = cd(['-'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('OLDPWD not set')
  })

  it('cd - で OLDPWD が設定されていればそこへ戻る + stdout に表示', () => {
    const ctx = {
      cwd: '/home/user',
      env: { HOME: '/home/user', USER: 'user', PWD: '/home/user', OLDPWD: '/tmp' },
    }
    const r = cd(['-'], ctx, vfs)
    expect(r.exitCode).toBe(0)
    expect(r.cwdAfter).toBe('/tmp')
    expect(r.stdout).toBe('/tmp\n')
  })

  it('cd / でルートへ移動', () => {
    const r = cd(['/'], defaultContext('/home/user'), vfs)
    expect(r.cwdAfter).toBe('/')
  })

  it('cd . で現在地そのまま', () => {
    const r = cd(['.'], defaultContext('/home/user'), vfs)
    expect(r.cwdAfter).toBe('/home/user')
  })

  it('cd ../.. はルートで止まる', () => {
    const r = cd(['../..'], defaultContext('/'), vfs)
    expect(r.cwdAfter).toBe('/')
  })

  it('cd "" (空文字列) は ENOENT (bash 挙動)', () => {
    const r = cd([''], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('No such file or directory')
  })

  it('中間パスがファイル → Not a directory', () => {
    const r = cd(['/home/user/README.txt/sub'], defaultContext(), vfs)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toContain('Not a directory')
  })

  it('env.HOME 欠落時は HOME_PATH にフォールバック', () => {
    const ctxNoHome = { cwd: '/tmp', env: {} }
    const r = cd([], ctxNoHome, vfs)
    expect(r.cwdAfter).toBe('/home/user')
  })
})
