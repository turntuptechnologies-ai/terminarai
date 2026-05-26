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
    expect(loadProgress('1-1')).toBeNull()
  })

  it('save → load で取得できる', () => {
    saveProgress('1-1', { completedSteps: 2, completed: false, updatedAt: 100 })
    expect(loadProgress('1-1')).toEqual({
      completedSteps: 2,
      completed: false,
      updatedAt: 100,
    })
  })

  it('save で上書きされる', () => {
    saveProgress('1-1', { completedSteps: 1, completed: false, updatedAt: 100 })
    saveProgress('1-1', { completedSteps: 5, completed: true, updatedAt: 200 })
    expect(loadProgress('1-1')?.completedSteps).toBe(5)
  })

  it('clearProgress で削除される', () => {
    saveProgress('1-1', { completedSteps: 1, completed: false, updatedAt: 100 })
    clearProgress('1-1')
    expect(loadProgress('1-1')).toBeNull()
  })

  it('壊れた JSON は null 扱い', () => {
    window.localStorage.setItem(`${STORAGE_PREFIX}1-1`, 'not json')
    expect(loadProgress('1-1')).toBeNull()
  })

  it('不正な構造は null 扱い', () => {
    window.localStorage.setItem(`${STORAGE_PREFIX}1-1`, JSON.stringify({ foo: 'bar' }))
    expect(loadProgress('1-1')).toBeNull()
  })

  it('loadAllProgress で複数の進捗をまとめて取得', () => {
    saveProgress('1-1', { completedSteps: 1, completed: false, updatedAt: 100 })
    saveProgress('1-2', { completedSteps: 3, completed: true, updatedAt: 200 })
    // 関係ない localStorage キーは無視される
    window.localStorage.setItem('other-app:foo', 'bar')

    const all = loadAllProgress()
    expect(Object.keys(all).sort()).toEqual(['1-1', '1-2'])
    expect(all['1-2'].completed).toBe(true)
  })
})
