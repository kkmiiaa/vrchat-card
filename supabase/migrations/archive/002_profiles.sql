-- ----------------------------------------
-- profiles
-- ----------------------------------------

create table public.profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.users(id) on delete cascade not null unique,
  display_name  text,
  avatar_url    text,
  bio           text,
  sns_links     jsonb not null default '{}',
  template      text,
  platform_data jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at();

alter table public.profiles enable row level security;

create policy "profiles: select public" on public.profiles for select  using (true);
create policy "profiles: insert own"    on public.profiles for insert  with check (auth.uid() = user_id);
create policy "profiles: update own"    on public.profiles for update  using (auth.uid() = user_id);

-- signup トリガーを更新して profile も作成するようにする
create or replace function handle_new_user() returns trigger as $$
declare
  new_slug text;
begin
  loop
    new_slug := generate_slug();
    exit when not exists (select 1 from public.users where username_slug = new_slug);
  end loop;
  insert into public.users (id, username_slug) values (new.id, new_slug);
  insert into public.profiles (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;
