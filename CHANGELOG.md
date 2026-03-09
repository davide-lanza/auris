# Auris — What the App Does & Version History

> Written for non-technical readers. This document is updated every time the app changes significantly.

---

## What is Auris?

**Auris** is an ear training app for musicians. The goal is simple: you listen to a sound, you identify what it is. Over time your ears become faster and more reliable — the same way a fluent reader no longer sounds out letters, you stop analysing and start just *knowing*.

The app lives entirely in a single file (`dist/auris.html`). No internet connection needed once you have it. No app store. No account. Open it in a browser, save it to your phone's home screen, and it works.

---

## What can you train?

The app covers four areas of ear training, unlocked progressively as you level up:

### 🎵 Intervals
An interval is the distance between two notes. Recognising intervals by ear is the foundation of all ear training. The app plays two notes (one after the other, or at the same time) and asks you to identify the interval — Minor 2nd, Perfect 5th, Octave, and so on. Each interval has a **reference song** (a melody anchor) to help you remember it. For example: a Perfect 5th sounds like the opening of *Star Wars*.

### 🎹 Chords
A chord is three or more notes played together. The app plays a chord and asks what type it is — Major, Minor, Diminished, Dominant 7th, etc. Each chord type has a distinct emotional colour (major = bright and happy, minor = dark and melancholic).

### 🔄 Cadences
A cadence is a pair of chords that creates a sense of arrival or departure — like punctuation in music. The app plays two chords in sequence and asks which cadence type it is (Perfect, Imperfect, Plagal, Interrupted). These patterns are everywhere in Western music.

### 🌍 Modulation
Modulation is when a piece of music shifts from one key to another. The app plays a short passage and asks where the music moved to — for example, from C major to G major (the dominant key).

---

## How does levelling up work?

There are **8 levels**, from Beginner to Master. Each level gradually introduces harder material:

| Level | Name | What's new |
|---|---|---|
| 1 | Beginner | 3 basic ascending intervals in C major |
| 2 | Beginner | 6 intervals + major and minor chords |
| 3 | Elementary | 8 intervals + descending mode + diminished chord |
| 4 | Elementary | All basic intervals in both directions + augmented chord |
| 5 | Intermediate | All intervals in all 3 modes (ascending, descending, harmonic) + 7th chords + cadences |
| 6 | Intermediate | Full chromatic interval set + 7th chords extended + all 4 cadences |
| 7 | Advanced | Compound intervals (9ths) + chord inversions + modulation |
| 8 | Master | Tenths + all keys + full modulation set |

**To unlock the next level you need, for every active training area:**
- At least **50 answers** (so the score is statistically meaningful)
- An **average of 85% or above** across Accuracy, Fluency, and Retention

The home screen shows the two conditions as separate progress bars so you always know exactly what is holding you back. When both are met, a 🔓 badge pulses on the home screen and an "Unlock Level" button appears.

---

## How is your score calculated?

Every time you answer a question the app records whether you were correct and how fast you responded. Three metrics are computed per training area:

**Accuracy (40% of overall score)**
The percentage of correct answers over your last 30 questions, averaged by session (capped at 10 answers per day to prevent grinding). This is the core measure: do you know your intervals?

**Fluency (30% of overall score)**
How quickly you answer correctly. Under 4 seconds = full marks. The score scales down to zero at 12 seconds. Speed is not about rushing — it measures whether the recognition has become automatic rather than conscious analysis.

**Retention (30% of overall score)**
A weighted accuracy score that gives extra credit when you answer correctly after a long gap (20 hours or more since your last answer in that area). High retention means the learning is genuinely sticking, not just fresh in short-term memory.

The **Overall Score** is the weighted average of the three: `Accuracy × 0.4 + Fluency × 0.3 + Retention × 0.3`.

---

## What does the Theory tab show?

The Theory tab is a complete reference for the **entire curriculum across all 8 levels** — not just your current level. You can see every interval, chord, cadence, and modulation type that exists in the app, including content from levels you haven't reached yet. Each item shows:
- A level badge (e.g. "Lv3") indicating when it's introduced in the curriculum
- 🔒 for content from future levels (visible but dimmed)
- The reference song anchor for each interval
- Playable buttons to hear each interval, melody, chord, or cadence at any time

---

## What does the Progress tab show?

- **Radar chart** — a triangle showing your current Accuracy, Fluency, and Retention at a glance
- **Metric bars** — each of the three metrics with a plain-language explanation of what it measures
- **Unlock status** — live display of how far you are from unlocking the next level (e.g. "47/50 answers · avg 72% / 85% target")
- **Recent Trend chart** — your last 50 answers plotted as individual correct/wrong dots, with a rolling 10-answer accuracy line drawn over them. The dashed gold line marks the 85% target. This shows whether you are genuinely improving or just having a good streak
- **Item Breakdown** — per-interval or per-chord accuracy, so you can see exactly which ones you struggle with

