import { type FormEvent, type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import type { CommandContext, CommandResult, Shell } from '../shell'
import { Prompt } from './Prompt'

interface TerminalProps {
  shell: Shell
  initialCtx: CommandContext
  /** 初期表示時のバナー文字列 (空文字なら表示しない)。 */
  banner?: string
  /**
   * コマンド実行直後に呼ばれるフック。
   * 引数の `ctxAfter` は cwd/env が更新された後のコンテキスト。
   * 状態更新前に同期的に呼ばれる (レッスンエンジンの check 評価に使う)。
   */
  onAfterExecute?: (input: string, result: CommandResult, ctxAfter: CommandContext) => void
}

interface HistoryEntry {
  id: number
  /** プロンプト行を表示するか (バナー専用エントリは null)。 */
  prompt: { cwd: string; input: string } | null
  stdout: string
  stderr: string
}

export function Terminal({ shell, initialCtx, banner = '', onAfterExecute }: TerminalProps) {
  // エントリ ID は React の key 安定性のためインスタンスローカルに管理する
  const idCounterRef = useRef(0)
  const nextEntryId = () => ++idCounterRef.current

  const [ctx, setCtx] = useState<CommandContext>(initialCtx)
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    banner ? [{ id: ++idCounterRef.current, prompt: null, stdout: banner, stderr: '' }] : [],
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
    // 空 Enter は bash 同様に何もしない (履歴にも積まない)
    if (input.trim() === '') {
      setInput('')
      setHistoryCursor(-1)
      setDraftBeforeNav('')
      return
    }
    // Shell が env.PWD / env.OLDPWD まで同期した nextCtx を返してくれるので、Terminal 側で
    // env を手動で組み立てる必要はない
    const { result, nextCtx } = shell.execute(input, ctx)

    // clear コマンドは履歴を空にして、自分自身も履歴に積まない (bash 互換)
    if (result.clearScreen) {
      setHistory([])
    } else {
      setHistory((h) => [
        ...h,
        {
          id: nextEntryId(),
          prompt: { cwd: ctx.cwd, input },
          stdout: result.stdout,
          stderr: result.stderr,
        },
      ])
    }
    if (nextCtx !== ctx) {
      setCtx(nextCtx)
    }

    onAfterExecute?.(input, result, nextCtx)

    setInput('')
    setHistoryCursor(-1)
    setDraftBeforeNav('')
  }

  const handleTab = () => {
    const result = shell.complete(input, ctx)
    if (result.newInput !== input) {
      setInput(result.newInput)
      setHistoryCursor(-1)
      setDraftBeforeNav('')
      return
    }
    // 入力が変化しないが候補が複数 → 詰まっているので一覧を履歴に表示する
    if (result.candidates.length > 1) {
      setHistory((h) => [
        ...h,
        {
          id: nextEntryId(),
          prompt: { cwd: ctx.cwd, input },
          stdout: `${result.candidates.join('  ')}\n`,
          stderr: '',
        },
      ])
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      handleTab()
      return
    }
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
      className="h-full min-h-0 flex-1 overflow-y-auto bg-zinc-950 p-4 font-mono text-sm leading-relaxed text-zinc-100"
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
            <pre className="m-0 whitespace-pre-wrap break-words text-zinc-100">{entry.stdout}</pre>
          )}
          {entry.stderr && (
            <pre className="m-0 whitespace-pre-wrap break-words text-rose-400">{entry.stderr}</pre>
          )}
        </div>
      ))}
      <form onSubmit={handleSubmit} className="flex items-center">
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
          aria-label="ターミナル入力"
          className="min-w-0 flex-1 border-none bg-transparent text-zinc-100 caret-emerald-400 outline-none"
        />
      </form>
    </div>
  )
}
