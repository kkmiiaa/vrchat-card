-- users table (extends auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  username_slug text unique not null,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  plan_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- profiles table
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null unique,
  template text not null default 'vrchat' check (template in ('vrchat', 'gamer', 'creator', 'general')),
  display_name text,
  avatar_url text,
  bio text,
  sns_links jsonb not null default '{}',
  platform_data jsonb not null default '{}',
  is_searchable boolean not null default true,
  search_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- slug generation helper
create or replace function generate_slug() returns text as $$
declare
  chars text := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result text := '';
  i int;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- auto-create user row on signup
create or replace function handle_new_user() returns trigger as $$
declare
  new_slug text;
begin
  loop
    new_slug := generate_slug();
    exit when not exists (select 1 from public.users where username_slug = new_slug);
  end loop;

  insert into public.users (id, username_slug)
  values (new.id, new_slug);

  insert into public.profiles (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- updated_at trigger
create or replace function update_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at before update on public.users
  for each row execute function update_updated_at();

create trigger profiles_updated_at before update on public.profiles
  for each row execute function update_updated_at();

-- RLS
alter table public.users enable row level security;
alter table public.profiles enable row level security;

-- users: 自分のレコードのみ読み書き
create policy "users: select own" on public.users for select using (auth.uid() = id);
create policy "users: update own" on public.users for update using (auth.uid() = id);

-- profiles: 公開は全員読める、書き込みは本人のみ
create policy "profiles: select public" on public.profiles for select using (is_searchable = true or auth.uid() = user_id);
create policy "profiles: insert own" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = user_id);

-- search index
create index profiles_search_tags_idx on public.profiles using gin(search_tags);
create index profiles_template_idx on public.profiles(template);
