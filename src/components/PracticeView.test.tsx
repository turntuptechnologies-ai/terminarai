import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { loadProgress, type Problem } from '../lessons'
import { PracticeView } from './PracticeView'

function makeProblem(over: Partial<Problem> = {}): Problem {
  return {
    id: 'test-problem',
    title: 'テスト問題',
    description: 'テスト用の問題文 (`pwd` を実行)',
    difficulty: 'easy',
    tags: ['pwd'],
    steps: [
      {
        instruction: 'pwd を実行してください。',
        hints: ['`pwd` と打ちます。'],
        check: { kind: 'command-matches', pattern: '^\\s*pwd\\b' },
      },
    ],
    ...over,
  }
}

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('PracticeView', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })
  afterEach(() => {
    window.localStorage.clear()
  })

  it('タイトル・難易度・タグ・問題文が表示される', () => {
    renderWithRouter(<PracticeView problem={makeProblem()} />)
    expect(screen.getByRole('heading', { name: 'テスト問題' })).toBeInTheDocument()
    expect(screen.getByText('初級')).toBeInTheDocument()
    // tag は <code>pwd</code> として表示
    expect(document.querySelector('code')?.textContent).toContain('pwd')
    expect(screen.getByText(/テスト用の問題文/)).toBeInTheDocument()
  })

  it('パンくずに自習問題一覧へのリンクがある', () => {
    renderWithRouter(<PracticeView problem={makeProblem()} />)
    expect(screen.getByRole('link', { name: '自習問題' })).toHaveAttribute('href', '/practice')
  })

  it('条件を満たすコマンドを実行するとクリア状態に', async () => {
    const user = userEvent.setup()
    renderWithRouter(<PracticeView problem={makeProblem()} />)
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'pwd{Enter}')
    expect(await screen.findByText(/問題を解きました/)).toBeInTheDocument()
  })

  it('クリア後に「問題一覧へ戻る」リンクが出る', async () => {
    const user = userEvent.setup()
    renderWithRouter(<PracticeView problem={makeProblem()} />)
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'pwd{Enter}')
    expect(await screen.findByRole('link', { name: /問題一覧へ戻る/ })).toHaveAttribute(
      'href',
      '/practice',
    )
  })

  it('進捗が localStorage に保存される (practice 名前空間)', async () => {
    const user = userEvent.setup()
    renderWithRouter(<PracticeView problem={makeProblem()} />)
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'pwd{Enter}')
    const progress = loadProgress('practice', 'test-problem')
    expect(progress?.completed).toBe(true)
  })

  it('解答済の問題を再訪すると最初から完了表示', () => {
    window.localStorage.setItem(
      'terminarai:progress:practice/test-problem',
      JSON.stringify({ completedSteps: 1, completed: true, updatedAt: 100 }),
    )
    renderWithRouter(<PracticeView problem={makeProblem()} />)
    expect(screen.getByText(/問題を解きました/)).toBeInTheDocument()
  })

  it('単一ステップの問題ではステップ表示が出ない', () => {
    renderWithRouter(<PracticeView problem={makeProblem()} />)
    // ステップ 1 / 1 の表記は単一ステップなら出ない
    expect(screen.queryByText(/ステップ \d+ \/ \d+/)).not.toBeInTheDocument()
  })
})
