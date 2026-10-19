# Prompt for Codex: Space 3, Chapters 2 and 3 together (environments, bosses, Kite)

Copy everything under the line into Codex, run from the repo root. It replaces the two separate Chapter 2 and Chapter 3 prompts (`space3-codex-prompt-ch2.md`, `space3-codex-prompt-ch3.md`, kept for reference). Chapter 1 and Lumen have their own prompts.

---

You are enhancing the **design and feel** of Space 3, **Chapter 2: Ceres Industrial Belts** (engine chapter **18**, boss **Excavator-X**) and **Chapter 3: Jovian Cryo-Crags** (engine chapter **19**, boss **Abyssal Wyrm**), and designing **Kite** as part of their scenery. The gameplay is built and tested. Your job is art, effects, tells and tuning notes, not new systems.

## Read first
- `docs/space3-design.md` (Resonance, enemies that copy you, the arsenal, the director, Lumen, the music)
- `docs/space3-codex-prompt.md` (the Chapter 1 prompt and its updates; its rules apply here, especially "nothing falls in space")
- `docs/space3-codex-prompt-lumen.md` (Lumen, the new wingman: a pink-and-white ship with a pink plasma beam)
- `docs/space3-art-handoff.md` (what earlier passes delivered and how it was integrated)
- `docs/space3-story-notes.md` (the settings, in Malay) and `src/components/games/space3-story.ts` (`c18-*`, `c19-*`, in English)
- `CLAUDE.md` (palette navy `#171717`, amber `#fbcf33`; **all Space 3 copy is English only**)

## The environment check (read this before anything else)
I checked whether the chapters share a place. **They do not in the story, but they do in the code, and that is the bug to fix.**

| Chapter | Story setting | What the game draws today |
| --- | --- | --- |
| 1 Phobos Run (17) | Mars orbit, Phobos, broken sensor trusses | `drawThirdOrbit`: Mars and Phobos. Correct. |
| 2 Ceres Industrial Belts (18) | an asteroid-belt mining complex: ore haulers, magnetic bridges, steel dust, giant cranes | **the same Mars and Phobos scene** |
| 3 Jovian Cryo-Crags (19) | Europa's cracked ice under Jupiter's storms, a crevasse dive | **the same Mars and Phobos scene** |

`drawBackdrop` in `space-art.ts` sends every chapter 17 and above to `drawThirdOrbit` in `space3-environment.ts`, which has no per-chapter branch. So Chapters 2 and 3 fly in front of Mars. **Add a backdrop for each, chosen by `s.chapter`, and keep Phobos for 17.** If, when you open the code, you find a chapter already has its own backdrop, skip that chapter's environment task and say so; do not redo it.

## Common rules for every task
- **There is no floor and no ceiling.** A horizon, a limb or structure may be scenery, never a surface the ship flies over, and nothing falls.
- Parallax with `s.scroll`, honour `reduceMotion`, and keep scenery contrast **below** actors and projectiles.
- The art reads the boss's wind-up from `corvetTell(e)` in `space3-boss.ts` (`verb`, `charge` 0..1, `lane`, `aimed`, `ring`). **Never draw a tell from a fixed clock** (`e.t % n`): the bosses have no fixed beat.
- Hostile shots keep the coral/violet language and **are never pink** (Lumen's beam is pink and white) and never look like scenery.

## Chapter 2: Ceres Industrial Belts (boss Excavator-X)
Story: Ceres Station is under fire; 300 miners are still out on the belts; the Vanguard drones are stripping ore haulers for parts; the boss is a deep-core drill rebuilt as a gun platform. Waves add `rockField`, `bomberRun`, `shardStorm`, `splitterPair`.

Boss (`EXCAVATOR`, 92x54, 700 hp, three phases). Attacks: `drill` (three rows of fast shots down the lane the ship hides in), `debris` (rock blasted out of the nose in a spray, kind `scrap`), `sweep` (a drifting wreck field with a gap, kind `scrap`), and from phase 1 `lance`, `pinch`; phase 2 `lattice`, `ring`.

1. **Ceres backdrop** (new, in `space3-environment.ts`): a belt of rock at several depths, a mining-station frame, ore haulers and crane arms as silhouettes, magnetic bridges as thin lines, steel dust, a small sun.
2. **Excavator-X art** (`space3-excavator-art.ts`, currently a placeholder): three visibly different phases (`e.a`: plates blown off, a third barrel, glowing cracks), hit flash (`e.flash > 0`), an honest hitbox (nothing solid outside `e.x..e.x+e.w`, `e.y..e.y+e.h`), the drill spinning faster as an attack winds up.
3. **Tells for every verb** (new `drawExcavatorCue(ctx, e, s)`, hooked next to `drawCorvetCue` in `space-actor-art.ts`, `boss18` only): `drill` a lane marker at `tell.lane`; `debris` a fan of marks at the nose; `sweep` a bar at the right edge (the gap width is not exposed: mark the edge, do not invent a corridor); `lance` an aim line; `pinch` marks on the flanks; `ring`/`lattice` as in `drawCorvetCue`.
4. **`scrap` in Chapter 2 is ore and rock** thrown by a mining rig (ore-brown, rough, size from `b.r`), not the Corvet's violet hull plates: handle it by chapter in `drawThirdBullet` (`space3-projectile-art.ts`).
5. **Regular enemies and pods** (`space3-enemy-art.ts`): `rock`, `smallrock`, `bomber`, `shard`, `splitter` look right in a mine (ore chunks with Vanguard drills); the supply pod is a **repair canister** (pods hold a repair in Space 3). Chapters 17+ only.

## Chapter 3: Jovian Cryo-Crags (boss Abyssal Wyrm; Vex returns)
Story: the Vanguard has woken a structure under Europa's ice and is draining Jupiter's magnetic field through it; the fleet dives into a crevasse; **Vex returns** ("I heard the party started without me") in a rebuilt Fang; the outro points to Saturn's rings. Waves add `iceDrift`, `cryoMines`, `ridgeSnipers`, `wyrmSpawn`.

Boss (`WYRM`, 120x34, 900 hp, quick, three phases). Attacks: `shards` (ice thrown one after another from points along the body, kind `ice`), `chain` (two streams from opposite sides that cross, kind `ice`), `sweep`, `lance`; phase 1 adds `pinch`; phase 2 `ring`, `lattice`, `echo`.

1. **Europa backdrop** (new): Jupiter filling a corner with banded storms, the cracked ice surface as a curved limb with long fractures, ice ridges and cliffs at several depths as silhouettes (the crevasse), plumes of vapour, faint auroral arcs for the drained magnetic field. The ship must never read as flying over a floor.
2. **Abyssal Wyrm art** (`space3-wyrm-art.ts`, currently seven ellipses and a triangle): a modular look, ice-armoured plates over a mechanical spine, a maw that opens, glowing seams going from cold blue to amber to red across the phases (cracked, then blown away). The body stays inside the 120x34 hitbox even while it swings. Keep the hit flash.
3. **Tells for every verb** (new `drawWyrmCue`, hooked in `space-actor-art.ts`, `boss19` only): `shards` lights the segments in sequence from the head down as `charge` rises; `chain` the two crossing lanes at the flanks; `lance` an aim line from the maw; `sweep` a bar at the right edge; `pinch` the flanks; `ring`/`lattice` as before.
4. **`ice`** (the shards and chain) in `drawThirdBullet` for chapters 17+: a crystalline shard pointing along its velocity, pale blue with a **coral edge** so it reads as hostile against an icy backdrop.
5. **Frost variants** of `mine`, `comet`, `sniper` in `drawVanguard`; the pod is a repair canister. Chapters 17+ only.
6. **Vex's Fang, design only.** Add `drawFang(ctx, x, y, s, reduceMotion)` in a new `space3-fang-art.ts`, **not wired in**: a sleek crimson fighter, rebuilt from scrap (patched plates, mismatched panels), based on Space 1's Crimson Fang in `space-fang-art.ts`, clearly different from Lumen's pink ship, the player's, and Kite. In `docs/space3-chapter1-plan.md` under "Vex's Fang" write one paragraph proposing how it could fly (the story notes call it the Vanguard stance: pure damage, a railgun that pierces shields) without adding rules.

## Kite (scenery in Chapters 2 and 3)
Kite is **Halo's ORB escort**. It is **not a player wingman any more** (Lumen is; Kite as a shot-catcher was tried and dropped because it duplicated Space 2's Kite and Cover), but the story puts it on screen's edge: "Kite takes the evacuation lane" (Chapter 2), the relief corridor (Chapters 1 to 3). Show it as **non-interactive scenery**: no collision, no state, no effect on play.

