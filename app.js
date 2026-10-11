// Supercar Legends: app logic (Garage, Timeline, Speed Records, Top Trumps, Credits).
'use strict';

if ('serviceWorker' in navigator) {
    // When a new version takes over, reload once so the old and new files are never mixed
    const hadController = !!navigator.serviceWorker.controller;
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (hadController && !reloading) { reloading = true; window.location.reload(); }
    });
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// =====================================================================
//  DATA
// =====================================================================
const CREDITS = (typeof IMAGE_CREDITS !== 'undefined') ? IMAGE_CREDITS : {};
const toId = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function storageGet(key, fallback) { try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; } }
function storageSet(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ } }

const cars = CAR_ROWS.map(([name, maker, year, country, type, engine, bhp, mph, z62, kg, built, desc, factA, factB, bigClue, wiki]) =>
    ({ id: toId(name), name, maker, year, country, type, engine, bhp, mph, z62, kg, built, desc, facts: [factA, factB], bigClue, wiki }));
const carById = Object.fromEntries(cars.map(c => [c.id, c]));
const carByName = Object.fromEntries(cars.map(c => [c.name, c]));
const decadeOf = c => DECADES.find(d => c.year >= d.from && c.year <= d.to);
// "Lamborghini Miura" shows as maker "Lamborghini" + model "Miura"; names that don't start with the maker stay whole
const modelName = c => c.name.startsWith(c.maker + ' ') ? c.name.slice(c.maker.length + 1) : c.name;

// =====================================================================
//  UNITS (mph first, km/h underneath; the switch swaps them)
// =====================================================================
let units = storageGet('units', 'mph');
const kmh = mph => Math.round(mph * 1.609344);
const kw = bhp => Math.round(bhp * 0.7457);
const fmt = n => Number(n).toLocaleString('en-GB');
function speedMain(mph) { return units === 'mph' ? `${fmt(Math.round(mph))} mph` : `${fmt(kmh(mph))} km/h`; }
function speedSub(mph) { return units === 'mph' ? `${fmt(kmh(mph))} km/h` : `${fmt(Math.round(mph))} mph`; }
const secs = v => Number.isInteger(v * 10) ? v.toFixed(1) : String(v);
const accelLabel = () => units === 'mph' ? '0–62 mph' : '0–100 km/h';
function updateUnitsButton() { document.getElementById('units-btn').textContent = units === 'mph' ? 'MPH' : 'KM/H'; }

// Stat definitions shared by the pop-up card and the Top Trumps game.
// bar() gives 0..1 for the dashboard bar; higher: which way wins in Top Trumps.
const STATS = [
    { key: 'bhp', label: 'Power', higher: true, bar: v => Math.sqrt(v / 2000),
      main: v => `${fmt(v)} bhp`, sub: v => `${fmt(kw(v))} kW` },
    { key: 'mph', label: 'Top speed', higher: true, bar: v => (v - 90) / (320 - 90),
      main: v => speedMain(v), sub: v => speedSub(v) },
    { key: 'z62', label: '0–62', higher: false, bar: v => (11 - v) / (11 - 1.8),
      main: v => `${secs(v)} s`, sub: () => accelLabel() },
    { key: 'kg', label: 'Weight', higher: false, bar: v => v / 2400,
      main: v => `${fmt(v)} kg`, sub: v => `${fmt(Math.round(v * 2.20462))} lb` },
    { key: 'built', label: 'Built', higher: false, bar: v => 1 - Math.log10(Math.max(1, v)) / 5,
      main: v => fmt(v), sub: () => 'made' }
];
const clamp01 = x => Math.max(0.03, Math.min(1, x));

