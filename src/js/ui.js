function renderUnlockGates(level) {
  const nextLvl = Math.min(level + 1, 8);
  if (level >= 8) return `<div class="level-unlock-wrap"><div class="level-unlock-title">🏆 Maximum level reached</div></div>`;
  const gates = computeUnlockGates();
  if (!gates) return '';
  const answerPct = Math.min(gates.answers / 50, 1) * 100;
  const scorePct  = Math.min(gates.avg / 85, 1) * 100;
  const answerDone = gates.answers >= 50;
  const scoreDone  = gates.avg >= 85;
  const areaLabel  = gates.areaName ? ` <span style="font-size:11px;font-weight:400;color:var(--dim)">· ${gates.areaName}</span>` : '';
  const barColor   = (done) => done ? 'var(--green)' : 'var(--gold)';
  return `
    <div class="level-unlock-wrap fade-in">
      <div class="level-unlock-title">To unlock Level ${nextLvl} · ${LEVEL_NAMES[nextLvl]}${areaLabel}</div>
      <div class="luc-row">
        <div class="luc-label">Answers <strong style="color:${answerDone ? 'var(--green)' : 'var(--white)'}">${Math.min(gates.answers, 50)} / 50</strong> ${answerDone ? '✓' : ''}</div>
        <div class="luc-bar-wrap"><div class="luc-bar" style="width:${answerPct}%;background:${barColor(answerDone)}"></div></div>
      </div>
      <div class="luc-row">
        <div class="luc-label">Avg score <strong style="color:${scoreDone ? 'var(--green)' : 'var(--white)'}">${gates.avg}%</strong> / 85% ${scoreDone ? '✓' : ''}</div>
        <div class="luc-bar-wrap"><div class="luc-bar" style="width:${scorePct}%;background:${barColor(scoreDone)}"></div></div>
      </div>
    </div>`;
}

// ----- HOME -----
function renderHome(el) {
  const user = APP.data.user;
  const level = user.currentLevel;
  const lvlProgress = computeLevelProgress();
  const areas = Object.entries(AREA_CONFIG);

  let areaCards = areas.map(([key, cfg]) => {
    const locked = cfg.unlockLevel > level;
    const scores = computeAreaScores(key);
    const overall = scores.overall;
    const status = overall >= 90 ? '🟢' : overall >= 60 ? '🟡' : '🔴';
    const hasSomeData = getAnswersForArea(key).length > 0;

    return `<div class="area-card${locked ? ' locked' : ''}" onclick="${locked ? '' : `startTraining('${key}')`}">
      <span class="area-icon">${cfg.icon}</span>
      <div class="area-name">${cfg.name}</div>
      ${hasSomeData
        ? `<div class="area-score">${overall}<span style="font-size:16px;font-weight:500">%</span></div>
           <div class="area-score-label">Overall Score</div>
           <div class="area-status">${status}</div>`
        : `<div class="area-score-label" style="margin-top:4px;color:var(--dim)">No data yet</div>`
      }
      ${locked ? `<div class="area-lock">🔒</div><div style="position:absolute;bottom:10px;left:14px;font-size:10px;color:var(--dim)">Lvl ${cfg.unlockLevel}</div>` : ''}
    </div>`;
  }).join('');

  const canUnlock = checkLevelUnlock();

  el.innerHTML = `
    <div class="home-header fade-in">
      <div class="home-welcome">Welcome back,</div>
      <div style="font-size:26px;font-weight:800;margin-top:2px;">${user.name || 'Musician'}</div>
      <div class="home-level-badge" style="margin-top:10px">
        <span class="home-level-text">Level ${level} · ${LEVEL_NAMES[level]}</span>
      </div>
    </div>
    ${renderUnlockGates(level)}

    ${canUnlock && level < 8 ? `
    <div class="unlock-banner fade-in">
      <div class="unlock-title">🎉 Ready to advance!</div>
      <div class="unlock-sub">50+ answers · avg 85%+ on all three metrics</div>
      <button class="unlock-btn" onclick="unlockNextLevel()">Unlock Level ${level+1} →</button>
    </div>` : ''}

    <div class="home-section-title">Training Areas</div>
    <div class="area-grid fade-in">${areaCards}</div>
    <div class="spacer"></div>
  `;
}

