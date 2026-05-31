-- ================================================================
-- テーブル再設計 migration
-- ================================================================

-- 1. community_templates（templates × communities 多対多）を新規作成
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_templates (
  community_slug TEXT    NOT NULL REFERENCES public.communities(slug) ON DELETE CASCADE,
  template_id    TEXT    NOT NULL REFERENCES public.templates(id)     ON DELETE CASCADE,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (community_slug, template_id)
);

ALTER TABLE public.community_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can read community_templates"
  ON public.community_templates FOR SELECT
  USING (true);

CREATE POLICY "admin manages community_templates"
  ON public.community_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- 既存データを移行（VRChat界隈に v1, v2 を紐付け）
INSERT INTO public.community_templates (community_slug, template_id, sort_order)
VALUES
  ('vrchat', 'v2', 10),
  ('vrchat', 'v1', 20)
ON CONFLICT DO NOTHING;

-- 2. templates に is_published / version を追加
-- ----------------------------------------------------------------
ALTER TABLE public.templates
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS version      INTEGER NOT NULL DEFAULT 1;

-- 既存 v1, v2 を公開済みに
UPDATE public.templates SET is_published = true WHERE id IN ('v1', 'v2');

-- 3. 不要テーブルを削除（FK 順）
-- ----------------------------------------------------------------
DROP TABLE IF EXISTS public.community_components;
DROP TABLE IF EXISTS public.template_components;
DROP TABLE IF EXISTS public.components;
