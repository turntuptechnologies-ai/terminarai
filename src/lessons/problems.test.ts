import { describe, expect, it } from 'vitest'
import { createDefaultVfs, type Vfs } from '../vfs'
import { evaluateCheck } from './engine'
import { findNextProblem, findProblem, PROBLEMS } from './problems'
import type { EvalContext } from './types'

function ctxFor(over: Partial<EvalContext> & { vfs?: Vfs } = {}): EvalContext {
  return {
    vfs: over.vfs ?? createDefaultVfs(),
    cwd: '/home/user',
    lastCommand: '',
    ...over,
  }
}

describe('PROBLEMS', () => {
  it('5 問の構成', () => {
    expect(PROBLEMS.map((p) => p.id)).toEqual(['p1', 'p2', 'p3', 'p4', 'p5'])
  })

  it('全問に title / description / difficulty / tags / steps がある', () => {
    for (const p of PROBLEMS) {
      expect(p.title).toBeTruthy()
      expect(p.description).toBeTruthy()
      expect(['easy', 'medium', 'hard']).toContain(p.difficulty)
      expect(Array.isArray(p.tags)).toBe(true)
      expect(p.steps.length).toBeGreaterThan(0)
    }
  })

  it('findProblem', () => {
    expect(findProblem('p1')?.id).toBe('p1')
    expect(findProblem('nope')).toBeUndefined()
  })

  it('findNextProblem', () => {
    expect(findNextProblem('p1')?.id).toBe('p2')
    expect(findNextProblem('p4')?.id).toBe('p5')
    expect(findNextProblem('p5')).toBeUndefined()
    expect(findNextProblem('nope')).toBeUndefined()
  })
})

describe('PROBLEMS check 動作確認', () => {
  it('p1: cwd /home/user/docs でクリア', () => {
    const p = findProblem('p1') as NonNullable<ReturnType<typeof findProblem>>
    expect(evaluateCheck(p.steps[0].check, ctxFor({ cwd: '/home/user/docs' }))).toBe(true)
    expect(evaluateCheck(p.steps[0].check, ctxFor({ cwd: '/home/user' }))).toBe(false)
  })

  it('p2: cat README.txt でクリア', () => {
    const p = findProblem('p2') as NonNullable<ReturnType<typeof findProblem>>
    expect(evaluateCheck(p.steps[0].check, ctxFor({ lastCommand: 'cat README.txt' }))).toBe(true)
    expect(
      evaluateCheck(p.steps[0].check, ctxFor({ lastCommand: 'cat /home/user/README.txt' })),
    ).toBe(true)
    expect(evaluateCheck(p.steps[0].check, ctxFor({ lastCommand: 'cat other.txt' }))).toBe(false)
  })

  it('p3: memo.txt に todo を書けばクリア', () => {
    const p = findProblem('p3') as NonNullable<ReturnType<typeof findProblem>>
    const vfs = createDefaultVfs()
    expect(evaluateCheck(p.steps[0].check, ctxFor({ vfs }))).toBe(false)
    vfs.writeFile('/home/user/memo.txt', 'todo')
    expect(evaluateCheck(p.steps[0].check, ctxFor({ vfs }))).toBe(true)
  })

  it('p4: myproject/src と myproject/test が両方あればクリア', () => {
    const p = findProblem('p4') as NonNullable<ReturnType<typeof findProblem>>
    const vfs = createDefaultVfs()
    vfs.mkdir('/home/user/myproject/src', { recursive: true })
    expect(evaluateCheck(p.steps[0].check, ctxFor({ vfs }))).toBe(false)
    vfs.mkdir('/home/user/myproject/test', { recursive: true })
    expect(evaluateCheck(p.steps[0].check, ctxFor({ vfs }))).toBe(true)
  })

  it('p5: hello.txt を docs に移動でクリア (コピーだけだと不可)', () => {
    const p = findProblem('p5') as NonNullable<ReturnType<typeof findProblem>>
    // コピーだと元ファイルが残るので NG
    const vfs1 = createDefaultVfs()
    vfs1.copy('/home/user/hello.txt', '/home/user/docs/hello.txt')
    expect(evaluateCheck(p.steps[0].check, ctxFor({ vfs: vfs1 }))).toBe(false)
    // 移動なら OK
    const vfs2 = createDefaultVfs()
    vfs2.move('/home/user/hello.txt', '/home/user/docs/hello.txt')
    expect(evaluateCheck(p.steps[0].check, ctxFor({ vfs: vfs2 }))).toBe(true)
  })
})
