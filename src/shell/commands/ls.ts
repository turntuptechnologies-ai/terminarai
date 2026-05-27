import { dirname, type Vfs, type VfsDirectory, type VfsNode } from '../../vfs'
import type { CommandHandler, CommandResult } from '../types'
import { invalidOptionError, parseArgs as parseFlags } from './parse-args'
import { compareName, fileSize, formatMode, formatMtime, isHidden } from './util'

interface LsFlags {
  long: boolean
  /** -a: 隠しファイル + `.` / `..` の擬似エントリも表示 */
  all: boolean
  /** -A: 隠しファイルは表示するが `.` / `..` は出さない */
  almostAll: boolean
}

interface ParsedArgs {
  ok: true
  flags: LsFlags
  positional: string[]
}

interface ParseError {
  ok: false
  message: string
}

function parseArgs(args: string[]): ParsedArgs | ParseError {
  const parsed = parseFlags(args, {
    short: 'laA',
    longAliases: { long: 'l', all: 'a', 'almost-all': 'A' },
  })
  if (!parsed.ok) {
    return { ok: false, message: invalidOptionError('ls', parsed.invalidFlag, parsed.isLong) }
  }
  return {
    ok: true,
    flags: {
      long: parsed.flags.has('l'),
      all: parsed.flags.has('a'),
      almostAll: parsed.flags.has('A'),
    },
    positional: parsed.positional,
  }
}

function renderEntry(node: VfsNode, displayName: string, flags: LsFlags): string {
  if (!flags.long) {
    return displayName
  }
  const mode = formatMode(node)
  const size = String(fileSize(node)).padStart(6, ' ')
  const mtime = formatMtime(node.mtime)
  return `${mode} 1 user user ${size} ${mtime} ${displayName}`
}

/** `ls -l` 先頭の "total N" を計算する。N は 1KB ブロック数の総和の近似。 */
function totalBlocks(entries: readonly VfsNode[]): number {
  return entries.reduce((acc, e) => acc + Math.ceil(fileSize(e) / 1024), 0)
}

/**
 * `.` (自分自身) と `..` (親) の擬似エントリを構築する。
 * 親は dirname で解決し、stat に失敗した場合は自身のディレクトリを代用する。
 * 表示名だけを差し替えた VfsNode を返す。
 */
function makeDotEntries(absDirPath: string, dirNode: VfsDirectory, vfs: Vfs): VfsNode[] {
  const dot: VfsNode = { ...dirNode, name: '.' }
  const parentAbs = dirname(absDirPath)
  const parentResult = vfs.stat(parentAbs)
  const parentNode =
    parentResult.ok && parentResult.value.type === 'directory' ? parentResult.value : dirNode
  const dotDot: VfsNode = { ...parentNode, name: '..' }
  return [dot, dotDot]
}

/**
 * ls — ファイル / ディレクトリの内容を表示。
 *
 * 対応フラグ:
 * - `-l`: 詳細表示 (パーミッション・サイズ・mtime も)
 * - `-a`: 隠しファイル + `.` `..` の擬似エントリを表示
 * - `-A`: 隠しファイルを表示するが `.` `..` は除外
 *
 * デフォルトは 1 行 1 エントリ (GNU の `ls -1` 相当)。
 *
 * 出力順は GNU 互換:
 * 1. 不可アクセス対象は stderr へ
 * 2. ファイル単体ターゲットは先に並べる
 * 3. ディレクトリは `target:` ヘッダ付きで列挙 (ファイルとの混在時 or 2 つ以上のとき)
 *
 * exitCode:
 * - 0: 全成功
 * - 2: parseArgs 失敗 / コマンドライン引数の path が解決できない
 */
export const ls: CommandHandler = (args, ctx, vfs): CommandResult => {
  const parsed = parseArgs(args)
  if (!parsed.ok) {
    return { stdout: '', stderr: parsed.message, exitCode: 2 }
  }
  const { flags, positional } = parsed
  const targets = positional.length === 0 ? [ctx.cwd] : positional

  let exitCode = 0
  const errors: Array<{ target: string; message: string }> = []
  const files: Array<{ target: string; node: VfsNode }> = []
  const dirs: Array<{ target: string; abs: string; dirNode: VfsDirectory; entries: VfsNode[] }> = []

  for (const target of targets) {
    const abs = vfs.resolve(ctx.cwd, target)
    const stat = vfs.stat(abs)
    if (!stat.ok) {
      errors.push({ target, message: stat.error.message })
      exitCode = 2
      continue
    }
    if (stat.value.type === 'file') {
      files.push({ target, node: stat.value })
      continue
    }
    const listRes = vfs.list(abs)
    if (!listRes.ok) {
      errors.push({ target, message: listRes.error.message })
      exitCode = 2
      continue
    }
    dirs.push({ target, abs, dirNode: stat.value, entries: listRes.value })
  }

  let stdout = ''
  let stderr = ''

  for (const e of errors) {
    stderr += `ls: cannot access '${e.target}': ${e.message}\n`
  }

  for (const f of files) {
    stdout += `${renderEntry(f.node, f.target, flags)}\n`
  }

  const showDirHeader = dirs.length > 1 || (dirs.length >= 1 && files.length > 0)
  const showHidden = flags.all || flags.almostAll

  for (let idx = 0; idx < dirs.length; idx++) {
    const d = dirs[idx]
    if (showDirHeader) {
      // ファイルセクションが先にあれば必ず空行、ディレクトリ同士の間も空行
      if (idx > 0 || files.length > 0) stdout += '\n'
      stdout += `${d.target}:\n`
    }
    const filtered = showHidden ? d.entries : d.entries.filter((e) => !isHidden(e.name))
    const withDots = flags.all ? [...makeDotEntries(d.abs, d.dirNode, vfs), ...filtered] : filtered
    const sorted = [...withDots].sort((a, b) => compareName(a.name, b.name))
    if (flags.long) {
      stdout += `total ${totalBlocks(sorted)}\n`
    }
    for (const entry of sorted) {
      stdout += `${renderEntry(entry, entry.name, flags)}\n`
    }
  }

  return { stdout, stderr, exitCode }
}
