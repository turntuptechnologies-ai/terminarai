import { PageShell } from '../components/PageShell'
import { type LocalizedText, loc, useLocale } from '../i18n'

interface Example {
  cmd: string
  note?: LocalizedText
}

interface CommandEntry {
  name: string
  desc: LocalizedText
  examples: Example[]
}

interface Section {
  title: LocalizedText
  description?: LocalizedText
  commands: CommandEntry[]
}

const SECTIONS: Section[] = [
  {
    title: { ja: 'ナビゲーション', en: 'Navigation' },
    commands: [
      {
        name: 'pwd',
        desc: {
          ja: '現在いるディレクトリの絶対パスを表示',
          en: 'Print the absolute path of the current directory',
        },
        examples: [{ cmd: 'pwd', note: { ja: '現在地を確認', en: 'Check where you are' } }],
      },
      {
        name: 'ls',
        desc: { ja: 'ディレクトリの中身を一覧表示', en: 'List the contents of a directory' },
        examples: [
          { cmd: 'ls', note: { ja: 'カレントディレクトリ', en: 'Current directory' } },
          {
            cmd: 'ls -l',
            note: {
              ja: '詳細表示 (パーミッション・サイズ・mtime)',
              en: 'Detailed view (permissions, size, mtime)',
            },
          },
          {
            cmd: 'ls -a',
            note: { ja: '隠しファイル + . / .. を表示', en: 'Show hidden files plus . / ..' },
          },
          {
            cmd: 'ls -A',
            note: {
              ja: '隠しファイル表示するが . / .. は出さない',
              en: 'Show hidden files but not . / ..',
            },
          },
          { cmd: 'ls -la', note: { ja: 'フラグを結合', en: 'Combine flags' } },
          { cmd: 'ls /etc', note: { ja: '指定パスの中身', en: 'Contents of a given path' } },
        ],
      },
      {
        name: 'cd',
        desc: { ja: 'ディレクトリを移動', en: 'Change directory' },
        examples: [
          { cmd: 'cd docs', note: { ja: '相対パス', en: 'Relative path' } },
          { cmd: 'cd /etc', note: { ja: '絶対パス', en: 'Absolute path' } },
          { cmd: 'cd ..', note: { ja: '親へ', en: 'To the parent' } },
          { cmd: 'cd ../..', note: { ja: '2 つ上へ', en: 'Two levels up' } },
          { cmd: 'cd ~  または  cd', note: { ja: 'ホーム (/home/user)', en: 'Home (/home/user)' } },
          {
            cmd: 'cd -',
            note: { ja: '直前のディレクトリへ戻る', en: 'Back to the previous directory' },
          },
        ],
      },
    ],
  },
  {
    title: { ja: 'ファイルの読み書き', en: 'Reading and writing files' },
    commands: [
      {
        name: 'cat',
        desc: { ja: 'ファイルの内容を出力', en: "Print a file's contents" },
        examples: [
          { cmd: 'cat README.txt' },
          {
            cmd: 'cat a.txt b.txt',
            note: { ja: '複数を順に連結', en: 'Concatenate several in order' },
          },
        ],
      },
      {
        name: 'echo',
        desc: {
          ja: '文字列を出力 (リダイレクトと組み合わせるとファイル作成にも)',
          en: 'Print a string (combine with redirection to also create files)',
        },
        examples: [
          { cmd: 'echo hello' },
          { cmd: 'echo -n hello', note: { ja: '末尾改行なし', en: 'No trailing newline' } },
          {
            cmd: 'echo "hello world"',
            note: { ja: 'クォートで空白込み', en: 'Quotes include spaces' },
          },
        ],
      },
      {
        name: 'head',
        desc: {
          ja: 'ファイルの先頭 N 行を表示 (既定 10 行)',
          en: 'Show the first N lines of a file (default 10)',
        },
        examples: [
          { cmd: 'head log.txt', note: { ja: '先頭 10 行', en: 'First 10 lines' } },
          {
            cmd: 'head -n 5 log.txt',
            note: { ja: '行数指定 (空白あり)', en: 'Line count (with space)' },
          },
          {
            cmd: 'head -5 log.txt',
            note: { ja: '行数指定 (GNU 短縮)', en: 'Line count (GNU short form)' },
          },
          { cmd: 'head --lines=5 log.txt', note: { ja: 'long 形', en: 'Long form' } },
        ],
      },
      {
        name: 'tail',
        desc: {
          ja: 'ファイルの末尾 N 行を表示 (既定 10 行)',
          en: 'Show the last N lines of a file (default 10)',
        },
        examples: [
          { cmd: 'tail log.txt', note: { ja: '末尾 10 行', en: 'Last 10 lines' } },
          { cmd: 'tail -n 5 log.txt', note: { ja: '行数指定', en: 'Line count' } },
          { cmd: 'tail -5 log.txt', note: { ja: 'GNU 短縮', en: 'GNU short form' } },
        ],
      },
      {
        name: 'grep',
        desc: {
          ja: 'パターン (正規表現) を含む行をファイルから抽出',
          en: 'Extract lines matching a pattern (regex) from a file',
        },
        examples: [
          { cmd: 'grep ERROR access.log', note: { ja: '単純文字列', en: 'Plain string' } },
          { cmd: 'grep -i error access.log', note: { ja: '大小区別なし', en: 'Case-insensitive' } },
          { cmd: 'grep -n INFO access.log', note: { ja: '行番号付き', en: 'With line numbers' } },
          {
            cmd: 'grep -v INFO access.log',
            note: { ja: '一致しない行', en: 'Non-matching lines' },
          },
          {
            cmd: 'grep -in error access.log',
            note: { ja: 'フラグ結合 OK', en: 'Flags can be combined' },
          },
          {
            cmd: 'grep "^WARN" log.txt',
            note: { ja: '正規表現 (^, $, [...] 等)', en: 'Regex (^, $, [...], etc.)' },
          },
        ],
      },
    ],
  },
  {
    title: { ja: 'ファイルとディレクトリの管理', en: 'Managing files and directories' },
    commands: [
      {
        name: 'mkdir',
        desc: { ja: 'ディレクトリを作成', en: 'Create a directory' },
        examples: [
          { cmd: 'mkdir foo', note: { ja: '1 階層', en: 'One level' } },
          {
            cmd: 'mkdir -p a/b/c',
            note: {
              ja: '深い階層を一括 (親も自動作成)',
              en: 'Deep path at once (parents auto-created)',
            },
          },
          { cmd: 'mkdir a b c', note: { ja: '複数を同時に', en: 'Several at once' } },
        ],
      },
      {
        name: 'touch',
        desc: {
          ja: '空ファイルを作成、または既存ファイルの mtime を更新',
          en: "Create an empty file, or update an existing file's mtime",
        },
        examples: [
          { cmd: 'touch file.txt' },
          { cmd: 'touch a.txt b.txt', note: { ja: '複数同時', en: 'Several at once' } },
        ],
      },
      {
        name: 'cp',
        desc: { ja: 'ファイル / ディレクトリをコピー', en: 'Copy files / directories' },
        examples: [
          { cmd: 'cp src.txt dst.txt', note: { ja: 'ファイル', en: 'File' } },
          {
            cmd: 'cp -r dir copy',
            note: { ja: 'ディレクトリは -r 必須', en: 'Directories require -r' },
          },
          {
            cmd: 'cp a.txt b.txt dest/',
            note: { ja: '複数を既存ディレクトリへ', en: 'Several into an existing directory' },
          },
        ],
      },
      {
        name: 'mv',
        desc: {
          ja: 'ファイル / ディレクトリを移動 or リネーム',
          en: 'Move or rename files / directories',
        },
        examples: [
          { cmd: 'mv old.txt new.txt', note: { ja: 'リネーム', en: 'Rename' } },
          {
            cmd: 'mv file.txt docs/',
            note: { ja: 'ディレクトリ配下へ移動', en: 'Move into a directory' },
          },
        ],
      },
      {
        name: 'rm',
        desc: { ja: '削除', en: 'Delete' },
        examples: [
          { cmd: 'rm file.txt', note: { ja: 'ファイル削除', en: 'Delete a file' } },
          {
            cmd: 'rm -r dir',
            note: { ja: 'ディレクトリは -r 必須', en: 'Directories require -r' },
          },
          {
            cmd: 'rm -f nope',
            note: { ja: '存在しなくてもエラー出さず', en: 'No error even if missing' },
          },
          { cmd: 'rm -rf foo', note: { ja: 'フラグ結合 OK', en: 'Flags can be combined' } },
        ],
      },
    ],
  },
  {
    title: { ja: '編集', en: 'Editing' },
    commands: [
      {
        name: 'vi',
        desc: {
          ja: 'ファイルをエディタで開いて編集 (NORMAL / INSERT / COMMAND の 3 モード)',
          en: 'Open and edit a file in the editor (three modes: NORMAL / INSERT / COMMAND)',
        },
        examples: [
          {
            cmd: 'vi note.txt',
            note: { ja: '新規 / 既存どちらでも OK', en: 'New or existing, both fine' },
          },
          {
            cmd: 'vi /home/user/README.txt',
            note: { ja: '絶対パスでも開ける', en: 'Can open by absolute path too' },
          },
        ],
      },
    ],
  },
  {
    title: { ja: 'その他', en: 'Other' },
    commands: [
      {
        name: 'clear',
        desc: { ja: 'ターミナルの表示履歴を空にする', en: 'Clear the terminal display history' },
        examples: [{ cmd: 'clear' }],
      },
    ],
  },
]

