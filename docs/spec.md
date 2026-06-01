# vaacard 仕様書

> 現状の実装ベースで記述。🔴 は既知の問題・要確認事項。

---

## サービス概要

自己紹介カードを作成・共有できるサービス。VRChat に限らず汎用的な自己紹介カードプラットフォームとして拡張していく。

---

## URL 設計

| URL | 説明 | 認証 |
|-----|------|------|
| `/` | トップページ（LP） | 不要 |
| `/auth/login` | ログイン（Google / Discord / メールアドレス） | 不要 |
| `/auth/callback` | OAuth完了後リダイレクト先分岐 | 不要 |
| `/card/vrchat` | VRChat 向け旧メーカー（既存ユーザー導線）。アカウント不要 | **不要** |
| `/tools/vrchat-introduction-card` | `/card/vrchat` へリダイレクト（既存ユーザー導線） | **不要** |
| `/card/new` | テンプレート選択 → カード作成 | 必要 |
| `/card/[cardId]` | カード編集・閲覧 | 編集は本人のみ |
| `/u/[slug]` | ユーザープロフィールページ | 不要（公開） |
| `/u/me` | 自分のマイページへリダイレクト（slug あり→`/u/[slug]`、なし→`/onboarding`） | 必要 |
| `/onboarding` | 初回プロフィール設定（表示名・マイページID） | 必要 |
| `/c/[genre]` | 界隈カード一覧（例: `/c/vrchat`） | 不要（公開） |
| `/upgrade` | Free/Pro プラン比較・Stripe 決済（モーダル化を検討） | 必要 |
| `/settings` | 設定（マイページから開くモーダル）。ID変更・アカウント削除・プラン管理 | 必要 |
| `/terms` | 利用規約（静的） | 不要 |
| `/privacy` | プライバシーポリシー（静的） | 不要 |

### 既存ユーザー導線について

- `/card/vrchat` と `/tools/vrchat-introduction-card` は既存の自己紹介メーカー利用者がアクセスする可能性があるため、**デグレ厳禁**
- `/card/vrchat` では旧メーカーと同等の体験を提供する（ログイン不要）
- 新規ユーザーへのテンプレート選択は `/card/new` 経由に統一していく方針だが、既存導線は維持する

### templateId について

- templateId は URL に含めない（`/card/[cardId]` のみ）
- カード作成時のみクエリパラメータとして渡す（例: `/card/new?template=v2`）
- cardId はバックエンドが Notion スタイル 8 文字（base62）で発行

---

## テンプレート

| templateId | 名前 | 認証 | 説明 |
|------------|------|------|------|
| `v1` | Standard | **不要** | キャンバスベース。ローカル完結。ログイン不要で利用可能 |
| `v2` | Glass Card | 必要 | html-to-image ベース。バックエンド連携 |

### カード表示モード（card / web）

カードには「カード表示」と「Web表示」の2つのレイアウトモードがある。

| モード | 内部キー | 用途 | 特徴 |
|--------|----------|------|------|
| カード表示 | `card` | 画像として保存・共有 | 固定サイズ（900×506）。OGP・ダウンロード向け |
| Web表示 | `web` | スマホでの閲覧 | 流動高さ（`autoHeight: true`）。幅固定・高さはコンテンツに追従 |

#### 設計の背景

横長のカード表示はスマホ画面で見にくい。一方、縦向きの固定サイズカードは横向き前提のコンポーネントを詰め込む設計が難しいため、「Web表示」として高さを固定しない流動レイアウトを採用した。

- `/card/[cardId]` のカード詳細ページでスマホ幅のとき `web`（Web表示）レイアウトを使用
- `web` レイアウトでは `flex: 1`（高さの余白を埋める）は意味をなさないため使用しない。各ブロックは自然高さを前提に設計し、最低高さが必要な場合のみ `minH` で指定する
- ブロックの定義は `blockPool` で一元管理し、カード表示・Web表示の両レイアウトから `ref` ノードで参照する。これにより componentKey・dataKey・blockConfig の二重管理を避ける

### 認証後リダイレクト先の分岐（検討中）

| ユーザー種別 | リダイレクト先 |
|---|---|
| カード作成フローから来たユーザー | `/card/new` |
| 旧メーカー（`/card/vrchat`）から来たユーザー | `/card/vrchat` |
| その他（LP・探索など） | `/u/{slug}`（マイページ） |

---

## ユーザー導線

### ログイン不要（旧メーカー）

```
/card/vrchat（または /tools/vrchat-introduction-card）
  → 編集
  → 画像ダウンロード / X シェア
  → 「マイページに保存」→ ログイン促進モーダル → ログイン → マイページへ
```

### ログインあり（新カード）

