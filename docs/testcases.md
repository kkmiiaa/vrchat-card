# vaacard テストケース一覧

> 仕様書（spec.md）の各セクションに対応。  
> E2E 実装ファイルは `tests/e2e/spec-*.spec.ts` および `spec-legacy-maker.spec.ts`。

---

## TC-1: ヘッダー構成（spec-header.spec.ts）

### TC-1-1: LP（`/`）ヘッダー

| # | 状態 | 確認内容 | 期待結果 |
|---|---|---|---|
| 1-1-1 | 未ログイン | ヘッダーに「ログイン」リンクがある | 表示される |
| 1-1-2 | 未ログイン | ヘッダーに「マイページ」リンクがある | 表示されない |
| 1-1-3 | ログイン済み | ヘッダーに「マイページ」リンクがある | 表示される |
| 1-1-4 | ログイン済み | ヘッダーに「ログイン」リンクがある | 表示されない |

### TC-1-2: カード編集（`/card/[cardId]`）ヘッダー

| # | 状態 | 確認内容 | 期待結果 |
|---|---|---|---|
| 1-2-1 | 未ログイン | `/card/new` にアクセス | `/auth/login` にリダイレクト |
| 1-2-2 | ログイン済み・cardId あり | 左に「下書き保存済み」または「保存中...」が表示される | 表示される |
| 1-2-3 | ログイン済み | ボタン順が「画像で保存」→「Xでシェア」の順 | 画像保存が左 |
| 1-2-4 | ログイン済み | ヘッダーに「マイページ」リンクがある | 表示される |

### TC-1-3: カード閲覧（`/card/[cardId]`）ヘッダー

| # | 状態 | 確認内容 | 期待結果 |
|---|---|---|---|
| 1-3-1 | 未ログイン | ヘッダーに「ログイン」リンクがある | 表示される |
| 1-3-2 | 未ログイン | ヘッダーに編集・保存ボタンがある | 表示されない |
| 1-3-3 | ログイン済み・非オーナー | ヘッダーに編集・保存ボタンがある | 表示されない |
| 1-3-4 | ログイン済み・オーナー | ヘッダーに「編集」ボタンがある | 表示される |
| 1-3-5 | ログイン済み・オーナー | ボタン順が「編集」→「画像で保存」→「Xで共有」の順 | 正しい順で表示 |

### TC-1-4: マイページ（`/u/[slug]`）ヘッダー

| # | 状態 | 確認内容 | 期待結果 |
|---|---|---|---|
| 1-4-1 | 未ログイン（他者のページ） | ヘッダーに「ログイン」リンクがある | 表示される |
| 1-4-2 | ログイン済み・他者のページ | ヘッダーに「マイページ」リンクがある | 表示される |
| 1-4-3 | ログイン済み・自分のページ | ヘッダーの HeaderAuth が非表示（hideMyPage=true） | 表示されない |
| 1-4-4 | ログイン済み・自分のページ | 「編集」「設定」ボタンがプロフィール本文内にある | ヘッダー外に表示 |

### TC-1-5: 探索（`/c/vrchat`）ヘッダー

| # | 状態 | 確認内容 | 期待結果 |
|---|---|---|---|
| 1-5-1 | 未ログイン | 「カードを作る」リンクがある | 表示される |
| 1-5-2 | 未ログイン | 「ログイン」リンクがある | 表示される |
| 1-5-3 | ログイン済み | 「マイページ」リンクがある | 表示される |

---

## TC-2: 下書き・公開フロー（spec-draft.spec.ts）

### TC-2-1: 下書きステータス表示

| # | 確認内容 | 期待結果 |
|---|---|---|
| 2-1-1 | cardId があるときにヘッダーに保存ステータスが出る | 「下書き保存済み」または「保存中...」が表示 |
| 2-1-2 | 入力中のステータス | 「保存中...」に切り替わる |
| 2-1-3 | 入力停止後 1.5秒+のステータス | 「下書き保存済み」に切り替わる |

### TC-2-2: 下書きバッジ（マイページ）

| # | 確認内容 | 期待結果 |
|---|---|---|
| 2-2-1 | image_url なしのカードにバッジがある | 「下書き」バッジが表示される（オーナーのみ） |
| 2-2-2 | 「マイページに保存」後のバッジ | 「下書き」バッジが消える |

### TC-2-3: 下書きカードの非公開

| # | 確認内容 | 期待結果 |
|---|---|---|
| 2-3-1 | 下書きカードが探索ページに表示されない | 未ログインユーザーからは見えない |
| 2-3-2 | 下書きカードの閲覧 URL に未ログインでアクセス | 404 またはリダイレクト |

### TC-2-4: image_url 保存タイミング

| # | アクション | card_data 保存 | image_url 保存 |
|---|---|---|---|
| 2-4-1 | debounce 自動保存（1.5秒） | ✅ | ❌（下書きバッジが残る） |
| 2-4-2 | 「マイページに保存」 | ✅ | ✅（バッジが消える） |
| 2-4-3 | 「Xでシェア」 | ✅ | ✅ |
| 2-4-4 | 「画像で保存」 | ✅ | ✅ |

---

## TC-3: カード作成〜公開フロー（spec-card-flow.spec.ts）

### TC-3-1: テンプレート選択

| # | 確認内容 | 期待結果 |
|---|---|---|
| 3-1-1 | Standard と Glass が選択肢に表示される | 表示される |
| 3-1-2 | Standard を選択するとエディタへ遷移 | `/card/[cardId]` に遷移 |
| 3-1-3 | Glass を選択するとエディタへ遷移 | `/card/[cardId]` に遷移 |

### TC-3-2: カード保存完了モーダル

| # | 確認内容 | 期待結果 |
|---|---|---|
| 3-2-1 | 「マイページに保存」後にモーダルが表示される | 表示される |
| 3-2-2 | モーダルに「URLをコピー」がある | 表示される |
| 3-2-3 | モーダルに「Xでシェア」がある | 表示される |
| 3-2-4 | モーダルに「マイページ」リンクがある | 表示される |
| 3-2-5 | 保存後の URL に `?created=1` が含まれる | 含まれる |

### TC-3-3: 画像ダウンロード後のトースト

| # | 確認内容 | 期待結果 |
|---|---|---|
| 3-3-1 | 「画像で保存」後にトーストが出る | 表示される |
| 3-3-2 | トーストの文言 | 「マイページに保存して、URLで共有できるようにしませんか？」 |
| 3-3-3 | トーストに「マイページに保存」への導線がある | 表示される |

---

## TC-4: 認証・設定（spec-settings-auth.spec.ts）

### TC-4-1: /settings ページ削除

| # | 確認内容 | 期待結果 |
|---|---|---|
| 4-1-1 | `/settings` にアクセス | 404 またはリダイレクト |

### TC-4-2: 設定モーダル（フリープラン）

| # | 確認内容 | 期待結果 |
|---|---|---|
| 4-2-1 | 設定モーダルが開く | ダイアログが表示される |
| 4-2-2 | ログイン中のメールアドレスが表示される | 表示される |
| 4-2-3 | 「フリープラン」と表示される | 表示される |
| 4-2-4 | 「アップグレード」リンクがある | 表示される |
| 4-2-5 | 「ログアウト」ボタンがある | 表示される |
| 4-2-6 | ログアウト後に `/` にリダイレクト | リダイレクトされる |

### TC-4-3: ログインページ

| # | 確認内容 | 期待結果 |
|---|---|---|
| 4-3-1 | メールアドレス・パスワードフォームがある | 表示される |
| 4-3-2 | Google ログインボタンがある | 表示される |
| 4-3-3 | Discord ログインボタンがある | 表示される |

---

## TC-5: 探索機能（spec-explore.spec.ts）

### TC-5-1: 初期表示

| # | 状態 | 確認内容 | 期待結果 |
|---|---|---|---|
| 5-1-1 | 未ログイン | ページが表示される（500 なし） | 正常表示 |
| 5-1-2 | フリープラン | 表示カード数が最大 20 件 | 20件以下 |

### TC-5-2: フリープランの制限

| # | 確認内容 | 期待結果 |
|---|---|---|
| 5-2-1 | 検索フォームが非表示 | 表示されない |
| 5-2-2 | Pro プランへの誘導が表示される | 表示される |
| 5-2-3 | フィルター入力が操作できない | 存在しないか無効 |

### TC-5-3: OGP

| # | 確認内容 | 期待結果 |
|---|---|---|
| 5-3-1 | カード閲覧ページに `og:image` メタタグがある | 存在する |
| 5-3-2 | image_url がない下書きカードの og:image | `/og-default.png` が設定される |

---

## TC-6: 旧メーカー（/card/vrchat）デグレ防止（spec-legacy-maker.spec.ts）

### TC-6-A: アクセス・リダイレクト

