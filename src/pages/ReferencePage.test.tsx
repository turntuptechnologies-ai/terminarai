import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ReferencePage } from './ReferencePage'

describe('ReferencePage', () => {
  it('見出しと主要セクションが表示される', () => {
    render(<ReferencePage />)
    expect(
      screen.getByRole('heading', { name: 'クイックリファレンス', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'ナビゲーション', level: 2 })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'ファイルとディレクトリの管理', level: 2 }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'シェルの機能', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '未対応の機能', level: 2 })).toBeInTheDocument()
  })

  it('実装済みコマンド全てが掲載されている', () => {
    render(<ReferencePage />)
    for (const cmd of [
      'pwd',
      'ls',
      'cd',
      'cat',
      'echo',
      'mkdir',
      'touch',
      'cp',
      'mv',
      'rm',
      'clear',
    ]) {
      // <code> 要素として表示される
      const codes = document.querySelectorAll('code')
      const found = Array.from(codes).some((el) => el.textContent === cmd)
      expect(found, `${cmd} が掲載されている`).toBe(true)
    }
  })

  it('未対応の機能 (パイプなど) が明示されている', () => {
    render(<ReferencePage />)
    expect(screen.getByText(/パイプ/)).toBeInTheDocument()
    expect(screen.getByText(/find/)).toBeInTheDocument()
  })
})
