-- Virtual Office — initial schema
-- Im Supabase SQL Editor ausführen, oder via `supabase db push`.

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar_id int not null check (avatar_id between 1 and 7),
  desk_position int not null check (desk_position between 1 and 7) unique,
  created_at timestamptz not null default now()
);

create table if not exists public.statuses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade unique,
  status text not null check (status in ('online','pause','dnd','offline')),
  custom_message text,
  updated_at timestamptz not null default now()
);

create index if not exists statuses_user_id_idx on public.statuses(user_id);

-- Realtime aktivieren (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'statuses'
  ) then
    alter publication supabase_realtime add table public.statuses;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'users'
  ) then
    alter publication supabase_realtime add table public.users;
  end if;
end $$;

-- RLS
alter table public.users enable row level security;
alter table public.statuses enable row level security;

drop policy if exists "users readable by all authenticated" on public.users;
create policy "users readable by all authenticated"
  on public.users for select
  to authenticated using (true);

drop policy if exists "user can insert own row" on public.users;
create policy "user can insert own row"
  on public.users for insert
  to authenticated with check (auth.uid() = id);

drop policy if exists "user can update own row" on public.users;
create policy "user can update own row"
  on public.users for update
  to authenticated using (auth.uid() = id);

drop policy if exists "statuses readable by all authenticated" on public.statuses;
create policy "statuses readable by all authenticated"
  on public.statuses for select
  to authenticated using (true);

drop policy if exists "user can upsert own status" on public.statuses;
create policy "user can upsert own status"
  on public.statuses for insert
  to authenticated with check (auth.uid() = user_id);

drop policy if exists "user can update own status" on public.statuses;
create policy "user can update own status"
  on public.statuses for update
  to authenticated using (auth.uid() = user_id);
