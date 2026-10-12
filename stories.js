// Supercar Legends: Legends (people) and Motorsport stories.
'use strict';

const PCREDITS = (typeof PEOPLE_CREDITS !== 'undefined') ? PEOPLE_CREDITS : {};
const people = PEOPLE_ROWS.map(([name, born, died, nation, role, story, fact, carNames, wiki]) =>
    ({ id: toId(name), name, born, died, nation, role, story, fact, cars: carNames.map(n => carByName[n]).filter(Boolean), wiki }));
const personById = Object.fromEntries(people.map(p => [p.id, p]));
const personByName = Object.fromEntries(people.map(p => [p.name, p]));
const peopleForCar = c => people.filter(p => p.cars.includes(c));
const storiesForCar = c => MOTORSPORT_STORIES.filter(s => s.cars.includes(c.name));
// The GFDL asks for its text to come with the photo, so it's saved in the app and linked here
const licenceLink = l => /^GFDL/i.test(l) ? `<a href="licences/fdl-1.2.txt" target="_blank">${escapeHtml(l)}</a>` : escapeHtml(l);
const lifeText = p => p.born ? (p.died ? `${p.born}–${p.died}` : `Born ${p.born}`) : '';

// A styled silhouette for people with no free photo (never a made-up face)
function personPlaceholder(p) {
    const initials = p.name.split(/\s+/).filter(w => /^[A-Z]/.test(w)).map(w => w[0]).join('').slice(0, 3);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2A2F39"/><stop offset="1" stop-color="#121418"/></linearGradient></defs>
        <rect width="400" height="300" fill="url(#g)"/>
        <circle cx="200" cy="120" r="52" fill="#3A404B"/><path d="M95 300 Q100 190 200 185 Q300 190 305 300 Z" fill="#3A404B"/>
        <text x="200" y="134" font-family="sans-serif" font-size="38" font-weight="900" fill="#E10600" text-anchor="middle" letter-spacing="2">${initials}</text>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
// People with no free-licence photo are shown with their most famous car instead (never a made-up face)
const STAND_IN_CAR = { eric_broadley: 'Lola Mk6', roy_lunn: 'Ford GT40', david_brown: 'Aston Martin DB5', lee_noble: 'Noble M12', klaas_zwart: 'Ascari KZ1' };
function standInCar(p) {
    if (PCREDITS[p.id]) return null;
    const c = carByName[STAND_IN_CAR[p.id]] || p.cars.find(c => CREDITS[c.id]);
    return c && CREDITS[c.id] ? c : null;
}
const personImg = p => {
    if (PCREDITS[p.id]) return `<img src="people-images/${p.id}.webp" alt="${escapeHtml(p.name)}" loading="lazy" draggable="false">`;
    const c = standInCar(p);
    if (c) return `<img src="car-images/${c.id}.webp" alt="${escapeHtml(c.name)}" loading="lazy" draggable="false" class="standin"><span class="standin-label">No photo yet · ${escapeHtml(c.name)}</span>`;
    return `<img src="${personPlaceholder(p)}" alt="${escapeHtml(p.name)}" loading="lazy" draggable="false">`;
};

// =====================================================================
//  LEGENDS
// =====================================================================
function personCard(p) {
    return `<button class="person-tile" data-person="${p.id}">
        <div class="pt-photo">${personImg(p)}</div>
        <div class="pt-body"><span class="pt-role">${escapeHtml(p.role)}</span><h3>${escapeHtml(p.name)}</h3><span class="pt-life">${p.nation}${lifeText(p) ? ' · ' + lifeText(p) : ''}</span></div>
    </button>`;
}
function renderLegends() {
    document.getElementById('people-grid').innerHTML = people.map(personCard).join('');
}
SCREEN_ENTER.legends = renderLegends;

let modalPerson = null;
function openPerson(p) {
    if (!p) return;
    closeModal();
    modalPerson = p;
    document.getElementById('person-photo').innerHTML = personImg(p);
    const cr = PCREDITS[p.id];
    const sc = standInCar(p), scr = sc && CREDITS[sc.id];
    document.getElementById('person-credit').innerHTML = cr ? `📷 ${escapeHtml(cr.author)} · ${licenceLink(cr.license)} · Wikimedia Commons`
        : scr ? `No free-licence photo of ${escapeHtml(p.name)} exists yet, so this shows the ${escapeHtml(sc.name)} instead. 📷 ${escapeHtml(scr.author)} · ${licenceLink(scr.license)} · Wikimedia Commons`
        : 'No free-licence photo of this person exists yet, so this is a drawn silhouette.';
    document.getElementById('person-role').textContent = p.role;
    document.getElementById('person-name').textContent = p.name;
    document.getElementById('person-tags').innerHTML = `<span class="tag">${p.nation}</span>${lifeText(p) ? `<span class="tag">${lifeText(p)}</span>` : ''}`;
    document.getElementById('person-story').textContent = p.story;
    document.getElementById('person-fact').innerHTML = `<li>${escapeHtml(p.fact)}</li>`;
    document.getElementById('person-cars').innerHTML = p.cars.map(carCard).join('');
    document.getElementById('person-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
    playSound('click');
}
function closePerson() {
    document.getElementById('person-modal').classList.remove('open');
    if (!document.getElementById('car-modal').classList.contains('open')) document.body.style.overflow = '';
    modalPerson = null; stopSpeaking();
}
document.getElementById('person-close').onclick = closePerson;
document.getElementById('person-modal').addEventListener('click', e => { if (e.target.id === 'person-modal') closePerson(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePerson(); });
document.getElementById('person-speak').onclick = () => modalPerson && speak(`${modalPerson.name}. ${modalPerson.role}. ${modalPerson.story} ${modalPerson.fact}`);
document.addEventListener('click', e => {
    const t = e.target.closest('[data-person]');
    if (t) { e.stopPropagation(); openPerson(personById[t.dataset.person]); return; }
    const s = e.target.closest('[data-story]');
    if (s && !s.closest('#story-tabs')) { selectedStory = s.dataset.story; switchScreen('motorsport'); }
}, true);
// Opening a car from inside the person pop-up closes the person first
document.getElementById('person-cars').addEventListener('click', () => closePerson(), true);

// Add "people" and "stories" links to the car pop-up
const baseOpenModal = openModal;
openModal = function (c, withSound = true) {
    baseOpenModal(c, withSound);
    if (!c) return;
    const ps = peopleForCar(c), ss = storiesForCar(c);
    document.getElementById('modal-links').innerHTML =
        (ps.length ? `<p class="section-label">Legends</p><div class="link-chips">${ps.map(p => `<button class="link-chip" data-person="${p.id}">${escapeHtml(p.name)}</button>`).join('')}</div>` : '') +
        (ss.length ? `<p class="section-label">Racing stories</p><div class="link-chips">${ss.map(s => `<button class="link-chip story-chip" data-story="${s.id}" style="--sc:${s.color}">${escapeHtml(s.title)}</button>`).join('')}</div>` : '');
};

// =====================================================================
//  MOTORSPORT
// =====================================================================
let selectedStory = MOTORSPORT_STORIES[0].id;
function renderMotorsport() {
    document.getElementById('story-tabs').innerHTML = MOTORSPORT_STORIES.map(s =>
        `<button class="story-tab ${s.id === selectedStory ? 'active' : ''}" data-story="${s.id}" style="--sc:${s.color}"><b>${escapeHtml(s.title)}</b><span>${s.years}</span></button>`).join('');
    const s = MOTORSPORT_STORIES.find(x => x.id === selectedStory);
    const el = document.getElementById('story');
    el.style.setProperty('--sc', s.color);
    const storyPeople = s.people.map(n => personByName[n]).filter(Boolean);
    el.innerHTML = `
        <div class="story-hero panel"><span class="kicker">${s.years}</span><h2>${escapeHtml(s.title)}</h2><p>${escapeHtml(s.intro)}</p>
            <button class="act-btn" id="story-speak">🔊 Read the story to me</button></div>
        <ol class="chapters">${s.chapters.map(([t, txt], i) => `<li class="chapter"><span class="ch-num">${String(i + 1).padStart(2, '0')}</span><div><h3>${escapeHtml(t)}</h3><p>${escapeHtml(txt)}</p></div></li>`).join('')}</ol>
        <p class="section-label">The cars in this story</p>
        <div class="car-grid">${s.cars.map(n => carByName[n]).filter(Boolean).map(carCard).join('')}</div>
        ${storyPeople.length ? `<p class="section-label">The people in this story</p><div class="people-grid small-people">${storyPeople.map(personCard).join('')}</div>` : ''}`;
    document.getElementById('story-speak').onclick = () => speak(`${s.title}. ${s.intro} ${s.chapters.map(([t, txt]) => t + '. ' + txt).join(' ')}`);
}
SCREEN_ENTER.motorsport = renderMotorsport;
document.getElementById('story-tabs').addEventListener('click', e => {
    const b = e.target.closest('.story-tab'); if (!b) return;
    selectedStory = b.dataset.story; stopSpeaking(); playSound('click'); renderMotorsport();
    document.getElementById('story').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// =====================================================================
//  CREDITS: add the people photos
// =====================================================================
const baseRenderCredits = renderCredits;
renderCredits = function () {
    baseRenderCredits();
    document.getElementById('credit-list').insertAdjacentHTML('beforeend', people.filter(p => PCREDITS[p.id]).map(p => {
        const cr = PCREDITS[p.id];
        return `<div class="credit-item"><img src="people-images/${p.id}.webp" alt="" loading="lazy"><div><b>${escapeHtml(p.name)}</b>
            <a href="${escapeHtml(cr.url)}" target="_blank" rel="noopener">${escapeHtml(cr.author)}</a> · ${licenceLink(cr.license)}</div></div>`;
    }).join(''));
};
