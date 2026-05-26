import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LessonPage } from './LessonPage'

describe('LessonPage', () => {
  it('URL の chapterId / lessonId を見出しに反映', () => {
    render(
      <MemoryRouter initialEntries={['/tutorial/ch1/l3']}>
        <Routes>
          <Route path="/tutorial/:chapterId/:lessonId" element={<LessonPage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /ch1 \/ l3/ })).toBeInTheDocument()
  })
})
