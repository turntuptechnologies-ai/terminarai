/**
 * head/tail の行抽出ロジック。
 *
 * - `content` の末尾改行の扱いを統一する:
 *   - 末尾に `\n` があれば、最後の split element は空文字なので捨てる
 *   - なければ最終要素もそのまま 1 行扱い
 * - 抽出後は join して最終行に必ず `\n` を付ける (学習用途で扱いやすさを優先)
 */
export function extractLines(content: string, n: number, kind: 'head' | 'tail'): string {
  if (content === '' || n === 0) return ''
  const parts = content.split('\n')
  const trailingNewline = content.endsWith('\n')
  const lines = trailingNewline ? parts.slice(0, -1) : parts
  // `slice(-0)` は `slice(0)` と等価 (全件返却) になってしまう。n=0 は上で早期 return 済み。
  const selected = kind === 'head' ? lines.slice(0, n) : lines.slice(-n)
  if (selected.length === 0) return ''
  return `${selected.join('\n')}\n`
}
