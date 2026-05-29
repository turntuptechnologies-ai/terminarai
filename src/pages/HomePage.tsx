import { Link } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { useLocale } from '../i18n'

const CTAS = [
  { to: '/tutorial', titleKey: 'nav.tutorial', descKey: 'home.cta.tutorial.desc' },
  { to: '/practice', titleKey: 'nav.practice', descKey: 'home.cta.practice.desc' },
  { to: '/sandbox', titleKey: 'nav.sandbox', descKey: 'home.cta.sandbox.desc' },
] as const

export function HomePage() {
  const { t } = useLocale()
  return (
    <PageShell>
      <h1 className="font-semibold text-3xl text-zinc-100">
        {t('home.welcomeBefore')}
        <span className="font-mono">terminarai</span>
        {t('home.welcomeAfter')}
      </h1>
      <p className="mt-4 text-zinc-400 leading-relaxed">{t('home.intro')}</p>

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
            <h3 className="font-semibold text-emerald-400">{t(cta.titleKey)}</h3>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{t(cta.descKey)}</p>
          </Link>
        ))}
      </div>
    </PageShell>
  )
}
