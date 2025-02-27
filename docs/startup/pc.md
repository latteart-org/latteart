# LatteArt 導入手順書

本書では、LatteArt をインストールし、テストの記録を開始するまでの手順を説明します。

# 事前準備

1. Chrome のバージョンに対応した`ChromeDriver`をダウンロードし、パスを通します。
   - ダウンロードサイト (https://developer.chrome.com/docs/chromedriver/downloads?hl=ja)
1. テスト対象の Web アプリケーションに Google Chrome からアクセスできることを確認します。

:bulb: Edge を使用する場合は、手順１で Chrome ではなく、Edge のバージョンに対応した`edgedriver`をダウンロードし、パスを通します。

- ダウンロードサイト（https://developer.microsoft.com/ja-jp/microsoft-edge/tools/webdriver/）

# 事前準備(オプション)

テストの記録中にスクリーンショットを取得する際、オプションで画像の圧縮を行うことができます(詳細は「[マニュアル](../manual/others/manual-config.md/#画像圧縮設定)」参照)。

圧縮には`cwebp`を利用します。画像の圧縮を利用する場合は以下に従ってインストールしてください。

1. `cwebp`をインストールし、パスを通します。
   - ダウンロードサイト (https://developers.google.com/speed/webp/docs/precompiled)

# インストール

以下の2種類のディストリビューションがあります。お好みのディストリビューションを選択してインストールしてください。

- **Node.js版**
  - 実行環境にインストールされているNode.jsを用いて実行する版です。ご利用の前にNode.jsをインストールする必要があります。
- **実行ファイル版**
  - Node.jsが同梱された実行ファイル形式版です。Node.jsを別途インストールする必要はありませんが、Node.jsのバージョンは**v18**で固定になります。

## Node.js版 インストール手順

1. 事前に「[Node.js公式のダウンロードサイト](https://nodejs.org/ja/download)」から以下バージョンのNode.jsをダウンロードし、インストールしてください。

   - **Node.js v22.13.1**

2. GitHub の「[Releases](https://github.com/latteart-org/latteart/releases)」から LatteArtのNode.js版 (`latteart-v〇〇〇-node.zip`) をダウンロードして下さい。

ダウンロードした zip ファイルを解凍すると、以下のディレクトリ構成になっています。

```bash
latteart-v〇〇〇-node/
      ├─ latteart.bat
      ├─ latteart.command
      ├─ launch.config.json
      ├─ launch/
      ├─ latteart/
      ├─ latteart-capture-cl/
      ├─ latteart-repository/
      └─ node_modules/
```

## 実行ファイル版 インストール手順

1. GitHub の [Releases](https://github.com/latteart-org/latteart/releases) からLatteArtのWin版 (`latteart-v〇〇〇-win.zip`) をダウンロードして下さい。

ダウンロードした zip ファイルを解凍すると、以下のディレクトリ構成になっています。

```bash
latteart-v〇〇〇-win/
      ├─ latteart.bat
      ├─ launch.config.json
      ├─ launch.exe
      ├─ latteart/
      ├─ latteart-capture-cl/
      └─ latteart-repository/
```

# ツール構成

- LatteArt は、主にテスト記録・テスト管理の 2 つの機能群から構成されます。
- 各機能は左側のサイドメニューから選択します。選択された機能は、右側に表示されます。  
  :bulb:また、メニューバーは開閉可能です。

<div align="center">
   <img src="./images/side-menu.png" width="480"/> 
</div><br>

- **テスト記録**: テスターの操作・気付きの記録

<div align="center">
   <img src="./images/capture-tool.png" width="480"/> 
</div><br>

- **テスト管理**: テストの計画・結果の管理

<div align="center">
   <img src="./images/management-tool.png" width="480"/> 
</div><br>

以下の図は LatteArt の全体像を表したものです。
管理者（テスト管理者）は、テスト管理機能を用いてテストの品質や進捗のチェックを行います。
試験者（テスト実施者）は、テスト記録機能を用いてテスト対象 Web アプリケーションのテストを実行します。テスト結果は、テスト管理機能でセッションへ紐づけを行います。

<div class="column">
  <img src="./images/system.png" width="650"/>
</div>

# ツール起動

解凍したディレクトリの中の起動用スクリプトを実行します。

- `latteart.bat`

すると、以下のメッセージが表示されたコマンドプロンプトと共に LatteArt を動作させるための Web サーバが立ち上がり、ブラウザ上で LatteArt の画面が表示されます。

```
LatteArt: http://127.0.0.1:3000?capture=http://127.0.0.1:3001&repository=http://127.0.0.1:3002
```

:bulb: サーバが起動していれば、以下 URL をブラウザで直接開いても利用できます。

- http://127.0.0.1:3000

すぐにテストを開始する場合は「[LatteArt チュートリアル （操作記録編）](/docs/tutorial/capture/tutorial-capture.md)」をご参照ください。

LatteArt を用いたテストの考え方、および実践については 「[LatteArt チュートリアル （テスト実践編）](/docs/tutorial/management/tutorial-management.md)」をご参照ください。

## 起動スクリプトの設定

- LatteArt を表示するブラウザの変更

  `launch.config.json` の `browser` を変更してください。
  `null` もしくは未設定の場合、OS に設定されているデフォルトのブラウザで LatteArt が起動します。

  指定可能なブラウザは以下です。

  | OS      | ブラウザ       | 設定値          |
  | ------- | -------------- | --------------- |
  | Windows | Google Chrome  | `chrome`        |
  |         | Microsoft Edge | `msedge`        |
  | Mac     | Google Chrome  | `google chrome` |

  ```jsonc
  {
    "browser": "chrome",
    // ...
  }
  ```

- 起動スクリプトが起動する各サーバのポート変更

  `servers` 配下の変更したいサーバの `env.port` と `http.url` を変更してください。

  :warning: `env.port` と `http.url` のポート部分は同じ値をいれてください。

  ```jsonc
  {
    // ...
    "servers": [
      {
        "name": "latteart-repository",
        // ...
        "env": { "port": "13002" },
        "http": {
          "url": "http://localhost:13002",
          // ...
        },
      },
      // ...
    ],
  }
  ```

# ツール終了

起動時に立ち上がったコマンドプロンプトのウィンドウを閉じて終了します。

:warning: ブラウザ上で LatteArt のタブを閉じるだけではサーバは終了しません。

# Mac での利用（実験的）

GitHub の [Releases](https://github.com/latteart-org/latteart/releases) からLatteArtのMac版 (`latteart-v〇〇〇-mac.zip`) をダウンロードして下さい。

ダウンロードした zip ファイルを解凍すると、以下のディレクトリ構成になっています。

```bash
latteart-v〇〇〇-mac/
      ├─ latteart.command
      ├─ launch.config.json
      ├─ launch
      ├─ latteart/
      ├─ latteart-capture-cl/
      └─ latteart-repository/
```

以下のファイルに実行権限を付与します。

```bash
chmod +x ./latteart.command
chmod +x ./launch
chmod +x latteart/latteart
chmod +x latteart-capture-cl/latteart-capture-cl
chmod +x latteart-repository/latteart-repository
```

以下起動用スクリプトを実行すると LatteArt が起動し、Windows 版と同様に利用できます。

- `latteart.command`

:bulb: 「ダウンロードしたアプリケーションの実行許可」を求められた場合は、「システム環境設定の」の「セキュリティとプライバシー」から許可してください。  
:bulb: `開発元を検証できないため開けません`というメッセージのダイアログが表示された場合は、一旦「キャンセル」を選択し、「システム環境設定の」の「セキュリティとプライバシー」から許可してください。  
:bulb: `開発元を検証できません。開いてもよろしいですか?`というメッセージのダイアログが表示された場合は、「開く」を選択してください。
