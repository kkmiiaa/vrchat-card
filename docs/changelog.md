# 開発ログ・次にやること

このファイルは開発の大きな節目・変更の記録と、次のタスクを一元管理します。
コミット単位の詳細は `git log` を参照。
テストランナー: vitest（ユニット）/ `npx playwright test`（E2E、CI では実行しない）

---

## 次にやること

### 優先度：高

- [ ] **デザイン修正** — 気になる箇所を随時修正
- [ ] **`/card/vrchat` の後方互換性テスト強化** — あらゆる旧データパターンを網羅

### 優先度：中（フェーズ4 前に片付ける）

- [ ] **admin `TemplateBuilder` リファクタ** → `v1Definition.ts` / `v2Definition.ts` の完全削除
  - `TemplateBuilder` コンポーネントが `TemplateDefinition[]` に強く依存
  - `savedLayouts`（DB）から派生させる形に変更が必要
- [ ] **`announcements` テーブルの廃止** — 通知システムに移行済みにつき削除
- [ ] **Supabase プロジェクト作り直し**
  - 手順: DB スキーマ確定 → マイグレーションを1ファイルに集約 → 新プロジェクトに適用
  - availability zone の設定ミスの修正が目的

### 優先度：中（テスト）

- [ ] **探索フィルター結合テスト** — Pro の `gender`/`env`/`lang`/`friendPolicy` が DB クエリに効いているか
  - 実態: `src/app/api/cards/explore/route.ts`
  - Pro アカウントが必要なため `explore-search.spec.ts` は vacuous になる可能性あり
- [ ] **`/upgrade` ページ E2E** — `tests/e2e/upgrade.spec.ts` を新規作成
  - ページが正常に表示される（500 なし）
  - アップグレードボタンが表示される
  - 未ログイン時のリダイレクト動作
- [ ] **自動マイグレーション発動条件のユニットテスト**
  - `src/components/CardEditor.tsx` `handleShareByUrl`
  - `isLoggedIn && !cardId && localStorage にデータあり` の分岐（E2E は TC-6-H 済み）

### フェーズ4（ベータテスト）

- [ ] 新テンプレート作成（TRPG・VTuber 向け等）— テンプレートビルダーで作成
- [ ] ベータテスト開始

---

## 確定済み設計方針（変更時は必ず確認）

| 項目 | 決定内容 |
|---|---|
| `friendPolicy` の型 | `string` に統一（単一選択）。V1 定義は `select`、V2 旧変換は string のまま |
| 旧メーカー自動マイグレーション | V1 のみ対象。V2 の `migrateV2CardData` は DB 保存済みカードの変換で別物 |
| 界隈とカードの関係 | `card → template → community_templates` で導出。カード自身は界隈を持たない |
| `/card/vrchat` の実装方針 | テンプレート構造は `v1Definition`（TS・安定）。フォームセクションは DB から取得 |
| SNS リンク | `profile_links` テーブルで統合。`sns_links` は廃止済み |

---

## 2026-05-31 の作業記録

### テスト整備（フェーズ3 前提）

**仕様・設計の不整合修正**
- `friendPolicy` の型を `string`（単一選択）に統一。V1 定義の `multi-select` → `select` に変更
- `docs/spec.md` の `genderTag` 誤記を `gender` に修正

**ユニットテスト追加（計 57ケース）**

| テストファイル | 内容 | ケース数 |
|---|---|---|
| `legacyCardDataMigration.test.ts` | V2 変換（バグ修正含む） | 13 |
| `migrateV1LegacyData.test.ts` | V1 旧メーカーデータ変換 | 15 |
| `migrateV1Patterns.test.ts` | フルパイプライン（最古フラット→新フォーマット） | 29 |
| `templateLayout.test.ts` | Supabase モック | 11 |
| `webhook/__tests__/route.test.ts` | Stripe Webhook | 8 |
| `[cardId]/__tests__/route.test.ts` | cards GET/PATCH/DELETE | 9 |
| `like/__tests__/route.test.ts` | いいね通知付き | 5（更新） |
| `checkout/__tests__/route.test.ts` | Stripe チェックアウト | 4 |
| `portal/__tests__/route.test.ts` | Stripe ポータル | 4 |

