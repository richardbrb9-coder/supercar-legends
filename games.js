// Supercar Legends: Games hub, Guess the Car, Quiz and Timeline Order. (Top Trumps is in app.js.)
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
    ['order', 'Timeline Order', 'Put four cars in date order.', '#7E57C2']
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
