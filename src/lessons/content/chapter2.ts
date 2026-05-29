import type { Chapter } from '../types'

/**
 * 第2章: ファイルと中身、移動を深める
 *
 * 第1章で覚えた pwd / ls / cd を土台に、
 * - ファイルの中身を読む (cat)
 * - 絶対パス vs 相対パス
 * - 親ディレクトリへの移動 (cd ..)
 * - リダイレクトで自分のファイルを作る (echo > file)
 * を順に体験する。
 */
export const CHAPTER_2: Chapter = {
  id: '2',
  title: { ja: 'ファイルの中身を扱う', en: 'Working with file contents' },
  description: {
    ja: 'ファイルの中身を読み書きする方法と、絶対パス / 相対パス / .. を使った場所の指定を学びます。',
    en: 'Learn how to read and write file contents, and how to point at locations using absolute paths, relative paths, and `..`.',
  },
  lessons: [
    {
      id: '2-1',
      chapterId: '2',
      title: { ja: 'ファイルの中身を読む (cat)', en: 'Read a file (cat)' },
      description: {
        ja: 'cat (concatenate) コマンドでファイルの中身を出力します。第1章で見えた README.txt の中身を読んでみましょう。',
        en: "The cat (concatenate) command prints a file's contents. Let us read the README.txt you saw in Chapter 1.",
      },
      steps: [
        {
          instruction: {
            ja: '`cat README.txt` で README ファイルの中身を表示してみましょう。',
            en: 'Use `cat README.txt` to display the contents of the README file.',
          },
          hints: {
            ja: ['`cat` の後にファイル名を指定すると中身が出力されます。'],
            en: ['Give a file name after `cat` and its contents are printed.'],
          },
          check: {
            kind: 'command-matches',
            pattern: '^\\s*cat\\s+(?:\\S*/)?README\\.txt\\b',
          },
        },
      ],
    },
    {
      id: '2-2',
      chapterId: '2',
      title: { ja: '絶対パスでファイルを指定する', en: 'Specify a file by absolute path' },
      description: {
        ja: '`/home/user/README.txt` のように `/` から始めるパスを「絶対パス」と呼びます。どこにいても同じファイルを指定できます。',
        en: 'A path that starts with `/`, like `/home/user/README.txt`, is called an "absolute path". It points to the same file no matter where you are.',
      },
      initialCwd: '/tmp',
      steps: [
        {
          instruction: {
            ja: 'いま `/tmp` にいます。絶対パスで `cat /home/user/README.txt` を読んでみましょう。',
            en: 'You are now in `/tmp`. Read it by absolute path with `cat /home/user/README.txt`.',
          },
          hints: {
            ja: [
              '相対パス `cat README.txt` だと、現在いる /tmp に README.txt が無いためエラーになります。絶対パスならどこからでも読めます。',
            ],
            en: [
              'A relative path `cat README.txt` would fail because there is no README.txt in /tmp. An absolute path works from anywhere.',
            ],
          },
          check: {
            kind: 'command-matches',
            pattern: '^\\s*cat\\s+/home/user/README\\.txt\\b',
          },
        },
      ],
    },
    {
      id: '2-3',
      chapterId: '2',
      title: { ja: '親ディレクトリへ移動する (cd ..)', en: 'Move to the parent directory (cd ..)' },
      description: {
        ja: '`..` は「親ディレクトリ」を表す特別な名前です。`cd ..` で 1 つ上の階層に戻れます。',
        en: '`..` is a special name meaning "the parent directory". `cd ..` takes you up one level.',
      },
      initialCwd: '/home/user/docs',
      steps: [
        {
          instruction: {
            ja: 'いま `/home/user/docs` にいます。`cd ..` で 1 つ上のホームに戻ってみましょう。',
            en: 'You are now in `/home/user/docs`. Use `cd ..` to go up one level back home.',
          },
          hints: {
            ja: ['`cd ..` と入力して Enter。または `cd /home/user` で絶対パスでも戻れます。'],
            en: [
              'Type `cd ..` and press Enter. You can also go back with the absolute path `cd /home/user`.',
            ],
          },
          check: { kind: 'cwd-equals', path: '/home/user' },
        },
      ],
    },
    {
      id: '2-4',
      chapterId: '2',
      title: {
        ja: '..を重ねる / 絶対パスで一気に移動',
        en: 'Stack .. / jump with an absolute path',
      },
      description: {
        ja: '`..` は連結できます (`cd ../..` で 2 つ上)。絶対パスを使えば、どんなに離れていても一発で戻れます。',
        en: 'You can chain `..` (`cd ../..` goes up two levels). With an absolute path you can jump back in one step no matter how far away you are.',
      },
      initialCwd: '/home/user/docs',
      steps: [
        {
          instruction: {
            ja: 'いま `/home/user/docs` にいます。`cd ../..` で 2 つ上の `/home` まで戻ってみましょう。',
            en: 'You are now in `/home/user/docs`. Use `cd ../..` to go up two levels to `/home`.',
          },
          hints: {
            ja: ['`docs → user → home` と 2 段上がります。`cd ../..` です。'],
            en: ['You climb two levels: `docs → user → home`. That is `cd ../..`.'],
          },
          check: {
            kind: 'and',
            checks: [
              { kind: 'cwd-equals', path: '/home' },
              // .. を使った移動であることを明示 (絶対パス cd /home での通過を防ぐ)
              { kind: 'command-matches', pattern: '^\\s*cd\\s+\\.\\.' },
            ],
          },
        },
        {
          instruction: {
            ja: '今度は絶対パスで `cd /home/user` と打って、ホームへ一気に戻ってみましょう。',
            en: 'Now type the absolute path `cd /home/user` to jump straight back home.',
          },
          hints: {
            ja: ['`cd /home/user` のように先頭が `/` の絶対パスを指定します。'],
            en: ['Use an absolute path that starts with `/`, like `cd /home/user`.'],
          },
          check: {
            kind: 'and',
            checks: [
              { kind: 'cwd-equals', path: '/home/user' },
              // 絶対パス (`/` 始まり) であることを明示
              { kind: 'command-matches', pattern: '^\\s*cd\\s+/' },
            ],
          },
        },
      ],
    },
    {
      id: '2-5',
      chapterId: '2',
      title: { ja: 'ファイルを作って中身を確認する', en: 'Create a file and check its contents' },
      description: {
        ja: '`echo` の出力を `>` (リダイレクト) でファイルに書き込めます。書いたあとは `cat` で中身を確認しましょう。',
        en: 'You can write `echo` output to a file with `>` (redirection). After writing, check the contents with `cat`.',
      },
      steps: [
        {
          instruction: {
            ja: '`echo hello > greeting.txt` を実行して、`greeting.txt` を作ってみましょう。',
            en: 'Run `echo hello > greeting.txt` to create `greeting.txt`.',
          },
          hints: {
            ja: ['`echo <文字列> > <ファイル名>` で、文字列をファイルに書き込めます。'],
            en: ['`echo <text> > <filename>` writes the text into a file.'],
          },
          check: { kind: 'file-contains', path: '/home/user/greeting.txt', text: 'hello' },
        },
        {
          instruction: {
            ja: '`cat greeting.txt` で、いま書き込んだ内容を読んでみましょう。',
            en: 'Use `cat greeting.txt` to read what you just wrote.',
          },
          hints: {
            ja: ['前のステップで作ったファイルです。`cat greeting.txt` でOK。'],
            en: ['It is the file you made in the previous step. `cat greeting.txt` does it.'],
          },
          check: {
            kind: 'and',
            checks: [
              { kind: 'file-contains', path: '/home/user/greeting.txt', text: 'hello' },
              {
                kind: 'command-matches',
                pattern: '^\\s*cat\\s+(?:\\S*/)?greeting\\.txt\\b',
              },
            ],
          },
        },
      ],
    },
  ],
}