```
/auth/login
  → /u/[slug]（プロフィールページ）
    → 「カードを追加」→ /card/new（テンプレート選択）
      → テンプレート選択 → カード作成 → /card/[cardId]（エディタ）
        → 編集 → 自動保存（debounce 1.5秒）
        → 「マイページに保存」→ 完了モーダル（URLコピー・Xシェア・マイページへ）
```

---

## ヘッダー仕様

### HeaderAuth コンポーネント（共通）

ログイン状態を `loading / guest / loggedIn` の3状態で管理。`usePathname` の変化時に再取得し、ページ遷移後も最新状態を反映する。

| 状態 | 表示 |
|---|---|
| ロード中 | 空の 8×8 プレースホルダー |
| 未ログイン | 「ログイン」テキストリンク |
| ログイン済み・`hideMyPage=false` | アバターアイコン（丸）→ `/u/[slug]` または `/u/me`（slug 未設定時） |
| ログイン済み・`hideMyPage=true` | 通知ベルのみ |

アバターアイコンの優先順位：プロフィール画像（`profiles.avatar_url`）→ イニシャル（displayName / slug 先頭2文字）→ 人物アイコン（SVG）

### 画面別ヘッダー構成

#### LP（`/`）

| ログイン状態 | 左 | 右 |
|---|---|---|
| 未ログイン | vaacard（ロゴ） | ユーザーを探す（PCのみ） / 「はじめる」ボタン / 「ログイン」アイコン |
| ログイン済み | vaacard（ロゴ） | ユーザーを探す（PCのみ） / 「カードを作る」ボタン / アバターアイコン |

#### カード編集（`/card/[cardId]`）

| ログイン状態 | 左 | 右（PCのみ） | 右（共通） |
|---|---|---|---|
| 未ログイン | vaacard / テンプレート名 | 画像で保存 / Xでシェア / （保存ボタン文言検討中） | 「ログイン」リンク |
| ログイン済み・新規（cardId なし） | vaacard / テンプレート名 | 画像で保存 / Xでシェア / 「マイページに保存」 | 「マイページ」リンク |
| ログイン済み・既存（cardId あり） | vaacard / テンプレート名 / 下書き保存済み | 画像で保存 / Xでシェア / 「マイページに保存」 | 「マイページ」リンク |

- 下書き保存ステータス（「保存中…」「下書き保存済み」）は `isLoggedIn && cardId` のときのみ左に表示
- ボタン群はモバイルでは FloatingButtons（画面右下）に移動

#### カード閲覧（`/card/[cardId]`）

| ログイン状態 | 左 | 右（PCのみ） | 右（共通） |
|---|---|---|---|
| 未ログイン | vaacard（ロゴ） | ―（非表示） | 「ログイン」リンク（白） |
| ログイン済み・非オーナー | vaacard（ロゴ） | ―（非表示） | 「マイページ」リンク（白） |
| ログイン済み・オーナー | vaacard（ロゴ） | 編集 / 画像で保存 / Xで共有 | 「マイページ」リンク（白） |

#### マイページ（`/u/[slug]`）

| ログイン状態 | 左 | 右 |
|---|---|---|
| 未ログイン（他者のページ） | vaacard（ロゴ） | ユーザーを探す（PCのみ） / 「ログイン」リンク |
| ログイン済み・他者のページ | vaacard（ロゴ） | ユーザーを探す（PCのみ） / 「マイページ」リンク |
| ログイン済み・自分のページ | vaacard（ロゴ） | ユーザーを探す（PCのみ） / ―（hideMyPage=true） |

#### 探索（`/c/vrchat`）

| ログイン状態 | 左 | 右 |
|---|---|---|
| 未ログイン | vaacard / VRChat | カードを作る / 「ログイン」リンク |
| ログイン済み | vaacard / VRChat | カードを作る / 「マイページ」リンク |

---

## 認証フロー

### ログイン方法

- Google OAuth
- Discord OAuth
- メールアドレス＋パスワード（新規登録時は確認メール送信）

### 新規ユーザー登録

1. OAuth コード → `exchangeCodeForSession()`
2. 未登録ユーザーなら `username_slug` を生成（ランダム8文字英数字、衝突時は再生成×10回）
3. `users` + `profiles` レコードを作成
4. ユーザー種別に応じたパスへリダイレクト

---

## カード作成〜公開フロー

### 全体フロー

```
/card/new（テンプレート選択）
  → CardEditor（cardId なし）
  → 入力 → 1.5秒 debounce → card_data のみ保存（下書き・非公開）
  → 「マイページに保存」ボタン
      1. createCard → cardId 発行
      2. PNG 生成（html-to-image）→ image_url を Storage に保存
      3. visibility: 'public' に設定
      4. /card/{cardId}?created=1 へリダイレクト
      5. 完了モーダル表示（URLコピー・Xシェア・マイページへ）
```

### 下書きと公開の定義

