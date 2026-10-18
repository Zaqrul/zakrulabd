-- Space 2 cloud scores and achievements; preserves all existing scores.
-- Apply with: npx supabase db query --linked --file <this file>
begin;

alter table public.game_scores drop constraint if exists game_scores_game;
alter table public.game_scores add constraint game_scores_game check (game in ('runner', 'flap', 'match', 'trap', 'hop', 'space', 'space2', 'drift', 'snake', 'breakout', 'pong', 'frogger', 'pacman', 'blast', 'gems', 'bastion', 'crypt', 'delve', 'gunner', 'garden'));

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
  if p_game not in ('runner', 'flap', 'match', 'trap', 'hop', 'space', 'space2', 'drift', 'snake', 'breakout', 'pong', 'frogger', 'pacman', 'blast', 'gems', 'bastion', 'crypt', 'delve', 'gunner', 'garden') then
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

revoke all on function public.submit_score(text, integer) from public, anon;
grant execute on function public.submit_score(text, integer) to authenticated;

-- Achievements. Kept in a table of their own, not in the account's metadata: metadata travels
-- inside every sign-in token, and this is several kilobytes. One row per player; the browser
-- merges before it saves, so the row only ever grows.
create table if not exists public.player_achievements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  constraint player_achievements_size check (octet_length(data::text) <= 120000)
);

alter table public.player_achievements enable row level security;

drop policy if exists "read own achievements" on public.player_achievements;
create policy "read own achievements" on public.player_achievements for select to authenticated using (user_id = auth.uid());

create or replace function public.save_achievements(p_data jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' or octet_length(p_data::text) > 120000 then
    raise exception 'bad achievements';
  end if;

  insert into public.player_achievements (user_id, data)
  values (uid, p_data)
  on conflict (user_id) do update set data = excluded.data, updated_at = now();
end;
$$;

revoke all on function public.save_achievements(jsonb) from public, anon;
grant execute on function public.save_achievements(jsonb) to authenticated;

commit;
