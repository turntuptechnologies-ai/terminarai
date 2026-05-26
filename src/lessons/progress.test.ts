import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  clearProgress,
  computeChapterProgress,
  loadAllProgress,
  loadProgress,
  saveProgress,
} from './progress'
import type { Chapter } from './types'

const STORAGE_PREFIX = 'terminarai:progress:'

describe('progress (localStorage)', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('未保存なら null', () => {
    expect(loadProgress('1', '1-1')).toBeNull()
  })

  it('save → load で取得できる', () => {
    saveProgress('1', '1-1', { completedSteps: 2, completed: false, updatedAt: 100 })
    expect(loadProgress('1', '1-1')).toEqual({
      completedSteps: 2,
      completed: false,
      updatedAt: 100,
    })
  })

  it('save は completedSteps をモノトニックに保つ (後退しない)', () => {
    saveProgress('1', '1-1', { completedSteps: 5, completed: true, updatedAt: 100 })
    saveProgress('1', '1-1', { completedSteps: 2, completed: false, updatedAt: 200 })
    const p = loadProgress('1', '1-1')
    expect(p?.completedSteps).toBe(5)
    // completed は OR 累積、一度 true になったら戻らない
    expect(p?.completed).toBe(true)
  })

  it('clearProgress で削除される', () => {
    saveProgress('1', '1-1', { completedSteps: 1, completed: false, updatedAt: 100 })
    clearProgress('1', '1-1')
    expect(loadProgress('1', '1-1')).toBeNull()
  })

  it('壊れた JSON は null 扱い', () => {
    window.localStorage.setItem(`${STORAGE_PREFIX}1/1-1`, 'not json')
    expect(loadProgress('1', '1-1')).toBeNull()
  })

  it('不正な構造は null 扱い', () => {
    window.localStorage.setItem(`${STORAGE_PREFIX}1/1-1`, JSON.stringify({ foo: 'bar' }))
    expect(loadProgress('1', '1-1')).toBeNull()
  })

  it('別チャプタの同じ lessonId は衝突しない', () => {
    saveProgress('1', 'intro', { completedSteps: 1, completed: false, updatedAt: 100 })
    saveProgress('2', 'intro', { completedSteps: 3, completed: true, updatedAt: 200 })
    expect(loadProgress('1', 'intro')?.completedSteps).toBe(1)
    expect(loadProgress('2', 'intro')?.completed).toBe(true)
  })

  it('loadAllProgress で複数の進捗をまとめて取得', () => {
    saveProgress('1', '1-1', { completedSteps: 1, completed: false, updatedAt: 100 })
    saveProgress('1', '1-2', { completedSteps: 3, completed: true, updatedAt: 200 })
    window.localStorage.setItem('other-app:foo', 'bar')

    const all = loadAllProgress()
    expect(Object.keys(all).sort()).toEqual(['1/1-1', '1/1-2'])
    expect(all['1/1-2'].completed).toBe(true)
  })
})

describe('computeChapterProgress', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  const chapter: Chapter = {
    id: '1',
    title: 'テスト章',
    description: '',
    lessons: [
      { id: '1-1', chapterId: '1', title: 'a', description: '', steps: [] },
      { id: '1-2', chapterId: '1', title: 'b', description: '', steps: [] },
      { id: '1-3', chapterId: '1', title: 'c', description: '', steps: [] },
    ],
  }

  it('全く未着手なら untouched', () => {
    const p = computeChapterProgress(chapter)
    expect(p).toEqual({ total: 3, completed: 0, inProgress: 0, status: 'untouched' })
  })

  it('1 つでも進行中なら in-progress', () => {
    saveProgress('1', '1-1', { completedSteps: 1, completed: false, updatedAt: 100 })
    const p = computeChapterProgress(chapter)
    expect(p.status).toBe('in-progress')
    expect(p.inProgress).toBe(1)
    expect(p.completed).toBe(0)
  })

  it('1 つでも完了なら in-progress (全部終わるまでは)', () => {
    saveProgress('1', '1-1', { completedSteps: 2, completed: true, updatedAt: 100 })
    const p = computeChapterProgress(chapter)
    expect(p.status).toBe('in-progress')
    expect(p.completed).toBe(1)
  })

  it('全レッスン完了で completed', () => {
    saveProgress('1', '1-1', { completedSteps: 1, completed: true, updatedAt: 100 })
    saveProgress('1', '1-2', { completedSteps: 1, completed: true, updatedAt: 100 })
    saveProgress('1', '1-3', { completedSteps: 1, completed: true, updatedAt: 100 })
    const p = computeChapterProgress(chapter)
    expect(p).toEqual({ total: 3, completed: 3, inProgress: 0, status: 'completed' })
  })

  it('レッスン 0 件の章は untouched', () => {
    const empty: Chapter = { id: '99', title: 'empty', description: '', lessons: [] }
    expect(computeChapterProgress(empty).status).toBe('untouched')
  })
})
