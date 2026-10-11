// Supercar Legends: Games hub, Guess the Car, Quiz, Timeline Order and Drag Race. (Top Trumps is in app.js.)
'use strict';

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const sample = (arr, n) => shuffle(arr).slice(0, n);

// =====================================================================
//  GAMES HUB
// =====================================================================
const GAMES = [
    ['trumps', 'Top Trumps Battle', 'Beat the computer with your best stat.', '#E10600'],
    ['guess', 'Guess the Car', 'Spot the car from a zoomed-in photo.', '#00B8D9'],
    ['quiz', 'Supercar Quiz', 'Ten questions about speed, history and makers.', '#FFB300'],
    ['order', 'Timeline Order', 'Put four cars in date order.', '#7E57C2'],
    ['drag', 'Drag Race', 'Perfect launch, perfect shifts, quarter mile.', '#43A047']
];
document.getElementById('game-tiles').innerHTML = GAMES.map(([id, title, text, col]) =>
    `<button class="game-tile" data-screen="${id}" style="--gc:${col}"><span class="gt-flag"></span><h3>${title}</h3><p>${text}</p><span class="gt-go">PLAY ›</span></button>`).join('');
document.querySelectorAll('.game-tabs').forEach(el => {
    el.innerHTML = `<button class="chip" data-screen="games">‹ All games</button>` +
        GAMES.map(([id, title, , col]) => `<button class="chip ${el.closest('.screen').id === 'screen-' + id ? 'active' : ''}" data-screen="${id}" style="--cc:${col}">${title}</button>`).join('');
});

// =====================================================================
//  GUESS THE CAR
// =====================================================================
const GUESS_POOL = cars.filter(c => CREDITS[c.id] && c.type !== 'concept');
const ZOOMS = [3.4, 2.5, 1.8, 1.3, 1];
let G = null;
// Hide the car's own name inside a clue
function maskName(text, c) {
    let t = text;
    const words = [c.name, modelName(c), c.maker].concat(modelName(c).split(/\s+/).filter(w => w.length > 2 && !/^(GT|the|and)$/i.test(w)));
    words.sort((a, b) => b.length - a.length).forEach(w => { t = t.split(w).join('_____'); });
    return t;
}
function guessClues(c) {
    const ctry = CAR_COUNTRIES[c.country], t = CAR_TYPES[c.type];
    return [
        `I come from ${ctry.name}, and I was launched in the ${decadeOf(c).key}.`,
        `I am a ${t.short.toLowerCase()} with a ${c.engine.replace(/ \(.*\)/, '')} engine.`,
        `My maker is ${c.maker}.`,
        maskName(c.bigClue, c)
    ];
}
function guessNew() {
    if (!G || G.round >= 8) G = { round: 0, score: 0, used: [] };
    const target = pick(GUESS_POOL.filter(c => !G.used.includes(c.id)));
    G.used.push(target.id); G.round++;
    // Wrong answers from different makers, so "My maker is…" really helps
    const others = sample(GUESS_POOL.filter(c => c.maker !== target.maker), 3);
    Object.assign(G, { target, choices: shuffle([target, ...others]), clues: 1, wrong: [], done: false,
        fx: 25 + Math.random() * 50, fy: 30 + Math.random() * 40 });
    guessRender();
}
function guessRender() {
    const c = G.target, zoom = G.done ? 1 : ZOOMS[Math.min(ZOOMS.length - 1, G.clues - 1 + G.wrong.length)];
    document.getElementById('guess-photo').innerHTML =
        `<img src="car-images/${c.id}.webp" alt="Mystery car" draggable="false" style="transform-origin:${G.fx}% ${G.fy}%;transform:scale(${zoom})">`;
    document.getElementById('guess-status').innerHTML = `<span class="pill">Car <b>${G.round}</b> of 8</span><span class="pill">Score <b>${G.score}</b></span>`;
    document.getElementById('guess-clues').innerHTML = guessClues(c).slice(0, G.clues).map((t, i) => `<li class="${i === 3 ? 'clue' : ''}">${escapeHtml(t)}</li>`).join('');
    document.getElementById('guess-choices').innerHTML = G.choices.map(o => {
        const state = G.done && o === c ? 'right' : G.wrong.includes(o.id) ? 'wrong' : '';
        return `<button class="answer ${state}" data-guess="${o.id}" ${G.done || state ? 'disabled' : ''}>${escapeHtml(o.name)}</button>`;
    }).join('');
    document.getElementById('guess-clue-btn').hidden = G.done || G.clues >= 4;
    const next = document.getElementById('guess-next');
    next.hidden = !G.done; next.textContent = G.round >= 8 ? 'Play again' : 'Next car';
}
document.getElementById('guess-choices').addEventListener('click', e => {
    const b = e.target.closest('[data-guess]'); if (!b || G.done) return;
    if (b.dataset.guess === G.target.id) {
        const pts = Math.max(1, 5 - (G.clues - 1) - G.wrong.length);
        G.score += pts; G.done = true; playSound('win');
        toast(`Correct! +${pts} point${pts > 1 ? 's' : ''}`);
        if (G.round >= 8) setTimeout(() => toast(`Finished! You scored ${G.score} out of 40.`, 3000), 1900);
    } else {
        G.wrong.push(b.dataset.guess); playSound('lose');
        if (G.wrong.length >= 3) { G.done = true; toast(`It was the ${G.target.name}.`); }
    }
    guessRender();
});
document.getElementById('guess-clue-btn').onclick = () => { G.clues = Math.min(4, G.clues + 1); playSound('click'); guessRender(); };
document.getElementById('guess-next').onclick = guessNew;
document.getElementById('guess-photo').addEventListener('click', () => { if (G && G.done) openModal(G.target); });
SCREEN_ENTER.guess = () => { if (!G || G.done && G.round >= 8) guessNew(); else guessRender(); };

