const state = {
  matches: [
    {
      id: 'tx-state-2026',
      provider: 'practiscore',
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
        { name: 'You', email: 'mike@example.com', member: 'A12345', division: 'CO', overallPct: 92.8, avgPlace: 8.7 },
        { name: 'Marcus Reed', email: 'marcus@example.com', member: 'A94110', division: 'CO', overallPct: 100, avgPlace: 1.6 },
        { name: 'Riley Novak', email: 'riley@example.com', member: 'A82221', division: 'CO', overallPct: 90.2, avgPlace: 10.2 },
      ],
      stages: [
        { name: 'Stage 7', hits: 59, available: 60, penalties: 0, points: 147, time: 22.61, peak: 6.7, pct: 94.1 },
        { name: 'Stage 8', hits: 56, available: 60, penalties: 2, points: 139, time: 24.19, peak: 6.1, pct: 88.3 },
        { name: 'Stage 9', hits: 52, available: 60, penalties: 13, points: 121, time: 27.72, peak: 5.4, pct: 79.4 },
      ],
      classifications: [['USPSA CO', 'A (74.8%)'], ['Steel Challenge RFPO', 'B (65.2%)'], ['IDPA CO', 'SSP EX'], ['ICORE Open', 'A']],
      classifierHistory: ['USPSA 24-03: 73.4%', 'USPSA 23-11: 71.8%', 'Steel Challenge RFPO: 65.2%'],
      shooters: ['Mike Carter', 'Marcus Reed', 'Riley Novak', 'Alyssa Wynn'],
      videos: [{ stage: 'Stage 8', url: 'https://practiscore.com/results/html/12345' }],
      scoringDevice: 'PractiScore tablet 2.x',
    },
    {
      id: 'ipsc-open-2026',
      provider: 'ipsc',
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
        { name: 'You', email: 'mike@example.com', member: 'IP7721', division: 'Production', overallPct: 87.3, avgPlace: 12.1 },
        { name: 'Luca Tan', email: 'luca@example.com', member: 'IP4412', division: 'Production', overallPct: 98.2, avgPlace: 2.2 },
        { name: 'Mateo Silva', email: 'mateo@example.com', member: 'IP3351', division: 'Open', overallPct: 93.1, avgPlace: 6.4 },
      ],
      stages: [
        { name: 'Stage 12', hits: 112, available: 120, penalties: 10, points: 315, time: 43.2, peak: 7.1, pct: 86.5 },
        { name: 'Stage 13', hits: 58, available: 60, penalties: 0, points: 151, time: 19.5, peak: 7.9, pct: 95.8 },
      ],
      classifications: [['IPSC Production', 'A'], ['USPSA CO', 'A (74.8%)']],
      classifierHistory: ['IPSC Prod Classifier A4: 85.9%', 'IPSC Prod Classifier C2: 82.1%'],
      shooters: ['Mike Carter', 'Luca Tan', 'Mateo Silva', 'Nina Chow'],
      videos: [],
      scoringDevice: 'PractiScore device 1.x',
    },
  ],
  currentMatch: null,
  compareExtra: null,
  ipscIndex: null,
  sourceFilter: 'all',
  viewMode: 'highAvailable',
  searchMode: 'match',
};

const IPSC_RESULTS_URL = 'https://www.ipsc.org/ipsc-match-results/';
const CORS_PROXY_PREFIX = 'https://r.jina.ai/http://';
const OFFLINE_KEY = 'matchflow.offline.history';
const SEARCH_HISTORY_KEY = 'matchflow.search.history';

const el = {
  searchInput: document.getElementById('searchInput'),
  searchBtn: document.getElementById('searchBtn'),
  searchResults: document.getElementById('searchResults'),
  matchHeader: document.getElementById('matchHeader'),
  stageList: document.getElementById('stageList'),
  stageCharts: document.getElementById('stageCharts'),
  stageMetrics: document.getElementById('stageMetrics'),
  compareStack: document.getElementById('compareStack'),
  classificationList: document.getElementById('classificationList'),
  classificationHistory: document.getElementById('classificationHistory'),
  simResult: document.getElementById('simResult'),
  providerChip: document.getElementById('providerChip'),
  syncChip: document.getElementById('syncChip'),
  videoPanel: document.getElementById('videoPanel'),
  offlineHistory: document.getElementById('offlineHistory'),
  combinedDivisionResult: document.getElementById('combinedDivisionResult'),
  advancedFilters: document.getElementById('advancedFilters'),
};

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');
const navButtons = document.querySelectorAll('.bottom-nav button');

function proxied(url) { return `${CORS_PROXY_PREFIX}${url.replace(/^https?:\/\//, '')}`; }
function normalizeName(value) { return value.toLowerCase().replace(/[^a-z0-9@.\s-]/g, ' ').replace(/\s+/g, ' ').trim(); }

