import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { SandboxPage } from './SandboxPage'

describe('SandboxPage', () => {
  it('Terminal が表示される', () => {
    render(<SandboxPage />)
    expect(screen.getByLabelText('ターミナル入力')).toBeInTheDocument()
    expect(screen.getByText(/サンドボックスへようこそ/)).toBeInTheDocument()
  })

  it('ls が正しく動く (整合性スモーク)', async () => {
    const user = userEvent.setup()
    render(<SandboxPage />)
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'ls{Enter}')
    // banner にも "cat README.txt" の例が含まれるので、ls 出力 pre を直接確認する
    const pres = document.querySelectorAll('pre')
    const lsOutput = Array.from(pres).find((p) => p.textContent === 'README.txt\ndocs\nhello.txt\n')
    expect(lsOutput).toBeTruthy()
  })
})
