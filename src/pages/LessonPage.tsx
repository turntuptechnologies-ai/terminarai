import { useParams } from 'react-router-dom'

export function LessonPage() {
  const { chapterId, lessonId } = useParams<{ chapterId: string; lessonId: string }>()
  return (
    <div className="overflow-y-auto px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-semibold text-2xl">
          レッスン: {chapterId} / {lessonId}
        </h1>
        <div className="mt-8 rounded-md border border-zinc-800 border-dashed p-6 text-zinc-500 text-sm">
          このレッスンは準備中です。レッスンエンジン (#6) と章コンテンツ (#7)
          の実装で動くようになります。
        </div>
      </div>
    </div>
  )
}
