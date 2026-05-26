import { describe, expect, it } from 'vitest'
import { createDefaultVfs } from '../../vfs'
import { createShell } from '../shell'
import { defaultContext } from '../types'
import { registerAllCommands } from './index'

describe('registerAllCommands', () => {
  it('実装済みの全コマンドが利用可能になる', () => {
    const vfs = createDefaultVfs()
    const shell = createShell(vfs)
    registerAllCommands(shell)
    for (const name of ['cat', 'cd', 'cp', 'echo', 'ls', 'mkdir', 'mv', 'pwd', 'rm', 'touch']) {
      expect(shell.has(name)).toBe(true)
    }
  })

  it('シェル経由で pwd → ls → cd が連動して動く', () => {
    const vfs = createDefaultVfs()
    const shell = createShell(vfs)
    registerAllCommands(shell)
    let ctx = defaultContext('/home/user')

    const pwdResult = shell.execute('pwd', ctx)
    expect(pwdResult.result.stdout).toBe('/home/user\n')
    ctx = { ...ctx, cwd: pwdResult.nextCwd }

    const cdResult = shell.execute('cd docs', ctx)
    expect(cdResult.nextCwd).toBe('/home/user/docs')
    ctx = { ...ctx, cwd: cdResult.nextCwd }

    const pwdAfterCd = shell.execute('pwd', ctx)
    expect(pwdAfterCd.result.stdout).toBe('/home/user/docs\n')

    const lsResult = shell.execute('ls /home/user', ctx)
    expect(lsResult.result.stdout).toBe('README.txt\ndocs\nhello.txt\n')
  })

  it('echo の出力が Shell Engine の > リダイレクト経由で書き込まれる (smoke)', () => {
    const vfs = createDefaultVfs()
    const shell = createShell(vfs)
    registerAllCommands(shell)
    const ctx = defaultContext('/home/user')

    const echoR = shell.execute('echo hello world > out.txt', ctx)
    expect(echoR.result.exitCode).toBe(0)

    const catR = shell.execute('cat out.txt', ctx)
    expect(catR.result.stdout).toBe('hello world\n')
  })

  it('mkdir → touch → ls で作成物が見える', () => {
    const vfs = createDefaultVfs()
    const shell = createShell(vfs)
    registerAllCommands(shell)
    const ctx = defaultContext('/home/user')

    expect(shell.execute('mkdir -p a/b', ctx).result.exitCode).toBe(0)
    expect(shell.execute('touch a/b/note.txt', ctx).result.exitCode).toBe(0)

    const lsR = shell.execute('ls a/b', ctx)
    expect(lsR.result.stdout).toBe('note.txt\n')
  })

  it('mkdir → echo > file → cp → mv → rm の一連の流れ', () => {
    const vfs = createDefaultVfs()
    const shell = createShell(vfs)
    registerAllCommands(shell)
    const ctx = defaultContext('/home/user')

    shell.execute('mkdir work', ctx)
    shell.execute('echo hello > work/a.txt', ctx)
    shell.execute('cp work/a.txt work/b.txt', ctx)
    shell.execute('mv work/b.txt work/c.txt', ctx)
    shell.execute('rm work/a.txt', ctx)

    expect(vfs.stat('/home/user/work/a.txt').ok).toBe(false)
    expect(vfs.stat('/home/user/work/c.txt').ok).toBe(true)

    const cleanup = shell.execute('rm -r work', ctx)
    expect(cleanup.result.exitCode).toBe(0)
    expect(vfs.stat('/home/user/work').ok).toBe(false)
  })
})
