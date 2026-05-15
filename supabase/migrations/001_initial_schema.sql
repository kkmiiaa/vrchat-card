-- ----------------------------------------
-- Helper functions
-- ----------------------------------------

create or replace function update_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- slug generation (8 chars, lowercase alphanumeric)
create or replace function generate_slug() returns text as $$
declare
  chars  text := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result text := '';
  i      int;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- card ID generation (8 chars, base62)
create or replace function generate_card_id() returns text as $$
declare
  chars  text := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i      int;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- ----------------------------------------
-- users (extends auth.users)
-- ----------------------------------------

create table public.users (
  id              uuid references auth.users(id) on delete cascade primary key,
  username_slug   text unique not null,
  plan            text not null default 'free' check (plan in ('free', 'pro')),
  plan_expires_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger users_updated_at
  before update on public.users
  for each row execute function update_updated_at();

alter table public.users enable row level security;

create policy "users: select own" on public.users for select using (auth.uid() = id);
create policy "users: update own" on public.users for update using (auth.uid() = id);

-- auto-create user row on signup
create or replace function handle_new_user() returns trigger as $$
declare
  new_slug text;
begin
  loop
    new_slug := generate_slug();
    exit when not exists (select 1 from public.users where username_slug = new_slug);
  end loop;
  insert into public.users (id, username_slug) values (new.id, new_slug);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------
-- cards
-- ----------------------------------------

create table public.cards (
  id          text primary key default generate_card_id(),
  user_id     uuid references public.users(id) on delete cascade not null,
  template_id text not null,
  title       text,
  card_data   jsonb not null default '{}',
  image_url   text,
  visibility  text not null default 'public' check (visibility in ('public', 'limited', 'private')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger cards_updated_at
  before update on public.cards
  for each row execute function update_updated_at();

alter table public.cards enable row level security;

create policy "cards: select public" on public.cards for select  using (visibility = 'public' or auth.uid() = user_id);
create policy "cards: insert own"    on public.cards for insert  with check (auth.uid() = user_id);
create policy "cards: update own"    on public.cards for update  using (auth.uid() = user_id);
create policy "cards: delete own"    on public.cards for delete  using (auth.uid() = user_id);

create index cards_user_id_idx     on public.cards(user_id);
create index cards_template_id_idx on public.cards(template_id);
