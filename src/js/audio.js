// ============================================================
// AUDIO ENGINE
// Uses EMBEDDED_SAMPLES — Base64 data URIs compiled into the
// file by build.js. No CDN, no internet, always works.
// ============================================================

async function startAudioLoad() {
  const btn      = document.getElementById('load-start-btn');
  const statusEl = document.getElementById('load-status');
  const errEl    = document.getElementById('load-error');
  const barWrap  = document.getElementById('load-bar-wrap');

  btn.style.display    = 'none';
  errEl.style.display  = 'none';
  if (barWrap) barWrap.style.display = 'none';
  if (statusEl) statusEl.textContent = 'Preparing piano…';

  try {
    await Tone.start();
    await loadEmbeddedSampler();
  } catch (e) {
    console.error('Audio init failed:', e);
    btn.textContent      = 'Retry';
    btn.style.display    = 'block';
    errEl.style.display  = 'block';
    if (statusEl) statusEl.textContent = '';
  }
}

// Kept for compatibility — used by legacy loading-screen paths
function updateLoadingUI(pct, status) {
  const bar      = document.getElementById('load-bar');
  const statusEl = document.getElementById('load-status');
  if (bar)      bar.style.width    = pct + '%';
  if (statusEl) statusEl.textContent = status || '';
}

function loadEmbeddedSampler() {
  return new Promise((resolve, reject) => {
    const statusEl = document.getElementById('load-status');

    // Animated dots while Tone.js decodes the PCM buffers (~1-3 s)
    let dots = 0;
    const dotTimer = setInterval(() => {
      dots = (dots + 1) % 4;
      if (statusEl) statusEl.textContent = 'Preparing piano' + '.'.repeat(dots);
    }, 350);

    const done = (err) => {
      clearInterval(dotTimer);
      if (err) {
        reject(err);
      } else {
        APP.audioReady = true;
        if (statusEl) statusEl.textContent = '';
        setTimeout(onAudioReady, 300);
        resolve();
      }
    };

    // EMBEDDED_SAMPLES is defined by build.js and prepended to the bundle.
    // Values are data URIs ("data:audio/mp3;base64,...") so no baseUrl needed.
    APP.sampler = new Tone.Sampler({
      urls:    EMBEDDED_SAMPLES,
      release: 1,
      onload:  ()  => done(null),
      onerror: (e) => done(e || new Error('Sampler decode error')),
    }).toDestination();
  });
}

// ── PLAYBACK HELPERS ──────────────────────────────────────────

function playNote(note, dur = 1.5) {
  if (!APP.sampler || !APP.audioReady) return;
  try { APP.sampler.triggerAttackRelease(note, dur); } catch (_) {}
}

function playNotesMelodic(midiArr, ascending = true) {
  if (!APP.sampler || !APP.audioReady) return;
  const now   = Tone.now();
  const notes = ascending ? midiArr.map(midiToNote) : [...midiArr].reverse().map(midiToNote);
  notes.forEach((note, i) => {
    try { APP.sampler.triggerAttackRelease(note, 1.5, now + i * 0.65); } catch (_) {}
  });
}

function playNotesHarmonic(midiArr) {
  if (!APP.sampler || !APP.audioReady) return;
  const now = Tone.now();
  midiArr.forEach(midi => {
    try { APP.sampler.triggerAttackRelease(midiToNote(midi), 2.5, now); } catch (_) {}
  });
}

function playNotesArpeggio(midiArr) {
  if (!APP.sampler || !APP.audioReady) return;
  const now = Tone.now();
  midiArr.forEach((midi, i) => {
    try { APP.sampler.triggerAttackRelease(midiToNote(midi), 2, now + i * 0.12); } catch (_) {}
  });
}

// Duration chars → seconds at 80 BPM (1 beat = 0.75 s)
const DUR_SECS = { q: 0.75, e: 0.375, h: 1.5, w: 3.0 };

function playIntervalMelody(sym, direction) {
  if (!APP.sampler || !APP.audioReady) return;
  const entry = INTERVAL_MELODIES[sym];
  if (!entry) return;
  const mel = entry[direction] || entry.asc;
  if (!mel) return;
  const root = 60; // C4
  const now  = Tone.now();
  let t = 0;
  mel.notes.forEach(({ st, dur }) => {
    const midi = root + st;
    const note = midiToNote(midi);
    const secs = DUR_SECS[dur] || 0.75;
    try { APP.sampler.triggerAttackRelease(note, secs * 0.9, now + t); } catch (_) {}
    t += secs;
  });
}

function playInterval(rootMidi, semitones, mode) {
  const lower = rootMidi;
  const upper = rootMidi + semitones;
  if (mode === 'harmonic') {
    playNotesHarmonic([lower, upper]);
  } else if (mode === 'descending') {
    playNotesMelodic([lower, upper], false);
  } else {
    playNotesMelodic([lower, upper], true);
  }
}

function playChord(rootMidi, formula) {
  playNotesArpeggio(formula.map(f => rootMidi + f));
}

function playCadence(type) {
  const prog = CADENCE_CHORDS[type];
  if (!prog || !APP.sampler) return;
  const now = Tone.now();
  prog.forEach((chord, ci) => {
    chord.forEach((midi, ni) => {
      try { APP.sampler.triggerAttackRelease(midiToNote(midi), 1.8, now + ci * 2.2 + ni * 0.08); } catch (_) {}
    });
  });
}

function playModulation(type) {
  if (!APP.sampler || !APP.audioReady) return;
  const passages = {
    'dominant':    [[48,52,55],[55,59,62],[62,66,69],[55,59,62]],
    'subdominant': [[48,52,55],[53,57,60],[50,54,57],[53,57,60]],
    'rel_minor':   [[48,52,55],[55,59,62],[57,60,64],[57,60,64]],
    'rel_major':   [[57,60,64],[60,64,67],[64,68,71],[60,64,67]],
    'parallel':    [[48,52,55],[48,51,55],[50,53,57],[48,51,55]],
  };
  const chords = passages[type] || passages['dominant'];
  const now = Tone.now();
  chords.forEach((chord, ci) => {
    chord.forEach((midi, ni) => {
      try { APP.sampler.triggerAttackRelease(midiToNote(midi), 1.5, now + ci * 1.8 + ni * 0.06); } catch (_) {}
    });
  });
}
