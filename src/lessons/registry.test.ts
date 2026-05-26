import { describe, expect, it } from 'vitest'
import { CHAPTERS, findChapter, findLesson } from './registry'

describe('registry', () => {
  it('CHAPTERS に第1章が登録されている', () => {
    expect(CHAPTERS.length).toBeGreaterThan(0)
    expect(CHAPTERS[0].id).toBe('1')
  })

  it('findChapter で第1章を取得できる', () => {
    expect(findChapter('1')?.title).toBe('ファイルシステムを覗く')
  })

  it('findLesson でレッスン 1-1 を取得できる', () => {
    expect(findLesson('1', '1-1')?.id).toBe('1-1')
  })

  it('存在しない章は undefined', () => {
    expect(findChapter('nope')).toBeUndefined()
  })

  it('存在しないレッスンは undefined', () => {
    expect(findLesson('1', 'nope')).toBeUndefined()
  })

  it('全レッスン ID がアプリ全体でユニーク (chapterId/lessonId の組合せ)', () => {
    const keys = new Set<string>()
    for (const ch of CHAPTERS) {
      for (const lesson of ch.lessons) {
        const key = `${ch.id}/${lesson.id}`
        expect(keys.has(key), `${key} が重複`).toBe(false)
        keys.add(key)
      }
    }
  })
})
