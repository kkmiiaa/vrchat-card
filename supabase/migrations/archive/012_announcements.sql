create table if not exists announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text not null,
  is_active  boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 全員が読める
alter table announcements enable row level security;
create policy "announcements_public_read"
  on announcements for select
  using (is_active = true);
