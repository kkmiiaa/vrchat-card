-- card_data の JSONB 検索用 GIN インデックス
CREATE INDEX IF NOT EXISTS idx_cards_card_data ON cards USING GIN (card_data);

-- 検索・ソートに使う通常カラムのインデックス
CREATE INDEX IF NOT EXISTS idx_cards_visibility ON cards (visibility);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cards_template_id ON cards (template_id);

-- 公開カードの検索（最も多いクエリパターン）
CREATE INDEX IF NOT EXISTS idx_cards_visibility_created_at ON cards (visibility, created_at DESC);
