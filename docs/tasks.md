# 開発タスク管理

テストランナー: vitest（ユニット）/ `npx playwright test`（E2E、CI では実行しない）

---

## 次にやること

### フェーズ3 残作業（優先度：高）

- [x] **`TemplateBuilder` のリファクタ → admin からの `v1Definition` / `v2Definition` 参照を削除**
  - `savedLayouts`（DB）のみで動く形にリファクタ完了
  - `fontFamily` を DB（`card_config.fontFamily`）に保存するよう修正済み
  - `v1Definition.ts` は `/card/vrchat` が意図的に使用するため残存（設計方針通り）

### 品質・テスト（優先度：中）

- [ ] **探索フィルター結合テスト** — `gender`/`env`/`lang`/`friendPolicy` が DB クエリに効いているか
  - 対象: `src/app/api/cards/explore/route.ts`
  - Pro アカウントが必要なため `explore-search.spec.ts` は vacuous になる可能性あり
- [ ] **`/upgrade` ページ E2E** — `tests/e2e/upgrade.spec.ts` を新規作成
  - ページが正常に表示される（500 なし）
  - アップグレードボタンが表示される
  - 未ログイン時のリダイレクト動作
- [ ] **自動マイグレーション発動条件のユニットテスト**
  - `src/components/CardEditor.tsx` `handleShareByUrl`
  - `isLoggedIn && !cardId && localStorage にデータあり` の分岐（E2E は TC-6-H 済み）
- [ ] **`/card/vrchat` の後方互換性テスト強化** — あらゆる旧データパターンを網羅

### DB・インフラ（優先度：中）

- [ ] **`announcements` テーブルの廃止** — 通知システムに移行済みにつき削除
- [ ] **Supabase プロジェクト作り直し**
  - 目的: availability zone の設定ミス修正
  - 手順: DB スキーマ確定 → マイグレーションを 1 ファイルに集約 → 新プロジェクトに適用

### デザイン（随時）

- [ ] **デザイン修正** — 気になる箇所を随時修正

---

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

## 作業ログ

### 2026-05-31

#### テスト整備（フェーズ3 前提）

**仕様・設計の不整合修正**
- `friendPolicy` の型を `string`（単一選択）に統一。V1 定義の `multi-select` → `select` に変更
- `docs/spec.md` の `genderTag` 誤記を `gender` に修正

**ユニットテスト追加（計 57 ケース）**

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

#### フェーズ3 完了（ステップ 1〜5）

- ステップ1（調査）: 旧メーカーデータ形式の差異把握
- ステップ2: カードエディタを DB からテンプレート定義を読む仕組みに変更（V2 先行）
- ステップ3: `migrateV1LegacyData` 実装（旧 localStorage → 新フォーマット変換）
- ステップ4: `handleShareByUrl` にマイグレーション接続。DB には常に新フォーマットで保存
- ステップ5（部分完了）: `v1.tsx` / `v2.tsx` 削除。`v1Definition.ts` / `v2Definition.ts` は admin 依存のため残存

DB 拡張: `card_width`, `card_height`, `web_width`, `card_config`, `community_slugs` を templates テーブルに追加。

#### DB 正規化

| 対象 | 変更内容 |
|---|---|
| `cards.communities` + `community_slug` | 削除。界隈は `card → template → community_templates` で導出 |
| `profiles.links` | → `profile_links(id, user_id, url, label, sort_order)` テーブル |
| `profiles.sns_links` | 削除（`profile_links` で統合） |
| `profiles.platform_data` | 削除（レガシー） |
| `profiles.template` | 削除（`platform_data` のゲートとして使用、不要に） |

#### 機能追加

- テンプレート選択画面のサンプルカード表示（`templates.sample_card_data` カラム追加）
- 通知システム（`system_notifications` / `user_notifications` テーブル、`NotificationBell` UI）
- テンプレート依頼・お問い合わせの入口（`@yota3d` リンク）
- ヘッダーに `shadow-sm` 追加
- `docs/legacy-maker-flow.md` 新設
