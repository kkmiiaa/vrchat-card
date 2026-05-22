# vaacard — コンポーネント・ブロック・テンプレート 概念仕様書

> 対象読者: 開発者・テンプレート作成者

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
  key: string              // レジストリ内の一意識別子（例: 'gauge'）
  defaultValue: T          // 値の初期値
  variants?: BlockVariant[] // 対応するデザインバリアント
  global?: boolean         // true のとき選択肢が全界隈共通で固定（界隈横断検索が可能）
  FormItem: (props: ComponentFormProps<T>) => ReactNode   // フォームUI
  CardItem?: (props: ComponentCardProps<T>) => ReactNode  // カード表示UI
  blockConfigForm?: (props: BlockConfigFormProps) => ReactNode  // テンプレート作成者向け設定UI
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

テンプレート作成者（Admin UI）がブロック設定をカスタマイズするための UI。`blockConfigForm` を持つコンポーネントは、テンプレートに配置する際に追加オプションを設定できる。設定値は `Block.blockConfig` に保存され、`FormItem` および `CardItem` に `blockConfig` として渡される。

| コンポーネント | blockConfigForm で設定できる主なオプション |
|---|---|
| `text` | `multiline`（複数行可否）、`maxLength`（最大文字数）、`rows`（表示行数）、`placeholder` |
| `expressiveSelect` | `options`（選択肢: value/label/color/icon） |
| `gauge` | `maxValue`（最大値）、`unit`（単位ラベル） |
| `booleanFlag` | `trueLabel`/`falseLabel`（表示ラベル） |
| `rating` | `max`（最大スター数） |
| `colorPalette` | `maxColors`（最大色数） |
| `colorStatus` | `items`（ステータス定義: label/color/description） |
| `markList` | `marks`（マーク定義: label/icon/ok/ng） |
| `tagList` | `placeholder`、`maxTags` |
| `dateItem` | `showAge`（年齢表示可否） |
| `simpleSns` | `platform`（SNS プラットフォーム名）、`placeholder` |
| `snsBundle` | `platforms`（表示プラットフォーム一覧） |

#### formLabel

`ComponentFormProps.formLabel` はテンプレート作成者がブロックのフォームタイトルをカスタマイズするための値。`FormItem` の実装はこの値を優先してタイトルとして表示する。未設定時はデフォルトの翻訳キーを使用する。

#### コンポーネント一覧（レジストリ登録済み）

`src/blocks/registry.ts` の `BLOCK_REGISTRY` に登録されている。

