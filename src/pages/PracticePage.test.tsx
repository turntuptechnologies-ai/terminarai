import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { PracticePage } from './PracticePage'

describe('PracticePage', () => {
  it('URL の problemId を見出しに反映', () => {
    render(
      <MemoryRouter initialEntries={['/practice/p1']}>
        <Routes>
          <Route path="/practice/:problemId" element={<PracticePage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /問題: p1/ })).toBeInTheDocument()
  })
})
