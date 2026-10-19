# Space 3: The Outer Gate — Design

Story and cast are in [space3-story-notes.md](space3-story-notes.md) (the notes are in Malay; all Space 3 copy in the game is English first, with a Malay twin as in Space 1 and 2). This document is the design: what changes in the game, and how it sounds.

## The leap in one line

Space 1 and 2 are one game in different places. Space 3 gets its own identity, **Resonance**: the Seed Core's signal is the thing the enemy copies, the thing the ship runs on, and the one meter the player manages.

## Pillars

### 1. Resonance replaces the scattered power sources
Today the player juggles XP, Bloom energy, Hyper charge and the Cover cooldown. In Space 3 these draw from one **Resonance** meter, charged by risk:

- **Graze**: a shot passing within a few pixels of the hitbox.
- **Phase Shift**: a dodge with 12 invulnerable frames; a shot that passes through the ship during it counts as a graze.
- **Reflect**: the Kinetic Barrier absorbs small enemy shots for 1.5 s and fires them back.

Resonance is spent on Overdrive, wingman sync and Hyper. Safe play still wins, only slower; brave play snowballs.

### 2. Enemies that copy you
Vanguard drones record the player's flight path for 3 s and replay it as a **ghost**. Chapter 1's Ghost Corvet teaches it; the Herald in chapter 12 fires the player's own habits back. A boss that adapts cannot be memorised, so the player has to change how they fly mid-fight. Cost: one position buffer per ghost.

### 3. Wingmen as mechanics
`Tab` or a tap swaps Halo's **Aegis** stance (shield Bloom, smaller hitbox, homing Kite) and Vex's **Vanguard** stance (railgun, Fang Crescent). Each stance has a sync combo with the player's own shots; a wingman can be hurt and has to be protected. Chapter 11 becomes a mechanic, not a cutscene: Halo soaks the main gun, Vex tears the shield, Nova hits the core.

### 4. Space is terrain
Space 2 leans on `GROUND_Y` and `WATER_Y`. Space 3 has no floor, so:

- **Gravity wells** (Europa, the Hypergate) bend every shot, the player's included.
- **Trench chapters** (chapter 10) turn the camera so the scroll is not always left to right.
- **Destructible structure**: cut a strut to shut a lane to the enemy.

### 5. Bosses are staged
The Warmaster (chapter 11) is a 15 km flagship with three sub-systems (shield generator, ion batteries, main engine) destroyed one at a time before the core is exposed. A single health bar with three phases cannot show that scale.

### 6. A campaign with a choice
Act 2 lets the player pick the order of Uranus, Triton and Kuiper. The choice decides how much damage Aurora carries into Act 3, which changes the ending lines and the opening of Space 4.

## Engine cost

- `CHAPTERS = 8` and `isSecond` assume two campaigns. Space 3 is chapters 17–28 and needs a campaign index.
- `space-logic.ts` is already about 4,400 lines. New mechanics go in `space3-*.ts` modules.
- Copy follows the existing tests: matching `en`/`ms` speaker order, a Halo line in every chapter, no line over 180 characters.

## Build order

Do not build all twelve chapters first. **Chapter 1 (Ghost Corvet)** is the prototype: Resonance meter, graze, Phase Shift and ghost replay. If those four are fun the rest is expansion; if not, it is cheap to know now.

## Music direction

**Genre:** run-and-gun fusion meets orchestral rock. Two parents:

- *Run-and-gun arcade shooter*: a brass hook with a rising pickup, galloping and walking bass, drums that never sit still, a guitar solo in sixteenths, a key that keeps lifting.
- *Orchestral-rock traveller score*: piano and violin carrying a lyrical middle, strings and organ under it, a band that thins for the melody and swells for the return.

**Judgment reference:** Metal Slug X's "Judgment" is its Stage 1-1 theme, described by reviewers as Middle Eastern colour over heavy guitar riffs, with an opening guitar solo that sounds like a rocket engine igniting. Phobos Run takes the idea (a flat-second desert colour, a guitar-run opening), not the notes.

**Bridge to the earlier games:** Space 1's chip lead doubles the brass in the hook; Space 2's strings and organ carry the middle. Space 3 sounds like the two games meeting.

**Rules** (from [composition-method.md](composition-method.md)): a one-bar hook with an answer; sentence or period form every eight bars; the hook returns changed (here, an octave up with new destinations and the violin on the brass); the summit reached once, in the second half; a leap is followed by a step back; no tune is copied from any existing work. Reference music is described, never transcribed.

