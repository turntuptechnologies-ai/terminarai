import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultVfs, type Vfs } from '../vfs'
import { complete, longestCommonPrefix, splitForCompletion } from './completion'

const REGISTERED = [
  'cat',
  'cd',
  'cp',
  'echo',
  'head',
  'ls',
  'mkdir',
  'mv',
  'pwd',
  'rm',
  'tail',
  'touch',
  'vi',
]

describe('longestCommonPrefix', () => {
  it('空配列なら空文字', () => {
    expect(longestCommonPrefix([])).toBe('')
  })

  it('単一要素はその文字列', () => {
    expect(longestCommonPrefix(['hello'])).toBe('hello')
  })

  it('全要素同一なら全体', () => {
    expect(longestCommonPrefix(['ls', 'ls'])).toBe('ls')
  })

  it('共通前方一致部分のみ返す', () => {
    expect(longestCommonPrefix(['cat', 'cd', 'cp'])).toBe('c')
  })

  it('共通部分がなければ空文字', () => {
    expect(longestCommonPrefix(['abc', 'xyz'])).toBe('')
  })
})

describe('splitForCompletion', () => {
  it('スラッシュなし → dirPart 空、base = 全体', () => {
    expect(splitForCompletion('home')).toEqual({ dirPart: '', base: 'home' })
  })

  it('絶対パス末尾なしルート直下', () => {
    expect(splitForCompletion('/home')).toEqual({ dirPart: '/', base: 'home' })
  })

  it('深いパス', () => {
    expect(splitForCompletion('/home/user/d')).toEqual({ dirPart: '/home/user', base: 'd' })
  })

  it('末尾スラッシュ', () => {
    expect(splitForCompletion('docs/')).toEqual({ dirPart: 'docs', base: '' })
  })
})

describe('complete - command completion', () => {
  let vfs: Vfs
  beforeEach(() => {
    vfs = createDefaultVfs()
  })

  it('1 文字目で c → 共通プレフィックスは c のままで候補表示 (cat/cd/cp)', () => {
    const r = complete('c', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('c')
    expect(r.candidates).toEqual(['cat', 'cd', 'cp'])
  })

  it('ca → 単一マッチで cat + 空白', () => {
    const r = complete('ca', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('cat ')
    expect(r.candidates).toEqual(['cat'])
  })

  it('p → 単一マッチで pwd + 空白', () => {
    const r = complete('p', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('pwd ')
  })

  it('mat → マッチなし、newInput 変化なし', () => {
    const r = complete('mat', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('mat')
    expect(r.candidates).toEqual([])
  })

  it('m → 共通プレフィックス m から拡張できない (mkdir / mv は m が共通)', () => {
    const r = complete('m', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('m')
    expect(r.candidates).toEqual(['mkdir', 'mv'])
  })

  it('空入力 → 全コマンドを候補に', () => {
    const r = complete('', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('')
    expect(r.candidates).toEqual([...REGISTERED].sort())
  })
})

describe('complete - path completion', () => {
  let vfs: Vfs
  beforeEach(() => {
    vfs = createDefaultVfs()
  })

  it('cd <スペース後 空> → cwd の全エントリ', () => {
    const r = complete('cd ', '/home/user', REGISTERED, vfs)
    // /home/user に README.txt, docs, hello.txt がある
    expect(r.candidates).toContain('README.txt')
    expect(r.candidates).toContain('docs/')
    expect(r.candidates).toContain('hello.txt')
  })

  it('cd he → 単一マッチで cd hello.txt + スペース (ファイル)', () => {
    const r = complete('cd he', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('cd hello.txt ')
    expect(r.candidates).toEqual(['hello.txt'])
  })

  it('cd do → 単一マッチで cd docs/ (ディレクトリ)', () => {
    const r = complete('cd do', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('cd docs/')
    expect(r.candidates).toEqual(['docs/'])
  })

  it('絶対パス /h → /home/ に補完', () => {
    const r = complete('cd /h', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('cd /home/')
  })

  it('絶対パス /home/u → /home/user/ に補完', () => {
    const r = complete('cd /home/u', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('cd /home/user/')
  })

  it('cat REA → cat README.txt + スペース', () => {
    const r = complete('cat REA', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('cat README.txt ')
  })

  it('存在しないディレクトリ → 変化なし', () => {
    const r = complete('cd /nope/x', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('cd /nope/x')
    expect(r.candidates).toEqual([])
  })

  it('隠しファイルはデフォルトで非表示', () => {
    vfs.writeFile('/home/user/.bashrc', 'x')
    const r = complete('cat ', '/home/user', REGISTERED, vfs)
    expect(r.candidates).not.toContain('.bashrc')
  })

  it('. プレフィックスで隠しファイルも表示', () => {
    vfs.writeFile('/home/user/.bashrc', 'x')
    const r = complete('cat .b', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('cat .bashrc ')
  })

  it('共通プレフィックスへの拡張 (複数マッチ)', () => {
    vfs.writeFile('/home/user/note-a.txt', 'a')
    vfs.writeFile('/home/user/note-b.txt', 'b')
    const r = complete('cat n', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('cat note-')
    expect(r.candidates.sort()).toEqual(['note-a.txt', 'note-b.txt'])
  })

  it('docs/ → docs 配下の中身を候補に', () => {
    vfs.writeFile('/home/user/docs/note.txt', 'x')
    const r = complete('cat docs/', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('cat docs/note.txt ')
  })

  it('~/ から HOME 配下を補完 (~ 表記は温存される)', () => {
    const r = complete('cd ~/d', '/tmp', REGISTERED, vfs)
    expect(r.newInput).toBe('cd ~/docs/')
  })

  it('.. を含む相対パスも補完できる (.. 表記は温存)', () => {
    // /home/user から ../u → /home/user/* を探すのではなく /home/u* を探す
    const r = complete('cd ../u', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('cd ../user/')
  })

  it('相対の無効ディレクトリは変化なし', () => {
    const r = complete('cd nope/x', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('cd nope/x')
    expect(r.candidates).toEqual([])
  })

  it('共通プレフィックス拡張 (cp / co... のような部分マッチ)', () => {
    vfs.writeFile('/home/user/cola.txt', 'a')
    vfs.writeFile('/home/user/cone.txt', 'b')
    const r = complete('cat co', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('cat co')
    expect(r.candidates.sort()).toEqual(['cola.txt', 'cone.txt'])
  })
})

describe('complete - 先頭スペースのエッジケース', () => {
  it('"  ls" (先頭空白) はコマンド補完を返す', () => {
    const vfs = createDefaultVfs()
    const r = complete('  ls', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('  ls ')
  })

  it('"  c" でも複数候補表示', () => {
    const vfs = createDefaultVfs()
    const r = complete('  c', '/home/user', REGISTERED, vfs)
    expect(r.newInput).toBe('  c')
    expect(r.candidates).toEqual(['cat', 'cd', 'cp'])
  })
})
