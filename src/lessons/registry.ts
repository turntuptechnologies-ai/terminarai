import { CHAPTER_1 } from './content/chapter1'
import { CHAPTER_2 } from './content/chapter2'
import { CHAPTER_3 } from './content/chapter3'
import { CHAPTER_4 } from './content/chapter4'
import { CHAPTER_5 } from './content/chapter5'
import { CHAPTER_6 } from './content/chapter6'
import { CHAPTER_7 } from './content/chapter7'
import type { Chapter, Lesson } from './types'

/** 登録済みの全チャプタ。新しい章はここに追加していく。 */
export const CHAPTERS: Chapter[] = [
  CHAPTER_1,
  CHAPTER_2,
  CHAPTER_3,
  CHAPTER_4,
  CHAPTER_5,
  CHAPTER_6,
  CHAPTER_7,
]

export function findLesson(chapterId: string, lessonId: string): Lesson | undefined {
  const chapter = CHAPTERS.find((c) => c.id === chapterId)
  if (!chapter) return undefined
  return chapter.lessons.find((l) => l.id === lessonId)
}

export function findChapter(chapterId: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === chapterId)
}

/**
 * 次のレッスンを返す。
 * - 同じ章内にまだあればそれを返す
 * - 章の最後の場合は次の章の最初のレッスンを返す
 * - 全章の最後の場合は undefined
 */
export function findNextLesson(chapterId: string, lessonId: string): Lesson | undefined {
  const chapterIdx = CHAPTERS.findIndex((c) => c.id === chapterId)
  if (chapterIdx === -1) return undefined
  const chapter = CHAPTERS[chapterIdx]
  const lessonIdx = chapter.lessons.findIndex((l) => l.id === lessonId)
  if (lessonIdx === -1) return undefined
  if (lessonIdx < chapter.lessons.length - 1) {
    return chapter.lessons[lessonIdx + 1]
  }
  // 章末: 次の章の最初のレッスンを返す
  const nextChapter = CHAPTERS[chapterIdx + 1]
  return nextChapter?.lessons[0]
}
