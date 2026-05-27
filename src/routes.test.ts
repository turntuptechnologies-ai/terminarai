import { describe, expect, it } from 'vitest'
import { PATHS, toChapter, toLesson, toProblem } from './routes'

describe('routes', () => {
  it('PATHS は静的ルートと path テンプレートを揃える', () => {
    expect(PATHS.home).toBe('/')
    expect(PATHS.tutorial).toBe('/tutorial')
    expect(PATHS.chapter).toBe('/tutorial/:chapterId')
    expect(PATHS.lesson).toBe('/tutorial/:chapterId/:lessonId')
    expect(PATHS.practice).toBe('/practice')
    expect(PATHS.problem).toBe('/practice/:problemId')
    expect(PATHS.sandbox).toBe('/sandbox')
    expect(PATHS.reference).toBe('/reference')
    expect(PATHS.notFound).toBe('*')
  })

  it('toChapter は通常 ID を埋め込む', () => {
    expect(toChapter('1')).toBe('/tutorial/1')
    expect(toChapter('2')).toBe('/tutorial/2')
  })

  it('toLesson は両方の ID を埋め込む', () => {
    expect(toLesson('1', '1-1')).toBe('/tutorial/1/1-1')
    expect(toLesson('2', '2-3')).toBe('/tutorial/2/2-3')
  })

  it('toProblem は問題 ID を埋め込む', () => {
    expect(toProblem('p1')).toBe('/practice/p1')
  })

  it('URL に使えない文字は encodeURIComponent でエスケープされる', () => {
    // 通常想定外だが、ID にスラッシュやスペースが混入しても URL を壊さないこと
    expect(toChapter('a/b')).toBe('/tutorial/a%2Fb')
    expect(toLesson('1', 'a b')).toBe('/tutorial/1/a%20b')
    expect(toProblem('p?1')).toBe('/practice/p%3F1')
  })
})
