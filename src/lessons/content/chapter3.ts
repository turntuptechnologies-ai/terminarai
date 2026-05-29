import type { Chapter } from '../types'

/**
 * 第3章: ファイルとディレクトリを管理する
 *
 * 第1-2章で習得した移動・閲覧の上に、自分で作る・コピーする・移動する・削除する
 * の 4 つの操作を学ぶ。mkdir / cp / mv / rm の応用 (-p, -r) も合わせて扱う。
 */
export const CHAPTER_3: Chapter = {
  id: '3',
  title: { ja: 'ファイルとディレクトリを管理する', en: 'Managing files and directories' },
  description: {
    ja: 'mkdir / cp / mv / rm を使って、ファイルとディレクトリを自分で作り、コピー・移動・削除する操作を覚えます。応用フラグ (-p, -r) も登場します。',
    en: 'Use mkdir / cp / mv / rm to create, copy, move, and delete files and directories yourself. Advanced flags (-p, -r) appear too.',
  },
  lessons: [
    {
      id: '3-1',
      chapterId: '3',
      title: { ja: 'ディレクトリを作る (mkdir)', en: 'Create a directory (mkdir)' },
      description: {
        ja: '`mkdir <名前>` で新しいディレクトリを作ります。作った後は `ls` で確かめましょう。',
        en: '`mkdir <name>` creates a new directory. After creating it, check with `ls`.',
      },
      steps: [
        {
          instruction: {
            ja: '`mkdir myfolder` で myfolder ディレクトリを作ってみましょう。',
            en: 'Use `mkdir myfolder` to create the myfolder directory.',
          },
          hints: {
            ja: ['`mkdir myfolder` と入力して Enter。`ls` で確認できます。'],
            en: ['Type `mkdir myfolder` and press Enter. You can check with `ls`.'],
          },
          check: { kind: 'file-exists', path: '/home/user/myfolder' },
        },
      ],
    },
    {
      id: '3-2',
      chapterId: '3',
      title: { ja: '深い階層を一度に作る (mkdir -p)', en: 'Create deep paths at once (mkdir -p)' },
      description: {
        ja: '`mkdir foo/bar/baz` は foo が無いと失敗します。`-p` (parents) を付けると親ディレクトリも自動で作成されます。',
        en: '`mkdir foo/bar/baz` fails if foo does not exist. With `-p` (parents), the parent directories are created automatically.',
      },
      steps: [
        {
          instruction: {
            ja: '`mkdir -p project/src/lib` で 3 階層のディレクトリを一括で作ってみましょう。',
            en: 'Use `mkdir -p project/src/lib` to create a 3-level directory path at once.',
          },
          hints: {
            ja: ['`-p` で project → src → lib が一度に作られます。'],
            en: ['With `-p`, project → src → lib are created in one go.'],
          },
          check: { kind: 'file-exists', path: '/home/user/project/src/lib' },
        },
      ],
    },
    {
      id: '3-3',
      chapterId: '3',
      title: {
        ja: 'ファイルとディレクトリをコピー (cp / cp -r)',
        en: 'Copy files and directories (cp / cp -r)',
      },
      description: {
        ja: '`cp <元> <先>` でファイルをコピー。ディレクトリをコピーする場合は `-r` (recursive) が必要です。',
        en: '`cp <src> <dst>` copies a file. To copy a directory you need `-r` (recursive).',
      },
      steps: [
        {
          instruction: {
            ja: '`cp hello.txt copy.txt` で hello.txt を copy.txt にコピーしてみましょう。',
            en: 'Use `cp hello.txt copy.txt` to copy hello.txt to copy.txt.',
          },
          hints: {
            ja: ['コピー元・コピー先の順に指定します。'],
            en: ['Give the source first, then the destination.'],
          },
          // hello.txt の中身に "terminarai" が含まれるので、cp 経由でしか満たせない
          check: { kind: 'file-contains', path: '/home/user/copy.txt', text: 'terminarai' },
        },
        {
          instruction: {
            ja: '`cp -r docs docs-copy` で docs ディレクトリを docs-copy として丸ごとコピーしてみましょう。',
            en: 'Use `cp -r docs docs-copy` to copy the whole docs directory as docs-copy.',
          },
          hints: {
            ja: ['ディレクトリのコピーは `-r` フラグが必須です。'],
            en: ['Copying a directory requires the `-r` flag.'],
          },
          check: { kind: 'file-exists', path: '/home/user/docs-copy' },
        },
      ],
    },
    {
      id: '3-4',
      chapterId: '3',
      title: { ja: '移動・リネーム (mv)', en: 'Move and rename (mv)' },
      description: {
        ja: '`mv` は「移動」と「リネーム」を兼ねます。`mv old new` で名前を変えられ、`mv file dir/` でディレクトリ配下に移動できます。',
        en: '`mv` does both "move" and "rename". `mv old new` renames, and `mv file dir/` moves a file into a directory.',
      },
      steps: [
        {
          instruction: {
            ja: '`mv hello.txt greeting.txt` で hello.txt の名前を greeting.txt に変えてみましょう。',
            en: 'Use `mv hello.txt greeting.txt` to rename hello.txt to greeting.txt.',
          },
          hints: {
            ja: ['同じ場所に違う名前を指定すればリネームになります。'],
            en: ['Giving a different name in the same place is a rename.'],
          },
          check: {
            kind: 'and',
            checks: [
              { kind: 'file-exists', path: '/home/user/greeting.txt' },
              { kind: 'not', check: { kind: 'file-exists', path: '/home/user/hello.txt' } },
            ],
          },
        },
        {
          instruction: {
            ja: '`mv greeting.txt docs/` で greeting.txt を docs ディレクトリの中へ移動してみましょう。',
            en: 'Use `mv greeting.txt docs/` to move greeting.txt into the docs directory.',
          },
          hints: {
            ja: ['移動先が既存のディレクトリの場合、その配下に入ります。'],
            en: ['When the destination is an existing directory, the file moves inside it.'],
          },
          check: {
            kind: 'and',
            checks: [
              { kind: 'file-exists', path: '/home/user/docs/greeting.txt' },
              { kind: 'not', check: { kind: 'file-exists', path: '/home/user/greeting.txt' } },
            ],
          },
        },
      ],
    },
    {
      id: '3-5',
      chapterId: '3',
      title: { ja: '削除する (rm / rm -r)', en: 'Delete things (rm / rm -r)' },
      description: {
        ja: '`rm <ファイル>` でファイル削除、ディレクトリを消すには `-r` が必須です。間違えると戻せないので慎重に。',
        en: '`rm <file>` deletes a file; deleting a directory requires `-r`. There is no undo, so be careful.',
      },
      steps: [
        {
          instruction: {
            ja: '`rm hello.txt` で hello.txt を削除してみましょう。',
            en: 'Use `rm hello.txt` to delete hello.txt.',
          },
          hints: {
            ja: ['`rm <ファイル名>` です。'],
            en: ['It is `rm <filename>`.'],
          },
          check: {
            kind: 'not',
            check: { kind: 'file-exists', path: '/home/user/hello.txt' },
          },
        },
        {
          instruction: {
            ja: '`rm -r docs` で docs ディレクトリを丸ごと削除してみましょう。`rm docs` だと失敗します。',
            en: 'Use `rm -r docs` to delete the whole docs directory. `rm docs` alone fails.',
          },
          hints: {
            ja: ['ディレクトリ削除は `-r` を付けないと拒否されます。'],
            en: ['Deleting a directory is refused unless you add `-r`.'],
          },
          check: {
            kind: 'not',
            check: { kind: 'file-exists', path: '/home/user/docs' },
          },
        },
      ],
    },
  ],
}
