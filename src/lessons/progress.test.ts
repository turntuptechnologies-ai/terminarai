import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { clearProgress, loadAllProgress, loadProgress, saveProgress } from './progress'

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
