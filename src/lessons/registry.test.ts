import { describe, expect, it } from 'vitest'
import { CHAPTERS, findChapter, findLesson, findNextLesson } from './registry'

describe('registry', () => {
  it('CHAPTERS に第1章 / 第2章 / 第3章が登録されている', () => {
    expect(CHAPTERS.length).toBeGreaterThanOrEqual(3)
    expect(CHAPTERS.map((c) => c.id)).toContain('1')
    expect(CHAPTERS.map((c) => c.id)).toContain('2')
    expect(CHAPTERS.map((c) => c.id)).toContain('3')
  })

  it('findChapter で第1章を取得できる', () => {
    expect(findChapter('1')?.title).toBe('ファイルシステムを覗く')
  })

  it('findChapter で第2章を取得できる', () => {
    expect(findChapter('2')?.title).toBe('ファイルの中身を扱う')
  })

  it('findChapter で第3章を取得できる', () => {
    expect(findChapter('3')?.title).toBe('ファイルとディレクトリを管理する')
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

  describe('findNextLesson', () => {
    it('同じ章の次のレッスンを返す', () => {
      const next = findNextLesson('1', '1-1')
      expect(next?.id).toBe('1-2')
      expect(next?.chapterId).toBe('1')
    })

    it('章の最後なら次の章の最初のレッスンを返す', () => {
      const next = findNextLesson('1', '1-5')
      expect(next?.id).toBe('2-1')
      expect(next?.chapterId).toBe('2')
      // 2-5 → 3-1 も同様
      const next2 = findNextLesson('2', '2-5')
      expect(next2?.id).toBe('3-1')
      expect(next2?.chapterId).toBe('3')
    })

    it('全章の最後なら undefined', () => {
      // CHAPTERS の最後の章の最後のレッスンを基準にする
      const lastChapter = CHAPTERS[CHAPTERS.length - 1]
      const lastLesson = lastChapter.lessons[lastChapter.lessons.length - 1]
      expect(findNextLesson(lastChapter.id, lastLesson.id)).toBeUndefined()
    })

    it('存在しない章は undefined', () => {
      expect(findNextLesson('nope', '1-1')).toBeUndefined()
    })

    it('存在しないレッスンは undefined', () => {
      expect(findNextLesson('1', 'nope')).toBeUndefined()
    })
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

  it('全レッスンの id は chapterId プレフィクス付き (規約 "1-1", "2-3" 等)', () => {
    // Lesson 型 JSDoc に「<chapter>-<n> 形式を推奨」と書かれている規約をテストで enforce。
    // 規約から外れたレッスン id が混入すると URL や進捗キーの可読性が下がるため。
    for (const ch of CHAPTERS) {
      for (const lesson of ch.lessons) {
        expect(
          lesson.id.startsWith(`${ch.id}-`),
          `${lesson.id} は chapter "${ch.id}" の "${ch.id}-" プレフィクスを持つ必要がある`,
        ).toBe(true)
        // chapterId フィールドも一致していること
        expect(lesson.chapterId, `${lesson.id} の chapterId 不一致`).toBe(ch.id)
      }
    }
  })
})