| # | 確認内容 | 期待結果 |
|---|---|---|
| 6-A-1 | 未ログインで `/card/vrchat` にアクセス | ログインページへ飛ばない |
| 6-A-2 | `/tools/vrchat-introduction-card` にアクセス | `/card/vrchat` にリダイレクト |
| 6-A-3 | 未ログインで `/card/vrchat` にアクセス | テンプレート選択画面は出ない（旧メーカーのエディタが表示） |
| 6-A-4 | ログイン済みで `/card/vrchat` にアクセス | `/card/new`（テンプレート選択）にリダイレクト |

### TC-6-B: 表示

| # | 確認内容 | 期待結果 |
|---|---|---|
| 6-B-1 | 500 エラーが出ない | エラーなし |
| 6-B-2 | vaacard ロゴが表示される | 表示される |
| 6-B-3 | ページタイトルに VRChat が含まれる | 含まれる |
| 6-B-4 | カードプレビュー領域が表示される | 表示される |
| 6-B-5 | 「カードデザイン」セクションがある | 表示される |
| 6-B-6 | 「プロフィール情報」セクションがある | 表示される |
| 6-B-7 | 「画像で保存」ボタンがある | 表示される |
| 6-B-8 | 「Xでシェア」ボタンがある | 表示される |
| 6-B-9 | 「ログイン」リンクがヘッダーにある（未ログイン） | 表示される |

### TC-6-C: フォーム入力

| # | セクション | 確認内容 | 期待結果 |
|---|---|---|---|
| 6-C-1 | プロフィール情報 | 名前を入力できる | 入力値が反映 |
| 6-C-2 | プロフィール情報 | 性別タグを入力できる | 入力値が反映 |
| 6-C-3 | プロフィール情報 | 自己紹介を入力できる | 入力値が反映 |
| 6-C-4 | プロフィール情報 | マイクON率スライダーが表示される | 表示される |
| 6-C-5 | SNS・コンタクト | VRChat ID を入力できる | 入力値が反映 |
| 6-C-6 | SNS・コンタクト | フレンド申請ポリシーが表示される | 表示される |
| 6-C-7 | SNS・コンタクト | 活動時間の入力欄がある | 表示される |
| 6-C-8 | SNS・コンタクト | OKなこと・NGなことが表示される | 表示される |
| 6-C-9 | カードデザイン | グラデーション背景の選択肢がある | 表示される |
| 6-C-10 | カードデザイン | フォント設定がある | 表示される |
| 6-C-11 | カードデザイン | 背景カラーボタンをクリックできる | クリックしても 500 なし |

### TC-6-D: カードプレビュー

| # | 確認内容 | 期待結果 |
|---|---|---|
| 6-D-1 | 名前入力後にプレビューがクラッシュしない | 500 エラーなし |
| 6-D-2 | 長い自己紹介を入力してもエラーが出ない | 500 エラーなし |
| 6-D-3 | 背景変更後にプレビューがクラッシュしない | 500 エラーなし |

### TC-6-E: 画像保存・Xシェア

| # | 確認内容 | 期待結果 |
|---|---|---|
| 6-E-1 | 「画像で保存」を押しても 500 エラーが出ない | エラーなし |
| 6-E-2 | 「Xでシェア」を押すと Twitter/X の URL が開く | x.com または twitter.com に遷移 |
| 6-E-3 | 「画像で保存」後に登録訴求トーストが表示される | 表示される |

### TC-6-F: localStorage 永続化

| # | 確認内容 | 期待結果 |
|---|---|---|
| 6-F-1 | 名前入力→リロード後にデータが保持される | 入力値が残っている |
| 6-F-2 | localStorage のキーが `vrchat-card-cache` になっている | キーが存在し JSON として解析できる |

### TC-6-G: ログイン訴求 UI

| # | 確認内容 | 期待結果 |
|---|---|---|
| 6-G-1 | 「URLで共有できる」旨の訴求が画面にある | テキストまたは UI が表示される |
| 6-G-2 | 「マイページに保存」ボタンがある | 表示される |
| 6-G-3 | 「マイページに保存」を押すとログイン画面へ | `/auth/login` に遷移 |

### TC-6-H: 自動マイグレーション（ログイン済み）

| # | 確認内容 | 期待結果 |
|---|---|---|
| 6-H-1 | 旧メーカーで入力後ログインするとデータが引き継がれる | localStorage のデータが CardEditor に反映される |
| 6-H-2 | マイグレーション後に 500 エラーが出ない | エラーなし |
| 6-H-3 | マイグレーション後に `/card/new` でテンプレ選択が再表示されない | エラーなし（仕様による） |

---

## TC-7: モバイル表示（iPhone 14 相当 / 390×844px）

### TC-7-A: カード編集 FloatingButtons（ログイン済み）

| # | 確認内容 | 期待結果 |
|---|---|---|
| 7-A-1 | ヘッダーのPC向けボタン群が非表示 | `hidden sm:flex` により見えない |
| 7-A-2 | FloatingButtons が画面右下に表示される | 画面下半分の右側に表示 |
| 7-A-3 | FloatingButtons に「画像で保存」がある | 表示される |
| 7-A-4 | FloatingButtons に「Xでシェア」がある | 表示される |
| 7-A-5 | FloatingButtons に「マイページに保存」がある | 表示される |
| 7-A-6 | ボタン順序が 画像で保存 → Xでシェア → マイページに保存 | 上から順 |
| 7-A-7 | 下書き保存ステータスはモバイルで非表示 | `hidden sm:inline` により見えない |
| 7-A-8 | フォーム入力後もレイアウトが崩れない | 横スクロールなし |
| 7-A-9 | 「カードデザイン」パネルが表示される | 表示される |

### TC-7-B: カード保存後（ログイン済み）

| # | 確認内容 | 期待結果 |
|---|---|---|
| 7-B-1 | 「マイページに保存」後に `?created=1` 付き URL へリダイレクト | URL が変化する |
| 7-B-2 | 保存後ページが正常表示される | 500 エラーなし |
| 7-B-3 | ヘッダーのPC向けボタン群が非表示 | 見えない |
| 7-B-4 | FloatingButtons に全ボタンが表示される | 3ボタン表示 |
| 7-B-5 | 横スクロールが発生していない | scrollWidth ≦ innerWidth + 1px |

### TC-7-C: マイページ（ログイン済み）

| # | 確認内容 | 期待結果 |
|---|---|---|
| 7-C-1 | プロフィールが正常に表示される | 500 エラーなし |
| 7-C-2 | ヘッダーの「マイページ」リンクが非表示（hideMyPage） | 見えない |
| 7-C-3 | 「編集」「設定」ボタンがプロフィール内に表示される | 表示される |
| 7-C-4 | 設定モーダルがモバイルで開く | モーダルが表示される |
| 7-C-5 | 設定モーダルがモバイル幅に収まっている | width ≦ viewport幅 |
| 7-C-6 | 横スクロールが発生していない | scrollWidth ≦ innerWidth + 1px |

### TC-7-D: 画像保存・トースト（ログイン済み）

| # | 確認内容 | 期待結果 |
|---|---|---|
| 7-D-1 | 「画像で保存」を押しても 500 エラーが出ない | エラーなし |
| 7-D-2 | 「画像で保存」後に保存誘導トーストが表示される | トーストが表示 |
| 7-D-3 | トーストがモバイル幅に収まっている | left ≥ 12px かつ right ≤ viewport幅 - 12px |

### TC-7-E: ヘッダー表示条件（ログイン済み）

| # | 確認内容 | 期待結果 |
|---|---|---|
| 7-E-1 | LP で「マイページ」リンクが表示される | 表示される |
| 7-E-2 | 探索ページで「マイページ」リンクが表示される | 表示される |
| 7-E-3 | カード編集で「マイページ」リンクが表示される | 表示される |

### TC-7-F: LP・ナビゲーション（未ログイン）

| # | 確認内容 | 期待結果 |
|---|---|---|
| 7-F-1 | ページが正常表示される | 500 エラーなし |
| 7-F-2 | vaacard ロゴが表示される | 表示される |
| 7-F-3 | ヘッダーに「ログイン」リンクが表示される | 表示される |
| 7-F-4 | 「カードを作る」CTAが表示される | 表示される |
| 7-F-5 | 「ユーザーを探す」はモバイルで非表示 | 見えない |
| 7-F-6 | フッターが表示される | footer要素が見える |
| 7-F-7 | 横スクロールが発生していない | scrollWidth ≦ innerWidth + 1px |

### TC-7-G: 旧メーカー `/card/vrchat`（未ログイン）

