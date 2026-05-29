import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Layout } from '../components/Layout'
import { detectLocale, LocaleProvider, translate, useLocale } from './index'

describe('translate', () => {
  it('ロケールごとに文言を返す', () => {
    expect(translate('ja', 'nav.home')).toBe('ホーム')
    expect(translate('en', 'nav.home')).toBe('Home')
  })

  it('{name} プレースホルダを params で置換する', () => {
    expect(translate('ja', 'chapter.label', { id: '3' })).toBe('第 3 章')
    expect(translate('en', 'chapter.label', { id: '3' })).toBe('Chapter 3')
    expect(translate('en', 'step.label', { current: 2, total: 5 })).toBe('Step 2 / 5')
  })

  it('未知キーはキー自身を返す (フォールバック)', () => {
    expect(translate('en', 'totally.missing.key')).toBe('totally.missing.key')
  })
})

describe('detectLocale', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => window.localStorage.clear())

  it('localStorage の保存値を優先する', () => {
    window.localStorage.setItem('terminarai:locale', 'en')
    expect(detectLocale()).toBe('en')
    window.localStorage.setItem('terminarai:locale', 'ja')
    expect(detectLocale()).toBe('ja')
  })

  it('保存値が無ければ navigator.language で判定する (jsdom は en)', () => {
    expect(detectLocale()).toBe('en')
  })
})

function Probe() {
  const { locale, t } = useLocale()
  return <span data-testid="probe">{`${locale}:${t('nav.home')}`}</span>
}

describe('LocaleProvider / useLocale', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => window.localStorage.clear())

  it('保存ロケールで初期化し、<html lang> を同期する', () => {
    window.localStorage.setItem('terminarai:locale', 'ja')
    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>,
    )
    expect(screen.getByTestId('probe')).toHaveTextContent('ja:ホーム')
    expect(document.documentElement.lang).toBe('ja')
  })

  it('Provider 無し (デフォルト) では ja で動く', () => {
    render(<Probe />)
    expect(screen.getByTestId('probe')).toHaveTextContent('ja:ホーム')
  })
})

describe('LocaleSwitcher (Layout 経由)', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => window.localStorage.clear())

  function renderLayout() {
    return render(
      <MemoryRouter>
        <LocaleProvider>
          <Layout />
        </LocaleProvider>
      </MemoryRouter>,
    )
  }

  it('EN に切り替えるとナビが英語化され localStorage に保存される', async () => {
    window.localStorage.setItem('terminarai:locale', 'ja')
    const user = userEvent.setup()
    renderLayout()
    // 初期は日本語ナビ
    expect(screen.getByRole('link', { name: 'ホーム' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'EN' }))

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tutorial' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'ホーム' })).not.toBeInTheDocument()
    expect(window.localStorage.getItem('terminarai:locale')).toBe('en')
    expect(document.documentElement.lang).toBe('en')
  })
})