interface ShellFeature {
  title: LocalizedText
  examples: Example[]
}

const SHELL_FEATURES: ShellFeature[] = [
  {
    title: { ja: 'リダイレクト', en: 'Redirection' },
    examples: [
      { cmd: 'echo hi > file.txt', note: { ja: '上書き保存', en: 'Overwrite save' } },
      { cmd: 'echo more >> file.txt', note: { ja: '末尾に追記', en: 'Append to the end' } },
    ],
  },
  {
    title: { ja: 'クォート / エスケープ', en: 'Quoting / escaping' },
    examples: [
      { cmd: "echo 'a b'", note: { ja: 'シングル: 内部はリテラル', en: 'Single: literal inside' } },
      {
        cmd: 'echo "a b"',
        note: { ja: 'ダブル: \\" \\\\ のみ展開', en: 'Double: only \\" \\\\ are expanded' },
      },
      { cmd: 'echo a\\ b', note: { ja: '\\ で 1 文字エスケープ', en: '\\ escapes one character' } },
    ],
  },
  {
    title: { ja: 'パス展開', en: 'Path expansion' },
    examples: [
      { cmd: 'cd ~', note: { ja: '~ → /home/user', en: '~ → /home/user' } },
      {
        cmd: 'cat ~/docs/note',
        note: { ja: '~/path → /home/user/path', en: '~/path → /home/user/path' },
      },
      { cmd: 'cd ..', note: { ja: '.. は親、. は現在', en: '.. is parent, . is current' } },
    ],
  },
  {
    title: { ja: 'ワイルドカード (グロブ)', en: 'Wildcards (glob)' },
    examples: [
      { cmd: 'grep ERROR *.log', note: { ja: '* は任意の文字列', en: '* matches any string' } },
      {
        cmd: 'cat file?.txt',
        note: { ja: '? は任意の 1 文字', en: '? matches any single character' },
      },
      {
        cmd: 'ls [abc]*.txt',
        note: { ja: '[...] は文字クラス', en: '[...] is a character class' },
      },
      {
        cmd: 'cat docs/*.md',
        note: { ja: 'ディレクトリ配下も可', en: 'Works under directories too' },
      },
    ],
  },
  {
    title: { ja: 'キー操作', en: 'Keyboard' },
    examples: [
      {
        cmd: '↑ / ↓',
        note: { ja: 'コマンド履歴を遡る / 戻す', en: 'Go back / forward through command history' },
      },
      { cmd: 'Tab', note: { ja: 'コマンド名 / パスを補完', en: 'Complete command names / paths' } },
    ],
  },
  {
    title: { ja: 'vi の基本操作', en: 'vi basics' },
    examples: [
      {
        cmd: 'i',
        note: { ja: 'NORMAL → INSERT (入力開始)', en: 'NORMAL → INSERT (start typing)' },
      },
      { cmd: 'Esc', note: { ja: 'INSERT → NORMAL', en: 'INSERT → NORMAL' } },
      { cmd: ':w', note: { ja: 'NORMAL → COMMAND で保存', en: 'Save via NORMAL → COMMAND' } },
      { cmd: ':wq', note: { ja: '保存して終了', en: 'Save and quit' } },
      { cmd: ':q', note: { ja: '終了 (変更がない場合のみ)', en: 'Quit (only if unchanged)' } },
      { cmd: ':q!', note: { ja: '強制終了 (変更を破棄)', en: 'Force quit (discard changes)' } },
    ],
  },
]

