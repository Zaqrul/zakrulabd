# Design revamp: full audit and prompts for Codex (Space, Space 2, Space 3)

Written 2026-10-20. This is a **visual** audit of the whole look of the three games, not only enemies. I ran
the real engine for all 28 chapters and looked at:

- every enemy and boss the engine spawns, drawn alone at 3x to 9x (bosses at full health, about 60% and
  about 25%);
- a **whole game frame** for every chapter, drawn with the game's own `draw` function: one mid-wave frame
  and one boss frame at about 40% health (backdrop, land, actors, shots, effects, HUD);
- the player's ship at every level (1 to 10) and with each weapon;
- the game frame, start, pause and clear screens in the arcade, and the phone layout.

Each prompt below is meant to be pasted into Codex on its own, run from the repo root. Run one at a time,
check the result in the browser, commit, then run the next.

## What the audit found

Verdicts: **Too simple** means it should be redrawn; Weak means it is fine but a clear step below its
neighbours; Good means leave it.

### Backdrops

| Where | Verdict | What I saw |
| --- | --- | --- |
| Space, Chapters 1 to 4 and 6 to 8 | Good | Countryside with hills and smoke, a sunset sea with a reflected sun, a ringed planet, a purple nebula, a solar corona, a derelict station with laser gates, a red fortress skyline. |
| Space, Chapter 5 (Frozen Rings) | Weak | Teal wavy bands with floating grey rocks; plainer than every other Space chapter. |
| Space 2, Chapters 9 to 16 | Good, the best in the series | Sunset sea in rain, a jungle island, snow mountains with flags, desert light, a railway at dusk, arctic aurora, a hurricane, a city of towers. |
| Space 3, Chapters 17 to 24 and 26 to 28 | Good | Distinct places (a Mars limb with trusses, a ringed planet, green storm swirls, blue storm columns on ice, floating ice platforms, a purple nebula with crystals, a golden ring machine, a red warship interior, a blue hypergate swirl). Darker and less colourful than Space 1 and 2, which suits the mood. |
| Space 3, Chapter 25 (the Void) | **Too simple** | Almost solid black with faint dust. Nothing to look at, and no landmark. |

### Enemies

| Asset | Verdict | What I saw |
| --- | --- | --- |
| Space 1 kinds from Chapter 3 on (gunner, bomber, splitter, zigzag, turret, orbiter, armor, mine, shard, comet, swarm, rocks) | **Too simple** | One or two flat shapes each. Chapters 1 and 2 (jet, tank, helicopter, gunboat, bunker, SAM, destroyer) are good. The teal supply pod is the same sprite in every chapter. |
| Space 3 outer-system kinds (Chapters 21 to 28: the spider-like mini boss, the frigate, the teardrop craft) | **Too simple** | Small flat shapes with a single accent. |
| Space 2 enemies | Weak: repetitive | Mostly the Space 1 enemies redrawn in one olive military palette for sea, jungle, ice and desert alike. Swarm (a four-point star) and mine (a gear) are simple. Pod and shard are the Space 1 sprites unchanged. |
| Space 3 Vanguard enemies (Chapters 17 to 28) | Weak: low variety | A strong faction look but about eight silhouettes from one recipe (a dart with an eye, a flower with an eye), repeated unchanged to Chapter 28. |

### Bosses

| Asset | Verdict | What I saw |
| --- | --- | --- |
| Space 3, Chapters 21 to 28 (Tempest Raider, Cryo-Colossus, Iron Goliath, Aegis-Null, Void Stalker, Ring Keeper, The Warmaster, The Herald) | **Too simple, the biggest gap** | Tempest Raider: a flat white wing, one circle, two cyan lines. Cryo-Colossus: a grey slab on two feet with a blue circle and a dark rectangle. Iron Goliath: a white hull, a gold disc and four floating black boxes. Aegis-Null: a purple octagon, a disc, loose shards. Void Stalker: a dark wedge with a pink dot (and in the Void it is barely visible). Ring Keeper: concentric rings and four small turrets. The Warmaster: a big white polygon with a few lines. The Herald: a white lens with a blue eye. Large flat colour areas, no plates, no rim detail, little change between stages. |
| Space, all eight bosses | Good | Dense, distinct, readable, with hit flash and a shield dome. Damage is only small cracks and flames; a structural change at low health would lift them. |
| Space 2, all eight bosses | Good | Ships, a carrier, a multi-car train, an Atlas mech: dense and multi-part, with damage showing. Weakness: nearly all in one green-grey palette. |
| Space 3, Chapters 17 to 20 | Good | Ghost Corvet, Excavator-X, Abyssal Wyrm, Armada Reclaimer have clear silhouettes, lit seams and a visible change between phases. |

