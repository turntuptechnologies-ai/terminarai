import { describe, expect, it } from 'vitest'
import { createDefaultVfs } from '../../vfs'
import { defaultContext } from '../types'
import { echo } from './echo'

const vfs = createDefaultVfs()

describe('echo', () => {
  it('引数を空白区切りで出力 + 末尾改行', () => {
    const r = echo(['hello', 'world'], defaultContext(), vfs)
    expect(r.stdout).toBe('hello world\n')
    expect(r.exitCode).toBe(0)
  })

  it('引数なしは改行のみ', () => {
    const r = echo([], defaultContext(), vfs)
    expect(r.stdout).toBe('\n')
  })

  it('-n で末尾改行を抑止', () => {
    const r = echo(['-n', 'hello'], defaultContext(), vfs)
    expect(r.stdout).toBe('hello')
  })

  it('-n のみは空文字列', () => {
    const r = echo(['-n'], defaultContext(), vfs)
    expect(r.stdout).toBe('')
  })

  it('-n が先頭以外なら通常の引数として扱う', () => {
    const r = echo(['hello', '-n', 'world'], defaultContext(), vfs)
    expect(r.stdout).toBe('hello -n world\n')
  })

  it('連続する -n は全て吸収される (GNU echo の builtin 互換)', () => {
    const r = echo(['-n', '-n', 'hello'], defaultContext(), vfs)
    expect(r.stdout).toBe('hello')
  })

  it('クォート済みの内部空白は維持される', () => {
    const r = echo(['hello   world'], defaultContext(), vfs)
    expect(r.stdout).toBe('hello   world\n')
  })

  it('-- はそのまま出力 (bash 互換、特別扱いしない)', () => {
    const r = echo(['--', 'foo'], defaultContext(), vfs)
    expect(r.stdout).toBe('-- foo\n')
  })
})
