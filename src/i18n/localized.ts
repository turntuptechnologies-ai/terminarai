import type { Locale } from './messages'

/**
 * 多言語コピー。
 *
 * - **プレーン文字列** = 全ロケール共通 (現状の ja コンテンツはこれ)。
 * - `{ ja, en }` = ロケール別。`en` 省略時は ja にフォールバックする。
 *
 * これにより未訳の本文はそのまま ja で表示され、翻訳を段階的に足せる。
 */
export type LocalizedText = string | { ja: string; en?: string }

/** 多言語リスト (hints 用)。LocalizedText のリスト版。 */
export type LocalizedList = readonly string[] | { ja: readonly string[]; en?: readonly string[] }

/** LocalizedText を現在ロケールの文字列に解決する。en 未指定なら ja。 */
export function loc(text: LocalizedText, locale: Locale): string {
  if (typeof text === 'string') return text
  return locale === 'en' ? (text.en ?? text.ja) : text.ja
}

/** LocalizedList を現在ロケールの配列に解決する。en 未指定なら ja。 */
export function locList(list: LocalizedList, locale: Locale): readonly string[] {
  if (Array.isArray(list)) return list
  const obj = list as { ja: readonly string[]; en?: readonly string[] }
  return locale === 'en' ? (obj.en ?? obj.ja) : obj.ja
}
