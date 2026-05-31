# Claude Code ガイドライン

## 個別対応・特別扱いを避ける

**特定の値・キー・条件への個別対応は原則禁止。設計の不整合が原因なら、設計を直す。**

悪い例：
- `if (key === 'background') { ... }` のような特定キーへの特別扱い
- 「このテンプレートだけ」処理を分岐させる
- 本来同じ仕組みで扱えるものを例外処理で対応する

正しいアプローチ：
- なぜ特別扱いが必要になったかを考え、設計の不整合を修正する
- データ（DB・定義ファイル）側を整合させ、コードは汎用的に保つ
- 「他のブロックと同じ扱いにするにはどうすればいいか」を先に考える

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
| `docs/legacy-maker-flow.md` | 旧メーカー（/card/vrchat）の導線設計・データフロー・マイグレーション仕様 |
| `docs/tasks.md` | タスク管理・作業記録・確定済み設計方針を一元管理 |

- 機能追加・変更時は関連する docs ファイルを更新する
- コンポーネント追加時は `docs/components.md` と `docs/testcases.md` を更新する
- ルートに spec 系の md を作成しない（`/docs` に集約）

## タスク管理

- **次にやること・残タスク・作業記録はすべて `docs/tasks.md` で管理する**
- タスクが完了したら `docs/tasks.md` の該当項目を ✅ に更新してから、コミットする
- 新しい作業記録は `docs/tasks.md` の末尾に日付付きで追記する
- 設計上の決定事項（「こうする」と決めたこと）は「確定済み設計方針」に追記する

## 現在の開発ロードマップ

### 目的
テンプレートを量産できる仕組みを作るため、**汎用テンプレートビルダー**を開発中。

### フェーズ一覧

#### ✅ フェーズ1: テンプレートビルダー画面の作成
- 汎用テンプレートビルダーUI の実装
- V1・V2 テンプレートの手動定義とカード表示画面の実装

#### ✅ フェーズ2: テンプレートビルダー上での V1・V2 再現
- テンプレートビルダー上で V1・V2 と同等のテンプレートが作成できることを確認
- 再現完了をもって「テンプレートビルダーが実用レベルに達した」と判断する

#### 🔄 フェーズ3: 既存 V1・V2 をテンプレートビルダー製テンプレートに置き換え（**現在ここ**）
- コードで手動定義されている V1・V2 を DB 管理のテンプレートに移行
- **V1 は既存メーカー利用者（`/card/vrchat`）のマイグレーションがメインの作業**
- 最終的に `v1Definition.ts` / `v2Definition.ts` / `v1.tsx` / `v2.tsx` を削除する

##### フェーズ3 の登り方

**ステップ1（調査完了）: データ形式の差異把握**

旧メーカー（`/card/vrchat`）は `CardTemplate` 型（`v1.tsx`）を使う**別システム**。
テンプレートビルダー V1 は `TemplateDefinition` 型（`v1Definition.ts`）で型が全く異なる。

旧 `BlockValues`（localStorage）と新 V1 `card_data` の主な差異：

| 旧キー | 旧型 | 新キー | 新型 |
|---|---|---|---|
| `sns.vrchatId` | string | `vrchat` | string |
| `sns.twitterId` | string | `x` | string |
| `sns.discordId` | string | `discord` | string |
| `sns.friendPolicy` | string | `friendPolicy` | string[] |
| `gender` | string | `gender` | `{ tag, display? }` |
| `language` | string[] | `language` | `{ preset: string[], custom: [] }` |
| `age.mode` | string | `age.searchTag` | string |

**ステップ2: カードエディタを DB からテンプレート定義を読む仕組みに変更（V2 で先行検証）**
- `v1Definition.ts` / `v2Definition.ts` はテスト用手動定義。DB のテンプレートビルダー製定義が「正」
- カードエディタ（`/card/[cardId]`）が DB からテンプレート定義を読むよう変更
- V2 で先に動作確認（既存ユーザーなし・リスクゼロ）
- TS 定義ファイルはこの段階ではフォールバックとして残す

**ステップ3: 旧メーカーの card_data を新 V1 形式に変換する関数を実装**
- `migrateV1LegacyData(old: BlockValues): NewV1CardData` を実装
- 上記の差異テーブルをすべて吸収する
- `migrateFromOld`（さらに古い形式からの変換）とは別レイヤー

**ステップ4: V1 の DB 化 + 旧メーカーの接続**
- カードエディタが V1 を DB から読む
- `/card/vrchat` のログイン後マイグレーション（`handleShareByUrl`）で変換関数を通す
- 既存 DB 保存済みカードの旧形式データも読み込み時に変換

**ステップ5: TS 定義を削除**
- `v1Definition.ts` / `v2Definition.ts` のフォールバックを外す
- `v1.tsx` / `v2.tsx` を削除
- `CardTemplate` 型が不要になれば型定義ごと削除

#### ⏳ フェーズ4: ベータテストに向けた新テンプレート作成
- TRPG・VTuber など向けテンプレートをテンプレートビルダーで作成
- ベータテスト開始
