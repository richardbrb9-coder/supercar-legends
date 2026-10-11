// Supercar Legends: the 3D garage builder. Loaded only when the Build screen first opens.
import * as THREE from './lib/three.module.min.js';
import { OrbitControls } from './lib/addons/OrbitControls.js';
import { RoomEnvironment } from './lib/addons/RoomEnvironment.js';
import { PRESETS, PAINTS, FINISHES, RIMS, RIM_COLOURS, WINGS, ENGINES, DEFAULT, LIVERIES, UNLOCKS, loadDesign, saveDesign as saveDesignTo, createCar, carStats,
    medalPoints, lockFor, loadSavedCars, storeSavedCars, encodeDesign, decodeDesign, applyPreset } from './carmodel.js';

// =====================================================================
//  SCENE
// =====================================================================
let renderer, scene, camera, controls, car = null, ground, raf = null, started = false, mats, lightsMode = 'studio';
let design = loadDesign();
const saveDesign = () => saveDesignTo(design);
const stats = () => carStats(design);
function buildCar() {
    if (car) { scene.remove(car.group); car.dispose(); }
    car = createCar(design); mats = car.mats;
    setLights(lightsMode);
    scene.add(car.group);
}
const hemi = new THREE.HemisphereLight(0xdde6ff, 0x1a1c20, 0.6);
const sun = new THREE.DirectionalLight(0xffffff, 1.6);
const accent = new THREE.PointLight(0xE10600, 0, 12);

function groundTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d'), g = x.createRadialGradient(256, 256, 20, 256, 256, 256);
    g.addColorStop(0, 'rgba(0,0,0,.85)'); g.addColorStop(0.45, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 512, 512);
    return new THREE.CanvasTexture(c);
}
function setLights(mode) {
    lightsMode = mode;
    const bg = { studio: 0x15171c, day: 0x8fa3b8, night: 0x05070d }[mode];
    scene.background = new THREE.Color(bg);
    hemi.intensity = { studio: 0.6, day: 1.4, night: 0.15 }[mode];
    sun.intensity = { studio: 1.6, day: 2.6, night: 0.3 }[mode];
    accent.intensity = mode === 'night' ? 6 : 0;
    scene.environmentIntensity = { studio: 1, day: 1.2, night: 0.35 }[mode];
    if (mats) { mats.head.emissiveIntensity = mode === 'night' ? 3 : 1.2; mats.tail.emissiveIntensity = mode === 'night' ? 3 : 1.4; }
}

