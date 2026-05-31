# 開発タスク管理

テストランナー: vitest（ユニット）/ `npx playwright test`（E2E、CI では実行しない）

---

## 次にやること

### フェーズ4 準備（優先度：高）

- [ ] **新テンプレート作成**（TRPG・VTuber 向け等）— テンプレートビルダーで作成
- [ ] **ベータテスト開始**

### 機能追加（優先度：中）

- [ ] **探索フィルター実装** — `gender`/`env`/`lang`/`friendPolicy` フィルターが `src/app/api/cards/explore/route.ts` に未実装（現状フリーテキスト検索のみ）
  - `tests/e2e/explore-search.spec.ts` は存在。実装後にテストが通ることを確認
  - Pro プランのみ有効にする（既存の `isPro` フラグを流用）

### 品質・テスト（優先度：中）

- [ ] **`/upgrade` ページ E2E** — `tests/e2e/upgrade.spec.ts` を新規作成（ページは `src/app/upgrade/page.tsx` に実装済み）
- [ ] **自動マイグレーション発動条件のユニットテスト**
  - データ変換テスト（`migrateV1Patterns.test.ts` 等）はカバー済み・685 件全パス
  - 未テスト: `CardEditor.tsx` line 327〜335 の `isLoggedIn && !cardId && localStorage にデータあり` 分岐
- [ ] **`/card/vrchat` の後方互換性テスト強化** — あらゆる旧データパターンを網羅

### DB・インフラ（優先度：中）

- [ ] **`announcements` テーブル DROP** — コード側参照は全削除済み。Supabase ダッシュボードまたは `DROP TABLE announcements;` で DB テーブルを削除
- [ ] **Supabase プロジェクト作り直し**
  - 目的: availability zone の設定ミス修正
  - 手順: DB スキーマ確定 → マイグレーションを 1 ファイルに集約 → 新プロジェクトに適用

### デザイン（随時）

- [ ] **デザイン修正** — 気になる箇所を随時修正

---

## 確定済み設計方針（変更時は必ず確認）

| 項目 | 決定内容 |
|---|---|
| `friendPolicy` の型 | `string` に統一（単一選択）。V1 定義は `select`、V2 旧変換は string のまま |
| 旧メーカー自動マイグレーション | V1 のみ対象。V2 の `migrateV2CardData` は DB 保存済みカードの変換で別物 |
| 界隈とカードの関係 | `card → template → community_templates` で導出。カード自身は界隈を持たない |
| `/card/vrchat` の実装方針 | テンプレート構造は `v1Definition`（TS・安定）。フォームセクションは DB から取得 |
| SNS リンク | `profile_links` テーブルで統合。`sns_links` は廃止済み |
| `cards.background` | `card_data` から分離した専用カラム。`GenericCardRenderer` は `background` prop のみ有効 |
| `backgroundKey`（テンプレート設定） | `sample_card_data` の後方互換・TemplateBuilder プレビュー用に残存。将来削除可 |
| テンプレート背景モード | `card_config.fixedBackground` で固定背景を管理。カスタムモードはユーザーが `cards.background` に保存 |
| お知らせ表示 | `AnnouncementBanner` 廃止。`NotificationBell`（ヘッダー）+ `system_notifications` テーブルに統一 |

---

## 作業ログ

### 2026-05-31（続き 2）

#### announcements 廃止

- `AnnouncementBanner` コンポーネント削除
- `card/[cardId]/edit/page.tsx` の `announcements` DB クエリ削除
- `CardEditorClient` / `CardEditor` / `ProfilePage` / `u/[slug]/page.tsx` の `announcements` prop 削除
- DB テーブル自体は未 DROP（手動対応待ち）

---

### 2026-05-31（続き）

#### TemplateBuilder リファクタ・機能追加

- `TemplateBuilder` を `savedLayouts`（DB）のみで動く形にリファクタ（`v1Definition` / `v2Definition` の admin 依存を削除）
- `fontFamily` を `card_config.fontFamily` に保存するよう修正（保存されていなかったバグ修正）
- `TemplateBuilderClient.handleLabelChange` の `setState updater` 内副作用バグを修正 + 回帰テスト追加
- TemplateBuilder に「サンプルに設定」ボタン追加（`sample_card_data` を UI から設定可能に）
- サンプルデータ保存時に base64 画像を 400px・JPEG 70% に圧縮（1MB 制限対策）
- TemplateBuilder にカスタム背景 / 固定背景の切り替え機能を追加（`card_config.fixedBackground`）

#### データ構造リファクタ

- `cards.background` カラム新設。背景を `card_data` から分離
- `GenericCardRenderer`: `background` prop のみ有効に変更（`backgroundKey` 読み取り廃止）
- 各ページ（CardEditor・CardViewClient・ProfilePage）は `card.background` をコンテナ背景に使用

#### admin コンポーネントページ

- `profileImage` を `complex` カテゴリに追加
- `profileImage` / `gallery` / `simple-sns` / `sns-with-friend-policy` の FormItem 見出しスタイルを統一

---

### 2026-05-31

#### テスト整備（フェーズ3 前提）

- `friendPolicy` を `string` に統一。V1 定義の `multi-select` → `select` に変更
- ユニットテスト 57 ケース追加（legacyCardDataMigration / migrateV1 / templateLayout 等）
- `testcases.md` に TC-9〜24 追記

#### フェーズ3 完了

- ステップ1〜5 完了（`v1.tsx` / `v2.tsx` 削除、DB テンプレートのみで動作）
- `v1Definition.ts` は `/card/vrchat` が意図的に使用するため残存

#### DB 正規化・機能追加

- `profile_links` テーブルへの正規化、`sns_links` / `platform_data` / `template` カラム削除
- 通知システム実装（`system_notifications` / `user_notifications`、`NotificationBell` UI）
- テンプレート選択画面のサンプルカード表示（`sample_card_data` カラム追加）
