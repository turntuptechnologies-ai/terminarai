import { useCallback, useEffect, useState } from 'react'
import { evaluateCheck, loadProgress, type Step, saveProgress } from '../lessons'
import type { CommandContext, CommandResult } from '../shell'
import { createShell } from '../shell'
import { registerAllCommands } from '../shell/commands'
import { createDefaultVfs, createVfs, HOME_PATH, type Vfs, type VfsDirectory } from '../vfs'

/**
 * ガイド付きセッションの対象。Lesson / Problem の共通部分 (構造的部分型)。
 */
export interface GuidedSource {
  /** 進捗保存キーの第 2 要素 (lesson.id / problem.id)。 */
  id: string
  /** 省略時は createDefaultVfs()。利用前に必ず structuredClone される。 */
  initialFs?: VfsDirectory
  /** 省略時は HOME_PATH。 */
  initialCwd?: string
  steps: Step[]
}

interface SessionState {
  vfs: Vfs
  shell: ReturnType<typeof createShell>
}

function buildSession(source: GuidedSource): SessionState {
  // initialFs を渡し回しても汚染しないよう、必ず deep clone してから VFS を作る
  const initial = source.initialFs ? structuredClone(source.initialFs) : undefined
  const vfs = initial ? createVfs(initial) : createDefaultVfs()
  const shell = createShell(vfs)
  registerAllCommands(shell)
  return { vfs, shell }
}

/**
 * レッスン / 自習問題に共通する「ガイド付きセッション」の状態管理フック。
 *
 * VFS + シェルの構築、ステップ進行判定 (1 コマンド = 最大 1 ステップ、EvalContext の
 * JSDoc 参照)、多段ヒントの開示、進捗の localStorage 保存、再挑戦処理を担う。
 * 表示 (パンくず・バッジ・i18n キー) の差分は LessonView / PracticeView 側に残す。
 *
 * 状態の扱い:
 * - 再訪時は VFS / step を毎回 fresh (一貫した再現性のため)
 * - 完了済み判定だけは localStorage から復元 (一覧バッジと UI が乖離しないように)
 *
 * @param progressScope 進捗保存キーの第 1 要素 (Lesson は chapterId、Problem は 'practice')
 * @param source 対象のレッスン / 問題。モジュール定数を渡す前提 (毎レンダー新規生成しない)
 * @param onComplete 全ステップクリア時のコールバック
 */
export function useGuidedSession(
  progressScope: string,
  source: GuidedSource,
  onComplete?: () => void,
) {
  const [session, setSession] = useState<SessionState>(() => buildSession(source))
  const [stepIndex, setStepIndex] = useState(0)
  const [completed, setCompleted] = useState(
    () => loadProgress(progressScope, source.id)?.completed ?? false,
  )
  // 多段ヒント: 0=未表示、1..N=N 番目までを順次開示
  const [revealedHints, setRevealedHints] = useState(0)
  // 完了済みの対象を「もう一度挑戦」でガイド付きに解き直している最中か。
  // completed (= localStorage の記録) は保持したまま、表示と判定だけ一時的に再開する。
  const [retrying, setRetrying] = useState(false)
  // 再挑戦のたびに増やし、Terminal の key に混ぜて再 mount (履歴・FS をリセット) させる。
  const [attempt, setAttempt] = useState(0)

  // 対象 (source) が切り替わったら state を全リセット
  useEffect(() => {
    setSession(buildSession(source))
    setStepIndex(0)
    setCompleted(loadProgress(progressScope, source.id)?.completed ?? false)
    setRevealedHints(0)
    setRetrying(false)
  }, [progressScope, source])

  // 完了済みの対象を初期状態に戻して解き直す (記録は消さない)。
  const handleRetry = useCallback(() => {
    setSession(buildSession(source))
    setStepIndex(0)
    setRevealedHints(0)
    setRetrying(true)
    setAttempt((n) => n + 1)
  }, [source])

  const handleAfterExecute = useCallback(
    (input: string, _result: CommandResult, ctxAfter: CommandContext) => {
      // 完了済みかつ再挑戦中でなければ判定しない (再挑戦中はガイドを再開しているので判定する)
      if (completed && !retrying) return
      const step = source.steps[stepIndex]
      if (!step) return
      const passed = evaluateCheck(step.check, {
        vfs: session.vfs,
        cwd: ctxAfter.cwd,
        lastCommand: input,
      })
      if (!passed) return

      const nextIndex = stepIndex + 1
      const now = Date.now()
      if (nextIndex >= source.steps.length) {
        setCompleted(true)
        setRetrying(false)
        saveProgress(progressScope, source.id, {
          completedSteps: source.steps.length,
          completed: true,
          updatedAt: now,
        })
        onComplete?.()
      } else {
        setStepIndex(nextIndex)
        setRevealedHints(0)
        saveProgress(progressScope, source.id, {
          completedSteps: nextIndex,
          completed: false,
          updatedAt: now,
        })
      }
    },
    [completed, retrying, progressScope, source, stepIndex, session.vfs, onComplete],
  )

  const currentStep = source.steps[stepIndex]
  const initialCwd = source.initialCwd ?? HOME_PATH
  // レッスン切替・再挑戦時に Terminal の履歴等を引き継がないよう、key で再 mount を強制する
  const terminalKey = `${progressScope}/${source.id}/${attempt}`

  return {
    session,
    stepIndex,
    completed,
    retrying,
    revealedHints,
    setRevealedHints,
    currentStep,
    initialCwd,
    terminalKey,
    handleRetry,
    handleAfterExecute,
  }
}
