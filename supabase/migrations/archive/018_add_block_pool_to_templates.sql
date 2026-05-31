-- テンプレートにブロック定義プールカラムを追加
-- blockPool: componentKey/dataKey/blockConfig などを一度定義し、
-- レイアウト内の ref ノードから参照することで縦横レイアウト間の重複を排除する
ALTER TABLE templates ADD COLUMN IF NOT EXISTS block_pool jsonb;
