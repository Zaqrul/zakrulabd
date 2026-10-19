# Prompt for Codex: Space 3, Chapter 1 art and feel pass

Copy everything under the line into Codex, run from the repo root.

---

You are enhancing the **design and feel** of Space 3, Chapter 1 ("Phobos Run", boss "Ghost Corvet") in this repo. The gameplay skeleton is already built and tested. Your job is art, effects, HUD and tuning, not new systems.

## Read first
- `docs/space3-design.md` (the idea: **Resonance**, enemies that copy you, the music direction)
- `docs/space3-chapter1-plan.md` (what exists, and the "For Codex to enhance" list)
- `CLAUDE.md` (project rules; palette navy `#171717`, amber `#fbcf33`; all Space 3 copy is **English only**)

## What already works (do not rewrite)
- `src/components/games/space3-resonance.ts`: the Resonance rules (graze, Phase Shift, Kinetic Barrier, Overdrive, hit cost, ghost trail). Pure logic; constants at the top.
- `src/components/games/space3-boss.ts`: Ghost Corvet's three phases as pure functions (fan, ghost shot, ring, cloak timing).
- `src/components/games/space3-plans.ts`: the Chapter 17 enemy script.
- `src/components/games/space3-story.ts` and `space3-copy.ts`: English scenes and labels.
- `src/components/games/space3-music.ts`: six tunes (title, hangar, battle, warning, boss, victory), already chosen by `space-audio.ts` for chapter 17.
- Engine hooks in `space-logic.ts` (`State.res`, `Input.phase / barrier / overdrive`, `updateCorvet`) and the menu entry "Space 3" in `mini-games.tsx`.
- Keys in Space 3: arrows/WASD fly, **Shift** Phase Shift, **C** Kinetic Barrier, **V** Overdrive, **B** the Lance, **P** pause.

Play it: run `npm run dev`, open the site, open the arcade (zakrulOS), choose **Space 3**.

## Your tasks, in this order. Finish and test each before the next.

1. **Ghost Corvet art** (`space3-boss-art.ts`, currently a flat wedge). Canvas is 384x216 logical pixels; match the flat-shape-with-dark-rim style of `space2-boss-art.ts` and `space2-miniboss-art.ts`. Violet/steel hull with a gold eye. It must read clearly on a dark sky, have a hit flash (`e.flash > 0`), and show the cloak (`corvetCloaked(e.t)`) as a shimmer that is still readable, not invisible. Give the three phases (`e.a` 0, 1, 2) a visible change (e.g. more fins lit, the hull splitting).
2. **The ghost** (`space3-hud-art.ts`, currently a dashed rectangle at `ghostPose(state.res)`). Draw the player's ship silhouette there, translucent violet, brightening just before it fires (`pose.fire`). The player must be able to see where the replay will shoot from.
3. **Resonance HUD** (same file). Make the meter clear and good-looking: a fill with a pulse when full, the Phase Shift and Barrier cooldowns as small icons, an Overdrive state. Keep it in the bottom-left; do not cover play. Respect `reduceMotion`.
4. **Effects**: Phase Shift afterimage, Kinetic Barrier bubble (radius `BARRIER.radius`), a flash when a shot is reflected, a small spark on each graze, an Overdrive glow on the ship. Use the existing `burst` / smoke / `bursts` style in `space-fx-art.ts` where possible.
5. **Enemy shot art for the boss**: the shot kinds `pulse`, `needle` and `orb` come out of `corvetShots`. Make the ghost's `needle` shots look different from the Corvet's own `pulse` fan so the player knows which is the replay of themselves.
6. **Vanguard drone look** for Chapter 17's regular enemies (`space3-plans.ts` reuses Space 1's `drone`, `scout`, `seeker`, ...). Optional: a violet-and-gold tint when `isThird(state.chapter)`, in `space-actor-art.ts`, without changing Space 1 or 2.
7. **Touch controls** (`touch-controls.tsx`, `joystick-math.ts`): add buttons for Phase Shift, Barrier and Overdrive, shown only for Space 3 (`campaign === 3` in `space.tsx`), following the existing Bomb button.
8. **Tuning notes**: play Chapter 1 several times. In `docs/space3-chapter1-plan.md`, under a new heading "Tuning", record what felt too easy/hard (Corvet hp 400, fan every 80 frames, ghost shot every 2nd frame, ring every 150, Resonance gains and costs) and change the constants only if a number is clearly wrong. State each change and why.

## Rules
- Do **not** change Space 1 or Space 2 behaviour. Chapters 1 to 16 must play exactly as before.
- Do not move game rules into the art files. Art reads state; it does not change it.
- Do not edit `space3-music.ts` (the music is approved and tested) or the Space 3 story text.
- English only for anything the player reads.
- Keep `space-logic.ts` edits to a minimum. If you must touch it, keep the existing mixed CRLF/LF line endings (do not reformat the file).
- No new dependencies. Canvas 2D only.

