# Auris — Instructions for Claude

Standing rules that apply to every session, regardless of what is being changed.

---

## Always update CHANGELOG.md

**After every meaningful change, update `CHANGELOG.md` before committing.**

- Add a new version entry at the top of the Version History section if the changes are significant enough to warrant one (new feature, behaviour change, bug fix visible to the user)
- Keep entries written for a non-technical reader — describe *what changed and why it matters to the user*, not implementation details
- Also update the body sections ("What can you train?", "How does levelling up work?", etc.) if any factual information in them has become stale
- Version numbering: increment the patch number for fixes and small improvements (1.3 → 1.4), the minor number for meaningful new features (1.3 → 1.4 → 2.0 when warranted)

---

## Build before committing

Always run `node build.js` after editing any source file and before committing. The distributable is `dist/auris.html` — it must always be in sync with the source.

```bash
node build.js
```

---

## Branch and PR workflow

- Always work on a feature branch (`feature/short-description`), never directly on `main`
- Create a PR and merge it back to `main` when the work is complete
- Delete merged branches (both local and remote) after merging
- Commit message format: `type: short description` — types are `feat`, `fix`, `refactor`, `docs`

---

## File to distribute to end users

The only file end users need is **`dist/auris.html`**. It is fully self-contained and works offline. When referring users to the app, always point them to that file.

---

## Project structure reminder

```
src/           — all source files (edit these)
  css/         — stylesheets (variables, components, layout, screens, animations)
  js/          — JavaScript (app, audio, scoring, ui, charts, questions, storage)
  data/        — data definitions (intervals, chords, cadences, levels)
  index.html   — HTML shell (uses {{CSS}} and {{JS}} placeholders)
dist/          — build output (do not edit manually)
  auris.html   — the distributable single-file app
build.js       — build script, run with `node build.js`
CHANGELOG.md   — non-technical version history (keep updated)
CLAUDE.md      — this file
```