### Pilot: Battle: Phobos Run (`space3-music.ts`, chapter 1)

A minor, 168 BPM, 32 bars of 4/4.

| Bars | Band | Role |
| --- | --- | --- |
| 1–2 | Electric guitar run with a riser under it, picked bass, drums | Intro: an engine catching, then the dominant with its flat second (F over E7) for desert colour |
| 3–10 | Trumpet doubled by the chip, guitar arpeggios, organ, brass stabs | The hook: pickup, sequence, fragments, half cadence |
| 11–18 | Violin, piano, strings, a thinner groove | The lyrical middle (F, G, Em, Am), local peak D6 |
| 19–22 | Guitar solo, organ arpeggios | Sixteenth runs over Am, F, G, E7, climbing to E6 |
| 23–30 | Trumpet doubled by violin, strings, piano | The hook returns an octave up; one A6 summit |
| 31–32 | Violin, then a dominant fall | Turnaround to the riff |

It plays in the Soundtrack player as a fourth album, **Space 3: The Outer Gate**, not yet in the game. `tests/space3-music.test.mjs` checks the band changes, the hook's return, the summit and that no bar copies the one before. It cannot check that the tune is good: only listening can.

### Next tunes (after the pilot is judged)

Warning cue, Ghost Corvet boss, hangar, title, victory, and the Herald's three phases. The Herald's phases follow Final Extremity's idea (one score, rising key and tempo) with a bullet-hell groove.

## Status: Resonance logic

`src/components/games/space3-resonance.ts` holds the Resonance rules as pure functions (graze, Phase Shift, Kinetic Barrier, Overdrive, spending, the leak, the hit cost, the ghost trail and ghost shot) with numbers in one place at the top. `tests/space3-resonance.test.mjs` covers each rule. It is not yet called by the engine or drawn: that comes with the Chapter 1 slice. The numbers are first guesses and need playing to tune.

## Status: arsenal and director (the "no repeats, no old weapons" pass)

Space 3 now leaves the old arsenal behind and refuses to repeat itself.

- **Arsenal** (`space3-arsenal.ts`): the Seed Bolt (barrels grow with level), the **Echo Wing** (your own path from 1.5 s ago flies beside you and fires where you fired: where you have been is a weapon) and the **Lance** (B spends 35 Resonance on a piercing beam that follows the ship). The Barrier and Overdrive from Resonance complete the kit. No bombs, nukes, torpedoes, Kite, Bloom or gun crates; a supply pod holds a repair.
- **Director** (`space3-director.ts`): Ghost Corvet draws each attack from `lance`, `sweep` (a drifting wreck field), `ring`, `pinch` (hull plates flung from the flanks), `lattice`, `echo` with fresh numbers. The same kind never comes twice running, a whole attack never repeats within eight, rests are never the same length, and it learns the ship's habits: lances aim at the lane the ship lives in, wall gaps open where it has not been. A ship that keeps moving is not hunted. Phases unlock kinds (lance/sweep/pinch, then ring/echo, then lattice).
- **Waves** (`space3-waves.ts`): each flight builds its chapter from a seed out of 13 formations, never repeating one within the last three; heavy ones come late; one seed replays one flight for tests and bug reports.
- Tests: `space3-director.test.mjs` (23 tests) prove the rules above, the arsenal, and that two boss flights differ.

## Status: the music, rewritten so no two tunes feel alike

The first Space 3 tunes shared one beat, one bass, one meter and one shape. After reading how Metal Slug and Octopath Traveler are actually built ([space3-music-research.md](space3-music-research.md)), every tune except the approved Phobos Run was rewritten:

| Tune | Genre | BPM | Meter | Key |
| --- | --- | --- | --- | --- |
| Gate in the Dark (title) | military march, fanfare, lifts a minor third | 112 | 4/4 | A minor, C minor |
| Hangar: Before the Gate | lullaby, harp under piano | 84 | 6/8 | D major |
| Battle: Phobos Run (kept) | desert-metal run-and-gun | 168 | 4/4 | A minor |
| Battle: Ceres Foundry | jazz-fusion, slap bass, swung kit, sax-like trumpet, guitar solo | 144 | 6/8 with a 4/4 bridge | C# minor, F# minor |
| Warning: Ghost Signal | tense pulse, tritone | 152 | 7/8 | F minor |
| Showdown: Ghost Corvet | orchestral-rock boss in a JRPG's shape: drumless prelude, verse, pre-chorus, chorus, 7/8 lead-out, last chorus | 160 | 4/4 and 7/8 | G minor, B minor, A dorian, G |
| Showdown: Excavator-X | heavy-metal stomp, 7/8 grind, brass chorale, blast beat | 102 | 6/8, 7/8, 4/4 | D minor, F minor |
| Sortie Complete (victory) | Latin-clave fanfare that lifts into the hangar | 132 | 4/4 | D minor |

