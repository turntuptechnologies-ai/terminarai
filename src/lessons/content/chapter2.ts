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
  title: 'ファイルの中身を扱う',
  description:
    'ファイルの中身を読み書きする方法と、絶対パス / 相対パス / .. を使った場所の指定を学びます。',
  lessons: [
    {
      id: '2-1',
      chapterId: '2',
      title: 'ファイルの中身を読む (cat)',
      description:
        'cat (concatenate) コマンドでファイルの中身を出力します。第1章で見えた README.txt の中身を読んでみましょう。',
      steps: [
        {
          instruction: '`cat README.txt` で README ファイルの中身を表示してみましょう。',
          hint: '`cat` の後にファイル名を指定すると中身が出力されます。',
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
      title: '絶対パスでファイルを指定する',
      description:
        '`/home/user/README.txt` のように `/` から始めるパスを「絶対パス」と呼びます。どこにいても同じファイルを指定できます。',
      initialCwd: '/tmp',
      steps: [
        {
          instruction:
            'いま `/tmp` にいます。絶対パスで `cat /home/user/README.txt` を読んでみましょう。',
          hint: '相対パス `cat README.txt` だと、現在いる /tmp に README.txt が無いためエラーになります。絶対パスならどこからでも読めます。',
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
      title: '親ディレクトリへ移動する (cd ..)',
      description:
        '`..` は「親ディレクトリ」を表す特別な名前です。`cd ..` で 1 つ上の階層に戻れます。',
      initialCwd: '/home/user/docs',
      steps: [
        {
          instruction:
            'いま `/home/user/docs` にいます。`cd ..` で 1 つ上のホームに戻ってみましょう。',
          hint: '`cd ..` と入力して Enter。または `cd /home/user` で絶対パスでも戻れます。',
          check: { kind: 'cwd-equals', path: '/home/user' },
        },
      ],
    },
    {
      id: '2-4',
      chapterId: '2',
      title: '..を重ねる / 絶対パスで一気に移動',
      description:
        '`..` は連結できます (`cd ../..` で 2 つ上)。絶対パスを使えば、どんなに離れていても一発で戻れます。',
      initialCwd: '/home/user/docs',
      steps: [
        {
          instruction:
            'いま `/home/user/docs` にいます。`cd ../..` で 2 つ上の `/home` まで戻ってみましょう。',
          hint: '`docs → user → home` と 2 段上がります。`cd ../..` です。',
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
          instruction:
            '今度は絶対パスで `cd /home/user` と打って、ホームへ一気に戻ってみましょう。',
          hint: '`cd /home/user` のように先頭が `/` の絶対パスを指定します。',
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
      title: 'ファイルを作って中身を確認する',
      description:
        '`echo` の出力を `>` (リダイレクト) でファイルに書き込めます。書いたあとは `cat` で中身を確認しましょう。',
      steps: [
        {
          instruction:
            '`echo hello > greeting.txt` を実行して、`greeting.txt` を作ってみましょう。',
          hint: '`echo <文字列> > <ファイル名>` で、文字列をファイルに書き込めます。',
          check: { kind: 'file-contains', path: '/home/user/greeting.txt', text: 'hello' },
        },
        {
          instruction: '`cat greeting.txt` で、いま書き込んだ内容を読んでみましょう。',
          hint: '前のステップで作ったファイルです。`cat greeting.txt` でOK。',
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
