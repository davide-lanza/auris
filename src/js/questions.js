function getDistractors(correct, pool, count = 3) {
  const correctData = INTERVAL_DATA[correct] || CHORD_DATA[correct];
  let sorted = pool.filter(x => x !== correct);

  if (INTERVAL_DATA[correct]) {
    const cSt = INTERVAL_DATA[correct].semitones;
    sorted = sorted
      .filter(x => INTERVAL_DATA[x])
      .sort((a, b) => Math.abs(INTERVAL_DATA[a].semitones - cSt) - Math.abs(INTERVAL_DATA[b].semitones - cSt));
  }

  const result = sorted.slice(0, count);
  // Shuffle result into random order
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

function generateIntervalQuestion(level, mode, lastQ) {
  const pool = INTERVAL_POOL[level] || INTERVAL_POOL[1];
  let sym = pool[Math.floor(Math.random() * pool.length)];
  // Avoid repeat
  let tries = 0;
  while (lastQ && lastQ.correctAnswer === sym && tries < 10) {
    sym = pool[Math.floor(Math.random() * pool.length)];
    tries++;
  }
  const data = INTERVAL_DATA[sym];
  const semitones = data.semitones;

  // Choose root note based on mode and interval size
  let rootMidi;
  if (mode === 'descending') {
    rootMidi = randomRootMidi(Math.max(36, 48 + semitones), Math.min(72, 64 + semitones));
    // For descending, root is the higher note
  } else {
    rootMidi = randomRootMidi(48, Math.min(64, 72 - semitones));
  }

  const distractors = getDistractors(sym, pool, 3);
  const options = shuffle([sym, ...distractors]);

  return {
    type: 'interval', subtype: sym + '_' + mode,
    intervalSymbol: sym, semitones, mode, rootMidi,
    correctAnswer: sym, options,
  };
}

function generateChordQuestion(level, lastQ) {
  const pool = CHORD_POOL[level] || CHORD_POOL[1];
  let type = pool[Math.floor(Math.random() * pool.length)];
  let tries = 0;
  while (lastQ && lastQ.correctAnswer === type && tries < 10) {
    type = pool[Math.floor(Math.random() * pool.length)];
    tries++;
  }
  const data = CHORD_DATA[type];
  const rootMidi = randomRootMidi(48, 60);
  const distractors = pool.filter(x => x !== type).slice(0, 3);
  const options = shuffle([type, ...distractors.slice(0, 3)]);

  return {
    type: 'chord', subtype: type,
    chordType: type, rootMidi, formula: data.formula,
    correctAnswer: type, options,
  };
}

function generateCadenceQuestion(level, lastQ) {
  const pool = level >= 6
    ? (level >= 8 ? ['perfect','imperfect','interrupted','plagal'] : ['perfect','imperfect','interrupted'])
    : ['perfect','imperfect'];
  let type = pool[Math.floor(Math.random() * pool.length)];
  let tries = 0;
  while (lastQ && lastQ.correctAnswer === type && tries < 10) {
    type = pool[Math.floor(Math.random() * pool.length)];
    tries++;
  }
  const options = shuffle(pool.length >= 4 ? pool : [...pool, ...['perfect','imperfect'].filter(x => !pool.includes(x))].slice(0,4));

  return {
    type: 'cadence', subtype: type,
    cadenceType: type,
    correctAnswer: type, options: options.slice(0,4),
  };
}

function generateModulationQuestion(level, lastQ) {
  const pool = level >= 8
    ? ['dominant','subdominant','rel_minor','rel_major','parallel']
    : ['dominant','subdominant','rel_minor'];
  let type = pool[Math.floor(Math.random() * pool.length)];
  const options = shuffle(pool).slice(0, Math.min(4, pool.length));
  if (!options.includes(type)) options[0] = type;

  return {
    type: 'modulation', subtype: type,
    modType: type,
    correctAnswer: type, options: shuffle(options),
  };
}

function generateQuestion(area, level) {
  const last = APP.lastQuestion;
  switch(area) {
    case 'intervals': return generateIntervalQuestion(level, APP.trainMode, last);
    case 'chords': return generateChordQuestion(level, last);
    case 'cadences': return generateCadenceQuestion(level, last);
    case 'modulation': return generateModulationQuestion(level, last);
  }
}

function recordAnswer(area, subtype, level, given, correct, timeMs) {
  APP.data.answers.push({
    timestamp: Date.now(), area, subtype, level,
    answerGiven: given, correctAnswer: correct,
    isCorrect: given === correct, responseTimeMs: timeMs,
  });
  saveData();
}
