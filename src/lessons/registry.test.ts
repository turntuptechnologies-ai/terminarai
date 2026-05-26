import { describe, expect, it } from 'vitest'
import { CHAPTERS, findChapter, findLesson } from './registry'

describe('registry', () => {
  it('CHAPTERS に第1章 / 第2章が登録されている', () => {
    expect(CHAPTERS.length).toBeGreaterThanOrEqual(2)
    expect(CHAPTERS.map((c) => c.id)).toContain('1')
    expect(CHAPTERS.map((c) => c.id)).toContain('2')
  })

  it('findChapter で第1章を取得できる', () => {
    expect(findChapter('1')?.title).toBe('ファイルシステムを覗く')
  })

  it('findChapter で第2章を取得できる', () => {
    expect(findChapter('2')?.title).toBe('ファイルの中身を扱う')
  })

  it('findLesson でレッスン 1-1 を取得できる', () => {
    expect(findLesson('1', '1-1')?.id).toBe('1-1')
  })

  it('findLesson でレッスン 2-1 を取得できる', () => {
    expect(findLesson('2', '2-1')?.id).toBe('2-1')
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
