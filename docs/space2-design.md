# Space 2: design brief (expansion of Space)

One brief for everyone who touches Space 2 (Claude, Codex, Gemini), so the result reads as the same
game as Space 1. Anything not decided here follows Space 1: `docs/space-redesign.md`,
`docs/space-boss-redesign.md`, and the code in `src/components/games/space-*.ts`.

Status: playable end to end in the engine (all eight chapters, bosses, weapons, Kite, ORB cover, story,
saves, achievements). Not yet playtested by a person. Still to do: the weather warnings on the HUD
(`SPACE2_COPY.weather`), the Himalayan gust, Bloom's "recovering" label, and a difficulty pass.

Files: engine `space-logic.ts` (chapters 9 to 16), `space2-plans.ts` (scripts), `space2-environment.ts`
(scenery), `space2-boss-art.ts` (bosses), `space-weapons-art.ts` (weapons, Kite), `space2-story.ts` and
`space2-copy.ts` (story and words, by Codex), tests `space2-*.test.mjs`.

## Decisions (owner)

1. **Open to everyone** for now: no lock behind Space 1.
2. **A different upgrade system: the XP gauge.** Space 1 levels up with gold hearts; Space 2 levels up
   with kills. Every enemy destroyed fills the gauge, **100 XP is one gauge and one level**, so the more
   that die, the faster Nova grows. Nova starts Space 2 at level 1 with 0 XP. The levels still bring the
   same upgrades as Space 1 (launcher, hypersonic drive, mechanical shield, and so on).
3. **Kite is automatic.**

How it fits the engine: Space 2 is chapters 9 to 16 of the same engine, shown to the player as Space 2
chapters 1 to 8. A chapter above 8 uses the XP gauge. The ship keeps its XP in the field Space 1 uses for
gold hearts, so saved runs, retries and chapter-to-chapter carry-over need no new storage.

The pickups work like Space 1 guns, which fire by themselves when something is in the way (Space 1 has
no fire button): the Mini rocket and Hyperbeam are pod guns with ammunition, and Bloom is a separate
support pickup that keeps whatever gun is held.

## Premise

Space 1 ended with the Seed Core secured and Nova going home. On Earth, Earth Force reads it
differently: Nova took the Core from an Armada that Earth Force had been quietly supplying, then sided
with Space Force. Earth Force names Nova a **traitor**, the Aurora a hostile ship, and orders both shot
down. Nova has no way home that does not go through them.

Nova is not alone this time. **ORB** (Orbital Relief Brigade), a neutral armada that refuses both sides,
lends one **assist pilot** and a wingman craft. ORB will not fire first. It will cover Nova, and it
holds Nova to one rule: Earth Force's people are not the enemy, its machines are.

Tone: same as Space 1. Short lines, dry humour from ARC, no speeches. Nova stays clipped.

## Cast

| Id | Name | Role | Colour |
| --- | --- | --- | --- |
| nova | Nova | Player. Branded a traitor. | `#fbcf33` |
| mika | Mika | Aurora hangar control. Still on the comms. | `#67e8f9` |
| rin | Cmdr. Rin | Space Force command. | `#86efac` |
| arc | ARC | Zephyr's AI. | `#c4b5fd` |
| halo | Lt. Halo (Lyra Voss) | ORB assist pilot. Calm, blunt, refuses to kill crews. | `#5eead4` |
| marsh | Gen. Marsh | Earth Force commander. Believes he is right. | `#fb923c` |

## The eight chapters

Regions, not countries' armies: Earth Force is one organisation with regional commands, so no real
nation is cast as the villain. Each chapter has a place, a weather condition that changes how the
screen plays, enemies that fit, and a boss.

