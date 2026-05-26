import { type FormEvent, type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import type { CommandContext, Shell } from '../shell'
import { Prompt } from './Prompt'

interface TerminalProps {
  shell: Shell
  initialCtx: CommandContext
  /** 初期表示時のバナー文字列 (空文字なら表示しない)。 */
  banner?: string
}

interface HistoryEntry {
  id: number
  /** プロンプト行を表示するか (バナー専用エントリは null)。 */
  prompt: { cwd: string; input: string } | null
  stdout: string
  stderr: string
}

let entryIdCounter = 0
const nextEntryId = () => ++entryIdCounter

export function Terminal({ shell, initialCtx, banner = '' }: TerminalProps) {
  const [ctx, setCtx] = useState<CommandContext>(initialCtx)
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    banner ? [{ id: nextEntryId(), prompt: null, stdout: banner, stderr: '' }] : [],
  )
  const [input, setInput] = useState('')
  /** 入力履歴を遡る際のカーソル位置 (0 が最新の確定入力、-1 は「カーソル無し」)。 */
  const [historyCursor, setHistoryCursor] = useState(-1)
  /** 履歴遡り中に元の編集中文字列を保存して、↓ で戻れるようにする。 */
  const [draftBeforeNav, setDraftBeforeNav] = useState('')

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const commandHistory = useMemo(
    () => history.map((h) => h.prompt?.input ?? '').filter((s) => s.trim() !== ''),
    [history],
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: history が増えるたびに scroll を一番下まで送る
  useEffect(() => {
    const el = containerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [history.length])

  const focusInput = () => {
    inputRef.current?.focus()
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const { result, nextCwd } = shell.execute(input, ctx)
    setHistory((h) => [
      ...h,
      {
        id: nextEntryId(),
        prompt: { cwd: ctx.cwd, input },
        stdout: result.stdout,
        stderr: result.stderr,
      },
    ])
    if (nextCwd !== ctx.cwd) {
      setCtx({ ...ctx, cwd: nextCwd, env: { ...ctx.env, PWD: nextCwd } })
    }
    setInput('')
    setHistoryCursor(-1)
    setDraftBeforeNav('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      if (commandHistory.length === 0) return
      e.preventDefault()
      const next = Math.min(historyCursor + 1, commandHistory.length - 1)
      if (historyCursor === -1) setDraftBeforeNav(input)
      setHistoryCursor(next)
      setInput(commandHistory[commandHistory.length - 1 - next])
    } else if (e.key === 'ArrowDown') {
      if (historyCursor === -1) return
      e.preventDefault()
      const next = historyCursor - 1
      setHistoryCursor(next)
      if (next === -1) {
        setInput(draftBeforeNav)
        setDraftBeforeNav('')
      } else {
        setInput(commandHistory[commandHistory.length - 1 - next])
      }
    }
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: キー操作は input 自身が受け取る (このコンテナはフォーカスを引き取る用)
    <div
      ref={containerRef}
      onClick={focusInput}
      role="application"
      aria-label="terminarai 仮想ターミナル"
      className="h-full min-h-[400px] overflow-y-auto bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-100"
      data-testid="terminal-root"
    >
      {history.map((entry) => (
        <div key={entry.id}>
          {entry.prompt && (
            <div className="whitespace-pre-wrap break-all">
              <Prompt cwd={entry.prompt.cwd} />
              <span>{entry.prompt.input}</span>
            </div>
          )}
          {entry.stdout && (
            <pre className="m-0 whitespace-pre-wrap break-all font-[inherit] text-zinc-100">
              {entry.stdout}
            </pre>
          )}
          {entry.stderr && (
            <pre className="m-0 whitespace-pre-wrap break-all font-[inherit] text-rose-400">
              {entry.stderr}
            </pre>
          )}
        </div>
      ))}
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center">
        <Prompt cwd={ctx.cwd} />
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          // biome-ignore lint/a11y/noAutofocus: ターミナル UI では起動直後の入力フォーカスは期待動作
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          aria-label="terminal input"
          className="min-w-[20ch] flex-1 border-none bg-transparent text-zinc-100 caret-emerald-400 outline-none"
        />
      </form>
    </div>
  )
}
