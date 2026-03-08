async function startAudioLoad() {
  const btn = document.getElementById('load-start-btn');
  const barWrap = document.getElementById('load-bar-wrap');
  const errEl = document.getElementById('load-error');
  btn.style.display = 'none';
  barWrap.style.display = 'block';
  errEl.style.display = 'none';
  updateLoadingUI(5, 'Unlocking audio…');

  try {
    await Tone.start();
    updateLoadingUI(10, 'Loading Salamander Grand Piano…');
    await loadSampler();
  } catch(e) {
    console.error('Audio load error:', e);
    btn.style.display = 'block';
    barWrap.style.display = 'none';
    errEl.style.display = 'block';
  }
}

function updateLoadingUI(pct, status) {
  const bar = document.getElementById('load-bar');
  const statusEl = document.getElementById('load-status');
  if (bar) bar.style.width = pct + '%';
  if (statusEl) statusEl.textContent = status || '';
}

async function loadSampler() {
  // Fake progress while loading
  let fakeP = 10;
  const fakeTimer = setInterval(() => {
    fakeP = Math.min(fakeP + (Math.random() * 4 + 1), 92);
    updateLoadingUI(fakeP, 'Loading piano samples…');
  }, 300);

  const urls = {
    "A0": "A0.mp3", "C1": "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
    "A1": "A1.mp3", "C2": "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
    "A2": "A2.mp3", "C3": "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
    "A3": "A3.mp3", "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
    "A4": "A4.mp3", "C5": "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
    "A5": "A5.mp3", "C6": "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
    "A6": "A6.mp3", "C7": "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
    "A7": "A7.mp3", "C8": "C8.mp3"
  };
  const baseUrl = "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-mp3/";

  return new Promise((resolve, reject) => {
    APP.sampler = new Tone.Sampler({
      urls, release: 1,
      baseUrl: baseUrl,
      onload: () => {
        clearInterval(fakeTimer);
        updateLoadingUI(100, 'Ready!');
        APP.audioReady = true;
        setTimeout(onAudioReady, 400);
        resolve();
      },
      onerror: (e) => {
        clearInterval(fakeTimer);
        reject(e);
      }
    }).toDestination();
  });
}

function playNote(note, dur = 1.5) {
  if (!APP.sampler || !APP.audioReady) return;
  try { APP.sampler.triggerAttackRelease(note, dur); } catch(e) {}
}

function playNotesMelodic(midiArr, ascending = true) {
  if (!APP.sampler || !APP.audioReady) return;
  const now = Tone.now();
  const notes = ascending ? midiArr.map(midiToNote) : [...midiArr].reverse().map(midiToNote);
  notes.forEach((note, i) => {
    try { APP.sampler.triggerAttackRelease(note, 1.5, now + i * 0.65); } catch(e) {}
  });
}

function playNotesHarmonic(midiArr) {
  if (!APP.sampler || !APP.audioReady) return;
  const now = Tone.now();
  midiArr.forEach(midi => {
    try { APP.sampler.triggerAttackRelease(midiToNote(midi), 2.5, now); } catch(e) {}
  });
}

function playNotesArpeggio(midiArr) {
  if (!APP.sampler || !APP.audioReady) return;
  const now = Tone.now();
  midiArr.forEach((midi, i) => {
    try { APP.sampler.triggerAttackRelease(midiToNote(midi), 2, now + i * 0.12); } catch(e) {}
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
  const midis = formula.map(f => rootMidi + f);
  playNotesArpeggio(midis);
}

function playCadence(type) {
  const prog = CADENCE_CHORDS[type];
  if (!prog || !APP.sampler) return;
  const now = Tone.now();
  prog.forEach((chord, ci) => {
    chord.forEach((midi, ni) => {
      try { APP.sampler.triggerAttackRelease(midiToNote(midi), 1.8, now + ci * 2.2 + ni * 0.08); } catch(e) {}
    });
  });
}

function playModulation(type) {
  // Play a short I-IV-V-I then a cadence in new key
  const now = Tone.now();
  // C major context, then modulate
  const passages = {
    'dominant':    [[48,52,55],[55,59,62],[62,66,69],[55,59,62]], // C→G
    'subdominant': [[48,52,55],[53,57,60],[50,54,57],[53,57,60]], // C→F
    'rel_minor':   [[48,52,55],[55,59,62],[57,60,64],[57,60,64]], // C→Am
    'rel_major':   [[57,60,64],[60,64,67],[64,68,71],[60,64,67]], // Am→C
    'parallel':    [[48,52,55],[48,51,55],[50,53,57],[48,51,55]], // C→Cm
  };
  const chords = passages[type] || passages['dominant'];
  chords.forEach((chord, ci) => {
    chord.forEach((midi, ni) => {
      try { APP.sampler.triggerAttackRelease(midiToNote(midi), 1.5, now + ci * 1.8 + ni * 0.06); } catch(e) {}
    });
  });
}
