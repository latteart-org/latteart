# テスト設計支援 操作説明書

テスト設計支援は探索的テストを実施する際に動的に行っているテスト設計を補助するための機能です。
本機能は以下の画面から構成されます。

- [テストヒント一覧](#テストヒント一覧)
  - [カスタムフィールド編集ボタン](#カスタムフィールド編集ボタン)
  - [テストヒント登録ボタン](#テストヒント登録ボタン)
  - [テストヒント編集ボタン](#テストヒント編集ボタン)
  - [テストヒントの削除ボタン](#テストヒントの削除ボタン)
  - [一覧の絞り込み](#一覧の絞り込み)

# テストヒント一覧

<img src="./images/test-hint-list.png"/>

テストヒント一覧では、探索的テストでテストを考えるためのヒントを一覧で表示され、以下の操作を行うことができます。

- カスタムフィールド編集
- テストヒント登録
- 一覧の絞り込み
- テストヒントの編集
- テストヒントの削除

## カスタムフィールド編集ボタン

 <img src="./images/edit-custom-field-button.png"/>

<img src="./images/edit-custom-field-dialog.png"/>

押下するとカスタムフィールド編集ダイアログが表示され、以下の必須項目以外のカラムを追加・編集・削除することができます。

- 必須項目
  - ヒント本文
  - テストマトリクス
  - グループ
  - テスト対象
  - 観点

## テストヒント登録ボタン

<img src="./images/register-test-hint-button.png"/>

<img src="./images/register-test-hint-dialog.png"/>

押下するとテストヒント登録ダイアログが表示され、テストヒントを登録することができます。  
また、テスト結果画面で対象範囲を選択して登録ダイアログを表示した場合は以下の情報がデフォルト値として入力されます。

- ストーリー情報
  - ストーリーに紐づくテスト結果を表示している場合、ストーリー情報(テストマトリクス、グループ、テスト対象、観点)がデフォルトで入力されます。
- キーワード
  - [テストヒント設定](../others/manual-config.md/#テストヒント設定)に基づき、対象となるコメントから作成されたキーワードが半角スペース区切りで入力されます。  
    :warning: キーワードは、半角スペース区切りで設定してください。
- 画面要素
  - テストヒント設定に基づき、対象となる操作の画面要素が入力されます。

## テストヒントの編集ボタン

<img src="./images/edit-test-hint-button.png"/>　

押下するとテストヒント編集ダイアログが表示され、テストヒントを編集することができます。

## テストヒントの削除ボタン

<img src="./images/delete-test-hint-button.png"/>　

押下すると確認ダイアログが表示され、OK ボタンを押下するとテストヒントを削除することができます。

## 一覧の絞り込み

<img src="./images/search.png"/>

一覧上部の「文字列検索」部分で任意の文字列を入力すると一覧を絞り込むことができます。