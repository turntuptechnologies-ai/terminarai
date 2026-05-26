import { describe, expect, it } from 'vitest'
import { createDefaultVfs } from '../../vfs'
import { defaultContext } from '../types'
import { pwd } from './pwd'

describe('pwd', () => {
  const vfs = createDefaultVfs()

  it('cwd を出力する', () => {
    const r = pwd([], defaultContext('/home/user'), vfs)
    expect(r.stdout).toBe('/home/user\n')
    expect(r.exitCode).toBe(0)
  })

  it('cwd がルートでも動く', () => {
    const r = pwd([], defaultContext('/'), vfs)
    expect(r.stdout).toBe('/\n')
  })

  it('引数を渡すとエラー', () => {
    const r = pwd(['extra'], defaultContext(), vfs)
    expect(r.exitCode).toBe(2)
    expect(r.stderr).toContain('too many arguments')
  })
})
