alter table public.recipes add constraint recipes_data_size check (octet_length(data::text) < 200000);
alter table public.households add constraint households_profile_size check (octet_length(profile::text) < 200000);

create or replace function public.create_household(profile jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if (select count(*) from public.household_members where user_id = auth.uid() and role = 'owner') >= 5 then
    raise exception 'household limit reached';
  end if;
  insert into public.households (profile) values (coalesce(profile, '{}'::jsonb)) returning id into new_id;
  insert into public.household_members (household_id, user_id, role) values (new_id, auth.uid(), 'owner');
  return new_id;
end;
$$;

revoke all on function public.create_household(jsonb) from public, anon;
grant execute on function public.create_household(jsonb) to authenticated;
