import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('歓迎メッセージと 3 つの CTA が表示される', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /terminarai へようこそ/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /チュートリアル/ })).toHaveAttribute(
      'href',
      '/tutorial',
    )
    expect(screen.getByRole('link', { name: /自習問題/ })).toHaveAttribute('href', '/practice')
    expect(screen.getByRole('link', { name: /サンドボックス/ })).toHaveAttribute('href', '/sandbox')
  })
})