`tests/space3-variety.test.mjs` measures the laziness: tempos at least 8 BPM apart, all three bar lengths used, no two tunes sharing more than a third of their drum patterns, a written bass in every bar, no kit carrying more than 60% of a tune, five or more tonal centres, no two tunes with the same instrument order. Only listening can say whether they are good.

## Status: a new wingman, Lumen (and why Kite is not one)

Kite as a shot-catching escort (the "Aegis wing") was built and dropped: it did what Space 2's Kite and Cover already do. In its place is a **new character**, **Ensign Sera Okoro, callsign Lumen**, a recruit straight from the academy flying **Zephyr-04, the same ship as Nova's**, with a **plasma beam** (`space3-recruit.ts`). She slides to the nearest enemy ahead of her and burns everything along a 150 px beam at once, a little every frame (a boss a little less, Overdrive doubles it), and she runs hot: about four seconds of fire, then two and a half cold. She is the third wing: the **Echo Wing** attacks with your own past, **Lumen** burns, and Vex's **Fang** (planned, Chapter 3 onward) would pierce. Halo and Kite stay in the story (relief corridors), not on screen. The old escort art and tests are kept in `docs/design/retired-kite/`.

## Status: signature attacks and ultimates

Each Space 3 boss now has a unique attack for every phase and an ultimate (`space3-signature.ts`), on top of the director's random pool:

- **Ghost Corvet** (it copies): `scan` (radar arms), `playback` (the height you flew comes back as a wall), `pincer` (two rows close on your lane), ultimate `recall` (your last three seconds come back, then a ring).
- **Excavator-X** (it mines): `train` (a freight of ore down your lane), `charge` (heavy charges that burst into rings), `quake` (rings with a turning gap), ultimate `breach` (four rings at four speeds, then a drill stream).
- **Abyssal Wyrm** (it coils): `fang` (shots aimed where you are going), `snap` (an arc of ice closing on you), `coil` (a wall with a snaking corridor), ultimate `surge` (two jaws, then a coil).

A phase opens with its signature, a boss leans on its signatures afterwards (three times more likely), and the ultimate is forced at 25% and 10% of its health with a warning of 100 to 120 frames. Tests in `tests/space3-signature.test.mjs`.

## Status: the music quotes Space 1 and Space 2

Metal Slug brings its main theme back later in the series in a bigger arrangement; Space 3 does the same with its two predecessors (`space3-motifs.ts`; the lines are copied from the scores, and a test compares each one with the original). Space 1 is the chip voice, Space 2 the brass and strings:

| Tune | What it quotes |
| --- | --- |
| Gate in the Dark (title) | real instruments only, no 8-bit voice: Space 1's Starfall phrase as a brass fanfare; Space 2's Orbit Overture a fifth up as the theme; Starfall bent into C minor under it on a violin in the lift |
| Hangar | Space 1's hangar tune a fifth down, in six, on the chip beneath the piano |
| Sortie Complete (victory) | Space 1's victory fanfare, then Space 2's, both in D major, into the hangar's D major |
| Showdown: Ghost Corvet | Starfall returns in seven, on the chip with the brass, as the lead-out |
| Showdown: Excavator-X | the whole of Orbit Overture, note for note in D minor, as the brass chorale |
| Showdown: Abyssal Wyrm | the surge runs on Space 1's first-stage chords with its own line on the chip beneath, and again a step up |

## Status: the album recomposed (with the Gate theme)

The first versions were found dull, so every tune was rewritten around one idea: **the Gate theme**, the approved hook of Phobos Run (a rising pickup to a held fifth, a falling answer), treated differently by each tune the way Metal Slug brings its main theme back, plus the quotations from Space 1 and 2. Longer forms, key changes inside a tune, written dynamics (`accentMap` in `space3-groove.ts`), and a drumless prelude for every boss, as in Octopath Traveler.

