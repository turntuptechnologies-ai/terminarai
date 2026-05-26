import { describe, expect, it } from 'vitest'
import { createDefaultVfs } from '../../vfs'
import { evaluateCheck } from '../engine'
import type { EvalContext } from '../types'
import { CHAPTER_1 } from './chapter1'

function ctxFor(over: Partial<EvalContext> = {}): EvalContext {
  return {
    vfs: createDefaultVfs(),
    cwd: '/home/user',
    lastCommand: '',
    ...over,
  }
}

describe('CHAPTER_1 構造', () => {
  it('5 レッスン構成', () => {
    expect(CHAPTER_1.id).toBe('1')
    expect(CHAPTER_1.lessons.map((l) => l.id)).toEqual(['1-1', '1-2', '1-3', '1-4', '1-5'])
  })

  it('全レッスンの chapterId が "1"', () => {
    for (const lesson of CHAPTER_1.lessons) {
      expect(lesson.chapterId).toBe('1')
    }
  })

  it('全レッスンに最低 1 ステップが定義されている', () => {
    for (const lesson of CHAPTER_1.lessons) {
      expect(lesson.steps.length).toBeGreaterThan(0)
    }
  })

  it('全レッスンの全ステップに instruction と check がある', () => {
    for (const lesson of CHAPTER_1.lessons) {
      for (const step of lesson.steps) {
        expect(step.instruction).toBeTruthy()
        expect(step.check).toBeDefined()
      }
    }
  })

  it('全レッスンの全ステップに hint がある (初学者向け)', () => {
    for (const lesson of CHAPTER_1.lessons) {
      for (const step of lesson.steps) {
        expect(step.hint, `${lesson.id} のヒントが未定義`).toBeTruthy()
      }
    }
  })
})

describe('CHAPTER_1 各レッスンの check が期待コマンドで通る', () => {
  // registry.findLesson と区別するため named differently
  const getLessonOrThrow = (id: string) => {
    const l = CHAPTER_1.lessons.find((x) => x.id === id)
    if (!l) throw new Error(`lesson ${id} not found`)
    return l
  }

  it('1-1 pwd: `pwd` でクリア', () => {
    const lesson = getLessonOrThrow('1-1')
    const passed = evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'pwd' }))
    expect(passed).toBe(true)
  })

  it('1-2 ls: `ls` でクリア', () => {
    const lesson = getLessonOrThrow('1-2')
    const passed = evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'ls' }))
    expect(passed).toBe(true)
  })

  it('1-2 ls: 引数付きでもクリア (`ls -l`)', () => {
    const lesson = getLessonOrThrow('1-2')
    const passed = evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'ls -l' }))
    expect(passed).toBe(true)
  })

  it('1-3 step 1 -l: `ls -l` / `ls -la` / `ls -al` のいずれもクリア', () => {
    const lesson = getLessonOrThrow('1-3')
    const check = lesson.steps[0].check
    for (const cmd of ['ls -l', 'ls -la', 'ls -al']) {
      expect(evaluateCheck(check, ctxFor({ lastCommand: cmd })), `${cmd} でクリアする`).toBe(true)
    }
  })

  it('1-3 step 1: `ls -a` (l を含まない) ではクリアしない', () => {
    const lesson = getLessonOrThrow('1-3')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ lastCommand: 'ls -a' }))).toBe(false)
  })

  it('1-3 step 2 -a: `ls -a` / `ls -la` のいずれもクリア', () => {
    const lesson = getLessonOrThrow('1-3')
    const check = lesson.steps[1].check
    for (const cmd of ['ls -a', 'ls -la']) {
      expect(evaluateCheck(check, ctxFor({ lastCommand: cmd }))).toBe(true)
    }
  })

  it('1-4 step 1: cwd が /home/user/docs ならクリア', () => {
    const lesson = getLessonOrThrow('1-4')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ cwd: '/home/user/docs' }))).toBe(true)
  })

  it('1-4 step 2: docs にいて pwd を実行ならクリア', () => {
    const lesson = getLessonOrThrow('1-4')
    expect(
      evaluateCheck(lesson.steps[1].check, ctxFor({ cwd: '/home/user/docs', lastCommand: 'pwd' })),
    ).toBe(true)
  })

  it('1-4 step 2: docs にいても pwd 以外ではクリアしない', () => {
    const lesson = getLessonOrThrow('1-4')
    expect(
      evaluateCheck(lesson.steps[1].check, ctxFor({ cwd: '/home/user/docs', lastCommand: 'ls' })),
    ).toBe(false)
  })

  it('1-5: cwd が /home/user ならクリア (cd でも cd ~ でも)', () => {
    const lesson = getLessonOrThrow('1-5')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ cwd: '/home/user' }))).toBe(true)
  })

  it('1-5: initialCwd が /tmp に設定されている', () => {
    const lesson = getLessonOrThrow('1-5')
    expect(lesson.initialCwd).toBe('/tmp')
  })
})
