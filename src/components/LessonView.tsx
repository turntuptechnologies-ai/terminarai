import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { evaluateCheck, findNextLesson, type Lesson, loadProgress, saveProgress } from '../lessons'
import { type CommandContext, type CommandResult, createShell, defaultContext } from '../shell'
import { registerAllCommands } from '../shell/commands'
import { createDefaultVfs, createVfs, HOME_PATH, type Vfs } from '../vfs'
import { FormattedText } from './FormattedText'
import { HintReveal } from './HintReveal'
import { Terminal } from './Terminal'

interface LessonViewProps {
  lesson: Lesson
  /** 全ステップクリア時のコールバック。 */
  onComplete?: () => void
}

interface SessionState {
  vfs: Vfs
  shell: ReturnType<typeof createShell>
}

function buildSession(lesson: Lesson): SessionState {
  // initialFs を渡し回しても汚染しないよう、必ず deep clone してから VFS を作る
  const initial = lesson.initialFs ? structuredClone(lesson.initialFs) : undefined
  const vfs = initial ? createVfs(initial) : createDefaultVfs()
  const shell = createShell(vfs)
  registerAllCommands(shell)
  return { vfs, shell }
}

/**
 * レッスン本体を描画するコンポーネント。
 *
 * 状態の扱い:
 * - 再訪時は VFS / step を毎回 fresh (一貫した再現性のため)
 * - 完了済み判定だけは localStorage から復元 (一覧バッジと UI が乖離しないように)
 * - 1 コマンド = 最大 1 ステップ進行 (EvalContext の JSDoc 参照)
 */
export function LessonView({ lesson, onComplete }: LessonViewProps) {
  const [session, setSession] = useState<SessionState>(() => buildSession(lesson))
  const [stepIndex, setStepIndex] = useState(0)
  const [completed, setCompleted] = useState(
    () => loadProgress(lesson.chapterId, lesson.id)?.completed ?? false,
  )
  // 多段ヒント: 0=未表示、1..N=N 番目までを順次開示
  const [revealedHints, setRevealedHints] = useState(0)

  // レッスン (lesson.id) が切り替わったら state を全リセット
  useEffect(() => {
    setSession(buildSession(lesson))
    setStepIndex(0)
    setCompleted(loadProgress(lesson.chapterId, lesson.id)?.completed ?? false)
    setRevealedHints(0)
  }, [lesson.id, lesson.chapterId, lesson])

  const handleAfterExecute = useCallback(
    (input: string, _result: CommandResult, ctxAfter: CommandContext) => {
      if (completed) return
      const step = lesson.steps[stepIndex]
      if (!step) return
      const passed = evaluateCheck(step.check, {
        vfs: session.vfs,
        cwd: ctxAfter.cwd,
        lastCommand: input,
      })
      if (!passed) return

      const nextIndex = stepIndex + 1
      const now = Date.now()
      if (nextIndex >= lesson.steps.length) {
        setCompleted(true)
        saveProgress(lesson.chapterId, lesson.id, {
          completedSteps: lesson.steps.length,
          completed: true,
          updatedAt: now,
        })
        onComplete?.()
      } else {
        setStepIndex(nextIndex)
        setRevealedHints(0)
        saveProgress(lesson.chapterId, lesson.id, {
          completedSteps: nextIndex,
          completed: false,
          updatedAt: now,
        })
      }
    },
    [completed, lesson, stepIndex, session.vfs, onComplete],
  )

  const currentStep = lesson.steps[stepIndex]
  const initialCwd = lesson.initialCwd ?? HOME_PATH
  const nextLesson = findNextLesson(lesson.chapterId, lesson.id)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <section className="shrink-0 border-zinc-800 border-b bg-zinc-900 px-6 py-4 text-zinc-100">
        {/* パンくず: いつでも章一覧に戻れるように */}
        <nav aria-label="現在地" className="text-xs">
          <Link
            to={`/tutorial/${lesson.chapterId}`}
            className="text-zinc-500 transition-colors hover:text-zinc-300"
          >
            第 {lesson.chapterId} 章
          </Link>
          <span className="mx-2 text-zinc-700">/</span>
          <span className="text-zinc-400">{lesson.title}</span>
        </nav>

        <h1 className="mt-1 font-semibold text-xl">{lesson.title}</h1>
        <p className="mt-2 text-sm text-zinc-400">
          <FormattedText text={lesson.description} />
        </p>

        {completed ? (
          <div className="mt-4">
            <div
              role="status"
              className="rounded-md border border-emerald-700 bg-emerald-900/30 px-4 py-3 text-emerald-300 text-sm"
            >
              全てのステップをクリアしました。
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <Link
                to={`/tutorial/${lesson.chapterId}`}
                className="rounded border border-zinc-700 px-3 py-1.5 text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
              >
                ← 章一覧へ戻る
              </Link>
              {nextLesson ? (
                <Link
                  to={`/tutorial/${nextLesson.chapterId}/${nextLesson.id}`}
                  className="rounded border border-emerald-600 bg-emerald-700/20 px-3 py-1.5 text-emerald-300 transition-colors hover:border-emerald-400 hover:bg-emerald-700/40"
                >
                  次のレッスンへ →
                </Link>
              ) : (
                <Link
                  to="/tutorial"
                  className="rounded border border-zinc-700 px-3 py-1.5 text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
                >
                  全章一覧へ
                </Link>
              )}
            </div>
          </div>
        ) : currentStep ? (
          <div role="status" aria-live="polite" className="mt-4">
            <p className="text-emerald-400 text-xs uppercase tracking-wide">
              ステップ {stepIndex + 1} / {lesson.steps.length}
            </p>
            <p className="mt-1 text-zinc-100">
              <FormattedText text={currentStep.instruction} />
            </p>
            {currentStep.hints && currentStep.hints.length > 0 && (
              <HintReveal
                hints={currentStep.hints}
                revealed={revealedHints}
                onReveal={() => {
                  if (!currentStep.hints) return
                  setRevealedHints((n) => (n < currentStep.hints.length ? n + 1 : 0))
                }}
              />
            )}
          </div>
        ) : null}
      </section>

      <div className="flex min-h-0 flex-1">
        {/* レッスン切替時に Terminal の履歴等を引き継がないよう、key で再 mount を強制 */}
        <Terminal
          key={`${lesson.chapterId}/${lesson.id}`}
          shell={session.shell}
          initialCtx={defaultContext(initialCwd)}
          onAfterExecute={handleAfterExecute}
        />
      </div>
    </div>
  )
}
