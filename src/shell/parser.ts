import type { Token } from './tokenizer'

export interface ParsedCommand {
  argv: string[]
  stdoutRedirect?: {
    target: string
    append: boolean
  }
}

export interface ParseError {
  message: string
}

export type ParseResult =
  | { ok: true; command: ParsedCommand | null }
  | { ok: false; error: ParseError }

/**
 * トークン列を 1 つの実行可能な命令に整形する。
 * MVP では pipe / 論理結合は対象外。
 */
export function parse(tokens: Token[]): ParseResult {
  if (tokens.length === 0) {
    return { ok: true, command: null }
  }

  const argv: string[] = []
  let stdoutRedirect: ParsedCommand['stdoutRedirect']
  let i = 0

  while (i < tokens.length) {
    const tok = tokens[i]
    if (tok.type === 'word') {
      argv.push(tok.value)
      i++
      continue
    }
    // redirect
    const next = tokens[i + 1]
    if (!next || next.type !== 'word') {
      return {
        ok: false,
        error: { message: `syntax error near unexpected token '${tok.op}'` },
      }
    }
    stdoutRedirect = { target: next.value, append: tok.op === '>>' }
    i += 2
  }

  if (argv.length === 0) {
    return {
      ok: false,
      error: { message: 'syntax error: missing command' },
    }
  }

  return { ok: true, command: { argv, stdoutRedirect } }
}
