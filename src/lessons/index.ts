export { evaluateCheck } from './engine'
export { findNextProblem, findProblem, PROBLEMS } from './problems'
export type { ChapterProgress, ChapterStatus } from './progress'
export {
  clearProgress,
  computeChapterProgress,
  loadAllProgress,
  loadProgress,
  saveProgress,
} from './progress'
export { CHAPTERS, findChapter, findLesson, findNextLesson } from './registry'
export type {
  Chapter,
  Check,
  Difficulty,
  EvalContext,
  Lesson,
  LessonProgress,
  Problem,
  Step,
} from './types'
