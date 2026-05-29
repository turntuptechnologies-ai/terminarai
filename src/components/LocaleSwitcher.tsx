import { LOCALES, type Locale, useLocale } from '../i18n'

const SHORT_LABEL: Record<Locale, string> = {
  ja: 'JA',
  en: 'EN',
}

/** ヘッダの言語切替 (JA / EN)。選択中は aria-pressed と配色で示す。 */
export function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale()

  return (
    <div
      role="toolbar"
      aria-label={t('locale.aria')}
      className="flex shrink-0 gap-1 rounded border border-zinc-800 p-0.5"
    >
      {LOCALES.map((l) => {
        const active = l === locale
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={active}
            className={`rounded px-2 py-0.5 text-xs transition-colors ${
              active
                ? 'bg-zinc-800 text-emerald-400'
                : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100'
            }`}
          >
            {SHORT_LABEL[l]}
          </button>
        )
      })}
    </div>
  )
}
