// Supercar Legends: the Le Mans 24 Hours screen (the race, the story, the circuit map, records, race day, famous cars).
// The words and numbers are in lemans.js, and the picture credits are in lemans-credits.js.
'use strict';

const LMCREDITS = (typeof LEMANS_CREDITS !== 'undefined') ? LEMANS_CREDITS : {};
const lmCreditHtml = id => { const cr = LMCREDITS[id]; return cr ? `📷 ${escapeHtml(cr.author)} · ${licenceLink(cr.license)} · Wikimedia Commons` : ''; };
// A photo with its caption and credit. Photos load only when they are about to be seen.
function lmFigure(id, caption, cls = '') {
    if (!LMCREDITS[id]) return '';
    return `<figure class="lm-photo ${cls}"><img src="lemans-images/${id}.webp" alt="${escapeHtml(caption)}" loading="lazy" decoding="async" draggable="false">
        <figcaption>${escapeHtml(caption)}<span class="lm-credit">${lmCreditHtml(id)}</span></figcaption></figure>`;
}
const lmCarChips = names => names.map(n => carByName[n]).filter(Boolean).map(c =>
    `<button class="link-chip lm-chip" data-car="${c.id}"><img src="${imageUrlFor(c)}" alt="" loading="lazy" draggable="false"><span>${escapeHtml(c.name)}</span></button>`).join('');
const lmPeopleChips = names => names.map(n => personByName[n]).filter(Boolean).map(p =>
    `<button class="link-chip" data-person="${p.id}">${escapeHtml(p.name)}</button>`).join('');
const lmTiles = tiles => `<div class="lm-tiles">${tiles.map(([big, small]) => `<div class="lm-tile"><b>${escapeHtml(big)}</b><span>${escapeHtml(small)}</span></div>`).join('')}</div>`;
const lmQuizButton = `<div class="lm-next"><button class="big-btn" data-screen="lmquiz">Play the Le Mans Quiz</button></div>`;

let lmSection = 'race';
let lmPoint = 'start';

// =====================================================================
//  1. THE RACE
// =====================================================================
function lmRaceHtml() {
    const I = LE_MANS.intro;
    return `
        <div class="lm-hero">
            <div class="panel story-hero"><span class="kicker">Le Mans, France · since 1923</span><h2>${escapeHtml(I.title)}</h2>
                ${I.text.map(t => `<p>${escapeHtml(t)}</p>`).join('')}
                <button class="act-btn" data-lm-speak="intro">🔊 Read to me</button></div>
            ${lmFigure(I.photo, I.caption)}
        </div>
        ${lmTiles(I.tiles)}
        <p class="section-label">What makes it special</p>
        <div class="lm-boxes">${I.boxes.map(([h, t]) => `<div class="info-box"><h3>${escapeHtml(h)}</h3><p>${escapeHtml(t)}</p></div>`).join('')}</div>
        <div class="lm-pair">${I.more.map(m => lmFigure(m.photo, m.caption)).join('')}</div>
        <p class="small lm-note">${escapeHtml(I.note)}</p>
        <div class="lm-next"><button class="big-btn" data-lm-go="story">Read the story ›</button></div>`;
}

// =====================================================================
//  2. THE STORY
// =====================================================================
function lmStoryHtml() {
    const story = MOTORSPORT_STORIES.reduce((m, s) => (m[s.id] = s, m), {});
    return `
        <p class="lm-lead">${escapeHtml(LE_MANS.storyIntro)}</p>
        <ol class="chapters lm-chapters">${LE_MANS.chapters.map((ch, i) => {
            const cars = lmCarChips(ch.cars), ppl = lmPeopleChips(ch.people), st = ch.story && story[ch.story];
            return `<li class="chapter" style="--sc:${ch.color}"><span class="ch-num">${String(i + 1).padStart(2, '0')}</span>
                <div><span class="lm-years">${escapeHtml(ch.years)}</span><h3>${escapeHtml(ch.title)}</h3>
                    <div class="lm-ch-body ${ch.photo ? 'has-photo' : ''}">
                        <div>${ch.text.map(t => `<p>${escapeHtml(t)}</p>`).join('')}</div>
                        ${ch.photo ? lmFigure(ch.photo, ch.caption) : ''}
                    </div>
                    <div class="link-chips lm-links">
                        <button class="link-chip lm-speak" data-lm-speak="${i}" aria-label="Read chapter ${i + 1} to me">🔊 Read to me</button>
                        ${st ? `<button class="link-chip story-chip" data-story="${st.id}" style="--sc:${st.color}">Full story: ${escapeHtml(st.title)} ›</button>` : ''}
                        ${cars}${ppl}
                    </div>
                </div></li>`;
        }).join('')}</ol>
        <div class="lm-next"><button class="big-btn" data-lm-go="circuit">Explore the circuit ›</button></div>`;
}

