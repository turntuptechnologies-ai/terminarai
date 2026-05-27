import { DEFAULT_DIR_MODE, DEFAULT_FILE_MODE, type VfsDirectory, type VfsFile } from '../vfs/types'
import type { Problem } from './types'

// --- VFS 構築ヘルパ (problem 用 initialFs を組み立てるため) ---

const NOW = Date.now()

function dir(name: string, children: Record<string, VfsDirectory | VfsFile> = {}): VfsDirectory {
  return {
    type: 'directory',
    name,
    mtime: NOW,
    mode: DEFAULT_DIR_MODE,
    children,
  }
}

function file(name: string, content: string): VfsFile {
  return {
    type: 'file',
    name,
    mtime: NOW,
    mode: DEFAULT_FILE_MODE,
    content,
  }
}

/**
 * 自習問題のレジストリ。
 * チュートリアル第1〜5章で習った内容を組み合わせて挑戦する構成。
 *
 * 各問題は initialFs を持つことで、ターゲットの状況を明示的にセットできる。
 * 省略時は createDefaultVfs() の初期 FS を使う。
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
  {
    id: 'p6',
    title: 'プロジェクトを整理する',
    description:
      '`/home/user` に散らかったファイルがあります。`docs/` ディレクトリを作って `.txt` / `.md` ファイルを移動し、`images/` ディレクトリを作って `.png` を移動して整理してください。',
    difficulty: 'medium',
    tags: ['mkdir', 'mv'],
    initialFs: dir('/', {
      home: dir('home', {
        user: dir('user', {
          'notes.txt': file('notes.txt', 'note content'),
          'draft.md': file('draft.md', '# draft'),
          'todo.txt': file('todo.txt', '- buy milk'),
          'image.png': file('image.png', '<binary>'),
        }),
      }),
      tmp: dir('tmp'),
      etc: dir('etc'),
      usr: dir('usr'),
    }),
    steps: [
      {
        instruction:
          'まず `docs` と `images` の 2 つの空ディレクトリを作りましょう。`mkdir` を 2 回でも、複数指定で 1 回でも OK。',
        hints: [
          '`mkdir docs images` で 2 つを一度に作れます。',
          '`mkdir docs` と `mkdir images` を別々に実行しても同じ結果になります。',
        ],
        check: {
          kind: 'and',
          checks: [
            { kind: 'file-exists', path: '/home/user/docs' },
            { kind: 'file-exists', path: '/home/user/images' },
          ],
        },
      },
      {
        instruction:
          'テキスト系 (`notes.txt`, `draft.md`, `todo.txt`) を `docs/` に **移動** してください。元の場所からは消えること。',
        hints: [
          '`mv notes.txt draft.md todo.txt docs/` で 3 ファイルを一度に移動できます。',
          '1 ファイルずつ `mv notes.txt docs/` を 3 回繰り返しても OK。',
        ],
        check: {
          kind: 'and',
          checks: [
            { kind: 'file-exists', path: '/home/user/docs/notes.txt' },
            { kind: 'file-exists', path: '/home/user/docs/draft.md' },
            { kind: 'file-exists', path: '/home/user/docs/todo.txt' },
            { kind: 'not', check: { kind: 'file-exists', path: '/home/user/notes.txt' } },
            { kind: 'not', check: { kind: 'file-exists', path: '/home/user/draft.md' } },
            { kind: 'not', check: { kind: 'file-exists', path: '/home/user/todo.txt' } },
          ],
        },
      },
      {
        instruction: '残った `image.png` を `images/` に移動して整理完了です。',
        hints: ['`mv image.png images/` でディレクトリ配下に移ります。'],
        check: {
          kind: 'and',
          checks: [
            { kind: 'file-exists', path: '/home/user/images/image.png' },
            { kind: 'not', check: { kind: 'file-exists', path: '/home/user/image.png' } },
          ],
        },
      },
    ],
  },
  {
    id: 'p7',
    title: 'ログを残す',
    description:
      '`log.txt` を作って、2 行のログを追記してから `cat` で確認してください。`>` で上書きせず `>>` で **追記** することがポイントです。',
    difficulty: 'easy',
    tags: ['touch', 'echo', '>>'],
    steps: [
      {
        instruction: 'まず `touch log.txt` で空ファイルを作りましょう。',
        hints: ['`touch log.txt` と入力。'],
        check: { kind: 'file-exists', path: '/home/user/log.txt' },
      },
      {
        instruction: '`echo "first entry" >> log.txt` で 1 行目を追記してください。',
        hints: ['`>>` (`>` 2 つ) で末尾追記。', '`echo "first entry" >> log.txt`。'],
        check: {
          kind: 'and',
          checks: [
            { kind: 'file-contains', path: '/home/user/log.txt', text: 'first entry' },
            { kind: 'command-matches', pattern: '>>\\s' },
          ],
        },
      },
      {
        instruction: '`echo "second entry" >> log.txt` でさらに 1 行追記しましょう。',
        hints: ['`>>` を使うことで 1 行目を消さずに足せます。'],
        check: {
          kind: 'and',
          checks: [
            { kind: 'file-contains', path: '/home/user/log.txt', text: 'first entry' },
            { kind: 'file-contains', path: '/home/user/log.txt', text: 'second entry' },
            { kind: 'command-matches', pattern: '>>\\s' },
          ],
        },
      },
      {
        instruction: '最後に `cat log.txt` で 2 行揃って入っているか確認しましょう。',
        hints: ['`cat log.txt` と入力。'],
        check: {
          kind: 'command-matches',
          pattern: '^\\s*cat\\s+(?:\\S*/)?log\\.txt\\b',
        },
      },
    ],
  },
  {
    id: 'p8',
    title: '不要なディレクトリを掃除する',
    description:
      '`/home/user` には不要な `temp.txt` と、古いバックアップ `backup_old/` (中にファイルが入っている) があります。両方とも削除してください。ディレクトリには `-r` が必要です。',
    difficulty: 'medium',
    tags: ['rm', '-r'],
    initialFs: dir('/', {
      home: dir('home', {
        user: dir('user', {
          'README.txt': file('README.txt', 'welcome'),
          'temp.txt': file('temp.txt', 'temporary'),
          backup_old: dir('backup_old', {
            'old1.txt': file('old1.txt', 'a'),
            'old2.txt': file('old2.txt', 'b'),
          }),
        }),
      }),
      tmp: dir('tmp'),
      etc: dir('etc'),
      usr: dir('usr'),
    }),
    steps: [
      {
        instruction: 'まず `rm temp.txt` で不要ファイルを削除しましょう。',
        hints: ['`rm <ファイル名>`。ファイルなら `-r` 不要です。'],
        check: {
          kind: 'not',
          check: { kind: 'file-exists', path: '/home/user/temp.txt' },
        },
      },
      {
        instruction:
          '次に `backup_old/` ディレクトリを削除します。中身があるので `-r` (recursive) が必須です。',
        hints: [
          '`rm -r backup_old` で中身ごと削除できます。',
          '`-r` なしだと `rm: cannot remove ...: Is a directory` エラーになります。',
        ],
        check: {
          kind: 'and',
          checks: [
            { kind: 'not', check: { kind: 'file-exists', path: '/home/user/backup_old' } },
            // 残しておきたい README.txt は触らずに済んだことを担保
            { kind: 'file-exists', path: '/home/user/README.txt' },
          ],
        },
      },
    ],
  },
  {
    id: 'p9',
    title: '隠されたファイルを読む',
    description:
      '深い階層 `/home/user/secret/deep/hidden/` に `treasure.txt` が隠されています。`cd` で潜ってから `cat` で中身を読んでください。',
    difficulty: 'easy',
    tags: ['cd', 'cat'],
    initialFs: dir('/', {
      home: dir('home', {
        user: dir('user', {
          'README.txt': file('README.txt', 'welcome'),
          secret: dir('secret', {
            deep: dir('deep', {
              hidden: dir('hidden', {
                'treasure.txt': file('treasure.txt', 'You found the treasure!\n'),
              }),
            }),
          }),
        }),
      }),
      tmp: dir('tmp'),
      etc: dir('etc'),
      usr: dir('usr'),
    }),
    steps: [
      {
        instruction: '`cd` で `secret/deep/hidden` まで一気に潜ってみましょう (1 コマンドで OK)。',
        hints: [
          '`/` で繋いで `cd secret/deep/hidden` と一度に書けます。',
          '`cd secret` → `cd deep` → `cd hidden` のように 3 段階に分けても OK ですが、最後にこの場所にいることが条件です。',
        ],
        check: { kind: 'cwd-equals', path: '/home/user/secret/deep/hidden' },
      },
      {
        instruction: 'そこから `cat treasure.txt` で中身を確認してください。お宝が見つかります。',
        hints: [
          'いま `hidden/` にいるはずです。`cat treasure.txt` で読めます。',
          '絶対パス `cat /home/user/secret/deep/hidden/treasure.txt` でも結果は同じです。',
        ],
        check: {
          kind: 'and',
          checks: [
            { kind: 'cwd-equals', path: '/home/user/secret/deep/hidden' },
            {
              kind: 'command-matches',
              pattern: '^\\s*cat\\s+(?:\\S*/)?treasure\\.txt\\b',
            },
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
