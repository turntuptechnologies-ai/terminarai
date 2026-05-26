import { Link } from 'react-router-dom'
import { FormattedText } from '../components/FormattedText'
import { CHAPTERS, type ChapterStatus, computeChapterProgress } from '../lessons'

const STATUS_LABEL: Record<ChapterStatus, string> = {
  untouched: '未着手',
  'in-progress': '進行中',
  completed: '完了',
}

const STATUS_CLASS: Record<ChapterStatus, string> = {
  untouched: 'text-zinc-500',
  'in-progress': 'text-sky-400',
  completed: 'text-emerald-400',
}

export function TutorialIndexPage() {
  return (
    <div className="overflow-y-auto px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-semibold text-2xl">チュートリアル</h1>
        <p className="mt-3 text-zinc-400">
          順を追って Linux
          の基本コマンドを学べます。各レッスンには課題があり、クリアすると次に進めます。
        </p>

        {CHAPTERS.length === 0 ? (
          <div className="mt-8 rounded-md border border-zinc-800 border-dashed p-6 text-zinc-500 text-sm">
            現在準備中です。
          </div>
        ) : (
          <ol className="mt-8 space-y-3">
            {CHAPTERS.map((ch) => {
              const progress = computeChapterProgress(ch)
              return (
                <li key={ch.id}>
                  <Link
                    to={`/tutorial/${ch.id}`}
                    className="block rounded-lg border border-zinc-800 p-5 transition-colors hover:border-emerald-500/60 hover:bg-zinc-900"
                  >
                    <p className="text-emerald-400 text-xs uppercase tracking-wide">
                      第 {ch.id} 章
                    </p>
                    <h2 className="mt-1 font-semibold text-zinc-100">{ch.title}</h2>
                    <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                      <FormattedText text={ch.description} />
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-zinc-500">全 {ch.lessons.length} レッスン</span>
                      <span className={STATUS_CLASS[progress.status]}>
                        {STATUS_LABEL[progress.status]} ({progress.completed} / {progress.total})
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}
