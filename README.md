# Auris — Professional Ear Training

Auris is a mobile-first ear training web app built as a single HTML file for maximum portability. It trains musicians to recognize musical intervals, chords, cadences, and modulations by ear. The app features a multi-level progression system (Beginner through Master), per-area scoring across four metrics (Accuracy, Fluency, Retention, Consistency), a theory reference section, and automatic local progress saving. The audio engine uses Tone.js with the Salamander Grand Piano samples served from the gleitz CDN.

---

## How to Build

No npm install required. The build script uses only Node.js built-in modules.

```bash
node build.js
```

Or using npm scripts:

```bash
npm run build
```

The output is written to `dist/auris.html`. That single file is the complete app — open it in any modern browser.

---

## File Structure

```
EarTraining/
├── package.json        — project metadata and npm scripts
├── build.js            — build script (concatenates src files into dist/auris.html)
├── .gitignore          — ignores node_modules, .DS_Store, logs
├── README.md           — this file
│
├── src/
│   ├── index.html      — HTML skeleton with {{CSS}} and {{JS}} injection markers
│   │
│   ├── css/
│   │   ├── variables.css   — CSS custom properties (:root block)
│   │   ├── reset.css       — * reset and html/body base styles
│   │   ├── typography.css  — text utilities, spacers, about-text classes
│   │   ├── components.css  — cards, buttons, modal, settings, feedback, unlock banner
│   │   ├── layout.css      — app shell, header, nav, main content, piano, charts
│   │   ├── screens.css     — per-screen styles (loading, onboarding, home, training, progress, theory)
│   │   └── animations.css  — @keyframes, .fade-in, .pulsing
│   │
│   ├── js/
│   │   ├── app.js          — APP state object, navigation, routing, onboarding, boot listeners
│   │   ├── audio.js        — Tone.js sampler loading, all playback functions
│   │   ├── questions.js    — question generation and answer recording
│   │   ├── scoring.js      — accuracy/fluency/retention/consistency computation, level unlocking
│   │   ├── storage.js      — localStorage load/save, defaultData()
│   │   ├── ui.js           — all screen render functions, modal, training UI
│   │   └── charts.js       — SVG piano keyboard, radar chart, line chart
│   │
│   └── data/
│       ├── intervals.js    — INTERVAL_DATA, INTERVAL_POOL
│       ├── chords.js       — CHORD_DATA, CHORD_POOL
│       ├── cadences.js     — CADENCE_DATA, CADENCE_CHORDS, MODULATION_DATA
│       └── levels.js       — LEVEL_NAMES, AREA_CONFIG, AREA_COLORS, NOTE_NAMES
│
└── dist/
    └── auris.html      — built output (the only file end users need)
```

---

## How to Add a New Interval

1. Open `src/data/intervals.js`
2. Add a new entry to `INTERVAL_DATA` with the symbol as key, providing `name`, `semitones`, `anchor`, `emoji`, and `char` fields
3. Add the symbol to the appropriate level arrays in `INTERVAL_POOL` (e.g. add to levels 7 and 8 for advanced content)
4. Rebuild: `node build.js`

Example:
```javascript
// In INTERVAL_DATA:
'A4': { name: 'Augmented 4th', semitones: 6, anchor: 'Same as Tritone', emoji: '⚡', char: 'Dissonant, tense' },

// In INTERVAL_POOL (add to the appropriate level arrays):
7: [...existingPool, 'A4'],
```

---

## How to Add a New Chord Type

1. Open `src/data/chords.js`
2. Add a new entry to `CHORD_DATA` with the chord key, providing `name`, `formula` (array of semitone offsets from root), `symbol`, `char`, and `usage`
3. Add the key to the appropriate level arrays in `CHORD_POOL`
4. Rebuild: `node build.js`

Example:
```javascript
// In CHORD_DATA:
'sus4': { name: 'Suspended 4th', formula: [0,5,7], symbol: 'sus4', char: 'Open, unresolved', usage: 'Used in rock and pop for tension' },

// In CHORD_POOL:
5: [...existingPool, 'sus4'],
```

---

## How to Add a New Level

1. Open `src/data/levels.js`
2. Add the level number and name to `LEVEL_NAMES`
3. If a new training area should unlock at that level, add or update an entry in `AREA_CONFIG` with the correct `unlockLevel`
4. Rebuild: `node build.js`

Example:
```javascript
// In LEVEL_NAMES:
9: 'Grandmaster',

// In AREA_CONFIG (new area unlocking at level 9):
'sight_singing': { name: 'Sight Singing', icon: '🎤', unlockLevel: 9 },
```

---

## How to Change the Color Scheme

1. Open `src/css/variables.css`
2. Edit the values in the `:root { }` block — change `--gold`, `--gold-bright`, `--bg`, `--surface`, etc.
3. Rebuild: `node build.js`

The entire app's color theme derives from these CSS custom properties, so one edit propagates everywhere.

---

## Branch Strategy

- Always work on feature branches (`feature/your-feature-name`)
- Never commit directly to `main`
- Use pull requests for all changes to `main`
- Keep `dist/auris.html` committed alongside source so it is always deployable

---

## End User Distribution

End users only need `dist/auris.html`. It is a fully self-contained file with no external dependencies except the Tone.js CDN and the gleitz piano sample CDN (both loaded at runtime). It can be:

- Opened directly in a browser from the filesystem
- Hosted on any static file server or CDN
- Saved to an iOS/Android home screen as a PWA-like experience
