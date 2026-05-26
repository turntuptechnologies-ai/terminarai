import type { CommandHandler } from '../types'

/**
 * clear — ターミナルの表示履歴を空にする。
 *
 * 通常の Linux/Unix では ANSI エスケープシーケンス (\x1b[2J\x1b[H) を出力するが、
 * terminarai は自前 DOM ターミナルなので CommandResult.clearScreen=true で
 * Terminal コンポーネントにシグナルを送り、履歴を空にする。
 *
 * 引数は受け取らない (GNU clear の `-x` 等は未対応)。
 */
export const clear: CommandHandler = () => ({
  stdout: '',
  stderr: '',
  exitCode: 0,
  clearScreen: true,
})
