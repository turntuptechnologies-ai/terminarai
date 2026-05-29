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
  title: { ja: 'ファイルの一部だけ見る', en: 'View just part of a file' },
  description: {
    ja: '`head` と `tail` でファイルの先頭・末尾だけを取り出して見ます。長いログを眺めるときの定番ワザです。',
    en: 'Use `head` and `tail` to view just the beginning or end of a file. A classic trick for skimming long logs.',
  },
  lessons: [
    {
      id: '6-1',
      chapterId: '6',
      title: { ja: '先頭から覗く (head)', en: 'Peek from the top (head)' },
      description: {
        ja: '`head <ファイル>` でファイルの**先頭 10 行**を表示できます。長いログの「最初の方」だけ見たいときに便利です。',
        en: '`head <file>` shows the **first 10 lines** of a file. Handy when you only want the "beginning" of a long log.',
      },
      initialFs: initialFsWithLog(),
      steps: [
        {
          instruction: {
            ja: '`head log.txt` で `log.txt` の先頭 10 行を見てみましょう。15 行のうち最初の 10 行 (line01〜line10) が出ます。',
            en: 'Use `head log.txt` to view the first 10 lines of `log.txt`. Of the 15 lines, the first 10 (line01–line10) appear.',
          },
          hints: {
            ja: ['`head <ファイル名>` で先頭 10 行が表示されます。', '`head log.txt` と入力。'],
            en: ['`head <filename>` shows the first 10 lines.', 'Type `head log.txt`.'],
          },
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
      title: { ja: '末尾から覗く (tail)', en: 'Peek from the bottom (tail)' },
      description: {
        ja: '`tail <ファイル>` は逆に**末尾 10 行**を表示します。新しく追加されたログをチェックするときの定番です。',
        en: '`tail <file>` instead shows the **last 10 lines**. A staple for checking newly added log entries.',
      },
      initialFs: initialFsWithLog(),
      steps: [
        {
          instruction: {
            ja: '`tail log.txt` で末尾 10 行 (line06〜line15) を見てみましょう。',
            en: 'Use `tail log.txt` to view the last 10 lines (line06–line15).',
          },
          hints: {
            ja: ['`tail <ファイル名>` で末尾 10 行。', '`tail log.txt` と入力。'],
            en: ['`tail <filename>` shows the last 10 lines.', 'Type `tail log.txt`.'],
          },
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
      title: { ja: '行数を指定する (-n)', en: 'Specify the number of lines (-n)' },
      description: {
        ja: '`-n N` (または `-N` の短縮形) で表示行数を変えられます。`head -n 3` なら先頭 3 行、`tail -n 3` なら末尾 3 行。',
        en: 'Use `-n N` (or the short form `-N`) to change how many lines show. `head -n 3` shows the first 3 lines, `tail -n 3` the last 3.',
      },
      initialFs: initialFsWithLog(),
      steps: [
        {
          instruction: {
            ja: '`head -n 3 log.txt` で **先頭 3 行** (line01〜line03) を見てみましょう。',
            en: 'Use `head -n 3 log.txt` to view the **first 3 lines** (line01–line03).',
          },
          hints: {
            ja: [
              '`-n 3` で行数指定。空白あり/なし、`--lines=3`、`-3` の短縮形どれでも OK。',
              '`head -n 3 log.txt` と入力。',
            ],
            en: [
              '`-n 3` sets the line count. With or without a space, `--lines=3`, or the short `-3` all work.',
              'Type `head -n 3 log.txt`.',
            ],
          },
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
          instruction: {
            ja: '次に `tail -n 3 log.txt` で **末尾 3 行** (line13〜line15) も見てみましょう。',
            en: 'Next, use `tail -n 3 log.txt` to view the **last 3 lines** (line13–line15) too.',
          },
          hints: {
            ja: ['`tail -n 3 log.txt` と入力。'],
            en: ['Type `tail -n 3 log.txt`.'],
          },
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
      title: {
        ja: '練習: 先頭と末尾だけサッと確認する',
        en: 'Practice: quickly check just the top and bottom',
      },
      description: {
        ja: '長いログを「最初の数行」と「最後の数行」だけ眺めるパターンを練習します。先頭 5 行と末尾 5 行を立て続けに確認しましょう。',
        en: 'Practice the pattern of skimming just the "first few lines" and "last few lines" of a long log. Check the first 5 and the last 5 in a row.',
      },
      initialFs: initialFsWithLog(),
      steps: [
        {
          instruction: {
            ja: 'まず `head -n 5 log.txt` で先頭 5 行を表示してください。',
            en: 'First show the first 5 lines with `head -n 5 log.txt`.',
          },
          hints: {
            ja: ['`head -n 5 log.txt` と入力。`-5` や `--lines=5` でも OK。'],
            en: ['Type `head -n 5 log.txt`. `-5` or `--lines=5` also work.'],
          },
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
          instruction: {
            ja: '次に `tail -n 5 log.txt` で末尾 5 行を表示してください。',
            en: 'Next show the last 5 lines with `tail -n 5 log.txt`.',
          },
          hints: {
            ja: ['`tail -n 5 log.txt` と入力。'],
            en: ['Type `tail -n 5 log.txt`.'],
          },
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