// =====================================================================
//  PICTURES (real photo if it has a credit, otherwise a drawn car silhouette)
// =====================================================================
const placeholderCache = {};
function placeholderFor(c) {
    if (placeholderCache[c.id]) return placeholderCache[c.id];
    const col = CAR_TYPES[c.type].color;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
        <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#262B34"/><stop offset="1" stop-color="#0E1013"/></linearGradient></defs>
        <rect width="400" height="300" fill="url(#g)"/>
        <path d="M0 230 H400" stroke="#2E333D" stroke-width="2"/>
        <path d="M40 205 Q48 168 110 160 L170 128 Q205 116 250 122 L300 140 Q352 150 362 180 L364 205 Z" fill="${col}" opacity=".9"/>
        <path d="M178 132 L205 124 Q232 122 258 128 L284 142 L190 146 Z" fill="#0E1013" opacity=".7"/>
        <circle cx="112" cy="207" r="25" fill="#0E1013"/><circle cx="112" cy="207" r="13" fill="#5A616D"/>
        <circle cx="305" cy="207" r="25" fill="#0E1013"/><circle cx="305" cy="207" r="13" fill="#5A616D"/>
        <text x="200" y="272" font-family="sans-serif" font-size="16" font-weight="700" fill="#6E7785" text-anchor="middle" letter-spacing="3">PHOTO COMING SOON</text>
    </svg>`;
    return placeholderCache[c.id] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
const imageUrlFor = c => CREDITS[c.id] ? `car-images/${c.id}.webp` : placeholderFor(c);
const carImg = (c, lazy = true) => `<img src="${imageUrlFor(c)}" alt="${escapeHtml(c.name)}" data-id="${c.id}" draggable="false" ${lazy ? 'loading="lazy"' : ''} onerror="imgFailed(this)">`;
function imgFailed(img) { img.onerror = null; img.src = placeholderFor(carById[img.dataset.id]); }
const isArtwork = c => c.type === 'concept' || (CREDITS[c.id] && /render|concept|artist|illustration|drawing/i.test(CREDITS[c.id].file));
function creditText(c) {
    const cr = CREDITS[c.id];
    if (!cr) return 'Drawn placeholder. A real photo is coming soon.';
    return `${isArtwork(c) ? 'Concept or show car · ' : ''}📷 ${cr.author} · ${cr.license} · Wikimedia Commons`;
}

// =====================================================================
//  SOUND & SPEECH (WebAudio, no sound files)
// =====================================================================
let audioCtx = null;
function getAudio() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    } catch (e) { return null; }
}
function tone(ctx, { freq, to = freq, dur = .2, type = 'sine', vol = .2, delay = 0 }) {
    const t = ctx.currentTime + delay, osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, t); osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    gain.gain.setValueAtTime(vol, t); gain.gain.exponentialRampToValueAtTime(.001, t + dur);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(t); osc.stop(t + dur + .02);
}
function playSound(type) {
    const ctx = getAudio(); if (!ctx) return;
    switch (type) {
        case 'click': tone(ctx, { freq: 900, to: 1200, dur: .05, type: 'square', vol: .04 }); break;
        case 'rev':   // a quick engine blip
            tone(ctx, { freq: 70, to: 210, dur: .35, type: 'sawtooth', vol: .09 });
            tone(ctx, { freq: 140, to: 420, dur: .35, type: 'square', vol: .03 });
            tone(ctx, { freq: 210, to: 90, dur: .4, type: 'sawtooth', vol: .06, delay: .33 }); break;
        case 'win': [523, 659, 784, 1047].forEach((f, i) => tone(ctx, { freq: f, dur: .22, type: 'triangle', vol: .16, delay: i * .08 })); break;
        case 'lose': tone(ctx, { freq: 220, to: 90, dur: .35, type: 'sawtooth', vol: .1 }); break;
    }
}
function speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.rate = .95; u.lang = 'en-GB';
    window.speechSynthesis.speak(u);
}
function stopSpeaking() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }
let toastTimer = null;
function toast(msg, ms = 1800) {
    const el = document.getElementById('toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

// =====================================================================
//  NAVIGATION
// =====================================================================
let currentScreen = 'garage';
// Other files (stories.js, games.js) add what happens when a screen opens or closes
const SCREEN_ENTER = {}, SCREEN_LEAVE = [];
window.getUnits = () => units;
// The 3D builder is a separate module, loaded the first time Build opens
let builder = null;
function loadBuilder(attempt = 0) {
    // On a retry, ask for a fresh copy in case the browser remembered a failed download
    const url = attempt ? `./builder.js?retry=${Date.now()}` : './builder.js';
    return import(url).catch(err => attempt < 2 ? new Promise(r => setTimeout(r, 800)).then(() => loadBuilder(attempt + 1)) : Promise.reject(err));
}
SCREEN_ENTER.build = () => {
    const stage = document.getElementById('build-stage');
    (builder ? Promise.resolve(builder) : loadBuilder())
        .then(m => { builder = m; if (currentScreen === 'build') m.enter(); })
        .catch(err => {
            stage.innerHTML = `<div class="b-nogl"><div><h2>The builder could not start</h2><p>Check you're online the first time you open it, then try again.</p>
                <p class="small">${escapeHtml(String(err && err.message || err))}</p><button class="act-btn" id="build-retry">Try again</button></div></div>`;
            document.getElementById('build-retry').onclick = () => { stage.innerHTML = '<div class="build-loading">Starting the engine…</div>'; SCREEN_ENTER.build(); };
        });
};
SCREEN_LEAVE.push(id => { if (builder && id !== 'build') builder.leave(); });
// Racing is a separate module too, loaded the first time Race opens
let racer = null;
SCREEN_ENTER.race = () => import('./race.js').then(m => { racer = m; if (currentScreen === 'race') m.enter(); })
    .catch(err => { document.getElementById('race-menu').innerHTML = `<div class="panel"><h2>Racing could not start</h2><p>Check you're online the first time you open it, then reload.</p><p class="small">${escapeHtml(String(err && err.message || err))}</p></div>`; });
SCREEN_LEAVE.push(id => { if (racer && id !== 'race') racer.leave(); });
const GAME_SCREENS = ['games', 'trumps', 'guess', 'quiz', 'order', 'drag'];
function switchScreen(screenId) {
    const navId = GAME_SCREENS.includes(screenId) ? 'games' : screenId;
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === `screen-${screenId}`));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === navId));
    const btn = document.querySelector(`.nav-btn[data-screen="${navId}"]`);
    if (btn) btn.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    currentScreen = screenId;
    stopSpeaking(); closeModal();
    SCREEN_LEAVE.forEach(fn => fn(screenId));
    window.scrollTo({ top: 0 });
    if (screenId === 'timeline') renderTimeline();
    if (screenId === 'records') renderRecords();
    if (screenId === 'trumps' && !TT) trumpsNewGame();
    if (screenId === 'credits') renderCredits();
    if (SCREEN_ENTER[screenId]) SCREEN_ENTER[screenId]();
}
document.addEventListener('click', e => {
    const nav = e.target.closest('[data-screen]');
    if (nav) { switchScreen(nav.dataset.screen); return; }
    const card = e.target.closest('.car-card, [data-car]');
    if (card && !card.closest('.no-open')) openModal(carById[card.dataset.id || card.dataset.car]);
});
document.getElementById('units-btn').onclick = () => {
    units = units === 'mph' ? 'kmh' : 'mph'; storageSet('units', units); updateUnitsButton();
    toast(units === 'mph' ? 'Speeds in mph (km/h underneath)' : 'Speeds in km/h (mph underneath)');
    rerender();
};
function rerender() {
    renderGarage();
    if (currentScreen === 'timeline') renderTimeline();
    if (currentScreen === 'records') renderRecords();
    if (currentScreen === 'trumps') trumpsRender();
    if (modalCar) openModal(modalCar, false);
    if (builder) builder.refreshUnits();
}

