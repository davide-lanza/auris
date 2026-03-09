function buildPianoSVG(activeMidis = [], startMidi = 60, numOctaves = 2) {
  const WW = 28, WH = 80, BW = 18, BH = 50;
  const numWhiteKeys = numOctaves * 7;
  const totalW = numWhiteKeys * WW;

  // Map MIDI to white key index
  const noteInOctave = [0,0,1,1,2,3,3,4,4,5,5,6]; // C=0,C#=0,D=1,D#=1,E=2...
  const isBlack = [false,true,false,true,false,false,true,false,true,false,true,false];

  let whites = '';
  let blacks = '';

  for (let i = 0; i < numOctaves * 12; i++) {
    const midi = startMidi + i;
    const noteClass = midi % 12;
    const octaveIndex = Math.floor(i / 12);
    const noteInOct = noteInOctave[noteClass];
    const active = activeMidis.includes(midi);

    if (!isBlack[noteClass]) {
      const x = (octaveIndex * 7 + noteInOct) * WW;
      const fill = active ? '#C9A84C' : '#EDE9E0';
      const stroke = '#1C1A2E';
      whites += `<rect x="${x}" y="0" width="${WW-1}" height="${WH}" fill="${fill}" stroke="${stroke}" stroke-width="1" rx="3"/>`;
      if (active) whites += `<text x="${x + WW/2}" y="${WH - 8}" text-anchor="middle" font-size="9" fill="#0A0912" font-weight="bold">${NOTE_NAMES[noteClass]}</text>`;
    }
  }

  // Black key positions offset per note in octave
  const blackOffsets = { 1: 1, 3: 2, 6: 4, 8: 5, 10: 6 }; // noteClass → white keys before

  for (let i = 0; i < numOctaves * 12; i++) {
    const midi = startMidi + i;
    const noteClass = midi % 12;
    const octaveIndex = Math.floor(i / 12);
    const active = activeMidis.includes(midi);

    if (isBlack[noteClass]) {
      const whitesBefore = blackOffsets[noteClass];
      const x = (octaveIndex * 7 + whitesBefore) * WW - BW / 2;
      const fill = active ? '#C9A84C' : '#1C1A2E';
      blacks += `<rect x="${x}" y="0" width="${BW}" height="${BH}" fill="${fill}" stroke="#0A0912" stroke-width="1" rx="2"/>`;
    }
  }

  return `<svg class="piano-svg" viewBox="0 0 ${totalW} ${WH}" xmlns="http://www.w3.org/2000/svg">${whites}${blacks}</svg>`;
}

function buildRadarChart(scores) {
  const { accuracy, fluency, retention } = scores;
  const vals = [accuracy, fluency, retention].map(v => v / 100);
  const labels = ['Accuracy', 'Fluency', 'Retention'];
  const cx = 110, cy = 115, r = 75;
  // 3 axes: top, bottom-right, bottom-left
  const angles = [-Math.PI/2, -Math.PI/2 + (2*Math.PI/3), -Math.PI/2 + (4*Math.PI/3)];

  // Grid rings
  let gridSvg = '';
  [0.25, 0.5, 0.75, 1].forEach(ratio => {
    const pts = angles.map(a => `${cx + r * ratio * Math.cos(a)},${cy + r * ratio * Math.sin(a)}`).join(' ');
    gridSvg += `<polygon points="${pts}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`;
  });

  // Axes
  let axesSvg = angles.map(a =>
    `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(a)}" y2="${cy + r * Math.sin(a)}" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>`
  ).join('');

  // Data polygon
  const dataPts = angles.map((a, i) => `${cx + r * vals[i] * Math.cos(a)},${cy + r * vals[i] * Math.sin(a)}`).join(' ');

  // Labels
  const labelOffset = r + 18;
  let labelsSvg = angles.map((a, i) => {
    const x = cx + labelOffset * Math.cos(a);
    const y = cy + labelOffset * Math.sin(a);
    return `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="10" fill="rgba(237,233,224,0.5)" font-family="sans-serif">${labels[i]}</text>`;
  }).join('');

  // Score text
  let scoresSvg = angles.map((a, i) => {
    const x = cx + (r * vals[i] + 10) * Math.cos(a);
    const y = cy + (r * vals[i] + 10) * Math.sin(a);
    const pct = Math.round(vals[i] * 100);
    return `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="10" fill="var(--gold-bright)" font-family="sans-serif" font-weight="bold">${pct}</text>`;
  }).join('');

  return `<svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:220px;display:block;margin:0 auto">
    ${gridSvg}${axesSvg}
    <polygon points="${dataPts}" fill="rgba(201,168,76,0.2)" stroke="#C9A84C" stroke-width="2"/>
    ${labelsSvg}${scoresSvg}
  </svg>`;
}

function buildLineChart(area) {
  const answers = getAnswersForArea(area);
  const msDay = 86400000;
  const now = Date.now();

  // Build 14-day overall scores
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const dayStart = now - (i + 1) * msDay;
    const dayEnd = now - i * msDay;
    const dayAnswers = answers.filter(a => a.timestamp >= dayStart && a.timestamp < dayEnd);
    if (dayAnswers.length) {
      const correct = dayAnswers.filter(a => a.isCorrect).length;
      days.push(Math.round(correct / dayAnswers.length * 100));
    } else {
      days.push(null);
    }
  }

  const W = 300, H = 120;
  const ml = 32, mr = 8, mt = 8, mb = 24;
  const chartW = W - ml - mr;
  const chartH = H - mt - mb;

  // Grid lines
  let grid = '';
  [0, 25, 50, 75, 100].forEach(v => {
    const y = mt + chartH - (v / 100) * chartH;
    grid += `<line x1="${ml}" y1="${y}" x2="${W - mr}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>`;
    grid += `<text x="${ml - 4}" y="${y + 4}" text-anchor="end" font-size="9" fill="rgba(237,233,224,0.3)" font-family="sans-serif">${v}</text>`;
  });

  // X axis labels (every 2 days)
  let xLabels = '';
  for (let i = 0; i < 14; i += 2) {
    const x = ml + (i / 13) * chartW;
    const d = new Date(now - (13 - i) * msDay);
    const label = `${d.getDate()}/${d.getMonth()+1}`;
    xLabels += `<text x="${x}" y="${H - 4}" text-anchor="middle" font-size="9" fill="rgba(237,233,224,0.3)" font-family="sans-serif">${label}</text>`;
  }

  // Line
  const color = AREA_COLORS[area] || '#C9A84C';
  let points = '';
  let hasData = false;
  days.forEach((v, i) => {
    if (v !== null) {
      const x = ml + (i / 13) * chartW;
      const y = mt + chartH - (v / 100) * chartH;
      if (!hasData) { points += `M ${x} ${y}`; hasData = true; }
      else points += ` L ${x} ${y}`;
    }
  });

  // Dots
  let dots = '';
  days.forEach((v, i) => {
    if (v !== null) {
      const x = ml + (i / 13) * chartW;
      const y = mt + chartH - (v / 100) * chartH;
      dots += `<circle cx="${x}" cy="${y}" r="3" fill="${color}"/>`;
    }
  });

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">
    ${grid}${xLabels}
    ${hasData ? `<path d="${points}" fill="none" stroke="${color}" stroke-width="2"/>` : ''}
    ${dots}
  </svg>`;
}
