import { Link } from 'react-router-dom'
import { PageShell } from '../components/PageShell'

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
    <PageShell>
      <h1 className="font-semibold text-3xl text-zinc-100">
        <span className="font-mono">terminarai</span> へようこそ
      </h1>
      <p className="mt-4 text-zinc-400 leading-relaxed">
        terminarai は、ブラウザ上でエミュレートされた仮想シェルで Linux の基本コマンドを練習できる
        学習サイトです。本物の Linux 環境に触れる前に、ここで安全に手を動かしてみてください。
      </p>

      {/*
        sm (640px) で 3 列に。それ未満は 1 列のスタック (各カードが自然な縦長で読みやすい)。
        間に md 区分を入れていないのは、3 → 2 列 → 1 列の中間ジャンプがむしろチラつくため。
      */}
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
    </PageShell>
  )
}
