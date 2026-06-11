import type { Problem } from '../types'
import { dir, file, initialFsWithAccessLog } from './helpers'

// --- 難易度 easy の自習問題 ---
// PROBLEMS の並び (= findNextProblem の遷移順) は index.ts で学習順に定義する。

export const P1: Problem = {
  id: 'p1',
  title: { ja: 'docs ディレクトリへ移動する', en: 'Move into the docs directory' },
  description: {
    ja: 'いま `/home/user` にいます。`docs` ディレクトリに移動してください。移動後は `pwd` で場所を確認するクセを付けると便利です。',
    en: 'You are now in `/home/user`. Move into the `docs` directory. It is a good habit to confirm your location with `pwd` after moving.',
  },
  difficulty: 'easy',
  tags: ['cd'],
  steps: [
    {
      instruction: {
        ja: 'docs ディレクトリに `cd` で移動してください。',
        en: 'Use `cd` to move into the docs directory.',
      },
      hints: { ja: ['`cd docs` でいけます。'], en: ['`cd docs` does it.'] },
      check: { kind: 'cwd-equals', path: '/home/user/docs' },
    },
  ],
}

export const P2: Problem = {
  id: 'p2',
  title: { ja: 'README.txt の中身を表示する', en: 'Display the contents of README.txt' },
  description: {
    ja: '`/home/user/README.txt` の内容をターミナルに出力してください。',
    en: 'Print the contents of `/home/user/README.txt` to the terminal.',
  },
  difficulty: 'easy',
  tags: ['cat'],
  steps: [
    {
      instruction: {
        ja: '`cat` でファイルの中身を表示できます。',
        en: "You can display a file's contents with `cat`.",
      },
      hints: {
        ja: ['`cat README.txt` (相対) でも `cat /home/user/README.txt` (絶対) でも OK。'],
        en: ['Either `cat README.txt` (relative) or `cat /home/user/README.txt` (absolute) works.'],
      },
      check: {
        kind: 'command-matches',
        pattern: '^\\s*cat\\s+(?:\\S*/)?README\\.txt\\b',
      },
    },
  ],
}

export const P3: Problem = {
  id: 'p3',
  title: { ja: 'メモを作って中身を確認する', en: 'Create a memo and check its contents' },
  description: {
    ja: '`memo.txt` というファイルを作り、内容に `todo` という文字列を書き込んでください。`cat` で確認しなくてもクリア判定されます。',
    en: 'Create a file called `memo.txt` and write the string `todo` into it. It clears even without checking via `cat`.',
  },
  difficulty: 'easy',
  tags: ['echo', '>'],
  steps: [
    {
      instruction: {
        ja: '`echo` の出力を `>` でファイルに書き込みましょう。',
        en: 'Write `echo` output into a file with `>`.',
      },
      hints: { ja: ['`echo todo > memo.txt`'], en: ['`echo todo > memo.txt`'] },
      check: { kind: 'file-contains', path: '/home/user/memo.txt', text: 'todo' },
    },
  ],
}

export const P7: Problem = {
  id: 'p7',
  title: { ja: 'ログを残す', en: 'Keep a log' },
  description: {
    ja: '`log.txt` を作って、2 行のログを追記してから `cat` で確認してください。`>` で上書きせず `>>` で **追記** することがポイントです。',
    en: 'Create `log.txt`, append two log lines, then check with `cat`. The point is to **append** with `>>` rather than overwrite with `>`.',
  },
  difficulty: 'easy',
  tags: ['touch', 'echo', '>>'],
  steps: [
    {
      instruction: {
        ja: 'まず `touch log.txt` で空ファイルを作りましょう。',
        en: 'First make an empty file with `touch log.txt`.',
      },
      hints: { ja: ['`touch log.txt` と入力。'], en: ['Type `touch log.txt`.'] },
      check: { kind: 'file-exists', path: '/home/user/log.txt' },
    },
    {
      instruction: {
        ja: '`echo "first entry" >> log.txt` で 1 行目を追記してください。',
        en: 'Append the first line with `echo "first entry" >> log.txt`.',
      },
      hints: {
        ja: ['`>>` (`>` 2 つ) で末尾追記。', '`echo "first entry" >> log.txt`。'],
        en: ['`>>` (two `>`) appends to the end.', '`echo "first entry" >> log.txt`.'],
      },
      check: {
        kind: 'and',
        checks: [
          { kind: 'file-contains', path: '/home/user/log.txt', text: 'first entry' },
          { kind: 'command-matches', pattern: '>>\\s' },
        ],
      },
    },
    {
      instruction: {
        ja: '`echo "second entry" >> log.txt` でさらに 1 行追記しましょう。',
        en: 'Append one more line with `echo "second entry" >> log.txt`.',
      },
      hints: {
        ja: ['`>>` を使うことで 1 行目を消さずに足せます。'],
        en: ['Using `>>` lets you add without erasing the first line.'],
      },
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
      instruction: {
        ja: '最後に `cat log.txt` で 2 行揃って入っているか確認しましょう。',
        en: 'Finally, check both lines are present with `cat log.txt`.',
      },
      hints: { ja: ['`cat log.txt` と入力。'], en: ['Type `cat log.txt`.'] },
      check: {
        kind: 'command-matches',
        pattern: '^\\s*cat\\s+(?:\\S*/)?log\\.txt\\b',
      },
    },
  ],
}

