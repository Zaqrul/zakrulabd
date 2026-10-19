# Space 3, Chapter 1 vertical slice: integration plan

Goal: Chapter 17 of the engine (Space 3, chapter 1, Phobos Run, boss Ghost Corvet) playable in the game, with Resonance, English copy and the Space 3 music. Everything below was found by reading the code; nothing in the engine has been changed yet except the save layer.

## What ties the engine to two campaigns

| Where | What it assumes | Change |
| --- | --- | --- |
| `space-logic.ts` `CHAPTERS = 8`, `FIRST_CAMPAIGN = 8`, `isSecond(chapter)` | Chapters above 8 are Space 2 | Add `campaignOf(chapter)` (1, 2 or 3). Keep `isSecond` true for Space 3 too, since Space 3 is built on Space 2's ship (XP, Kite, shield, Bloom). Add `isThird`. |
| `space-logic.ts` `placeOf` = `chapter - 8` | Space 2's eight places (sea, ground, weather) | Space 3 needs its own place table (no floor). Guard every `placeOf` use so chapter 17+ gives "space". |
| `space-logic.ts` `PLANS`, `PICKUP_PLANS`, `BOSS_PAR`, `BOSS_PHASES`, `BOSS_FLOOR`, `BOSS_HOME`, `BOSS_SCALE` | Indexed by chapter, ends at 16 | Append `space3-plans.ts` (like `space2-plans.ts`) and entries for `boss17`. |
| `EType` | `boss1`..`boss16`, `mini9`..`mini16` | Add `boss17` (Ghost Corvet) and `mini17`; `isSecondBoss` regex `^boss(9|1[0-6])$` must not catch it by accident, so add `isThirdBoss`. |
| `space-audio.ts` lines ~362 and ~432 | Picks Space 2 music by `isSecond` | Pick `s3*` tunes for chapters 17+. The music is already written. |
| `space-progress.ts` | Two campaigns | **Done**: `LIMITS3`, key and parser, with a test. |
| `space.tsx` `campaign?: 1 \| 2`, `LIMITS2`, `gameKey`, intro/outro story | Two campaigns | Widen to `1 \| 2 \| 3`; add `space3-story.ts` and `space3-copy.ts`. |
| `mini-games.tsx` `GameId`, `GAME_ORDER`, `GUEST_GAMES`, icons, names | `"space" \| "space2"` | Add `"space3"`. Decide whether it is locked behind clearing Space 2. |
| Account sync (`space.tsx` `gameKey`, `parseProgress`) | Account stores progress per game id | A new game id may need a server-side key. **Open question**, not looked at yet. |
| Achievements and `space2-copy.ts` | Chapter names, boss names, achievements per Space 2 chapter | A Space 3 set, English only. |

## Tests that constrain the copy

`space2-copy.test.mjs` style rules apply: matching speaker order in `en` and `ms`, a Halo line in every chapter, no line over 180 characters. Space 3 copy is English only, so the `ms` twin is the same text.

## Stages (each one leaves the game working and the tests green)

