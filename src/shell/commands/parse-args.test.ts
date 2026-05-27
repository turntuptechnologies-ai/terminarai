import { describe, expect, it } from 'vitest'
import { invalidOptionError, parseArgs } from './parse-args'

describe('parseArgs', () => {
  it('引数なしは空フラグ・空 positional', () => {
    const r = parseArgs([], { short: 'la' })
    expect(r).toEqual({ ok: true, flags: new Set(), positional: [] })
  })

  it('単独短フラグ', () => {
    const r = parseArgs(['-l'], { short: 'la' })
    if (!r.ok) throw new Error('expected ok')
    expect([...r.flags]).toEqual(['l'])
    expect(r.positional).toEqual([])
  })

  it('クラスタ短フラグ -la', () => {
    const r = parseArgs(['-la'], { short: 'la' })
    if (!r.ok) throw new Error('expected ok')
    expect([...r.flags].sort()).toEqual(['a', 'l'])
  })

  it('positional と混在', () => {
    const r = parseArgs(['-l', 'foo', '-a', 'bar'], { short: 'la' })
    if (!r.ok) throw new Error('expected ok')
    expect([...r.flags].sort()).toEqual(['a', 'l'])
    expect(r.positional).toEqual(['foo', 'bar'])
  })

  it('-- 以降は positional', () => {
    const r = parseArgs(['-l', '--', '-a', 'foo'], { short: 'la' })
    if (!r.ok) throw new Error('expected ok')
    expect([...r.flags]).toEqual(['l'])
    expect(r.positional).toEqual(['-a', 'foo'])
  })

  it('未知短フラグでエラー (最初に見つかったもの)', () => {
    const r = parseArgs(['-lZ'], { short: 'la' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.invalidFlag).toBe('Z')
  })

  it('単独 - (dash) は positional', () => {
    const r = parseArgs(['-'], { short: 'la' })
    if (!r.ok) throw new Error('expected ok')
    expect(r.positional).toEqual(['-'])
  })

  describe('長フラグ (longAliases)', () => {
    it('--all → エイリアス先の短フラグになる', () => {
      const r = parseArgs(['--all'], { short: 'la', longAliases: { all: 'a' } })
      if (!r.ok) throw new Error('expected ok')
      expect([...r.flags]).toEqual(['a'])
    })

    it('短形と長形の混合 -l --all', () => {
      const r = parseArgs(['-l', '--all'], { short: 'la', longAliases: { all: 'a' } })
      if (!r.ok) throw new Error('expected ok')
      expect([...r.flags].sort()).toEqual(['a', 'l'])
    })

    it('未知の長フラグはエラー (isLong=true)', () => {
      const r = parseArgs(['--nope'], { short: 'la', longAliases: { all: 'a' } })
      if (r.ok) throw new Error('expected error')
      expect(r.invalidFlag).toBe('nope')
      expect(r.isLong).toBe(true)
    })

    it('--name=value 形は未対応として拒否', () => {
      const r = parseArgs(['--lines=5'], { short: 'n', longAliases: { lines: 'n' } })
      if (r.ok) throw new Error('expected error')
      expect(r.invalidFlag).toBe('lines')
      expect(r.isLong).toBe(true)
    })

    it('-- は長フラグの開始ではなく区切りとして扱われる', () => {
      const r = parseArgs(['--', '--all'], { short: 'a', longAliases: { all: 'a' } })
      if (!r.ok) throw new Error('expected ok')
      expect([...r.flags]).toEqual([])
      expect(r.positional).toEqual(['--all'])
    })
  })
})

describe('invalidOptionError', () => {
  it('短フラグ: GNU 風メッセージ + Try help 案内', () => {
    expect(invalidOptionError('ls', 'Z')).toBe(
      "ls: invalid option -- 'Z'\nTry 'ls --help' for more information.\n",
    )
  })

  it('長フラグ: unrecognized option 形式', () => {
    expect(invalidOptionError('ls', 'nope', true)).toBe(
      "ls: unrecognized option '--nope'\nTry 'ls --help' for more information.\n",
    )
  })
})
