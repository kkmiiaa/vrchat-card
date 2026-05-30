# テスト整備 指示書

> 別セッション（Sonnet）向けの自己完結タスク指示書。
> 目的：フェーズ3（V1/V2 の DB 化・旧メーカー移行）の中核ロジックに欠けているテストを整備し、
> 仕様書とコードの不整合を解消する。

## 背景

- E2E（`tests/e2e/`）と各ブロックのユニットテスト（`src/blocks/__tests__/`）、`templateBuilderUtils.test.ts` まではカバー済み。
- 進める前に CLAUDE.md のガイドライン（特に「個別対応・特別扱いを避ける」「タスク完了時のコミット」「docs を最新に保つ」）を必ず守ること。
- テストランナーは vitest（ユニット）と Playwright（E2E、`npx playwright test`）。E2E は CI では回さない。

---

## ✅ 確定済み設計方針（着手前に必ず読むこと）

### `friendPolicy` の型
- **`string` に統一**（単一選択）
- 旧メーカー（`/card/vrchat`）からの自動マイグレーションは **V1 向けのみ**（V2 は対象外）
- V2 の `migrateV2CardData` は `sns.friendPolicy` を文字列のまま格納しており、これは正しい（変更不要）
- V1 定義（`src/templates/v1Definition.ts`）の `friendPolicy` ブロックは `multi-select` → `select`（単一選択）に変更済み
- `migrateV1LegacyData` での `sns.friendPolicy`（旧: string）→ `friendPolicy`（新: string）変換はそのまま string で吸収

### `genderTag` の誤記（修正済み）
- `docs/spec.md` の探索フィルター欄の `card_data->'genderTag'->>'tag'` → `card_data->'gender'->>'tag'` に修正済み

---

## ✅ タスク0: 仕様書とコードの不整合を解消（完了）

- `docs/spec.md` の `genderTag` → `gender` 修正済み
- `docs/spec.md` の `friendPolicy` フィルター説明を string（単一値・equals）として整理済み
- `src/templates/v1Definition.ts` の `friendPolicy` を `multi-select` → `select` に変更済み

---

## ✅ タスク1: `legacyCardDataMigration` のユニットテスト（完了）

- 実装: `src/lib/legacyCardDataMigration.ts`
- テスト: `src/lib/__tests__/legacyCardDataMigration.test.ts`（13ケース）
- あわせて `gender`/`language` のみ旧フォーマットの場合に変換が走らないバグを修正済み

---

## ✅ タスク2: V1 旧メーカー移行 `migrateV1LegacyData` の実装 + テスト（完了）

- 実装: `src/lib/legacyCardDataMigration.ts` に `migrateV1CardData` を追加
- テスト: `src/lib/__tests__/migrateV1LegacyData.test.ts`（15ケース）
- 変換内容: `sns.*` 展開・`gender` 型変換・`language` 型変換・`age.mode` → `age.searchTag`

---

## ✅ タスク3: `templateLayout.ts` のユニットテスト（完了）

- 実装: `src/lib/templateLayout.ts`
- テスト: `src/lib/__tests__/templateLayout.test.ts`（11ケース、Supabase モック）

---

## ✅ タスク5: docs 同期（完了）

- `docs/testcases.md` に TC-9〜24 を追記（profileImage・legacyMigration・templateLayout・全 E2E ファイル）
- 全 UI ページ・全 E2E ファイルが testcases.md に記載済み
- `/settings` はモーダル移行済みのためテスト不要（TC-4-1 の記述が正）
- `/admin/*` はスコープ外

---

## ✅ タスク4（一部完了）

1. **自動マイグレーション発動条件**: `src/components/CardEditor.tsx` `handleShareByUrl` の発動条件
   `isLoggedIn && !cardId && localStorageにデータあり` の分岐をユニット/結合でテスト（E2E は TC-6-H 済み）。

2. ✅ **Stripe Webhook**（完了）: `src/app/api/stripe/webhook/__tests__/route.test.ts`（8ケース）
3. ✅ **カード GET/PATCH/DELETE**（完了）: `src/app/api/cards/[cardId]/__tests__/route.test.ts`（9ケース）
4. ✅ **API: `POST /api/cards/[cardId]/like`**（完了）: `src/app/api/cards/[cardId]/like/__tests__/route.test.ts`（3ケース）
5. ✅ **API: `POST /api/stripe/checkout`**（完了）: `src/app/api/stripe/checkout/__tests__/route.test.ts`（4ケース）
6. ✅ **API: `POST /api/stripe/portal`**（完了）: `src/app/api/stripe/portal/__tests__/route.test.ts`（4ケース）

---

## 🔄 残タスク（未着手）

1. **自動マイグレーション発動条件**: `src/components/CardEditor.tsx` `handleShareByUrl` の発動条件
   `isLoggedIn && !cardId && localStorageにデータあり` の分岐をユニット/結合でテスト（E2E は TC-6-H 済み）。

2. **探索フィルター（API 結合テスト）**: Pro の `gender`/`env`/`lang`/`friendPolicy` フィルターが DB クエリに効いているかの結合/E2E。
   実態: `src/app/api/cards/explore/route.ts`
   ※ `explore-search.spec.ts` に枠はあるが Pro プランが必要なため vacuous になる可能性あり

3. **`/upgrade` ページ E2E**: ページ表示・Stripe チェックアウト導線（`tests/e2e/upgrade.spec.ts`）。
   - ページが正常に表示される（500 なし）
   - Pro プランへのアップグレードボタンが表示される
   - 未ログイン時のリダイレクト動作

---

## 進め方の推奨順序（残タスク）

1. 探索フィルター結合テスト（Pro アカウントが必要）
2. `/upgrade` E2E
3. 自動マイグレーション発動条件のユニットテスト

各タスク完了ごとにコミットすること（CLAUDE.md 方針）。

---

## 作業ログ / 確定事項

- `friendPolicy` の型: **string に統一**（V1 定義を multi-select から select に変更済み）
- 旧メーカーからの自動マイグレーションは V1 向けのみ。V2 の `migrateV2CardData` は別物（DB 保存済みカードの旧フォーマット変換）で変更不要。
- `docs/spec.md` の `genderTag` は誤記。正しくは `gender`（修正済み）。
- タスク0〜3・5 はすべて完了・コミット済み（2026-05-31）。
- タスク4（API テスト）: Webhook・cards PATCH/DELETE・like・checkout・portal 完了（2026-05-31）。28ケース追加。
- 残: 探索フィルター結合・/upgrade E2E・自動マイグレーション発動条件。
