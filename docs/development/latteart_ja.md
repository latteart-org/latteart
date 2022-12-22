# latteart パッケージの開発

## 環境のセットアップ

開発に必要な以下ソフトウェアを開発環境にインストールします。

- Git
- Node.js v14.15.3
- Yarn

全てのインストールが完了したら、`latteart`リポジトリを clone し、以下を実行します。

```bash
$ cd latteart
$ yarn install
```

## 開発用コマンド

```bash
# 静的解析
$ yarn lint

# テストの実行
$ yarn test:unit

# フロントエンド側ソースコードの変更検知、再ビルド、フロントエンド開発用サーバ起動(port:3000)
$ yarn serve

# バックエンド側ソースコードの変更検知、再ビルド
$ yarn watch:server

# ビルド済サーバの起動(port:3000)
$ yarn start:server
```

## パッケージのビルド

:bulb: `launch`パッケージも合わせてビルドされます。

```bash
$ yarn package
```

`dist/latteart`に以下構成のディレクトリが作成されます。

```bash
dist/latteart/
  ├─ capture.bat # バッチファイル
  ├─ manage.bat  # バッチファイル
  ├─ launch.config.json # バッチ実行設定ファイル
  ├─ launch # Mac用実行ファイル
  ├─ launch.exe # Windows用実行ファイル
  ├─ latteart/
  │        ├─ public/ # index.htmlとfavicon
  │        ├─ latteart # Mac用実行ファイル
  │        └─ latteart.exe # Windows用実行ファイル
  └─ latteart-repository/
          ├─ history-viewer/ # スナップショットビューア(レビュー画面)
          └─ snapshot-viewer/ # スナップショットビューア
```
