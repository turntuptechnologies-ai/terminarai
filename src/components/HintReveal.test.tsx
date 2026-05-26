import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { HintReveal } from './HintReveal'

/**
 * HintReveal は state を親 (LessonView / PracticeView) が持つ設計のため、
 * テスト用に薄いラッパーで state を持たせて挙動を確認する。
 */
function Harness({ hints }: { hints: string[] }) {
  const [revealed, setRevealed] = useState(0)
  return (
    <HintReveal
      hints={hints}
      revealed={revealed}
      onReveal={() => setRevealed((n) => (n < hints.length ? n + 1 : 0))}
    />
  )
}

describe('HintReveal', () => {
  it('未開示時はヒントを出さない', () => {
    render(<Harness hints={['一段目', '二段目']} />)
    expect(screen.queryByText('一段目')).not.toBeInTheDocument()
    expect(screen.queryByText('二段目')).not.toBeInTheDocument()
  })

  it('単一ヒント: クリックで開示、もう一度で隠す (トグル)', async () => {
    const user = userEvent.setup()
    render(<Harness hints={['唯一のヒント']} />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveTextContent('ヒントを見る')

    await user.click(btn)
    expect(screen.getByText('唯一のヒント')).toBeInTheDocument()
    expect(btn).toHaveTextContent('ヒントを隠す')

    await user.click(btn)
    expect(screen.queryByText('唯一のヒント')).not.toBeInTheDocument()
    expect(btn).toHaveTextContent('ヒントを見る')
  })

  it('多段ヒント: 1 段ずつ開示し、最終段で「隠す」に変わる', async () => {
    const user = userEvent.setup()
    render(<Harness hints={['第一段', '第二段', '第三段']} />)
    const btn = screen.getByRole('button')

    // 0 → 1
    expect(btn).toHaveTextContent('ヒントを見る')
    await user.click(btn)
    expect(screen.getByText('第一段')).toBeInTheDocument()
    expect(screen.queryByText('第二段')).not.toBeInTheDocument()
    expect(btn).toHaveTextContent('次のヒント (1 / 3)')

    // 1 → 2
    await user.click(btn)
    expect(screen.getByText('第二段')).toBeInTheDocument()
    expect(screen.queryByText('第三段')).not.toBeInTheDocument()
    expect(btn).toHaveTextContent('次のヒント (2 / 3)')

    // 2 → 3 (全部)
    await user.click(btn)
    expect(screen.getByText('第三段')).toBeInTheDocument()
    expect(btn).toHaveTextContent('ヒントを隠す')

    // 3 → 0 (リセット)
    await user.click(btn)
    expect(screen.queryByText('第一段')).not.toBeInTheDocument()
    expect(btn).toHaveTextContent('ヒントを見る')
  })

  it('aria-expanded が開示状態を反映する', async () => {
    const user = userEvent.setup()
    render(<Harness hints={['hint']} />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    await user.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
  })
})