**docs 同期**
- `testcases.md` に TC-9〜24 を追記（全 E2E ファイルを網羅）

---

### フェーズ3 完了

**ステップ3: `migrateV1LegacyData` の実装**

旧メーカー localStorage データ → 新フォーマット変換関数を実装。

| 旧キー | 新キー |
|---|---|
| `sns.vrchatId` | `vrchat` |
| `sns.twitterId` | `x` |
| `sns.discordId` | `discord` |
| `sns.friendPolicy` | `friendPolicy`（string） |
| `gender: string` | `gender: { tag, display }` |
| `language: string[]` | `language: { preset, custom }` |
| `age.mode` | `age.searchTag` |

**ステップ4: `handleShareByUrl` にマイグレーションを接続**

`CardEditor.tsx` の `handleShareByUrl` で保存前に `migrateLegacyCardData` を通す。
DB には常に新フォーマットで保存される。

**ステップ5（部分完了）: TS 定義ファイルの削除**

DB 拡張: `card_width`, `card_height`, `web_width`, `card_config`, `community_slugs` を templates テーブルに追加。

`v1.tsx` / `v2.tsx`（旧 CardTemplate ファイル）を削除。全ページを DB テンプレートから構築。

> **残作業**: `v1Definition.ts` / `v2Definition.ts` は admin の `TemplateBuilder` が依存しており削除未完了

**旧メーカー導線設計の明文化**

`docs/legacy-maker-flow.md` を新設。`/card/vrchat` の全フロー・変換レイヤー・設計方針を記載。

---

### UI 改善

- 全ページのヘッダーに `shadow-sm` を追加

---

### DB 正規化

| 対象 | 変更内容 |
|---|---|
| `cards.communities`（配列）+ `community_slug` | 削除。界隈は `card → template → community_templates` で導出 |
| `profiles.links`（JSON配列） | → `profile_links(id, user_id, url, label, sort_order)` テーブル |
| `profiles.sns_links` | 削除（`profile_links` で統合） |
| `profiles.platform_data` | 削除（レガシー。VRChat 情報は `card_data` に移行済み） |
| `profiles.template` | 削除（`platform_data` のゲートとして使用、不要に） |
| `cards.card_data` | JSON のまま維持（テンプレートごとに構造が異なるため） |
| `templates.*` JSON 群 | JSON のまま維持（設定ドキュメントとして適切） |

---

### 機能追加

**テンプレート選択画面のサンプルカード表示**
- `templates.sample_card_data` カラムを追加
- v1・v2 のサンプルデータを DB に登録
- `PreviewCard()` でサンプルデータを使用してレンダリング

**通知システム**

新規テーブル:
- `system_notifications` — 運営からの全ユーザー向け通知
- `system_notification_reads` — system 通知の既読管理
- `user_notifications` — いいね等のアクティビティ通知（`read_at` で既読管理）

新規 API:
- `GET /api/notifications` — system + activity 通知一覧・未読数
- `POST /api/notifications/read` — 既読マーク

UI:
- `NotificationBell` コンポーネント — ヘッダー右上、未読バッジ付きベルボタン
- パネル内でお知らせ / アクティビティをタブ切り替え
- パネルを開いたタイミングで既読にする
- `HeaderAuth` にログイン済みの場合 `NotificationBell` を追加
- いいね時にカードオーナーへ通知を作成（自分のカードは除外）

**テンプレート依頼・お問い合わせの入口**
- テンプレート選択画面の末尾に `@yota3d` へのリンクを追加
- LP フッターにお問い合わせリンク・プライバシーポリシー・利用規約リンクを整理
