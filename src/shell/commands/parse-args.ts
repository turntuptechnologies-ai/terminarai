/**
 * コマンドオプションの統一パーサ。
 *
 * サポート:
 * - 短フラグ: `-l`, `-la`, `-l -a` (クラスタリング)
 * - 長フラグ: `--all`, `--recursive` (`longAliases` で短形にマップ)
 * - `--` 以降はすべて positional 扱い
 * - 単独 `-` (例: `cat -`) は positional として通す (stdin sentinel の慣習)
 * - 未知の短/長フラグは ParseError を返す (どれが悪かったかを保持)
 *
 * 既知の制約 (MVP 未対応):
 * - 値付きオプション (`-n 5`, `--lines=5`) は未対応
 * - 同じ flag に対する複数の long alias は最後勝ち (`longAliases` の Map 性質)
 *
 * 長フラグは「短フラグへのエイリアス」として扱う設計にしている。
 * 単独の long-only フラグが必要になったら、`longAliases` の値型を
 * `string | { flag: string; standalone: true }` に拡張する。
 */

export interface ArgSpec {
  /** 1 文字フラグの並び (例: "raf")。空文字は「短フラグなし」。 */
  short?: string
  /**
   * 長フラグ名 → 短フラグ 1 文字へのマッピング。
   * 例: `{ recursive: 'r', force: 'f' }`
   *
   * 長フラグだけ独立で持たせる場合は、対応する短フラグも `short` に含めること。
   */
  longAliases?: Record<string, string>
}

export type ParseResult =
  | { ok: true; flags: Set<string>; positional: string[] }
  | { ok: false; invalidFlag: string; isLong?: boolean }

export function parseArgs(args: string[], spec: ArgSpec): ParseResult {
  const knownShort = new Set(spec.short ?? '')
  const longMap = spec.longAliases ?? {}
  const flags = new Set<string>()
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
    // 長フラグ: --name (--name=value は未対応のため、= を含む形は positional 扱いか拒否)
    if (arg.startsWith('--') && arg.length > 2) {
      // --name=value 形は MVP 未対応 → 拒否
      const eqIdx = arg.indexOf('=')
      const name = eqIdx === -1 ? arg.slice(2) : arg.slice(2, eqIdx)
      const shortChar = longMap[name]
      if (!shortChar) {
        return { ok: false, invalidFlag: name, isLong: true }
      }
      if (eqIdx !== -1) {
        // 値付き未対応として未知扱い
        return { ok: false, invalidFlag: name, isLong: true }
      }
      flags.add(shortChar)
      continue
    }
    // 短フラグクラスタ: -lAR
    if (arg.startsWith('-') && arg.length > 1) {
      for (const c of arg.slice(1)) {
        if (!knownShort.has(c)) {
          return { ok: false, invalidFlag: c }
        }
        flags.add(c)
      }
      continue
    }
    positional.push(arg)
  }
  return { ok: true, flags, positional }
}

/** "<cmd>: invalid option -- 'X'\nTry '<cmd> --help' for more information.\n" を組み立てる。 */
export function invalidOptionError(cmd: string, flagChar: string, isLong = false): string {
  if (isLong) {
    return `${cmd}: unrecognized option '--${flagChar}'\nTry '${cmd} --help' for more information.\n`
  }
  return `${cmd}: invalid option -- '${flagChar}'\nTry '${cmd} --help' for more information.\n`
}
