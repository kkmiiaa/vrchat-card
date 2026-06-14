# 開発タスク管理

テストランナー: vitest（ユニット）/ `npx playwright test`（E2E、CI では実行しない）

---

## 次にやること

### 収益化・公開準備（優先度：最高）

X のハッシュタグ・リツイート起点で VRChat ユーザーへのリーチを狙う。
シェアされたカードが X タイムラインで綺麗に見えることと、`/card/vrchat` の既存ユーザー体験が集客・継続率に直結する。

- ✅ **OGP 品質確認・修正** — X でシェアしたときのカード画像・タイトル・説明文を実機確認済み。画像生成バグ修正・動作確認完了（2026-06-05）
- ✅ **`/card/vrchat` ユーザー体験の品質担保** — 計7件のバグ修正・一気通貫テスト完了（2026-06-05）。friendPolicy/background/gallery/interactions→mark-grid1 変換実装、migrateFromOld 新フォーマット破壊バグ修正、DBテンプレート friendPolicy を multi-select→select に修正。未ログイン時の画像（背景・ギャラリー・プロフィール）を base64 リサイズして localStorage 保存→マイグレーション時に引き継ぎ。動作確認完了（2026-06-05）。
- ✅ **マイグレーション時の画像引き継ぎ修正（追加対応）** — friendPolicy を string[] として扱う（select→multi-select）、413エラー修正（gallery.base64をAPI送信前に除外）、ログインリダイレクト前に画像変換が完了しない競合状態を修正（背景・ギャラリー全枚が消える根本原因）。動作確認完了（2026-06-05）。
- ✅ **Stripe 本番キーへの切り替え** — Vercel Production 環境変数に本番キー設定完了。ローカル `.env.local` はテストキーのまま維持（2026-06-05）
- ✅ **CI/CD パイプライン構築** — PR時CI（lint/tsc/vitest）・mainマージ時デプロイ（Supabase migration → Vercel）を GitHub Actions で構築。GitHub Secrets・vercel.json 設定完了（2026-06-05）
- [ ] **develop → main マージ・本番デプロイ** — ベータテスト後に実施

### フェーズ4 準備（優先度：高）

- ✅ **アバター改変レシピカード作成** — DB 登録・サンプルデータ・説明文・プリセット設定・公開済み（2026-06-03）
- [ ] **既存テンプレートのサンプルデータ設定** — `vrchat-simple` / `vrchat-glass` / `trpg-v1` の `sample_card_data` を管理画面から入力する（現在未設定のため「サンプル準備中」表示）
- [ ] **新テンプレート作成**（TRPG・VTuber 向け等）— アバター改変カード後に着手
- [ ] **ベータテスト開始**

### 機能追加（優先度：高）

- ✅ **テンプレートごとの「作り方」エリア設定** — `templates.template_config` カラム追加。`howToSteps` / `tweetHashtags` を管理画面から設定可能に。OnboardingBanner・PostTimeline・X投稿テキストに反映（2026-06-04）
- ✅ **テンプレートごとの X ハッシュタグ設定** — 上記と同実装（2026-06-04）

### 検索・探索 UX 向上（優先度：高）

ユーザーが欲しいカードにたどり着きやすくする。集客後の滞在・回遊に直結。

- [ ] **Free プランでの検索・フィルター月3回解放** — 現状は Pro のみが使える検索・フィルターを、Free でも月3回まで使えるようにする
  - **対象操作**: `q`（キーワード検索）および `gender`/`env`/`lang`/`friendPolicy` フィルターの使用（いずれか1つでも使ったら1回消費）
  - **カウント管理**: `users` テーブルに `free_explore_count int default 0` / `free_explore_reset_month text`（例: `"2026-06"`）を追加。月が変わったらリセット
  - **API 側 (`/api/cards/explore`)**: Free ユーザーがフィルター/検索を使用した際にカウントをインクリメント。3回超過時は `{ error: 'limit_exceeded', isPro: false }` を返す
  - **UI 側**: 残り回数を表示（例:「今月あと X 回」）。超過時はアップグレード誘導モーダル（`UpgradeModal`）を表示
  - **Pro との差分**: Pro は無制限・カーソルページング・24件表示。Free は月3回・20件表示（変更なし）
