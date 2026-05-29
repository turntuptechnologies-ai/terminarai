import { describe, expect, it } from 'vitest'
import { locList } from '../../i18n'
import { createDefaultVfs, type Vfs } from '../../vfs'
import { evaluateCheck } from '../engine'
import type { EvalContext } from '../types'
import { CHAPTER_7 } from './chapter7'

function ctxFor(over: Partial<EvalContext> & { vfs?: Vfs } = {}): EvalContext {
  return {
    vfs: over.vfs ?? createDefaultVfs(),
    cwd: '/home/user',
    lastCommand: '',
    ...over,
  }
}

const getLessonOrThrow = (id: string) => {
  const l = CHAPTER_7.lessons.find((x) => x.id === id)
  if (!l) throw new Error(`lesson ${id} not found`)
  return l
}

describe('CHAPTER_7 構造', () => {
  it('5 レッスン構成', () => {
    expect(CHAPTER_7.id).toBe('7')
    expect(CHAPTER_7.lessons.map((l) => l.id)).toEqual(['7-1', '7-2', '7-3', '7-4', '7-5'])
  })

  it('全レッスンの chapterId が "7"', () => {
    for (const lesson of CHAPTER_7.lessons) {
      expect(lesson.chapterId).toBe('7')
    }
  })

  it('全レッスンに access.log 入り initialFs がある', () => {
    for (const lesson of CHAPTER_7.lessons) {
      expect(lesson.initialFs, `${lesson.id} の initialFs`).toBeDefined()
    }
  })

  it('全ステップに instruction / hints / check がある', () => {
    for (const lesson of CHAPTER_7.lessons) {
      for (const step of lesson.steps) {
        expect(step.instruction).toBeTruthy()
        const hints = step.hints ? locList(step.hints, 'ja') : []
        expect(hints.length > 0, `${lesson.id} のヒントが未定義または空`).toBe(true)
        expect(step.check).toBeDefined()
      }
    }
  })
})

describe('CHAPTER_7 各レッスンの check が期待コマンドで通る', () => {
  it('7-1: grep ERROR access.log でクリア', () => {
    const lesson = getLessonOrThrow('7-1')
    expect(
      evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'grep ERROR access.log' })),
    ).toBe(true)
  })

  it('7-1: パターン違いではクリアしない', () => {
    const lesson = getLessonOrThrow('7-1')
    expect(
      evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'grep INFO access.log' })),
    ).toBe(false)
  })

  it('7-1: ファイル違いではクリアしない', () => {
    const lesson = getLessonOrThrow('7-1')
    expect(
      evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'grep ERROR README.txt' })),
    ).toBe(false)
  })

  it('7-2: grep -i error / --ignore-case error 両方でクリア', () => {
    const lesson = getLessonOrThrow('7-2')
    for (const cmd of ['grep -i error access.log', 'grep --ignore-case error access.log']) {
      expect(
        evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: cmd })),
        `${cmd} はクリアするはず`,
      ).toBe(true)
    }
  })

  it('7-2: -i なしではクリアしない', () => {
    const lesson = getLessonOrThrow('7-2')
    expect(
      evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'grep error access.log' })),
    ).toBe(false)
  })

  it('7-3: grep -n INFO access.log でクリア', () => {
    const lesson = getLessonOrThrow('7-3')
    expect(
      evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'grep -n INFO access.log' })),
    ).toBe(true)
  })

  it('7-3: --line-number でもクリア', () => {
    const lesson = getLessonOrThrow('7-3')
    expect(
      evaluateCheck(
        lesson.steps[0].check,
        ctxFor({ lastCommand: 'grep --line-number INFO access.log' }),
      ),
    ).toBe(true)
  })

  it('7-4 step1: grep -v INFO access.log でクリア', () => {
    const lesson = getLessonOrThrow('7-4')
    expect(
      evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'grep -v INFO access.log' })),
    ).toBe(true)
  })

  it('7-4 step1: --invert-match でもクリア', () => {
    const lesson = getLessonOrThrow('7-4')
    expect(
      evaluateCheck(
        lesson.steps[0].check,
        ctxFor({ lastCommand: 'grep --invert-match INFO access.log' }),
      ),
    ).toBe(true)
  })

  it('7-4 step2: grep -vi info access.log でクリア', () => {
    const lesson = getLessonOrThrow('7-4')
    expect(
      evaluateCheck(lesson.steps[1].check, ctxFor({ lastCommand: 'grep -vi info access.log' })),
    ).toBe(true)
  })

  it('7-4 step2: -i 単独 (v なし) ではクリアしない', () => {
    const lesson = getLessonOrThrow('7-4')
    expect(
      evaluateCheck(lesson.steps[1].check, ctxFor({ lastCommand: 'grep -i info access.log' })),
    ).toBe(false)
  })

  it('7-5: grep ERROR *.log (ワイルドカード) でクリア', () => {
    const lesson = getLessonOrThrow('7-5')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'grep ERROR *.log' }))).toBe(
      true,
    )
  })

  it('7-5: ワイルドカードを使わない (access.log 直指定) ではクリアしない', () => {
    const lesson = getLessonOrThrow('7-5')
    expect(
      evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'grep ERROR access.log' })),
    ).toBe(false)
  })
})
