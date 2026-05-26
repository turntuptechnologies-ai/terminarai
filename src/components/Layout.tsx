import { NavLink, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'ホーム', end: true },
  { to: '/tutorial', label: 'チュートリアル', end: false },
  { to: '/practice', label: '自習問題', end: false },
  { to: '/sandbox', label: 'サンドボックス', end: false },
] as const

function navClass({ isActive }: { isActive: boolean }): string {
  const base = 'rounded px-3 py-1.5 text-sm transition-colors'
  return isActive
    ? `${base} bg-zinc-800 text-emerald-400`
    : `${base} text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100`
}

export function Layout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded focus:bg-emerald-500 focus:px-3 focus:py-1.5 focus:text-sm focus:text-zinc-950"
      >
        本文へスキップ
      </a>
      <header className="shrink-0 border-zinc-800 border-b">
        <div className="flex flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-lg text-zinc-100">terminarai</p>
            <p className="text-xs text-zinc-500">Linux CLI 見習い道場</p>
          </div>
          <nav aria-label="主要ナビゲーション" className="flex flex-wrap gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      {/* 各ページの見出しは <h1> を使う前提 (Layout は banner のみで <h1> は持たない) */}
      <main id="main" tabIndex={-1} className="flex min-h-0 flex-1 flex-col focus:outline-none">
        <Outlet />
      </main>
    </div>
  )
}
