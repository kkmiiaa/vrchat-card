-- landscape_layout → card_layout, portrait_layout → web_layout
ALTER TABLE templates RENAME COLUMN landscape_layout TO card_layout;
ALTER TABLE templates RENAME COLUMN portrait_layout TO web_layout;

-- orientation_scales JSON内のキーを landscape/portrait → card/web に更新
UPDATE templates
SET orientation_scales = jsonb_build_object(
  'card', orientation_scales->'landscape',
  'web',  orientation_scales->'portrait'
)
WHERE orientation_scales IS NOT NULL;
