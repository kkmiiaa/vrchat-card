alter table profiles
  add column if not exists links jsonb not null default '[]';
