delete from public.household_invites;
alter table public.household_invites
  add column used_at timestamptz,
  alter column expires_at set default now() + interval '48 hours';

create table public.join_attempts (
  user_id uuid not null references auth.users (id) on delete cascade,
  at timestamptz not null default now()
);
create index join_attempts_user_at on public.join_attempts (user_id, at);
-- No policy on purpose: only the security definer functions below read or write attempts.
alter table public.join_attempts enable row level security;

create function public.is_owner(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.household_members m
    where m.household_id = target and m.user_id = (select auth.uid()) and m.role = 'owner'
  );
$$;

create policy invites_owner_revoke on public.household_invites for delete using (public.is_owner(household_id));

create function public.invite_code() returns text
language plpgsql volatile set search_path = '' as $$
declare
  alphabet constant text := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  random_bytes bytea := uuid_send(gen_random_uuid());
  code text := '';
  i integer;
begin
  -- Bytes 0-5 and 9-14 of a v4 UUID are fully random; 256 is a multiple of 32, so mod 32 stays uniform.
  foreach i in array array[0, 1, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14] loop
    code := code || substr(alphabet, get_byte(random_bytes, i) % 32 + 1, 1);
  end loop;
  return code;
end;
$$;

drop function public.create_invite();
create function public.create_invite(target uuid default null) returns text
language plpgsql security definer set search_path = '' as $$
declare hid uuid; new_code text := public.invite_code();
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select m.household_id into hid
  from public.household_members m join public.households h on h.id = m.household_id
  where m.user_id = auth.uid() and m.role = 'owner'
  order by (m.household_id = target) desc, h.created_at, h.id
  limit 1;
  if hid is null then raise exception 'no household'; end if;
  delete from public.household_invites where expires_at <= now() or used_at is not null;
  insert into public.household_invites (code, household_id) values (new_code, hid);
  return new_code;
end;
$$;

-- A wrong code returns null instead of raising, so the failed attempt is committed and counts
-- toward the lockout that stops brute-forcing the 60-bit code space.
create or replace function public.join_household(invite_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare hid uuid; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  delete from public.join_attempts where user_id = uid and at <= now() - interval '1 hour';
  if (select count(*) from public.join_attempts where user_id = uid) >= 5 then
    raise exception 'too many attempts';
  end if;
  update public.household_invites set used_at = now()
  where code = upper(invite_code) and used_at is null and expires_at > now()
  returning household_id into hid;
  if hid is null then
    insert into public.join_attempts (user_id) values (uid);
    return null;
  end if;
  insert into public.household_members (household_id, user_id) values (hid, uid) on conflict do nothing;
  return hid;
end;
$$;

revoke all on function public.is_member(uuid), public.is_owner(uuid), public.invite_code(), public.create_invite(uuid), public.join_household(text) from public, anon;
grant execute on function public.is_member(uuid), public.is_owner(uuid), public.create_invite(uuid), public.join_household(text) to authenticated;
