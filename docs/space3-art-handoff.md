# Space 3 art handoff

Space 3 uses the new boss cues, Vanguard actors, hostile projectiles, layered Resonance effects and HUD, Lumen as the active wingman, scenery-only ORB Kite and touch controls. Existing engine, arsenal, director, story and music rules are retained.

## Design

Vanguard technology uses suspended gold irises, separated violet armour and pale steel edges. Sol's blue/yellow Endymion remains recognisable. Friendly effects are cyan/teal, hostile replay shots are violet double barbs, physical hostile pulses are coral diamonds, and area shots are hollow coral rings. Shape supports colour.

Kite is Halo's independent ORB rescue escort: a rounded white cabin behind a broad teal-edged crescent shield, with orange rescue markings. It has its own painter and no Endymion body parts. The player's Echo Wing uses the actual player's silhouette in translucent cyan. The hostile replay remains violet.

## Archived Kite escort pass

Historical implementation only: Aegis was retired by Claude. Its source is in `docs/design/retired-kite/`. The current scenery-only Kite sheet is below; the catching/down states described here are not in use.

**Role and silhouette.** A small rescue cabin sits behind a forward-curved shield plate, pushed by short paired engines. The body is about 16 logical pixels wide, plus short exhaust; the plate follows the actual 8px Aegis catching radius. There is no beak, dorsal blade stack, low wing, gunpod, barrel or muzzle flash. The centre supplied by `drawAegisWing` remains the catching-circle centre. Position, interception and integrity rules are unchanged.

**Palette.** Hull pearl white `#f3f6f1`; shield trim ORB teal `#5eead4`; canopy/engine housing deep teal `#0f766e`; rescue bands and orange badge `#fb923c`; one amber status light `#fbcf33`; dark outline `#171717`. Down-state steel/smoke is muted grey. Teal-white carries forward Space 2 Kite's ORB identity and escort role; the armed dart silhouette and forward gun are replaced with protective geometry. Space 2's painter is unchanged.

**States.** Normal has tiny paired exhausts and a slow shield glint. Catching reads `a.flash`: the plate briefly turns white and a ripple moves across its front. Low integrity, below 30%, breaks a short section of trim and adds local orange sparks, without hiding the whole craft. Down inherits the caller's 25% fade: engines extinguish, hull darkens and smoke rises. In the final second, an amber recovery arc and lamp pulse; the hull stays dim until the engine restores integrity. The existing integrity ring continues to read `a.hp / AEGIS.hp`.

**Separation.** Nova remains blue/yellow Endymion. Echo is Nova's exact silhouette as a translucent cyan alpha mask, using its own bounded cache in `space3-echo-art.ts`. Kite is an opaque white/teal crescent and rounded cabin. Vanguard stays violet/gold, while the hostile replay faces left in violet. Crimson remains free for Vex's Fang; Fang is not designed in this pass.

**Motion and implementation.** All decoration freezes under reduced motion: idle glint, exhaust flutter, sparks and smoke become steady cues; the return pulse becomes a steady amber signal. Hit and integrity feedback still follow the engine's state. `drawThirdKite(ctx, state, x, y, reduceMotion)` keeps its signature and never calls `drawPlayer` or writes gameplay state. Only Echo uses the player painter.

Phobos Run now has its own orbital backdrop: a large curved Mars, rocky surface features, irregular Phobos, distant navigation buoys and broken sensor trusses. Background contrast stays below actors and projectiles. `space-art.ts` routes chapters 17+ to `drawThirdOrbit`; the chapters 1–16 branches are unchanged.

## Files ready

