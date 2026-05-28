import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PROBLEMS, saveProgress } from '../lessons'
import { PracticeIndexPage } from './PracticeIndexPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <PracticeIndexPage />
    </MemoryRouter>,
  )
}

describe('PracticeIndexPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })
  afterEach(() => {
    window.localStorage.clear()
  })

  it('見出しと問題一覧 (全問) が表示される', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: '自習問題' })).toBeInTheDocument()
    // PROBLEMS 全問分の link が順に並ぶ
    const links = screen.getAllByRole('link')
    expect(links.length).toBe(PROBLEMS.length)
    expect(links[0]).toHaveAttribute('href', '/practice/p1')
    expect(links[PROBLEMS.length - 1]).toHaveAttribute('href', `/practice/${PROBLEMS.at(-1)?.id}`)
  })

  it('未挑戦バッジが付く', () => {
    renderPage()
    expect(screen.getAllByText('未挑戦').length).toBe(PROBLEMS.length)
  })

  it('解答済の問題には「解答済」バッジが付く', () => {
    saveProgress('practice', 'p1', { completedSteps: 1, completed: true, updatedAt: 100 })
    renderPage()
    expect(screen.getByText('解答済')).toBeInTheDocument()
    expect(screen.getAllByText('未挑戦').length).toBe(PROBLEMS.length - 1)
  })

  it('難易度バッジが表示される (初級が複数、中級も)', () => {
    renderPage()
    expect(screen.getAllByText('初級').length).toBeGreaterThan(0)
    expect(screen.getAllByText('中級').length).toBeGreaterThan(0)
  })
})
