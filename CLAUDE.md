# Claude Code ガイドライン

## タスク完了時のコミット

タスクが完了したら必ずコミットすること。

## PRマージ前のE2E提案

PRを作成してマージしそうなタイミング（develop→main PR作成時、重要な機能追加のPR作成時など）では、
ローカルでのE2E実行を提案すること。
E2EはCIでは実行しない（時間がかかりすぎるため）。ローカル実行コマンド: `npx playwright test`

## /card/vrchat の変更方針

`src/app/card/vrchat/` 以下（旧メーカー）は既存ユーザーへの影響がない範囲でのみ変更可。
リファクタ・内部構造変更はOK。既存ユーザーが気づくようなUX変更はNG。

## ドキュメント管理

`/docs` 配下の Markdown ファイルを常に最新の状態に保つこと。

| ファイル | 内容 |
|---|---|
| `docs/spec.md` | サービス仕様・URL設計・テンプレート仕様 |
| `docs/components.md` | コンポーネント・ブロック・テンプレートの概念設計 |
| `docs/testcases.md` | テストケース一覧（E2E・ユニット） |

- 機能追加・変更時は関連する docs ファイルを更新する
- コンポーネント追加時は `docs/components.md` と `docs/testcases.md` を更新する
- ルートに spec 系の md を作成しない（`/docs` に集約）