### Player, pickups, HUD, interface

| Asset | Verdict | What I saw |
| --- | --- | --- |
| Player ship | Good, with a gap | A detailed blue and yellow fighter that visibly grows from level 1 to 4 and gets a hangar (HQ) at level 9. Levels 4 to 8 look the same as each other: the upgrades they grant (hypersonic drive, mechanical shield, second launcher, self-repair) do not show on the body. |
| Pickups (weapon crates, hearts, bomb and flame icons) | Weak | Tiny generic glyphs in coloured squares, about 12px, hard to tell apart at a glance in a busy frame. |
| Player shots | Weak | The blaster shot is a small yellow capsule; fine as a baseline, but it is the one thing on screen the player sees most. |
| Canvas HUD (Space, Space 2, Space 3) | Good | Segmented health, level box, progress bar, combo, the Kinetic Push strip and Lumen readout all match the game's style. |
| Game frame, menus and overlays | **Weak** | The game sits in a plain white card with a text header and pill buttons, unlike the game's own style. In the full-screen arcade on a desktop it is about 590px wide on a 1500px screen. Start, pause, clear and lost screens are a title and one or two buttons on a blur. |
| Phone layout (full screen, rails) | Good | Just built; do not regress it. |

Not examined in detail: enemy and boss projectile shapes, beams, hazards, explosions, the Space 3 allies (Lumen,
Echo, Kite). Ask Codex to include them in its before sheet.

### Priority

1. Space 3 bosses, Chapters 21 to 28 (prompt 1): the clearest gap, in the part of Space 3 a player reaches last.
2. Space 1 enemies from Chapter 3 (prompt 2): the first game a visitor plays.
3. Game frame and menus (prompt 3): lifts all three games at once.
4. Space 3 Void backdrop and outer enemies (prompt 4), Space 2 identity per biome (prompt 5).
5. Player ship progression and pickups (prompt 6).

---

## Shared brief (paste this at the top of every prompt)

You are improving the **design** of the Space series (Space, Space 2, Space 3) in this repo. The game
rules are built and tested. Your job is art and interface, never rules.

Read first: `CLAUDE.md` (palette navy `#171717`, background `#f5f5f5`, amber `#fbcf33`; fonts Inter,
Plus Jakarta Sans, JetBrains Mono), `docs/space3-art-handoff.md` (how the last art pass was done and
verified), `docs/space3-design.md`.

The quality bar: flat shapes with a dark ink rim (`#171717`), many small modelled parts (plates, vents,
rivets, turrets, lit seams), a clear front and weak point, a faction accent colour, no bitmap textures,
Canvas 2D only. The canvas is 384 x 216 logical pixels (`W`, `H` in `space-logic.ts`), scaled up by
`fitCanvas`. These are the standard to reach, in the same style, so read them first:
`space-chapter-boss-art.ts` (Space's Siege Tank, Hive Carrier), `space2-boss-art.ts` (the train, the
carriers), `space3-boss-art.ts` (Ghost Corvet), `space3-excavator-art.ts`, `space2-machine-art.ts`.

Rules:
- Art reads state and never writes it. Do not change collision boxes (`e.w`, `e.h`), muzzle positions
  (`enemyMuzzle`), hit boxes, timings, damage, drops, or anything in `space-logic.ts`, `space3-act2.ts`,
  `space3-director.ts`, `space3-resonance.ts`, `space3-arsenal.ts`.
