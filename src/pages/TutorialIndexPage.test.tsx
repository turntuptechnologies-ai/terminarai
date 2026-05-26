import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TutorialIndexPage } from './TutorialIndexPage'

describe('TutorialIndexPage', () => {
  it('見出しと準備中の案内を表示', () => {
    render(<TutorialIndexPage />)
    expect(screen.getByRole('heading', { name: 'チュートリアル' })).toBeInTheDocument()
    expect(screen.getByText(/現在準備中/)).toBeInTheDocument()
  })
})
