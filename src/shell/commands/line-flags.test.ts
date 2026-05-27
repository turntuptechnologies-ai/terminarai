import { describe, expect, it } from 'vitest'
import { parseLineCount } from './line-flags'

describe('parseLineCount', () => {
  it('引数なしは既定 N=10 + 空 positional', () => {
    const r = parseLineCount([])
    expect(r).toEqual({ ok: true, n: 10, positional: [] })
  })

  it('positional のみは N=10', () => {
    const r = parseLineCount(['a.txt', 'b.txt'])
    expect(r).toEqual({ ok: true, n: 10, positional: ['a.txt', 'b.txt'] })
  })

  it('-n 5 (空白区切り)', () => {
    const r = parseLineCount(['-n', '5', 'log.txt'])
    if (!r.ok) throw new Error('expected ok')
    expect(r.n).toBe(5)
    expect(r.positional).toEqual(['log.txt'])
  })

  it('-n5 (連結)', () => {
    const r = parseLineCount(['-n5', 'log.txt'])
    if (!r.ok) throw new Error('expected ok')
    expect(r.n).toBe(5)
    expect(r.positional).toEqual(['log.txt'])
  })

  it('-5 (GNU 短縮)', () => {
    const r = parseLineCount(['-5', 'log.txt'])
    if (!r.ok) throw new Error('expected ok')
    expect(r.n).toBe(5)
    expect(r.positional).toEqual(['log.txt'])
  })

  it('--lines=5', () => {
    const r = parseLineCount(['--lines=5', 'log.txt'])
    if (!r.ok) throw new Error('expected ok')
    expect(r.n).toBe(5)
    expect(r.positional).toEqual(['log.txt'])
  })

  it('-n 0 は許容 (出力 0 行)', () => {
    const r = parseLineCount(['-n', '0', 'log.txt'])
    if (!r.ok) throw new Error('expected ok')
    expect(r.n).toBe(0)
  })

  it('-n 値なしはエラー', () => {
    const r = parseLineCount(['-n'])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain('requires an argument')
  })

  it('-n 非数値はエラー', () => {
    const r = parseLineCount(['-n', 'abc'])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain('abc')
  })

  it('-n 負数はエラー', () => {
    const r = parseLineCount(['-n', '-1'])
    // -1 は数値オンリーパターンに該当しない → invalid number of lines
    expect(r.ok).toBe(false)
  })

  it('--lines= が空はエラー', () => {
    const r = parseLineCount(['--lines='])
    expect(r.ok).toBe(false)
  })

  it('未知の短フラグはエラー', () => {
    const r = parseLineCount(['-x', 'log.txt'])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain('-x')
  })

  it('-- 以降は positional', () => {
    const r = parseLineCount(['-n', '3', '--', '-weird-name.txt'])
    if (!r.ok) throw new Error('expected ok')
    expect(r.n).toBe(3)
    expect(r.positional).toEqual(['-weird-name.txt'])
  })

  it('単独 - は positional として通す', () => {
    const r = parseLineCount(['-'])
    if (!r.ok) throw new Error('expected ok')
    expect(r.positional).toEqual(['-'])
  })

  it('既定 N は引数で変更可能', () => {
    const r = parseLineCount([], 5)
    if (!r.ok) throw new Error('expected ok')
    expect(r.n).toBe(5)
  })

  it('複数の行数指定は最後勝ち', () => {
    const r = parseLineCount(['-n', '3', '-5', 'log.txt'])
    if (!r.ok) throw new Error('expected ok')
    expect(r.n).toBe(5)
  })
})
