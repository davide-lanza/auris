const INTERVAL_DATA = {
  'P1':  { name: 'Unison',            semitones: 0,  anchor: 'Same note — just one pitch',     emoji: '🔁', char: 'Pure, identical' },
  'm2':  { name: 'Minor 2nd',         semitones: 1,  anchor: 'Jaws theme',                     emoji: '🦈', char: 'Tense, sinister' },
  'M2':  { name: 'Major 2nd',         semitones: 2,  anchor: 'Happy Birthday (first two notes)', emoji: '🎂', char: 'Bright, stepwise' },
  'm3':  { name: 'Minor 3rd',         semitones: 3,  anchor: 'Smoke on the Water (Riff)',       emoji: '🎸', char: 'Dark, melancholic' },
  'M3':  { name: 'Major 3rd',         semitones: 4,  anchor: 'Oh When the Saints Go Marching In', emoji: '⛪', char: 'Happy, warm' },
  'P4':  { name: 'Perfect 4th',       semitones: 5,  anchor: 'Here Comes the Bride',            emoji: '💒', char: 'Strong, open' },
  'TT':  { name: 'Tritone',           semitones: 6,  anchor: 'The Simpsons Theme',              emoji: '📺', char: 'Restless, dissonant' },
  'P5':  { name: 'Perfect 5th',       semitones: 7,  anchor: 'Star Wars – Main Theme',          emoji: '⚔️', char: 'Powerful, noble' },
  'm6':  { name: 'Minor 6th',         semitones: 8,  anchor: 'The Entertainer (Scott Joplin)',  emoji: '🎩', char: 'Tender, wistful' },
  'M6':  { name: 'Major 6th',         semitones: 9,  anchor: 'My Bonnie Lies Over the Ocean',   emoji: '🌊', char: 'Bright, nostalgic' },
  'm7':  { name: 'Minor 7th',         semitones: 10, anchor: 'Somewhere (West Side Story)',      emoji: '🌃', char: 'Yearning, bluesy' },
  'M7':  { name: 'Major 7th',         semitones: 11, anchor: 'Take On Me – A-ha (verse)',       emoji: '💫', char: 'Dreamlike, tense-bright' },
  'P8':  { name: 'Octave',            semitones: 12, anchor: 'Somewhere Over the Rainbow',      emoji: '🌈', char: 'Pure, soaring' },
  'm9':  { name: 'Minor 9th',         semitones: 13, anchor: 'Nothing Else Matters (Metallica)', emoji: '🤘', char: 'Dark, expansive' },
  'M9':  { name: 'Major 9th',         semitones: 14, anchor: 'Misty (jazz standard)',            emoji: '🎷', char: 'Lush, open' },
  'm10': { name: 'Minor 10th',        semitones: 15, anchor: 'Minor 3rd an octave higher',      emoji: '🎶', char: 'Wide, dark warmth' },
  'M10': { name: 'Major 10th',        semitones: 16, anchor: 'Major 3rd an octave higher',      emoji: '🎵', char: 'Wide, bright warmth' },
};

// Interval pools per level are now defined in LEVEL_DEFS (src/data/levels.js)

