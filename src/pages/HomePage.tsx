import { Link } from 'react-router-dom'

interface Cta {
  to: string
  title: string
  description: string
}

const CTAS: Cta[] = [
  {
    to: '/tutorial',
    title: 'チュートリアル',
    description: '段階的にレッスンを進めて、Linux の基本コマンドを覚えます。',
  },
  {
    to: '/practice',
    title: '自習問題',
    description: '与えられた課題に挑戦して、覚えたコマンドを試します。',
  },
  {
    to: '/sandbox',
    title: 'サンドボックス',
    description: '自由にコマンドを叩いて遊べる仮想ターミナル。',
  },
]

export function HomePage() {
  return (
    <div className="overflow-y-auto px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-semibold text-3xl text-zinc-100">terminarai へようこそ</h1>
        <p className="mt-4 text-zinc-400 leading-relaxed">
          terminarai は、ブラウザ上でエミュレートされた仮想シェルで Linux の基本コマンドを練習できる
          学習サイトです。本物の Linux 環境に触れる前に、ここで安全に手を動かしてみてください。
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {CTAS.map((cta) => (
            <Link
              key={cta.to}
              to={cta.to}
              className="block rounded-lg border border-zinc-800 p-5 transition-colors hover:border-emerald-500/60 hover:bg-zinc-900"
            >
              <h3 className="font-semibold text-emerald-400">{cta.title}</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{cta.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
