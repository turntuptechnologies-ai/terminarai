import type { Shell } from '../types'
import { cd } from './cd'
import { ls } from './ls'
import { pwd } from './pwd'

export { cd } from './cd'
export { ls } from './ls'
export { pwd } from './pwd'

/** 現在実装済みの全コマンドをまとめてシェルに登録する。 */
export function registerAllCommands(shell: Shell): void {
  shell.register('pwd', pwd)
  shell.register('ls', ls)
  shell.register('cd', cd)
}