// ── MELODY SNIPPETS ───────────────────────────────────────────
// Semitone offsets from C4 (MIDI 60), with durations:
//   q = quarter (0.75 s at 80 BPM), e = eighth (0.375 s),
//   h = half (1.5 s), w = whole (3.0 s)
// asc = ascending direction showcase, des = descending
const INTERVAL_MELODIES = {
  'm2': {
    // Jaws: the iconic two-note motif alternating semitones, building tension
    asc: { song: 'Jaws', notes: [
      {st:4,dur:'q'},{st:5,dur:'q'},{st:4,dur:'q'},{st:5,dur:'q'},
      {st:4,dur:'q'},{st:5,dur:'q'},{st:4,dur:'e'},{st:5,dur:'e'},
      {st:4,dur:'e'},{st:5,dur:'e'},{st:4,dur:'h'},
    ]},
    // Joy to the World: stepwise descent C B A G F# F E D C
    des: { song: 'Joy to the World', notes: [
      {st:12,dur:'q'},{st:11,dur:'q'},{st:9,dur:'h'},
      {st:7,dur:'q'},{st:6,dur:'q'},{st:5,dur:'h'},
      {st:4,dur:'q'},{st:2,dur:'q'},{st:0,dur:'h'},
    ]},
  },
  'M2': {
    // Happy Birthday: two full phrases
    asc: { song: 'Happy Birthday', notes: [
      {st:0,dur:'q'},{st:0,dur:'e'},{st:2,dur:'q'},
      {st:0,dur:'q'},{st:5,dur:'q'},{st:4,dur:'h'},
      {st:0,dur:'q'},{st:0,dur:'e'},{st:2,dur:'q'},
      {st:0,dur:'q'},{st:7,dur:'q'},{st:5,dur:'h'},
    ]},
    // Mary Had a Little Lamb: main melody + second phrase
    des: { song: 'Mary Had a Little Lamb', notes: [
      {st:4,dur:'q'},{st:2,dur:'q'},{st:0,dur:'q'},{st:2,dur:'q'},
      {st:4,dur:'q'},{st:4,dur:'q'},{st:4,dur:'h'},
      {st:2,dur:'q'},{st:2,dur:'q'},{st:2,dur:'h'},
      {st:4,dur:'q'},{st:7,dur:'q'},{st:7,dur:'h'},
    ]},
  },
  'm3': {
    // Smoke on the Water: full iconic three-phrase riff
    asc: { song: 'Smoke on the Water', notes: [
      {st:7,dur:'q'},{st:10,dur:'q'},{st:12,dur:'h'},
      {st:7,dur:'q'},{st:10,dur:'q'},{st:13,dur:'e'},{st:12,dur:'h'},
      {st:7,dur:'q'},{st:10,dur:'q'},{st:12,dur:'e'},{st:10,dur:'e'},{st:7,dur:'h'},
    ]},
    // Hey Jude: opening descent and resolution
    des: { song: 'Hey Jude', notes: [
      {st:7,dur:'q'},{st:5,dur:'q'},{st:4,dur:'h'},
      {st:3,dur:'q'},{st:0,dur:'q'},{st:2,dur:'h'},
      {st:0,dur:'q'},{st:2,dur:'q'},{st:3,dur:'q'},{st:2,dur:'h'},
    ]},
  },
  'M3': {
    // Oh When the Saints: opening + "go marching in"
    asc: { song: 'When the Saints', notes: [
      {st:0,dur:'q'},{st:4,dur:'q'},{st:5,dur:'q'},{st:7,dur:'h'},
      {st:0,dur:'q'},{st:4,dur:'q'},{st:5,dur:'q'},{st:7,dur:'h'},
      {st:4,dur:'q'},{st:7,dur:'q'},{st:9,dur:'q'},{st:7,dur:'h'},
    ]},
    // Summertime: opening phrase + continuation
    des: { song: 'Summertime', notes: [
      {st:9,dur:'q'},{st:7,dur:'e'},{st:6,dur:'e'},
      {st:4,dur:'q'},{st:5,dur:'q'},{st:4,dur:'h'},
      {st:2,dur:'q'},{st:4,dur:'q'},{st:5,dur:'q'},{st:7,dur:'h'},
    ]},
  },
  'P4': {
    // Here Comes the Bride: opening + second phrase
    asc: { song: 'Here Comes the Bride', notes: [
      {st:0,dur:'e'},{st:5,dur:'q'},{st:5,dur:'e'},{st:5,dur:'q'},
      {st:7,dur:'q'},{st:5,dur:'q'},{st:4,dur:'q'},{st:2,dur:'h'},
      {st:5,dur:'e'},{st:9,dur:'q'},{st:7,dur:'e'},{st:5,dur:'q'},{st:4,dur:'h'},
    ]},
    // Eine Kleine Nachtmusik: two-phrase opening
    des: { song: 'Eine Kleine Nachtmusik', notes: [
      {st:7,dur:'e'},{st:7,dur:'e'},{st:7,dur:'e'},{st:3,dur:'q'},
      {st:10,dur:'e'},{st:10,dur:'e'},{st:10,dur:'e'},{st:7,dur:'q'},
      {st:7,dur:'q'},{st:3,dur:'q'},{st:3,dur:'q'},{st:3,dur:'q'},{st:0,dur:'h'},
    ]},
  },
  'TT': {
    // The Simpsons: the quirky tritone motif + resolution
    asc: { song: 'The Simpsons Theme', notes: [
      {st:0,dur:'e'},{st:4,dur:'e'},{st:6,dur:'q'},
      {st:4,dur:'e'},{st:6,dur:'q'},{st:4,dur:'h'},
      {st:3,dur:'q'},{st:1,dur:'q'},{st:0,dur:'h'},
    ]},
  },
  'P5': {
    // Star Wars: iconic opening motif
    asc: { song: 'Star Wars – Main Theme', notes: [
      {st:0,dur:'q'},{st:0,dur:'q'},{st:0,dur:'q'},
      {st:-9,dur:'e'},{st:-2,dur:'e'},{st:0,dur:'h'},
      {st:5,dur:'q'},{st:4,dur:'q'},{st:0,dur:'q'},{st:2,dur:'h'},
    ]},
    // The Flintstones: bouncy main hook
    des: { song: 'The Flintstones', notes: [
      {st:7,dur:'q'},{st:0,dur:'q'},{st:7,dur:'e'},{st:10,dur:'e'},
      {st:7,dur:'q'},{st:5,dur:'q'},{st:4,dur:'h'},
      {st:5,dur:'q'},{st:4,dur:'q'},{st:2,dur:'q'},{st:0,dur:'h'},
    ]},
  },
  'm6': {
    // The Entertainer (Scott Joplin): opening run + the m6 leap + resolution
    asc: { song: 'The Entertainer', notes: [
      {st:0,dur:'e'},{st:2,dur:'e'},{st:4,dur:'e'},
      {st:8,dur:'q'},{st:7,dur:'q'},{st:4,dur:'e'},{st:7,dur:'h'},
      {st:7,dur:'q'},{st:6,dur:'e'},{st:2,dur:'e'},{st:6,dur:'h'},
    ]},
  },
  'M6': {
    // My Bonnie Lies Over the Ocean: full first phrase
    asc: { song: 'My Bonnie Lies Over the Ocean', notes: [
      {st:7,dur:'q'},{st:12,dur:'q'},{st:12,dur:'q'},{st:12,dur:'q'},
      {st:9,dur:'q'},{st:7,dur:'q'},{st:4,dur:'h'},
      {st:2,dur:'h'},{st:4,dur:'q'},{st:7,dur:'q'},{st:9,dur:'h'},
    ]},
  },
  'm7': {
    // Somewhere (West Side Story): "There's a place for us"
    asc: { song: 'Somewhere (West Side Story)', notes: [
      {st:0,dur:'q'},{st:10,dur:'h'},{st:9,dur:'q'},
      {st:7,dur:'q'},{st:5,dur:'q'},{st:4,dur:'h'},
      {st:5,dur:'q'},{st:3,dur:'q'},{st:2,dur:'q'},{st:0,dur:'h'},
    ]},
  },
  'M7': {
    // Take On Me (A-ha): ascending verse motif
    asc: { song: 'Take On Me – A-ha', notes: [
      {st:0,dur:'e'},{st:4,dur:'e'},{st:7,dur:'e'},
      {st:11,dur:'q'},{st:9,dur:'e'},{st:7,dur:'q'},{st:4,dur:'h'},
      {st:0,dur:'e'},{st:4,dur:'e'},{st:9,dur:'q'},{st:7,dur:'q'},{st:5,dur:'h'},
    ]},
  },
  'P8': {
    // Somewhere Over the Rainbow: octave leap + "way up high"
    asc: { song: 'Somewhere Over the Rainbow', notes: [
      {st:0,dur:'q'},{st:12,dur:'h'},
      {st:11,dur:'q'},{st:12,dur:'e'},{st:9,dur:'q'},{st:7,dur:'h'},
      {st:4,dur:'q'},{st:5,dur:'q'},{st:7,dur:'h'},
    ]},
    // Willow Weep for Me: descending octave + resolution
    des: { song: 'Willow Weep for Me', notes: [
      {st:12,dur:'q'},{st:0,dur:'h'},
      {st:2,dur:'q'},{st:4,dur:'q'},{st:5,dur:'h'},
      {st:7,dur:'q'},{st:5,dur:'q'},{st:4,dur:'q'},{st:2,dur:'h'},
    ]},
  },
};