// ----- TRAINING -----
function renderTraining(el) {
  const area = APP.trainArea;
  const cfg = AREA_CONFIG[area];
  const level = APP.data.user.currentLevel;

  let modeTabs = '';
  if (area === 'intervals') {
    const intDef = LEVEL_DEFS[level].intervals;
    const modes  = [];
    if (intDef.ascPool.length) modes.push({ key: 'ascending',  label: 'Melodic ↑' });
    if (intDef.desPool.length) modes.push({ key: 'descending', label: 'Melodic ↓' });
    if (intDef.harPool.length) modes.push({ key: 'harmonic',   label: 'Harmonic'   });

    // Reset to ascending if current mode is no longer available at this level
    if (!modes.find(m => m.key === APP.trainMode)) APP.trainMode = 'ascending';

    if (modes.length > 1) {
      modeTabs = `<div class="train-mode-tabs">
        ${modes.map(m => `<div class="train-mode-tab${APP.trainMode === m.key ? ' active' : ''}" onclick="setTrainMode('${m.key}')">${m.label}</div>`).join('')}
      </div>`;
    }
  }

  el.innerHTML = `
    ${modeTabs}
    <div id="question-area"></div>
  `;

  if (!APP.trainQuestion) {
    APP.trainQuestion = generateQuestion(area, level);
  }
  renderQuestion();
}

function setTrainMode(mode) {
  APP.trainMode = mode;
  APP.trainQuestion = null;
  APP.lastQuestion = null;
  renderScreen('training');
}

function renderQuestion() {
  const q = APP.trainQuestion;
  const area = APP.trainArea;
  const el = document.getElementById('question-area');
  if (!el || !q) return;

  APP.trainAnswered = false;
  APP.trainStartTime = null;

  let questionText = '';
  if (area === 'intervals') {
    const modeLabel = { ascending: 'ascending', descending: 'descending', harmonic: 'harmonic' }[q.mode];
    questionText = `What interval is this (${modeLabel})?`;
  } else if (area === 'chords') {
    questionText = 'What chord is this?';
  } else if (area === 'cadences') {
    questionText = 'What type of cadence is this?';
  } else if (area === 'modulation') {
    questionText = 'Where does this passage modulate to?';
  }

  const optionBtns = q.options.map(opt => {
    let label = '';
    if (area === 'intervals') label = INTERVAL_DATA[opt]?.name || opt;
    else if (area === 'chords') label = CHORD_DATA[opt]?.name || opt;
    else if (area === 'cadences') label = CADENCE_DATA[opt]?.name || opt;
    else if (area === 'modulation') label = MODULATION_DATA[opt]?.name || opt;
    return `<button class="answer-btn" id="abtn-${opt}" onclick="handleAnswer('${opt}')">${label}</button>`;
  }).join('');

  el.innerHTML = `
    <div class="question-card fade-in">
      <div class="q-label">Listen carefully</div>
      <div class="q-main">${questionText}</div>
      <button class="play-btn" id="play-btn" onclick="playQuestion()">▶</button>
      <div class="play-btn-label">Tap to play</div>
    </div>
    <div class="answer-grid">${optionBtns}</div>
    <div class="feedback-card" id="feedback-card"></div>
    <button class="next-btn" id="next-btn" onclick="nextQuestion()">Next →</button>
  `;
}

function playQuestion() {
  const q = APP.trainQuestion;
  if (!q) return;
  APP.trainStartTime = Date.now();
  const btn = document.getElementById('play-btn');
  if (btn) { btn.classList.add('playing'); setTimeout(() => btn && btn.classList.remove('playing'), 500); }

  if (q.type === 'interval') {
    playInterval(q.rootMidi, q.semitones, q.mode);
  } else if (q.type === 'chord') {
    playChord(q.rootMidi, q.formula);
  } else if (q.type === 'cadence') {
    playCadence(q.cadenceType);
  } else if (q.type === 'modulation') {
    playModulation(q.modType);
  }
}

