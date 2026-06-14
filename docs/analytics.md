# アナリティクス計測仕様

## 概要

ツール: **Google Analytics 4**（測定 ID: `G-XMHKGYVDJW`）  
実装: `src/lib/gtag.ts` の `trackEvent()` を使用  
除外: `localhost` / `127.0.0.1` は自動的に計測しない（`isTrackingEnabled()` によるガード）  
テストユーザー除外: `disableAnalyticsForTestUser()` で `traffic_type: 'internal'` を設定

---

## 計測イベント一覧

### ページビュー

自動計測（`AnalyticsProvider` によるルート変更追跡）。個別実装不要。

---

### ユーザー獲得・認証

| イベント名 | トリガー | パラメータ | 実装状況 |
|---|---|---|---|
| `sign_up` | 初回ログイン完了（`/u/[slug]` オンボーディング通過後） | `method: 'email'` | ✅ 実装済み |

---

### カード作成フロー

| イベント名 | トリガー | パラメータ | 実装状況 |
|---|---|---|---|
| `template_selected` | `/card/new` でテンプレートを選択してエディタへ遷移 | `template_id: string` | ✅ 実装済み |
| `card_created` | 新規カード初回保存完了 | `template_id: string` | ✅ 実装済み |
| `card_saved` | 既存カードの「マイページに保存」完了 | `card_id: string`, `template_id: string` | ✅ 実装済み |
| `card_image_downloaded` | 「画像で保存」ボタン押下 | `card_id: string \| null`, `template_id: string` | ✅ 実装済み |
| `card_shared_x` | 「Xで共有」ボタン押下（X 投稿画面を開いた） | `card_id: string \| null`, `template_id: string`, `source: string` | ✅ 実装済み |

---

### カード閲覧・シェア

| イベント名 | トリガー | パラメータ | 実装状況 |
|---|---|---|---|
| `card_viewed` | `/card/[cardId]` ページ表示（非オーナーのみ） | `card_id: string`, `template_id: string` | ✅ 実装済み |
| `card_url_shared` | プロフィールページの「URLコピー」ボタン押下 | `card_id: string` | ✅ 実装済み |

> `card_viewed` はオーナー自身の閲覧を除外するため、`isOwner === false` の条件下でのみ発火する。

---

### プロフィール

| イベント名 | トリガー | パラメータ | 実装状況 |
|---|---|---|---|
| `profile_edited` | プロフィール情報（表示名・アバター等）の保存完了 | なし | ✅ 実装済み |

---

### Pro アップグレードファネル

| イベント名 | トリガー | パラメータ | 実装状況 |
|---|---|---|---|
| `upgrade_modal_opened` | UpgradeModal が表示された | `trigger: string`（`'editor'`/`'explore'`/`'settings'`/`'profile'`） | ✅ 実装済み |
| `upgrade_started` | 「Pro にアップグレード」ボタン押下（`/api/stripe/checkout` リクエスト送信） | なし | ✅ 実装済み |
| `upgrade_completed` | Stripe Webhook `checkout.session.completed` 受信・DB 更新完了 | `user_id: string` | ✅ 実装済み（Measurement Protocol） |
| `subscription_cancelled` | Stripe Webhook `customer.subscription.deleted` 受信 | `user_id: string` | ✅ 実装済み（Measurement Protocol） |

> `upgrade_completed` / `subscription_cancelled` はサーバーサイド（Webhook）での計測になるため、`gtag` ではなく [Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4) を使用する。

---

---

### 旧メーカー（`/card/vrchat`）固有

| イベント名 | トリガー | パラメータ | 実装状況 |
|---|---|---|---|
| `legacy_maker_visited` | `/card/vrchat` ページ表示 | なし | ✅ 実装済み |
| `legacy_maker_migrated` | ログイン後の自動マイグレーション発動 | `template_id: string` | ✅ 実装済み |

> `card_shared_x` の `source: 'legacy_maker'` で旧メーカー経由の X シェアも識別できる。

---

## 実装状況サマリー

全イベント実装済み（2026-06-14）。

| カテゴリ | イベント数 |
|---|---|
| ページビュー（自動） | 1 |
| ユーザー獲得 | 1 |
| カード作成フロー | 5 |
| カード閲覧・シェア | 2 |
| プロフィール | 1 |
| Pro アップグレードファネル | 4 |
| 旧メーカー固有 | 2 |
| **合計** | **16** |

---

## イベントパラメータの命名規則

- スネークケース（例: `template_id`, `card_id`）
- ID 系は文字列型（`string`）に統一
- カードが未保存の場合の `card_id` は `null` を渡す（`trackEvent` 側でフィルタしない）

---

## GA4 カスタムディメンション設定（推奨）

GA4 管理画面でカスタムディメンションとして登録することで、探索レポートで活用できる。

| パラメータ名 | スコープ | 用途 |
|---|---|---|
| `template_id` | イベント | テンプレート別の作成・閲覧数 |
| `card_id` | イベント | カード別のシェア・閲覧数 |
| `trigger` | イベント | アップグレードモーダルの表示起点 |

---

## 実装済みコンポーネント・ファイル一覧

| ファイル | 計測イベント |
|---|---|
| `src/lib/gtag.ts` | `trackEvent()` ユーティリティ |
| `src/lib/measurementProtocol.ts` | `sendServerEvent()` — Webhook 用 Measurement Protocol |
| `src/app/providers.tsx` | `AnalyticsProvider`（ページビュー自動追跡）・`disableAnalyticsForTestUser()` |
| `src/app/layout.tsx` | GA4 スクリプト読み込み（本番環境のみ） |
| `src/app/card/new/TemplateSelector.tsx` | `template_selected` |
| `src/components/CardEditor.tsx` | `card_created`, `card_saved`, `card_image_downloaded`, `card_shared_x`, `legacy_maker_migrated` |
| `src/app/card/[cardId]/CardViewClient.tsx` | `card_viewed`, `card_saved`, `card_shared_x`, `card_image_downloaded` |
| `src/app/card/vrchat/VrchatCardEditorClient.tsx` | `legacy_maker_visited` |
| `src/components/ProUpgradeModal.tsx` | `upgrade_modal_opened`（`trigger` prop で発火元を識別） |
| `src/components/UpgradeContent.tsx` | `upgrade_started` |
| `src/app/u/[slug]/ProfilePage.tsx` | `sign_up`, `card_url_shared`, `profile_edited` |
| `src/app/api/stripe/webhook/route.ts` | `upgrade_completed`, `subscription_cancelled` |

### GA_MEASUREMENT_PROTOCOL_SECRET の設定

Webhook からの計測（`upgrade_completed` / `subscription_cancelled`）を有効にするには、GA4 管理画面でデータストリームの「Measurement Protocol API シークレット」を発行し、環境変数に追加する必要がある。

```
GA_MEASUREMENT_PROTOCOL_SECRET=<シークレット値>
```

未設定の場合は Webhook 側の計測がサイレントにスキップされる（エラーなし）。
