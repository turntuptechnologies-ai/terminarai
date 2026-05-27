import type { Vfs } from '../../vfs'
import type { CommandContext, CommandHandler, CommandResult } from '../types'
import { parseLineCount } from './line-flags'
import { extractLines } from './line-utils'

/**
 * head — ファイルの先頭 N 行 (既定 10) を表示する。
 *
 * フラグ:
 * - `-n N` / `-nN` / `--lines=N`: 表示行数
 * - `-N` (GNU 短縮): 同上
 * - `-N` が負数や非数値の場合はエラー
 *
 * 複数ファイル指定時は `==> filename <==` ヘッダを付ける (GNU 互換)。
 * 入力ファイルの末尾改行の有無に関わらず、出力は最終行に改行を付けて終わる
 * (学習用途で扱いやすさを優先)。
 */
export const head: CommandHandler = (args, ctx, vfs) => {
  return runHeadTail(args, ctx, vfs, 'head')
}

export function runHeadTail(
  args: string[],
  ctx: CommandContext,
  vfs: Vfs,
  cmd: 'head' | 'tail',
): CommandResult {
  const parsed = parseLineCount(args)
  if (!parsed.ok) {
    return { stdout: '', stderr: `${cmd}: ${parsed.error}\n`, exitCode: 1 }
  }
  const { n, positional: files } = parsed

  if (files.length === 0) {
    return { stdout: '', stderr: `${cmd}: missing file operand\n`, exitCode: 1 }
  }

  let stdout = ''
  let stderr = ''
  let exitCode = 0
  const showHeader = files.length > 1

  for (let i = 0; i < files.length; i++) {
    const target = files[i]
    const abs = vfs.resolve(ctx.cwd, target)
    const stat = vfs.stat(abs)
    if (!stat.ok) {
      stderr += `${cmd}: cannot open '${target}' for reading: ${stat.error.message}\n`
      exitCode = 1
      continue
    }
    if (stat.value.type === 'directory') {
      stderr += `${cmd}: error reading '${target}': Is a directory\n`
      exitCode = 1
      continue
    }
    if (showHeader) {
      // ファイル間の区切り空行 (2 つ目以降の前)
      if (stdout.length > 0) stdout += '\n'
      stdout += `==> ${target} <==\n`
    }
    stdout += extractLines(stat.value.content, n, cmd)
  }

  return { stdout, stderr, exitCode }
}
