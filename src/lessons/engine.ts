import type { Check, EvalContext } from './types'

/**
 * Check ノードを評価する純関数。副作用なし。
 *
 * - `cwd-equals`: 現在の cwd が指定パスと一致するか
 * - `file-exists`: 指定パスが VFS 上に存在するか
 * - `file-contains`: 指定ファイルが特定文字列を含むか (ディレクトリ・存在しない場合は false)
 * - `command-matches`: 直近のコマンド入力が正規表現にマッチするか
 * - `and` / `or`: 子チェックの論理結合
 */
export function evaluateCheck(check: Check, ctx: EvalContext): boolean {
  switch (check.kind) {
    case 'cwd-equals':
      return ctx.cwd === check.path

    case 'file-exists': {
      return ctx.vfs.stat(check.path).ok
    }

    case 'file-contains': {
      const r = ctx.vfs.readFile(check.path)
      return r.ok && r.value.includes(check.text)
    }

    case 'command-matches': {
      let re: RegExp
      try {
        re = new RegExp(check.pattern, check.flags ?? '')
      } catch {
        return false
      }
      return re.test(ctx.lastCommand)
    }

    case 'and':
      return check.checks.every((c) => evaluateCheck(c, ctx))

    case 'or':
      return check.checks.some((c) => evaluateCheck(c, ctx))
  }
}
