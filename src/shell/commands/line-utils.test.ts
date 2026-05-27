import { describe, expect, it } from 'vitest'
import { extractLines } from './line-utils'

describe('extractLines (head/tail 共通)', () => {
  const lines5 = 'a\nb\nc\nd\ne\n'
  const lines5NoTrailing = 'a\nb\nc\nd\ne'

  describe('head', () => {
    it('先頭 3 行', () => {
      expect(extractLines(lines5, 3, 'head')).toBe('a\nb\nc\n')
    })

    it('n が行数を超えても全行', () => {
      expect(extractLines(lines5, 100, 'head')).toBe('a\nb\nc\nd\ne\n')
    })

    it('n=0 は空文字', () => {
      expect(extractLines(lines5, 0, 'head')).toBe('')
    })

    it('空文字 input は空文字', () => {
      expect(extractLines('', 5, 'head')).toBe('')
    })

    it('末尾改行なしも揃える', () => {
      expect(extractLines(lines5NoTrailing, 2, 'head')).toBe('a\nb\n')
    })
  })

  describe('tail', () => {
    it('末尾 3 行', () => {
      expect(extractLines(lines5, 3, 'tail')).toBe('c\nd\ne\n')
    })

    it('n が行数を超えても全行', () => {
      expect(extractLines(lines5, 100, 'tail')).toBe('a\nb\nc\nd\ne\n')
    })

    it('n=0 は空文字', () => {
      expect(extractLines(lines5, 0, 'tail')).toBe('')
    })

    it('末尾改行なしも揃える', () => {
      expect(extractLines(lines5NoTrailing, 2, 'tail')).toBe('d\ne\n')
    })
  })

  it('1 行のみのファイル', () => {
    expect(extractLines('hello\n', 10, 'head')).toBe('hello\n')
    expect(extractLines('hello\n', 10, 'tail')).toBe('hello\n')
  })

  it('改行のみの空行', () => {
    // "\n" → split = ['', ''] → trailingNewline で前を取る → ['']
    expect(extractLines('\n', 10, 'head')).toBe('\n')
  })
})
