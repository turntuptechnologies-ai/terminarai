import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { TutorialIndexPage } from './TutorialIndexPage'

describe('TutorialIndexPage', () => {
  it('見出しと登録済み章 (第1章) を表示', () => {
    render(
      <MemoryRouter>
        <TutorialIndexPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'チュートリアル' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'ファイルシステムを覗く' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ファイルシステムを覗く/ })).toHaveAttribute(
      'href',
      '/tutorial/1',
    )
  })
})