- [ ] **検索画面の体験向上** — 現状の課題を洗い出し（表示件数・フィルター操作感・カードプレビューの見せ方など）改善案を実装する
  - Free プランでの探索体験が良好かを確認（20件表示・フィルター誘導の自然さ）
  - Pro 誘導が強引でないか確認
  - スマホでの操作感確認

### 計測（優先度：高）

施策の効果を測るために最低限の計測を入れる。ベータテスト前に整備しておく。

- ✅ **アナリティクス導入** — GA4 で全16イベントを計測。`docs/analytics.md` に仕様書。旧メーカー流入（`legacy_maker_visited` / `legacy_maker_migrated`）・Pro ファネル（Measurement Protocol）含む（2026-06-14）

### ソーシャル機能（優先度：中）

- [ ] **通知種別の仕様整理・実装** — 現在の `system_notifications`（管理者発信）に加え、ユーザーアクション起因の通知（いいね・フォロー等）の種別を仕様として定義し実装する
  - 通知種別: `like`（いいねされた）/ `follow`（フォローされた）/ `system`（現行）等
  - `user_notifications` テーブルに `type` / `actor_id` / `target_card_id` 等のカラム追加
  - `NotificationBell` のUI拡張（通知内容・リンク先対応）
- ✅ **いいね数・閲覧数を一覧・プロフィール画面に表示** — 探索一覧（`/c/vrchat`・テンプレート別）のカードサムネイルと `/u/[slug]` プロフィールページのカードに表示。チップ形式（半透明ダーク背景・白テキスト）で実装（2026-06-06）
- [ ] **フォロー機能** — ユーザー間のフォロー/フォロワー関係を実装する
  - `user_follows` テーブル（`follower_id` / `following_id` / `created_at`）の設計・実装
  - プロフィール画面にフォロー/フォロワー数・フォローボタンを追加
  - フォロー中ユーザーの新着カードをフィードまたは通知で受け取れるようにする

### 機能追加（優先度：中）

- ✅ **探索フィルター実装** — `gender`/`env`/`lang`/`friendPolicy` フィルターを `src/app/api/cards/explore/route.ts` に実装。Pro プランのみ有効。E2E 11/11 通過。
- ✅ **`/card/vrchat` 挙動整備** — ログイン済みリダイレクト（V1カードあり→最古へ、なし→`/card/new`）、Xシェアをログイン不要化、nudge を画像保存・Xシェア後に表示。TC-6-E/I E2E 追加・全パス。

### 品質・テスト（優先度：中）

- ✅ **既存テストのカバレッジ調査・修正** — ユニット 717 件全パス確認。4件の実装追従漏れを修正（itemList code フィールド廃止・tagList role=combobox 化・flat border 値更新・compressSampleData async 化対応）（2026-06-04）
- [ ] **`/upgrade` ページ E2E** — `tests/e2e/upgrade.spec.ts` を新規作成（ページは `src/app/upgrade/page.tsx` に実装済み）
  - プラン契約シナリオ（Free → Pro への Stripe Checkout 遷移・完了後の状態確認）
  - プラン解約シナリオ（Pro → Free へのダウングレード・解約後の UI 変化確認）
- ✅ **マイグレーション系テスト 43 件修正** — `migrateLegacyCardData` が `'v1'`/`'v2'` を受け付けていなかったバグを修正（`'vrchat-simple'`/`'vrchat-glass'` のエイリアスとして追加）。全73件パス。
- ✅ **自動マイグレーション発動条件のユニットテスト** — 一旦OK
- ✅ **`/card/vrchat` の後方互換性テスト強化** — 一旦OK
- ✅ **auto-save の card_data から background を除外** — `CardEditor.tsx` auto-save で `const { background: _bg, ...cardDataWithoutBg } = values` により除外済み。

