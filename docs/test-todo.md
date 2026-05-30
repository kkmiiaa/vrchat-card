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

## 🔄 タスク4（未着手・余力で）

1. **自動マイグレーション発動条件**: `src/components/CardEditor.tsx` `handleShareByUrl` の発動条件
   `isLoggedIn && !cardId && localStorageにデータあり` の分岐をユニット/結合でテスト（E2E は TC-6-H 済み）。

2. **Stripe Webhook**: `checkout.session.completed` / `invoice.paid` / `customer.subscription.deleted` の plan 更新ロジック。
   実態: `src/app/api/stripe/webhook/route.ts`

3. **カード削除時 Storage**: gallery 画像削除の分岐テスト。
   実態: `src/app/api/cards/[cardId]/route.ts` DELETE ハンドラ
   - gallery 画像（`profile`/`gallery-0〜2`）が削除される
   - OGP 画像（`card-images` バケットの `{userId}/{cardId}.png`）は残る（spec.md「カード削除時の処理」）

4. **探索フィルター（API 結合テスト）**: Pro の `gender`/`env`/`lang`/`friendPolicy` フィルターが実際に DB クエリに効いているかの結合/E2E。
   実態: `src/app/api/cards/explore/route.ts`
   ※ `explore-search.spec.ts` に枠はあるが Pro プランが必要なため vacuous になる可能性あり

5. **`/upgrade` ページ E2E**: ページ表示・Stripe チェックアウト導線（`tests/e2e/upgrade.spec.ts`）。
   - ページが正常に表示される（500 なし）
   - Pro プランへのアップグレードボタンが表示される
   - 未ログイン時のリダイレクト動作

6. **API: `PATCH /api/cards/[cardId]`**: カード更新の主要ロジックのテスト。
   実態: `src/app/api/cards/[cardId]/route.ts`
   - card_data の更新が正しく DB に反映される
   - 未認証時は 401 を返す
   - 他ユーザーのカードは更新できない（`user_id` フィルター）
   - imageBase64 が渡されると Storage にアップロードして `image_url` が更新される

7. **API: `POST /api/cards/[cardId]/like`**: いいねカウント増減のテスト。
   実態: `src/app/api/cards/[cardId]/like/route.ts`
   - delta=+1 でカウントが増える
   - delta=-1 でカウントが減る

8. **API: `POST /api/stripe/checkout`**: Stripe チェックアウトセッション生成のテスト。
   実態: `src/app/api/stripe/checkout/route.ts`
   - 未認証時は 401 を返す
   - 認証済みのとき Stripe セッション URL が返る

9. **API: `POST /api/stripe/portal`**: Stripe 顧客ポータルセッション生成のテスト。
   実態: `src/app/api/stripe/portal/route.ts`
   - 未認証時は 401 を返す
   - `stripe_customer_id` がない場合は 400 を返す
   - 認証済み・顧客 ID あり のとき URL が返る

---

## 進め方の推奨順序（残タスク）

タスク4 の中での優先順位:
1. タスク4-2（Stripe Webhook）— 課金ロジックのデグレリスクが最大
2. タスク4-6（PATCH API）— カード編集の主要パス
3. タスク4-3（削除時 Storage）
4. タスク4-5（/upgrade E2E）
5. タスク4-7〜9（like・Stripe checkout/portal）

各タスク完了ごとにコミットすること（CLAUDE.md 方針）。

---

## 作業ログ / 確定事項

- `friendPolicy` の型: **string に統一**（V1 定義を multi-select から select に変更済み）
- 旧メーカーからの自動マイグレーションは V1 向けのみ。V2 の `migrateV2CardData` は別物（DB 保存済みカードの旧フォーマット変換）で変更不要。
- `docs/spec.md` の `genderTag` は誤記。正しくは `gender`（修正済み）。
- タスク0〜3・5 はすべて完了・コミット済み（2026-05-31）。
