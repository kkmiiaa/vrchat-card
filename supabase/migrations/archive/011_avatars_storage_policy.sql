-- avatars バケットの RLS ポリシー
-- 誰でも閲覧可能
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- 認証済みユーザーは自分のフォルダにのみアップロード可
create policy "avatars_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 自分のファイルのみ更新・削除可
create policy "avatars_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