function handleAnswer(given) {
  if (APP.trainAnswered) return;
  APP.trainAnswered = true;

  const q = APP.trainQuestion;
  const correct = q.correctAnswer;
  const isCorrect = given === correct;
  const responseTime = APP.trainStartTime ? Date.now() - APP.trainStartTime : 9999;

  // Record
  recordAnswer(APP.trainArea, q.subtype, APP.data.user.currentLevel, given, correct, responseTime);

  // Update button styles
  q.options.forEach(opt => {
    const btn = document.getElementById('abtn-' + opt);
    if (!btn) return;
    btn.classList.add('disabled');
    if (opt === correct) btn.classList.add('correct');
    else if (opt === given && !isCorrect) btn.classList.add('wrong');
    else btn.style.opacity = '0.3';
  });

  // Show feedback
  showFeedback(isCorrect, q, responseTime);

  // Error comparison: play the wrong answer then the correct one
  if (!isCorrect && APP.data.settings.playComparison !== false) {
    playErrorComparison(q, given);
  }
}

function showFeedback(isCorrect, q, responseTime) {
  const fbCard = document.getElementById('feedback-card');
  const nextBtn = document.getElementById('next-btn');
  if (!fbCard) return;

  let info = '';
  let anchor = '';
  let pianoHTML = '';

  if (q.type === 'interval') {
    const d = INTERVAL_DATA[q.correctAnswer];
    const root = midiToNote(q.rootMidi);
    const second = midiToNote(q.mode === 'descending' ? q.rootMidi + q.semitones : q.rootMidi + q.semitones);
    const activeMidis = q.mode === 'descending'
      ? [q.rootMidi, q.rootMidi + q.semitones]
      : [q.rootMidi, q.rootMidi + q.semitones];
    info = `<strong>${d.name}</strong> — ${d.semitones} semitone${d.semitones !== 1 ? 's' : ''}`;
    anchor = `${d.emoji} ${d.anchor}`;
    pianoHTML = `<div class="piano-wrap"><div class="piano-label">Notes heard</div>${buildPianoSVG(activeMidis, 48, 2)}</div>`;
  } else if (q.type === 'chord') {
    const d = CHORD_DATA[q.correctAnswer];
    const midis = d.formula.map(f => q.rootMidi + f);
    const noteNames = midis.map(midiToNoteFull).join(' – ');
    info = `<strong>${d.name}</strong> — ${noteNames}<br><em>${d.char}</em>`;
    pianoHTML = `<div class="piano-wrap"><div class="piano-label">Chord notes</div>${buildPianoSVG(midis, 48, 2)}</div>`;
  } else if (q.type === 'cadence') {
    const d = CADENCE_DATA[q.correctAnswer];
    info = `<strong>${d.name}</strong> (${d.roman})<br>${d.desc}`;
  } else if (q.type === 'modulation') {
    const d = MODULATION_DATA[q.correctAnswer];
    info = `<strong>${d.name}</strong><br>${d.desc}`;
  }

  const timeStr = APP.trainStartTime ? `${(responseTime / 1000).toFixed(1)}s` : '';

  fbCard.style.display = 'block';
  fbCard.innerHTML = `
    <div class="feedback-result ${isCorrect ? 'correct-text' : 'wrong-text'}">${isCorrect ? '✓ Correct!' : '✗ Incorrect'} ${timeStr ? `<span style="font-size:13px;font-weight:400;color:var(--dim)"> · ${timeStr}</span>` : ''}</div>
    <div class="feedback-info">${info}</div>
    ${anchor ? `<div class="feedback-anchor">${anchor}</div>` : ''}
  `;

  if (pianoHTML) fbCard.insertAdjacentHTML('afterend', pianoHTML);

  if (nextBtn) nextBtn.style.display = 'block';
}

function nextQuestion() {
  if (APP.comparisonTimer) { clearTimeout(APP.comparisonTimer); APP.comparisonTimer = null; }
  APP.lastQuestion = APP.trainQuestion;
  APP.trainQuestion = generateQuestion(APP.trainArea, APP.data.user.currentLevel);

  // Remove old piano if present
  const pianoWraps = document.querySelectorAll('.piano-wrap');
  pianoWraps.forEach(el => el.remove());

  renderQuestion();
}

