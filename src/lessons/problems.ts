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

/** p10 / p11 用サンプルログ。大文字 ERROR と小文字 error を混在させ、`-i` の効果が分かるようにする。 */
const ACCESS_LOG = `INFO 2026-05-27 user login
ERROR 2026-05-27 disk full
INFO 2026-05-27 user logout
WARN 2026-05-27 slow query
error 2026-05-27 timeout
INFO 2026-05-27 user login
`

/** p12 用の 20 行ログ。head / tail のデフォルト 10 行との差が出るよう長めにする。 */
const SERVER_LOG = `${Array.from({ length: 20 }, (_, i) => `line${String(i + 1).padStart(2, '0')}`).join('\n')}\n`

/** access.log を含む共通 FS (p10 / p11 用)。 */
function initialFsWithAccessLog(): VfsDirectory {
  return dir('/', {
    home: dir('home', {
      user: dir('user', {
        'README.txt': file('README.txt', 'ログは access.log にあります。\n'),
        'access.log': file('access.log', ACCESS_LOG),
        docs: dir('docs'),
      }),
    }),
    tmp: dir('tmp'),
    etc: dir('etc'),
    usr: dir('usr'),
  })
}

/**
 * 自習問題のレジストリ。
 * チュートリアル第1〜7章で習った内容を組み合わせて挑戦する構成。
 *
 * 各問題は initialFs を持つことで、ターゲットの状況を明示的にセットできる。
 * 省略時は createDefaultVfs() の初期 FS を使う。
 */