- Respect `reduceMotion`: decoration freezes, hit and damage feedback stays.
- Every hostile that fires keeps its existing wind-up tell readable (`corvetTell`, the boss cue painters,
  `drawAttackCue`). A new look must never hide a tell, a weak point or a projectile. Read
  `space3-director.ts` and `space3-act2.ts` for which attacks each boss uses, and give those attacks a
  visible emitter (a muzzle, a vent, a hatch) in the new body.
- Contrast: backgrounds stay darker and quieter than actors and projectiles.
- Keep the mixed CRLF and LF line endings in files that have them; do not reformat.
- Copy: Space 3 is English only. Space and Space 2 labels exist in English and Malay
  (`mini-games.tsx`, `space2-copy.ts`); change both together.
- No new dependencies. Do not edit the music, the story text, or the achievements.
- Another agent may be working in the same tree. Preserve uncommitted work; no reset, no broad
  formatting, no `git checkout` of files you did not change.

Verify, and report:
1. Build a temporary browser harness (not committed). It runs the real engine for the chapters you touch
   (`createState`, then `step` with the player kept alive: `s.p.inv`, `s.p.shield` high), collects what it
   spawns (a boss at full, about 60% and about 25% health), and draws it with `drawSpaceEnemy` at 3x to 9x.
   For backdrops and whole-frame checks, export `draw` from `space.tsx` **temporarily** and call it with a
   stub for `labels` and a plain `hud` object; revert the export afterwards. Deep-clone states with a
   function that tolerates `WeakSet` (`structuredClone` throws on Space 3 states). Make a **before** sheet
   and an **after** sheet, look at the images, and say what you saw, including what is still weak. An
   all-white frame is the hit flash: also check the normal colours.
2. Sampled scenes in the chapters you did not mean to touch must render the same before and after.
3. `npx tsc --noEmit`, `npx eslint` on the files you changed, and `npm test` pass.
4. Finish with a short summary per task and anything you could not do. Do not commit.

---

## Prompt 1: Space 3 bosses, Chapters 21 to 28

Task: redraw the eight outer-system bosses, and their mini bosses, from flat placeholders into machines at the
level of Space's and Space 2's bosses.

Files: `space3-act2-boss-art.ts` (`drawOuterBoss`, which draws all 16 boss and mini boss bodies) with helpers
in `space3-act2-art.ts`. These bosses are made of several bodies (`e.mods`, `e.stage`, `e.parts` in
`space3-act2.ts`): keep each body inside its box and its stage logic untouched.

Boxes today (w x h): Tempest Raider 90x40, Cryo-Colossus 120x80, Iron Goliath 150x70, Aegis-Null 72x72, Void
Stalker 80x34, Ring Keeper 108x108, The Warmaster 160x118; read The Herald's from the engine.

For every boss: at least 15 ink-rimmed modelled parts (plates, vents, bolts, lights), separate parts that can
move, a clear front and weak point, a hit flash, a **different** look in each stage, and damage that changes the
silhouette (plates fall away, an exposed core, fire and sparks). Keep a faction palette: steel `#a4adb6`, ochre
`#bb853e` and ink `#171717` for outer machines, with one accent per boss. Specific briefs:

1. **Tempest Raider** (ch21, storm raider). A swept interceptor, not a flat wing: a canopy with a pilot's
   silhouette, two engine nacelles with a lit intake and a flickering exhaust, layered wing plates with
   lightning-etched panel lines, wingtip antennae with cyan lights, a storm-grey and electric-cyan scheme. At
   low health a wing panel peels away and sparks arc between the nacelles.
2. **Cryo-Colossus** (ch22, frozen walking fortress). Keep the two-legged slab idea but build it: a riveted armour
   hull under a crust of ice, frost growth along the top edge, vents venting white vapour, hydraulic knees with
   visible pistons, a glowing blue ice core behind a cracked glass plate, a sensor head on the dome above. Frost
   crust falls off as it is damaged and the core cracks open.