| # | 確認内容 | 期待結果 |
|---|---|---|
| 7-G-1 | エラーなく表示される | 500 エラーなし |
| 7-G-2 | カードプレビューが表示される | 表示される |
| 7-G-3 | ヘッダーのPC向けボタン群が非表示 | 見えない |
| 7-G-4 | ヘッダーに「ログイン」リンクが表示される | 表示される |
| 7-G-5 | 「マイページに保存」ボタンが画面内にある | FloatingButtons に表示 |
| 7-G-6 | 横スクロールが発生していない | scrollWidth ≦ innerWidth + 1px |
| 7-G-7 | 名前入力フィールドに入力できる | 入力値が反映される |
| 7-G-8 | 入力後もレイアウトが崩れない | 横スクロールなし |
| 7-G-9 | 「画像で保存」が FloatingButtons に表示される | 表示される |
| 7-G-10 | 「Xでシェア」が FloatingButtons に表示される | 表示される |
| 7-G-11 | 「マイページに保存」押下でログインページへ遷移 | `/auth/login` に遷移 |

### TC-7-H: ログインページ（未ログイン）

| # | 確認内容 | 期待結果 |
|---|---|---|
| 7-H-1 | エラーなく表示される | 500 エラーなし |
| 7-H-2 | Google・Discord ボタンが表示される | 表示される |
| 7-H-3 | タップターゲットが 44px 以上（Apple HIG 基準） | height ≥ 44px |
| 7-H-4 | メールフォームがタップ・入力できる | 入力値が反映される |
| 7-H-5 | 横スクロールが発生していない | scrollWidth ≦ innerWidth + 1px |

---

## コンポーネントテスト

> 対象: `src/blocks/` 以下の各コンポーネント定義（`ComponentDef<T>`）  
> ユニットテストまたは Admin UI の BlockPreviewList でのスモークテストとして実施する。

### 共通: labelInset レイアウト（`src/blocks/__tests__/labelLayout.test.tsx`）

labelInset 機能（`LabelDef.dir`）の横並び・縦並び・センタリング挙動を検証する。

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `label.dir === 'col'` で各コンポーネントを描画 | デフォルト方向（縦並び） | ルートコンテナの `flexDirection` が `column` |
| 2 | `label.dir === 'row'` で各コンポーネントを描画 | 横並び指定 | ルートコンテナの `flexDirection` が `row` |
| 3 | `label.dir === 'row'` で単行コンポーネントを描画 | 横並び時の縦方向センタリング | ルートコンテナの `alignItems` が `center` |

**対象コンポーネント**: `age`, `gender`, `rating`, `gauge`, `language(slash)`, `select`, `text`, `multiSelect(slash)`, `colorStatus`  
**NOTE**: `language`, `multiSelect` の label 対応は `slash` variant のみ。

---

### 共通: labelColor の反映（`src/components/__tests__/GenericCardRenderer.labelColor.test.tsx`）

`labelInset` OFF 時（block の外部ラベル）および `col` / `row` ノードのラベル色が `GenericCardRenderer` で正しく反映されることを検証する。

| # | ノード種別 | テスト内容 | 期待値 |
|---|---|---|---|
| 1 | `col` | `labelIcon` を指定 | ラベル行に svg アイコンが描画される |
| 2 | `col` | `labelIcon` 未指定 | svg が描画されない |
| 3 | `block`（labelInset:false） | `labelIcon` を指定 | ラベル行に svg アイコンが描画される |
| 4 | `block`（labelInset:false） | `labelColor` を指定 | ラベル span のカラーが指定色 |
| 5 | `block`（labelInset:false） | `labelColor` 未指定 | `theme.text` 色が使われる |
| 6 | `col` | `labelColor` を指定 | ラベル span のカラーが指定色 |
| 7 | `col` | `labelColor` 未指定 | `theme.text` 色が使われる |
| 8 | `row` | `labelColor` を指定 | ラベル span のカラーが指定色 |
| 9 | `row` | `labelColor` 未指定 | `theme.text` 色が使われる |

---

### 共通バリデーション（`dataKey` / 文字列入力）

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `dataKey` に英数字・アンダースコア以外を入力 | dataKey のフォーマットバリデーション | エラーが表示され保存できない |
| 2 | 同一テンプレート内で `dataKey` を重複登録 | dataKey の重複チェック | エラーが表示され保存できない |
| 3 | 文字列入力コンポーネントで空文字を送信 | 空文字の禁止（最小長バリデーション） | エラーが表示され保存できない（許容設定がない場合） |
| 4 | 文字列入力コンポーネントで最大文字数を超える入力 | 最大文字数バリデーション | 最大文字数超の入力が制限またはエラー表示される |

---

### `text`

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | `''`（空文字） |
| 2 | `blockConfig.multiline=true` | 複数行入力に設定したとき | textarea が描画される |
| 3 | `blockConfig.multiline=false` | 1行入力に設定したとき | input[type=text] が描画される |
| 4 | `blockConfig.maxLength=10` | 最大文字数を 10 に設定したとき | 10 文字超の入力が制限される |
| 5 | `blockConfig.rows=5` | 行数を 5 に設定したとき | textarea の rows が 5 になる |
| 6 | `blockConfig.placeholder='ここに入力'` | placeholder を設定したとき | placeholder に設定文字列が表示される |
| 7 | `formLabel='自己紹介'` | フォームラベルを設定したとき | 「自己紹介」がラベルとして表示される |
| 8 | `card_data[dataKey]` の型 | 保存される値の型 | `string` |
| 9 | `card_data = { [dataKey]: 'こんにちは' }` | 入力時の card_data 全体 | `{ [dataKey]: 'こんにちは' }` が保存される |
| 10 | `card_data = { [dataKey]: '' }` | 未入力時の card_data 全体 | `{ [dataKey]: '' }` が保存される |
| 11 | `cardItem.value = 'こんにちは'` | 入力済み値をカードに表示したとき | `'こんにちは'` が描画される |
| 12 | `cardItem.value = ''` | 未入力値をカードに表示したとき | エラーなく描画される（空表示） |

---

### `select`

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | `''`（空文字） |
| 2 | `blockConfig.options=[{ value:'A', label:'Aさん' }]` | 選択肢（value+label）を設定したとき | label が表示された選択肢ボタンが描画される |
| 3 | `blockConfig.options` の各選択肢に `color` を設定（FormItem） | 選択肢ボタンに色を設定したとき | 対応する色で選択肢ボタンが描画される |
| 4 | 選択肢をクリック | ユーザーが選択したとき | `value`（label ではなく）が `onChange` に渡される |
| 5 | 選択済みの選択肢を再クリック | 選択を解除したとき | `''` が `onChange` に渡される |
| 6 | `formLabel='信頼度'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 7 | `card_data[dataKey]` の型 | 保存される値の型 | `string`（選択肢の `value` フィールド） |
| 8 | `card_data = { [dataKey]: 'trusted' }` | 選択時の card_data 全体 | `{ [dataKey]: 'trusted' }` が保存される |
| 9 | `card_data = { [dataKey]: '' }` | 未選択時の card_data 全体 | `{ [dataKey]: '' }` が保存される |
| 10 | `cardItem.value = 'trusted'`（color あり） | 選択済み値をカードに表示したとき | 対応する label が描画される |
| 11 | `cardItem.value = 'trusted'` のとき `blockConfig.options` の `color` | 選択した値の色が CardItem にも反映されるか | 選択肢に設定した color でカード上も表示される |
| 12 | `cardItem.value = ''` | 未選択値をカードに表示したとき | エラーなく描画される（空表示） |

---

### `multiSelect`

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | `[]`（空配列） |
| 2 | `blockConfig.options=[{ value:'pcvr', label:'PCVR' }, ...]` | 選択肢（value+label）を設定したとき | label が表示された選択肢が描画される |
| 3 | 選択肢を複数クリック | 複数選択したとき | 選択した `value` の配列が `onChange` に渡される |
| 4 | 選択済みの選択肢を再クリック | 選択を解除したとき | value が除去された配列が渡される |
| 5 | A を選択後に B を選択 | 別の項目を追加選択したとき | A の選択状態が維持されたまま B が追加される |
| 6 | `formLabel='プレイ環境'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 7 | `card_data[dataKey]` の型 | 保存される値の型 | `string[]`（選択肢の `value` フィールドの配列） |
| 8 | `card_data = { [dataKey]: ['pcvr', 'quest'] }` | 複数選択時の card_data 全体 | `{ [dataKey]: ['pcvr', 'quest'] }` が保存される |
| 9 | `card_data = { [dataKey]: [] }` | 未選択時の card_data 全体 | `{ [dataKey]: [] }` が保存される |
| 10 | `cardItem.value = ['pcvr', 'quest']` | 複数選択済み値をカードに表示したとき | 対応する label が両方描画される |
| 11 | `cardItem.value = []` | 未選択値をカードに表示したとき | エラーなく描画される（空表示） |
| 12 | `blockConfig.options` に同じ `value` を持つ選択肢を2件登録 | 選択肢の value 重複バリデーション | エラーが表示され保存できない |
| 13 | `variant='icon-slash'` でアイコン付き選択肢を描画 | icon-slash variant の描画 | アイコン+ラベルが「/」区切りで並ぶ |
| 14 | `icon-slash` が `variants` 配列に含まれる | variant 定義の確認 | `variants` に `'icon-slash'` が含まれる |

