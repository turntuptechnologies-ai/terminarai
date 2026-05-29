import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocale } from '../i18n'
import {
  type Difficulty,
  evaluateCheck,
  findNextProblem,
  loadProgress,
  type Problem,
  saveProgress,
} from '../lessons'
import { PATHS, toProblem } from '../routes'
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
  const { t } = useLocale()
  const [session, setSession] = useState<SessionState>(() => buildSession(problem))
  const [stepIndex, setStepIndex] = useState(0)
  const [completed, setCompleted] = useState(
    () => loadProgress('practice', problem.id)?.completed ?? false,
  )
  const [revealedHints, setRevealedHints] = useState(0)
  // 解答済みの問題を「もう一度挑戦」でガイド付きに解き直している最中か。
  // completed (= localStorage の記録) は保持したまま、表示と判定だけ一時的に再開する。
  const [retrying, setRetrying] = useState(false)
  // 再挑戦のたびに増やし、Terminal の key に混ぜて再 mount (履歴・FS をリセット) させる。
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setSession(buildSession(problem))
    setStepIndex(0)
    setCompleted(loadProgress('practice', problem.id)?.completed ?? false)
    setRevealedHints(0)
    setRetrying(false)
  }, [problem])

  // 解答済みの問題を初期状態に戻して解き直す (記録は消さない)。
  const handleRetry = useCallback(() => {
    setSession(buildSession(problem))
    setStepIndex(0)
    setRevealedHints(0)
    setRetrying(true)
    setAttempt((n) => n + 1)
  }, [problem])

  const handleAfterExecute = useCallback(
    (input: string, _result: CommandResult, ctxAfter: CommandContext) => {
      // 解答済みかつ再挑戦中でなければ判定しない (再挑戦中はガイドを再開しているので判定する)
      if (completed && !retrying) return
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
        setRetrying(false)
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
    [completed, retrying, problem, stepIndex, session.vfs],
  )

  const currentStep = problem.steps[stepIndex]
  const initialCwd = problem.initialCwd ?? HOME_PATH
  const nextProblem = findNextProblem(problem.id)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <section className="shrink-0 border-zinc-800 border-b bg-zinc-900 px-6 py-4 text-zinc-100">
        <nav aria-label={t('breadcrumb.aria')} className="text-xs">
          <Link to={PATHS.practice} className="text-zinc-500 transition-colors hover:text-zinc-300">
            {t('practice.title')}
          </Link>
          <span className="mx-2 text-zinc-700">/</span>
          <span className="text-zinc-400">{problem.title}</span>
        </nav>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="font-semibold text-xl">{problem.title}</h1>
          <span
            className={`rounded border px-2 py-0.5 text-xs ${DIFFICULTY_CLASS[problem.difficulty]}`}
          >
            {t(`difficulty.${problem.difficulty}`)}
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

        {completed && !retrying ? (
          <div className="mt-4">
            <div
              role="status"
              className="rounded-md border border-emerald-700 bg-emerald-900/30 px-4 py-3 text-emerald-300 text-sm"
            >
              {t('practice.solvedBanner')}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                onClick={handleRetry}
                className="rounded border border-zinc-700 px-3 py-1.5 text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
              >
                {t('common.retry')}
              </button>
              <Link
                to={PATHS.practice}
                className="rounded border border-zinc-700 px-3 py-1.5 text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
              >
                {t('practice.backToList')}
              </Link>
              {nextProblem ? (
                <Link
                  to={toProblem(nextProblem.id)}
                  className="rounded border border-emerald-600 bg-emerald-700/20 px-3 py-1.5 text-emerald-300 transition-colors hover:border-emerald-400 hover:bg-emerald-700/40"
                >
                  {t('practice.nextProblem')}
                </Link>
              ) : null}
            </div>
          </div>
        ) : currentStep ? (
          <div role="status" aria-live="polite" className="mt-4">
            {retrying && <p className="mb-1 text-xs text-zinc-500">{t('practice.retrying')}</p>}
            {problem.steps.length > 1 && (
              <p className="text-emerald-400 text-xs uppercase tracking-wide">
                {t('step.label', { current: stepIndex + 1, total: problem.steps.length })}
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
          key={`practice/${problem.id}/${attempt}`}
          shell={session.shell}
          initialCtx={defaultContext(initialCwd)}
          onAfterExecute={handleAfterExecute}
        />
      </div>
    </div>
  )
}
