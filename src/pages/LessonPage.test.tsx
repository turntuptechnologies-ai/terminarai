import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LessonPage } from './LessonPage'

describe('LessonPage', () => {
  it('登録されていないレッスンは「見つかりません」を表示', () => {
    render(
      <MemoryRouter initialEntries={['/tutorial/ch1/l3']}>
        <Routes>
          <Route path="/tutorial/:chapterId/:lessonId" element={<LessonPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'レッスンが見つかりません' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /一覧へ戻る/ })).toHaveAttribute('href', '/tutorial')
  })
})
