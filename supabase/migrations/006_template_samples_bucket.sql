-- template-samples バケット: テンプレートのサンプル画像専用
insert into storage.buckets (id, name, public) values ('template-samples', 'template-samples', true);

-- 公開読み取り
create policy "template_samples_select"
  on storage.objects for select
  using (bucket_id = 'template-samples');

-- 署名付き URL 経由のアップロードはサービスロールで発行するため
-- anon/authenticated からの直接 insert は不要（署名付き URL が権限を持つ）
