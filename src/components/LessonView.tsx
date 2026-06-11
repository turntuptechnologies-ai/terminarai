import { Link } from 'react-router-dom'
import { loc, locList, useLocale } from '../i18n'
import { findNextLesson, type Lesson } from '../lessons'
import { PATHS, toChapter, toLesson } from '../routes'
import { defaultContext } from '../shell'
import { FormattedText } from './FormattedText'
import { HintReveal } from './HintReveal'
import { Terminal } from './Terminal'
import { useGuidedSession } from './useGuidedSession'

interface LessonViewProps {
  lesson: Lesson
  /** 全ステップクリア時のコールバック。 */
  onComplete?: () => void
}

/**
 * レッスン本体を描画するコンポーネント。
 *
 * セッション管理 (VFS / ステップ進行 / 進捗保存 / 再挑戦) は useGuidedSession に委譲し、
 * ここではレッスン固有の表示 (パンくず・完了バナー・次レッスン導線) だけを持つ。
 */
export function LessonView({ lesson, onComplete }: LessonViewProps) {
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
  } = useGuidedSession(lesson.chapterId, lesson, onComplete)

  const hints = currentStep?.hints ? locList(currentStep.hints, locale) : []
  const nextLesson = findNextLesson(lesson.chapterId, lesson.id)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <section className="shrink-0 border-zinc-800 border-b bg-zinc-900 px-6 py-4 text-zinc-100">
        {/* パンくず: いつでも章一覧に戻れるように */}
        <nav aria-label={t('breadcrumb.aria')} className="text-xs">
          <Link
            to={toChapter(lesson.chapterId)}
            className="text-zinc-500 transition-colors hover:text-zinc-300"
          >
            {t('chapter.label', { id: lesson.chapterId })}
          </Link>
          <span className="mx-2 text-zinc-700">/</span>
          <span className="text-zinc-400">{loc(lesson.title, locale)}</span>
        </nav>

        <h1 className="mt-1 font-semibold text-xl">{loc(lesson.title, locale)}</h1>
        <p className="mt-2 text-sm text-zinc-400">
          <FormattedText text={loc(lesson.description, locale)} />
        </p>

        {completed && !retrying ? (
          <div className="mt-4">
            <div
              role="status"
              className="rounded-md border border-emerald-700 bg-emerald-900/30 px-4 py-3 text-emerald-300 text-sm"
            >
              {t('lesson.completedBanner')}
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
                to={toChapter(lesson.chapterId)}
                className="rounded border border-zinc-700 px-3 py-1.5 text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
              >
                {t('lesson.backToChapter')}
              </Link>
              {nextLesson ? (
                <Link
                  to={toLesson(nextLesson.chapterId, nextLesson.id)}
                  className="rounded border border-emerald-600 bg-emerald-700/20 px-3 py-1.5 text-emerald-300 transition-colors hover:border-emerald-400 hover:bg-emerald-700/40"
                >
                  {t('lesson.nextLesson')}
                </Link>
              ) : (
                <Link
                  to={PATHS.tutorial}
                  className="rounded border border-zinc-700 px-3 py-1.5 text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
                >
                  {t('lesson.allChapters')}
                </Link>
              )}
            </div>
          </div>
        ) : currentStep ? (
          <div role="status" aria-live="polite" className="mt-4">
            {retrying && <p className="mb-1 text-xs text-zinc-500">{t('lesson.retrying')}</p>}
            <p className="text-emerald-400 text-xs uppercase tracking-wide">
              {t('step.label', { current: stepIndex + 1, total: lesson.steps.length })}
            </p>
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