// =====================================================================
//  QUIZ (every question is generated from the data and must have exactly one right answer)
// =====================================================================
const FOUNDERS = { Ferrari: 'Enzo Ferrari', Lamborghini: 'Ferruccio Lamborghini', Lotus: 'Colin Chapman', Lola: 'Eric Broadley',
    Pagani: 'Horacio Pagani', Koenigsegg: 'Christian von Koenigsegg', Rimac: 'Mate Rimac', Noble: 'Lee Noble', Spyker: 'Victor Muller',
    Bentley: 'W. O. Bentley', McLaren: 'Bruce McLaren', Gumpert: 'Roland Gumpert', Ascari: 'Klaas Zwart' };
const isElectric = c => /electric motors|^electric/.test(c.engine);
const known = (c, k) => c[k] !== null && c[k] !== undefined;
const QUIZ_TYPES = [
    function faster() {
        const [a, b] = sample(cars.filter(c => known(c, 'mph')), 2);
        if (Math.abs(a.mph - b.mph) < 8) return null;
        const w = a.mph > b.mph ? a : b;
        return { q: 'Which car has the higher top speed?', options: [a.name, b.name], answer: w.name,
            explain: `${a.name}: ${speedMain(a.mph)}. ${b.name}: ${speedMain(b.mph)}.`, car: w };
    },
    function morePowerful() {
        const [a, b] = sample(cars.filter(c => known(c, 'bhp')), 2);
        if (Math.abs(a.bhp - b.bhp) / Math.max(a.bhp, b.bhp) < .1) return null;
        const w = a.bhp > b.bhp ? a : b;
        return { q: 'Which car is more powerful?', options: [a.name, b.name], answer: w.name,
            explain: `${a.name}: ${fmt(a.bhp)} bhp. ${b.name}: ${fmt(b.bhp)} bhp.`, car: w };
    },
    function cameFirst() {
        const [a, b] = sample(cars, 2);
        if (Math.abs(a.year - b.year) < 3) return null;
        const w = a.year < b.year ? a : b;
        return { q: 'Which car came first?', options: [a.name, b.name], answer: w.name, explain: `${a.name}: ${a.year}. ${b.name}: ${b.year}.`, car: w };
    },
    function country() {
        const c = pick(cars), ctry = CAR_COUNTRIES[c.country];
        const wrong = sample(Object.keys(CAR_COUNTRIES).filter(k => k !== c.country), 3).map(k => CAR_COUNTRIES[k].name);
        return { q: `Which country does the ${c.name} come from?`, options: shuffle([ctry.name, ...wrong]), answer: ctry.name, explain: `It was made by ${c.maker} in ${ctry.name}.`, car: c };
    },
    function founder() {
        const maker = pick(Object.keys(FOUNDERS)), right = FOUNDERS[maker];
        const wrong = sample(people.map(p => p.name).filter(n => n !== right && !Object.values(FOUNDERS).includes(n) || (n !== right && Math.random() < .3)), 3);
        if (new Set([right, ...wrong]).size < 4) return null;
        const p = personByName[right];
        return { q: `Who founded ${maker}?`, options: shuffle([right, ...wrong]), answer: right, explain: p ? `${right}: ${p.role.toLowerCase()}.` : '', person: p };
    },
    function electric() {
        const ev = pick(cars.filter(isElectric));
        const others = sample(cars.filter(c => !isElectric(c) && c.type !== 'concept'), 3);
        return { q: 'Which of these cars is fully electric?', options: shuffle([ev.name, ...others.map(c => c.name)]), answer: ev.name, explain: `The ${ev.name} has ${ev.engine}.`, car: ev };
    },
    function decade() {
        const c = pick(cars), d = decadeOf(c).key;
        const wrong = sample(DECADES.map(x => x.key).filter(k => k !== d), 3);
        return { q: `In which decade was the ${c.name} launched?`, options: DECADES.map(x => x.key).filter(k => k === d || wrong.includes(k)), answer: d, explain: `It came out in ${c.year}.`, car: c };
    },
    function quickest() {
        const four = sample(cars.filter(c => known(c, 'z62')), 4);
        const sorted = [...four].sort((a, b) => a.z62 - b.z62);
        if (sorted[1].z62 - sorted[0].z62 < .3) return null;
        return { q: `Which is quickest from 0 to ${units === 'mph' ? '62 mph' : '100 km/h'}?`, options: four.map(c => c.name), answer: sorted[0].name,
            explain: `The ${sorted[0].name} takes ${secs(sorted[0].z62)} seconds.`, car: sorted[0] };
    }
];
// A valid question has unique options and exactly one of them is the answer
function validQuestion(q) { return q && new Set(q.options).size === q.options.length && q.options.filter(o => o === q.answer).length === 1; }
function makeQuestion() { for (;;) { const q = pick(QUIZ_TYPES)(); if (validQuestion(q)) return q; } }
let Q = null;
function quizStart() { Q = { n: 0, score: 0, cur: null, answered: false, seen: new Set() }; quizNext(); }
function quizNext() {
    if (Q.n >= 10) return quizEnd();
    let q; do { q = makeQuestion(); } while (Q.seen.has(q.q + q.answer));
    Q.seen.add(q.q + q.answer); Q.cur = q; Q.n++; Q.answered = false;
    document.getElementById('quiz-progress').innerHTML = Array.from({ length: 10 }, (_, i) => `<i class="${i < Q.n - 1 ? 'done' : i === Q.n - 1 ? 'now' : ''}"></i>`).join('') + `<span>Score ${Q.score}</span>`;
    document.getElementById('quiz-q').textContent = q.q;
    document.getElementById('quiz-answers').innerHTML = q.options.map(o => `<button class="answer" data-answer="${escapeHtml(o)}">${escapeHtml(o)}</button>`).join('');
    document.getElementById('quiz-feedback').textContent = '';
    document.getElementById('quiz-next').hidden = true;
}
function quizEnd() {
    document.getElementById('quiz-q').textContent = Q.score >= 8 ? `🏆 ${Q.score} out of 10. Legend!` : Q.score >= 5 ? `${Q.score} out of 10. Great driving!` : `${Q.score} out of 10. Keep practising in the Garage!`;
    document.getElementById('quiz-answers').innerHTML = '';
    document.getElementById('quiz-feedback').textContent = '';
    const b = document.getElementById('quiz-next'); b.hidden = false; b.textContent = 'Play again';
    Q.n = 11;
    if (Q.score >= 8) playSound('win');
}
document.getElementById('quiz-answers').addEventListener('click', e => {
    const b = e.target.closest('[data-answer]'); if (!b || Q.answered) return;
    Q.answered = true;
    const right = b.dataset.answer === Q.cur.answer;
    if (right) Q.score++;
    document.querySelectorAll('#quiz-answers .answer').forEach(x => { x.disabled = true; if (x.dataset.answer === Q.cur.answer) x.classList.add('right'); });
    if (!right) b.classList.add('wrong');
    playSound(right ? 'win' : 'lose');
    document.getElementById('quiz-feedback').textContent = (right ? 'Correct! ' : 'Not quite. ') + Q.cur.explain;
    const next = document.getElementById('quiz-next'); next.hidden = false; next.textContent = Q.n >= 10 ? 'See my score' : 'Next question';
});
document.getElementById('quiz-next').onclick = () => { if (Q.n > 10) quizStart(); else quizNext(); };
SCREEN_ENTER.quiz = () => { if (!Q || Q.n > 10) quizStart(); };

