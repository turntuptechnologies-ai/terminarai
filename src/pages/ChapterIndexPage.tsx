import { Link, useParams } from 'react-router-dom'
import { FormattedText } from '../components/FormattedText'
import { PageShell } from '../components/PageShell'
import { findChapter, loadProgress } from '../lessons'
import { PATHS, toLesson } from '../routes'

export function ChapterIndexPage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const chapter = chapterId ? findChapter(chapterId) : undefined

  if (!chapter) {
    return (
      <PageShell>
        <h1 className="font-semibold text-2xl">章が見つかりません</h1>
        <p className="mt-3 text-zinc-400">指定された章は存在しないか、まだ準備中です。</p>
        <Link
          to={PATHS.tutorial}
          className="mt-6 inline-block rounded border border-zinc-800 px-4 py-2 text-sm hover:border-emerald-500/60"
        >
          チュートリアル一覧へ戻る
        </Link>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <p className="text-emerald-400 text-xs uppercase tracking-wide">第 {chapter.id} 章</p>
      <h1 className="mt-1 font-semibold text-2xl">{chapter.title}</h1>
      <p className="mt-3 text-zinc-400 leading-relaxed">
        <FormattedText text={chapter.description} />
      </p>

      <ol className="mt-8 space-y-3">
        {chapter.lessons.map((lesson, i) => {
          const progress = loadProgress(lesson.chapterId, lesson.id)
          const badge = progress?.completed
            ? '完了'
            : progress && progress.completedSteps > 0
              ? '進行中'
              : '未着手'
          return (
            <li key={lesson.id}>
              <Link
                to={toLesson(chapter.id, lesson.id)}
                className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3 transition-colors hover:border-emerald-500/60 hover:bg-zinc-900"
              >
                <div>
                  <p className="text-zinc-100">
                    <span className="text-zinc-500">レッスン {i + 1}: </span>
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
