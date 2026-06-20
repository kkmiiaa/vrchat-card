# テンプレートバージョニング・デザインパターン 設計仕様

> 対象読者: 開発者
> ステータス: 設計フェーズ（未実装）

---

## 1. 背景と課題

### 現在の構造

`templates` テーブルが「テンプレートの名前・説明」と「レイアウト定義（card_layout, web_layout, block_pool など）」を 1 行で保持している。

`cards` テーブルは `template_id` で `templates` を参照している。

```
templates
  id, label, description, is_published
  card_layout, web_layout, block_pool, form_sections, ...  ← 定義もここ

cards
  id, template_id, card_data, ...
```

### 問題

テンプレートを更新すると、そのテンプレートを使う**全カードに即影響する**。

- 「動作確認してからリリース」という仕組みがない
- ブロックの `dataKey` を変更・削除すると既存 `card_data` が壊れる（破壊的変更）
- ロールバック手段がない
- テンプレートを完璧に作り込むまでリリースできない → 市場確認が遅れる

---

## 2. 設計方針

### 2.1 テンプレートファミリーとバージョンを分離する

`templates` をテンプレートの「ファミリー（名前・概要）」に絞り、レイアウト定義は新設の `template_versions` テーブルに移す。

```
templates（ファミリー）
  id, label, description, sort_order, is_published, template_config
  ← レイアウト定義カラムはここから除去

template_versions（実装の履歴）
  id (uuid)
  template_id → templates.id
  version (int, 1 から始まりインクリメント)
  is_current (bool)      ← 新規カード作成時に使うバージョン。ファミリー内で1つのみ
  is_deprecated (bool)   ← 既存カードは閲覧継続、新規カード作成不可
  breaking (bool)        ← 旧 card_data と非互換な変更を含む
  changelog (text)       ← 変更内容の説明（任意）
  card_layout (jsonb)
  web_layout (jsonb)
  block_pool (jsonb)
  form_sections (jsonb)
  orientation_scales (jsonb)
  overlay_config (jsonb)
  card_width (int)
  card_height (int)
  web_width (int)
  card_config (jsonb)    ← theme, fontFamily, defaultSurface, fixedBackground 等
  sample_card_data (jsonb)
  created_at

cards
  template_version_id → template_versions.id  ← template_id から変更
  ← template_id は template_version を辿れば取得できる
```

### 2.2 カードは作成時点のバージョンに固定される

- 新規カード作成時: `is_current = true` のバージョンを使用
- 既存カード: 作成時点の `template_version_id` を保持し続ける
- テンプレートを更新しても既存カードは壊れない

---

## 3. バージョン操作

### 3.1 Publish（新バージョン公開）

新しいレイアウト定義を `template_versions` に INSERT し、`is_current = true` に設定する。
同時に旧バージョンの `is_current` を `false` にする。

```
操作前:
  version 1  is_current=true   is_deprecated=false

操作後:
  version 1  is_current=false  is_deprecated=false  ← 既存カードはここを参照し続ける
  version 2  is_current=true   is_deprecated=false  ← 新規カードはここを使う
```

**破壊的変更の検出**: Publish 時に旧バージョンの `block_pool` の `dataKey` 一覧と新バージョンを比較し、削除・リネームされた `dataKey` があれば `breaking = true` を自動セットする（または管理者が手動でフラグを立てる）。

`breaking = true` のバージョンを Publish する場合は、既存カードの `card_data` をどう扱うかを事前に決める必要がある。

### 3.2 Deprecate（廃止）

特定バージョンを `is_deprecated = true` にする。

- 既存カードはそのまま閲覧・表示できる
- そのバージョンを使っていたカードの編集は引き続き可能
- ただしそのバージョンで新規カードは作成できない

```
ユースケース:
  - 致命的な表示バグが見つかったバージョンの新規利用を停止したい
  - 旧バージョンへの新規流入を止めつつ、移行を待ちたい
```

