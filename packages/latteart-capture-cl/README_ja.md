# latteart-capture-cl

## 設定ファイル

デフォルト設定以外で動作させたい場合は、設定ファイル(`latteart.capturecl.config.json`) を `latteart-capture-cl` ディレクトリ直下に作成してください。
設定ファイルが存在しない場合は、以下の設定として動作します。

```json
{
  "captureMode": "cdp",
  "remoteDebuggingPort": 9222
}
```

設定ファイルで設定可能な項目は以下です。
非必須のプロパティについては、未指定の場合デフォルト値が使用されます。

| プロパティ             | 必須 | 型     | デフォルト値                 | 説明                                                        |
| ---------------------- | ---- | ------ | ---------------------------- | ----------------------------------------------------------- |
| `captureMode`          |      | 文字列 | `cdp`                        | 記録モード。`cdp`、`webdriver` のいずれかを指定可能。       |
| `remoteDebuggingPort`  |      | 数値   | `9222`                       | 記録対象ブラウザのリモートデバッグポート番号。              |
| `chromeExecutablePath` |      | 文字列 | Chromeの標準インストールパス | 記録モードが`cdp`の場合に使用するChromeの実行ファイルパス。 |
| `edgeExecutablePath`   |      | 文字列 | Edgeの標準インストールパス   | 記録モードが`cdp`の場合に使用するEdgeの実行ファイルパス。   |
| `acceptInsecureCerts`  |      | 真偽値 | `false`                      | 記録モードが`cdp`の場合に証明書エラーを無視するか           |

## 開発用コマンド

```bash
# テストの実行
$ npm run test

# ソースコードのビルド
$ npm run build

# ソースコードの変更検知、再ビルド
$ npm run watch

# ビルド済スクリプトの実行(port:3001)
$ npm run run
```

## Web API

- [REST API リファレンス](https://latteart-org.github.io/latteart/docs/api/latteart-capture-cl/rest/main/)
- [WebSocket API リファレンス](./docs/api/websocket.md)
