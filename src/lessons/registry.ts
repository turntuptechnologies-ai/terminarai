import { CHAPTER_1 } from './content/chapter1'
import { CHAPTER_2 } from './content/chapter2'
import type { Chapter, Lesson } from './types'

/** 登録済みの全チャプタ。新しい章はここに追加していく。 */
export const CHAPTERS: Chapter[] = [CHAPTER_1, CHAPTER_2]

export function findLesson(chapterId: string, lessonId: string): Lesson | undefined {
  const chapter = CHAPTERS.find((c) => c.id === chapterId)
  if (!chapter) return undefined
  return chapter.lessons.find((l) => l.id === lessonId)
}

export function findChapter(chapterId: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === chapterId)
}