| 状態 | image_url | visibility | 説明 |
|---|---|---|---|
| 下書き | null | private | 新規作成直後、debounce 保存中 |
| 公開 | URL あり | public | 明示的な保存アクション後 |

### image_url が保存されるタイミング

| アクション | card_data | image_url |
|---|---|---|
| debounce 自動保存（1.5秒） | ✅ | ❌ |
| 「マイページに保存」 | ✅ | ✅ |
| 「Xでシェア」 | ✅ | ✅ |
| 「画像で保存」 | ✅ | ✅ |

### カード削除時の処理

- `cards` レコードを削除
- `card-images` バケットから gallery 画像を削除（`{userId}/{cardId}/gallery-{0,1,2}.jpg`）
- OGP 用の `{userId}/{cardId}.png` は削除しない（運営コスト vs UX のトレードオフとして許容）

---

## プラン制限

| 機能 | Free | Pro（¥500/月） |
|---|---|---|
| カード作成数 | 最大 5 枚 | 無制限 |
| 探索・表示件数 | 最新 20 件のみ | 24 件×ページネーション |
| 探索・フィルター | ❌ | ✅ |
| 探索・全文検索 | ❌ | ✅ |

### Pro 判定ロジック

```typescript
isPro = plan === 'pro' && (plan_expires_at == null || new Date(plan_expires_at) > new Date())
```

---

## 探索機能

### 初期表示

- `visibility='public'` かつ `communities` に 'VRChat' を含むカード
- `created_at` 降順
- Free: 20件、Pro: 24件

### フィルター（Pro のみ）

| パラメータ | 対象フィールド | 方式 |
|---|---|---|
| `q`（全文検索） | `card_data->>name`, `card_data->>selfIntro` | ilike |
| `gender` | `card_data->'gender'->>'tag'` | equals |
| `env` | `card_data->'playEnv'` | 配列内検索 |
| `lang` | `card_data->'language'` | 配列内検索 |
| `friendPolicy` | `card_data->>friendPolicy` | equals（string・単一値） |

---

## OGP

| ページ | image_url あり | image_url なし |
|---|---|---|
| LP | `/og-default.png`（1200×630） | — |
| カード閲覧 | `card.image_url`（900×506） | `/og-default.png` |
| プロフィール | アバター画像 | `/og-default.png` |

- `metadataBase`: `NEXT_PUBLIC_SITE_URL` 環境変数（本番: `https://www.vaa3d.studio`）
- Twitter card: 常に `summary_large_image`

---

## 設定・ログアウト（SettingsModal）

マイページの「設定」ボタンから開くモーダル。

- **アカウント**: ログイン中のメールアドレス
- **プラン**:
  - Free → 「フリープラン」＋「アップグレード →」リンク
  - Pro → 「Pro プラン」＋次回更新日＋「解約・管理」ボタン（stripe_customer_id がある場合のみ）
- **ログアウト**: `supabase.auth.signOut()` → `/` へリダイレクト

---

## Stripe 決済フロー

### チェックアウト

```
POST /api/stripe/checkout
→ Stripe Checkout Session（mode: 'subscription'）
→ success_url: /u/{slug}?upgraded=1
```

### Webhook イベント処理

| イベント | 処理 |
|---|---|
| `checkout.session.completed` | plan='pro', plan_expires_at=period_end, stripe_customer_id 保存 |
| `invoice.paid` | plan='pro', plan_expires_at=period_end に更新 |
| `customer.subscription.deleted` | plan='free', plan_expires_at=null |

---

## DB スキーマ

### `users`

| カラム | 型 | 説明 |
|--------|-----|------|
| `id` | uuid | auth.users と同一 |
| `username_slug` | text | プロフィール URL に使う 8 文字ランダム文字列 |
| `plan` | text | `free` / `pro` |
| `plan_expires_at` | timestamptz | Pro 有効期限 |
| `stripe_customer_id` | text | Stripe 顧客 ID |

### `profiles`

| カラム | 型 | 説明 |
|--------|-----|------|
| `id` | uuid | |
| `user_id` | uuid | users.id への参照 |
| `display_name` | text | 表示名 |
| `avatar_url` | text | アバター画像 URL |
| `bio` | text | 自己紹介文 |

### `cards`

| カラム | 型 | 説明 |
|--------|-----|------|
| `id` | text | Notion スタイル 8 文字 base62 ID |
| `user_id` | uuid | users.id への参照 |
| `template_id` | text | テンプレート識別子（例: `v2`） |
| `title` | text | カードタイトル |
| `card_data` | jsonb | ブロックの値すべて |
| `image_url` | text | 生成画像の Storage URL |
| `visibility` | text | `public` / `limited` / `private` |

---

## UI・導線

### カード作成完了後

