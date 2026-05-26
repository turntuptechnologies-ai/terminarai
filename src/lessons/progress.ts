import type { LessonProgress } from './types'

const STORAGE_PREFIX = 'terminarai:progress:'

function storageKey(chapterId: string, lessonId: string): string {
  return `${STORAGE_PREFIX}${chapterId}/${lessonId}`
}

function safeStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** 単一レッスンの進捗を取得。未保存・壊れたデータは null。 */
export function loadProgress(chapterId: string, lessonId: string): LessonProgress | null {
  const storage = safeStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(storageKey(chapterId, lessonId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!isValidProgress(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

/**
 * 進捗を保存する。既存値とマージし、`completedSteps` は単調増加、
 * `completed` は OR 累積。これにより「完了済みレッスンを途中までやり直しても
 * 進捗が後退しない」ことを保証する。
 */
export function saveProgress(chapterId: string, lessonId: string, progress: LessonProgress): void {
  const storage = safeStorage()
  if (!storage) return
  const existing = loadProgress(chapterId, lessonId)
  const merged: LessonProgress = existing
    ? {
        completedSteps: Math.max(existing.completedSteps, progress.completedSteps),
        completed: existing.completed || progress.completed,
        updatedAt: progress.updatedAt,
      }
    : progress
  try {
    storage.setItem(storageKey(chapterId, lessonId), JSON.stringify(merged))
  } catch {
    // QuotaExceeded 等は黙ってスキップ
  }
}

export function clearProgress(chapterId: string, lessonId: string): void {
  const storage = safeStorage()
  if (!storage) return
  try {
    storage.removeItem(storageKey(chapterId, lessonId))
  } catch {
    // ignore
  }
}

/** 全レッスンの進捗を取得 (一覧ページ用)。キーは `${chapterId}/${lessonId}`。 */
export function loadAllProgress(): Record<string, LessonProgress> {
  const storage = safeStorage()
  if (!storage) return {}
  const out: Record<string, LessonProgress> = {}
  try {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (!key?.startsWith(STORAGE_PREFIX)) continue
      const composite = key.slice(STORAGE_PREFIX.length)
      const slashIdx = composite.indexOf('/')
      if (slashIdx === -1) continue
      const chapterId = composite.slice(0, slashIdx)
      const lessonId = composite.slice(slashIdx + 1)
      const p = loadProgress(chapterId, lessonId)
      if (p) out[composite] = p
    }
  } catch {
    // ignore
  }
  return out
}

function isValidProgress(value: unknown): value is LessonProgress {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.completedSteps === 'number' &&
    typeof v.completed === 'boolean' &&
    typeof v.updatedAt === 'number'
  )
}
