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
| `multiSelect` | `multiSelect.tsx` | ❌ | ✅ | `string[]` (`[]`) | 複数選択（variant: default/slash/icon/icon-slash） |
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
| `colorStatus` | `colorStatus.tsx` | ❌ | ✅ | `Record<string, string>` (`{}`) | 色付きステータス一覧（variant: default/compact/cards） |
| `activity` | `activity.tsx` | ❌ | ❌ | 週次活動時間帯オブジェクト | 週間活動時間帯 |
| `simpleSns` | `simpleSns.tsx` | ❌ | ✅ | `string` (`''`) | 単一 SNS ID |
| `snsBundle` | `snsBundle.tsx` | ❌ | ✅ | `Record<string, string>` (`{}`) | 複数 SNS まとめ |
| `gender` | `gender.tsx` | ✅ | ❌ | `{ tag: '', display: '' }` | 性別（固定選択肢） |
| `language` | `language.tsx` | ✅ | ❌ | `{ preset: [], custom: [] }` | 使用言語 |
| `age` | `age.tsx` | ✅ | ❌ | `{ searchTag: '', display: '' }` | 年齢 |
| `profileImage` | `profileImage.tsx` | ❌ | ❌ | `{ base64: null, url: null }` | プロフィール画像（variant: default/circle/glass） |
| `colorLabeledList` | `colorLabeledList.tsx` | ❌ | ❌ | — | 色付きラベルリスト |
| `divider` | `divider.tsx` | ❌ | ❌ | — | 区切り線 |
| `gallery` | `gallery.tsx` | ❌ | ❌ | `string[]` (`[]`) | ギャラリー画像 |
| `background` | `background.tsx` | ❌ | ❌ | — | カード背景 |
| `overlay` | `overlay.tsx` | ❌ | ❌ | — | オーバーレイ |

#### labelIcon（ラベルアイコンプレフィックス）

`Block`・`LayoutNodeRow`・`LayoutNodeCol` の `labelIcon` フィールドに Tabler Icons のキー（例: `TbMicrophone`）を指定すると、ラベルテキストの左にアイコンが描画される。

- `labelInset: true` の block → `LabelDef.icon` 経由でコンポーネントに渡される
- `labelInset: false` の block / `col` / `row` → `GenericCardRenderer` がラベル行に直接描画する
- テンプレートビルダーの「アイコン」入力欄（テキスト）から設定可能

#### 空値表示の統一仕様

値が空のときの表示は以下のルールで統一されている。

| ルール | 内容 |
|---|---|
| 空値デフォルト表示 | `"-"`（半角ハイフン）を subText 色で表示する |
| 全角ダッシュ禁止 | `"—"`（em dash）・`"ー"`（全角長音）はフォント依存のため使用しない |
| `hideWhenEmpty` オプション | `blockConfig.hideWhenEmpty: true` のとき、空値で `null` を返しブロックを非表示にする |
| null 返却コンポーネント | 値が空でも常に `null` を返すコンポーネント: `sns`, `status`, `playEnv`, `activity`, `selfIntro`, `trustRank`, `gallery`（データ性質上、空欄は「未入力」ではなく「表示なし」を意味する） |

**`hideWhenEmpty` 対応コンポーネント**（blockConfig.hideWhenEmpty: true で null 返却）

`select`, `multiSelect`, `language`, `badgeList`, `markList`, `colorLabeledList`

#### コンポーネント別 CardItem の表示挙動

| コンポーネント | 条件 | CardItem の動作 |
|---|---|---|
| `gender` | `tag === 'none'`（非公開） | TbMinus アイコン + 「-」テキストを横並びで表示（null 返却しない） |
| `gender` | 空値 (`tag === ''`) | 「-」テキストを表示（null 返却しない） |
| `gender` | 有効な tag | アイコン+テキストを常に横並び（flex row）で表示 |
| `age` | `searchTag === '非公開'` | 「-」テキストを表示（null 返却しない） |
| `age` | `searchTag === ''` かつ `display === ''` | 「-」テキストを表示（null 返却しない） |
| `markList` | マーク済み項目あり | ルート要素に `alignSelf: flex-start`, `alignContent: flex-start` を付与し縦方向の引き伸ばしを防ぐ |

