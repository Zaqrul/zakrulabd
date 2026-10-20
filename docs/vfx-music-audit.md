# VFX, SFX and music: audit and recommendations (Space, Space 2, Space 3)

Written 2026-10-20. Every number below was measured, not estimated, unless it says so.

## How it was measured, and what it cannot tell you

- **Music.** I rendered tunes offline with the game's own engines and measured peak, RMS, clipping, loop length and
  brightness: all 34 Space tunes (NES engine), 24 Space 2 tunes and 12 representative Space 3 tunes of 38 (the rest
  by their composition data: bars, tempo, length). Bonus and alternate-album tracks were left out; they are not
  played in the game.
- **SFX.** All 17 sound effects rendered offline through the game's own functions, with the game's gains
  (SFX 0.7, music 0.28).
- **Frame cost.** For every chapter (1 to 28) I ran the real engine and timed `step` and `draw` over 360 busy
  frames each (mid-chapter and boss), on this desktop's Chrome with a GPU. The "full" figure forces the canvas to
  finish (a read-back), so its absolute value is inflated; compare chapters with each other, not with 16.7 ms.
- **Code review** of `space-audio.ts`, `space-music.ts`, `space2-music.ts`, the VFX painters in `space-fx-art.ts`,
  `space-art.ts`, `space-environment.ts` and the draw function in `space.tsx`.
- **Not done:** I cannot listen, so nothing here judges whether a tune is good, only how it is built and mixed. I
  did not profile on a phone (expect 3x to 6x slower than these figures), and I did not watch animations live, so
  VFX "feel" comments come from the code and still frames.

## Part 1: audio

### 1. The whole mix is quiet, and the sound effects are drowned by the music in Space 2 and 3 (high)

As the player hears them (music gain 0.28, SFX gain 0.7), in dBFS:

| What | Level |
| --- | --- |
| Space music, typical | RMS -30 to -36, peaks -13 to -17 |
| Space 2 and 3 music, typical | RMS -25 to -29, peaks about -11 |
| Blaster shot | peak -24 |
| Small explosion (the most frequent kill sound) | peak -29 |
| Shield hit / hull hit | peak -22 / -19 |
| Boss alarm, power-up | peak -21 |
| Heavy explosion / boss explosion | peak -15 / -14 |
| Nuke | peak -10 |

Nothing in the game ever gets within 10 dB of full scale, so the whole output is about 10 dB quieter than it needs
to be (the player compensates with device volume). And in Space 2 and 3 the frequent effects (shots, kills,
hits) sit 8 to 18 dB under the music's peaks, so they are masked: the most common reward sound, a kill, is the
quietest sound in the game.

### 2. Levels jump between games, and there is no master protection (medium)

- Space's main tunes render at RMS -19 to -21; Space 2's average -15.9 and Space 3's sample -16.2. Moving from
  Space to Space 2 is about **+4.5 dB** louder.
- 9 of the 24 Space 2 tunes and 6 of the 12 Space 3 tunes reach full scale in the raw render (up to +0.9 dBFS).
  The 0.28 music gain hides it, but there is no headroom policy, and no `DynamicsCompressor` or limiter on the master
  bus, so a nuke over a boss tune has nothing to catch it.

### 3. Sound effects are few, flat and repetitive (medium)

- 17 sounds in total: 5 blaster variants, 3 explosions, 2 hits, a bloom chime, an alarm, a power-up, a nuke, a
  countdown beep, a lift-off. Each is one oscillator or one noise burst; no layering, no pitch or gain variation,
  no stereo position. A machine gun plays the identical blip every shot.
- Every explosion, nuke and lift-off builds a **new** noise buffer with `Math.random()` per call (up to 1.4 s of
  samples). `SagaMusic` and `NesMusic` correctly build one noise buffer and reuse it.
- The audio events are detected by diffing state every frame, including
  `s.bullets.filter(b => b.own === "p").length`, which allocates an array 60 times a second.

### 4. Many events have no sound at all (high for Space 3)

Checked against every `spaceAudio.*` call in `space.tsx`:

- **Space 3's whole mechanic set is silent:** Kinetic Push, the Lance, graze, Phase Shift, Barrier, Overdrive,
  Resonance full, the Echo Wing. Space 3 reuses Space 1's sounds.
- No sound for: collecting a crate or heart (only a level-up plays the power-up), a boss changing phase, an enemy
  firing, weapon switch or ammo out, the shield breaking, a hazard or laser gate arming, the player's ship being
  destroyed (it goes straight to the game-over tune), story text appearing, UI buttons.

### 5. Two sounds play at the wrong time (medium)

- Bombs are timed (they explode three seconds after being thrown), but the heavy-explosion sound plays when the
  bomb count drops, which is when it is **thrown**. The actual detonation is silent.
- The nuke sound plays when the warhead is **launched**, not when it blasts.

### 6. Music changes are hard cuts, and pause loses your place (medium)

- `stop()` in both engines ends a tune instantly (`src.stop()` or `clearInterval`); there is no fade or crossfade
  between stage, boss, victory and game over.
