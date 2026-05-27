import { describe, expect, it } from 'vitest'
import { createDefaultVfs, createVfs, type Vfs } from '../vfs'
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

/** initialFs を持つ問題用に、その問題の VFS を再構築する。 */
function vfsForProblem(id: string): Vfs {
  const p = findProblem(id)
  if (!p) throw new Error(`problem ${id} not found`)
  return p.initialFs ? createVfs(structuredClone(p.initialFs)) : createDefaultVfs()
}

describe('PROBLEMS', () => {
  it('9 問の構成 (p1-p9)', () => {
    expect(PROBLEMS.map((p) => p.id)).toEqual([
      'p1',
      'p2',
      'p3',
      'p4',
      'p5',
      'p6',
      'p7',
      'p8',
      'p9',
    ])
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
    expect(findProblem('p9')?.id).toBe('p9')
    expect(findProblem('nope')).toBeUndefined()
  })

  it('findNextProblem', () => {
    expect(findNextProblem('p1')?.id).toBe('p2')
    expect(findNextProblem('p5')?.id).toBe('p6')
    expect(findNextProblem('p8')?.id).toBe('p9')
    expect(findNextProblem('p9')).toBeUndefined()
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

  describe('p6: プロジェクトを整理する', () => {
    const p = findProblem('p6') as NonNullable<ReturnType<typeof findProblem>>

    it('step1: docs と images が作成されたらクリア', () => {
      const vfs = vfsForProblem('p6')
      expect(evaluateCheck(p.steps[0].check, ctxFor({ vfs }))).toBe(false)
      vfs.mkdir('/home/user/docs')
      vfs.mkdir('/home/user/images')
      expect(evaluateCheck(p.steps[0].check, ctxFor({ vfs }))).toBe(true)
    })

    it('step2: 3 ファイルを docs に移動 + 元から消えたらクリア', () => {
      const vfs = vfsForProblem('p6')
      vfs.mkdir('/home/user/docs')
      vfs.move('/home/user/notes.txt', '/home/user/docs/notes.txt')
      vfs.move('/home/user/draft.md', '/home/user/docs/draft.md')
      vfs.move('/home/user/todo.txt', '/home/user/docs/todo.txt')
      expect(evaluateCheck(p.steps[1].check, ctxFor({ vfs }))).toBe(true)
    })

    it('step2: コピーで元が残っていたらクリアしない', () => {
      const vfs = vfsForProblem('p6')
      vfs.mkdir('/home/user/docs')
      vfs.copy('/home/user/notes.txt', '/home/user/docs/notes.txt')
      expect(evaluateCheck(p.steps[1].check, ctxFor({ vfs }))).toBe(false)
    })

    it('step3: image.png を images/ に移動でクリア', () => {
      const vfs = vfsForProblem('p6')
      vfs.mkdir('/home/user/images')
      vfs.move('/home/user/image.png', '/home/user/images/image.png')
      expect(evaluateCheck(p.steps[2].check, ctxFor({ vfs }))).toBe(true)
    })
  })

  describe('p7: ログを残す', () => {
    const p = findProblem('p7') as NonNullable<ReturnType<typeof findProblem>>

    it('step1: touch log.txt でクリア', () => {
      const vfs = createDefaultVfs()
      vfs.writeFile('/home/user/log.txt', '')
      expect(evaluateCheck(p.steps[0].check, ctxFor({ vfs }))).toBe(true)
    })

    it('step2: >> で追記したらクリア (> で上書きは NG)', () => {
      const vfs = createDefaultVfs()
      vfs.writeFile('/home/user/log.txt', 'first entry\n')
      expect(
        evaluateCheck(
          p.steps[1].check,
          ctxFor({ vfs, lastCommand: 'echo "first entry" >> log.txt' }),
        ),
      ).toBe(true)
      // command-matches '>>\s' を欠くと false
      expect(
        evaluateCheck(
          p.steps[1].check,
          ctxFor({ vfs, lastCommand: 'echo "first entry" > log.txt' }),
        ),
      ).toBe(false)
    })

    it('step3: 2 行揃った状態でクリア', () => {
      const vfs = createDefaultVfs()
      vfs.writeFile('/home/user/log.txt', 'first entry\nsecond entry\n')
      expect(
        evaluateCheck(
          p.steps[2].check,
          ctxFor({ vfs, lastCommand: 'echo "second entry" >> log.txt' }),
        ),
      ).toBe(true)
    })
  })

  describe('p8: 不要なディレクトリを掃除する', () => {
    const p = findProblem('p8') as NonNullable<ReturnType<typeof findProblem>>

    it('step1: temp.txt 削除でクリア', () => {
      const vfs = vfsForProblem('p8')
      vfs.remove('/home/user/temp.txt')
      expect(evaluateCheck(p.steps[0].check, ctxFor({ vfs }))).toBe(true)
    })

    it('step2: backup_old を -r 相当で削除、README.txt は残る', () => {
      const vfs = vfsForProblem('p8')
      vfs.remove('/home/user/backup_old', { recursive: true })
      expect(evaluateCheck(p.steps[1].check, ctxFor({ vfs }))).toBe(true)
    })

    it('step2: README.txt を間違って消したらクリアしない', () => {
      const vfs = vfsForProblem('p8')
      vfs.remove('/home/user/backup_old', { recursive: true })
      vfs.remove('/home/user/README.txt')
      expect(evaluateCheck(p.steps[1].check, ctxFor({ vfs }))).toBe(false)
    })
  })

  describe('p9: 隠されたファイルを読む', () => {
    const p = findProblem('p9') as NonNullable<ReturnType<typeof findProblem>>

    it('step1: cwd が /home/user/secret/deep/hidden ならクリア', () => {
      expect(
        evaluateCheck(p.steps[0].check, ctxFor({ cwd: '/home/user/secret/deep/hidden' })),
      ).toBe(true)
    })

    it('step2: hidden にいて cat treasure.txt したらクリア', () => {
      expect(
        evaluateCheck(
          p.steps[1].check,
          ctxFor({ cwd: '/home/user/secret/deep/hidden', lastCommand: 'cat treasure.txt' }),
        ),
      ).toBe(true)
    })

    it('step2: 別の場所から絶対パスで読んでもクリアしない (cwd が条件)', () => {
      expect(
        evaluateCheck(
          p.steps[1].check,
          ctxFor({
            cwd: '/home/user',
            lastCommand: 'cat /home/user/secret/deep/hidden/treasure.txt',
          }),
        ),
      ).toBe(false)
    })
  })
})
