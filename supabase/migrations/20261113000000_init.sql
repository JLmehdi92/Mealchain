create table public.households (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  profile jsonb not null default '{}'::jsonb
);

create table public.household_members (
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  primary key (household_id, user_id)
);

create table public.recipes (
  id uuid primary key,
  household_id uuid not null references public.households (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.shopping_items (
  id text not null,
  household_id uuid not null references public.households (id) on delete cascade,
  week_start date not null,
  ingredient_id text not null,
  checked boolean not null default false,
  checked_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (household_id, id)
);

create table public.household_invites (
  code text primary key,
  household_id uuid not null references public.households (id) on delete cascade,
  expires_at timestamptz not null default now() + interval '7 days'
);

create table public.import_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default current_date,
  count integer not null default 0,
  primary key (user_id, day)
);

create function public.is_member(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.household_members m
    where m.household_id = target and m.user_id = (select auth.uid())
  );
$$;

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.recipes enable row level security;
alter table public.shopping_items enable row level security;
alter table public.household_invites enable row level security;
alter table public.import_usage enable row level security;

create policy households_member_read on public.households for select using (public.is_member(id));
create policy households_member_update on public.households for update using (public.is_member(id)) with check (public.is_member(id));

create policy members_read_own_household on public.household_members for select using (public.is_member(household_id));
create policy members_leave on public.household_members for delete using (user_id = (select auth.uid()));

create policy recipes_member_all on public.recipes for all using (public.is_member(household_id)) with check (public.is_member(household_id));
create policy shopping_member_all on public.shopping_items for all using (public.is_member(household_id)) with check (public.is_member(household_id));
create policy invites_member_read on public.household_invites for select using (public.is_member(household_id));
create policy usage_read_own on public.import_usage for select using (user_id = (select auth.uid()));

-- Households are created and joined only through these functions, so a user can never attach
-- themselves to someone else's household by inserting a membership row directly.
create function public.create_household(profile jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into public.households (profile) values (coalesce(profile, '{}'::jsonb)) returning id into new_id;
  insert into public.household_members (household_id, user_id, role) values (new_id, auth.uid(), 'owner');
  return new_id;
end;
$$;

create function public.create_invite() returns text
language plpgsql security definer set search_path = '' as $$
declare hid uuid; new_code text;
begin
  select household_id into hid from public.household_members where user_id = auth.uid() and role = 'owner' limit 1;
  if hid is null then raise exception 'no household'; end if;
  new_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  insert into public.household_invites (code, household_id) values (new_code, hid);
  return new_code;
end;
$$;

create function public.join_household(invite_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare hid uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select household_id into hid from public.household_invites where code = upper(invite_code) and expires_at > now();
  if hid is null then raise exception 'invalid or expired invite'; end if;
  insert into public.household_members (household_id, user_id) values (hid, auth.uid()) on conflict do nothing;
  return hid;
end;
$$;

create function public.bump_import_usage() returns integer
language plpgsql security definer set search_path = '' as $$
declare used integer;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into public.import_usage (user_id, day, count) values (auth.uid(), current_date, 1)
  on conflict (user_id, day) do update set count = public.import_usage.count + 1
  returning count into used;
  return used;
end;
$$;

revoke all on function public.create_household(jsonb), public.create_invite(), public.join_household(text), public.bump_import_usage() from public, anon;
grant execute on function public.create_household(jsonb), public.create_invite(), public.join_household(text), public.bump_import_usage() to authenticated;

alter publication supabase_realtime add table public.shopping_items;
