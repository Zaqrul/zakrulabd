# Prompt for Codex: Space 3, Chapter 4 art and feel pass (The Kharn Anomaly, Armada Reclaimer)

Copy everything under the line into Codex, run from the repo root. Chapters 1 to 3 and Lumen have their own prompts; this one is Chapter 4 only.

---

You are enhancing the **design and feel** of Space 3, **Chapter 4: The Kharn Anomaly** (engine chapter **20**, boss **Armada Reclaimer**) in this repo. The gameplay is built and tested. Your job is art, effects, tells and tuning notes for this chapter, not new systems.

## Read first
- `docs/space3-design.md` (Resonance, the arsenal, Lumen, the director, signatures and ultimates, the music)
- `docs/space3-codex-prompt.md` (the Chapter 1 prompt and its updates; its rules apply, especially "nothing falls in space" and Update 6, signatures and ultimates)
- `docs/space3-codex-prompt-ch2-ch3.md` (the Chapters 2 and 3 prompt: the same kinds of task, a good pattern to follow)
- `docs/space3-codex-prompt-lumen.md` (Lumen's pink ship and pink plasma beam: hostile shots are **never** pink)
- `docs/space3-art-handoff.md`, `docs/space3-story-notes.md` (Malay) and `src/components/games/space3-story.ts` (`c20-*`, English)
- `CLAUDE.md` (palette navy `#171717`, amber `#fbcf33`; **all Space 3 copy is English only**)

## The chapter
Story: Saturn's rings, where Kroll's fleet fell in Space 1. The Vanguard's recovery crews are picking over the wrecks; Vex remembers being shot down here; every hulk can still be armed. The boss is the **Armada Reclaimer**, a fortress built from the old fleet that reloads itself with the old fleet's ordnance. The outro points to Uranus.

Waves (`space3-waves.ts`, chapter 20): the shared formations plus `wreckRun` (rock and wreckage), `minePatch`, `recoveryDrones`, `krollFighters`. Enemy types you will see: `rock`, `smallrock`, `mine`, `drone`, `seeker`, `fighter`, `scout`, `bomber`, `shard`, `cruiser`, and supply pods (they hold a repair).

## The environment check
`drawBackdrop` in `space-art.ts` sends every chapter 17 and above to `drawThirdOrbit` (`space3-environment.ts`). Check what exists for Chapters 18 and 19 first (the Chapters 2 and 3 prompt asked for Ceres and Europa backdrops). Chapter 4 needs its own: **the wrecks of Kroll's fleet in Saturn's rings**. If a chapter-specific backdrop is not yet chosen by `s.chapter === 20`, add it; if one exists, skip and say so.

## Tasks, in this order. Finish and test each before the next.

1. **Backdrop.** Saturn filling a corner with its rings seen edge-on as a thin bright band; ring dust and ice chunks at several depths; **drifting wrecks of an old war fleet** as silhouettes (hull plates, a broken gun deck, a snapped prow with old red markings), dimmer than any actor. Parallax with `s.scroll`, honour `reduceMotion`, no ground or ceiling.
2. **Armada Reclaimer art** (`space3-reclaimer-art.ts`, a flat placeholder: a long grey-and-rust hull welded from hulks, a rust bridge block, racks of salvaged missiles on the flanks, a cannon deck across the middle). Match the flat-shape-with-dark-rim style of `space2-boss-art.ts` and the earlier Space 3 bosses. Three visibly different phases (`e.a`: more racks, plates torn off, glowing seams), a hit flash (`e.flash > 0`), and an honest hitbox (84x60: nothing solid outside `e.x..e.x+e.w`, `e.y..e.y+e.h`).
3. **Tells for every verb** (new `drawReclaimerCue(ctx, e, s)`, hooked next to `drawCorvetCue` in `space-actor-art.ts`, `boss20` only). The art reads the wind-up from `corvetTell(e)` (`verb`, `charge`, `lane`, `aimed`, `ring`). Never draw a tell from a fixed clock. The boss draws from the ordinary kinds (`lance`, `sweep`, `pinch`, `debris`, `lattice`, `ring`; see earlier prompts) and has four of its own:
   | Verb | When | What it fires | What the tell should say |
   | --- | --- | --- | --- |
   | `salvo` | phase 0 signature | six to nine old missiles gather by the hull, **hang** (they hold still for about a second), then all go for where the ship was | the racks glow in sequence, lock marks toward the ship |
   | `minefield` | phase 1 signature | five to seven mines scattered across the field, never on the ship, each bursting into a ring | faint rings blooming where each mine will be laid |
   | `broadside` | phase 2 signature | cannon fire at six heights, one height left clear, three columns | the cannon deck lights; mark the edge, do not invent a corridor (the clear row is not exposed) |
   | `armada` | ultimate at 25% and 10% | a salvo, then mines, then a broadside, then two rings, one after another, after a 100 to 130 frame warning | the whole fortress flares and its racks, deck and hull light one by one; a bigger, longer tell than any ordinary attack |
4. **Projectiles** (`drawThirdBullet` in `space3-projectile-art.ts`, which receives the state). The salvo's missiles are kind `pulse` with a hold: draw them as **salvaged missiles** (a body, fins, a dark cold nozzle while they hang, a lit one once they launch; `b.vx === 0 && b.vy === 0` means still held). Mines are kind `scrap` with a fuse (`b.fuse`): draw them as **spiked mines** that blink faster as the fuse runs down. Both must read as hostile on the Saturn backdrop and never as scenery.
5. **Regular enemies and pods** (`space3-enemy-art.ts`): `mine`, `drone`, `seeker`, `fighter`, `rock`, `smallrock` look right in a wreck field (recovery drones with salvage clamps, old Kroll fighters repainted). The supply pod is a **repair canister**. Chapters 17+ only; Space 1 and 2 must render exactly as before.
6. **Effects:** sparks and rust when the Reclaimer changes phase, a visible launch puff when the held missiles go, a ring flash when a mine bursts, using the existing burst/smoke helpers in `space-fx-art.ts`.
7. **Tuning notes.** Play Chapter 4 several times. In `docs/space3-chapter1-plan.md` add "Tuning: Chapter 4" and record what felt too easy or hard (boss hp 1,000, how long the salvo hangs, how many mines, how often a broadside leaves no gap, wave density). Change a constant only if it is clearly wrong, and say what and why.

## Rules
- **Do not change** Space 1 or 2, the rules (`space-logic.ts` except a minimal hook if unavoidable, keeping its mixed CRLF/LF endings), the director, the signature code, the waves, the story text, or any music file (`space3-music*.ts`, `space3-tunes.ts`, `space3-groove.ts`). Do not touch Lumen's art.
- Art reads state; it never changes it. No new dependencies. Canvas 2D at 384x216 logical pixels. English only for anything the player reads.
- Other art files may have been edited by another pass: read the current file before editing, and merge, do not overwrite.

## Done means
- `npx tsc --noEmit`, `npx eslint` on the files you changed, and `npm test` all pass. Add tests only for pure logic you add.
- A short summary per task, which backdrops you found already done, anything you could not do, and the tuning notes.