3. **Iron Goliath** (ch23, heavy gunship). A long hull with a ribbed spine, a raised bridge at the nose, gun decks
   with visible barrels, riveted plating with weld lines, engine blocks at the tail with a heat glow. The four
   floating boxes become proper turret pods with mounts and a gold lens, tied to the hull by arms. Gold `#fbcf33`
   accent. Pods are shot off as it is damaged.
4. **Aegis-Null** (ch24, shield engine). A layered core, not an octagon: an inner reactor disc, a ring of
   overlapping shield plates that rotate, radial struts, and the loose shards as segments of the shield that
   visibly detach and orbit. Violet `#8b5cf6` with white-hot centre. Shed plates leave a bare reactor.
5. **Void Stalker** (ch25, predator). A segmented, insect-like hull with a lit maw and an array of pink sensor
   eyes, long dorsal blades, stealth panels with a faint shimmer, a thin pink rim light so it stays readable
   against the near-black Void. It must be clearly visible in a still frame at full health.
6. **Ring Keeper** (ch26, mechanism). A clockwork: three rings of different thickness with gear teeth, bearings
   at the joints, rails and spokes between them, a gold central eye housing, the four turrets as real mounts with
   barrels and a heat sink. The rings turn at different rates (frozen under `reduceMotion`) and a ring cracks per
   stage.
7. **The Warmaster** (ch27, flagship). A hull in sections: armoured prow, a bridge tower with lit windows, banks of
   turrets along both flanks, engine blocks, hostile coral `#fb7185` insignia and banners, hangar doors. Add one
   more detail layer per stage and let the superstructure break away.
8. **The Herald** (ch28, final boss). Judge it first; at the moment it is a white lens with a blue eye. Make it the
   most striking body in the game: a luminous eye in layered petals or shells, an ornate halo, trailing fins or
   tendrils, palette from the hypergate (deep blue, white, gold). Each stage has a new silhouette.

Mini bosses of these chapters (the spider-like walker of Chapter 22 and the others): the same standard, in the
same palette as the boss of their chapter.

## Prompt 2: Space 1 enemies from Chapter 3

Task: bring Space's alien and machine enemies up to the level of its Chapter 1 and 2 military units (jet, tank,
helicopter, gunboat).

File: `space-actor-art.ts` (`drawRegular` and the per-kind painters). Keep `enemyMuzzle`, boxes and timings.
Space 2 reuses some of these painters; Space 2 enemies must not change as a side effect, so check
`space2-enemy-art.ts` and render before and after.

Per kind (w x h today), each with 4 to 8 ink-rimmed parts, a faction accent, idle motion that freezes under
`reduceMotion`, a damage flash and one damage state:
- **gunner** 22x20 (a teal box with a barrel): an armoured walker or hover-tank with a pivoting cannon, treads or
  hover skirts, a sensor lens, exhaust. Keep teal as the faction colour.
- **bomber** 26x16 (a brown capsule): a bomb-bay carrier with a rounded nose, wing stubs, a belly hatch that shows
  a bomb, tail fins, thrusters.
- **splitter** 24x20 (two pink circles): two clearly joined pods with a visible seam and a glowing link, so it reads
  as one thing that will split.
- **zigzag** 16x12 (a green polygon): a twisting dart with a sawtooth body and a trailing spark.
- **turret** 20x14 (a grey T): a gun emplacement with a base ring, a rotating head, a barrel with a muzzle, ammo
  boxes.
- **orbiter** 18x18 (a blue disc, three arms): a gyro drone with a core lens, three articulated arms with lights, a
  faint orbit ring.
- **armor** 32x28 (a grey hexagon): layered plates with a darker inner core, rivets, a single exposed lens.
- **mine** 16x16: a spiked mine with a blinking light and a chain stub.
- **shard** 10x14 and **comet** 12x12: faceted crystal with an inner glow; a comet with a hot head and a particle
  tail.
