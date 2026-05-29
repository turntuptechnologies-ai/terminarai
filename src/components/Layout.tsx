import { NavLink, Outlet } from 'react-router-dom'
import { useLocale } from '../i18n'
import { PATHS } from '../routes'
import { LocaleSwitcher } from './LocaleSwitcher'

const NAV_ITEMS = [
  { to: PATHS.home, key: 'nav.home', end: true },
  { to: PATHS.tutorial, key: 'nav.tutorial', end: false },
  { to: PATHS.practice, key: 'nav.practice', end: false },
  { to: PATHS.sandbox, key: 'nav.sandbox', end: false },
  { to: PATHS.reference, key: 'nav.reference', end: false },
] as const

function navClass({ isActive }: { isActive: boolean }): string {
  const base = 'rounded px-3 py-1.5 text-sm transition-colors whitespace-nowrap'
  return isActive
    ? `${base} bg-zinc-800 text-emerald-400`
    : `${base} text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100`
}

export function Layout() {
  const { t } = useLocale()
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded focus:bg-emerald-500 focus:px-3 focus:py-1.5 focus:text-sm focus:text-zinc-950"
      >
        {t('app.skipToMain')}
      </a>
      <header className="shrink-0 border-zinc-800 border-b">
        <div className="flex flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono font-semibold text-lg text-zinc-100">terminarai</p>
            <p className="text-xs text-zinc-500">{t('app.tagline')}</p>
          </div>
          {/*
            320px 級ではナビが折り返されると視覚的にうるさいので、横スクロールで対応する。
            ナビ自身は単一行を維持し (whitespace-nowrap)、はみ出した分は touch スクロール。
            sm 以上では通常通り並ぶ。
          */}
          <div className="flex items-center gap-2 sm:gap-3">
            <nav
              aria-label={t('nav.aria')}
              className="-mx-2 flex gap-1 overflow-x-auto px-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
            >
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                  {t(item.key)}
                </NavLink>
              ))}
            </nav>
            <LocaleSwitcher />
          </div>
        </div>
      </header>
      {/* 各ページの見出しは <h1> を使う前提 (Layout は banner のみで <h1> は持たない) */}
      <main id="main" tabIndex={-1} className="flex min-h-0 flex-1 flex-col focus:outline-none">
        <Outlet />
      </main>
    </div>
  )
}
