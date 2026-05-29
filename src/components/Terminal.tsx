import { type FormEvent, type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useLocale } from '../i18n'
import type { CommandContext, CommandResult, Shell } from '../shell'
import { Prompt } from './Prompt'
import { ViEditor } from './ViEditor'

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

interface EditorState {
  /** 元の `vi <file>` 入力。保存時の onAfterExecute 再発火で使う。 */
  originalInput: string
  /** 編集時点の CommandContext。再発火時にそのまま渡す。 */
  ctx: CommandContext
  /** vfs.writeFile 用の絶対パス */
  path: string
  /** ステータスバー表示用 */
  display: string
  initialContent: string
}

export function Terminal({ shell, initialCtx, banner = '', onAfterExecute }: TerminalProps) {
  const { t } = useLocale()
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
  /** vi 等のフルスクリーンエディタが起動中なら、Terminal の代わりに <ViEditor /> をレンダ。 */
  const [editor, setEditor] = useState<EditorState | null>(null)

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

    // editor シグナルがあれば Terminal 表示の代わりにエディタを起動
    if (result.editor) {
      setEditor({
        originalInput: input,
        ctx: nextCtx,
        path: result.editor.path,
        display: result.editor.display,
        initialContent: result.editor.initialContent,
      })
    }

    setInput('')
    setHistoryCursor(-1)
    setDraftBeforeNav('')
  }

  /** vi の `:w` (保存のみ、エディタは継続) */
  const handleEditorSave = (content: string) => {
    if (!editor) return
    const vfs = shell.getVfs()
    const writeRes = vfs.writeFile(editor.path, content)
    if (!writeRes.ok) {
      // ViEditor 側でステータス更新まではしないので、ここで履歴に stderr を積んで知らせる
      setHistory((h) => [
        ...h,
        {
          id: nextEntryId(),
          prompt: null,
          stdout: '',
          stderr: `vi: ${editor.display}: ${writeRes.error.message}\n`,
        },
      ])
      return
    }
    // 行数・バイト数の概算を計算して履歴に積む (vi の "written" 表示風)
    const lines = content === '' ? 0 : content.split('\n').length
    const bytes = content.length
    setHistory((h) => [
      ...h,
      {
        id: nextEntryId(),
        prompt: null,
        stdout: `"${editor.display}" ${lines}L, ${bytes}C written\n`,
        stderr: '',
      },
    ])
  }

  /** vi の `:wq` / `:q` / `:q!` でエディタが閉じるときの後処理 */
  const handleEditorClose = (action: 'save' | 'cancel', content: string) => {
    if (!editor) return
    const ed = editor
    if (action === 'save') {
      handleEditorSave(content)
    }
    setEditor(null)
    // 保存系で終了した場合は、レッスン側に「vi の結果として VFS が変わった」ことを伝える
    if (action === 'save') {
      const syntheticResult: CommandResult = { stdout: '', stderr: '', exitCode: 0 }
      onAfterExecute?.(ed.originalInput, syntheticResult, ed.ctx)
    }
    // フォーカスを Terminal の入力欄に戻す
    setTimeout(() => inputRef.current?.focus(), 0)
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

  // エディタ起動中は ViEditor がフルスクリーンを占めるので、Terminal の通常 UI は描画しない。
  // 終了 (:wq / :q / :q!) で setEditor(null) されると元の Terminal に戻る。
  if (editor) {
    return (
      <div
        ref={containerRef}
        data-testid="terminal-root"
        className="flex h-full min-h-0 flex-1 flex-col"
      >
        <ViEditor
          display={editor.display}
          initialContent={editor.initialContent}
          onSave={handleEditorSave}
          onClose={handleEditorClose}
        />
      </div>
    )
  }

  return (
    // <section aria-label> = ランドマーク (role="region")。出力は role="log" + aria-live で
    // SR に変化を伝え、入力は <form><input> として残置することで、SR の仮想カーソルが
    // 出力を辿れるようにする (旧 role="application" は virtual cursor を無効化していた)。
    // biome-ignore lint/a11y/useKeyWithClickEvents: キー操作は input 自身が受け取る (このコンテナはフォーカスを引き取る用)
    <section
      ref={containerRef}
      onClick={focusInput}
      aria-label={t('terminal.region')}
      className="h-full min-h-0 flex-1 overflow-y-auto bg-zinc-950 p-4 font-mono text-sm leading-relaxed text-zinc-100"
      data-testid="terminal-root"
    >
      <div role="log" aria-live="polite" aria-label={t('terminal.output')}>
        {history.map((entry) => (
          <div key={entry.id}>
            {entry.prompt && (
              <div className="whitespace-pre-wrap break-all">
                <Prompt cwd={entry.prompt.cwd} />
                <span>{entry.prompt.input}</span>
              </div>
            )}
            {entry.stdout && (
              <pre className="m-0 whitespace-pre-wrap break-words text-zinc-100">
                {entry.stdout}
              </pre>
            )}
            {entry.stderr && (
              <pre className="m-0 whitespace-pre-wrap break-words text-rose-400">
                {entry.stderr}
              </pre>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center">
        <Prompt cwd={ctx.cwd} />
        {/* 既知の制約: <input> は単一行入力のため、複数行ペーストは最初の改行で打ち切られる */}
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
          name="terminal-input"
          aria-label={t('terminal.input')}
          className="min-w-0 flex-1 border-none bg-transparent text-zinc-100 caret-emerald-400 outline-none"
        />
      </form>
    </section>
  )
}