export const PROBLEMS: Problem[] = [
  {
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
  },
  {
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
          en: [
            'Either `cat README.txt` (relative) or `cat /home/user/README.txt` (absolute) works.',
          ],
        },
        check: {
          kind: 'command-matches',
          pattern: '^\\s*cat\\s+(?:\\S*/)?README\\.txt\\b',
        },
      },
    ],
  },
  {
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
  },
  {
    id: 'p4',
    title: { ja: 'プロジェクト構成を作る', en: 'Build a project structure' },
    description: {
      ja: '`myproject` ディレクトリの中に `src` と `test` の 2 つのサブディレクトリを作ってください。一気に作る方法を考えてみましょう。',
      en: 'Inside a `myproject` directory, create two subdirectories: `src` and `test`. Think about how to make them all at once.',
    },
    difficulty: 'medium',
    tags: ['mkdir', '-p'],
    steps: [
      {
        instruction: {
          ja: 'myproject/src と myproject/test がどちらも存在する状態にしてください。',
          en: 'Get to a state where both myproject/src and myproject/test exist.',
        },
        hints: {
          ja: ['`mkdir -p myproject/src myproject/test` で一度に作れます。'],
          en: ['`mkdir -p myproject/src myproject/test` creates them in one go.'],
        },
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
    title: { ja: 'ファイルを docs に整理する', en: 'Tidy a file into docs' },
    description: {
      ja: 'いま `/home/user/hello.txt` があります。これを `docs` ディレクトリの中に **移動** してください (コピーではない)。',
      en: 'There is a `/home/user/hello.txt`. **Move** it into the `docs` directory (not copy).',
    },
    difficulty: 'medium',
    tags: ['mv'],
    steps: [
      {
        instruction: {
          ja: 'hello.txt が docs 配下に存在し、かつ元の場所からは消えていることが条件です。',
          en: 'The condition is that hello.txt exists under docs and is gone from its original place.',
        },
        hints: { ja: ['`mv hello.txt docs/`'], en: ['`mv hello.txt docs/`'] },
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
    title: { ja: 'プロジェクトを整理する', en: 'Organize the project' },
    description: {
      ja: '`/home/user` に散らかったファイルがあります。`docs/` ディレクトリを作って `.txt` / `.md` ファイルを移動し、`images/` ディレクトリを作って `.png` を移動して整理してください。',
      en: 'There are scattered files in `/home/user`. Create a `docs/` directory and move the `.txt` / `.md` files there, then create an `images/` directory and move the `.png` there, to tidy up.',
    },
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
        instruction: {
          ja: 'まず `docs` と `images` の 2 つの空ディレクトリを作りましょう。`mkdir` を 2 回でも、複数指定で 1 回でも OK。',
          en: 'First create two empty directories, `docs` and `images`. Two `mkdir` calls, or one with multiple names, both work.',
        },
        hints: {
          ja: [
            '`mkdir docs images` で 2 つを一度に作れます。',
            '`mkdir docs` と `mkdir images` を別々に実行しても同じ結果になります。',
          ],
          en: [
            '`mkdir docs images` makes both at once.',
            'Running `mkdir docs` and `mkdir images` separately gives the same result.',
          ],
        },
        check: {
          kind: 'and',
          checks: [
            { kind: 'file-exists', path: '/home/user/docs' },
            { kind: 'file-exists', path: '/home/user/images' },
          ],
        },
      },
      {
        instruction: {
          ja: 'テキスト系 (`notes.txt`, `draft.md`, `todo.txt`) を `docs/` に **移動** してください。元の場所からは消えること。',
          en: 'Move the text files (`notes.txt`, `draft.md`, `todo.txt`) into `docs/`. They must disappear from their original place.',
        },
        hints: {
          ja: [
            '`mv notes.txt draft.md todo.txt docs/` で 3 ファイルを一度に移動できます。',
            '1 ファイルずつ `mv notes.txt docs/` を 3 回繰り返しても OK。',
          ],
          en: [
            '`mv notes.txt draft.md todo.txt docs/` moves all three at once.',
            'Repeating `mv notes.txt docs/` once per file (three times) is fine too.',
          ],
        },
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
        instruction: {
          ja: '残った `image.png` を `images/` に移動して整理完了です。',
          en: 'Move the remaining `image.png` into `images/` to finish tidying.',
        },
        hints: {
          ja: ['`mv image.png images/` でディレクトリ配下に移ります。'],
          en: ['`mv image.png images/` moves it under the directory.'],
        },
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
  },
  {
    id: 'p8',
    title: { ja: '不要なディレクトリを掃除する', en: 'Clean up unwanted directories' },
    description: {
      ja: '`/home/user` には不要な `temp.txt` と、古いバックアップ `backup_old/` (中にファイルが入っている) があります。両方とも削除してください。ディレクトリには `-r` が必要です。',
      en: '`/home/user` has an unneeded `temp.txt` and an old backup `backup_old/` (with files inside). Delete both. A directory needs `-r`.',
    },
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
        instruction: {
          ja: 'まず `rm temp.txt` で不要ファイルを削除しましょう。',
          en: 'First delete the unneeded file with `rm temp.txt`.',
        },
        hints: {
          ja: ['`rm <ファイル名>`。ファイルなら `-r` 不要です。'],
          en: ['`rm <filename>`. A file does not need `-r`.'],
        },
        check: {
          kind: 'not',
          check: { kind: 'file-exists', path: '/home/user/temp.txt' },
        },
      },
      {
        instruction: {
          ja: '次に `backup_old/` ディレクトリを削除します。中身があるので `-r` (recursive) が必須です。',
          en: 'Next delete the `backup_old/` directory. Since it has contents, `-r` (recursive) is required.',
        },
        hints: {
          ja: [
            '`rm -r backup_old` で中身ごと削除できます。',
            '`-r` なしだと `rm: cannot remove ...: Is a directory` エラーになります。',
          ],
          en: [
            '`rm -r backup_old` deletes it along with its contents.',
            'Without `-r` you get the error `rm: cannot remove ...: Is a directory`.',
          ],
        },
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
  },
  {
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
          ja: [
            '`grep <パターン> <ファイル名>` の順で書きます。',
            '`grep ERROR access.log` と入力。',
          ],
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
  },
  {
    id: 'p11',
    title: {
      ja: 'ログを行番号付き・大小区別なしで検索する',
      en: 'Search a log with line numbers and case-insensitively',
    },
    description: {
      ja: 'ログには大文字 `ERROR` と小文字 `error` が混在しています。`grep` のフラグを使って、(1) 行番号付きで `INFO` を探し、(2) 大小区別なしで `error` をすべて拾ってみましょう。',
      en: 'The log mixes uppercase `ERROR` and lowercase `error`. Using grep flags, (1) find `INFO` with line numbers, then (2) catch every `error` ignoring case.',
    },
    difficulty: 'medium',
    tags: ['grep', '-i', '-n'],
    initialFs: initialFsWithAccessLog(),
    steps: [
      {
        instruction: {
          ja: '`grep -n INFO access.log` で `INFO` の行を行番号付きで表示してください。',
          en: 'Show `INFO` lines with line numbers using `grep -n INFO access.log`.',
        },
        hints: {
          ja: [
            '`-n` / `--line-number` で各行の前に行番号が付きます。',
            '`grep -n INFO access.log` と入力。',
          ],
          en: [
            '`-n` / `--line-number` adds a line number before each line.',
            'Type `grep -n INFO access.log`.',
          ],
        },
        check: {
          kind: 'and',
          checks: [
            { kind: 'command-name', name: 'grep' },
            { kind: 'command-matches', pattern: '(?:-n\\b|-\\w*n\\w*|--line-number\\b)' },
            { kind: 'command-matches', pattern: '\\bINFO\\b' },
            { kind: 'command-matches', pattern: '(?:\\S*/)?access\\.log\\b' },
          ],
        },
      },
      {
        instruction: {
          ja: '次に `grep -i error access.log` で、大小区別なしに `error` を検索してください (大文字 ERROR と小文字 error の両方が出ます)。',
          en: 'Next search for `error` ignoring case with `grep -i error access.log` (both uppercase ERROR and lowercase error appear).',
        },
        hints: {
          ja: [
            '`-i` / `--ignore-case` で大文字小文字を区別しなくなります。',
            '`grep -i error access.log` と入力。',
          ],
          en: [
            '`-i` / `--ignore-case` makes it stop distinguishing case.',
            'Type `grep -i error access.log`.',
          ],
        },
        check: {
          kind: 'and',
          checks: [
            { kind: 'command-name', name: 'grep' },
            { kind: 'command-matches', pattern: '(?:-i\\b|-\\w*i\\w*|--ignore-case\\b)' },
            { kind: 'command-matches', pattern: '\\berror\\b' },
            { kind: 'command-matches', pattern: '(?:\\S*/)?access\\.log\\b' },
          ],
        },
      },
    ],
  },
  {
    id: 'p12',
    title: {
      ja: '長いログの先頭と末尾だけ確認する',
      en: 'Check just the top and bottom of a long log',
    },
    description: {
      ja: '`server.log` は 20 行あります。全部表示すると長いので、`head` で先頭 5 行、`tail` で末尾 5 行だけを確認してください。',
      en: '`server.log` has 20 lines. Showing it all is long, so check just the first 5 with `head` and the last 5 with `tail`.',
    },
    difficulty: 'medium',
    tags: ['head', 'tail'],
    initialFs: dir('/', {
      home: dir('home', {
        user: dir('user', {
          'README.txt': file('README.txt', 'server.log は 20 行あります。\n'),
          'server.log': file('server.log', SERVER_LOG),
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
          ja: 'まず `head -n 5 server.log` で先頭 5 行 (line01〜line05) を表示してください。',
          en: 'First show the first 5 lines (line01–line05) with `head -n 5 server.log`.',
        },
        hints: {
          ja: [
            '`-n 5` で行数指定。`-5` や `--lines=5` でも OK。',
            '`head -n 5 server.log` と入力。',
          ],
          en: [
            '`-n 5` sets the count. `-5` or `--lines=5` also work.',
            'Type `head -n 5 server.log`.',
          ],
        },
        check: {
          kind: 'and',
          checks: [
            { kind: 'command-name', name: 'head' },
            { kind: 'command-matches', pattern: '(?:-n\\s*5|-n5|--lines=5|-5)\\b' },
            { kind: 'command-matches', pattern: '(?:\\S*/)?server\\.log\\b' },
          ],
        },
      },
      {
        instruction: {
          ja: '次に `tail -n 5 server.log` で末尾 5 行 (line16〜line20) を表示してください。',
          en: 'Next show the last 5 lines (line16–line20) with `tail -n 5 server.log`.',
        },
        hints: {
          ja: ['`tail -n 5 server.log` と入力。`-5` や `--lines=5` でも OK。'],
          en: ['Type `tail -n 5 server.log`. `-5` or `--lines=5` also work.'],
        },
        check: {
          kind: 'and',
          checks: [
            { kind: 'command-name', name: 'tail' },
            { kind: 'command-matches', pattern: '(?:-n\\s*5|-n5|--lines=5|-5)\\b' },
            { kind: 'command-matches', pattern: '(?:\\S*/)?server\\.log\\b' },
          ],
        },
      },
    ],
  },
  {
    id: 'p13',
    title: { ja: 'vi でメモを書いて保存する', en: 'Write and save a memo with vi' },
    description: {
      ja: 'エディタ `vi` で新しいファイルを作り、内容を書いて保存します。NORMAL / INSERT / COMMAND の 3 モードを思い出しながら操作しましょう。',
      en: 'Create a new file in the `vi` editor, write content, and save. Operate while recalling the three modes: NORMAL / INSERT / COMMAND.',
    },
    difficulty: 'medium',
    tags: ['vi'],
    steps: [
      {
        instruction: {
          ja: '`vi tasks.txt` で新しいファイルをエディタで開きましょう。起動直後は NORMAL モードです。',
          en: 'Open a new file in the editor with `vi tasks.txt`. Right after launch you are in NORMAL mode.',
        },
        hints: {
          ja: [
            '`vi <ファイル名>` でエディタが開きます。存在しないファイルは新規作成扱いです。',
            '`vi tasks.txt` と入力して Enter。エディタ画面に切り替わったら次のステップへ。',
          ],
          en: [
            '`vi <filename>` opens the editor. A non-existent file is treated as new.',
            'Type `vi tasks.txt` and press Enter. Once the editor screen appears, move to the next step.',
          ],
        },
        check: { kind: 'command-name', name: 'vi' },
      },
      {
        instruction: {
          ja: '`i` で INSERT モードに入り `Buy milk` と書き、`Esc` で NORMAL に戻ってから `:wq` Enter で保存・終了してください。',
          en: 'Press `i` to enter INSERT mode and type `Buy milk`, press `Esc` to return to NORMAL, then `:wq` Enter to save and quit.',
        },
        hints: {
          ja: [
            'NORMAL で `i` を押すと入力できる状態 (-- INSERT --) になります。',
            '書けたら `Esc` → `:wq` Enter で保存して終了。間違えたら `:q!` で破棄して `vi tasks.txt` からやり直し。',
          ],
          en: [
            'In NORMAL, pressing `i` puts you in an editable state (-- INSERT --).',
            'When done, `Esc` → `:wq` Enter to save and quit. If you slip up, `:q!` discards; start again from `vi tasks.txt`.',
          ],
        },
        check: {
          kind: 'and',
          checks: [
            { kind: 'file-exists', path: '/home/user/tasks.txt' },
            { kind: 'file-contains', path: '/home/user/tasks.txt', text: 'Buy milk' },
          ],
        },
      },
    ],
  },
  {
    id: 'p14',
    title: { ja: 'ワイルドカードでまとめて表示する', en: 'Display files together with a wildcard' },
    description: {
      ja: 'ホームに `a.txt` `b.txt` `c.txt` の 3 つのメモがあります。1 つずつ `cat` するのではなく、ワイルドカード `*` を使って `.txt` ファイルをまとめて表示してください。',
      en: 'Home has three memos: `a.txt` `b.txt` `c.txt`. Instead of `cat`-ing them one by one, use the `*` wildcard to display the `.txt` files all together.',
    },
    difficulty: 'medium',
    tags: ['cat', '*'],
    initialFs: dir('/', {
      home: dir('home', {
        user: dir('user', {
          'a.txt': file('a.txt', 'apple\n'),
          'b.txt': file('b.txt', 'banana\n'),
          'c.txt': file('c.txt', 'cherry\n'),
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
          ja: '`cat *.txt` で `.txt` で終わる全ファイル (a.txt, b.txt, c.txt) をまとめて表示しましょう。',
          en: 'Display all files ending in `.txt` (a.txt, b.txt, c.txt) at once with `cat *.txt`.',
        },
        hints: {
          ja: [
            '`*` は「任意の文字列」に展開されます。`*.txt` で「.txt で終わる全ファイル」を指せます。',
            '`cat *.txt` と入力。3 ファイルの中身が続けて出ます。',
          ],
          en: [
            '`*` expands to "any string". `*.txt` points to "every file ending in .txt".',
            "Type `cat *.txt`. The three files' contents print in sequence.",
          ],
        },
        check: {
          kind: 'and',
          checks: [
            { kind: 'command-name', name: 'cat' },
            { kind: 'command-matches', pattern: '\\*\\.txt\\b' },
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