---

### `gauge`

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | `0` |
| 2 | `blockConfig.maxValue=100` | 最大値を 100 に設定したとき | スライダーの最大値が 100 になる |
| 3 | `blockConfig.unit='%'` | 単位を設定したとき | 単位ラベル `%` が表示される |
| 4 | `blockConfig.step=10` | ステップ数を 10 に設定したとき | スライダーの刻みが 10 になる |
| 5 | スライダーを操作 | ユーザーが値を変更したとき | 0〜maxValue の数値が `onChange` に渡される |
| 6 | `formLabel='マイクON率'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 7 | `card_data[dataKey]` の型 | 保存される値の型 | `number` |
| 8 | `card_data = { [dataKey]: 75 }` | 入力時の card_data 全体 | `{ [dataKey]: 75 }` が保存される |
| 9 | `card_data = { [dataKey]: 0 }` | 未入力時の card_data 全体 | `{ [dataKey]: 0 }` が保存される |
| 10 | `cardItem.value = 75` | 入力済み値をカードに表示したとき | 75 がゲージとして描画される |
| 11 | `cardItem.value = 0` | 未入力値をカードに表示したとき | エラーなく描画される |

---

### `expressiveSelect`

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | `{ tag: '', display: '' }` |
| 2 | `blockConfig.options=[...]` | 選択肢を設定したとき | 選択肢ボタンが描画される |
| 3 | 選択肢をクリック | 選択肢を選んだとき | `{ tag: value, display: '' }` が `onChange` に渡される |
| 4 | display 入力欄 | 自由入力欄が存在するか | input 要素が描画される |
| 5 | display に入力 | 自由テキストを入力したとき | `{ tag, display: '入力値' }` が渡される |
| 6 | `blockConfig.allowNone=true` | 回答なしを許容する設定にしたとき | 「回答なし」選択肢が表示される |
| 7 | `blockConfig.allowNone=true` で「回答なし」を選択 | 回答なしを選んだとき | `{ tag: '', display: '' }` が渡され、回答なしとして扱われる |
| 8 | `formLabel='性別'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 9 | `card_data[dataKey]` の型 | 保存される値の型 | `{ tag: string, display: string }` |
| 10 | `card_data = { [dataKey]: { tag: 'A', display: 'カスタム' } }` | 選択+自由入力時の card_data 全体 | `{ [dataKey]: { tag: 'A', display: 'カスタム' } }` が保存される |
| 11 | `card_data = { [dataKey]: { tag: '', display: '' } }` | 未入力時の card_data 全体 | `{ [dataKey]: { tag: '', display: '' } }` が保存される |
| 12 | `cardItem.value = { tag: 'A', display: 'カスタム' }` | 入力済み値をカードに表示したとき | tag と display が描画される |
| 13 | `cardItem.value = { tag: '', display: '' }` | 未入力値をカードに表示したとき | エラーなく描画される（空表示） |

---

### `badge`

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | `{ label: '', color: '' }` |
| 2 | label 入力欄 | テキスト入力欄が存在するか | input 要素が描画される |
| 3 | `blockConfig.allowColorPicker=true` | ユーザーがカラーを自由に設定できる設定にしたとき | color ピッカーが FormItem に表示される |
| 4 | `blockConfig.allowColorPicker=false` | ユーザーがカラーを設定できない設定にしたとき | color ピッカーが表示されない |
| 5 | `blockConfig.defaultColor='#6366f1'` | デフォルトカラーを設定したとき | ピッカー非表示時も CardItem がそのカラーで描画される |
| 6 | label に入力 | テキストを入力したとき | `{ label: '入力値', color: '' }` が渡される |
| 7 | `formLabel='バッジ'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 8 | `card_data[dataKey]` の型 | 保存される値の型 | `{ label: string, color: string }` |
| 9 | `card_data = { [dataKey]: { label: 'VR廃人', color: '#6366f1' } }` | 入力時の card_data 全体 | `{ [dataKey]: { label: 'VR廃人', color: '#6366f1' } }` が保存される |
| 10 | `card_data = { [dataKey]: { label: '', color: '' } }` | 未入力時の card_data 全体 | `{ [dataKey]: { label: '', color: '' } }` が保存される |
| 11 | `cardItem.value = { label: 'VR廃人', color: '#6366f1' }` | 入力済み値をカードに表示したとき | ラベルと色が反映されたバッジが描画される |
| 12 | `cardItem.value = { label: '', color: '' }` | 未入力値をカードに表示したとき | エラーなく描画される（空表示） |

---

### `badgeList`

> `badge` コンポーネントを複数並べたリスト型コンポーネント。

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | `[]`（空配列） |
| 2 | バッジを追加 | 新しいバッジを追加したとき | `{ label: '', color: '' }` が配列に追加される |
| 3 | バッジを削除 | 削除ボタンをクリックしたとき | 削除後の配列が `onChange` に渡される |
| 4 | `blockConfig.allowColorPicker=true` | カラー自由設定を有効にしたとき | 各バッジに color ピッカーが表示される |
| 5 | `blockConfig.defaultColor='#6366f1'` | デフォルトカラーを設定したとき | 追加したバッジがそのカラーで描画される |
| 6 | `formLabel='役職バッジ'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 7 | `card_data[dataKey]` の型 | 保存される値の型 | `{ label: string, color: string }[]` |
| 8 | `card_data = { [dataKey]: [{ label: 'VR廃人', color: '#6366f1' }, { label: 'モデラー', color: '#f59e0b' }] }` | 複数バッジ入力時の card_data 全体 | `{ [dataKey]: [...] }` が保存される |
| 9 | `card_data = { [dataKey]: [] }` | 未入力時の card_data 全体 | `{ [dataKey]: [] }` が保存される |
| 10 | `cardItem.value = [{ label: 'VR廃人', color: '#6366f1' }]` | 入力済み値をカードに表示したとき | バッジが並んで描画される |
| 11 | `cardItem.value = []` | 未入力値をカードに表示したとき | エラーなく描画される（空表示） |

---

### `booleanFlag`

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | `false` |
| 2 | トグルの存在 | ON/OFF 切り替えUIがあるか | トグル要素が描画される |
| 3 | トグルをクリック | ON/OFF を切り替えたとき | `true` / `false` が `onChange` に渡される |
| 4 | `blockConfig.trueLabel='ON'` | ON 時のラベルを設定したとき | `'ON'` が表示される |
| 5 | `blockConfig.falseLabel='OFF'` | OFF 時のラベルを設定したとき | `'OFF'` が表示される |
| 6 | `blockConfig.trueIcon='heart'` | ON 時のアイコンをプリセットから設定したとき | 指定アイコンが ON 状態で表示される |
| 7 | `blockConfig.falseIcon='heartOff'` | OFF 時のアイコンをプリセットから設定したとき | 指定アイコンが OFF 状態で表示される |
| 8 | `formLabel='バルーン表示'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 9 | `card_data[dataKey]` の型 | 保存される値の型 | `boolean` |
| 10 | `card_data = { [dataKey]: true }` | ON 時の card_data 全体 | `{ [dataKey]: true }` が保存される |
| 11 | `card_data = { [dataKey]: false }` | OFF 時の card_data 全体 | `{ [dataKey]: false }` が保存される |
| 12 | `cardItem.value = true` | ON 値をカードに表示したとき | ON 状態が描画される |
| 13 | `cardItem.value = false` | OFF 値をカードに表示したとき | エラーなく描画される |

---

### `rating`

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | `0` |
| 2 | `blockConfig.max=5` | 最大評価数を 5 に設定したとき | 星が 5 個描画される |
| 3 | `blockConfig.icon='star'` | アイコンをプリセットから設定したとき（例：star / heart / diamond） | 指定したアイコンで描画される |
| 4 | `blockConfig.color='#f59e0b'` | 色を設定したとき | FormItem と CardItem の両方に指定カラーが反映される |
| 5 | 星をクリック | 評価を選択したとき | 1〜max の整数が `onChange` に渡される |
| 6 | `formLabel='おすすめ度'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 7 | `card_data[dataKey]` の型 | 保存される値の型 | `number` |
| 8 | `card_data = { [dataKey]: 4 }` | 評価時の card_data 全体 | `{ [dataKey]: 4 }` が保存される |
| 9 | `card_data = { [dataKey]: 0 }` | 未評価時の card_data 全体 | `{ [dataKey]: 0 }` が保存される |
| 10 | `cardItem.value = 4` | 評価済み値をカードに表示したとき | 4 つ分が選択状態で描画される |
| 11 | `cardItem.value = 0` | 未評価値をカードに表示したとき | エラーなく描画される（0個選択） |

