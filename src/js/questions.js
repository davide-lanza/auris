// ============================================================
// QUESTION ENGINE
// All generators read from LEVEL_DEFS to enforce level constraints.
// White-key validation is applied strictly at levels 1–2.
// ============================================================

// ── ROOT NOTE SELECTION ───────────────────────────────────────

/**
 * Returns a random root MIDI in 48–65 such that:
 *  - At whiteKeysOnly levels: both root AND (root + semitones) are white keys.
 *  - At other levels: root is from the union of scale notes in the level's keys.
 * The range 48–65 keeps the second note comfortably below 84 (C6) even for
 * compound intervals up to a major 10th (+16 semitones).
 */
function getIntervalRootMidi(level, semitones) {
  const def = LEVEL_DEFS[level];

  let validClasses;

  if (def.whiteKeysOnly) {
    // Both root class and (root + semitones) class must be white keys
    validClasses = WHITE_KEY_CLASSES.filter(rc =>
      WHITE_KEY_CLASSES.includes((rc + semitones) % 12)
    );
  } else {
    // Root can be any note from the union of allowed key scales
    validClasses = [...getUnionNoteClasses(def.keys)];
  }

  const candidates = [];
  for (let midi = 48; midi <= 65; midi++) {
    if (validClasses.includes(midi % 12) && (midi + semitones) <= 84) {
      candidates.push(midi);
    }
  }

  if (!candidates.length) return 60; // safe fallback (C4)
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Returns a random root MIDI for a chord question:
 *  - Level 2: uses fixedRoots specific to chordType (diatonic C major triads).
 *  - Levels 3+: picks a tonic from the level's allowed keys.
 */
function getChordRootMidi(level, chordType) {
  const def  = LEVEL_DEFS[level];
  const cDef = def.chords;
  if (!cDef) return 60;

  let noteClass;

  if (cDef.fixedRoots) {
    const roots = cDef.fixedRoots[chordType]
      || Object.values(cDef.fixedRoots).flat();
    const name  = roots[Math.floor(Math.random() * roots.length)];
    noteClass   = NOTE_NAME_TO_CLASS[name] ?? 0;
  } else {
    const keys  = def.keys;
    const key   = keys[Math.floor(Math.random() * keys.length)];
    noteClass   = KEY_TONICS[key] ?? 0;
  }

  // Find the first MIDI in the playable range that matches the note class
  for (let midi = 48; midi <= 65; midi++) {
    if (midi % 12 === noteClass) return midi;
  }
  return 60;
}

// ── DISTRACTOR SELECTION ──────────────────────────────────────

/**
 * Picks `count` plausible wrong answers from `pool`.
 * For intervals: prefers neighbours by semitone distance (most confusable).
 */
function getDistractors(correct, pool, count = 3) {
  let sorted = pool.filter(x => x !== correct);

  if (INTERVAL_DATA[correct]) {
    const cSt = INTERVAL_DATA[correct].semitones;
    sorted = sorted
      .filter(x => INTERVAL_DATA[x])
      .sort((a, b) =>
        Math.abs(INTERVAL_DATA[a].semitones - cSt) -
        Math.abs(INTERVAL_DATA[b].semitones - cSt)
      );
  }

  const result = sorted.slice(0, count);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── INTERVAL QUESTION ─────────────────────────────────────────

function generateIntervalQuestion(level, mode, lastQ) {
  const def    = LEVEL_DEFS[level];
  const intDef = def.intervals;

  // Select the correct pool for this mode
  let pool;
  if (mode === 'descending') {
    pool = intDef.desPool.length ? intDef.desPool : intDef.ascPool;
  } else if (mode === 'harmonic') {
    pool = intDef.harPool.length ? intDef.harPool : intDef.ascPool;
  } else {
    pool = intDef.ascPool;
  }

  // Avoid exact repeat of previous question
  let sym   = pool[Math.floor(Math.random() * pool.length)];
  let tries = 0;
  while (lastQ && lastQ.correctAnswer === sym && tries < 10) {
    sym = pool[Math.floor(Math.random() * pool.length)];
    tries++;
  }

  const data     = INTERVAL_DATA[sym];
  const semitones = data.semitones;
  const rootMidi  = getIntervalRootMidi(level, semitones);

  // Distractors come from the full set of intervals the student knows at this level
  const fullPool  = getAllIntervalsAtLevel(level);
  const distractors = getDistractors(sym, fullPool, 3);
  const options   = shuffle([sym, ...distractors]);

  return {
    type: 'interval',
    subtype: `${sym}_${mode}`,
    intervalSymbol: sym,
    semitones,
    mode,
    rootMidi,
    correctAnswer: sym,
    options,
  };
}

// ── CHORD QUESTION ────────────────────────────────────────────

function generateChordQuestion(level, lastQ) {
  const def  = LEVEL_DEFS[level];
  const cDef = def.chords;
  if (!cDef) return null;

  const pool = cDef.pool;
  let type   = pool[Math.floor(Math.random() * pool.length)];
  let tries  = 0;
  while (lastQ && lastQ.correctAnswer === type && tries < 10) {
    type = pool[Math.floor(Math.random() * pool.length)];
    tries++;
  }

  const rootMidi = getChordRootMidi(level, type);
  const data     = CHORD_DATA[type];

  // Ensure we always have exactly 4 options even with a small pool
  const others   = pool.filter(x => x !== type);
  const distractors = others.slice(0, 3);
  const options  = shuffle([type, ...distractors]);

  return {
    type:          'chord',
    subtype:       type,
    chordType:     type,
    rootMidi,
    formula:       data.formula,
    correctAnswer: type,
    options,
  };
}

// ── CADENCE QUESTION ──────────────────────────────────────────

function generateCadenceQuestion(level, lastQ) {
  const def  = LEVEL_DEFS[level];
  const cDef = def.cadences;
  if (!cDef) return null;

  const pool = cDef.pool;
  let type   = pool[Math.floor(Math.random() * pool.length)];
  let tries  = 0;
  while (lastQ && lastQ.correctAnswer === type && tries < 10) {
    type = pool[Math.floor(Math.random() * pool.length)];
    tries++;
  }

  const options = shuffle([...pool]).slice(0, 4);
  if (!options.includes(type)) options[0] = type;

  return {
    type:          'cadence',
    subtype:       type,
    cadenceType:   type,
    correctAnswer: type,
    options:       shuffle(options),
  };
}

// ── MODULATION QUESTION ───────────────────────────────────────

function generateModulationQuestion(level, lastQ) {
  const def  = LEVEL_DEFS[level];
  const mDef = def.modulation;
  if (!mDef) return null;

  const pool = mDef.pool;
  let type   = pool[Math.floor(Math.random() * pool.length)];

  const options = shuffle([...pool]).slice(0, 4);
  if (!options.includes(type)) options[0] = type;

  return {
    type:          'modulation',
    subtype:       type,
    modType:       type,
    correctAnswer: type,
    options:       shuffle(options),
  };
}

// ── DISPATCHER ───────────────────────────────────────────────

function generateQuestion(area, level) {
  const last = APP.lastQuestion;
  switch (area) {
    case 'intervals':  return generateIntervalQuestion(level, APP.trainMode, last);
    case 'chords':     return generateChordQuestion(level, last);
    case 'cadences':   return generateCadenceQuestion(level, last);
    case 'modulation': return generateModulationQuestion(level, last);
  }
}

function recordAnswer(area, subtype, level, given, correct, timeMs) {
  APP.data.answers.push({
    timestamp:     Date.now(),
    area, subtype, level,
    answerGiven:   given,
    correctAnswer: correct,
    isCorrect:     given === correct,
    responseTimeMs: timeMs,
  });
  saveData();
}
