import { describe, expect, it } from 'vitest'
import { parse } from './parser'
import { tokenize } from './tokenizer'

function tokens(input: string) {
  const r = tokenize(input)
  if (!r.ok) throw new Error(`tokenize failed: ${r.error.message}`)
  return r.tokens
}

describe('parse', () => {
  it('空入力は command: null', () => {
    const r = parse([])
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.command).toBeNull()
  })

  it('単純なコマンド', () => {
    const r = parse(tokens('ls'))
    expect(r.ok).toBe(true)
    if (r.ok && r.command) {
      expect(r.command.argv).toEqual(['ls'])
      expect(r.command.stdoutRedirect).toBeUndefined()
    }
  })

  it('引数付きコマンド', () => {
    const r = parse(tokens('ls -la /home'))
    expect(r.ok).toBe(true)
    if (r.ok && r.command) {
      expect(r.command.argv).toEqual(['ls', '-la', '/home'])
    }
  })

  it('リダイレクト > を認識', () => {
    const r = parse(tokens('echo hi > out.txt'))
    expect(r.ok).toBe(true)
    if (r.ok && r.command) {
      expect(r.command.argv).toEqual(['echo', 'hi'])
      expect(r.command.stdoutRedirect).toEqual({ target: 'out.txt', append: false })
    }
  })

  it('リダイレクト >> を認識', () => {
    const r = parse(tokens('echo hi >> out.txt'))
    expect(r.ok).toBe(true)
    if (r.ok && r.command) {
      expect(r.command.stdoutRedirect).toEqual({ target: 'out.txt', append: true })
    }
  })

  it('リダイレクトの直後にターゲットが無いとエラー', () => {
    const r = parse(tokens('echo hi >'))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.message).toContain('syntax error')
  })

  it('リダイレクトのみはエラー (コマンドなし)', () => {
    const r = parse(tokens('> file'))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.message).toContain('missing command')
  })

  it('単語の途中にリダイレクトがあってもパース可能', () => {
    // echo hi>out → echo hi > out
    const r = parse(tokens('echo hi>out'))
    expect(r.ok).toBe(true)
    if (r.ok && r.command) {
      expect(r.command.argv).toEqual(['echo', 'hi'])
      expect(r.command.stdoutRedirect).toEqual({ target: 'out', append: false })
    }
  })

  it('複数の stdout リダイレクトはエラー', () => {
    const r = parse(tokens('echo hi > a > b'))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.message).toContain('multiple stdout redirections')
  })

  it('> と >> の混在も複数として扱う', () => {
    const r = parse(tokens('echo hi >> a > b'))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.message).toContain('multiple stdout redirections')
  })

  describe('redirect の位置自由度 (#11)', () => {
    it('先頭リダイレクト: > out echo hi', () => {
      const r = parse(tokens('> out echo hi'))
      if (!r.ok || !r.command) throw new Error('expected ok')
      expect(r.command.argv).toEqual(['echo', 'hi'])
      expect(r.command.stdoutRedirect).toEqual({ target: 'out', append: false })
    })

    it('中間リダイレクト: echo > out hi', () => {
      const r = parse(tokens('echo > out hi'))
      if (!r.ok || !r.command) throw new Error('expected ok')
      expect(r.command.argv).toEqual(['echo', 'hi'])
      expect(r.command.stdoutRedirect).toEqual({ target: 'out', append: false })
    })

    it('末尾リダイレクト: echo hi > out (慣用)', () => {
      const r = parse(tokens('echo hi > out'))
      if (!r.ok || !r.command) throw new Error('expected ok')
      expect(r.command.argv).toEqual(['echo', 'hi'])
      expect(r.command.stdoutRedirect).toEqual({ target: 'out', append: false })
    })
  })

  describe('>>> (= >> >) の挙動ロック (#11)', () => {
    it('>>> alone は syntax error (target が無い)', () => {
      // tokenize は greedy で先頭 2 文字を >> にして残り > を取り出す → [>>, >]
      // parse は >> の target に > を期待するが word でないため error
      const r = parse(tokens('>>>'))
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.error.message).toMatch(/syntax error/)
    })

    it('>>> file は syntax error (>> の target が word でなく > になる)', () => {
      const r = parse(tokens('>>> file'))
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.error.message).toMatch(/syntax error/)
    })
  })
})