---

### `linkItem`

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | `{ label: '', url: '' }` |
| 2 | label 入力欄 | テキスト入力欄が存在するか | input 要素が描画される |
| 3 | url 入力欄 | URL 入力欄が存在するか | input 要素が描画される |
| 4 | label に入力 | ラベルを入力したとき | `{ label: '入力値', url: '' }` が渡される |
| 5 | `blockConfig.icon='link'` | リンクアイコンをプリセットから設定したとき | 指定したアイコンが FormItem と CardItem に表示される |
| 6 | `formLabel='リンク'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 7 | `card_data[dataKey]` の型 | 保存される値の型 | `{ label: string, url: string }` |
| 8 | `card_data = { [dataKey]: { label: 'Portfolio', url: 'https://...' } }` | 入力時の card_data 全体 | `{ [dataKey]: { label: 'Portfolio', url: 'https://...' } }` が保存される |
| 9 | `card_data = { [dataKey]: { label: '', url: '' } }` | 未入力時の card_data 全体 | `{ [dataKey]: { label: '', url: '' } }` が保存される |
| 10 | `cardItem.value = { label: 'Portfolio', url: 'https://...' }` | 入力済み値をカードに表示したとき | ラベルと URL が描画される |
| 11 | `cardItem.value = { label: '', url: '' }` | 未入力値をカードに表示したとき | エラーなく描画される（空表示） |

---

### `dateItem`

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | `{ display: '', iso: '' }` |
| 2 | 日付入力欄 | 日付入力UIが存在するか | input[type=date] または相当の要素が描画される |
| 3 | 日付を選択 | 日付を入力したとき | `{ display: '表示文字列', iso: 'YYYY-MM-DD' }` が渡される |
| 4 | `blockConfig.showAge=true` | 年齢計算を有効にしたとき | 現在年齢が計算・表示される |
| 5 | `iso` に `'not-a-date'` を渡す | 不正フォーマットのバリデーション | エラーが表示され保存できない |
| 6 | `blockConfig.minDate='2000-01-01'` / `blockConfig.maxDate='2010-12-31'` | 入力可能な日付範囲を設定したとき | 範囲外の日付を入力するとエラーが表示される |
| 7 | `formLabel='誕生日'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 8 | `card_data[dataKey]` の型 | 保存される値の型 | `{ display: string, iso: string }` |
| 9 | `card_data = { [dataKey]: { display: '1月1日', iso: '1990-01-01' } }` | 入力時の card_data 全体 | `{ [dataKey]: { display: '1月1日', iso: '1990-01-01' } }` が保存される |
| 10 | `card_data = { [dataKey]: { display: '', iso: '' } }` | 未入力時の card_data 全体 | `{ [dataKey]: { display: '', iso: '' } }` が保存される |
| 11 | `cardItem.value = { display: '1月1日', iso: '1990-01-01' }` | 入力済み値をカードに表示したとき | `'1月1日'` が描画される |
| 12 | `cardItem.value = { display: '', iso: '' }` | 未入力値をカードに表示したとき | エラーなく描画される（空表示） |

---

### `colorPalette`

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | `['#60a5fa', '#4ade80', '#fbbf24', '#f87171']`（4色） |
| 2 | 色ピッカーの数 | 初期値の色数分 UI が存在するか | カラーピッカーが 4 個描画される |
| 3 | 色を変更 | 色を選択したとき | 変更後の色を含む配列が渡される |
| 4 | `blockConfig.maxColors=3` | 最大色数を 3 に設定したとき | 3 色以降の追加ができない |
| 5 | `blockConfig.freeInput=true` | ユーザーが自由にカラーコードを入力できる設定にしたとき | フリー入力の color ピッカーが表示される |
| 6 | `blockConfig.freeInput=false`（プリセット選択式） | 選択肢から選ばせる設定にしたとき | テンプレート側で定義したカラースウォッチのみ選択できる |
| 7 | `formLabel='テーマカラー'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 8 | `card_data[dataKey]` の型 | 保存される値の型 | `string[]`（カラーコードの配列） |
| 9 | `card_data = { [dataKey]: ['#ff0000', '#00ff00'] }` | 入力時の card_data 全体 | `{ [dataKey]: ['#ff0000', '#00ff00'] }` が保存される |
| 10 | `card_data = { [dataKey]: [] }` | 未入力時の card_data 全体 | `{ [dataKey]: [] }` が保存される |
| 11 | `cardItem.value = ['#ff0000', '#00ff00']` | 入力済み値をカードに表示したとき | 各色のスウォッチが描画される |
| 12 | `cardItem.value = []` | 未入力値をカードに表示したとき | エラーなく描画される（空表示） |

---

### `tagList`

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | `[]`（空配列） |
| 2 | タグ入力欄 | テキスト入力欄が存在するか | input 要素が描画される |
| 3 | タグを追加 | テキストを入力して追加したとき | 追加した値を含む配列が渡される |
| 4 | タグを削除 | 削除ボタンをクリックしたとき | 削除後の配列が渡される |
| 5 | `blockConfig.maxTags=5` | 最大タグ数を 5 に設定したとき | 5 個超の追加ができない |
| 6 | `blockConfig.prefix='#'` | プレフィックスを `#` に設定したとき | タグに `#` が自動付与されて表示される |
| 7 | `formLabel='趣味タグ'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 8 | `card_data[dataKey]` の型 | 保存される値の型 | `string[]` |
| 9 | `card_data = { [dataKey]: ['VRC', 'ゲーム', '音楽'] }` | 入力時の card_data 全体 | `{ [dataKey]: ['VRC', 'ゲーム', '音楽'] }` が保存される |
| 10 | `card_data = { [dataKey]: [] }` | 未入力時の card_data 全体 | `{ [dataKey]: [] }` が保存される |
| 11 | `cardItem.value = ['VRC', 'ゲーム', '音楽']` | 入力済み値をカードに表示したとき | 各タグが描画される |
| 12 | `cardItem.value = []` | 未入力値をカードに表示したとき | エラーなく描画される（空表示） |

---

### `markList` / `markGrid`

> **NOTE**: `mark-list`（タグ表示）と `mark-grid`（グリッド表示）は別コンポーネントとして分割予定。現在は variant で切り替えている。

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | デフォルト項目を含む配列（空配列ではない） |
| 2 | `blockConfig.marks=[{ symbol:'◎', color:'green', bg:'...' }]` | マーク記号の選択肢を設定したとき | そのマーク記号が選択肢として表示される |
| 3 | `blockConfig.items=[{ label:'ハグOK' }, { label:'なでなでOK' }]` | 行項目（何を評価するか）を設定したとき | 各ラベルが行として描画される |
| 4 | `blockConfig.items` に `required: true` の項目を含む | 必須項目を設定したとき | 必須マークが表示される |
| 5 | `blockConfig.maxCustomItems=3` | カスタム項目の最大入力数を設定したとき | 3件超のカスタム項目が追加できない |
| 6 | 項目のマーク記号をドロップダウンで変更 | 1行のマークを変更したとき | その行だけ mark が更新された配列が `onChange` に渡される |
| 7 | 別の行のマークを変更 | 別の行を変更したとき | 先に変更した行の値が維持される |
| 8 | カスタム項目を追加 | 自由入力の行を追加したとき | `isCustom: true` の項目が配列に追加される |
| 9 | `formLabel='インタラクション'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 10 | `card_data[dataKey]` の型 | 保存される値の型 | `{ label: string, mark: string, isCustom?: boolean }[]` |
| 11 | `card_data = { [dataKey]: [{ label: 'ハグOK', mark: '◎' }, ...] }` | マーク入力時の card_data 全体 | `{ [dataKey]: [...] }` が保存される |
| 12 | `card_data = { [dataKey]: [{ label: 'ハグOK', mark: '-' }, ...] }` | 未選択時の card_data 全体 | `{ [dataKey]: [...] }` が保存される |
| 13 | `cardItem.value = [{ label: 'ハグOK', mark: '◎' }, ...]` | マーク済み値をカードに表示したとき | マーク付き項目がタグとして描画される |
| 14 | `cardItem.value = [{ label: 'ハグOK', mark: '-' }, ...]` | 全項目未選択値をカードに表示したとき | エラーなく描画される（空表示） |
| 15 | `CardItem` のルート要素に `alignSelf: flex-start` が設定される | 縦方向への引き伸ばし防止 | 親の flex stretch に引き伸ばされない |
| 16 | `CardItem` のルート要素に `alignContent: flex-start` が設定される | チップの縦方向整列 | チップが上詰めで並ぶ |

