Task: finish the art for Space 3, Chapter 4 (engine chapter 20, boss `boss20` Armada Reclaimer). Gameplay, tests and music are done; do not change them. Work in the order below, run `npx tsc --noEmit` after each step, and read a file's current contents before editing it (other passes edit the same art files).

Context you can rely on (verified in the code today):
- `src/components/games/space3-environment.ts`: `drawThirdOrbit(ctx, s, reduceMotion)` already dispatches `if (s.chapter === 18) return drawCeres(...)` and `if (s.chapter === 19) return drawEuropa(...)`. There is no branch for 20, so Chapter 4 currently draws the Phobos/Mars scene.
- `src/components/games/space3-industrial-cues.ts`: `drawIndustrialCue(ctx, e, s)` is the model for boss tells (reads `corvetTell(e)` from `space3-boss.ts`: `verb`, `charge` 0..1, `lane`, `aimed`, `ring`; strokes with `rgb(251 113 133 / a)`, `lineWidth` 0.65, dashed lines). Nothing draws cues for `boss20` yet.
- `src/components/games/space3-reclaimer-art.ts`: `drawReclaimer(ctx, e, reduceMotion)` is a placeholder; it is already called from `drawSpaceEnemy` in `space-actor-art.ts`. Coordinates are in an 84x60 box scaled by `e.w/84, e.h/60`.
- `src/components/games/space3-projectile-art.ts`: `drawThirdBullet(ctx, b, s)` handles hostile kinds `pulse | needle | orb | ice | scrap` when `s.res` exists.
- Canvas is 384x216 logical pixels (`W`, `H` from `space-logic`). English only. Hostile shots are coral/violet and are never pink (pink is Lumen). Nothing falls: no ground, no ceiling.

STEP 1. Backdrop (`space3-environment.ts`)
Add `if (s.chapter === 20) return drawKharn(ctx, s, reduceMotion);` beside the 18 and 19 lines, and write `function drawKharn(ctx, s, reduceMotion)` in the same style as `drawCeres`/`drawEuropa` (reuse the file's `noise` and `wrap` helpers; scroll = `reduceMotion ? 0 : s.scroll`).
- Sky: vertical gradient `#070b16` to `#1a1626`, 60 stars as in the other functions.
- Saturn: a circle about 150 px radius, centre near (300, 250) so only its upper-left limb shows; fill gradient `#b79f72` to `#6b5a3e`; the rings as 3 elliptical strokes (`#d9c9a0`, alpha 0.35, 0.22, 0.14) crossing the frame as a thin slanted band.
- Ring dust: 3 depths of small ice chunks, parallax 0.03, 0.07, 0.12 times scroll, alpha 0.12 to 0.3.
- Wrecks: 6 to 8 silhouettes of Kroll's old war fleet at 3 depths (parallax 0.05, 0.09, 0.15): a hull slab, a snapped prow, a broken gun deck with barrels, a hangar ring with its door open. Fill `#2b2830`, rim `#3d3946`, a few old red markings `#7f1d1d` at alpha 0.5. Seed shapes with `noise(i)`.
- Contrast stays below every actor and projectile. Done when: chapters 17, 18, 19 render exactly as before; chapter 20 shows Saturn and the wrecks.

STEP 2. Boss tells (new file `src/components/games/space3-reclaimer-cues.ts`)
Export `drawReclaimerCue(ctx: CanvasRenderingContext2D, e: Enemy, s: State)`; return at once unless `e.type === "boss20"`. First call `drawIndustrialCue(ctx, e, s)` (it already draws `lance`, `pinch`, `sweep`, `lattice`, `debris`, `ring`). Then add, using `corvetTell(e)`:
- `salvo`: 6 small ticks down the boss's left flank (x = e.x - 3, y spread over the hull height) that light one by one as `charge` rises, plus one dashed line from the hull to the ship's centre (`s.p.x + shipSize(s.p.level).w / 2`, `s.p.y + shipSize(s.p.level).h / 2`).
- `minefield`: an expanding dotted ring from the hull centre (radius up to 90 as `charge` rises) and a dotted horizontal sweep line across the left half. Mine positions are not exposed: do not invent them.
- `broadside`: 6 ticks at x = e.x - 6 and y = 24 + row * 34 for row 0..5, all equally bright (the clear row is not exposed: do not mark it).
- `armada`: a ring around the whole hull growing with `charge`, the salvo ticks, the six broadside ticks, and a screen-edge vignette with alpha at most 0.12. Longer and larger than any other tell.
`reduceMotion` is not passed to cues; keep them static apart from `charge`. Hook it in `space-actor-art.ts` right after `drawWyrmCue(ctx, e, s);` and add the import. Never use `e.t % n` for a tell.

STEP 3. Boss body (`space3-reclaimer-art.ts`)
Keep the function signature and the 84x60 box; nothing solid outside it. Improve:
- Phase look by `phase = Math.min(2, e.a)`: 0 two missile racks and an intact hull; 1 four racks and two torn plates; 2 four racks, three torn plates and glowing seams. Seam colour `#fbcf33`, `#fb923c`, `#fb7185` for phases 0, 1, 2.
- Detail: rivet rows, a ladder, running lights `#fbcf33`, old red fleet markings `#b91c1c`, a dark rim `#171717`, hit flash when `e.flash > 0`.
- Keep the existing tells inside the body (racks light for `salvo`/`armada`, deck lights for `broadside`/`armada`, a closing ring for `minefield`). Do not touch `e.x`, `e.y`, `e.hp`.

STEP 4. Projectiles (`space3-projectile-art.ts`, inside `drawThirdBullet`)
- Held missile: `b.kind === "pulse" && (b.hold ?? 0) > 0` while `b.vx === 0 && b.vy === 0`. Draw a salvaged missile about 7x2.2 px (body `#a8a29e`, fins, a dark cold nozzle) pointing along `(b.hvx, b.hvy)`. After launch (`hold` gone, velocity set) draw the same missile along its velocity with a lit coral nozzle.
- Mine: `b.kind === "scrap" && (b.fuse ?? 0) > 0`. Draw a spiked circle of radius `b.r` (8 short spikes), dark body, a core that blinks coral; blink period `Math.max(4, Math.round(b.fuse / 6))` frames using `s.frame`; static when the file's existing code treats reduced motion. Once it bursts the pieces are ordinary `scrap` and keep the existing look.
Neither may be pink, and both must read against the Saturn backdrop.

STEP 5. Enemies (`space3-enemy-art.ts`, `drawVanguard`; chapters 17 and above only)
For `s.chapter === 20`: `rock` and `smallrock` as hull-plate chunks (angular, `#4a4650`, rim `#171717`, an old red mark on some) instead of plain rock; `drone` with salvage clamps; `fighter` as an old Kroll fighter repainted with a violet stripe. Supply pods (`pod`) as repair canisters if `drawVanguard` does not already do it. Space 1 and 2 must render pixel-identical to before.

Rules: do not edit `space-logic.ts`, `space3-boss.ts`, `space3-signature.ts`, `space3-director.ts`, `space3-waves.ts`, `space3-story.ts`, any `space3-music*`/`space3-tunes.ts`/`space3-groove.ts`, or `space3-lumen-art.ts`. Art reads state and never writes it. No new dependencies.

Done when: `npx tsc --noEmit`, `npx eslint` on the files you changed, and `npm test` all pass (915 tests); you rendered each new function once in a throwaway harness (do not commit it) and looked at it; and you report per step what changed and anything you skipped.