1. **Save layer.** Done.
2. **Campaign helpers.** `campaignOf`, `isThird`, `placeOf` guard, `EType` additions, with no visible change to Space 1 or 2. Tests prove Space 1 and 2 behave exactly as before.
3. **Chapter 17 plan.** `space3-plans.ts`: enemy script for Phobos Run using existing enemy kinds first (new art later), the boss spawn, pickups.
4. **Resonance in the loop.** Call `space3-resonance.ts` from the update step for chapters 17+: graze each frame, Shift / double-tap for Phase Shift, barrier key, Overdrive key, hit cost. Draw the meter.
5. **Ghost Corvet.** `boss17` with its ghost attack (the replay of the ship's path), three phases, art.
6. **Story and copy.** Intro, boss and outro lines (Rin, Halo, ARC, Nova), chapter name, achievements.
7. **UI and music hook-up.** `space3` in `mini-games.tsx`, the `s3*` tunes chosen by chapter.
8. **Play and tune.** Resonance numbers, ghost delay and the boss's difficulty are guesses until played.

## Risks

- `space-logic.ts` is about 4,400 lines with Space 2 logic behind `isSecond` checks. Stage 2 has to prove that nothing moves for chapters 1 to 16.
- The Space 3 ship is Space 2's. Mechanics from the design (stance swap, gravity wells) wait until after Chapter 1 is fun.
- Input: Phase Shift on `Shift` / double tap and the barrier need keys and touch controls (`touch-controls.tsx`, `joystick-math.ts`). Mobile needs its own decision.

## Status and handoff

Done, with tests (817 pass, `tsc` and lint clean):

| Stage | State |
| --- | --- |
| 1 Save layer | Done (`LIMITS3`). |
| 2 Campaign helpers | Done (`campaignOf`, `isThird`, `placeOf` guard). |
| 3 Chapter 17 script | Done: `space3-plans.ts`, flying enemies only, joined to `PLANS`. |
| 4 Resonance in the loop | Done in the engine: `State.res`, `Input.phase / barrier / overdrive`, grazes, barrier reflection, Overdrive damage, hit cost, ghost trail. Keyboard: Shift Phase Shift, C Barrier, V Overdrive. A plain HUD meter, ghost marker, phase glow and barrier ring are drawn (`space3-hud-art.ts`). **No touch buttons yet.** |
| 5 Ghost Corvet | Done as a playable skeleton: `boss17`, `space3-boss.ts` (three phases), placeholder art in `space3-boss-art.ts`. |
| 6 Story and copy | Done for chapter 17: `space3-story.ts` (English), `space3-copy.ts`. No achievements yet. |
| 7 UI and music hook-up | Done: "Space 3" in the arcade menu (`mini-games.tsx`), `space.tsx` runs campaign 3, `space-audio.ts` picks the `s3*` tunes. Clearing chapter 17 ends the run with "To be continued" (`LIMITS3.ready`). |
| 8 Play and tune | Not started: nobody has played it yet. |

Chapters 18 (Ceres, Excavator-X) and 19 (Europa, Abyssal Wyrm) now exist with the same systems; see "Update 2" in `space3-codex-prompt.md`.

### For Codex to enhance

Everything below is a placeholder or a guess, kept deliberately simple so it can be redesigned:

- **Art:** `space3-boss-art.ts` is a flat wedge and two fins. Needs a real Ghost Corvet (cloak shimmer, a clear "eye"), a **ghost sprite** drawn at `ghostPose(state.res)` so the player can see where the replay will fire from, a Resonance meter in the HUD, a Phase Shift afterimage, the barrier bubble and Overdrive glow.
- **Cloak:** `corvetCloaked` only dims the art. Decide whether a cloaked Corvet should also take reduced damage or be untargetable, and say so with a tell.
- **Boss numbers:** 400 hp, fan every 80 frames, ring every 150, ghost shot every 2nd frame. Untuned.
- **Resonance numbers** are in `space3-resonance.ts`; also untuned.
- **Controls:** `Input` already carries `phase`, `barrier` and `overdrive`. Map them in `space.tsx` (Shift, a second key, a third; double tap on touch) and in `touch-controls.tsx`.
- **Enemy roster:** chapter 17 uses Space 1's flying enemies. The Vanguard's own drones (copying, violet-and-gold) are not drawn yet.
- **Tests to keep:** `tests/space3-*.test.mjs`. The boss plan is pure, so its behaviour can change without touching the engine.

## Tuning

The art/control integration is recorded in `space3-art-handoff.md`. Ghost Corvet now uses Claude's adaptive director, so the old fixed fan/ring intervals above are historical placeholders. Codex did not change gameplay constants.

Three automated attempts used the real Chapter 17 simulation from launch, with normal health, damage, pickups and ability costs. A simple pilot evaluated nearby projectile trajectories and used normal movement, Phase Shift, Barrier and Lance inputs. Story pauses were acknowledged automatically. No invulnerability, extra health, free meter, boss skips or boss-health edits were applied in these attempts.

| Seed | Outcome | Total time | Boss time | Hits | End HP | Phase Shifts / Barriers / Lances |
| --- | --- | --- | --- | --- | --- | --- |
| 695852269 | Clear | 595 s | 540 s | 26 | 100 | 116 / 43 / 2 |
| 371553997 | Defeat, boss at 44 HP | 575 s | 519 s | 27 | 0 | 109 / 41 / 1 |
| 885227981 | Clear | 588 s | 527 s | 27 | 53.2 | 134 / 44 / 1 |

All three attempts reached every boss phase and remained at ship level 1. Peak hostile projectile counts were 40, 36 and 43. None naturally reached Overdrive. These are simulation seconds, not wall-clock browser play sessions.

The long boss fights and scarce charge deserve human review. The pilot is very defensive, misses many firing opportunities and earns little XP, so these results do not isolate boss HP as the cause. No HP, damage, graze gain or cooldown was changed on that evidence alone. Watch for whether a new player understands that close passes earn Resonance, whether early enemies can be killed reliably, and whether 1,200 HP feels repetitive with the opening arsenal.

Real-browser checks separately verify that keyboard and touch inputs activate the intended ability and display cooldowns. A full-meter fixture checks Overdrive; it does not establish how easy full charge is to earn. Human difficulty and enjoyment remain unassessed.

## Vex's Fang

Design only, not integrated: Fang could take a forward aggressive offset on Nova's opposite wing from Lumen, align with armoured enemies, then make a committed firing pass with a shield-piercing kinetic railgun. Retain Crimson Fang's forward mandibles and ace markings, patched with mismatched steel. A narrow rail channel distinguishes precision damage from Lumen's sustained pink plasma, Echo's cyan replay and Halo's rescue escort. Reposition between passes rather than copying Nova's trail or catching bullets. Targeting, damage, sync and shield-piercing remain proposals, not implemented systems.

## Tuning: Chapters 2 and 3

No constants changed: Excavator-X stays 700 HP, Wyrm 900 HP. Claude was adding signatures and ultimates during this art pass; these measurements describe a work-in-progress snapshot and must be repeated after his handoff.

Three automated natural-state attempts per chapter used the real simulation from launch. Health, pickups, damage, costs and inputs were normal; story pauses were acknowledged automatically. A conservative trajectory pilot used movement, Phase Shift, Barrier and occasional Lance. These are accelerated simulation seconds, not human play or real-time browser completion runs.

| Chapter | Seed | Outcome | Total / boss seconds | Hits / end HP | Peak hostile shots | Phase / Barrier / Lance |
| --- | --- | --- | --- | --- | --- | --- |
| Ceres | 506203220 | Clear | 201 / 142 | 4 / 100 | 61 | 26 / 11 / 0 |
| Ceres | 951388761 | Clear | 209 / 146 | 2 / 100 | 50 | 31 / 14 / 0 |
| Ceres | 586823816 | Clear | 196 / 140 | 3 / 80 | 55 | 25 / 12 / 1 |
| Europa | 976897337 | Clear | 365 / 308 | 6 / 100 | 227 | 72 / 28 / 3 |
| Europa | 502968018 | Clear | 323 / 264 | 8 / 80 | 235 | 72 / 24 / 4 |
| Europa | 757853480 | Clear | 346 / 289 | 8 / 100 | 219 | 74 / 28 / 3 |

All reached every phase and cleared without free health, meter or invulnerability. Repairs explain high end HP despite hits. None naturally reached Overdrive. Ceres boss time was 140-146 s; Europa 264-308 s, beyond the 70/80 s pars for this defensive low-level pilot. This flags possible pacing fatigue but does not isolate HP from missed firing opportunities, movement or new signatures. Keep HP unchanged pending human play.

Drill uses 10-16 ranks of three shots every third frame (30-48 shots), speed 3-4 logical px/frame and 40-56 warning frames. This fast, thick lane needs early sideways escape; the lane cue should help. Chain uses 10-16 alternating shots, speed 2-2.8 and 30-42 warning frames. Clears do not prove every scrap wall or crossing avoidable: the pilot used defensive abilities frequently, and no exhaustive reachability test was performed. No pattern was classified unavoidable from these runs alone.

Wave time before boss was about 56-63 s in Ceres and 57-59 s in Europa. Whole-run peak shot counts were far higher in Europa (219-235 versus 50-61), but do not isolate wave density from late boss signatures. Watch whether crystal coral rims and sequential segment cues stay readable when chain overlaps coil/surge. Keep distant scenery dim and repair pods friendly-looking.

Browser checks separately cover localhost arcade entry, normal intro/launch, controlled chapter selection, movement, scenery/boss rendering and a mobile viewport. Chapter/boss fixtures are visual smoke checks, not difficulty evidence. Human judgement of fun, difficulty and apparent unavoidable patterns remains outstanding; no subjective feedback was invented.

### Wyrm size revision after visual review

The requested menace pass enlarges Wyrm's real body from 120 x 34 to 156 x 64; collision and home/movement bounds follow the engine's existing dimension handling. HP stays 900, with no attack/director or speed edits. Three fresh automated runs (628830735, 649715336, 350658926) cleared all phases in 97/104/94 boss seconds, with 2/5/2 hits and 85/100/100 end HP. The wider/taller target improves potential firing uptime; compare human difficulty after Claude's final handoff rather than attributing the entire difference to size. Visual comparison and validation are in `space3-art-handoff.md`.

### All-boss size and attack-size check

Corvet is now 98 x 48, Excavator 126 x 72, Wyrm remains 156 x 64. Boss rounds and Space 3 blasting fragments grow by up to 15%; radius-3 small rounds stay at Barrier's reflection threshold. HP, speeds, pattern counts and timings are unchanged. Full details and pictures are in `space3-art-handoff.md`.

Three new automated natural-state runs per chapter all cleared. Corvet seeds 283095740 / 53512541 / 33711706: boss times 94 / 95 / 99 s and 0 / 1 / 3 hits. Excavator seeds 720968124 / 826874891 / 606456351: 96 / 104 / 87 s and 4 / 0 / 3 hits. Wyrm seeds 77404656 / 864096191 / 378431921: 99 / 98 / 98 s and 4 / 5 / 5 hits, ending HP 52.392 / 100 / 33.946. Defensive abilities and repairs were normal; no free health, invulnerability or Resonance. Automated clears do not establish human difficulty or exhaustive pattern reachability. The enlarged bodies may improve shot uptime as well as occupying more space.