export const P9: Problem = {
  id: 'p9',
  title: { ja: '隠されたファイルを読む', en: 'Read a hidden file' },
  description: {
    ja: '深い階層 `/home/user/secret/deep/hidden/` に `treasure.txt` が隠されています。`cd` で潜ってから `cat` で中身を読んでください。',
    en: 'A `treasure.txt` is hidden deep at `/home/user/secret/deep/hidden/`. Dive in with `cd`, then read it with `cat`.',
  },
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
      instruction: {
        ja: '`cd` で `secret/deep/hidden` まで一気に潜ってみましょう (1 コマンドで OK)。',
        en: 'Use `cd` to dive all the way to `secret/deep/hidden` at once (one command is fine).',
      },
      hints: {
        ja: [
          '`/` で繋いで `cd secret/deep/hidden` と一度に書けます。',
          '`cd secret` → `cd deep` → `cd hidden` のように 3 段階に分けても OK ですが、最後にこの場所にいることが条件です。',
        ],
        en: [
          'Join with `/` and write `cd secret/deep/hidden` in one go.',
          'Splitting into `cd secret` → `cd deep` → `cd hidden` is fine too, as long as you end up here.',
        ],
      },
      check: { kind: 'cwd-equals', path: '/home/user/secret/deep/hidden' },
    },
    {
      instruction: {
        ja: 'そこから `cat treasure.txt` で中身を確認してください。お宝が見つかります。',
        en: 'From there, check the contents with `cat treasure.txt`. You will find the treasure.',
      },
      hints: {
        ja: [
          'いま `hidden/` にいるはずです。`cat treasure.txt` で読めます。',
          '絶対パス `cat /home/user/secret/deep/hidden/treasure.txt` でも結果は同じです。',
        ],
        en: [
          'You should be in `hidden/`. `cat treasure.txt` reads it.',
          'The absolute path `cat /home/user/secret/deep/hidden/treasure.txt` gives the same result.',
        ],
      },
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
}

export const P10: Problem = {
  id: 'p10',
  title: { ja: 'ログから ERROR 行を抜き出す', en: 'Extract ERROR lines from a log' },
  description: {
    ja: '`/home/user/access.log` にサーバのログがあります。`grep` を使って `ERROR` を含む行だけを画面に出してください。',
    en: 'There is a server log at `/home/user/access.log`. Use `grep` to print only the lines containing `ERROR`.',
  },
  difficulty: 'easy',
  tags: ['grep'],
  initialFs: initialFsWithAccessLog(),
  steps: [
    {
      instruction: {
        ja: '`grep ERROR access.log` で `ERROR` を含む行だけを表示しましょう。',
        en: 'Show only the lines containing `ERROR` with `grep ERROR access.log`.',
      },
      hints: {
        ja: ['`grep <パターン> <ファイル名>` の順で書きます。', '`grep ERROR access.log` と入力。'],
        en: ['Write it as `grep <pattern> <filename>`.', 'Type `grep ERROR access.log`.'],
      },
      check: {
        kind: 'and',
        checks: [
          { kind: 'command-name', name: 'grep' },
          { kind: 'command-matches', pattern: '\\bERROR\\b' },
          { kind: 'command-matches', pattern: '(?:\\S*/)?access\\.log\\b' },
        ],
      },
    },
  ],
}
