import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LessonPage } from '../../pages/LessonPage'

describe('chapter3 結合テスト (Terminal 経由)', () => {
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

  it('3-1: mkdir myfolder でクリア', async () => {
    const user = userEvent.setup()
    renderLesson('/tutorial/3/3-1')
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'mkdir myfolder{Enter}')
    expect(await screen.findByText(/全てのステップをクリア/)).toBeInTheDocument()
  })

  it('3-2: mkdir -p project/src/lib でクリア', async () => {
    const user = userEvent.setup()
    renderLesson('/tutorial/3/3-2')
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'mkdir -p project/src/lib{Enter}')
    expect(await screen.findByText(/全てのステップをクリア/)).toBeInTheDocument()
  })

  it('3-4: mv hello.txt greeting.txt → mv greeting.txt docs/ の 2 ステップ', async () => {
    const user = userEvent.setup()
    renderLesson('/tutorial/3/3-4')
    expect(screen.getByText(/ステップ 1 \/ 2/)).toBeInTheDocument()
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'mv hello.txt greeting.txt{Enter}')
    expect(await screen.findByText(/ステップ 2 \/ 2/)).toBeInTheDocument()
    await user.type(input, 'mv greeting.txt docs/{Enter}')
    expect(await screen.findByText(/全てのステップをクリア/)).toBeInTheDocument()
  })

  it('3-5: rm hello.txt → rm -r docs の 2 ステップ', async () => {
    const user = userEvent.setup()
    renderLesson('/tutorial/3/3-5')
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'rm hello.txt{Enter}')
    expect(await screen.findByText(/ステップ 2 \/ 2/)).toBeInTheDocument()
    // rm docs (without -r) は失敗するはず
    await user.type(input, 'rm docs{Enter}')
    expect(screen.queryByText(/全てのステップをクリア/)).not.toBeInTheDocument()
    // rm -r docs で成功
    await user.type(input, 'rm -r docs{Enter}')
    expect(await screen.findByText(/全てのステップをクリア/)).toBeInTheDocument()
  })
})
