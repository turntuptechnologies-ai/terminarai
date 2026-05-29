# terminarai

[![CI / Deploy](https://github.com/turntuptechnologies-ai/terminarai/actions/workflows/deploy.yml/badge.svg)](https://github.com/turntuptechnologies-ai/terminarai/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Linux CLI 見習い道場 — ブラウザで Linux の基本コマンドを練習できる学習サイト

🔗 **Live**: <https://turntuptechnologies-ai.github.io/terminarai/>

`terminal` + `見習い (minarai)` から命名。

実際の Linux 環境ではなく、ブラウザ上でエミュレートされた**仮想シェル**でコマンド操作を学べます。
チュートリアルで基本を順に身につけ、自習問題で力試しができる構成です。

## 特徴

- 仮想ファイルシステム上で安全に基本コマンドを練習できる
- チュートリアル形式で順序立てて学習できる（**全8章 / 計38レッスン**）
- 自習問題で実践的に挑戦できる（**全16問**、easy / medium / hard の3段階）
- **日本語・英語の切り替え**に対応（UI・レッスン本文・自習問題・リファレンスすべて翻訳済み）
- Tab 補完つき、仮想 FS とレッスン進捗は localStorage に保存
- バックエンド不要、ブラウザだけで完結する純 SPA

## チュートリアル（全8章）

| 章 | タイトル | 主な内容 |
|----|----------|----------|
| 1 | ファイルシステムを覗く | `pwd` / `ls` / `ls` オプション / `cd` / ホーム復帰 |
| 2 | ファイルの中身を扱う | `cat` / `echo` / リダイレクト (`>`) / 絶対パス / `cd ..` |
| 3 | ファイルとディレクトリを管理する | `mkdir` / `cp` / `mv` / `rm`（`-p` / `-r`） |
| 4 | パスの世界を歩く | 相対パス・絶対パス・`.` / `..` / `~` |
| 5 | ファイルを編集する | `touch` / `>>` 追記 / `vi` |
| 6 | ファイルの一部だけ見る | `head` / `tail` |
| 7 | テキストを検索する | `grep` / `-i` / その他オプション |
| 8 | ワイルドカードを使いこなす | `*` / `?` / `[...]`（範囲・否定）/ サブディレクトリ |

## 学べるコマンド

`pwd`, `ls`, `cd`, `cat`, `echo`, `mkdir`, `touch`, `cp`, `mv`, `rm`, `head`, `tail`, `grep`, `vi`, `clear`

加えて、**リダイレクト** (`>`, `>>`) と **グロブ展開** (`*`, `?`, `[...]`) もサポート。

## 技術スタック

- React 19 + TypeScript + Vite 8
- Tailwind CSS v4（`@tailwindcss/vite` プラグイン）
- React Router v7
- Vitest 4 + Testing Library
- Biome 2（リント / フォーマット / import 並べ替え）

## ローカル開発

### 必要なもの

- Node.js 22 以上
- pnpm 10 以上

### セットアップ

```bash
pnpm install
```

### 開発サーバ起動

```bash
pnpm dev
```

ブラウザで http://localhost:5173 を開くと表示されます。

### その他のスクリプト

```bash
pnpm build         # 本番ビルド (dist/ に出力)
pnpm preview       # ビルド成果物をローカルで配信
pnpm test          # テスト (watch)
pnpm test:run      # テスト1回
pnpm check         # Biome でリント + フォーマット + import 並べ替え
```

## デプロイ

GitHub Pages で公開している。`main` への push をトリガに、
`.github/workflows/deploy.yml` (CI / Deploy ワークフロー) が自動でビルド・デプロイを行う。

- PR: `check` ジョブのみ実行 (Biome + test + build)
- main への push: `check` 後に `deploy` ジョブが Pages にデプロイ

### 仕組み

- Vite の `base` 設定 (`/terminarai/`) でサブパス対応
- React Router の `basename` に `import.meta.env.BASE_URL` を渡す
- `public/404.html` で SPA fallback (直接 `/terminarai/tutorial` 等にアクセスされても OK)

## ライセンス

MIT License — 詳細は [LICENSE](LICENSE) を参照。
