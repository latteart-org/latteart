![logo](/docs/logo.png)

# LatteArt とは

LatteArt は End-to-End テストの記録・可視化・分析を支援することで、アジリティの高い効率的なテストを目指す技術です。

以下のようなユースケースで利用できます。
- 探索的テストを可視化・分析してフィードバックを得たい
- 実施したテストの証跡を残したい
- バグの再現手順を共有したい
- 保守性の高いE2Eテストスクリプトを自動生成したい

LatteArt は以下の 2 つのツールで構成されています。
- **記録ツール**: テスト中の操作・気付きの記録
- **管理ツール**: 探索的テストの計画・テスト結果の管理・集計結果の可視化

## 主な機能
- テスターの操作・スクリーンショットの自動的な記録
- テスト中の思考や気づきの記録の支援
- 実施したテストの可視化
- 実施したテストの管理
- Page Object Pattern を利用した保守性の高いテストスクリプトの自動生成

# ドキュメント
- [LatteArt 導入手順書](./docs/startup/pc.md): LatteArt のインストール・起動方法
- [LatteArt チュートリアル（操作記録編）](./docs/tutorial/capture/tutorial-capture.md) : LatteArt を用いたテストの記録方法
- [LatteArt チュートリアル（テスト実践編）](./docs/tutorial/management/tutorial-management.md) : LatteArt を用いたテストの考え方、およびテストの実践
- [記録ツール 操作説明書](/docs/manual/capture/manual-capture.md): 記録ツールの各機能の詳細
- [管理ツール 操作説明書](../../manual/management/manual-management.md): 管理ツールの各機能の詳細

# インストール

「[LatteArt 導入手順書](./docs/startup/pc.md)」をご参照ください。

## 自分でビルドする場合

1. `latteart`ディレクトリを任意のディレクトリに配置します。
2. `latteart`ディレクトリ配下に以下の構成で`latteart-capture-cl`、`latteart-repository`を配置します。

```bash
latteart
      ├─ capture.vbs
      ├─ manage.vbs
      ├─ latteart
      ├─ latteart-capture-cl # 追加
      └─ latteart-repository # 追加
```

# 開発者向け

## プロジェクトセットアップ

1. `node.js v12.18.1`をインストールします。
1. 上記バージョンの node.js に対応した`yarn`をインストールします。
1. ソースコードのルートディレクトリに移動します。
1. 以下コマンドを実行します。
   ```bash
   yarn install
   ```
## LatteArt のビルド

1. ソースコードのルートディレクトリに移動します。
1. 以下コマンドを実行します。
   ```bash
   yarn package
   ```
1. `dist/latteart`に以下構成のディレクトリが作成されます。
   ```bash
   dist/latteart
       ├─ public # index.htmlとfavicon
       ├─ latteart.exe # Windows用実行ファイル
       └─ latteart # Mac用実行ファイル
   ```

## スナップショットビューアのビルド

※スナップショットビューアは`latteart-repository`のビルドで使用します。詳細は`latteart-repository`側の README をご確認ください。

1. ソースコードのルートディレクトリに移動します。
1. 以下コマンドを実行します。
   ```bash
   yarn build:viewer
   yarn build:viewer:history
   ```
1. カレントディレクトリに`snapshot-viewer`、`history-viewer`が作成されます。

## ウォッチ（開発用）

ソースコードの変更を検知して再ビルドします。

### GUI

1. ソースコードのルートディレクトリに移動します。
1. 以下コマンドを実行します。
   ```bash
   yarn watch:gui
   ```
1. カレントディレクトリに`dist`ディレクトリが作成され、配下にビルドされた`index.js`が出力されます（以降ソースコードを修正すると自動的に再ビルドされます）。
1. 以下コマンドを実行します。
   ```bash
   yarn start:server
   ```

### サーバ

1. ソースコードのルートディレクトリに移動します。
1. 以下コマンドを実行します。
   ```bash
   yarn watch:server
   ```
1. カレントディレクトリに`dist`ディレクトリが作成され、配下にビルドされた`index.js`が出力されます（以降ソースコードを修正すると自動的に再ビルドされます）。
1. 以下コマンドを実行します。
   ```bash
   yarn start:server
   ```

# コントリビューション

[LatteArtへのコントリビューション](./docs/contributing_ja.md)をご参照ください。

# 問い合わせ

LatteArt に関する質問等は GitHub の [Discussions](https://github.com/latteart-org/latteart/discussions) へお願いします。

その他のお問い合わせは、NTT ソフトウェアイノベ－ションセンタ（`iso-tool-support-p-ml [at] hco.ntt.co.jp`）までお願いします。

# License

This software is licensed under the Apache License, Version2.0.
