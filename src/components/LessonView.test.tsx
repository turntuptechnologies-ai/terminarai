import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Lesson } from '../lessons'
import { loadProgress } from '../lessons'
import { LessonView } from './LessonView'

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

function makeLesson(over: Partial<Lesson> = {}): Lesson {
  return {
    id: 'test-lesson',
    chapterId: '1',
    title: 'テスト用レッスン',
    description: 'テスト用の説明文',
    steps: [
      {
        instruction: 'まず pwd を実行してください',
        check: { kind: 'command-matches', pattern: '^pwd$' },
        hints: ['pwd と入力して Enter'],
      },
      {
        instruction: 'docs ディレクトリに移動してください',
        check: { kind: 'cwd-equals', path: '/home/user/docs' },
      },
    ],
    ...over,
  }
}

describe('LessonView', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('タイトル・説明・最初のステップが表示される', () => {
    renderWithRouter(<LessonView lesson={makeLesson()} />)
    expect(screen.getByRole('heading', { name: 'テスト用レッスン' })).toBeInTheDocument()
    expect(screen.getByText('テスト用の説明文')).toBeInTheDocument()
    expect(screen.getByText(/まず pwd を実行/)).toBeInTheDocument()
    expect(screen.getByText(/ステップ 1 \/ 2/)).toBeInTheDocument()
  })

  it('ヒントボタンでヒントが表示・非表示', async () => {
    const user = userEvent.setup()
    renderWithRouter(<LessonView lesson={makeLesson()} />)
    const button = screen.getByRole('button', { name: 'ヒントを見る' })
    await user.click(button)
    expect(screen.getByText('pwd と入力して Enter')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ヒントを隠す' }))
    expect(screen.queryByText('pwd と入力して Enter')).not.toBeInTheDocument()
  })

  it('ステップを満たすコマンドを実行すると次に進む', async () => {
    const user = userEvent.setup()
    renderWithRouter(<LessonView lesson={makeLesson()} />)
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'pwd{Enter}')
    expect(await screen.findByText(/ステップ 2 \/ 2/)).toBeInTheDocument()
    expect(screen.getByText(/docs ディレクトリに移動/)).toBeInTheDocument()
  })

  it('全ステップ完了で完了メッセージ + onComplete 呼び出し', async () => {
    const user = userEvent.setup()
    let completedCalls = 0
    renderWithRouter(<LessonView lesson={makeLesson()} onComplete={() => completedCalls++} />)
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'pwd{Enter}')
    await user.type(input, 'cd docs{Enter}')
    expect(await screen.findByText(/全てのステップをクリア/)).toBeInTheDocument()
    expect(completedCalls).toBe(1)
  })

  it('完了状態は localStorage に保存される (chapterId 含むキー)', async () => {
    const user = userEvent.setup()
    renderWithRouter(<LessonView lesson={makeLesson()} />)
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'pwd{Enter}')
    const after1 = loadProgress('1', 'test-lesson')
    expect(after1?.completedSteps).toBe(1)
    expect(after1?.completed).toBe(false)
    await user.type(input, 'cd docs{Enter}')
    const after2 = loadProgress('1', 'test-lesson')
    expect(after2?.completed).toBe(true)
  })

  it('完了済みレッスンに再訪すると最初から完了表示', () => {
    window.localStorage.setItem(
      'terminarai:progress:1/test-lesson',
      JSON.stringify({ completedSteps: 2, completed: true, updatedAt: 100 }),
    )
    renderWithRouter(<LessonView lesson={makeLesson()} />)
    expect(screen.getByText(/全てのステップをクリア/)).toBeInTheDocument()
  })

  it('lesson prop が変わると state がリセットされる', async () => {
    const user = userEvent.setup()
    const { rerender } = renderWithRouter(<LessonView lesson={makeLesson({ id: 'a' })} />)
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'pwd{Enter}')
    // a のステップ 2/2 に進んでいるはず
    expect(screen.getByText(/ステップ 2 \/ 2/)).toBeInTheDocument()
    rerender(
      <MemoryRouter>
        <LessonView lesson={makeLesson({ id: 'b' })} />
      </MemoryRouter>,
    )
    // b ではステップ 1/2 に戻る
    expect(screen.getByText(/ステップ 1 \/ 2/)).toBeInTheDocument()
  })

  it('Check を満たさないコマンドは進捗が変わらない', async () => {
    const user = userEvent.setup()
    renderWithRouter(<LessonView lesson={makeLesson()} />)
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'ls{Enter}')
    expect(screen.getByText(/ステップ 1 \/ 2/)).toBeInTheDocument()
  })

  it('パンくずで章一覧へのリンクが常に表示される', () => {
    renderWithRouter(<LessonView lesson={makeLesson()} />)
    const link = screen.getByRole('link', { name: /第 1 章/ })
    expect(link).toHaveAttribute('href', '/tutorial/1')
  })

  it('完了時に「章一覧へ戻る」と「次のレッスンへ」or「全章一覧へ」が出る', async () => {
    const user = userEvent.setup()
    // 完了済みフラグを localStorage に直接セットして表示確認
    window.localStorage.setItem(
      'terminarai:progress:1/test-lesson',
      JSON.stringify({ completedSteps: 2, completed: true, updatedAt: 100 }),
    )
    renderWithRouter(<LessonView lesson={makeLesson()} />)
    expect(screen.getByRole('link', { name: /章一覧へ戻る/ })).toBeInTheDocument()
    // test-lesson は registry に無いので findNextLesson は undefined → 「全章一覧へ」
    expect(screen.getByRole('link', { name: /全章一覧へ/ })).toHaveAttribute('href', '/tutorial')
    // user.click を使って動作確認 (ジャンプはしないが link が押下可能)
    await user.click(screen.getByRole('link', { name: /章一覧へ戻る/ }))
  })

  it('ステップ進行でヒント表示がリセットされる', async () => {
    const user = userEvent.setup()
    renderWithRouter(<LessonView lesson={makeLesson()} />)
    await user.click(screen.getByRole('button', { name: 'ヒントを見る' }))
    expect(screen.getByText('pwd と入力して Enter')).toBeInTheDocument()
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'pwd{Enter}')
    // ステップ 2 にはヒントが無い (makeLesson 構成)
    expect(screen.queryByText('pwd と入力して Enter')).not.toBeInTheDocument()
  })
})
