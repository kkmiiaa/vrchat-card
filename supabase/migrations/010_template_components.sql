-- ■ テンプレートマスタ
CREATE TABLE IF NOT EXISTS templates (
  id          text PRIMARY KEY,  -- 'v1', 'v2' など
  label       text NOT NULL,
  description text,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ■ テンプレート×コンポーネント定義
-- テンプレートがどのコンポーネントを使うかを定義
CREATE TABLE IF NOT EXISTS template_components (
  template_id   text NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  component_key text NOT NULL REFERENCES components(key) ON DELETE CASCADE,
  is_required   boolean NOT NULL DEFAULT false,  -- テンプレートからこのコンポーネントを外せないか
  sort_order    integer NOT NULL DEFAULT 0,
  PRIMARY KEY (template_id, component_key)
);

-- ■ 初期データ: テンプレートマスタ
INSERT INTO templates (id, label, description, sort_order) VALUES
  ('v1', '自己紹介カード · Glass',    'アバター写真を大きく見せる、ビジュアル重視のレイアウト', 10),
  ('v2', '自己紹介カード · Standard', '環境・マイク率・OK/NGなどを詳しく載せるスタンダードなレイアウト', 20)
ON CONFLICT (id) DO NOTHING;

-- ■ 初期データ: v1 のコンポーネント構成
INSERT INTO template_components (template_id, component_key, is_required, sort_order) VALUES
  ('v1', 'gender',        false, 10),
  ('v1', 'platform',      false, 20),
  ('v1', 'language',      false, 30),
  ('v1', 'friend_policy', false, 40),
  ('v1', 'self_intro',    false, 50),
  ('v1', 'sns',           false, 60),
  ('v1', 'image_gallery', false, 70)
ON CONFLICT (template_id, component_key) DO NOTHING;

-- ■ 初期データ: v2 のコンポーネント構成
INSERT INTO template_components (template_id, component_key, is_required, sort_order) VALUES
  ('v2', 'gender',        false, 10),
  ('v2', 'platform',      false, 20),
  ('v2', 'language',      false, 30),
  ('v2', 'friend_policy', false, 40),
  ('v2', 'self_intro',    false, 50),
  ('v2', 'sns',           false, 60),
  ('v2', 'image_gallery', false, 70)
ON CONFLICT (template_id, component_key) DO NOTHING;

-- RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates_public_read" ON templates FOR SELECT USING (true);
CREATE POLICY "template_components_public_read" ON template_components FOR SELECT USING (true);

-- ■ cards テーブルに community_slug カラムを追加
-- 既存カードはVRChat界隈として扱う
ALTER TABLE cards ADD COLUMN IF NOT EXISTS community_slug text REFERENCES communities(slug);
UPDATE cards SET community_slug = 'vrchat' WHERE community_slug IS NULL;
