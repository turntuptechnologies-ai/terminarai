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
})