1. **Design Kite, not as the player's ship.** The earlier pass already did the work: `docs/design/retired-kite/space3-kite-art.ts.txt` is an ORB rescue-escort (a blunt cabin behind a curved catching plate; white, teal `#5eead4`, orange rescue stripes, amber light; no beak, dorsal blades, low wing or gunpod). Read it, keep what works, and adapt it as a scenery actor: it read `s.aegis` and `AEGIS` (both removed), so rewrite it to take only a position, a time and `reduceMotion`. Say what you kept and what you changed.
2. **New file `space3-kite-cameo.ts`** exporting `drawKiteCameo(ctx, x, y, t, reduceMotion)`. About 15 to 19 logical pixels wide, dark rim, readable on both new backdrops, and **never** player-blue/yellow, Lumen's pink, the Echo Wing's cyan, or the Vanguard's violet/gold.
3. **Use it in the environments.** Chapter 2: a convoy of ORB transports (plain white-and-orange hauler silhouettes) crossing the far lane with one or two Kites escorting them, moving with a gentle drift, always behind actors and projectiles and dimmer than them. Chapter 3: a single Kite relief ship far off, crossing the ice limb or flying along the crevasse wall. Keep them small, slow and low-contrast so they never read as targets or hazards.
4. **A one-page sheet.** In `docs/space3-art-handoff.md`, add a short "Kite" section: the silhouette in words, the palette (hex), and how it differs from the player's ship, Lumen, the Echo Wing, the Vanguard and Space 2's Kite.

## Tuning notes (both chapters)
Play Chapters 2 and 3 several times (`localhost:3000`, arcade, Space 3). In `docs/space3-chapter1-plan.md` add "Tuning: Chapters 2 and 3" and record what felt too easy or hard (boss hp 700 and 900, drill speed and count, how often a scrap wall or `chain` is unavoidable, wave density). Change a constant only if it is clearly wrong, and say what and why.

## Rules
- **Do not change** Space 1 or 2, the rules (`space-logic.ts` except a minimal hook if unavoidable, keeping its mixed CRLF/LF endings), the director, the waves, the story text, or any music file (`space3-music*.ts`, `space3-tunes.ts`, `space3-groove.ts`). Do not touch Lumen's art (`space3-lumen-art.ts`): her prompt is separate.
- Art reads state; it never changes it. No new dependencies. Canvas 2D at 384x216 logical pixels. English only for anything the player reads.
- Other art files may have been edited by another pass: read the current file before editing, and merge, do not overwrite.

## Done means
- `npx tsc --noEmit`, `npx eslint` on the files you changed, and `npm test` all pass. Add tests only for pure logic you add.
- A short summary per task, which chapter backdrops you found already done (if any), anything you could not do, and the tuning notes.

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