// =====================================================================
//  3. THE CIRCUIT (a map drawn in code)
// =====================================================================
// A smooth closed line through the track points. Each piece is a curve whose ends lean the way the track is heading.
function lmTrackSegments() {
    const pts = LE_MANS.track.map(([x, y]) => [x, -y]), n = pts.length, P = i => pts[(i + n) % n];
    const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
    const tangent = i => { const a = unit(P(i - 1), P(i)), b = unit(P(i), P(i + 1)), l = Math.hypot(a[0] + b[0], a[1] + b[1]) || 1; return [(a[0] + b[0]) / l, (a[1] + b[1]) / l]; };
    const r = v => Math.round(v);
    return pts.map((p1, i) => {
        const p2 = P(i + 1), t1 = tangent(i), t2 = tangent(i + 1), h = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 3;
        return { from: p1, curve: `C${r(p1[0] + t1[0] * h)} ${r(p1[1] + t1[1] * h)} ${r(p2[0] - t2[0] * h)} ${r(p2[1] - t2[1] * h)} ${r(p2[0])} ${r(p2[1])}` };
    });
}
const LM_SEGS = lmTrackSegments();
const lmPath = (from, to) => `M${LM_SEGS[from].from.map(Math.round).join(' ')}` + LM_SEGS.slice(from, to).map(s => s.curve).join('');
const LM_FULL = lmPath(0, LM_SEGS.length) + 'Z';
const LM_ROADS = lmPath(11, 33);   // from Tertre Rouge to the start of the Porsche Curves: public roads
function lmMapSvg() {
    const arrow = (x, y, deg) => `<path d="M-90 -75 L90 0 L-90 75 Z" transform="translate(${x} ${y}) rotate(${deg})" class="lm-arrow"/>`;
    const calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const points = LE_MANS.points.map((p, i) => {
        const x = p.at[0], y = -p.at[1], [dx, dy, anchor] = p.label, on = p.id === lmPoint;
        return `<g class="lm-pt ${on ? 'on' : ''}" data-lm-point="${p.id}" role="button" tabindex="0" aria-label="${i + 1}: ${escapeHtml(p.name)}" aria-pressed="${on}">
            <circle class="lm-hit" cx="${x}" cy="${y}" r="300"/>
            <circle class="lm-dot" cx="${x}" cy="${y}" r="${on ? 200 : 170}"/>
            <text class="lm-num" x="${x}" y="${y + 68}" text-anchor="middle">${i + 1}</text>
            <text class="lm-name" x="${x + dx}" y="${y + dy}" text-anchor="${anchor}">${escapeHtml(p.name)}</text></g>`;
    }).join('');
    return `<svg viewBox="-2000 -1320 5220 6400" role="group" aria-label="Map of the Le Mans circuit. North is at the top.">
        <path d="${LM_FULL}" class="lm-road-edge"/>
        <path d="${LM_FULL}" class="lm-road"/>
        <path d="${LM_ROADS}" class="lm-road public"/>
        <path d="M-95 -29 L95 29" class="lm-line"/>
        ${arrow(2517, 3479, 74.5)}${arrow(1400, 3765, 209.5)}${arrow(-350, 2425, 270)}${arrow(580, -930, -5)}
        ${calm ? '' : `<circle r="75" class="lm-car-dot"><animateMotion dur="30s" repeatCount="indefinite" path="${LM_FULL}"/></circle>`}
        <text class="lm-small" x="1700" y="1235" text-anchor="end">1st chicane</text>
        <text class="lm-small" x="2090" y="2540" text-anchor="end">2nd chicane</text>
        <text class="lm-small" x="1050" y="-1130">↑ to the city of Le Mans</text>
        <g transform="translate(-1650 -700)"><path d="M0 250 L0 -200 M-90 -80 L0 -230 L90 -80" class="lm-compass"/><text class="lm-small" x="0" y="430" text-anchor="middle">North</text></g>
        <g transform="translate(-1800 4800)"><path d="M0 0 H1000 M0 -60 V60 M1000 -60 V60" class="lm-compass"/><text class="lm-small" x="500" y="-110" text-anchor="middle">1 km</text></g>
        ${points}
    </svg>`;
}
function lmPointCardHtml() {
    const i = Math.max(0, LE_MANS.points.findIndex(p => p.id === lmPoint)), p = LE_MANS.points[i], n = LE_MANS.points.length;
    return `<div class="lm-pt-head"><span class="lm-pt-num">${i + 1}</span><div><span class="kicker">${escapeHtml(p.line)}</span><h2>${escapeHtml(p.name)}</h2></div></div>
        <p>${escapeHtml(p.text)}</p>
        ${p.photo ? lmFigure(p.photo, p.caption) : ''}
        <div class="lm-pt-nav"><button class="act-btn ghost" data-lm-point="${LE_MANS.points[(i + n - 1) % n].id}">‹ Back</button>
            <span class="small">${i + 1} of ${n}</span>
            <button class="act-btn" data-lm-point="${LE_MANS.points[(i + 1) % n].id}">Next ›</button></div>`;
}
function lmCircuitHtml() {
    return `
        <p class="lm-lead">${escapeHtml(LE_MANS.circuitIntro)}</p>
        <div class="lm-circuit">
            <div class="panel lm-map-panel">
                <div class="lm-map" id="lm-map">${lmMapSvg()}</div>
                <div class="lm-legend"><span><i class="perm"></i>Racetrack</span><span><i class="pub"></i>Public roads, closed for the race</span></div>
                <p class="small">A simple drawing of the circuit. The shape is right, but it is not an exact map.</p>
            </div>
            <div>
                <div class="chip-row lm-pt-chips" id="lm-pt-chips">${LE_MANS.points.map((p, i) => `<button class="chip ${p.id === lmPoint ? 'active' : ''}" data-lm-point="${p.id}" style="--cc:#43A047">${i + 1} ${escapeHtml(p.name)}</button>`).join('')}</div>
                <div class="panel lm-point-card" id="lm-point-card" aria-live="polite">${lmPointCardHtml()}</div>
            </div>
        </div>
        <div class="lm-next"><button class="big-btn" data-lm-go="records">See the records ›</button></div>`;
}
function lmSelectPoint(id, scroll) {
    if (!LE_MANS.points.some(p => p.id === id)) return;
    lmPoint = id; playSound('click');
    const map = document.getElementById('lm-map'); if (!map) return;
    map.querySelectorAll('.lm-pt').forEach(g => {
        const on = g.dataset.lmPoint === id;
        g.classList.toggle('on', on); g.setAttribute('aria-pressed', on);
        g.querySelector('.lm-dot').setAttribute('r', on ? 200 : 170);
    });
    const row = document.getElementById('lm-pt-chips');
    row.querySelectorAll('.chip').forEach(c => {
        const on = c.dataset.lmPoint === id;
        c.classList.toggle('active', on);
        // On a phone the names are in one row that scrolls sideways: slide the chosen one into the middle
        if (on) { const a = c.getBoundingClientRect(), b = row.getBoundingClientRect(); row.scrollLeft += a.left + a.width / 2 - (b.left + b.width / 2); }
    });
    const card = document.getElementById('lm-point-card');
    card.innerHTML = lmPointCardHtml();
    // On a phone the card is below the map, so bring it into view after a tap on the map
    if (scroll && card.getBoundingClientRect().top > window.innerHeight - 140) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// =====================================================================
//  4. RECORDS
// =====================================================================
function lmRecordsHtml() {
    const bars = (rows, max, label) => `<div class="lm-bars">${rows.map(([name, wins, extra]) =>
        `<div class="lm-bar"><span class="lm-bar-name">${label(name, extra)}</span><span class="lm-bar-track"><i style="width:${wins / max * 100}%;${extra && extra[0] === '#' ? `background:${extra}` : ''}"></i></span><b>${wins}</b></div>`).join('')}</div>`;
    const rows = LE_MANS.records.map(([label, value, note, mph]) =>
        `<li><span><span class="r-car">${escapeHtml(label)}</span><span class="r-note">${escapeHtml(note)}</span></span>
            <span class="r-speed">${mph ? `${speedMain(mph)}<small>${speedSub(mph)}</small>` : escapeHtml(value)}</span></li>`).join('');
    return `
        ${lmTiles(LE_MANS.recordTiles)}
        <div class="lm-records-cols">
            <div class="panel"><h2>Most wins by a car maker</h2>${bars(LE_MANS.makerWins, 19, n => escapeHtml(n))}</div>
            <div class="panel"><h2>Most wins by a driver</h2>${bars(LE_MANS.driverWins, 9, (n, flag) => `${flag} ${escapeHtml(n)}`)}
                <p class="small lm-note">Tom Kristensen won six times in a row, from 2000 to 2005. Jacky Ickx and Derek Bell won three of their races together.</p></div>
        </div>
        <div class="lm-records-cols wide-left">
            <div class="panel"><h2>The record book</h2><ul class="record-list lm-record-list">${rows}</ul></div>
            <div class="lm-side">${lmFigure(LE_MANS.recordPhotos[0].photo, LE_MANS.recordPhotos[0].caption, 'car')}${lmFigure(LE_MANS.recordPhotos[1].photo, LE_MANS.recordPhotos[1].caption, 'tall')}
                <p class="small lm-note">${escapeHtml(LE_MANS.recordsNote)} A win here means winning the whole race, not just one class.</p></div>
        </div>
        <div class="lm-next"><button class="big-btn" data-lm-go="raceday">How the race works ›</button></div>`;
}

// =====================================================================
//  5. RACE DAY
// =====================================================================
function lmRaceDayHtml() {
    const L = LE_MANS.latest;
    return `
        <div class="panel lm-latest"><span class="kicker">${escapeHtml(L.date)}</span><h2>${escapeHtml(L.title)}</h2>
            <div class="lm-results">${L.rows.map(([cls, car, drivers]) => `<div class="lm-result"><span class="lm-cls">${escapeHtml(cls)}</span><b>${escapeHtml(car)}</b><span>${escapeHtml(drivers)}</span></div>`).join('')}</div></div>
        <p class="section-label">Three classes on one track</p>
        <div class="lm-classes">${LE_MANS.classes.map(c => `<div class="lm-class" style="--tc:${c.color}">
            <div class="cc-photo"><img src="lemans-images/${c.photo}.webp" alt="${escapeHtml(c.name)} car" loading="lazy" decoding="async" draggable="false"><span class="cc-year">${escapeHtml(c.name)}</span></div>
            <div class="lm-car-body"><div class="cc-maker">${escapeHtml(c.count)}</div><p>${escapeHtml(c.text)}</p><span class="lm-credit">${lmCreditHtml(c.photo)}</span></div></div>`).join('')}</div>
        <p class="section-label">How the race works</p>
        <div class="lm-how">
            <div class="lm-boxes one">${LE_MANS.how.slice(0, 4).map(([h, t]) => `<div class="info-box"><h3>${escapeHtml(h)}</h3><p>${escapeHtml(t)}</p></div>`).join('')}</div>
            <div class="lm-boxes one">${lmFigure(LE_MANS.howPhoto.photo, LE_MANS.howPhoto.caption)}${LE_MANS.how.slice(4).map(([h, t]) => `<div class="info-box"><h3>${escapeHtml(h)}</h3><p>${escapeHtml(t)}</p></div>`).join('')}</div>
        </div>
        <div class="lm-next"><button class="big-btn" data-lm-go="cars">See the famous cars ›</button></div>`;
}

// =====================================================================
//  6. FAMOUS CARS
// =====================================================================
function lmCarsHtml() {
    return `
        <p class="lm-lead">Sixteen of the greatest Le Mans winners, from the oldest to the newest. Cars marked <b>Open the car card</b> are in the Garage too.</p>
        <div class="lm-gallery">${LE_MANS.gallery.map(g => {
            const c = g.car && carByName[g.car];
            const own = g.photo && LMCREDITS[g.photo];
            const src = own ? `lemans-images/${g.photo}.webp` : c ? imageUrlFor(c) : '';
            const credit = own ? lmCreditHtml(g.photo) : c ? escapeHtml(creditText(c)) : '';
            const tag = c ? 'button' : 'div';
            const years = g.won.split(', '), span = years.length > 1 ? `${years[0]}–${years[years.length - 1].slice(2)}` : years[0];
            return `<${tag} class="lm-car ${c ? 'linked' : ''}" ${c ? `data-car="${c.id}"` : ''} style="--tc:${LE_MANS.sections[5].color}">
                <div class="cc-photo"><img src="${src}" alt="${escapeHtml(g.name)}" loading="lazy" decoding="async" draggable="false"><span class="cc-year">${span}</span><span class="cc-flag">${g.flag}</span></div>
                <div class="lm-car-body"><div class="cc-maker">Won in ${escapeHtml(g.won)}</div><h3>${escapeHtml(g.name)}</h3><p>${escapeHtml(g.text)}</p>
                    ${c ? '<span class="gt-go">OPEN THE CAR CARD ›</span>' : ''}<span class="lm-credit">${credit}</span></div>
            </${tag}>`;
        }).join('')}</div>
        ${lmQuizButton}`;
}

// =====================================================================
//  THE SCREEN
// =====================================================================
const LM_RENDER = { race: lmRaceHtml, story: lmStoryHtml, circuit: lmCircuitHtml, records: lmRecordsHtml, raceday: lmRaceDayHtml, cars: lmCarsHtml };
function renderLeMans() {
    const sec = LE_MANS.sections.find(s => s.id === lmSection) || LE_MANS.sections[0];
    document.getElementById('lm-tabs').innerHTML = LE_MANS.sections.map(s =>
        `<button class="story-tab ${s.id === sec.id ? 'active' : ''} ${s.ink || ''}" data-lm-go="${s.id}" style="--sc:${s.color}"><b>${escapeHtml(s.title)}</b><span>${escapeHtml(s.sub)}</span></button>`).join('');
    const el = document.getElementById('lm-body');
    el.style.setProperty('--sc', sec.color); el.style.setProperty('--dc', sec.color);
    el.className = `lm-body lm-sec-${sec.id}`;
    el.innerHTML = LM_RENDER[sec.id]();
}
SCREEN_ENTER.lemans = renderLeMans;

function lmSpeak(which) {
    if (which === 'intro') return speak(`${LE_MANS.intro.title} ${LE_MANS.intro.text.join(' ')}`);
    const ch = LE_MANS.chapters[Number(which)];
    if (ch) speak(`${ch.title}. ${ch.text.join(' ')}`);
}
// Taps inside the Le Mans screen, and links to it from other screens
document.addEventListener('click', e => {
    const jump = e.target.closest('[data-lm-section]');   // a link from a car card: open the Le Mans screen at that part
    if (jump) { lmSection = jump.dataset.lmSection; return; }
    const screen = document.getElementById('screen-lemans');
    if (!screen.contains(e.target)) return;
    const go = e.target.closest('[data-lm-go]');
    if (go) {
        lmSection = go.dataset.lmGo; stopSpeaking(); playSound('click'); renderLeMans();
        // After "Read the story" at the bottom of a page, start the next page from its top
        const tabs = document.getElementById('lm-tabs');
        if (!go.closest('#lm-tabs') || tabs.getBoundingClientRect().bottom < 0) screen.scrollIntoView({ behavior: 'auto', block: 'start' });
        return;
    }
    const pt = e.target.closest('[data-lm-point]');
    if (pt) { lmSelectPoint(pt.dataset.lmPoint, !!pt.closest('#lm-map')); return; }
    const sp = e.target.closest('[data-lm-speak]');
    if (sp) lmSpeak(sp.dataset.lmSpeak);
}, true);
// The map points also work from the keyboard
document.getElementById('screen-lemans').addEventListener('keydown', e => {
    const pt = e.target.closest && e.target.closest('.lm-pt');
    if (pt && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); lmSelectPoint(pt.dataset.lmPoint, true); }
});