// =====================================================================
//  CARDS
// =====================================================================
function miniStat(label, value) { return `<div class="mini-stat"><b>${value}</b><span>${label}</span></div>`; }
function carCard(c) {
    const t = CAR_TYPES[c.type], ctry = CAR_COUNTRIES[c.country];
    const speed = c.mph ? (units === 'mph' ? Math.round(c.mph) : kmh(c.mph)) : '–';
    return `<button class="car-card" data-id="${c.id}" style="--tc:${t.color}">
        <div class="cc-photo">${carImg(c)}<span class="cc-year">${c.year}</span><span class="cc-flag" title="${ctry.name}">${ctry.flag}</span><span class="cc-type">${t.short}</span></div>
        <div class="cc-body">
            <div class="cc-maker">${escapeHtml(c.maker)}</div>
            <h3 class="cc-name">${escapeHtml(modelName(c))}</h3>
            <div class="mini-stats">${miniStat('bhp', c.bhp ? fmt(c.bhp) : '–')}${miniStat(units === 'mph' ? 'mph' : 'km/h', speed)}${miniStat('0–62', c.z62 ? secs(c.z62) : '–')}</div>
        </div>
    </button>`;
}
function statRow(c, s, asButton = false) {
    const v = c[s.key], known = v !== null && v !== undefined;
    const tag = asButton ? 'button' : 'div';
    const label = s.key === 'z62' ? (units === 'mph' ? '0–62' : '0–100') : s.label;
    return `<${tag} class="stat ${known ? '' : 'unknown'}" data-stat="${s.key}" ${asButton && !known ? 'disabled' : ''}>
        <span class="s-label">${label}</span>
        <span class="s-bar"><i data-w="${known ? clamp01(s.bar(v)) : 0}"></i></span>
        <span class="s-val" ${known && s.key !== 'z62' ? `data-count="${s.key}"` : ''}>${known ? s.main(v) : '?'}<small>${known ? s.sub(v) : 'not known'}</small></span>
    </${tag}>`;
}
function trumpCard(c, { buttons = false, statKeys = null } = {}) {
    const t = CAR_TYPES[c.type], ctry = CAR_COUNTRIES[c.country];
    const stats = statKeys ? STATS.filter(s => statKeys.includes(s.key)) : STATS;
    return `<div class="tc-band"><h2>${escapeHtml(c.name)}</h2><span class="tc-year">${c.year}</span></div>
        <div class="tc-photo">${carImg(c, false)}<span class="tc-maker">${escapeHtml(c.maker)}</span><span class="tc-flag" title="${ctry.name}">${ctry.flag}</span></div>
        <div class="tc-stats">${stats.map(s => statRow(c, s, buttons)).join('')}</div>`;
}
// Fill the stat bars and count the numbers up, like a rev counter
function animateStats(root) {
    root.querySelectorAll('.s-bar i').forEach(i => { i.style.width = '0'; });
    requestAnimationFrame(() => requestAnimationFrame(() => root.querySelectorAll('.s-bar i').forEach(i => { i.style.width = (i.dataset.w * 100) + '%'; })));
    root.querySelectorAll('[data-count]').forEach(el => {
        const first = el.firstChild; if (!first || first.nodeType !== 3) return;
        const finalText = first.textContent, m = finalText.match(/[\d,]+/); if (!m) return;
        const target = Number(m[0].replace(/,/g, '')), start = performance.now(), dur = 900;
        const step = now => {
            const p = Math.min(1, (now - start) / dur), eased = 1 - Math.pow(1 - p, 3);
            first.textContent = finalText.replace(m[0], fmt(Math.round(target * eased)));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    });
}

// =====================================================================
//  POP-UP
// =====================================================================
let modalCar = null;
function openModal(c, withSound = true) {
    if (!c) return;
    modalCar = c;
    const t = CAR_TYPES[c.type], ctry = CAR_COUNTRIES[c.country], dec = decadeOf(c);
    const card = document.getElementById('modal-trump');
    card.style.setProperty('--tc', t.color);
    card.innerHTML = trumpCard(c);
    document.getElementById('modal-tags').innerHTML =
        `<span class="tag" style="--tc:${t.color}">${t.short}</span><span class="tag" style="--tc:${dec.color}">${dec.key}</span><span class="tag">${ctry.flag} ${ctry.name}</span>`;
    document.getElementById('modal-desc').textContent = c.desc;
    document.getElementById('modal-facts').innerHTML = c.facts.map(f => `<li>${escapeHtml(f)}</li>`).join('') + `<li class="clue">"${escapeHtml(c.bigClue)}"</li>`;
    document.getElementById('modal-engine').innerHTML = `Engine: <b>${escapeHtml(c.engine)}</b>${c.type === 'race' ? ' · Built for racing' : ''}${c.type === 'concept' ? ' · Concept car' : ''}<br><span class="small">Figures are the maker's claims where there are any. Weight can be measured with or without fuel, so treat it as a guide.</span>`;
    document.getElementById('modal-decade').textContent = `See the ${dec.key}`;
    document.getElementById('modal-credit').textContent = creditText(c);
    document.getElementById('car-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
    animateStats(card);
    if (withSound) playSound('rev');
}
function closeModal() {
    document.getElementById('car-modal').classList.remove('open');
    document.body.style.overflow = '';
    modalCar = null; stopSpeaking();
}
document.getElementById('modal-close').onclick = closeModal;
document.getElementById('car-modal').addEventListener('click', e => { if (e.target.id === 'car-modal') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.getElementById('modal-speak').onclick = () => {
    const c = modalCar; if (!c) return;
    const bits = [];
    if (c.bhp) bits.push(`${c.bhp} brake horsepower`);
    if (c.mph) bits.push(`a top speed of ${Math.round(c.mph)} miles per hour`);
    speak(`${c.name}, from ${c.year}. ${c.desc} ${bits.length ? 'It has ' + bits.join(' and ') + '.' : ''} ${c.facts.join(' ')}`);
};
document.getElementById('modal-decade').onclick = () => {
    const dec = decadeOf(modalCar); selectedDecade = dec.key; switchScreen('timeline');
};

// =====================================================================
//  GARAGE
// =====================================================================
const garage = { decade: 'all', type: 'all', maker: 'all', country: 'all', sort: 'year' };
const makers = [...new Set(cars.map(c => c.maker))].sort();
document.getElementById('garage-maker').innerHTML = `<option value="all">All makers</option>` + makers.map(m => `<option>${escapeHtml(m)}</option>`).join('');
document.getElementById('garage-country').innerHTML = `<option value="all">All countries</option>` +
    Object.entries(CAR_COUNTRIES).filter(([k]) => cars.some(c => c.country === k)).map(([k, v]) => `<option value="${k}">${v.flag} ${v.name}</option>`).join('');
function chipsHtml(items, active, attr) {
    return items.map(it => `<button class="chip ${attr === 'decade' ? 'dec' : ''} ${active === it.key ? 'active' : ''}" data-${attr}="${it.key}" style="--cc:${it.color}">${it.label} <span class="count">${it.count}</span></button>`).join('');
}
const SORTS = {
    year: (a, b) => a.year - b.year || a.name.localeCompare(b.name),
    'year-desc': (a, b) => b.year - a.year || a.name.localeCompare(b.name),
    bhp: (a, b) => (b.bhp ?? -1) - (a.bhp ?? -1),
    mph: (a, b) => (b.mph ?? -1) - (a.mph ?? -1),
    z62: (a, b) => (a.z62 ?? 99) - (b.z62 ?? 99),
    name: (a, b) => a.name.localeCompare(b.name)
};
function renderGarage() {
    const q = document.getElementById('garage-search').value.trim().toLowerCase();
    const base = cars.filter(c => (garage.maker === 'all' || c.maker === garage.maker) && (garage.country === 'all' || c.country === garage.country)
        && (!q || c.name.toLowerCase().includes(q) || c.maker.toLowerCase().includes(q)));
    const inDecade = c => garage.decade === 'all' || decadeOf(c).key === garage.decade;
    const inType = c => garage.type === 'all' || c.type === garage.type;
    document.getElementById('garage-decades').innerHTML = chipsHtml(
        [{ key: 'all', label: 'All years', color: '#E10600', count: base.filter(inType).length },
         ...DECADES.map(d => ({ key: d.key, label: d.key, color: d.color, count: base.filter(c => inType(c) && decadeOf(c) === d).length }))], garage.decade, 'decade');
    document.getElementById('garage-types').innerHTML = chipsHtml(
        [{ key: 'all', label: 'All types', color: '#E10600', count: base.filter(inDecade).length },
         ...Object.entries(CAR_TYPES).map(([k, t]) => ({ key: k, label: t.label, color: t.color, count: base.filter(c => inDecade(c) && c.type === k).length }))
             .filter(x => x.count || garage.type === x.key)], garage.type, 'type');
    const list = base.filter(c => inDecade(c) && inType(c)).sort(SORTS[garage.sort]);
    document.getElementById('garage-grid').innerHTML = list.length ? list.map(carCard).join('') : `<p class="empty-note">No cars match. Try another search or filter.</p>`;
}
document.getElementById('garage-decades').addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) { garage.decade = c.dataset.decade; playSound('click'); renderGarage(); } });
document.getElementById('garage-types').addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) { garage.type = c.dataset.type; playSound('click'); renderGarage(); } });
document.getElementById('garage-search').addEventListener('input', renderGarage);
document.getElementById('garage-maker').onchange = e => { garage.maker = e.target.value; renderGarage(); };
document.getElementById('garage-country').onchange = e => { garage.country = e.target.value; renderGarage(); };
document.getElementById('garage-sort').onchange = e => { garage.sort = e.target.value; renderGarage(); };
document.getElementById('garage-subtitle').textContent =
    `${cars.length} supercars, hypercars, GTs and race cars from ${new Set(cars.map(c => c.maker)).size} makers. Tap a card to open it.`;

