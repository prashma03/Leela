-- Run after the migration in a TEST Supabase project. Everything rolls back.
-- Success: no exceptions. Failure: rollback manually before doing anything else.
begin;
insert into auth.users (id, email, raw_user_meta_data)
values
  ('10000000-0000-4000-8000-000000000001', 'leela-rls-a@example.test', '{"name":"RLS A"}'),
  ('10000000-0000-4000-8000-000000000002', 'leela-rls-b@example.test', '{"name":"RLS B"}');

set local role anon;
do $$
begin
  begin
    perform * from public.leela_profiles;
    raise exception 'FAIL: anonymous profile read succeeded';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.leela_update_memory('{"name":"Intruder"}');
    raise exception 'FAIL: anonymous RPC succeeded';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$
declare affected integer;
begin
  if (select count(*) from public.leela_profiles) <> 1 then
    raise exception 'FAIL: user A can read another profile';
  end if;
  update public.leela_profiles set name = 'Intruder'
    where id = '10000000-0000-4000-8000-000000000002';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'FAIL: cross-account update succeeded'; end if;
  begin
    update public.leela_profiles set id = '10000000-0000-4000-8000-000000000002';
    raise exception 'FAIL: changing owner ID succeeded';
  exception when insufficient_privilege then null;
  end;
  perform public.leela_update_memory('{"savedStories":["gita-2-47"]}');
  perform public.leela_update_memory('{"mood":"calm"}');
  if not exists (
    select 1 from public.leela_profiles
    where memory ->> 'mood' = 'calm' and memory -> 'savedStories' = '["gita-2-47"]'::jsonb
  ) then raise exception 'FAIL: patch erased unrelated saved data'; end if;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
do $$
begin
  if exists (select 1 from public.leela_profiles where memory ? 'savedStories') then
    raise exception 'FAIL: user B can read user A data';
  end if;
end;
$$;
reset role;
delete from auth.users where id = '10000000-0000-4000-8000-000000000001';
do $$
begin
  if exists (select 1 from public.leela_profiles where id = '10000000-0000-4000-8000-000000000001') then
    raise exception 'FAIL: deleted user profile remains';
  end if;
end;
$$;
rollback;
