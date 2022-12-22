# launch パッケージの開発

## 環境のセットアップ

開発に必要な以下ソフトウェアを開発環境にインストールします。

- Git
- Node.js v14.15.3
- Yarn

全てのインストールが完了したら、`latteart`リポジトリを clone し、以下を実行します。

```bash
$ cd latteart/launch
$ yarn install
```

## 開発用コマンド

```bash
# ソースコードの変更検知、再ビルド
$ yarn watch

# ビルド済サーバの起動
$ node dist/main.js
```

## パッケージのビルド

```bash
$ yarn package
```

`dist`に以下構成のディレクトリが作成されます。

```bash
dist/
  ├─ mac/
  │   └─ launch # Mac用実行ファイル
  ├─ win/
  │   └─ launch.exe # Windows用実行ファイル
  ├─ capture.bat # バッチファイル
  ├─ manage.bat  # バッチファイル
  └─ launch.config.json # バッチ実行設定ファイル
```
