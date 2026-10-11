// Supercar Legends: the 3D garage builder. Loaded only when the Build screen first opens.
import * as THREE from './lib/three.module.min.js';
import { OrbitControls } from './lib/addons/OrbitControls.js';
import { RoomEnvironment } from './lib/addons/RoomEnvironment.js';
import { PRESETS, PAINTS, FINISHES, RIMS, RIM_COLOURS, WINGS, ENGINES, DEFAULT, loadDesign, saveDesign as saveDesignTo, createCar, carStats } from './carmodel.js';

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
let panelTab = 'body';
const swatch = (val, cur, attr, col = val) => `<button class="swatch ${val === cur ? 'active' : ''}" data-${attr}="${val}" style="--sw:${col}" aria-label="${val}"></button>`;
const choice = (obj, cur, attr) => Object.entries(obj).map(([k, v]) => `<button class="opt ${k === cur ? 'active' : ''}" data-${attr}="${k}">${typeof v === 'string' ? v : v.label}</button>`).join('');
const slider = (key, label, min, max, step) => `<label class="slider"><span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${design[key]}" data-slider="${key}"></label>`;
function renderPanel() {
    const tabs = { body: 'Body', wheels: 'Wheels', paint: 'Paint', aero: 'Aero', engine: 'Engine' };
    let html = `<div class="b-tabs">${Object.entries(tabs).map(([k, v]) => `<button class="b-tab ${k === panelTab ? 'active' : ''}" data-btab="${k}">${v}</button>`).join('')}</div><div class="b-body">`;
    if (panelTab === 'body') html += `<p class="b-label">Body style</p><div class="opts">${choice(PRESETS, design.preset, 'preset')}</div>
        ${slider('L', 'Length', 4.0, 5.2, 0.05)}${slider('W', 'Width', 1.7, 2.1, 0.01)}${slider('roof', 'Roof height', 1.0, 1.35, 0.01)}
        ${slider('nose', 'Nose height', 0.38, 0.72, 0.01)}${slider('tail', 'Tail height', 0.78, 1.05, 0.01)}${slider('ride', 'Ride height', 0.06, 0.2, 0.005)}`;
    if (panelTab === 'wheels') html += `<p class="b-label">Rim design</p><div class="opts">${choice(RIMS, design.rim, 'rim')}</div>
        <p class="b-label">Rim colour</p><div class="swatches">${Object.entries(RIM_COLOURS).map(([k, v]) => swatch(k, design.rimColour, 'rimcol', v === 'chrome' ? 'linear-gradient(135deg,#fff,#7c8591,#fff)' : v)).join('')}</div>
        <p class="b-label">Brake callipers</p><div class="swatches">${['#FFB300', '#E10600', '#00B8D9', '#C6FF00', '#16181C', '#F4F6F8'].map(c => swatch(c, design.caliper, 'caliper')).join('')}</div>
        ${slider('wheel', 'Wheel size', 0.31, 0.38, 0.005)}`;
    if (panelTab === 'paint') html += `<p class="b-label">Colour</p><div class="swatches">${PAINTS.map(c => swatch(c, design.paint, 'paint')).join('')}
        <label class="swatch custom" style="--sw:${design.paint}" title="Pick any colour"><input type="color" value="${design.paint}" data-paintpick></label></div>
        <p class="b-label">Finish</p><div class="opts">${choice(FINISHES, design.finish, 'finish')}</div>`;
    if (panelTab === 'aero') html += `<p class="b-label">Rear wing</p><div class="opts">${choice(WINGS, design.wing, 'wing')}</div>
        <p class="b-label">Extras</p><div class="opts"><button class="opt ${design.splitter ? 'active' : ''}" data-toggle="splitter">Front splitter</button><button class="opt ${design.skirts ? 'active' : ''}" data-toggle="skirts">Side skirts</button></div>`;
    if (panelTab === 'engine') html += `<p class="b-label">Engine</p><div class="opts">${choice(ENGINES, design.engine, 'engine')}</div><p class="small">${ENGINES[design.engine].note}. Tap again to hear it.</p>`;
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
function onPanelClick(e) {
    const b = e.target.closest('button'); if (!b) return;
    const d = b.dataset;
    if (d.btab) { panelTab = d.btab; renderPanel(); return; }
    if (d.preset) { Object.assign(design, PRESETS[d.preset], { preset: d.preset }); renderPanel(); changed(); return; }
    if (d.rim) design.rim = d.rim;
    else if (d.rimcol) design.rimColour = d.rimcol;
    else if (d.caliper) design.caliper = d.caliper;
    else if (d.paint) design.paint = d.paint;
    else if (d.finish) design.finish = d.finish;
    else if (d.wing) design.wing = d.wing;
    else if (d.toggle) design[d.toggle] = !design[d.toggle];
    else if (d.engine) { design.engine = d.engine; engineSound(); }
    else return;
    renderPanel(); changed(!d.engine);
}
function onPanelInput(e) {
    const t = e.target;
    if (t.dataset.slider) { design[t.dataset.slider] = parseFloat(t.value); design.preset = 'custom'; changed(); }
    if (t.dataset.paintpick !== undefined) { design.paint = t.value; t.parentElement.style.setProperty('--sw', t.value); changed(); }
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
