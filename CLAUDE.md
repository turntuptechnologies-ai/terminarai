# terminarai — CLAUDE 向け開発ガイド

## プロジェクト概要

terminarai は Linux 初学者向けに、ブラウザ上で Linux CLI の基本コマンドを学ぶ Web アプリケーション。
実際の Linux 環境ではなく、JavaScript で実装された**仮想シェル + 仮想ファイルシステム**を用いた CLI エミュレータ。
チュートリアル形式で学習し、自習問題に挑戦できる構成を目指す。

名前の由来: terminal + 見習い (minarai)

## 技術スタック

- **言語**: TypeScript
- **UI フレームワーク**: React 19
- **ビルド**: Vite
- **スタイリング**: Tailwind CSS v4（`@tailwindcss/vite` プラグイン）
- **ルーティング**: React Router v7
- **テスト**: Vitest + Testing Library
- **リンタ・フォーマッタ**: Biome
- **パッケージ管理**: pnpm
- **ホスティング**: 当面ローカル開発のみ。将来的に GitHub Pages を想定（純 SPA）

**バックエンドなし**。仮想 FS とレッスン進捗は localStorage に保存する純粋なクライアントサイドアプリ。

## 開発フロー

- **リポジトリはプライベート**（公開リポにする予定だが、まずはローカルで完成度を上げてから公開）
- **機能追加は Issue → ブランチ作成 → PR → merge** の流れを厳守
- **main への直接 push は禁止**
- **GitHub 上のやりとり（Issue / PR / コミットメッセージ / コードコメント）は日本語**
- ブランチ名は英語の kebab-case 推奨（例: `feat/virtual-fs`, `fix/cd-bug`）

## 主なコマンド

```bash
# 開発サーバ起動 (http://localhost:5173)
pnpm dev

# 本番ビルド (dist/ に出力)
pnpm build

# ビルド成果物をローカルで確認
pnpm preview

# テスト実行 (watch モード)
pnpm test

# テスト1回実行
pnpm test:run

# テストUI
pnpm test:ui

# カバレッジ付きテスト
pnpm test:coverage

# Biome でリント
pnpm lint

# Biome でフォーマット (書き込み)
pnpm format

# Biome で lint + format + import 並べ替え (書き込み)
pnpm check
```

## プロジェクト構成（現時点）

```
terminarai/
├── src/
│   ├── App.tsx          # ルートコンポーネント
│   ├── App.test.tsx     # サンプルテスト
│   ├── main.tsx         # エントリポイント
│   ├── index.css        # Tailwind import + 基本スタイル
│   └── test/setup.ts    # Vitest セットアップ
├── public/              # 静的アセット
├── index.html           # HTML エントリ
├── vite.config.ts       # Vite + Vitest 設定
├── tsconfig.app.json    # アプリ用 TS 設定
├── tsconfig.node.json   # Node スクリプト用 TS 設定
├── tsconfig.json        # ルート TS 設定
├── biome.json           # Biome 設定
└── package.json
```

## 設計方針（メモ）

- **仮想ファイルシステム**は in-memory のツリー構造で表現し、localStorage で永続化する想定
- **コマンド実装**は 1 コマンド 1 モジュール、入出力をオブジェクトで返す関数として実装し、ユニットテストしやすくする
- **ターミナル UI** は xterm.js を使わず、自前の DOM 実装（軽量・初学者向け誘導 UI が足しやすい）
- **チュートリアル** は段階的レッスン（章立て）、**自習問題** は仮想 FS の状態を判定してクリア
- 詳細な実装は Issue 単位で議論・実装する

## 環境メモ

- Node.js / pnpm 利用前に `eval "$(mise activate bash)"` が必要な場合あり
- Git 設定済みユーザ: NOTO Ai <iam.noto.ai@gmail.com>
- GitHub アカウント: `ai-noto`（Org: `turntuptechnologies-ai`）