// ----- THEORY -----
function renderTheory(el) {
  const level = APP.data.user.currentLevel;

  el.innerHTML = `
    <div style="padding:16px 16px 8px">
      <div style="font-size:20px;font-weight:800">Theory Reference</div>
      <div style="font-size:13px;color:var(--dim);margin-top:2px">Complete curriculum — all 8 levels · tap to expand</div>
      <div style="font-size:11px;color:var(--dim);margin-top:4px">
        <span style="color:var(--green);font-weight:700">Lv ≤ ${level}</span> unlocked &nbsp;·&nbsp;
        <span style="color:var(--gold);font-weight:700">Lv ${level}</span> current &nbsp;·&nbsp;
        <span style="color:var(--dim2);font-weight:700">🔒 future</span>
      </div>
    </div>

    <div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;margin:0 16px 12px;overflow:hidden">
      ${theoryIntervalSection(level)}
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;margin:0 16px 12px;overflow:hidden">
      ${theoryChordSection(level)}
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;margin:0 16px 12px;overflow:hidden">
      ${theoryCadenceSection(level)}
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;margin:0 16px 12px;overflow:hidden">
      ${theoryPracticeSection()}
    </div>
    <div class="spacer"></div>
  `;
}

function theoryLvlBadge(introLv, currentLv) {
  const locked = introLv > currentLv;
  const color  = locked ? 'var(--dim2)' : introLv === currentLv ? 'var(--gold)' : 'var(--green)';
  return `<span style="font-size:9px;font-weight:700;letter-spacing:0.06em;color:${color};background:rgba(255,255,255,0.05);border-radius:4px;padding:1px 5px;margin-bottom:3px;display:inline-block">Lv${introLv}${locked ? ' 🔒' : ''}</span>`;
}

function theoryIntervalSection(level) {
  // Show ALL intervals across all levels, sorted by semitones
  const allSyms = Object.keys(INTERVAL_DATA).sort((a, b) => INTERVAL_DATA[a].semitones - INTERVAL_DATA[b].semitones);
  const items = allSyms.map(sym => {
    const d   = INTERVAL_DATA[sym];
    const mel = INTERVAL_MELODIES[sym];
    const melAsc = mel && mel.asc;
    const melDes = mel && mel.des;
    const introLv = getLevelIntroduced('interval', sym);
    const locked  = introLv > level;
    const melBtns = melAsc
      ? `<div class="theory-mel-btns">
          <button class="theory-mel-btn" onclick="theoryPlayMelody('${sym}','asc')">🎵 ${melAsc.song}</button>
          ${melDes ? `<button class="theory-mel-btn" onclick="theoryPlayMelody('${sym}','des')">🎵 ${melDes.song} ↓</button>` : ''}
        </div>`
      : '';
    return `<div class="theory-item${locked ? ' theory-item-future' : ''}">
      <div class="theory-symbol">${sym}</div>
      <div class="theory-info">
        ${theoryLvlBadge(introLv, level)}
        <div class="theory-name">${d.name}</div>
        <div class="theory-detail">${d.semitones} semitone${d.semitones !== 1 ? 's' : ''} · ${d.char}</div>
        <div class="theory-anchor">${d.emoji} ${d.anchor}</div>
        ${melBtns}
      </div>
      <button class="theory-listen-btn" onclick="theoryPlayInterval('${sym}')">▶</button>
    </div>`;
  }).join('');

  return `
    <div class="theory-section-header" onclick="toggleTheorySection(this)">
      <div class="theory-section-title">🎵 Intervals — Complete Reference</div>
      <div class="theory-chevron">▼</div>
    </div>
    <div class="theory-section-body">${items}</div>
  `;
}

function theoryChordSection(level) {
  // Show ALL chord types across all levels
  const items = Object.entries(CHORD_DATA).map(([key, d]) => {
    const introLv = getLevelIntroduced('chord', key);
    const locked  = introLv > level;
    const formulaStr = d.formula.join(' – ');
    return `<div class="theory-item${locked ? ' theory-item-future' : ''}">
      <div class="theory-symbol" style="font-size:11px">${d.symbol || 'maj'}</div>
      <div class="theory-info">
        ${theoryLvlBadge(introLv, level)}
        <div class="theory-name">${d.name}</div>
        <div class="theory-detail">[${formulaStr}] · ${d.char}</div>
        <div class="theory-anchor" style="color:var(--dim)">${d.usage}</div>
      </div>
      <button class="theory-listen-btn" onclick="theoryPlayChord('${key}')">▶</button>
    </div>`;
  }).join('');

  return `
    <div class="theory-section-header" onclick="toggleTheorySection(this)">
      <div class="theory-section-title">🎹 Chords — Complete Reference</div>
      <div class="theory-chevron">▼</div>
    </div>
    <div class="theory-section-body">${items}</div>
  `;
}

