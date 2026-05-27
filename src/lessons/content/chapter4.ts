import type { Chapter } from '../types'

/**
 * 第4章: パスの世界を歩く
 *
 * 第1-3章で「絶対パス」「相対パス」「..」を断片的に触れたものを、
 * 体系的に扱い直す章。具体的には:
 * - `.` (現在ディレクトリ) を明示する
 * - `~` (ホーム展開) — どこからでも自分の家に
 * - `../sibling` — 親に出てから別の所へ (複合相対パス)
 * - 同じ目的地に 3 通りの行き方 (相対 / 絶対 / ~) を比較する
 *
 * 既定 VFS の構造を前提とする (/home/user/{README.txt, hello.txt, docs/})。
 */
export const CHAPTER_4: Chapter = {
  id: '4',
  title: 'パスの世界を歩く',
  description:
    '`.` / `..` / `~` / 絶対パス / 相対パスを体系的に扱います。同じ場所を指す複数の書き方を体験しながら、状況に応じた使い分けを身につけます。',
  lessons: [
    {
      id: '4-1',
      chapterId: '4',
      title: '`.` で「ここ」を明示する',
      description:
        '`.` (ドット) は「現在のディレクトリそのもの」を表す特別な名前です。`./README.txt` と書くと「ここの README.txt」を意味し、`README.txt` と書くのと同じです。',
      steps: [
        {
          instruction:
            '`cat ./README.txt` を実行して、`.` で明示しても結果が同じになることを確かめましょう。',
          hints: [
            '`.` は「いまいる場所」を表します。`./README.txt` は `README.txt` と同じファイルを指します。',
            '`cat ./README.txt` と入力して Enter。`cat README.txt` と同じ出力が出ます。',
          ],
          check: {
            kind: 'and',
            checks: [
              { kind: 'cwd-equals', path: '/home/user' },
              { kind: 'command-matches', pattern: '^\\s*cat\\s+\\./README\\.txt\\b' },
            ],
          },
        },
      ],
    },
    {
      id: '4-2',
      chapterId: '4',
      title: '`~` (チルダ) でホームを指す',
      description:
        '`~` (チルダ) はあなたのホームディレクトリ (`/home/user`) を表します。`cd ~` で「いつでも家に帰る」、`~/docs` で「ホーム配下の docs」のように、絶対パスを短く書くショートカットとして使えます。',
      initialCwd: '/tmp',
      steps: [
        {
          instruction: 'いま `/tmp` にいます。`cd ~` で自分のホームに戻ってみましょう。',
          hints: [
            '`~` は `/home/user` の別名です。`cd ~` は `cd /home/user` と同じ意味になります。',
            '`cd ~` と入力して Enter。`pwd` で確認できます。',
          ],
          check: {
            kind: 'and',
            checks: [
              { kind: 'cwd-equals', path: '/home/user' },
              // ~ を使った移動であることを明示 (cd /home/user での通過を防ぐ)
              { kind: 'command-matches', pattern: '^\\s*cd\\s+~(/|\\s|$)' },
            ],
          },
        },
        {
          instruction:
            '次は `~` を「途中」に挟む使い方を試します。`cat ~/hello.txt` で hello.txt を読みましょう。',
          hints: [
            '`~/hello.txt` は `/home/user/hello.txt` と同じです。「ホーム配下のあのファイル」と読み下します。',
            '`cat ~/hello.txt` と入力して Enter。',
          ],
          check: {
            kind: 'command-matches',
            pattern: '^\\s*cat\\s+~/hello\\.txt\\b',
          },
        },
      ],
    },
    {
      id: '4-3',
      chapterId: '4',
      title: '`../` で親を経由して別の場所を指す',
      description:
        '`../` は親ディレクトリへの 1 段ジャンプですが、それに続けて別のファイル名を書くと「親の中のあのファイル」を指せます。これが**複合相対パス**です。',
      initialCwd: '/home/user/docs',
      steps: [
        {
          instruction:
            'いま `/home/user/docs` にいます。`cat ../README.txt` で親ディレクトリの README.txt を読んでみましょう。',
          hints: [
            '`../` は親 (= `/home/user`) を指します。`../README.txt` は「親の中の README.txt」つまり `/home/user/README.txt` です。',
            '`cat ../README.txt` と入力して Enter。`cd ..` してから `cat README.txt` するのと結果は同じですが、移動せずに読むのがポイントです。',
          ],
          check: {
            kind: 'and',
            checks: [
              { kind: 'cwd-equals', path: '/home/user/docs' },
              { kind: 'command-matches', pattern: '^\\s*cat\\s+\\.\\./README\\.txt\\b' },
            ],
          },
        },
      ],
    },
    {
      id: '4-4',
      chapterId: '4',
      title: '同じ場所、3 通りの行き方',
      description:
        'これまで学んだ書き方を比較します。`/home/user/README.txt` という 1 つのファイルを、相対パス / 絶対パス / `~` の 3 通りで読んでみましょう。状況に応じて短い方や明示的な方を選べるようになります。',
      initialCwd: '/tmp',
      steps: [
        {
          instruction:
            '【絶対パス】 `/tmp` にいます。先頭が `/` のフルパスで `cat /home/user/README.txt` を読みましょう。',
          hints: [
            '絶対パスは「家の住所」のようなもの。どこにいても同じファイルを指せます。',
            '`cat /home/user/README.txt` と入力。',
          ],
          check: {
            kind: 'command-matches',
            pattern: '^\\s*cat\\s+/home/user/README\\.txt\\b',
          },
        },
        {
          instruction: '【`~`】 同じファイルを `cat ~/README.txt` で読んでみましょう。',
          hints: [
            '`~` を使うと `/home/user` を 1 文字で書けるので、絶対パスより短くなります。',
            '`cat ~/README.txt` と入力。',
          ],
          check: {
            kind: 'command-matches',
            pattern: '^\\s*cat\\s+~/README\\.txt\\b',
          },
        },
        {
          instruction:
            '【相対パス】 まず `cd ~` でホームに移動してから、`cat README.txt` を実行しましょう。相対パスは「いまいる場所からの行き方」を書きます。',
          hints: [
            'cwd が /home/user になれば、`README.txt` だけで指せます。これが相対パスの強みで、慣れたディレクトリでは短く書けます。',
            '2 コマンドに分けて: 先に `cd ~`、続けて `cat README.txt`。',
          ],
          check: {
            kind: 'and',
            checks: [
              { kind: 'cwd-equals', path: '/home/user' },
              // 相対パス指定 (絶対 / ~ ではない) を明示
              { kind: 'command-matches', pattern: '^\\s*cat\\s+README\\.txt\\s*$' },
            ],
          },
        },
      ],
    },
  ],
}
