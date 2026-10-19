# Space 3 music: research and what it changes

The first Space 3 tunes (Phobos Run, Ceres Foundry, Ghost Corvet, Excavator-X) all shared one drum pattern, one galloping bass, and one shape (hook, lyrical middle, guitar solo, hook again). They sounded like one tune in different keys. This note records what the two reference soundtracks actually do, and the rules the rewrite follows. Nothing here copies a note from either score.

## What the sources say

**Metal Slug** (SNK Sound Team; the first game by Takushi Hiyamuta)

- The series is a blend of heavy metal, jazz and military orchestral music ([Square Enix Music Online, Metal Slug](https://www.squareenixmusic.com/reviews/george/metalslug.shtml)). Each mission has its own identity rather than one house sound: military march music for briefings, a bombastic heroic main theme that gives way to a jazz interlude, 80s synth-jazz fusion with twangy slap bass, synth pads and sax solos, and jazz-leaning stages ("Inner Station", "Ridge 256", "Gerhard Station").
- The main theme returns later with an "epic" makeover (the "Final Attack" track), so a motif travels across the album and is rearranged for each use.
- "Judgment" (Metal Slug X, Stage 1-1) is a metal track with Middle Eastern flavour over heavy guitar riffs, with a guitar solo opening ([Square Enix Music Online, Metal Slug X](https://squareenixmusic.com/reviews/george/metalslugx.shtml)). The boss track "Steel Beast" takes a more heavy-metal approach, tension and danger, and "Assault Theme" is a hard-edged war anthem: three boss/battle moods, three different styles.
- Metal Slug 3 gives each location (islands, desert, underwater, underground, space) a theme that suits it ([Square Enix Music Online, Metal Slug 3](https://squareenixmusic.com/reviews/george/metalslug3.shtml)); later entries put heavy metal beside ethnic colour (Metal Slug 5's "Heavy African", "Ruins Excavation").

**Octopath Traveler** (Yasunori Nishiki)

- Boss themes are fixed at 164 BPM and begin in G minor, a constraint Nishiki called a headache; every protagonist has a prelude that flows into the boss theme ([Siliconera](https://www.siliconera.com/octopath-travelers-composer-shares-a-few-thoughts-on-various-music-tracks/)).
- The prelude is built for tension against a strong opponent; then the drums kick in and the focus turns to encouraging the party. Orchestra and drums together, because "we needed drums to get players' blood pumping" ([Gaming Audio News](https://gamingaudionews.com/2018/10/24/octopath-traveler-composer-yasunori-nishiki-on-writing-decisive-battle-i/)).
- Form is a song's: intro, verse, pre-chorus, chorus, outro ("Battle I", G minor, about 155 BPM, per [Hooktheory](https://www.hooktheory.com/theorytab/view/yasunori-nishiki/battle-i---octopath-traveler)). Melody comes first and orchestration second ([RPG Site](https://www.rpgsite.net/interview/19559-yasunori-nishiki-music-composition-interview-octopath-traveler-0-yu-gi-oh-master-duel-coffee)).
- A crowd-sourced analysis of "Decisive Battle II" lists sections in G minor, B minor, A Dorian, A minor and F minor ([Hooktheory](https://www.hooktheory.com/theorytab/view/yasunori-nishiki/decisive-battle-ii---octopath-traveler)): the key moves between sections, not just at the end. (User-submitted; not authoritative.)

What I could not confirm from public sources: exact drum patterns, time signatures of the boss themes, and any Latin or Middle Eastern detail beyond "Judgment". I do not claim them.

## What was lazy

| Fault | Where |
| --- | --- |
| One drum pattern (`DRIVE`, `GROOVE`, `FILL`) in every tune | all Space 3 tunes |
| One bass (`gallop16` or `pump16`) in every tune | all |
| One meter, 4/4 | all but the warning's idea |
| One shape: intro, hook, lyrical middle, solo, hook up an octave | stage and boss tunes |
| The same instrument order: guitar, trumpet and chip, violin and piano, guitar, trumpet and violin | all |
| Never changes key | all |
| Bass was a riff template, not a line that moves to the next chord | all |

## Rules the rewrite follows

1. **Each tune has its own genre**, as Metal Slug gives each mission its own: desert metal (Phobos Run, kept), jazz-fusion foundry (Ceres), a tense orchestral-rock boss with a prelude (Ghost Corvet), a stomping heavy-metal boss in six (Excavator-X), a 7/8 warning, a march title, a harp lullaby hangar, a Latin-clave victory.
2. **Different tempo, meter and kit per tune.** The album uses 4/4, 12-cell (6/8-feel) and 14-cell (7/8) bars, tempos from 84 to 176, and a library of drum feels (shuffle, half time, double kick, clave, march, tom stomp, funk with ghost notes) instead of one pattern.
3. **Bass is written line by line**, chord to chord, with a chromatic approach into the next root, in a pattern that belongs to the section (walking, syncopated, stomp, pedal, double-time) and not one riff.
4. **Octopath's shape for the boss:** a prelude with no drums for tension, the drums enter on a crash, then verse, a lyrical pre-chorus in a new key, a chorus in a third key, a half-time lead-out, and a final chorus a step down and an octave brighter.
5. **Keys move between sections**, as in Decisive Battle II, not only at the end.
6. **A motif travels**, as in Metal Slug: the title's pickup returns in the victory and the hangar, changed.
7. **Every tune has a different instrument order.** No two share the same lead sequence.
8. **Tests measure the laziness** (`tests/space3-variety.test.mjs`): tempos at least 8 BPM apart, at least three bar lengths on the album, no two tunes sharing more than a third of their drum patterns, bass written in most bars, different tonal centres, and no tune that uses one kit for more than half its bars.

Only listening can say whether a tune is good.

## Update: the series themes travel

The tunes were still found dull. The Metal Slug lesson not yet applied was the main theme returning in a bigger arrangement. Space 3 now quotes Space 1 (on the square-wave chip) and Space 2 (on brass and strings) in six of its eight tunes: see `docs/space3-design.md`, "the music quotes Space 1 and Space 2", and `space3-motifs.ts`. Phobos Run, approved as it is, the Foundry, the Cryo-Crags and the warning keep their own material.
