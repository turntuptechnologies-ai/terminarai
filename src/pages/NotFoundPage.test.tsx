import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { NotFoundPage } from './NotFoundPage'

describe('NotFoundPage', () => {
  it('404 メッセージとホームへのリンクを表示', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /ページが見つかりません/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ホームへ戻る' })).toHaveAttribute('href', '/')
  })
})
