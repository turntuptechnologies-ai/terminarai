---
version: alpha
name: terminarai
description: >
  Linux CLI 見習い道場。
  ターミナル風のダークテーマで、emerald を主アクセントに据えた学習Webアプリ。
  UI は柔らかい sans (Inter + Noto Sans JP)、ターミナル・コード・ブランドマークは Cascadia Code。
colors:
  background: "#09090b"          # zinc-950, ページ全体の最下層
  surface: "#18181b"             # zinc-900, ヘッダ/カード/レッスン説明欄
  surfaceMuted: "#27272a"        # zinc-800, バッジ・アクティブナビ
  surfaceCode: "#27272ab2"       # zinc-800/70, インラインコード背景
  border: "#27272a"              # zinc-800, 既定の枠線
  borderMuted: "#3f3f46"         # zinc-700, やや薄い枠線
  textPrimary: "#f4f4f5"         # zinc-100, 本文
  textSecondary: "#a1a1aa"       # zinc-400, 補助テキスト
  textMuted: "#71717a"           # zinc-500, ラベル / プロンプトの ":"
  textDim: "#52525b"             # zinc-600, パンくず区切り
  accent: "#34d399"              # emerald-400, リンク / 完了 / プロンプト user@host
  accentLight: "#6ee7b7"         # emerald-300, インラインコード / 完了バッジ文字
  accentDeep: "#047857"          # emerald-700, 完了ボックスの枠
  info: "#38bdf8"                # sky-400, プロンプトの cwd / ヒントリンク / 進行中
  error: "#fb7185"               # rose-400, stderr / 上級難易度
  warning: "#fcd34d"             # amber-300, 中級難易度
typography:
  sans:
    fontFamily: "Inter, Noto Sans JP, system-ui, -apple-system, 'Segoe UI', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic', Meiryo, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: "'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.625
  heading1:
    fontFamily: "{typography.sans.fontFamily}"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.2
  heading2:
    fontFamily: "{typography.sans.fontFamily}"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.3
  heading3:
    fontFamily: "{typography.sans.fontFamily}"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
  brandMark:
    fontFamily: "{typography.mono.fontFamily}"
    fontSize: "18px"
    fontWeight: 600
  uxLabel:
    fontFamily: "{typography.sans.fontFamily}"
    fontSize: "12px"
    fontWeight: 500
    letterSpacing: "0.025em"
rounded:
  sm: "4px"                      # 既定 / バッジ / インラインコード
  md: "6px"                      # ステータスボックス / メッセージ
  lg: "8px"                      # カード (章 / レッスン / 問題)
spacing:
  1: 4
  2: 8
  3: 12
  4: 16
  5: 20
  6: 24
  8: 32
  10: 40
components:
  card:
    backgroundColor: "transparent"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.5}"
  cardHover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.5}"
  buttonPrimary:
    backgroundColor: "#04785733"   # emerald-700/20
    textColor: "{colors.accentLight}"
    typography: "{typography.sans}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  buttonSecondary:
    backgroundColor: "transparent"
    textColor: "{colors.textSecondary}"
    typography: "{typography.sans}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  codeInline:
    backgroundColor: "{colors.surfaceCode}"
    textColor: "{colors.accentLight}"
    typography: "{typography.mono}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  badgeDifficultyEasy:
    backgroundColor: "#064e3b66"   # emerald-900/40
    textColor: "{colors.accentLight}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  badgeDifficultyMedium:
    backgroundColor: "#78350f66"   # amber-900/40
    textColor: "{colors.warning}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  badgeDifficultyHard:
    backgroundColor: "#7f1d1d66"   # rose-900/40
    textColor: "{colors.error}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  badgeStatusUntouched:
    backgroundColor: "transparent"
    textColor: "{colors.textMuted}"
  badgeStatusInProgress:
    backgroundColor: "transparent"
    textColor: "{colors.info}"
  badgeStatusCompleted:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
  completionMessage:
    backgroundColor: "#064e3b4d"   # emerald-900/30
    textColor: "{colors.accentLight}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  terminal:
    backgroundColor: "{colors.background}"
    textColor: "{colors.textPrimary}"
    typography: "{typography.mono}"
    padding: "{spacing.4}"
---

## Overview

