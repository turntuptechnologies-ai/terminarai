import type { Vfs } from '../vfs'
import type { CompletionResult } from './completion'

export interface CommandContext {
  cwd: string
  env: Record<string, string>
}

export interface CommandResult {
  stdout: string
  stderr: string
  exitCode: number
  /**
   * cd だけが使う。他のコマンドは undefined のまま。
   *
   * **絶対パス**を期待する。シェルは normalize せずに nextCwd へそのまま採用するため、
   * 相対パスを返すと VFS のパス解決が壊れる。
   * 算出は `vfs.resolve(ctx.cwd, target)` を経由するのが定石 (cd 実装を参照)。
   */
  cwdAfter?: string
  /**
   * clear コマンドが画面クリアを要求するためのシグナル。
   * Terminal がこれを見て履歴を空にする。リダイレクト時も保持される。
   */
  clearScreen?: boolean
  /**
   * vi コマンドが起動するフルスクリーンエディタを要求するシグナル。
   * Terminal がこれを見て Terminal 表示の代わりに <ViEditor /> をマウントする。
   *
   * 保存時に Terminal が vfs.writeFile + onAfterExecute 再発火を担う。
   * キャンセル時は Terminal が "Editor cancelled" を履歴に積むだけで onAfterExecute は再発火しない。
   */
  editor?: {
    /** 書き込み先の絶対パス (vfs.resolve 経由で生成) */
    path: string
    /** ステータスバー表示用 (学習者が打った相対パス等をそのまま表示) */
    display: string
    /** 既存ファイル内容、新規ファイルなら空文字 */
    initialContent: string
  }
}

/**
 * コマンドハンドラの契約。
 *
 * - **同期関数**として実装する（Promise を返さない）
 * - **throw しない**。失敗は `CommandResult.exitCode !== 0` と `stderr` で表現する
 *   （万が一の例外はシェル側で捕捉して `internal error` 扱いになる）
 * - **stdout / stderr の改行**はハンドラ側で付与する（シェルは付け足さない）
 * - **cwdAfter**を返す場合は絶対パスにする（シェルはそのまま nextCwd に採用する）
 * - 副作用は `vfs` への書き込みのみに留める
 */
export type CommandHandler = (args: string[], ctx: CommandContext, vfs: Vfs) => CommandResult

export interface ShellExecuteResult {
  result: CommandResult
  /** 実行後の cwd (変化なければ ctx.cwd と同じ) */
  nextCwd: string
  /**
   * 実行後の完全な CommandContext。
   * cwd が変化した場合、env.PWD と env.OLDPWD も同期される。
   * 利用側 (Terminal/LessonView) は次ループでそのままこれを ctx として使えば良い。
   */
  nextCtx: CommandContext
}

export interface Shell {
  register(name: string, handler: CommandHandler): void
  unregister(name: string): void
  has(name: string): boolean
  execute(input: string, ctx: CommandContext): ShellExecuteResult
  /**
   * 登録済みコマンド名 (ABC 順)。
   * Tab 補完は `complete()` に任せるのが正規ルート。本メソッドは
   * help コマンド等で「全コマンド一覧」を得たいユースケース向け。
   */
  commandNames(): string[]
  /** 入力に対する Tab 補完を実行する。 */
  complete(input: string, ctx: CommandContext): CompletionResult
  /**
   * 内部 VFS への直接アクセス。
   *
   * 通常コマンドは `CommandHandler` の第 3 引数で渡される `vfs` を使うこと。
   * 本メソッドは Terminal が editor シグナル (`vi` の保存) を受けて VFS に書き込む
   * ような、シェル外部からの**例外的な永続化経路**のために用意されている。
   */
  getVfs(): Vfs
}

/** 既定の初期コンテキスト。シェル本体ではなく利用側で使う想定。 */
export function defaultContext(cwd = '/home/user'): CommandContext {
  return {
    cwd,
    env: {
      HOME: '/home/user',
      USER: 'user',
      PWD: cwd,
    },
  }
}
