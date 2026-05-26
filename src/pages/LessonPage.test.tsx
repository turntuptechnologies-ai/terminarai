import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LessonPage } from './LessonPage'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/tutorial/:chapterId/:lessonId" element={<LessonPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LessonPage', () => {
  it('登録されていないレッスンは「見つかりません」を表示', () => {
    renderAt('/tutorial/ch1/l3')
    expect(screen.getByRole('heading', { name: 'レッスンが見つかりません' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /一覧へ戻る/ })).toHaveAttribute('href', '/tutorial')
  })

  it('登録済みレッスン (1-1) は LessonView を描画', () => {
    renderAt('/tutorial/1/1-1')
    expect(screen.getByRole('heading', { name: /自分の居場所を知る/ })).toBeInTheDocument()
    expect(screen.getByLabelText('ターミナル入力')).toBeInTheDocument()
  })
})
