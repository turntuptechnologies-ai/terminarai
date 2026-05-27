import type { Chapter } from '../types'

/**
 * 第5章: ファイルを編集する
 *
 * 第2章で出てきた `echo > file` (新規書き込み) の発展形として、
 * - `touch` で空ファイルを作る
 * - `>>` で末尾に追記する
 * - `>` (上書き) と `>>` (追記) の使い分け
 * を学ぶ。実用シナリオ (メモ・ログ追加) に直結する内容。
 *
 * Check 設計の意図:
 * - 追記レッスンでは `file-contains` (両行残存) + `command-matches '>>'` の and で
 *   「`>>` を使った」ことを担保する。`>` で上書きすると古い行が消えて check 失敗。
 */
export const CHAPTER_5: Chapter = {
  id: '5',
  title: 'ファイルを編集する',
  description:
    '`touch` で空ファイルを作り、`>>` で末尾に追記する技を覚えます。`>` (上書き) との違いも体感します。',
  lessons: [
    {
      id: '5-1',
      chapterId: '5',
      title: '空ファイルを作る (touch)',
      description:
        '`touch <ファイル名>` で空のファイルを作れます。あとから書き足したり、ディレクトリ構造の中に「置き場所」を先に用意するときに便利です。',
      steps: [
        {
          instruction: '`touch note.txt` で空ファイル `note.txt` を作ってみましょう。',
          hints: [
            '`touch` の後にファイル名を続けます。',
            '`touch note.txt` と入力して Enter。`ls` で確認できます。',
          ],
          check: {
            kind: 'and',
            checks: [
              { kind: 'file-exists', path: '/home/user/note.txt' },
              // 空ファイルであることも担保 (cat で何か書いたわけではない)
              { kind: 'file-contains', path: '/home/user/note.txt', text: '' },
            ],
          },
        },
      ],
    },
    {
      id: '5-2',
      chapterId: '5',
      title: '`>>` でファイルに追記する',
      description:
        '`>>` は「追記リダイレクト」です。`>` がファイルを**上書き**するのに対し、`>>` は**末尾に追加**します。既存の内容を消さずに行を足したいときに使います。',
      steps: [
        {
          instruction:
            'まず `echo "Day 1" > diary.txt` で `diary.txt` を作りましょう。`>` で新規作成 (または上書き) です。',
          hints: [
            '`echo <文字列> > <ファイル名>` で文字列をファイルに書き込みます。',
            '`echo "Day 1" > diary.txt` と入力。',
          ],
          check: {
            kind: 'file-contains',
            path: '/home/user/diary.txt',
            text: 'Day 1',
          },
        },
        {
          instruction:
            '次に `echo "Day 2" >> diary.txt` で末尾に行を追加してください。`>>` だと前の行 (Day 1) は残ります。',
          hints: [
            '`>>` (`>` を 2 つ) は追記モード。`>` だと上書きされて Day 1 が消えてしまいます。',
            '`echo "Day 2" >> diary.txt` と入力。',
          ],
          check: {
            kind: 'and',
            checks: [
              { kind: 'file-contains', path: '/home/user/diary.txt', text: 'Day 1' },
              { kind: 'file-contains', path: '/home/user/diary.txt', text: 'Day 2' },
              // `>>` を実際に使ったことを担保 (>" で上書きしても "Day 2" は file に入るが Day 1 が消える)
              { kind: 'command-matches', pattern: '>>\\s' },
            ],
          },
        },
      ],
    },
    {
      id: '5-3',
      chapterId: '5',
      title: '`>` と `>>` の使い分けを体感する',
      description:
        '`>` (上書き) と `>>` (追記) の挙動の違いを目で見て確かめます。同じファイルに対して使い分けることで、片方では消え、片方では残ることを確認します。',
      steps: [
        {
          instruction: '`echo "before" > demo.txt` で `demo.txt` に "before" を書きましょう。',
          hints: ['`echo "before" > demo.txt` と入力。`>` は上書きです。'],
          check: { kind: 'file-contains', path: '/home/user/demo.txt', text: 'before' },
        },
        {
          instruction:
            '今度はわざと `>` (上書き) で `echo "after" > demo.txt` を実行してみましょう。"before" が消えるはずです。',
          hints: [
            '`echo "after" > demo.txt` と入力。`>` を使うと中身が "after" だけになります。',
            '次のステップで `cat demo.txt` で確認します。',
          ],
          check: {
            kind: 'and',
            checks: [
              { kind: 'file-contains', path: '/home/user/demo.txt', text: 'after' },
              // before が消えたことを担保 (= 上書きされた)
              {
                kind: 'not',
                check: { kind: 'file-contains', path: '/home/user/demo.txt', text: 'before' },
              },
            ],
          },
        },
        {
          instruction:
            '`cat demo.txt` で中身を確認しましょう。"after" のみ残り、"before" は消えているはずです。',
          hints: ['`cat demo.txt` と入力。'],
          check: {
            kind: 'command-matches',
            pattern: '^\\s*cat\\s+(?:\\S*/)?demo\\.txt\\b',
          },
        },
      ],
    },
    {
      id: '5-4',
      chapterId: '5',
      title: '練習: メモを順に書き足す',
      description:
        '`touch` で空ファイルを作って、`>>` で順番に行を足し、`cat` で全体を確認します。実際のメモやログを残す流れと同じです。',
      steps: [
        {
          instruction: 'まず `touch memo.txt` で空ファイルを作りましょう。',
          hints: ['`touch memo.txt` と入力。'],
          check: { kind: 'file-exists', path: '/home/user/memo.txt' },
        },
        {
          instruction: '`echo "1行目" >> memo.txt` で 1 行目を追記してください。',
          hints: ['`>>` で末尾追記。`echo "1行目" >> memo.txt` と入力。'],
          check: {
            kind: 'and',
            checks: [
              { kind: 'file-contains', path: '/home/user/memo.txt', text: '1行目' },
              { kind: 'command-matches', pattern: '>>\\s' },
            ],
          },
        },
        {
          instruction: '`echo "2行目" >> memo.txt` でさらに行を追加しましょう。',
          hints: ['同じく `>>` で。`echo "2行目" >> memo.txt`。'],
          check: {
            kind: 'and',
            checks: [
              { kind: 'file-contains', path: '/home/user/memo.txt', text: '1行目' },
              { kind: 'file-contains', path: '/home/user/memo.txt', text: '2行目' },
              { kind: 'command-matches', pattern: '>>\\s' },
            ],
          },
        },
        {
          instruction: '最後に `cat memo.txt` で 2 行揃って入っているか確認しましょう。',
          hints: ['`cat memo.txt` と入力。2 行とも表示されれば成功です。'],
          check: {
            kind: 'command-matches',
            pattern: '^\\s*cat\\s+(?:\\S*/)?memo\\.txt\\b',
          },
        },
      ],
    },
    {
      id: '5-5',
      chapterId: '5',
      title: 'vi でファイルを編集する',
      description:
        'ターミナル文化の定番エディタ **vi** を体験します。3 つのモード (NORMAL / INSERT / COMMAND) を意識しながら、ファイルを開いて編集して保存する流れを覚えましょう。',
      steps: [
        {
          instruction:
            '`vi greeting.txt` で新しいファイルをエディタで開きましょう。起動直後は **NORMAL モード** です。',
          hints: [
            '`vi <ファイル名>` でエディタが開きます。存在しないファイルは新規作成扱いになります。',
            '`vi greeting.txt` と入力して Enter。エディタ画面に切り替わったら次のステップへ。',
          ],
          check: { kind: 'command-name', name: 'vi' },
        },
        {
          instruction:
            'エディタの中で `i` を押して INSERT モードに入り、`Hello terminarai` と書きましょう。書けたら `Esc` で NORMAL に戻り、`:wq` Enter で保存して終了します。',
          hints: [
            'NORMAL で `i` → 下に "-- INSERT --" が出ます。これがタイプできる状態です。',
            '入力後 `Esc` で NORMAL、`:` で COMMAND モードに入って `wq` Enter で保存+終了。',
            '途中で間違えたら `:q!` Enter で破棄して抜け、もう一度 `vi greeting.txt` から。',
          ],
          check: {
            kind: 'and',
            checks: [
              { kind: 'file-exists', path: '/home/user/greeting.txt' },
              {
                kind: 'file-contains',
                path: '/home/user/greeting.txt',
                text: 'Hello terminarai',
              },
            ],
          },
        },
      ],
    },
  ],
}
