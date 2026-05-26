import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LessonPage } from '../../pages/LessonPage'

describe('chapter2 結合テスト (Terminal 経由)', () => {
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

  it('2-1: cat README.txt でクリア', async () => {
    const user = userEvent.setup()
    renderLesson('/tutorial/2/2-1')
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'cat README.txt{Enter}')
    expect(await screen.findByText(/全てのステップをクリア/)).toBeInTheDocument()
  })

  it('2-3: cd .. で /home/user に戻る', async () => {
    const user = userEvent.setup()
    renderLesson('/tutorial/2/2-3')
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'cd ..{Enter}')
    expect(await screen.findByText(/全てのステップをクリア/)).toBeInTheDocument()
  })

  it('2-5: echo hello > greeting.txt → cat greeting.txt の 2 ステップ', async () => {
    const user = userEvent.setup()
    renderLesson('/tutorial/2/2-5')
    expect(screen.getByText(/ステップ 1 \/ 2/)).toBeInTheDocument()
    const input = screen.getByLabelText('ターミナル入力')
    await user.type(input, 'echo hello > greeting.txt{Enter}')
    expect(await screen.findByText(/ステップ 2 \/ 2/)).toBeInTheDocument()
    await user.type(input, 'cat greeting.txt{Enter}')
    expect(await screen.findByText(/全てのステップをクリア/)).toBeInTheDocument()
  })
})
