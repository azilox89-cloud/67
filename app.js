const state = {
  matches: [
    {
      id: 'tx-state-2026',
      provider: 'PractiScore',
      name: 'Texas State Action Challenge',
      completed: 9,
      total: 12,
      yourRank: 14,
      divisionRank: 5,
      division: 'CO',
      classRank: 2,
      className: 'A',
      dq: 0,
      competitors: [
        { name: 'You', overallPct: 92.8, avgPlace: 8.7 },
        { name: 'Marcus Reed', overallPct: 100, avgPlace: 1.6 },
        { name: 'Riley Novak', overallPct: 90.2, avgPlace: 10.2 },
      ],
      stages: [
        { name: 'Stage 7', hits: '59/60', penalties: '0 penalties', pct: 94.1 },
        { name: 'Stage 8', hits: '56/60', penalties: '+2 sec', pct: 88.3 },
        { name: 'Stage 9', hits: '52/60', penalties: '1 proc + 3C', pct: 79.4 },
      ],
      classifications: [
        ['USPSA CO', 'A (74.8%)'],
        ['Steel Challenge RFPO', 'B (65.2%)'],
        ['IDPA CO', 'SSP EX'],
        ['ICORE Open', 'A'],
      ],
      shooters: ['Mike Carter', 'Marcus Reed', 'Riley Novak', 'Alyssa Wynn'],
    },
    {
      id: 'ipsc-open-2026',
      provider: 'IPSC',
      name: 'IPSC Continental Open 2026',
      completed: 14,
      total: 14,
      yourRank: 27,
      divisionRank: 9,
      division: 'Production',
      classRank: 5,
      className: 'A',
      dq: 0,
      competitors: [
        { name: 'You', overallPct: 87.3, avgPlace: 12.1 },
        { name: 'Luca Tan', overallPct: 98.2, avgPlace: 2.2 },
        { name: 'Mateo Silva', overallPct: 93.1, avgPlace: 6.4 },
      ],
      stages: [
        { name: 'Stage 12', hits: '112/120', penalties: '1 no-shoot', pct: 86.5 },
        { name: 'Stage 13', hits: '58/60', penalties: '0 penalties', pct: 95.8 },
      ],
      classifications: [['IPSC Production', 'A'], ['USPSA CO', 'A (74.8%)']],
      shooters: ['Mike Carter', 'Luca Tan', 'Mateo Silva', 'Nina Chow'],
    },
  ],
  currentMatch: null,
  compareExtra: null,
};

const el = {
  searchInput: document.getElementById('searchInput'),
  searchBtn: document.getElementById('searchBtn'),
  searchResults: document.getElementById('searchResults'),
  matchHeader: document.getElementById('matchHeader'),
  stageList: document.getElementById('stageList'),
  stageMetrics: document.getElementById('stageMetrics'),
  compareStack: document.getElementById('compareStack'),
  classificationList: document.getElementById('classificationList'),
  simResult: document.getElementById('simResult'),
  providerChip: document.getElementById('providerChip'),
  syncChip: document.getElementById('syncChip'),
};

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');
const navButtons = document.querySelectorAll('.bottom-nav button');

async function fetchRemoteProviders() {
  // Browser-side CORS blocks many official endpoints; keep safe fallback.
  const endpoints = [
    'https://ipsc.org',
    'https://uspsa.org',
  ];

  const online = await Promise.all(
    endpoints.map(async (url) => {
      try {
        await fetch(url, { mode: 'no-cors' });
        return url.includes('ipsc') ? 'IPSC' : 'USPSA';
      } catch {
        return null;
      }
    })
  );

  const providers = ['PractiScore', ...online.filter(Boolean)];
  el.providerChip.textContent = `Providers: ${providers.join(' · ')}`;
}

function setMatch(match) {
  state.currentMatch = match;
  render();
}

function renderHeader() {
  const m = state.currentMatch;
  const progress = Math.round((m.completed / m.total) * 100);
  el.matchHeader.innerHTML = `
    <div class="split"><h2>${m.name}</h2><span class="small">${m.completed} / ${m.total}</span></div>
    <div class="progress"><div style="width:${progress}%"></div></div>
    <div class="metric-grid">
      <article><p>Overall</p><strong>#${m.yourRank}</strong></article>
      <article><p>Division</p><strong>#${m.divisionRank} ${m.division}</strong></article>
      <article><p>Class</p><strong>#${m.classRank} ${m.className}</strong></article>
      <article><p>DQ</p><strong>${m.dq}</strong></article>
    </div>
  `;
}

