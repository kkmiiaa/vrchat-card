alter table public.cards
  add column if not exists ogp_version int not null default 0;
