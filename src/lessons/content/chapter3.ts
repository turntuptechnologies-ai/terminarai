import type { Chapter } from '../types'

/**
 * 第3章: ファイルとディレクトリを管理する
 *
 * 第1-2章で習得した移動・閲覧の上に、自分で作る・コピーする・移動する・削除する
 * の 4 つの操作を学ぶ。mkdir / cp / mv / rm の応用 (-p, -r) も合わせて扱う。
 */
export const CHAPTER_3: Chapter = {
  id: '3',
  title: 'ファイルとディレクトリを管理する',
  description:
    'mkdir / cp / mv / rm を使って、ファイルとディレクトリを自分で作り、コピー・移動・削除する操作を覚えます。応用フラグ (-p, -r) も登場します。',
  lessons: [
    {
      id: '3-1',
      chapterId: '3',
      title: 'ディレクトリを作る (mkdir)',
      description:
        '`mkdir <名前>` で新しいディレクトリを作ります。作った後は `ls` で確かめましょう。',
      steps: [
        {
          instruction: '`mkdir myfolder` で myfolder ディレクトリを作ってみましょう。',
          hints: ['`mkdir myfolder` と入力して Enter。`ls` で確認できます。'],
          check: { kind: 'file-exists', path: '/home/user/myfolder' },
        },
      ],
    },
    {
      id: '3-2',
      chapterId: '3',
      title: '深い階層を一度に作る (mkdir -p)',
      description:
        '`mkdir foo/bar/baz` は foo が無いと失敗します。`-p` (parents) を付けると親ディレクトリも自動で作成されます。',
      steps: [
        {
          instruction:
            '`mkdir -p project/src/lib` で 3 階層のディレクトリを一括で作ってみましょう。',
          hints: ['`-p` で project → src → lib が一度に作られます。'],
          check: { kind: 'file-exists', path: '/home/user/project/src/lib' },
        },
      ],
    },
    {
      id: '3-3',
      chapterId: '3',
      title: 'ファイルとディレクトリをコピー (cp / cp -r)',
      description:
        '`cp <元> <先>` でファイルをコピー。ディレクトリをコピーする場合は `-r` (recursive) が必要です。',
      steps: [
        {
          instruction: '`cp hello.txt copy.txt` で hello.txt を copy.txt にコピーしてみましょう。',
          hints: ['コピー元・コピー先の順に指定します。'],
          // hello.txt の中身に "terminarai" が含まれるので、cp 経由でしか満たせない
          check: { kind: 'file-contains', path: '/home/user/copy.txt', text: 'terminarai' },
        },
        {
          instruction:
            '`cp -r docs docs-copy` で docs ディレクトリを docs-copy として丸ごとコピーしてみましょう。',
          hints: ['ディレクトリのコピーは `-r` フラグが必須です。'],
          check: { kind: 'file-exists', path: '/home/user/docs-copy' },
        },
      ],
    },
    {
      id: '3-4',
      chapterId: '3',
      title: '移動・リネーム (mv)',
      description:
        '`mv` は「移動」と「リネーム」を兼ねます。`mv old new` で名前を変えられ、`mv file dir/` でディレクトリ配下に移動できます。',
      steps: [
        {
          instruction:
            '`mv hello.txt greeting.txt` で hello.txt の名前を greeting.txt に変えてみましょう。',
          hints: ['同じ場所に違う名前を指定すればリネームになります。'],
          check: {
            kind: 'and',
            checks: [
              { kind: 'file-exists', path: '/home/user/greeting.txt' },
              { kind: 'not', check: { kind: 'file-exists', path: '/home/user/hello.txt' } },
            ],
          },
        },
        {
          instruction:
            '`mv greeting.txt docs/` で greeting.txt を docs ディレクトリの中へ移動してみましょう。',
          hints: ['移動先が既存のディレクトリの場合、その配下に入ります。'],
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
      title: '削除する (rm / rm -r)',
      description:
        '`rm <ファイル>` でファイル削除、ディレクトリを消すには `-r` が必須です。間違えると戻せないので慎重に。',
      steps: [
        {
          instruction: '`rm hello.txt` で hello.txt を削除してみましょう。',
          hints: ['`rm <ファイル名>` です。'],
          check: {
            kind: 'not',
            check: { kind: 'file-exists', path: '/home/user/hello.txt' },
          },
        },
        {
          instruction:
            '`rm -r docs` で docs ディレクトリを丸ごと削除してみましょう。`rm docs` だと失敗します。',
          hints: ['ディレクトリ削除は `-r` を付けないと拒否されます。'],
          check: {
            kind: 'not',
            check: { kind: 'file-exists', path: '/home/user/docs' },
          },
        },
      ],
    },
  ],
}
