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

/** 15 行の番号付きログ。head / tail の 10 行デフォルトと差が出るよう 15 行に。 */
const LOG_15 = `${Array.from({ length: 15 }, (_, i) => `line${String(i + 1).padStart(2, '0')}`).join('\n')}\n`

/**
 * 第6章共通の初期 FS。ホーム直下に `log.txt` (15 行) を置く。
 * デフォルト FS をベースに log.txt を追加した形 (README.txt / hello.txt / docs/ も維持)。
 */
function initialFsWithLog(): VfsDirectory {
  return dir('/', {
    home: dir('home', {
      user: dir('user', {
        'README.txt': file(
          'README.txt',
          'terminarai へようこそ！\n\n第6章では head / tail を使ってログの一部を見ます。\n',
        ),
        'log.txt': file('log.txt', LOG_15),
        docs: dir('docs'),
      }),
    }),
    tmp: dir('tmp'),
    etc: dir('etc'),
    usr: dir('usr'),
  })
}

/**
 * 第6章: ファイルの一部だけ見る
 *
 * 大きいファイルから先頭・末尾だけ取り出す head / tail を学ぶ。
 * 全レッスンで 15 行の `log.txt` を持つ共通 initialFs を使い、
 * デフォルト 10 行表示時の差分を体感できるようにする。
 */
export const CHAPTER_6: Chapter = {
  id: '6',
  title: 'ファイルの一部だけ見る',
  description:
    '`head` と `tail` でファイルの先頭・末尾だけを取り出して見ます。長いログを眺めるときの定番ワザです。',
  lessons: [
    {
      id: '6-1',
      chapterId: '6',
      title: '先頭から覗く (head)',
      description:
        '`head <ファイル>` でファイルの**先頭 10 行**を表示できます。長いログの「最初の方」だけ見たいときに便利です。',
      initialFs: initialFsWithLog(),
      steps: [
        {
          instruction:
            '`head log.txt` で `log.txt` の先頭 10 行を見てみましょう。15 行のうち最初の 10 行 (line01〜line10) が出ます。',
          hints: ['`head <ファイル名>` で先頭 10 行が表示されます。', '`head log.txt` と入力。'],
          check: {
            kind: 'and',
            checks: [
              { kind: 'command-name', name: 'head' },
              { kind: 'command-matches', pattern: '(?:\\S*/)?log\\.txt\\b' },
            ],
          },
        },
      ],
    },
    {
      id: '6-2',
      chapterId: '6',
      title: '末尾から覗く (tail)',
      description:
        '`tail <ファイル>` は逆に**末尾 10 行**を表示します。新しく追加されたログをチェックするときの定番です。',
      initialFs: initialFsWithLog(),
      steps: [
        {
          instruction: '`tail log.txt` で末尾 10 行 (line06〜line15) を見てみましょう。',
          hints: ['`tail <ファイル名>` で末尾 10 行。', '`tail log.txt` と入力。'],
          check: {
            kind: 'and',
            checks: [
              { kind: 'command-name', name: 'tail' },
              { kind: 'command-matches', pattern: '(?:\\S*/)?log\\.txt\\b' },
            ],
          },
        },
      ],
    },
    {
      id: '6-3',
      chapterId: '6',
      title: '行数を指定する (-n)',
      description:
        '`-n N` (または `-N` の短縮形) で表示行数を変えられます。`head -n 3` なら先頭 3 行、`tail -n 3` なら末尾 3 行。',
      initialFs: initialFsWithLog(),
      steps: [
        {
          instruction: '`head -n 3 log.txt` で **先頭 3 行** (line01〜line03) を見てみましょう。',
          hints: [
            '`-n 3` で行数指定。空白あり/なし、`--lines=3`、`-3` の短縮形どれでも OK。',
            '`head -n 3 log.txt` と入力。',
          ],
          check: {
            kind: 'and',
            checks: [
              { kind: 'command-name', name: 'head' },
              {
                kind: 'command-matches',
                pattern: '(?:-n\\s*3|-n3|--lines=3|-3)\\b',
              },
              { kind: 'command-matches', pattern: '(?:\\S*/)?log\\.txt\\b' },
            ],
          },
        },
        {
          instruction:
            '次に `tail -n 3 log.txt` で **末尾 3 行** (line13〜line15) も見てみましょう。',
          hints: ['`tail -n 3 log.txt` と入力。'],
          check: {
            kind: 'and',
            checks: [
              { kind: 'command-name', name: 'tail' },
              {
                kind: 'command-matches',
                pattern: '(?:-n\\s*3|-n3|--lines=3|-3)\\b',
              },
              { kind: 'command-matches', pattern: '(?:\\S*/)?log\\.txt\\b' },
            ],
          },
        },
      ],
    },
    {
      id: '6-4',
      chapterId: '6',
      title: '練習: 先頭と末尾だけサッと確認する',
      description:
        '長いログを「最初の数行」と「最後の数行」だけ眺めるパターンを練習します。先頭 5 行と末尾 5 行を立て続けに確認しましょう。',
      initialFs: initialFsWithLog(),
      steps: [
        {
          instruction: 'まず `head -n 5 log.txt` で先頭 5 行を表示してください。',
          hints: ['`head -n 5 log.txt` と入力。`-5` や `--lines=5` でも OK。'],
          check: {
            kind: 'and',
            checks: [
              { kind: 'command-name', name: 'head' },
              {
                kind: 'command-matches',
                pattern: '(?:-n\\s*5|-n5|--lines=5|-5)\\b',
              },
              { kind: 'command-matches', pattern: '(?:\\S*/)?log\\.txt\\b' },
            ],
          },
        },
        {
          instruction: '次に `tail -n 5 log.txt` で末尾 5 行を表示してください。',
          hints: ['`tail -n 5 log.txt` と入力。'],
          check: {
            kind: 'and',
            checks: [
              { kind: 'command-name', name: 'tail' },
              {
                kind: 'command-matches',
                pattern: '(?:-n\\s*5|-n5|--lines=5|-5)\\b',
              },
              { kind: 'command-matches', pattern: '(?:\\S*/)?log\\.txt\\b' },
            ],
          },
        },
      ],
    },
  ],
}