### 3.3 Rollback（ロールバック）

旧バージョンに `is_current = true` を戻す（現在の current を `false` にする）。

```
操作前:
  version 1  is_current=false
  version 2  is_current=true   ← バグが見つかった

操作後:
  version 1  is_current=true   ← 戻す
  version 2  is_current=false
```

ロールバックは「新規カード作成先を切り替えるだけ」。既存カードのデータは変わらない。
version 2 を使っていたカードは version 2 のままレンダリングされる（壊れることはない）。
version 2 に `is_deprecated = true` をセットすれば新規利用も停止できる。

### 3.4 操作まとめ

| 操作 | 説明 | 既存カードへの影響 |
|---|---|---|
| **Publish** | 新バージョンを current にする | なし（旧バージョンを参照し続ける） |
| **Deprecate** | バージョンを廃止する（閲覧は継続） | なし（表示・編集はできる） |
| **Rollback** | 旧バージョンを current に戻す | なし |
| **Breaking Publish** | 破壊的変更を含む Publish | card_data の移行が必要（別途対応） |

---

## 4. デザインパターン

### 4.1 概念

デザインパターンは「同じデータ構造（`dataKey`）を維持したまま、見た目だけを切り替えられる選択肢」。

テンプレートのバージョンとは独立した概念。ユーザーがカード単位で選択する。

```
例:
  テンプレート: VRChat Standard
    バージョン: 2
      デザインパターン:
        - "default"  （標準・半透明）
        - "dark"     （ダークモード）
        - "pastel"   （パステルカラー）
```

### 4.2 デザインパターンが制御できるもの

デザインパターンは `CardRenderContext` の値の上書きと、ブロック単位の `variant` 上書きを担う。

| プロパティ | 現在の場所 | デザインパターンで上書き |
|---|---|---|
| `theme.accent` | `card_config.theme` | ✅ |
| `theme.text` | `card_config.theme` | ✅ |
| `theme.subText` | `card_config.theme` | ✅ |
| `theme.bg` | `card_config.theme` | ✅ |
| `fontFamily` | `card_config.fontFamily` | ✅ |
| `defaultSurface` | `card_config.defaultSurface` | ✅ |
| `fontScale` | `card_config.fontScale` | ✅ |
| `fixedBackground` | `card_config.fixedBackground` | ✅ |
| ブロックの `variant` | レイアウト内 ref ノード | ✅（`blockVariants` で blockId 単位に上書き） |
| ブロックの `surface` | レイアウト内 ref ノード | ✅（`blockSurfaces` で blockId 単位に上書き） |
| ブロックの `dataKey` | blockPool | ❌（バージョンの管轄） |
| ブロックの追加・削除 | blockPool / layout | ❌（バージョンの管轄） |

デザインパターンは **見た目の変更のみ** を担う。データ構造（`block_pool`、`dataKey`）とレイアウト構造はバージョンが管理する。

#### variant をデザインパターンに含める理由

`variant` はコンポーネントのコンテンツ表示方法（例: gauge を棒グラフで出すか円グラフで出すか）を制御する。テーマカラーや surface だけでは見た目の変化幅が小さく、デザインパターンとして意味のある差を出すには variant の切り替えが必要になる。

```
例: "ダークモード" パターン
  theme.bg       → 暗い色に変更
  defaultSurface → 'glass' に変更
  blockVariants  → { gauge: 'circle', status: 'compact' }  ← variant も切り替える
```

### 4.3 DB スキーマ

```sql
-- テンプレートバージョンに紐づくデザインパターン定義
create table template_design_patterns (
  id           uuid primary key default uuid_generate_v4(),
  version_id   uuid not null references template_versions on delete cascade,
  key          text not null,         -- 'default' | 'dark' | 'pastel' など
  label        text not null,         -- ユーザー向け表示名（「スタンダード」「ダーク」等）
  sort_order   int  not null default 0,
  config       jsonb not null,        -- CardRenderContext の上書き設定（後述）
  created_at   timestamp with time zone not null default now(),
  unique (version_id, key)
);

-- カードが選択したデザインパターン
-- cards テーブルに追加
alter table cards
  add column design_pattern_key text default null;
  -- null = デフォルトパターン（テンプレート定義の card_config をそのまま使用）
```

