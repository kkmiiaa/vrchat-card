-- SECURITY DEFINER 関数は search_path を明示的に設定する必要がある
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
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
$$;
