import { describe, expect, it } from 'vitest'
import { createDefaultVfs } from '../../vfs'
import { createShell } from '../shell'
import { defaultContext } from '../types'
import { registerAllCommands } from './index'

describe('registerAllCommands', () => {
  it('pwd / ls / cd がシェルから利用可能になる', () => {
    const vfs = createDefaultVfs()
    const shell = createShell(vfs)
    registerAllCommands(shell)
    expect(shell.has('pwd')).toBe(true)
    expect(shell.has('ls')).toBe(true)
    expect(shell.has('cd')).toBe(true)
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
})
