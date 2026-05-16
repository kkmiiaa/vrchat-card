# Profy — 要件仕様書

## サービス概要

自己紹介カードを作成・共有できるサービス。VRChat に限らず汎用的な自己紹介カードプラットフォームとして拡張していく。

---

## URL 設計

| URL | 説明 | 認証 |
|-----|------|------|
| `/` | トップページ | 不要 |
| `/card/vrchat/v1` | V1 カードエディタ（ローカル完結） | **不要** |
| `/card/new` | テンプレート選択 → カード作成 | 必要 |
| `/card/[cardId]` | カード編集・閲覧 | 編集は本人のみ |
| `/u/[slug]` | ユーザープロフィールページ | 不要（公開） |
| `/profile/edit` | プロフィール編集 | 必要 |
| `/auth/login` | ログイン（Google / Discord） | 不要 |

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

### V1 の特別ルール
- `/card/vrchat/v1` は認証不要でそのまま使用できる
- **未ログイン時**: データは localStorage に保存、画像ダウンロードのみ
- **ログイン後**: データをバックエンドに移行し、URL 共有が可能になる
  - 初回ログイン時または「URLで共有」押下時に localStorage のデータを card_data として保存
  - 以降は自動保存（debounce）でバックエンドと同期

---

## ユーザー導線

### ログイン不要（V1）
```
/ → /card/vrchat/v1 → 編集 → 画像ダウンロード
```

### ログインあり（V2）
```
/auth/login
  → /u/[slug]（プロフィールページ）
    → 「カードを追加」→ /card/new（テンプレート選択）
      → テンプレート選択 → カード作成 → /card/[cardId]（エディタ）
        → 編集 → 自動保存（debounce）
        → 「URLで共有」→ /u/[slug] に画像付きカードとして表示
```

---

## DB スキーマ

### `users`
| カラム | 型 | 説明 |
|--------|-----|------|
| `id` | uuid | auth.users と同一 |
| `username_slug` | text | プロフィール URL に使う 8 文字ランダム文字列 |
| `plan` | text | `free` / `pro` |
| `plan_expires_at` | timestamptz | Pro 有効期限 |

### `profiles`
| カラム | 型 | 説明 |
|--------|-----|------|
| `id` | uuid | |
| `user_id` | uuid | users.id への参照 |
| `display_name` | text | 表示名 |
| `avatar_url` | text | アバター画像 URL |
| `bio` | text | 自己紹介文 |
| `sns_links` | jsonb | SNS リンク（x, discord, vrchat, instagram, github） |
| `template` | text | プロフィールページのテンプレート種別（将来拡張用） |
| `platform_data` | jsonb | プラットフォーム固有データ（将来拡張用） |

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

## 認証

- Google OAuth / Discord OAuth（Supabase Auth）
- サインアップ時に `users` + `profiles` レコードを自動作成（DB トリガー）

---

## フロントエンド設計

### CardEditor コンポーネント

| props | 説明 |
|-------|------|
| `template` | CardTemplate（v1 / v2） |
| `cardId` | 既存カードの ID（省略時は新規） |
| `initialValues` | バックエンドから取得した card_data（省略時は localStorage） |
| `readOnly` | 閲覧専用モード（本人以外） |

### Block アーキテクチャ

- 各ブロックは `key` + `defaultValue` + `FormItem` + optional `CardItem` を持つ
- テンプレートはブロックの組み合わせとセクション定義で構成
- 将来的にユーザーがブロックを自由に組み合わせてテンプレートを作成できる拡張を想定

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

- 水色系は赤緑色弱に影響しにくい安全なカラー
- プライマリは `#00BFFF` より少し濃い `#00AADB` でコントラスト比を確保

### タイポグラフィ
| 対象 | フォント |
|------|--------|
| 英字 | Nunito（丸みがあり読みやすい） |
| 日本語 | Noto Sans JP（クリーンで視認性が高い） |

### デザインモチーフ
- **バブル（泡）**: 背景に浮かぶ円形の輪郭線・塗りつぶし円
- **ハッシュタグ `#`**: 装飾・見出し・タグに統一して使用
- キャッチコピー: 「あなたを、一枚で伝える。」

### トーン
- 明るい白ベース、爽やかでクリーンな印象
- ポップさはバブル・ハッシュタグモチーフで表現
- 過度な装飾は避け、余白を大切にする

---

## 将来拡張

- ユーザー自身がブロックを組み合わせてカードテンプレートを作成
- cardId ベースの URL で公開・限定公開・非公開を切り替え
- Pro プランによる機能制限（カード枚数、テンプレート種類など）
