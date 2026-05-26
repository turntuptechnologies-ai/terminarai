import type { Chapter } from '../types'

/**
 * 第1章: ファイルシステムを覗く
 *
 * 学習者がまず触れる pwd / ls / cd を段階的に練習する。
 * 1-3 で `-l` / `-a` のオプションも紹介する。
 *
 * 既知の制約 (follow-up で対応):
 * - command-matches パターンは raw 入力に対する正規表現のため、
 *   フルパス指定 (`/bin/pwd` 等) ではクリア判定されない。MVP 範囲では shell も
 *   `/path/to/cmd` 形式を未対応のため整合は取れている
 * - `cat README.txt` のようなファイル閲覧体験は第1章では扱わない。
 *   第2章で `cat` / リダイレクト等を取り上げる予定
 */
export const CHAPTER_1: Chapter = {
  id: '1',
  title: 'ファイルシステムを覗く',
  description:
    'いまどこにいて、何が見えているかを確認する基本コマンドを覚えます。pwd / ls / cd を順に試します。',
  lessons: [
    {
      id: '1-1',
      chapterId: '1',
      title: '自分の居場所を知る (pwd)',
      description:
        'pwd (print working directory) コマンドで、いまどのディレクトリにいるかを表示します。',
      steps: [
        {
          instruction: '`pwd` を実行して、今いる場所を確認してみましょう。',
          hints: ['`pwd` と入力して Enter キーを押すだけです。'],
          check: { kind: 'command-matches', pattern: '^\\s*pwd\\b' },
        },
      ],
    },
    {
      id: '1-2',
      chapterId: '1',
      title: '周りを見回す (ls)',
      description: 'ls (list) コマンドで、いまいるディレクトリの中身を一覧表示します。',
      steps: [
        {
          instruction: '`ls` を実行して、現在のディレクトリの内容を表示してみましょう。',
          hints: ['`ls` と入力して Enter を押します。'],
          check: { kind: 'command-matches', pattern: '^\\s*ls(\\s|$)' },
        },
      ],
    },
    {
      id: '1-3',
      chapterId: '1',
      title: 'ls のオプションを使う',
      description:
        '`-l` で詳細表示、`-a` で隠しファイル (`.` で始まるファイル) も表示できます。複数指定する場合は `-la` のようにまとめられます。',
      steps: [
        {
          instruction: '`ls -l` で詳細情報付きでファイル一覧を表示してみましょう。',
          hints: ['パーミッション、サイズ、更新日時、ファイル名の順に表示されます。'],
          check: { kind: 'command-matches', pattern: '^\\s*ls\\s+-\\S*l' },
        },
        {
          instruction: '`ls -a` (または `ls -la`) で、隠しファイルも含めて表示してみましょう。',
          hints: ['`-a` フラグを付けると `.` で始まるファイルも見えます。'],
          check: { kind: 'command-matches', pattern: '^\\s*ls\\s+-\\S*a' },
        },
      ],
    },
    {
      id: '1-4',
      chapterId: '1',
      title: 'ディレクトリを移動する (cd)',
      description:
        'cd (change directory) で別のディレクトリに移動できます。docs に入って、上のディレクトリに戻る練習をしましょう。',
      steps: [
        {
          instruction: '`cd docs` で docs ディレクトリに移動してください。',
          hints: [
            'cd のあとに行きたいディレクトリの名前を書きます。',
            '`cd docs` または `cd /home/user/docs` でも構いません。',
          ],
          check: { kind: 'cwd-equals', path: '/home/user/docs' },
        },
        {
          instruction: '`cd ..` で 1 つ上のディレクトリ (/home/user) に戻りましょう。',
          hints: [
            'ふたつのドット `..` は「1 つ上のディレクトリ」を表します。',
            '`cd ..` と入力して Enter。`pwd` で確認できます。',
          ],
          check: { kind: 'cwd-equals', path: '/home/user' },
        },
      ],
    },
    {
      id: '1-5',
      chapterId: '1',
      title: 'ホームへ戻る',
      description:
        '引数なしの `cd` か `cd ~` で、いつでもホームディレクトリに戻れます。今いる場所が分からなくなったときに便利です。',
      initialCwd: '/tmp',
      steps: [
        {
          instruction:
            'いま `/tmp` にいます。`cd` または `cd ~` でホームディレクトリに戻ってください。',
          hints: ['`cd` だけ、または `cd ~` でホーム (/home/user) に戻ります。'],
          check: { kind: 'cwd-equals', path: '/home/user' },
        },
      ],
    },
  ],
}