---

### `colorStatus`

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | `{}`（空オブジェクト） |
| 2 | `blockConfig.fields=[{ key:'blue', label:'募集中', color:'#60a5fa' }]` | ステータス項目（key+label+color）を設定したとき | label と色が表示された項目が描画される |
| 3 | `blockConfig.fields` に複数項目を設定 | 複数のステータスを定義したとき | 各項目が独立して描画される |
| 4 | 項目をクリック | ステータスを選択したとき | `{ [key]: label }` の形式で `onChange` に渡される |
| 5 | 別の項目をクリック | 選択を切り替えたとき | 以前の選択が解除され新しい選択が渡される |
| 6 | `formLabel='ステータス'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 7 | `card_data[dataKey]` の型 | 保存される値の型 | `Record<string, string>`（`{ [field.key]: field.label }`） |
| 8 | `card_data = { [dataKey]: { blue: '募集中' } }` | 選択時の card_data 全体 | `{ [dataKey]: { blue: '募集中' } }` が保存される |
| 9 | `card_data = { [dataKey]: {} }` | 未選択時の card_data 全体 | `{ [dataKey]: {} }` が保存される |
| 10 | `cardItem.value = { blue: '募集中' }` | 選択済み値をカードに表示したとき | 対応する色とラベルが描画される |
| 11 | `cardItem.value = {}` | 未選択値をカードに表示したとき | エラーなく描画される（空表示） |
| 12 | `variant='cards'` でコンテンツが描画される | cards variant の描画 | 入力値がコンテンツとして表示される |
| 13 | `variant='cards'` の各アイテムに hardcoded な rgba 背景がない | cards variant の背景二重防止 | アイテム div に `rgba(255,255,255,...)` の background が設定されていない |
| 14 | `cards` が `variants` 配列に含まれる | variant 定義の確認 | `variants` に `'cards'` が含まれる |

---

### `activity`（weeklyActivity）

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | 曜日・時間帯を含むオブジェクト |
| 2 | 曜日×時間グリッド | グリッドUIが存在するか | グリッド UI が描画される |
| 3 | セルをクリック | 活動時間を切り替えたとき | 更新後のオブジェクトが `onChange` に渡される |
| 4 | `blockConfig.allowMixedSchedule=true` | 週ごとに時間帯をバラバラに設定できる設定にしたとき | 平日・休日に加え曜日ごとの個別設定が可能になる |
| 5 | `blockConfig.allowMixedSchedule=false` | 一括設定のみ許容する設定にしたとき | 平日・休日の時間帯のみ設定できる |
| 6 | `formLabel='活動時間'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 7 | `card_data[dataKey]` の型 | 保存される値の型 | `{ days: boolean[], weekdayStart: string, weekdayEnd: string, holidayStart: string, holidayEnd: string, ... }` |
| 8 | `card_data = { [dataKey]: { days: [...], weekdayStart: '20:00', ... } }` | 入力時の card_data 全体 | `{ [dataKey]: { days: [...], ... } }` が保存される |
| 9 | `card_data = { [dataKey]: componentDef.defaultValue }` | 未入力時の card_data 全体 | `{ [dataKey]: defaultValue }` が保存される |
| 10 | `cardItem.value = { days: [...], weekdayStart: '20:00', ... }` | 入力済み値をカードに表示したとき | 曜日と時間帯が描画される |
| 11 | `cardItem.value = componentDef.defaultValue` | 未入力値をカードに表示したとき | エラーなく描画される |

---

### `simpleSns`

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | `''`（空文字） |
| 2 | 入力欄 | テキスト入力欄が存在するか | input 要素が描画される |
| 3 | `blockConfig.platform` にプリセット一覧から選択（例：`'X'` / `'Discord'` / `'Instagram'`） | プラットフォームを選択式で設定したとき | 選択したプラットフォームのアイコンとラベルが表示される |
| 4 | `blockConfig.actionType='navigate'` | プロフィールページへ遷移する設定にしたとき | CardItem のID文字列がリンクとして描画される |
| 5 | `blockConfig.actionType='copy'` | ID をコピーする設定にしたとき | CardItem のID文字列にコピーボタンが表示される |
| 6 | `blockConfig.allowSecret=true` で「秘密」を選択 | 秘密として設定できる設定にしたとき | 「秘密」選択肢が表示され、選択すると非公開として保存される |
| 7 | `blockConfig.placeholder='@username'` | placeholder を設定したとき | placeholder に設定文字列が表示される |
| 8 | テキストを入力 | ユーザーが入力したとき | 入力文字列が `onChange` に渡される |
| 9 | `formLabel='X(Twitter)'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 10 | `card_data[dataKey]` の型 | 保存される値の型 | `string` |
| 11 | `card_data = { [dataKey]: '@example' }` | 入力時の card_data 全体 | `{ [dataKey]: '@example' }` が保存される |
| 12 | `card_data = { [dataKey]: '' }` | 未入力時の card_data 全体 | `{ [dataKey]: '' }` が保存される |
| 13 | `cardItem.value = '@example'` | 入力済み値をカードに表示したとき | ID 文字列が描画される |
| 14 | `cardItem.value = ''` | 未入力値をカードに表示したとき | エラーなく描画される（空表示） |

---

### `snsWithFriendPolicy`

> SNS ID に加え、フレンド申請ポリシーも同一ブロックで設定できるコンポーネント。

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | `{ platforms: {}, friendPolicy: '' }` |
| 2 | `blockConfig.platforms` にプリセット一覧から選択 | プラットフォームを設定したとき | 入力欄が描画される |
| 3 | `blockConfig.allowedPolicies=['anyone', 'mutual', 'no']` | 許容するフレンドポリシー選択肢を絞ったとき | 指定した選択肢のみ表示される |
| 4 | フレンドポリシーを選択 | ポリシーを選択したとき | `{ platforms: {...}, friendPolicy: '選択値' }` が渡される |
| 5 | SNS ID を入力 | ID を入力したとき | `{ platforms: { x: '入力値' }, friendPolicy: '' }` が渡される |
| 6 | `formLabel='SNS & フレンド申請'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 7 | `card_data[dataKey]` の型 | 保存される値の型 | `{ platforms: Record<string, string>, friendPolicy: string }` |
| 8 | `card_data = { [dataKey]: { platforms: { x: '@foo' }, friendPolicy: 'mutual' } }` | 入力時の card_data 全体 | `{ [dataKey]: { platforms: { x: '@foo' }, friendPolicy: 'mutual' } }` が保存される |
| 9 | `card_data = { [dataKey]: { platforms: {}, friendPolicy: '' } }` | 未入力時の card_data 全体 | `{ [dataKey]: { platforms: {}, friendPolicy: '' } }` が保存される |
| 10 | `cardItem.value = { platforms: { x: '@foo' }, friendPolicy: 'mutual' }` | 入力済み値をカードに表示したとき | プラットフォームIDとフレンドポリシーが描画される |
| 11 | `cardItem.value = { platforms: {}, friendPolicy: '' }` | 未入力値をカードに表示したとき | エラーなく描画される（空表示） |

---