// =====================================================================
//  TIMELINE
// =====================================================================
let selectedDecade = '1960s';
function renderTimeline() {
    document.getElementById('decade-bar').innerHTML = DECADES.map(d =>
        `<button class="dec-btn ${d.key === selectedDecade ? 'active' : ''}" data-dec="${d.key}" style="--dc:${d.color}">${d.key}<span class="dec-count">${cars.filter(c => decadeOf(c) === d).length} CARS</span></button>`).join('');
    const d = DECADES.find(x => x.key === selectedDecade);
    const keyCars = d.key_cars.map(n => carByName[n]).filter(Boolean);
    const all = cars.filter(c => decadeOf(c) === d).sort(SORTS.year);
    const panel = document.getElementById('decade-panel');
    panel.style.setProperty('--dc', d.color);
    panel.innerHTML = `
        <div class="decade-hero">
            <div class="panel"><span class="kicker">${d.key}</span><h2>${d.title}</h2><p>${d.intro}</p></div>
            <div>
                <div class="info-box"><h3>⏱ Speed record</h3><p>${d.record}</p></div>
                <div class="info-box"><h3>🏁 Motorsport moment</h3><p>${d.motorsport}</p></div>
            </div>
        </div>
        <p class="section-label">Key cars of the ${d.key}</p>
        <div class="car-grid">${keyCars.map(carCard).join('')}</div>
        <p class="section-label">Every car from the ${d.key} (${all.length})</p>
        <div class="car-grid">${all.filter(c => !keyCars.includes(c)).map(carCard).join('')}</div>`;
}
document.getElementById('decade-bar').addEventListener('click', e => {
    const b = e.target.closest('.dec-btn'); if (!b) return;
    selectedDecade = b.dataset.dec; playSound('click'); renderTimeline();
});

