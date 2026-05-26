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

  it('cd → cd - で前のディレクトリに戻れる', async () => {
    const user = userEvent.setup()
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'cd docs{Enter}')
    await user.type(input, 'cd -{Enter}')
    await user.type(input, 'pwd{Enter}')
    // cd - の stdout + pwd の stdout で /home/user が pre 要素として最低 2 つ出るはず
    const pres = document.querySelectorAll('pre')
    const homeUserOutputs = Array.from(pres).filter((p) => p.textContent === '/home/user\n')
    expect(homeUserOutputs.length).toBeGreaterThanOrEqual(2)
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

  it('Tab で単一マッチのコマンドが補完される (pw → pwd )', async () => {
    const user = userEvent.setup()
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    const input = screen.getByLabelText('ターミナル入力') as HTMLInputElement
    await user.type(input, 'pw')
    await user.keyboard('{Tab}')
    expect(input.value).toBe('pwd ')
  })

  it('Tab で単一マッチのパスが補完される (cat REA → cat README.txt )', async () => {
    const user = userEvent.setup()
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    const input = screen.getByLabelText('ターミナル入力') as HTMLInputElement
    await user.type(input, 'cat REA')
    await user.keyboard('{Tab}')
    expect(input.value).toBe('cat README.txt ')
  })

  it('Tab でディレクトリは末尾 / が付く (cd do → cd docs/)', async () => {
    const user = userEvent.setup()
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    const input = screen.getByLabelText('ターミナル入力') as HTMLInputElement
    await user.type(input, 'cd do')
    await user.keyboard('{Tab}')
    expect(input.value).toBe('cd docs/')
  })

  it('Tab で複数候補時は履歴に候補一覧を表示', async () => {
    const user = userEvent.setup()
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    const input = screen.getByLabelText('ターミナル入力') as HTMLInputElement
    await user.type(input, 'c')
    await user.keyboard('{Tab}')
    // 入力は変化しない (c は cat/cd/clear/cp の共通プレフィックスで止まる)
    expect(input.value).toBe('c')
    // 履歴に候補が表示される
    expect(await screen.findByText(/cat\s+cd\s+clear\s+cp/)).toBeInTheDocument()
  })

  it('clear コマンドで履歴と banner がクリアされる', async () => {
    const user = userEvent.setup()
    render(
      <Terminal
        shell={shell}
        initialCtx={defaultContext('/home/user')}
        banner="ようこそ banner\n"
      />,
    )
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'pwd{Enter}')
    await user.type(input, 'ls{Enter}')
    // この時点で履歴に pre 要素 (banner + 出力) が複数ある
    expect(document.querySelectorAll('pre').length).toBeGreaterThan(0)

    await user.type(input, 'clear{Enter}')
    // 履歴も banner も消える
    expect(document.querySelectorAll('pre').length).toBe(0)
    expect(screen.queryByText(/ようこそ banner/)).not.toBeInTheDocument()
    // 入力欄は引き続き使える
    expect((screen.getByLabelText('ターミナル入力') as HTMLInputElement).value).toBe('')
  })

  it('clear 自身は履歴遡り (↑) の対象にならない', async () => {
    const user = userEvent.setup()
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    const input = screen.getByLabelText('ターミナル入力') as HTMLInputElement
    await user.type(input, 'pwd{Enter}')
    await user.type(input, 'clear{Enter}')
    // clear 後、↑ で遡ると... clear は履歴に積まないので pwd は遡れない
    // (画面クリア = 跡を残さない仕様)
    await user.type(input, '{ArrowUp}')
    expect(input.value).toBe('')
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

  it('echo (引数なし) は空行 1 つ分の <pre> が描画される', async () => {
    const user = userEvent.setup()
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'echo{Enter}')
    // echo は引数なしでも改行のみ stdout に出す → pre 要素の textContent が '\n'
    const pres = document.querySelectorAll('pre')
    const hasBlankLine = Array.from(pres).some((p) => p.textContent === '\n')
    expect(hasBlankLine).toBe(true)
  })

  it('↑ → 編集 → ↓ で「編集破棄」して元の draft に戻る (bash 互換)', async () => {
    const user = userEvent.setup()
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    const input = screen.getByLabelText('ターミナル入力') as HTMLInputElement
    await user.type(input, 'pwd{Enter}')

    // 入力途中 (draftBeforeNav = 'l') の状態で ↑ を押す
    await user.type(input, 'l')
    expect(input.value).toBe('l')
    await user.type(input, '{ArrowUp}')
    expect(input.value).toBe('pwd')

    // 履歴遡り中に編集する (lpwd になる)
    await user.type(input, 'l')
    expect(input.value).toBe('pwdl')

    // ↓ で履歴カーソルが -1 に戻ったとき、元の draft ('l') が復元される (編集破棄)
    await user.type(input, '{ArrowDown}')
    expect(input.value).toBe('l')
  })

  it('ランドマーク (region) と出力エリア (log) の a11y 構造', () => {
    render(<Terminal shell={shell} initialCtx={defaultContext('/home/user')} />)
    // root は role="region"、出力エリアは role="log" として SR に区別される
    expect(screen.getByRole('region', { name: /仮想ターミナル/ })).toBeInTheDocument()
    expect(screen.getByRole('log', { name: /ターミナル出力/ })).toBeInTheDocument()
  })
})
