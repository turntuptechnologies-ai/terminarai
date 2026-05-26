import type { LessonProgress } from './types'

const STORAGE_PREFIX = 'terminarai:progress:'

function storageKey(lessonId: string): string {
  return `${STORAGE_PREFIX}${lessonId}`
}

/** 単一レッスンの進捗を取得。未保存なら null。 */
export function loadProgress(lessonId: string): LessonProgress | null {
  if (typeof window === 'undefined' || !window.localStorage) return null
  try {
    const raw = window.localStorage.getItem(storageKey(lessonId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!isValidProgress(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

export function saveProgress(lessonId: string, progress: LessonProgress): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    window.localStorage.setItem(storageKey(lessonId), JSON.stringify(progress))
  } catch {
    // QuotaExceeded 等は黙ってスキップ (学習進捗が消えても致命ではない)
  }
}

export function clearProgress(lessonId: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    window.localStorage.removeItem(storageKey(lessonId))
  } catch {
    // ignore
  }
}

/** localStorage 内の全レッスン進捗を取得 (一覧ページ用)。 */
export function loadAllProgress(): Record<string, LessonProgress> {
  if (typeof window === 'undefined' || !window.localStorage) return {}
  const out: Record<string, LessonProgress> = {}
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (!key?.startsWith(STORAGE_PREFIX)) continue
      const lessonId = key.slice(STORAGE_PREFIX.length)
      const p = loadProgress(lessonId)
      if (p) out[lessonId] = p
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
