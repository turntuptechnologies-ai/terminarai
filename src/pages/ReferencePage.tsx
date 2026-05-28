import { PageShell } from '../components/PageShell'

interface Example {
  cmd: string
  note?: string
}

interface CommandEntry {
  name: string
  desc: string
  examples: Example[]
}

interface Section {
  title: string
  description?: string
  commands: CommandEntry[]
}

const SECTIONS: Section[] = [
  {
    title: 'ナビゲーション',
    commands: [
      {
        name: 'pwd',
        desc: '現在いるディレクトリの絶対パスを表示',
        examples: [{ cmd: 'pwd', note: '現在地を確認' }],
      },
      {
        name: 'ls',
        desc: 'ディレクトリの中身を一覧表示',
        examples: [
          { cmd: 'ls', note: 'カレントディレクトリ' },
          { cmd: 'ls -l', note: '詳細表示 (パーミッション・サイズ・mtime)' },
          { cmd: 'ls -a', note: '隠しファイル + . / .. を表示' },
          { cmd: 'ls -A', note: '隠しファイル表示するが . / .. は出さない' },
          { cmd: 'ls -la', note: 'フラグを結合' },
          { cmd: 'ls /etc', note: '指定パスの中身' },
        ],
      },
      {
        name: 'cd',
        desc: 'ディレクトリを移動',
        examples: [
          { cmd: 'cd docs', note: '相対パス' },
          { cmd: 'cd /etc', note: '絶対パス' },
          { cmd: 'cd ..', note: '親へ' },
          { cmd: 'cd ../..', note: '2 つ上へ' },
          { cmd: 'cd ~  または  cd', note: 'ホーム (/home/user)' },
          { cmd: 'cd -', note: '直前のディレクトリへ戻る' },
        ],
      },
    ],
  },
  {
    title: 'ファイルの読み書き',
    commands: [
      {
        name: 'cat',
        desc: 'ファイルの内容を出力',
        examples: [{ cmd: 'cat README.txt' }, { cmd: 'cat a.txt b.txt', note: '複数を順に連結' }],
      },
      {
        name: 'echo',
        desc: '文字列を出力 (リダイレクトと組み合わせるとファイル作成にも)',
        examples: [
          { cmd: 'echo hello' },
          { cmd: 'echo -n hello', note: '末尾改行なし' },
          { cmd: 'echo "hello world"', note: 'クォートで空白込み' },
        ],
      },
      {
        name: 'head',
        desc: 'ファイルの先頭 N 行を表示 (既定 10 行)',
        examples: [
          { cmd: 'head log.txt', note: '先頭 10 行' },
          { cmd: 'head -n 5 log.txt', note: '行数指定 (空白あり)' },
          { cmd: 'head -5 log.txt', note: '行数指定 (GNU 短縮)' },
          { cmd: 'head --lines=5 log.txt', note: 'long 形' },
        ],
      },
      {
        name: 'tail',
        desc: 'ファイルの末尾 N 行を表示 (既定 10 行)',
        examples: [
          { cmd: 'tail log.txt', note: '末尾 10 行' },
          { cmd: 'tail -n 5 log.txt', note: '行数指定' },
          { cmd: 'tail -5 log.txt', note: 'GNU 短縮' },
        ],
      },
      {
        name: 'grep',
        desc: 'パターン (正規表現) を含む行をファイルから抽出',
        examples: [
          { cmd: 'grep ERROR access.log', note: '単純文字列' },
          { cmd: 'grep -i error access.log', note: '大小区別なし' },
          { cmd: 'grep -n INFO access.log', note: '行番号付き' },
          { cmd: 'grep -v INFO access.log', note: '一致しない行' },
          { cmd: 'grep -in error access.log', note: 'フラグ結合 OK' },
          { cmd: 'grep "^WARN" log.txt', note: '正規表現 (^, $, [...] 等)' },
        ],
      },
    ],
  },
  {
    title: 'ファイルとディレクトリの管理',
    commands: [
      {
        name: 'mkdir',
        desc: 'ディレクトリを作成',
        examples: [
          { cmd: 'mkdir foo', note: '1 階層' },
          { cmd: 'mkdir -p a/b/c', note: '深い階層を一括 (親も自動作成)' },
          { cmd: 'mkdir a b c', note: '複数を同時に' },
        ],
      },
      {
        name: 'touch',
        desc: '空ファイルを作成、または既存ファイルの mtime を更新',
        examples: [{ cmd: 'touch file.txt' }, { cmd: 'touch a.txt b.txt', note: '複数同時' }],
      },
      {
        name: 'cp',
        desc: 'ファイル / ディレクトリをコピー',
        examples: [
          { cmd: 'cp src.txt dst.txt', note: 'ファイル' },
          { cmd: 'cp -r dir copy', note: 'ディレクトリは -r 必須' },
          { cmd: 'cp a.txt b.txt dest/', note: '複数を既存ディレクトリへ' },
        ],
      },
      {
        name: 'mv',
        desc: 'ファイル / ディレクトリを移動 or リネーム',
        examples: [
          { cmd: 'mv old.txt new.txt', note: 'リネーム' },
          { cmd: 'mv file.txt docs/', note: 'ディレクトリ配下へ移動' },
        ],
      },
      {
        name: 'rm',
        desc: '削除',
        examples: [
          { cmd: 'rm file.txt', note: 'ファイル削除' },
          { cmd: 'rm -r dir', note: 'ディレクトリは -r 必須' },
          { cmd: 'rm -f nope', note: '存在しなくてもエラー出さず' },
          { cmd: 'rm -rf foo', note: 'フラグ結合 OK' },
        ],
      },
    ],
  },
  {
    title: '編集',
    commands: [
      {
        name: 'vi',
        desc: 'ファイルをエディタで開いて編集 (NORMAL / INSERT / COMMAND の 3 モード)',
        examples: [
          { cmd: 'vi note.txt', note: '新規 / 既存どちらでも OK' },
          { cmd: 'vi /home/user/README.txt', note: '絶対パスでも開ける' },
        ],
      },
    ],
  },
  {
    title: 'その他',
    commands: [
      {
        name: 'clear',
        desc: 'ターミナルの表示履歴を空にする',
        examples: [{ cmd: 'clear' }],
      },
    ],
  },
]