---

---

## Version History

### v1.4 — 9 March 2026 (current)

**Error comparison:**
- New toggle in Settings › Training: **"Error comparison"** (default: on)
- After every wrong answer the app automatically plays your chosen sound, pauses 2.2 seconds, then plays the correct one — you hear the contrast immediately without any extra taps
- Tapping Next before the second sound fires cancels it cleanly
- The preference is saved, so it persists across sessions

**Cleaner home unlock progress:**
- Removed the single aggregated percentage bar ("X% toward Level N"), which was hard to act on
- Replaced with two explicit mini-bars, one per condition:
  - *Answers* — fills as you practice, shows e.g. "20 / 50"
  - *Avg score* — fills as your score rises, shows e.g. "72% / 85%"
- Each bar turns green with a ✓ the moment its condition is met
- When multiple areas are active, the label shows which area is the bottleneck

---

### v1.3 — 9 March 2026

**Tuning and fixes:**
- Fluency now rewards up to 4 seconds for full marks (was 2 s — too strict). Thresholds: ≤ 4 s = 100, ≤ 6 s = 80, ≤ 8 s = 60, ≤ 12 s = 30, above = 0
- Minimum answers for level unlock lowered from 100 to **50** — enough to be statistically valid without being discouraging
- Home screen progress bar now reflects **both** unlock gates, not just the score. The bar fills to 100% only when both conditions are on track (50 % weight to answer count, 50 % to score). A subtitle line shows the bottleneck: e.g. "12/50 answers · avg 68% / 85%"
- Theory tab audio: tapping any play button now **stops the current sound immediately** and starts the new one. Previously sounds would overlap or a melody would keep playing after you'd moved on

---

### v1.2 — 9 March 2026
*Two sessions of improvements on top of the initial refactored release.*

**Metrics & levelling:**
- Removed "Consistency" as a fourth metric — it was tracking daily practice streaks which isn't the right signal for musical learning
- Simplified to three metrics: Accuracy, Fluency, Retention
- Level unlock now requires **≥ 50 answers AND avg ≥ 85%** per area — the minimum answer count prevents unlocking on a lucky short run

**Theory tab — complete reference:**
- Theory now shows all 17 intervals, 8 chords, 4 cadences and 5 modulation types, regardless of current level
- Each item carries a level badge so you can see where it appears in the curriculum
- Locked future content is shown dimmed (not hidden) — you can study ahead
- Anchor songs are now shown inline for every interval, not just as a melody button
- Modulation types moved to their own dedicated section

**Melody playback:**
- Every reference song was extended from 2–3 notes to a full 8–12 note phrase that is genuinely recognisable
- For example: Happy Birthday now plays both verses, Smoke on the Water plays the complete three-phrase riff, Somewhere Over the Rainbow plays through "way up high"

**Progress tab:**
- Replaced the 14-day calendar histogram (was too sparse to be useful day-to-day) with a **Recent Trend chart** showing the last 50 answers with a rolling accuracy line
- Added plain-language explanations beneath each metric bar
- Live unlock progress shown at the bottom of the metric card
- Radar chart updated to a triangle to match the three-metric system
- Pulsing 🔓 badge added to the home nav button when a level is ready to unlock

---

### v1.1 — 8 March 2026
*Structural refactor and audio reliability overhaul.*

- Split from a single giant file into a proper source tree (`src/`) with separate files for CSS, JavaScript, and data
- Build script (`build.js`) assembles everything into the distributable `dist/auris.html`
- Audio samples (Salamander Grand Piano) embedded directly as Base64 inside the HTML — **zero external dependencies at runtime**, works fully offline
- Added a robust audio loading sequence with fallback chain and a 15-second timeout
- Redesigned the 8-level progression system with a clear definition of what each level introduces

---

### v1.0 — 8 March 2026
*Initial release.*

- Intervals training (ascending, descending, harmonic modes)
- Chord training (major, minor, diminished, augmented, 7th chords)
- Cadence training (Perfect, Imperfect, Interrupted, Plagal)
- Modulation training (5 modulation types)
- 8-level progression system
- Per-area scoring with four metrics
- Theory reference tab with melody playback
- Progress tab with radar chart and item breakdown
- Local data storage (nothing leaves the device)
- Export/import backup as JSON
- Onboarding screen with name entry
- Piano keyboard visualisation in feedback cards
- Works offline, installable as a home screen app

---

*Developed by Davide · Dear Piano. Audio engine: Tone.js + Salamander Grand Piano.*
