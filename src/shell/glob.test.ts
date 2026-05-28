import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultVfs, type Vfs } from '../vfs'
import { expandGlobs, globToRegExp } from './glob'

describe('globToRegExp', () => {
  it('* は /  以外の任意文字列', () => {
    const re = globToRegExp('*.txt')
    expect(re.test('a.txt')).toBe(true)
    expect(re.test('.txt')).toBe(true)
    expect(re.test('abc.txt')).toBe(true)
    expect(re.test('a.md')).toBe(false)
    expect(re.test('a/b.txt')).toBe(false) // / は跨がない
  })

  it('? は 1 文字', () => {
    const re = globToRegExp('a?c')
    expect(re.test('abc')).toBe(true)
    expect(re.test('axc')).toBe(true)
    expect(re.test('ac')).toBe(false)
    expect(re.test('abbc')).toBe(false)
  })

  it('[abc] 文字クラス', () => {
    const re = globToRegExp('file[123].log')
    expect(re.test('file1.log')).toBe(true)
    expect(re.test('file2.log')).toBe(true)
    expect(re.test('file4.log')).toBe(false)
  })

  it('[a-z] 範囲', () => {
    const re = globToRegExp('[a-c]x')
    expect(re.test('ax')).toBe(true)
    expect(re.test('cx')).toBe(true)
    expect(re.test('dx')).toBe(false)
  })

  it('[!abc] 否定', () => {
    const re = globToRegExp('[!0-9]')
    expect(re.test('a')).toBe(true)
    expect(re.test('5')).toBe(false)
  })

  it('正規表現メタ文字をエスケープ', () => {
    const re = globToRegExp('a.b+c')
    expect(re.test('a.b+c')).toBe(true)
    expect(re.test('axbxc')).toBe(false) // . はリテラル
  })

  it('閉じない [ はリテラル扱い', () => {
    const re = globToRegExp('a[b')
    expect(re.test('a[b')).toBe(true)
  })
})

describe('expandGlobs', () => {
  let vfs: Vfs

  beforeEach(() => {
    vfs = createDefaultVfs()
    // /home/user に README.txt, hello.txt, docs/ がデフォルトで存在
    vfs.writeFile('/home/user/a.log', 'a')
    vfs.writeFile('/home/user/b.log', 'b')
    vfs.writeFile('/home/user/.hidden.txt', 'secret')
  })

  it('glob を含まない語はそのまま', () => {
    expect(expandGlobs(['grep', 'foo', 'README.txt'], '/home/user', vfs)).toEqual([
      'grep',
      'foo',
      'README.txt',
    ])
  })

  it('*.txt は cwd の .txt ファイルに展開 (ソート済み、隠しファイル除外)', () => {
    const r = expandGlobs(['*.txt'], '/home/user', vfs)
    expect(r).toEqual(['README.txt', 'hello.txt'])
    expect(r).not.toContain('.hidden.txt')
  })

  it('*.log は a.log b.log に展開', () => {
    expect(expandGlobs(['grep', 'x', '*.log'], '/home/user', vfs)).toEqual([
      'grep',
      'x',
      'a.log',
      'b.log',
    ])
  })

  it('マッチ無しはリテラル維持 (nullglob off)', () => {
    expect(expandGlobs(['*.md'], '/home/user', vfs)).toEqual(['*.md'])
  })

  it('. で始まる pattern なら隠しファイルもマッチ', () => {
    const r = expandGlobs(['.*'], '/home/user', vfs)
    expect(r).toContain('.hidden.txt')
  })

  it('ディレクトリ prefix 付き (docs/*)', () => {
    vfs.writeFile('/home/user/docs/note1.md', '1')
    vfs.writeFile('/home/user/docs/note2.md', '2')
    expect(expandGlobs(['docs/*.md'], '/home/user', vfs)).toEqual([
      'docs/note1.md',
      'docs/note2.md',
    ])
  })

  it('絶対パス prefix (/home/user/*.log)', () => {
    const r = expandGlobs(['/home/user/*.log'], '/tmp', vfs)
    expect(r).toEqual(['/home/user/a.log', '/home/user/b.log'])
  })

  it('? と [...] の展開', () => {
    vfs.writeFile('/home/user/f1.log', '')
    vfs.writeFile('/home/user/f2.log', '')
    // f?.log は「f + 任意1文字 + .log」→ f1.log / f2.log のみ (a.log/b.log は f 始まりでない)
    expect(expandGlobs(['f?.log'], '/home/user', vfs)).toEqual(['f1.log', 'f2.log'])
    expect(expandGlobs(['f[12].log'], '/home/user', vfs)).toEqual(['f1.log', 'f2.log'])
  })

  it('存在しないディレクトリ prefix はリテラル維持', () => {
    expect(expandGlobs(['nope/*.txt'], '/home/user', vfs)).toEqual(['nope/*.txt'])
  })

  it('中間セグメントの glob は未対応 (リテラル維持)', () => {
    expect(expandGlobs(['*/note.md'], '/home/user', vfs)).toEqual(['*/note.md'])
  })

  it('複数の glob 語を同時展開', () => {
    const r = expandGlobs(['cat', '*.txt', '*.log'], '/home/user', vfs)
    expect(r).toEqual(['cat', 'README.txt', 'hello.txt', 'a.log', 'b.log'])
  })
})
