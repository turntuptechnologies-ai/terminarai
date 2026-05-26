import { describe, expect, it } from 'vitest'
import { createDefaultVfs, type Vfs } from '../../vfs'
import { evaluateCheck } from '../engine'
import type { EvalContext } from '../types'
import { CHAPTER_3 } from './chapter3'

function ctxFor(over: Partial<EvalContext> & { vfs?: Vfs } = {}): EvalContext {
  return {
    vfs: over.vfs ?? createDefaultVfs(),
    cwd: '/home/user',
    lastCommand: '',
    ...over,
  }
}

const getLessonOrThrow = (id: string) => {
  const l = CHAPTER_3.lessons.find((x) => x.id === id)
  if (!l) throw new Error(`lesson ${id} not found`)
  return l
}

describe('CHAPTER_3 構造', () => {
  it('5 レッスン構成', () => {
    expect(CHAPTER_3.id).toBe('3')
    expect(CHAPTER_3.lessons.map((l) => l.id)).toEqual(['3-1', '3-2', '3-3', '3-4', '3-5'])
  })

  it('全レッスンの chapterId が "3"', () => {
    for (const lesson of CHAPTER_3.lessons) {
      expect(lesson.chapterId).toBe('3')
    }
  })

  it('全ステップに instruction / hint / check がある', () => {
    for (const lesson of CHAPTER_3.lessons) {
      for (const step of lesson.steps) {
        expect(step.instruction).toBeTruthy()
        expect(step.hint, `${lesson.id} のヒント`).toBeTruthy()
        expect(step.check).toBeDefined()
      }
    }
  })
})

describe('CHAPTER_3 各レッスンの check', () => {
  it('3-1: mkdir myfolder で myfolder が出来ればクリア', () => {
    const lesson = getLessonOrThrow('3-1')
    const vfs = createDefaultVfs()
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ vfs }))).toBe(false)
    vfs.mkdir('/home/user/myfolder')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ vfs }))).toBe(true)
  })

  it('3-2: 深い階層 project/src/lib が出来ればクリア', () => {
    const lesson = getLessonOrThrow('3-2')
    const vfs = createDefaultVfs()
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ vfs }))).toBe(false)
    vfs.mkdir('/home/user/project/src/lib', { recursive: true })
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ vfs }))).toBe(true)
  })

  it('3-3 step1: copy.txt が "terminarai" を含めばクリア (cp 経由でしか満たせない)', () => {
    const lesson = getLessonOrThrow('3-3')
    const vfs = createDefaultVfs()
    // hello.txt をコピー
    vfs.copy('/home/user/hello.txt', '/home/user/copy.txt')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ vfs }))).toBe(true)
  })

  it('3-3 step1: touch で空ファイル作っても "terminarai" 含まないのでクリアしない', () => {
    const lesson = getLessonOrThrow('3-3')
    const vfs = createDefaultVfs()
    vfs.writeFile('/home/user/copy.txt', '')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ vfs }))).toBe(false)
  })

  it('3-3 step2: docs-copy が存在すればクリア', () => {
    const lesson = getLessonOrThrow('3-3')
    const vfs = createDefaultVfs()
    vfs.copy('/home/user/docs', '/home/user/docs-copy', { recursive: true })
    expect(evaluateCheck(lesson.steps[1].check, ctxFor({ vfs }))).toBe(true)
  })

  it('3-4 step1: hello → greeting にリネームでクリア', () => {
    const lesson = getLessonOrThrow('3-4')
    const vfs = createDefaultVfs()
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ vfs }))).toBe(false)
    vfs.move('/home/user/hello.txt', '/home/user/greeting.txt')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ vfs }))).toBe(true)
  })

  it('3-4 step1: cp だけでは元ファイルが残るのでクリアしない', () => {
    const lesson = getLessonOrThrow('3-4')
    const vfs = createDefaultVfs()
    vfs.copy('/home/user/hello.txt', '/home/user/greeting.txt')
    // hello.txt が残っているので not(file-exists hello) が false → and 全体も false
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ vfs }))).toBe(false)
  })

  it('3-4 step2: docs/greeting.txt 移動でクリア', () => {
    const lesson = getLessonOrThrow('3-4')
    const vfs = createDefaultVfs()
    vfs.writeFile('/home/user/greeting.txt', 'hello')
    vfs.move('/home/user/greeting.txt', '/home/user/docs/greeting.txt')
    expect(evaluateCheck(lesson.steps[1].check, ctxFor({ vfs }))).toBe(true)
  })

  it('3-5 step1: hello.txt 削除でクリア', () => {
    const lesson = getLessonOrThrow('3-5')
    const vfs = createDefaultVfs()
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ vfs }))).toBe(false)
    vfs.remove('/home/user/hello.txt')
    expect(evaluateCheck(lesson.steps[0].check, ctxFor({ vfs }))).toBe(true)
  })

  it('3-5 step2: docs (空 dir) を -r で削除でクリア', () => {
    const lesson = getLessonOrThrow('3-5')
    const vfs = createDefaultVfs()
    vfs.remove('/home/user/docs', { recursive: true })
    expect(evaluateCheck(lesson.steps[1].check, ctxFor({ vfs }))).toBe(true)
  })
})