| Surface | File / entry point | State |
| --- | --- | --- |
| Ghost Corvet | `space3-boss-art.ts`: `drawCorvet` | Existing entry point preserved. Three visible phases, pale cloak contour, scan shimmer, hit response and gold eye. Reads Claude's new `corvetTell`, not the obsolete fixed fan/ring clocks. Cloak remains cosmetic. |
| Director cues | Same file: `drawCorvetCue(ctx, enemy, state)` | Separate export. Describes lance direction, pinch emitters, approaching wall edge and ring origin using the exposed tell. It does not invent a safe corridor width. |
| Hostile ghost, Phase Shift, Barrier, graze, reflection and Overdrive | `space3-hud-art.ts`: `drawResonanceEffects` | Renderer-owned observation caches; no gameplay state writes. Hostile ghost appears during the director's Echo attack, faces left and brightens around replay fire. |
| Resonance meter | Same file: `drawResonanceHUD` | Bottom-left strip with segmented fill, percentage, full-meter cue, Overdrive timer and two cooldown icons. Reduced motion keeps static cues. |
| Existing HUD compatibility | Same file: `drawResonance` | Calls both effects and HUD so the existing engine entry point continues to show effects until integration. |
| Hostile projectiles | `space3-projectile-art.ts`: `drawThirdBullet(ctx, bullet, state)` | Separate export, handles hostile `pulse`, `needle`, `orb` in Space 3 only. Friendly reflected bullets fall through to the friendly renderer. |
| Vanguard enemies | `space3-enemy-art.ts`: `drawVanguard(ctx, enemy, state, reduceMotion)` | Separate export, supports flying combat units; preserves muzzles via `enemyMuzzle`. Supply pods and scenery fall through. Returns false in chapters 1–16. |
| Touch abilities | `space3-touch-controls.tsx`: `Space3TouchControls` | Separate React component for Phase Shift, Barrier and Overdrive. Receives status and three callbacks. Shows readiness/cooldowns and disables unavailable actions. Pointer activation and keyboard activation each dispatch once. |
| Aegis Kite | `space3-kite-art.ts`: `drawThirdKite(ctx, state, centreX, centreY, reduceMotion)` | Original ORB rescue-craft geometry. Reads integrity, hit and down state. Coordinates are supplied by the caller; it does not spawn or control a wingman. Chapters 1–16 are excluded. |
| Echo Wing | `space3-echo-art.ts`: `drawThirdEcho` through `drawEchoWing` | The player's actual silhouette, tinted cyan and translucent. Its cache and painter are independent of Kite. |

## Integrated behaviour

1. `space-actor-art.ts` routes Space 3 regular actors to `drawVanguard` and adds the Ghost Corvet's director cues. Other campaigns fall through to their existing painters.
2. `space.tsx` tries `drawThirdBullet` before the existing projectile painters. It returns false outside Space 3.
3. The allied wing and Resonance world effects are painted before projectiles/player. The instrument strip is painted later using `drawResonanceHUD`; effects are not drawn twice.
4. `Space3FlightControls` renders the abilities plus Lance only on touch devices in campaign 3. It polls a small status snapshot at 10 Hz. Phase/Barrier/Overdrive taps are queued for one simulation step and cleared on pause, scene transitions, restart, blur and unmount. Lance uses the existing Bomb input queue and the existing 35-Resonance cost.
5. Portrait controls sit below the canvas; landscape controls sit beside a fitted canvas. Neither covers the bottom-left meter or live projectile lanes. Other campaigns keep their existing controls.
6. Aegis Kite uses `drawThirdKite` at `s.aegis`'s position and protects the player through Claude's Aegis rules. Echo Wing is separately painted at its existing replay position using `drawThirdEcho`; its replay delay, friendly shots and damage remain unchanged. The hostile ghost remains mirrored violet.
7. The ready screen starts with the correct Phobos Run label. Space 3 uses English labels even on the Malay site. Desktop displays Lance instead of the obsolete Bomb/Nuke counters. Barrier and Overdrive activation notices use their correct names and a small steady readout.

The shared `touch-controls.tsx` and `joystick-math.ts` are unchanged. No music, story, simulation rules or database changes were made by Codex.

## Verification of the isolated pieces

Production Canvas functions were rendered in a temporary browser harness at the 384 × 216 logical resolution. The check covered all three Corvet phases with and without cloak, ghost replay, partial/full Resonance, cooldowns, Phase Shift, Barrier reflection, graze sparks, Overdrive, all three hostile shot shapes and 12 regular Vanguard types. Repeated reduced-motion samples matched, and rendering did not change the serialised game state.

