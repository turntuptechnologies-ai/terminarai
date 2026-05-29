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
  title: { ja: 'パスの世界を歩く', en: 'Walking the world of paths' },
  description: {
    ja: '`.` / `..` / `~` / 絶対パス / 相対パスを体系的に扱います。同じ場所を指す複数の書き方を体験しながら、状況に応じた使い分けを身につけます。',
    en: 'Work systematically with `.` / `..` / `~` / absolute paths / relative paths. By trying several ways to point at the same place, you learn to choose the right one for each situation.',
  },
  lessons: [
    {
      id: '4-1',
      chapterId: '4',
      title: { ja: '`.` で「ここ」を明示する', en: 'Spell out "here" with `.`' },
      description: {
        ja: '`.` (ドット) は「現在のディレクトリそのもの」を表す特別な名前です。`./README.txt` と書くと「ここの README.txt」を意味し、`README.txt` と書くのと同じです。',
        en: '`.` (dot) is a special name for "the current directory itself". Writing `./README.txt` means "the README.txt right here", the same as writing `README.txt`.',
      },
      steps: [
        {
          instruction: {
            ja: '`cat ./README.txt` を実行して、`.` で明示しても結果が同じになることを確かめましょう。',
            en: 'Run `cat ./README.txt` and confirm the result is the same even when you spell out `.`.',
          },
          hints: {
            ja: [
              '`.` は「いまいる場所」を表します。`./README.txt` は `README.txt` と同じファイルを指します。',
              '`cat ./README.txt` と入力して Enter。`cat README.txt` と同じ出力が出ます。',
            ],
            en: [
              '`.` means "the place you are now". `./README.txt` points to the same file as `README.txt`.',
              'Type `cat ./README.txt` and press Enter. You get the same output as `cat README.txt`.',
            ],
          },
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
      title: { ja: '`~` (チルダ) でホームを指す', en: 'Point at home with `~` (tilde)' },
      description: {
        ja: '`~` (チルダ) はあなたのホームディレクトリ (`/home/user`) を表します。`cd ~` で「いつでも家に帰る」、`~/docs` で「ホーム配下の docs」のように、絶対パスを短く書くショートカットとして使えます。',
        en: '`~` (tilde) represents your home directory (`/home/user`). Use it as a shortcut for writing absolute paths shortly: `cd ~` to "go home anytime", `~/docs` for "docs under home".',
      },
      initialCwd: '/tmp',
      steps: [
        {
          instruction: {
            ja: 'いま `/tmp` にいます。`cd ~` で自分のホームに戻ってみましょう。',
            en: 'You are now in `/tmp`. Use `cd ~` to return to your home.',
          },
          hints: {
            ja: [
              '`~` は `/home/user` の別名です。`cd ~` は `cd /home/user` と同じ意味になります。',
              '`cd ~` と入力して Enter。`pwd` で確認できます。',
            ],
            en: [
              '`~` is an alias for `/home/user`. `cd ~` means the same as `cd /home/user`.',
              'Type `cd ~` and press Enter. You can check with `pwd`.',
            ],
          },
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
          instruction: {
            ja: '次は `~` を「途中」に挟む使い方を試します。`cat ~/hello.txt` で hello.txt を読みましょう。',
            en: 'Next, try using `~` in the middle of a path. Read hello.txt with `cat ~/hello.txt`.',
          },
          hints: {
            ja: [
              '`~/hello.txt` は `/home/user/hello.txt` と同じです。「ホーム配下のあのファイル」と読み下します。',
              '`cat ~/hello.txt` と入力して Enter。',
            ],
            en: [
              '`~/hello.txt` is the same as `/home/user/hello.txt`. Read it as "that file under home".',
              'Type `cat ~/hello.txt` and press Enter.',
            ],
          },
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
      title: {
        ja: '`../` で親を経由して別の場所を指す',
        en: 'Reach another place via the parent with `../`',
      },
      description: {
        ja: '`../` は親ディレクトリへの 1 段ジャンプですが、それに続けて別のファイル名を書くと「親の中のあのファイル」を指せます。これが**複合相対パス**です。',
        en: '`../` is a one-level jump to the parent directory, but following it with a file name lets you point at "that file in the parent". This is a **compound relative path**.',
      },
      initialCwd: '/home/user/docs',
      steps: [
        {
          instruction: {
            ja: 'いま `/home/user/docs` にいます。`cat ../README.txt` で親ディレクトリの README.txt を読んでみましょう。',
            en: 'You are now in `/home/user/docs`. Use `cat ../README.txt` to read the README.txt in the parent directory.',
          },
          hints: {
            ja: [
              '`../` は親 (= `/home/user`) を指します。`../README.txt` は「親の中の README.txt」つまり `/home/user/README.txt` です。',
              '`cat ../README.txt` と入力して Enter。`cd ..` してから `cat README.txt` するのと結果は同じですが、移動せずに読むのがポイントです。',
            ],
            en: [
              '`../` points to the parent (= `/home/user`). `../README.txt` is "the README.txt in the parent", i.e. `/home/user/README.txt`.',
              'Type `cat ../README.txt` and press Enter. The result is the same as `cd ..` then `cat README.txt`, but the point is reading it without moving.',
            ],
          },
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
      title: { ja: '同じ場所、3 通りの行き方', en: 'Same place, three ways to get there' },
      description: {
        ja: 'これまで学んだ書き方を比較します。`/home/user/README.txt` という 1 つのファイルを、相対パス / 絶対パス / `~` の 3 通りで読んでみましょう。状況に応じて短い方や明示的な方を選べるようになります。',
        en: 'Compare the ways you have learned. Read one file, `/home/user/README.txt`, in three ways: relative path / absolute path / `~`. You will learn to pick the shorter or the more explicit form depending on the situation.',
      },
      initialCwd: '/tmp',
      steps: [
        {
          instruction: {
            ja: '【絶対パス】 `/tmp` にいます。先頭が `/` のフルパスで `cat /home/user/README.txt` を読みましょう。',
            en: '[Absolute path] You are in `/tmp`. Read it with the full path starting from `/`: `cat /home/user/README.txt`.',
          },
          hints: {
            ja: [
              '絶対パスは「家の住所」のようなもの。どこにいても同じファイルを指せます。',
              '`cat /home/user/README.txt` と入力。',
            ],
            en: [
              'An absolute path is like a full street address; it points to the same file wherever you are.',
              'Type `cat /home/user/README.txt`.',
            ],
          },
          check: {
            kind: 'command-matches',
            pattern: '^\\s*cat\\s+/home/user/README\\.txt\\b',
          },
        },
        {
          instruction: {
            ja: '【`~`】 同じファイルを `cat ~/README.txt` で読んでみましょう。',
            en: '[`~`] Read the same file with `cat ~/README.txt`.',
          },
          hints: {
            ja: [
              '`~` を使うと `/home/user` を 1 文字で書けるので、絶対パスより短くなります。',
              '`cat ~/README.txt` と入力。',
            ],
            en: [
              'With `~` you can write `/home/user` in a single character, so it is shorter than the absolute path.',
              'Type `cat ~/README.txt`.',
            ],
          },
          check: {
            kind: 'command-matches',
            pattern: '^\\s*cat\\s+~/README\\.txt\\b',
          },
        },
        {
          instruction: {
            ja: '【相対パス】 まず `cd ~` でホームに移動してから、`cat README.txt` を実行しましょう。相対パスは「いまいる場所からの行き方」を書きます。',
            en: '[Relative path] First `cd ~` to home, then run `cat README.txt`. A relative path describes "how to get there from where you are".',
          },
          hints: {
            ja: [
              'cwd が /home/user になれば、`README.txt` だけで指せます。これが相対パスの強みで、慣れたディレクトリでは短く書けます。',
              '2 コマンドに分けて: 先に `cd ~`、続けて `cat README.txt`。',
            ],
            en: [
              'Once cwd is /home/user, `README.txt` alone points to it. That is the strength of relative paths: short to write in a familiar directory.',
              'Split into two commands: first `cd ~`, then `cat README.txt`.',
            ],
          },
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
