# 開発タスク管理

テストランナー: vitest（ユニット）/ `npx playwright test`（E2E、CI では実行しない）

---

## 次にやること

### フェーズ4 準備（優先度：高）

- [ ] **新テンプレート作成**（TRPG・VTuber 向け等）— テンプレートビルダーで作成
- [ ] **ベータテスト開始**

### 機能追加（優先度：中）

- ✅ **探索フィルター実装** — `gender`/`env`/`lang`/`friendPolicy` フィルターを `src/app/api/cards/explore/route.ts` に実装。Pro プランのみ有効。E2E 11/11 通過。
- ✅ **`/card/vrchat` 挙動整備** — ログイン済みリダイレクト（V1カードあり→最古へ、なし→`/card/new`）、Xシェアをログイン不要化、nudge を画像保存・Xシェア後に表示。TC-6-E/I E2E 追加・全パス。

### 品質・テスト（優先度：中）

- [ ] **`/upgrade` ページ E2E** — `tests/e2e/upgrade.spec.ts` を新規作成（ページは `src/app/upgrade/page.tsx` に実装済み）
- [ ] **自動マイグレーション発動条件のユニットテスト**
  - データ変換テスト（`migrateV1Patterns.test.ts` 等）はカバー済み・685 件全パス
  - 未テスト: `CardEditor.tsx` の `isLoggedIn && !cardId && localStorage にデータあり` 分岐
- [ ] **`/card/vrchat` の後方互換性テスト強化** — あらゆる旧データパターンを網羅
- [ ] **auto-save の card_data から background を除外** — `CardEditor.tsx` の auto-save `useEffect` が `cardData: values` をそのまま送るため、`values.background`（blockPool の defaultValue）が card_data に書き込まれるデータ汚染。`handleShareByUrl` と同様に `const { background: _bg, ...cardDataWithoutBg } = values` で除外する。表示への影響はないが中長期的なデータ品質のために対処推奨。

### DB・インフラ（優先度：中）

- ✅ **`announcements` テーブル DROP** — テーブルは存在しないことを確認済み
- ✅ **Supabase プロジェクト作り直し** — 完了済み（vaacard プロジェクト、ap-northeast-1）

### デザイン（随時）

- [ ] **デザイン修正** — 気になる箇所を随時修正
- [ ] **未完成カードの非公開化** — 「未完成」の定義（必須フィールド未入力など）を決めて実装
- [ ] **テンプレートサンプルデータ入力** — 管理画面（TemplateBuilder）の「サンプルに設定」から `v1` / `v2` の `sample_card_data` を設定する（現在は空のため「サンプル準備中」と表示）
- [ ] **`/` スマホアニメーション** — トップページのカードプレビュー周りにスマホでも動きのある演出を追加
- [ ] **`/u/[slug]` 画面カスタマイズ** — 将来的にユーザーごとにマイページの見た目をカスタマイズ可能にする

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

### 2026-06-01（続き 4）

#### カードエディタの「マイページに保存」フロー実装

- `saveCard.ts`: `UpdateCardParams` に `ogp_version` を追加
- `page.tsx` → `CardEditorClient` → `CardEditor` に `ogpVersion` prop を伝達
- `handleShareByUrl`: 空フィールド確認モーダル（soft check）追加、保存時に `ogp_version` インクリメント
- `handlePostToX`: `cardId` 未保存時は保存フローへ誘導、保存済み時は `?v=N` 付き URL で X 投稿

#### ヘッダーテストの整備

- `spec-header.spec.ts`: 全ページ×全ログイン状態のボタン存在・不在テストを網羅（TC-1-2-5, TC-1-3-2〜14）
- `HeaderAuth.tsx`: アバターリンクに `aria-label="マイページ"` 追加（アクセシビリティ改善）
- `ProfilePage.tsx`: 設定ボタンに `aria-label="設定"` 追加
- `global-setup.ts`: `TEST_PUBLIC_CARD_ID` / `TEST_PUBLIC_SLUG` に対応する別ユーザーデータを自動生成
- ローカル Supabase スキーマ未適用が原因のテスト全滅を `supabase db reset` で解消

#### SNSブロックのインタラクティブ対応

- `CardRenderContext` に `isInteractive` を追加
- `GenericCardRenderer`: `ctx` に `isInteractive` を設定
- `buildCardTemplate.tsx`: `CardRenderer` の `isInteractive` を `GenericCardRenderer` に渡すよう修正（欠落していた）
- `simpleSns` / `snsWithFriendPolicy` / `sns`: `ctx.isInteractive` が `true` のとき
  - X プラットフォーム → `x.com` リンク
  - その他 → クリップボードコピー + `vaacard:copied` イベント
  - `vaacard-sns-item` クラス付与でホバー時のscale+青い影エフェクトを復元

---

