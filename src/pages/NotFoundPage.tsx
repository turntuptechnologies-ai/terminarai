import { Link } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { useLocale } from '../i18n'
import { PATHS } from '../routes'

export function NotFoundPage() {
  const { t } = useLocale()
  return (
    <PageShell centered>
      <div className="text-center">
        <p aria-hidden="true" className="font-mono text-emerald-400 text-sm">
          404
        </p>
        <h1 className="mt-2 font-semibold text-2xl">{t('notFound.title')}</h1>
        <p className="mt-3 text-zinc-400">{t('notFound.desc')}</p>
        <Link
          to={PATHS.home}
          className="mt-6 inline-block rounded border border-zinc-800 px-4 py-2 text-sm hover:border-emerald-500/60"
        >
          {t('notFound.backHome')}
        </Link>
      </div>
    </PageShell>
  )
}
