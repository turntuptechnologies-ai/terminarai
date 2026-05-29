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
  title: { ja: 'ファイルを編集する', en: 'Editing files' },
  description: {
    ja: '`touch` で空ファイルを作り、`>>` で末尾に追記する技を覚えます。`>` (上書き) との違いも体感します。',
    en: 'Learn to make empty files with `touch` and append to the end with `>>`. Feel the difference from `>` (overwrite) too.',
  },
  lessons: [
    {
      id: '5-1',
      chapterId: '5',
      title: { ja: '空ファイルを作る (touch)', en: 'Make an empty file (touch)' },
      description: {
        ja: '`touch <ファイル名>` で空のファイルを作れます。あとから書き足したり、ディレクトリ構造の中に「置き場所」を先に用意するときに便利です。',
        en: '`touch <filename>` creates an empty file. Handy for writing to later, or for reserving a "slot" in your directory structure ahead of time.',
      },
      steps: [
        {
          instruction: {
            ja: '`touch note.txt` で空ファイル `note.txt` を作ってみましょう。',
            en: 'Use `touch note.txt` to create the empty file `note.txt`.',
          },
          hints: {
            ja: [
              '`touch` の後にファイル名を続けます。',
              '`touch note.txt` と入力して Enter。`ls` で確認できます。',
            ],
            en: [
              'Follow `touch` with a file name.',
              'Type `touch note.txt` and press Enter. You can check with `ls`.',
            ],
          },
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
      title: { ja: '`>>` でファイルに追記する', en: 'Append to a file with `>>`' },
      description: {
        ja: '`>>` は「追記リダイレクト」です。`>` がファイルを**上書き**するのに対し、`>>` は**末尾に追加**します。既存の内容を消さずに行を足したいときに使います。',
        en: '`>>` is the "append redirection". While `>` **overwrites** a file, `>>` **adds to the end**. Use it when you want to add lines without erasing existing content.',
      },
      steps: [
        {
          instruction: {
            ja: 'まず `echo "Day 1" > diary.txt` で `diary.txt` を作りましょう。`>` で新規作成 (または上書き) です。',
            en: 'First create `diary.txt` with `echo "Day 1" > diary.txt`. `>` creates (or overwrites).',
          },
          hints: {
            ja: [
              '`echo <文字列> > <ファイル名>` で文字列をファイルに書き込みます。',
              '`echo "Day 1" > diary.txt` と入力。',
            ],
            en: [
              '`echo <text> > <filename>` writes text into a file.',
              'Type `echo "Day 1" > diary.txt`.',
            ],
          },
          check: {
            kind: 'file-contains',
            path: '/home/user/diary.txt',
            text: 'Day 1',
          },
        },
        {
          instruction: {
            ja: '次に `echo "Day 2" >> diary.txt` で末尾に行を追加してください。`>>` だと前の行 (Day 1) は残ります。',
            en: 'Next add a line at the end with `echo "Day 2" >> diary.txt`. With `>>`, the previous line (Day 1) stays.',
          },
          hints: {
            ja: [
              '`>>` (`>` を 2 つ) は追記モード。`>` だと上書きされて Day 1 が消えてしまいます。',
              '`echo "Day 2" >> diary.txt` と入力。',
            ],
            en: [
              '`>>` (two `>`) is append mode. `>` would overwrite and erase Day 1.',
              'Type `echo "Day 2" >> diary.txt`.',
            ],
          },
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
      title: { ja: '`>` と `>>` の使い分けを体感する', en: 'Feel when to use `>` vs `>>`' },
      description: {
        ja: '`>` (上書き) と `>>` (追記) の挙動の違いを目で見て確かめます。同じファイルに対して使い分けることで、片方では消え、片方では残ることを確認します。',
        en: 'See the difference between `>` (overwrite) and `>>` (append) with your own eyes. Using both on the same file, confirm that one erases and the other keeps.',
      },
      steps: [
        {
          instruction: {
            ja: '`echo "before" > demo.txt` で `demo.txt` に "before" を書きましょう。',
            en: 'Write "before" to `demo.txt` with `echo "before" > demo.txt`.',
          },
          hints: {
            ja: ['`echo "before" > demo.txt` と入力。`>` は上書きです。'],
            en: ['Type `echo "before" > demo.txt`. `>` overwrites.'],
          },
          check: { kind: 'file-contains', path: '/home/user/demo.txt', text: 'before' },
        },
        {
          instruction: {
            ja: '今度はわざと `>` (上書き) で `echo "after" > demo.txt` を実行してみましょう。"before" が消えるはずです。',
            en: 'Now deliberately use `>` (overwrite) with `echo "after" > demo.txt`. "before" should disappear.',
          },
          hints: {
            ja: [
              '`echo "after" > demo.txt` と入力。`>` を使うと中身が "after" だけになります。',
              '次のステップで `cat demo.txt` で確認します。',
            ],
            en: [
              'Type `echo "after" > demo.txt`. With `>`, the contents become just "after".',
              'You will check with `cat demo.txt` in the next step.',
            ],
          },
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
          instruction: {
            ja: '`cat demo.txt` で中身を確認しましょう。"after" のみ残り、"before" は消えているはずです。',
            en: 'Check the contents with `cat demo.txt`. Only "after" should remain; "before" should be gone.',
          },
          hints: {
            ja: ['`cat demo.txt` と入力。'],
            en: ['Type `cat demo.txt`.'],
          },
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
      title: { ja: '練習: メモを順に書き足す', en: 'Practice: build up a memo line by line' },
      description: {
        ja: '`touch` で空ファイルを作って、`>>` で順番に行を足し、`cat` で全体を確認します。実際のメモやログを残す流れと同じです。',
        en: 'Make an empty file with `touch`, add lines in order with `>>`, and check the whole thing with `cat`. This is the same flow as keeping a real memo or log.',
      },
      steps: [
        {
          instruction: {
            ja: 'まず `touch memo.txt` で空ファイルを作りましょう。',
            en: 'First make an empty file with `touch memo.txt`.',
          },
          hints: { ja: ['`touch memo.txt` と入力。'], en: ['Type `touch memo.txt`.'] },
          check: { kind: 'file-exists', path: '/home/user/memo.txt' },
        },
        {
          instruction: {
            ja: '`echo "1行目" >> memo.txt` で 1 行目を追記してください。',
            en: 'Append the first line with `echo "1行目" >> memo.txt`.',
          },
          hints: {
            ja: ['`>>` で末尾追記。`echo "1行目" >> memo.txt` と入力。'],
            en: ['Append to the end with `>>`. Type `echo "1行目" >> memo.txt`.'],
          },
          check: {
            kind: 'and',
            checks: [
              { kind: 'file-contains', path: '/home/user/memo.txt', text: '1行目' },
              { kind: 'command-matches', pattern: '>>\\s' },
            ],
          },
        },
        {
          instruction: {
            ja: '`echo "2行目" >> memo.txt` でさらに行を追加しましょう。',
            en: 'Add another line with `echo "2行目" >> memo.txt`.',
          },
          hints: {
            ja: ['同じく `>>` で。`echo "2行目" >> memo.txt`。'],
            en: ['Again with `>>`. `echo "2行目" >> memo.txt`.'],
          },
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
          instruction: {
            ja: '最後に `cat memo.txt` で 2 行揃って入っているか確認しましょう。',
            en: 'Finally, use `cat memo.txt` to confirm both lines are there.',
          },
          hints: {
            ja: ['`cat memo.txt` と入力。2 行とも表示されれば成功です。'],
            en: ['Type `cat memo.txt`. Success if both lines show.'],
          },
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
      title: { ja: 'vi でファイルを編集する', en: 'Edit a file with vi' },
      description: {
        ja: 'ターミナル文化の定番エディタ **vi** を体験します。3 つのモード (NORMAL / INSERT / COMMAND) を意識しながら、ファイルを開いて編集して保存する流れを覚えましょう。',
        en: 'Try **vi**, the classic terminal editor. Keeping the three modes (NORMAL / INSERT / COMMAND) in mind, learn the flow of opening, editing, and saving a file.',
      },
      steps: [
        {
          instruction: {
            ja: '`vi greeting.txt` で新しいファイルをエディタで開きましょう。起動直後は **NORMAL モード** です。',
            en: 'Open a new file in the editor with `vi greeting.txt`. Right after launch you are in **NORMAL mode**.',
          },
          hints: {
            ja: [
              '`vi <ファイル名>` でエディタが開きます。存在しないファイルは新規作成扱いになります。',
              '`vi greeting.txt` と入力して Enter。エディタ画面に切り替わったら次のステップへ。',
            ],
            en: [
              '`vi <filename>` opens the editor. A non-existent file is treated as new.',
              'Type `vi greeting.txt` and press Enter. Once the editor screen appears, move to the next step.',
            ],
          },
          check: { kind: 'command-name', name: 'vi' },
        },
        {
          instruction: {
            ja: 'エディタの中で `i` を押して INSERT モードに入り、`Hello terminarai` と書きましょう。書けたら `Esc` で NORMAL に戻り、`:wq` Enter で保存して終了します。',
            en: 'In the editor, press `i` to enter INSERT mode and type `Hello terminarai`. When done, press `Esc` to return to NORMAL, then `:wq` Enter to save and quit.',
          },
          hints: {
            ja: [
              'NORMAL で `i` → 下に "-- INSERT --" が出ます。これがタイプできる状態です。',
              '入力後 `Esc` で NORMAL、`:` で COMMAND モードに入って `wq` Enter で保存+終了。',
              '途中で間違えたら `:q!` Enter で破棄して抜け、もう一度 `vi greeting.txt` から。',
            ],
            en: [
              'In NORMAL, `i` → "-- INSERT --" appears at the bottom. That means you can type.',
              'After typing, `Esc` for NORMAL, `:` to enter COMMAND mode, then `wq` Enter to save and quit.',
              'If you slip up, `:q!` Enter discards and exits; start again from `vi greeting.txt`.',
            ],
          },
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
