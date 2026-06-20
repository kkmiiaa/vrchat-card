alter table public.cards
  add column if not exists categories text[] not null default '{}';
