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

/**
 * 第7章: テキストを検索する
 *
 * `grep` でログから必要な行だけ取り出す方法を学ぶ。
 * 大小区別 (`-i`)、行番号 (`-n`)、除外 (`-v`) の 3 フラグを段階的に体験する。
 */
export const CHAPTER_7: Chapter = {
  id: '7',
  title: 'テキストを検索する',
  description:
    '`grep` でファイルから特定の文字列やパターンを含む行を絞り込みます。ログを読むときの定番ワザです。',
  lessons: [
    {
      id: '7-1',
      chapterId: '7',
      title: '行を絞り込む (grep)',
      description:
        '`grep <パターン> <ファイル>` で、パターンを含む行だけが表示されます。まずは単純な文字列で試します。',
      initialFs: initialFsWithLog(),
      steps: [
        {
          instruction: '`grep ERROR access.log` で `ERROR` を含む行だけを表示してみましょう。',
          hints: [
            '`grep <パターン> <ファイル名>` の順で書きます。',
            '`grep ERROR access.log` と入力。',
          ],
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
      title: '大文字小文字を区別しない (-i)',
      description:
        'デフォルトの `grep` は **大文字小文字を区別** します。`-i` (または `--ignore-case`) を付けると区別なしになります。\n\nサンプルログには大文字 `ERROR` と小文字 `error` が混在しています。両方を拾ってみましょう。',
      initialFs: initialFsWithLog(),
      steps: [
        {
          instruction:
            '`grep -i error access.log` で、大文字小文字を区別せずに `error` を検索してみましょう。',
          hints: [
            '`-i` / `--ignore-case` で case-insensitive。',
            '`grep -i error access.log` と入力。`grep --ignore-case error access.log` でも OK。',
          ],
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
      title: '行番号付きで表示する (-n)',
      description:
        '`-n` (または `--line-number`) を付けると、各マッチ行の前に行番号が出ます。「ログのどこにあるか」を伝えるときに便利です。',
      initialFs: initialFsWithLog(),
      steps: [
        {
          instruction:
            '`grep -n INFO access.log` で `INFO` を含む行を、行番号付きで表示しましょう。',
          hints: [
            '`-n` / `--line-number` で行番号付き。',
            '`grep -n INFO access.log` と入力。複数フラグなら `-in` のようにまとめても OK。',
          ],
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
      title: '練習: 不要な行を除外する (-v)',
      description:
        '`-v` (または `--invert-match`) は逆の動作で、**パターンに一致しない行** を出します。「ノイズを取り除いて見たい」ときに使います。',
      initialFs: initialFsWithLog(),
      steps: [
        {
          instruction:
            '`grep -v INFO access.log` で、`INFO` を **含まない** 行だけを表示しましょう (ERROR / WARN / error が残るはず)。',
          hints: [
            '`-v` / `--invert-match` で「一致しない行」を出力。',
            '`grep -v INFO access.log` と入力。',
          ],
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
          instruction:
            '応用: `-v` と `-i` を組み合わせて `grep -vi info access.log` を実行してみましょう (case-insensitive で `info` を除外)。',
          hints: [
            '`-vi` のように 2 つの短フラグをまとめて指定できます。',
            '`grep -vi info access.log` と入力。',
          ],
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
  ],
}
