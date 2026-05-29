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

/** ホーム直下に指定の children を置いた FS を作る (etc/tmp/usr も用意)。 */
function homeFs(children: Record<string, VfsDirectory | VfsFile>): VfsDirectory {
  return dir('/', {
    home: dir('home', { user: dir('user', children) }),
    tmp: dir('tmp'),
    etc: dir('etc'),
    usr: dir('usr'),
  })
}

/**
 * 第8章: ワイルドカードを使いこなす
 *
 * グロブ (`*` / `?` / `[...]`) を体系的に練習する。
 * シェルは末尾セグメントのグロブを展開し、文字クラスは範囲 (`[0-9]`) と
 * 否定 (`[!...]`) に対応する。サブディレクトリ prefix (`docs/*.md`) も可。
 * マッチが無ければリテラルのまま (nullglob off)。
 */
export const CHAPTER_8: Chapter = {
  id: '8',
  title: { ja: 'ワイルドカードを使いこなす', en: 'Mastering wildcards' },
  description: {
    ja: '`*` / `?` / `[...]` のグロブ (ワイルドカード) を体系的に練習します。複数のファイルをまとめて指定・操作できるようになります。',
    en: 'Practice the `*` / `?` / `[...]` glob (wildcard) patterns systematically. You will be able to target and act on many files at once.',
  },
  lessons: [
    {
      id: '8-1',
      chapterId: '8',
      title: { ja: '`*` の基本', en: '`*` basics' },
      description: {
        ja: '`*` は「任意の長さの文字列」に展開されるワイルドカードです。`*.txt` と書くと「`.txt` で終わる全ファイル」を指せます。',
        en: '`*` is a wildcard that expands to "a string of any length". `*.txt` targets "every file ending in `.txt`".',
      },
      initialFs: homeFs({
        'a.txt': file('a.txt', 'alpha\n'),
        'b.txt': file('b.txt', 'bravo\n'),
        'notes.md': file('notes.md', '# notes\n'),
        'README.txt': file('README.txt', 'readme\n'),
        docs: dir('docs'),
      }),
      steps: [
        {
          instruction: {
            ja: 'まず `ls *.txt` で `.txt` ファイルだけを一覧してみましょう (notes.md は出ません)。',
            en: 'First, list only the `.txt` files with `ls *.txt` (notes.md will not appear).',
          },
          hints: {
            ja: ['`*.txt` は「.txt で終わる全ファイル」に展開されます。`ls *.txt` と入力。'],
            en: ['`*.txt` expands to "every file ending in .txt". Type `ls *.txt`.'],
          },
          check: {
            kind: 'and',
            checks: [
              { kind: 'command-name', name: 'ls' },
              { kind: 'command-matches', pattern: '\\*\\.txt\\b' },
            ],
          },
        },
        {
          instruction: {
            ja: '次に `cat *.txt` で `.txt` ファイルの中身をまとめて表示しましょう。同じ `*` が cat でも使えます。',
            en: 'Next, display the contents of the `.txt` files together with `cat *.txt`. The same `*` works with cat too.',
          },
          hints: {
            ja: ['`cat *.txt` と入力。複数ファイルの中身が続けて出ます。'],
            en: ["Type `cat *.txt`. The files' contents print one after another."],
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
    {
      id: '8-2',
      chapterId: '8',
      title: { ja: '`?` で 1 文字', en: '`?` for a single character' },
      description: {
        ja: '`?` は「任意の 1 文字」にマッチします。`file?.txt` は `file1.txt` や `file2.txt` には当たりますが、`file10.txt` (2 文字) には当たりません。',
        en: '`?` matches "any single character". `file?.txt` matches `file1.txt` and `file2.txt`, but not `file10.txt` (two characters).',
      },
      initialFs: homeFs({
        'file1.txt': file('file1.txt', 'one\n'),
        'file2.txt': file('file2.txt', 'two\n'),
        'file10.txt': file('file10.txt', 'ten\n'),
        docs: dir('docs'),
      }),
      steps: [
        {
          instruction: {
            ja: '`cat file?.txt` を実行しましょう。`file1.txt` と `file2.txt` だけが対象になり、`file10.txt` は除かれます。',
            en: 'Run `cat file?.txt`. Only `file1.txt` and `file2.txt` are targeted; `file10.txt` is excluded.',
          },
          hints: {
            ja: ['`?` は 1 文字だけ。だから `file10.txt` (1 と 0 の 2 文字) は当たりません。'],
            en: [
              '`?` is exactly one character, so `file10.txt` (two chars, 1 and 0) does not match.',
            ],
          },
          check: {
            kind: 'and',
            checks: [
              { kind: 'command-name', name: 'cat' },
              { kind: 'command-matches', pattern: 'file\\?\\.txt\\b' },
            ],
          },
        },
      ],
    },
    {
      id: '8-3',
      chapterId: '8',
      title: { ja: '文字クラス `[...]` と範囲', en: 'Character classes `[...]` and ranges' },
      description: {
        ja: '`[...]` は「括弧内のいずれか 1 文字」にマッチします。`[ab]` のように列挙でき、`[0-9]` のように範囲も書けます。',
        en: '`[...]` matches "any one of the characters in the brackets". You can list them like `[ab]`, or use a range like `[0-9]`.',
      },
      initialFs: homeFs({
        'a.txt': file('a.txt', 'alpha\n'),
        'b.txt': file('b.txt', 'bravo\n'),
        'c.txt': file('c.txt', 'charlie\n'),
        'log1.txt': file('log1.txt', 'log one\n'),
        'log2.txt': file('log2.txt', 'log two\n'),
        'log3.txt': file('log3.txt', 'log three\n'),
        docs: dir('docs'),
      }),
      steps: [
        {
          instruction: {
            ja: 'まず `cat [ab]*.txt` で、先頭が `a` または `b` のファイルだけ表示しましょう (c.txt は除外)。',
            en: 'First, with `cat [ab]*.txt`, show only files starting with `a` or `b` (c.txt is excluded).',
          },
          hints: {
            ja: ['`[ab]` は「a か b のどちらか 1 文字」。`cat [ab]*.txt` と入力。'],
            en: ['`[ab]` is "either a or b, one character". Type `cat [ab]*.txt`.'],
          },
          check: {
            kind: 'and',
            checks: [
              { kind: 'command-name', name: 'cat' },
              { kind: 'command-matches', pattern: '\\[ab\\]\\*\\.txt\\b' },
            ],
          },
        },
        {
          instruction: {
            ja: '次に `ls log[0-9].txt` で、`log` の後ろが 1 桁の数字のファイル (log1〜log3) を一覧しましょう。',
            en: 'Next, with `ls log[0-9].txt`, list files where `log` is followed by a single digit (log1–log3).',
          },
          hints: {
            ja: [
              '`[0-9]` は「0〜9 のいずれか 1 文字」を表す範囲指定です。`ls log[0-9].txt` と入力。',
            ],
            en: ['`[0-9]` is a range meaning "any single digit 0–9". Type `ls log[0-9].txt`.'],
          },
          check: {
            kind: 'and',
            checks: [
              { kind: 'command-name', name: 'ls' },
              { kind: 'command-matches', pattern: 'log\\[0-9\\]\\.txt\\b' },
            ],
          },
        },
      ],
    },
    {
      id: '8-4',
      chapterId: '8',
      title: { ja: '否定 `[!...]` とサブディレクトリ', en: 'Negation `[!...]` and subdirectories' },
      description: {
        ja: '`[!...]` は「括弧内のどれでもない 1 文字」にマッチします (否定)。また `docs/*.md` のように、別ディレクトリの中のファイルもグロブで指定できます。',
        en: '`[!...]` matches "any one character except those in the brackets" (negation). Globs can also target files inside another directory, like `docs/*.md`.',
      },
      initialFs: homeFs({
        'apple.txt': file('apple.txt', 'apple\n'),
        'banana.txt': file('banana.txt', 'banana\n'),
        'cherry.txt': file('cherry.txt', 'cherry\n'),
        docs: dir('docs', {
          'intro.md': file('intro.md', '# intro\nTODO: write more\n'),
          'guide.md': file('guide.md', '# guide\nTODO: add examples\n'),
        }),
      }),
      steps: [
        {
          instruction: {
            ja: 'まず `ls [!a]*.txt` で、先頭が `a` でないファイルを一覧しましょう (apple.txt は除外され banana.txt / cherry.txt が残ります)。',
            en: 'First, with `ls [!a]*.txt`, list files that do not start with `a` (apple.txt is excluded; banana.txt / cherry.txt remain).',
          },
          hints: {
            ja: [
              '`[!a]` は「a 以外の 1 文字」。先頭に `!` を付けると否定になります。`ls [!a]*.txt` と入力。',
            ],
            en: [
              '`[!a]` is "one character other than a". A leading `!` negates the class. Type `ls [!a]*.txt`.',
            ],
          },
          check: {
            kind: 'and',
            checks: [
              { kind: 'command-name', name: 'ls' },
              { kind: 'command-matches', pattern: '\\[!a\\]\\*\\.txt\\b' },
            ],
          },
        },
        {
          instruction: {
            ja: '次に `cat docs/*.md` で、`docs` ディレクトリの中の `.md` ファイルをまとめて読みましょう。',
            en: 'Next, with `cat docs/*.md`, read the `.md` files inside the `docs` directory all together.',
          },
          hints: {
            ja: ['ディレクトリ名を付けて `docs/*.md` と書けば、その配下のファイルに展開されます。'],
            en: ['Prefix with the directory name: `docs/*.md` expands to the files under it.'],
          },
          check: {
            kind: 'and',
            checks: [
              { kind: 'command-name', name: 'cat' },
              { kind: 'command-matches', pattern: 'docs/\\*\\.md\\b' },
            ],
          },
        },
      ],
    },
    {
      id: '8-5',
      chapterId: '8',
      title: { ja: 'グロブで操作する (実践)', en: 'Operate with globs (practice)' },
      description: {
        ja: 'グロブは表示だけでなく、移動や削除にも使えます。散らかったホームを、`mv` と `rm` をグロブで一気に片付けてみましょう。',
        en: 'Globs are not just for viewing; they work with moving and deleting too. Tidy a cluttered home in one sweep using `mv` and `rm` with globs.',
      },
      initialFs: homeFs({
        'access.log': file('access.log', 'INFO ok\n'),
        'app.log': file('app.log', 'INFO started\n'),
        'temp1.tmp': file('temp1.tmp', 'junk\n'),
        'temp2.tmp': file('temp2.tmp', 'junk\n'),
        'keep.txt': file('keep.txt', 'important\n'),
      }),
      steps: [
        {
          instruction: {
            ja: 'まず `mkdir logs` でログの置き場所を作りましょう。',
            en: 'First, make a place for logs with `mkdir logs`.',
          },
          hints: {
            ja: ['`mkdir logs` と入力。'],
            en: ['Type `mkdir logs`.'],
          },
          check: { kind: 'file-exists', path: '/home/user/logs' },
        },
        {
          instruction: {
            ja: '`mv *.log logs/` で `.log` ファイルをまとめて `logs/` に移動しましょう。`access.log` と `app.log` が移動します。',
            en: 'Move the `.log` files into `logs/` all at once with `mv *.log logs/`. Both `access.log` and `app.log` move.',
          },
          hints: {
            ja: [
              '`*.log` が 2 つのログに展開され、まとめて移動されます。`mv *.log logs/` と入力。',
            ],
            en: ['`*.log` expands to the two logs and they move together. Type `mv *.log logs/`.'],
          },
          check: {
            kind: 'and',
            checks: [
              { kind: 'file-exists', path: '/home/user/logs/access.log' },
              { kind: 'file-exists', path: '/home/user/logs/app.log' },
              { kind: 'not', check: { kind: 'file-exists', path: '/home/user/access.log' } },
            ],
          },
        },
        {
          instruction: {
            ja: '最後に `rm *.tmp` で一時ファイルをまとめて削除しましょう。`keep.txt` は残ります。',
            en: 'Finally, delete the temp files all at once with `rm *.tmp`. `keep.txt` stays.',
          },
          hints: {
            ja: ['`*.tmp` は temp1.tmp と temp2.tmp に展開されます。`rm *.tmp` と入力。'],
            en: ['`*.tmp` expands to temp1.tmp and temp2.tmp. Type `rm *.tmp`.'],
          },
          check: {
            kind: 'and',
            checks: [
              { kind: 'not', check: { kind: 'file-exists', path: '/home/user/temp1.tmp' } },
              { kind: 'not', check: { kind: 'file-exists', path: '/home/user/temp2.tmp' } },
              { kind: 'file-exists', path: '/home/user/keep.txt' },
            ],
          },
        },
      ],
    },
  ],
}
