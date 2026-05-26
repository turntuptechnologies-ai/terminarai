import type { Chapter, Lesson } from './types'

/**
 * 登録済みの全チャプタ。実コンテンツは Issue #7 以降で追加される。
 * 現状は空配列で、レッスンエンジンの土台のみが利用可能。
 */
export const CHAPTERS: Chapter[] = []

export function findLesson(chapterId: string, lessonId: string): Lesson | undefined {
  const chapter = CHAPTERS.find((c) => c.id === chapterId)
  if (!chapter) return undefined
  return chapter.lessons.find((l) => l.id === lessonId)
}

export function findChapter(chapterId: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === chapterId)
}