function getOfflineHistory() { try { return JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]'); } catch { return []; } }
function getSearchHistory() { try { return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]'); } catch { return []; } }

function pushOfflineHistory(match) {
  const history = getOfflineHistory();
  const next = [{ id: match.id, name: match.name, at: new Date().toISOString() }, ...history.filter((x) => x.id !== match.id)].slice(0, 10);
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(next));
  renderOfflineHistory();
}

function pushSearchHistory(term) {
  const t = term.trim();
  if (!t) return;
  const history = getSearchHistory();
  const next = [t, ...history.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 8);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
  renderSearchHistory();
}

function renderOfflineHistory() {
  const history = getOfflineHistory();
  el.offlineHistory.textContent = history.length ? `Offline cache: ${history.map((x) => x.name).join(' · ')}` : 'Offline cache: none yet';
}

function renderSearchHistory() {
  const history = getSearchHistory();
  const chips = history.map((h) => `<button class="chip-button history-chip" data-history="${h.replace(/"/g, '&quot;')}">${h}</button>`).join('');
  const existing = document.getElementById('searchHistory');
  if (existing) existing.remove();
  const container = document.createElement('div');
  container.id = 'searchHistory';
  container.className = 'chip-row';
  container.innerHTML = chips || '<span class="foot-note">No recent searches yet.</span>';
  el.searchResults.insertAdjacentElement('beforebegin', container);

  container.querySelectorAll('[data-history]').forEach((btn) => {
    btn.addEventListener('click', () => {
      el.searchInput.value = btn.dataset.history;
      runSearch();
    });
  });
}

async function fetchRemoteProviders() {
  const providers = ['PractiScore'];
  try { if ((await fetch(proxied(IPSC_RESULTS_URL))).ok) providers.push('IPSC'); } catch {}
  try { if ((await fetch(proxied('https://uspsa.org/'))).ok) providers.push('USPSA'); } catch {}
  el.providerChip.textContent = `Providers: ${providers.join(' · ')}`;
}

async function loadIpscIndex() {
  if (state.ipscIndex) return state.ipscIndex;
  const response = await fetch(proxied(IPSC_RESULTS_URL));
  if (!response.ok) throw new Error(`IPSC request failed (${response.status})`);
  const markdown = await response.text();
  const links = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let match;
  while ((match = regex.exec(markdown))) {
    const title = match[1].trim();
    const url = match[2].trim();
    if (['facebook', 'instagram', 'twitter', 'contact', 'privacy', 'submit', 'donate'].some((t) => title.toLowerCase().includes(t))) continue;
    if (!url.includes('ipsc.org') && !url.includes('ipscresults.org')) continue;
    links.push({ title, url, provider: 'ipsc' });
  }
  const uniq = []; const seen = new Set();
  for (const item of links) { const key = `${item.title}|${item.url}`; if (!seen.has(key)) { seen.add(key); uniq.push(item); } }
  state.ipscIndex = uniq.slice(0, 120);
  return state.ipscIndex;
}

async function searchIpscByCompetitor(query, candidates) {
  const found = []; const token = normalizeName(query);
  for (const entry of candidates.slice(0, 18)) {
    try {
      const res = await fetch(proxied(entry.url));
      if (!res.ok) continue;
      if (normalizeName(await res.text()).includes(token)) found.push(entry);
    } catch {}
  }
  return found;
}

function setMatch(match) { state.currentMatch = match; render(); }

function renderHeader() {
  const m = state.currentMatch;
  const progress = Math.round((m.completed / m.total) * 100);
  el.matchHeader.innerHTML = `<div class="split"><h2>${m.name}</h2><span class="small">${m.completed} / ${m.total}</span></div><div class="progress"><div style="width:${progress}%"></div></div><div class="metric-grid"><article><p>Overall</p><strong>#${m.yourRank}</strong></article><article><p>Division</p><strong>#${m.divisionRank} ${m.division}</strong></article><article><p>Class</p><strong>#${m.classRank} ${m.className}</strong></article><article><p>DQ</p><strong>${m.dq}</strong></article></div>`;
}

function stageViewValue(stage) { if (state.viewMode === 'timeOnly') return `${stage.time.toFixed(2)}s`; if (state.viewMode === 'highPeak') return `${stage.peak.toFixed(1)} HF`; return `${stage.hits}/${stage.available}`; }

function renderStages() {
  const m = state.currentMatch;
  el.stageList.innerHTML = m.stages.map((s) => `<li class="${s.pct < 82 ? 'warn' : ''}"><div><strong>${s.name}</strong><p>Hits ${s.hits}/${s.available} · Penalties ${s.penalties} · Points ${s.points}</p></div><span class="score">${stageViewValue(s)}</span></li>`).join('');
  el.stageCharts.innerHTML = m.stages.map((s) => `<article><p class="eyebrow">${s.name}</p><div class="bar"><span style="width:${Math.min(100, Math.max(5, s.pct))}%"></span></div><small>${s.pct}%</small></article>`).join('');
  const avgTime = (m.stages.reduce((acc, s) => acc + s.time, 0) / m.stages.length).toFixed(2);
  el.stageMetrics.innerHTML = `<article><p class="eyebrow">Timer analysis</p><strong>${avgTime}s avg · ${m.stages.length * 2} strings</strong></article><article><p class="eyebrow">Scoring device</p><strong>${m.scoringDevice}</strong></article>`;
  el.videoPanel.innerHTML = m.videos.length ? `<p class="eyebrow">Stage-linked videos</p>${m.videos.map((v) => `<a class="result-btn" href="${v.url}" target="_blank" rel="noopener noreferrer">🎥 ${v.stage} video</a>`).join('')}` : '<p class="foot-note">No stage-linked videos for this match.</p>';
}

function renderCompare(filteredList = null) {
  const list = filteredList || [...state.currentMatch.competitors];
  if (state.compareExtra && !list.find((x) => x.name === state.compareExtra.name)) list.push(state.compareExtra);
  el.compareStack.innerHTML = list.map((c) => `<article class="${c.name === 'You' ? 'me' : ''}"><h4>${c.name}</h4><p>${c.overallPct}% · Avg place ${c.avgPlace} · ${c.division || state.currentMatch.division}</p></article>`).join('');
}

function renderClassifications() {
  el.classificationList.innerHTML = state.currentMatch.classifications.map(([a, b]) => `<li><span>${a}</span><strong>${b}</strong></li>`).join('');
  el.classificationHistory.innerHTML = state.currentMatch.classifierHistory.map((x) => `<li><span>History</span><strong>${x}</strong></li>`).join('');
}

function render() { renderHeader(); renderStages(); renderCompare(); renderClassifications(); }
function sourceAllowed(provider) { return state.sourceFilter === 'all' || provider === state.sourceFilter; }

function renderSearchRows(rows) {
  el.searchResults.innerHTML = rows.length ? rows.join('') : '<p class="foot-note">No match or shooter found.</p>';
  document.querySelectorAll('.result-btn[data-match]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const m = state.matches.find((x) => x.id === btn.dataset.match);
      if (m) setMatch(m);
    });
  });
}