| key | ファイル | global | blockConfigForm | defaultValue の型 | 説明 |
|-----|----------|--------|-----------------|-------------------|------|
| `text` | `text.tsx` | ❌ | ✅ | `string` (`''`) | テキスト入力 |
| `select` | `select.tsx` | ❌ | ✅ | `string` (`''`) | 単一選択 |
| `multiSelect` | `multiSelect.tsx` | ❌ | ✅ | `string[]` (`[]`) | 複数選択 |
| `gauge` | `gauge.tsx` | ❌ | ✅ | `number` (`0`) | ゲージ（0〜maxValue） |
| `expressiveSelect` | `expressiveSelect.tsx` | ❌ | ✅ | `{ tag: '', display: '' }` | アイコン付き選択 |
| `badge` | `badge.tsx` | ❌ | ❌ | `{ label: '', color: '' }` | バッジ（ラベル＋色） |
| `booleanFlag` | `booleanFlag.tsx` | ❌ | ✅ | `boolean` (`false`) | Yes/No フラグ |
| `rating` | `rating.tsx` | ❌ | ✅ | `number` (`0`) | 星レーティング |
| `linkItem` | `linkItem.tsx` | ❌ | ❌ | `{ label: '', url: '' }` | リンク（ラベル＋URL） |
| `dateItem` | `dateItem.tsx` | ❌ | ✅ | `{ display: '', iso: '' }` | 日付 |
| `colorPalette` | `colorPalette.tsx` | ❌ | ✅ | `string[]`（初期4色） | カラーパレット |
| `tagList` | `tagList.tsx` | ❌ | ✅ | `string[]` (`[]`) | タグリスト |
| `markList` | `markList.tsx` | ❌ | ✅ | `MarkItem[]`（デフォルト項目あり） | マーク付きリスト（OK/NG等） |
| `colorStatus` | `colorStatus.tsx` | ❌ | ✅ | `Record<string, boolean>` (`{}`) | 色付きステータス一覧 |
| `activity` | `activity.tsx` | ❌ | ❌ | 週次活動時間帯オブジェクト | 週間活動時間帯 |
| `simpleSns` | `simpleSns.tsx` | ❌ | ✅ | `string` (`''`) | 単一 SNS ID |
| `snsBundle` | `snsBundle.tsx` | ❌ | ✅ | `Record<string, string>` (`{}`) | 複数 SNS まとめ |
| `gender` | `gender.tsx` | ✅ | ❌ | `{ tag: '', display: '' }` | 性別（固定選択肢） |
| `language` | `language.tsx` | ✅ | ❌ | `{ preset: [], custom: [] }` | 使用言語 |
| `age` | `age.tsx` | ✅ | ❌ | `{ searchTag: '', display: '' }` | 年齢 |
| `profileImage` | `profileImage.tsx` | ❌ | ❌ | `string` (`''`) | プロフィール画像 URL |
| `colorLabeledList` | `colorLabeledList.tsx` | ❌ | ❌ | — | 色付きラベルリスト |
| `divider` | `divider.tsx` | ❌ | ❌ | — | 区切り線 |
| `gallery` | `gallery.tsx` | ❌ | ❌ | `string[]` (`[]`) | ギャラリー画像 |
| `background` | `background.tsx` | ❌ | ❌ | — | カード背景 |
| `overlay` | `overlay.tsx` | ❌ | ❌ | — | オーバーレイ |

---

### 3.2 ブロック（Block）

> コード上の型名: `Block` （`src/blocks/types.ts`）

ブロックは「テンプレート内に配置されたコンポーネントのインスタンス」。コンポーネントキーを参照し、データキー・ラベル・レイアウト・表示設定を付加する。

**componentKey / dataKey の分離**

- `componentKey`: 使用するコンポーネントの種類（`gauge`、`text` など）
- `dataKey`: `card_data` に保存・参照するキー（`micOnRate`、`selfIntro` など）

この分離により、同一コンポーネントを異なるキーで複数配置できる（例: `gauge` コンポーネントを `micOnRate` と `trustRank` で別々に使用）。

```typescript
// src/blocks/types.ts
type Block = {
  type: 'block'
  componentKey: string          // 使用するコンポーネントの key
  dataKey: string               // card_data に保存・参照するキー
  variant: BlockVariant         // コンテンツ表示バリアント
  bgVariant?: BgVariant         // コンテナ背景バリアント
  label?: string                // ブロック上部のラベル
  subLabel?: string             // ラベル右のサブテキスト
  labelColor?: string
  labelInset?: boolean          // ラベルをコンテンツ枠内に表示するか
  labelInsetDir?: 'col' | 'row'
  contentFontScale?: number     // コンテンツフォントサイズ倍率
  labelFontScale?: number       // ラベルフォントサイズ倍率
  blockConfig?: Record<string, unknown> // コンポーネントへ渡す追加設定
  minW?: number                 // 最小幅（グリッドセル数）
  minH?: number                 // 最小高（グリッドセル数）
  flex?: number                 // flex 伸長係数
  alignSelf?: string
  glass?: boolean               // 白枠ガラススタイルでラップするか
  glassRadius?: number
}
```

**例**: `gauge` コンポーネントから `マイクオン率` ブロックを作る

```typescript
const micOnRateBlock: Block = {
  type: 'block',
  componentKey: 'gauge',     // コンポーネントキー
  dataKey: 'micOnRate',      // card_data のキー
  variant: 'gauge',
  bgVariant: 'glass',
  label: 'マイクオン率',
  blockConfig: { maxValue: 100 },
  minW: 2,
  flex: 1,
}
```