// =====================================================================
//  TIMELINE ORDER
// =====================================================================
let O = null;
function orderNew() {
    let four;
    do { four = sample(cars.filter(c => CREDITS[c.id]), 4); }
    while (new Set(four.map(c => c.year)).size < 4 || [...four].sort((a, b) => a.year - b.year).some((c, i, s) => i && c.year - s[i - 1].year < 3));
    O = { cars: four, picks: [], checked: false };
    orderRender();
}
function orderRender() {
    document.getElementById('order-grid').innerHTML = O.cars.map(c => {
        const n = O.picks.indexOf(c.id);
        const sorted = [...O.cars].sort((a, b) => a.year - b.year);
        const ok = O.checked && sorted[n] === c;
        return `<button class="order-card no-open ${n >= 0 ? 'picked' : ''} ${O.checked ? (ok ? 'right' : 'wrong') : ''}" data-order="${c.id}" ${O.checked ? 'disabled' : ''}>
            <div class="oc-photo">${carImg(c, false)}${n >= 0 ? `<span class="oc-num">${n + 1}</span>` : ''}</div>
            <h3>${escapeHtml(c.name)}</h3>${O.checked ? `<span class="oc-year">${c.year}</span>` : ''}
        </button>`;
    }).join('');
    document.getElementById('order-check').hidden = O.checked;
    document.getElementById('order-check').disabled = O.picks.length < 4;
    document.getElementById('order-next').hidden = !O.checked;
}
document.getElementById('order-grid').addEventListener('click', e => {
    const b = e.target.closest('[data-order]'); if (!b || O.checked) return;
    const id = b.dataset.order, i = O.picks.indexOf(id);
    if (i >= 0) O.picks.splice(i); else O.picks.push(id);
    playSound('click'); orderRender();
});
document.getElementById('order-check').onclick = () => {
    O.checked = true;
    const sorted = [...O.cars].sort((a, b) => a.year - b.year);
    const right = O.picks.filter((id, i) => sorted[i].id === id).length;
    document.getElementById('order-feedback').textContent = right === 4 ? '🏁 Perfect! All four in the right order.' : `${right} of 4 in the right place. The years are shown under each car.`;
    playSound(right === 4 ? 'win' : 'lose');
    orderRender();
};
document.getElementById('order-next').onclick = () => { document.getElementById('order-feedback').textContent = ''; orderNew(); };
SCREEN_ENTER.order = () => { if (!O) orderNew(); };

