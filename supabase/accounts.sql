-- Player accounts and saved game scores.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Passwords never touch this schema: Supabase Auth stores them hashed (bcrypt)
-- in auth.users. The browser only ever holds the public anon key, so every rule
-- below is enforced here, not in the site's code.

-- One profile per account. The username lives here so it can be unique.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,20}$')
);

create unique index if not exists profiles_username_key on public.profiles (username);

-- Best score per player per game. "trap" counts deaths plus one (lower is
-- better); every other game counts points (higher is better).
create table if not exists public.game_scores (
  user_id uuid not null references auth.users (id) on delete cascade,
  game text not null,
  best integer not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, game),
  constraint game_scores_game check (game in ('runner', 'flap', 'match', 'trap', 'space')),
  constraint game_scores_best check (best between 1 and 10000000)
);

alter table public.profiles enable row level security;
alter table public.game_scores enable row level security;

-- Players can read their own rows and nothing else. There are deliberately no
-- insert/update/delete policies: writes go through the functions below.
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select to authenticated using (id = auth.uid());

drop policy if exists "read own scores" on public.game_scores;
create policy "read own scores" on public.game_scores for select to authenticated using (user_id = auth.uid());

-- Creates the profile as the account is created, from the username sent at
-- sign-up. Runs inside the same transaction, so a taken or malformed username
-- rejects the whole sign-up instead of leaving an account without a profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, lower(coalesce(new.raw_user_meta_data ->> 'username', '')));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lets the sign-up form say "taken" before it creates anything.
create or replace function public.username_available(p_username text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not exists (select 1 from public.profiles where username = lower(p_username));
$$;

-- The only way to write a score. Keeps the better of the stored and submitted
-- values, so an old device can never overwrite a newer best.
create or replace function public.submit_score(p_game text, p_score integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  result integer;
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  if p_game not in ('runner', 'flap', 'match', 'trap', 'space') then
    raise exception 'unknown game';
  end if;
  if p_score is null or p_score < 1 or p_score > 10000000 then
    raise exception 'score out of range';
  end if;

  insert into public.game_scores (user_id, game, best)
  values (uid, p_game, p_score)
  on conflict (user_id, game) do update
    set best = case
          when p_game = 'trap' then least(public.game_scores.best, excluded.best)
          else greatest(public.game_scores.best, excluded.best)
        end,
        updated_at = now()
  returning best into result;

  return result;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.submit_score(text, integer) from public, anon;
grant execute on function public.submit_score(text, integer) to authenticated;
grant execute on function public.username_available(text) to anon, authenticated;
