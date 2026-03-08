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
    <div class="level-progress-bar-wrap">
      <div class="level-progress-bar" style="width:${lvlProgress}%"></div>
    </div>
    <div class="level-progress-text">${lvlProgress}% toward Level ${Math.min(level+1,8)} · ${LEVEL_NAMES[Math.min(level+1,8)]}</div>

    ${canUnlock && level < 8 ? `
    <div class="unlock-banner fade-in">
      <div class="unlock-title">🎉 Ready to advance!</div>
      <div class="unlock-sub">All areas at 90%+ for 3+ days</div>
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
    const modes = [
      { key: 'ascending', label: 'Melodic ↑' },
      { key: 'descending', label: 'Melodic ↓' },
      ...(level >= 3 ? [{ key: 'harmonic', label: 'Harmonic' }] : []),
    ];
    modeTabs = `<div class="train-mode-tabs">
      ${modes.map(m => `<div class="train-mode-tab${APP.trainMode === m.key ? ' active' : ''}" onclick="setTrainMode('${m.key}')">${m.label}</div>`).join('')}
    </div>`;
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
      <div style="font-size:13px;color:var(--dim);margin-top:2px">Tap any section to expand</div>
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

function theoryIntervalSection(level) {
  const pool = INTERVAL_POOL[level] || INTERVAL_POOL[1];
  const items = pool.map(sym => {
    const d = INTERVAL_DATA[sym];
    return `<div class="theory-item">
      <div class="theory-symbol">${sym}</div>
      <div class="theory-info">
        <div class="theory-name">${d.name}</div>
        <div class="theory-detail">${d.semitones} semitones · ${d.char}<br>${d.emoji} ${d.anchor}</div>
      </div>
      <button class="theory-listen-btn" onclick="theoryPlayInterval('${sym}')">▶</button>
    </div>`;
  }).join('');

  return `
    <div class="theory-section-header" onclick="toggleTheorySection(this)">
      <div class="theory-section-title">🎵 Intervals Reference</div>
      <div class="theory-chevron">▼</div>
    </div>
    <div class="theory-section-body">${items}</div>
  `;
}

function theoryChordSection(level) {
  const pool = CHORD_POOL[level] || CHORD_POOL[1];
  const items = pool.map(key => {
    const d = CHORD_DATA[key];
    const formulaStr = d.formula.join(' – ');
    return `<div class="theory-item">
      <div class="theory-symbol" style="font-size:11px">${d.symbol || 'maj'}</div>
      <div class="theory-info">
        <div class="theory-name">${d.name}</div>
        <div class="theory-detail">[${formulaStr}] · ${d.char}<br>${d.usage}</div>
      </div>
      <button class="theory-listen-btn" onclick="theoryPlayChord('${key}')">▶</button>
    </div>`;
  }).join('');

  return `
    <div class="theory-section-header" onclick="toggleTheorySection(this)">
      <div class="theory-section-title">🎹 Chords Reference</div>
      <div class="theory-chevron">▼</div>
    </div>
    <div class="theory-section-body">${items}</div>
  `;
}

function theoryCadenceSection(level) {
  const cadences = level >= 8
    ? Object.entries(CADENCE_DATA)
    : level >= 6
      ? [['perfect',CADENCE_DATA.perfect],['imperfect',CADENCE_DATA.imperfect],['interrupted',CADENCE_DATA.interrupted]]
      : level >= 4
        ? [['perfect',CADENCE_DATA.perfect],['imperfect',CADENCE_DATA.imperfect]]
        : [['perfect',CADENCE_DATA.perfect]];

  const items = cadences.map(([key, d]) =>
    `<div class="theory-item">
      <div class="theory-symbol" style="font-size:10px;line-height:1.3">${d.roman}</div>
      <div class="theory-info">
        <div class="theory-name">${d.name}</div>
        <div class="theory-detail">${d.desc}</div>
      </div>
      <button class="theory-listen-btn" onclick="theoryPlayCadence('${key}')">▶</button>
    </div>`
  ).join('');

  return `
    <div class="theory-section-header" onclick="toggleTheorySection(this)">
      <div class="theory-section-title">🔄 Cadences Reference</div>
      <div class="theory-chevron">▼</div>
    </div>
    <div class="theory-section-body">${items}</div>
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
  playInterval(60, d.semitones, 'ascending');
}

function theoryPlayChord(key) {
  const d = CHORD_DATA[key];
  if (!d) return;
  playChord(60, d.formula);
}

function theoryPlayCadence(key) {
  playCadence(key);
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

  // Metric bars
  const metricColor = (v) => v >= 90 ? 'var(--green)' : v >= 60 ? 'var(--yellow)' : 'var(--red)';
  const metrics = [
    { label: 'Accuracy', val: scores.accuracy, weight: '35%' },
    { label: 'Fluency', val: scores.fluency, weight: '25%' },
    { label: 'Retention', val: scores.retention, weight: '25%' },
    { label: 'Consistency', val: scores.consistency, weight: '15%' },
  ];
  const metricBars = metrics.map(m => `
    <div class="metric-row">
      <div class="metric-label">${m.label}</div>
      <div class="metric-bar-wrap"><div class="metric-bar" style="width:${m.val}%;background:${metricColor(m.val)}"></div></div>
      <div class="metric-val" style="color:${metricColor(m.val)}">${m.val}</div>
    </div>
  `).join('');

  // Item breakdown
  let itemRows = '';
  if (APP.progressArea === 'intervals') {
    const pool = INTERVAL_POOL[APP.data.user.currentLevel] || INTERVAL_POOL[1];
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
    const pool = CHORD_POOL[APP.data.user.currentLevel] || CHORD_POOL[1];
    pool.forEach(key => {
      const arr = (APP.data.answers || []).filter(a => a.area === 'chords' && a.subtype === key).slice(-20);
      const total = arr.length, correct = arr.filter(a => a.isCorrect).length;
      const pct = total ? Math.round(correct / total * 100) : null;
      const s = pct === null ? '⚪' : pct >= 90 ? '🟢' : pct >= 60 ? '🟡' : '🔴';
      const sc = pct === null ? 'var(--dim2)' : pct >= 90 ? 'var(--green)' : pct >= 60 ? 'var(--yellow)' : 'var(--red)';
      itemRows += `<div class="item-row"><div class="item-name">${CHORD_DATA[key]?.name || key}</div><div class="item-right"><div class="item-score" style="color:${sc}">${pct !== null ? pct + '%' : '—'}</div><div class="status-dot">${s}</div></div></div>`;
    });
  }

  const hasAnyData = getAnswersForArea(APP.progressArea).length > 0;

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
    </div>

    <div class="card">
      <div style="font-size:13px;font-weight:600;color:var(--dim);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px">14-Day History</div>
      ${hasAnyData ? buildLineChart(APP.progressArea) : '<div class="no-data">Practice to see your history</div>'}
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