// =====================================================================
//  DRAG RACE (canvas, quarter mile = 402 m)
// =====================================================================
const DRAG_POOL = cars.filter(c => known(c, 'z62') && known(c, 'mph') && CREDITS[c.id] && c.type !== 'race');
const DRAG_LEN = 402, GEARS = 6, RPM_IDLE = 3000, RPM_RED = 8000, SHIFT_LO = 6600, SHIFT_HI = 7700;
const dcan = document.getElementById('drag-canvas'), dctx = dcan.getContext('2d');
let D = null, dragRaf = null;
// A simple model: acceleration falls as the car nears its top speed, tuned so 0–100 km/h takes about the car's real time
function carModel(c) {
    const vmax = c.mph * 0.44704;                       // m/s
    const a0 = 27.78 / c.z62 / (1 - 0.5 * 27.78 / vmax); // so the average acceleration up to 100 km/h matches
    return { c, vmax, a0, v: 0, x: 0, gear: 1, rpm: RPM_IDLE, started: false, finished: null, shiftBoost: 1, shifts: [] };
}
const gearTop = (m, g) => m.vmax * g / GEARS;
function gearRpm(m) {
    const lo = m.gear === 1 ? 0 : gearTop(m, m.gear - 1), hi = gearTop(m, m.gear);
    return RPM_IDLE + (RPM_RED - RPM_IDLE) * Math.max(0, Math.min(1, (m.v - lo) / (hi - lo)));
}
function dragPick() {
    D = null; cancelAnimationFrame(dragRaf);
    document.getElementById('drag-stage').hidden = true;
    const choices = sample(DRAG_POOL, 3);
    document.getElementById('drag-pick').hidden = false;
    document.getElementById('drag-pick').innerHTML = `<p class="section-label">Choose your car</p>
        <div class="car-grid no-open">${choices.map(c => carCard(c).replace('class="car-card"', `class="car-card" data-drag="${c.id}"`)).join('')}</div>
        <p class="small">When the 3D builder is ready, you'll be able to race your own car here too.</p>`;
}
document.getElementById('drag-pick').addEventListener('click', e => {
    const b = e.target.closest('[data-drag]'); if (!b) return;
    dragStart(carById[b.dataset.drag]);
});
function dragStart(playerCar) {
    // An opponent with a similar 0–62 time, so every race is close
    const rivals = DRAG_POOL.filter(c => c !== playerCar && Math.abs(c.z62 - playerCar.z62) <= 0.8);
    const cpuCar = pick(rivals.length ? rivals : DRAG_POOL.filter(c => c !== playerCar));
    dcan.width = window.innerWidth < 700 ? 640 : 1200;   // a narrower track on phones so the text stays readable
    D = { p: carModel(playerCar), cpu: carModel(cpuCar), phase: 'lights', t0: performance.now(), lightsOut: null, last: performance.now(),
          cpuReaction: 0.18 + Math.random() * 0.22, msg: '', falseStart: false };
    D.goAt = 2.6 + Math.random() * 1.4;  // seconds after start when the lights go out
    document.getElementById('drag-pick').hidden = true;
    document.getElementById('drag-stage').hidden = false;
    document.getElementById('drag-btn').textContent = 'GO';
    cancelAnimationFrame(dragRaf); dragRaf = requestAnimationFrame(dragFrame);
}
function dragPress() {
    if (!D) return;
    getAudio();
    const now = performance.now(), el = (now - D.t0) / 1000;
    if (D.phase === 'done') { if (now - D.doneAt > 700) dragStart(D.p.c); return; }
    if (D.phase === 'lights') {
        if (el < D.goAt) { D.phase = 'done'; D.falseStart = true; D.msg = 'False start! You went before the lights went out.'; D.doneAt = now; playSound('lose'); return; }
        D.p.started = true; D.p.reaction = el - D.goAt; D.phase = 'race';
            playSound('rev');
    } else if (D.phase === 'race' && D.p.started && !D.p.finished && D.p.gear < GEARS) {
        const rpm = gearRpm(D.p);
        const quality = rpm >= SHIFT_LO && rpm <= SHIFT_HI ? 'perfect' : rpm < SHIFT_LO ? 'early' : 'late';
        D.p.shifts.push(quality);
        D.p.shiftBoost = quality === 'perfect' ? 1.06 : quality === 'early' ? 0.8 : 1;
        D.p.gear++;
        D.msg = quality === 'perfect' ? 'Perfect shift!' : quality === 'early' ? 'Too early' : 'A bit late';
        D.msgUntil = now + 700;
        playSound(quality === 'perfect' ? 'click' : 'lose');
    }
}
document.getElementById('drag-btn').addEventListener('pointerdown', e => { e.preventDefault(); dragPress(); });
document.addEventListener('keydown', e => { if (currentScreen === 'drag' && (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter')) { e.preventDefault(); dragPress(); } });
function stepCar(m, dt, now, isCpu) {
    if (!m.started || m.finished) return;
    if (isCpu && m.gear < GEARS && gearRpm(m) >= 7000 + Math.random() * 600) { m.gear++; m.shiftBoost = 1.02; }
    const rpm = gearRpm(m);
    let a = m.a0 * (1 - m.v / m.vmax);
    if (rpm >= RPM_RED - 1 && m.v >= gearTop(m, m.gear) - 0.01) a = 0;          // hitting the rev limiter
    a *= (m.gear === 1 ? 1 : m.shiftBoost);
    m.shiftBoost += (1 - m.shiftBoost) * Math.min(1, dt * 1.5);               // shift effect fades
    m.v = Math.min(gearTop(m, m.gear), m.v + a * dt);
    m.x += m.v * dt; m.rpm = gearRpm(m);
    if (m.x >= DRAG_LEN) { m.finished = (now - D.lightsOut) / 1000; m.trap = m.v; }
}
function dragFrame(now) {
    if (!D) return;
    const dt = Math.min(0.05, (now - D.last) / 1000); D.last = now;
    const el = (now - D.t0) / 1000;
    if (D.phase !== 'done' && el >= D.goAt && D.lightsOut === null) D.lightsOut = D.t0 + D.goAt * 1000;
    if (D.lightsOut !== null && !D.cpu.started && el >= D.goAt + D.cpuReaction) D.cpu.started = true;
    if (D.phase === 'race' || (D.phase === 'lights' && D.lightsOut !== null)) {
        stepCar(D.p, dt, now, false); stepCar(D.cpu, dt, now, true);
        if (D.p.finished && D.cpu.finished && D.phase !== 'done') {
            D.phase = 'done'; D.doneAt = now;
            const won = D.p.finished < D.cpu.finished;
            D.msg = won ? `You win by ${(D.cpu.finished - D.p.finished).toFixed(2)} s!` : `The computer wins by ${(D.p.finished - D.cpu.finished).toFixed(2)} s.`;
            playSound(won ? 'win' : 'lose');
            const best = storageGet('dragBest', {});
            if (!best[D.p.c.id] || D.p.finished < best[D.p.c.id]) { best[D.p.c.id] = D.p.finished; storageSet('dragBest', best); D.newBest = true; }
        }
    }
    dragDraw(now, el);
    dragRaf = requestAnimationFrame(dragFrame);
}
function drawCarSide(ctx, x, y, col, scale = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(-70, 0); ctx.quadraticCurveTo(-66, -20, -40, -22); ctx.lineTo(-12, -36); ctx.quadraticCurveTo(14, -42, 36, -30);
    ctx.lineTo(58, -24); ctx.quadraticCurveTo(76, -20, 76, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(10,12,16,.75)'; ctx.beginPath(); ctx.moveTo(-8, -33); ctx.quadraticCurveTo(14, -39, 32, -29); ctx.lineTo(-14, -26); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#0B0C0F'; [-42, 48].forEach(wx => { ctx.beginPath(); ctx.arc(wx, 0, 14, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = '#6E7785'; [-42, 48].forEach(wx => { ctx.beginPath(); ctx.arc(wx, 0, 6, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
}
function dragDraw(now, el) {
    const W = dcan.width, H = dcan.height, ctx = dctx;
    ctx.fillStyle = '#111317'; ctx.fillRect(0, 0, W, H);
    // the camera follows your car; an arrow shows where the computer is if it's off screen
    const pxPerM = 6, camX = Math.max(0, D.p.x - 25);
    const sx = m => 140 + (m - camX) * pxPerM;
    // lanes
    [[150, D.cpu], [300, D.p]].forEach(([y]) => {
        ctx.fillStyle = '#1B1F26'; ctx.fillRect(0, y - 55, W, 80);
        ctx.strokeStyle = '#303641'; ctx.setLineDash([30, 30]); ctx.lineDashOffset = camX * pxPerM;
        ctx.beginPath(); ctx.moveTo(0, y + 25); ctx.lineTo(W, y + 25); ctx.stroke(); ctx.setLineDash([]);
    });
    // distance markers, start and finish
    for (let m = 0; m <= DRAG_LEN; m += 50) {
        const x = sx(m); if (x < -50 || x > W + 50) continue;
        ctx.fillStyle = '#6E7785'; ctx.font = '600 16px "Exo 2", sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(m === 0 ? 'START' : `${m} m`, x, 82); ctx.fillRect(x - 1, 90, 2, 260);
    }
    const fx = sx(DRAG_LEN);
    if (fx < W + 40) for (let i = 0; i < 14; i++) for (let j = 0; j < 2; j++) { ctx.fillStyle = (i + j) % 2 ? '#fff' : '#111'; ctx.fillRect(fx + j * 12, 90 + i * 19, 12, 19); }
    drawCarSide(ctx, sx(D.cpu.x) - 76, 150, CAR_TYPES[D.cpu.c.type].color);
    drawCarSide(ctx, sx(D.p.x) - 76, 300, '#E10600');
    const cpuX = sx(D.cpu.x) - 76, gap = Math.round(Math.abs(D.cpu.x - D.p.x));
    ctx.font = '800 20px "Exo 2", sans-serif'; ctx.fillStyle = '#FFB300';
    if (cpuX > W - 40) { ctx.textAlign = 'right'; ctx.fillText(`CPU ${gap} m ahead ▶`, W - 14, 158); }
    if (cpuX < -70) { ctx.textAlign = 'left'; ctx.fillText(`◀ CPU ${gap} m behind`, 14, 158); }
    ctx.textAlign = 'left'; ctx.font = '700 18px "Exo 2", sans-serif'; ctx.fillStyle = '#A3ACB9';
    ctx.fillText(`CPU: ${D.cpu.c.name}`, 16, 112); ctx.fillStyle = '#fff'; ctx.fillText(`YOU: ${D.p.c.name}`, 16, 262);
    // start lights: five reds come on, then all go out
    if (D.lightsOut === null || now - D.lightsOut < 1200) {
        const lit = D.lightsOut === null ? Math.min(5, Math.floor(el / (D.goAt / 5.5)) ) : 0;
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = '#0B0C0F'; ctx.fillRect(W / 2 - 150 + i * 62, 14, 52, 52);
            ctx.fillStyle = i < lit ? '#E10600' : '#2A2F39'; ctx.beginPath(); ctx.arc(W / 2 - 124 + i * 62, 40, 19, 0, Math.PI * 2); ctx.fill();
        }
        if (D.lightsOut !== null) { ctx.fillStyle = '#C6FF00'; ctx.font = '900 34px Orbitron, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('GO!', W / 2, 400); }
    }
    // rev counter
    const rpm = D.p.rpm, cx = W - 100, cy = H - 12, r = 58;
    ctx.lineWidth = 12; ctx.strokeStyle = '#2A2F39'; ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 0); ctx.stroke();
    const ang = v => Math.PI + Math.PI * (v - RPM_IDLE) / (RPM_RED - RPM_IDLE);
    ctx.strokeStyle = '#43A047'; ctx.beginPath(); ctx.arc(cx, cy, r, ang(SHIFT_LO), ang(SHIFT_HI)); ctx.stroke();
    ctx.strokeStyle = '#E10600'; ctx.beginPath(); ctx.arc(cx, cy, r, ang(SHIFT_HI), 0); ctx.stroke();
    ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang(rpm)) * (r - 4), cy + Math.sin(ang(rpm)) * (r - 4)); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = '900 40px Orbitron, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(D.p.gear, cx - 120, cy - 22);
    ctx.font = '700 14px "Exo 2", sans-serif'; ctx.fillStyle = '#A3ACB9'; ctx.fillText('GEAR', cx - 120, cy - 4);
    // readout below the canvas
    const spd = units === 'mph' ? `${Math.round(D.p.v / 0.44704)} mph` : `${Math.round(D.p.v * 3.6)} km/h`;
    const showMsg = D.msg && (D.phase === 'done' || now < (D.msgUntil || 0));
    let html = `<span class="pill">Speed <b>${spd}</b></span><span class="pill">Distance <b>${Math.min(DRAG_LEN, Math.round(D.p.x))} m</b></span>`;
    if (D.p.reaction !== undefined) html += `<span class="pill">Reaction <b>${D.p.reaction.toFixed(3)} s</b></span>`;
    if (D.phase === 'done' && !D.falseStart) {
        const trap = units === 'mph' ? `${Math.round(D.p.trap / 0.44704)} mph` : `${Math.round(D.p.trap * 3.6)} km/h`;
        const perfect = D.p.shifts.filter(s => s === 'perfect').length;
        html += `<span class="pill">Your time <b>${D.p.finished.toFixed(2)} s</b> at ${trap}</span><span class="pill">Perfect shifts <b>${perfect}/${D.p.shifts.length}</b></span>${D.newBest ? '<span class="pill"><b>New best for this car!</b></span>' : ''}`;
    }
    if (D.phase === 'done') html += `<button class="chip" data-drag-change>Choose another car</button>`;
    const ro = document.getElementById('drag-readout'), out = (showMsg ? `<div class="drag-msg">${escapeHtml(D.msg)}</div>` : '') + html;
    if (D.lastOut !== out) { ro.innerHTML = out; D.lastOut = out; }
    const lost = D.falseStart || (D.phase === 'done' && D.p.finished > D.cpu.finished);
    const msgEl = ro.querySelector('.drag-msg'); if (msgEl) msgEl.classList.toggle('lose', lost);
    const btn = document.getElementById('drag-btn'), label = D.phase === 'done' ? 'RACE AGAIN' : D.p.started ? 'SHIFT' : 'GO';
    if (btn.textContent !== label) btn.textContent = label;
}
document.getElementById('drag-readout').addEventListener('click', e => { if (e.target.closest('[data-drag-change]')) dragPick(); });
SCREEN_ENTER.drag = () => { if (!D) dragPick(); else if (D.phase !== 'done') dragPick(); };
SCREEN_LEAVE.push(id => { if (id !== 'drag') { cancelAnimationFrame(dragRaf); if (D && D.phase !== 'done') D = null; } });
