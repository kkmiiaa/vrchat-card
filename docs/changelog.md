# 開発ログ

このファイルは開発の大きな節目・変更をまとめた記録です。
コミット単位の詳細は `git log` を参照。

---

## 2026-05-31

### テスト整備（フェーズ3 前提）

**仕様・設計の不整合修正**
- `friendPolicy` の型を `string`（単一選択）に統一。V1 定義の `multi-select` → `select` に変更
- `docs/spec.md` の `genderTag` 誤記を `gender` に修正
- 旧メーカーからの自動マイグレーションは V1 のみ（V2 は別の文脈）を明文化

**ユニットテスト追加**
- `legacyCardDataMigration.ts` — V2 変換 13ケース（バグ修正も含む）
- `migrateV1LegacyData` — V1 旧メーカーデータ変換 15ケース
- `migrateV1Patterns` — フルパイプライン（最古フラット→新フォーマット）29ケース
- `templateLayout.ts` — Supabase モック 11ケース
- API Route Handler — 28ケース（Stripe Webhook・cards PATCH/DELETE・like・checkout・portal）
- `testcases.md` に TC-9〜24 を追記（全 E2E ファイルを網羅）

---

### フェーズ3 ステップ3：`migrateV1LegacyData` の実装

旧メーカー（`/card/vrchat`）の localStorage データを新フォーマットに変換する関数を実装。

| 旧キー | 新キー |
|---|---|
| `sns.vrchatId` | `vrchat` |
| `sns.twitterId` | `x` |
| `sns.discordId` | `discord` |
| `sns.friendPolicy` | `friendPolicy`（string） |
| `gender: string` | `gender: { tag, display }` |
| `language: string[]` | `language: { preset, custom }` |
| `age.mode` | `age.searchTag` |

---

### フェーズ3 ステップ4：`handleShareByUrl` にマイグレーションを接続

`CardEditor.tsx` の `handleShareByUrl` で `createCard`/`updateCard` の前に
`migrateLegacyCardData` を通すよう変更。DB には常に新フォーマットで保存される。

---

### フェーズ3 ステップ5（部分完了）：TS 定義ファイルの削除

**DB 拡張**
- `templates` テーブルに `card_width`, `card_height`, `web_width` カラムを追加
- `card_config` カラム（grid・borderRadius 等）を追加
- `community_templates` の JOIN で `community_slugs` を取得

**コード変更**
- `v1.tsx` / `v2.tsx`（旧 CardTemplate ファイル）を削除
- `buildCardTemplateFromDefinition` を `definition: TemplateDefinition | null` に対応
- カード閲覧・編集・プロフィール・テンプレート選択を DB テンプレートから構築
- `/card/vrchat` は `v1Definition`（TS）でテンプレート構造を担保しつつ、フォームセクションは DB から取得

> **残作業**: `v1Definition.ts` / `v2Definition.ts` は admin の `TemplateBuilder` が依存しており削除未完了

---

### 旧メーカー導線設計の明文化

`docs/legacy-maker-flow.md` を新設。以下を記載：
- `/card/vrchat` はログイン前専用のスクラッチパッド（DB テンプレート不要）
- localStorage → handleShareByUrl → DB → 閲覧/編集ページ の全フロー
- 3つの変換関数（migrateFromOld / migrateV1CardData / migrateV2CardData）の役割分担
- `/card/vrchat` が DB テンプレートを読む必要がない理由

---

### UI 改善

- 全ページのヘッダーに `shadow-sm` を追加

---

### DB 正規化

**`cards.communities` / `community_slug` の廃止**
- カードは `template_id` を持ち、界隈の帰属は `card → templates → community_templates` で導出
- `cards.communities`（配列）と `cards.community_slug` を削除

**`profiles.links` → `profile_links` テーブル**
- `profile_links(id, user_id, url, label, sort_order)` テーブルを新設
- `profiles.links` JSON 配列を廃止

**レガシーカラムの削除**
- `profiles.sns_links` — 書き込み口なし、`profile_links` で統合
- `profiles.platform_data` — VRChat 固有、現 `card_data` に移行済み
- `profiles.template` — `platform_data` のゲートとして使用、不要に

---

### 機能追加

**テンプレート選択画面のサンプルカード表示**
- `templates.sample_card_data` カラムを追加
- v1・v2 のサンプルデータを DB に登録
- `PreviewCard()` でサンプルデータを使用してレンダリング

**通知システム**
- `system_notifications` テーブル（運営からの全ユーザー向け通知）
- `system_notification_reads` テーブル（既読管理）
- `user_notifications` テーブル（いいねなどのアクティビティ通知）
- `GET /api/notifications` / `POST /api/notifications/read` API を実装
- いいね時にカードオーナーへ通知を作成（自分のカードは除外）
- `NotificationBell` コンポーネント — ヘッダー右上にベルボタン、未読バッジ付き
- パネル内でお知らせ / アクティビティをタブ切り替え
- `HeaderAuth` にログイン済みの場合 `NotificationBell` を追加

**テンプレート依頼・お問い合わせの入口**
- テンプレート選択画面の末尾に `@yota3d` へのリンクを追加
- LP フッターにお問い合わせリンク・プライバシーポリシー・利用規約リンクを整理

---

## 残タスク（優先度順）

### フェーズ3 残作業
- [ ] admin `TemplateBuilder` リファクタ → `v1Definition.ts` / `v2Definition.ts` 削除
- [ ] `/card/vrchat` の後方互換性テスト強化

### テスト
- [ ] 探索フィルター結合テスト（Pro アカウント必要）
- [ ] `/upgrade` ページ E2E
- [ ] 自動マイグレーション発動条件のユニットテスト

### インフラ
- [ ] DB スキーマ確定後、マイグレーションを1ファイルに集約
- [ ] Supabase プロジェクトの作り直し（availability zone 修正）

### フェーズ4
- [ ] 新テンプレート作成（TRPG・VTuber 向け等）
- [ ] ベータテスト開始

### その他
- [ ] デザイン修正（箇所は別途確認）
- [ ] `announcements` テーブルの廃止（通知システムに移行済み）
