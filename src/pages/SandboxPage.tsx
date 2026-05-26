import { useState } from 'react'
import { Terminal } from '../components/Terminal'
import { createShell, defaultContext } from '../shell'
import { registerAllCommands } from '../shell/commands'
import { createDefaultVfs } from '../vfs'

const BANNER =
  'サンドボックスへようこそ。\n' +
  'コマンドを自由に試せます。ページを離れると状態はリセットされます。\n' +
  '例: ls / cat README.txt / mkdir foo / echo hello > foo/bar.txt\n\n'

/**
 * サンドボックスの状態 (VFS + shell) はページ mount で生成し、ページ離脱でリセット。
 * Issue #6 でレッスン側との VFS スコープ設計を行う際、ここを Context / 永続化に
 * 寄せ替える可能性がある (現状はページごとに独立)。
 */
export function SandboxPage() {
  const [shell] = useState(() => {
    const vfs = createDefaultVfs()
    const sh = createShell(vfs)
    registerAllCommands(sh)
    return sh
  })

  return <Terminal shell={shell} initialCtx={defaultContext()} banner={BANNER} />
}
