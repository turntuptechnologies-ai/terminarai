import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageShell } from './PageShell'

describe('PageShell', () => {
  it('children を描画する', () => {
    render(
      <PageShell>
        <h1>テスト見出し</h1>
      </PageShell>,
    )
    expect(screen.getByRole('heading', { name: 'テスト見出し' })).toBeInTheDocument()
  })

  it('既定は narrow (max-w-3xl) で中央寄せ', () => {
    const { container } = render(
      <PageShell>
        <p>x</p>
      </PageShell>,
    )
    expect(container.querySelector('.max-w-3xl')).not.toBeNull()
    expect(container.querySelector('.max-w-5xl')).toBeNull()
  })

  it('width="wide" で max-w-5xl になる', () => {
    const { container } = render(
      <PageShell width="wide">
        <p>x</p>
      </PageShell>,
    )
    expect(container.querySelector('.max-w-5xl')).not.toBeNull()
    expect(container.querySelector('.max-w-3xl')).toBeNull()
  })

  it('centered=true で flex 中央寄せレイアウトになる', () => {
    const { container } = render(
      <PageShell centered>
        <p>404</p>
      </PageShell>,
    )
    // items-center / justify-center クラスを含む root
    const root = container.firstChild as HTMLElement
    expect(root.className).toMatch(/items-center/)
    expect(root.className).toMatch(/justify-center/)
  })
})