| # | Place | Weather and its rule | Boss |
| --- | --- | --- | --- |
| 1 | Re-entry over the Pacific | Plasma glow and a storm front. Heat haze at the edges only. | **Tidebreaker**, an Aegis destroyer with a rail deck |
| 2 | Southeast Asian archipelago | Monsoon rain. Rain streaks never cross bullets. | **Mangrove Hydra**, a river arsenal ship with three below-deck magazines |
| 3 | Himalayan range | Blizzard. A gust pushes the ship up or down on a visible cue. | **Ice Wyvern**, a cliff-clinging walker |
| 4 | Sahara | Sandstorm. The background dims; bullets and hazards stay bright. | **Dune Maw**, a burrowing borer |
| 5 | European alpine corridor | Fog at dusk. Missile grid with marked lanes. | **Iron Meridian**, an armoured rail fortress |
| 6 | Arctic ice shelf | Aurora night. Cold slows nothing; ice shards fall on a warning. | **Permafrost**, an icebreaker carrier |
| 7 | Atlantic hurricane | The eye of the storm. Lightning strikes after a column warning. | **Cyclone**, a storm carrier. Halo's best chapter. |
| 8 | Meridian Citadel, Earth Force HQ | Clear dawn, the first calm sky. | **Marsh's Atlas**, a colossal mech, then the orbital lance **Judgement** |

Rules for weather: it changes the scenery and one readable hazard. It never hides a bullet, never
changes the controls, and every strike is warned. Reduced motion freezes rain, snow and sand drift and
turns lightning flashes into a steady cue.

## Halo and the wingman

- The wingman (**Kite**) is a small ORB craft that flies a fixed offset behind and above Nova, follows
  Nova's movement with a short delay, and fires a weak forward shot. It cannot be hit and cannot hit
  bosses for more than 15% of Nova's output, so it helps but never replaces the player.
- **ORB cover** is reusable: when enemy fire (not sea missiles or crescents) comes close, Kite lays its
  own Bloom over Nova for two seconds without spending Nova's Bloom, then recharges for fifteen seconds
  (`COVER = { frames: 240, cooldown: 420, reach: 70 }`). A teal ring on Kite shows the recharge.
- Nova's launchers fire **deadly stingers** in Space 2, not torpedoes: homing missiles, one tube
  (6.5 damage, every second), two tubes from the twin upgrade (8.5 damage each, faster). See `PSTINGER`.
- Halo speaks in each chapter's intro, boss and outro, like Rin and ARC do in Space 1.

## New weapons

All three arrive as supply pods like the Space 1 guns, with ammunition, and they use the same
`GUNS` table and pickup art language (shape tells function, colour agrees with it).

### Mini rocket (`minirocket`)

- Fires a pack of **4 small rockets** that fan out and then home.
- **Targets bullets first**: each rocket picks the nearest enemy bullet inside 120 px that is moving
  toward the ship, and destroys it on contact. With no bullet in range it homes on the nearest enemy.
- Damage to units is low (1.2 per rocket, 0.6 to bosses) so it is a defence weapon, not a boss killer.
- Cooldown 26 frames, 60 ammo. Does not stop beams, flares, charges or boulders.
- Look: short, fat, lime-tipped rockets with a thin smoke trail; a destroyed bullet pops into four dots.

### Bloom (`bloom`)

- An **umbrella shield**: it opens by itself when enemy fire comes close, a half-dome of petals opens in front of the ship, radius 34 px,
  facing right. Enemy bullets that touch it are absorbed.
- A bar of 180 frames drains while it is open and refills when closed. When it empties it shuts for
  a short recovery. Each absorbed bullet refills a little, so it rewards standing in fire.
- Absorbs standard bullets only. Beams, missiles, flares and charges pass through: it is cover, not
  immunity.
- Releasing after absorbing 8 or more bullets fires a **petal burst** of 5 shots.
- Look: ink outline, hull-slate petals with a cobalt rim; opens like a flower and closes with a pop.

### Hyperbeam (`hyperbeam`)

- A **single, devastating shot**. When something is in its lane the pod charges for 60 frames (a thin
  guide line grows from the nose, the HUD ring fills, ARC calls it) and then fires by itself.
- The beam is 14 px thick across the whole width for 20 frames, **pierces everything**, erases enemy
  bullets in its lane, and deals 250 to a boss or any unit it crosses (once per target).
- Cost: 1 of 3 charges per pod. While it charges the ship moves at half speed, and after firing it cannot
  shoot for 40 frames, so it commits the player.
- Look: a cyan guide line, a white core with a coral rim at the edges, a screen flash (suppressed under
  reduced motion; the beam itself stays).

## Boss attacks (owner: no recycled patterns)

No Space 2 boss uses a Space 1 attack. Each has two signature attacks, an ultimate that opens its
last phase and returns, and a phase shift of its own (with its own call). Code: `secondAttack`,
`secondPhaseShift` in `space-logic.ts`; warnings and effects in `space2-boss-fx-art.ts`.

