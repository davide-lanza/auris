// ============================================================
// LEVEL SYSTEM
// ============================================================

const LEVEL_NAMES = {
  1: 'Beginner', 2: 'Beginner', 3: 'Elementary', 4: 'Elementary',
  5: 'Intermediate', 6: 'Intermediate', 7: 'Advanced', 8: 'Master',
};

// Area cards on home screen & unlock thresholds
const AREA_CONFIG = {
  'intervals':  { name: 'Intervals',  icon: '🎵', unlockLevel: 1 },
  'chords':     { name: 'Chords',     icon: '🎹', unlockLevel: 2 },
  'cadences':   { name: 'Cadences',   icon: '🔄', unlockLevel: 5 },
  'modulation': { name: 'Modulation', icon: '🌍', unlockLevel: 7 },
};

const AREA_COLORS = {
  'intervals':  '#6B9FFF',
  'chords':     '#C9A84C',
  'cadences':   '#5BBF8A',
  'modulation': '#E06060',
};

// Note utilities
const NOTE_NAMES      = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const NOTE_NAMES_FLAT = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];

// White key note classes (C major scale: C D E F G A B)
const WHITE_KEY_CLASSES = [0, 2, 4, 5, 7, 9, 11];

// Note name → chromatic class (0–11)
const NOTE_NAME_TO_CLASS = {
  'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11,
  'Bb': 10, 'Eb': 3, 'Ab': 8, 'Db': 1, 'Gb': 6,
  'F#': 6, 'C#': 1, 'G#': 8, 'D#': 3, 'A#': 10, 'Fs': 6,
};

// All 7 scale degrees for each major key (chromatic classes 0–11)
const KEY_SCALES = {
  'C':  [0, 2, 4, 5, 7, 9, 11],
  'G':  [7, 9, 11, 0, 2, 4, 6],
  'F':  [5, 7, 9, 10, 0, 2, 4],
  'D':  [2, 4, 6, 7, 9, 11, 1],
  'Bb': [10, 0, 2, 3, 5, 7, 9],
  'A':  [9, 11, 1, 2, 4, 6, 8],
  'Eb': [3, 5, 7, 8, 10, 0, 2],
  'E':  [4, 6, 8, 9, 11, 1, 3],
  'Ab': [8, 10, 0, 1, 3, 5, 7],
  'B':  [11, 1, 3, 4, 6, 8, 10],
  'Db': [1, 3, 5, 6, 8, 10, 0],
  'Fs': [6, 8, 10, 11, 1, 3, 5],
};

// Tonic note class for each key (used to pick chord roots at levels 3+)
const KEY_TONICS = {
  'C': 0, 'G': 7, 'F': 5, 'D': 2, 'Bb': 10, 'A': 9, 'Eb': 3,
  'E': 4, 'Ab': 8, 'B': 11, 'Db': 1, 'Fs': 6,
};

// ============================================================
// LEVEL DEFINITIONS
// The single source of truth for what is available at each level.
//
// intervals:
//   ascPool  — intervals available in ascending mode
//   desPool  — intervals available in descending mode ([] = locked)
//   harPool  — intervals available in harmonic mode   ([] = locked)
//
// chords:
//   pool       — chord types available
//   fixedRoots — { chordType: [noteNames] } for explicit root control (levels 1-2)
//                null = derive roots from keys via KEY_TONICS
//
// cadences / modulation: null = not yet unlocked
// ============================================================