// Speeds in the record book follow the mph / km/h switch
const lmBaseRerender = rerender;
rerender = function () { lmBaseRerender(); if (currentScreen === 'lemans' && lmSection === 'records') renderLeMans(); };

// Car pop-up: cars that are part of the Le Mans story get a link to it
const LM_CAR_NAMES = new Set([...LE_MANS.gallery.filter(g => g.car).map(g => g.car), ...LE_MANS.chapters.flatMap(ch => ch.cars)]);
const lmBaseOpenModal = openModal;
openModal = function (c, withSound = true) {
    lmBaseOpenModal(c, withSound);
    if (!c || !LM_CAR_NAMES.has(c.name)) return;
    document.getElementById('modal-links').insertAdjacentHTML('beforeend',
        `<p class="section-label">Le Mans 24 Hours</p><div class="link-chips"><button class="link-chip story-chip" data-screen="lemans" data-lm-section="story" style="--sc:${LE_MANS.color}">The story of Le Mans</button></div>`);
};

// Credits page: add the Le Mans photos
const lmBaseRenderCredits = renderCredits;
renderCredits = function () {
    lmBaseRenderCredits();
    document.getElementById('credit-list').insertAdjacentHTML('beforeend', Object.entries(LMCREDITS).map(([id, cr]) =>
        `<div class="credit-item"><img src="lemans-images/${id}.webp" alt="" loading="lazy"><div><b>Le Mans: ${escapeHtml(cr.title)}</b>
            <a href="${escapeHtml(cr.url)}" target="_blank" rel="noopener">${escapeHtml(cr.author)}</a> · ${licenceLink(cr.license)}</div></div>`).join(''));
};