Before/after render samples for chapters 1–16 matched. This checks those sampled scenes, not every possible encounter. The production React touch component was tested in isolation with the app's compiled CSS: pointer, keyboard Enter, a mobile tap at 320px, disabled states and no duplicate callbacks. Minimum sampled target size was approximately 95 × 55 CSS pixels; no horizontal overflow or browser runtime errors were observed.

The ORB Kite redesign was rendered in six states: full integrity, catching, low integrity, down, returning and half-integrity recovery. Each state produced a distinct image. Serialised gameplay state was unchanged by drawing, and low-integrity reduced-motion renders matched across different frame clocks. Nova, cyan Echo and ORB Kite were rendered together for silhouette comparison. TypeScript, focused ESLint and all 870 tests passed, including the Aegis tests.

Integration checks: TypeScript, focused ESLint and the final full suite of 861 tests passed. Actual browser flow covered opening Space 3, reading its intro, launch, keyboard movement, Phase Shift, Barrier, controlled full-meter Overdrive and Lance, and pause/resume. A separate 320px touch session exercised ability activation and cooldown feedback, disabled states, pause/resume and full-meter Overdrive. A two-finger check verified simultaneous joystick movement and Phase Shift; holding the ability finger did not repeat it. Landscape checks at 844 × 390 and 667 × 375 verified that controls were visible and unobstructed. Controlled meter fixtures were used for Overdrive/Lance checks; they are not evidence of natural charge pacing.

Browser validation used Playwright because the Browser plugin was not available. The local app at `http://localhost:3000` and its `/ms` route rendered meaningful content without a framework error overlay. Space 3 labels stayed English on the Malay route, and the Space 1/2 menus retained their controls. No game runtime errors were observed. The site emits an existing browser diagnostic about `upgrade-insecure-requests` in a report-only CSP; this was recorded separately from game errors and left unchanged.

## Tuning

No constants were changed. The old prompt's fixed fan/ring intervals no longer describe the adaptive director, so they should not be tuned from the old handoff. See the `Tuning` section in `space3-chapter1-plan.md` for three automated natural-state attempts and their limits.

A human difficulty pass remains useful: the automated pilot prioritises safety and does not measure human challenge or enjoyment. The recorded pilot attempts predate the Aegis escort and do not establish the difficulty of the current build. Later chapter environments still need their own art direction; this pass establishes the Phobos visual language.

## Kite

**Role and silhouette.** Halo's ORB escort is scenery only. `space3-kite-cameo.ts` exports `drawKiteCameo(ctx, x, y, t, reduceMotion)`, without state, Aegis, collision or weapons. A blunt rounded rescue cabin sits behind a broad forward-curved plate, pushed by short paired engines. Width including steady exhaust is about 18 px. No beak, dorsal blades, low wings or gunpods.

**Palette.** Pearl hull `#f3f6f1`, ORB teal `#5eead4`, deep teal canopy/engines `#0f766e`, orange rescue bands/cross `#fb923c`, one amber lamp `#fbcf33`, dark rim `#171717`.

**Kept and changed.** Adapted the cabin, crescent plate, paired engines and rescue livery from `docs/design/retired-kite/space3-kite-art.ts.txt`. Removed catching flashes, integrity rings, low-health sparks, down/recovery states and Aegis imports. Only tiny exhaust variation remains; reduced motion freezes it. Ceres has two escorts and three far-lane white/orange transports; Europa has one relief escort along the ice limb. Environments apply 30-34% opacity and gentle drift, behind gameplay actors and shots.

**Separation.** Nova is blue/yellow Endymion; Lumen has the same hull in pink/white and fires pink plasma; Echo is Nova's translucent cyan silhouette. Kite is a compact white/teal rescue crescent, Vanguard is violet/gold, and Fang is crimson with scrap patches. Space 2 Kite keeps its armed dart and gameplay; its painter is unchanged.

## Chapters 2 and 3: Ceres and Europa

Neither chapter had its own environment on inspection. `drawThirdOrbit` now dispatches engine chapter 18 to Ceres and 19 to Europa. Its original Phobos body remains unchanged for 17. Earlier campaigns retain their existing branches.

