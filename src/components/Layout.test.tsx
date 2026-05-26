import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Layout } from './Layout'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div>home-content</div>} />
          <Route path="/tutorial" element={<div>tutorial-content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('Layout', () => {
  it('ヘッダーとナビ、Outlet の子要素を描画', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'terminarai' })).toBeInTheDocument()
    expect(screen.getByText('Linux CLI 見習い道場')).toBeInTheDocument()
    expect(screen.getByText('home-content')).toBeInTheDocument()
  })

  it('全てのナビリンクが表示される', () => {
    renderAt('/')
    for (const label of ['ホーム', 'チュートリアル', '自習問題', 'サンドボックス']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })

  it('現在のページに対応するナビリンクが active 状態', () => {
    renderAt('/tutorial')
    const tutorialLink = screen.getByRole('link', { name: 'チュートリアル' })
    expect(tutorialLink.className).toMatch(/text-emerald-400/)
    expect(tutorialLink.className).toMatch(/bg-zinc-800/)
  })
})
