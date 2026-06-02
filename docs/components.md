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
       ← 汎用UIパーツ。フォームUIとカードUIをセットで持つ。
         例: gauge, text, expressiveSelect, gender, ...
       ↓ テンプレート作成者がインスタンス化・配置
[ブロック（Block）]
       ← componentKey + dataKey + ラベル + 設定 + レイアウト情報
         例: componentKey='gauge', dataKey='micOnRate', label='マイクオン率'
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

コンポーネントは「再利用可能な汎用 UI パーツ」の定義。フォーム入力 UI とカード表示 UI をセットで持つ。

```typescript
// src/blocks/types.ts
type ComponentDef<T = unknown> = {
  key: string               // レジストリ内の一意識別子（例: 'gauge'）
  defaultValue: T           // 値の初期値
  variants?: BlockVariant[] // 対応するデザインバリアント
  global?: boolean          // true のとき選択肢が全界隈共通で固定（界隈横断検索が可能）
  supportsSurface?: boolean // CardItem が surface prop を解釈する場合 true
  surfaceFor?: string[]     // surface が有効な variant 一覧（未指定かつ supportsSurface=true なら全 variant で有効）
  FormItem: (props: ComponentFormProps<T>) => ReactNode
  CardItem?: (props: ComponentCardProps<T>) => ReactNode
  blockConfigForm?: (props: BlockConfigFormProps) => ReactNode
}
```

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

`ComponentFormProps.formLabel` はテンプレート作成者がブロックのフォームタイトルをカスタマイズするための値。`FormItem` の実装はこの値を優先してタイトルとして表示する。未設定時はデフォルトの翻訳キーを使用する。

#### labelIcon（ラベルアイコンプレフィックス）

`Block`・`LayoutNodeRow`・`LayoutNodeCol` の `labelIcon` フィールドに Tabler Icons のキー（例: `TbMicrophone`）を指定すると、ラベルテキストの左にアイコンが描画される。

- `labelInset: true` の block → `LabelDef.icon` 経由でコンポーネントに渡される
- `labelInset: false` の block / `col` / `row` → `GenericCardRenderer` がラベル行に直接描画する

#### 空値表示の統一仕様

値が空のときの表示は以下のルールで統一されている。

| ルール | 内容 |
|---|---|
| 空値デフォルト表示 | `"-"`（半角ハイフン）を subText 色で表示する |
| 全角ダッシュ禁止 | `"—"`（em dash）・`"ー"`（全角長音）はフォント依存のため使用しない |
| `hideWhenEmpty` オプション | `blockConfig.hideWhenEmpty: true` のとき、空値で `null` を返しブロックを非表示にする |
| null 返却コンポーネント | 値が空でも常に `null` を返すコンポーネント: `sns`, `status`, `playEnv`, `activity`, `selfIntro`, `trustRank`, `gallery`（空欄は「未入力」ではなく「表示なし」を意味する） |

**`hideWhenEmpty` 対応コンポーネント**（blockConfig.hideWhenEmpty: true で null 返却）

`select`, `multiSelect`, `language`, `badgeList`, `markList`, `colorLabeledList`

---

#### surface（コンテナ背景スタイル）

`surface` は **ブロックのコンテナ背景スタイル**を制御するプロパティ。`SURFACE_STYLE` テーブル（`src/blocks/types.ts`）で定義されており、`supportsSurface: true` なコンポーネントのみ有効。

```typescript
type SurfaceVariant = 'simple' | 'default' | 'glass' | 'flat' | 'transparent' | 'outline'
```

| surface 値 | 視覚的特徴 | 用途 |
|---|---|---|
| `simple` | 半透明白 + 薄い白枠 | 汎用・デフォルト |
| `glass` | 半透明白(0.55) + 白枠 + 影 | ガラスデザイン（v2 テンプレート） |
| `flat` | 不透明白(0.95) + 濃いグレー枠 | フラットデザイン |
| `transparent` | 背景・枠なし | 背景に溶け込ませる |
| `outline` | 背景透明 + 白枠のみ | 軽量なフレーム |
| `default` | 半透明白(0.85) + 枠なし | 旧仕様・後方互換用 |

