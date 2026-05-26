import type { Vfs, VfsDirectory } from '../vfs'

export type Check =
  | { kind: 'cwd-equals'; path: string }
  | { kind: 'file-exists'; path: string }
  | { kind: 'file-contains'; path: string; text: string }
  /** 入力文字列 (引数込み) に対する正規表現マッチ。`pattern` は RegExp ソース。 */
  | { kind: 'command-matches'; pattern: string; flags?: string }
  /**
   * 子チェックの論理 AND。
   * 安全のため空配列は false 扱い (レッスン作者の意図しないクリアを防ぐ)。
   */
  | { kind: 'and'; checks: Check[] }
  /** 子チェックの論理 OR。空配列は false 扱い。 */
  | { kind: 'or'; checks: Check[] }

export interface Step {
  instruction: string
  hint?: string
  check: Check
}

export interface Lesson {
  /**
   * **アプリ全体でユニーク**な ID。URL は /tutorial/:chapterId/:lessonId だが、
   * 進捗 localStorage キーには `${chapterId}/${id}` の組を用いるため、衝突心配なし。
   * 慣習として "1-1", "1-2", "2-1" のように `<chapter>-<n>` 形式を推奨。
   */
  id: string
  chapterId: string
  title: string
  description: string
  /** 省略時は createDefaultVfs() の初期 FS を使う。LessonView 側で structuredClone される。 */
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

/**
 * Check 評価時のコンテキスト。エンジンが副作用なしで判定するために必要な情報。
 *
 * **ステップ進行ルール**: 1 コマンド = 最大 1 ステップ進行。
 * onAfterExecute 1 回につき現在ステップの check を 1 回だけ評価し、
 * 連鎖判定 (1 コマンドで複数ステップ進む) は行わない。
 * 学習者には「次のステップに進んだら、次のコマンドを打つ」リズムを期待する。
 */
export interface EvalContext {
  vfs: Vfs
  cwd: string
  /** 直近に実行されたコマンド入力 (改行を含まない 1 行)。 */
  lastCommand: string
}

export interface LessonProgress {
  /** これまでに到達した最大ステップ数 (saveProgress でモノトニックに維持)。 */
  completedSteps: number
  /** 1 度でも全ステップをクリアしたか (saveProgress で OR 累積)。 */
  completed: boolean
  /** unix epoch ms */
  updatedAt: number
}
