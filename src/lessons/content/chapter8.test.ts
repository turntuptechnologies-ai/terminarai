import { describe, expect, it } from 'vitest'
import { locList } from '../../i18n'
import { createVfs, type Vfs } from '../../vfs'
import { evaluateCheck } from '../engine'
import type { EvalContext } from '../types'
import { CHAPTER_8 } from './chapter8'

const getLessonOrThrow = (id: string) => {
  const l = CHAPTER_8.lessons.find((x) => x.id === id)
  if (!l) throw new Error(`lesson ${id} not found`)
  return l
}

/** レッスンの initialFs から VFS を再構築する。 */
function vfsFor(id: string): Vfs {
  const l = getLessonOrThrow(id)
  if (!l.initialFs) throw new Error(`lesson ${id} has no initialFs`)
  return createVfs(structuredClone(l.initialFs))
}

function ctxFor(over: Partial<EvalContext> & { vfs?: Vfs } = {}): EvalContext {
  return {
    vfs: over.vfs ?? createVfs(structuredClone(CHAPTER_8.lessons[0].initialFs as never)),
    cwd: '/home/user',
    lastCommand: '',
    ...over,
  }
}

describe('CHAPTER_8 構造', () => {
  it('5 レッスン構成', () => {
    expect(CHAPTER_8.id).toBe('8')
    expect(CHAPTER_8.lessons.map((l) => l.id)).toEqual(['8-1', '8-2', '8-3', '8-4', '8-5'])
  })

  it('全レッスンの chapterId が "8" で initialFs を持つ', () => {
    for (const lesson of CHAPTER_8.lessons) {
      expect(lesson.chapterId).toBe('8')
      expect(lesson.initialFs, `${lesson.id} の initialFs`).toBeDefined()
    }
  })

  it('全ステップに instruction / hints / check がある', () => {
    for (const lesson of CHAPTER_8.lessons) {
      for (const step of lesson.steps) {
        expect(step.instruction).toBeTruthy()
        const hints = step.hints ? locList(step.hints, 'ja') : []
        expect(hints.length > 0, `${lesson.id} のヒントが未定義または空`).toBe(true)
        expect(step.check).toBeDefined()
      }
    }
  })
})

describe('CHAPTER_8 各レッスンの check が期待コマンドで通る', () => {
  it('8-1: ls *.txt → cat *.txt でクリア', () => {
    const l = getLessonOrThrow('8-1')
    expect(evaluateCheck(l.steps[0].check, ctxFor({ lastCommand: 'ls *.txt' }))).toBe(true)
    expect(evaluateCheck(l.steps[1].check, ctxFor({ lastCommand: 'cat *.txt' }))).toBe(true)
  })

  it('8-1: ワイルドカード無しではクリアしない', () => {
    const l = getLessonOrThrow('8-1')
    expect(evaluateCheck(l.steps[0].check, ctxFor({ lastCommand: 'ls' }))).toBe(false)
  })

  it('8-2: cat file?.txt でクリア', () => {
    const l = getLessonOrThrow('8-2')
    expect(evaluateCheck(l.steps[0].check, ctxFor({ lastCommand: 'cat file?.txt' }))).toBe(true)
  })

  it('8-3: cat [ab]*.txt → ls log[0-9].txt でクリア', () => {
    const l = getLessonOrThrow('8-3')
    expect(evaluateCheck(l.steps[0].check, ctxFor({ lastCommand: 'cat [ab]*.txt' }))).toBe(true)
    expect(evaluateCheck(l.steps[1].check, ctxFor({ lastCommand: 'ls log[0-9].txt' }))).toBe(true)
  })

  it('8-4: ls [!a]*.txt → cat docs/*.md でクリア', () => {
    const l = getLessonOrThrow('8-4')
    expect(evaluateCheck(l.steps[0].check, ctxFor({ lastCommand: 'ls [!a]*.txt' }))).toBe(true)
    expect(evaluateCheck(l.steps[1].check, ctxFor({ lastCommand: 'cat docs/*.md' }))).toBe(true)
  })

  describe('8-5: グロブで操作する', () => {
    const l = getLessonOrThrow('8-5')

    it('step1: mkdir logs でクリア', () => {
      const vfs = vfsFor('8-5')
      expect(evaluateCheck(l.steps[0].check, ctxFor({ vfs }))).toBe(false)
      vfs.mkdir('/home/user/logs')
      expect(evaluateCheck(l.steps[0].check, ctxFor({ vfs }))).toBe(true)
    })

    it('step2: *.log を logs/ に移動でクリア', () => {
      const vfs = vfsFor('8-5')
      vfs.mkdir('/home/user/logs')
      vfs.move('/home/user/access.log', '/home/user/logs/access.log')
      vfs.move('/home/user/app.log', '/home/user/logs/app.log')
      expect(evaluateCheck(l.steps[1].check, ctxFor({ vfs }))).toBe(true)
    })

    it('step3: *.tmp 削除でクリア、keep.txt は残る', () => {
      const vfs = vfsFor('8-5')
      vfs.remove('/home/user/temp1.tmp')
      vfs.remove('/home/user/temp2.tmp')
      expect(evaluateCheck(l.steps[2].check, ctxFor({ vfs }))).toBe(true)
    })
  })
})
