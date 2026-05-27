import { type KeyboardEvent, useEffect, useRef, useState } from 'react'

export type ViMode = 'normal' | 'insert' | 'command'

interface ViEditorProps {
  /** ステータスバーに表示するファイル名 (学習者が打った相対パスのまま) */
  display: string
  initialContent: string
  /**
   * `:w` (保存のみ) で呼ばれる。引数は現在のバッファ全体。
   * 保存成功と見做して呼び出し側が VFS に書き込み、エディタは modified を false にする。
   */
  onSave: (content: string) => void
  /**
   * 終了系コマンド (`:wq` / `:q` / `:q!`) で呼ばれる。
   * - action='save': `:wq`、保存して終了
   * - action='cancel': `:q`/`:q!`、保存せず終了
   */
  onClose: (action: 'save' | 'cancel', content: string) => void
}

/**
 * 簡素版 vi エディタ。
 *
 * 提供する操作:
 * - **NORMAL** (起動時): キー入力でコマンド (`i` / `a` / `:`)
 * - **INSERT** (`i` / `a` 後): 自由に編集、`Esc` で NORMAL
 * - **COMMAND** (`:` 後): `w` / `q` / `wq` / `q!` を入力して Enter
 *
 * 簡素化のため省略している機能:
 * - hjkl / 単語移動 / 行ジャンプ (矢印キーで代替してもらう)
 * - ヤンク / プット / ビジュアル / 検索 / Undo / バッファ等
 *
 * 設計メモ:
 * - NORMAL 時は textarea を `readOnly` にして直接入力を無効化、
 *   onKeyDown でモード切替キーだけ拾う。
 * - 保存パスは props.onSave / onClose を経由する (VFS 永続化は呼び出し側 = Terminal の責務)。
 */
export function ViEditor({ display, initialContent, onSave, onClose }: ViEditorProps) {
  const [buffer, setBuffer] = useState(initialContent)
  const [mode, setMode] = useState<ViMode>('normal')
  const [modified, setModified] = useState(false)
  const [cmd, setCmd] = useState('')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const cmdInputRef = useRef<HTMLInputElement>(null)

  // モード切替時にフォーカスを移す。COMMAND → input、それ以外 → textarea。
  useEffect(() => {
    if (mode === 'command') {
      cmdInputRef.current?.focus()
    } else {
      textareaRef.current?.focus()
    }
  }, [mode])

  function enterCommandMode() {
    setStatusMessage(null)
    setCmd('')
    setMode('command')
  }

  function execCommand(rawCmd: string) {
    // 先頭/末尾の空白は許容
    const c = rawCmd.trim()
    switch (c) {
      case 'w':
        onSave(buffer)
        setModified(false)
        setStatusMessage(`"${display}" written`)
        setMode('normal')
        break
      case 'wq':
      case 'x':
        onSave(buffer)
        setModified(false)
        onClose('save', buffer)
        break
      case 'q':
        if (modified) {
          setStatusMessage('E37: No write since last change (add ! to override)')
          setMode('normal')
        } else {
          onClose('cancel', buffer)
        }
        break
      case 'q!':
        onClose('cancel', buffer)
        break
      default:
        setStatusMessage(`E492: Not an editor command: ${c}`)
        setMode('normal')
        break
    }
  }

  function handleTextareaKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (mode === 'normal') {
      // モード切替系のキーは消費。それ以外 (矢印・Home/End 等) はネイティブに任せる。
      if (e.key === 'i' || e.key === 'a' || e.key === 'I' || e.key === 'A') {
        e.preventDefault()
        setStatusMessage(null)
        setMode('insert')
      } else if (e.key === ':') {
        e.preventDefault()
        enterCommandMode()
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        // ナビゲーション以外の文字キーは飲み込む (NORMAL ではタイプしない)
        e.preventDefault()
      }
    } else if (mode === 'insert') {
      if (e.key === 'Escape') {
        e.preventDefault()
        setMode('normal')
      }
    }
  }

  function handleCmdKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      execCommand(cmd)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setStatusMessage(null)
      setCmd('')
      setMode('normal')
    }
  }

  return (
    <section
      aria-label={`vi editor: ${display}`}
      data-testid="vi-editor"
      className="flex h-full min-h-0 flex-1 flex-col bg-zinc-950 font-mono text-sm text-zinc-100"
    >
      {/* 上部: ファイル名 + dirty マーク */}
      <header className="shrink-0 border-zinc-800 border-b bg-zinc-900 px-4 py-1.5 text-zinc-200 text-xs">
        <span className="font-semibold">{display}</span>
        {modified && (
          <span className="ml-2 text-amber-300">
            <span aria-hidden="true">[+]</span>
            <span className="sr-only">未保存の変更あり</span>
          </span>
        )}
      </header>

      {/* 中央: 編集領域 */}
      <textarea
        ref={textareaRef}
        value={buffer}
        readOnly={mode !== 'insert'}
        onChange={(e) => {
          setBuffer(e.target.value)
          setModified(true)
        }}
        onKeyDown={handleTextareaKeyDown}
        // biome-ignore lint/a11y/noAutofocus: エディタが開いた直後は入力可能であるべき
        autoFocus
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        aria-label="vi 編集領域"
        className="min-h-0 flex-1 resize-none bg-zinc-950 p-4 leading-relaxed text-zinc-100 caret-emerald-400 outline-none"
      />

      {/* 下部: モード表示 or コマンド入力 or ステータスメッセージ */}
      <footer
        role="status"
        aria-live="polite"
        className="shrink-0 border-zinc-800 border-t bg-zinc-900 px-4 py-1.5 text-xs"
      >
        {mode === 'command' ? (
          <div className="flex items-center gap-1 text-zinc-200">
            <span className="font-mono">:</span>
            <input
              ref={cmdInputRef}
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              onKeyDown={handleCmdKeyDown}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              aria-label="vi コマンド入力"
              className="min-w-0 flex-1 border-none bg-transparent text-zinc-100 caret-emerald-400 outline-none"
            />
          </div>
        ) : mode === 'insert' ? (
          <span className="text-emerald-400">-- INSERT --</span>
        ) : statusMessage ? (
          <span className={statusMessage.startsWith('E') ? 'text-rose-400' : 'text-zinc-400'}>
            {statusMessage}
          </span>
        ) : (
          <span className="text-zinc-500">
            i: insert &nbsp;·&nbsp; :: command (w / q / wq / q!)
          </span>
        )}
      </footer>
    </section>
  )
}
