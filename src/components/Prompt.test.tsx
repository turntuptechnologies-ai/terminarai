import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { displayCwd, Prompt } from './Prompt'

describe('displayCwd', () => {
  it('HOME は ~ に変換', () => {
    expect(displayCwd('/home/user')).toBe('~')
  })

  it('HOME 配下は ~/ プレフィックス', () => {
    expect(displayCwd('/home/user/docs')).toBe('~/docs')
  })

  it('HOME 外はそのまま', () => {
    expect(displayCwd('/etc')).toBe('/etc')
  })

  it('ルート', () => {
    expect(displayCwd('/')).toBe('/')
  })
})

describe('Prompt', () => {
  it('user@terminarai と $ プレフィックスを表示', () => {
    render(<Prompt cwd="/home/user" />)
    expect(screen.getByText('user@terminarai')).toBeInTheDocument()
    // cwd は `~` で表示される
    expect(screen.getByText('~')).toBeInTheDocument()
  })

  it('深いパスは ~/path 形式で表示', () => {
    render(<Prompt cwd="/home/user/docs" />)
    expect(screen.getByText('~/docs')).toBeInTheDocument()
  })
})
