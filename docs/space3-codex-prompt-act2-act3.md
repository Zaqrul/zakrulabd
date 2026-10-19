# Codex prompt: Space 3 chapters 5 to 12 (Acts 2 and 3) art

Paste everything below this line into Codex.

---

You are designing the art for Space 3 ("The Outer Gate") chapters 5 to 12 of the zakrulabd portfolio shooter. The game logic is finished and playable with stand-in shapes. Your job is to replace the stand-in art with finished art. Do not change game logic, hitboxes, timings or numbers in `space-logic.ts`, `space3-act2.ts`, `space3-havoc.ts`, `space3-arms.ts` or `space3-director.ts`. If you need a value the art cannot read, say so in your summary instead of changing logic.

## Ground rules

- Canvas 384×216, drawn with Canvas 2D in TypeScript, no image assets. Match the existing Space 3 painters (`space3-reclaimer-art.ts`, `space3-boss-art.ts`, `space3-wyrm-art.ts`) for style.
- Outline every actor and projectile with 0.8px ink `#171717`. Threat colour coral `#fb7185`, charge or warning cream `#fff1c9` and amber `#fbcf33`. Keep a bright core on every enemy shot so it reads on every background.
- **No UI guides.** No dashed lines, warning boxes, target reticles, arrows or "safe zone" marks over the field (see `docs/space-boss-attack-enhancements.md`). Every warning must be the machine itself: barrels lifting or recoiling, a muzzle or core glowing, exhaust smoke, armour plates opening, a hull shaking or shimmering. The player reads the machine, not an overlay.
- Bosses attack from every side and leave no safe corner. Do not soften this in art. Never add anything that suggests a safe lane.
- Everything solid must sit inside its hitbox (`e.x, e.y, e.w, e.h`; parts use `modBox(e, m)`). Glow and smoke may spill out.
- Respect `reduceMotion`: replace pulsing and flicker with steady states.
- Put new painters in new files named `space3-<thing>-art.ts`. Wire them in where the stand-in is drawn today (listed under each section) and remove the stand-in branch once yours covers it.

## Where things are drawn today

- `src/components/games/space3-act2-art.ts`: all stand-in art for chapters 5 to 12.
  - `drawOuterActor(ctx, e, s, reduceMotion)`: bosses `boss21`–`boss28`, mini bosses `mini21`–`mini28`, and the enemies `lancer`, `magnet`, `frigate`, `hangar`, `shade`. Called first in `drawSpaceEnemy` (`space-actor-art.ts`).
  - `drawLands(ctx, s)`: the floating land (`s.lands`), drawn before beams in `space.tsx`.
  - `drawOuterField(ctx, s, reduceMotion)`: the field weather overlay, drawn after enemies in `space.tsx`.
  - `drawOuterBackdrop(ctx, s, reduceMotion)`: backdrops, routed from `drawThirdOrbit` in `space3-environment.ts`.
- What an attack looks like while it winds up comes from `corvetTell(e)` in `space3-boss.ts`: `verb` (the attack), `charge` (0 to 1 during the wind-up), `lane`. Every boss and mini boss of chapters 5 to 12 uses it.

## 1. Backdrops (eight)

One painter per chapter, with no ground plane unless the chapter has one. Large slow silhouettes give scale; keep detail behind the actors.

| Engine chapter | Chapter | Setting | Must show |
|---|---|---|---|
| 21 | 5 Uranian Magnetic Shear | Uranus' cyan-green gas, thin dust rings, vertical lightning far away | Magnetic aurora ribbons, sheet lightning in the clouds |
| 22 | 6 Triton Geysers | Neptune's moon, black nitrogen geysers, Neptune huge and blue behind | A dark crater floor band at the bottom (the floor land sits on it), distant plumes |
| 23 | 7 The Kuiper Graveyard | Near-black edge of the system, frozen comet debris, ancient sensor stations | Faint stations, drifting ice in parallax |
| 24 | 8 The Heliopause Threshold | Where solar wind meets interstellar space; purple cosmic nebula starting to show | The wind as streaks of light, the nebula glow |
| 25 | 9 The Oort Cloud Abyss | No sunlight; giant comets; artificial beacon lights | Almost black. Beacons blink. The field is dark (see section 3) |
| 26 | 10 Derelict Megastructure | Inside a ring thousands of km across, millions of years old | The ring's inner wall curving away, ribs and conduits; a trench feel |
| 27 | 11 Flagship Breach: The Aethelgard | Flying along a 15 km dreadnought's hull | Turret towers, plasma shields, hangar mouths scrolling past |
| 28 | 12 The Hypergate Horizon | The Supergate at the edge of interstellar space, blue-white singularity light | The gate ring on the right, light bending around it |