const UNSUPPORTED: LocalizedText[] = [
  { ja: 'パイプ (|)', en: 'Pipes (|)' },
  { ja: '論理結合 (&&, ||)', en: 'Logical operators (&&, ||)' },
  {
    ja: '環境変数 ($VAR), コマンド置換 ($(cmd)), バッククォート (`...`)',
    en: 'Environment variables ($VAR), command substitution ($(cmd)), backticks (`...`)',
  },
  { ja: '入力リダイレクト (<)', en: 'Input redirection (<)' },
  { ja: 'バックグラウンド実行 (&)', en: 'Background execution (&)' },
  { ja: 'find / wc / chmod などのコマンド', en: 'Commands like find / wc / chmod' },
  { ja: '~user (他ユーザのホーム展開)', en: "~user (other users' home expansion)" },
]

function ExampleRow({ ex }: { ex: Example }) {
  const { locale } = useLocale()
  return (
    <li className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
      <code className="rounded bg-zinc-800/70 px-2 py-0.5 font-mono text-emerald-300 text-sm">
        {ex.cmd}
      </code>
      {ex.note && <span className="text-sm text-zinc-500">{loc(ex.note, locale)}</span>}
    </li>
  )
}

function CommandCard({ entry }: { entry: CommandEntry }) {
  const { locale } = useLocale()
  return (
    <div className="rounded-md border border-zinc-800 p-4">
      <div className="flex flex-wrap items-baseline gap-3">
        <code className="font-mono font-semibold text-base text-emerald-400">{entry.name}</code>
        <span className="text-sm text-zinc-400">{loc(entry.desc, locale)}</span>
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
  const { t, locale } = useLocale()
  return (
    <PageShell>
      <h1 className="font-semibold text-2xl">{t('reference.title')}</h1>
      <p className="mt-3 text-zinc-400 leading-relaxed">{t('reference.intro')}</p>

      {SECTIONS.map((section) => (
        <section key={loc(section.title, 'ja')} className="mt-8">
          <h2 className="border-zinc-800 border-b pb-2 font-semibold text-lg text-zinc-200">
            {loc(section.title, locale)}
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
          {t('reference.shellFeaturesTitle')}
        </h2>
        <div className="mt-3 space-y-3">
          {SHELL_FEATURES.map((feat) => (
            <div key={loc(feat.title, 'ja')} className="rounded-md border border-zinc-800 p-4">
              <p className="font-semibold text-sky-400 text-sm">{loc(feat.title, locale)}</p>
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
          {t('reference.unsupportedTitle')}
        </h2>
        <p className="mt-3 text-sm text-zinc-500">{t('reference.unsupportedIntro')}</p>
        <ul className="mt-3 space-y-1 text-sm text-zinc-400">
          {UNSUPPORTED.map((item) => (
            <li key={loc(item, 'ja')}>
              <span className="text-zinc-600">·</span> {loc(item, locale)}
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  )
}
