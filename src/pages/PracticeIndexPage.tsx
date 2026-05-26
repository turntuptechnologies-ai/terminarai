import { Link } from 'react-router-dom'
import { type Difficulty, loadProgress, PROBLEMS } from '../lessons'

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

export function PracticeIndexPage() {
  return (
    <div className="overflow-y-auto px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-semibold text-2xl">自習問題</h1>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          チュートリアルで覚えたコマンドを、お題に挑戦する形で力試しします。
          手詰まったらヒントを開いて構いません。
        </p>

        <ol className="mt-8 space-y-3">
          {PROBLEMS.map((p, idx) => {
            const progress = loadProgress('practice', p.id)
            const status = progress?.completed ? '解答済' : '未挑戦'
            const statusClass = progress?.completed ? 'text-emerald-400' : 'text-zinc-500'
            return (
              <li key={p.id}>
                <Link
                  to={`/practice/${p.id}`}
                  className="block rounded-lg border border-zinc-800 p-4 transition-colors hover:border-emerald-500/60 hover:bg-zinc-900"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-zinc-500 text-xs">問題 {idx + 1}</span>
                    <span
                      className={`rounded border px-2 py-0.5 text-xs ${
                        DIFFICULTY_CLASS[p.difficulty]
                      }`}
                    >
                      {DIFFICULTY_LABEL[p.difficulty]}
                    </span>
                    {p.tags.map((tag) => (
                      <code
                        key={tag}
                        className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-400"
                      >
                        {tag}
                      </code>
                    ))}
                    <span className={`ml-auto text-xs ${statusClass}`}>{status}</span>
                  </div>
                  <p className="mt-2 font-semibold text-zinc-100">{p.title}</p>
                </Link>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