terminarai は **Linux CLI 見習い道場** という学習Webアプリで、ブラウザ上の仮想シェルで Linux 基本コマンドを練習する場を提供する。

ビジュアルは**ターミナル風の濃いダーク**を出発点に、UI 部分だけ柔らかい sans-serif で読みやすさを確保するハイブリッド。「ターミナルらしさ」と「web アプリの読みやすさ」を 1 つのアクセントカラー (emerald) でつなぐ。

設計の基調:
- **濃いめのモノクロ + ワンアクセント**: 色は zinc 階調を主とし、emerald を主アクセントに、sky / rose / amber は意味付け (情報・エラー・警告) でのみ使う。
- **2 つのフォント役割**: Inter + Noto Sans JP は読むため、Cascadia Code は「コードである / ターミナルである」を伝えるため。混在は意図のあるブランドマーク・コード語のみ。
- **フラット**: 影なし、グラデーションなし。階層は背景色のステップ (zinc-950 / -900 / -800) で表現する。
- **角丸は控えめ**: 4 / 6 / 8 px の 3 段階。pill 形状 (rounded-full) は使わない。

## Colors

`background → surface → surfaceMuted` の 3 段で奥行きを作る。ページ全体は zinc-950、説明欄やカードホバーは zinc-900、バッジ / インラインコードは zinc-800 系という階層。

`accent (emerald-400)` は「正常進行・成功・主アクション・ブランド」を背負う。CTA、リンクの hover、完了表示、プロンプトの `user@terminarai`、active なナビ、フォーカスリングはすべて emerald。

意味色は 3 つ:
- **info (sky-400)**: 進行中バッジ、プロンプトの cwd、ヒントの開閉ボタン。emerald とは違う「未完了だが進んでいる」状態を表す。
- **error (rose-400)**: stderr 出力、上級難易度バッジ、404 メッセージ。
- **warning (amber-300)**: 中級難易度のバッジ。

テキストは 4 段階 (`textPrimary` 〜 `textDim`) で重要度を表現。深いテキスト色 (textDim) はパンくずの区切り `/` のような構造的記号にのみ使う。

## Typography

3 系統:
1. **sans** (`Inter` + `Noto Sans JP`): UI 全般。英数は Inter、日本語は Noto Sans JP に自動切替 (CSS の font-family stack)。
2. **mono** (`Cascadia Code`): ターミナル本体・インラインコード・ブランドマーク "terminarai"。
3. システムフォールバックは両方とも CSS stack に含める (Google Fonts CDN 失敗時の保険)。

ヒエラルキー:
- `heading1` (30px / 600): ページタイトル
- `heading2` (24px / 600): セクションタイトル
- `heading3` (18px / 600): カードタイトル / レッスンタイトル
- `brandMark` (18px / 600 / mono): ヘッダのロゴ "terminarai"
- `uxLabel` (12px / 500 / tracking 0.025em): "ステップ 2 / 5" のような状態ラベル
- 本文は sans の 14-16px、密度の高い表は 12-14px

混フォントは慎重に: HomePage の見出し「terminarai へようこそ」では、最初の単語 `terminarai` だけ mono にしてブランドマーク兼用にする。それ以外の本文中に出てくる "terminarai" は sans のままで自然な読みを優先する。

## Layout

- **ページ最大幅**: `max-w-3xl` (48rem ≒ 768px)。本文中心のページ (Home, Tutorial, Practice, Reference) はすべてこの幅。
- **シェル系画面 (Sandbox / LessonView / PracticeView)**: 最大幅を設けず、ターミナル領域を full width で見せる。説明欄は上部に shrink-0 で固定、ターミナルは flex-1 min-h-0 で残り高さを占める。
- **ルート構造**: `html / body / #root: 100vh`, App ルートは `h-screen flex flex-col overflow-hidden`。`<main>` が `flex-1 min-h-0`、内部のスクロールは個別ページに委ねる。
- **ヘッダ**: shrink-0、左にブランドマーク + サブタイトル、右にナビ。狭い画面では縦積みで `flex-wrap` する。

スペーシングは Tailwind の `--spacing: 0.25rem` を基本単位とする 4px グリッド。要素間の縦リズムは `mt-3 / mt-4 / mt-8 / mt-10` を使い分け、横は `gap-2 / gap-3` が定番。

