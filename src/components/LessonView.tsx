import { useCallback, useEffect, useState } from 'react'
import { evaluateCheck, type Lesson, saveProgress } from '../lessons'
import { type CommandContext, type CommandResult, createShell, defaultContext } from '../shell'
import { registerAllCommands } from '../shell/commands'
import { createDefaultVfs, createVfs, HOME_PATH, type Vfs } from '../vfs'
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
  const vfs = lesson.initialFs ? createVfs(lesson.initialFs) : createDefaultVfs()
  const shell = createShell(vfs)
  registerAllCommands(shell)
  return { vfs, shell }
}

/**
 * レッスン本体を描画するコンポーネント。
 * - 説明 + 現在ステップ + Terminal を表示
 * - Terminal の onAfterExecute で現在ステップの Check を評価
 * - クリアで次ステップへ、最終ステップクリアで `completed`
 * - 進捗は localStorage に都度保存される
 */
export function LessonView({ lesson, onComplete }: LessonViewProps) {
  const [session, setSession] = useState<SessionState>(() => buildSession(lesson))
  const [stepIndex, setStepIndex] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // レッスン (lesson.id) が切り替わったら state を全リセット
  useEffect(() => {
    setSession(buildSession(lesson))
    setStepIndex(0)
    setCompleted(false)
    setShowHint(false)
  }, [lesson])

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
        saveProgress(lesson.id, {
          completedSteps: lesson.steps.length,
          completed: true,
          updatedAt: now,
        })
        onComplete?.()
      } else {
        setStepIndex(nextIndex)
        setShowHint(false)
        saveProgress(lesson.id, {
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
        <p className="mt-2 text-sm text-zinc-400">{lesson.description}</p>

        {completed ? (
          <div
            role="status"
            className="mt-4 rounded-md border border-emerald-700 bg-emerald-900/30 px-4 py-3 text-emerald-300 text-sm"
          >
            全てのステップをクリアしました。次のレッスンに進めます。
          </div>
        ) : currentStep ? (
          <div className="mt-4">
            <p className="text-emerald-400 text-xs uppercase tracking-wide">
              ステップ {stepIndex + 1} / {lesson.steps.length}
            </p>
            <p className="mt-1 text-zinc-100">{currentStep.instruction}</p>
            {currentStep.hint && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowHint((s) => !s)}
                  className="text-sky-400 text-xs underline-offset-2 hover:underline"
                >
                  {showHint ? 'ヒントを隠す' : 'ヒントを見る'}
                </button>
                {showHint && <p className="mt-1 text-sm text-zinc-400">{currentStep.hint}</p>}
              </div>
            )}
          </div>
        ) : null}
      </section>

      <div className="flex min-h-0 flex-1">
        <Terminal
          shell={session.shell}
          initialCtx={defaultContext(initialCwd)}
          onAfterExecute={handleAfterExecute}
        />
      </div>
    </div>
  )
}
