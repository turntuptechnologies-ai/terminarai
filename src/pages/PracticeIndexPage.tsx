import { Link } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { useLocale } from '../i18n'
import { type Difficulty, loadProgress, PROBLEMS } from '../lessons'
import { toProblem } from '../routes'

const DIFFICULTY_CLASS: Record<Difficulty, string> = {
  easy: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/60',
  medium: 'bg-amber-900/40 text-amber-300 border-amber-700/60',
  hard: 'bg-rose-900/40 text-rose-300 border-rose-700/60',
}

export function PracticeIndexPage() {
  const { t } = useLocale()
  return (
    <PageShell>
      <h1 className="font-semibold text-2xl">{t('practice.title')}</h1>
      <p className="mt-3 text-zinc-400 leading-relaxed">{t('practice.intro')}</p>

      <ol className="mt-8 space-y-3">
        {PROBLEMS.map((p, idx) => {
          const progress = loadProgress('practice', p.id)
          const status = progress?.completed
            ? t('practice.status.solved')
            : t('practice.status.unsolved')
          const statusClass = progress?.completed ? 'text-emerald-400' : 'text-zinc-500'
          return (
            <li key={p.id}>
              <Link
                to={toProblem(p.id)}
                className="block rounded-lg border border-zinc-800 p-4 transition-colors hover:border-emerald-500/60 hover:bg-zinc-900"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-zinc-500 text-xs">
                    {t('practice.problemLabel', { n: idx + 1 })}
                  </span>
                  <span
                    className={`rounded border px-2 py-0.5 text-xs ${
                      DIFFICULTY_CLASS[p.difficulty]
                    }`}
                  >
                    {t(`difficulty.${p.difficulty}`)}
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
    </PageShell>
  )
}
