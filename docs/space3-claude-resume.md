# Space 3 resume note for Claude

Updated 2026-10-20. Resume from the shared working tree; it contains concurrent, uncommitted Claude and Codex changes. Preserve that work and avoid reset, checkout, or broad formatting operations.

## Codex changes to review

- In `src/components/games/space-logic.ts`, hostile projectiles now remain when a Space 3 boss starts an ultimate. Already launched shots, held missiles, and fused shells continue normally. The deliberate cleanup at HP phase changes and boss defeat remains.
- `tests/space3-projectile-continuity.test.mjs` covers all four Space 3 bosses, the generated regular-enemy roster, fired shots, and the shared mini-boss continuity path.
- The latest art continuation adds `space3-arms-art.ts` for dash/flame/blades boss cues, Space 3 fire and returning-crescent projectile art, drone flame nozzles, and splitter blade launchers. Integration notes are at the end of `docs/space3-art-handoff.md`.
- The Act 2/3 art pass replaces the chapter 5–12 stand-in painters with dedicated backdrops, land, field weather, disasters, enemies, boss/mini-boss bodies and parts, hyper-beams, and hostile projectiles. See `space3-act2-backdrops-art.ts`, `space3-act2-land-art.ts`, `space3-act2-field-art.ts`, `space3-act2-hazard-art.ts`, `space3-act2-enemy-art.ts`, `space3-act2-boss-art.ts`, `space3-act2-projectile-art.ts`, and the `space3-act2-art.ts` barrel. Routing is in `space.tsx`, `space-actor-art.ts`, and `space3-projectile-art.ts`.
- The Act 2/3 art does not change `space-logic.ts`, `space3-act2.ts`, `space3-havoc.ts`, `space3-arms.ts`, or `space3-director.ts`. Boss warnings use the live `corvetTell` state and stay on the machine; early hyper-beam warnings show only at the emitter. `space-actor-art.ts` skips the legacy attack/lock cue layer from engine chapter 21 onward, preventing field-wide rings and lanes from appearing over the new machinery tells. Space 1/2 painter paths remain unchanged.
- Verification on 2026-10-20: `tsc --noEmit`, focused ESLint, `npm test` (988 passing), and a temporary drawing harness covering all eight backdrops and fields, all 16 boss/mini-boss bodies, 336 boss tell combinations, nine enemy bodies, disasters, lands, beams, and 96 projectile variants passed. Headless Chromium reached the portfolio homepage, but this run could not open the Games dock to reach Space 3, so the chapter 5–12 art was not visually inspected in the running game.
- Ordinary shots disappear on land collision without leaving an impact point or an event for the renderer. The land painter therefore cannot show shot-face sparks without a logic/state change; plasma-torpedo explosions remain handled by the existing engine.

## Resume checklist

1. Review the current diff in those files and preserve the surrounding Space 3 work.
2. The final art continuation has passed `tsc --noEmit`, focused ESLint, and `npm test` (988 passing). Re-run them after any further edits.
3. Open Space 3 in the browser and inspect the new dash/flame/blades cues, drone fire, splitter launchers, returning blades, and fused shells. Fix any visual or runtime issues found.
4. Continue the remaining Space 3 work after this handoff. Keep Space 1/2, story text, and music outside scope unless the active task explicitly calls for them.
