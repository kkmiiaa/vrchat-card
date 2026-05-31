-- Migrate legacy gender text values to structured genderTag field
-- Old format: card_data->>'gender' = '男性'/'女性'/'ノンバイナリ' (Japanese text, no genderTag)
-- New format: card_data->>'genderTag' = 'male'/'female'/'nonbinary' (English tag)

UPDATE cards
SET card_data = jsonb_set(
  jsonb_set(card_data, '{genderTag}', '"male"'),
  '{gender}', '""'
)
WHERE card_data->>'gender' = '男性'
  AND (card_data->>'genderTag' IS NULL OR card_data->>'genderTag' = '');

UPDATE cards
SET card_data = jsonb_set(
  jsonb_set(card_data, '{genderTag}', '"female"'),
  '{gender}', '""'
)
WHERE card_data->>'gender' = '女性'
  AND (card_data->>'genderTag' IS NULL OR card_data->>'genderTag' = '');

UPDATE cards
SET card_data = jsonb_set(
  jsonb_set(card_data, '{genderTag}', '"nonbinary"'),
  '{gender}', '""'
)
WHERE card_data->>'gender' = 'ノンバイナリ'
  AND (card_data->>'genderTag' IS NULL OR card_data->>'genderTag' = '');