---

#### glass variant 統一仕様

`glass` variant を持つコンポーネントは以下のスタイルを**固定値**で適用する。比率スケールは使用しない。

| プロパティ | 値 |
|---|---|
| `background` | `rgba(255,255,255,0.55)` |
| `border` | `1px solid rgba(255,255,255,0.75)` |
| `boxShadow` | `0 0 12px rgba(0,0,0,0.08)` |

> `borderRadius` のみ `ctx.cardWidth` 比率で計算してよい（カード全体との視覚的整合性のため）。

**glass variant を持つコンポーネント一覧**

| コンポーネント | glass variant の特徴 |
|---|---|
| `profileImage` | 画像を角丸でクリップ + glass 枠・影 |
| `gallery` | 各サムネイルに glass 枠・影を付与 |
| `simpleSns` | 横並びアイコン+テキストを glass ボックスに包む |
| `snsWithFriendPolicy` | SNS ID と友達申請ポリシーを glass ボックスに包む |
| `qrCode` | QR コードを glass ボックスに包む（`backdropFilter: blur` を追加） |

---

#### コンポーネント variant 対応表

全コンポーネントの variant 一覧。`bgVariant` 列は `supportsBgVariant: true` のとき ✅。
⚠️ 列は **variant を宣言しているが CardItem 内に分岐実装がない**（宣言のみ）コンポーネントを示す。

| コンポーネント key | variants | bgVariant | ⚠️ 未実装 variant | 備考 |
|---|---|---|---|---|
| `text` | `default` | ✅ | — | multiline false 時は縦中央揃え |
| `select` | `default` / `badge` / `compact` | ✅ | — | — |
| `multi-select` | `default` / `slash` / `icon` / `icon-slash` | ✅ | — | slash・icon-slash は labelInset 対応・縦中央揃え |
| `gauge` | `default` | ✅ | — | — |
| `expressive-select` | `default` | ✅ | — | — |
| `badge` | `default` / `outline` / `subtle` | ❌ | — | value に color を持つ |
| `badge-list` | `default` | ❌ | — | — |
| `booleanFlag` | `default` / `badge` | ✅ | — | — |
| `rating` | `default` / `compact` | ❌ | — | compact は星アイコンサイズ縮小 |
| `linkItem` | `default` / `compact` | ❌ | — | — |
| `dateItem` | `default` / `compact` / `badge` | ✅ | — | — |
| `colorPalette` | `default` / `compact` | ❌ | — | — |
| `tagList` | `default` / `compact` | ❌ | — | — |
| `mark-list` | `default` | ❌ | — | — |
| `mark-grid` | `default` / `white` | ❌ | — | white は全セル白背景・gap 1px |
| `color-status` | `default` / `compact` / `cards` | ❌ | — | — |
| `colorLabeledList` | `default` / `compact` | ❌ | — | compact はドットサイズ・フォント縮小 |
| `interactions` | `default` / `grid` | ❌ | — | default=横長タグ、grid=ラベル上・マーク下のカード形式 |
| `activity` | `default` / `v2` | ❌ | — | — |
| `micOnRate` | `default` / `gradient` | ❌ | — | — |
| `playEnv` | `default` / `slash` / `icon` | ❌ | — | default=バッジ並び、slash=スラッシュ区切り、icon=アイコン付きバッジ |
| `sns` | `default` / `icon` | ❌ | — | default=テキストラベル+ID、icon=プラットフォームアイコン画像+ID |
| `simple-sns` | `default` / `glass` | ✅ | — | glass は glass 統一仕様を適用 |
| `sns-with-friend-policy` | `default` / `glass` | ❌ | — | glass は glass 統一仕様を適用 |
| `trustRank` | `default` | ❌ | — | カラーバッジ固定 |
| `status` | `default` | ❌ | — | カラードット+テキスト固定 |
| `gender` | `default` / `compact` | ✅ | — | compact=アイコン+テキストのみ（背景・枠なし）、縦中央揃え |
| `language` | `default` / `slash` | ✅ | — | slash は labelInset 対応・縦中央揃え |
| `age` | `default` / `badge` | ✅ | — | badge=アクセントカラーのバッジ形式（白文字） |
| `profileImage` | `default` / `circle` / `glass` | ❌ | — | circle=50%、glass は glass 統一仕様を適用 |
| `gallery` | `default` / `glass` | ❌ | — | glass は glass 統一仕様を適用。入力枚数に応じてレイアウト変化 |
| `qr-code` | `default` / `glass` | ❌ | — | glass は glass 統一仕様 + backdropFilter blur |
| `selfIntro` | `default` | ❌ | — | — |
| `divider` | `horizontal` / `vertical` | ❌ | — | variants が方向指定を兼ねる |
| `overlay` | `glass` / `solid` | ❌ | — | カード全体のオーバーレイ |
| `background` | — | ❌ | — | variants なし |
| `font` | — | ❌ | — | variants なし |
| `showBalloon` | — | ❌ | — | variants なし |

