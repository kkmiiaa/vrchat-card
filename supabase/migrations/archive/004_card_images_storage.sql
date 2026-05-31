-- card-images バケット（公開）
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'card-images',
  'card-images',
  true,
  2097152, -- 2MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- 認証済みユーザーは自分のフォルダのみ書き込み可
create policy "card_images_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "card_images_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "card_images_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'card-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 誰でも読める（公開バケット）
create policy "card_images_select" on storage.objects
  for select to public
  using (bucket_id = 'card-images');
