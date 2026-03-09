function getAnswersForArea(area) {
  return (APP.data.answers || []).filter(a => a.area === area);
}

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function computeAccuracy(answers) {
  if (!answers.length) return 0;
  const last30 = answers.slice(-30);
  // Group by day (max 10 per day)
  const byDay = {};
  last30.forEach(a => {
    const dk = dayKey(a.timestamp);
    if (!byDay[dk]) byDay[dk] = [];
    if (byDay[dk].length < 10) byDay[dk].push(a);
  });
  const days = Object.values(byDay);
  if (!days.length) return 0;
  const dayScores = days.map(dayAnswers => {
    const correct = dayAnswers.filter(a => a.isCorrect).length;
    return correct / dayAnswers.length;
  });
  return Math.round((dayScores.reduce((s,v) => s+v, 0) / dayScores.length) * 100);
}

function computeFluency(answers) {
  const correct = answers.filter(a => a.isCorrect).slice(-20);
  if (!correct.length) return 0;
  const scores = correct.map(a => {
    const t = a.responseTimeMs;
    if (t <= 4000)  return 100;
    if (t <= 6000)  return 80;
    if (t <= 8000)  return 60;
    if (t <= 12000) return 30;
    return 0;
  });
  return Math.round(scores.reduce((s,v) => s+v, 0) / scores.length);
}

function computeRetention(answers) {
  if (answers.length < 2) return 0;
  const last30 = answers.slice(-30);
  let weightedCorrect = 0, totalWeight = 0;
  for (let i = 1; i < last30.length; i++) {
    const gap = last30[i].timestamp - last30[i-1].timestamp;
    const w = gap >= 20 * 3600 * 1000 ? 3 : 1;
    weightedCorrect += last30[i].isCorrect ? w : 0;
    totalWeight += w;
  }
  if (!totalWeight) return 0;
  return Math.round((weightedCorrect / totalWeight) * 100);
}

function computeConsistency(answers) {
  if (!answers.length) return 0;
  const now = Date.now();
  const msPerDay = 86400000;
  const days14 = new Set();
  answers.forEach(a => {
    const daysAgo = Math.floor((now - a.timestamp) / msPerDay);
    if (daysAgo < 14) days14.add(dayKey(a.timestamp));
  });
  return Math.round((days14.size / 14) * 100);
}

function computeAreaScores(area) {
  const answers = getAnswersForArea(area);
  const accuracy = computeAccuracy(answers);
  const fluency = computeFluency(answers);
  const retention = computeRetention(answers);
  const overall = Math.round(accuracy * 0.40 + fluency * 0.30 + retention * 0.30);
  return { accuracy, fluency, retention, overall };
}

function computeItemScores(area) {
  // Per-interval or per-chord breakdown
  const answers = getAnswersForArea(area);
  const bySubtype = {};
  answers.forEach(a => {
    if (!bySubtype[a.subtype]) bySubtype[a.subtype] = [];
    bySubtype[a.subtype].push(a);
  });
  const result = {};
  Object.entries(bySubtype).forEach(([subtype, arr]) => {
    const last20 = arr.slice(-20);
    const correct = last20.filter(a => a.isCorrect).length;
    result[subtype] = last20.length ? Math.round(correct / last20.length * 100) : 0;
  });
  return result;
}

function computeLevelProgress() {
  const lvl = APP.data.user.currentLevel;
  const areas = getAreasByLevel(lvl);
  if (!areas.length) return 0;
  const progresses = areas.map(area => {
    const answers = getAnswersForArea(area);
    const s = computeAreaScores(area);
    const avg = (s.accuracy + s.fluency + s.retention) / 3;
    const answerP = Math.min(answers.length / 50, 1);
    const scoreP  = Math.min(avg / 85, 1);
    return (answerP + scoreP) / 2;
  });
  return Math.round(progresses.reduce((s,v) => s+v, 0) / progresses.length * 100);
}

function computeLevelProgressLabel() {
  const lvl = APP.data.user.currentLevel;
  const areas = getAreasByLevel(lvl);
  if (!areas.length) return '';
  // Find the bottleneck area (lowest combined progress)
  let worstArea = areas[0], worstP = Infinity;
  areas.forEach(area => {
    const answers = getAnswersForArea(area);
    const s = computeAreaScores(area);
    const avg = (s.accuracy + s.fluency + s.retention) / 3;
    const p = Math.min(answers.length / 50, 1) + Math.min(avg / 85, 1);
    if (p < worstP) { worstP = p; worstArea = area; }
  });
  const answers = getAnswersForArea(worstArea);
  const s = computeAreaScores(worstArea);
  const avg = Math.round((s.accuracy + s.fluency + s.retention) / 3);
  const prefix = areas.length > 1 ? `${AREA_CONFIG[worstArea].name}: ` : '';
  return `${prefix}${Math.min(answers.length, 50)}/50 answers · avg ${avg}% / 85%`;
}

function checkLevelUnlock() {
  const lvl = APP.data.user.currentLevel;
  if (lvl >= 8) return false;
  const areas = getAreasByLevel(lvl);
  if (!areas.length) return false;
  // Each area needs ≥ 50 answers AND avg(accuracy, fluency, retention) ≥ 85
  for (const area of areas) {
    const answers = getAnswersForArea(area);
    if (answers.length < 50) return false;
    const scores = computeAreaScores(area);
    const avg = Math.round((scores.accuracy + scores.fluency + scores.retention) / 3);
    if (avg < 85) return false;
  }
  return true;
}

// Returns the two raw unlock conditions for the bottleneck area — used by the home screen.
function computeUnlockGates() {
  const lvl = APP.data.user.currentLevel;
  if (lvl >= 8) return null;
  const areas = getAreasByLevel(lvl);
  if (!areas.length) return null;
  let worstArea = areas[0], worstP = Infinity;
  areas.forEach(area => {
    const answers = getAnswersForArea(area);
    const s = computeAreaScores(area);
    const avg = (s.accuracy + s.fluency + s.retention) / 3;
    const p = Math.min(answers.length / 50, 1) + Math.min(avg / 85, 1);
    if (p < worstP) { worstP = p; worstArea = area; }
  });
  const answers = getAnswersForArea(worstArea);
  const s = computeAreaScores(worstArea);
  const avg = Math.round((s.accuracy + s.fluency + s.retention) / 3);
  return {
    areaName:  areas.length > 1 ? AREA_CONFIG[worstArea].name : null,
    answers:   answers.length,
    avg,
  };
}

function getAreasByLevel(level) {
  return Object.entries(AREA_CONFIG)
    .filter(([, cfg]) => cfg.unlockLevel <= level)
    .map(([key]) => key);
}
