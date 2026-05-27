import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'

/**
 * App レベルのルーティング挙動テスト。
 *
 * React Router v7 のデフォルト挙動:
 * - 末尾スラッシュは無視される (\`/tutorial/\` も \`/tutorial\` も同じルートにマッチ)
 * - パスは case-insensitive (\`/TUTORIAL\` も \`/tutorial\` も同じルートにマッチ)
 *
 * 学習者がブラウザのアドレスバーで typo しても親切に救う挙動なので、
 * このまま現状挙動をロックする (将来 strict にする場合は別途議論)。
 */
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App routing', () => {
  it('/ → HomePage', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: /へようこそ/ })).toBeInTheDocument()
  })

  it('/tutorial → TutorialIndexPage', () => {
    renderAt('/tutorial')
    expect(screen.getByRole('heading', { name: 'チュートリアル', level: 1 })).toBeInTheDocument()
  })

  it('/tutorial/ (末尾スラッシュ) も TutorialIndexPage にマッチ', () => {
    renderAt('/tutorial/')
    expect(screen.getByRole('heading', { name: 'チュートリアル', level: 1 })).toBeInTheDocument()
  })

  it('/TUTORIAL (大文字) も TutorialIndexPage にマッチ (case-insensitive)', () => {
    renderAt('/TUTORIAL')
    expect(screen.getByRole('heading', { name: 'チュートリアル', level: 1 })).toBeInTheDocument()
  })

  it('存在しないパス → NotFoundPage', () => {
    renderAt('/no-such-page')
    expect(screen.getByRole('heading', { name: /ページが見つかりません/ })).toBeInTheDocument()
  })

  it('/tutorial/nope (存在しない章) → ChapterIndexPage の「章が見つかりません」', () => {
    // ルートとしては /tutorial/:chapterId にマッチするが、findChapter が undefined を返す
    // ため、ページレベルで not-found 表示を出す (App の "*" 経由ではなく)
    renderAt('/tutorial/nope')
    expect(screen.getByRole('heading', { name: /章が見つかりません/ })).toBeInTheDocument()
  })

  it('/practice/nope (存在しない問題) → PracticePage の「問題が見つかりません」', () => {
    renderAt('/practice/nope')
    expect(screen.getByRole('heading', { name: /問題が見つかりません/ })).toBeInTheDocument()
  })

  it('深すぎる /tutorial/1/1-1/extra → NotFoundPage', () => {
    renderAt('/tutorial/1/1-1/extra')
    expect(screen.getByRole('heading', { name: /ページが見つかりません/ })).toBeInTheDocument()
  })
})
