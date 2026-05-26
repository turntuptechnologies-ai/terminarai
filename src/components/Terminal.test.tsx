import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { createShell, defaultContext, type Shell } from '../shell'
import { registerAllCommands } from '../shell/commands'
import { createDefaultVfs } from '../vfs'
import { Terminal } from './Terminal'

function setupShell(): Shell {
  const vfs = createDefaultVfs()
  const shell = createShell(vfs)
  registerAllCommands(shell)
  return shell
}

describe('Terminal', () => {
  let shell: Shell

  beforeEach(() => {
    shell = setupShell()
  })

  it('プロンプトと入力欄が表示される', () => {
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    expect(screen.getByLabelText('ターミナル入力')).toBeInTheDocument()
    expect(screen.getByText('user@terminarai')).toBeInTheDocument()
  })

  it('banner があれば初期表示に出る', () => {
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} banner="ようこそ\n" />)
    expect(screen.getByText(/ようこそ/)).toBeInTheDocument()
  })

  it('pwd を実行すると cwd が出力される', async () => {
    const user = userEvent.setup()
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'pwd{Enter}')
    expect(await screen.findByText(/\/home\/user/)).toBeInTheDocument()
  })

  it('cd で cwd が更新され、後続の pwd に反映される', async () => {
    const user = userEvent.setup()
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'cd docs{Enter}')
    await user.type(input, 'pwd{Enter}')
    expect(await screen.findByText('/home/user/docs')).toBeInTheDocument()
  })

  it('未知コマンドは stderr で赤系表示', async () => {
    const user = userEvent.setup()
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'nonexistent{Enter}')
    expect(await screen.findByText(/command not found/)).toBeInTheDocument()
  })

  it('↑ で直前のコマンドを呼び戻し、↓ で空に戻す', async () => {
    const user = userEvent.setup()
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    const input = screen.getByLabelText('ターミナル入力') as HTMLInputElement
    await user.type(input, 'pwd{Enter}')
    expect(input.value).toBe('')

    await user.type(input, '{ArrowUp}')
    expect(input.value).toBe('pwd')

    await user.type(input, '{ArrowDown}')
    expect(input.value).toBe('')
  })

  it('複数履歴: ↑↑ で 2 つ前を呼び戻す', async () => {
    const user = userEvent.setup()
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    const input = screen.getByLabelText('ターミナル入力') as HTMLInputElement
    await user.type(input, 'pwd{Enter}')
    await user.type(input, 'ls{Enter}')

    await user.type(input, '{ArrowUp}')
    expect(input.value).toBe('ls')
    await user.type(input, '{ArrowUp}')
    expect(input.value).toBe('pwd')
  })

  it('ls の出力が表示される', async () => {
    const user = userEvent.setup()
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'ls{Enter}')
    expect(await screen.findByText(/README\.txt/)).toBeInTheDocument()
  })

  it('空 Enter は履歴に積まれず、プロンプトは増えない', async () => {
    const user = userEvent.setup()
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    const before = screen.getAllByText('user@terminarai').length
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, '{Enter}')
    const after = screen.getAllByText('user@terminarai').length
    expect(after).toBe(before)
  })

  it('コンテナクリックで input にフォーカスが戻る', async () => {
    const user = userEvent.setup()
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    const input = screen.getByLabelText('ターミナル入力') as HTMLInputElement
    input.blur()
    expect(document.activeElement).not.toBe(input)
    const container = screen.getByTestId('terminal-root')
    await user.click(container)
    expect(document.activeElement).toBe(input)
  })

  it('↑↑↓ で 1 つ前の履歴に戻れる', async () => {
    const user = userEvent.setup()
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    const input = screen.getByLabelText('ターミナル入力') as HTMLInputElement
    await user.type(input, 'pwd{Enter}')
    await user.type(input, 'ls{Enter}')
    await user.type(input, '{ArrowUp}{ArrowUp}')
    expect(input.value).toBe('pwd')
    await user.type(input, '{ArrowDown}')
    expect(input.value).toBe('ls')
  })

  it('> リダイレクト経由でファイルが書き込まれ、cat で読める (smoke)', async () => {
    const user = userEvent.setup()
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'echo hi > out.txt{Enter}')
    await user.type(input, 'cat out.txt{Enter}')
    // cat の出力は pre 要素として描画される (プロンプト行とは別)
    const pres = document.querySelectorAll('pre')
    const hasHi = Array.from(pres).some((p) => p.textContent === 'hi\n')
    expect(hasHi).toBe(true)
  })
})