- **Ceres:** layered orbiting ore, broken station ring, diagonal crane frames, magnetic bridges, distant sun and ORB evacuation convoy. No floor or ceiling. Excavator-X is an ochre deep-core rig with faceted drill, drive collars, ore hopper, cab and hazard bands. Phase one loses a panel and deploys a third barrel; phase two exposes piston banks and hot seams. Drill rotation accelerates with actual charge; reduced motion freezes it.
- **Europa:** corner-filling banded Jupiter/storm, curved fractured ice limb, disconnected diagonal crevasse ridges, vapour and faint magnetic arcs. Wyrm has metal vertebrae under angular ice slabs, hinged fangs and an opening throat. Seams change cold blue to amber to coral; final phase loses alternating slabs. Solid geometry stays in the real rectangle, including sway and jaws.
- **Warnings:** `drawExcavatorCue` and `drawWyrmCue` share `space3-industrial-cues.ts`, hooked next to Corvet's cues. Drill/debris/lance/pinch/chain/ring/wall/echo warnings read `corvetTell`; Wyrm shards light head-to-tail in its body painter. Sweep/lattice mark the right edge without claiming a safe corridor. Claude added signatures during this pass: train gets lane/cart marks; charge gets bursting-charge origins; quake/breach get concentric origins; fang marks the maw without false predictive aim; snap/surge use threat brackets; coil marks the right edge. No hidden gap width, radius or lead vector is invented.
- **Projectiles:** chapter 18 scrap is rough ore-brown rock sized from `b.r`, coral-edged; fused charges have a small lit core. Other chapters retain their violet hull scrap. Space 3 ice is a velocity-oriented pale crystal with a coral rim. Lumen's pink beam and player shots retain their painters.
- **Units:** mining rocks, drill-nose shards, winged ore bombers and split-seam rig units; frost mines, comets and snipers. Pods are white/teal repair canisters with orange crosses. New interception has a chapter >=17 guard.
- **Fang study:** `space3-fang-art.ts` exports `drawFang(ctx, x, y, s, reduceMotion)` but is not imported into gameplay. Vex retains forward mandibles, now allied-facing, crimson plates, mismatched steel patches, cream ace markings and a narrow rail channel. See the movement proposal in `space3-chapter1-plan.md`.

**Validation scope.** Browser plugin not available; Playwright used the existing local app. Render fixtures cover all phases, hitbox bounds, no state writes, reduced-motion stability and cues. All 16 earlier chapter images match the pre-existing baseline. Arcade checks use an in-memory chapter selector after normal launch, without account changes. The separate tuning simulations and their limits are recorded in the chapter plan. This pass did not change rules, HP, waves, music, story or Lumen art. Claude is still editing gameplay, so repeat whole-repo validation after his handoff. The older Aegis/file-list/tuning notes above describe earlier passes.

Latest validation snapshot: TypeScript and focused ESLint passed; `npm test` passed 898/898 after Claude's concurrent test updates. Playwright exercised 23 warning fixtures, six distinct phase renders, reduced-motion stability, state immutability and solid boss bounds. The 16 earlier-chapter image fixtures matched their prior baseline exactly. Two controlled arcade checks per new chapter verified movement and Phase Shift after completing the normal intro, with no page runtime errors; a 390px viewport was inspected as well. QA-only chapter replacement leaves the React header at Chapter 1, so that header in screenshots is not evidence of normal campaign progression. Full natural-state completions were the separate accelerated simulations recorded in the plan. Re-run final checks after Claude finishes gameplay edits.

## Wyrm scale and menace revision

Requested after the first Ceres/Europa pass: Abyssal Wyrm looked too small and mild. The actual body now measures **156 x 64** instead of 120 x 34 (30% wider, 88% taller). `WYRM.w/h` is the only simulation configuration changed; the engine derives spawn size, home position, movement bounds, muzzle centre and collision rectangle from those dimensions. HP 900, movement speed, damage, director and attacks are unchanged by this revision.

The painter uses the full body: a broad armoured skull with angular coral slit eyes, crown horns, long scissor fangs, a black throat and a recessed reactor aligned with the real left-centre muzzle. Swept rib blades, linked reactor vertebrae and a tail lance give a heavy predatory outline. Ice breaks off to expose mechanical ribs while retaining body mass in phase three. Cold/amber/coral phase seams, sequential shards, charge-open jaws and surge illumination remain driven by `corvetTell`. Reduced motion freezes idle articulation; hit flash remains. Every solid extremity stays inside the body rectangle.

