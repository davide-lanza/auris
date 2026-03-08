'use strict';

// ============================================================
// NOTE UTILITIES
// ============================================================

function noteToMidi(note) {
  const m = note.match(/^([A-G]#?)(\d+)$/);
  if (!m) return 60;
  return NOTE_NAMES.indexOf(m[1]) + (parseInt(m[2]) + 1) * 12;
}

function midiToNote(midi) {
  const oct = Math.floor(midi / 12) - 1;
  return NOTE_NAMES[midi % 12] + oct;
}

function midiToNoteFull(midi) {
  return NOTE_NAMES[midi % 12];
}

function randomRootMidi(minMidi = 48, maxMidi = 64) {
  return Math.floor(Math.random() * (maxMidi - minMidi + 1)) + minMidi;
}

// ============================================================
// STATE
// ============================================================

const APP = {
  data: null,
  sampler: null,
  audioReady: false,
  currentScreen: 'home',
  trainArea: null,
  trainMode: 'ascending',
  trainQuestion: null,
  trainAnswered: false,
  trainStartTime: null,
  progressArea: 'intervals',
  lastQuestion: null,
};

// ============================================================
// NAVIGATION
// ============================================================

function navigate(screen) {
  // Hide training mode if switching away
  APP.trainArea = null;
  APP.trainQuestion = null;
  APP.currentScreen = screen;
  updateNav(screen);
  renderScreen(screen);
  updateHeader(screen);
}

function goBack() {
  document.getElementById('bottom-nav').style.display = 'flex';
  navigate('home');
}

function updateNav(active) {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.nav === active);
  });
  document.getElementById('bottom-nav').style.display = 'flex';
}

function updateHeader(screen) {
  const titleEl = document.getElementById('header-title');
  const badgeEl = document.getElementById('header-badge');
  const backBtn = document.getElementById('header-back');
  const titles = { home: 'Auris', theory: 'Theory', progress: 'Progress', settings: 'Settings' };
  titleEl.textContent = titles[screen] || 'Auris';
  backBtn.style.display = 'none';
  badgeEl.style.display = screen === 'home' ? 'block' : 'none';
  if (screen === 'home') {
    const lvl = APP.data.user.currentLevel;
    badgeEl.textContent = `Lv${lvl} · ${LEVEL_NAMES[lvl]}`;
  }
}

function renderScreen(name) {
  const el = document.getElementById('main-content');
  if (!el) return;

  // Remove old piano wraps
  document.querySelectorAll('.piano-wrap').forEach(p => p.remove());

  el.scrollTop = 0;
  el.innerHTML = '';

  switch(name) {
    case 'home':     renderHome(el); break;
    case 'training': renderTraining(el); break;
    case 'theory':   renderTheory(el); break;
    case 'progress': renderProgress(el); break;
    case 'settings': renderSettings(el); break;
  }
}

// ============================================================
// ONBOARDING & INIT
// ============================================================

function onAudioReady() {
  document.getElementById('loading-screen').style.display = 'none';
  loadData();

  if (!APP.data.user.onboardingComplete) {
    showOnboarding();
  } else {
    showApp();
  }
}

function showOnboarding() {
  const ob = document.getElementById('onboarding-screen');
  ob.style.display = 'flex';
  const nameInput = document.getElementById('ob-name-input');
  if (APP.data.user.name) nameInput.value = APP.data.user.name;
  nameInput.focus();
}

function completeOnboarding() {
  const nameInput = document.getElementById('ob-name-input');
  const name = nameInput.value.trim();
  if (!name) { nameInput.focus(); nameInput.style.borderColor = 'var(--red)'; return; }
  APP.data.user.name = name;
  APP.data.user.onboardingComplete = true;
  saveData();
  document.getElementById('onboarding-screen').style.display = 'none';
  showApp();
}

function showApp() {
  const appEl = document.getElementById('app');
  appEl.style.display = 'flex';
  navigate('home');
}

function startTraining(area) {
  APP.trainArea = area;
  APP.trainMode = 'ascending';
  APP.trainAnswered = false;
  APP.trainQuestion = null;
  APP.lastQuestion = null;
  APP.currentScreen = 'training';
  showTrainingHeader(area);
  renderScreen('training');
}

// ============================================================
// BOOT
// ============================================================

window.addEventListener('DOMContentLoaded', () => {
  // Show load button immediately
  // Audio will be loaded when user taps
});

// Handle back swipe / button on training
window.addEventListener('popstate', () => {
  if (APP.currentScreen === 'training') {
    navigate('home');
  }
});