function theoryCadenceSection(level) {
  // Show ALL cadences
  const cadItems = Object.entries(CADENCE_DATA).map(([key, d]) => {
    const introLv = getLevelIntroduced('cadence', key);
    const locked  = introLv > level;
    return `<div class="theory-item${locked ? ' theory-item-future' : ''}">
      <div class="theory-symbol" style="font-size:10px;line-height:1.3">${d.roman}</div>
      <div class="theory-info">
        ${theoryLvlBadge(introLv, level)}
        <div class="theory-name">${d.name}</div>
        <div class="theory-detail">${d.desc}</div>
      </div>
      <button class="theory-listen-btn" onclick="theoryPlayCadence('${key}')">▶</button>
    </div>`;
  }).join('');

  // Show ALL modulations
  const modItems = Object.entries(MODULATION_DATA).map(([key, d]) => {
    const introLv = getLevelIntroduced('modulation', key);
    const locked  = introLv > level;
    return `<div class="theory-item${locked ? ' theory-item-future' : ''}">
      <div class="theory-symbol" style="font-size:9px;line-height:1.3">mod</div>
      <div class="theory-info">
        ${theoryLvlBadge(introLv, level)}
        <div class="theory-name">${d.name}</div>
        <div class="theory-detail">${d.desc}</div>
      </div>
    </div>`;
  }).join('');

  return `
    <div class="theory-section-header" onclick="toggleTheorySection(this)">
      <div class="theory-section-title">🔄 Cadences — Complete Reference</div>
      <div class="theory-chevron">▼</div>
    </div>
    <div class="theory-section-body">${cadItems}</div>
    <div class="theory-section-header" onclick="toggleTheorySection(this)" style="border-top:1px solid var(--border)">
      <div class="theory-section-title">🌍 Modulation — Complete Reference</div>
      <div class="theory-chevron">▼</div>
    </div>
    <div class="theory-section-body">${modItems}</div>
  `;
}

function theoryPracticeSection() {
  return `
    <div class="theory-section-header" onclick="toggleTheorySection(this)">
      <div class="theory-section-title">📖 Daily Practice Guide</div>
      <div class="theory-chevron">▼</div>
    </div>
    <div class="theory-section-body" style="padding:16px">
      <div style="font-size:15px;font-weight:700;margin-bottom:10px;color:var(--gold-bright)">The 10-Minute Daily Routine</div>
      <div style="font-size:13px;color:var(--dim);line-height:1.7">
        1. <strong style="color:var(--white)">2 min</strong> — Review theory: read through the intervals/chords you struggle with<br>
        2. <strong style="color:var(--white)">5 min</strong> — Active training: do at least 20 questions on your weakest area<br>
        3. <strong style="color:var(--white)">3 min</strong> — Apply: sing the intervals using melodic anchors on your instrument
      </div>
      <div style="font-size:15px;font-weight:700;margin:16px 0 10px;color:var(--gold-bright)">Why Faster = Better Learned</div>
      <div style="font-size:13px;color:var(--dim);line-height:1.7">
        Fast recognition means the interval/chord has moved from conscious analysis to automatic pattern recognition — the same way a fluent reader doesn't sound out letters. Aim for under 2 seconds for full marks.
      </div>
      <div style="font-size:15px;font-weight:700;margin:16px 0 10px;color:var(--gold-bright)">Using Melodic Anchors</div>
      <div style="font-size:13px;color:var(--dim);line-height:1.7">
        Each interval has a "anchor" song. When you hear an interval, instantly recall that song in your mind. Over time, this mental bridge becomes instantaneous. Practice singing the anchor aloud.
      </div>
      <div style="font-size:15px;font-weight:700;margin:16px 0 10px;color:var(--gold-bright)">Active Listening Method</div>
      <div style="font-size:13px;color:var(--dim);line-height:1.7">
        Don't just tap random answers. Before answering:<br>
        1. Close your eyes and let the sound resonate<br>
        2. Sing the interval/chord internally<br>
        3. Match it to your melodic anchor<br>
        4. Then answer — fast but considered
      </div>
    </div>
  `;
}

