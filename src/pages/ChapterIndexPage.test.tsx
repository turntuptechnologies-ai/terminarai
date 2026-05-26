import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ChapterIndexPage } from './ChapterIndexPage'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/tutorial/:chapterId" element={<ChapterIndexPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ChapterIndexPage', () => {
  it('登録されていない章は「見つかりません」を表示', () => {
    renderAt('/tutorial/nope')
    expect(screen.getByRole('heading', { name: '章が見つかりません' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /一覧へ戻る/ })).toHaveAttribute('href', '/tutorial')
  })

  it('第1章のレッスン一覧と各レッスンのリンクが表示される', () => {
    renderAt('/tutorial/1')
    expect(screen.getByRole('heading', { name: 'ファイルシステムを覗く' })).toBeInTheDocument()
    // 5 レッスン分のリンクが並ぶ
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(5)
    expect(links.some((l) => l.getAttribute('href') === '/tutorial/1/1-1')).toBe(true)
    expect(links.some((l) => l.getAttribute('href') === '/tutorial/1/1-5')).toBe(true)
  })

  it('未着手レッスンには「未着手」バッジが付く', () => {
    window.localStorage.clear()
    renderAt('/tutorial/1')
    // 5 レッスンすべて未着手なので 5 個ある
    expect(screen.getAllByText('未着手').length).toBe(5)
  })
})