function init(container) {
    const canvas = document.createElement('canvas');
    try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    } catch (e) { return false; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = ''; container.appendChild(canvas);
    scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(5.0, 1.9, 5.3);
    controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0.6, 0); controls.enableDamping = true; controls.enablePan = false;
    controls.minDistance = 4.5; controls.maxDistance = 14; controls.maxPolarAngle = Math.PI * 0.49;
    controls.autoRotate = true; controls.autoRotateSpeed = 0.8;
    controls.addEventListener('start', () => { controls.autoRotate = false; syncTurntableButton(); });
    sun.position.set(4, 8, 5); accent.position.set(-3, 1.5, -3);
    scene.add(hemi, sun, accent);
    ground = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshBasicMaterial({ map: groundTexture(), transparent: true, depthWrite: false }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = 0.002; scene.add(ground);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 48), new THREE.MeshStandardMaterial({ color: 0x1b1e24, roughness: 0.55, metalness: 0.2 }));
    floor.rotation.x = -Math.PI / 2; scene.add(floor);
    buildCar(); resize();
    new ResizeObserver(resize).observe(container);
    return true;
}
function resize() {
    if (!renderer) return;
    const el = renderer.domElement.parentElement, w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
function frame() {
    raf = requestAnimationFrame(frame);
    controls.update(); renderer.render(scene, camera);
}

// =====================================================================
//  CONTROLS PANEL
// =====================================================================
let panelTab = 'body', shareCode = '';
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KIND = { rim: 'rim', rimcol: 'rimColour', finish: 'finish', wing: 'wing', livery: 'livery' };
const swatch = (val, cur, attr, col = val) => {
    const lock = KIND[attr] && lockFor(KIND[attr], val, design);
    return `<button class="swatch ${val === cur ? 'active' : ''} ${lock ? 'locked' : ''}" data-${attr}="${val}" style="--sw:${col}" aria-label="${val}${lock ? ' (locked)' : ''}"></button>`;
};
const choice = (obj, cur, attr) => Object.entries(obj).map(([k, v]) => {
    const lock = KIND[attr] && lockFor(KIND[attr], k, design);
    return `<button class="opt ${k === cur ? 'active' : ''} ${lock ? 'locked' : ''}" data-${attr}="${k}">${lock ? '🔒 ' : ''}${typeof v === 'string' ? v : v.label}</button>`;
}).join('');
const slider = (key, label, min, max, step) => `<label class="slider"><span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${design[key]}" data-slider="${key}"></label>`;
const COLOURS = ['#F4F6F8', '#0B0C0F', '#E10600', '#FFB300', '#C6FF00', '#00B8D9', '#1E3A8A', '#FF6D00', '#7E57C2', '#9AA3AF'];
function renderPanel() {
    const tabs = { body: 'Body', wheels: 'Wheels', paint: 'Paint', livery: 'Livery', aero: 'Aero', engine: 'Engine', cars: 'My cars' };
    let html = `<div class="b-tabs">${Object.entries(tabs).map(([k, v]) => `<button class="b-tab ${k === panelTab ? 'active' : ''}" data-btab="${k}">${v}</button>`).join('')}</div><div class="b-body">`;
    if (panelTab === 'body') html += `<p class="b-label">Body style</p><div class="opts">${choice(PRESETS, design.preset, 'preset')}</div>
        ${slider('L', 'Length', 4.0, 5.2, 0.05)}${slider('W', 'Width', 1.7, 2.1, 0.01)}${slider('roof', 'Roof height', 1.0, 1.35, 0.01)}
        ${slider('nose', 'Nose height', 0.38, 0.72, 0.01)}${slider('tail', 'Tail height', 0.78, 1.05, 0.01)}${slider('ride', 'Ride height', 0.06, 0.2, 0.005)}`;
    if (panelTab === 'wheels') html += `<p class="b-label">Rim design</p><div class="opts">${choice(RIMS, design.rim, 'rim')}</div>
        <p class="b-label">Rim colour</p><div class="swatches">${Object.entries(RIM_COLOURS).map(([k, v]) => swatch(k, design.rimColour, 'rimcol', v === 'chrome' ? 'linear-gradient(135deg,#fff,#7c8591,#fff)' : v)).join('')}</div>
        <p class="b-label">Brake callipers</p><div class="swatches">${['#FFB300', '#E10600', '#00B8D9', '#C6FF00', '#16181C', '#F4F6F8'].map(c => swatch(c, design.caliper, 'caliper')).join('')}</div>
        ${slider('wheel', 'Wheel size', 0.31, 0.38, 0.005)}`;
    if (panelTab === 'paint') html += `<p class="b-label">Colour</p><div class="swatches">${PAINTS.map(c => swatch(c, design.paint, 'paint')).join('')}
        <label class="swatch custom" style="--sw:${design.paint}" title="Pick any colour"><input type="color" value="${design.paint}" data-paintpick="paint"></label></div>
        <p class="b-label">Finish</p><div class="opts">${choice(FINISHES, design.finish, 'finish')}</div>`;
    if (panelTab === 'livery') html += `<p class="b-label">Stripes and graphics</p><div class="opts">${choice(LIVERIES, design.livery || 'none', 'livery')}</div>
        <p class="b-label">Stripe colour</p><div class="swatches">${COLOURS.map(c => swatch(c, design.stripeColour, 'stripe')).join('')}</div>
        <p class="b-label">Two-tone paint</p><div class="opts"><button class="opt ${design.twoTone ? 'active' : ''}" data-toggle="twoTone">${design.twoTone ? 'On' : 'Off'}</button></div>
        ${design.twoTone ? `<div class="swatches" style="margin-top:8px">${COLOURS.map(c => swatch(c, design.paint2, 'paint2')).join('')}</div>` : ''}
        <label class="field"><span>Race number</span><input type="text" inputmode="numeric" maxlength="2" value="${esc(design.number)}" data-text="number" placeholder="e.g. 7"></label>
        <label class="field"><span>Your name or tag</span><input type="text" maxlength="14" value="${esc(design.tag)}" data-text="tag" placeholder="e.g. MAX"></label>`;
    if (panelTab === 'aero') html += `<p class="b-label">Rear wing</p><div class="opts">${choice(WINGS, design.wing, 'wing')}</div>
        <p class="b-label">Extras</p><div class="opts"><button class="opt ${design.splitter ? 'active' : ''}" data-toggle="splitter">Front splitter</button><button class="opt ${design.skirts ? 'active' : ''}" data-toggle="skirts">Side skirts</button></div>`;
    if (panelTab === 'engine') html += `<p class="b-label">Engine</p><div class="opts">${choice(ENGINES, design.engine, 'engine')}</div><p class="small">${ENGINES[design.engine].note}. Tap again to hear it.</p>`;
    if (panelTab === 'cars') {
        const saved = loadSavedCars(), pts = medalPoints(), next = UNLOCKS.find(u => u.pts > pts);
        html += `<label class="field"><span>Car name</span><input type="text" maxlength="24" value="${esc(design.name)}" data-text="name"></label>
            <div class="opts"><button class="opt" data-cars="save">💾 Save</button><button class="opt" data-cars="saveNew">Save as a new car</button><button class="opt" data-cars="new">Start a new car</button></div>
            <p class="b-label">My cars (${saved.length})</p>
            <div class="saved-list">${saved.length ? saved.map(c => `<div class="saved-car ${c.id === design._id ? 'current' : ''}"><span class="sw-dot" style="--sw:${esc(c.design.paint)}"></span><b>${esc(c.design.name || 'My Supercar')}</b>
                <button class="opt" data-cars="load" data-id="${c.id}">Load</button><button class="opt" data-cars="delete" data-id="${c.id}" aria-label="Delete">✕</button></div>`).join('') : '<p class="small">No saved cars yet. Tap Save to keep this one.</p>'}</div>
            <p class="b-label">Share code</p>
            <p class="small">Send this code to a friend so they can load your design. It only contains the car's settings.</p>
            <div class="opts"><button class="opt" data-cars="code">Make share code</button></div>
            ${shareCode ? `<div class="code-row"><input type="text" readonly value="${esc(shareCode)}" id="share-code-out"><button class="opt" data-cars="copy">Copy</button></div>` : ''}
            <div class="code-row"><input type="text" placeholder="Paste a friend's code (starts SL)" id="share-code-in"><button class="opt" data-cars="loadCode">Load</button></div>
            <p class="b-label">Unlocks</p><p class="small">You have ${pts} medal point${pts === 1 ? '' : 's'} from racing.${next ? ` Next: <b>${next.label}</b> at ${next.pts} points.` : ' Everything is unlocked!'}</p>
            <ul class="unlock-list">${UNLOCKS.map(u => `<li class="${pts >= u.pts ? 'got' : ''}">${pts >= u.pts ? '✓' : '🔒'} ${u.label} <span>${u.pts} pts</span></li>`).join('')}</ul>`;
    }
    html += `</div>`;
    document.getElementById('build-panel').innerHTML = html;
    renderStats();
}
function renderStats() {
    const s = stats(), units = window.getUnits ? window.getUnits() : 'mph';
    const spd = units === 'mph' ? `${s.mph} mph` : `${Math.round(s.mph * 1.609)} km/h`;
    const bar = (label, val, pct) => `<div class="stat"><span class="s-label">${label}</span><span class="s-bar"><i style="width:${Math.max(4, Math.min(100, pct))}%"></i></span><span class="s-val">${val}</span></div>`;
    document.getElementById('build-stats').innerHTML =
        bar('Power', `${s.bhp.toLocaleString('en-GB')} bhp`, Math.sqrt(s.bhp / 2000) * 100) +
        bar('Top speed', spd, (s.mph - 90) / 2.2) +
        bar('0–62', `${s.z62.toFixed(1)} s`, (11 - s.z62) / 9.2 * 100) +
        bar('Weight', `${s.kg.toLocaleString('en-GB')} kg`, s.kg / 24) +
        bar('Handling', s.handling, s.handling) +
        bar('Braking', s.braking, s.braking);
}
let rebuildTimer = null;
function changed(rebuild = true) {
    saveDesign(); renderStats();
    if (!rebuild) return;
    clearTimeout(rebuildTimer); rebuildTimer = setTimeout(buildCar, 30);
}
function engineSound() {
    const e = ENGINES[design.engine], ctx = window.getAudio && window.getAudio(); if (!ctx) return;
    if (!e.sound) { // electric whine
        const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
        o.type = 'sine'; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(1800, t + 0.9);
        g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 1); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 1.05);
        return;
    }
    const t = ctx.currentTime, base = e.sound;
    [[1, 'sawtooth', 0.09], [2, 'square', 0.025], [0.5, 'sawtooth', 0.05]].forEach(([mult, type, vol]) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        o.type = type; f.type = 'lowpass'; f.frequency.value = 1400;
        o.frequency.setValueAtTime(base * 0.4 * mult, t); o.frequency.exponentialRampToValueAtTime(base * 2.4 * mult, t + 0.45);
        o.frequency.exponentialRampToValueAtTime(base * 0.5 * mult, t + 1.1);
        g.gain.setValueAtTime(vol, t); g.gain.setValueAtTime(vol, t + 0.5); g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        o.connect(f); f.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 1.25);
    });
}
function lockedToast(kind, value) {
    const u = lockFor(kind, value, design);
    if (!u) return false;
    const need = u.pts - medalPoints();
    window.toast && window.toast(`🔒 ${u.label}: win ${need} more medal point${need > 1 ? 's' : ''} in Race to unlock it`, 2600);
    return true;
}
function setDesign(d) { design = { ...DEFAULT, ...d }; saveDesign(); renderPanel(); buildCar(); }
function onCars(action, id) {
    const saved = loadSavedCars();
    const toast = (m, ms) => window.toast && window.toast(m, ms);
    if (action === 'save' || action === 'saveNew') {
        const copy = { ...design }; delete copy._id;
        let slot = action === 'save' && saved.find(c => c.id === design._id);
        if (!slot) {
            if (saved.length >= 12) { toast('You can keep 12 cars. Delete one first.'); return; }
            slot = { id: 'c' + Date.now().toString(36) }; saved.push(slot); design._id = slot.id;
        }
        slot.design = copy; storeSavedCars(saved); saveDesign(); toast(`Saved "${design.name || 'My Supercar'}"`);
    }
    if (action === 'new') { setDesign({ ...DEFAULT, name: 'New Supercar' }); toast('A fresh car. Remember to save it!'); return; }
    if (action === 'load') { const c = saved.find(x => x.id === id); if (c) { setDesign({ ...c.design, _id: c.id }); toast(`Loaded "${c.design.name}"`); } return; }
    if (action === 'delete') { const c = saved.find(x => x.id === id); if (c && confirm(`Delete "${c.design.name}"?`)) { storeSavedCars(saved.filter(x => x.id !== id)); if (design._id === id) delete design._id; } }
    if (action === 'code') { shareCode = encodeDesign(design); }
    if (action === 'copy') {
        const el = document.getElementById('share-code-out');
        (navigator.clipboard ? navigator.clipboard.writeText(shareCode) : Promise.reject()).then(() => toast('Code copied')).catch(() => { el.select(); toast('Select the code and copy it'); });
        return;
    }
    if (action === 'loadCode') {
        const d = decodeDesign(document.getElementById('share-code-in').value);
        if (!d) { toast("That code doesn't look right. It should start with SL3-, SL2- or SL1-", 2600); return; }
        setDesign(d); toast(`Loaded "${d.name}". Tap Save to keep it.`, 2600); return;
    }
    renderPanel();
}
function onPanelClick(e) {
    const b = e.target.closest('button'); if (!b) return;
    const d = b.dataset;
    if (d.btab) { panelTab = d.btab; renderPanel(); return; }
    if (d.cars) { onCars(d.cars, d.id); return; }
    if (d.preset) { applyPreset(design, d.preset); renderPanel(); changed(); return; }
    if (d.rim) { if (lockedToast('rim', d.rim)) return; design.rim = d.rim; }
    else if (d.rimcol) { if (lockedToast('rimColour', d.rimcol)) return; design.rimColour = d.rimcol; }
    else if (d.caliper) design.caliper = d.caliper;
    else if (d.paint) design.paint = d.paint;
    else if (d.finish) { if (lockedToast('finish', d.finish)) return; design.finish = d.finish; }
    else if (d.wing) { if (lockedToast('wing', d.wing)) return; design.wing = d.wing; }
    else if (d.livery) { if (lockedToast('livery', d.livery)) return; design.livery = d.livery; }
    else if (d.stripe) design.stripeColour = d.stripe;
    else if (d.paint2) design.paint2 = d.paint2;
    else if (d.toggle) design[d.toggle] = !design[d.toggle];
    else if (d.engine) { design.engine = d.engine; engineSound(); }
    else return;
    renderPanel(); changed(!d.engine);
}
let textTimer = null;
function onPanelInput(e) {
    const t = e.target;
    if (t.dataset.slider) { design[t.dataset.slider] = parseFloat(t.value); design.preset = 'custom'; changed(); }
    if (t.dataset.paintpick !== undefined) { design.paint = t.value; t.parentElement.style.setProperty('--sw', t.value); changed(); }
    if (t.dataset.text) {
        let v = t.value;
        if (t.dataset.text === 'number') { v = v.replace(/[^0-9]/g, '').slice(0, 2); if (v !== t.value) t.value = v; }
        design[t.dataset.text] = v;
        clearTimeout(textTimer); textTimer = setTimeout(() => changed(t.dataset.text !== 'name'), 350);
    }
}
function syncTurntableButton() {
    const b = document.getElementById('build-turntable'); if (b) b.classList.toggle('active', controls.autoRotate);
}
function photo() {
    renderer.render(scene, camera);
    const a = document.createElement('a');
    a.download = `${(design.name || 'my-supercar').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`;
    a.href = renderer.domElement.toDataURL('image/png');
    a.click();
}

