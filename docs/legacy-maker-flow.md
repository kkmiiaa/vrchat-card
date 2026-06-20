# 旧メーカー（/card/vrchat）導線設計

## 目的

`/card/vrchat` の役割・データフロー・マイグレーション設計を明文化し、
関係者間の認識ズレを防ぐ。

---

## `/card/vrchat` の立ち位置

- **ログイン不要**で使えるスクラッチパッド（お試しエディタ）
- 旧メーカーの主要導線。既存ユーザーの bookmark がここを指している
- 作成したデータは **localStorage にのみ保存**される（DB への保存はログイン後のマイグレーション時のみ）
- ログイン・マイグレーション完了後は `/card/{cardId}` に遷移し、以降は `/card/vrchat` を使わない

### `/card/vrchat` が DB テンプレートを読む必要はない

ログイン後のユーザーは `/card/{cardId}` に遷移するため、`/card/vrchat` が
`fetchTemplateLayout` で DB テンプレートを読む必要はない。
`v1Template`（TS ハードコード定義）を使い続けて問題ない。

---

## データフロー全体図

```
【未ログイン】
/card/vrchat
  ↓ CardEditor（v1Template を使用）
  ↓ useCardValues
  ├─ localStorage に旧フォーマットデータあり → migrateFromOld() → sns オブジェクト形式に統一
  └─ なし → ブロックのデフォルト値で初期化
  ↓ ユーザーが編集
  ↓ localStorage に自動保存（新・旧フォーマット混在の可能性あり）

【「マイページに保存」クリック → 未ログイン時】
  ↓ handleShareByUrl()
  ↓ auth.getUser() → null
  → /auth/login?next=/card/vrchat にリダイレクト

【ログイン後、/card/vrchat に戻る】
  ↓ autoMigrateRef が発火
  ↓ handleShareByUrl() が自動実行
  ↓ values（localStorage 由来・旧フォーマットの可能性あり）を createCard() で DB に保存
     ※ ここで migrateV1LegacyData() を通す必要がある（TODO: 未実装）
  → /card/{cardId}?created=1 にリダイレクト

【/card/{cardId}（カード閲覧・共有ページ）】
  ↓ CardViewClient が DB から card_data を取得
  ↓ migrateLegacyCardData('v1', raw) で旧フォーマットを変換
  ↓ CardTemplate で表示（DB テンプレートまたはフォールバック）

【/card/{cardId}/edit（カード編集ページ）】
  ↓ page.tsx が DB から card_data を取得
  ↓ migrateLegacyCardData('v1', card.card_data) で変換
  ↓ CardEditorClient に渡す
  ↓ 以降は自動保存（debounce 1.5秒）で DB に書き続ける
     ※ 自動保存は新フォーマットで上書きされるため、DB データは徐々にクリーンになる
```

---

## データフォーマットの変換レイヤー

3つの変換関数が存在し、それぞれ役割が異なる。

| 関数 | 場所 | 変換内容 | 呼び出しタイミング |
|---|---|---|---|
| `migrateFromOld` | `src/hooks/useCardValues.ts` | さらに古いフラット形式（`vrchatId`, `twitterId` がトップレベル）→ `sns` オブジェクト形式 | localStorage 読み込み時 |
| `migrateV1CardData` | `src/lib/legacyCardDataMigration.ts` | 旧メーカー V1 形式（`sns` オブジェクト）→ 新形式（`vrchat`, `x`, `discord` がトップレベル） | `handleShareByUrl` で DB 保存前（TODO）、および DB 読み込み時 |
| `migrateV2CardData` | `src/lib/legacyCardDataMigration.ts` | V2 旧形式（`sns` オブジェクト・`micOnRate`）→ 新形式 | DB 読み込み時 |

### フォーマット変遷（V1）

```
【最古フォーマット】localStorage のフラット形式
{
  vrchatId: 'xxx',
  twitterId: 'yyy',
  discordId: 'zzz',
  friendPolicy: 'frPolicyAnyone',
  gender: 'male',
  language: ['ja', 'en'],
  age: { mode: '20s' },
  ...
}
  ↓ migrateFromOld()
【旧フォーマット】sns オブジェクト形式（現在の localStorage・旧メーカー由来 DB データ）
{
  sns: {
    vrchatId: 'xxx',
    twitterId: 'yyy',
    discordId: 'zzz',
    friendPolicy: 'frPolicyAnyone',
  },
  gender: 'male',          ← string
  language: ['ja', 'en'],  ← string[]
  age: { mode: '20s' },    ← mode キー
  ...
}
  ↓ migrateV1CardData()
【新フォーマット】TemplateDefinition ベースの形式
{
  vrchat: 'xxx',
  x: 'yyy',
  discord: 'zzz',
  friendPolicy: 'frPolicyAnyone',  ← string（単一選択）
  gender: { tag: 'male', display: '' },
  language: { preset: ['ja', 'en'], custom: [] },
  age: { searchTag: '20s' },       ← searchTag キー
  ...
}
```

---

## `/card/vrchat` が担うべき処理の境界

| 処理 | 担当 | 備考 |
|---|---|---|
| 旧 localStorage データの読み込み | `useCardValues` の `migrateFromOld` | 最古フォーマット→旧フォーマット変換 |
| DB 保存前の新フォーマット変換 | `handleShareByUrl` 内で `migrateV1LegacyData` を呼ぶ | **未実装・TODO** |
| DB 読み込み時の変換 | `migrateLegacyCardData('v1', ...)` | 閲覧・編集ページ両方で実装済み |
| DB テンプレート取得 | **不要** | /card/vrchat はログイン前専用のスクラッチパッド |

---

## 残作業（TODO）

### handleShareByUrl に migrateV1LegacyData を接続する

`src/components/CardEditor.tsx` の `handleShareByUrl` にて、
`template.id === 'v1'` の場合に保存前に変換を通す。

```typescript
// handleShareByUrl 内、createCard の直前に追加
const cardDataToSave = template.id === 'v1'
  ? migrateV1LegacyData(values as Record<string, unknown>)
  : values as Record<string, unknown>

const result = await createCard({
  templateId: template.id,
  cardData: cardDataToSave,  // ← 変換済みデータを渡す
  ...
})
```

これにより DB には常に新フォーマットで保存される。
既存の DB 読み込み時変換（`migrateLegacyCardData`）はフォールバックとして引き続き有効。

---

## /card/vrchat → /card/{cardId} 遷移後のルール

- 遷移後は `/card/{cardId}` が主な導線
- 編集は `/card/{cardId}/edit`
- `/card/vrchat` に戻ることはない（localStorage の内容は引き続き残るが参照されない）
- `localStorage('vrchat-card-cache')` のクリアは現状非実装（将来的に検討）
