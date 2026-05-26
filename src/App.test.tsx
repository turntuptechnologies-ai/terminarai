import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App routing', () => {
  it('/ で HomePage が表示される', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: /terminarai へようこそ/ })).toBeInTheDocument()
  })

  it('/sandbox で Terminal が表示される', () => {
    renderAt('/sandbox')
    expect(screen.getByLabelText('ターミナル入力')).toBeInTheDocument()
  })

  it('/tutorial で TutorialIndexPage が表示される', () => {
    renderAt('/tutorial')
    expect(screen.getByRole('heading', { name: 'チュートリアル' })).toBeInTheDocument()
  })

  it('/tutorial/:chapter で ChapterIndexPage が表示される (未登録は「章が見つかりません」)', () => {
    renderAt('/tutorial/nope')
    expect(screen.getByRole('heading', { name: '章が見つかりません' })).toBeInTheDocument()
  })

  it('/tutorial/:chapter/:lesson で LessonPage (未登録は「レッスンが見つかりません」)', () => {
    renderAt('/tutorial/ch1/l1')
    expect(screen.getByRole('heading', { name: 'レッスンが見つかりません' })).toBeInTheDocument()
  })

  it('/practice で PracticeIndexPage が表示される', () => {
    renderAt('/practice')
    expect(screen.getByRole('heading', { name: '自習問題' })).toBeInTheDocument()
  })

  it('/practice/:id で PracticePage が表示される', () => {
    renderAt('/practice/p1')
    expect(screen.getByRole('heading', { name: /問題: p1/ })).toBeInTheDocument()
  })

  it('/reference で ReferencePage が表示される', () => {
    renderAt('/reference')
    expect(
      screen.getByRole('heading', { name: 'クイックリファレンス', level: 1 }),
    ).toBeInTheDocument()
  })

  it('未知のパスは 404 ページ', () => {
    renderAt('/this-does-not-exist')
    expect(screen.getByRole('heading', { name: /ページが見つかりません/ })).toBeInTheDocument()
  })

  it('ヘッダーのナビからページ遷移できる', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await user.click(screen.getByRole('link', { name: 'サンドボックス' }))
    expect(screen.getByLabelText('ターミナル入力')).toBeInTheDocument()
  })

  it('/sandbox 表示中、ホームナビは end 指定で非 active', () => {
    renderAt('/sandbox')
    const home = screen.getByRole('link', { name: 'ホーム' })
    expect(home).not.toHaveAttribute('aria-current')
  })

  it('404 ページから「ホームへ戻る」で / に遷移', async () => {
    const user = userEvent.setup()
    renderAt('/this-does-not-exist')
    await user.click(screen.getByRole('link', { name: 'ホームへ戻る' }))
    expect(screen.getByRole('heading', { name: /terminarai へようこそ/ })).toBeInTheDocument()
  })
})
