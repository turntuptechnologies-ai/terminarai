import { describe, expect, it } from 'vitest'
import { locList } from '../../i18n'
import { createDefaultVfs, type Vfs } from '../../vfs'
import { evaluateCheck } from '../engine'
import type { EvalContext } from '../types'
import { CHAPTER_4 } from './chapter4'

function ctxFor(over: Partial<EvalContext> & { vfs?: Vfs } = {}): EvalContext {
  return {
    vfs: over.vfs ?? createDefaultVfs(),
    cwd: '/home/user',
    lastCommand: '',
    ...over,
  }
}

const getLessonOrThrow = (id: string) => {
  const l = CHAPTER_4.lessons.find((x) => x.id === id)
  if (!l) throw new Error(`lesson ${id} not found`)
  return l
}

describe('CHAPTER_4 構造', () => {
  it('4 レッスン構成', () => {
    expect(CHAPTER_4.id).toBe('4')
    expect(CHAPTER_4.lessons.map((l) => l.id)).toEqual(['4-1', '4-2', '4-3', '4-4'])
  })

  it('全レッスンの chapterId が "4"', () => {
    for (const lesson of CHAPTER_4.lessons) {
      expect(lesson.chapterId).toBe('4')
    }
  })

  it('全ステップに instruction / hints / check がある', () => {
    for (const lesson of CHAPTER_4.lessons) {
      for (const step of lesson.steps) {
        expect(step.instruction).toBeTruthy()
        const hints = step.hints ? locList(step.hints, 'ja') : []
        expect(hints.length > 0, `${lesson.id} のヒントが未定義または空`).toBe(true)
        expect(step.check).toBeDefined()
      }
    }
  })
})

describe('CHAPTER_4 各レッスンの check が期待コマンドで通る', () => {
  it('4-1: cat ./README.txt でクリア (cwd=/home/user)', () => {
    const lesson = getLessonOrThrow('4-1')
    expect(
      evaluateCheck(
        lesson.steps[0].check,
        ctxFor({ cwd: '/home/user', lastCommand: 'cat ./README.txt' }),
      ),
    ).toBe(true)
  })

  it('4-1: cat README.txt (`./` 抜き) ではクリアしない (明示性を学ぶ意図)', () => {
    const lesson = getLessonOrThrow('4-1')
    expect(
      evaluateCheck(
        lesson.steps[0].check,
        ctxFor({ cwd: '/home/user', lastCommand: 'cat README.txt' }),
      ),
    ).toBe(false)
  })

  it('4-2 step1: cd ~ で /home/user に着けばクリア (cwd=/tmp 開始)', () => {
    const lesson = getLessonOrThrow('4-2')
    expect(lesson.initialCwd).toBe('/tmp')
    expect(
      evaluateCheck(lesson.steps[0].check, ctxFor({ cwd: '/home/user', lastCommand: 'cd ~' })),
    ).toBe(true)
  })

  it('4-2 step1: cd /home/user (絶対パス) ではクリアしない (~ を学ぶ意図)', () => {
    const lesson = getLessonOrThrow('4-2')
    expect(
      evaluateCheck(
        lesson.steps[0].check,
        ctxFor({ cwd: '/home/user', lastCommand: 'cd /home/user' }),
      ),
    ).toBe(false)
  })

  it('4-2 step2: cat ~/hello.txt でクリア', () => {
    const lesson = getLessonOrThrow('4-2')
    expect(evaluateCheck(lesson.steps[1].check, ctxFor({ lastCommand: 'cat ~/hello.txt' }))).toBe(
      true,
    )
  })

  it('4-3: cwd=/home/user/docs で cat ../README.txt でクリア', () => {
    const lesson = getLessonOrThrow('4-3')
    expect(lesson.initialCwd).toBe('/home/user/docs')
    expect(
      evaluateCheck(
        lesson.steps[0].check,
        ctxFor({ cwd: '/home/user/docs', lastCommand: 'cat ../README.txt' }),
      ),
    ).toBe(true)
  })

  it('4-3: 親に移動してから cat ではクリアしない (../ を学ぶ意図)', () => {
    const lesson = getLessonOrThrow('4-3')
    // cwd が /home/user/docs であることを check が要求しているので、
    // cd .. で親に移動 (cwd=/home/user) すると cwd-equals が false
    expect(
      evaluateCheck(
        lesson.steps[0].check,
        ctxFor({ cwd: '/home/user', lastCommand: 'cat README.txt' }),
      ),
    ).toBe(false)
  })

  it('4-4 step1: 絶対パス cat /home/user/README.txt でクリア', () => {
    const lesson = getLessonOrThrow('4-4')
    expect(lesson.initialCwd).toBe('/tmp')
    expect(
      evaluateCheck(
        lesson.steps[0].check,
        ctxFor({ cwd: '/tmp', lastCommand: 'cat /home/user/README.txt' }),
      ),
    ).toBe(true)
  })

  it('4-4 step2: cat ~/README.txt でクリア', () => {
    const lesson = getLessonOrThrow('4-4')
    expect(
      evaluateCheck(
        lesson.steps[1].check,
        ctxFor({ cwd: '/tmp', lastCommand: 'cat ~/README.txt' }),
      ),
    ).toBe(true)
  })

  it('4-4 step3: cd ~ してから cat README.txt (相対) でクリア', () => {
    const lesson = getLessonOrThrow('4-4')
    expect(
      evaluateCheck(
        lesson.steps[2].check,
        ctxFor({ cwd: '/home/user', lastCommand: 'cat README.txt' }),
      ),
    ).toBe(true)
  })

  it('4-4 step3: 絶対パス cat /home/user/README.txt ではクリアしない (相対パスを学ぶ意図)', () => {
    const lesson = getLessonOrThrow('4-4')
    expect(
      evaluateCheck(
        lesson.steps[2].check,
        ctxFor({ cwd: '/home/user', lastCommand: 'cat /home/user/README.txt' }),
      ),
    ).toBe(false)
  })
})
