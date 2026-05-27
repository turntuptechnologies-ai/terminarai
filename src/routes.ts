/**
 * アプリ全体のルートパスとビルダーをここに集約する。
 *
 * 散在するリテラル ("/tutorial/1/1-1") を排除し、ルート変更が 1 箇所で済むようにする。
 * ルートテーブル (`<Route path>`) は宣言時にこれらを使い、`<Link to>` も同様。
 *
 * 規約:
 * - `PATHS` は静的パス (パラメータなし) と React Router の path テンプレート
 * - `to*` 関数は URL を組み立てる (URL 用にエスケープが必要ならここで行う)
 */

export const PATHS = {
  home: '/',
  tutorial: '/tutorial',
  // React Router の path テンプレート (Route path= に渡す形)
  chapter: '/tutorial/:chapterId',
  lesson: '/tutorial/:chapterId/:lessonId',
  practice: '/practice',
  problem: '/practice/:problemId',
  sandbox: '/sandbox',
  reference: '/reference',
  notFound: '*',
} as const

/** チャプタ詳細ページへの URL (`/tutorial/${chapterId}`) */
export function toChapter(chapterId: string): string {
  return `/tutorial/${encodeURIComponent(chapterId)}`
}

/** レッスンページへの URL (`/tutorial/${chapterId}/${lessonId}`) */
export function toLesson(chapterId: string, lessonId: string): string {
  return `/tutorial/${encodeURIComponent(chapterId)}/${encodeURIComponent(lessonId)}`
}

/** 自習問題ページへの URL (`/practice/${problemId}`) */
export function toProblem(problemId: string): string {
  return `/practice/${encodeURIComponent(problemId)}`
}
