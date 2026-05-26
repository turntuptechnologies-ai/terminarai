import { Fragment } from 'react'

interface FormattedTextProps {
  text: string
  /** <code> 要素に渡す追加 className (省略時はデフォルトのバッジ風スタイル) */
  codeClassName?: string
}

const DEFAULT_CODE_CLASS =
  'rounded bg-zinc-800/70 px-1.5 py-0.5 font-mono text-[0.9em] text-emerald-300'

/**
 * 文字列中のバッククォート (`...`) で囲まれた部分を <code> 要素として描画する。
 *
 * 現状はバッククォートのみサポート (markdown の本格パースはしない)。
 * 単一バッククォート (閉じない) は通常テキスト扱い。
 *
 * @example
 *   <FormattedText text="`pwd` を実行してください" />
 *   → <code>pwd</code> を実行してください
 */
export function FormattedText({ text, codeClassName }: FormattedTextProps) {
  // 偶数番目: 通常テキスト、奇数番目: code として描画
  const parts = text.split(/`([^`]+)`/g)
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) {
          // biome-ignore lint/suspicious/noArrayIndexKey: 静的 split 結果なので index で安定
          return <Fragment key={i}>{part}</Fragment>
        }
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: 静的 split 結果なので index で安定
          <code key={i} className={codeClassName ?? DEFAULT_CODE_CLASS}>
            {part}
          </code>
        )
      })}
    </>
  )
}