- Pausing switches to the "pause" tune, and resuming starts the stage tune again **from its first bar**.
- Probable bug: in Space 3, `playLiftoff` starts `s3victory` ("Sortie Complete") instead of `s3fanfare`
  ("Take-off"), the fanfare written for that moment. Space 2 correctly starts `s2fanfare`.

### 7. Music repeats a lot in Space and Space 2 (high), far less in Space 3

A chapter runs about 44 to 72 seconds before its boss (up to 113 s in Chapters 26 and 27); a boss fight is longer.

| Game | Battle tunes | Loop length | Result |
| --- | --- | --- | --- |
| Space | 3 for 8 chapters (1 to 2, 3 to 5, 6 to 8) | 24 to 26 s | 2 to 3 repeats a chapter; one tune plays for 3 chapters in a row |
| Space 2 | 2 for 8 chapters (9 to 13, then 14 to 16) | 17 to 20 s | 3 to 4 repeats; one tune across five different biomes |
| Space 3 | 12, one per chapter | 58 to 120 s | under one repeat |
| Boss tunes | one per boss | Space 14 to 22 s; Space 2 14 to 23 s; Space 3 58 to 80 s | in a 2 to 3 minute fight, Space and 2 bosses repeat 6 to 10 times |

Only the last boss of each game changes its music with its phases. Within a loop the level hardly moves (1 to 1.3 dB
in Space 2, 1 to 5 dB in Space 3): no build-up, no release, no layers added as the fight gets hotter.

### 8. Engine robustness and memory (medium)

- Both engines schedule from a `setInterval` of 25 ms on the main thread. Space's engine looks ahead only **120 ms**
  (`LOOKAHEAD = 0.12`); Space 2/3's looks ahead 300 ms. Chapter 4 of Space plays a NES tune and, in my timings,
  had frames that took 137 ms (95th percentile) and 283 ms (99th). A stall longer than 120 ms is an audible gap.
- On the first play, a Space 2/3 tune is synthesised live **and** rendered offline at the same time (to record the
  loop), so the first minute of a new tune costs about double the CPU. Space 3's tunes took roughly half their own
  length to render on this desktop even in chunks, so a phone will struggle most at a boss entrance.
- Recordings are mono, 32 kHz, float32, and the cache keeps six. That was sized for 15 to 25 second loops; Space 3's
  60 to 120 second tunes are about 8 to 15 MB each, so the cache can hold **60 to 90 MB** of audio on a phone.

## Part 2: visual effects

### 9. Frame cost: logic is free, one chapter is a hot spot, and the canvas is oversized for phones (medium)

Measured over 360 busy frames per chapter:

- **`step` (game logic): 0.0 ms median, 0.1 ms at the 95th percentile**, in every chapter. Nothing to optimise.
- **`draw` on the CPU:** about 0.6 to 1.4 ms median, 1.1 to 2.4 ms at the 95th percentile in 26 chapters.
- **Raster cost ("full")**, medians: Space 12 to 35 ms, Space 2 12 to 30 ms, Space 3 9 to 21 ms. The busiest:
  Chapter 4 (**35 ms median, 137 ms at the 95th, 283 ms at the 99th**), Chapter 5 (25 / 49 / 78), Chapter 8 (32),
  Chapter 9 (30), Chapter 3 (17 / 29 / 36), Chapter 10 (21 / 26 / 55).
- Peak object counts: 19 enemies, 84 bullets (Chapter 27), 23 bursts, 180 smoke particles (the cap is 320).

Chapter 4 is the one to profile first (Chrome's Performance panel on a real phone); I did not isolate its cause.

From the code, what costs raster time every frame:
- `drawBursts`: a radial gradient, a `lighter` composite and several paths **per explosion**, uncapped (23 at once
  measured; a boss kill or a nuke makes more).
- The CRT overlay: 72 `fillRect` scanlines and a radial gradient every frame, though it never changes.
- Gradients created per frame in the backdrops (`space-art.ts` has 13, `space2-environment.ts` 10, the Space 3
  backdrops 14) and for the meteor streak.
- A floating damage number for **every** hit (a text allocation, a `fillText` and sometimes a stroke each), and up
  to six debris pieces per boss hit.
- Per-frame array churn: `s.bullets`, `s.bursts` and `s.smoke` are rebuilt with `filter` each frame; `s.smoke`
  uses `shift()` at its 320 cap.
- `fitCanvas` renders at up to **2x device pixels**: in the new full-screen phone layout that is a canvas of about
  1386 x 780 (1.08 million pixels) re-rasterised every frame, 3.6 times the logical 384 x 216 in each direction.
- No adaptive quality: nothing watches frame time and lowers the cost.

`shadowBlur` is used nowhere and `filter` nowhere, which is good: the usual mobile killers are absent.

### 10. Effect design gaps (from the code and still frames; low to medium)

- Player shots vanish on a land or enemy hit without an impact spark; there is no muzzle flash on the blaster.
- A damage number for every hit makes a machine gun a stream of numbers; it hides the action it reports.
- Hit-stop is two frames, and only on crits of 15+ damage or boss crits.
- The bomb and nuke flash is a full-screen white at up to 75% opacity for 14 frames. It is turned off by the
  operating system's reduce-motion setting, but there is no separate "reduce flashes" or "no screen shake" option.
- The CRT filter can only be switched in the header; on a phone it is now off by default.
- The Space 3 effects (ghost trail, barrier bubble, graze sparks, Kinetic Push wave) are the most complete in the
  series; the older games rely on bursts, smoke and bullets alone.

## Part 3: recommendations

### Quick wins (a day or less each; do these first)

1. **Fix the mix.** Add a `DynamicsCompressor` and a gain stage on the master bus (threshold about -18 dB, ratio 3:1,
   fast attack) with about +8 dB of make-up gain. Normalise the three games' music to one target (the render RMS
   of Space 2/3, about -16, is the one to move Space down to, or raise Space by 4 to 5 dB). Raise SFX 6 to 10 dB and
   make the kill, shot and hit sounds stand clear of the music. Duck the music 3 dB for 150 ms under a heavy
   explosion.