- `/card/{cardId}?created=1` にリダイレクト
- 完了モーダルを表示（URLコピー・Xでシェア・マイページを見る）

### 画像ダウンロード後

- 「マイページに保存して、URLで共有できるようにしませんか？」トーストを 8 秒間表示

### マイページ（オーナー表示時）

- プロフィール右上に「編集」「設定」ボタン
- `image_url` のないカードに「下書き」バッジを表示（オーナーのみ）

### モバイル対応

- 「画像で保存」: Web Share API でネイティブシェアシートを表示（非対応時はダウンロード）
- ヘッダーのボタン群は `sm:` 以上で表示（モバイルは FloatingButtons）

---

## 旧メーカー（`/card/vrchat`）

| 項目 | 内容 |
|---|---|
| パス | `/card/vrchat` |
| アカウント | 不要（閲覧・編集・ダウンロード・Xシェアはログイン不要） |
| データ永続化 | `localStorage`（キー: `vrchat-card-cache`） |
| 保存・公開 | 「マイページに保存」でアカウント作成→V1カード作成 |

### アクセス時の挙動

| 状態 | 挙動 |
|---|---|
| **未ログイン**（アカウントあり・なし問わず） | エディタをそのまま表示 |
| **ログイン済み・V1カードあり** | 最も古い V1 カードの編集画面（`/card/{id}/edit`）へリダイレクト |
| **ログイン済み・V1カードなし** | `/card/new`（テンプレート選択）へリダイレクト |

### ボタン挙動（未ログイン状態）

| ボタン | 挙動 |
|---|---|
| **マイページに保存** | `/auth/login?next=/card/vrchat` へリダイレクト → ログイン/アカウント作成後 `/card/vrchat` に戻る → 自動マイグレーション発動 |
| **画像で保存** | PNG をダウンロード → モーダルで「マイページに保存」を促す |
| **Xへ共有** | そのまま X 共有（アカウント不要）→ モーダルで「マイページに保存」を促す |

### 新メーカーへの自動マイグレーション（未ログイン→アカウント作成フロー）

1. 未ログインユーザーが `/card/vrchat` でカード編集 → `localStorage` に保存
2. 「マイページに保存」ボタン → `/auth/login?next=/card/vrchat` へ遷移
3. ログイン/アカウント作成完了 → `/card/vrchat` へ戻る
4. `page.tsx` サーバーサイドで「ログイン済み・V1カードなし」と判定 → エディタ表示
5. CardEditor クライアント側で `isLoggedIn && !cardId && localStorage に保存データあり` を検出 → 自動マイグレーション発動
6. V1 形式に変換してカード作成 → `/card/{id}?created=1` へ遷移

### V1 カード判定

- `cards.template_id = 'v1'` のカードを V1 カードとみなす
- 複数ある場合は `created_at` が最も古いものを使用

---

## デザインシステム

### コンセプト

- SNS やオンラインであらゆるつながりを求める人のためのプロフィールカードサービス
- VRChat・ゲーム・X・Discord・推し活・創作など、ネット上の趣味コミュニティ全般を対象
- ターゲット: 若年層（10〜20代）、男女問わず

### カラー

| 用途 | カラーコード |
|------|------------|
| プライマリ | `#00AADB`（水色） |
| グラデーション終端 | `#00C9B8`（シアン） |
| 背景 | `#FFFFFF` |
| ボーダー / 装飾 | `sky-*` / `cyan-*` Tailwind クラス |

### タイポグラフィ

| 対象 | フォント |
|------|--------|
| 英字 | Nunito（丸みがあり読みやすい） |
| 日本語 | Noto Sans JP（クリーンで視認性が高い） |

---

## 多言語・ラベル設計方針

`src/utils/translations.ts` はシステム UI の日英切り替え専用。対象はシステム定義の固定ラベル（ボタン・セクション見出し・固定選択肢）のみ。

| 対象 | 方針 |
|---|---|
| システム UI（ボタン・見出し） | `translations.ts` で管理 |
| ブロック FormItem のラベル | `t.*` キー経由（`translations.ts` に追加） |
| テンプレート・コンポーネントのラベル | データとして `label: string` で保持 |
| 多言語テンプレートが必要な場合 | `label: Record<string, string>` に拡張（将来対応） |

---

## 未対応・要検討事項

| # | 内容 | 方針 |
|---|---|---|
| 1 | カード削除時の OGP 用画像（`{cardId}.png`） | 削除しない方向で許容 |
| 2 | 探索ページへの自然な導線強化（特にモバイル） | 対応する |
| 3 | Stripe 本番アカウントの有効化 | ユーザーテスト後 |
| 4 | 脆弱性警告（GitHub Dependabot） | 現改善完了後にまとめて対応 |
| 5 | 自動マイグレーション時のユーザー向け確認 UI | 対応予定 |
