-- templates テーブルに template_config カラムを追加
-- howToSteps: 「作り方」ステップ文字列配列（null の場合はデフォルト表示）
-- tweetHashtags: X 投稿時のハッシュタグ文字列（null の場合はデフォルト）
alter table templates
  add column if not exists template_config jsonb default null;