function renderStages() {
  const m = state.currentMatch;
  el.stageList.innerHTML = m.stages
    .map(
      (s) => `<li class="${s.pct < 82 ? 'warn' : ''}"><div><strong>${s.name}</strong><p>${s.hits} · ${s.penalties}</p></div><span class="score">${s.pct}%</span></li>`
    )
    .join('');

  el.stageMetrics.innerHTML = `
    <article><p class="eyebrow">Raw timer</p><strong>${m.stages.length * 2} strings imported</strong></article>
    <article><p class="eyebrow">Extra shots</p><strong>+${Math.max(0, Math.round((100 - m.competitors[0].overallPct) / 2))} over plan</strong></article>
  `;
}

function renderCompare() {
  const list = [...state.currentMatch.competitors];
  if (state.compareExtra && !list.find((x) => x.name === state.compareExtra.name)) list.push(state.compareExtra);
  el.compareStack.innerHTML = list
    .map(
      (c) => `<article class="${c.name === 'You' ? 'me' : ''}"><h4>${c.name}</h4><p>${c.overallPct}% · Avg place ${c.avgPlace}</p></article>`
    )
    .join('');
}

function renderClassifications() {
  el.classificationList.innerHTML = state.currentMatch.classifications
    .map(([a, b]) => `<li><span>${a}</span><strong>${b}</strong></li>`)
    .join('');
}

function render() {
  renderHeader();
  renderStages();
  renderCompare();
  renderClassifications();
}

function runSearch() {
  const q = el.searchInput.value.trim().toLowerCase();
  if (!q) return;

  const matchHits = state.matches.filter((m) => m.name.toLowerCase().includes(q));
  const shooterHits = state.matches.flatMap((m) =>
    m.shooters.filter((s) => s.toLowerCase().includes(q)).map((s) => ({ shooter: s, match: m }))
  );

  const rows = [];
  matchHits.forEach((m) => rows.push(`<button class="result-btn" data-match="${m.id}">📋 ${m.name} <span>${m.provider}</span></button>`));
  shooterHits.forEach((x) => rows.push(`<button class="result-btn" data-match="${x.match.id}">🎯 ${x.shooter} <span>${x.match.name}</span></button>`));

  el.searchResults.innerHTML = rows.length ? rows.join('') : '<p class="foot-note">No match or shooter found.</p>';

  document.querySelectorAll('.result-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const m = state.matches.find((x) => x.id === btn.dataset.match);
      if (m) setMatch(m);
    });
  });
}

function wire() {
  tabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach((b) => b.classList.toggle('active', b === tab));
      panels.forEach((p) => p.classList.toggle('active', p.dataset.panel === target));
    })
  );

  navButtons.forEach((btn) =>
    btn.addEventListener('click', () => navButtons.forEach((b) => b.classList.toggle('active', b === btn)))
  );

  el.searchBtn.addEventListener('click', runSearch);
  el.searchInput.addEventListener('keydown', (e) => e.key === 'Enter' && runSearch());

  document.getElementById('simulateBtn').addEventListener('click', () => {
    const miss = Number(document.getElementById('whatIfMiss').value || 0);
    const proc = Number(document.getElementById('whatIfProc').value || 0);
    const delta = Number(document.getElementById('whatIfTime').value || 0);
    const shift = Math.max(0, miss + proc + Math.round(delta * -0.7));
    el.simResult.innerHTML = `Projected: <strong>#${Math.max(1, state.currentMatch.yourRank - shift)} overall · #${Math.max(1, state.currentMatch.divisionRank - Math.ceil(shift / 2))} division</strong>`;
  });

  document.getElementById('addCompareBtn').addEventListener('click', () => {
    const pool = ['Jordan Pike', 'Sam Ortega', 'Casey Tran'];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    state.compareExtra = { name: pick, overallPct: (88 + Math.random() * 10).toFixed(1), avgPlace: (4 + Math.random() * 8).toFixed(1) };
    renderCompare();
  });

  document.getElementById('timerBtn').addEventListener('click', () => {
    el.syncChip.textContent = `Bluetooth timer synced ${new Date().toLocaleTimeString()}`;
  });

  document.getElementById('downloadBtn').addEventListener('click', () => {
    const payload = JSON.stringify(state.currentMatch, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${state.currentMatch.id}-offline.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
}

setMatch(state.matches[0]);
wire();
fetchRemoteProviders();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
