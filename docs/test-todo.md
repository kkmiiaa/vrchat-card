# テスト整備 指示書

> 別セッション（Sonnet）向けの自己完結タスク指示書。
> 目的：フェーズ3（V1/V2 の DB 化・旧メーカー移行）の中核ロジックに欠けているテストを整備し、
> 仕様書とコードの不整合を解消する。

## 背景

- E2E（`tests/e2e/`）と各ブロックのユニットテスト（`src/blocks/__tests__/`）、`templateBuilderUtils.test.ts` まではカバー済み。
- 一方、ロードマップ中核（旧メーカー移行・DB テンプレート読み書き）の主要ロジックにテストが無い。
- 進める前に CLAUDE.md のガイドライン（特に「個別対応・特別扱いを避ける」「タスク完了時のコミット」「docs を最新に保つ」）を必ず守ること。
- テストランナーは vitest（ユニット）と Playwright（E2E、`npx playwright test`）。E2E は CI では回さない。

---

## ✅ 確定済み設計方針（着手前に必ず読むこと）

### `friendPolicy` の型
- **`string` に統一する**（単一選択）
- 旧メーカー（`/card/vrchat`）からの自動マイグレーションは **V1 向けのみ**（V2 は対象外）
- V2 の `migrateV2CardData` は `sns.friendPolicy` を文字列のまま格納しており、これは正しい（変更不要）
- V1 定義（`src/templates/v1Definition.ts`）の `friendPolicy` ブロックは `multi-select` → **単一選択**に変更すること
- `migrateV1LegacyData` での `sns.friendPolicy`（旧: string）→ `friendPolicy`（新: string）変換はそのまま string で吸収

### `genderTag` の誤記
- `docs/spec.md` の探索フィルター欄に `card_data->'genderTag'->>'tag'` とあるが、正しくは `card_data->'gender'->>'tag'`
- タスク0 で修正する

---

## タスク0（最優先・着手前提）: 仕様書とコードの不整合を解消

上記の確定方針に基づき以下を実施する。

1. `docs/spec.md` の `genderTag` → `gender` に修正
2. `docs/spec.md` の `friendPolicy` フィルター説明を string（単一値・equals）として記述を整理
3. `src/templates/v1Definition.ts` の `friendPolicy` ブロックを `multi-select` → 単一選択（`select` 相当）に変更
4. この指示書の末尾「作業ログ」に確定内容を追記

---

## タスク1（最優先テスト）: `legacyCardDataMigration` のユニットテスト

- 対象: `src/lib/legacyCardDataMigration.ts`（現状テスト皆無）
- 作成: `src/lib/__tests__/legacyCardDataMigration.test.ts`
- なぜ最優先: デグレ厳禁の旧メーカー移行の心臓部でノーガード。

検証ケース（`migrateLegacyCardData('v2', cardData)` を中心に）:

| # | 内容 | 期待 |
|---|---|---|
| 1 | `sns.twitterId`→`x`、`sns.discordId`→`discord` | 変換される |
| 2 | `sns.vrchatId` + `sns.friendPolicy` → `sns-with-friend-policy1: { id, friendPolicy }` | まとまる |
| 3 | 変換後に `sns` キーが削除される | `result.sns === undefined` |
| 4 | `micOnRate`→`gauge1`（`gauge1` 未設定時のみ） | 移送 + 旧キー削除 |
| 5 | `gender: string`→`{ tag, display: '' }` | オブジェクト化 |
| 6 | `language: string[]`→`{ preset, custom: [] }` | オブジェクト化 |
| 7 | 既に新フォーマット（`sns`/`micOnRate` 無し）はそのまま返す（冪等性） | 無変換 |
| 8 | `templateId !== 'v2'` のとき無変換 | そのまま返す |
| 9 | 既存の `x`/`discord` があれば上書きしない（`if (!result.x)`） | 既存値維持 |

---

## タスク2（フェーズ3の本丸）: V1 旧メーカー移行 `migrateV1LegacyData` の実装 + テスト

- 現状 `legacyCardDataMigration.ts` は **V2 のみ**対応。V1 用変換は未実装。
- ロードマップ フェーズ3 ステップ3 の要求。CLAUDE.md の差異テーブルを全て吸収する関数を実装する。
- **旧メーカーからの自動マイグレーションは V1 向けのみ**（V2 は対象外）。