function toggleTheorySection(header) {
  const body = header.nextElementSibling;
  const chevron = header.querySelector('.theory-chevron');
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
}

function theoryPlayInterval(sym) {
  const d = INTERVAL_DATA[sym];
  if (!d) return;
  stopTheoryAudio();
  _theoryNote(60, 1.5, 0);
  _theoryNote(60 + d.semitones, 1.5, 650);
}

function theoryPlayMelody(sym, direction) {
  const entry = INTERVAL_MELODIES[sym];
  if (!entry) return;
  const mel = entry[direction] || entry.asc;
  if (!mel) return;
  stopTheoryAudio();
  let ms = 0;
  mel.notes.forEach(({ st, dur }) => {
    const secs = DUR_SECS[dur] || 0.75;
    _theoryNote(60 + st, secs * 0.9, ms);
    ms += secs * 1000;
  });
}

function theoryPlayChord(key) {
  const d = CHORD_DATA[key];
  if (!d) return;
  stopTheoryAudio();
  d.formula.forEach((f, i) => _theoryNote(60 + f, 2, i * 120));
}

function theoryPlayCadence(key) {
  const prog = CADENCE_CHORDS[key];
  if (!prog) return;
  stopTheoryAudio();
  prog.forEach((chord, ci) => {
    chord.forEach((midi, ni) => _theoryNote(midi, 1.8, ci * 2200 + ni * 80));
  });
}

