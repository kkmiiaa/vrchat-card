-- users テーブルを誰でも読めるようにする（プロフィールページの公開閲覧に必要）
drop policy if exists "users: select own" on public.users;
create policy "users: select public" on public.users for select using (true);
