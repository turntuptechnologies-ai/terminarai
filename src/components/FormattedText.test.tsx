import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormattedText } from './FormattedText'

describe('FormattedText', () => {
  it('バッククォートが無いテキストはそのまま描画', () => {
    render(<FormattedText text="プレーンなテキスト" />)
    expect(screen.getByText('プレーンなテキスト')).toBeInTheDocument()
    expect(document.querySelectorAll('code').length).toBe(0)
  })

  it('バッククォート囲みは <code> として描画', () => {
    render(<FormattedText text="`pwd` を実行" />)
    const code = document.querySelector('code')
    expect(code?.textContent).toBe('pwd')
  })

  it('複数のバッククォートを正しく分離', () => {
    render(<FormattedText text="`cd` で `~/docs` へ移動" />)
    const codes = document.querySelectorAll('code')
    expect(codes.length).toBe(2)
    expect(codes[0].textContent).toBe('cd')
    expect(codes[1].textContent).toBe('~/docs')
  })

  it('閉じないバッククォートは literal text 扱い', () => {
    render(<FormattedText text="`pwd だけ" />)
    expect(document.querySelectorAll('code').length).toBe(0)
  })

  it('codeClassName でスタイル差し替え可', () => {
    render(<FormattedText text="`pwd`" codeClassName="custom-class" />)
    const code = document.querySelector('code')
    expect(code?.className).toBe('custom-class')
  })

  it('空文字列でも壊れない', () => {
    const { container } = render(<FormattedText text="" />)
    expect(container.textContent).toBe('')
  })
})
