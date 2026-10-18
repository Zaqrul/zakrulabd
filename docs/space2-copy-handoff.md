# Space 2 copy and story handoff

Copy follows the **owner decisions** at the top of `space2-design.md`: engine chapters 9–16,
displayed chapters 1–8, 100 XP per level, automatic Kite, and no Space 1 completion prerequisite.
The older campaign/unlock plan lower in that brief conflicts with these decisions. No auth,
save format, gameplay, weapon values, or art has been changed by this copy pass.

## Exports

- `space2-story.ts`: `SPACE2_STORY.en/ms`, keyed `c9-intro` through `c16-outro`; 24 scenes per
  language. `SPACE2_SPEAKERS` adds Halo and Marsh and retains the four returning cast colours.
- `SPACE2_EVENTS.en/ms.judgement`: a separate Atlas-to-Judgement transition. Trigger once
  after Atlas; play `c16-outro` only after Judgement is defeated.
- `space2-copy.ts`: `SPACE2_CHAPTERS`, `space2ChapterName(language, engineChapter)`, and
  `SPACE2_COPY.en/ms` for campaign screens, HUD, pickups, weather warnings and spoken callouts.
  The chapter-name helper returns `null` for numbers outside the campaign, rather than silently
  selecting the wrong chapter.
- `SPACE2_ACHIEVEMENTS`: 15 bilingual entries compatible with the existing `Ach` catalogue:
  eight chapter milestones and seven weapon, cover and challenge milestones.

## Integration for the engine/UI owner

1. Merge `SPACE2_STORY` and `SPACE2_SPEAKERS` into the story lookup when enabling chapters 9–16.
   Extend `SceneKey` and `Speaker`, including the `SPEAKER_ICON` map in `space.tsx` for Halo/Marsh.
   Existing Space 1 dialogue is unchanged.
2. Display local chapter numbers from `SPACE2_CHAPTERS`, including chapter-clear and retry screens.
   Use the separate `judgement` event at the final boss transition; it is not a chapter-clear event.
3. Feed the existing dialogue/HUD components `SPACE2_COPY` calls. Trigger ORB cover and weapon calls
   on real state transitions, not on each render. No manual Kite, Bloom or fire button is implied.
4. Register `SPACE2_ACHIEVEMENTS` only alongside working stat events and the `space2` game ID.
   `chapter` is the highest **local** chapter completed. Weapon uses, Bloom blocks, ORB calls and
   no-hit chapters are cumulative events. `hyperbeamMultiKill` is the maximum kills from a single
   beam. A no-hit chapter excludes shield hits too. The eight-block achievement is cumulative;
   the gameplay petal burst still needs eight blocks within one opening.
5. The copy names eight bosses and the final second phase, but does not define hitboxes, phase
   timings, weather algorithms or XP awards per enemy. Those remain with the logic/art owners.

The new exports are intentionally not registered in the live UI or achievement catalogue yet:
the campaign engine and its event hooks are being built separately. This prevents unfinished
chapters or unearnable achievements appearing in Space 1.

## Checks

Run `node --experimental-strip-types --test --test-isolation=none tests/space2-copy.test.mjs`.
Checks cover scene completeness, speaker/language parity, Halo's presence, short dialogue,
chapter numbering, final-boss transition, UI-key parity and the achievement contract.
UI wrapping and reveal timing still need an in-game pass once the campaign is connected.
