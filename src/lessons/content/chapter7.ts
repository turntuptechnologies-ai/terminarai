import {
  DEFAULT_DIR_MODE,
  DEFAULT_FILE_MODE,
  type VfsDirectory,
  type VfsFile,
} from '../../vfs/types'
import type { Chapter } from '../types'

const NOW = Date.now()

function dir(name: string, children: Record<string, VfsDirectory | VfsFile> = {}): VfsDirectory {
  return { type: 'directory', name, mtime: NOW, mode: DEFAULT_DIR_MODE, children }
}

function file(name: string, content: string): VfsFile {
  return { type: 'file', name, mtime: NOW, mode: DEFAULT_FILE_MODE, content }
}

/**
 * 第7章用サンプルログ。INFO / ERROR / WARN を混在させて
 * grep / grep -i / grep -v の効果が明確に分かるよう設計。
 *
 * `error` の小文字バリアントも含めて `-i` の効果を学べるようにする。
 */
const ACCESS_LOG = `INFO 2026-05-27 user login
ERROR 2026-05-27 disk full
INFO 2026-05-27 user logout
WARN 2026-05-27 slow query
error 2026-05-27 timeout
INFO 2026-05-27 user login
`

function initialFsWithLog(): VfsDirectory {
  return dir('/', {
    home: dir('home', {
      user: dir('user', {
        'README.txt': file(
          'README.txt',
          'terminarai へようこそ！\n\n第7章では grep でログを検索します。\n',
        ),
        'access.log': file('access.log', ACCESS_LOG),
        docs: dir('docs'),
      }),
    }),
    tmp: dir('tmp'),
    etc: dir('etc'),
    usr: dir('usr'),
  })
}

const APP_LOG = `INFO app started
ERROR config missing
INFO app ready
`

/** 7-5 用: 複数の .log ファイルを置いてワイルドカード検索を体験させる。 */
function initialFsWithMultipleLogs(): VfsDirectory {
  return dir('/', {
    home: dir('home', {
      user: dir('user', {
        'README.txt': file('README.txt', 'logs are in *.log\n'),
        'access.log': file('access.log', ACCESS_LOG),
        'app.log': file('app.log', APP_LOG),
        docs: dir('docs'),
      }),
    }),
    tmp: dir('tmp'),
    etc: dir('etc'),
    usr: dir('usr'),
  })
}

/**
 * 第7章: テキストを検索する
 *
 * `grep` でログから必要な行だけ取り出す方法を学ぶ。
 * 大小区別 (`-i`)、行番号 (`-n`)、除外 (`-v`) の 3 フラグを段階的に体験する。
 */
