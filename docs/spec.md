# vaacard 仕様書

> 現状の実装ベースで記述。🔴 は既知の問題・要確認事項。

---

## 1. 画面一覧

| 画面 | パス | 概要 |
|---|---|---|
| LP | `/` | サービス説明。「カードを作る」「ユーザーを探す」へのCTA |
| ログイン | `/auth/login` | Google / Discord / メールパスワード認証（モーダル化を検討） |
| 認証コールバック | `/auth/callback` | OAuth完了後、ユーザー種別に応じてリダイレクト先を分岐（下記参照） |
| カード新規作成 | `/card/new` | テンプレート選択画面 |
| カード編集 | `/card/[cardId]` | CardEditor。閲覧権限のみの場合は readOnly=true |
| カード閲覧 | `/card/[cardId]` | 3D tilt エフェクト、いいね、閲覧数、シェア |
| 旧メーカー | `/card/vrchat` | 既存の VRChat カードメーカー（アカウント不要） |
| マイページ | `/u/[slug]` | プロフィール＋カード一覧（オーナーは編集・設定可） |
| 探索 | `/c/vrchat` | VRChat ユーザー検索・フィルター |
| アップグレード | `/upgrade` | Free/Pro プラン比較・Stripe 決済（モーダル化を検討） |
| 設定モーダル | （マイページ内） | プラン状態・ログアウト・Stripe 管理ポータル |
| 利用規約 | `/terms` | 静的ページ |
| プライバシーポリシー | `/privacy` | 静的ページ |

🔴 `/settings` ページがモーダル移行後も残存している。削除すべき。

### 認証後リダイレクト先の分岐（検討中）

| ユーザー種別 | リダイレクト先 |
|---|---|
| カード作成フローから来たユーザー | `/card/new` |
| 旧メーカー（`/card/vrchat`）から来たユーザー | `/card/vrchat` |
| その他（LP・探索など） | `/u/{slug}`（マイページ） |

---

## 2. ヘッダー構成

各画面のヘッダーに表示される要素をまとめる。

### HeaderAuth コンポーネント（共通）

ログイン状態に応じて右端に表示。

| 状態 | 表示 |
|---|---|
| 未ログイン | 「ログイン」リンク |
| ログイン済み（`hideMyPage=false`） | 「マイページ」リンク |
| ログイン済み（`hideMyPage=true`） | 何も表示しない |

### 画面別ヘッダー構成

#### LP（`/`）
| ログイン状態 | 左 | 右 |
|---|---|---|
| 未ログイン | vaacard（ロゴ） | ユーザーを探す（PCのみ） / 「ログイン」リンク |
| ログイン済み | vaacard（ロゴ） | ユーザーを探す（PCのみ） / 「マイページ」リンク |

#### カード編集（`/card/[cardId]`）
| ログイン状態 | 左 | 右（PCのみ） | 右（共通） |
|---|---|---|---|
| 未ログイン | vaacard / テンプレート名 | 画像で保存 / Xでシェア / （保存ボタン文言検討中） | 「ログイン」リンク |
| ログイン済み・新規（cardId なし） | vaacard / テンプレート名 | 画像で保存 / Xでシェア / 「マイページに保存」 | 「マイページ」リンク |
| ログイン済み・既存（cardId あり） | vaacard / テンプレート名 / 下書き保存済み | 画像で保存 / Xでシェア / 「マイページに保存」 | 「マイページ」リンク |

- 下書き保存ステータス（「保存中…」「下書き保存済み」）は `isLoggedIn && cardId` のときのみ左に表示
- ボタン群はモバイルでは FloatingButtons（画面右下）に移動
- 未ログイン時の保存ボタン文言は「マイページを作成」では伝わらないため要検討

#### カード閲覧（`/card/[cardId]`）
| ログイン状態 | 左 | 右（PCのみ） | 右（共通） |
|---|---|---|---|
| 未ログイン | vaacard（ロゴ） | ―（非表示） | 「ログイン」リンク（白） |
| ログイン済み・非オーナー | vaacard（ロゴ） | ―（非表示） | 「マイページ」リンク（白） |
| ログイン済み・オーナー | vaacard（ロゴ） | 編集 / 画像で保存 / Xで共有 | 「マイページ」リンク（白） |

- 背景に合わせてヘッダーは半透明黒、テキストは白系
- モバイルはヘッダーボタン非表示、画面下部にボタンを配置

#### マイページ（`/u/[slug]`）
| ログイン状態 | 左 | 右 |
|---|---|---|
| 未ログイン（他者のページ） | vaacard（ロゴ） | ユーザーを探す（PCのみ） / 「ログイン」リンク |
| ログイン済み・他者のページ | vaacard（ロゴ） | ユーザーを探す（PCのみ） / 「マイページ」リンク |
| ログイン済み・自分のページ（オーナー） | vaacard（ロゴ） | ユーザーを探す（PCのみ） / ―（HeaderAuth は非表示） |

- オーナー表示時は `hideMyPage=true` により HeaderAuth が何も表示しない
- プロフィール本文右上に「編集」「設定」ボタンを配置（ヘッダー外）
- モバイルでの「ユーザーを探す」の訴求方法は要検討

#### 探索（`/c/vrchat`）
| ログイン状態 | 左 | 右 |
|---|---|---|
| 未ログイン | vaacard / VRChat | カードを作る / 「ログイン」リンク |
| ログイン済み | vaacard / VRChat | カードを作る / 「マイページ」リンク |

#### テンプレート選択・利用規約・PP
| ログイン状態 | 左 | 右 |
|---|---|---|
| 未ログイン | vaacard（ロゴ） | 「ログイン」リンク |
| ログイン済み | vaacard（ロゴ） | 「マイページ」リンク |

---

