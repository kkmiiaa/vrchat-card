# vaacard — コンポーネント・ブロック・テンプレート 概念仕様書

> 対象読者: 開発者・テンプレート作成者

---

## 視覚仕様（生きた仕様書）

各コンポーネントの variant × surface の組み合わせは、開発サーバー上のビューワーページで確認する。

**`/test/components`** — variant ごとの表示・surface との組み合わせをインタラクティブに確認できる。このページが variant/surface の一次仕様。

---

## 1. 概要

カードの表示要素は **コンポーネント → ブロック → テンプレート → カード** という 4 段階の概念で構成される。

```
[コンポーネント管理者（開発者）]
       ↓ コンポーネントを定義（コード）
[コンポーネント（ComponentDef<T>）]
       ← 純粋なコンテンツ描画パーツ。値の表示 UI のみ担当。
         例: gauge, text, expressiveSelect, gender, ...
       ↓ テンプレート作成者がインスタンス化・配置
[ブロック（Block）]
       ← componentKey + dataKey + ラベル + surface + レイアウト情報
         例: componentKey='gauge', dataKey='micOnRate', surface='contained'
       ↓ ブロックを組み合わせてレイアウトを定義
[テンプレート（TemplateDefinition）]
       ← カードのレイアウト全体定義（向き・テーマ・背景）
         例: VRChat V1, VRChat V2
       ↓ エンドユーザーが値を入力
[カード（Card）]
       ← テンプレート + ユーザー入力値（DBに保存）
```

---

## 2. 登場人物（ロール）

| ロール | 誰か | 主な作業 |
|--------|------|----------|
| **コンポーネント管理者** | 開発者 | `ComponentDef<T>` を TypeScript でコーディングし、レジストリに登録する |
| **テンプレート作成者** | 現在は開発者、将来はユーザー | コンポーネントをブロックとしてインスタンス化し、テンプレートレイアウトを組む |
| **カード作成者** | エンドユーザー | テンプレートのフォームに値を入力してカードを作成・保存する |

---

## 3. 概念モデルの詳細

### 3.1 コンポーネント（ComponentDef）

> コード上の型名: `ComponentDef<T>` （`src/blocks/types.ts`）

コンポーネントは「再利用可能な純粋コンテンツ描画パーツ」の定義。**surface コンテナやラベルの描画は担当しない**（それは `GenericCardRenderer` が担う）。

```typescript
// src/blocks/types.ts
type ComponentDef<T = unknown> = {
  key: string               // レジストリ内の一意識別子（例: 'gauge'）
  defaultValue: T           // 値の初期値
  variants?: BlockVariant[] // 対応するデザインバリアント（コンテンツ表示の切り替え）
  global?: boolean          // true のとき選択肢が全界隈共通で固定（界隈横断検索が可能）
  FormItem: (props: ComponentFormProps<T>) => ReactNode
  CardItem?: (props: ComponentCardProps<T>) => ReactNode
  blockConfigForm?: (props: BlockConfigFormProps) => ReactNode
  isEmpty?: (value: T) => boolean
}

// CardItem の props（surface/label は含まない）
type ComponentCardProps<T> = {
  value: T
  ctx: CardRenderContext
  variant?: BlockVariant
  blockConfig?: Record<string, unknown>
  isInteractive?: boolean
}
```

#### コンポーネントの責務の明確化

| 担当 | 責務 |
|------|------|
| **コンポーネント（CardItem）** | 値のコンテンツ描画のみ（テキスト・ゲージバー・アイコン等） |
| **GenericCardRenderer** | surface コンテナ・ラベル・labelInset レイアウトをすべて管理 |

コンポーネントは `surface` や `label` を受け取らない。レンダラーがコンポーネントの出力を surface コンテナで包み、ラベルを配置する。

#### global フラグ

`global: true` のコンポーネントは選択肢・スキーマが全界隈共通で固定される。これにより界隈横断検索が可能になる。