### 2026-06-01（続き 3）

#### 「Xで共有」「画像で保存」「マイページに保存」の導線再設計

**設計方針**
- OGPキャッシュ問題対策として `ogp_version` カラムを追加し、シェアURLを `/card/[id]?v=N` 形式に
- 「マイページに保存」= OGP画像生成 + `image_url` / `ogp_version` 更新の明示的操作
- 「Xで共有」= `image_url` 未保存なら自動でマイページ保存フローを経由してからXへ
- 「画像で保存」= マイページ保存と独立したPNGダウンロード

**実装内容**
- `supabase/migrations/003_add_ogp_version.sql`: `cards.ogp_version int default 0` カラム追加・Supabase に適用済み
- `PATCH /api/cards/[cardId]`: `ogp_version` パラメータ対応追加
- `CardViewClient`: `publishState` 状態機械（null/confirming/saving/done）で保存フローを管理
  - 「マイページに保存」: 空フィールド確認 → OGP画像生成 → PATCH → 完了モーダル（URLコピー + Xシェア）
  - 「Xで共有」: `image_url` あり → `?v=N` 付きURLでX投稿；なし → 自動保存してからX投稿
  - 「画像で保存」: 単純なPNGダウンロード（マイページ保存不要）
- PC ヘッダー・モバイルFAB 両方に「マイページに保存」ボタンを追加

**確定済み設計方針（追記）**
- `ogp_version` はオーナーが「マイページに保存」するたびにインクリメント
- シェアURLの `?v=N` はSNS側OGPキャッシュのバスティング目的（サーバー側はv値を無視して同一OGPを返す）

---

### 2026-06-01（続き 2）

#### FAB UX改善

- 編集画面（FloatingButtons）・閲覧画面（CardViewClient）のFABを「初期展開 → 3秒後に自動折りたたみ」に変更
- 手動タップ時はタイマーをキャンセルし、以降は手動トグルのみに

---

### 2026-06-01（続き）

#### HeaderAuth 認証状態バグ修正・UI整理

- HeaderAuth を `loading / guest / loggedIn` の3状態に整理し「ログイン済みなのにログインボタンが出る」バグを根絶
- `usePathname` を依存に追加しページ遷移後（オンボーディング完了後など）に再取得するよう修正
- `avatar_url` の取得元を `users` テーブルから `profiles`（JOIN）に修正（アバター設定しても反映されなかったバグ）
- displayName/slug が両方空の場合は `?` でなく人物アイコン（SVG）を表示
- slug 未設定ユーザーは `/u/me` へリンク（「ログイン」ボタンを出さない）
- `/u/me` ルート新設（slug あり→`/u/[slug]`、なし→`/onboarding` へリダイレクト）
- LP ヘッダーの独自マイページボタンを `HeaderAuth` に統一
- ProfilePage: 表示名未設定のオーナーに「設定する」バナーを表示
- HeaderAuth テスト: 表示ロジックのユニットテスト7ケースを追加・整備

---

### 2026-06-01

#### UIフィードバック対応（各ページ）

- `/auth/login`: ヘッダーを sticky 化・カード上部バー overflow 修正・説明文短縮・区切り文言変更
- `/onboarding`: IDフィールドの placeholder を日本語化（`your-id` → `あなたのid`）
- `/c/vrchat`: タブに「テンプレートで絞り込む」見出し追加・横スクロール対応・件数表記修正（20件未満は「全N件」）
- `/c/vrchat/[templateId]`: ナビバーのパンくず truncate 強化・件数表記修正・`sample_card_data` 空の場合「サンプル準備中」表示
- `/card/[cardId]`: shimmer（光沢）演出削除・FAB をトグル式に変更（+ボタンで展開）・非オーナー向け「このテンプレートで作る」ボタン追加・モバイルで `deviceorientation` による tilt 対応
- `/card/[cardId]/edit`: `FloatingButtons` をトグル式 FAB に変更・フォーム下部に `pb-24` 追加して FAB 被り解消
- `/u/[slug]`: 編集ボタンをグラデーション化・設定ボタンをアイコンのみに・`fade-up` アニメーション追加
- `/settings` (SettingsModal): ID（スラッグ）変更 UI・アカウント削除機能を追加。`/api/account` エンドポイント新設
- `/upgrade`: スマホで上下 padding 追加（`py-12`）
- ヘッダー `HeaderAuth`: マイページボタンをアバターアイコン（イニシャル丸）に変更してコンパクト化

#### バグ修正

- `card-enter` アニメーション終了後も `forwards` fill-mode が tilt transform を上書きする問題を修正（`entering` → `done` の 2 段階に変更）
- `HeaderAuth`: `username_slug` が null のとき `setUser` をスキップしていたため、ログイン済みでも「ログイン」と表示されていたバグを修正

---

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