## 3. 認証フロー

### ログイン方法
- Google OAuth
- Discord OAuth
- メールアドレス＋パスワード（新規登録時は確認メール送信）

### 新規ユーザー登録
1. OAuth コード → `exchangeCodeForSession()`
2. 未登録ユーザーなら `username_slug` を生成（ランダム8文字英数字、衝突時は再生成×10回）
3. `users` + `profiles` レコードを作成
4. ユーザー種別に応じたパスへリダイレクト（Section 1 の分岐参照）

### ユーザーデータ構造
```
users テーブル
  id               UUID
  username_slug    unique
  plan             'free' | 'pro'
  plan_expires_at  ISO8601 | null
  stripe_customer_id text | null

profiles テーブル
  user_id          UUID (FK)
  display_name     text | null
  bio              text | null
  avatar_url       text | null
```

---

## 4. カード作成〜公開フロー

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

## 5. プラン制限

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

## 6. 探索機能

### 初期表示
- `visibility='public'` かつ `communities` に 'VRChat' を含むカード
- `created_at` 降順
- Free: 20件、Pro: 24件

### フィルター（Pro のみ）

| パラメータ | 対象フィールド | 方式 |
|---|---|---|
| `q`（全文検索） | `card_data->>name`, `card_data->>selfIntro` | ilike |
| `gender` | `card_data->>genderTag` | ilike |
| `env` | `card_data->playEnv` | 配列内検索 |
| `lang` | `card_data->language` | 配列内検索 |
| `friendPolicy` | `card_data->>friendPolicy` | equals |

🔴 `genderTag` と `gender` のキー名が混在している可能性がある。検索コンポーネントの整理と合わせて対応予定。

---

## 7. OGP

| ページ | image_url あり | image_url なし |
|---|---|---|
| LP | `/og-default.png`（1200×630） | — |
| カード閲覧 | `card.image_url`（900×506） | `/og-default.png` |
| プロフィール | アバター画像 | `/og-default.png` |

- `metadataBase`: `NEXT_PUBLIC_SITE_URL` 環境変数（本番: `https://www.vaa3d.studio`）
- Twitter card: 常に `summary_large_image`

---

## 8. 設定・ログアウト（SettingsModal）

マイページの「設定」ボタンから開くモーダル。

表示内容:
- **アカウント**: ログイン中のメールアドレス
- **プラン**:
  - Free → 「フリープラン」＋「アップグレード →」リンク
  - Pro → 「Pro プラン」＋次回更新日＋「解約・管理」ボタン（stripe_customer_id がある場合のみ）
- **ログアウト**: `supabase.auth.signOut()` → `/` へリダイレクト

---

## 9. Stripe 決済フロー

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

## 10. UI・導線

### カード作成完了後
- `/card/{cardId}?created=1` にリダイレクト
- 完了モーダルを表示:
  - URLコピー
  - Xでシェア
  - マイページを見る

### 画像ダウンロード後
- 「マイページに保存して、URLで共有できるようにしませんか？」トーストを 8 秒間表示

### マイページ（オーナー表示時）
- プロフィール右上に「編集」「設定」ボタン
- `image_url` のないカードに「下書き」バッジを表示（オーナーのみ）

### モバイル対応
- 「画像で保存」: Web Share API でネイティブシェートシートを表示（非対応時はダウンロード）
- ヘッダーのボタン群は `sm:` 以上で表示（モバイルは FloatingButtons）

---

## 11. 既存メーカーユーザーの挙動

旧カードメーカー（`/card/vrchat`）はアカウント不要の独立ツールとして存在しており、vaacard の登録ユーザーとは異なる導線を持つ。

### 旧メーカーの仕様

| 項目 | 内容 |
|---|---|
| パス | `/card/vrchat` |
| アカウント | 不要 |
| データ永続化 | `localStorage`（キー: `vrchat-card-cache`） |
| 保存・公開 | なし（ダウンロードのみ） |
| カード ID | なし |

- カードデータは `localStorage` に JSON で保存され、ブラウザを閉じても再開できる
- 画像保存・X 共有ともに Web Share API を使用する（旧実装の新タブ表示は廃止）
- アカウント登録を訴求: 「登録するとURLで共有できる」旨を画面内で案内する

### 新メーカーへの自動マイグレーション

旧メーカーと新メーカー（CardEditor）は同じ `localStorage` キー（`vrchat-card-cache`）を共有している。

**フロー:**
1. ユーザーが旧メーカーでカードを作成 → `localStorage` に保存
2. ユーザーが vaacard にログイン
3. CardEditor を開いた際、`isLoggedIn && !cardId && localStorage に保存データあり` の条件で自動マイグレーション発動
4. カードを自動的にマイページに保存
5. ログイン後はそのまま新メーカーで継続編集できる

🔴 自動マイグレーション時にユーザーへの説明・確認 UI がない。突然保存が走ることへのフィードバックが不足している可能性がある。

---

## 12. 未対応・要検討事項

| # | 内容 | 方針 |
|---|---|---|
| 1 | ~~`/settings` ページの削除~~ | ✅ 完了（マイページにリダイレクト） |
| 2 | ~~下書き状態カードの `visibility`~~ | ✅ 完了（`visibility='private'` で非公開化済み） |
| 3 | カード削除時の OGP 用画像（`{cardId}.png`） | 削除しない方向で許容 |
| 4 | `genderTag` / `gender` キー名の混在 | 検索コンポーネント整理と合わせて対応 |
| 5 | 探索ページへの自然な導線強化（特にモバイル） | 対応する |
| 6 | Stripe 本番アカウントの有効化 | ユーザーテスト後 |
| 7 | 脆弱性警告（GitHub Dependabot: 56件） | 現改善完了後にまとめて対応 |
