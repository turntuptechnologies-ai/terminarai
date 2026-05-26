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
})
