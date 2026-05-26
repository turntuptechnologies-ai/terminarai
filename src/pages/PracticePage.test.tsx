import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { PracticePage } from './PracticePage'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/practice/:problemId" element={<PracticePage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PracticePage', () => {
  it('登録済み問題 (p1) は PracticeView を描画', () => {
    renderAt('/practice/p1')
    expect(screen.getByRole('heading', { name: /docs ディレクトリへ移動/ })).toBeInTheDocument()
    expect(screen.getByLabelText('ターミナル入力')).toBeInTheDocument()
  })

  it('存在しない問題ID は「見つかりません」', () => {
    renderAt('/practice/nope')
    expect(screen.getByRole('heading', { name: '問題が見つかりません' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /一覧へ戻る/ })).toHaveAttribute('href', '/practice')
  })
})
