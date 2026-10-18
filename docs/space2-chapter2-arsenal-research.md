# Space 2 Chapter 2 � Mangrove Hydra arsenal ship

Research and implementation: 18 October 2026. Scope: Space 2 Chapter 2 (engine chapter 10), replacing the three-headed river gunship with an internal bomb and rocket launcher ship.

## Decision

Keep the Mangrove Hydra name, regional setting and original flat Canvas art. Reinterpret the three heads as three protected magazines inside one broad hull. Give this boss an artillery identity: launch preparation, ballistic bombs, vertical rockets, then a mixed salvo with a fixed escape corridor.

The old design's hydraulic necks, lunging heads and weaving orb streams did not communicate a ship that throws bombs. Recolouring those heads would leave that mismatch intact. This change replaces both the visual mechanism and the encounter.

## Research: evidence and adaptation

| Primary source | Observation supported by the source | Application to this game |
| --- | --- | --- |
| [Royal Museums Greenwich: bomb vessel sectional model, SLR0507](https://www.rmg.co.uk/collections/objects/rmgc-object-66468) | The museum describes an elevated mortar, open mortar covers, a mortar bed and a magazine below. | A bomb well belongs inside the hull; split deck covers and internal feeds make its function visible. The game uses a fictional armoured ship, not this historical hull. |
| [Lockheed Martin: MK 41 VLS product card](https://www.lockheedmartin.com/content/dam/lockheed-martin/rms/documents/naval-launchers-and-munitions/MK41_VLS_Vertical_Launching_System_Product%20Card_8.5x11_042419.pdf) | The indexed manufacturer document describes installation below deck and modular launch cells. Full PDF fetch returned 403; only the indexed text was available. | Supports a below-deck modular visual reference. No inaccessible drawing or numerical weapon specification was used. |
| [MBDA: CAMM](https://www.mbda-systems.com/products/force-protection/camm-family/camm) | Manufacturer describes soft vertical launch and compatibility with land and sea environments. | Rockets rise vertically from a hatch, then make a single readable turn. Timing and steering are invented for this game. |
| [MBDA: 3-cell ExLS qualification trials](https://www.mbda-systems.com/camm-completes-qualification-trials-3-cell-exls-launcher) | Documents a compact modular launcher tested with CAMM. | Three separate bays can plausibly read as a coherent compact system. This is a visual analogy, not a replica or claim about an actual ship arrangement. |
| [SNK: Metal Slug property overview](https://www.snk-corp.co.jp/snkproperty/property/g_ms/) | Official screenshots and description establish its military machinery and 2D action art context. | Retain cast plates, bolts, recessed hardware and exaggerated moving covers. All geometry remains original and matches Space's existing flat art; no sprites are copied. |
| [Mike Birkhead: Boss Design � Tips From a Combat Designer](https://www.gamedeveloper.com/design/opinion-boss-design---tips-from-a-combat-designer) | The combat designer discusses anticipation, staging, timing and distinct attack reads. | Bombs use round blast marks and curved guides; rockets use diamond targets and a vertical-then-turn guide. Preparation and recovery are readable states. Warning values below are design choices, not guarantees from the article. |
| [Mike Birkhead: The Art of Boss Design](https://www.gamedeveloper.com/design/tips-from-a-combat-designer-the-art-of-boss-design) | Advocates checking whether the boss's implemented behaviour still communicates its design intent. | Verify hatch origins, real trajectories and safe space in simulation, then inspect actual Canvas renders rather than approving a static concept alone. |

## Alternatives considered

- Three exposed launch heads: recognizable but preserves the old creature silhouette and obstructs the internal-launcher brief.
- Only a modern vertical-launch ship: satisfies rockets but loses the requested heavy bomb-throwing identity.
- **Selected: armoured river arsenal ship with three internal magazines.** Combines bomb wells with vertical rocket cells and keeps one clear mechanical theme.

## Visual specification

The canonical hull is 116 � 62 game units, rendered at 1.3� (150.8 � 80.6). It has a deep sloped bow, layered armour belts, three low deck wells, a compact rear command island, internal ammunition feeds and a waterline wake. Atlas remains larger, especially in height.

Palette is shared with the other revamped machines: ink `#171717`, olive hull `#4d5b3a`, face `#718064`, bevel `#b6bea0`, slate `#64748b`, metal `#aab4b5`, hostile sensor coral `#fb7185`.

The actual simulation and drawing share hatch centres `(20,32)`, `(44,32)` and `(68,32)` in canonical model coordinates. Each uses the same boss transform. Split covers open during preparation, launch puffs follow individual firing clocks, and covers close during recovery. There is no external giant cannon or snake neck.

Phase 2 exposes a magazine feed behind broken armour. Phase 3 exposes additional internals and burning damage. This is visual damage; exposed parts are not separately targetable weak points.

## Encounter specification

All values are game frames at 60 Hz.

| Attack | Warning | Emission window | Behaviour and response |
| --- | --- | --- | --- |
| Deck bombs | 66 (1.10 s) | 74 | Two bombs initially, three in later phases, 24 frames apart. Targets lock 18 frames before firing. Each bomb follows a 64-frame parabola with a 48-unit arc, then waits 18 frames before a 17-unit-radius, 16-frame blast. Move away from the round marker; the flying bomb itself does no contact damage. |
| Silo rockets | 78 (1.30 s) | 70 | Three/four/five rockets by phase, 14 frames apart. They emerge from internal cells, rise for 24 frames, then turn once toward a target fixed before firing. They do not continuously home. Dodge the diamond-marked route. |
| Arsenal salvo | 90 (1.50 s) | 128 | Three bombs and six rockets use alternating magazines. A fixed 50-unit-high corridor is marked in the left combat area; it does not shift toward Nova. Explosions and rockets are kept out of that corridor. |

Bombs and rockets are deliberately distinct from Chapter 1's railshot/geyser/broadside attacks. The old venom, snapjaw and helix attacks are removed. Phase transitions announce magazine exposure instead of a severed head, and no longer release piranha-like swarms.

Bomb markers remain visible through landing and detonation. Rocket warnings distinguish the vertical climb from the subsequent straight attack. Reduced motion freezes cosmetic rotation/drift; meaningful preparation, projectile travel and blast windows remain readable.

Bloom and ORB cover do not absorb the new physical deck rockets, consistent with the existing exclusion for sea missiles. Mini rockets and the player's clearing weapons retain their existing interception rules. Thrown bombs use the charge system and are defused by the existing player bomb/phase cleanup rules.

## Implementation and checks

- `space-logic.ts`: hull size, canonical hatch coordinates, three original attack schedules, ballistic bomb flight, fixed-target rocket turn and phase call.
- `space2-boss-art.ts`: hull, three wells, moving covers, command island and exposed magazines.
- `space2-arsenal-art.ts`: distinct bomb/rocket art, trajectory previews, blast footprints and safe-corridor cues.
- `space2-boss-fx-art.ts`, `space2-actor-art.ts`, `space-boss-fx-art.ts`: render dispatch.
- `space2-story.ts`, `mini-games.tsx`: bilingual dialogue and phase announcement.
- `tests/space2-arsenal.test.mjs`: warning-before-emission, target locking, scaled origins, analytic trajectory, damage window, single rocket turn and safe-corridor coverage for both vertical positions.

Validation: 194 Space/Space 2 tests passed, including 10 dedicated arsenal checks. TypeScript and targeted ESLint passed; the Next.js production build succeeded. Headless Edge rendered preparation, bomb flight, vertical rocket launch, the mixed salvo and all three armour phases with zero page errors. The three reduced-motion armour renders were deterministic. Automated invulnerable end-to-end bots establish reachability and regression coverage; they do not establish human difficulty or accessibility balance.
