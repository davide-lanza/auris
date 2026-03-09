function defaultData() {
  return {
    user: { name: '', currentLevel: 1, unlockedLevels: [1], onboardingComplete: false, createdAt: Date.now() },
    answers: [],
    settings: {}
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem('auris_data');
    APP.data = raw ? JSON.parse(raw) : defaultData();
    if (!APP.data.user) APP.data.user = defaultData().user;
    if (!APP.data.answers) APP.data.answers = [];
    if (!APP.data.settings) APP.data.settings = {};
  } catch(e) {
    APP.data = defaultData();
  }
}

function saveData() {
  try { localStorage.setItem('auris_data', JSON.stringify(APP.data)); } catch(e) {}
}
