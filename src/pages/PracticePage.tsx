import { Link, useParams } from 'react-router-dom'
import { PracticeView } from '../components/PracticeView'
import { findProblem } from '../lessons'

export function PracticePage() {
  const { problemId } = useParams<{ problemId: string }>()
  const problem = problemId ? findProblem(problemId) : undefined

  if (!problem) {
    return (
      <div className="overflow-y-auto px-6 py-10 text-zinc-100">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-semibold text-2xl">問題が見つかりません</h1>
          <p className="mt-3 text-zinc-400">指定された問題は存在しないか、まだ準備中です。</p>
          <Link
            to="/practice"
            className="mt-6 inline-block rounded border border-zinc-800 px-4 py-2 text-sm hover:border-emerald-500/60"
          >
            自習問題一覧へ戻る
          </Link>
        </div>
      </div>
    )
  }

  return <PracticeView problem={problem} />
}
