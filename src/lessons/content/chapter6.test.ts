import { describe, expect, it } from 'vitest'
import { locList } from '../../i18n'
import { createDefaultVfs, type Vfs } from '../../vfs'
import { evaluateCheck } from '../engine'
import type { EvalContext } from '../types'
import { CHAPTER_6 } from './chapter6'

function ctxFor(over: Partial<EvalContext> & { vfs?: Vfs } = {}): EvalContext {
  return {
    vfs: over.vfs ?? createDefaultVfs(),
    cwd: '/home/user',
    lastCommand: '',
    ...over,
  }
}

const getLessonOrThrow = (id: string) => {
  const l = CHAPTER_6.lessons.find((x) => x.id === id)
  if (!l) throw new Error(`lesson ${id} not found`)
  return l
}

describe('CHAPTER_6 構造', () => {
  it('4 レッスン構成', () => {
    expect(CHAPTER_6.id).toBe('6')
    expect(CHAPTER_6.lessons.map((l) => l.id)).toEqual(['6-1', '6-2', '6-3', '6-4'])
  })

  it('全レッスンの chapterId が "6"', () => {
    for (const lesson of CHAPTER_6.lessons) {
      expect(lesson.chapterId).toBe('6')
    }
  })

  it('全レッスンに log.txt 入り initialFs がある', () => {
    for (const lesson of CHAPTER_6.lessons) {
      expect(lesson.initialFs, `${lesson.id} の initialFs`).toBeDefined()
    }
  })

  it('全ステップに instruction / hints / check がある', () => {
    for (const lesson of CHAPTER_6.lessons) {
      for (const step of lesson.steps) {
        expect(step.instruction).toBeTruthy()
        const hints = step.hints ? locList(step.hints, 'ja') : []
        expect(hints.length > 0, `${lesson.id} のヒントが未定義または空`).toBe(true)
        expect(step.check).toBeDefined()
      }
    }
  })
})

describe('CHAPTER_6 各レッスンの check が期待コマンドで通る', () => {
  it('6-1: head log.txt でクリア', () => {
    const lesson = getLessonOrThrow('6-1')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'head log.txt' }))).toBe(true)
  })

  it('6-1: tail だとクリアしない', () => {
    const lesson = getLessonOrThrow('6-1')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'tail log.txt' }))).toBe(
      false,
    )
  })

  it('6-1: 別ファイルだとクリアしない', () => {
    const lesson = getLessonOrThrow('6-1')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'head README.txt' }))).toBe(
      false,
    )
  })

  it('6-2: tail log.txt でクリア', () => {
    const lesson = getLessonOrThrow('6-2')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'tail log.txt' }))).toBe(true)
  })

  it('6-3 step1: head -n 3 log.txt の様々な書式でクリア', () => {
    const lesson = getLessonOrThrow('6-3')
    for (const cmd of [
      'head -n 3 log.txt',
      'head -n3 log.txt',
      'head --lines=3 log.txt',
      'head -3 log.txt',
    ]) {
      expect(
        evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: cmd })),
        `${cmd} はクリアするはず`,
      ).toBe(true)
    }
  })

  it('6-3 step1: 行数違い (-n 5) はクリアしない', () => {
    const lesson = getLessonOrThrow('6-3')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'head -n 5 log.txt' }))).toBe(
      false,
    )
  })

  it('6-3 step1: head のままだとクリアしない (-n 必須)', () => {
    const lesson = getLessonOrThrow('6-3')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'head log.txt' }))).toBe(
      false,
    )
  })

  it('6-3 step2: tail -n 3 log.txt でクリア', () => {
    const lesson = getLessonOrThrow('6-3')
    expect(evaluateCheck(lesson.steps[1].check, ctxFor({ lastCommand: 'tail -n 3 log.txt' }))).toBe(
      true,
    )
  })

  it('6-4 step1: head -n 5 log.txt でクリア', () => {
    const lesson = getLessonOrThrow('6-4')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'head -n 5 log.txt' }))).toBe(
      true,
    )
  })

  it('6-4 step2: tail -n 5 log.txt でクリア', () => {
    const lesson = getLessonOrThrow('6-4')
    expect(evaluateCheck(lesson.steps[1].check, ctxFor({ lastCommand: 'tail -n 5 log.txt' }))).toBe(
      true,
    )
  })
})