// =====================================================================
//  SPEED RECORDS (a growing chart)
// =====================================================================
function renderRecords() {
    const W = 1000, H = 420, L = 64, R = 24, T = 24, B = 46;
    const x = yr => L + (yr - 1958) / (2028 - 1958) * (W - L - R);
    const yMin = 140, yMax = 320;
    const y = mph => T + (1 - (mph - yMin) / (yMax - yMin)) * (H - T - B);
    const val = mph => units === 'mph' ? mph : mph * 1.609344;
    let grid = '';
    for (let v = 150; v <= 300; v += 50) {
        const label = units === 'mph' ? `${v} mph` : `${kmh(v)} km/h`;
        grid += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#303641" stroke-dasharray="4 6"/><text x="${L - 8}" y="${y(v) + 4}" fill="#6E7785" font-size="13" text-anchor="end">${label}</text>`;
    }
    DECADES.forEach(d => { grid += `<text x="${x(d.from + 5)}" y="${H - 16}" fill="${d.color}" font-size="14" font-weight="700" text-anchor="middle">${d.key}</text>`; });
    let path = '', prev = null;
    SPEED_RECORDS.forEach(([yr, , mph]) => {
        path += prev ? ` H${x(yr)} V${y(mph)}` : `M${x(yr)} ${y(mph)}`; prev = mph;
    });
    path += ` H${x(2026.8)}`;
    // Only some points get a label on the chart, placed by hand so they don't overlap (the list below has them all)
    const LABELS = { 1960: ['DB4 GT Zagato', 10, 22, 'start'], 1969: ['Miura P400S', -6, -14, 'end'], 1982: ['Countach', 0, 26, 'middle'],
        1986: ['Porsche 959', -12, 5, 'end'], 1987: ['Ruf CTR', -12, -10, 'end'], 1992: ['McLaren F1', 12, 5, 'start'],
        1993: ['Dauer 962', -12, -8, 'end'], 2005: ['Veyron', -10, -14, 'end'], 2010: ['Veyron Super Sport', -12, -12, 'end'],
        2017: ['Agera RS', 0, 28, 'middle'], 2021: ['Tuatara', 0, -14, 'middle'] };
    const dots = SPEED_RECORDS.map(([yr, , mph]) => {
        const lab = LABELS[yr];
        return `<circle cx="${x(yr)}" cy="${y(mph)}" r="6" fill="#FFB300" stroke="#111317" stroke-width="2"/>` +
            (lab ? `<text x="${x(yr) + lab[1]}" y="${y(mph) + lab[2]}" fill="#F4F6F8" font-size="14" font-weight="600" text-anchor="${lab[3]}">${lab[0]}</text>` : '');
    }).join('');
    const others = OTHER_SPEED_RUNS.map(([car, mph, yr]) => `<circle cx="${x(yr)}" cy="${y(mph)}" r="5" fill="none" stroke="#00E5FF" stroke-width="2"/>`).join('');
    document.getElementById('records-chart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Chart of production car speed records from 1960 to today">
        ${grid}
        <path d="${path}" fill="none" stroke="#E10600" stroke-width="4" stroke-linejoin="round" style="filter: drop-shadow(0 0 6px rgba(225,6,0,.6))"/>
        ${others}${dots}
        <g transform="translate(${L + 10} ${T + 6})"><circle r="5" fill="#FFB300"/><text x="12" y="4" fill="#A3ACB9" font-size="13">Official record</text>
        <circle cx="140" r="5" fill="none" stroke="#00E5FF" stroke-width="2"/><text x="152" y="4" fill="#A3ACB9" font-size="13">Famous run that doesn't count</text></g>
    </svg>`;
    const findCar = name => cars.find(c => name.startsWith(c.name) || c.name.startsWith(name));
    const row = (yr, car, mph, note) => {
        const c = findCar(car);
        return `<li class="${c ? 'linked' : ''}" ${c ? `data-car="${c.id}"` : ''}><span class="r-year">${yr}</span>
            <span><span class="r-car">${escapeHtml(car)}</span><span class="r-note">${escapeHtml(note)}</span></span>
            <span class="r-speed">${speedMain(mph)}<small>${speedSub(mph)}</small></span></li>`;
    };
    document.getElementById('record-list').innerHTML = SPEED_RECORDS.map(([yr, car, mph, note]) => row(yr, car, mph, note)).join('');
    document.getElementById('other-runs').innerHTML = OTHER_SPEED_RUNS.map(([car, mph, yr, note]) => row(yr, car, mph, note)).join('');
}

// =====================================================================
//  TOP TRUMPS BATTLE
// =====================================================================
const TT_STATS = ['bhp', 'mph', 'z62', 'kg'];
const TT_DECK = cars.filter(c => TT_STATS.every(k => c[k] !== null) && c.type !== 'race' && c.type !== 'concept');
const TT_HAND = 10;
let TT = null;
function trumpsNewGame() {
    const deck = shuffle(TT_DECK).slice(0, TT_HAND * 2);
    TT = { player: deck.slice(0, TT_HAND), cpu: deck.slice(TT_HAND), pot: [], turn: 'player', phase: 'choose', round: 1, result: null, chosen: null };
    trumpsRender();
}
function trumpsScore(c, key) { const s = STATS.find(x => x.key === key); return s.higher ? s.bar(c[key]) : s.bar(c[key]); }
function trumpsRender() {
    if (!TT) return;
    const p = TT.player[0], c = TT.cpu[0];
    document.getElementById('trumps-score').innerHTML =
        `<span class="pill">You: <b>${TT.player.length}</b> cards</span><span class="pill">Computer: <b>${TT.cpu.length}</b> cards</span>${TT.pot.length ? `<span class="pill">In the middle: <b>${TT.pot.length}</b></span>` : ''}`;
    const pEl = document.getElementById('trumps-player'), cEl = document.getElementById('trumps-cpu');
    const msg = document.getElementById('trumps-msg'), next = document.getElementById('trumps-next');
    if (TT.phase === 'over') {
        const won = TT.player.length > TT.cpu.length;
        pEl.innerHTML = cEl.innerHTML = '';
        msg.innerHTML = won ? `<span class="win">🏆 You win the battle!</span><br>${TT.player.length} cards to ${TT.cpu.length}.` : TT.player.length === TT.cpu.length ? `<span class="draw">It's a draw!</span>` : `<span class="lose">The computer wins this time.</span><br>${TT.cpu.length} cards to ${TT.player.length}.`;
        next.textContent = 'Play again'; next.hidden = false;
        return;
    }
    pEl.innerHTML = `<div class="trump-card" style="--tc:${CAR_TYPES[p.type].color}">${trumpCard(p, { buttons: TT.phase === 'choose' && TT.turn === 'player', statKeys: TT_STATS })}</div>`;
    if (TT.phase === 'choose') {
        cEl.innerHTML = `<div class="trump-card back"><div class="back-logo">SUPERCAR<br>LEGENDS</div></div>`;
        msg.innerHTML = TT.turn === 'player' ? 'Your turn!<br><span class="small">Tap a stat on your card.</span>' : "Computer's turn…";
        next.hidden = true;
        if (TT.turn === 'cpu') setTimeout(trumpsCpuChoose, 1100);
    } else {
        cEl.innerHTML = `<div class="trump-card" style="--tc:${CAR_TYPES[c.type].color}">${trumpCard(c, { statKeys: TT_STATS })}</div>`;
        [pEl, cEl].forEach((el, i) => {
            const row = el.querySelector(`[data-stat="${TT.chosen}"]`);
            if (row && TT.result !== 'draw') row.classList.add((TT.result === 'player') === (i === 0) ? 'win' : 'lose');
        });
        const label = STATS.find(s => s.key === TT.chosen).label;
        msg.innerHTML = TT.result === 'draw' ? `<span class="draw">Draw on ${label}!</span><br>Both cards go in the middle.`
            : TT.result === 'player' ? `<span class="win">You win the round!</span><br>${label}: your ${escapeHtml(modelName(p))} beats the ${escapeHtml(modelName(c))}.`
            : `<span class="lose">Computer wins the round.</span><br>${label}: the ${escapeHtml(modelName(c))} beats your ${escapeHtml(modelName(p))}.`;
        next.textContent = 'Next round'; next.hidden = false;
        animateStats(cEl);
    }
    animateStats(pEl);
}
function trumpsPlay(key) {
    const p = TT.player[0], c = TT.cpu[0], s = STATS.find(x => x.key === key);
    const diff = s.higher ? p[key] - c[key] : c[key] - p[key];
    TT.chosen = key; TT.phase = 'reveal';
    TT.result = diff > 0 ? 'player' : diff < 0 ? 'cpu' : 'draw';
    playSound(TT.result === 'player' ? 'win' : TT.result === 'cpu' ? 'lose' : 'click');
    trumpsRender();
}
function trumpsCpuChoose() {
    if (!TT || TT.phase !== 'choose' || TT.turn !== 'cpu') return;
    const c = TT.cpu[0];
    const best = TT_STATS.reduce((a, k) => (trumpsScore(c, k) > trumpsScore(c, a) ? k : a), TT_STATS[0]);
    trumpsPlay(best);
}
function trumpsNextRound() {
    if (TT.phase === 'over') { trumpsNewGame(); return; }
    const p = TT.player.shift(), c = TT.cpu.shift();
    if (TT.result === 'draw') TT.pot.push(p, c);
    else { const winner = TT.result === 'player' ? TT.player : TT.cpu; winner.push(p, c, ...TT.pot); TT.pot = []; TT.turn = TT.result; }
    TT.round++;
    TT.phase = (!TT.player.length || !TT.cpu.length || TT.round > 30) ? 'over' : 'choose';
    if (TT.phase === 'over') playSound(TT.player.length > TT.cpu.length ? 'win' : 'lose');
    trumpsRender();
}
document.getElementById('trumps-player').addEventListener('click', e => {
    const b = e.target.closest('button.stat');
    if (b && TT && TT.phase === 'choose' && TT.turn === 'player') { e.stopPropagation(); trumpsPlay(b.dataset.stat); }
}, true);
document.getElementById('trumps-next').onclick = trumpsNextRound;

