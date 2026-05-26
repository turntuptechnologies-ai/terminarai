import { describe, expect, it } from 'vitest'
import type { VfsDirectory, VfsFile } from '../../vfs'
import { compareName, fileSize, formatMode, formatMtime, isHidden } from './util'

const dir: VfsDirectory = {
  type: 'directory',
  name: 'docs',
  mtime: new Date('2026-05-26T12:34:00').getTime(),
  mode: 0o755,
  children: {},
}

const file: VfsFile = {
  type: 'file',
  name: 'a.txt',
  mtime: new Date('2026-01-05T03:04:00').getTime(),
  mode: 0o644,
  content: 'hello world',
}

describe('formatMode', () => {
  it('ディレクトリ 0o755 → drwxr-xr-x', () => {
    expect(formatMode(dir)).toBe('drwxr-xr-x')
  })

  it('ファイル 0o644 → -rw-r--r--', () => {
    expect(formatMode(file)).toBe('-rw-r--r--')
  })

  it('実行可能ファイル 0o755 → -rwxr-xr-x', () => {
    expect(formatMode({ ...file, mode: 0o755 })).toBe('-rwxr-xr-x')
  })

  it('全クリア 0o000 → ----------', () => {
    expect(formatMode({ ...file, mode: 0 })).toBe('----------')
  })
})

describe('formatMtime', () => {
  it('2 桁日付', () => {
    expect(formatMtime(new Date('2026-05-26T12:34:00').getTime())).toBe('May 26 12:34')
  })

  it('1 桁日付は空白パディング', () => {
    expect(formatMtime(new Date('2026-01-05T03:04:00').getTime())).toBe('Jan  5 03:04')
  })
})

describe('fileSize', () => {
  it('ディレクトリは 4096', () => {
    expect(fileSize(dir)).toBe(4096)
  })

  it('ファイルは content.length', () => {
    expect(fileSize(file)).toBe('hello world'.length)
  })
})

describe('isHidden', () => {
  it('. で始まるなら true', () => {
    expect(isHidden('.bashrc')).toBe(true)
  })

  it('. で始まらないなら false', () => {
    expect(isHidden('README.txt')).toBe(false)
  })
})

describe('compareName', () => {
  it('辞書順', () => {
    const arr = ['c', 'a', 'b']
    expect([...arr].sort(compareName)).toEqual(['a', 'b', 'c'])
  })

  it('大文字小文字は ASCII 順', () => {
    expect([...['b', 'A']].sort(compareName)).toEqual(['A', 'b'])
  })
})
