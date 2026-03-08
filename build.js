const fs = require('fs');
const path = require('path');

const root = __dirname;
const srcDir = path.join(root, 'src');
const distDir = path.join(root, 'dist');

// CSS files in exact order
const cssFiles = [
  'css/variables.css',
  'css/reset.css',
  'css/typography.css',
  'css/components.css',
  'css/layout.css',
  'css/screens.css',
  'css/animations.css',
];

// JS files in exact order
const jsFiles = [
  'data/intervals.js',
  'data/chords.js',
  'data/cadences.js',
  'data/levels.js',
  'js/storage.js',
  'js/audio.js',
  'js/scoring.js',
  'js/questions.js',
  'js/charts.js',
  'js/ui.js',
  'js/app.js',
];

// Read and concatenate
const css = cssFiles.map(f => {
  const full = path.join(srcDir, f);
  return `/* === ${f} === */\n${fs.readFileSync(full, 'utf8')}`;
}).join('\n\n');

const js = jsFiles.map(f => {
  const full = path.join(srcDir, f);
  return `/* === ${f} === */\n${fs.readFileSync(full, 'utf8')}`;
}).join('\n\n');

// Inject into template
let html = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf8');
html = html.replace('{{CSS}}', css);
html = html.replace('{{JS}}', js);

// Write output
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
const outPath = path.join(distDir, 'auris.html');
fs.writeFileSync(outPath, html, 'utf8');

const size = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`✓ Built dist/auris.html — ${size} KB`);
