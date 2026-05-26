import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PracticeIndexPage } from './PracticeIndexPage'

describe('PracticeIndexPage', () => {
  it('見出しと準備中の案内を表示', () => {
    render(<PracticeIndexPage />)
    expect(screen.getByRole('heading', { name: '自習問題' })).toBeInTheDocument()
    expect(screen.getByText(/現在準備中/)).toBeInTheDocument()
  })
})
