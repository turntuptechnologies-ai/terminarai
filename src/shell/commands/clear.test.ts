import { describe, expect, it } from 'vitest'
import { createDefaultVfs } from '../../vfs'
import { defaultContext } from '../types'
import { clear } from './clear'

describe('clear', () => {
  const vfs = createDefaultVfs()

  it('clearScreen=true、stdout / stderr は空、exitCode 0', () => {
    const r = clear([], defaultContext(), vfs)
    expect(r.clearScreen).toBe(true)
    expect(r.stdout).toBe('')
    expect(r.stderr).toBe('')
    expect(r.exitCode).toBe(0)
  })

  it('引数があっても無視 (副作用は変わらない)', () => {
    const r = clear(['extra', 'args'], defaultContext(), vfs)
    expect(r.clearScreen).toBe(true)
    expect(r.exitCode).toBe(0)
  })
})