## 2. Floating land and terrain (`s.lands`)

Land is solid: it stops every shot (both sides), blocks the ship, and crushes it against the rear edge. Each piece is `{ kind, x, y, w, h, vx }`. Draw it exactly inside that box.

- `ice`: Triton crater floor ridges (chapter 22, long and low along the bottom) and Kuiper ice floes (chapter 23, floating islands). Frosted top edge, cracks, a faint cold rim light.
- `rock`: Oort cloud chunks (chapter 25), dark and only rim-lit by the ship's light.
- `hull`: megastructure walls (chapter 26, slabs from the top and the bottom with a gap between) and Aethelgard armour plates (chapter 27). Panel lines, rivets, warning stripes, a dead conduit.
- `crystal`: shards near the Heliopause and the Hypergate (chapters 24 and 28). Translucent, refracting the backdrop.

A shot that hits land should spark on its face. A plasma torpedo hitting land explodes (already handled).

## 3. Field weather overlay (`drawOuterField`)

| Field | Chapter | What it does in play | What to draw |
|---|---|---|---|
| magnetic | 21 | Homing fire spins loose | Aurora ribbons across the field; enemy homing shots wobble visibly |
| frost | 22 | The cold near the floor slows the ship | Cold mist hugging the floor; frost forming on the ship when it is low |
| drift | 23 | Ice floats through | Fine ice dust in parallax |
| wind | 24 | Solar wind pushes the ship back | Streaks of light blowing right to left |
| dark | 25 | Only what is lit can be seen | Darkness everywhere except a pool of light around the ship and Lumen's beam; enemy shots keep their glow |
| trench | 26 | Walls above and below | Light from the trench walls, dust falling off them |
| hull | 27 | Flagship plating | Heat shimmer from the hull, sparks |
| gravity | 28 | Every enemy shot bends toward the middle; surges drag the ship | Space visibly warping toward the gate; during a surge (`s.pull`), a lensing ring at `s.pull.x, s.pull.y` |

## 4. Disasters

These are already in play. Draw them as the event itself, never as a marker.

- Lightning (chapters 21, 24, 27, 28): `strike` hazards, style 0. A crackling charge gathering between clouds before the bolt, then a full-height bolt.
- Geysers (chapter 22): `strike` hazards, style 1, from the floor up to 120px. The vent bubbling and frosting before it erupts, then a black nitrogen column.
- Comets (chapters 22, 23, 25, 28): `comet` enemies flying at the ship from the right and the top right. Bright heads, long tails.
- Solar flare (chapters 24, 26, 27): five `strike` columns sweeping right to left. A wall of plasma light.
- Mine burst (chapters 23, 25): `mine` enemies appearing around the ship. In the dark (chapter 25) they must be lit only by their own blink.
- Laser grid (chapters 26, 27): six horizontal beams from `x0 = W`. Emitters on the right edge charging.
- Gravity surge (chapters 21, 28): `s.pull`. The ship is dragged to a point; draw the warp.

Callouts already exist: `storm` ("DISASTER INCOMING!"), `surge`, `stage`, `trueform`.

## 5. The outer system's enemies

| Type | Box (w×h) | What it does | Tells to draw |
|---|---|---|---|
| `lancer` | 24×14 | Takes a place, tracks the ship's lane, then fires a **hyper beam** down it (beam warns 46 frames, burns 30) | A long barrel; while `e.d > 0` it is charging: the barrel tip gathers light, vents open, the hull locks still |
| `magnet` | 18×18 | Drifts and drags the ship toward itself within 130px | A coil sphere with a field visibly pulling; stronger glow when the ship is close |
| `frigate` | 42×22 | Lobs frost shells that burst into ice | Mortar tubes that lift and recoil, frost venting |
| `hangar` | 38×26 | Parks and launches drones every 140 frames | Bay doors that open before each launch |
| `shade` | 14×10 | Weaves in fast, hard to see, fires at the ship | Mostly invisible: a heat shimmer and a pink eye; solid only for a frame when it fires |

