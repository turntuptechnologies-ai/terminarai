import { useLocale } from '../i18n'
import { FormattedText } from './FormattedText'

interface HintRevealProps {
  hints: readonly string[]
  /** 開示済み件数 (0 = 未表示、N = 全部表示) */
  revealed: number
  /** クリック時の遷移は親が制御する (revealed < total なら +1、= total なら 0 に戻す) */
  onReveal: () => void
}

/**
 * 多段ヒントの開示 UI。
 *
 * - 0 件開示中 → ボタン「ヒントを見る」
 * - 1..N-1 件開示中 → ボタン「次のヒント (n / total)」
 * - N 件 (全部) 開示中 → ボタン「ヒントを隠す」
 *
 * 単一ヒント (hints.length === 1) の場合は「ヒントを見る」 ⇔ 「ヒントを隠す」のトグルに退化する。
 */
export function HintReveal({ hints, revealed, onReveal }: HintRevealProps) {
  const { t } = useLocale()
  const total = hints.length
  const label =
    revealed === 0
      ? t('hint.show')
      : revealed < total
        ? t('hint.next', { revealed, total })
        : t('hint.hide')

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={onReveal}
        aria-expanded={revealed > 0}
        className="text-sky-400 text-xs underline-offset-2 hover:underline"
      >
        {label}
      </button>
      {revealed > 0 && (
        <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-zinc-400">
          {hints.slice(0, revealed).map((h, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 静的 hints 配列の index は安定
            <li key={i}>
              <FormattedText text={h} />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