`defaultSurface`（テンプレートレベルの fallback）はテンプレートの `card_config.defaultSurface` で設定し、ブロックに `surface` が未指定のときに使われる。

#### ⚠️ 既知の設計課題: `glass` の二重意味

`glass` という名前が variant と surface の両方で使われており、意味が混在している。

| コンポーネント | `variant='glass'` の意味 | surface 対応 |
|---|---|---|
| `simpleSns`, `snsWithFriendPolicy` | 「surface コンテナを持つ」という構造選択。`surface` prop で見た目を変更可能 | ✅ `surfaceFor: ['glass']` |
| `activity` | `v2` variant のみ surface コンテナ表示 | ✅ `surfaceFor: ['v2']` |
| `profileImage`, `gallery`, `qrCode` | 内部要素（画像フレーム・サムネイル・QR枠）の固定スタイル。surface コンテナではない | ❌ surface 非対応 |
| `overlay` | カード全体を覆う glass オーバーレイ | ❌ surface 非対応 |

`simpleSns` / `snsWithFriendPolicy` の `glass` variant は本質的に「コンテナを持つかどうか」の選択であり、surface の `glass` スタイルとは別概念。将来的に variant 名を改める余地がある。

---

### 3.2 ブロック（Block）

> コード上の型名: `Block` （`src/blocks/types.ts`）

ブロックは「テンプレート内に配置されたコンポーネントのインスタンス」。コンポーネントキーを参照し、データキー・ラベル・レイアウト・表示設定を付加する。

**componentKey / dataKey の分離**

- `componentKey`: 使用するコンポーネントの種類（`gauge`、`text` など）
- `dataKey`: `card_data` に保存・参照するキー（`micOnRate`、`selfIntro` など）

この分離により、同一コンポーネントを異なるキーで複数配置できる（例: `gauge` コンポーネントを `micOnRate` と `trustRank` で別々に使用）。

```typescript
type Block = {
  type: 'block'
  componentKey: string          // 使用するコンポーネントの key
  dataKey: string               // card_data に保存・参照するキー
  variant?: string              // コンテンツ表示バリアント（省略時は 'simple' にフォールバック）
  surface?: SurfaceVariant      // コンテナ背景スタイル（supportsSurface: true のコンポーネントのみ有効）
  label?: string                // ブロック上部のラベル
  subLabel?: string             // ラベル右のサブテキスト
  labelColor?: string
  labelInset?: boolean          // ラベルをコンテンツ枠内に表示するか
  labelInsetDir?: 'col' | 'row' // ラベルとコンテンツの並び方向（'col'=縦、'row'=横）
  contentFontScale?: number
  labelFontScale?: number
  contentAlign?: string
  alignSelf?: string
  blockConfig?: Record<string, unknown>
  minW?: number
  minH?: number
  flex?: number
}
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
  variant?: string        // card と web で異なる variant を使い分けられる
  surface?: SurfaceVariant
  contentFontScale?: number
  labelFontScale?: number
}
```

**設計の分離理由**: 同一ブロック（例: `name`）でも card と web で異なる variant/surface を使いたい場合があるため、これらの表示設定はレイアウト（ref）レベルで指定する。

---

### 3.2.2 テンプレートビルダーでのブロック追加 UX フロー

**Step 1: コンポーネントをプールに追加**
- 左パネル「プール」タブ → 「+ ブロックを追加」
- コンポーネント一覧から選択し `blockId` を入力

**Step 2: プールエントリを設定（blockConfig 編集）**
- `label` / `subLabel` / `dataKey` / `blockConfig`（選択肢・単位など）を編集

**Step 3: レイアウトに ref を追加**
- レイアウトツリーのコンテナノードを選択 → 「ref を追加」→ プールから `blockId` を選択

