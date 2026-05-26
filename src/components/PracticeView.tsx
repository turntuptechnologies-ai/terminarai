import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  type Difficulty,
  evaluateCheck,
  findNextProblem,
  loadProgress,
  type Problem,
  saveProgress,
} from '../lessons'
import { type CommandContext, type CommandResult, createShell, defaultContext } from '../shell'
import { registerAllCommands } from '../shell/commands'
import { createDefaultVfs, createVfs, HOME_PATH, type Vfs } from '../vfs'
import { FormattedText } from './FormattedText'
import { HintReveal } from './HintReveal'
import { Terminal } from './Terminal'

interface PracticeViewProps {
  problem: Problem
}

interface SessionState {
  vfs: Vfs
  shell: ReturnType<typeof createShell>
}

function buildSession(problem: Problem): SessionState {
  const initial = problem.initialFs ? structuredClone(problem.initialFs) : undefined
  const vfs = initial ? createVfs(initial) : createDefaultVfs()
  const shell = createShell(vfs)
  registerAllCommands(shell)
  return { vfs, shell }
}

const DIFFICULTY_CLASS: Record<Difficulty, string> = {
  easy: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/60',
  medium: 'bg-amber-900/40 text-amber-300 border-amber-700/60',
  hard: 'bg-rose-900/40 text-rose-300 border-rose-700/60',
}

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '初級',
  medium: '中級',
  hard: '上級',
}

/**
 * 自習問題ビュー。
 *
 * LessonView と似た構造を持つが、問題文・難易度バッジ・タグ表示が違う。
 * 進捗は loadProgress('practice', problem.id) で保存 (Lesson と同じ仕組みを流用)。
 *
 * TODO (followup): LessonView と共通のセッション管理ロジックを useGuidedSession 等の
 * カスタムフックに切り出す。現状は意図的な重複。
 */
export function PracticeView({ problem }: PracticeViewProps) {
  const [session, setSession] = useState<SessionState>(() => buildSession(problem))
  const [stepIndex, setStepIndex] = useState(0)
  const [completed, setCompleted] = useState(
    () => loadProgress('practice', problem.id)?.completed ?? false,
  )
  const [revealedHints, setRevealedHints] = useState(0)

  useEffect(() => {
    setSession(buildSession(problem))
    setStepIndex(0)
    setCompleted(loadProgress('practice', problem.id)?.completed ?? false)
    setRevealedHints(0)
  }, [problem])

  const handleAfterExecute = useCallback(
    (input: string, _result: CommandResult, ctxAfter: CommandContext) => {
      if (completed) return
      const step = problem.steps[stepIndex]
      if (!step) return
      const passed = evaluateCheck(step.check, {
        vfs: session.vfs,
        cwd: ctxAfter.cwd,
        lastCommand: input,
      })
      if (!passed) return

      const nextIndex = stepIndex + 1
      const now = Date.now()
      if (nextIndex >= problem.steps.length) {
        setCompleted(true)
        saveProgress('practice', problem.id, {
          completedSteps: problem.steps.length,
          completed: true,
          updatedAt: now,
        })
      } else {
        setStepIndex(nextIndex)
        setRevealedHints(0)
        saveProgress('practice', problem.id, {
          completedSteps: nextIndex,
          completed: false,
          updatedAt: now,
        })
      }
    },
    [completed, problem, stepIndex, session.vfs],
  )

  const currentStep = problem.steps[stepIndex]
  const initialCwd = problem.initialCwd ?? HOME_PATH
  const nextProblem = findNextProblem(problem.id)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <section className="shrink-0 border-zinc-800 border-b bg-zinc-900 px-6 py-4 text-zinc-100">
        <nav aria-label="現在地" className="text-xs">
          <Link to="/practice" className="text-zinc-500 transition-colors hover:text-zinc-300">
            自習問題
          </Link>
          <span className="mx-2 text-zinc-700">/</span>
          <span className="text-zinc-400">{problem.title}</span>
        </nav>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="font-semibold text-xl">{problem.title}</h1>
          <span
            className={`rounded border px-2 py-0.5 text-xs ${DIFFICULTY_CLASS[problem.difficulty]}`}
          >
            {DIFFICULTY_LABEL[problem.difficulty]}
          </span>
          {problem.tags.map((tag) => (
            <code
              key={tag}
              className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-400"
            >
              {tag}
            </code>
          ))}
        </div>

        <p className="mt-2 text-sm text-zinc-400">
          <FormattedText text={problem.description} />
        </p>

        {completed ? (
          <div className="mt-4">
            <div
              role="status"
              className="rounded-md border border-emerald-700 bg-emerald-900/30 px-4 py-3 text-emerald-300 text-sm"
            >
              問題を解きました 🎉
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <Link
                to="/practice"
                className="rounded border border-zinc-700 px-3 py-1.5 text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
              >
                ← 問題一覧へ戻る
              </Link>
              {nextProblem ? (
                <Link
                  to={`/practice/${nextProblem.id}`}
                  className="rounded border border-emerald-600 bg-emerald-700/20 px-3 py-1.5 text-emerald-300 transition-colors hover:border-emerald-400 hover:bg-emerald-700/40"
                >
                  次の問題へ →
                </Link>
              ) : null}
            </div>
          </div>
        ) : currentStep ? (
          <div role="status" aria-live="polite" className="mt-4">
            {problem.steps.length > 1 && (
              <p className="text-emerald-400 text-xs uppercase tracking-wide">
                ステップ {stepIndex + 1} / {problem.steps.length}
              </p>
            )}
            <p className="mt-1 text-zinc-100">
              <FormattedText text={currentStep.instruction} />
            </p>
            {currentStep.hints && currentStep.hints.length > 0 && (
              <HintReveal
                hints={currentStep.hints}
                revealed={revealedHints}
                onReveal={() => {
                  // narrowing が closure 内で失われるためローカル const に退避
                  const hs = currentStep.hints
                  if (!hs) return
                  setRevealedHints((n) => (n < hs.length ? n + 1 : 0))
                }}
              />
            )}
          </div>
        ) : null}
      </section>

      <div className="flex min-h-0 flex-1">
        <Terminal
          key={`practice/${problem.id}`}
          shell={session.shell}
          initialCtx={defaultContext(initialCwd)}
          onAfterExecute={handleAfterExecute}
        />
      </div>
    </div>
  )
}
