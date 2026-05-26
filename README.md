# terminarai

[![CI / Deploy](https://github.com/turntuptechnologies-ai/terminarai/actions/workflows/deploy.yml/badge.svg)](https://github.com/turntuptechnologies-ai/terminarai/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Linux CLI 見習い道場 — ブラウザで Linux の基本コマンドを練習できる学習サイト

🔗 **Live**: <https://turntuptechnologies-ai.github.io/terminarai/>

`terminal` + `見習い (minarai)` から命名。

実際の Linux 環境ではなく、ブラウザ上でエミュレートされた**仮想シェル**でコマンド操作を学べます。
チュートリアルで基本を身につけ、自習問題で力試しができる構成を目指しています。

## 特徴

- 仮想ファイルシステム上で安全に基本コマンドを練習できる
- チュートリアル形式で順序立てて学習できる (現在: 第1〜2章 / 計10レッスン)
- 自習問題で実践的に挑戦できる (準備中)
- バックエンド不要、ブラウザだけで完結する純 SPA
- Tab 補完つき、レッスン進捗は localStorage に保存

## 学べるコマンド

`pwd`, `ls`, `cd`, `mkdir`, `touch`, `cat`, `echo`, `rm`, `cp`, `mv`

リダイレクト (`>`, `>>`) もサポート。

## 技術スタック

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router v7
- Vitest + Testing Library
- Biome

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

- PR: `check` ジョブのみ実行 (lint + test + build)
- main への push: `check` 後に `deploy` ジョブが Pages にデプロイ

### 仕組み

- Vite の `base` 設定 (`/terminarai/`) でサブパス対応
- React Router の `basename` に `import.meta.env.BASE_URL` を渡す
- `public/404.html` で SPA fallback (直接 `/terminarai/tutorial` 等にアクセスされても OK)

## ライセンス

MIT License — 詳細は [LICENSE](LICENSE) を参照。