レスポンシブ:
- 既定はモバイル前提のシングルカラム
- `sm:` (640px〜) でヘッダ横並び / HomePage の 3 列グリッド
- 大画面では中央寄せの max-w-3xl で読みやすさを優先 (横に広がらない)

## Elevation & Depth

**実質的に影は使わない**。階層感は背景色の段階 (zinc-950 → zinc-900 → zinc-800) で表現する。

例外:
- フォーカスリング: `focus:outline-none` で OS 既定アウトラインを消した上で、Skip link や CTA は背景色の変化と border 色の変化 (`border-emerald-500/60`) でフォーカスを示す。
- Caret 色: ターミナル入力欄の caret は `caret-emerald-400` (アクセント色)。

z-index は基本不要。Skip link だけ `focus:z-10` でフローティング表示。

## Shapes

3 段階のラジアスで用途を区別:
- `rounded.sm` (4px): バッジ / インラインコード / 小さな枠
- `rounded.md` (6px): 完了メッセージなどステータス系のボックス
- `rounded.lg` (8px): カード (章カード・レッスンカード・問題カード)

完全な円 (`rounded-full`) や pill 形状は使わない。学習ツールという真面目さを保つため、装飾の派手さは避ける。

## Components

(YAML 側にトークンを定義。ここでは利用ガイドラインを書く。)

- **card** / **cardHover**: 章・レッスン・問題の一覧でリンクのコンテナとして使う。`border-zinc-800` の枠線が常時付き、hover で `border-emerald-500/60` + `bg-zinc-900` に変化。
- **buttonPrimary**: 「次のレッスンへ」「次の問題へ」のような主アクション。emerald の薄塗りで、hover でやや濃く。
- **buttonSecondary**: 「← 章一覧へ戻る」「全章一覧へ」のような戻り系。border のみ、塗りなし。
- **codeInline**: バッククォート `\`...\`` で囲まれた部分。FormattedText コンポーネントが分割して描画。Cascadia Code + emerald-300 + 薄い zinc 背景。
- **badgeDifficulty\***: 自習問題の初級 / 中級 / 上級。色だけで難度を表現するのは不親切なので、ラベル ("初級" 等) は必須。
- **badgeStatus\***: チャプタ / 問題の状態 (未着手 / 進行中 / 完了)。背景色を使わず、文字色だけで控えめに状態を伝える。
- **completionMessage**: レッスン完了 / 問題正解時のメッセージボックス。emerald 系の薄塗り。
- **terminal**: 出力履歴と入力欄を含むターミナル本体。背景 zinc-950、文字 zinc-100、フォント Cascadia Code。stderr 出力のみ rose-400 に切替。

## Do's and Don'ts

### Do

- **アクセントは emerald 一本に集約する**。複数の主色を使わない (sky / rose / amber は意味色のみ)。
- **Cascadia Code は「これはコードだ / これはターミナルだ / これはブランドだ」のシグナルとして使う**。読ませる文章は sans に。
- **混フォントは語境界 + 意図がある場合のみ**。例: HomePage の "terminarai へようこそ" の先頭単語だけ mono。
- **新しい状態 (進行中 / 完了 等) を追加するときは、テキストラベルと色のセットで伝える**。色だけに頼らない。
- **角丸の段階を守る** (sm / md / lg のいずれか)。中間値を新設しない。
- **インラインコードはバッククォート \`...\` で書く** (FormattedText が自動で codeInline に変換)。

### Don't

- **白背景を使わない**。dark テーマ前提で、`bg-white` / `bg-zinc-50/100` を出さない。
- **影 (box-shadow) を増やさない**。階層は背景色のステップで表現する。
- **rounded-full / pill 形状を使わない**。badge ですら sm 角丸に揃える。
- **アクセント色を装飾目的で散らさない**。emerald は意味のある場所 (リンク・成功・主アクション・ブランド) のみ。
- **本文中の英単語を勝手に mono にしない**。コードを意味する場合のみバッククォート経由で。
- **Tailwind の色を hex で直書きしない**。トークン (`text-emerald-400` 等) を経由する。新しいトークンが必要なら DESIGN.md に追記してから使う。
- **Cascadia Code を本文 (説明文) に使わない**。可読性が落ちる。
