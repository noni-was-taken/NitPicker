# Design plan

Direction: `design.md` (refine current look; colors and fonts pinned). Run `site next` or `overhaul <page>` for the first unticked page.

- [ ] `/mockexamprep` Prep: the main job (set up and start an exam). Mostly restyle; rethink the right-hand summary on phone width.
- [ ] `/mockexam` Exam: the core experience. Check phone layout, option states, sticky bar, long questions and images.
- [ ] `/mockexamresults` Results: restyle, check empty and long-data states.
- [ ] `/previousexams` Vault: rethink the page on phone (very long list, filters wrap); add empty/zero-result state.
- [ ] `/` Home: restyle; first paint shows only a spinner, fix the lazy-load flash.
- [ ] `/notes` Notes: restyle only.
- [ ] `*` 404: restyle only.

Then the system: tokens for status colors, one icon set, `Button`, `Chip`, `Card`, `Input` components, and a `/design` states sheet.

Done so far (global craft pass): `transition-all` removed (45 uses), `color-scheme` per theme, selection color, balanced headings, tabular numbers on mono text.
