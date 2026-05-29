import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { type Locale, MESSAGES } from './messages'

const STORAGE_KEY = 'terminarai:locale'

type TParams = Record<string, string | number>

/** `{name}` プレースホルダを params で置換。未知ロケール/キーは ja → key の順でフォールバック。 */
export function translate(locale: Locale, key: string, params?: TParams): string {
  const msg = MESSAGES[locale]?.[key] ?? MESSAGES.ja[key] ?? key
  if (!params) return msg
  return msg.replace(/\{(\w+)\}/g, (_m, name: string) =>
    name in params ? String(params[name]) : `{${name}}`,
  )
}

/** localStorage → navigator.language の順で初期ロケールを決める (ja 始まりなら ja、それ以外 en)。 */
export function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'ja' || saved === 'en') return saved
  } catch {
    // localStorage 不可 (プライベートモード等) は無視してフォールバック
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language : ''
  return nav.toLowerCase().startsWith('ja') ? 'ja' : 'en'
}

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: TParams) => string
}

/**
 * デフォルトは ja 固定。**Provider で包まなくても動く**ため、
 * 既存テスト (個別コンポーネントを provider 無しで render) はそのまま ja で通る。
 * 実アプリでは main.tsx で LocaleProvider が上書きする。
 */
const LocaleContext = createContext<LocaleContextValue>({
  locale: 'ja',
  setLocale: () => {},
  t: (key, params) => translate('ja', key, params),
})

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // 保存失敗はベストエフォートで無視 (セッション内の切替は効く)
    }
  }, [])

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t: (key, params) => translate(locale, key, params) }),
    [locale, setLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext)
}
