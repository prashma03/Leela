-- Run once in the chosen Supabase project's SQL Editor, or via migrations.
-- No old JSON files or existing Supabase accounts are deleted.
begin;

create table public.leela_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Little friend' check (char_length(name) between 1 and 60),
  memory jsonb not null default '{}'::jsonb
    check (jsonb_typeof(memory) = 'object' and octet_length(memory::text) <= 65536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leela_profiles enable row level security;
revoke all on public.leela_profiles from anon, authenticated;
grant select on public.leela_profiles to authenticated;
grant update (name, memory) on public.leela_profiles to authenticated;
grant all on public.leela_profiles to service_role;

create policy leela_read_own_profile on public.leela_profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy leela_update_own_profile on public.leela_profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create function public.leela_profile_created()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.leela_profiles (id, name, memory)
  values (
    new.id,
    coalesce(nullif(left(trim(new.raw_user_meta_data ->> 'name'), 60), ''), 'Little friend'),
    '{}'::jsonb
  );
  return new;
end;
$$;
revoke all on function public.leela_profile_created() from public, anon, authenticated;
create trigger leela_auth_user_created after insert on auth.users
  for each row execute function public.leela_profile_created();

-- Also support users already registered in this Supabase project.
insert into public.leela_profiles (id, name)
select id, coalesce(nullif(left(trim(raw_user_meta_data ->> 'name'), 60), ''), 'Little friend')
from auth.users on conflict (id) do nothing;

create function public.leela_profile_timestamp()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function public.leela_profile_timestamp() from public, anon, authenticated;
create trigger leela_profile_updated before update on public.leela_profiles
  for each row execute function public.leela_profile_timestamp();

-- SECURITY INVOKER keeps RLS in force. No caller-selected account identifier.
-- Merge patches atomically so concurrent updates to different keys survive.
create function public.leela_update_memory(patch jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare updated public.leela_profiles;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if patch is null or jsonb_typeof(patch) <> 'object' or octet_length(patch::text) > 65536 then
    raise exception 'Invalid memory';
  end if;
  update public.leela_profiles
    set memory = memory || patch,
        name = coalesce(nullif(left(trim(patch ->> 'name'), 60), ''), name)
    where id = auth.uid()
    returning * into updated;
  if updated.id is null then raise exception 'Profile not found'; end if;
  return jsonb_build_object('name', updated.name, 'memory', updated.memory);
end;
$$;
revoke all on function public.leela_update_memory(jsonb) from public, anon;
grant execute on function public.leela_update_memory(jsonb) to authenticated;

commit;
