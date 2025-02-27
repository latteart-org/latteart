# LatteArt 導入手順書(Android 端末に対する記録)

---

## 事前準備

### LatteArt がインストールされている PC 側の設定

1. `adb`をインストールし、パスを通します。
   - SDK プラットフォームツールダウンロードサイト(https://developer.android.com/studio/releases/platform-tools?hl=ja)
     ※`adb`は SDK プラットフォームツールに含まれています。
1. テスト対象となる Android 端末の Chrome のバージョンに対応した`ChromeDriver`をダウンロードします。
   - 公式ダウンロードサイト(https://developer.chrome.com/docs/chromedriver/downloads?hl=ja)
1. `Appium`をインストールします。
   - 公式サイト(http://appium.io/)
1. `cwebp`をインストールし、パスを通します。
   - ダウンロードサイトからダウンロードする場合
     - ダウンロードサイト(https://developers.google.com/speed/webp/docs/precompiled)

### テスト対象の Android 端末の設定

1. Android 端末の開発者向けオプションを有効にし、「USB デバッグ」を ON にします。

---

## 実行

1. `Appium`サーバを起動します。
   - Android 端末側の Chrome のバージョンに対応した`ChromeDriver`のパスを指定して起動します。
1. Android 端末を LatteArt がインストールされている PC に USB で接続します。
1. LatteArt を起動します。
1. テスト記録開始画面の「プラットフォーム」設定で、「Android」を指定します。
1. テスト記録開始画面の「デバイスの詳細設定」で、USB 接続したデバイスを選択します。
1. 「記録を開始する」ボタンを押下すると、Android 実機端末側の Chrome が立ち上がり、記録が開始します。
