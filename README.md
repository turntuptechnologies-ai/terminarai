# terminarai

> Linux CLI 見習い道場 — ブラウザで Linux の基本コマンドを練習できる学習サイト

`terminal` + `見習い (minarai)` から命名。

実際の Linux 環境ではなく、ブラウザ上でエミュレートされた**仮想シェル**でコマンド操作を学べます。
チュートリアルで基本を身につけ、自習問題で力試しができる構成を目指しています。

## 特徴（予定）

- 仮想ファイルシステム上で安全に基本コマンドを練習できる
- チュートリアル形式で順序立てて学習できる
- 自習問題で実践的に挑戦できる
- バックエンド不要、ブラウザだけで完結する純 SPA

## 学べるコマンド（MVP 想定）

`pwd`, `ls`, `cd`, `mkdir`, `touch`, `cat`, `echo`, `rm`, `cp`, `mv`

その後、`find`, `grep`, `wc`, `chmod` などを順次追加予定。

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

## ライセンス

未定（公開時に検討）
