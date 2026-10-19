# Prompt for Codex: Space 3, Chapter 2 art and feel pass (Ceres Industrial Belts, Excavator-X)

Copy everything under the line into Codex, run from the repo root. Chapter 1 (Phobos Run, Ghost Corvet) has its own prompt and was done first; this one is Chapter 2 only.

---

You are enhancing the **design and feel** of Space 3, **Chapter 2: Ceres Industrial Belts** (engine chapter **18**, boss **Excavator-X**) in this repo. The gameplay is built and tested. Your job is art, effects, tells and tuning notes for this chapter, not new systems.

## Read first
- `docs/space3-design.md` (Resonance, enemies that copy you, the arsenal and director, the music)
- `docs/space3-codex-prompt.md` (the Chapter 1 prompt; its updates 1 to 4 apply to you too, especially "nothing falls in space")
- `docs/space3-art-handoff.md` (what the Chapter 1 art pass delivered and how it was integrated)
- `CLAUDE.md` (palette navy `#171717`, amber `#fbcf33`; **all Space 3 copy is English only**)

## The chapter
Story (`space3-story.ts`, `c18-*`): Ceres Station is under fire; 300 miners are still on the belts; Halo takes the evacuation lane; the Vanguard drones are stripping ore haulers for parts; the boss is a deep-core drill rebuilt as a gun platform; the outro points to Europa. Setting from `docs/space3-story-notes.md`: an asteroid-belt mining complex, magnetic bridges, drifting steel dust, giant cranes. **There is no floor and no ceiling.** Scenery may have a horizon or structure, but never a ground the ship flies over, and nothing falls.

Waves (`space3-waves.ts`, chapter 18): shared formations plus `rockField`, `bomberRun`, `shardStorm`, `splitterPair`. Enemy types you will see: `rock`, `smallrock`, `bomber`, `shard`, `splitter`, `scout`, `drone`, `seeker`, `orbiter`, `gunner`, `sniper`, `comet`, `mine`, `swarm`, `armor`, `fighter`, `cruiser`, and supply pods (they hold a repair).

Boss (`space3-boss.ts` `EXCAVATOR`, 92x54, 700 hp, three phases at 66% and 33%). It uses the director (`space3-director.ts`) so its attacks are drawn at random; the kinds it can use: phase 0 `drill`, `debris`, `sweep`; phase 1 adds `lance`, `pinch`; phase 2 adds `lattice`, `ring`.
- `drill`: three rows of fast shots down the lane the ship hides in.
- `debris`: a spray of rock blasted out of the rig's nose toward the ship (bullet kind `scrap`).
- `sweep`: a wall of wreckage drifting in from the right with a gap (kind `scrap`).
- `lance`: a stream aimed at a learned lane. `pinch`: plates flung from the two flanks. `lattice`, `ring`: patterns of orbs.

The art reads the boss's wind-up from `corvetTell(e)` in `space3-boss.ts`: `verb`, `charge` 0..1, `lane`, `aimed`, `ring`. **Never draw a tell from a fixed clock** (`e.t % n`): the boss has no fixed beat.

## Tasks, in this order. Finish and test each before the next.

1. **Backdrop.** `drawBackdrop` in `space-art.ts` sends every chapter 17 and above to `drawThirdOrbit` (`space3-environment.ts`), which is Mars and Phobos. Add a Ceres version and choose by `s.chapter` (keep Phobos for 17). A belt of rock at several depths, a mining station frame, ore haulers and crane arms as silhouettes, magnetic bridges as thin lines, steel dust, a small sun. Parallax with `s.scroll`, honour `reduceMotion`, keep contrast **below** actors and projectiles. No ground plane.
2. **Excavator-X art** (`space3-excavator-art.ts`, currently a flat placeholder: ore-yellow hull, drill cone, barrels). Match the flat-shape-with-dark-rim style of `space2-boss-art.ts` and the Corvet in `space3-boss-art.ts`. Make the three phases visibly different (`e.a` 0, 1, 2: plates blown off, a third barrel, glowing cracks), a hit flash (`e.flash > 0`), and keep the hitbox honest: nothing that looks solid may be outside `e.x..e.x+e.w`, `e.y..e.y+e.h`. The drill should spin faster as an attack winds up.
3. **Tells for every verb** (new `drawExcavatorCue(ctx, e, s)` in the same file, hooked next to `drawCorvetCue` in `space-actor-art.ts`, only for `boss18`): `drill` a lane marker at `tell.lane` growing with `charge`; `debris` a fan of marks at the nose; `sweep` a bar at the right edge (the director does not expose the gap width, so mark the edge, do not invent a corridor); `lance` an aim line to `tell.lane`; `pinch` marks on the two flanks; `ring`/`lattice` as in `drawCorvetCue`.
4. **Projectiles.** Kind `scrap` is drawn by `drawScrap` in `space3-weapons-art.ts` (a grey-violet plate with a coral edge). In Chapter 17 it is the Corvet's torn hull; in Chapter 18 it is **ore and rock** thrown by a mining rig. Draw it differently by chapter (`s.chapter === 18`: ore-brown rock with a lit edge, rougher, with size from `b.r`) by handling `scrap` in `drawThirdBullet` (`space3-projectile-art.ts`), which receives the state. Keep every projectile readable on the Ceres backdrop and keep the coral/violet hostile language so hostile shots never look like scenery.
5. **Regular enemies.** `drawVanguard` (`space3-enemy-art.ts`) covers the Vanguard units. Check `rock`, `smallrock`, `bomber`, `shard`, `splitter`, `swarm` and `pod` look right in a mining setting: ore chunks with Vanguard mining drills fixed to them, and the supply pod drawn as a **repair canister** (pods hold a repair in Space 3, not a gun). Only for chapters 17+; Space 1 and 2 must render exactly as before.
6. **Effects.** Dust and sparks when Excavator-X changes phase or is hit hard, using the existing burst/smoke helpers in `space-fx-art.ts`; a heavy-rig rumble (`s.shake`) only through existing engine fields, no new state.
7. **Tuning notes.** Play Chapter 2 several times (`localhost:3000`, arcade, Space 3, clear Chapter 1 first or start a new flight). In `docs/space3-chapter1-plan.md` add a "Tuning: Chapter 2" heading and record what felt too easy or hard (hp 700, drill speed and count, how often a wall of scrap leaves no gap, wave density). Change a constant only if it is clearly wrong, and say what and why.

## Rules
- **Do not change** Space 1 or 2, the rules (`space-logic.ts` except a minimal hook if unavoidable, keeping its mixed CRLF/LF endings), the director, the waves, the story text, or any music file (`space3-music*.ts`, `space3-tunes.ts`, `space3-groove.ts`).
- Art reads state; it never changes it. No new dependencies. Canvas 2D at 384x216 logical pixels.
- English only for anything the player reads.
- Other art files may have been edited by another pass: read the current file before editing, and merge, do not overwrite.

## Done means
- `npx tsc --noEmit`, `npx eslint` on the files you changed, and `npm test` all pass. Add tests only for pure logic you add.
- A short summary per task, anything you could not do, and the tuning notes.

## Note: Lumen is an ally in Space 3
A recruit, Ensign Okoro (callsign Lumen), flies Nova's ship, repainted, on the player's wing and burns the nearest enemy with a plasma beam (`space3-recruit.ts`, `space3-lumen-art.ts`). Her look is a separate pass (`docs/space3-codex-prompt-lumen.md`). Do not touch `space3-lumen-art.ts`, and make sure your projectiles, backdrop and tells stay readable beside a pink-and-white ship and a long pink beam. Hostile shots must never be pink.
