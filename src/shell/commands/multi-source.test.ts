import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createDefaultVfs, type Vfs } from '../../vfs'
import { defaultContext } from '../types'
import { lowerFirst, runMultiSourceCommand } from './multi-source'

describe('lowerFirst', () => {
  it('先頭だけを小文字化する', () => {
    expect(lowerFirst('Cannot move')).toBe('cannot move')
    expect(lowerFirst('already lower')).toBe('already lower')
    expect(lowerFirst('')).toBe('')
  })
})

describe('runMultiSourceCommand', () => {
  let vfs: Vfs

  beforeEach(() => {
    vfs = createDefaultVfs()
  })

  it('引数 0 個なら missing file operand エラー', () => {
    const process = vi.fn(() => '')
    const r = runMultiSourceCommand('cp', [], defaultContext(), vfs, process)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toBe("cp: missing file operand\nTry 'cp --help' for more information.\n")
    expect(process).not.toHaveBeenCalled()
  })

  it('引数 1 個なら missing destination file operand エラー', () => {
    const process = vi.fn(() => '')
    const r = runMultiSourceCommand('mv', ['a.txt'], defaultContext(), vfs, process)
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toBe(
      "mv: missing destination file operand after 'a.txt'\nTry 'mv --help' for more information.\n",
    )
    expect(process).not.toHaveBeenCalled()
  })

  it('複数ソース時に宛先がディレクトリでなければエラー', () => {
    const process = vi.fn(() => '')
    const r = runMultiSourceCommand(
      'cp',
      ['a.txt', 'b.txt', 'hello.txt'],
      defaultContext(),
      vfs,
      process,
    )
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toBe("cp: target 'hello.txt' is not a directory\n")
    expect(process).not.toHaveBeenCalled()
  })

  it('各ソースを解決済み絶対パスとともに processSource へ渡す', () => {
    vfs.writeFile('/home/user/a.txt', 'A')
    vfs.writeFile('/home/user/b.txt', 'B')
    const calls: string[][] = []
    const r = runMultiSourceCommand(
      'cp',
      ['a.txt', 'b.txt', 'docs'],
      defaultContext(),
      vfs,
      (source, sourceAbs, dest, destAbs) => {
        calls.push([source, sourceAbs, dest, destAbs])
        return ''
      },
    )
    expect(r.exitCode).toBe(0)
    expect(r.stderr).toBe('')
    expect(calls).toEqual([
      ['a.txt', '/home/user/a.txt', 'docs', '/home/user/docs'],
      ['b.txt', '/home/user/b.txt', 'docs', '/home/user/docs'],
    ])
  })

  it('一部のソースが失敗しても残りを処理し exitCode 1 を返す', () => {
    const r = runMultiSourceCommand(
      'mv',
      ['bad.txt', 'good.txt', 'docs'],
      defaultContext(),
      vfs,
      (source) => (source === 'bad.txt' ? 'mv: boom\n' : ''),
    )
    expect(r.exitCode).toBe(1)
    expect(r.stderr).toBe('mv: boom\n')
  })
})
