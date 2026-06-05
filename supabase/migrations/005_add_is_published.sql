-- templates テーブルに is_published カラムを追加
alter table templates
  add column if not exists is_published boolean not null default false;
