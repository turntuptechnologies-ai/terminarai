import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { saveProgress } from '../lessons'
import { TutorialIndexPage } from './TutorialIndexPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <TutorialIndexPage />
    </MemoryRouter>,
  )
}

describe('TutorialIndexPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })
  afterEach(() => {
    window.localStorage.clear()
  })

  it('見出しと登録済み章 (第1章) を表示', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'チュートリアル' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'ファイルシステムを覗く' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ファイルシステムを覗く/ })).toHaveAttribute(
      'href',
      '/tutorial/1',
    )
  })

  it('未着手の章は「未着手 (0 / N)」バッジ', () => {
    renderPage()
    expect(screen.getByText(/未着手 \(0 \/ 5\)/)).toBeInTheDocument()
  })

  it('一部進行中なら「進行中 (X / N)」バッジ', () => {
    saveProgress('1', '1-1', { completedSteps: 1, completed: true, updatedAt: 100 })
    saveProgress('1', '1-2', { completedSteps: 1, completed: false, updatedAt: 100 })
    renderPage()
    expect(screen.getByText(/進行中 \(1 \/ 5\)/)).toBeInTheDocument()
  })

  it('全完了なら「完了 (N / N)」バッジ', () => {
    for (const id of ['1-1', '1-2', '1-3', '1-4', '1-5']) {
      saveProgress('1', id, { completedSteps: 5, completed: true, updatedAt: 100 })
    }
    renderPage()
    expect(screen.getByText(/完了 \(5 \/ 5\)/)).toBeInTheDocument()
  })
})
