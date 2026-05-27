import type { CommandHandler } from '../types'
import { runHeadTail } from './head'

/**
 * tail — ファイルの末尾 N 行 (既定 10) を表示する。
 *
 * フラグや出力フォーマットは head と共通 (`runHeadTail` を共有)。
 * GNU の `-f` (follow) や `-c` (バイト指定) は未対応。
 */
export const tail: CommandHandler = (args, ctx, vfs) => {
  return runHeadTail(args, ctx, vfs, 'tail')
}