// ----- PROGRESS -----
function renderProgress(el) {
  const areas = getAreasByLevel(APP.data.user.currentLevel);

  // Tabs
  const tabs = areas.map(a => `
    <button class="progress-tab${APP.progressArea === a ? ' active' : ''}" onclick="setProgressArea('${a}')">${AREA_CONFIG[a].icon} ${AREA_CONFIG[a].name}</button>
  `).join('');

  if (!APP.progressArea || !areas.includes(APP.progressArea)) {
    APP.progressArea = areas[0] || 'intervals';
  }
  const area = APP.progressArea;

  const scores = computeAreaScores(APP.progressArea);
  const itemScores = computeItemScores(APP.progressArea);
  const status = scores.overall >= 90 ? '🟢' : scores.overall >= 60 ? '🟡' : '🔴';
  const statusColor = scores.overall >= 90 ? 'var(--green)' : scores.overall >= 60 ? 'var(--yellow)' : 'var(--red)';

  // Metric bars with explanations
  const metricColor = (v) => v >= 90 ? 'var(--green)' : v >= 60 ? 'var(--yellow)' : 'var(--red)';
  const metricDesc = {
    Accuracy:  'Correct answers over your last 30 questions, averaged by session (max 10/day). Core measure of how well you recognise this area.',
    Fluency:   'How quickly you answer correctly. Under 4 s = full marks, scaling down to 0 at 12 s. Speed means the pattern is automatic, not just analysed.',
    Retention: 'Weighted accuracy that gives extra credit when you answer correctly after a long break (≥ 20 h gap). High retention means the knowledge is truly sticking.',
  };
  const metrics = [
    { label: 'Accuracy',  val: scores.accuracy  },
    { label: 'Fluency',   val: scores.fluency   },
    { label: 'Retention', val: scores.retention },
  ];
  const metricBars = metrics.map(m => `
    <div class="metric-row">
      <div class="metric-label">${m.label}</div>
      <div class="metric-bar-wrap"><div class="metric-bar" style="width:${m.val}%;background:${metricColor(m.val)}"></div></div>
      <div class="metric-val" style="color:${metricColor(m.val)}">${m.val}</div>
    </div>
    <div class="metric-desc">${metricDesc[m.label]}</div>
  `).join('');

  // Item breakdown
  let itemRows = '';
  if (APP.progressArea === 'intervals') {
    const pool = getAllIntervalsAtLevel(APP.data.user.currentLevel);
    pool.forEach(sym => {
      // Aggregate ascending + descending + harmonic
      const subtypes = [sym + '_ascending', sym + '_descending', sym + '_harmonic'];
      let total = 0, correct = 0;
      (APP.data.answers || []).filter(a => a.area === 'intervals' && subtypes.some(s => a.subtype === s)).slice(-20).forEach(a => {
        total++; if (a.isCorrect) correct++;
      });
      const pct = total ? Math.round(correct / total * 100) : null;
      const s = pct === null ? '⚪' : pct >= 90 ? '🟢' : pct >= 60 ? '🟡' : '🔴';
      const sc = pct === null ? 'var(--dim2)' : pct >= 90 ? 'var(--green)' : pct >= 60 ? 'var(--yellow)' : 'var(--red)';
      itemRows += `<div class="item-row"><div class="item-name">${INTERVAL_DATA[sym]?.name || sym}</div><div class="item-right"><div class="item-score" style="color:${sc}">${pct !== null ? pct + '%' : '—'}</div><div class="status-dot">${s}</div></div></div>`;
    });
  } else if (APP.progressArea === 'chords') {
    const chordDef = LEVEL_DEFS[APP.data.user.currentLevel].chords;
    const pool = chordDef ? chordDef.pool : [];
    pool.forEach(key => {
      const arr = (APP.data.answers || []).filter(a => a.area === 'chords' && a.subtype === key).slice(-20);
      const total = arr.length, correct = arr.filter(a => a.isCorrect).length;
      const pct = total ? Math.round(correct / total * 100) : null;
      const s = pct === null ? '⚪' : pct >= 90 ? '🟢' : pct >= 60 ? '🟡' : '🔴';
      const sc = pct === null ? 'var(--dim2)' : pct >= 90 ? 'var(--green)' : pct >= 60 ? 'var(--yellow)' : 'var(--red)';
      itemRows += `<div class="item-row"><div class="item-name">${CHORD_DATA[key]?.name || key}</div><div class="item-right"><div class="item-score" style="color:${sc}">${pct !== null ? pct + '%' : '—'}</div><div class="status-dot">${s}</div></div></div>`;
    });
  }

  const totalAnswers = getAnswersForArea(APP.progressArea).length;
  const unlockAvg = Math.round((scores.accuracy + scores.fluency + scores.retention) / 3);
  const unlockProgress = `${Math.min(totalAnswers, 50)}/50 answers · avg ${unlockAvg}% / 85% target`;

  el.innerHTML = `
    <div style="padding:16px 16px 4px">
      <div style="font-size:20px;font-weight:800">Progress</div>
    </div>
    <div class="progress-tabs">${tabs}</div>

    <div class="card fade-in">
      <div style="display:flex;align-items:flex-end;gap:12px;margin-bottom:16px">
        <div>
          <div class="big-score" style="color:${statusColor}">${scores.overall}</div>
          <div class="overall-label">Overall Score ${status}</div>
        </div>
        <div style="flex:1">
          ${buildRadarChart(scores)}
        </div>
      </div>
      ${metricBars}
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);font-size:11px;color:var(--dim)">
        Level unlock: ${unlockProgress}
      </div>
    </div>

    <div class="card">
      <div style="font-size:13px;font-weight:600;color:var(--dim);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px">Recent Trend · last 50 answers</div>
      <div style="font-size:11px;color:var(--dim);margin-bottom:8px">
        <span style="color:rgba(91,191,138,0.7)">● correct</span> &nbsp;
        <span style="color:rgba(224,96,96,0.6)">● wrong</span> &nbsp;
        <span style="color:var(--gold)">— rolling 10-answer accuracy</span>
      </div>
      ${buildRollingAccuracyChart(APP.progressArea)}
    </div>

    ${itemRows ? `
    <div class="card">
      <div style="font-size:13px;font-weight:600;color:var(--dim);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px">Item Breakdown</div>
      ${itemRows}
    </div>` : ''}

    <div class="spacer"></div>
  `;
}

function setProgressArea(area) {
  APP.progressArea = area;
  renderScreen('progress');
}

