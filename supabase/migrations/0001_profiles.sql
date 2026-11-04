-- Majlis al-Bararah (the phone app's own Supabase project): members' profiles.
--
-- Run once in Supabase: Dashboard -> SQL Editor -> New query -> paste this file -> Run.
-- Every later change to the database is a new numbered file in this folder, run the same way, so
-- the database's history lives in git with the code.
--
-- Sign-in itself (Google or email and password) is handled by Supabase (the auth.users table). The
-- profile is created by the member right after their first sign-in.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 30),
  -- the Majalis are for brothers or for sisters, never mixed: chosen once, never changed
  gender text not null check (gender in ('male', 'female')),
  riwaya text not null default 'warsh' check (riwaya in ('warsh', 'hafs', 'qalun', 'other')),
  languages text[] not null default '{}' check (languages <@ array['ar', 'en', 'fr']),
  -- a two-letter country code (e.g. 'MA'), for the Hijri calendar
  country text check (country ~ '^[A-Z]{2}$'),
  -- members confirm they are 13 or older
  age_confirmed boolean not null check (age_confirmed),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security: nobody can read or change a row unless a policy below allows it.
alter table public.profiles enable row level security;

-- each member sees and edits only their own profile
create policy "Members read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Members create their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "Members update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- on every update: the gender, the age confirmation and the creation date stay as they were
create or replace function public.keep_profile_fixed()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.gender is distinct from old.gender then
    raise exception 'The gender cannot be changed.';
  end if;
  new.created_at := old.created_at;
  new.age_confirmed := old.age_confirmed;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_keep_fixed
  before update on public.profiles
  for each row execute function public.keep_profile_fixed();
