import type { Check, EvalContext } from './types'

/**
 * Check ノードを評価する純関数。副作用なし。
 *
 * - `cwd-equals`: 現在の cwd が指定パスと一致するか (vfs.resolve で正規化してから比較)
 * - `file-exists`: 指定パスが VFS 上に存在するか
 * - `file-contains`: 指定ファイルが特定文字列を含むか (ディレクトリ・不在は false)
 * - `command-matches`: 直近のコマンド入力が正規表現にマッチするか (不正パターンは false)
 * - `and` / `or`: 子チェックの論理結合。**空配列は false に統一** (作者の意図しないクリア防止)
 */
export function evaluateCheck(check: Check, ctx: EvalContext): boolean {
  switch (check.kind) {
    case 'cwd-equals': {
      // 末尾スラッシュ等の表記揺れを吸収するため両辺を正規化
      const left = ctx.vfs.resolve('/', ctx.cwd)
      const right = ctx.vfs.resolve('/', check.path)
      return left === right
    }

    case 'file-exists':
      return ctx.vfs.stat(check.path).ok

    case 'file-contains': {
      const r = ctx.vfs.readFile(check.path)
      return r.ok && r.value.includes(check.text)
    }

    case 'command-matches': {
      let re: RegExp
      try {
        re = new RegExp(check.pattern, check.flags ?? '')
      } catch {
        if (import.meta.env?.DEV) {
          console.error(`[lessons] invalid RegExp in command-matches:`, check.pattern, check.flags)
        }
        return false
      }
      return re.test(ctx.lastCommand)
    }

    case 'and':
      if (check.checks.length === 0) return false
      return check.checks.every((c) => evaluateCheck(c, ctx))

    case 'or':
      if (check.checks.length === 0) return false
      return check.checks.some((c) => evaluateCheck(c, ctx))
  }
}