## 6. Hyper beams

Hyper beams come from lancers, from bosses' `hyper` attack (one, two or three beams from the boss's guns) and from Ring Keeper's nodes and Warmaster's batteries. They are ordinary `s.beams` (`drawBeam` in the actor art): `t < warn` is the charge, then the beam burns from `x0` to the left edge with height `h`. Redesign the charge as the gun itself charging (light pulled into the muzzle, sparks), with no line drawn across the field before it fires. The live beam is a thick core with a coral edge and heat distortion.

## 7. Heavy weapons (every Space 3 boss)

Attacks are named by `corvetTell(e).verb`. Draw the tells on the boss and the projectiles in the projectile art.

| Verb | What happens | Tell | Projectile look |
|---|---|---|---|
| `dash3` | Three rams in a row, each straight through the ship's lane | Thrusters flare and the hull crouches back before each ram | A bow wave of pulses; an afterimage trail |
| `bombs` | Two volleys of three heavy bombs, each bursting into a 16-shot ring | Bomb racks open, the hull dips | Heavy round bombs with a fuse light; the ring of shrapnel |
| `blink` | Vanishes, appears behind (or over or under) the ship, rings it with fire, goes home | Shimmer and white flicker while it charges | A ring of needles, a fast aimed spread |
| `gravity` | Drags the ship toward itself while arms of orbs wheel out | The core opens and spins; space warps around it | Orbs in wheeling arms |
| `terrain` | Tears rock off and hurls it; rocks bounce off the edges and split when shot | Claws or clamps ripping plates off its own hull | `boulder` and `rock` enemies in flight |
| `disaster` | Debris from every edge at once, lightning around the ship | The boss raises its arms or masts, the screen darkens | Scrap from all four edges |
| `ionfan` | A wide fan of ion needles, three times | Ion coils light up | Thin cyan needles |
| `frostshell` | Frost shells that burst into ice and slow the ship | Frost cannon venting | Pale shells, ice shards |
| `ambush` | Fire from behind on every lane, and from the rear corners | The boss's eyes turn to look behind the ship | Pulses entering from the left edge |
| `launch` | Drones launched from its hangars | Bay doors open | Ordinary drones |
| `hyper` | Hyper beams (section 6) | The guns charge | Beams |

The **crossfire** is always on during Space 3 boss fights: aimed needles from the rear edge, the top, the bottom and the boss. Draw them as ordinary needles with a short motion trail.

## 8. Mini bosses (one per chapter, arriving a little past halfway)

Health bars sit over them (stand-in draws one; keep a bar). Two phases (cut at half health). Sizes are their boxes.

| Type | Chapter | Name | Box | Signature attacks | Look |
|---|---|---|---|---|---|
| `mini21` | 5 | Static Warden | 52×30 | ion fans, rams, hyper beam | A storm-blue picket with ion coils |
| `mini22` | 6 | Vent Crawler | 60×36 | frost shells, rock, flame | A crab-legged geyser drill |
| `mini23` | 7 | Ore Hauler | 70×36 | drone launch, heavy bombs | A boxy armed freighter |
| `mini24` | 8 | Picket Sentinel | 48×48 | rings, hyper beam | A mirrored octagon drone |
| `mini25` | 9 | Lantern Layer | 52×28 | rear ambush, mines, blink | A dark hunter laying lit mines |
| `mini26` | 10 | Trench Gate | 56×56 | hyper beams, lattices | A gate segment of the ring, alive |
| `mini27` | 11 | Deck Marshal | 72×40 | salvoes, bombs, flame | A deck turret block on thrusters |
| `mini28` | 12 | Gate Warden | 60×60 | blades, blink, gravity | A smaller herald, blade-armed |

## 9. Bosses, including bosses of several bodies

Bosses marked "parts" are built of separate bodies. While any part of the current stage stands, the core takes no damage, so draw the core as visibly shielded or shut. Each part has its own health; draw a small bar or damage states per part. When the last part of a stage falls the next stage comes out (`e.stage` increases, callout `stage`); after the last stage the core is exposed and the boss fights in its **true form** (`e.mods` is empty, callout `trueform`). The true form must look different: armour gone, core open and glowing, more aggressive silhouette.

