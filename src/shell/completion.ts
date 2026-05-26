import type { Vfs } from '../vfs'

export interface CompletionResult {
  /** 補完後の入力文字列。変化がなければ元の input と同じ。 */
  newInput: string
  /**
   * マッチした候補一覧。ディレクトリ末尾には `/` が付く。
   * - 0 件: マッチなし
   * - 1 件: newInput に既に反映済み (補完完了)
   * - 2 件以上: 共通プレフィックスまで newInput に反映、表示用に候補を返す
   */
  candidates: string[]
}

/**
 * 入力文字列に対する Tab 補完を実行する。
 *
 * - 先頭の単語 (スペース以前) は登録済みコマンドから補完
 * - スペース以降の単語は VFS からパス補完
 * - 補完できる場合は newInput を更新、できない場合は元の input を返す
 */
export function complete(
  input: string,
  cwd: string,
  registered: Iterable<string>,
  vfs: Vfs,
): CompletionResult {
  const lastSpaceIdx = input.lastIndexOf(' ')
  const wordStart = lastSpaceIdx + 1
  const word = input.slice(wordStart)
  const prefix = input.slice(0, wordStart)

  if (lastSpaceIdx === -1) {
    return completeCommand(input, prefix, word, registered)
  }
  return completePath(input, prefix, word, cwd, vfs)
}

function completeCommand(
  input: string,
  prefix: string,
  word: string,
  registered: Iterable<string>,
): CompletionResult {
  const matches = [...registered].filter((n) => n.startsWith(word)).sort()
  if (matches.length === 0) return { newInput: input, candidates: [] }
  if (matches.length === 1) {
    return { newInput: `${prefix + matches[0]} `, candidates: matches }
  }
  const common = longestCommonPrefix(matches)
  if (common.length > word.length) {
    return { newInput: prefix + common, candidates: matches }
  }
  return { newInput: input, candidates: matches }
}

function completePath(
  input: string,
  prefix: string,
  word: string,
  cwd: string,
  vfs: Vfs,
): CompletionResult {
  const { dirPart, base } = splitForCompletion(word)
  const dirAbs = dirPart === '' ? cwd : vfs.resolve(cwd, dirPart)
  const listResult = vfs.list(dirAbs)
  if (!listResult.ok) return { newInput: input, candidates: [] }

  // bash 互換: base が空または `.` で始まらないとき、隠しファイル (`.` で始まる) を除外
  const showHidden = base.startsWith('.')
  const matched = listResult.value
    .filter((n) => n.name.startsWith(base))
    .filter((n) => showHidden || !n.name.startsWith('.'))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))

  if (matched.length === 0) return { newInput: input, candidates: [] }

  const candidates = matched.map((n) => n.name + (n.type === 'directory' ? '/' : ''))

  if (matched.length === 1) {
    const m = matched[0]
    const newWord = reconstructPath(dirPart, m.name, m.type === 'directory')
    return { newInput: prefix + newWord, candidates }
  }

  const commonName = longestCommonPrefix(matched.map((n) => n.name))
  if (commonName.length > base.length) {
    const newWord = joinDirPartAndBase(dirPart, commonName)
    return { newInput: prefix + newWord, candidates }
  }
  return { newInput: input, candidates }
}

/** 末尾の `/` 位置で word を `dirPart` + `base` に分割する。 */
export function splitForCompletion(word: string): { dirPart: string; base: string } {
  const slashIdx = word.lastIndexOf('/')
  if (slashIdx === -1) return { dirPart: '', base: word }
  if (slashIdx === 0) return { dirPart: '/', base: word.slice(1) }
  return { dirPart: word.slice(0, slashIdx), base: word.slice(slashIdx + 1) }
}

/** 単一マッチ確定時の word を組み立てる。dir なら末尾 `/`、file なら末尾スペース。 */
function reconstructPath(dirPart: string, name: string, isDir: boolean): string {
  const path = joinDirPartAndBase(dirPart, name)
  return isDir ? `${path}/` : `${path} `
}

function joinDirPartAndBase(dirPart: string, base: string): string {
  if (dirPart === '') return base
  if (dirPart === '/') return `/${base}`
  return `${dirPart}/${base}`
}

/** 配列の最長共通プレフィックスを返す。 */
export function longestCommonPrefix(strs: string[]): string {
  if (strs.length === 0) return ''
  let prefix = strs[0]
  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1)
      if (prefix === '') return ''
    }
  }
  return prefix
}
