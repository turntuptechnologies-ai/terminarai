import { useCallback, useEffect, useState } from 'react'
import { evaluateCheck, type Lesson, loadProgress, saveProgress } from '../lessons'
import { type CommandContext, type CommandResult, createShell, defaultContext } from '../shell'
import { registerAllCommands } from '../shell/commands'
import { createDefaultVfs, createVfs, HOME_PATH, type Vfs } from '../vfs'
import { FormattedText } from './FormattedText'
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
  const [showHint, setShowHint] = useState(false)

  // レッスン (lesson.id) が切り替わったら state を全リセット
  useEffect(() => {
    setSession(buildSession(lesson))
    setStepIndex(0)
    setCompleted(loadProgress(lesson.chapterId, lesson.id)?.completed ?? false)
    setShowHint(false)
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
        setShowHint(false)
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

  return (
    <div className="flex h-full min-h-0 flex-col">
      <section className="shrink-0 border-zinc-800 border-b bg-zinc-900 px-6 py-4 text-zinc-100">
        <h1 className="font-semibold text-xl">{lesson.title}</h1>
        <p className="mt-2 text-sm text-zinc-400">
          <FormattedText text={lesson.description} />
        </p>

        {completed ? (
          <div
            role="status"
            className="mt-4 rounded-md border border-emerald-700 bg-emerald-900/30 px-4 py-3 text-emerald-300 text-sm"
          >
            全てのステップをクリアしました。
          </div>
        ) : currentStep ? (
          <div role="status" aria-live="polite" className="mt-4">
            <p className="text-emerald-400 text-xs uppercase tracking-wide">
              ステップ {stepIndex + 1} / {lesson.steps.length}
            </p>
            <p className="mt-1 text-zinc-100">
              <FormattedText text={currentStep.instruction} />
            </p>
            {currentStep.hint && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowHint((s) => !s)}
                  aria-expanded={showHint}
                  className="text-sky-400 text-xs underline-offset-2 hover:underline"
                >
                  {showHint ? 'ヒントを隠す' : 'ヒントを見る'}
                </button>
                {showHint && (
                  <p className="mt-1 text-sm text-zinc-400">
                    <FormattedText text={currentStep.hint} />
                  </p>
                )}
              </div>
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
