import type { Chapter, LessonProgress } from './types'

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
    // QuotaExceededError (容量超過) や SecurityError (プライベート閲覧モード) を黙って無視する。
    // 進捗保存はベストエフォートで、失敗してもセッション内の学習体験 (在メモリの state) は
    // 維持される。ユーザに警告を出すほどの実害はなく、復旧手段もないため silent fail とする。
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

export type ChapterStatus = 'untouched' | 'in-progress' | 'completed'

export interface ChapterProgress {
  total: number
  /** completed: true のレッスン数 */
  completed: number
  /** completed ではないが進行中のレッスン数 */
  inProgress: number
  status: ChapterStatus
}

/**
 * 章全体の進捗を集計する。一覧ページのバッジ表示用。
 *
 * - 全レッスン完了 → 'completed'
 * - 1 つでも完了 or 進行中 → 'in-progress'
 * - 全部未着手 → 'untouched'
 */
export function computeChapterProgress(chapter: Chapter): ChapterProgress {
  let completed = 0
  let inProgress = 0
  for (const lesson of chapter.lessons) {
    const p = loadProgress(chapter.id, lesson.id)
    if (p?.completed) {
      completed++
    } else if (p && p.completedSteps > 0) {
      inProgress++
    }
  }
  const total = chapter.lessons.length
  const status: ChapterStatus =
    total > 0 && completed === total
      ? 'completed'
      : completed > 0 || inProgress > 0
        ? 'in-progress'
        : 'untouched'
  return { total, completed, inProgress, status }
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