// =====================================================================
//  ENTER / LEAVE (called from app.js)
// =====================================================================
export function enter() {
    const stage = document.getElementById('build-stage');
    if (!started) {
        started = true;
        if (!init(stage)) {
            stage.innerHTML = `<div class="b-nogl"><h2>3D isn't available here</h2><p>This device or browser can't show 3D graphics, so the builder can't open. Everything else in the app still works.</p></div>`;
            return;
        }
        document.getElementById('build-panel').addEventListener('click', onPanelClick);
        document.getElementById('build-panel').addEventListener('input', onPanelInput);
        document.getElementById('build-tools').addEventListener('click', e => {
            const b = e.target.closest('button'); if (!b) return;
            if (b.dataset.light) { setLights(b.dataset.light); document.querySelectorAll('[data-light]').forEach(x => x.classList.toggle('active', x === b)); }
            if (b.id === 'build-turntable') { controls.autoRotate = !controls.autoRotate; syncTurntableButton(); }
            if (b.id === 'build-photo') photo();
            if (b.id === 'build-reset') { design = { ...DEFAULT }; saveDesign(); renderPanel(); buildCar(); }
        });
        renderPanel(); syncTurntableButton();
    }
    resize();
    if (!raf && renderer) frame();
}
export function leave() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
export function refreshUnits() { if (started) renderStats(); }
// Put the camera at a fixed angle (used for photo angles and testing)
export function setView(azimuthDeg, elevationDeg = 14, dist = 9) {
    if (!controls) return;
    controls.autoRotate = false; syncTurntableButton();
    const az = azimuthDeg * Math.PI / 180, el = elevationDeg * Math.PI / 180;
    camera.position.set(Math.cos(az) * Math.cos(el) * dist, 0.6 + Math.sin(el) * dist, Math.sin(az) * Math.cos(el) * dist);
    controls.target.set(0, 0.6, 0); controls.update();
}