- **swarm** 10x8, **scout** 16x12, **sniper** 18x12, **diver** 18x12, **fighter** 20x14, **seeker** 14x7: keep
  each readable at its size, but give each a distinct silhouette, so a swarm, a scout and a diver cannot be
  confused.
- **rock** 26x24 and **smallrock** 13x12: facets, a lit side, craters and a dust edge.
- **pod** 18x14 (the same sprite in all eight chapters): give it chapter-specific markings and colours so it is not
  eight copies.
Keep the Chapter 1 and 2 units as they are.

## Prompt 3: game frame, menus and overlays (all three games)

Task: redesign the interface **around** the canvas, not the canvas itself.

Files: `src/components/games/space.tsx` (the React tree after `return`, and the `TouchControls` and `Results`
functions), `src/components/mini-games.tsx` (`MiniGames`, the dock panel), `src/components/arcade.tsx` (the
`playing` section), and `src/app/globals.css` only for a shared utility.

What is wrong today: the game sits in a white card (`bg-white p-1.5`) with a text header (Score, Chapter, Best) and
a row of pills under it; in the arcade (`zakrulOS`, full screen) it is capped at `max-w-2xl`, about 590px of a
1500px screen; the start overlay is a ship preview and two buttons; the pause, chapter clear, ship lost, out of
chances and won overlays are a title plus one or two buttons; `Results` is a plain grid.

Do:
1. A frame that feels like part of the game: dark navy panel, amber accents, the game's type and icon language, a
   header that reads as a HUD strip. In the desktop arcade, show the game as large as the screen allows at 16:9.
2. Overlays with presence: a start screen that introduces the chapter (name, boss, saved score, Continue and New
   game as clear primary and secondary actions); a pause screen with Resume, Retry and Close; chapter clear with
   `Results` as a tidy summary and the bonuses animated in (respect `reduceMotion`); ship lost, out of chances
   and won each with their own tone.
3. The dock panel (`MiniGames`) and the arcade view share one frame component.

Do not break:
- `data-space-overlay` and `data-space-controls` attributes (the keyboard handler uses them).
- The phone layout. In `space.tsx`: `immersive` (a handheld turned on its side), the host element carried to
  `document.body` by `carryHost`, the two rails (score and best, sound, CRT and full screen on the left; pause and
  the bomb and nuke or Kinetic Push on the right) and the stage width
  `min(100vw - 2 * (72px + inset), 100dvh * 16 / 9)`. Keep the canvas and its `moveSurface` in the same place in
  the tree, or the canvas is rebuilt and the run is lost on a rotation. Restyle the rails if you like; keep their
  positions and the 72px they reserve.
- The portrait layout (controls under the game), the desktop controls row for mouse users, and the Malay and
  English labels (`SpaceLabels`). No joystick: a finger dragged across the game is the stick.

Test: `npm run dev`, open the arcade (zakrulOS) as a signed-in player and as a guest, play each game for a minute,
pause, die, clear the first chapter. Check 390 x 844 and 844 x 390 (an iframe of that size with `matchMedia`
overridden so `(pointer: coarse)` is true works). Do not clear a chapter on a real saved account.

## Prompt 4: Space 3 Void backdrop and outer-system enemies

**Void backdrop (Chapter 25).** File: `space3-act2-backdrops-art.ts`, the Chapter 25 painter. It is almost solid
black. Make it the Void: a very dark violet field with three parallax layers (distant faint galaxies and dust
lanes; mid-distance floating fragments of a dead structure, lit only on one edge; near streaks of drifting
particles), a faint pink-magenta rim glow at one edge hinting at the Stalker, and a slow breathing vignette
(static under `reduceMotion`). Keep it darker than the actors; the Void Stalker and every projectile must stay
more visible than anything behind them.

**Outer-system enemies (Chapters 21 to 28).** File: `space3-act2-enemy-art.ts` (`drawOuterEnemy`). The spider-like
mini boss (60x36), the frigate (42x22) and the grey teardrop craft are small flat shapes. Give each 6 to 10
ink-rimmed parts in the outer-machine palette (steel `#a4adb6`, ochre `#bb853e`, ink `#171717`) with one accent:
the walker with jointed legs and a sensor head, the frigate with a bridge, turret blisters and engine glow, the
teardrop with a layered shell and a lit seam.