> ⚠️ 列が「—」のコンポーネントは全 variant が実装済み。

---

#### variant key と表示の対応表

variant key ごとに「何がどう変わるか」を定義した一覧。複数コンポーネントで共通して使われる key は意味が統一されている必要がある。

| variant key | 視覚的な意味 | 採用コンポーネント |
|---|---|---|
| `default` | そのコンポーネントの標準表示。他 variant のベースライン | 全コンポーネント |
| `compact` | フォント・ドット・余白を縮小したコンパクト版。スペース効率を優先 | `select`, `dateItem`, `rating`, `linkItem`, `colorPalette`, `tagList`, `colorLabeledList`, `color-status`, `gender` |
| `badge` | 色付き丸角バッジ形式で値を表示 | `select`, `dateItem`, `booleanFlag`, `age` |
| `outline` | 背景透明・枠線のみのバッジ（`badge` コンポーネント専用） | `badge` |
| `subtle` | 色の薄いfill（`color + '22'`）のバッジ（`badge` コンポーネント専用） | `badge` |
| `slash` | 値を「/」で区切って横並びテキスト表示。labelInset・縦中央揃え対応 | `multi-select`, `language`, `playEnv` |
| `icon` | アイコンを先頭に追加（SVG アイコンまたはプラットフォームアイコン画像） | `multi-select`, `playEnv`, `sns` |
| `icon-slash` | アイコン+テキストを「/」区切りで表示（`multi-select` 専用） | `multi-select` |
| `glass` | 半透明白背景 + 白枠線 + 影のガラス質カード表示。統一仕様を適用 | `profileImage`, `gallery`, `simple-sns`, `sns-with-friend-policy`, `qr-code`, `overlay` |
| `solid` | 不透明な塗りつぶしオーバーレイ（`overlay` 専用） | `overlay` |
| `circle` | 50% border-radius による円形クリップ（`profileImage` 専用） | `profileImage` |
| `white` | 全セルに白背景を強制適用し gap を縮小（`mark-grid` 専用） | `mark-grid` |
| `gradient` | 単色バーをグラデーションバーに置き換え（`micOnRate` 専用） | `micOnRate` |
| `cards` | 左ボーダー付きカード形式に変更（`color-status` 専用） | `color-status` |
| `grid` | グリッドカード形式（ラベル上・マーク下）に変更（`interactions` 専用） | `interactions` |
| `v2` | 第2世代の視覚デザイン（タイムバー+サークル）。`default` の完全リデザイン（`activity` 専用） | `activity` |
| `horizontal` | 水平方向の区切り線（`divider` 専用。default を持たず方向が variant） | `divider` |
| `vertical` | 垂直方向の区切り線（`divider` 専用） | `divider` |

**variant key の命名ルール**

| ルール | 内容 |
|---|---|
| `default` は常にある | 全コンポーネントの基本 variant。他 variant との比較基準 |
| 汎用 key は意味を統一する | `compact`=縮小、`badge`=丸角バッジ、`slash`=スラッシュ区切り、`icon`=アイコン化、`glass`=ガラス質 |
| コンポーネント専用 key は末尾に注記 | `white`（mark-grid）・`v2`（activity）・`cards`（color-status）など意味が汎化しない key |
| `divider` は例外 | `horizontal`/`vertical` が方向指定を兼ねるため `default` が存在しない |

**glass variant を持つコンポーネント**（統一仕様: `border: 1px solid rgba(255,255,255,0.75)` / `boxShadow: 0 0 12px rgba(0,0,0,0.08)`）

