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

## 13. コンポーネント設計

カードのフィールド定義を「コンポーネント」として抽象化し、テンプレート・界隈ごとに組み合わせる3層構造。

### 層の定義

```
コンポーネント（Component）
  └── 汎用フィールド定義（input_type / 検索可否 / 選択肢）

テンプレート（Template）
  └── どのコンポーネントをどの順番で使うか

界隈（Community）
  └── テンプレートに対してラベル・選択肢・表示順を上書き
```

### input_type 一覧

| input_type | 検索 | card_data の値形式 | 用途例 |
|---|---|---|---|
| `select` | ◎ タグで完全一致 | `string` | フレンドポリシー |
| `expressive-select` | ◎ tag で完全一致 | `{ tag: string, display?: string }` | 性別 |
| `multi-select` | ◎ 配列内包含 | `string[]` | プレイ環境、言語 |
| `text` | △ 全文検索のみ | `string` | 自己紹介、一言コメント |
| `number` | ○ 範囲検索 | `number` | 年齢 |
| `boolean` | ◎ | `boolean` | マイクON率 |
| `sns` | ✕ | `{ twitterId?: string, ... }` | SNSリンク |
| `gallery` | ✕ | `{ images: string[] }` | 画像ギャラリー |

### expressive-select 型の二層構造

選択肢による検索可能性と、自由テキストによる自己表現を両立するための型。
**自己表現が意味を持つコンポーネントにのみ使う**（性別など）。

```json
"genderTag": { "tag": "male", "display": "男の娘" }
```

- **tag**：検索フィルターに使う機械可読な値（必須）。本人が明示的に選択する。
- **display**：カードに表示する自由テキスト（任意）。未設定の場合はタグのラベルを表示する。

> 例：`tag=male` かつ `display=男の娘` のとき、カードには「男の娘」と表示され、「男性」フィルターでヒットする。

### DB スキーマ

```sql
-- コンポーネント定義
components
  key           text PK        -- 'gender', 'platform'
  input_type    text           -- 'select', 'multi-select', ...
  base_options  jsonb          -- ["male","female","nonbinary","none"]
  is_searchable boolean
  sort_order    int

-- テンプレートとコンポーネントの紐付け
template_components
  template_id   text
  component_key text
  sort_order    int

-- 界隈によるコンポーネント上書き
community_components
  community_slug    text
  component_key     text
  card_data_key     text       -- card_data上の実際のキー名（例: 'genderTag'）
  label_override    text
  options_override  jsonb
  is_searchable_override boolean
  sort_order        int
```

### 検索クエリの変換ルール

| input_type | PostgREST クエリ |
|---|---|
| `select` | `card_data->>'fieldKey' = 'value'` |
| `expressive-select` | `card_data->'fieldKey'->>'tag' = 'value'` |
| `multi-select` | `card_data->'fieldKey' @> '["value"]'` |
| `text` | `card_data->>'fieldKey' ilike '%q%'` |

### 現状との差分・移行方針

現在の `genderTag` は文字列（`'male'`）で保存されているが、新設計では `{ tag: 'male' }` オブジェクト形式に移行する。
移行はマイグレーションSQL（016番以降）で対応する。

---

## 14. 汎用レンダラーとテンプレートビルダー

### 設計方針

テンプレートをコードではなく**JSONデータ**として定義し、汎用レンダラーが解釈して描画する。
これによりテンプレートの追加・変更にコードデプロイが不要になり、界隈管理者がUIからテンプレートを作成できる。

> 現状の CardV1/V2 はコードに直接レイアウトを持つ過渡的な実装。将来的には汎用レンダラーで再現し、段階的に移行する。

---

### テンプレート定義 JSON

テンプレートは `theme`（見た目）と `sections`（構造）で構成される。DBの `templates.layout_json` カラムに保存する。