**Vanguard variety (Chapters 17 to 28).** File: `space3-enemy-art.ts` (`drawVanguard`). Keep the dark core, gold
eye and violet armour, but vary the silhouettes: a carrier with launch bays, a lancer with a long barrel, a
mender with a halo, a heavy with layered plates, a swarm unit with segmented wings. Later chapters' units should be
visibly more advanced than Chapter 17's (more armour, more lit seams) without changing their boxes.

## Prompt 5: Space 2 identity per chapter

Task: give Space 2's enemies an identity for each biome instead of one olive palette.

File: `space2-enemy-art.ts` (`drawSecondEnemy`, `SECOND_ENEMY_TYPES`), with `space2-machine-art.ts` for plates and
housings. Keep every kind, box, muzzle and projectile hook. Replace the unchanged Space 1 `pod` and `shard`, and
the plain `swarm` (a four-point star) and `mine` (a gear), with Space 2 designs.

Per chapter, a palette and material, and one or two signature parts on every enemy of that chapter:
- Ch9 Tidebreaker (sea at sunset): salt-streaked grey hulls, rust at the waterline, a periscope or snorkel.
- Ch10 Mangrove Hydra (jungle): mossy plating, vines and leaves hanging off the hull, camouflage stripes.
- Ch11 Ice Wyvern (snow mountains): frost-covered armour, ice shell on the weapons, white and pale blue.
- Ch12 Dune Maw (desert): sand-scoured ochre metal, a sand skirt, wind-worn paint, dust trail.
- Ch13 Iron Meridian (railway): rail-yard industrial, hazard stripes, rail wheels and pantographs.
- Ch14 Permafrost (arctic): ice-breaker hulls, aurora-lit trim, snow on the top surfaces.
- Ch15 Cyclone (hurricane): storm-battered grey, wet sheen, spinning rotors and rain streaks.
- Ch16 Atlas (city): clean white and steel, banners, tower-top gun mounts.
Idle motion (rotors, fins, lights) freezes under `reduceMotion`; each enemy gets a damage flash and one damage
state. Space and Space 3 must not change.

## Prompt 6: player ship progression and pickups

**Ship levels 4 to 8.** Files: `space-ship-art.ts`, `space-ship-forms-art.ts`, `drawPlayer` in `space-art.ts`.
Levels 1 to 4 visibly grow, then 4 to 8 look the same. Make each level's upgrade show on the body, in the same
flat style, without changing the ship's box or muzzle: level 5 and the hypersonic drive (a longer, brighter
engine flame and a thin shock edge), level 3's mechanical shield (a faint plated arc when it absorbs), level 4's
second launcher (a visible twin pod), level 5's self-repair (small green nodes along the wing), level 8 (a finishing
detail before the HQ hangar of level 9). Keep the Space 3 palette variant and the Echo wing silhouette working
(`space3-echo-art.ts` reuses the player painter).

**Pickups.** File: `drawPickup` in `space-fx-art.ts`. The weapon, life and bomb crates are tiny glyphs in coloured
squares that are hard to tell apart in a busy frame. Redesign each as a distinct silhouette with an ink rim at the
same on-screen size: a weapon crate with the gun's colour and a clear pictogram, a heart that reads as a heart, a
bomb that reads as a bomb, a flame, a katana, with a soft pulse and a faint ring. Keep their boxes.

**Player blaster shot.** The yellow capsule is the most-seen sprite in the game: give it a lit core, a short trail
and a muzzle flash, at the same hit size.

---

## Suggested order

1. Prompt 1 (Space 3 Chapters 21 to 28 bosses).
2. Prompt 2 (Space 1 enemies from Chapter 3).
3. Prompt 3 (frame, menus, overlays).
4. Prompt 4, then 5, then 6.

After each: play it, then commit, so the next prompt starts from a clean tree.
