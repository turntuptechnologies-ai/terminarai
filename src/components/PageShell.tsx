import type { ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
  /**
   * 中央寄せの max 幅。読み物中心のページは "narrow" (max-w-3xl)、
   * 横幅を使うページは "wide" (max-w-5xl)。省略時は "narrow"。
   */
  width?: 'narrow' | 'wide'
  /** 中央寄せをやめて中身を full-bleed にする (NotFoundPage 等)。 */
  centered?: boolean
}

/**
 * テキスト中心ページの共通ラッパ。
 *
 * - 縦スクロール所有を Layout から各ページ (= ここ) に降ろし、
 *   ターミナル系ページ (LessonView / PracticeView / SandboxPage) と所有を一致させる
 * - DRY 化: `overflow-y-auto px-6 py-10 text-zinc-100` + `mx-auto max-w-3xl` の 2 重ラップを 1 つに
 *
 * 注: ターミナル系ページは固定高でスクロールを Terminal 内部に持たせるため、
 *     PageShell は使わない。
 */
export function PageShell({ children, width = 'narrow', centered = false }: PageShellProps) {
  const maxW = width === 'wide' ? 'max-w-5xl' : 'max-w-3xl'

  if (centered) {
    return (
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-10 text-zinc-100">
        <div className={`mx-auto ${maxW}`}>{children}</div>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto px-6 py-10 text-zinc-100">
      <div className={`mx-auto ${maxW}`}>{children}</div>
    </div>
  )
}
