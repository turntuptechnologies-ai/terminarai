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
      <header className="shrink-0 border-zinc-800 border-b">
        <div className="flex flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-semibold text-lg text-zinc-100">terminarai</h1>
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
      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