## Done means
- `npx tsc --noEmit`, `npx eslint` on files you changed, and `npm test` all pass (currently 818 tests). Add tests for any pure logic you add; art needs none.
- A short summary of what changed per task, and anything you could not do.

## Update: the arsenal and the director (read before the tasks above)

Two things changed after the first version of this prompt. The tasks above still stand, but these replace the old behaviour:

- **No old weapons.** Space 3 fires the **Seed Bolt** (kind `seed`), the **Echo Wing** replays the ship's own path 90 frames late and fires where the ship fired (kind `echo`, drawn by `drawEchoWing`), and **B** fires the **Lance** (kind `lance`, a piercing beam that follows the ship). No bombs, nukes, torpedoes, Kite, Bloom or gun crates; a supply pod holds a repair. Code: `space3-arsenal.ts`; art placeholders: `space3-weapons-art.ts`. Give these three a real look: they are the player's whole identity in Space 3.
- **No repeating attacks.** Ghost Corvet no longer works through a list. `space3-director.ts` draws each attack (`lance`, `sweep`, `ring`, `pinch`, `lattice`, `echo`) with fresh numbers, never the same kind twice running, and learns where the ship hides (lances aim at that lane, wall gaps open away from it). Chapter waves are generated per flight (`space3-waves.ts`). Because the boss no longer has a fixed beat, **the telegraph must follow `corvetTell(e)`** (in `space3-boss.ts`: `verb`, `charge` 0..1, `lane`). `space3-boss-art.ts` already reads it for two charge arcs; extend it so each verb has its own clear tell:
  - `lance`: an aim line from the muzzle to `tell.lane` that brightens as `charge` rises.
  - `sweep`: a marked gap at the right edge (the wall is shown before it enters; the gap height is not in `corvetTell`, so draw a warning band across the right edge, or add the gap height to the boss fields and tell me).
  - `ring`: the iris charge. `pinch`: marks on the two flanks of the hull, where the wreckage is thrown from. `lattice`: a full-height grid flash at the right edge. `echo`: the ghost brightens and the boss eye turns toward the ship.
  Do not add a fixed rhythm back: every tell must come from `tell`, never from `e.t % n`.
- **Tests:** `tests/space3-director.test.mjs` proves the no-repeat rules. Keep it green. Do not make the director deterministic per phase.
- **Keys:** arrows/WASD fly, **Shift** Phase Shift, **C** Barrier, **V** Overdrive, **B** Lance.
- Another pass (yours, I think) already added `space3-environment.ts` and reworked `space3-boss-art.ts` and `space3-hud-art.ts`. I have not touched your art beyond two lines in `space3-boss-art.ts` (the charge arcs now read `corvetTell`). Merge, don't overwrite.

## Update 2: Chapter 2 (Ceres Industrial Belts, Excavator-X)

Chapter 18 of the engine is now playable after Chapter 1 (the run ends at "To be continued" after it; `LIMITS3.ready` is 18).

- **Story:** `c18-intro / boss / outro` in `space3-story.ts`: Mika reports Ceres under fire, Halo takes the evacuation lane, the outro points to Europa (chapter 3).
- **Waves:** `generateWaves(seed, { chapter: 18 })` adds the belts' formations (`rockField`, `bomberRun`, `shardStorm`, `splitterPair`) to the shared ones.
- **Boss:** `boss18` Excavator-X (`space3-boss.ts`, `EXCAVATOR`; unlock tables in `THIRD_BOSSES`). It uses the same director with two new attack kinds: **`drill`** (three rows of fast shots down the lane the ship hides in) and **`debris`** (a spray of rock blasted out of the rig toward the ship). Art placeholder: `space3-excavator-art.ts` (ore-yellow hull, drill cone nose, barrels). Replace it, keep reading `corvetTell(e)` for the tells (`drill`: the drill spins up and an aim stripe grows from the nose; `debris`: marks above the hull).
- **Music:** `space3-music-ch2.ts` ("Battle: Ceres Foundry", "Showdown: Excavator-X"), chosen by `space-audio.ts` for chapter 18. Do not edit.
- Same rules as before: no fixed beat, no old weapons, English only.

## Update 3: nothing falls in space

There is no up or down in space, so no attack comes from the top or bottom edge any more. Every shot now leaves the boss or enters from the right, and a test (`nothing in space falls`) enforces it: none starts at the top or bottom edge and none is thrown more vertically than horizontally (rings and the echo excepted).

- **Ghost Corvet's `pinch`** is now **wreckage torn off the two flanks of its own hull and flung at the ship**, converging, tumbling. The cue in `drawCorvetCue` already points at the flanks (`my ± 16`).
- **Corvet's `sweep`** is now a **field of wreck drifting in from the right** with a gap in it (it was a wall of orbs).
- **Excavator-X's `debris`** is now **rock blasted out of the rig in a spray** (it used to fall from the top). The tell is a fan of three marks at the nose.
- New bullet kind **`scrap`**: a tumbling grey-violet plate with a coral edge, drawn by `drawScrap` in `space3-weapons-art.ts` (already hooked into `space.tsx`). When you integrate `drawThirdBullet`, handle `scrap` there too, or leave it to fall through to `drawSeedBullet`. Do not draw it as a round orb: it should look like broken hull.
- The Phobos backdrop already has broken sensor trusses; if you add drifting wreck to the background, keep it clearly dimmer than the hostile `scrap`, so players can tell scenery from shots.

