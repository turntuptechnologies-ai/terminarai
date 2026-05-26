import { describe, expect, it } from 'vitest'
import { basename, dirname, normalize, resolve, splitPath } from './path'

describe('normalize', () => {
  it('ルートはそのまま', () => {
    expect(normalize('/')).toBe('/')
  })

  it('連続スラッシュを単一に', () => {
    expect(normalize('//a///b//c')).toBe('/a/b/c')
  })

  it('末尾スラッシュを削除', () => {
    expect(normalize('/a/b/')).toBe('/a/b')
  })

  it('. セグメントを削除', () => {
    expect(normalize('/a/./b/./c')).toBe('/a/b/c')
  })

  it('.. セグメントで親へ', () => {
    expect(normalize('/a/b/../c')).toBe('/a/c')
  })

  it('連続する .. はルートを超えない', () => {
    expect(normalize('/../../a')).toBe('/a')
  })

  it('先頭にスラッシュがなくても絶対パス扱い', () => {
    expect(normalize('a/b')).toBe('/a/b')
  })
})

describe('resolve', () => {
  it('絶対パスは cwd を無視', () => {
    expect(resolve('/home/user', '/etc/passwd')).toBe('/etc/passwd')
  })

  it('相対パスは cwd 起点', () => {
    expect(resolve('/home/user', 'docs')).toBe('/home/user/docs')
  })

  it('./ プレフィックスを正規化', () => {
    expect(resolve('/home/user', './docs')).toBe('/home/user/docs')
  })

  it('../ で親へ', () => {
    expect(resolve('/home/user/docs', '../README.txt')).toBe('/home/user/README.txt')
  })

  it('~ は HOME_PATH に展開', () => {
    expect(resolve('/tmp', '~')).toBe('/home/user')
  })

  it('~/path は HOME_PATH 配下に展開', () => {
    expect(resolve('/tmp', '~/docs/note.md')).toBe('/home/user/docs/note.md')
  })

  it('空のパスは cwd を返す', () => {
    expect(resolve('/home/user', '')).toBe('/home/user')
  })

  it('cwd がルートの相対パス', () => {
    expect(resolve('/', 'tmp')).toBe('/tmp')
  })

  it('cwd がルートの ../', () => {
    expect(resolve('/', '../foo')).toBe('/foo')
  })
})

describe('dirname', () => {
  it('ルートの親はルート', () => {
    expect(dirname('/')).toBe('/')
  })

  it('トップレベルの親はルート', () => {
    expect(dirname('/foo')).toBe('/')
  })

  it('深いパスの親', () => {
    expect(dirname('/a/b/c')).toBe('/a/b')
  })

  it('末尾スラッシュ付きでも同じ', () => {
    expect(dirname('/a/b/c/')).toBe('/a/b')
  })
})

describe('basename', () => {
  it('ルートは /', () => {
    expect(basename('/')).toBe('/')
  })

  it('トップレベル', () => {
    expect(basename('/foo')).toBe('foo')
  })

  it('深いパス', () => {
    expect(basename('/a/b/c')).toBe('c')
  })

  it('末尾スラッシュ無視', () => {
    expect(basename('/a/b/c/')).toBe('c')
  })
})

describe('splitPath', () => {
  it('ルートは空配列', () => {
    expect(splitPath('/')).toEqual([])
  })

  it('一段', () => {
    expect(splitPath('/foo')).toEqual(['foo'])
  })

  it('複数段', () => {
    expect(splitPath('/a/b/c')).toEqual(['a', 'b', 'c'])
  })
})