| Tune | Bars | What changed |
| --- | --- | --- |
| Phobos Run | 52 | the approved hook kept; intro with stop-time, the hook, an answer that climbs (chip an octave above), **a jazz interlude in six** inside the metal, the violin middle, an eight-bar guitar solo, a stop, the last hook a whole tone up in B minor, a coda |
| Gate in the Dark (title) | 32 | **real instruments only, no 8-bit voice**; brass fanfare on Starfall, Orbit Overture on trumpet and violin, the lift to C minor with a second half, a bridge in six on a bell, the theme again with a bell above |
| Hangar | 24 | the lullaby, a minor middle on the violin, the lullaby again with a new ending |
| Warning | 16 | the pulse, a second statement, and a build to a held dominant |
| Ceres Foundry | 38 | adds a four-bar slap-bass break with the band out |
| Cryo-Crags | 58 | ice and hard rock, built like a rock song: a drumless intro, a guitar riff that carries the verse (a violin sings over it), a singable chorus, a half-time bridge with Space 2's hangar arpeggio, a bluesy solo, the riff alone with no drums, and the chorus again a whole tone up; one kick, a backbeat, a pumping bass |
| Ghost Corvet | 50 | an eight-bar drumless prelude, a bridge in F minor from which the last chorus lifts a whole tone, an outro |
| Excavator-X | 36 | a drumless prelude of low organ before the riff |
| Abyssal Wyrm | 34 | a drumless chip-and-strings prelude, an eerie interlude in six |

## Status: Cryo-Crags with new melodies, and Chapter 4 (The Kharn Anomaly)

**Cryo-Crags** keeps its hard-rock structure but every melody is new: the riff (a syncopated figure on the off-beats), the verse (the Gate hook in B flat minor, then moved up), a hymn-like chorus, the half-time bridge and the pentatonic solo.

