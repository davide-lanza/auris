const LEVEL_NAMES = {
  1: 'Beginner', 2: 'Elementary', 3: 'Pre-Intermediate',
  4: 'Intermediate', 5: 'Upper-Intermediate', 6: 'Advanced',
  7: 'Professional', 8: 'Master'
};

const AREA_CONFIG = {
  'intervals':  { name: 'Intervals',  icon: '🎵', unlockLevel: 1 },
  'chords':     { name: 'Chords',     icon: '🎹', unlockLevel: 1 },
  'cadences':   { name: 'Cadences',   icon: '🔄', unlockLevel: 4 },
  'modulation': { name: 'Modulation', icon: '🌍', unlockLevel: 7 },
};

const AREA_COLORS = {
  'intervals':  '#6B9FFF',
  'chords':     '#C9A84C',
  'cadences':   '#5BBF8A',
  'modulation': '#E06060',
};

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const NOTE_NAMES_FLAT = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
