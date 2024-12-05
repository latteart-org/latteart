![logo](/docs/logo.png)

# LatteArt とは

LatteArt は End-to-End テストの記録・可視化・分析を支援することで、アジリティの高い効率的なテストを目指す技術です。

以下のようなユースケースで利用できます。

- 探索的テストを可視化・分析してフィードバックを得たい
- 実施したテストの証跡を残したい
- バグの再現手順を共有したい
- 保守性の高い E2E テストスクリプトを自動生成したい

LatteArt は大きく分けて 2 つ機能から構成されています。

- **テスト記録**: テスト中の操作・気付きの記録
- **テスト管理**: 探索的テストの計画・テスト結果の管理・集計結果の可視化

## 主な機能

- テスターの操作・スクリーンショットの自動的な記録
- テスト中の思考や気づきの記録の支援
- 実施したテストの可視化
- 実施したテストの管理
- ページオブジェクトパターンを利用した保守性の高いテストスクリプトの自動生成

## 拡張機能

- [ext-speech-recognition](https://github.com/latteart-org/ext-speech-recognition) : マイクから入力された音声を文字列に変換し、テスト中のコメントとして記録する拡張機能

# ドキュメント

- [LatteArt 導入手順書](./docs/startup/pc.md): LatteArt のインストール・起動方法
- [LatteArt チュートリアル（操作記録編）](./docs/tutorial/capture/tutorial-capture.md) : LatteArt を用いたテストの記録方法
- [LatteArt チュートリアル（テスト実践編）](./docs/tutorial/management/tutorial-management.md) : LatteArt を用いたテストの考え方、およびテストの実践
- [LatteArt チュートリアル（Extension開発）](./docs/tutorial//extension/tutorial-extension.md) : LatteArt の拡張機能開発の実践
- [テスト記録 操作説明書](./docs/manual/capture/manual-capture.md): テスト記録の各機能の詳細
- [テスト設計支援 操作説明書](./docs/manual/test-design-support/manual-test-design-support.md): テスト設計支援の各機能の詳細
- [テスト管理 操作説明書](./docs/manual/management/manual-management.md): テスト管理の各機能の詳細
- [テストスクリプト自動生成](./docs/manual/common/test-script-generation.md): テストスクリプト自動生成機能の詳細
- [設定 操作説明書](./docs/manual/others/manual-config.md): テスト管理の各機能の詳細

# インストール

[LatteArt 導入手順書](./docs/startup/pc.md)をご参照ください。

# コントリビューション

[LatteArt へのコントリビューション](./docs/contributing_ja.md)をご参照ください。

# 問い合わせ

LatteArt に関する質問等は GitHub の [Discussions](https://github.com/latteart-org/latteart/discussions) へお願いします。

その他のお問い合わせは、NTT ソフトウェアイノベ－ションセンタ（`latteart-p-ml [at] ntt.com`）までお願いします。

# 研究者の方へ

もし研究で LatteArt を利用される場合は、以下の論文を引用いただきますようお願いいたします。

```
@INPROCEEDINGS{Kirinuki2023,
  author={Kirinuki, Hiroyuki and Tajima, Masaki and Haruto, Tanno},
  booktitle={2023 IEEE Conference on Software Testing, Verification and Validation (ICST)},
  title={LatteArt: A Platform for Recording and Analyzing Exploratory Testing},
  year={2023},
  pages={443-453},
  doi={10.1109/ICST57152.2023.00048}}
```

さらに、LatteArt のテスト生成機能を利用される場合は、以下の論文も引用いただきますようお願いいたします。:

```
@article{Kirinuki2022,
  title={Automating End-to-End Web Testing via Manual Testing},
  author={Hiroyuki Kirinuki and Haruto Tanno},
  journal={Journal of Information Processing},
  volume={30},
  pages={294-306},
  year={2022},
  doi={10.2197/ipsjjip.30.294}
}
```

# License

This software is licensed under the Apache License, Version2.0.