const LEVEL_DEFS = {
  // ── LEVEL 1 ─────────────────────────────────────────────
  1: {
    keys:          ['C'],
    whiteKeysOnly: true,          // BOTH notes of every interval must be white keys
    intervals: {
      ascPool: ['P1', 'M2', 'M3'],
      desPool: [],                // descending locked
      harPool: [],                // harmonic locked
    },
    chords:     null,             // no chords yet
    cadences:   null,
    modulation: null,
  },

  // ── LEVEL 2 ─────────────────────────────────────────────
  2: {
    keys:          ['C'],
    whiteKeysOnly: true,
    intervals: {
      ascPool: ['P1', 'M2', 'm3', 'M3', 'P4', 'P5'],
      desPool: [],
      harPool: [],
    },
    chords: {
      pool: ['major', 'minor'],
      // Diatonic triads of C major — exactly the white-key roots
      fixedRoots: {
        major: ['C', 'F', 'G'],
        minor: ['D', 'E', 'A'],
      },
    },
    cadences:   null,
    modulation: null,
  },

  // ── LEVEL 3 ─────────────────────────────────────────────
  3: {
    keys:          ['C', 'G', 'F'],
    whiteKeysOnly: false,
    intervals: {
      ascPool: ['P1', 'M2', 'm3', 'M3', 'P4', 'P5', 'M6', 'P8'],
      desPool: ['M2', 'M3'],      // only these two directions at L3
      harPool: [],
    },
    chords: {
      pool:       ['major', 'minor', 'dim'],
      fixedRoots: null,
    },
    cadences:   null,
    modulation: null,
  },

  // ── LEVEL 4 ─────────────────────────────────────────────
  4: {
    keys:          ['C', 'G', 'F', 'D', 'Bb'],
    whiteKeysOnly: false,
    intervals: {
      ascPool: ['P1', 'M2', 'm3', 'M3', 'P4', 'P5', 'M6', 'P8', 'm6', 'M7', 'TT'],
      desPool: ['P1', 'M2', 'm3', 'M3', 'P4', 'P5', 'M6', 'P8', 'm6', 'M7', 'TT'],
      harPool: [],
    },
    chords: {
      pool:       ['major', 'minor', 'dim', 'aug'],
      fixedRoots: null,
    },
    cadences:   null,
    modulation: null,
  },

  // ── LEVEL 5 ─────────────────────────────────────────────
  5: {
    keys:          ['C', 'G', 'F', 'D', 'Bb', 'A', 'Eb'],
    whiteKeysOnly: false,
    intervals: {
      ascPool: ['P1', 'M2', 'm3', 'M3', 'P4', 'P5', 'M6', 'P8', 'm6', 'M7', 'TT'],
      desPool: ['P1', 'M2', 'm3', 'M3', 'P4', 'P5', 'M6', 'P8', 'm6', 'M7', 'TT'],
      harPool: ['P1', 'M2', 'm3', 'M3', 'P4', 'P5', 'M6', 'P8', 'm6', 'M7', 'TT'],
    },
    chords: {
      pool:       ['major', 'minor', 'dim', 'aug', 'dom7'],
      fixedRoots: null,
    },
    cadences: {
      pool: ['perfect', 'imperfect'],
    },
    modulation: null,
  },

  // ── LEVEL 6 ─────────────────────────────────────────────
  6: {
    keys:          ['C', 'G', 'F', 'D', 'Bb', 'A', 'Eb', 'E', 'Ab'],
    whiteKeysOnly: false,
    intervals: {
      // All main intervals including m2 and m7 — "all intervals, all directions"
      ascPool: ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'],
      desPool: ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'],
      harPool: ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'],
    },
    chords: {
      pool:       ['major', 'minor', 'dim', 'aug', 'dom7', 'maj7', 'min7', 'halfdim'],
      fixedRoots: null,
    },
    cadences: {
      pool: ['perfect', 'imperfect', 'interrupted', 'plagal'],
    },
    modulation: null,
  },

  // ── LEVEL 7 ─────────────────────────────────────────────
  7: {
    keys:          ['C', 'G', 'F', 'D', 'Bb', 'A', 'Eb', 'E', 'Ab', 'B', 'Db'],
    whiteKeysOnly: false,
    intervals: {
      ascPool: ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8', 'm9', 'M9'],
      desPool: ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8', 'm9', 'M9'],
      harPool: ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8', 'm9', 'M9'],
    },
    chords: {
      pool:       ['major', 'minor', 'dim', 'aug', 'dom7', 'maj7', 'min7', 'halfdim'],
      inversions: true,
      fixedRoots: null,
    },
    cadences: {
      pool: ['perfect', 'imperfect', 'interrupted', 'plagal'],
    },
    modulation: {
      pool: ['dominant', 'subdominant', 'rel_minor'],
    },
  },

  // ── LEVEL 8 ─────────────────────────────────────────────
  8: {
    keys:          ['C', 'G', 'F', 'D', 'Bb', 'A', 'Eb', 'E', 'Ab', 'B', 'Db', 'Fs'],
    whiteKeysOnly: false,
    intervals: {
      ascPool: ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8', 'm9', 'M9', 'm10', 'M10'],
      desPool: ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8', 'm9', 'M9', 'm10', 'M10'],
      harPool: ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8', 'm9', 'M9', 'm10', 'M10'],
    },
    chords: {
      pool:       ['major', 'minor', 'dim', 'aug', 'dom7', 'maj7', 'min7', 'halfdim'],
      inversions: true,
      fixedRoots: null,
    },
    cadences: {
      pool: ['perfect', 'imperfect', 'interrupted', 'plagal'],
    },
    modulation: {
      pool: ['dominant', 'subdominant', 'rel_minor', 'rel_major', 'parallel'],
    },
  },
};

// Convenience: returns a flat, deduplicated array of all intervals a student
// has been introduced to at `level` (across all modes).
function getAllIntervalsAtLevel(level) {
  const d = LEVEL_DEFS[level];
  if (!d) return [];
  return [...new Set([...d.intervals.ascPool, ...d.intervals.desPool, ...d.intervals.harPool])];
}

// Returns the union of all note classes available across `keys`.
function getUnionNoteClasses(keys) {
  const classes = new Set();
  keys.forEach(k => { (KEY_SCALES[k] || []).forEach(c => classes.add(c)); });
  return classes;
}
