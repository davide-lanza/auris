const CADENCE_DATA = {
  'perfect':    { name: 'Perfect (Authentic)',   roman: 'V → I',   desc: 'Strong sense of resolution. Ends on tonic after dominant.' },
  'imperfect':  { name: 'Imperfect',             roman: 'I → V',   desc: 'Question-like feeling. Ends on dominant, sounds unfinished.' },
  'interrupted':{ name: 'Interrupted (Deceptive)', roman: 'V → vi', desc: 'Surprising! Sounds like it will resolve but goes to vi instead.' },
  'plagal':     { name: 'Plagal',                roman: 'IV → I',  desc: 'The "Amen" cadence. Gentle, often used in hymns and gospel.' },
};

// Chord MIDI progressions for cadences (C major context)
const CADENCE_CHORDS = {
  'perfect':     [[55,59,62],[48,52,55]],    // G → C
  'imperfect':   [[48,52,55],[55,59,62]],    // C → G
  'interrupted': [[55,59,62],[57,60,64]],    // G → Am
  'plagal':      [[53,57,60],[48,52,55]],    // F → C
};

const MODULATION_DATA = {
  'dominant':        { name: 'To Dominant',      desc: 'Moves to the V key (e.g., C→G). Sounds brighter, higher tension.' },
  'subdominant':     { name: 'To Subdominant',   desc: 'Moves to the IV key (e.g., C→F). Sounds softer, more relaxed.' },
  'rel_minor':       { name: 'To Relative Minor', desc: 'Same key signature but moves to vi (e.g., C→Am). Darker.' },
  'rel_major':       { name: 'To Relative Major', desc: 'Same key signature but moves to III (e.g., Am→C). Brighter.' },
  'parallel':        { name: 'Parallel Major/Minor', desc: 'Same tonic, different mode (e.g., C major→C minor or vice versa).' },
};
