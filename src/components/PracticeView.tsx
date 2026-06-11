import { Link } from 'react-router-dom'
import { loc, locList, useLocale } from '../i18n'
import { type Difficulty, findNextProblem, type Problem } from '../lessons'
import { PATHS, toProblem } from '../routes'
import { defaultContext } from '../shell'
import { FormattedText } from './FormattedText'
import { HintReveal } from './HintReveal'
import { Terminal } from './Terminal'
import { useGuidedSession } from './useGuidedSession'

interface PracticeViewProps {
  problem: Problem
}

const DIFFICULTY_CLASS: Record<Difficulty, string> = {
  easy: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/60',
  medium: 'bg-amber-900/40 text-amber-300 border-amber-700/60',
  hard: 'bg-rose-900/40 text-rose-300 border-rose-700/60',
}

/**
 * 自習問題ビュー。
 *
 * セッション管理 (VFS / ステップ進行 / 進捗保存 / 再挑戦) は useGuidedSession に委譲し、
 * ここでは問題固有の表示 (難易度バッジ・タグ・次の問題導線) だけを持つ。
 * 進捗は loadProgress('practice', problem.id) で保存 (Lesson と同じ仕組みを流用)。
 */
export function PracticeView({ problem }: PracticeViewProps) {
  const { t, locale } = useLocale()
  const {
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
  } = useGuidedSession('practice', problem)

  const hints = currentStep?.hints ? locList(currentStep.hints, locale) : []
  const nextProblem = findNextProblem(problem.id)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <section className="shrink-0 border-zinc-800 border-b bg-zinc-900 px-6 py-4 text-zinc-100">
        <nav aria-label={t('breadcrumb.aria')} className="text-xs">
          <Link to={PATHS.practice} className="text-zinc-500 transition-colors hover:text-zinc-300">
            {t('practice.title')}
          </Link>
          <span className="mx-2 text-zinc-700">/</span>
          <span className="text-zinc-400">{loc(problem.title, locale)}</span>
        </nav>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="font-semibold text-xl">{loc(problem.title, locale)}</h1>
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
          <FormattedText text={loc(problem.description, locale)} />
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
              <FormattedText text={loc(currentStep.instruction, locale)} />
            </p>
            {hints.length > 0 && (
              <HintReveal
                hints={hints}
                revealed={revealedHints}
                onReveal={() => setRevealedHints((n) => (n < hints.length ? n + 1 : 0))}
              />
            )}
          </div>
        ) : null}
      </section>

      <div className="flex min-h-0 flex-1">
        <Terminal
          key={terminalKey}
          shell={session.shell}
          initialCtx={defaultContext(initialCwd)}
          onAfterExecute={handleAfterExecute}
        />
      </div>
    </div>
  )
}
