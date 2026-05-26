import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { saveProgress } from '../lessons'
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

  it('見出しと問題一覧 (5 問) が表示される', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: '自習問題' })).toBeInTheDocument()
    // 5 問分の link が並ぶ
    const links = screen.getAllByRole('link')
    expect(links.length).toBe(5)
    expect(links[0]).toHaveAttribute('href', '/practice/p1')
    expect(links[4]).toHaveAttribute('href', '/practice/p5')
  })

  it('未挑戦バッジが付く', () => {
    renderPage()
    expect(screen.getAllByText('未挑戦').length).toBe(5)
  })

  it('解答済の問題には「解答済」バッジが付く', () => {
    saveProgress('practice', 'p1', { completedSteps: 1, completed: true, updatedAt: 100 })
    renderPage()
    expect(screen.getByText('解答済')).toBeInTheDocument()
    expect(screen.getAllByText('未挑戦').length).toBe(4)
  })

  it('難易度バッジが表示される (初級が複数、中級も)', () => {
    renderPage()
    expect(screen.getAllByText('初級').length).toBeGreaterThan(0)
    expect(screen.getAllByText('中級').length).toBeGreaterThan(0)
  })
})