| コンポーネント key | global | 理由 |
|---|---|---|
| `gender` | ✅ | 性別タグは普遍的な分類 |
| `language` | ✅ | 言語コードは普遍的 |
| `age` | ✅ | 年齢の検索スキーマは普遍的 |
| その他 | ❌ | 界隈・テンプレートに依存 |

#### blockConfigForm

テンプレート作成者（Admin UI）がブロック設定をカスタマイズするための UI。設定値は `Block.blockConfig` に保存され、`FormItem` および `CardItem` に `blockConfig` として渡される。

#### formLabel

`ComponentFormProps.formLabel` はテンプレート作成者がブロックのフォームタイトルをカスタマイズするための値。`FormItem` はこの値を優先してタイトルとして表示する。

#### labelIcon（ラベルアイコンプレフィックス）

`Block`・`LayoutNodeRow`・`LayoutNodeCol` の `labelIcon` フィールドに Tabler Icons のキー（例: `TbMicrophone`）を指定すると、ラベルテキストの左にアイコンが描画される。これは `GenericCardRenderer` が描画するため、コンポーネント実装は不要。

#### 空値表示の統一仕様

| ルール | 内容 |
|---|---|
| 空値デフォルト表示 | `"-"`（半角ハイフン）を subText 色で表示する |
| 全角ダッシュ禁止 | `"—"`（em dash）・`"ー"`（全角長音）はフォント依存のため使用しない |
| `hideWhenEmpty` オプション | `blockConfig.hideWhenEmpty: true` のとき、空値で `null` を返しブロックを非表示にする |

---

#### surface（コンテナ背景スタイル）

`surface` は **GenericCardRenderer がブロックを包む外側コンテナの背景スタイル**を制御するプロパティ。コンポーネント自体は surface を知らない。

```typescript
type SurfaceVariant = 'contained' | 'default' | 'glass' | 'flat' | 'transparent' | 'outline'
```

| surface 値 | 視覚的特徴 | 用途 |
|---|---|---|
| `contained` | 半透明白(0.85) + 枠なし | 基本コンテナ（デフォルト） |
| `glass` | 半透明白(0.55) + 白枠 + 影 | ガラスデザイン |
| `flat` | 不透明白(0.95) + グレー枠 | フラットデザイン |
| `transparent` | 背景・枠なし | コンテナなし（コンテンツのみ） |
| `outline` | 背景透明 + 白枠のみ | 軽量なフレーム |
| `default` | 後方互換エイリアス（= contained） | DB保存済みデータ向け |
| `simple` | 後方互換エイリアス（= contained） | DB保存済みデータ向け |

**surface とパディング**: `transparent` 以外の surface を設定すると、レンダラーがコンテナに標準パディングを付与する。

`defaultSurface`（テンプレートレベルの fallback）はテンプレートの `card_config.defaultSurface` で設定し、ブロックに `surface` が未指定のときに使われる。

---

### 3.2 ブロック（Block）

> コード上の型名: `Block` （`src/blocks/types.ts`）

ブロックは「テンプレート内に配置されたコンポーネントのインスタンス」。コンポーネントキーを参照し、データキー・ラベル・レイアウト・表示設定を付加する。

**componentKey / dataKey の分離**

- `componentKey`: 使用するコンポーネントの種類（`gauge`、`text` など）
- `dataKey`: `card_data` に保存・参照するキー（`micOnRate`、`selfIntro` など）

```typescript
type Block = {
  type: 'block'
  componentKey: string          // 使用するコンポーネントの key
  dataKey: string               // card_data に保存・参照するキー
  variant?: string              // コンテンツ表示バリアント
  surface?: SurfaceVariant      // コンテナ背景スタイル（GenericCardRenderer が適用）
  label?: string                // ブロック上部のラベル
  subLabel?: string             // ラベル右のサブテキスト
  labelColor?: string
  labelInset?: boolean          // ラベルをコンテナ内に配置するか
  labelInsetDir?: 'col' | 'row' // labelInset 時の並び方向
  contentFontScale?: number
  labelFontScale?: number
  alignSelf?: string
  blockConfig?: Record<string, unknown>
  minW?: number
  minH?: number
  flex?: number
}
```