// =====================================================================
//  COMING SOON
// =====================================================================
const SOON = {
    race: ['Race', 'Race the cars you build on tracks made in the app, against the computer or your own ghost lap.']
};
document.querySelectorAll('.soon-panel').forEach(el => {
    const [title, text] = SOON[el.dataset.soon];
    el.innerHTML = `<div><div class="soon-flag"></div><span class="kicker">Coming soon</span><h1>${title}</h1><p>${text}</p><p class="small">This part of the app is being built next.</p></div>`;
});

// =====================================================================
//  CREDITS
// =====================================================================
function renderCredits() {
    const n = Object.keys(CREDITS).length;
    document.getElementById('credits-intro').innerHTML = `
        <p><b>Supercar Legends is not connected to, or endorsed by, any car company.</b> Car names are used only as facts about history. The app shows no car-maker logos, and cars you build in the app are your own designs.</p>
        <p><b>Photos:</b> ${n + Object.keys(typeof PEOPLE_CREDITS !== 'undefined' ? PEOPLE_CREDITS : {}).length} free-licence photos from <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a>. Thank you to every photographer below. Tap a name to see the original.</p>
        <p><b>Facts:</b> figures are the makers' claims where there are any, checked against Wikipedia and other sources in October 2026. Different sources sometimes give different numbers.</p>
        <p><b>Fonts:</b> Orbitron, Russo One and Exo 2, all under the SIL Open Font Licence, saved inside the app. <b>3D:</b> three.js (MIT licence), saved inside the app. The cars in the builder are drawn in code, so they are your own designs.</p>`;
    document.getElementById('credit-list').innerHTML = cars.filter(c => CREDITS[c.id]).sort(SORTS.name).map(c => {
        const cr = CREDITS[c.id];
        return `<div class="credit-item"><img src="car-images/${c.id}.webp" alt="" loading="lazy"><div><b>${escapeHtml(c.name)}</b>
            <a href="${escapeHtml(cr.url)}" target="_blank" rel="noopener">${escapeHtml(cr.author)}</a> · ${escapeHtml(cr.license)}</div></div>`;
    }).join('');
}

// =====================================================================
//  START
// =====================================================================
updateUnitsButton();
renderGarage();
