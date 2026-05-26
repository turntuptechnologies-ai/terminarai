import type { Shell } from '../types'
import { cat } from './cat'
import { cd } from './cd'
import { cp } from './cp'
import { echo } from './echo'
import { ls } from './ls'
import { mkdir } from './mkdir'
import { mv } from './mv'
// parse-args は内部ヘルパ。意図的に re-export しない (必要になれば追加)
import { pwd } from './pwd'
import { rm } from './rm'
import { touch } from './touch'

export { cat } from './cat'
export { cd } from './cd'
export { cp } from './cp'
export { echo } from './echo'
export { ls } from './ls'
export { mkdir } from './mkdir'
export { mv } from './mv'
export { pwd } from './pwd'
export { rm } from './rm'
export { touch } from './touch'

/** 現在実装済みの全コマンドをまとめてシェルに登録する (登録順は ABC 順)。 */
export function registerAllCommands(shell: Shell): void {
  shell.register('cat', cat)
  shell.register('cd', cd)
  shell.register('cp', cp)
  shell.register('echo', echo)
  shell.register('ls', ls)
  shell.register('mkdir', mkdir)
  shell.register('mv', mv)
  shell.register('pwd', pwd)
  shell.register('rm', rm)
  shell.register('touch', touch)
}
