import { describe, expect, it } from 'vitest'
import { type Token, tokenize } from './tokenizer'

function ok(input: string): Token[] {
  const r = tokenize(input)
  if (!r.ok) throw new Error(`unexpected error: ${r.error.message}`)
  return r.tokens
}

describe('tokenize', () => {
  it('空入力は空配列', () => {
    expect(ok('')).toEqual([])
  })

  it('空白のみは空配列', () => {
    expect(ok('   \t  ')).toEqual([])
  })

  it('単一の単語', () => {
    expect(ok('ls')).toEqual([{ type: 'word', value: 'ls' }])
  })

  it('複数の単語をスペース区切り', () => {
    expect(ok('ls -la /home')).toEqual([
      { type: 'word', value: 'ls' },
      { type: 'word', value: '-la' },
      { type: 'word', value: '/home' },
    ])
  })

  it('連続スペースを 1 区切りとして扱う', () => {
    expect(ok('ls    -la')).toEqual([
      { type: 'word', value: 'ls' },
      { type: 'word', value: '-la' },
    ])
  })

  it('タブも区切りとして扱う', () => {
    expect(ok('a\tb')).toEqual([
      { type: 'word', value: 'a' },
      { type: 'word', value: 'b' },
    ])
  })

  it('シングルクォート内はリテラル (空白含む)', () => {
    expect(ok("echo 'hello world'")).toEqual([
      { type: 'word', value: 'echo' },
      { type: 'word', value: 'hello world' },
    ])
  })

  it('シングルクォート内のバックスラッシュは文字通り', () => {
    expect(ok("echo 'a\\nb'")).toEqual([
      { type: 'word', value: 'echo' },
      { type: 'word', value: 'a\\nb' },
    ])
  })

  it('ダブルクォート内は空白含めて1単語', () => {
    expect(ok('echo "hello world"')).toEqual([
      { type: 'word', value: 'echo' },
      { type: 'word', value: 'hello world' },
    ])
  })

  it('ダブルクォート内の \\" はエスケープ', () => {
    expect(ok('echo "a\\"b"')).toEqual([
      { type: 'word', value: 'echo' },
      { type: 'word', value: 'a"b' },
    ])
  })

  it('ダブルクォート内の \\\\ はエスケープ', () => {
    expect(ok('echo "a\\\\b"')).toEqual([
      { type: 'word', value: 'echo' },
      { type: 'word', value: 'a\\b' },
    ])
  })

  it('クォート外のバックスラッシュは次の 1 文字を literal 化', () => {
    expect(ok('echo a\\ b')).toEqual([
      { type: 'word', value: 'echo' },
      { type: 'word', value: 'a b' },
    ])
  })

  it('単語の途中にクォートを連結できる', () => {
    expect(ok('foo"bar baz"qux')).toEqual([{ type: 'word', value: 'foobar bazqux' }])
  })

  it('リダイレクト > は独立トークン', () => {
    expect(ok('echo hi > out')).toEqual([
      { type: 'word', value: 'echo' },
      { type: 'word', value: 'hi' },
      { type: 'redirect', op: '>' },
      { type: 'word', value: 'out' },
    ])
  })

  it('リダイレクト >> は独立トークン', () => {
    expect(ok('echo hi >> out')).toEqual([
      { type: 'word', value: 'echo' },
      { type: 'word', value: 'hi' },
      { type: 'redirect', op: '>>' },
      { type: 'word', value: 'out' },
    ])
  })

  it('スペース無しでも > は単語の境界', () => {
    expect(ok('echo hi>out')).toEqual([
      { type: 'word', value: 'echo' },
      { type: 'word', value: 'hi' },
      { type: 'redirect', op: '>' },
      { type: 'word', value: 'out' },
    ])
  })

  it('未閉じシングルクォートはエラー', () => {
    const r = tokenize("echo 'hello")
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.message).toContain('unterminated')
  })

  it('未閉じダブルクォートはエラー', () => {
    const r = tokenize('echo "hello')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.message).toContain('unterminated')
  })

  it('空文字列のクォート', () => {
    expect(ok("echo ''")).toEqual([
      { type: 'word', value: 'echo' },
      { type: 'word', value: '' },
    ])
  })

  it('末尾の単独 \\ はエラー', () => {
    const r = tokenize('echo \\')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.message).toContain('trailing backslash')
  })

  describe('MVP 未対応メタ文字は明示的にエラー', () => {
    const cases: Array<[string, string]> = [
      ['cat foo | grep x', 'pipe'],
      ['cat < foo', 'input redirect'],
      ['ls ; pwd', 'command separator'],
      ['sleep 1 &', 'background'],
      ['echo `date`', 'command substitution'],
      ['echo $HOME', 'variable'],
      ['(ls)', 'subshell'],
    ]
    for (const [input, expectedFragment] of cases) {
      it(`${input} → not supported`, () => {
        const r = tokenize(input)
        expect(r.ok).toBe(false)
        if (!r.ok) {
          expect(r.error.message).toContain('not supported')
          expect(r.error.message).toContain(expectedFragment)
        }
      })
    }

    it('クォート内のメタ文字は許容される', () => {
      expect(ok("echo '|'")).toEqual([
        { type: 'word', value: 'echo' },
        { type: 'word', value: '|' },
      ])
      expect(ok('echo "$HOME"')).toEqual([
        { type: 'word', value: 'echo' },
        { type: 'word', value: '$HOME' },
      ])
    })
  })
})