**Chapter 4** (engine chapter 20) follows the story: Saturn's rings, the wreck of Kroll's fleet, Vex's line about being shot down, the outro pointing to Uranus.
- **Boss: Armada Reclaimer** (84x60, 1,000 hp, a fortress of Kroll's fleet that reloads itself). Signatures: `salvo` (old missiles gather, hang, then all go for where you were), `minefield` (mines burst into rings), `broadside` (cannon fire at six heights, one clear); ultimate `armada` (all of them, then two rings).
- **Waves:** `wreckRun`, `minePatch`, `recoveryDrones`, `krollFighters`.
- **Music:** *Battle: Kharn Wreckage* (a war march at 72 BPM that feels like 144, the Gate theme as a dirge, Space 1's Starfall in the relative major as the one light in the graveyard, a 7/8 stretch through the wreck field, the march again a fourth up; G sharp minor) and *Showdown: Armada Reclaimer* (orchestral war metal at 176 BPM: timpani prelude, war riff, a heroic brass anthem on the Gate theme, a siege in seven, the anthem a whole tone up; C minor to D minor).
- **Art:** placeholder only (`space3-reclaimer-art.ts`); the design brief is `docs/space3-codex-prompt-ch4.md`.

## Status: making Resonance fun (implemented)

- Phase Shift (Shift) is now a 40px dash in the flown direction (straight ahead if still); every enemy shot along the path pays the phase-graze sum.
- Graze chain: each graze within 150 frames raises the next by 25%, up to x3; a hit or a pause resets it.
- The Lance (B) erases enemy shots in its lane while it lasts.
- Z sends Lumen to the ship's lane for 180 frames (x1.5 damage, heat rises half as fast), 600 frame cooldown.
- Pickups: Resonance cell (Z, from big enemies, +25 meter); supply pods give Seed Bolt modes for 15 s: wide (W), pierce (P), rapid (Q).
- Chapter 1 shows three on-screen lessons (space3-hints-art.ts).

For Codex: art for the dash afterimage (`res.dashFrom`, `res.dashT`), the pickup icons Z/W/P/Q (placeholders in space-fx-art.ts), the mode/chain tag (`drawModeTag`), and a touch button for Lumen focus (`input.focus`).

## Change: Resonance replaced by Hyper Ballistic Plasma

Resonance was too hard to use (graze risk, five extra buttons, unclear purpose). The engine no longer reads graze, Phase Shift, Barrier, Overdrive, Lance or the Lumen command; the modules stay in `space3-resonance.ts` but are not wired in.

- One gauge, one button. The plasma cell (still `s.res.meter`) charges +0.05 a frame and from kills (killGain) and Resonance-cell pickups (Z).
- B fires Hyper Ballistic Plasma from 40%: the whole cell becomes one piercing bolt (`PLASMA` and `plasmaShot` in space3-arsenal.ts). Damage 0.35 per point stored, radius 4 + stored/16. It erases enemy fire it touches.
- Kept: Seed Bolt with pod modes (wide/pierce/rapid), Echo Wing, Lumen (auto), Ghost Corvet.

For Codex: art for `kind: "plasma"` (placeholder in `drawPlasma`, space3-weapons-art.ts), the plasma gauge in the HUD (label "Plasma ready · B", the Shift/C rings are gone), and touch controls: only a B button is needed, remove Shift/C/V/Z.

## Change: plasma torpedo as a weapon, Kinetic Push on B

The normal shot is the Seed Bolt. The plasma torpedo (kind "plasmatorp", PLASMA in space3-arsenal.ts) launches by itself every 70 frames when an enemy is ahead, with the usual torpedo launch (eject, ignite, burn), 12 damage (a torpedo's are 5 and 7) and an explosion of 9 in a radius of 34 (half to a boss). The gauge is now the kinetic cell: it charges by itself and from kills, and B spends 40 of it on Kinetic Push (PUSH): a wave that shoves everything within 130px away from the ship, enemies at full strength, mini bosses at 0.6, bosses at 0.25, and sends enemy fire away at speed 6. It does no damage. For Codex: the wave art (drawKineticWave, a placeholder ring), the plasma torpedo art in space-fx-art.ts, and a touch button for B.

## Change: Echo Wing removed, five boss weapons, Space 2 expansion music

- The Echo Wing (the ship-shaped shadow) is gone; the team is Nova and Lumen. Ghost Corvet\x27s own `echo` attack stays.
- Every final boss gains five weapons (`space3-arms.ts`): `dash` (winds back, rams down the marked lane with a bow wave, returns; `dashBoss` in space-logic.ts), `plasma3` (three long thin fast needles, two or three volleys), `blast` (two volleys of three fused explosive shells), `flame` (a cone of 34-frame fire) and `blades` (spinning crescents that turn at `back` and return like a boomerang). Phase 0 unlocks one or two of them, phase 2 most of them.
- Ordinary enemies in Space 3 only: fighters and snipers fire three needles at once, bombers throw three fused shells ahead (nothing is dropped), drones breathe fire, splitters throw boomerang blades.
- In-game music for Space 3 now plays the Space 2 expansion (Ascension album, `alt:` tracks) in `space-audio.ts`: title, hangar, warning, victory, stage and boss per chapter. The Space 3 tunes (`space3-*.ts`) are untouched and still on the soundtrack player.
- For Codex: art for the new tells (a dash wind-up, a flamethrower nozzle, blade launchers) and the enemy shots: needle (plasma), scrap shell with a fuse, fire (short orange), crescent (boomerang).

## Change: all Space 3 music rewritten (space3-orchestra.ts)

All twelve tunes are new, composed in the manner of the Space 2 expansion (space2-ascension.ts): original four-bar A, B and C themes with a chord on every bar, put in an order with the key lifting on the return, a counter-line drawn from each bar's chord (answerLine), and the band changing with each part. Keys and meters differ tune by tune (4/4, 7/8, 6/8). In-game mapping is back on the s3 tracks in space-audio.ts. The first set (run-and-gun and JRPG fusion, the Gate theme) is kept as text in docs/design/retired-space3-music/.

## Chapters 5 to 12 (engine 21 to 28) and the relentless boss rule

- All twelve chapters are playable (`LIMITS3.ready = 28`). Chapter data: `space3-act2.ts` (names, fields, disasters, lands, bosses, mini bosses, parts, kits). Engine: modules (`initMods`, `hurtMod`, true form), lands and fields (`stepOuter`), disasters (`runEvent`), outer enemies (`updateOuterEnemy`), hyper beams and launches. Stand-in art: `space3-act2-art.ts`. Story: `scenesOuter` in `space3-story.ts`.
- Boss rule (user, 2026-10-20): no safe zones, attacks from every side. Rests are 6 to 24 frames, rings and walls are all but closed, and a constant crossfire comes from every edge (`CROSSFIRE`). Heavy weapons for every Space 3 boss: `dash3`, `bombs`, `blink`, `gravity`, `terrain`, `disaster` (`space3-havoc.ts`), plus `ionfan`, `frostshell`, `ambush`, `hyper`, `launch`.
- Music: the full cue set after Space 2 and Ascension (hangar ×3, take-off, warning ×3, pause, game over, ending), a battle and a boss per chapter, the Herald's three phases, two bonus tracks (`space3-orchestra-outer.ts`).
- Codex art brief: `docs/space3-codex-prompt-act2-act3.md`.
