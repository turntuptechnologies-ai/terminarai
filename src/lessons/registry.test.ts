import { describe, expect, it } from 'vitest'
import { CHAPTERS, findChapter, findLesson } from './registry'

describe('registry', () => {
  it('CHAPTERS は配列 (空でも OK、#7 で投入)', () => {
    expect(Array.isArray(CHAPTERS)).toBe(true)
  })

  it('存在しない章は undefined', () => {
    expect(findChapter('nope')).toBeUndefined()
  })

  it('存在しないレッスンは undefined', () => {
    expect(findLesson('nope', 'nope')).toBeUndefined()
  })
})
