alter table users
  add column if not exists free_explore_count int not null default 0,
  add column if not exists free_explore_reset_month text;
