-- Extend the existing score allowlist without touching existing scores.
-- Apply before releasing cloud score sync for the new games.
begin;
alter table public.game_scores drop constraint if exists game_scores_game;
alter table public.game_scores add constraint game_scores_game
  check (game in ('runner', 'flap', 'match', 'hop', 'space', 'drift', 'snake', 'breakout', 'pong', 'frogger', 'pacman', 'blast'));

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
  if p_game not in ('runner', 'flap', 'match', 'hop', 'space', 'drift', 'snake', 'breakout', 'pong', 'frogger', 'pacman', 'blast') then
    raise exception 'unknown game';
  end if;
  if p_score is null or p_score < 1 or p_score > 10000000 then
    raise exception 'score out of range';
  end if;

  insert into public.game_scores (user_id, game, best)
  values (uid, p_game, p_score)
  on conflict (user_id, game) do update
    set best = greatest(public.game_scores.best, excluded.best),
        updated_at = now()
  returning best into result;

  return result;
end;
$$;
commit;