| Boss | Signatures | Ultimate | Phase shift |
| --- | --- | --- | --- |
| Tidebreaker | railshot, sea geysers | broadside (moving angular opening) | decks awash: quiet armour transformation |
| Mangrove Hydra | deck bombs (marked ballistic arcs), silo rockets (vertical launch, one locked turn) | arsenal salvo (fixed safe corridor) | magazine shutters rupture; internal feeds exposed |
| Ice Wyvern | avalanche (one safe column), ice wall | glacier lances | frost shed: quiet armour transformation |
| Dune Maw | marching sandspouts, burrow strike | sand pinwheel | molt: quiet armour transformation |
| Iron Meridian | runaway car, locked searchlight bursts | Meridian sweep | decoupled: quiet armour transformation |
| Permafrost | icebreak spikes, chain harpoon | polar vortex with an in-arena exit | hull breach: quiet armour transformation |
| Cyclone | locked lightning columns, bounded twister | maelstrom | pressure drop: quiet transformation; gusts start in recovery |
| Atlas | quake, rocket fist, orbital, cluster, scissor | march of Judgement | five calls of its own |

## Enemy fire

Earth Force fires **stingers**, not Space 1's torpedoes: a slim missile that leaves fast, speeds up, and
steers a little after the ship for its first moments (`STINGER`). Bloom swallows them and mini rockets
shoot them down. In the four water chapters **submarines** cruise under the surface and launch **sea
missiles**: long missiles that climb out of the water, turn toward the ship, and burst into a ring on
their own after a while or when close (`SEA_MISSILE`). Bloom does not stop sea missiles; mini rockets do.
Art: `space2-actor-art.ts`.

## Cover and terrain

- Three in four ground units dig in behind a wall, and three in four ships sit behind a floating
  barrier (`COVER2`, `digIn` in space-logic.ts). Cover stands just in front of its unit, a little taller,
  and moves with it; once the unit is gone it drifts with the ground. It stops the ship's shots but not
  the enemy's, and it is never destroyed: 10 hits on land or 14 at sea (stingers and rockets count
  double) crumble it to a stump 40% as tall, which leaves the top of its unit open. Homing stingers,
  the hyperbeam and bombs also get round it. Each place has its own look (space2-cover-art.ts).
- High ground (`PERCH`, `perchUp`): on land about half the ground units sit on a hill or crag; at sea
  every gun emplacement stands on an island, and the sea chapters send four big rocks each (`rock()` in
  space2-plans.ts). High ground is solid: it stops the ship's shots and hurts the ship on contact.
  It moves with the unit on it.
- Every place affects the ship (`TERRAIN`, announced at the start of each chapter): 1 spray slows it
  low over the sea, 2 rain pushes it down, 3 wind pushes it back, 4 sand makes the guns cycle at 80%,
  5 inside a fog band enemy aim scatters, 6 cold makes it 18% slower, 7 turbulence shoves it about,
  8 the dawn recharges the shield slowly.
- Health is fixed at 100 and the shield at 50 for every level, in both campaigns. Levels help in other
  ways: the mechanical shield takes 30% off every hit, self-repair mends the ship.
- The backdrops are layered: far peaks or skyline, a middle layer with landmarks, then textured ground
  or a moving swell at the waterline (space2-environment.ts).

## Mini bosses

Before each boss a mini boss holds the way (last entry of the chapter script). It is announced
("MINI BOSS!"), alternates two attacks of its own, each marked first, has its own health bar, cannot be
rammed, and leaves a gun crate and a repair crate. The chapter boss waits until it is gone; left alone
for 40 seconds it flies off. Code: `updateMini` in `space-logic.ts`, art `space2-miniboss-art.ts`.

| Chapter | Mini boss | Attacks |
| --- | --- | --- |
| 1 | Skyhook (tiltrotor) | rotor wash mines, sweep gun |
| 2 | Mudskipper (hovercraft) | skip hop with upward splash fan, hollow net fan |
| 3 | Cable Fort (gondola) | cable slide with icicles, chaff ring |
| 4 | Sand Skimmer (sail tank) | dune ram, cross mortar |
| 5 | Tunnel Sentry | three sequential muzzle-aligned rails, outward lattice |
| 6 | Ice Hunter (submarine) | torpedo fan, periscope strike |
| 7 | Storm Petrel (drone leader) | feather fan, dive bomb |
| 8 | Gatekeeper (gate mech) | gate lasers with one gap, shield drones |

