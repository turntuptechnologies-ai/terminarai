import { describe, expect, it } from 'vitest'
import { hasNestedRepetition, MAX_PATTERN_LENGTH, starHeight } from './regex-safety'

describe('starHeight', () => {
  it('繰り返しなしは 0', () => {
    expect(starHeight('abc')).toBe(0)
    expect(starHeight('^ERROR$')).toBe(0)
    expect(starHeight('colou?r')).toBe(0)
    expect(starHeight('a{2,5}')).toBe(0)
  })

  it('単独の無限 repetition は 1', () => {
    expect(starHeight('a*')).toBe(1)
    expect(starHeight('a+')).toBe(1)
    expect(starHeight('.+')).toBe(1)
    expect(starHeight('a{2,}')).toBe(1)
    expect(starHeight('(ab)+')).toBe(1)
    expect(starHeight('(?:ab)+')).toBe(1)
    expect(starHeight('[a-z]*')).toBe(1)
    expect(starHeight('a*?')).toBe(1) // lazy 修飾は二重に数えない
    expect(starHeight('(a+)(b+)')).toBe(1) // 並列はネストではない
    expect(starHeight('(a+)?')).toBe(1) // `?` は繰り返しを増やさない
    expect(starHeight('line\\d+')).toBe(1)
  })

  it('ネストした無限 repetition は 2 以上', () => {
    expect(starHeight('(a+)+')).toBe(2)
    expect(starHeight('(a*)*')).toBe(2)
    expect(starHeight('(a+)*')).toBe(2)
    expect(starHeight('(.*)*')).toBe(2)
    expect(starHeight('(a{2,})+')).toBe(2)
    expect(starHeight('((a+)b)*')).toBe(2)
    expect(starHeight('(a+|b)*')).toBe(2)
    expect(starHeight('(?:a+)+')).toBe(2)
    expect(starHeight('((a+)+)+')).toBe(3)
  })

  it('エスケープ・文字クラス内の量指定子記号は無視する', () => {
    expect(starHeight('a\\+b\\*')).toBe(0)
    expect(starHeight('[+*]')).toBe(0)
    expect(starHeight('[a+]*')).toBe(1)
    // literal 括弧はグループではないので、最後の + は `\)` 1 文字にだけ掛かる
    expect(starHeight('\\(a+\\)+')).toBe(1)
  })

  it('literal の波括弧は量指定子として数えない', () => {
    expect(starHeight('{hello}')).toBe(0)
    expect(starHeight('a{,2}')).toBe(0) // JS では literal
  })

  it('不正なパターンでも throw しない', () => {
    expect(() => starHeight('(a')).not.toThrow()
    expect(() => starHeight('a)')).not.toThrow()
    expect(() => starHeight('[a')).not.toThrow()
    expect(() => starHeight('*')).not.toThrow()
  })
})

describe('hasNestedRepetition', () => {
  it('破滅的になりうるパターンだけを true にする', () => {
    expect(hasNestedRepetition('(a+)+')).toBe(true)
    expect(hasNestedRepetition('ERROR')).toBe(false)
    expect(hasNestedRepetition('^line\\d+$')).toBe(false)
  })
})

describe('MAX_PATTERN_LENGTH', () => {
  it('学習用途に十分な長さがある', () => {
    expect(MAX_PATTERN_LENGTH).toBeGreaterThanOrEqual(100)
  })
})