| コンポーネント | background | 備考 |
|---|---|---|
| `profileImage` | `#e5e7eb`（画像なし時） | 角丸画像を glass 枠・影でラップ |
| `gallery` | 各サムネイルに個別適用 | 入力枚数に応じてレイアウト変化 |
| `simple-sns` | `rgba(255,255,255,0.55)` | アイコン+ID を glass ボックスに包む |
| `sns-with-friend-policy` | `rgba(255,255,255,0.55)` | SNS ID と友達申請ポリシーを glass ボックスに包む |
| `qr-code` | `rgba(255,255,255,0.45)` | `backdropFilter: blur(8px)` を追加。背景透過度が他より低い |
| `overlay` | `rgba(255,255,255,0.55)` | カード全体を覆うオーバーレイ |

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
  variant?: string              // コンテンツ表示バリアント（省略時は blockVariants → 'default' にフォールバック）
  bgVariant?: BgVariant         // コンテナ背景バリアント
  label?: string                // ブロック上部のラベル
  subLabel?: string             // ラベル右のサブテキスト
  labelColor?: string
  labelInset?: boolean          // ラベルをコンテンツ枠内に表示するか
  labelInsetDir?: 'col' | 'row' // ラベルとコンテンツの並び方向（'col'=縦、'row'=横）
  contentFontScale?: number     // コンテンツフォントサイズ倍率
  labelFontScale?: number       // ラベルフォントサイズ倍率
  contentAlign?: string         // コンテンツエリアの縦方向揃え（alignItems: 'center' 等）
  alignSelf?: string            // 親 flex コンテナ内での自身の縦位置
  blockConfig?: Record<string, unknown> // コンポーネントへ渡す追加設定
  minW?: number                 // 最小幅（グリッドセル数）
  minH?: number                 // 最小高（グリッドセル数）
  flex?: number                 // flex 伸長係数
}
```

> ⚠️ **削除済みプロパティ**: `glass`, `glassRadius` はレンダラー由来のガラス枠指定であり、コンポーネントの責務でないため削除済み。代わりに各コンポーネントの `glass` **variant** を使用する。

#### labelInset と LabelDef

`labelInset: true` を指定すると、`GenericCardRenderer` がブロックのラベル情報を `LabelDef` としてコンポーネントの `CardItem` に渡す。コンポーネント側はこの `label` prop を受け取り、自コンテナ内にラベルとコンテンツを描画する責務を持つ。

```typescript
type LabelDef = {
  text: string
  subText?: string
  color?: string        // 省略時はテーマの text 色
  fontScale?: number    // 省略時は 1
  dir?: 'row' | 'col'  // 並び方向（省略時は 'col' 相当）
  icon?: string         // アイコンキー（Tabler Icons: 例 'TbMicrophone'）
}
```

- `dir === 'col'`（デフォルト）: ラベルが上、コンテンツが下に縦並び
- `dir === 'row'`: ラベルが左、コンテンツが右に横並び。単行コンポーネントでは縦方向センタリング（`alignItems: center`）が適用される
- `icon`: Tabler Icons のキー文字列を指定すると、ラベルテキストの左にアイコンが表示される（`gauge` コンポーネント対応済み）

コンポーネントがラベルをサポートするかは variant に依存する場合がある（例: `language`, `multiSelect` は `slash` variant のみ label 対応）。

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
  card: TemplateOrientationDef  // カード表示レイアウト（固定サイズ）
  web: TemplateOrientationDef   // Web表示レイアウト（autoHeight）
  /** dataKey ごとのデフォルト variant（card/web 共通で適用）。ノード直指定が優先される。 */
  blockVariants?: Record<string, string>
}
```

#### blockVariants

`blockVariants` はテンプレート全体で orientation をまたいで共通の variant を指定する仕組み。これにより card と web で同じ dataKey のコンポーネントが常に同じ variant で描画されることが保証される。

```typescript
// 例: V2 では profileImage を常に glass variant で描画
blockVariants: { profileImage: 'glass' }
```

- ノードの `variant` が明示されている場合は `blockVariants` より優先される
- `blockVariants` も未指定の場合は `'default'` にフォールバック

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
