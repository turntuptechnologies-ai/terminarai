import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi as vitest } from 'vitest'
import { ViEditor } from './ViEditor'

function setup(initialContent = '') {
  const onSave = vitest.fn()
  const onClose = vitest.fn()
  const utils = render(
    <ViEditor
      display="note.txt"
      initialContent={initialContent}
      onSave={onSave}
      onClose={onClose}
    />,
  )
  const textarea = screen.getByLabelText('vi 編集領域') as HTMLTextAreaElement
  return { ...utils, textarea, onSave, onClose, user: userEvent.setup() }
}

describe('ViEditor', () => {
  it('起動時はファイル名 + 内容を表示し、NORMAL モード (readOnly)', () => {
    const { textarea } = setup('hello world')
    expect(screen.getByText('note.txt')).toBeInTheDocument()
    expect(textarea.value).toBe('hello world')
    expect(textarea.readOnly).toBe(true)
  })

  it('NORMAL では文字キーは挿入されない', async () => {
    const { textarea, user } = setup('init')
    await user.click(textarea)
    await user.keyboard('hello')
    // readOnly + onKeyDown preventDefault で挿入されない
    expect(textarea.value).toBe('init')
  })

  it('i で INSERT モードに入る → 自由に編集できる', async () => {
    const { textarea, user } = setup('')
    await user.click(textarea)
    await user.keyboard('i')
    expect(screen.getByText('-- INSERT --')).toBeInTheDocument()
    expect(textarea.readOnly).toBe(false)
    await user.type(textarea, 'hello')
    expect(textarea.value).toBe('hello')
  })

  it('INSERT で Esc → NORMAL に戻る', async () => {
    const { textarea, user } = setup('')
    await user.click(textarea)
    await user.keyboard('i')
    await user.keyboard('abc')
    await user.keyboard('{Escape}')
    expect(screen.queryByText('-- INSERT --')).not.toBeInTheDocument()
    expect(textarea.readOnly).toBe(true)
  })

  it(': で COMMAND モードに入る → コマンド入力欄が現れる', async () => {
    const { textarea, user } = setup('')
    await user.click(textarea)
    await user.keyboard(':')
    expect(screen.getByLabelText('vi コマンド入力')).toBeInTheDocument()
  })

  it(':w で onSave が呼ばれ NORMAL に戻り、ステータスに written 表示', async () => {
    const { textarea, user, onSave, onClose } = setup('')
    await user.click(textarea)
    await user.keyboard('i')
    await user.type(textarea, 'hi')
    await user.keyboard('{Escape}:w{Enter}')
    expect(onSave).toHaveBeenCalledWith('hi')
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText(/"note.txt" written/)).toBeInTheDocument()
  })

  it(':wq で onClose("save") のみ呼ばれる (onSave は :w 専用)', async () => {
    const { textarea, user, onSave, onClose } = setup('')
    await user.click(textarea)
    await user.keyboard('i')
    await user.type(textarea, 'world')
    await user.keyboard('{Escape}:wq{Enter}')
    // 保存処理は Terminal 側 (onClose の受け手) が担う。
    // onSave も呼ぶと 2 重に保存されて履歴が重複する。
    expect(onSave).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledWith('save', 'world')
  })

  it(':x も :wq と同じ動作 (onClose("save") のみ)', async () => {
    const { textarea, user, onSave, onClose } = setup('orig')
    await user.click(textarea)
    await user.keyboard('iA{Escape}:x{Enter}')
    expect(onSave).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledWith('save', expect.stringContaining('A'))
  })

  it(':q (未変更) で onClose("cancel") が呼ばれる', async () => {
    const { textarea, user, onClose } = setup('original')
    await user.click(textarea)
    await user.keyboard(':q{Enter}')
    expect(onClose).toHaveBeenCalledWith('cancel', 'original')
  })

  it(':q (変更あり) はエラー、エディタは閉じない', async () => {
    const { textarea, user, onClose } = setup('original')
    await user.click(textarea)
    await user.keyboard('iX{Escape}:q{Enter}')
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText(/E37: No write since last change/)).toBeInTheDocument()
  })

  it(':q! で変更があっても強制終了 (onClose("cancel"))', async () => {
    const { textarea, user, onClose } = setup('original')
    await user.click(textarea)
    await user.keyboard('iY{Escape}:q!{Enter}')
    expect(onClose).toHaveBeenCalledWith('cancel', expect.stringContaining('Y'))
  })

  it('COMMAND で Esc → NORMAL に戻る (キャンセル)', async () => {
    const { textarea, user, onClose } = setup('')
    await user.click(textarea)
    await user.keyboard(':')
    expect(screen.getByLabelText('vi コマンド入力')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByLabelText('vi コマンド入力')).not.toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('未知のコマンド (:foo) はエラー、エディタは閉じない', async () => {
    const { textarea, user, onClose } = setup('')
    await user.click(textarea)
    await user.keyboard(':foo{Enter}')
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText(/E492: Not an editor command/)).toBeInTheDocument()
  })

  it('[+] dirty マーカーは編集後にだけ表示', async () => {
    const { textarea, user } = setup('initial')
    expect(screen.queryByText('未保存の変更あり')).not.toBeInTheDocument()
    await user.click(textarea)
    await user.keyboard('iZ{Escape}')
    expect(screen.getByText('未保存の変更あり')).toBeInTheDocument()
  })
})
