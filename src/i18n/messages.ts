export type Locale = 'ja' | 'en'

/** 切替 UI で並べる順 (先頭がデフォルト想定)。 */
export const LOCALES: Locale[] = ['ja', 'en']

/**
 * UI チロームのメッセージ辞書。
 *
 * Phase 1 の対象は「教材レイヤーのチローム」のみ:
 * ナビ / 見出し / ボタン / バナー / ステータス表示など固定文言。
 *
 * **対象外 (英語のまま or ja コンテンツのまま維持):**
 * - レッスン / 問題 / リファレンスの本文・ヒント (lessons 配下のデータ)
 * - エミュレートされた端末の出力・Linux エラー・プロンプト・vi の `-- INSERT --` 等
 *   (本物の Linux を学ぶ対象なので翻訳しない)
 *
 * キーは `domain.name` のドット区切り。`{name}` プレースホルダは t() の params で置換。
 */
export const MESSAGES: Record<Locale, Record<string, string>> = {
  ja: {
    // 共通
    'common.retry': 'もう一度挑戦する',
    // アプリ / レイアウト
    'app.tagline': 'Linux CLI 見習い道場',
    'app.skipToMain': '本文へスキップ',
    'nav.aria': '主要ナビゲーション',
    'breadcrumb.aria': '現在地',
    'nav.home': 'ホーム',
    'nav.tutorial': 'チュートリアル',
    'nav.practice': '自習問題',
    'nav.sandbox': 'サンドボックス',
    'nav.reference': 'リファレンス',
    'locale.aria': '表示言語',
    // ホーム
    'home.welcomeBefore': '',
    'home.welcomeAfter': ' へようこそ',
    'home.intro':
      'terminarai は、ブラウザ上でエミュレートされた仮想シェルで Linux の基本コマンドを練習できる学習サイトです。本物の Linux 環境に触れる前に、ここで安全に手を動かしてみてください。',
    'home.cta.tutorial.desc': '段階的にレッスンを進めて、Linux の基本コマンドを覚えます。',
    'home.cta.practice.desc': '与えられた課題に挑戦して、覚えたコマンドを試します。',
    'home.cta.sandbox.desc': '自由にコマンドを叩いて遊べる仮想ターミナル。',
    // チュートリアル一覧
    'tutorial.title': 'チュートリアル',
    'tutorial.intro':
      '順を追って Linux の基本コマンドを学べます。各レッスンには課題があり、クリアすると次に進めます。',
    'tutorial.empty': '現在準備中です。',
    'tutorial.lessonsCount': '全 {count} レッスン',
    // 章
    'chapter.label': '第 {id} 章',
    'chapter.notFound.title': '章が見つかりません',
    'chapter.notFound.desc': '指定された章は存在しないか、まだ準備中です。',
    'chapter.backToTutorial': 'チュートリアル一覧へ戻る',
    'lesson.label': 'レッスン {n}: ',
    // ステータス (章 / レッスン)
    'status.untouched': '未着手',
    'status.in-progress': '進行中',
    'status.completed': '完了',
    'status.progress': '{completed} / {total}',
    // 自習問題一覧
    'practice.title': '自習問題',
    'practice.intro':
      'チュートリアルで覚えたコマンドを、お題に挑戦する形で力試しします。手詰まったらヒントを開いて構いません。',
    'practice.problemLabel': '問題 {n}',
    'practice.status.solved': '解答済',
    'practice.status.unsolved': '未挑戦',
    'difficulty.easy': '初級',
    'difficulty.medium': '中級',
    'difficulty.hard': '上級',
    // レッスン本体 (LessonView)
    'lesson.completedBanner': '全てのステップをクリアしました。',
    'lesson.backToChapter': '← 章一覧へ戻る',
    'lesson.nextLesson': '次のレッスンへ →',
    'lesson.allChapters': '全章一覧へ',
    'lesson.retrying': '再挑戦中 (記録済みの完了は保持されます)',
    // 問題本体 (PracticeView)
    'practice.solvedBanner': '問題を解きました 🎉',
    'practice.backToList': '← 問題一覧へ戻る',
    'practice.nextProblem': '次の問題へ →',
    'practice.retrying': '再挑戦中 (解答済みの記録は保持されます)',
    // 共通: ステップ表示
    'step.label': 'ステップ {current} / {total}',
    // ヒント (HintReveal)
    'hint.show': 'ヒントを見る',
    'hint.next': '次のヒント ({revealed} / {total})',
    'hint.hide': 'ヒントを隠す',
    // サンドボックス
    'sandbox.banner':
      'サンドボックスへようこそ。\nコマンドを自由に試せます。ページを離れると状態はリセットされます。\n例: ls / cat README.txt / mkdir foo / echo hello > foo/bar.txt\n\n',
    // リファレンス (見出しと導入のみ。表の中身は ja コンテンツのまま)
    'reference.title': 'クイックリファレンス',
    'reference.intro':
      'terminarai で使えるコマンドと、シェルの基本的な機能の早見表です。チュートリアル中に「これどう書くんだっけ」と思ったらここを開いてください。',
    // 404
    'notFound.title': 'ページが見つかりません',
    'notFound.desc': '指定されたパスは存在しないようです。',
    'notFound.backHome': 'ホームへ戻る',
    // ターミナル / vi (a11y ラベル)
    'terminal.region': 'terminarai 仮想ターミナル',
    'terminal.output': 'ターミナル出力',
    'terminal.input': 'ターミナル入力',
    'vi.editArea': 'vi 編集領域',
    'vi.cmdInput': 'vi コマンド入力',
    'vi.unsaved': '未保存の変更あり',
  },
  en: {
    // common
    'common.retry': 'Try again',
    // app / layout
    'app.tagline': 'Linux CLI training dojo',
    'app.skipToMain': 'Skip to content',
    'nav.aria': 'Main navigation',
    'breadcrumb.aria': 'Breadcrumb',
    'nav.home': 'Home',
    'nav.tutorial': 'Tutorial',
    'nav.practice': 'Practice',
    'nav.sandbox': 'Sandbox',
    'nav.reference': 'Reference',
    'locale.aria': 'Display language',
    // home
    'home.welcomeBefore': 'Welcome to ',
    'home.welcomeAfter': '',
    'home.intro':
      'terminarai is a learning site where you practice basic Linux commands in an emulated shell, right in your browser. Get hands-on safely here before touching a real Linux environment.',
    'home.cta.tutorial.desc':
      'Work through lessons step by step to learn the basic Linux commands.',
    'home.cta.practice.desc': 'Take on challenges to test the commands you have learned.',
    'home.cta.sandbox.desc': 'A virtual terminal where you can freely try out commands.',
    // tutorial index
    'tutorial.title': 'Tutorial',
    'tutorial.intro':
      'Learn the basic Linux commands step by step. Each lesson has a task; clear it to move on to the next.',
    'tutorial.empty': 'Coming soon.',
    'tutorial.lessonsCount': '{count} lessons',
    // chapter
    'chapter.label': 'Chapter {id}',
    'chapter.notFound.title': 'Chapter not found',
    'chapter.notFound.desc': 'The requested chapter does not exist or is not ready yet.',
    'chapter.backToTutorial': 'Back to tutorial list',
    'lesson.label': 'Lesson {n}: ',
    // status (chapter / lesson)
    'status.untouched': 'Not started',
    'status.in-progress': 'In progress',
    'status.completed': 'Completed',
    'status.progress': '{completed} / {total}',
    // practice index
    'practice.title': 'Practice',
    'practice.intro':
      'Test the commands you learned in the tutorial by taking on challenges. Feel free to open the hints if you get stuck.',
    'practice.problemLabel': 'Problem {n}',
    'practice.status.solved': 'Solved',
    'practice.status.unsolved': 'Not attempted',
    'difficulty.easy': 'Beginner',
    'difficulty.medium': 'Intermediate',
    'difficulty.hard': 'Advanced',
    // lesson view
    'lesson.completedBanner': 'You cleared all the steps.',
    'lesson.backToChapter': '← Back to chapter',
    'lesson.nextLesson': 'Next lesson →',
    'lesson.allChapters': 'All chapters',
    'lesson.retrying': 'Retrying (your recorded completion is kept)',
    // practice view
    'practice.solvedBanner': 'Solved! 🎉',
    'practice.backToList': '← Back to problems',
    'practice.nextProblem': 'Next problem →',
    'practice.retrying': 'Retrying (your solved record is kept)',
    // common: step indicator
    'step.label': 'Step {current} / {total}',
    // hints
    'hint.show': 'Show hint',
    'hint.next': 'Next hint ({revealed} / {total})',
    'hint.hide': 'Hide hints',
    // sandbox
    'sandbox.banner':
      'Welcome to the sandbox.\nTry any command you like. State resets when you leave the page.\ne.g. ls / cat README.txt / mkdir foo / echo hello > foo/bar.txt\n\n',
    // reference (heading + intro only; the tables stay as ja content)
    'reference.title': 'Quick Reference',
    'reference.intro':
      'A cheat sheet of the commands available in terminarai and the basic shell features. Open this whenever you think "how do I write this again?" during a lesson.',
    // 404
    'notFound.title': 'Page not found',
    'notFound.desc': 'The requested path does not seem to exist.',
    'notFound.backHome': 'Back to home',
    // terminal / vi (a11y labels)
    'terminal.region': 'terminarai virtual terminal',
    'terminal.output': 'Terminal output',
    'terminal.input': 'Terminal input',
    'vi.editArea': 'vi edit area',
    'vi.cmdInput': 'vi command input',
    'vi.unsaved': 'Unsaved changes',
  },
}
