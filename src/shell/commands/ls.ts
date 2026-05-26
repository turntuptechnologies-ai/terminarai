import type { VfsNode } from '../../vfs'
import type { CommandHandler, CommandResult } from '../types'
import { compareName, fileSize, formatMode, formatMtime, isHidden } from './util'

interface LsFlags {
  long: boolean
  all: boolean // -a / -A: 隠しファイルを表示 (terminarai では `.` `..` の擬似エントリは出さない)
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
  const flags: LsFlags = { long: false, all: false }
  const positional: string[] = []
  let endFlags = false
  for (const arg of args) {
    if (endFlags) {
      positional.push(arg)
      continue
    }
    if (arg === '--') {
      endFlags = true
      continue
    }
    if (arg.startsWith('-') && arg.length > 1) {
      for (const c of arg.slice(1)) {
        if (c === 'l') flags.long = true
        else if (c === 'a' || c === 'A') flags.all = true
        else {
          return {
            ok: false,
            message: `ls: invalid option -- '${c}'\n`,
          }
        }
      }
      continue
    }
    positional.push(arg)
  }
  return { ok: true, flags, positional }
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

/**
 * ls — ファイル / ディレクトリの内容を表示。
 *
 * 対応フラグ: `-l` (詳細表示), `-a` / `-A` (隠しファイルも表示)。
 * デフォルトは 1 行 1 エントリ (GNU の `ls -1` 相当)。
 */
export const ls: CommandHandler = (args, ctx, vfs): CommandResult => {
  const parsed = parseArgs(args)
  if (!parsed.ok) {
    return { stdout: '', stderr: parsed.message, exitCode: 2 }
  }
  const { flags, positional } = parsed
  const targets = positional.length === 0 ? [ctx.cwd] : positional

  let stdout = ''
  let stderr = ''
  let exitCode = 0

  type Entry =
    | { kind: 'error'; target: string; message: string }
    | { kind: 'file'; target: string; node: VfsNode }
    | { kind: 'dir'; target: string; entries: VfsNode[] }

  const sections: Entry[] = []
  for (const target of targets) {
    const abs = vfs.resolve(ctx.cwd, target)
    const stat = vfs.stat(abs)
    if (!stat.ok) {
      sections.push({ kind: 'error', target, message: stat.error.message })
      exitCode = 2
      continue
    }
    if (stat.value.type === 'file') {
      sections.push({ kind: 'file', target, node: stat.value })
      continue
    }
    const listRes = vfs.list(abs)
    if (!listRes.ok) {
      sections.push({ kind: 'error', target, message: listRes.error.message })
      exitCode = 2
      continue
    }
    sections.push({ kind: 'dir', target, entries: listRes.value })
  }

  const multiTarget = targets.length > 1
  let firstSection = true

  for (const section of sections) {
    if (section.kind === 'error') {
      stderr += `ls: cannot access '${section.target}': ${section.message}\n`
      continue
    }
    if (section.kind === 'file') {
      stdout += `${renderEntry(section.node, section.target, flags)}\n`
      firstSection = false
      continue
    }
    if (multiTarget) {
      if (!firstSection) stdout += '\n'
      stdout += `${section.target}:\n`
    }
    firstSection = false

    const filtered = flags.all ? section.entries : section.entries.filter((e) => !isHidden(e.name))
    const sorted = [...filtered].sort((a, b) => compareName(a.name, b.name))
    for (const entry of sorted) {
      stdout += `${renderEntry(entry, entry.name, flags)}\n`
    }
  }

  return { stdout, stderr, exitCode }
}