2. **Fix the two timing bugs:** play the bomb's heavy explosion when it detonates, and the nuke's when the warhead
   blasts (the engine already has `timedBombs` and `warheads`); and start `s3fanfare` at Space 3's take-off.
3. **One shared noise buffer** for the SFX engine, and count player shots without `filter()`.
4. **A fade-out on `stop()`** (about 200 ms) and a resume position kept per tune so pausing and unpausing does not
   restart the stage tune.
5. **Cap and cache the effects:** a maximum of about 12 simultaneous bursts, pre-render the CRT overlay and the
   explosion frames to small canvases and `drawImage` them, and merge damage numbers per enemy over about 6 frames.
6. **Lower the canvas on phones:** `min(devicePixelRatio, 1.5)` for handhelds (a 44% saving on pixels), with the
   option to drop to 1.25 on slow frames.

### Medium (a few days each)

7. **SFX with variety:** random pitch (+/- 4%) and gain (+/- 1.5 dB) per shot, two layers for explosions (a click and
   a body), stereo pan from the source's x, and a limit on simultaneous voices (for example 24, dropping the oldest).
8. **Give Space 3 its own sounds:** Kinetic Push (a low pressure wave), Lance (a rising charge and a bright beam),
   graze (a short tick that rises with the combo), Phase Shift (a soft whoosh), Barrier (a bubble up and a metallic
   deflect), Overdrive (a rising drone), Resonance full (a chime), Echo Wing shots (a delayed, filtered copy).
   Add the missing common ones: pickups by type, boss phase change, shield break, ship destroyed, enemy fire for
   the big units.
9. **Adaptive music.** Add two intensity layers to the long tunes (a hi-hat and arpeggio layer above a threshold of
   combo or enemies on screen, and a boss's later phases adding the lead), with a 1-bar crossfade, so a fight builds
   and relaxes. Use the boss phases for every boss, not only the last.
10. **Longer loops for Space and Space 2, and a tune per chapter for Space 2.** Extend the 17 to 26 second loops with
    an A-B-A' form (a second theme in a new key, then the return), and give each of Space 2's eight biomes its own
    battle tune: the arrangement tools already exist (`space2-ascension.ts` re-voices every tune), so a transposed,
    re-scored variant of the two base tunes per biome is cheap.
11. **Make the schedulers robust:** raise Space's lookahead to 300 ms (or pre-render its short tunes as Space 2 does
    and play the recording), start recording the **next** tune (the boss tune) during the stage tune so a boss
    entrance never synthesises live, and lower the cache to three recordings, or to 24 kHz for the pad-heavy
    tunes, to keep memory to about 30 MB.
12. **Profile and fix Chapter 4.** Take a Performance trace on a phone, find what costs 137 ms at the 95th
    percentile, and check Chapters 3, 5, 8, 9 and 10 in the same trace.

### Larger

13. **Adaptive quality.** Measure frame time over a second; below 50 fps, step down: CRT off, fewer particles and
    bursts, the render scale 1.25, simpler backdrop layers. Step back up when stable. Show it as a setting
    (Auto, High, Low).
14. **Settings:** separate music and SFX volume sliders (today only one mute), "reduce flashes" and "reduce shake",
    each remembered.
15. **Better effect feel:** a hit spark where a shot lands, a muzzle flash and a short recoil on the blaster, a longer
    hit-stop on boss defeats (4 to 6 frames) with a slow-motion tail, a multi-burst chain on boss defeat, and a
    screen-edge pulse as the ship's health drops.
16. **Move the music scheduler off the main thread** (an AudioWorklet or a Worker timer), or pre-render everything at
    chapter load behind the hangar scene, so a busy frame can never gap the music.

## Suggested order

1. Mix, the two timing bugs, shared noise buffer, fades, effect caps, canvas scale (items 1 to 6).
2. Space 3 SFX and SFX variety (7, 8): the biggest audible gain for the newest game.
3. Chapter 4 profile, scheduler robustness (11, 12), then adaptive quality (13).
4. Music variety and adaptive layers (9, 10), then settings and effect feel (14, 15).

Say which of these you want next. I can write Codex prompts for the music and VFX items the way I did for the
designs, or make the quick wins myself (items 1 to 6 are code changes I can do and test here).
