import { Link, useParams } from 'react-router-dom'
import { FormattedText } from '../components/FormattedText'
import { PageShell } from '../components/PageShell'
import { useLocale } from '../i18n'
import { findChapter, loadProgress } from '../lessons'
import { PATHS, toLesson } from '../routes'

export function ChapterIndexPage() {
  const { t } = useLocale()
  const { chapterId } = useParams<{ chapterId: string }>()
  const chapter = chapterId ? findChapter(chapterId) : undefined

  if (!chapter) {
    return (
      <PageShell>
        <h1 className="font-semibold text-2xl">{t('chapter.notFound.title')}</h1>
        <p className="mt-3 text-zinc-400">{t('chapter.notFound.desc')}</p>
        <Link
          to={PATHS.tutorial}
          className="mt-6 inline-block rounded border border-zinc-800 px-4 py-2 text-sm hover:border-emerald-500/60"
        >
          {t('chapter.backToTutorial')}
        </Link>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <p className="text-emerald-400 text-xs uppercase tracking-wide">
        {t('chapter.label', { id: chapter.id })}
      </p>
      <h1 className="mt-1 font-semibold text-2xl">{chapter.title}</h1>
      <p className="mt-3 text-zinc-400 leading-relaxed">
        <FormattedText text={chapter.description} />
      </p>

      <ol className="mt-8 space-y-3">
        {chapter.lessons.map((lesson, i) => {
          const progress = loadProgress(lesson.chapterId, lesson.id)
          const badge = progress?.completed
            ? t('status.completed')
            : progress && progress.completedSteps > 0
              ? t('status.in-progress')
              : t('status.untouched')
          return (
            <li key={lesson.id}>
              <Link
                to={toLesson(chapter.id, lesson.id)}
                className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3 transition-colors hover:border-emerald-500/60 hover:bg-zinc-900"
              >
                <div>
                  <p className="text-zinc-100">
                    <span className="text-zinc-500">{t('lesson.label', { n: i + 1 })}</span>
                    {lesson.title}
                  </p>
                </div>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                  {badge}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </PageShell>
  )
}
