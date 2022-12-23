# LatteArtへのコントリビューション

## Issues
GitHub の [Issues](https://github.com/latteart-org/latteart/issues) を使用してください。

### バグ
- バグを報告する際は、`Bug report` テンプレートを使用してください。
- Labels には `bug` を付与してください。

### 機能追加
- 新たな機能追加を要求する際は、`Feature request` テンプレートを使用してください。
- Labels には `enhancement` を付与してください。

## 質問

GitHubの [Discussions](https://github.com/latteart-org/latteart/discussions) 機能をご利用ください。

## プルリクエスト
- コントリビュータは、fork したリポジトリ上で topic branch を作成し、latteart-org 配下のリポジトリの develop branch に対して Pull Request を行ってください。
    - topic branch のブランチ名は任意とします。
- コントリビュータは、[DCO](https://developercertificate.org/)に同意する必要があります。
    - DCOに同意していることを示すため、全てのコミットに対して、コミットメッセージに以下を記入してください。
        - `Signed-off-by: Random J Developer <random@developer.example.org>`
            - 氏名の部分は、本名を使用してください。
            - GitHubのProfileのNameにも同じ名前を設定する必要があります。
            - `git commit -s` でコミットに署名を追加できます。
- Pull Request を発行する際は、対応する Issue に紐づけてください。
    - 対応する Issue がない場合は Pull Request の発行前に作成してください。
- Pull Request のタイトルには、"fix"に続いて対処したissue番号および修正の概要を記入してください。
    - latteart リポジトリ上での修正は、`fix #[issue番号] [修正の概要]`
    - latteart-capture-cl、latteart-repository での修正は、`fix latteart-org/latteart#[issue番号] [修正の概要]`
- Pull Request の本文は、テンプレートを使用してください。

## コーディングスタイル
- eslint によるチェックを通るようにコーディングしてください。