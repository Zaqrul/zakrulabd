# Space: Canvas art and encounter redesign

The user's direction is flat, simple Canvas art at the same detail level as the original mini games. Preserve the selected Endymion FRS Mk III silhouette and its articulated ship joints. Canvas geometry is an intentional choice; no generated raster assets or realistic metal rendering.

## Research and decisions

Research checked 16 October 2026. Sources below are the original manual, translated developer interviews, and the author's technical documentation. References inform principles rather than copying complete enemy designs or exact attack patterns.

| Source | Evidence used | Decision for this game |
| --- | --- | --- |
| [Einhänder original manual, pp. 8–13](https://impzone.club/pdf/einhander.pdf) | One equipped pod for Mk III; distinct weapon roles; large enemies have core, weapon and armor units. | Keep one articulated pod, give each gun a distinct silhouette, and make boss emitters and protected cores visible. |
| [Gradius Portable Guide developer interviews](https://shmuplations.com/gpg-gradius/) | Boss design connects weak point, protection and attack. Designers also discuss obscured bullet origins and unfair surprise attacks. | A boss silhouette explains its attacks. All dangerous attacks have a visible wind-up and a recovery window. |
| [R-Type original developer interview](https://shmuplations.com/rtype1/) | Weapons were refined for readability; small movement details react to ship movement. | Flat silhouettes with a few active hinges, readable weapon roles and consistent enemy muzzle positions. |
| [R-Type Delta developer interview](https://shmuplations.com/rtypedelta/) | Difficulty must feel rewarding; console balance needs testing rather than only making enemies harder. | Check complete chapter scripts and every boss phase, plus a real-input survival playtest. |
| [Dodonpachi developer interview](https://shmuplations.com/dodonpachi/) | Bombs serve as emergency relief; density and difficulty were tuned by playtesting. | Retain bomb cancellation and phase-change relief. Avoid stacking every overload pattern at the same time. |
| [Kenta Cho's BulletML reference](https://www.asahi-net.or.jp/~cs8k-cYu/bulletml/bulletml_ref_e.html) | Aim, absolute and sequential directions; waits, repeats and explicit durations. | Use deterministic attack sequences with independent warning, firing and recovery durations. No BulletML runtime dependency. |

## Art specification

- Ink `#171717`, hull slate `#64748b`, pale panels `#e2e8f0`, friendly cobalt `#3b82f6`, friendly gold `#fbcf33`, hostile coral `#fb7185`.
- 0.8 game-unit actor outlines, at most two solid hull tones and one functional accent. Preserve different silhouettes for interceptors, turrets, carriers and organic bosses.
- Hostile shots use a dark rim and pale center so they remain visible over bright land, dark space and solar scenes. Player shots use distinctly shaped gold bolts, orange tracers, lime pellets, cyan laser segments and red-tipped rockets.
- Pickup geometry conveys function: heart, bomb, power chevrons, barrel cluster, fan, lens, rocket and upgrade cross. Color and shape work together.
- Hangar: three depth layers, a working shutter, a launch cradle sized to the complete ship, retracting gantries, engine ignition, countdown, acceleration and clear exit. Cold engines have no flame. Reduced motion suppresses flash and random shake.
- HUD: a quiet dark backing keeps health and weapon information visible above all environments. Background contrast stays below active actors and projectiles.

## Attack specification

Each boss uses `warning -> locked aim -> firing -> recovery`. The final 18 warning frames lock the target. Beam rendering and collision share an owner-mounted emitter. Multi-lane beams come from visible secondary mounts. Phase transitions cancel hostile fire and start with recovery.

| Boss | Identity | Attack sequence |
| --- | --- | --- |
| 1 | Tracked siege machine | Aimed artillery fan, machine-gun burst, then missile rack and low shock shots in later phases. |
| 2 | Naval carrier | Three staggered deck turrets, missile volley, broadside fan and a low bow beam. |
| 3 | Armored crab | Alternating claw fans, paired claw beams and limited scout support. |
| 4 | Bell-and-tentacle organism | Alternating spiral ribbons, marked bell beams and drone support. |
| 5 | Ice serpent | Mouth cone, marked locked-height charge and a cone with a deliberate two-shot gap. |
| 6 | Solar phoenix | Feather fans, marked dive and separate warned solar flares. |
| 7 | Vex's Crimson Fang (ace fighter) | Locked cannon burst, barrier recovery, lance charge, phase blink, boomerang blades and limited drone support. |
| 8 | Split citadel | Shield: salvos and beam. Armor: open missile racks and fan. Core: rotating ribbons and paired beams. Overload: alternating gapped cone, beam and missile volley, with recovery between them. |

Use 32–64 warning frames for dangerous boss attacks and 32–60 recovery frames. Increase pattern complexity across phases before increasing speed. Attacks must not originate off-screen or from empty space. Charging blades use a collision region matching their drawn extent. The final phase must leave traversable gaps rather than relying on damage absorption.

## Verification

Verify every actor type, launch level, boss phase, weapon and pickup in rendered contact sheets. Regression checks cover muzzle alignment, beam warning/live ownership, phase resets, charge locks, gapped patterns, projectile limits and launch clearance. Test desktop and mobile interactions in the real app. Automated pattern simulations supplement human-visible playtests; they do not establish every possible combined encounter is beatable.

Verified implementation:

- 35 automated Space tests pass, including the existing ship/weapon regressions and new encounter regressions.
- All eight chapter scripts reach their corresponding bosses in simulation.
- A movement-search pilot survived 900 frames in each of 25 boss phases without bombs or invulnerability. It uses future simulation, so this is evidence of an available escape route in those runs, not a measurement of human difficulty. Most runs lost no health; the second phoenix phase lost one health point.
- Production render functions were exercised for 32 regular actor types, eight bosses, four final-boss phases, all weapons/pickups and launch frames at all three ship levels.
- Real app flow checked in Chromium: open Space, read the introduction, launch, move with keyboard, drag and use a bomb. Ready states checked at 1440×900, 390×844, 320×568 and 667×375; live play checked on desktop and mobile. No app runtime or relevant console errors were recorded.
- Reduced-motion launch and overload render deterministically, with no launch flash. No raster assets, new packages or production debug routes are required.

| Design comparison | Implementation evidence / correction |
| --- | --- |
| Simple flat art | Actors use solid fills and a shared 0.8-unit outline. The existing articulated Mk III remains the player reference. |
| Visible attack origins | Cannon tips, missile tubes and beam mounts share coordinates with simulation. Crab beams use both claws rather than an empty central origin. |
| Readable attack sequence | Boss bodies stop drifting after aim locks; warning, live fire and recovery are separate intervals. |
| Functional hangar | Shutter clears before countdown; cradle and rail clear the full level-three gunpod. Cold engines have no flame. |
| Phone readability | Pickups use shapes, hostile needles have dark rims, and the HUD has a dark backing. Copy identifies green supply capsules in both languages. |
| Motion restraint | Decorative actor motion can freeze while gameplay cues remain functional. Overload uses opening armor and a visible reactor rather than random screen shake. |

The shared material helpers also retain an optional shaded treatment. `SHADED_ART` is false by default, following the user's original direction: flat fills, restrained detail and simple projectile effects. Switching this internal art constant changes treatment without changing silhouettes, mounts or encounter timing.