See [before/after phase comparison](design/space3-wyrm-enhancement.png). Automated browser checks verify bounds, reduced motion, state immutability, unchanged earlier-chapter images and actual arcade rendering. Three additional natural-state automated runs cleared every phase: seeds 628830735, 649715336 and 350658926; boss times 97, 104 and 94 seconds, ending HP 85, 100 and 100. Larger hit area may improve friendly shot uptime, so these are not directly comparable to earlier runs while Claude was editing gameplay. Human difficulty remains unassessed.

TypeScript and focused lint passed. Whole-suite snapshot: 896/898 passed; the two failures were Phobos composition assertions in `tests/space3-music.test.mjs`. Music and its tests were not edited in this revision; Claude is still working concurrently. All gameplay/boss tests passed.

## All-boss scale and projectile review

Reviewed the three built Space 3 bosses, keeping their silhouettes distinct:

| Boss | Previous body | Current body | Visual emphasis |
| --- | --- | --- | --- |
| Ghost Corvet | 64 x 30 | 98 x 48 | Suspended recording iris, aperture blades, coral pupil, separated violet armour |
| Excavator-X | 92 x 54 | 126 x 72 | Heavy shoulder blocks, heat sinks, cutting collar and drill nose |
| Abyssal Wyrm | 156 x 64 | 156 x 64 | Retains the larger skull, scissor fangs and reactor ribs from the previous revision |

Body dimensions feed the existing spawn, home, movement and collision calculations. All three retain HP, movement speeds, attack timing, projectile counts and trajectories. Corvet now has state-driven scan, playback, pincer and recall warnings in addition to its original cues; replay traces read the real trail rather than a guessed timer.

**Projectile size.** `BOSS_SHOT_SCALE = 1.15` and `bossShotRadius` in `space3-boss.ts` enlarge emitted boss rounds by up to 15%. The minimal engine hooks cover director rounds, hostile Echo replays and Space 3 charge fragments. Small rounds stop at Barrier's existing radius-3 threshold so a formerly reflectable shot stays reflectable. Heavy rounds remain heavy. Spawned bullets carry the enlarged radius used by collision and rendering; painters never enlarge the hitbox themselves. Regular enemy primary shots, player shots and Space 1/2 sizes are unchanged. Space 3 scrap now consistently uses a radius-sized rough polygon: brown ore in Ceres, violet hull plates elsewhere, with the coral hostile rim.

[All bosses and phases](design/space3-all-bosses.png) and [projectile size comparison](design/space3-boss-projectiles.png).

**Validation.** TypeScript, focused lint and 903/903 tests passed, including five new tests for actual boss spawn size, arena bounds, first-signature shot radii, Barrier classification and Space 1/2 fragment preservation. Render checks cover all nine phase silhouettes, 54 body poses including damage flashes, reduced motion and state immutability. Browser plugin not available: Playwright checks the actual local arcade after normal intro/launch with controlled boss selection, plus a mobile viewport. Controlled selection leaves the React chapter header at Chapter 1 and is not normal campaign progression evidence.

Nine fresh automated natural-state simulation attempts (three per chapter) cleared all phases. Corvet boss times 94/95/99 s, hits 0/1/3; Excavator 96/104/87 s, hits 4/0/3; Wyrm 99/98/98 s, hits 4/5/5. Lowest Wyrm end HP was 33.946. These runs show the conservative pilot can still clear, not that every pattern is avoidable or that human difficulty is settled. No further balance constants changed.

## Chapter 4: Kharn Anomaly / Armada Reclaimer

Completed the five steps in `space3-codex-prompt-ch4-specific.md`. No Chapter 20 backdrop or external Reclaimer cues existed on inspection.

