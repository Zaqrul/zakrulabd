# Prompt for Codex: Space 3, Chapter 3 art and feel pass (Jovian Cryo-Crags, Abyssal Wyrm)

Copy everything under the line into Codex, run from the repo root. Chapters 1 and 2 have their own prompts; this one is Chapter 3 only.

---

You are enhancing the **design and feel** of Space 3, **Chapter 3: Jovian Cryo-Crags** (engine chapter **19**, boss **Abyssal Wyrm**) in this repo. The gameplay is built and tested. Your job is art, effects, tells and tuning notes for this chapter, not new systems.

## Read first
- `docs/space3-design.md` (Resonance, enemies that copy you, the arsenal and director, the music)
- `docs/space3-codex-prompt.md` (the Chapter 1 prompt; its updates apply to you too, especially "nothing falls in space")
- `docs/space3-codex-prompt-ch2.md` (the Chapter 2 prompt: the same kinds of task, a good pattern to follow)
- `docs/space3-art-handoff.md`
- `CLAUDE.md` (palette navy `#171717`, amber `#fbcf33`; **all Space 3 copy is English only**)

## The chapter
Story (`space3-story.ts`, `c19-*`): the Vanguard has woken a structure under Europa's ice and is draining Jupiter's magnetic field through it; the fleet dives into a crevasse; the boss is the Abyssal Wyrm, a modular machine kilometres long coiling out of the ice; **Vex returns** in the boss scene ("I heard the party started without me") flying a rebuilt Fang; the outro points to Saturn's rings. Setting from `docs/space3-story-notes.md`: Europa's cracked ice surface with Jupiter's storms behind it, geysers of water vapour. **There is no floor and no ceiling for the ship**: the ice walls and ridges are scenery, never a surface the ship flies over, and no attack comes from above or below.

Waves (`space3-waves.ts`, chapter 19): shared formations plus `iceDrift` (comets), `cryoMines`, `ridgeSnipers`, `wyrmSpawn` (a line of drones). Enemy types you will see: `comet`, `mine`, `sniper`, `drone`, `scout`, `seeker`, `diver`, `orbiter`, `gunner`, `swarm`, `armor`, `fighter`, `cruiser`, `shard`, and supply pods (they hold a repair).

Boss (`space3-boss.ts` `WYRM`, 120x34, 900 hp, three phases at 66% and 33%, quick). It uses the director, so its attacks are drawn at random; phase 0 `shards`, `sweep`, `lance`; phase 1 adds `chain`, `pinch`; phase 2 adds `ring`, `lattice`, `echo`.
- `shards`: ice thrown one after another from points **along the length of the body** (bullet kind `ice`).
- `chain`: two streams leave opposite sides of the body and cross (kind `ice`).
- `sweep`: wreckage drifting in with a gap (kind `scrap`). `pinch`: plates flung from the flanks (kind `scrap`). `lance`, `ring`, `lattice`: as in earlier chapters. `echo`: the Vanguard fires back your own shots (violet double barbs, already drawn).

The art reads the wind-up from `corvetTell(e)` in `space3-boss.ts`: `verb`, `charge` 0..1, `lane`, `aimed`, `ring`. **Never draw a tell from a fixed clock** (`e.t % n`): the boss has no fixed beat.

## Tasks, in this order. Finish and test each before the next.

1. **Backdrop.** `drawBackdrop` in `space-art.ts` sends every chapter 17 and above to `drawThirdOrbit` (Mars and Phobos). Add a Europa version and choose by `s.chapter` (19). Jupiter filling a corner with banded storms, the cracked ice surface as a curved limb with long fractures, ice ridges and cliffs at several depths as scenery silhouettes, plumes of vapour, the magnetic field as faint auroral arcs (they relate to the story: the Vanguard is draining it). Parallax with `s.scroll`, honour `reduceMotion`, keep contrast **below** actors and projectiles. The ship must never read as flying over a floor.
2. **Abyssal Wyrm art** (`space3-wyrm-art.ts`, currently seven ellipse segments and a triangular head). Match the flat-shape-with-dark-rim style of `space2-boss-art.ts`. Give it a real modular look: ice-armoured plates over a mechanical spine, a head with a maw that opens, glowing seams. The three phases (`e.a`) should show damage: segments cracked and then blown away, the seams going from cold blue to amber to red. It must keep its collision body honest: the Wyrm's hitbox is `e.x..e.x+e.w`, `e.y..e.y+e.h` (120x34), so the body must stay within it even while it swings. Keep the hit flash (`e.flash > 0`).
3. **Tells for every verb** (new `drawWyrmCue(ctx, e, s)` in the same file, hooked next to `drawCorvetCue` in `space-actor-art.ts`, only for `boss19`): `shards` lights the segments in sequence from the head down the body as `charge` rises (the shards leave from points along the body); `chain` the two crossing lanes at the flanks; `lance` an aim line to `tell.lane` from the maw; `sweep` a bar at the right edge (the gap width is not exposed; mark the edge only); `pinch` marks on the flanks; `ring`/`lattice` as in `drawCorvetCue`.
4. **Projectiles.** Kind `ice` (the Wyrm's shards and chain) is currently drawn by Space 2's old ice art, if at all. Handle `ice` in `drawThirdBullet` (`space3-projectile-art.ts`, it receives the state) for chapters 17+: a crystalline shard pointing along its velocity, pale blue with a **coral edge** so it reads as hostile against an icy backdrop. Keep `scrap` readable here too (Chapter 2's prompt asks for a chapter-specific look; coordinate with it, do not overwrite). Hostile shots must never look like scenery.
5. **Regular enemies.** Frost variants of the Vanguard units for this chapter in `drawVanguard` (`space3-enemy-art.ts`): cryo mines (ice-shelled), comets (ice cores with a vapour tail), snipers on the ridges. The supply pod is a **repair canister** in Space 3 (pods hold a repair). Only for chapters 17+; Space 1 and 2 must render exactly as before.
6. **Vex's Fang, design only.** Vex returns in the story but has no ship in the game. Add `drawFang(ctx, x, y, s, reduceMotion)` in a new `space3-fang-art.ts`, **not wired in**: a sleek crimson fighter that is clearly not Halo's Kite and not the player's Echo Wing (cyan), reusing the look of Space 1's Crimson Fang in `space-fang-art.ts` but rebuilt from scrap (patched plates, mismatched panels). In `docs/space3-chapter1-plan.md` under "Vex's Fang" write one paragraph proposing how Fang could fly in the game (the story notes call it the Vanguard stance: pure damage, a railgun that pierces shields) without adding any rules.
7. **Effects.** Vapour and ice-crystal bursts when the Wyrm changes phase or segments break, using the existing burst/smoke helpers in `space-fx-art.ts`.
8. **Tuning notes.** Play Chapter 3 several times (`localhost:3000`, arcade, Space 3, clear Chapters 1 and 2 first or start a new flight). In `docs/space3-chapter1-plan.md` add "Tuning: Chapter 3" and record what felt too easy or hard (hp 900, how fast the Wyrm drifts, shard counts, how often `chain` is unavoidable, wave density). Change a constant only if it is clearly wrong, and say what and why.

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
