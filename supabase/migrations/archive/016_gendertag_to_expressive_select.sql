-- Migrate genderTag from plain string to expressive-select format { tag, display }
-- Before: genderTag: 'male'
-- After:  genderTag: { "tag": "male", "display": "" }

UPDATE cards
SET card_data = jsonb_set(
  card_data,
  '{genderTag}',
  jsonb_build_object('tag', card_data->>'genderTag', 'display', '')
)
WHERE card_data ? 'genderTag'
  AND jsonb_typeof(card_data->'genderTag') = 'string';
