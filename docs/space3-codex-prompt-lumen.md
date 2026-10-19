# Prompt for Codex: Lumen, Space 3's new wingman (art and feel)

Copy everything under the line into Codex, run from the repo root.

---

You are designing the look and feel of **Lumen**, a new character and wingman for Space 3. The behaviour is built and tested; this is an art and feel task.

## Who she is
**Ensign Sera Okoro, callsign Lumen**: a recruit straight from the academy, flying **Zephyr-04, the same ship as Nova's Zephyr-03 (the Endymion)**, armed with a **plasma beam**. She is the new girl on the wing: eager, a little green, brave. Her voice colour in the dialogue is hot pink `#f472b6`. She replaces Kite as the wingman in play; Halo and Kite stay in the story (the relief corridor, the evacuation lane) but not on screen. The story lines are in `src/components/games/space3-story.ts`.

## What she does (so the art says it) — `src/components/games/space3-recruit.ts`
She flies on the ship's wing, below and behind it. She slides up or down to line up the nearest enemy ahead of her (within 150 px) and then fires a **continuous plasma beam** along her lane that burns **everything along its length at once**, a little every frame (a boss a little less). The beam **runs hot**: after about four seconds of firing she overheats and goes cold for about two and a half (a short, fast cooldown if she stops early). In Overdrive the beam does double. She does not shoot bolts, guard, or copy.

## Read first
- `docs/space3-design.md`, `docs/space3-codex-prompt.md` (the Chapter 1 prompt; its rules apply), `docs/space3-art-handoff.md`
- `src/components/games/space3-lumen-art.ts` (my placeholder: the player's ship repainted pink by recolouring `drawPlayer`'s pixels, a plasma emitter on the nose, a flat three-layer beam, a heat bar and smoke), `src/components/games/space-art.ts` (`drawPlayer`, the ship you are reusing), `src/components/games/space3-weapons-art.ts` (`drawEchoWing`)
- `docs/design/retired-kite/` (the earlier Kite escort art, kept for reference; it is not built and you do not need to bring it back)
- `CLAUDE.md` (palette navy `#171717`, amber `#fbcf33`; **all Space 3 copy is English only**)

## Tasks
1. **Her livery on Nova's ship.** The hull is the same as the player's; she is told apart by **paint and small details**, not a new silhouette: a hot-pink and white scheme in place of the player's blue and yellow, a number "04" or a rookie marking, a different canopy tint, a plasma emitter on the nose. The player must be able to tell the two ships apart at a glance at 384x216 even in a crowded fight, and neither must ever be mistaken for the Echo Wing (a cyan afterimage of the player's ship) or for a hostile Vanguard unit (violet and gold). Keep using the real player painter so upgrades, scale and tilt stay in step; improve the recolour (it is a pixel swap in `ship()`), cache it, and keep `reduceMotion` static.
2. **The plasma beam.** `drawLumenWing(ctx, s, reduceMotion)` draws a flat glow, a pink layer and a white core from her nose to the end of her reach (`LUMEN.reach`, 150 px), with a hit spark at the end. Make it feel like plasma: a flickering core, a charged emitter flare on the first frames, small particles streaming along it, a brighter point where it burns an enemy (you can read `s.enemies` for any overlapping the beam, but do not write to state). It must stay readable above every Space 3 backdrop, and **it must never be mistaken for an enemy shot**, so keep it pink and white and avoid coral and violet.
3. **Heat and overheating.** She runs hot (`s.lumen.heat` 0 to `LUMEN.max`, `s.lumen.hot` frames of overheat left, `s.lumen.firing`). Show it on the ship itself (the emitter glowing from pink toward white-hot, heat shimmer near the nose), not only the small bar under her; show the overheat clearly (venting steam, the emitter dark, a flicker) and the moment she is ready again.
4. **Aim.** `s.lumen.aim` is the height she is lining up on, or null. A subtle line or reticle on the target while she slides, so the player sees what she is about to burn.
5. **Her dialogue icon.** The dialogue box shows an icon per speaker (`SPEAKER_ICON` in `space.tsx`; `lumen` uses `TbBolt` now). If another icon from `react-icons/tb` reads better, change that one entry and say why.
6. **A one-page sheet.** In `docs/space3-art-handoff.md` add a short "Lumen" section: how her ship differs from the player's (paint and details), the palette with hex values, the beam's layers, the heat and overheat states, and how she differs from the Echo Wing, Halo's Kite, the Vanguard and Space 2's Kite.

## Rules
- Do not change Space 1 or 2, the rules (`space-logic.ts`, `space3-recruit.ts`), the director, the waves, the story text, or any music file (`space3-music*.ts`, `space3-tunes.ts`, `space3-groove.ts`). Art reads state; it never writes it.
- No new dependencies. Canvas 2D at 384x216 logical pixels. English only for anything the player reads.
- Other art files may have been edited by another pass: read the current file before editing, and merge, do not overwrite.

## Done means
- `npx tsc --noEmit`, `npx eslint` on the files you changed, and `npm test` all pass (872 tests; `tests/space3-recruit.test.mjs` covers the behaviour and must stay green).
- A short summary of what changed and why, the palette, and anything you could not do.
