alter table public.household_members add column joined_at timestamptz not null default now();

create table public.apple_tokens (
  user_id uuid primary key references auth.users (id) on delete cascade,
  refresh_token text not null
);
-- No policy on purpose: only Edge Functions with the service role read or write Apple refresh tokens.
alter table public.apple_tokens enable row level security;
revoke all on table public.apple_tokens from anon, authenticated;

create function public.release_households(target uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare hid uuid; heir uuid;
begin
  for hid in select household_id from public.household_members where user_id = target and role = 'owner' loop
    select user_id into heir from public.household_members
    where household_id = hid and user_id <> target
    order by joined_at, user_id
    limit 1;
    if heir is null then
      delete from public.households where id = hid;
    else
      update public.household_members set role = 'owner' where household_id = hid and user_id = heir;
    end if;
  end loop;
  delete from public.household_members where user_id = target;
end;
$$;

revoke all on function public.release_households(uuid) from public, anon, authenticated;
grant execute on function public.release_households(uuid) to service_role;