### DB・インフラ（優先度：中）

- ✅ **`announcements` テーブル DROP** — テーブルは存在しないことを確認済み
- ✅ **Supabase プロジェクト作り直し** — 完了済み（vaacard プロジェクト、ap-northeast-1）

### バグ修正（優先度：高）

- ✅ **`hasEmptyFields` の偽陽性** — `isEmpty` が明示的に定義されているブロックのみチェックする方式に変更。`trustRank: ''`・`gender.display: ''` 等の任意項目による誤検知を解消（2026-06-05）。

### バグ修正（優先度：中）

- ✅ **編集画面スマホプレビューが機能していない** — モーダルに背景ラッパーdivを追加。CardRendererはnoBackground:true固定のため、背景はラッパー側で適用する方式に統一。
- ✅ **エクスポート画像・OGP に背景が含まれない** — `buildCardTemplate` の `noBackground: true` ハードコードを修正（`transparentBackground` にリネーム・prop 透過化）。表示用は `transparentBackground={true}` 明示、エクスポート用は背景ありで描画。`toPng` 2回呼び出しを `useCardExport` に統一し OGP 生成にも適用。Admin の背景枠問題（image の center/cover ずれ）も表示／エクスポート要素の分離で解決（2026-06-05）
- ✅ **スマホ版フォントはみ出し** — 解消済み（2026-06-04）
- ✅ **SNSリンク等のホバー影の範囲がずれている** — `interactiveSurface` フラグを導入し、GenericCardRenderer の surface コンテナにホバークラスを付与。`simpleSns` / `snsWithFriendPolicy` 対応。
- ✅ **ポップアップ系UIの画面外はみ出し** — ColorPicker/IconPicker は下に空きが足りなければ上展開。NotificationBell は `max-w-[calc(100vw-1rem)]` で小画面対応。
- ✅ **スマホ共有画面の傾きUX修正** — タッチ位置による傾きを無効化。iOS 13+ のジャイロ許可を最初のタップ時に自動要求。Android はそのまま動作。

### デザイン（随時）

- ✅ **card/new テンプレート説明文のトンマナ統一** — 全5件を体言止めに統一。アバター改変系2件の説明文を DB 直接更新（2026-06-04）
- ✅ **card/new プレビューのガラス・フォント未反映修正** — `buildCardTemplate.tsx` の `resolvedDefinition` で `fontFamily` と `theme` を `card_config` から優先読み取り、`PreviewCard` に `defaultSurface` を渡すよう修正（2026-06-04）
- ✅ **ローディングUIの絵文字→SVGアイコン化** — ✨絵文字＋上下バウンスを Sparkles SVG アイコン＋`animate-pulse`（色変化）に変更。`CardViewClient` / `CardEditor` 両方に適用（2026-06-05）
- ✅ **「Xで共有」フロー改善** — 公開確認モーダル（「マイページに公開されます」旨）を追加し、保存後にカードページへリダイレクトせず X のシェア画面を直接開くよう変更。`handleShareByUrl` に `onSaved` コールバックを追加してコード共通化（2026-06-05）
- ✅ **既存テンプレートの Web 版レイアウト崩れ修正** — 一旦OK
- [ ] **デザイン修正** — 気になる箇所を随時修正
- ✅ **未完成カードの非公開化** — 一旦OK
- [ ] **テンプレートサンプルデータ入力** — 管理画面（TemplateBuilder）の「サンプルに設定」から `v1` / `v2` の `sample_card_data` を設定する（現在は空のため「サンプル準備中」と表示）
- ✅ **`/` スマホアニメーション** — 一旦OK
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

### 2026-06-01（続き 5）

#### Vercel Linux ビルド失敗の修正

- `package.json` から `@rolldown/binding-darwin-arm64` の直接依存を削除
- `package-lock.json` でも同依存をルート依存から除去し、`rolldown` 配下の optional dependency として扱われる状態に修正
- macOS 専用バイナリを Linux 本番 install で必須化しないよう整理

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
