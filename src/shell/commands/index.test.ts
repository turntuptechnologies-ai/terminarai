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
    for (const name of ['cat', 'cd', 'echo', 'ls', 'mkdir', 'pwd', 'touch']) {
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

  it('echo > file → cat file の往復で実体が書き込まれる', () => {
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
})
