-- ■ コンポーネントマスタ
-- 検索可能コンポーネントの型定義（運営管理）
CREATE TABLE IF NOT EXISTS components (
  key          text PRIMARY KEY,
  label        text NOT NULL,
  input_type   text NOT NULL,  -- 'select' | 'multi-select' | 'text' | 'number' | 'boolean'
  is_searchable boolean NOT NULL DEFAULT false,
  is_required  boolean NOT NULL DEFAULT false,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ■ 界隈マスタ
CREATE TABLE IF NOT EXISTS communities (
  slug         text PRIMARY KEY,
  label        text NOT NULL,
  description  text,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ■ 界隈×コンポーネント定義
-- 界隈ごとにコンポーネントのラベル・選択肢を上書きできる
CREATE TABLE IF NOT EXISTS community_components (
  community_slug  text NOT NULL REFERENCES communities(slug) ON DELETE CASCADE,
  component_key   text NOT NULL REFERENCES components(key) ON DELETE CASCADE,
  label_override  text,           -- 界隈固有のラベル（nullなら components.label を使う）
  options         jsonb,          -- 選択肢 ["PCVR", "Quest", "Desktop"] など
  is_searchable_override boolean, -- 界隈固有の検索可否（nullなら components.is_searchable を使う）
  sort_order      integer NOT NULL DEFAULT 0,
  PRIMARY KEY (community_slug, component_key)
);

-- ■ 初期データ: コンポーネントマスタ
INSERT INTO components (key, label, input_type, is_searchable, sort_order) VALUES
  ('gender',        '性別',               'select',       true,  10),
  ('platform',      'プレイ環境',          'multi-select', true,  20),
  ('language',      '使用言語',            'multi-select', true,  30),
  ('friend_policy', 'フレンド申請',        'select',       true,  40),
  ('activity_time', '活動時間帯',          'select',       true,  50),
  ('self_intro',    '自己紹介',            'text',         false, 60),
  ('sns',           'SNSリンク',           'sns',          false, 70),
  ('free_text',     '自由テキスト',        'text',         false, 80),
  ('image_gallery', 'ギャラリー',          'gallery',      false, 90)
ON CONFLICT (key) DO NOTHING;

-- ■ 初期データ: 界隈マスタ
INSERT INTO communities (slug, label, description, sort_order) VALUES
  ('vrchat', 'VRChat', 'VRChatユーザーの自己紹介カード', 10)
ON CONFLICT (slug) DO NOTHING;

-- ■ 初期データ: VRChat界隈のコンポーネント定義
INSERT INTO community_components (community_slug, component_key, label_override, options, sort_order) VALUES
  ('vrchat', 'gender',        NULL,           '["男性", "女性", "その他", "非公開"]',          10),
  ('vrchat', 'platform',      'プレイ環境',   '["PCVR", "Quest", "Desktop"]',                  20),
  ('vrchat', 'language',      '使用言語',     '["日本語", "English", "Korean"]',               30),
  ('vrchat', 'friend_policy', 'フレンド申請', '["frPolicyAnyone", "frPolicyAfterGettingToKnow", "frPolicyIfInterested", "frPolicyMutualsOnX", "frPolicyNo"]', 40),
  ('vrchat', 'activity_time', '活動時間帯',   '["平日昼", "平日夜", "休日昼", "休日夜", "不定期"]', 50),
  ('vrchat', 'self_intro',    '自己紹介',     NULL,                                            60),
  ('vrchat', 'sns',           'SNSリンク',    NULL,                                            70),
  ('vrchat', 'image_gallery', 'ギャラリー',   NULL,                                            80)
ON CONFLICT (community_slug, component_key) DO NOTHING;

-- RLS
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "components_public_read" ON components FOR SELECT USING (true);
CREATE POLICY "communities_public_read" ON communities FOR SELECT USING (true);
CREATE POLICY "community_components_public_read" ON community_components FOR SELECT USING (true);
