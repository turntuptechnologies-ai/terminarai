import { describe, expect, it } from 'vitest'
import { locList } from '../../i18n'
import { createDefaultVfs, type Vfs } from '../../vfs'
import { evaluateCheck } from '../engine'
import type { EvalContext } from '../types'
import { CHAPTER_2 } from './chapter2'

function ctxFor(over: Partial<EvalContext> & { vfs?: Vfs } = {}): EvalContext {
  return {
    vfs: over.vfs ?? createDefaultVfs(),
    cwd: '/home/user',
    lastCommand: '',
    ...over,
  }
}

const getLessonOrThrow = (id: string) => {
  const l = CHAPTER_2.lessons.find((x) => x.id === id)
  if (!l) throw new Error(`lesson ${id} not found`)
  return l
}

describe('CHAPTER_2 構造', () => {
  it('5 レッスン構成', () => {
    expect(CHAPTER_2.id).toBe('2')
    expect(CHAPTER_2.lessons.map((l) => l.id)).toEqual(['2-1', '2-2', '2-3', '2-4', '2-5'])
  })

  it('全レッスンの chapterId が "2"', () => {
    for (const lesson of CHAPTER_2.lessons) {
      expect(lesson.chapterId).toBe('2')
    }
  })

  it('全ステップに instruction / hint / check がある', () => {
    for (const lesson of CHAPTER_2.lessons) {
      for (const step of lesson.steps) {
        expect(step.instruction).toBeTruthy()
        const hints = step.hints ? locList(step.hints, 'ja') : []
        expect(hints.length > 0, `${lesson.id} のヒントが未定義または空`).toBe(true)
        expect(step.check).toBeDefined()
      }
    }
  })
})

describe('CHAPTER_2 各レッスンの check', () => {
  it('2-1: cat README.txt でクリア (相対パスでも絶対パスでも)', () => {
    const lesson = getLessonOrThrow('2-1')
    const check = lesson.steps[0].check
    expect(evaluateCheck(check, ctxFor({ lastCommand: 'cat README.txt' }))).toBe(true)
    expect(evaluateCheck(check, ctxFor({ lastCommand: 'cat /home/user/README.txt' }))).toBe(true)
  })

  it('2-1: README 以外の cat ではクリアしない', () => {
    const lesson = getLessonOrThrow('2-1')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'cat hello.txt' }))).toBe(
      false,
    )
  })

  it('2-2: 絶対パス cat /home/user/README.txt のみクリア', () => {
    const lesson = getLessonOrThrow('2-2')
    expect(
      evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'cat /home/user/README.txt' })),
    ).toBe(true)
    // 相対パスではクリアしない
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'cat README.txt' }))).toBe(
      false,
    )
  })

  it('2-2 の initialCwd は /tmp', () => {
    expect(getLessonOrThrow('2-2').initialCwd).toBe('/tmp')
  })

  it('2-3: cwd が /home/user に戻ればクリア', () => {
    const lesson = getLessonOrThrow('2-3')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ cwd: '/home/user' }))).toBe(true)
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ cwd: '/home/user/docs' }))).toBe(false)
  })

  it('2-3 の initialCwd は /home/user/docs', () => {
    expect(getLessonOrThrow('2-3').initialCwd).toBe('/home/user/docs')
  })

  it('2-4 step1: cd ../.. で /home 到達ならクリア', () => {
    const lesson = getLessonOrThrow('2-4')
    expect(
      evaluateCheck(lesson.steps[0].check, ctxFor({ cwd: '/home', lastCommand: 'cd ../..' })),
    ).toBe(true)
  })

  it('2-4 step1: 絶対パス cd /home で到達してもクリアしない (.. 学習が主旨)', () => {
    const lesson = getLessonOrThrow('2-4')
    expect(
      evaluateCheck(lesson.steps[0].check, ctxFor({ cwd: '/home', lastCommand: 'cd /home' })),
    ).toBe(false)
  })

  it('2-4 step2: 絶対パス cd /home/user でクリア', () => {
    const lesson = getLessonOrThrow('2-4')
    expect(
      evaluateCheck(
        lesson.steps[1].check,
        ctxFor({ cwd: '/home/user', lastCommand: 'cd /home/user' }),
      ),
    ).toBe(true)
  })

  it('2-4 step2: 相対パス cd .. で到達してもクリアしない (絶対パス学習が主旨)', () => {
    const lesson = getLessonOrThrow('2-4')
    expect(
      evaluateCheck(lesson.steps[1].check, ctxFor({ cwd: '/home/user', lastCommand: 'cd ..' })),
    ).toBe(false)
  })

  it('2-5 step1: greeting.txt に "hello" が書かれていればクリア', () => {
    const lesson = getLessonOrThrow('2-5')
    const vfs = createDefaultVfs()
    vfs.writeFile('/home/user/greeting.txt', 'hello')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ vfs }))).toBe(true)
  })

  it('2-5 step1: ファイル未作成だとクリアしない', () => {
    const lesson = getLessonOrThrow('2-5')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor())).toBe(false)
  })

  it('2-5 step2: greeting 存在 + cat greeting コマンドで両方満たすとクリア', () => {
    const lesson = getLessonOrThrow('2-5')
    const vfs = createDefaultVfs()
    vfs.writeFile('/home/user/greeting.txt', 'hello')
    expect(
      evaluateCheck(lesson.steps[1].check, ctxFor({ vfs, lastCommand: 'cat greeting.txt' })),
    ).toBe(true)
  })

  it('2-5 step2: cat 以外のコマンドだとクリアしない', () => {
    const lesson = getLessonOrThrow('2-5')
    const vfs = createDefaultVfs()
    vfs.writeFile('/home/user/greeting.txt', 'hello')
    expect(
      evaluateCheck(lesson.steps[1].check, ctxFor({ vfs, lastCommand: 'ls greeting.txt' })),
    ).toBe(false)
  })

  it('2-5 step2: ファイル未作成 + cat コマンドのみではクリアしない (and の左辺が効く)', () => {
    const lesson = getLessonOrThrow('2-5')
    expect(evaluateCheck(lesson.steps[1].check, ctxFor({ lastCommand: 'cat greeting.txt' }))).toBe(
      false,
    )
  })

  it('2-1: \\b 境界が効いて aREADME.txt や README.txt2 はクリアしない', () => {
    const lesson = getLessonOrThrow('2-1')
    const check = lesson.steps[0].check
    expect(evaluateCheck(check, ctxFor({ lastCommand: 'cat aREADME.txt' }))).toBe(false)
    expect(evaluateCheck(check, ctxFor({ lastCommand: 'cat README.txt2' }))).toBe(false)
  })
})