## Difficulty and pacing

- Same health, shield, level and upgrade rules as Space 1 (`LIFE`, `SHIELD`, `LEVEL_AT`).
- Chapters are about the length of Space 1's, with the same structure: hangar-free start (the ship
  arrives from re-entry), enemies from the right, obstacles, a boss in phases with a visible wind-up
  and a recovery window.
- Check with the same method: complete chapter scripts, every boss phase, and a real-input survival
  run before any difficulty change.

## Art specification (unchanged from Space 1)

- Ink `#171717`, hull slate `#64748b`, pale panels `#e2e8f0`, friendly cobalt `#3b82f6`, friendly gold
  `#fbcf33`, hostile coral `#fb7185`. Earth Force adds **steel blue `#475569`** and **olive `#4d5b3a`**
  as its two hull tones; ORB uses **teal `#14b8a6`**.
- 0.8 game-unit outlines, at most two solid hull tones and one functional accent per actor, flat Canvas
  geometry only, no raster assets.
- Hostile shots keep their dark rim and pale centre on every background, including sandstorm and fog.
- Bosses follow the siege tank standard: bevelled plates, inset panels, hydraulic joints, visible
  weapon openings, phase damage.

## Engineering plan

Space 1 is built around eight numbered chapters (`CHAPTERS`, `boss1` to `boss8`, `SceneKey`, per-chapter
scenery). Space 2 is a second **campaign** inside the same game, not chapters 9 to 16.

1. **Campaign switch.** `campaign: 1 | 2` in the state and in saved progress. Space 1 saves stay as
   they are; Space 2 saves under its own key. Space 2 unlocks when Space 1's chapter 8 is cleared.
2. **Weapons first** (`space-logic.ts`, `space-weapons-art.ts`, tests): mini rocket, Bloom and
   Hyperbeam, usable in Space 1's chapters too so they can be tested against known enemies.
3. **Wingman** (logic plus one art file) and the ORB cover call.
4. **Chapters one at a time**: scenery and weather (`space-environment.ts`), enemies and obstacles,
   boss (logic plus `space-chapter-boss-art.ts` style file), story scenes in both languages
   (`space-story.ts`), then a test of that chapter.
5. **Screens**: campaign picker in `space.tsx`, HUD for Bloom energy and Hyperbeam charge, the guest
   rule (guests may fly Space 1 chapter 1 only; Space 2 needs an account), the library card and
   copy in both languages.
6. **Achievements** for Space 2 under the game id `space2`: chapters cleared, each weapon's use,
   a Bloom block count, a Hyperbeam multi-kill, a no-hit chapter, and Halo's cover calls.
   `space2` must be added to the account constraint in `supabase/accounts.sql`.

### Who does what

Parallel work stays safe if each tool owns whole files and the shared types are agreed first.

| Owner | Files |
| --- | --- |
| Logic (Claude) | `space-logic.ts` changes, `space-progress.ts`, tests, bot and survival runs |
| Art (Gemini) | new `space2-*-art.ts` files only: bosses, wingman, weapon visuals, chapter scenery painters |
| Copy and story (Codex) | `space2-story.ts`, English and Malay strings, achievement text |

Contracts the art and logic sides share before either starts:

- Every art function has the signature `(ctx, state, entity) => void` used in `space-actor-art.ts`.
- Boss hitboxes, muzzle points and phase thresholds are exported from the logic side as data, never
  re-derived in art.
- Art never reads randomness without the seeded `noise` helper, so renders are deterministic.



Chapter 2 arsenal revamp research, source notes, timings and validation: [space2-chapter2-arsenal-research.md](space2-chapter2-arsenal-research.md). This owner-requested redesign supersedes older Hydra head/venom/helix descriptions.

All chapter and mini-boss attack patterns, Metal Slug observation, shared warning/lock/recovery rules and current validation: [space2-attack-pattern-research.md](space2-attack-pattern-research.md). This later redesign supersedes earlier attack and phase-transition behaviour.