interface ShellFeature {
  title: string
  examples: Example[]
}

const SHELL_FEATURES: ShellFeature[] = [
  {
    title: 'リダイレクト',
    examples: [
      { cmd: 'echo hi > file.txt', note: '上書き保存' },
      { cmd: 'echo more >> file.txt', note: '末尾に追記' },
    ],
  },
  {
    title: 'クォート / エスケープ',
    examples: [
      { cmd: "echo 'a b'", note: 'シングル: 内部はリテラル' },
      { cmd: 'echo "a b"', note: 'ダブル: \\" \\\\ のみ展開' },
      { cmd: 'echo a\\ b', note: '\\ で 1 文字エスケープ' },
    ],
  },
  {
    title: 'パス展開',
    examples: [
      { cmd: 'cd ~', note: '~ → /home/user' },
      { cmd: 'cat ~/docs/note', note: '~/path → /home/user/path' },
      { cmd: 'cd ..', note: '.. は親、. は現在' },
    ],
  },
  {
    title: 'ワイルドカード (グロブ)',
    examples: [
      { cmd: 'grep ERROR *.log', note: '* は任意の文字列' },
      { cmd: 'cat file?.txt', note: '? は任意の 1 文字' },
      { cmd: 'ls [abc]*.txt', note: '[...] は文字クラス' },
      { cmd: 'cat docs/*.md', note: 'ディレクトリ配下も可' },
    ],
  },
  {
    title: 'キー操作',
    examples: [
      { cmd: '↑ / ↓', note: 'コマンド履歴を遡る / 戻す' },
      { cmd: 'Tab', note: 'コマンド名 / パスを補完' },
    ],
  },
  {
    title: 'vi の基本操作',
    examples: [
      { cmd: 'i', note: 'NORMAL → INSERT (入力開始)' },
      { cmd: 'Esc', note: 'INSERT → NORMAL' },
      { cmd: ':w', note: 'NORMAL → COMMAND で保存' },
      { cmd: ':wq', note: '保存して終了' },
      { cmd: ':q', note: '終了 (変更がない場合のみ)' },
      { cmd: ':q!', note: '強制終了 (変更を破棄)' },
    ],
  },
]

const UNSUPPORTED = [
  'パイプ (|)',
  '論理結合 (&&, ||)',
  '環境変数 ($VAR), コマンド置換 ($(cmd)), バッククォート (`...`)',
  '入力リダイレクト (<)',
  'バックグラウンド実行 (&)',
  'find / wc / chmod などのコマンド',
  '~user (他ユーザのホーム展開)',
]

function ExampleRow({ ex }: { ex: Example }) {
  return (
    <li className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
      <code className="rounded bg-zinc-800/70 px-2 py-0.5 font-mono text-emerald-300 text-sm">
        {ex.cmd}
      </code>
      {ex.note && <span className="text-sm text-zinc-500">{ex.note}</span>}
    </li>
  )
}

function CommandCard({ entry }: { entry: CommandEntry }) {
  return (
    <div className="rounded-md border border-zinc-800 p-4">
      <div className="flex flex-wrap items-baseline gap-3">
        <code className="font-mono font-semibold text-base text-emerald-400">{entry.name}</code>
        <span className="text-sm text-zinc-400">{entry.desc}</span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {entry.examples.map((ex) => (
          <ExampleRow key={ex.cmd} ex={ex} />
        ))}
      </ul>
    </div>
  )
}

export function ReferencePage() {
  return (
    <PageShell>
      <h1 className="font-semibold text-2xl">クイックリファレンス</h1>
      <p className="mt-3 text-zinc-400 leading-relaxed">
        terminarai で使えるコマンドと、シェルの基本的な機能の早見表です。
        チュートリアル中に「これどう書くんだっけ」と思ったらここを開いてください。
      </p>

      {SECTIONS.map((section) => (
        <section key={section.title} className="mt-8">
          <h2 className="border-zinc-800 border-b pb-2 font-semibold text-lg text-zinc-200">
            {section.title}
          </h2>
          <div className="mt-3 space-y-3">
            {section.commands.map((cmd) => (
              <CommandCard key={cmd.name} entry={cmd} />
            ))}
          </div>
        </section>
      ))}

      <section className="mt-10">
        <h2 className="border-zinc-800 border-b pb-2 font-semibold text-lg text-zinc-200">
          シェルの機能
        </h2>
        <div className="mt-3 space-y-3">
          {SHELL_FEATURES.map((feat) => (
            <div key={feat.title} className="rounded-md border border-zinc-800 p-4">
              <p className="font-semibold text-sky-400 text-sm">{feat.title}</p>
              <ul className="mt-3 space-y-1.5">
                {feat.examples.map((ex) => (
                  <ExampleRow key={ex.cmd} ex={ex} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="border-zinc-800 border-b pb-2 font-semibold text-lg text-zinc-200">
          未対応の機能
        </h2>
        <p className="mt-3 text-sm text-zinc-500">
          以下は本物の Linux にはあるが、terminarai では未実装です (将来追加予定)。
        </p>
        <ul className="mt-3 space-y-1 text-sm text-zinc-400">
          {UNSUPPORTED.map((item) => (
            <li key={item}>
              <span className="text-zinc-600">·</span> {item}
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  )
}