---

### 3.3 テンプレート（TemplateDefinition）

テンプレートはカード全体のレイアウト定義。ブロックをツリー構造（`LayoutNode`）で組み合わせ、向き（横/縦）ごとにレイアウトを持つ。

```typescript
type TemplateDefinition = {
  id: string
  label: string
  theme: { accent, text, subText, bg }
  fontFamily: string
  borderRadius?: number
  backgroundKey?: string    // 背景コンポーネントの dataKey
  overlayKey?: string       // オーバーレイコンポーネントの dataKey
  overlayFixed?: OverlayValue
  fontScale?: Partial<FontScale>
  landscape: TemplateOrientationDef  // 横向きレイアウト
  portrait: TemplateOrientationDef   // 縦向きレイアウト
}
```

#### レイアウトノードツリー

```
LayoutNode
├── Block         (type: 'block') ← リーフ。実際のコンポーネントを描画
├── LayoutNodeRow (type: 'row')   ← 子を横並び
└── LayoutNodeCol (type: 'col')   ← 子を縦並び
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

#### デザインバリアント（BgVariant）

| 値 | 見た目 |
|----|--------|
| `default` | 白背景ボックス（`rgba(255,255,255,0.85)`） |
| `glass` | すりガラス（`rgba(255,255,255,0.55)` + ボーダー） |
| `transparent` | 背景なし |
| `outline` | 枠線のみ |

---

### 3.4 カード（Card）

カードはテンプレートのインスタンスで、エンドユーザーが入力した値を持つ。

- DB テーブル: `cards.card_data`
- 型: `Record<dataKey, value>` （= `BlockValues`）
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
   └── TemplateDefinition として定義（現在はコードにハードコード: v1, v2）

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

管理者向けの UI（`src/app/admin/`）は以下の 3 タブで構成される。

| タブ | 機能 |
|------|------|
| コンポーネント（BlockPreviewList） | 全コンポーネントをバリアント・bgVariant・blockConfig・ヘッダー設定でプレビュー。blockConfigForm の動作確認も可能 |
| テンプレート（TemplateBuilder） | ブロックをドラッグ&ドロップでレイアウトに組み込むビジュアルビルダー |
| カード | 既存ユーザーカードの一覧ブラウズ |

---

## 7. コードの命名ミスマッチ（注記）

| 概念上の名前 | コード上の型名 | ファイル |
|-------------|---------------|------|
| **コンポーネント** | `ComponentDef<T>` | `src/blocks/types.ts` |
| **ブロック** | `Block` | `src/blocks/types.ts` |
| **コンポーネントレジストリ** | `BLOCK_REGISTRY` | `src/blocks/registry.ts` |

旧コードには `Block<T>`（現: `ComponentDef<T>`）、`LayoutNodeBlock`（現: `Block`）という命名が残っている場合がある。

---

## 8. 将来の拡張方針

| 項目 | 現在 | 将来 |
|------|------|------|
| テンプレート定義の保存 | コードにハードコード（v1, v2） | DB に保存（`template_definitions` テーブル等） |
| テンプレートビルダーの公開 | 管理者のみ（Admin UI） | ユーザーが自分のテンプレートを作成可能 |
| コンポーネント定義 | 管理者がコードで定義 | 引き続き管理者のみ（コードが必要） |
| テーマ・背景 | テンプレートにハードコード | ユーザーがカード単位でカスタマイズ可能に |

---

## 9. 型定義の場所

| ファイル | 内容 |
|----------|------|
| `src/blocks/types.ts` | `ComponentDef<T>`, `Block`, `LayoutNode`, `TemplateDefinition`, `CardRenderContext`, `FontScale` など全主要型 |
| `src/blocks/registry.ts` | `BLOCK_REGISTRY`, `getBlock()`, `getAllBlocks()` |
| `src/blocks/*.tsx` | 各コンポーネントの実装 |
| `src/app/admin/BlockPreviewList.tsx` | Admin コンポーネントプレビュー UI |
