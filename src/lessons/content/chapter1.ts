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
  title: { ja: 'ファイルシステムを覗く', en: 'Exploring the filesystem' },
  description: {
    ja: 'いまどこにいて、何が見えているかを確認する基本コマンドを覚えます。pwd / ls / cd を順に試します。',
    en: 'Learn the basic commands to check where you are and what you can see. We will try pwd / ls / cd in order.',
  },
  lessons: [
    {
      id: '1-1',
      chapterId: '1',
      title: { ja: '自分の居場所を知る (pwd)', en: 'Find out where you are (pwd)' },
      description: {
        ja: 'pwd (print working directory) コマンドで、いまどのディレクトリにいるかを表示します。',
        en: 'The pwd (print working directory) command shows which directory you are currently in.',
      },
      steps: [
        {
          instruction: {
            ja: '`pwd` を実行して、今いる場所を確認してみましょう。',
            en: 'Run `pwd` to check where you currently are.',
          },
          hints: {
            ja: ['`pwd` と入力して Enter キーを押すだけです。'],
            en: ['Just type `pwd` and press Enter.'],
          },
          check: { kind: 'command-matches', pattern: '^\\s*pwd\\b' },
        },
      ],
    },
    {
      id: '1-2',
      chapterId: '1',
      title: { ja: '周りを見回す (ls)', en: 'Look around (ls)' },
      description: {
        ja: 'ls (list) コマンドで、いまいるディレクトリの中身を一覧表示します。',
        en: 'The ls (list) command lists the contents of the directory you are in.',
      },
      steps: [
        {
          instruction: {
            ja: '`ls` を実行して、現在のディレクトリの内容を表示してみましょう。',
            en: 'Run `ls` to show the contents of the current directory.',
          },
          hints: {
            ja: ['`ls` と入力して Enter を押します。'],
            en: ['Type `ls` and press Enter.'],
          },
          check: { kind: 'command-matches', pattern: '^\\s*ls(\\s|$)' },
        },
      ],
    },
    {
      id: '1-3',
      chapterId: '1',
      title: { ja: 'ls のオプションを使う', en: 'Use ls options' },
      description: {
        ja: '`-l` で詳細表示、`-a` で隠しファイル (`.` で始まるファイル) も表示できます。複数指定する場合は `-la` のようにまとめられます。',
        en: 'Use `-l` for a detailed listing and `-a` to also show hidden files (files starting with `.`). You can combine flags like `-la`.',
      },
      steps: [
        {
          instruction: {
            ja: '`ls -l` で詳細情報付きでファイル一覧を表示してみましょう。',
            en: 'Use `ls -l` to list files with detailed information.',
          },
          hints: {
            ja: ['パーミッション、サイズ、更新日時、ファイル名の順に表示されます。'],
            en: ['They are shown in order: permissions, size, modified time, and file name.'],
          },
          check: { kind: 'command-matches', pattern: '^\\s*ls\\s+-\\S*l' },
        },
        {
          instruction: {
            ja: '`ls -a` (または `ls -la`) で、隠しファイルも含めて表示してみましょう。',
            en: 'Use `ls -a` (or `ls -la`) to also show hidden files.',
          },
          hints: {
            ja: ['`-a` フラグを付けると `.` で始まるファイルも見えます。'],
            en: ['With the `-a` flag, files starting with `.` become visible too.'],
          },
          check: { kind: 'command-matches', pattern: '^\\s*ls\\s+-\\S*a' },
        },
      ],
    },
    {
      id: '1-4',
      chapterId: '1',
      title: { ja: 'ディレクトリを移動する (cd)', en: 'Move between directories (cd)' },
      description: {
        ja: 'cd (change directory) で別のディレクトリに移動できます。docs に入って、上のディレクトリに戻る練習をしましょう。',
        en: 'cd (change directory) moves you to another directory. Let us practice entering docs and going back up.',
      },
      steps: [
        {
          instruction: {
            ja: '`cd docs` で docs ディレクトリに移動してください。',
            en: 'Use `cd docs` to move into the docs directory.',
          },
          hints: {
            ja: [
              'cd のあとに行きたいディレクトリの名前を書きます。',
              '`cd docs` または `cd /home/user/docs` でも構いません。',
            ],
            en: [
              'After cd, write the name of the directory you want to go to.',
              '`cd docs` or `cd /home/user/docs` both work.',
            ],
          },
          check: { kind: 'cwd-equals', path: '/home/user/docs' },
        },
        {
          instruction: {
            ja: '`cd ..` で 1 つ上のディレクトリ (/home/user) に戻りましょう。',
            en: 'Use `cd ..` to go back up one directory (/home/user).',
          },
          hints: {
            ja: [
              'ふたつのドット `..` は「1 つ上のディレクトリ」を表します。',
              '`cd ..` と入力して Enter。`pwd` で確認できます。',
            ],
            en: [
              'The two dots `..` mean the parent directory (one level up).',
              'Type `cd ..` and press Enter. You can check with `pwd`.',
            ],
          },
          check: { kind: 'cwd-equals', path: '/home/user' },
        },
      ],
    },
    {
      id: '1-5',
      chapterId: '1',
      title: { ja: 'ホームへ戻る', en: 'Return home' },
      description: {
        ja: '引数なしの `cd` か `cd ~` で、いつでもホームディレクトリに戻れます。今いる場所が分からなくなったときに便利です。',
        en: '`cd` with no arguments, or `cd ~`, takes you back to your home directory anytime. Handy when you lose track of where you are.',
      },
      initialCwd: '/tmp',
      steps: [
        {
          instruction: {
            ja: 'いま `/tmp` にいます。`cd` または `cd ~` でホームディレクトリに戻ってください。',
            en: 'You are now in `/tmp`. Use `cd` or `cd ~` to return to your home directory.',
          },
          hints: {
            ja: ['`cd` だけ、または `cd ~` でホーム (/home/user) に戻ります。'],
            en: ['`cd` alone, or `cd ~`, returns you home (/home/user).'],
          },
          check: { kind: 'cwd-equals', path: '/home/user' },
        },
      ],
    },
  ],
}