// ----- SETTINGS -----
function renderSettings(el) {
  const user = APP.data.user;
  const totalAnswers = (APP.data.answers || []).length;
  const today = new Date().toISOString().split('T')[0];

  el.innerHTML = `
    <div style="padding:16px 16px 8px">
      <div style="font-size:20px;font-weight:800">Settings</div>
    </div>

    <div class="card fade-in">
      <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--dim);margin-bottom:12px">Your Profile</div>
      <div class="settings-row">
        <div class="settings-label">Name</div>
        <input class="settings-input" id="settings-name" value="${user.name || ''}" onchange="saveName(this.value)" placeholder="Your name">
      </div>
      <div class="settings-row">
        <div class="settings-label">Current Level</div>
        <div style="font-size:15px;font-weight:700;color:var(--gold)">Level ${user.currentLevel} · ${LEVEL_NAMES[user.currentLevel]}</div>
      </div>
      <div class="settings-row" style="border-bottom:none">
        <div class="settings-label">Total Answers</div>
        <div style="font-size:15px;color:var(--dim)">${totalAnswers}</div>
      </div>
    </div>

    <div class="card">
      <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--dim);margin-bottom:12px">Training</div>
      <div class="settings-row" style="border-bottom:none">
        <div>
          <div class="settings-label">Error comparison</div>
          <div style="font-size:12px;color:var(--dim);margin-top:2px">After a wrong answer, play your choice then the correct one</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" ${APP.data.settings.playComparison !== false ? 'checked' : ''} onchange="saveComparison(this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="card">
      <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--dim);margin-bottom:12px">Data</div>
      <div class="settings-row">
        <div class="settings-label">Export Backup</div>
        <button class="settings-btn" onclick="exportBackup()">Export JSON</button>
      </div>
      <div class="settings-row">
        <div class="settings-label">Import Backup</div>
        <button class="settings-btn" onclick="document.getElementById('import-file').click()">Import JSON</button>
      </div>
      <div class="settings-row" style="border-bottom:none">
        <div class="settings-label">Reset All Data</div>
        <button class="settings-btn danger" onclick="confirmReset()">Reset</button>
      </div>
    </div>

    <div class="card">
      <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--dim);margin-bottom:12px">About</div>
      <div class="about-text">
        <span class="about-highlight" style="font-size:18px;font-weight:800">Auris v1.0</span><br>
        Ear Training by Davide · Dear Piano<br><br>
        Developed by <span class="about-highlight">Davide from Dear Piano</span><br>
        Powered by <span class="about-highlight">Claudio, the digital slave</span><br><br>
        Piano samples: Salamander Grand Piano<br>
        Audio engine: Tone.js + Web Audio API
      </div>
    </div>
    <div class="spacer"></div>
  `;
}

function saveComparison(val) {
  APP.data.settings.playComparison = val;
  saveData();
}

function saveName(name) {
  APP.data.user.name = name.trim();
  saveData();
  const hw = document.querySelector('.home-welcome + div');
  if (hw) hw.textContent = name || 'Musician';
}

function exportBackup() {
  const name = (APP.data.user.name || 'user').replace(/\s+/g, '-').toLowerCase();
  const date = new Date().toISOString().split('T')[0];
  const filename = `auris-backup-${name}-${date}.json`;
  const blob = new Blob([JSON.stringify(APP.data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const imported = JSON.parse(ev.target.result);
      if (imported.user && imported.answers) {
        APP.data = imported;
        saveData();
        renderScreen('settings');
        alert('Backup imported successfully!');
      } else {
        alert('Invalid backup file.');
      }
    } catch(err) {
      alert('Could not read backup file.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function confirmReset() {
  showModal(
    'Reset All Data',
    'This will permanently delete all your progress, scores, and history. This cannot be undone.',
    () => {
      APP.data = defaultData();
      saveData();
      closeModal();
      APP.data.user.onboardingComplete = false;
      saveData();
      location.reload();
    }
  );
}

function unlockNextLevel() {
  const lvl = APP.data.user.currentLevel;
  if (lvl >= 8) return;
  APP.data.user.currentLevel = lvl + 1;
  if (!APP.data.user.unlockedLevels.includes(lvl + 1)) {
    APP.data.user.unlockedLevels.push(lvl + 1);
  }
  saveData();
  renderScreen('home');
}

function showModal(title, body, onConfirm) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').textContent = body;
  const btn = document.getElementById('modal-confirm-btn');
  btn.onclick = onConfirm;
  document.getElementById('modal-overlay').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

function showTrainingHeader(area) {
  const titleEl = document.getElementById('header-title');
  const backBtn = document.getElementById('header-back');
  const cfg = AREA_CONFIG[area];
  titleEl.textContent = `${cfg.icon} ${cfg.name}`;
  backBtn.style.display = 'flex';
  document.getElementById('bottom-nav').style.display = 'none';
  document.getElementById('header-badge').style.display = 'none';
}
