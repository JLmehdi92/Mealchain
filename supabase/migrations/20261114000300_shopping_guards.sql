drop table public.recipes;

alter table public.shopping_items
  add constraint shopping_items_size check (length(id) <= 80 and length(ingredient_id) <= 64);

create function public.guard_shopping_item() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.checked_by := auth.uid();
  new.updated_at := least(new.updated_at, now());
  if tg_op = 'UPDATE' and new.updated_at < old.updated_at then
    return null;
  end if;
  return new;
end;
$$;

create trigger shopping_items_guard before insert or update on public.shopping_items
  for each row execute function public.guard_shopping_item();