**Step 4: ref ノードのプロパティ編集**
- `minW` / `minH` / `flex` / `variant` / `surface` / `contentFontScale` / `labelFontScale`

#### labelInset と LabelDef

`labelInset: true` を指定すると、`GenericCardRenderer` がブロックのラベル情報を `LabelDef` としてコンポーネントの `CardItem` に渡す。コンポーネント側はこの `label` prop を受け取り、自コンテナ内にラベルとコンテンツを描画する責務を持つ。

```typescript
type LabelDef = {
  text: string
  subText?: string
  color?: string        // 省略時はテーマの text 色
  fontScale?: number    // 省略時は 1
  dir?: 'row' | 'col'  // 並び方向（省略時は 'col' 相当）
  icon?: string         // Tabler Icons キー（例: 'TbMicrophone'）
}
```

- `dir === 'col'`（デフォルト）: ラベルが上、コンテンツが下
- `dir === 'row'`: ラベルが左、コンテンツが右（単行コンポーネントでは縦方向センタリング）
- コンポーネントがラベルをサポートするかは variant に依存する（例: `language`, `multiSelect` は `slash` variant のみ label 対応）

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

```typescript
// 例: V2 では profileImage を常に glass variant で描画
blockVariants: { profileImage: 'glass' }
```

#### フォントサイズトークン（FontScale）

カード幅に対する比率でフォントサイズを定義する。

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

```json
{
  "micOnRate": 80,
  "selfIntro": "よろしくお願いします！",
  "genderTag": { "tag": "female", "display": "女の子" },
  "language": { "preset": ["ja"], "custom": [] }
}
```

---

## 4. 作成フロー

```
1. コンポーネント管理者（開発者）
   └── ComponentDef<T> を定義し BLOCK_REGISTRY に登録
       （src/blocks/*.tsx + src/blocks/registry.ts）

2. テンプレート作成者（現在は開発者）
   └── Block を使ってブロックをインスタンス化（componentKey + dataKey を設定）
   └── LayoutNode ツリーでレイアウトを組み立て
   └── TemplateDefinition として定義（DB 管理に移行中）

3. カード作成者（エンドユーザー）
   └── テンプレートを選択
   └── FormItem で各ブロックに値を入力
   └── card_data として DB に保存（キーは dataKey）
   └── GenericCardRenderer がテンプレート + 値を元にカードを描画
```

---

## 5. FormItem と CardItem

すべてのコンポーネントは 2 つの UI 表現を持つ。

| 表現 | 役割 |
|---|---|
| **FormItem** | ユーザーが値を入力・編集する UI（カードエディター内） |
| **CardItem** | カード上に値を表示する UI（汎用レンダラーが使用） |

`FormItem` は `ComponentFormProps<T>` を受け取り、`formLabel` があればそれをフォームタイトルとして使用する。`CardItem` は `ComponentCardProps<T>` を受け取り、`CardRenderContext`（テーマ・フォントサイズ等）を参照して描画する。

---

## 6. Admin ツール

管理者向けの UI（`src/app/admin/`）は以下の構成。

| タブ | 機能 |
|------|------|
| コンポーネント（BlockPreviewList） | 全コンポーネントを variant・surface・blockConfig でインタラクティブにプレビュー |
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
| `src/blocks/types.ts` | `ComponentDef<T>`, `Block`, `LayoutNode`, `TemplateDefinition`, `CardRenderContext`, `FontScale` など全主要型 |
| `src/blocks/registry.ts` | `BLOCK_REGISTRY`, `getBlock()`, `getAllBlocks()` |
| `src/blocks/*.tsx` | 各コンポーネントの実装 |
| `src/app/admin/BlockPreviewList.tsx` | Admin コンポーネントプレビュー UI |
| `src/app/test/components/page.tsx` | variant × surface ビューワー（視覚仕様の一次ソース） |
