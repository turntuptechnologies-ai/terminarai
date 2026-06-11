import type { Problem } from '../types'
import { dir, file } from './helpers'

// --- 難易度 hard の自習問題 ---
// PROBLEMS の並び (= findNextProblem の遷移順) は index.ts で学習順に定義する。

/** p15 用ログ。INFO / ERROR / WARN を混在させ、grep / tail の多段調査を体験させる (12 行)。 */
const P15_LOG = `INFO  app started
INFO  config loaded
WARN  cache miss
ERROR db connection failed
INFO  retry scheduled
WARN  high latency
ERROR timeout on /api/users
INFO  request handled
INFO  request handled
WARN  slow query
ERROR disk space low
INFO  shutdown
`

export const P15: Problem = {
  id: 'p15',
  title: { ja: 'ログ調査ワークフロー', en: 'Log investigation workflow' },
  description: {
    ja: '`/home/user/app.log` (12 行) を調べます。grep と tail を組み合わせて、(1) ERROR を行番号付きで探し、(2) 末尾 5 行で最近の状況を確認し、(3) INFO を除外してノイズを取り除いてください。',
    en: 'Investigate `/home/user/app.log` (12 lines). Combine grep and tail to (1) find ERROR with line numbers, (2) check recent activity with the last 5 lines, and (3) strip noise by excluding INFO.',
  },
  difficulty: 'hard',
  tags: ['grep', 'tail'],
  initialFs: dir('/', {
    home: dir('home', {
      user: dir('user', {
        'README.txt': file('README.txt', 'ログ調査の練習です。app.log を見てください。\n'),
        'app.log': file('app.log', P15_LOG),
        docs: dir('docs'),
      }),
    }),
    tmp: dir('tmp'),
    etc: dir('etc'),
    usr: dir('usr'),
  }),
  steps: [
    {
      instruction: {
        ja: 'まず `grep -n ERROR app.log` で ERROR の行を行番号付きで洗い出してください。',
        en: 'First, list the ERROR lines with line numbers using `grep -n ERROR app.log`.',
      },
      hints: {
        ja: ['`-n` で行番号が付きます。`grep -n ERROR app.log` と入力。'],
        en: ['`-n` adds line numbers. Type `grep -n ERROR app.log`.'],
      },
      check: {
        kind: 'and',
        checks: [
          { kind: 'command-name', name: 'grep' },
          { kind: 'command-matches', pattern: '(?:-n\\b|-\\w*n\\w*|--line-number\\b)' },
          { kind: 'command-matches', pattern: '\\bERROR\\b' },
          { kind: 'command-matches', pattern: '(?:\\S*/)?app\\.log\\b' },
        ],
      },
    },
    {
      instruction: {
        ja: '次に `tail -n 5 app.log` で末尾 5 行 (直近の状況) を確認してください。',
        en: 'Next, check the last 5 lines (recent activity) with `tail -n 5 app.log`.',
      },
      hints: {
        ja: ['`tail -n 5 app.log` と入力。`-5` でも OK。'],
        en: ['Type `tail -n 5 app.log`. `-5` also works.'],
      },
      check: {
        kind: 'and',
        checks: [
          { kind: 'command-name', name: 'tail' },
          { kind: 'command-matches', pattern: '(?:-n\\s*5|-n5|--lines=5|-5)\\b' },
          { kind: 'command-matches', pattern: '(?:\\S*/)?app\\.log\\b' },
        ],
      },
    },
    {
      instruction: {
        ja: '最後に `grep -v INFO app.log` で INFO を除外し、WARN / ERROR だけを残してください。',
        en: 'Finally, exclude INFO with `grep -v INFO app.log`, leaving only WARN / ERROR.',
      },
      hints: {
        ja: ['`-v` は「一致しない行」を出します。`grep -v INFO app.log` と入力。'],
        en: ['`-v` prints "non-matching lines". Type `grep -v INFO app.log`.'],
      },
      check: {
        kind: 'and',
        checks: [
          { kind: 'command-name', name: 'grep' },
          { kind: 'command-matches', pattern: '(?:-v\\b|-\\w*v\\w*|--invert-match\\b)' },
          { kind: 'command-matches', pattern: '\\bINFO\\b' },
          { kind: 'command-matches', pattern: '(?:\\S*/)?app\\.log\\b' },
        ],
      },
    },
  ],
}

export const P16: Problem = {
  id: 'p16',
  title: { ja: 'バックアップして上書き', en: 'Back up, then overwrite' },
  description: {
    ja: '`config.txt` (中身: `mode=dev`) を編集する前に `cp` でバックアップを取り、`>` で原本を上書きします。最後にバックアップが原本と独立して残っていることを確認しましょう。cp が「独立したコピー」を作ることを体感する問題です。',
    en: 'Before editing `config.txt` (contents: `mode=dev`), back it up with `cp`, then overwrite the original with `>`. Finally, confirm the backup survives independently of the original. This shows that cp makes an independent copy.',
  },
  difficulty: 'hard',
  tags: ['cp', '>'],
  initialFs: dir('/', {
    home: dir('home', {
      user: dir('user', {
        'config.txt': file('config.txt', 'mode=dev\nport=3000\n'),
        docs: dir('docs'),
      }),
    }),
    tmp: dir('tmp'),
    etc: dir('etc'),
    usr: dir('usr'),
  }),
  steps: [
    {
      instruction: {
        ja: 'まず `cp config.txt config.bak` で config.txt のバックアップを作りましょう。',
        en: 'First, make a backup of config.txt with `cp config.txt config.bak`.',
      },
      hints: {
        ja: ['`cp <元> <先>` の順。`cp config.txt config.bak` と入力。'],
        en: ['`cp <src> <dst>`. Type `cp config.txt config.bak`.'],
      },
      // バックアップが原本の中身 (mode=dev) を持つこと = cp でコピーされたこと
      check: { kind: 'file-contains', path: '/home/user/config.bak', text: 'mode=dev' },
    },
    {
      instruction: {
        ja: '次に `echo "mode=prod" > config.txt` で原本を上書きしてください。`>` なので元の `mode=dev` は消えます。',
        en: 'Next, overwrite the original with `echo "mode=prod" > config.txt`. Since it is `>`, the old `mode=dev` is gone.',
      },
      hints: {
        ja: ['`>` は上書きリダイレクト。`echo "mode=prod" > config.txt` と入力。'],
        en: ['`>` is the overwrite redirection. Type `echo "mode=prod" > config.txt`.'],
      },
      check: {
        kind: 'and',
        checks: [
          { kind: 'file-contains', path: '/home/user/config.txt', text: 'mode=prod' },
          {
            kind: 'not',
            check: { kind: 'file-contains', path: '/home/user/config.txt', text: 'mode=dev' },
          },
        ],
      },
    },
    {
      instruction: {
        ja: '最後に `cat config.bak` でバックアップを確認しましょう。原本を上書きしても、バックアップには `mode=dev` が残っているはずです。',
        en: 'Finally, check the backup with `cat config.bak`. Even though you overwrote the original, the backup should still hold `mode=dev`.',
      },
      hints: {
        ja: ['`cat config.bak` と入力。cp で作ったコピーは原本と独立しています。'],
        en: ['Type `cat config.bak`. The copy made by cp is independent of the original.'],
      },
      check: {
        kind: 'and',
        checks: [
          { kind: 'file-contains', path: '/home/user/config.bak', text: 'mode=dev' },
          { kind: 'command-matches', pattern: '^\\s*cat\\s+(?:\\S*/)?config\\.bak\\b' },
        ],
      },
    },
  ],
}