### `gender`（global: true）

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | `{ tag: '', display: '' }` |
| 2 | `global: true` | グローバルコンポーネントであるか | `componentDef.global === true` |
| 3 | 選択肢が固定 | blockConfig で選択肢を変更できないか | 固定の性別選択肢のみ表示される |
| 4 | `blockConfig.allowedTags=['male','female']` | テンプレート側で許容する選択肢を絞ったとき | 指定した tag の選択肢のみ表示される |
| 5 | 選択肢をクリック | 性別を選択したとき | `{ tag: 'male' / 'female' / ..., display: '' }` が渡される |
| 6 | display 入力欄 | 自由入力欄が存在するか | input 要素が描画される |
| 7 | `formLabel='性別'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 7 | `card_data[dataKey]` の型 | 保存される値の型 | `{ tag: string, display: string }` |
| 9 | `card_data = { [dataKey]: { tag: 'female', display: 'ふわふわ系' } }` | 入力時の card_data 全体 | `{ [dataKey]: { tag: 'female', display: 'ふわふわ系' } }` が保存される |
| 10 | `card_data = { [dataKey]: { tag: '', display: '' } }` | 未入力時の card_data 全体 | `{ [dataKey]: { tag: '', display: '' } }` が保存される |
| 11 | `cardItem.value = { tag: 'female', display: 'ふわふわ系' }` | 入力済み値をカードに表示したとき | tag と display が描画される |
| 12 | `cardItem.value = { tag: '', display: '' }` | 未入力値をカードに表示したとき | エラーなく描画される（空表示） |
| 13 | `cardItem.value = { tag: 'female', display: '女性' }` | アイコン+テキストの並び方向 | 内側コンテナが flex（row 方向、縦並びではない） |
| 14 | `cardItem.value = { tag: 'none', display: '' }` | 非公開の表示 | 「ー」テキストが描画される |
| 15 | `cardItem.value = { tag: 'none', display: '' }` | 非公開時に null を返さない | `CardItem` が null でないことを確認 |

---

### `language`（global: true）

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | `{ preset: [], custom: [] }` |
| 2 | `global: true` | グローバルコンポーネントであるか | `componentDef.global === true` |
| 3 | 選択肢が固定 | blockConfig で言語リストを変更できないか | 固定の言語リストが表示される |
| 4 | `blockConfig.allowedPresets=['ja','en','zh']` | テンプレート側で許容するプリセット言語を絞ったとき | 指定した言語のみ選択できる |
| 5 | プリセット言語を選択 | 日本語などを選んだとき | `{ preset: ['ja'], custom: [] }` が渡される |
| 6 | カスタム言語を入力 | 任意の言語を追加したとき | `{ preset: [...], custom: ['入力値'] }` が渡される |
| 7 | `formLabel='使用言語'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 7 | `card_data[dataKey]` の型 | 保存される値の型 | `{ preset: string[], custom: string[] }` |
| 9 | `card_data = { [dataKey]: { preset: ['ja', 'en'], custom: ['手話'] } }` | 入力時の card_data 全体 | `{ [dataKey]: { preset: ['ja', 'en'], custom: ['手話'] } }` が保存される |
| 10 | `card_data = { [dataKey]: { preset: [], custom: [] } }` | 未入力時の card_data 全体 | `{ [dataKey]: { preset: [], custom: [] } }` が保存される |
| 11 | `cardItem.value = { preset: ['ja', 'en'], custom: ['手話'] }` | 入力済み値をカードに表示したとき | 各言語が描画される |
| 12 | `cardItem.value = { preset: [], custom: [] }` | 未入力値をカードに表示したとき | エラーなく描画される（空表示） |

---

### `age`（global: true）

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `componentDef.defaultValue` | コンポーネント定義の初期値が正しいか | `{ searchTag: '', display: '' }` |
| 2 | `global: true` | グローバルコンポーネントであるか | `componentDef.global === true` |
| 3 | 選択肢が固定 | blockConfig で年齢帯を変更できないか | 固定の年齢帯選択肢が表示される |
| 4 | 年齢帯を選択 | 年齢帯を選んだとき | `{ searchTag: '18+', display: '' }` 等が渡される |
| 5 | display 入力欄 | 自由入力欄が存在するか | input 要素が描画される |
| 6 | `formLabel='年齢'` | フォームラベルを設定したとき | 指定文字列がラベルとして表示される |
| 7 | `card_data[dataKey]` の型 | 保存される値の型 | `{ searchTag: '' \| '18歳未満' \| '18+' \| '非公開', display: string }` |
| 8 | `card_data = { [dataKey]: { searchTag: '18+', display: '20代前半' } }` | 入力時の card_data 全体 | `{ [dataKey]: { searchTag: '18+', display: '20代前半' } }` が保存される |
| 9 | `card_data = { [dataKey]: { searchTag: '', display: '' } }` | 未入力時の card_data 全体 | `{ [dataKey]: { searchTag: '', display: '' } }` が保存される |
| 10 | `cardItem.value = { searchTag: '18+', display: '20代前半' }` | 入力済み値をカードに表示したとき | searchTag と display が描画される |
| 11 | `cardItem.value = { searchTag: '', display: '' }` | 未入力値をカードに表示したとき | エラーなく描画される（空表示） |
| 12 | `cardItem.value = { searchTag: '非公開', display: '' }` | 非公開の表示 | 「ー」テキストが描画される |
| 13 | `cardItem.value = { searchTag: '非公開', display: '' }` | 非公開時に null を返さない | `CardItem` が null でないことを確認 |
| 14 | `cardItem.value = { searchTag: '', display: '' }` | 空値の表示 | 「ー」テキストが描画される（null を返さない） |
| 15 | `cardItem.value = { searchTag: '', display: '' }` | 空値時に null を返さない | `CardItem` が null でないことを確認 |

---

## TC-8: テンプレートビルダー（templateBuilderUtils.test.ts）

> 実装ファイル: `src/app/admin/templateBuilderUtils.ts`  
> テストファイル: `src/app/admin/__tests__/templateBuilderUtils.test.ts`  
> テスト種別: ユニットテスト（vitest）

---

### TC-8-1: `collectBlockEntries` — レイアウトツリーからブロックエントリを収集

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | 単一ブロックノードからエントリを返す | 最小構成での動作 | `[{ componentKey, dataKey }]` が1件返る |
| 2 | ネストした row/col から全ブロックを順序通りに収集する | ツリー走査の順序保証 | `['name', 'gender', 'selfIntro']` の順で返る |
| 3 | 同じ dataKey は重複して収集されない | 重複排除 | 同じ dataKey が2つあっても結果は1件 |
| 4 | blockConfig が設定されているとき保持される | blockConfig の引き継ぎ | `result[0].blockConfig` が元の値と一致 |
| 5 | formLabel が設定されているとき保持される | formLabel の引き継ぎ | `result[0].formLabel` が元の値と一致 |
| 6 | optional フラグが設定されているとき保持される | optional の引き継ぎ | `result[0].optional === true` |
| 7 | 空の col/row は空配列を返す | 空ツリーの安全性 | `[]` が返る |
| 8 | 深くネストした構造でも全ブロックを収集する | 再帰の深さに依存しない | 全 dataKey が収集される |

---

### TC-8-2: `collectAllDataKeys` — レイアウト内の全 dataKey を収集

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | レイアウト内の全 dataKey を Set で返す | キー集合の正確性 | `Set(['name', 'gender', 'selfIntro'])` |
| 2 | 重複 dataKey は Set なので1件になる | 重複排除 | `size === 1` |

---

### TC-8-3: `generateDataKey` — ユニークな dataKey を生成

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | 使用済みキーがない場合は `<componentKey>1` を返す | 初回生成 | `'text1'` |
| 2 | text1 が使用済みなら text2 を返す | 連番インクリメント | `'text2'` |
| 3 | text1〜text3 が使用済みなら text4 を返す | 連続した使用済みキーをスキップ | `'text4'` |
| 4 | 別の componentKey のキーは無視して独立してカウントする | componentKey ごとの独立した連番 | `'gender1'` |
| 5 | 連番に空きがあっても最小の未使用番号を返す | 最小空き番号を選択 | text1/text3 使用済みのとき `'text2'` |

---

### TC-8-4: `collectDefaultValues` — ブロックの defaultValue を収集

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | レジストリに登録されたブロックの defaultValue が収集される | text の defaultValue は `''` | `values['name'] === ''` |
| 2 | 複数ブロックの defaultValue が全て収集される | 複数ブロックの一括収集 | `name / gender / selfIntro` 全て含まれる |
| 3 | 登録されていない componentKey のブロックはスキップされる | 未知コンポーネントの安全処理 | キーが結果に含まれない |
| 4 | 空レイアウトのとき空オブジェクトを返す | 空ツリーの安全性 | `{}` |
| 5 | 同じ dataKey が複数あっても defaultValue は1件のみ収集される | 重複排除 | 同名キーが1件のみ |

---

### TC-8-5: `makeDefaultFormSections` — デフォルトフォームセクション生成

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | 「カードデザイン」セクションが1つ生成される | セクション数と名称 | `sections.length === 1`, `title === 'カードデザイン'` |
| 2 | defaultOpen が true になっている | 初期展開状態 | `sections[0].defaultOpen === true` |
| 3 | items に font アイテムが含まれる | フォント選択の必須配置 | `items.some(i => i.type === 'font')` |
| 4 | backgroundKey がある場合、items に背景ブロックが含まれる | 背景設定の自動追加 | `items.some(i => i.type === 'block' && i.dataKey === 'background')` |
| 5 | backgroundKey がない場合、背景ブロックは含まれない | backgroundKey 省略時の安全性 | block アイテムが含まれない |
| 6 | items の順序は font → background | UI上の表示順 | `items[0].type === 'font'`, `items[1].dataKey === backgroundKey` |

---

### TC-8-6: `resolveFormSections` — フォームセクションの解決優先度

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | DB に form_sections があればそれを優先する | DB 優先 | DB のセクションが返る |
| 2 | DB の form_sections が空配列のときは TS 定義にフォールバック | 空配列はフォールバック扱い | TS 定義のセクションが返る |
| 3 | DB の form_sections が null のときは TS 定義にフォールバック | null はフォールバック扱い | TS 定義のセクションが返る |
| 4 | DB も TS 定義もない場合はデフォルト（カードデザイン）を返す | 最終フォールバック | `title === 'カードデザイン'` |
| 5 | savedLayouts に対象テンプレートの行がない場合もデフォルトを返す | 未登録テンプレートの安全処理 | `title === 'カードデザイン'` |
| 6 | savedLayouts を省略した場合もデフォルトを返す | 引数省略時の安全性 | `title === 'カードデザイン'` |
| 7 | DB の form_sections が1件以上あれば TS 定義は無視される | DB が TS 定義より優先 | DB セクションのタイトルが返る |

