# How the bonus tunes are written

The first bonus tunes were weak. This note records what was learned from reading how Nobuo Uematsu and Kenji Ito work and from composition teaching material, why those tunes failed, and the rules the rewritten ones follow. No melody from any existing work is used.

## What the sources say

**Nobuo Uematsu** ([Red Bull Music Academy, 2014](https://daily.redbullmusicacademy.com/2014/10/nobuo-uematsu-interview/))

- His stated main concern is harmony: blending many sounds into one.
- On the NES he typed every note by hand and looped sections with repeat commands. He says constraint made him more inventive.
- He doubled a melody on two sounds, one shifted slightly in pitch and timing, to make it shimmer.
- He would rather write themes than battle music, but RPGs let battles be anything from orchestral to progressive rock; progressive rock (Yes, King Crimson, Led Zeppelin) is a named influence.
- In the NES era a piece was a melody line, a chord line and a bass line.

**Kenji Ito** ([Square Enix Music Online, 2010](https://www.squareenixmusic.com/features/interviews/kenjiito.shtml); [TouchArcade, 2024](https://toucharcade.com/2024/04/24/saga-emerald-beyond-interview-akitoshi-kawazu-kenji-ito-soundtrack-tomokazu-shibata-battle-combat-coffee/))

- The melody comes first and the arrangement adapts to the platform. He starts from the structure of the whole piece, then arranges.
- A storytelling melody line, close to popular music, that listeners can relate to; he pays attention to how it is phrased, and sings it.
- Reviews of his battle themes describe a brass-led main melody, a mellow string second melody, and frequent bass accents ([Square Enix Music Online](https://www.squareenixmusic.com/reviews/chris/romancingsaga3.shtml)).

**Composition teaching material** ([Soundfly](https://flypaper.soundfly.com/write/7-melody-writing-and-motivic-development-techniques-for-songwriters/), [UC Irvine theme-form handout](https://music.arts.uci.edu/abauer/5.3/downloads/Theme_Form.pdf), [Fundamentals of Function and Form](https://milnepublishing.geneseo.edu/fundamentals-function-form/chapter/35-sentences-and-periods/))

- A tune is built from a short motif, then developed by repetition, sequence (the same figure at a new pitch; upward feels more intense), fragmentation, inversion and rhythmic change, and not overused.
- **Period**: eight bars, an antecedent of four that ends on a weak cadence and a consequent that starts alike and ends firmly.
- **Sentence**: a two-bar basic idea, its repetition, then a continuation that fragments the idea, speeds up the rhythm and the harmony, and cadences.
- Counterpoint: contrary motion keeps lines independent, avoid parallel fifths and octaves, follow a leap with a step the other way, give each line its own shape.
- Bass: roots with stepwise passing tones, locked with the kick, syncopation for groove.
- Battle harmony: borrowed bVI and bVII against a minor tonic for momentum, an ostinato to anchor the harmony, faster harmonic change to build tension, tempo and key rising across phases ([Game Developer](https://www.gamedeveloper.com/audio/getting-making-game-music-that-fits-classic-genre-series-boss-music), [Game Music Analysis Club](https://gamemusicanalysisclub.substack.com/p/0-world-map-tactics-ogre-the-knight)).
- Chiptune: arpeggios stand in for chords when channels are few, the triangle and noise give bass and drums, and a returning melody changes by a pitch, an octave or a beat ([NESdev](https://www.nesdev.org/nt2/tips-tricks.htm)).

## Why the first bonus tunes failed

1. **No motif.** Each bar was written alone from a rhythm template of two short notes, a rest and a long one. Every bar sounded alike and nothing was developed.
2. **No phrase shape.** There was no question and answer, no weak cadence then strong cadence, no continuation that speeds up. Sections were eight bars of the same thing.
3. **Notes outlined chords.** The pitches were chords tones in turn, which sounds like an arpeggio, not a melody.
4. **Harmony moved one chord a bar throughout**, with no acceleration at the cadence.
5. **The second line was generated** from rules about what not to clash with, so it moved but meant nothing.

## The rules the rewrite follows

- One **hook** of one bar, written relative to a chord root so its strong beats are chord tones whatever the chord, and an **answer** that falls back.
- Every eight bars is a **sentence** or a **period**: statement, sequence, then fragments of the hook over faster chord changes, ending on a half cadence (bar 4 or 8) and a full cadence (bar 8 or 16).
- The hook comes back **changed**: moved up a chord, inverted, in a higher octave, or with its rhythm altered; never twice the same in a row.
- The top note is reached once, in the second half.
- After a leap of a fourth or more the line steps back the other way.
- Long held notes and short notes alternate inside a bar; rests breathe at phrase ends.
- No arpeggios in the second voice: it doubles the lead a third below, echoes it, or holds.
- The bass keeps the engine's riffs, which already run eighths on the root and lock with the kick.

## How the rewritten tunes were made

Each tune was written from motifs, not typed bar by bar. A hook, an answer, a half-cadence figure, a fragment and a singing line were each written once relative to a chord root (a degree of the scale above the root), then placed on each bar's chord, so a figure keeps its shape whatever the chord. Sequence, inversion and octave choice were applied on top, the strong beats were snapped to the chord and the leading tone was raised over a dominant, and the octave of each bar was chosen so the line never leaps more than an octave between bars. The script that did this is not part of the repository; the tunes it produced are `src/components/games/space-bonus-music.ts` and the Space 2 section of `space2-music.ts`.

`tests/soundtrack.test.mjs` checks the rules on every bonus tune: the hook's rhythm comes back, no bar is copied beside itself, bar downbeats and most strong beats fall on the chord, arpeggio runs are rare, the top note is reached in the second half, and there is a held note. It cannot check that a tune is good. Only listening does.

## Final Extremity (special bonus track, four phases)

One score in the manner of a prog-rock and techno RPG final-boss theme, played as three phases: D, E and F
sharp minor at 164, 172 and 180 bpm, so all three share every part, motif and band change. A drumless intro over a
piano ostinato, hits under a riser, a four-on-the-floor drive with a sixteenth-note synth bass and arpeggio under a
long sad line, a 7/8 break on the organ, half time on the guitar, then each phase's own sixteen-bar solo in
sixteenths over an eight-bar vamp played twice (violin, guitar, synth), up front over the bass and drums alone, a
climb a minor third higher, and the fall back. 48 bars.
In the climb only, the synth turns round the root in sixteenths, a light touch of a late-90s villain's theme. No
note is taken from any existing work.

Phase 4, Eternity, is the same score in G sharp minor at 188 bpm with a twenty-four-bar solo written new for it:
violin, guitar over a pedal, synth, a bar each in turn, then all of them together with the guitar a third below.
Its climb reaches C sharp 7, the top of the suite.
