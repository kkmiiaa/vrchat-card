-- ============================================================
-- vaacard 初期スキーマ（全マイグレーションを1ファイルに集約）
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Functions ────────────────────────────────────────────

create or replace function generate_slug()
returns text language plpgsql as $$
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
$$;

create or replace function generate_card_id()
returns text language plpgsql as $$
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
$$;

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
declare
  new_slug text;
begin
  begin
    loop
      new_slug := generate_slug();
      exit when not exists (select 1 from public.users where username_slug = new_slug);
    end loop;
    insert into public.users (id, username_slug) values (new.id, new_slug);
    insert into public.profiles (user_id) values (new.id);
  exception when others then
    null;
  end;
  return new;
end;
$$;

-- ─── Tables ───────────────────────────────────────────────

create table public.users (
  id               uuid primary key references auth.users on delete cascade,
  username_slug    text not null unique,
  plan             text not null default 'free',
  plan_expires_at  timestamp with time zone,
  role             text not null default 'user',
  created_at       timestamp with time zone not null default now(),
  updated_at       timestamp with time zone not null default now()
);

create table public.profiles (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null unique references public.users on delete cascade,
  display_name text,
  avatar_url   text,
  bio          text,
  created_at   timestamp with time zone not null default now(),
  updated_at   timestamp with time zone not null default now()
);

create table public.profile_links (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users on delete cascade,
  url        text not null,
  label      text not null,
  sort_order integer not null default 0,
  created_at timestamp with time zone default now()
);

create table public.communities (
  slug        text primary key,
  label       text not null,
  description text,
  sort_order  integer not null default 0,
  created_at  timestamp with time zone not null default now()
);

create table public.templates (
  id                 text primary key,
  label              text not null,
  description        text,
  sort_order         integer not null default 0,
  card_layout        jsonb,
  web_layout         jsonb,
  form_sections      jsonb,
  orientation_scales jsonb,
  overlay_config     jsonb,
  block_pool         jsonb,
  card_width         integer,
  card_height        integer,
  web_width          integer,
  card_config        jsonb,
  sample_card_data   jsonb,
  created_at         timestamp with time zone not null default now(),
  updated_at         timestamp with time zone
);

create table public.community_templates (
  community_slug text not null references public.communities on delete cascade,
  template_id    text not null references public.templates on delete cascade,
  sort_order     integer not null default 0,
  created_at     timestamp with time zone not null default now(),
  primary key (community_slug, template_id)
);

create table public.cards (
  id          text primary key default generate_card_id(),
  user_id     uuid not null references public.users on delete cascade,
  template_id text not null references public.templates on delete restrict,
  title       text,
  card_data   jsonb not null default '{}',
  background  jsonb,
  image_url   text,
  visibility  text not null default 'public',
  view_count  integer not null default 0,
  like_count  integer not null default 0,
  created_at  timestamp with time zone not null default now(),
  updated_at  timestamp with time zone not null default now()
);

create table public.system_notifications (
  id         uuid primary key default uuid_generate_v4(),
  title      text not null,
  body       text not null,
  created_at timestamp with time zone default now()
);

create table public.system_notification_reads (
  user_id         uuid not null references public.users on delete cascade,
  notification_id uuid not null references public.system_notifications on delete cascade,
  read_at         timestamp with time zone,
  primary key (user_id, notification_id)
);

create table public.user_notifications (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users on delete cascade,
  type         text not null,
  from_user_id uuid references public.users on delete set null,
  card_id      text references public.cards on delete set null,
  read_at      timestamp with time zone,
  created_at   timestamp with time zone default now()
);

-- ─── Triggers ─────────────────────────────────────────────

create trigger users_updated_at
  before update on public.users
  for each row execute function update_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at();

create trigger cards_updated_at
  before update on public.cards
  for each row execute function update_updated_at();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- cards テーブルに依存する関数（テーブル作成後に定義）
create or replace function increment_view_count(card_id text)
returns void language sql as $$
  update public.cards set view_count = view_count + 1 where id = card_id;
$$;

create or replace function increment_like_count(card_id text, delta int)
returns int language sql as $$
  update public.cards set like_count = greatest(0, like_count + delta) where id = card_id
  returning like_count;
$$;

-- ─── Indexes ──────────────────────────────────────────────

