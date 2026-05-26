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

  it('/tutorial/:chapter/:lesson で LessonPage が表示される', () => {
    renderAt('/tutorial/ch1/l1')
    expect(screen.getByRole('heading', { name: /ch1 \/ l1/ })).toBeInTheDocument()
  })

  it('/practice で PracticeIndexPage が表示される', () => {
    renderAt('/practice')
    expect(screen.getByRole('heading', { name: '自習問題' })).toBeInTheDocument()
  })

  it('/practice/:id で PracticePage が表示される', () => {
    renderAt('/practice/p1')
    expect(screen.getByRole('heading', { name: /問題: p1/ })).toBeInTheDocument()
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
})