#### GenericCardRenderer のブロック描画フロー

```
Block ノード
  ↓ surface コンテナを適用（background/border/boxShadow/padding/borderRadius）
  ↓ label を描画（labelInset=true → コンテナ内 / false → コンテナ外）
  ↓ component.CardItem を呼び出してコンテンツを描画
```

---

### 3.2.1 ブロックプール（BlockPoolEntry）と参照ノード（LayoutNodeRef）

テンプレートビルダーでは、ブロックの定義を「プール（pool）」と「レイアウトへの参照（ref）」に分離する。

#### BlockPoolEntry — プール定義

```typescript
type BlockPoolEntry = {
  componentKey: string
  dataKey: string
  label?: string
  subLabel?: string
  blockConfig?: Record<string, unknown>
}
```

プールは card・web レイアウトの**両方から共有される定義**。`variant` や `surface` はプールではなくレイアウト側（ref）で指定する。

#### LayoutNodeRef — レイアウト参照

```typescript
type LayoutNodeRef = {
  type: 'ref'
  blockId: string
  minW?: number
  minH?: number
  flex?: number
  variant?: string           // card と web で異なる variant を使い分けられる
  surface?: SurfaceVariant   // コンテナ背景スタイル
  contentFontScale?: number
  labelFontScale?: number
}
```

**設計の分離理由**: 同一ブロックでも card と web で異なる variant/surface を使いたい場合があるため、表示設定はレイアウト（ref）レベルで指定する。

---

### 3.2.2 テンプレートビルダーでのブロック追加 UX フロー

**Step 1: コンポーネントをプールに追加**
- 左パネル「プール」タブ → 「+ ブロックを追加」→ コンポーネント選択・blockId 入力

**Step 2: プールエントリを設定（blockConfig 編集）**
- `label` / `subLabel` / `dataKey` / `blockConfig`（選択肢・単位など）を編集

**Step 3: レイアウトに ref を追加**
- レイアウトツリーのコンテナノードを選択 → 「ref を追加」→ プールから `blockId` を選択

**Step 4: ref ノードのプロパティ編集**
- `minW` / `minH` / `flex` / `variant` / `surface` / `contentFontScale` / `labelFontScale`
- `labelInset: true` にするとラベルがコンテナ内に配置される

#### labelInset の動作

`labelInset: true` を指定すると、`GenericCardRenderer` がラベルとコンテンツを同じ surface コンテナ内に配置する。

- `dir === 'col'`（デフォルト）: ラベルが上、コンテンツが下
- `dir === 'row'`: ラベルが左、コンテンツが右（単行コンテンツでは縦方向センタリング）

---

### 3.3 テンプレート（TemplateDefinition）

テンプレートはカード全体のレイアウト定義。

```typescript
type TemplateDefinition = {
  id: string
  label: string
  theme: { accent, text, subText, bg }
  fontFamily: string
  borderRadius?: number
  backgroundKey?: string
  overlayKey?: string
  overlayFixed?: OverlayValue
  fontScale?: Partial<FontScale>
  blockPool?: Record<string, BlockPoolEntry>
  card: TemplateOrientationDef
  web: TemplateOrientationDef
  blockVariants?: Record<string, string>
}
```

#### blockVariants

テンプレート全体で orientation をまたいで共通の variant を指定する仕組み。ノードの `variant` が明示されている場合は `blockVariants` より優先される。

#### フォントサイズトークン（FontScale）

| トークン | 用途 | デフォルト比率 |
|----------|------|----------------|
| `xs` | 補助テキスト・バッジ内ラベル | 0.009 |
| `sm` | コンパクト本文・ラベル | 0.010 |
| `md` | 標準本文 | 0.012 |
| `lg` | やや大きめ本文 | 0.014 |
| `xl` | 名前など大見出し | 0.024 |

