import { HOME_PATH } from '../vfs'

interface PromptProps {
  cwd: string
}

/** cwd を表示用 (`~`, `~/docs` など) に変換する。 */
export function displayCwd(cwd: string): string {
  if (cwd === HOME_PATH) return '~'
  if (cwd.startsWith(`${HOME_PATH}/`)) return `~${cwd.slice(HOME_PATH.length)}`
  return cwd
}

/**
 * シェルのプロンプト表示。
 * 形式: `user@terminarai:~/docs$ `
 */
export function Prompt({ cwd }: PromptProps) {
  return (
    <span className="select-none whitespace-pre" aria-hidden="true">
      <span className="text-emerald-400">user@terminarai</span>
      <span className="text-zinc-500">:</span>
      <span className="text-sky-400">{displayCwd(cwd)}</span>
      <span className="text-zinc-300">$ </span>
    </span>
  )
}