Parts are in `ACT2_STAGES` in `space3-act2.ts`: `{ kind, ox, oy, w, h }` relative to the boss's top-left. Use `modBox(e, m)` to place them. A part flashes when hit (`m.flash > 0`).

| Type | Chapter | Name | Box | Parts (stage by stage) | Phase signatures, ultimate | Design brief |
|---|---|---|---|---|---|---|
| `boss21` | 5 | Tempest Raider | 90×40 | none | ion fan, triple dash, hyper beam; ultimate disaster | A supersonic interceptor, swept wings, ion coils on the wingtips, afterburners |
| `boss22` | 6 | Cryo-Colossus | 120×80 | 2 legs (bottom), frost tank (top) | frost shell, thrown terrain, gravity; ultimate bombs | A walking bomber on frozen legs, frost tank on its back; true form: legless, hovering on cryo jets |
| `boss23` | 7 | Iron Goliath | 150×70 | 4 hangar pods (above and below the bow) | drone launch, broadside, salvo; ultimate disaster | A siege carrier, thick armour, hangar pods that open; true form: hull cracked open, guns everywhere |
| `boss24` | 8 | Aegis-Null | 72×72 | 3 mirror plates in front | rings, lattice, hyper beam; ultimate gravity | A sentinel behind 360° reflective mirrors; true form: a bare spinning core |
| `boss25` | 9 | Void Stalker | 80×34 | none | rear ambush, blink, fang; ultimate triple dash | A stealth predator, barely visible in the dark, pink sensor eye |
| `boss26` | 10 | Ring Keeper | 108×108 | 4 laser nodes on the corners | hyper beam, coil, scan; ultimate disaster | The ring's ancient guardian AI, a sphere inside rotating rings, laser nodes at the corners |
| `boss27` | 11 | The Warmaster | 160×118 | shield generator (top), 2 ion batteries (front), engine (back) | hyper beam, bombs, broadside; ultimate disaster | The Aethelgard's war engine, a particle cannon core inside armour; true form: core exposed, cannon overcharged |
| `boss28` | 12 | The Herald (final boss) | 100×100 | stage 1: 2 energy blades; stage 2: 1 singularity ring | blades, gravity, blink; ultimate disaster | See section 10 |

## 10. The final boss: The Herald

The Herald is the gate's guardian and the last boss of Space 3. It is fought in three forms, one after another, with its own music for each (`s3boss12`, `s3boss12b`, `s3boss12c`).

1. **Blades.** Two huge floating energy blades guard the front (`blade` parts). It slashes with them and fires slanting plasma. Draw a tall regal figure, white and blue, the blades like cathedral glass.
2. **Singularity.** When the blades break, a singularity ring opens in front of it (`ring` part). It bends every shot toward itself and drags the ship (gravity), and fills the screen with rings of fire. Draw the ring as a black hole edge with light bending around it.
3. **True form.** When the ring breaks, its shield shatters and it fights in overdrive: everything at once, from every side. Draw it cracked open, the core blazing, light leaking from every seam.

On defeat, a huge shockwave. Then the gate stays open and stable with a fleet visible beyond it (the ending sets up Space 4).

## 11. HUD and labels

- Boss and mini boss name plates for chapters 5 to 12 (names in the tables above; `SPACE3_CHAPTERS` in `space3-copy.ts`).
- A per-part health strip for bosses of several bodies, and a clear change when the true form begins.
- The `storm`, `surge`, `stage` and `trueform` callouts should match the existing callout style.

## Deliverables and acceptance

- New painter files for: backdrops (8), lands (4 kinds), field overlays (8), enemies (5), mini bosses (8), bosses (8, with parts and true forms), the Herald's three forms, hyper beam charge and burn, heavy-weapon tells and projectiles, disasters.
- Every solid shape inside its hitbox; parts inside `modBox`.
- No overlay guides of any kind.
- `reduceMotion` honoured.
- `npx tsc --noEmit` and `npx eslint src/components/games` pass, and `npm test` stays green.
- In your summary, list each file you added and which stand-in branch in `space3-act2-art.ts` it replaced.
