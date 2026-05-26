import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10 text-zinc-100">
      <div className="text-center">
        <p className="font-mono text-emerald-400 text-sm">404</p>
        <h2 className="mt-2 font-semibold text-2xl">ページが見つかりません</h2>
        <p className="mt-3 text-zinc-400">指定されたパスは存在しないようです。</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded border border-zinc-800 px-4 py-2 text-sm hover:border-emerald-500/60"
        >
          ホームへ戻る
        </Link>
      </div>
    </div>
  )
}
