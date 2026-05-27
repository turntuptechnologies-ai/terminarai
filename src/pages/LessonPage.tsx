import { Link, useParams } from 'react-router-dom'
import { LessonView } from '../components/LessonView'
import { PageShell } from '../components/PageShell'
import { findLesson } from '../lessons'
import { PATHS } from '../routes'

export function LessonPage() {
  const { chapterId, lessonId } = useParams<{ chapterId: string; lessonId: string }>()
  const lesson = chapterId && lessonId ? findLesson(chapterId, lessonId) : undefined

  if (!lesson) {
    return (
      <PageShell>
        <h1 className="font-semibold text-2xl">レッスンが見つかりません</h1>
        <p className="mt-3 text-zinc-400">指定されたレッスンは存在しないか、まだ準備中です。</p>
        <Link
          to={PATHS.tutorial}
          className="mt-6 inline-block rounded border border-zinc-800 px-4 py-2 text-sm hover:border-emerald-500/60"
        >
          チュートリアル一覧へ戻る
        </Link>
      </PageShell>
    )
  }

  return <LessonView lesson={lesson} />
}