function modeMatch(m, qNorm) {
  if (state.searchMode === 'match') return normalizeName(m.name).includes(qNorm);
  if (state.searchMode === 'competitor') return m.competitors.some((c) => normalizeName(c.name).includes(qNorm));
  if (state.searchMode === 'email') return m.competitors.some((c) => normalizeName(c.email).includes(qNorm));
  if (state.searchMode === 'member') return m.competitors.some((c) => normalizeName(c.member).includes(qNorm));
  return false;
}

function importDirectLink(link) {
  const url = link.trim();
  if (!/^https?:\/\//i.test(url)) return null;
  const local = state.matches.find((m) => url.includes(m.id) || url.toLowerCase().includes(normalizeName(m.name).replace(/\s+/g, '-')));
  if (local) setMatch(local);
  return `<a class="result-btn" href="${url}" target="_blank" rel="noopener noreferrer">🔗 Direct link import <span>Open</span></a>`;
}

async function runSearch() {
  const q = el.searchInput.value.trim();
  const qNorm = normalizeName(q);
  if (!qNorm) return;
  pushSearchHistory(q);

  const direct = importDirectLink(q);
  el.searchResults.innerHTML = '<p class="foot-note">Searching PractiScore/IPSC/USPSA index…</p>';

  const rows = [];
  const baseHits = state.matches.filter((m) => sourceAllowed(m.provider) && modeMatch(m, qNorm));
  baseHits.forEach((m) => rows.push(`<button class="result-btn" data-match="${m.id}">📋 ${m.name} <span>${m.provider.toUpperCase()}</span></button>`));

  if (state.searchMode === 'competitor') {
    state.matches.forEach((m) => {
      if (!sourceAllowed(m.provider)) return;
      m.competitors.filter((c) => normalizeName(c.name).includes(qNorm)).forEach((c) => {
        rows.push(`<button class="result-btn" data-match="${m.id}">🎯 ${c.name} <span>${m.name}</span></button>`);
      });
    });
  }

  try {
    if (state.sourceFilter === 'all' || state.sourceFilter === 'ipsc') {
      const ipscIndex = await loadIpscIndex();
      const titleHits = ipscIndex.filter((x) => normalizeName(x.title).includes(qNorm));
      const competitorHits = state.searchMode === 'competitor' ? await searchIpscByCompetitor(qNorm, ipscIndex) : [];
      const map = new Map();
      [...titleHits, ...competitorHits].forEach((x) => map.set(x.url, x));
      [...map.values()].slice(0, 14).forEach((x) => rows.push(`<a class="result-btn" href="${x.url}" target="_blank" rel="noopener noreferrer">🌐 ${x.title} <span>IPSC</span></a>`));
    }
  } catch {
    rows.push('<p class="foot-note">IPSC live search unavailable right now; showing local cached results.</p>');
  }

  if (direct) rows.unshift(direct);
  renderSearchRows(rows);
}

function runWhatIf() {
  const miss = Number(document.getElementById('whatIfMiss').value || 0);
  const hitAdj = Number(document.getElementById('whatIfHits').value || 0);
  const proc = Number(document.getElementById('whatIfProc').value || 0);
  const delta = Number(document.getElementById('whatIfTime').value || 0);
  const pf = document.getElementById('whatIfPF').value;
  const div = document.getElementById('whatIfDivision').value;
  const shift = Math.max(0, miss + proc + Math.round(delta * -0.7) - hitAdj - (pf === 'major' ? 1 : 0) - (div === state.currentMatch.division ? 1 : -1));
  el.simResult.innerHTML = `Projected: <strong>#${Math.max(1, state.currentMatch.yourRank - shift)} overall · #${Math.max(1, state.currentMatch.divisionRank - Math.ceil(shift / 2))} division</strong>`;
}

function combineDivisions() {
  const sorted = [...state.currentMatch.competitors].sort((a, b) => b.overallPct - a.overallPct).slice(0, 3);
  el.combinedDivisionResult.innerHTML = `Combined divisions: <strong>${sorted.map((x) => x.name).join(' · ')}</strong>`;
}

function applyAdvancedFilters() {
  const minStage = Number(document.getElementById('minStagePct').value || 0);
  const includeDQ = document.getElementById('includeDQ').checked;
  renderCompare(state.currentMatch.competitors.filter((c) => (includeDQ ? true : state.currentMatch.dq === 0) && c.overallPct >= minStage));
}

function wire() {
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    tabs.forEach((b) => b.classList.toggle('active', b === tab));
    panels.forEach((p) => p.classList.toggle('active', p.dataset.panel === target));
  }));

  navButtons.forEach((btn) => btn.addEventListener('click', () => navButtons.forEach((b) => b.classList.toggle('active', b === btn))));

  document.querySelectorAll('[data-source]').forEach((btn) => btn.addEventListener('click', () => {
    state.sourceFilter = btn.dataset.source;
    document.querySelectorAll('[data-source]').forEach((x) => x.classList.toggle('active', x === btn));
  }));

  document.querySelectorAll('[data-viewmode]').forEach((btn) => btn.addEventListener('click', () => {
    state.viewMode = btn.dataset.viewmode;
    document.querySelectorAll('[data-viewmode]').forEach((x) => x.classList.toggle('active', x === btn));
    renderStages();
  }));

  document.querySelectorAll('[data-searchmode]').forEach((btn) => btn.addEventListener('click', () => {
    state.searchMode = btn.dataset.searchmode;
    document.querySelectorAll('[data-searchmode]').forEach((x) => x.classList.toggle('active', x === btn));
  }));

  el.searchBtn.addEventListener('click', runSearch);
  el.searchInput.addEventListener('keydown', (e) => e.key === 'Enter' && runSearch());

  document.getElementById('simulateBtn').addEventListener('click', runWhatIf);
  document.getElementById('combineDivBtn').addEventListener('click', combineDivisions);
  document.getElementById('applyFiltersBtn').addEventListener('click', applyAdvancedFilters);

  document.getElementById('addCompareBtn').addEventListener('click', () => {
    const pool = ['Jordan Pike', 'Sam Ortega', 'Casey Tran'];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    state.compareExtra = { name: pick, division: 'Open', overallPct: (88 + Math.random() * 10).toFixed(1), avgPlace: (4 + Math.random() * 8).toFixed(1) };
    renderCompare();
  });

  document.getElementById('timerBtn').addEventListener('click', () => { el.syncChip.textContent = `Bluetooth timer synced ${new Date().toLocaleTimeString()}`; });
  document.getElementById('syncBtn').addEventListener('click', () => { el.syncChip.textContent = `Wi‑Fi sync complete from ${state.currentMatch.scoringDevice} at ${new Date().toLocaleTimeString()}`; });
  document.getElementById('toggleFiltersBtn').addEventListener('click', () => el.advancedFilters.classList.toggle('hidden'));

  document.getElementById('downloadBtn').addEventListener('click', () => {
    const payload = JSON.stringify(state.currentMatch, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${state.currentMatch.id}-offline.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    pushOfflineHistory(state.currentMatch);
  });
}

setMatch(state.matches[0]);
wire();
fetchRemoteProviders();
renderOfflineHistory();
renderSearchHistory();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
