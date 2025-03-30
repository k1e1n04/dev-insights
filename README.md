<h1 align="center">Dev Insights</h1>
<p align="center">
    <br />
    このVsCode拡張機能は、VsCodeの<a href="https://code.visualstudio.com/api/extension-guides/language-model">言語モデルAPI</a>を使用して、GtiHub Copilotを拡張することでローカル環境でRAGを作成することを目的としています。
</p>

<p align="center">
  <a href="https://github.com/k1e1n04/dev-insights/blob/main/LICENSE" target="_blank">
      <img src="https://img.shields.io/static/v1?label=license&message=Apache 2.0&color=white" alt="License">
  </a>
</p>

## サポートするモデル

| ベンダー       | モデル名 |
| -------------- | -------- |
| GitHub Copilot | `gpt-4o` |

## サポートするベクターDB

| DB | Embeddingモデル |
| -------------- | ---------------- |
| ChromaDB       | `all-MiniLM-L6-v2` ※1 |

※1: OpenAIのAPIキーを利用したEmbeddingはサポートしていません。

## 機能

VsCode の GitHub Copilot Chat 内で`@devinsight`をメンションすることで、対話が開始されます。

### 1. ファイルのインポート

`/importFiles`コマンドを使用し、ディレクトリを選択することで、ソースコードやドキュメントをインポートすることができます。
インポートされたファイルはベクトルデータベース(ChromaDB)に保存されます。

サポートしている拡張子はこちらを参照してください。([supportedExtensions.ts](./src/constants/supportedExtensions.ts))
取り込み対象外となるディレクトリはこちらを参照してください。([excludeDirs.ts](./src/constants/excludeDirs.ts))

### 2. 質問と回答機能

ユーザーが入力した質問に対して、アプリは関連するドキュメントを検索し、最適な回答を生成します。この機能は、以下のプロセスで実現されます。

1. ユーザーが質問を入力。
2. アプリは、ベクトルデータベースから関連するドキュメントを検索。
3. AIがその情報を基に質問に対する回答を生成。
4. 結果をユーザーに返答。

## 特記事項

- 本拡張機能はGitHub Copilot Chatを利用している方のみ使用可能です。
- 生成された回答は、必ずしも正確であるとは限りません。生成されたコードは、必ずご自身で確認してください。
- 生成されたソースコード・ドキュメントは基本的には利用者の著作物となりますが、GitHub Copilotの利用規約に従ってください。

## 免責事項

- 本機能を使用することによって生じた損害について、開発者は一切の責任を負いません。