export const CHAPTER_7: Chapter = {
  id: '7',
  title: { ja: 'テキストを検索する', en: 'Search text' },
  description: {
    ja: '`grep` でファイルから特定の文字列やパターンを含む行を絞り込みます。ログを読むときの定番ワザです。',
    en: 'Use `grep` to filter lines from a file that contain a specific string or pattern. A classic trick for reading logs.',
  },
  lessons: [
    {
      id: '7-1',
      chapterId: '7',
      title: { ja: '行を絞り込む (grep)', en: 'Filter lines (grep)' },
      description: {
        ja: '`grep <パターン> <ファイル>` で、パターンを含む行だけが表示されます。まずは単純な文字列で試します。',
        en: '`grep <pattern> <file>` shows only the lines that contain the pattern. Let us start with a plain string.',
      },
      initialFs: initialFsWithLog(),
      steps: [
        {
          instruction: {
            ja: '`grep ERROR access.log` で `ERROR` を含む行だけを表示してみましょう。',
            en: 'Use `grep ERROR access.log` to show only the lines containing `ERROR`.',
          },
          hints: {
            ja: [
              '`grep <パターン> <ファイル名>` の順で書きます。',
              '`grep ERROR access.log` と入力。',
            ],
            en: [
              'Write it in order: `grep <pattern> <filename>`.',
              'Type `grep ERROR access.log`.',
            ],
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
      id: '7-2',
      chapterId: '7',
      title: { ja: '大文字小文字を区別しない (-i)', en: 'Ignore case (-i)' },
      description: {
        ja: 'デフォルトの `grep` は **大文字小文字を区別** します。`-i` (または `--ignore-case`) を付けると区別なしになります。\n\nサンプルログには大文字 `ERROR` と小文字 `error` が混在しています。両方を拾ってみましょう。',
        en: 'By default `grep` is **case-sensitive**. Add `-i` (or `--ignore-case`) to make it case-insensitive.\n\nThe sample log mixes uppercase `ERROR` and lowercase `error`. Let us catch both.',
      },
      initialFs: initialFsWithLog(),
      steps: [
        {
          instruction: {
            ja: '`grep -i error access.log` で、大文字小文字を区別せずに `error` を検索してみましょう。',
            en: 'Use `grep -i error access.log` to search for `error` ignoring case.',
          },
          hints: {
            ja: [
              '`-i` / `--ignore-case` で case-insensitive。',
              '`grep -i error access.log` と入力。`grep --ignore-case error access.log` でも OK。',
            ],
            en: [
              '`-i` / `--ignore-case` makes it case-insensitive.',
              'Type `grep -i error access.log`. `grep --ignore-case error access.log` also works.',
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
      id: '7-3',
      chapterId: '7',
      title: { ja: '行番号付きで表示する (-n)', en: 'Show line numbers (-n)' },
      description: {
        ja: '`-n` (または `--line-number`) を付けると、各マッチ行の前に行番号が出ます。「ログのどこにあるか」を伝えるときに便利です。',
        en: 'Add `-n` (or `--line-number`) and a line number appears before each matching line. Handy for telling someone "where in the log" it is.',
      },
      initialFs: initialFsWithLog(),
      steps: [
        {
          instruction: {
            ja: '`grep -n INFO access.log` で `INFO` を含む行を、行番号付きで表示しましょう。',
            en: 'Use `grep -n INFO access.log` to show lines containing `INFO`, with line numbers.',
          },
          hints: {
            ja: [
              '`-n` / `--line-number` で行番号付き。',
              '`grep -n INFO access.log` と入力。複数フラグなら `-in` のようにまとめても OK。',
            ],
            en: [
              '`-n` / `--line-number` adds line numbers.',
              'Type `grep -n INFO access.log`. For multiple flags you can combine them like `-in`.',
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
      ],
    },
    {
      id: '7-4',
      chapterId: '7',
      title: { ja: '練習: 不要な行を除外する (-v)', en: 'Practice: exclude unwanted lines (-v)' },
      description: {
        ja: '`-v` (または `--invert-match`) は逆の動作で、**パターンに一致しない行** を出します。「ノイズを取り除いて見たい」ときに使います。',
        en: '`-v` (or `--invert-match`) does the opposite, printing **lines that do NOT match** the pattern. Use it when you want to strip out noise.',
      },
      initialFs: initialFsWithLog(),
      steps: [
        {
          instruction: {
            ja: '`grep -v INFO access.log` で、`INFO` を **含まない** 行だけを表示しましょう (ERROR / WARN / error が残るはず)。',
            en: 'Use `grep -v INFO access.log` to show only the lines that do **not** contain `INFO` (ERROR / WARN / error should remain).',
          },
          hints: {
            ja: [
              '`-v` / `--invert-match` で「一致しない行」を出力。',
              '`grep -v INFO access.log` と入力。',
            ],
            en: [
              '`-v` / `--invert-match` prints "non-matching lines".',
              'Type `grep -v INFO access.log`.',
            ],
          },
          check: {
            kind: 'and',
            checks: [
              { kind: 'command-name', name: 'grep' },
              { kind: 'command-matches', pattern: '(?:-v\\b|-\\w*v\\w*|--invert-match\\b)' },
              { kind: 'command-matches', pattern: '\\bINFO\\b' },
              { kind: 'command-matches', pattern: '(?:\\S*/)?access\\.log\\b' },
            ],
          },
        },
        {
          instruction: {
            ja: '応用: `-v` と `-i` を組み合わせて `grep -vi info access.log` を実行してみましょう (case-insensitive で `info` を除外)。',
            en: 'Bonus: combine `-v` and `-i` and run `grep -vi info access.log` (exclude `info` case-insensitively).',
          },
          hints: {
            ja: [
              '`-vi` のように 2 つの短フラグをまとめて指定できます。',
              '`grep -vi info access.log` と入力。',
            ],
            en: ['You can combine two short flags like `-vi`.', 'Type `grep -vi info access.log`.'],
          },
          check: {
            kind: 'and',
            checks: [
              { kind: 'command-name', name: 'grep' },
              { kind: 'command-matches', pattern: '-\\w*v\\w*' },
              { kind: 'command-matches', pattern: '-\\w*i\\w*|--ignore-case' },
              { kind: 'command-matches', pattern: '\\binfo\\b' },
              { kind: 'command-matches', pattern: '(?:\\S*/)?access\\.log\\b' },
            ],
          },
        },
      ],
    },
    {
      id: '7-5',
      chapterId: '7',
      title: {
        ja: 'ワイルドカードで複数ファイルを検索する',
        en: 'Search multiple files with a wildcard',
      },
      description: {
        ja: '`*` (ワイルドカード) はファイル名のパターンに展開されます。`*.log` と書くと「`.log` で終わる全ファイル」に展開され、複数ファイルをまとめて検索できます。\n\nこのワイルドカード展開は grep に限らず、`cat *.txt` のようにどのコマンドでも使えます。',
        en: 'The `*` (wildcard) expands to a file-name pattern. `*.log` expands to "every file ending in `.log`", letting you search several files at once.\n\nThis wildcard expansion is not limited to grep; it works with any command, like `cat *.txt`.',
      },
      initialFs: initialFsWithMultipleLogs(),
      steps: [
        {
          instruction: {
            ja: 'いま `access.log` と `app.log` の 2 つのログがあります。`grep ERROR *.log` で両方からまとめて `ERROR` 行を検索してみましょう。',
            en: 'You now have two logs, `access.log` and `app.log`. Use `grep ERROR *.log` to search both for `ERROR` lines at once.',
          },
          hints: {
            ja: [
              '`*.log` は「.log で終わる全ファイル」に展開されます (access.log と app.log)。',
              '`grep ERROR *.log` と入力。出力には `ファイル名:行` の形で、どのファイルの行かが付きます。',
            ],
            en: [
              '`*.log` expands to "every file ending in .log" (access.log and app.log).',
              'Type `grep ERROR *.log`. The output prefixes each line with `filename:` to show which file it came from.',
            ],
          },
          check: {
            kind: 'and',
            checks: [
              { kind: 'command-name', name: 'grep' },
              { kind: 'command-matches', pattern: '\\bERROR\\b' },
              // ワイルドカードを使ったことを担保 (*.log)
              { kind: 'command-matches', pattern: '\\*\\.log\\b' },
            ],
          },
        },
      ],
    },
  ],
}
