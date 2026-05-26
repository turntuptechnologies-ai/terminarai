import type { Vfs, VfsDirectory } from '../vfs'

export type Check =
  | { kind: 'cwd-equals'; path: string }
  | { kind: 'file-exists'; path: string }
  | { kind: 'file-contains'; path: string; text: string }
  /** 入力文字列 (引数込み) に対する正規表現マッチ。`pattern` は RegExp ソース。 */
  | { kind: 'command-matches'; pattern: string; flags?: string }
  | { kind: 'and'; checks: Check[] }
  | { kind: 'or'; checks: Check[] }

export interface Step {
  instruction: string
  hint?: string
  check: Check
}

export interface Lesson {
  /** チャプタ内ユニーク ID。URL: /tutorial/:chapterId/:lessonId */
  id: string
  chapterId: string
  title: string
  description: string
  /** 省略時は createDefaultVfs() の初期 FS を使う。 */
  initialFs?: VfsDirectory
  /** 省略時は HOME_PATH (/home/user)。 */
  initialCwd?: string
  steps: Step[]
}

export interface Chapter {
  id: string
  title: string
  description: string
  lessons: Lesson[]
}

/** Check 評価時のコンテキスト。エンジンが副作用なしで判定するために必要な情報。 */
export interface EvalContext {
  vfs: Vfs
  cwd: string
  /** 直近に実行されたコマンド入力 (改行を含まない 1 行)。 */
  lastCommand: string
}

export interface LessonProgress {
  completedSteps: number
  completed: boolean
  updatedAt: number
}