## Update 4: Chapter 3 (Jovian Cryo-Crags, Abyssal Wyrm)

Chapter 19 is playable after Chapter 2 (`LIMITS3.ready` is 19; the run ends at "To be continued" after it).

- **Story:** `c19-*` in `space3-story.ts`. **Vex returns** in the boss scene ("I heard the party started without me"). He is story only for now: no ally ship yet. If you design Fang, make it clearly different from Halo's Kite and from the player's Echo Wing.
- **Waves:** `generateWaves(seed, { chapter: 19 })` adds `iceDrift`, `cryoMines`, `ridgeSnipers`, `wyrmSpawn`.
- **Boss:** `boss19` Abyssal Wyrm (`WYRM` in `space3-boss.ts`, 120x34, 900 hp, quick: `speed` 1.7). New director attacks: **`shards`** (ice thrown one after another from points along the body, bullet kind `ice`) and **`chain`** (two streams that leave opposite sides of the body and cross). Placeholder art `space3-wyrm-art.ts` (head with a maw, seven swinging ice segments); its tells read `corvetTell`: the maw opens for `lance` and `chain`, the segments light in sequence for `shards`. Replace the art, keep the tells data-driven.
- **Music:** `space3-music-ch3.ts` ("Battle: Cryo-Crags", "Showdown: Abyssal Wyrm"), chosen by `space-audio.ts`. Do not edit.

## Update 5: a new wingman, Lumen

The player has a wingman in Space 3: **Lumen**, Ensign Sera Okoro, a new recruit in Nova's own ship type with a **plasma beam** (`space3-recruit.ts`, art `space3-lumen-art.ts`). Kite as a shot-catching escort was tried and dropped because it was the same idea as Space 2's Kite and Cover. A separate prompt covers her look: `docs/space3-codex-prompt-lumen.md`. The **Echo Wing** is the ship's own cyan afterimage, no longer a red Kite. Leave Lumen's art to that pass.

## Update 6: signature attacks and ultimates (every boss, every phase)

The bosses used to draw their attacks from a pool of general ones. Each boss now has **a unique signature attack for each of its three phases** (a phase opens with it, and the boss leans on it afterwards) and **an ultimate** forced at 25% and again at 10% of its health, with a long warning (100 to 120 frames). The code is in `space3-signature.ts`; the kit tables are `THIRD_BOSSES` in `space3-boss.ts`. The engine shows the wind-up through the usual fields, so the tell is read from `corvetTell(e)`: `verb`, `charge` 0..1, `lane`, `aimed`, `ring`. **Each of these twelve needs its own tell and its own look**, and each ultimate needs a bigger, longer one (a clear charge-up, a flash, a hold) than any ordinary attack.

| Boss | Phase | Verb | What it fires | What the tell should say |
| --- | --- | --- | --- | --- |
| Ghost Corvet | 0 | `scan` | three arms of shots wheel out of the hull like a radar sweep | a rotating sweep line from the iris |
| | 1 | `playback` | the height you flew for the last 1.5 s comes back as a wall of violet barbs from the right edge | a ghost trace of your own recent path drawn on the right edge |
| | 2 | `pincer` | two rows from the right edge closing on your height | two marks at the right edge converging on your lane |
| | ULT | `recall` | your whole last 3 s comes back, then a ring | the iris opens fully, a long replay trace across the screen |
| Excavator-X | 0 | `train` | a freight of ore carts, one after another, down your lane | a lane line out of the rig's belt at `tell.lane` |
| | 1 | `charge` | heavy charges that burst into rings before they reach you | the barrels glow, lock marks toward you |
| | 2 | `quake` | rings of rock with a gap that turns from ring to ring | the hull shudders, ring ripples |
| | ULT | `breach` | four rings at four speeds, each gap turned, then a drill stream | the rig overloads: cracks, glow, the drill spinning up |
| Abyssal Wyrm | 0 | `fang` | three fast volleys aimed where you are going, not where you are | an aim line that visibly leads the ship |
| | 1 | `snap` | an arc of ice closing on you from the front, one gap | the maw opens wide, a faint arc around the ship |
| | 2 | `coil` | a wall of ice with a corridor that snakes through it | the body undulates harder, a snaking guide on the right edge |
| | ULT | `surge` | two closing jaws, then a coil | the whole body flares, a long charge |

Constraints, all enforced by tests: nothing falls (no shot starts at the top or bottom edge; rings and the jaws are the only things that go in every direction), every attack finishes, and nothing is drawn from a fixed clock. Do not change the numbers or the attack code; make them readable and beautiful.