```json
{
  "theme": {
    "background": { "type": "gradient", "colors": ["#fcd5ce", "#e0f7fa"] },
    "font": "rounded",
    "accent": "#00AADB"
  },
  "sections": [
    {
      "id": "header",
      "layout": "horizontal",
      "components": ["profile_image", "name", "gender", "platform"]
    },
    {
      "id": "body",
      "layout": "grid",
      "columns": 2,
      "components": ["self_intro", "language", "friend_policy"]
    },
    {
      "id": "footer",
      "layout": "horizontal",
      "components": ["sns", "friend_policy"]
    }
  ]
}
```

#### theme フィールド

| フィールド | 型 | 説明 |
|---|---|---|
| `background.type` | `"solid"` \| `"gradient"` \| `"image"` | 背景の種類 |
| `background.colors` | `string[]` | カラーコード（solid: 1つ、gradient: 2つ） |
| `font` | `"rounded"` \| `"serif"` \| `"sans"` | フォントファミリー |
| `accent` | `string` | アクセントカラー（バッジ・ボーダー等） |

#### section レイアウト

| layout | 説明 |
|---|---|
| `"horizontal"` | コンポーネントを横並び |
| `"vertical"` | コンポーネントを縦並び |
| `"grid"` | グリッド（`columns` で列数指定） |

---

### コンポーネントレンダラー

各 `input_type` に対応する汎用描画ロジック。カード表示・画像生成・プレビューで共通して使う。

| input_type | 描画形式 |
|---|---|
| `select` | タグバッジ（tag） + 自由テキスト（display） |
| `multi-select` | バッジ一覧 |
| `text` | テキストブロック |
| `number` | 数値 + 単位ラベル |
| `boolean` | ON/OFF 表示 |
| `sns` | アイコン＋リンク |
| `gallery` | 画像グリッド |

---

### テンプレートビルダー UI（将来実装）

- セクションの追加・削除・並べ替え
- コンポーネントのドラッグ＆ドロップ割り当て
- テーマ（色・フォント）設定
- リアルタイムプレビュー（カード縮小版）
- 界隈管理者のみ操作可能（権限制御）

---

### 実装フェーズ

| フェーズ | 内容 | 前提 |
|---|---|---|
| 1 | コンポーネントレンダラーの設計・実装 | セクション13のコンポーネント設計完了 |
| 2 | CardV1/V2 を汎用レンダラーで実装（新規） | フェーズ1 |
| 3 | テンプレート定義JSONのDB管理・切り替え | フェーズ2 |
| 4 | テンプレートビルダーUI | フェーズ3 |
| 5 | 界隈管理者によるテンプレート公開フロー | フェーズ4 |

---

### 変更範囲の制約

| コード | 方針 |
|---|---|
| `src/components/CardV1.tsx`, `CardV2.tsx` | 未リリースのため最初から汎用レンダラーで実装してよい |
| `src/app/card/vrchat/`（旧メーカー） | 既存ユーザーが気づくUX変更はNG。リファクタ・内部変更はOK |
| `html-to-image` による画像生成 | 汎用レンダラーと同一コンポーネントを使い互換を保つ |

---

## 12. 未対応・要検討事項

| # | 内容 | 方針 |
|---|---|---|
| 1 | ~~`/settings` ページの削除~~ | ✅ 完了（マイページにリダイレクト） |
| 2 | ~~下書き状態カードの `visibility`~~ | ✅ 完了（`visibility='private'` で非公開化済み） |
| 3 | カード削除時の OGP 用画像（`{cardId}.png`） | 削除しない方向で許容 |
| 4 | `genderTag` / `gender` キー名の混在 | セクション13のコンポーネント設計に基づいて対応（select型のオブジェクト化） |
| 5 | 探索ページへの自然な導線強化（特にモバイル） | 対応する |
| 6 | Stripe 本番アカウントの有効化 | ユーザーテスト後 |
| 7 | 脆弱性警告（GitHub Dependabot: 56件） | 現改善完了後にまとめて対応 |