---

### TC-8-7: `buildSavePayload` — DB 保存 payload の構築

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | id が payload に含まれる | テンプレート ID の保持 | `payload.id === 'v2'` |
| 2 | landscape_layout / portrait_layout が正しく含まれる | レイアウトの保持 | 渡したオブジェクトと同一参照 |
| 3 | form_sections が含まれる | フォームセクションの保持 | 渡した配列と同一参照 |
| 4 | orientation_scales が含まれる | スケール設定の保持 | 渡したオブジェクトと同一参照 |
| 5 | label を渡すと payload に含まれる | ラベルの書き込み | `payload.label === 'Glass Card'` |
| 6 | label を渡さないと payload に label キーが存在しない | 省略時は送信しない | `'label' in payload === false` |
| 7 | description を渡すと payload に含まれる | 説明文の書き込み | `payload.description === '説明文'` |
| 8 | description を渡さないと payload に description キーが存在しない | 省略時は送信しない | `'description' in payload === false` |
| 9 | updated_at が ISO 8601 形式の文字列になっている | 更新日時の形式 | `new Date(payload.updated_at).toISOString() === payload.updated_at` |
| 10 | 空文字の label は payload に含まれない | 空文字は省略扱い | `'label' in payload === false` |
| 11 | 空文字の description は payload に含まれない | 空文字は省略扱い | `'description' in payload === false` |

> **将来課題**: 現在の `searchTag` は `'18歳未満' | '18+' | '非公開'` の粗い粒度。将来的に「20代」「30代」「40代」など細かい年代での検索ニーズが発生した場合、`searchTag` の選択肢拡張と検索インデックスの見直しが必要になる可能性がある。

---

## TC-9: ブロックコンポーネント — profileImage（profileImage.test.tsx）

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | defaultValue は `{ base64: null, url: null }` | 初期値の確認 | `{ base64: null, url: null }` |
| 2 | variants に `glass` が含まれる | glass バリアントの存在確認 | `variants.includes('glass')` |
| 3 | default variant: 画像なしのとき "Photo" プレースホルダーが表示される | 未設定時の表示 | `screen.getByText('Photo')` |
| 4 | default variant: base64 画像が設定されているとき img タグが描画される | base64 の反映 | `img.src === base64文字列` |
| 5 | url が設定されているとき img src に url が使われる | url の反映 | `img.src === url文字列` |
| 6 | base64 と url が両方あるとき url が優先される | url 優先ルール | `img.src === url文字列` |
| 7 | circle variant: border-radius が 50% になる | circle 形状 | `borderRadius === '50%'` |
| 8 | glass variant: border が設定される | glass ボーダー | `border.includes('rgba(255, 255, 255, 0.75)')` |
| 9 | glass variant: boxShadow が設定される | glass シャドウ | `boxShadow !== ''` |
| 10 | glass variant: border は 1px 固定 | border 幅 | `border.startsWith('1px')` |
| 11 | glass variant と default variant でボーダー有無が異なる | バリアント差異 | glass と default の border が異なる |

---

## TC-10: ライブラリ — legacyCardDataMigration（legacyCardDataMigration.test.ts / migrateV1LegacyData.test.ts）

### TC-10-1: V2 移行（`migrateLegacyCardData('v2', ...)`）

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | templateId が v1/v2 以外のとき無変換 | 未対象テンプレートのスルー | 入力と同一参照 |
| 2 | sns も micOnRate もない場合は無変換（冪等性） | 新フォーマット入力の安全性 | 入力と同値 |
| 3 | `sns.twitterId` → `x`、`sns.discordId` → `discord` に変換 | SNS キー変換 | 変換後の値が正しい |
| 4 | `sns.vrchatId` + `sns.friendPolicy` → `sns-with-friend-policy1: { id, friendPolicy }` | SNS まとめ変換 | オブジェクトが正しく生成 |
| 5 | 変換後に `sns` キーが削除される | 旧キーの除去 | `result.sns === undefined` |
| 6 | 既存の `x`/`discord` があれば上書きしない | 冪等性（既存値保護） | 既存値が維持される |
| 7 | `micOnRate` → `gauge1`（gauge1 未設定時のみ） | ゲージキー変換 | `result.gauge1 === 旧値` |
| 8 | gauge1 が既にあれば micOnRate を上書きしない | 冪等性 | 既存 gauge1 が維持される |
| 9 | `gender: string` → `{ tag, display: '' }` に変換 | gender 型変換 | オブジェクト形式に変換 |
| 10 | gender がすでにオブジェクトなら変換しない | 冪等性 | 既存値が維持される |
| 11 | `language: string[]` → `{ preset, custom: [] }` に変換 | language 型変換 | オブジェクト形式に変換 |
| 12 | language がすでにオブジェクトなら変換しない | 冪等性 | 既存値が維持される |

### TC-10-2: V1 移行（`migrateLegacyCardData('v1', ...)`）— 旧メーカー `/card/vrchat` からの自動マイグレーション

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | templateId が v1/v2 以外のとき無変換 | 未対象テンプレートのスルー | 入力と同一参照 |
| 2 | 新フォーマット入力は無変換（冪等性） | 重複実行の安全性 | 入力と同値 |
| 3 | `sns.vrchatId` → `vrchat` に変換 | VRChat ID の昇格 | `result.vrchat === sns.vrchatId` |
| 4 | `sns.twitterId` → `x` に変換 | Twitter ID の昇格 | `result.x === sns.twitterId` |
| 5 | `sns.discordId` → `discord` に変換 | Discord ID の昇格 | `result.discord === sns.discordId` |
| 6 | `sns.friendPolicy` → `friendPolicy`（string）に変換 | フレポリの昇格 | `result.friendPolicy === sns.friendPolicy` |
| 7 | 変換後に `sns` キーが削除される | 旧キーの除去 | `result.sns === undefined` |
| 8 | 既存の `vrchat`/`x`/`discord`/`friendPolicy` があれば上書きしない | 冪等性（既存値保護） | 既存値が維持される |
| 9 | `gender: string` → `{ tag, display: '' }` に変換 | gender 型変換 | オブジェクト形式に変換 |
| 10 | gender がすでにオブジェクトなら変換しない | 冪等性 | 既存値が維持される |
| 11 | `language: string[]` → `{ preset, custom: [] }` に変換 | language 型変換 | オブジェクト形式に変換 |
| 12 | language がすでにオブジェクトなら変換しない | 冪等性 | 既存値が維持される |
| 13 | `age.mode` → `age.searchTag` に変換 | age キー変換 | `result.age.searchTag === 旧 mode` |
| 14 | `age.searchTag` が既にあれば `age.mode` を上書きしない | 冪等性 | 既存 searchTag が維持される |
| 15 | age がなければ何もしない | 省略時の安全性 | `result.age === undefined` |

---

## TC-11: ライブラリ — templateLayout（templateLayout.test.ts）

### TC-11-1: `fetchTemplateLayout`

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | DB 行を `TemplateLayoutRow` に整形して返す | 正常系の整形 | 全フィールドが正しくマップされる |
| 2 | 該当 ID が無いとき `null` を返す | 未存在 ID の安全処理 | `null` |

### TC-11-2: `fetchTemplateLayouts`

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | `Record<id, row>` を正しく構築する | 複数行の辞書化 | `Object.keys(result)` が DB 行の id と一致 |
| 2 | エラー時は空オブジェクトを返す | DB エラーの安全処理 | `{}` |
| 3 | `form_sections` が null のとき null のまま返す | null 透過 | `result[id].form_sections === null` |

### TC-11-3: `fetchCommunities`

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | コミュニティ行の配列を返す | 正常系 | DB 行と同値 |
| 2 | エラー時は空配列を返す | DB エラーの安全処理 | `[]` |

### TC-11-4: `saveCommunity`

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | 成功時は `error: null` を返す | 正常系 | `{ error: null }` |
| 2 | DB エラー時はメッセージを返す | エラー伝播 | `{ error: 'upsert failed' }` |

### TC-11-5: `saveTemplateLayout`

| # | テスト内容 | 意味 | 期待値 |
|---|---|---|---|
| 1 | 成功時は `error: null` を返す | 正常系 | `{ error: null }` |
| 2 | label / description が指定された場合 payload に含まれる | オプショナルフィールドの付与 | payload に label・description が含まれる |