### 4.4 config の構造

```typescript
// template_design_patterns.config の型
type DesignPatternConfig = {
  theme?: Partial<CardRenderContext['theme']>
  /** blockPool の blockId をキーに variant を上書きする */
  blockVariants?: Record<string, BlockVariant>
  /** blockPool の blockId をキーに surface を上書きする */
  blockSurfaces?: Record<string, SurfaceVariant>
  fontFamily?: string
  fontScale?: Partial<FontScale>
  defaultSurface?: SurfaceVariant
  fixedBackground?: BackgroundValue
}
```

### 4.5 レンダリング時の適用順序

```
1. テンプレートバージョンの card_config（基底）
2. デザインパターンの config（上書き）
3. カード個別の background（cards.background）（最優先）
```

---

## 5. 破壊的変更の扱い

### 5.1 破壊的変更とは

旧バージョンの `card_data` に保存済みの `dataKey` が新バージョンで削除・リネームされた場合。

```
旧バージョン block_pool: { micOnRate, selfIntro, vrchat, discord }
新バージョン block_pool: { micOnRate, selfIntro, vrchat, twitter }  ← discord → twitter にリネーム

既存カードの card_data: { discord: "myid" }
→ 新バージョンでレンダリングすると discord ブロックが消えている（値が表示されない）
```

### 5.2 対処方針

| ケース | 対処 |
|---|---|
| 後方互換のある追加のみ（新 dataKey 追加） | `breaking = false`。旧カードは新ブロックが空で表示 |
| リネーム・削除を含む変更 | `breaking = true` をフラグ。`card_data` マイグレーション関数を書いてから Publish |
| 大規模な再設計 | 別テンプレートとして新規作成する方が安全 |

---

## 6. 実装ロードマップ

### ステップ 1: DB スキーマ変更

1. `template_versions` テーブル新設
2. 既存 `templates` テーブルのレイアウト定義カラムを `template_versions` に移行（version=1, is_current=true）
3. `cards.template_version_id` カラム追加、`cards.template_id` は削除しない（移行期間中は両方持つ）
4. 全 `cards` の `template_version_id` を対応する `template_versions.id` に埋める
5. `cards.template_id` を削除

### ステップ 2: アプリケーション側対応

1. テンプレート読み込み箇所を `template_version_id` 経由に変更
2. Admin UI に「Publish」「Deprecate」「Rollback」操作を追加
3. 破壊的変更の自動検出ロジック実装（block_pool の dataKey 差分比較）

### ステップ 3: デザインパターン（後回し可）

1. `template_design_patterns` テーブル新設
2. `cards.design_pattern_key` カラム追加
3. レンダラーでのパターン適用ロジック実装
4. カード編集 UI にパターン選択 UI 追加

### 優先度判断

`cards` の `template_id → template_version_id` 切り替えはユーザー数が少ないうちに済ませるほうがコストが低い。**ベータテスト開始前（フェーズ4 着手前）に ステップ1・2 を完了させる**ことを推奨する。デザインパターン（ステップ3）はフェーズ4 以降でよい。

---

## 7. 設計の境界線まとめ

| 概念 | 何を決める | 誰が設定する |
|---|---|---|
| **テンプレートファミリー** | 名前・説明・公開状態 | 管理者 |
| **テンプレートバージョン** | ブロック構成・レイアウト・デフォルトテーマ | 管理者（Admin UI） |
| **デザインパターン** | テーマ・フォント・サーフェスの見た目上書き | 管理者（定義）/ ユーザー（選択） |
| **カード** | 各ブロックの入力値・背景 | エンドユーザー |
