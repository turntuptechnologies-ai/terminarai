import { useParams } from 'react-router-dom'

export function PracticePage() {
  const { problemId } = useParams<{ problemId: string }>()
  return (
    <div className="overflow-y-auto px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-semibold text-2xl">問題: {problemId}</h2>
        <div
          aria-live="polite"
          className="mt-8 rounded-md border border-zinc-800 border-dashed p-6 text-zinc-500 text-sm"
        >
          この問題は準備中です。レッスンエンジン (#6) の実装で動くようになります。
        </div>
      </div>
    </div>
  )
}
