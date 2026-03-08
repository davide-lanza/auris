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
    if (t <= 2000) return 100;
    if (t <= 4000) return 80;
    if (t <= 6000) return 60;
    if (t <= 10000) return 30;
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
  const consistency = computeConsistency(answers);
  const overall = Math.round(accuracy * 0.35 + fluency * 0.25 + retention * 0.25 + consistency * 0.15);
  return { accuracy, fluency, retention, consistency, overall };
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
  const scores = areas.map(a => computeAreaScores(a).overall);
  if (!scores.length) return 0;
  return Math.round(scores.reduce((s,v) => s+v, 0) / scores.length);
}

function checkLevelUnlock() {
  const lvl = APP.data.user.currentLevel;
  if (lvl >= 8) return false;
  const areas = getAreasByLevel(lvl);
  if (!areas.length) return false;
  // Check all areas >= 90 for 3+ distinct days
  const now = Date.now();
  const msDay = 86400000;
  for (const area of areas) {
    const answers = getAnswersForArea(area);
    // Get days where area overall was >= 90
    const goodDays = new Set();
    // Simplified: check if current overall is >= 90 and answers span 3+ days
    const scores = computeAreaScores(area);
    if (scores.overall < 90) return false;
    answers.forEach(a => {
      const daysAgo = Math.floor((now - a.timestamp) / msDay);
      if (daysAgo < 30) goodDays.add(dayKey(a.timestamp));
    });
    if (goodDays.size < 3) return false;
  }
  return true;
}

function getAreasByLevel(level) {
  return Object.entries(AREA_CONFIG)
    .filter(([, cfg]) => cfg.unlockLevel <= level)
    .map(([key]) => key);
}
