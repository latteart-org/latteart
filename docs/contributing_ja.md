# LatteArt へのコントリビューション

## バグの報告・機能追加要望

GitHub の [Issues](https://github.com/latteart-org/latteart/issues) を使用してください。

### バグ

- バグを報告する際は、`Bug report` テンプレートを使用してください。
- Labels には `bug` を付与してください。

### 機能追加

- 新たな機能追加を要求する際は、`Feature request` テンプレートを使用してください。
- Labels には `enhancement` を付与してください。

## 質問

GitHub の [Discussions](https://github.com/latteart-org/latteart/discussions) 機能をご利用ください。

## 開発

LatteArt は以下のパッケージから構成され、複数の GitHub リポジトリで管理されています。

| GitHub リポジトリ   | パッケージ          | 説明                         |
| ------------------- | ------------------- | ---------------------------- |
| latteart            | launch              | 各サーバ起動用コマンド       |
|                     | latteart            | GUI サーバ                   |
| latteart-capture-cl | latteart-capture-cl | ブラウザ操作情報取得用サーバ |
| latteart-repository | latteart-repository | データ保存用サーバ           |

:warning: Issues は全て`latteart`リポジトリ配下で管理しているため注意してください。

LatteArt の各パッケージは以下のように連携して動作します。

```mermaid
flowchart LR
  subgraph LatteArt
    direction LR
    launch(launch)
    latteart(latteart)
    capturecl(latteart-capture-cl)
    repository(latteart-repository)

    latteart -- HTTP --> capturecl
    latteart <-- WebSocket --> capturecl
    latteart -- HTTP --> repository

    launch -- exec process --> capturecl
    launch -- exec process --> latteart
    launch -- exec process --> repository
  end

  driver(<b>Browser driver</b><br><i>eg. ChromeDriver</i>)
  browser(<b>Test target browser</b><br><i>eg. Chrome</i>)
  classDef externals fill:#fbb,stroke:#f33
  class driver,browser externals

  driver <--> browser
  capturecl <--> driver
```

### Web API

`latteart-capture-cl`、`latteart-repository`との通信で使用する Web API は以下を参照してください。

- latteart-capture-cl
  - [REST API リファレンス](https://latteart-org.github.io/latteart-capture-cl/)
  - [WebSocket API リファレンス](https://github.com/latteart-org/latteart-capture-cl/blob/main/docs/socketIOEvents.md)
- latteart-repository
  - [REST API リファレンス](https://latteart-org.github.io/latteart-repository/)

### パッケージの開発

各パッケージの開発環境のセットアップ、開発用コマンド、ビルド方法等は以下を参照してください。

- [launch パッケージの開発](./development/launch_ja.md)
- [latteart パッケージの開発](./development/latteart_ja.md)
- [latteart-capture-cl パッケージの開発](https://github.com/latteart-org/latteart-capture-cl/blob/main/docs/development_ja.md)
- [latteart-repository パッケージの開発](https://github.com/latteart-org/latteart-repository/blob/main/docs/development_ja.md)

### パッケージの統合

各パッケージのビルドで作成された`latteart`、`latteart-capture-cl`、`latteart-repository`ディレクトリを統合します。

`latteart`ディレクトリ配下に以下の構成で`latteart-capture-cl`、`latteart-repository`を配置します。

```bash
latteart/
    ├─ capture.bat
    ├─ manage.bat
    ├─ launch.config.json
    ├─ launch.exe
    ├─ latteart/
    ├─ latteart-capture-cl/ # 追加
    └─ latteart-repository/ # マージ
```

## プルリクエスト

- コントリビュータは、最初に LatteArt の各リポジトリを fork してください。
- コントリビュータは、fork したリポジトリ上で topic branch を作成し、latteart-org 配下のリポジトリの develop branch に対して Pull Request を行ってください。
  - topic branch のブランチ名は任意です。
- コントリビュータは、[DCO](https://developercertificate.org/)に同意する必要があります。
  - DCO に同意していることを示すため、全てのコミットに対して、コミットメッセージに以下を記入してください。
    - `Signed-off-by: Random J Developer <random@developer.example.org>`
      - 氏名の部分は、本名を使用してください。
      - GitHub の Profile の Name にも同じ名前を設定する必要があります。
      - `git commit -s` でコミットに署名を追加できます。
- Pull Request を発行する際は、対応する Issue に紐づけてください。
  - 対応する Issue がない場合は Pull Request の発行前に作成してください。
- Pull Request のタイトルには、"fix"に続いて対処した issue 番号および修正の概要を記入してください。
  - `latteart`リポジトリでの修正は、`fix #[issue番号] [修正の概要]`
  - `latteart-capture-cl`、`latteart-repository`での修正は、`fix latteart-org/latteart#[issue番号] [修正の概要]`
- Pull Request の本文は、テンプレートを使用してください。

## コーディングスタイル

- 静的解析によるチェックを通るようにコーディングしてください。