create index cards_user_id_idx              on public.cards (user_id);
create index cards_template_id_idx          on public.cards (template_id);
create index idx_cards_template_id          on public.cards (template_id);
create index idx_cards_visibility           on public.cards (visibility);
create index idx_cards_created_at           on public.cards (created_at desc);
create index idx_cards_visibility_created_at on public.cards (visibility, created_at desc);
create index idx_cards_card_data            on public.cards using gin (card_data);
create index idx_profile_links_user         on public.profile_links (user_id, sort_order);
create index idx_system_notification_reads  on public.system_notification_reads (user_id);
create index idx_user_notifications_user    on public.user_notifications (user_id, created_at desc);

-- ─── RLS ──────────────────────────────────────────────────

alter table public.users                    enable row level security;
alter table public.profiles                 enable row level security;
alter table public.profile_links            enable row level security;
alter table public.communities              enable row level security;
alter table public.templates                enable row level security;
alter table public.community_templates      enable row level security;
alter table public.cards                    enable row level security;
alter table public.system_notifications     enable row level security;
alter table public.system_notification_reads enable row level security;
alter table public.user_notifications       enable row level security;

-- users
create policy "users: select public" on public.users for select using (true);
create policy "users: update own"    on public.users for update using (auth.uid() = id);

-- profiles
create policy "profiles: select public" on public.profiles for select using (true);
create policy "profiles: insert own"    on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles: update own"    on public.profiles for update using (auth.uid() = user_id);

-- profile_links
create policy "public can read profile_links"  on public.profile_links for select using (true);
create policy "owner can manage profile_links" on public.profile_links for all using (auth.uid() = user_id);

-- communities
create policy "communities_public_read" on public.communities for select using (true);

-- templates
create policy "templates_public_read"     on public.templates for select using (true);
create policy "admin can update templates" on public.templates for update
  using (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'));

-- community_templates
create policy "community_templates_select" on public.community_templates for select using (true);

-- cards
create policy "cards: select public" on public.cards for select
  using (visibility = 'public' or auth.uid() = user_id);
create policy "cards: insert own"    on public.cards for insert with check (auth.uid() = user_id);
create policy "cards: update own"    on public.cards for update using (auth.uid() = user_id);
create policy "cards: delete own"    on public.cards for delete using (auth.uid() = user_id);

-- system_notifications
create policy "public can read system_notifications" on public.system_notifications for select using (true);
create policy "admin can manage system_notifications" on public.system_notifications for all
  using (exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin'));

-- system_notification_reads
create policy "owner can manage own reads" on public.system_notification_reads for all
  using (auth.uid() = user_id);

-- user_notifications
create policy "owner can read own notifications"   on public.user_notifications for select using (auth.uid() = user_id);
create policy "owner can update own notifications" on public.user_notifications for update using (auth.uid() = user_id);

-- ─── Storage ──────────────────────────────────────────────

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
insert into storage.buckets (id, name, public) values ('card-images', 'card-images', true);

-- avatars
create policy "avatars_public_read"   on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_owner_insert"  on storage.objects for insert with check (bucket_id = 'avatars');
create policy "avatars_owner_update"  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_owner_delete"  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- card-images
create policy "card_images_select" on storage.objects for select using (bucket_id = 'card-images');
create policy "card_images_insert" on storage.objects for insert with check (bucket_id = 'card-images');
create policy "card_images_update" on storage.objects for update
  using (bucket_id = 'card-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "card_images_delete" on storage.objects for delete
  using (bucket_id = 'card-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- ─── Seed: communities ────────────────────────────────────

insert into public.communities (slug, label, sort_order) values
  ('vrchat',       'VRChat',         10),
  ('trpg',         'TRPG',           20),
  ('vtuber',       'VTuber',         30),
  ('minecraft',    'Minecraft',      40),
  ('apex',         'Apex Legends',   50),
  ('valorant',     'VALORANT',       60),
  ('splatoon',     'スプラトゥーン', 70),
  ('pokemon',      'ポケモン',       80),
  ('oekaki',       'イラスト・創作', 90),
  ('nijisousaku',  '二次創作',      100),
  ('personality',  '性格診断',      110),
  ('anime',        'アニメ・マンガ', 120),
  ('idol',         'アイドル',      130),
  ('kpop',         'K-POP',         140),
  ('vocaloid',     'ボカロ',        150),
  ('seiyuu',       '声優',          160),
  ('2point5',      '2.5次元',       170);