1. **Kharn orbit:** `drawThirdOrbit` dispatches chapter 20 to the new private `drawKharn`. A dark vertical sky, 60 stars, dim Saturn limb and three slanted ring strokes (alpha 0.35/0.22/0.14) sit behind three dust depths and eight seeded wreck silhouettes. Hull slabs, snapped prows, gun decks and open hangar frames carry old red fleet marks. Parallax uses the requested dust 0.03/0.07/0.12 and wreck 0.05/0.09/0.15 rates; reduced motion freezes scrolling. No floor or ceiling. The other backdrop branches were retained.
2. **Reclaimer cues:** new `drawReclaimerCue` in `space3-reclaimer-cues.ts`, called immediately after `drawWyrmCue`. It first delegates shared verbs to `drawIndustrialCue`. Salvo illuminates six flank ticks and an aim line; minefield uses an expanding dotted origin ring and left-half sweep; broadside marks all six row heights equally. Armada combines flank/row marks, a larger hull ring and an edge vignette capped at alpha 0.12. It never invents a mine location or reveals the unexposed clear row. All cues read `corvetTell`, not a guessed clock.
3. **Reclaimer body:** same signature and 84x60 body, with rivets, an external ladder, bridge glazing, red Kroll markings, running lights, missile magazines and a cannon gallery. Two racks in phase zero become four in later phases; two torn panels expose trusses in phase one, three in phase two. Seams progress amber `#fbcf33` to orange `#fb923c` to coral `#fb7185`. Existing rack/deck charge lights and mine closing ring are retained; hit flash covers the hull. Solid parts remain inside the real body.
4. **Ordnance:** Chapter 20 held pulse rounds with saved launch velocity now look like small salvaged missiles. Stationary rounds use `(hvx,hvy)` for heading and a dark nozzle; released rounds use their velocity and a coral exhaust. Fused scrap mines have eight short spikes, dark shells and coral cores that blink faster as the fuse shrinks. Optional `reduceMotion` was added to `drawThirdBullet` and forwarded by the existing render call; mines stay steadily lit under reduced motion. Other chapters retain their existing projectile rendering, and spent mine fragments are ordinary scrap. No pink and no new gameplay state.
5. **Salvage roster:** Chapter 20 only gets angular grey hull-plate rocks with red marks, drones with metal recovery clamps, and old Kroll fighters repainted with violet stripes. Repair-canister pods already existed and were kept, rather than redrawn.

[Kharn and Reclaimer phases](design/space3-ch4-art.png) � [Salvage roster and ordnance](design/space3-ch4-ordnance.png).

**Validation:** TypeScript passed after each of the five steps; focused ESLint and all 916 tests passed. A throwaway Playwright harness rendered `drawKharn` through the public backdrop, `drawReclaimerCue` and its four new tell families, all three body phases, missile/mine states and each roster variant; its screenshots were inspected. All 19 earlier chapter render fixtures matched a fresh pre-edit baseline pixel-for-pixel. Harness checks also cover state immutability, body bounds, stable reduced-motion body/backdrop/mine rendering, different held/launched missiles and fuse blinking. The real localhost arcade was opened through normal intro/launch, then used an in-memory chapter-20 fixture: production rendering showed Reclaimer and six actual held missiles without runtime errors. A 390px viewport was inspected. The QA selector does not update the React chapter header and is not evidence of natural campaign progression. The Browser plugin was unavailable, so ordinary Playwright was used. Harness scripts remain outside the repo.

No logic, boss definitions, director, signatures, waves, story, music or Lumen-art files were edited by this pass. No gameplay tuning or human difficulty judgement was performed. Only the already-complete repair pod task was skipped.


## Added weapon art for the Space 3 boss arsenal

`space3-arms-art.ts` adds warning shapes for the boss `dash`, `flame` and `blades` attacks. Each reads the active verb, charge and lane from `corvetTell`; the dash marks its committed lane, flame opens a restrained lane cone, and blades light launch ports without revealing hidden shot counts or paths. The cue is hooked into `drawSpaceEnemy` after the chapter-specific cues.

`drawThirdBullet` now paints Space 3 flame jets and returning crescent blades directly, and treats every fused scrap shell as live ordnance while its fuse runs. Reduced motion freezes blade rotation and keeps fuse lamps steady. Vanguard drones show a dedicated flame nozzle that lights while their own fire is active; Chapter 18 splitters now show paired crescent launchers that brighten as their firing cooldown ends. These are art-only reads of current simulation state.

This continuation was not separately playtested in the browser.
