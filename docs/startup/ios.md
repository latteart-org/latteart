# LatteArt 導入手順書(iOS 端末に対する記録)

## 事前準備

### LatteArt がインストールされている Mac 側の設定

1. `ios-webkit-debug-proxy`をインストールします。
   - 公式サイト(https://github.com/google/ios-webkit-debug-proxy)
1. `Appium`をインストールします。
   - 公式サイト(http://appium.io/)
1. `cwebp`をインストールし、パスを通します。
   - ダウンロードサイトからダウンロードする場合
     - ダウンロードサイト(https://developers.google.com/speed/webp/docs/precompiled)
1. iOS 端末を LatteArt がインストールされている Mac に USB で接続します。
1. `Appium`配下の`WebDriverAgentRunner`の設定を行います。

   - 参考サイト(http://appium.io/docs/en/drivers/ios-xcuitest-real-devices/)

   :warning: 途中、iOS 実機端末側で App(iOS 実機端末に転送された WebDriverAgentRunner)の検証と、「信頼されていない開発元(⾃分)」の信頼が必要になるため、iOS の「設定」→「⼀般」→「デバイス管理」から⾏うこと。

### テスト対象の iOS 端末の設定

1. iOS 端末の「設定」→「Safari」→「詳細」から、「Web インスペクタ」を ON にします。

## 実行

1. `Appium`サーバを起動します。
1. iOS 端末を LatteArt がインストールされている Mac に USB で接続します。
1. LatteArt を起動します。
1. テスト記録開始画面の「プラットフォーム」設定で、「iOS」を指定します。
1. テスト記録開始画面の「デバイスの詳細設定」で、USB 接続したデバイスを選択します。
1. 「記録を開始する」ボタンを押下すると、iOS 実機端末側の Safari が立ち上がり、記録が開始します。
