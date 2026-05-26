import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LessonPage } from '../../pages/LessonPage'

describe('chapter1 結合テスト (Terminal 経由)', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })
  afterEach(() => {
    window.localStorage.clear()
  })

  function renderLesson(path: string) {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/tutorial/:chapterId/:lessonId" element={<LessonPage />} />
        </Routes>
      </MemoryRouter>,
    )
  }

  it('1-1: pwd を実行すると完了表示になる', async () => {
    const user = userEvent.setup()
    renderLesson('/tutorial/1/1-1')
    expect(screen.getByText(/ステップ 1 \/ 1/)).toBeInTheDocument()
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'pwd{Enter}')
    expect(await screen.findByText(/全てのステップをクリア/)).toBeInTheDocument()
  })

  it('1-4: cd → pwd の 2 ステップを順に踏む', async () => {
    const user = userEvent.setup()
    renderLesson('/tutorial/1/1-4')
    expect(screen.getByText(/ステップ 1 \/ 2/)).toBeInTheDocument()
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'cd docs{Enter}')
    expect(await screen.findByText(/ステップ 2 \/ 2/)).toBeInTheDocument()
    await user.type(input, 'pwd{Enter}')
    expect(await screen.findByText(/全てのステップをクリア/)).toBeInTheDocument()
  })

  it('1-5: /tmp から開始し、cd でホームに戻ると完了', async () => {
    const user = userEvent.setup()
    renderLesson('/tutorial/1/1-5')
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'cd{Enter}')
    expect(await screen.findByText(/全てのステップをクリア/)).toBeInTheDocument()
  })

  it('1-3: ls -l → ls -a の 2 ステップを順に踏む (1 コマンド 1 ステップ進行)', async () => {
    const user = userEvent.setup()
    renderLesson('/tutorial/1/1-3')
    expect(screen.getByText(/ステップ 1 \/ 2/)).toBeInTheDocument()
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'ls -l{Enter}')
    expect(await screen.findByText(/ステップ 2 \/ 2/)).toBeInTheDocument()
    await user.type(input, 'ls -a{Enter}')
    expect(await screen.findByText(/全てのステップをクリア/)).toBeInTheDocument()
  })

  it('1-1: typo で誤ったコマンドを打ってもステップは進まない', async () => {
    const user = userEvent.setup()
    renderLesson('/tutorial/1/1-1')
    expect(screen.getByText(/ステップ 1 \/ 1/)).toBeInTheDocument()
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'pwdd{Enter}')
    // 完了表示は出ず、依然として「ステップ 1 / 1」
    expect(screen.queryByText(/全てのステップをクリア/)).not.toBeInTheDocument()
    expect(screen.getByText(/ステップ 1 \/ 1/)).toBeInTheDocument()
  })
})
