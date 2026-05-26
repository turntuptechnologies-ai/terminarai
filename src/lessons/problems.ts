import type { Problem } from './types'

/**
 * 自習問題のレジストリ。MVP では 5 問。
 * チュートリアル第1〜3章で習った内容を試す構成。
 */
export const PROBLEMS: Problem[] = [
  {
    id: 'p1',
    title: 'docs ディレクトリへ移動する',
    description:
      'いま `/home/user` にいます。`docs` ディレクトリに移動してください。移動後は `pwd` で場所を確認するクセを付けると便利です。',
    difficulty: 'easy',
    tags: ['cd'],
    steps: [
      {
        instruction: 'docs ディレクトリに `cd` で移動してください。',
        hints: ['`cd docs` でいけます。'],
        check: { kind: 'cwd-equals', path: '/home/user/docs' },
      },
    ],
  },
  {
    id: 'p2',
    title: 'README.txt の中身を表示する',
    description: '`/home/user/README.txt` の内容をターミナルに出力してください。',
    difficulty: 'easy',
    tags: ['cat'],
    steps: [
      {
        instruction: '`cat` でファイルの中身を表示できます。',
        hints: ['`cat README.txt` (相対) でも `cat /home/user/README.txt` (絶対) でも OK。'],
        check: {
          kind: 'command-matches',
          pattern: '^\\s*cat\\s+(?:\\S*/)?README\\.txt\\b',
        },
      },
    ],
  },
  {
    id: 'p3',
    title: 'メモを作って中身を確認する',
    description:
      '`memo.txt` というファイルを作り、内容に `todo` という文字列を書き込んでください。`cat` で確認しなくてもクリア判定されます。',
    difficulty: 'easy',
    tags: ['echo', '>'],
    steps: [
      {
        instruction: '`echo` の出力を `>` でファイルに書き込みましょう。',
        hints: ['`echo todo > memo.txt`'],
        check: { kind: 'file-contains', path: '/home/user/memo.txt', text: 'todo' },
      },
    ],
  },
  {
    id: 'p4',
    title: 'プロジェクト構成を作る',
    description:
      '`myproject` ディレクトリの中に `src` と `test` の 2 つのサブディレクトリを作ってください。一気に作る方法を考えてみましょう。',
    difficulty: 'medium',
    tags: ['mkdir', '-p'],
    steps: [
      {
        instruction: 'myproject/src と myproject/test がどちらも存在する状態にしてください。',
        hints: ['`mkdir -p myproject/src myproject/test` で一度に作れます。'],
        check: {
          kind: 'and',
          checks: [
            { kind: 'file-exists', path: '/home/user/myproject/src' },
            { kind: 'file-exists', path: '/home/user/myproject/test' },
          ],
        },
      },
    ],
  },
  {
    id: 'p5',
    title: 'ファイルを docs に整理する',
    description:
      'いま `/home/user/hello.txt` があります。これを `docs` ディレクトリの中に **移動** してください (コピーではない)。',
    difficulty: 'medium',
    tags: ['mv'],
    steps: [
      {
        instruction: 'hello.txt が docs 配下に存在し、かつ元の場所からは消えていることが条件です。',
        hints: ['`mv hello.txt docs/`'],
        check: {
          kind: 'and',
          checks: [
            { kind: 'file-exists', path: '/home/user/docs/hello.txt' },
            { kind: 'not', check: { kind: 'file-exists', path: '/home/user/hello.txt' } },
          ],
        },
      },
    ],
  },
]

export function findProblem(id: string): Problem | undefined {
  return PROBLEMS.find((p) => p.id === id)
}

export function findNextProblem(id: string): Problem | undefined {
  const idx = PROBLEMS.findIndex((p) => p.id === id)
  if (idx === -1 || idx === PROBLEMS.length - 1) return undefined
  return PROBLEMS[idx + 1]
}
