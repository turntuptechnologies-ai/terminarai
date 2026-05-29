import { Fragment } from 'react'

interface FormattedTextProps {
  text: string
  /** <code> 要素に渡す追加 className (省略時はデフォルトのバッジ風スタイル) */
  codeClassName?: string
}

const DEFAULT_CODE_CLASS =
  'rounded bg-zinc-800/70 px-1.5 py-0.5 font-mono text-[0.9em] text-emerald-300'

const BOLD_CLASS = 'font-semibold text-zinc-100'

/** code span (`...`) と bold (**...**) を 1 トークンとして切り出す (両者はネストしない前提)。 */
const TOKEN_RE = /(\*\*[^*]+\*\*|`[^`]+`)/g
const CODE_RE = /^`([^`]+)`$/
const BOLD_RE = /^\*\*([^*]+)\*\*$/

/**
 * 文字列中の軽量マークアップを描画する。
 *
 * - バッククォート (`...`) → <code> 要素
 * - 二重アスタリスク (**...**) → <strong> 要素
 *
 * markdown の本格パースはしない。code と bold はネストしない前提で、
 * 閉じない記号 (単一バッククォート等) は通常テキスト扱い。
 *
 * @example
 *   <FormattedText text="`pwd` を実行。**重要**です" />
 *   → <code>pwd</code> を実行。<strong>重要</strong>です
 */
export function FormattedText({ text, codeClassName }: FormattedTextProps) {
  // 分割結果には区切り (code / bold トークン) も交互に含まれる
  const parts = text.split(TOKEN_RE)
  return (
    <>
      {parts.map((part, i) => {
        const code = CODE_RE.exec(part)
        if (code) {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: 静的 split 結果なので index で安定
            <code key={i} className={codeClassName ?? DEFAULT_CODE_CLASS}>
              {code[1]}
            </code>
          )
        }
        const bold = BOLD_RE.exec(part)
        if (bold) {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: 静的 split 結果なので index で安定
            <strong key={i} className={BOLD_CLASS}>
              {bold[1]}
            </strong>
          )
        }
        // biome-ignore lint/suspicious/noArrayIndexKey: 静的 split 結果なので index で安定
        return <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}
