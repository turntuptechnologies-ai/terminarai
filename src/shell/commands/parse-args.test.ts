import { describe, expect, it } from 'vitest'
import { invalidOptionError, parseShortFlags } from './parse-args'

describe('parseShortFlags', () => {
  it('引数なしは空フラグ・空 positional', () => {
    const r = parseShortFlags([], 'la')
    expect(r).toEqual({ ok: true, flags: new Set(), positional: [] })
  })

  it('単独フラグ', () => {
    const r = parseShortFlags(['-l'], 'la')
    if (!r.ok) throw new Error('expected ok')
    expect([...r.flags]).toEqual(['l'])
    expect(r.positional).toEqual([])
  })

  it('クラスタフラグ -la', () => {
    const r = parseShortFlags(['-la'], 'la')
    if (!r.ok) throw new Error('expected ok')
    expect([...r.flags].sort()).toEqual(['a', 'l'])
  })

  it('positional と混在', () => {
    const r = parseShortFlags(['-l', 'foo', '-a', 'bar'], 'la')
    if (!r.ok) throw new Error('expected ok')
    expect([...r.flags].sort()).toEqual(['a', 'l'])
    expect(r.positional).toEqual(['foo', 'bar'])
  })

  it('-- 以降は positional', () => {
    const r = parseShortFlags(['-l', '--', '-a', 'foo'], 'la')
    if (!r.ok) throw new Error('expected ok')
    expect([...r.flags]).toEqual(['l'])
    expect(r.positional).toEqual(['-a', 'foo'])
  })

  it('未知フラグでエラー (最初に見つかったものを返す)', () => {
    const r = parseShortFlags(['-lZ'], 'la')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.invalidFlag).toBe('Z')
  })

  it('単独 - (dash) は positional', () => {
    const r = parseShortFlags(['-'], 'la')
    if (!r.ok) throw new Error('expected ok')
    expect(r.positional).toEqual(['-'])
  })
})

describe('invalidOptionError', () => {
  it('GNU 風メッセージ + Try help 案内', () => {
    expect(invalidOptionError('ls', 'Z')).toBe(
      "ls: invalid option -- 'Z'\nTry 'ls --help' for more information.\n",
    )
  })
})
