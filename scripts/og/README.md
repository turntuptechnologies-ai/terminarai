# OGP 画像の生成

SNS シェア用の OGP 画像 (`public/og-image.png`, 1200×630) を生成する手順。

## 元データ

- `scripts/og/og-image.html` — 画像のレイアウト (HTML/CSS)
  - フォントは Google Fonts (JetBrains Mono / Noto Sans JP) を CDN から読み込む
  - 配色はアプリ本体に合わせている (背景 zinc-950 / emerald アクセント)

## 生成コマンド

`og-image.html` を編集したら、リポジトリのルートで以下を実行して PNG を再生成する。

```bash
google-chrome --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1200,630 \
  --virtual-time-budget=12000 --timeout=20000 \
  --screenshot=public/og-image.png \
  "file://$(pwd)/scripts/og/og-image.html"
```

- `--virtual-time-budget` は Web フォントの読み込み完了を待つため (ネット接続が必要)
- 実行時に出る `dbus` 関連のエラーログは無害 (PNG は正常に生成される)

## メタタグ

`index.html` の `<head>` に OGP / Twitter Card のメタタグを記載している。
画像 URL は GitHub Pages の絶対 URL を直書きしている (クローラがビルド後の URL を
解決できるようにするため)。デプロイ先 URL が変わった場合は併せて更新すること。
