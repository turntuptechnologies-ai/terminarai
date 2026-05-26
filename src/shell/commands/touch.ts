import type { CommandHandler } from '../types'

/**
 * touch — 空ファイルを作成、または既存ファイルの mtime を更新する。
 *
 * - 既存ファイル: 同じ内容で `writeFile` することで mtime が更新される。
 *   既知の副作用: 親ディレクトリの mtime も巻き込みで更新されてしまう (実 touch は親を触らない)。
 *   `VFS.updateMtime` API 追加で根治予定 (Issue #13)。
 * - 既存ディレクトリ: VFS が mtime のみ更新する API を持たないため no-op で成功扱い (Issue #13)。
 * - GNU touch の `-a` / `-m` / `-r` / `-t` 等は MVP 未対応。
 * - 現状フラグを一切認識しないため、`-x` のような引数も**ファイル名扱い**になる。
 *   PR C 以降でフラグを追加するときに方針を見直す。
 */
export const touch: CommandHandler = (args, ctx, vfs) => {
  if (args.length === 0) {
    return {
      stdout: '',
      stderr: "touch: missing file operand\nTry 'touch --help' for more information.\n",
      exitCode: 1,
    }
  }
  let stderr = ''
  let exitCode = 0
  for (const target of args) {
    const abs = vfs.resolve(ctx.cwd, target)
    const stat = vfs.stat(abs)
    if (stat.ok) {
      if (stat.value.type === 'file') {
        // 同内容で書き直すことで mtime を更新
        const writeRes = vfs.writeFile(abs, stat.value.content)
        if (!writeRes.ok) {
          stderr += `touch: cannot touch '${target}': ${writeRes.error.message}\n`
          exitCode = 1
        }
      }
      // ディレクトリの mtime 更新は VFS に該当 API がないので no-op (成功扱い)
      continue
    }
    if (stat.error.code === 'ENOENT') {
      const writeRes = vfs.writeFile(abs, '')
      if (!writeRes.ok) {
        stderr += `touch: cannot touch '${target}': ${writeRes.error.message}\n`
        exitCode = 1
      }
      continue
    }
    stderr += `touch: cannot touch '${target}': ${stat.error.message}\n`
    exitCode = 1
  }
  return { stdout: '', stderr, exitCode }
}
