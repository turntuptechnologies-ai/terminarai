import type { Shell } from '../types'
import { cat } from './cat'
import { cd } from './cd'
import { clear } from './clear'
import { cp } from './cp'
import { echo } from './echo'
import { grep } from './grep'
import { head } from './head'
import { ls } from './ls'
import { mkdir } from './mkdir'
import { mv } from './mv'
// parse-args / line-flags / line-utils は内部ヘルパ。意図的に re-export しない
import { pwd } from './pwd'
import { rm } from './rm'
import { tail } from './tail'
import { touch } from './touch'
import { vi } from './vi'

export { cat } from './cat'
export { cd } from './cd'
export { clear } from './clear'
export { cp } from './cp'
export { echo } from './echo'
export { grep } from './grep'
export { head } from './head'
export { ls } from './ls'
export { mkdir } from './mkdir'
export { mv } from './mv'
export { pwd } from './pwd'
export { rm } from './rm'
export { tail } from './tail'
export { touch } from './touch'
export { vi } from './vi'

/** 現在実装済みの全コマンドをまとめてシェルに登録する (登録順は ABC 順)。 */
export function registerAllCommands(shell: Shell): void {
  shell.register('cat', cat)
  shell.register('cd', cd)
  shell.register('clear', clear)
  shell.register('cp', cp)
  shell.register('echo', echo)
  shell.register('grep', grep)
  shell.register('head', head)
  shell.register('ls', ls)
  shell.register('mkdir', mkdir)
  shell.register('mv', mv)
  shell.register('pwd', pwd)
  shell.register('rm', rm)
  shell.register('tail', tail)
  shell.register('touch', touch)
  shell.register('vi', vi)
}
