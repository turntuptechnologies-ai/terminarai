import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createDefaultVfs } from '../vfs'
import { createShell } from './shell'
import { type CommandHandler, defaultContext, type Shell } from './types'

describe('Shell', () => {
  let shell: Shell
  let vfs: ReturnType<typeof createDefaultVfs>

  beforeEach(() => {
    vfs = createDefaultVfs()
    shell = createShell(vfs)
  })

  it('空入力は exitCode 0 で何も出さない', () => {
    const { result, nextCwd } = shell.execute('', defaultContext())
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe('')
    expect(result.stderr).toBe('')
    expect(nextCwd).toBe('/home/user')
  })

  it('未登録コマンドは command not found (exitCode 127) で terminarai プレフィックス', () => {
    const { result } = shell.execute('nonexistent', defaultContext())
    expect(result.exitCode).toBe(127)
    expect(result.stderr).toContain('terminarai:')
    expect(result.stderr).toContain('nonexistent:')
    expect(result.stderr).toContain('command not found')
  })

  it('登録したコマンドを実行できる', () => {
    const echo: CommandHandler = (args) => ({
      stdout: `${args.join(' ')}\n`,
      stderr: '',
      exitCode: 0,
    })
    shell.register('echo', echo)
    const { result } = shell.execute('echo hello world', defaultContext())
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe('hello world\n')
  })

  it('コマンドに渡される args はコマンド名を含まない', () => {
    const spy = vi.fn<CommandHandler>(() => ({ stdout: '', stderr: '', exitCode: 0 }))
    shell.register('mycmd', spy)
    shell.execute('mycmd a b c', defaultContext())
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toEqual(['a', 'b', 'c'])
  })

  it('cwdAfter が返れば nextCwd に反映される (cd 用)', () => {
    const fakeCd: CommandHandler = (args, ctx) => {
      const next = args[0] ? `${ctx.cwd}/${args[0]}` : ctx.cwd
      return { stdout: '', stderr: '', exitCode: 0, cwdAfter: next }
    }
    shell.register('cd', fakeCd)
    const { nextCwd } = shell.execute('cd docs', defaultContext('/home/user'))
    expect(nextCwd).toBe('/home/user/docs')
  })

  it('cwdAfter が無ければ nextCwd は元のまま', () => {
    const noop: CommandHandler = () => ({ stdout: '', stderr: '', exitCode: 0 })
    shell.register('noop', noop)
    const { nextCwd } = shell.execute('noop', defaultContext('/etc'))
    expect(nextCwd).toBe('/etc')
  })

  it('> で stdout を VFS に書き込み、外部出力は空になる', () => {
    const echo: CommandHandler = (args) => ({
      stdout: `${args.join(' ')}\n`,
      stderr: '',
      exitCode: 0,
    })
    shell.register('echo', echo)
    const { result } = shell.execute('echo hello > /home/user/out.txt', defaultContext())
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe('')
    const fileResult = vfs.readFile('/home/user/out.txt')
    expect(fileResult.ok).toBe(true)
    if (fileResult.ok) expect(fileResult.value).toBe('hello\n')
  })

  it('>> で追記される', () => {
    const echo: CommandHandler = (args) => ({
      stdout: `${args.join(' ')}\n`,
      stderr: '',
      exitCode: 0,
    })
    shell.register('echo', echo)
    shell.execute('echo first > /home/user/log.txt', defaultContext())
    shell.execute('echo second >> /home/user/log.txt', defaultContext())
    const r = vfs.readFile('/home/user/log.txt')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value).toBe('first\nsecond\n')
  })

  it('> の書き込み先がエラーになるとシェルが整形して返す', () => {
    const echo: CommandHandler = () => ({ stdout: 'hi\n', stderr: '', exitCode: 0 })
    shell.register('echo', echo)
    const { result } = shell.execute('echo hi > /nope/out.txt', defaultContext())
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('echo:')
    expect(result.stderr).toContain('No such file or directory')
  })

  it('stdout が空でもリダイレクトはファイルを作成する', () => {
    const empty: CommandHandler = () => ({ stdout: '', stderr: '', exitCode: 0 })
    shell.register('empty', empty)
    shell.execute('empty > /home/user/blank.txt', defaultContext())
    const r = vfs.readFile('/home/user/blank.txt')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value).toBe('')
  })

  it('リダイレクト先は cwd 起点の相対パスとして解決される', () => {
    const echo: CommandHandler = () => ({ stdout: 'x\n', stderr: '', exitCode: 0 })
    shell.register('echo', echo)
    shell.execute('echo > out.txt', defaultContext('/home/user'))
    const r = vfs.readFile('/home/user/out.txt')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value).toBe('x\n')
  })

  it('syntax error (未閉じクォート) はシェル層で整形', () => {
    const { result } = shell.execute("echo 'oops", defaultContext())
    expect(result.exitCode).toBe(2)
    expect(result.stderr).toContain('terminarai:')
    expect(result.stderr).toContain('unterminated')
  })

  it('syntax error (リダイレクト先なし)', () => {
    const echo: CommandHandler = () => ({ stdout: '', stderr: '', exitCode: 0 })
    shell.register('echo', echo)
    const { result } = shell.execute('echo hi >', defaultContext())
    expect(result.exitCode).toBe(2)
    expect(result.stderr).toContain('terminarai:')
  })

  it('register / unregister / has', () => {
    expect(shell.has('foo')).toBe(false)
    const handler: CommandHandler = () => ({ stdout: '', stderr: '', exitCode: 0 })
    shell.register('foo', handler)
    expect(shell.has('foo')).toBe(true)
    shell.unregister('foo')
    expect(shell.has('foo')).toBe(false)
  })

  it('クォート付き引数を正しく分割', () => {
    const spy = vi.fn<CommandHandler>(() => ({ stdout: '', stderr: '', exitCode: 0 }))
    shell.register('echo', spy)
    shell.execute('echo "hello world" foo', defaultContext())
    expect(spy.mock.calls[0][0]).toEqual(['hello world', 'foo'])
  })

  it('exitCode は handler の戻り値が伝播', () => {
    const fail: CommandHandler = () => ({ stdout: '', stderr: 'oops\n', exitCode: 42 })
    shell.register('fail', fail)
    const { result } = shell.execute('fail', defaultContext())
    expect(result.exitCode).toBe(42)
    expect(result.stderr).toBe('oops\n')
  })

  it('handler が throw してもシェルは死なず internal error を返す', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const boom: CommandHandler = () => {
      throw new Error('something broke')
    }
    shell.register('boom', boom)
    const { result, nextCwd } = shell.execute('boom', defaultContext('/home/user'))
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('internal error')
    expect(result.stderr).toContain('something broke')
    expect(nextCwd).toBe('/home/user')
    consoleSpy.mockRestore()
  })

  it('> 先がディレクトリなら EISDIR で stderr が出る', () => {
    const echo: CommandHandler = () => ({ stdout: 'hi\n', stderr: '', exitCode: 0 })
    shell.register('echo', echo)
    const { result } = shell.execute('echo hi > /home/user/docs', defaultContext())
    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('Is a directory')
  })

  it('複数の stdout リダイレクトはシェル層で syntax error', () => {
    const echo: CommandHandler = () => ({ stdout: 'hi\n', stderr: '', exitCode: 0 })
    shell.register('echo', echo)
    const { result } = shell.execute('echo hi > a > b', defaultContext())
    expect(result.exitCode).toBe(2)
    expect(result.stderr).toContain('multiple stdout redirections')
  })

  it('未対応メタ文字はシェル層で syntax error', () => {
    const { result } = shell.execute('cat foo | grep x', defaultContext())
    expect(result.exitCode).toBe(2)
    expect(result.stderr).toContain('not supported')
  })
})
