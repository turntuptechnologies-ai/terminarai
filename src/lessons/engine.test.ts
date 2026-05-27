import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultVfs, type Vfs } from '../vfs'
import { evaluateCheck } from './engine'
import type { Check, EvalContext } from './types'

describe('evaluateCheck', () => {
  let vfs: Vfs

  beforeEach(() => {
    vfs = createDefaultVfs()
  })

  function ctx(over: Partial<EvalContext> = {}): EvalContext {
    return {
      vfs,
      cwd: '/home/user',
      lastCommand: '',
      ...over,
    }
  }

  describe('cwd-equals', () => {
    const check: Check = { kind: 'cwd-equals', path: '/home/user/docs' }

    it('一致なら true', () => {
      expect(evaluateCheck(check, ctx({ cwd: '/home/user/docs' }))).toBe(true)
    })

    it('不一致なら false', () => {
      expect(evaluateCheck(check, ctx({ cwd: '/home/user' }))).toBe(false)
    })

    it('末尾スラッシュの表記揺れは正規化されて一致扱い', () => {
      expect(evaluateCheck(check, ctx({ cwd: '/home/user/docs/' }))).toBe(true)
    })

    it('check.path に末尾スラッシュがあっても一致扱い', () => {
      const c: Check = { kind: 'cwd-equals', path: '/home/user/docs/' }
      expect(evaluateCheck(c, ctx({ cwd: '/home/user/docs' }))).toBe(true)
    })
  })

  describe('file-exists', () => {
    it('存在するファイル → true', () => {
      const check: Check = { kind: 'file-exists', path: '/home/user/README.txt' }
      expect(evaluateCheck(check, ctx())).toBe(true)
    })

    it('存在するディレクトリ → true', () => {
      const check: Check = { kind: 'file-exists', path: '/home/user/docs' }
      expect(evaluateCheck(check, ctx())).toBe(true)
    })

    it('存在しないパス → false', () => {
      const check: Check = { kind: 'file-exists', path: '/nope' }
      expect(evaluateCheck(check, ctx())).toBe(false)
    })
  })

  describe('file-contains', () => {
    it('内容が含まれていれば true', () => {
      vfs.writeFile('/home/user/note.txt', 'hello world')
      const check: Check = { kind: 'file-contains', path: '/home/user/note.txt', text: 'hello' }
      expect(evaluateCheck(check, ctx())).toBe(true)
    })

    it('含まれていなければ false', () => {
      vfs.writeFile('/home/user/note.txt', 'foo')
      const check: Check = { kind: 'file-contains', path: '/home/user/note.txt', text: 'bar' }
      expect(evaluateCheck(check, ctx())).toBe(false)
    })

    it('存在しないファイル → false', () => {
      const check: Check = { kind: 'file-contains', path: '/nope', text: 'x' }
      expect(evaluateCheck(check, ctx())).toBe(false)
    })

    it('ディレクトリ → false', () => {
      const check: Check = { kind: 'file-contains', path: '/home/user/docs', text: 'x' }
      expect(evaluateCheck(check, ctx())).toBe(false)
    })
  })

  describe('command-matches', () => {
    it('正規表現にマッチすれば true', () => {
      const check: Check = { kind: 'command-matches', pattern: '^pwd$' }
      expect(evaluateCheck(check, ctx({ lastCommand: 'pwd' }))).toBe(true)
    })

    it('マッチしなければ false', () => {
      const check: Check = { kind: 'command-matches', pattern: '^pwd$' }
      expect(evaluateCheck(check, ctx({ lastCommand: 'ls' }))).toBe(false)
    })

    it('部分マッチでもパターン次第で true', () => {
      const check: Check = { kind: 'command-matches', pattern: 'cd' }
      expect(evaluateCheck(check, ctx({ lastCommand: 'cd ~' }))).toBe(true)
    })

    it('flags が機能する (i)', () => {
      const check: Check = { kind: 'command-matches', pattern: '^LS$', flags: 'i' }
      expect(evaluateCheck(check, ctx({ lastCommand: 'ls' }))).toBe(true)
    })

    it('不正な正規表現は false (例外を投げない)', () => {
      const check: Check = { kind: 'command-matches', pattern: '[' }
      expect(evaluateCheck(check, ctx({ lastCommand: 'pwd' }))).toBe(false)
    })
  })

  describe('and / or', () => {
    it('and: 全て true なら true', () => {
      const check: Check = {
        kind: 'and',
        checks: [
          { kind: 'cwd-equals', path: '/home/user' },
          { kind: 'command-matches', pattern: '^pwd$' },
        ],
      }
      expect(evaluateCheck(check, ctx({ lastCommand: 'pwd' }))).toBe(true)
    })

    it('and: 1 つでも false なら false', () => {
      const check: Check = {
        kind: 'and',
        checks: [
          { kind: 'cwd-equals', path: '/home/user' },
          { kind: 'command-matches', pattern: '^ls$' },
        ],
      }
      expect(evaluateCheck(check, ctx({ lastCommand: 'pwd' }))).toBe(false)
    })

    it('or: 1 つでも true なら true', () => {
      const check: Check = {
        kind: 'or',
        checks: [
          { kind: 'command-matches', pattern: '^pwd$' },
          { kind: 'command-matches', pattern: '^ls$' },
        ],
      }
      expect(evaluateCheck(check, ctx({ lastCommand: 'ls' }))).toBe(true)
    })

    it('or: 全て false なら false', () => {
      const check: Check = {
        kind: 'or',
        checks: [{ kind: 'cwd-equals', path: '/tmp' }],
      }
      expect(evaluateCheck(check, ctx())).toBe(false)
    })

    it('ネスト構造を評価できる', () => {
      const check: Check = {
        kind: 'and',
        checks: [
          { kind: 'file-exists', path: '/home/user/README.txt' },
          {
            kind: 'or',
            checks: [
              { kind: 'cwd-equals', path: '/tmp' },
              { kind: 'cwd-equals', path: '/home/user' },
            ],
          },
        ],
      }
      expect(evaluateCheck(check, ctx())).toBe(true)
    })

    it('空 and は false (作者ミス検知のため defensive default)', () => {
      expect(evaluateCheck({ kind: 'and', checks: [] }, ctx())).toBe(false)
    })

    it('空 or も false', () => {
      expect(evaluateCheck({ kind: 'or', checks: [] }, ctx())).toBe(false)
    })
  })

  describe('not', () => {
    it('内側が true なら false', () => {
      const check: Check = {
        kind: 'not',
        check: { kind: 'file-exists', path: '/home/user/README.txt' },
      }
      expect(evaluateCheck(check, ctx())).toBe(false)
    })

    it('内側が false なら true (削除確認に便利)', () => {
      const check: Check = {
        kind: 'not',
        check: { kind: 'file-exists', path: '/home/user/nope.txt' },
      }
      expect(evaluateCheck(check, ctx())).toBe(true)
    })

    it('and / or と組み合わせ可能', () => {
      const check: Check = {
        kind: 'and',
        checks: [
          { kind: 'file-exists', path: '/home/user/README.txt' },
          { kind: 'not', check: { kind: 'file-exists', path: '/home/user/nope.txt' } },
        ],
      }
      expect(evaluateCheck(check, ctx())).toBe(true)
    })
  })

  describe('command-name', () => {
    it('そのままの名前 pwd でクリア', () => {
      const check: Check = { kind: 'command-name', name: 'pwd' }
      expect(evaluateCheck(check, ctx({ lastCommand: 'pwd' }))).toBe(true)
    })

    it('引数があってもコマンド名だけで判定', () => {
      const check: Check = { kind: 'command-name', name: 'ls' }
      expect(evaluateCheck(check, ctx({ lastCommand: 'ls -la /home' }))).toBe(true)
    })

    it('絶対パスのフルパス /bin/pwd は basename で pwd 扱い', () => {
      const check: Check = { kind: 'command-name', name: 'pwd' }
      expect(evaluateCheck(check, ctx({ lastCommand: '/bin/pwd' }))).toBe(true)
    })

    it('相対パス ./script は basename で script 扱い', () => {
      const check: Check = { kind: 'command-name', name: 'script' }
      expect(evaluateCheck(check, ctx({ lastCommand: './script arg1' }))).toBe(true)
    })

    it('別のコマンドは false', () => {
      const check: Check = { kind: 'command-name', name: 'pwd' }
      expect(evaluateCheck(check, ctx({ lastCommand: 'ls' }))).toBe(false)
    })

    it('case-sensitive (LS は ls と一致しない)', () => {
      const check: Check = { kind: 'command-name', name: 'ls' }
      expect(evaluateCheck(check, ctx({ lastCommand: 'LS' }))).toBe(false)
    })

    it('空入力は false', () => {
      const check: Check = { kind: 'command-name', name: 'pwd' }
      expect(evaluateCheck(check, ctx({ lastCommand: '' }))).toBe(false)
    })

    it('tokenize エラー (未対応メタ) は false', () => {
      const check: Check = { kind: 'command-name', name: 'cat' }
      expect(evaluateCheck(check, ctx({ lastCommand: 'cat foo | grep x' }))).toBe(false)
    })

    it('redirect 先頭でもコマンド名で判定 (> out echo hi → echo)', () => {
      const check: Check = { kind: 'command-name', name: 'echo' }
      expect(evaluateCheck(check, ctx({ lastCommand: '> out echo hi' }))).toBe(true)
    })

    it('not / and / or との組み合わせ', () => {
      const check: Check = {
        kind: 'and',
        checks: [
          { kind: 'command-name', name: 'pwd' },
          { kind: 'not', check: { kind: 'cwd-equals', path: '/tmp' } },
        ],
      }
      expect(evaluateCheck(check, ctx({ cwd: '/home/user', lastCommand: 'pwd' }))).toBe(true)
    })
  })
})
