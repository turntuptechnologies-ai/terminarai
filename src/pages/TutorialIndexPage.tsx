import { Link } from 'react-router-dom'
import { FormattedText } from '../components/FormattedText'
import { PageShell } from '../components/PageShell'
import { useLocale } from '../i18n'
import { CHAPTERS, type ChapterStatus, computeChapterProgress } from '../lessons'
import { toChapter } from '../routes'

const STATUS_CLASS: Record<ChapterStatus, string> = {
  untouched: 'text-zinc-500',
  'in-progress': 'text-sky-400',
  completed: 'text-emerald-400',
}

export function TutorialIndexPage() {
  const { t } = useLocale()
  return (
    <PageShell>
      <h1 className="font-semibold text-2xl">{t('tutorial.title')}</h1>
      <p className="mt-3 text-zinc-400">{t('tutorial.intro')}</p>

      {CHAPTERS.length === 0 ? (
        <div className="mt-8 rounded-md border border-zinc-800 border-dashed p-6 text-zinc-500 text-sm">
          {t('tutorial.empty')}
        </div>
      ) : (
        <ol className="mt-8 space-y-3">
          {CHAPTERS.map((ch) => {
            const progress = computeChapterProgress(ch)
            return (
              <li key={ch.id}>
                <Link
                  to={toChapter(ch.id)}
                  className="block rounded-lg border border-zinc-800 p-5 transition-colors hover:border-emerald-500/60 hover:bg-zinc-900"
                >
                  <p className="text-emerald-400 text-xs uppercase tracking-wide">
                    {t('chapter.label', { id: ch.id })}
                  </p>
                  <h2 className="mt-1 font-semibold text-zinc-100">{ch.title}</h2>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                    <FormattedText text={ch.description} />
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-zinc-500">
                      {t('tutorial.lessonsCount', { count: ch.lessons.length })}
                    </span>
                    <span className={STATUS_CLASS[progress.status]}>
                      {t(`status.${progress.status}`)} (
                      {t('status.progress', {
                        completed: progress.completed,
                        total: progress.total,
                      })}
                      )
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </PageShell>
  )
}
