import type { Problem } from '../types'
import { P1, P2, P3, P7, P9, P10 } from './easy'
import { P15, P16 } from './hard'
import { P4, P5, P6, P8, P11, P12, P13, P14 } from './medium'

/**
 * 自習問題のレジストリ。
 * チュートリアル第1〜7章で習った内容を組み合わせて挑戦する構成。
 *
 * 各問題は initialFs を持つことで、ターゲットの状況を明示的にセットできる。
 * 省略時は createDefaultVfs() の初期 FS を使う。
 *
 * 定義は難易度別ファイル (easy / medium / hard) に分かれているが、
 * この配列の並びは**学習順 (p1〜p16)** であり、一覧表示と
 * findNextProblem の遷移順の両方がこの順に従う。
 */
export const PROBLEMS: Problem[] = [
  P1,
  P2,
  P3,
  P4,
  P5,
  P6,
  P7,
  P8,
  P9,
  P10,
  P11,
  P12,
  P13,
  P14,
  P15,
  P16,
]

export function findProblem(id: string): Problem | undefined {
  return PROBLEMS.find((p) => p.id === id)
}

export function findNextProblem(id: string): Problem | undefined {
  const idx = PROBLEMS.findIndex((p) => p.id === id)
  if (idx === -1 || idx === PROBLEMS.length - 1) return undefined
  return PROBLEMS[idx + 1]
}
