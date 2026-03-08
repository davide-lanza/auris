const CHORD_DATA = {
  'major':    { name: 'Major',              formula: [0,4,7],      symbol: '',     char: 'Bright, happy, stable',               usage: 'I, IV, V in major keys' },
  'minor':    { name: 'Minor',              formula: [0,3,7],      symbol: 'm',    char: 'Sad, dark, melancholic',               usage: 'i, iv, v in minor keys' },
  'dim':      { name: 'Diminished',         formula: [0,3,6],      symbol: '°',    char: 'Tense, unstable, unsettling',          usage: 'vii° in major keys' },
  'aug':      { name: 'Augmented',          formula: [0,4,8],      symbol: '+',    char: 'Mysterious, floating, ethereal',        usage: 'bIII+ in minor progressions' },
  'dom7':     { name: 'Dominant 7th',       formula: [0,4,7,10],   symbol: '7',    char: 'Bluesy, wants to resolve to I',        usage: 'V7 → I resolution' },
  'maj7':     { name: 'Major 7th',          formula: [0,4,7,11],   symbol: 'maj7', char: 'Dreamy, sophisticated, lush',          usage: 'Imaj7 in jazz & bossa nova' },
  'min7':     { name: 'Minor 7th',          formula: [0,3,7,10],   symbol: 'm7',   char: 'Cool, jazzy, smooth',                  usage: 'ii7 in ii–V–I progressions' },
  'halfdim':  { name: 'Half-Diminished',    formula: [0,3,6,10],   symbol: 'ø7',   char: 'Dark, ambiguous, searching',           usage: 'ii° in minor ii–V–i' },
};

// Chord pools per level are now defined in LEVEL_DEFS (src/data/levels.js)
