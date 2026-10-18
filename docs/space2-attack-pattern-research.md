# Space 2: boss attack redesign

Implemented 18 October 2026. Covers all eight chapter bosses and eight mini bosses: 27 main-boss patterns and 16 mini-boss patterns. Display chapters 1–8 map to engine chapters 9–16. This specification supersedes older attack and phase-transition descriptions in the original brief.

## Research and its limits

There is no universally best boss pattern. For this 384×216 flying game, the useful target is a threatening machine whose weapon, target, escape route and recovery the player can understand.

| Source | Evidence | Application here |
| --- | --- | --- |
| [Mike Birkhead: Boss Design](https://www.gamedeveloper.com/design/opinion-boss-design---tips-from-a-combat-designer) | A combat designer's account of anticipation, distinct reads, staging, timing and holds. His suggested timings are experience-based guidance. | Separate body-charge, column, aimed-burst and fan warnings; allow a committed dodge and a counterattack beat. |
| [Michael Molinari: The Anatomy of a Shmup](https://www.gamedeveloper.com/design/the-anatomy-of-a-shmup) | A developer's discussion of bullet readability, escape possibilities and hitbox clarity. | Dark-rimmed projectiles, different silhouettes and persistent openings; avoid unannounced point-blank rings. |
| [Attilio Carotenuto: Designing smart, meaningful SHMUPs](https://www.gamedeveloper.com/design/designing-smart-meaningful-shmups) | Develop a stage theme, use the mid-boss as a milestone, then combine learned ideas in the finale. | Each chapter shares a spatial skill across its mini and main boss, while keeping distinct attacks. |
| [Talakat, Khalifa et al.](https://arxiv.org/abs/1806.04718) | The authors' abstract describes simulation evaluation with a search agent and separate strategy/dexterity dimensions. | Add sampled geometric route searches alongside ordinary combat tests. Our search is not their algorithm and does not establish human difficulty. |

### Metal Slug observation

The [official SNK anniversary site](https://www.snk-corp.co.jp/us/anniversary/metalslug30th/) provides series context; it does not supply boss AI or frame data. Direct visual evidence came from the player's own [Hard Level 8 boss recording, Big Shiee at 14:20–14:35](https://www.youtube.com/watch?v=YvB2M0Ibknk&t=860s). Inspected frames show a large multi-weapon hull and a later raised cannon/open weapon assembly. This supports the visual idea of a machine revealing its arsenal in stages. It does not establish every conditional attack, exact collision box or universal Metal Slug timing. An attempted Iron Nokana seek did not buffer reliably and was excluded from the evidence.

Our adaptation is deliberate: visible weapon ports, internal magazines, heavy committed movement and exposed mechanisms as armour breaks. Metal Slug's on-foot jump/crouch responses cannot be transferred directly to a freely moving aircraft. The timing, bullet speeds and gaps below are original Space 2 tuning, not extracted Metal Slug values.

A second direct check used [Metal Slug 3's Jupiter King at 4:10, 4:23 and 4:36](https://www.youtube.com/watch?v=dLz8DEds8N4&t=250s). The inspected frames show its segmented claw extended into the player area, different extension/body positions, and later visible damage/explosions. This is the concrete reference for giving Atlas a readable physical reaching weapon and a damage progression. Sparse frames establish those poses, not the exact wind-up length, targeting rules or complete attack cycle; Atlas's locked two-dimensional out-and-back fist remains our own implementation.

## Shared combat contract

- Main-boss warnings: 48–82 simulation frames; mini warnings: 54–72. At 60 simulation steps/second these are 0.8–1.4 and 0.9–1.2 seconds respectively.
- Main targets stop following the player 24 frames before activation; minis use 20. Hydra retains its separately tuned 18-frame lock. Fixed patterns declare their geometry from the start.
- Recovery: 40 frames for chapter bosses, 56 for Hydra, 36 for Atlas, 60 for minis. Already-fired ordnance may finish travelling or detonate during recovery; recovery means no new salvo, not immediate immunity.
- Owner-tagged projectiles, beams, charges and hazards are removed before that actor starts its next pattern or a mini exits. Unrelated ordnance and scenery remain intact.
- Phase changes clear active threats and provide a quiet transformation beat. No surprise escorts, mines, falling rocks or rings spawn during the transition. Existing phase-specific armour art and calls remain.
- Cream dashed borders/arrows indicate openings; coral indicates preparation and threat. Cream target marks mean the target has locked, not that it is safe. Marks use geometry as well as colour. Reduced motion preserves all gameplay cues. Dark outlines keep guides visible against snow and dawn.
- A gap between fan trajectories is an angular opening, not a guaranteed safe rectangle across the whole arena. Broadside guides describe the next travelling volley. Ice Wall and Scissor have actual spatial corridors.

Canonical timings live in `src/components/games/space2-attack-patterns.ts`; geometry and emission live in `secondAttack` / `updateMini` in `space-logic.ts`. `space2-pattern-cues.ts` consumes that same attack state.

## Chapter encounters

| Chapter / skill | Mini boss: practice | Chapter boss: test and escalation | Intended response |
| --- | --- | --- | --- |
| 1 Pacific / lanes and bursts | **Skyhook:** three descending rotor mines leave upper air open; Sweep Gun fires three separately marked burst directions. | **Tidebreaker:** rail tracers from its real barrel; staggered geysers omit one column; Broadside fires five volleys from three ports with a gently moving angular opening. | Read a locked lane, move once, then follow the broadside opening without chasing individual bullets. |
| 2 Archipelago / delayed explosives | **Mudskipper:** one committed hop and a small upward splash fan; Net Gun fires a hollow fan around its locked aim. | **Mangrove Hydra:** ballistic deck bombs; internal silo rockets rise before turning once toward frozen targets; Arsenal Salvo combines staggered bombs/rockets outside a fixed horizontal corridor. | Bait the marked location and leave it. Use the declared corridor during the ultimate; countersteer against rain. |
| 3 Himalayas / falling lanes and openings | **Cable Fort:** prepositions above three numbered columns, traverses them and drops icicles from its belly; Chaff has a frozen opening in two slow rings. | **Ice Wyvern:** Avalanche omits one column; Ice Wall forms, holds briefly, then advances with a wide horizontal gap; three prelocked glacier lances burst with an exit sector. | Choose a column, then change to the wall opening; leave airburst centres rather than orbiting into fragments. |
| 4 Sahara / ground danger and body commitment | **Sand Skimmer:** one ground dash then return; two marked mortar shells split into four cardinal fragments. | **Dune Maw:** three marching sandspouts omit a column; Burrow marks its full emerging body; a slow five-arm Pinwheel reverses smoothly around a declared opening. | Stay above the dash, leave the full burrow footprint and use diagonal space around cross mortars. |
| 5 Alps / directional beams | **Tunnel Sentry:** three sequential laser rails from its actual apertures; two outward lattice fans leave central combat space. | **Iron Meridian:** frozen Searchlight aim produces four bursts; one/two runaway cars travel along the ground; a slow vertical beam sweep leaves the opposite edge open. | Move after aim locks; select the safe edge before the sweep starts. |
| 6 Arctic / low water threats and enclosure | **Ice Hunter:** three staggered torpedo lanes from its nose leave upper air open; two prelocked Periscope columns strike in sequence. | **Permafrost:** staggered Icebreak spikes omit a column; one/two angled harpoon chains leave real guns; Polar Vortex forms a 72-px inward ring with an exit facing usable arena space. | Climb above torpedoes and leave through the vortex opening early, accounting for cold engines. |
| 7 Atlantic / fans and weather | **Storm Petrel:** three paired feather fans widen around a central opening; a telegraphed body dive returns without an impact bullet ring. | **Cyclone:** prelocked, numbered lightning columns fire in order; one bounded twister leaves opposite air clear; Maelstrom emits a slow six-arm turbine around a frozen opening. | Follow the fan opening and respect lightning order. Gusts are scheduled during recovery rather than starting over a live pattern. |
| 8 Citadel / final synthesis | **Gatekeeper:** three gate columns omit a safe column; drones guard for only the first 56 live frames, then expose its core. | **Atlas:** vertical Quake pairs, a genuinely aimed out-and-back Rocket Fist, staggered Orbital columns, three gapped Cluster airbursts, Scissor beams with a persistent central corridor, and a six-column March. Late March adds a reverse pass after a breathing beat. | Alternate full-body repositioning with precise corridor movement. Use the exposed mini core and the final boss's recovery beats. |

## Pacing pass (18 October 2026)

A simulation audit against Space 1 found the Space 2 bosses slow and empty: 214–300 frames per attack against Space 1's 100–167, live threats on screen 24–46% of the time against 60–80%, and only two attacks alternating in the first two phases. The waves were the reverse: 3–5.6 enemy shots a second against Space 1's 0.6–2, with the same jets, seekers, swarms and gunboats in every chapter.

- Boss warnings are about 15% shorter and recovery is 40 frames (Hydra 56, Atlas 36).
- Every boss has a third attack, **volley**: two fans of shells (three from the second phase) at the locked height, with a marked opening 0.3 rad to one side, so the ship has to move between the bigger attacks. The opening changes side every two volleys, and volley goes through the same contract and route tests as the other patterns.
- Space 2 enemy fire now eases in from chapter 1 (`DIFFICULTY` 1.6 down to 1), and each chapter script keeps its own signature (fleet, mines, ledge guns, armour, missile grid, splitters, storm jets, walls) with fewer generic air layers. Skyhook and Mudskipper have less health.

## Bullet-pattern pass

The bosses still read as "warning, column, wait" next to Space 1, whose bosses mix shot types and mechanics in five to seven moves a phase. Five Space 2 bullet patterns now sit in every boss's rotation, two to each boss in a shot of its own (`PATTERN_SHOT`; Permafrost's frost shots chill the ship), and Atlas uses all five:

| Pattern | What it does | Tell |
| --- | --- | --- |
| helix | three to five arms of slow shots wheel out of the main gun and turn back halfway | ring at the gun, turning arrows |
| rain | columns fall from the top edge, all but the lane nearest the ship | marked corridor, a down arrow per column |
| tidewall | walls of shots from the right with a gap at the locked height, alternate shots slower so walls shear into layers | marked corridor |
| shatter | shells burst into rings of 10 to 12 at marked spots round the ship | path and ring per spot |
| barrage | four or five shotgun blasts at the locked spot, pellets at mixed speeds | path and ring at the target |

Every ultimate now ends on a fan from the hull, thrown forward only, with an opening toward the ship. Over the seas, enemy shots that dive into the water splash and vanish. Each phase rotates five to nine moves. All five patterns and the ultimates with their ring pass the same contract and sampled route search as the rest (722 Space tests).

## Atlas redesign: the final exam

Atlas was the weakest boss: its own moves were sparse (a quake of six slow shells, three cluster shells, one fist), three of them shared the same four-column grid, and its six phases only reordered the same moves, so the longest fight in the game was the least eventful. The redesign follows published shmup boss advice: the boss is "a summary of what came before", "intensity is not found through force, but through dynamism" (each phase should change how the player dodges), and "the end of the boss battle should be more intense than the beginning" ([Game Developer: video game boss design for shmups](https://www.gamedeveloper.com/design/video-game-boss-design-for-shmups)); Touhou-style named set pieces per phase ([Touhou wiki](https://wiki.maribelhearn.com/wiki/Touhou_6:_Embodiment_of_Scarlet_Devil/Rumia)); and a pattern the player can always survive ([Designing smart, meaningful shmups](https://www.gamedeveloper.com/design/designing-smart-meaningful-shmups)).

| Phase | Theme | Moves | What it tests |
| --- | --- | --- | --- |
| 1 Armour | Atlas itself | quake, rocket fist, barrage, volley, cluster | body attacks |
| 2 Plating cracked | Tidebreaker | tide wall, scissor; the quake now fans and the fist bursts into a ring where it lands | reading gaps |
| 3 Legs buckling | Hydra and Ice Wyvern | rain, shatter, orbital, cluster | choosing lanes |
| 4 Judgement | its set piece | the Judgement grid: every column but one and every lane but one burn at once, one marked safe cell | precision on two axes |
| 5 Core exposed | everything | grid, helix, shatter, tide wall, rain, march | combinations |
| 6 Last stand | all of it | eight heavy moves, no filler, recovery 24 frames | the final test |

Measured: shots a second 4.2, 8.5, 14.4, 5.0 (the Judgement phase hurts with beams and columns, not shots), 12.8, 13.9; threat on screen 38% rising to 60%. Every move is checked in the hardest phase that has it by the same contract and route search, and a direct check confirms the grid leaves the marked cell untouched and hits one column or one lane away.

## Specific unfairness removed

- Edge-baited formations shift together instead of clamping several targets onto the same coordinate.
- Ice lances and lightning do not silently reacquire after their initial warning.
- Burrow, hop and dive warn the body footprint rather than a small decorative reticle.
- Rail/harpoon trajectories originate at visible barrels. Sentry beams use separate pattern ownership so cleanup metadata cannot snap them onto a different muzzle.
- Vortex openings remain inside the arena. Skip lands and settles once. Gatekeeper no longer keeps its guard throughout the whole attack.
- Cluster fragmentation uses a declared orientation/opening, rather than changing its orientation invisibly at detonation.

## Verification and remaining playtest work

At implementation, 532 Space 1/Space 2 tests passed, including 327 pattern tests. The latter include all 43 warning/emission contracts, target-lock stability, ownership cleanup, quiet phase changes, muzzle alignment and 258 isolated route samples: 43 patterns × ship levels 1/10 × starting heights 48/96/160.

The route search forecasts actual ordnance geometry after target lock. It checks the ship hitbox with 4 px extra clearance, uses 8-px cardinal steps over five frames, and bounds countersteering input against chapter weather. It checks both ends of each move throughout that interval. It uses neither bombs nor shields to claim clearance. Forecast invulnerability only keeps the observation dummy alive; the occupancy search still rejects collisions. Samples isolate the encounter, disable the timed gust and offensive upgrades, and do not prove every starting state, attack sequence, Hyperbeam slow-charge state, damaged/frostbitten ship or human reaction path.

All 86 warning/live render samples completed in Edge without page exceptions; desktop chapter sheets and a mobile-scaled sheet were inspected. This is an engine-rendering review, not a complete authenticated campaign playthrough. TypeScript, targeted ESLint and the production build passed. The build reports the existing unrelated `metadataBase` warning.

Next human tuning should assess cue comprehension on touch controls, dangerous back-to-back patterns, accessibility and perceived recovery. Change timing or density based on those observations; passing a search is not evidence that a boss feels fun.
