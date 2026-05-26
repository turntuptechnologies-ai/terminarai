import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('タイトル "terminarai" が表示される', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'terminarai' })).toBeInTheDocument()
  })

  it('ターミナルとプロンプトが表示される', () => {
    render(<App />)
    expect(screen.getByLabelText('ターミナル入力')).toBeInTheDocument()
    expect(screen.getAllByText('user@terminarai').length).toBeGreaterThan(0)
  })
})