---

### 3.4 カード（Card）

カードはテンプレートのインスタンスで、エンドユーザーが入力した値を持つ。

- DB テーブル: `cards.card_data`
- 型: `Record<dataKey, value>`
- レンダリング: `GenericCardRenderer` がテンプレート定義を参照して描画

---

## 4. 作成フロー

```
1. コンポーネント管理者（開発者）
   └── ComponentDef<T> を定義し BLOCK_REGISTRY に登録
       （src/blocks/*.tsx + src/blocks/registry.ts）
       ※ コンポーネントはコンテンツのみを描画する。surface/label は不要。

2. テンプレート作成者（現在は開発者）
   └── Block を使ってブロックをインスタンス化（componentKey + dataKey を設定）
   └── surface / variant / labelInset を指定
   └── LayoutNode ツリーでレイアウトを組み立て

3. カード作成者（エンドユーザー）
   └── テンプレートを選択
   └── FormItem で各ブロックに値を入力
   └── card_data として DB に保存（キーは dataKey）
   └── GenericCardRenderer がテンプレート + 値を元にカードを描画
```

---

## 5. FormItem と CardItem

| 表現 | 役割 |
|---|---|
| **FormItem** | ユーザーが値を入力・編集する UI（カードエディター内） |
| **CardItem** | カード上にコンテンツを表示する UI（汎用レンダラーが使用） |

`CardItem` は `ComponentCardProps<T>`（`value`, `ctx`, `variant`, `blockConfig`, `isInteractive`）のみを受け取る。surface/label はレンダラーが担うため、コンポーネントに渡されない。

---

## 6. Admin ツール

管理者向けの UI（`src/app/admin/`）は以下の構成。

| タブ | 機能 |
|------|------|
| コンポーネント（BlockPreviewList） | 全コンポーネントを variant・surface・blockConfig でプレビュー（renderer と同じロジックで surface コンテナを適用） |
| テンプレート（TemplateBuilder） | ブロックプールを管理し、レイアウトツリーに ref を配置するビジュアルビルダー |
| カード | 既存ユーザーカードの一覧ブラウズ |

---

## 7. コードの命名ミスマッチ（注記）

| 概念上の名前 | コード上の型名 | ファイル |
|-------------|---------------|------|
| **コンポーネント** | `ComponentDef<T>` | `src/blocks/types.ts` |
| **ブロック** | `Block` | `src/blocks/types.ts` |
| **コンポーネントレジストリ** | `BLOCK_REGISTRY` | `src/blocks/registry.ts` |

---

## 8. 将来の拡張方針

| 項目 | 現在 | 将来 |
|------|------|------|
| テンプレート定義の保存 | コードにハードコード（v1, v2） | DB に保存（移行中） |
| テンプレートビルダーの公開 | 管理者のみ（Admin UI） | ユーザーが自分のテンプレートを作成可能 |
| テーマ・背景 | テンプレートにハードコード | ユーザーがカード単位でカスタマイズ可能に |

---

## 9. 型定義の場所

| ファイル | 内容 |
|----------|------|
| `src/blocks/types.ts` | `ComponentDef<T>`, `Block`, `LayoutNode`, `TemplateDefinition`, `CardRenderContext`, `SurfaceVariant`, `SURFACE_STYLE` など全主要型 |
| `src/blocks/registry.ts` | `BLOCK_REGISTRY`, `getBlock()`, `getAllBlocks()` |
| `src/blocks/*.tsx` | 各コンポーネントの実装（コンテンツ描画のみ） |
| `src/components/GenericCardRenderer.tsx` | surface コンテナ・ラベル・labelInset を一元管理するレンダラー |
| `src/app/admin/BlockPreviewList.tsx` | Admin コンポーネントプレビュー UI |
| `src/app/test/components/page.tsx` | variant × surface ビューワー（視覚仕様の一次ソース） |