旧→新 の差異（`friendPolicy` は string に統一済み）:

| 旧キー | 旧型 | 新キー | 新型 |
|---|---|---|---|
| `sns.vrchatId` | string | `vrchat` | string |
| `sns.twitterId` | string | `x` | string |
| `sns.discordId` | string | `discord` | string |
| `sns.friendPolicy` | string | `friendPolicy` | string |
| `gender` | string | `gender` | `{ tag, display? }` |
| `language` | string[] | `language` | `{ preset: string[], custom: [] }` |
| `age.mode` | string | `age.searchTag` | string |

- `migrateFromOld`（さらに古い形式変換）とは別レイヤーであることに注意。
- 実装と同時に上記差異テーブルを網羅するユニットテストを `src/lib/__tests__/` に追加。
- 冪等性（新フォーマット入力で無変換）も必ずテスト。
- 実装方針に迷ったら勝手に進めず、要確認事項として指示書末尾に記録して人間に確認を仰ぐ。

---

## タスク3: `templateLayout.ts`（DB テンプレート読み書き）のユニットテスト

- 対象: `src/lib/templateLayout.ts`（テスト無し）
- 関数: `fetchTemplateLayout` / `fetchTemplateLayouts` / `saveTemplateLayout` / `fetchCommunities` / `saveCommunity` / `linkTemplateToCommunity` / `updateCommunitySortOrders`
- Supabase クライアントをモックして検証:
  - DB 行→`TemplateLayoutRow` 整形（`orientation_scales` 欠損時のデフォルト、`form_sections` null 処理）
  - 該当 ID が無いとき `null` を返す
  - `fetchTemplateLayouts` が `Record<id, row>` を正しく構築
  - `saveTemplateLayout` の payload 形（`templateBuilderUtils.buildSavePayload` 連携）

---

## タスク4（中優先・余力で）

1. **自動マイグレーション発動条件**: `src/components/CardEditor.tsx` `handleShareByUrl` の発動条件
   `isLoggedIn && !cardId && localStorageにデータあり` の分岐をユニット/結合でテスト（E2E は TC-6-H 済み）。
2. **Stripe Webhook**: `checkout.session.completed` / `invoice.paid` / `customer.subscription.deleted` の plan 更新ロジック。
   実態: `src/app/api/stripe/webhook/route.ts`
3. **カード削除時 Storage**: gallery 画像削除・OGP 画像は残す、の分岐（spec.md「カード削除時の処理」）。
   実態: `src/app/api/cards/[cardId]/route.ts` DELETE ハンドラ
4. **探索フィルター実体**: タスク0 確定後、Pro の `q`/`gender`/`env`/`lang`/`friendPolicy` フィルターの結合/E2E。
   実態: `src/app/api/cards/explore/route.ts`
5. **`/upgrade` ページ E2E**: ページ表示・Stripe チェックアウト導線のテスト（`tests/e2e/upgrade.spec.ts`）。
   - ページが正常に表示される（500 なし）
   - Pro プランへのアップグレードボタンが表示される
   - 未ログイン時は `/auth/login` にリダイレクトされる（または適切に案内される）
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

## タスク5（docs 同期・低優先）

- `docs/testcases.md` のコンポーネント節に `profileImage` / `font` 関連の節が無い（テストファイルは存在）。docs を実態に合わせて追記。

---

## 進め方の推奨順序

1. タスク0（不整合の修正・spec.md 修正・v1Definition の friendPolicy 型変更）
2. タスク1（legacy migration テスト・即着手可・低リスク）
3. タスク2（V1 移行の実装＋テスト・本丸）
4. タスク3（templateLayout テスト）
5. 余力でタスク4・5

各タスク完了ごとにコミットすること（CLAUDE.md 方針）。

---

## 作業ログ / 確定事項

- `friendPolicy` の型: **string に統一**（V1 定義を multi-select から単一選択に変更）
- 旧メーカーからの自動マイグレーションは V1 向けのみ。V2 の `migrateV2CardData` は別物（DB 保存済みカードの旧フォーマット変換）で変更不要。
- `docs/spec.md` の `genderTag` は誤記。正しくは `gender`（タスク0 で修正済み扱い）。
