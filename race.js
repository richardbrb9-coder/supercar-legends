// Supercar Legends: racing. Loaded only when the Race screen first opens.
// Arcade driving, not a simulator. Your car is the one you designed in the Build screen.
import * as THREE from './lib/three.module.min.js';
import * as SC from './scenery.js';
import { Effects } from './effects.js';
import { createCar, carStats, loadDesign, PRESETS, PAINTS, ENGINES, RIMS, DEFAULT, UNLOCKS, medalPoints, applyPreset } from './carmodel.js';

// =====================================================================
//  THE TRACK (a closed spline; everything else is built along it)
// =====================================================================
const TRACKS = [
    { id: 'coast', name: 'Coastline Circuit', theme: 'coast', laps: 3, width: 14, runoff: 7,
      about: 'A flowing circuit by the sea, with a hairpin and quick bends.',
      points: [[0, 0], [260, 0], [410, 18], [470, 90], [452, 172], [372, 204], [312, 262], [330, 340], [270, 404], [158, 388],
               [96, 306], [26, 326], [-58, 384], [-152, 344], [-176, 244], [-116, 172], [-156, 92], [-112, 18]] },
    { id: 'city', name: 'City Streets', theme: 'city', laps: 3, width: 12, runoff: 2.5,
      about: 'Tight right-angle corners between tall buildings, with walls close to the road. Brake early!',
      points: [[0, 0], [180, 0], [200, 8], [210, 30], [210, 140], [220, 160], [240, 170], [330, 170], [350, 180], [358, 200],
               [358, 300], [350, 320], [330, 328], [60, 328], [40, 320], [32, 300], [32, 230], [24, 210], [4, 202], [-60, 202],
               [-80, 194], [-88, 174], [-88, 30], [-80, 8], [-60, 0]] },
    { id: 'lemans', name: 'Le Mans Sprint', theme: 'forest', laps: 2, width: 15, runoff: 9,
      about: 'Inspired by the famous 24-hour race: a very long straight with a chicane, then fast sweeping bends through the forest.',
      points: [[0, 0], [400, 0], [430, -12], [470, -12], [500, 0], [900, 0], [960, 10], [985, 40], [975, 80], [940, 100], [900, 110],
               [880, 130], [890, 160], [930, 175], [960, 200], [965, 260], [930, 300], [860, 320], [700, 330], [560, 320], [520, 300],
               [500, 270], [460, 250], [300, 250], [200, 270], [120, 300], [40, 300], [-30, 270], [-70, 210], [-70, 120], [-50, 50], [-30, 15]] }
];
let TRACK = TRACKS[0];
let N = 1400;                          // samples along the track (about one every 1.4 m)
let HW = TRACK.width / 2, RUNOFF = TRACK.runoff;   // half-width of the road; space before the barriers
let samples = null, trackLen = 0;
function buildSamples() {
    HW = TRACK.width / 2; RUNOFF = TRACK.runoff;
    const curve = new THREE.CatmullRomCurve3(TRACK.points.map(([x, z]) => new THREE.Vector3(x, 0, z)), true, 'centripetal');
    trackLen = curve.getLength();
    N = Math.max(1000, Math.round(trackLen / 1.4));
    const pts = curve.getSpacedPoints(N);
    pts.pop();
    samples = pts.map((p, i) => {
        const nx = pts[(i + 1) % N], pv = pts[(i - 1 + N) % N];
        const t = new THREE.Vector3().subVectors(nx, pv).normalize();
        return { p, t, n: new THREE.Vector3(t.z, 0, -t.x), heading: Math.atan2(-t.z, t.x), d: i * trackLen / N };
    });
    // signed curvature (left turns positive) and the speed a car can take each point at
    samples.forEach((s, i) => {
        const a = samples[(i - 6 + N) % N].heading, b = samples[(i + 6) % N].heading;
        let dh = b - a; while (dh > Math.PI) dh -= Math.PI * 2; while (dh < -Math.PI) dh += Math.PI * 2;
        s.k = dh / (12 * trackLen / N);
    });
    // smooth the curvature so the AI's racing line is gentle
    const k2 = samples.map((s, i) => { let sum = 0; for (let j = -10; j <= 10; j++) sum += samples[(i + j + N) % N].k; return sum / 21; });
    samples.forEach((s, i) => { s.ks = k2[i]; s.line = Math.sign(k2[i]) * Math.min(HW * 0.6, Math.abs(k2[i]) * 900); });
}
const sampleAt = d => samples[((Math.floor(d / trackLen * N) % N) + N) % N];
// A smooth point along the track: blends between the two nearest samples so cars glide instead of stepping
const wrapAngle = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
// the racing line's distance from the middle of the road at distance d
function lineAt(d) {
    const f = ((d / trackLen * N) % N + N) % N, i = Math.floor(f), t = f - i;
    return samples[i].line + (samples[(i + 1) % N].line - samples[i].line) * t;
}
function pathAt(d, extraOffset = 0, lineScale = 0.9) {
    const f = ((d / trackLen * N) % N + N) % N, i = Math.floor(f), t = f - i;
    const a = samples[i], b = samples[(i + 1) % N];
    const nx = a.n.x + (b.n.x - a.n.x) * t, nz = a.n.z + (b.n.z - a.n.z) * t;
    const off = (a.line + (b.line - a.line) * t) * lineScale + extraOffset;
    return { x: a.p.x + (b.p.x - a.p.x) * t + nx * off, z: a.p.z + (b.p.z - a.p.z) * t + nz * off,
             heading: a.heading + wrapAngle(b.heading - a.heading) * t };
}

function ribbon(offA, offB, yA, yB, mat, vScale = 0.1, colorFn = null) {
    const pos = [], uv = [], col = [], idx = [];
    for (let i = 0; i <= N; i++) {
        const s = samples[i % N], d = i * trackLen / N;
        const a = s.p.clone().addScaledVector(s.n, offA), b = s.p.clone().addScaledVector(s.n, offB);
        pos.push(a.x, yA, a.z, b.x, yB, b.z);
        uv.push(0, d * vScale, 1, d * vScale);
        if (colorFn) { const c = colorFn(i % N); col.push(...c, ...c); }
        if (i < N) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    if (colorFn) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx); g.computeVertexNormals();
    return new THREE.Mesh(g, mat);
}
function buildTrack(scene) {
    const group = new THREE.Group(), city = TRACK.theme === 'city';
    const xs = samples.map(s => s.p.x), zs = samples.map(s => s.p.z);
    const bounds = { minX: Math.min(...xs) - 160, maxX: Math.max(...xs) + 160, minZ: Math.min(...zs) - 160, maxZ: Math.max(...zs) + 160 };
    // ground: grass, or pavement in the city
    const gw = bounds.maxX - bounds.minX + 800, gd = bounds.maxZ - bounds.minZ + 800;
    if (city) {   // pavement; the other circuits get their ground from scenery.js
        const grass = new THREE.Mesh(new THREE.PlaneGeometry(gw, gd), SC.photoMat('concrete_pavement', gw / 4, gd / 4, 0xc9c9c9));
        grass.rotation.x = -Math.PI / 2; grass.position.set((bounds.minX + bounds.maxX) / 2, -0.02, (bounds.minZ + bounds.maxZ) / 2); grass.receiveShadow = true; group.add(grass);
    }
    // road (the texture's v runs along the track)
    const road = ribbon(HW, -HW, 0.02, 0.02, SC.photoMat('asphalt_02', TRACK.width / 6, 16 / 6, 0xb8bcc4, 0.85), 1 / 16);
    road.receiveShadow = true;
    // white lines along both edges of the road
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.7 });
    group.add(ribbon(HW - 0.15, HW - 0.45, 0.03, 0.03, edgeMat), ribbon(-HW + 0.45, -HW + 0.15, 0.03, 0.03, edgeMat));
    group.add(road);
    // a dashed white line down the middle, splitting the road into two lanes
    {
        const pos = [], idx = [], dash = 4, gap = 5, hw = 0.13;
        for (let d = 0; d < trackLen - dash; d += dash + gap) {
            for (let k = 0; k <= 4; k++) {
                const p = pathAt(d + dash * k / 4, 0, 0), nx = Math.sin(p.heading), nz = Math.cos(p.heading);
                pos.push(p.x + nx * hw, 0.035, p.z + nz * hw, p.x - nx * hw, 0.035, p.z - nz * hw);
            }
            const b = pos.length / 3 - 10;
            for (let k = 0; k < 4; k++) { const a = b + k * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
        }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
        group.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xf2f2f2, side: THREE.DoubleSide })));
    }
    // kerbs on the corners: red and white blocks
    const kerbMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 });
    const kerbCol = i => Math.abs(samples[i].ks) < 0.004 ? (city ? [0.07, 0.078, 0.095] : [0.047, 0.196, 0.043]) : (Math.floor(i / 6) % 2 ? [0.92, 0.92, 0.92] : [0.86, 0.04, 0.02]);
    group.add(ribbon(HW + 1.3, HW, 0.03, 0.05, kerbMat, 0.1, kerbCol));
    group.add(ribbon(-HW, -HW - 1.3, 0.05, 0.03, kerbMat, 0.1, kerbCol));
    // barriers (both sides), white with a blue stripe made with vertex colours
    const barMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, side: THREE.DoubleSide });
    for (const off of [HW + RUNOFF, -HW - RUNOFF]) {
        const pos = [], col = [], idx = [];
        for (let i = 0; i <= N; i++) {
            const s = samples[i % N], p = s.p.clone().addScaledVector(s.n, off);
            const c = city ? (Math.floor(i / 6) % 2 ? [0.6, 0.6, 0.62] : [0.75, 0.05, 0.03]) : (Math.floor(i / 10) % 2 ? [0.95, 0.95, 0.95] : [0.12, 0.35, 0.85]);
            pos.push(p.x, 0, p.z, p.x, city ? 1.4 : 1.0, p.z); col.push(...c, ...c);
            if (i < N) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
        g.setIndex(idx); g.computeVertexNormals(); group.add(new THREE.Mesh(g, barMat));
    }
    // F1-style grid boxes: a white bar in front of each starting spot with short legs back along each side
    {
        const pos = [], idx = [];
        const quad = (d0, d1, l0, l1) => {
            const a = pathAt(d0, l0, 0), b = pathAt(d0, l1, 0), c = pathAt(d1, l0, 0), e = pathAt(d1, l1, 0), k = pos.length / 3;
            pos.push(a.x, 0.036, a.z, b.x, 0.036, b.z, c.x, 0.036, c.z, e.x, 0.036, e.z); idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
        };
        for (const [back, side] of GRID) {
            const front = trackLen + back + 2.7;
            quad(front - 0.25, front, side - 1.25, side + 1.25);                 // the bar across the front
            quad(front - 1.6, front - 0.25, side - 1.25, side - 1.05);           // the legs
            quad(front - 1.6, front - 0.25, side + 1.05, side + 1.25);
        }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
        group.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xf2f2f2, side: THREE.DoubleSide })));
    }
    // start/finish line: chequered strip
    const cc = document.createElement('canvas'); cc.width = 64; cc.height = 8; const cx = cc.getContext('2d');
    for (let i = 0; i < 16; i++) for (let j = 0; j < 2; j++) { cx.fillStyle = (i + j) % 2 ? '#111' : '#fff'; cx.fillRect(i * 4, j * 4, 4, 4); }
    const ct = new THREE.CanvasTexture(cc); ct.magFilter = THREE.NearestFilter;
    const s0 = samples[0];
    const line = new THREE.Mesh(new THREE.PlaneGeometry(TRACK.width, 2), new THREE.MeshBasicMaterial({ map: ct }));
    line.rotation.x = -Math.PI / 2; line.rotation.z = s0.heading + Math.PI / 2; line.position.set(s0.p.x, 0.04, s0.p.z); group.add(line);
    // start gantry with five lights
    const gantry = new THREE.Group(), steel = new THREE.MeshStandardMaterial({ color: 0x2a2f39, metalness: 0.6, roughness: 0.4 });
    for (const side of [1, -1]) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.6, 7, 0.6), steel); post.position.set(0, 3.5, side * (HW + 1.5)); gantry.add(post); }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(1, 1.4, TRACK.width + 3.6), steel); beam.position.y = 7; gantry.add(beam);
    const lightMats = [];
    for (let i = 0; i < 5; i++) {
        const m = new THREE.MeshStandardMaterial({ color: 0x220000, emissive: 0xff1a10, emissiveIntensity: 0 }); lightMats.push(m);
        const l = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 8), m); l.position.set(-0.55, 7, (i - 2) * 1.3); gantry.add(l);
    }
    gantry.position.set(s0.p.x, 0, s0.p.z); gantry.rotation.y = s0.heading; group.add(gantry);
    const nearTrack = (x, z) => { let near = Infinity; for (let i = 0; i < N; i += 5) near = Math.min(near, (samples[i].p.x - x) ** 2 + (samples[i].p.z - z) ** 2); return Math.sqrt(near); };
    if (city) buildCity(group, nearTrack);
    // scenery for this circuit (scenery.js): ground, hills, trees, stands, signs and more
    const ctx = { group, samples, N, trackLen, HW, RUNOFF, pathAt, nearTrack, bounds, theme: TRACK.theme, quality: SC.QUALITY[quality] };
    SC.tyreMarks(ctx);
    const extra = SC.decorate(ctx);
    group.traverse(o => { if (o.isMesh && !o.receiveShadow && o.material && !o.material.transparent) o.receiveShadow = true; });
    scene.add(group);
    return { lightMats, group, update: extra.update || (() => {}) };
}

// =====================================================================
//  CARS
// =====================================================================
const G = 9.81;
function perf(stats, factor = 1) {
    const vmax = stats.mph * 0.44704 * factor;
    const a0 = 27.78 / stats.z62 / (1 - 0.5 * 27.78 / (stats.mph * 0.44704)) * factor;
    return { vmax, a0, grip: G * (0.95 + stats.handling / 100 * 0.55) * factor, brake: 8 + stats.braking / 100 * 6 };
}
function blobShadow() {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 8, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.06;
    return m;
}
function makeRacer(design, factor, isPlayer) {
    const model = createCar(design, { merge: true }), stats = carStats(design);
    const holder = new THREE.Group(), blob = blobShadow(); holder.add(model.group, blob);
    model.group.traverse(o => { if (o.isMesh) o.castShadow = true; });
    blob.visible = !(renderer && renderer.shadowMap.enabled);
    return { design, model, holder, blob, stats, perf: perf(stats, factor), isPlayer, x: 0, z: 0, heading: 0, v: 0, steer: 0, d: 0, idx: 0, lap: 0,
             lapStart: 0, lastLat: 0, finished: null, best: null, half: false, wheelSpin: 0, lineOffset: 0, lat: 0, latV: 0 };
}
// Rival cars are designed in code from the builder presets, so they're original designs too
function rivalDesign(i) {
    const keys = Object.keys(PRESETS), preset = keys[(i * 2 + 1 + Math.floor(Math.random() * 2)) % keys.length];
    const paint = PAINTS.filter(c => c !== loadDesign().paint)[(i * 3 + Math.floor(Math.random() * 3)) % 10];
    const engines = Object.keys(ENGINES), rims = Object.keys(RIMS);
    const d = applyPreset({ ...DEFAULT }, preset);
    return { ...d, paint, finish: ['gloss', 'metallic', 'pearl'][i % 3], engine: engines[(i + 1) % engines.length],
             rim: rims[(i * 2) % rims.length], rimColour: ['silver', 'black', 'gold'][i % 3], wing: ['gt', 'ducktail', 'swan'][i % 3] };
}

// =====================================================================
//  STATE
// =====================================================================
let renderer, scene, camera, raf = null, started = false, lastT = 0;
let sky = null, sun = null, hemi = null, efx = null, headlight = null, carGlow = null, look = null, elapsed = 0, puffT = 0;
let timeOfDay = store('raceTime', 'day');
// graphics quality: 'auto' picks a level and steps down if the frame rate drops
let qualitySetting = store('raceQuality', 'auto'), quality = qualitySetting === 'auto' ? SC.guessQuality() : qualitySetting;
let world = null, player = null, rivals = [], ghost = null, mode = 'race', difficulty = 'medium';
let race = null;                                  // { phase: 'grid'|'lights'|'go'|'done', t, lightsT, results }
const input = { left: false, right: false, gas: false, brake: false, tilt: 0 };
let camMode = 0, help = store('raceHelp', true);
const DIFF = { easy: 0.8, medium: 0.88, hard: 0.96 };
const GRID = [[-12, 3.5], [-20, -3.5], [-28, 3.5], [-36, -3.5]];   // [metres behind the line, metres from the middle of the road]
const fmtTime = t => t == null ? '–' : `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, '0')}`;
function store(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch (e) { return fallback; } }
function storeSet(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }

function setupRace() {
    // remove old cars
    [player, ...rivals, ghost].forEach(r => { if (r) { scene.remove(r.holder); r.model.dispose(); } });
    rivals = []; ghost = null;
    player = makeRacer(loadDesign(), 1, true);
    scene.add(player.holder);
    // grid: two staggered columns behind the start line, F1 style; you start at the back in a race
    const slots = GRID;
    const place = (r, [back, side]) => {
        const s = sampleAt(trackLen + back);
        r.x = s.p.x + s.n.x * side; r.z = s.p.z + s.n.z * side; r.heading = s.heading; r.d = back; r.lap = -1; r.half = true;
        r.idx = ((Math.floor(((back % trackLen) + trackLen) / trackLen * N) % N) + N) % N; r.v = 0;
        r.lat = side; r.latV = 0;                       // rivals start in their own grid box and ease across to the racing line
    };
    if (mode === 'race') {
        for (let i = 0; i < 3; i++) {
            const r = makeRacer(rivalDesign(i), DIFF[difficulty] * (1 - i * 0.02), false);
            r.lineOffset = (i - 1) * 1.6;
            rivals.push(r); scene.add(r.holder); place(r, slots[i]);
        }
        place(player, slots[3]);
    } else {
        place(player, [-12, 0]);
        const g = store('ghost_' + TRACK.id, null);
        if (g && g.frames && g.frames.length) {
            ghost = makeRacer(g.design || loadDesign(), 1, false);
            ghost.frames = g.frames; ghost.time = g.time;
            ghost.model.group.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.35; o.material.depthWrite = false; } });
            ghost.holder.visible = false; scene.add(ghost.holder);
        }
    }
    if (efx) efx.clear();
    race = { phase: 'lights', t: 0, lightsT: 0, raceTime: 0, results: null, recording: [], lapTimes: [] };
    updateCars(0); placeCamera(true);
    hud();
}

// =====================================================================
//  DRIVING
// =====================================================================
function nearestIndex(r) {
    let best = r.idx, bd = Infinity;
    for (let j = -40; j <= 40; j++) {
        const i = (r.idx + j + N) % N, s = samples[i], dx = r.x - s.p.x, dz = r.z - s.p.z, dd = dx * dx + dz * dz;
        if (dd < bd) { bd = dd; best = i; }
    }
    return best;
}
function lapCrossing(r, prevIdx) {
    if (prevIdx > N * 0.4 && prevIdx < N * 0.6) r.half = true;
    if (prevIdx > N * 0.9 && r.idx < N * 0.1) {
        if (r.half) {
            r.lap++; r.half = false;
            const now = race.raceTime, lapTime = r.lap >= 1 ? now - r.lapStart : null;
            if (lapTime != null && (r.best == null || lapTime < r.best)) r.best = lapTime;
            if (r.isPlayer) onPlayerLap(lapTime);
            r.lapStart = now;
            if (mode === 'race' && r.lap >= TRACK.laps && r.finished == null) { r.finished = now; if (r.isPlayer) finishRace(); }
        }
    }
    if (prevIdx < N * 0.1 && r.idx > N * 0.9) r.half = false;   // reversing over the line doesn't count
}
function drivePlayer(dt) {
    const r = player, P = r.perf, go = race.phase === 'go' || race.phase === 'done';
    // steering: keys/buttons or tilt
    let steerIn = (input.left ? 1 : 0) - (input.right ? 1 : 0);
    if (Math.abs(input.tilt) > 0.05) steerIn = Math.max(-1, Math.min(1, input.tilt));
    let gas = input.gas, brake = input.brake;
    if (window.__kidbot) {                    // test driver: flat out, steers late with a slow reaction, never brakes
        const tgt = sampleAt(samples[r.idx].d + 10);
        let want = Math.atan2(-(tgt.p.z - r.z), tgt.p.x - r.x) - r.heading; while (want > Math.PI) want -= Math.PI * 2; while (want < -Math.PI) want += Math.PI * 2;
        r.botSteer = r.botSteer ?? 0; r.botT = (r.botT ?? 0) + dt;
        if (r.botT > 0.25) { r.botT = 0; r.botSteer = Math.abs(want) > 0.06 ? Math.sign(want) : 0; }
        steerIn = r.botSteer; gas = true; brake = false;
    }
    if (window.__autopilot) {                 // test driver: follow the racing line like a rival
        const here = samples[r.idx].d, tgt = sampleAt(here + 14 + r.v * 0.3), off = tgt.line * 0.9;
        const tx = tgt.p.x + tgt.n.x * off, tz = tgt.p.z + tgt.n.z * off;
        let want = Math.atan2(-(tz - r.z), tx - r.x) - r.heading; while (want > Math.PI) want -= Math.PI * 2; while (want < -Math.PI) want += Math.PI * 2;
        steerIn = Math.max(-1, Math.min(1, want * 3));
        let target = P.vmax;
        for (let ahead = 0; ahead <= 160; ahead += 8) { const k = Math.abs(sampleAt(here + ahead).ks); const vc = k > 1e-4 ? Math.sqrt(P.grip * 0.85 / k) : P.vmax; target = Math.min(target, Math.sqrt(vc * vc + 2 * P.brake * 0.7 * ahead)); }
        gas = r.v < target; brake = r.v > target + 2;
    }
    const s = samples[r.idx], lat = (r.x - s.p.x) * s.n.x + (r.z - s.p.z) * s.n.z;
    const playerGrip = P.grip * 1.3;                        // arcade grip: more forgiving than the rivals
    if (help && !window.__autopilot && go) {
        // driving help 1: ease off before a corner you're going too fast for
        const here = samples[r.idx].d; let target = P.vmax;
        for (let ahead = 0; ahead <= 120; ahead += 8) { const k = Math.abs(sampleAt(here + ahead).ks); const vc = k > 1e-4 ? Math.sqrt(playerGrip * 0.9 / k) : P.vmax; target = Math.min(target, Math.sqrt(vc * vc + 2 * P.brake * 0.8 * ahead)); }
        if (r.v > target + 1) { gas = false; r.v -= P.brake * 0.6 * dt; }
        // driving help 2: a gentle nudge back towards the road near the edge
        const edge = HW - 1.5;
        if (Math.abs(lat) > edge) steerIn -= Math.sign(lat) * 0.45 * Math.min(1, (Math.abs(lat) - edge) / 3);
        steerIn = Math.max(-1, Math.min(1, steerIn));
    }
    const maxSteer = 0.62 / (1 + r.v / 30);
    r.steer += (steerIn * maxSteer - r.steer) * Math.min(1, dt * 16);   // steering responds quickly
    // grass slows you down (but not too much)
    const onGrass = Math.abs(lat) > HW + 1.3;
    r.onGrass = onGrass;
    // slipstream: tucked in close behind another car, the air is easier to push through
    r.slip = false;
    if (go && r.v > 20) for (const o of rivals) {
        const dx = o.x - r.x, dz = o.z - r.z, fx2 = Math.cos(r.heading), fz2 = -Math.sin(r.heading);
        const ahead = dx * fx2 + dz * fz2, side = Math.abs(-dx * fz2 + dz * fx2);
        if (ahead > 3 && ahead < 22 && side < 2.6) { r.slip = true; break; }
    }
    if (go) { r.driveTime = (r.driveTime || 0) + dt; if (onGrass) r.grassTime = (r.grassTime || 0) + dt; }
    const vmax = onGrass ? Math.min(P.vmax, 30) : P.vmax;
    let a = 0;
    const vTop = r.slip ? vmax * 1.05 : vmax;
    if (go && gas) a += P.a0 * Math.max(0.12, 1 - r.v / vTop) * (r.slip ? 1.15 : 1);
    if (brake) a -= r.v > 0.5 ? P.brake : 3;           // brake, then gently reverse
    a -= 0.25 + r.v * r.v * 0.0004 + (onGrass ? r.v * 0.06 : 0);  // rolling and air drag
    if (!gas && !brake && Math.abs(r.v) < 0.3) r.v = 0;
    r.v = go ? Math.max(-6, r.v + a * dt) : 0;
    if (r.v > vmax && onGrass) r.v -= (r.v - vmax) * Math.min(1, dt * 2);
    // turning, limited by grip: too fast into a corner and the car slides wide
    const wb = r.design.L * 0.6;
    let yawRate = r.v * Math.tan(r.steer) / wb;
    const latAcc = Math.abs(yawRate * r.v), grip = playerGrip * (onGrass ? 0.7 : 1);
    if (latAcc > grip) { yawRate *= grip / latAcc; r.v -= (latAcc - grip) * 0.08 * dt * Math.sign(r.v); r.sliding = true; } else r.sliding = false;
    r.heading += yawRate * dt;
    r.x += Math.cos(r.heading) * r.v * dt; r.z -= Math.sin(r.heading) * r.v * dt;
    // barriers
    const prevIdx = r.idx; r.idx = nearestIndex(r);
    const s2 = samples[r.idx], lat2 = (r.x - s2.p.x) * s2.n.x + (r.z - s2.p.z) * s2.n.z, wall = HW + RUNOFF - 1.1;
    if (Math.abs(lat2) > wall) {
        const push = Math.abs(lat2) - wall;
        r.x -= s2.n.x * push * Math.sign(lat2); r.z -= s2.n.z * push * Math.sign(lat2);
        let rel = r.heading - s2.heading; while (rel > Math.PI) rel -= Math.PI * 2; while (rel < -Math.PI) rel += Math.PI * 2;
        if (Math.abs(rel) < Math.PI / 2) r.heading -= rel * 0.6; else r.heading -= (rel - Math.sign(rel) * Math.PI) * 0.6;
        if (r.v > 8) {
            bump(0.35);
            const sg = Math.sign(lat2);   // sparks where the car scrapes the barrier
            efx.sparksAt(r.x + s2.n.x * sg * 1.0, 0.4, r.z + s2.n.z * sg * 1.0, Math.cos(r.heading), -Math.sin(r.heading), Math.min(40, 8 + r.v));
            efx.bump(Math.min(0.8, r.v / 60));
        }
        r.v *= 0.82;
    }
    r.lastLat = lat2;
    if (go) lapCrossing(r, prevIdx);
}
function driveRival(r, dt) {
    const go = race.phase === 'go' || race.phase === 'done';
    const P = r.perf;
    // look ahead and slow down in time for the next corner
    let target = P.vmax;
    for (let ahead = 0; ahead <= 160; ahead += 8) {
        const s = sampleAt(r.d + ahead), k = Math.abs(s.ks);
        const vc = k > 1e-4 ? Math.sqrt(P.grip * 0.92 / k) : P.vmax;
        target = Math.min(target, Math.sqrt(vc * vc + 2 * P.brake * 0.8 * ahead));
    }
    let a = 0;
    if (go) a = r.v < target ? P.a0 * Math.max(0.12, 1 - r.v / P.vmax) : -P.brake * Math.min(1, (r.v - target) / 3);
    a -= 0.25;
    r.v = Math.max(0, r.v + a * dt);
    r.d += r.v * dt;
    // follow the racing line like a real driver: the car can only move sideways gradually (faster when going faster),
    // easing in and out of each move, so it never darts across the road
    const latTarget = Math.max(-HW + 1.3, Math.min(HW - 1.3, lineAt(r.d + r.v * 0.4) * 0.9 + r.lineOffset));
    const maxLatV = Math.min(4.5, r.v * 0.09), wantV = Math.max(-maxLatV, Math.min(maxLatV, (latTarget - r.lat) * 1.2));
    r.latV += Math.max(-5 * dt, Math.min(5 * dt, wantV - r.latV));
    r.lat += r.latV * dt;
    const here = pathAt(r.d, r.lat, 0), ahead = pathAt(r.d + 3, r.lat + r.latV * 3 / Math.max(4, r.v), 0);
    r.x = here.x; r.z = here.z;
    const want = Math.atan2(-(ahead.z - here.z), ahead.x - here.x);
    const dh = wrapAngle(want - r.heading);
    r.heading += dh * Math.min(1, dt * 12);
    r.steer += (Math.max(-0.4, Math.min(0.4, dh * 6 + wrapAngle(pathAt(r.d + 10, r.lat, 0).heading - want) * 2)) - r.steer) * Math.min(1, dt * 6);
    const prevIdx = r.idx; r.idx = ((Math.floor(r.d / trackLen * N) % N) + N) % N;
    if (go) lapCrossing(r, prevIdx);
}
// keep cars from driving through each other
function collisions() {
    const all = [player, ...rivals];
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
        const a = all[i], b = all[j], dx = b.x - a.x, dz = b.z - a.z, dist = Math.hypot(dx, dz), min = 2.6;
        if (dist < min && dist > 0.01) {
            const push = (min - dist) / 2, nx = dx / dist, nz = dz / dist;
            if (a.isPlayer) { a.x -= nx * push * 2; a.z -= nz * push * 2; a.v *= 0.97; if (Math.abs(a.v - b.v) > 4) { bump(0.2); efx.sparksAt((a.x + b.x) / 2, 0.5, (a.z + b.z) / 2, -nx, -nz, 14); } }
            else if (b.isPlayer) { b.x += nx * push * 2; b.z += nz * push * 2; b.v *= 0.97; }
            else { a.v *= 0.995; }
        }
    }
}
function progressOf(r) { return r.lap * trackLen + samples[r.idx].d; }
function positionOf(r) {
    if (mode !== 'race') return 1;
    const all = [player, ...rivals].sort((a, b) => (a.finished ?? Infinity) - (b.finished ?? Infinity) || progressOf(b) - progressOf(a));
    return all.indexOf(r) + 1;
}
function updateCars(dt) {
    for (const r of [player, ...rivals]) {
        r.holder.position.set(r.x, 0, r.z);
        r.holder.rotation.y = r.heading;
        r.wheelSpin += r.v * dt / r.design.wheel;
        for (const w of r.model.wheels) {
            const { front, side } = w.userData;
            w.rotation.z = side > 0 ? -r.wheelSpin : r.wheelSpin;
            w.rotation.y = (side < 0 ? Math.PI : 0) + (front ? r.steer : 0);
        }
    }
}

// =====================================================================
//  LAPS, GHOST AND RESULTS
// =====================================================================
function onPlayerLap(lapTime) {
    // lapTime is null when crossing the line for the first time, which starts lap 1
    if (lapTime == null) { if (mode === 'trial') { race.recording = []; setupGhostFromStore(); } return; }
    race.lapTimes.push(lapTime);
    const key = 'raceBest_' + TRACK.id, best = store(key, null);
    let msg = `Lap ${fmtTime(lapTime)}`;
    if (best == null || lapTime < best) { storeSet(key, lapTime); msg += ' · New best lap!'; window.playSound && window.playSound('win'); }
    if (mode === 'trial') {
        const g = store('ghost_' + TRACK.id, null);
        if (!g || lapTime < g.time) storeSet('ghost_' + TRACK.id, { time: lapTime, frames: race.recording, design: player.design });
        race.recording = [];
        // replay the best ghost from the start of the next lap
        setupGhostFromStore();
    }
    flash(msg);
}
function setupGhostFromStore() {
    const g = store('ghost_' + TRACK.id, null); if (!g) return;
    if (!ghost) {
        ghost = makeRacer(g.design || loadDesign(), 1, false);
        ghost.model.group.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.35; o.material.depthWrite = false; } });
        scene.add(ghost.holder);
    }
    ghost.frames = g.frames; ghost.time = g.time; ghost.lapT0 = race.raceTime;
}
function updateGhost() {
    if (!ghost || !ghost.frames) return;
    if (ghost.lapT0 == null) { ghost.holder.visible = false; return; }
    const t = race.raceTime - ghost.lapT0, i = Math.floor(t / 0.05);
    if (i >= ghost.frames.length) { ghost.holder.visible = false; return; }
    const [x, z, h] = ghost.frames[i];
    ghost.holder.visible = true; ghost.holder.position.set(x, 0, z); ghost.holder.rotation.y = h;
}
function finishRace() {
    race.phase = 'done';
    clearTimeout(flashTimer); document.getElementById('race-flash').classList.remove('show');
    const pos = positionOf(player);
    const medal = ['🥇 Gold', '🥈 Silver', '🥉 Bronze'][pos - 1] || 'No medal this time';
    const medals = store('raceMedals', {}); const prev = medals[TRACK.id + '_' + difficulty];
    const before = medalPoints();
    if (pos <= 3 && (!prev || pos < prev)) { medals[TRACK.id + '_' + difficulty] = pos; storeSet('raceMedals', medals); }
    const after = medalPoints(), unlocked = UNLOCKS.filter(u => u.pts > before && u.pts <= after);
    const next = UNLOCKS.find(u => u.pts > after);
    window.playSound && window.playSound(pos === 1 ? 'win' : 'lose');
    const el = document.getElementById('race-result');
    el.innerHTML = `<div class="rr-box"><span class="kicker">${TRACK.name} · ${difficulty}</span>
        <h2>${pos === 1 ? 'You win!' : `You finished ${['1st', '2nd', '3rd', '4th'][pos - 1]}`}</h2>
        <p class="rr-medal">${medal}</p>
        <p>Race time <b>${fmtTime(player.finished)}</b> · Best lap <b>${fmtTime(player.best)}</b></p>
        ${after > before ? `<p class="rr-unlock">+${after - before} medal point${after - before > 1 ? 's' : ''} (${after} in total)</p>` : ''}
        ${unlocked.map(u => `<p class="rr-unlock">🔓 Unlocked in Build: <b>${u.label}</b></p>`).join('')}
        ${next ? `<p class="small">Next unlock at ${next.pts} points: ${next.label}</p>` : ''}
        <div class="rr-actions"><button class="big-btn" data-race="again">Race again</button><button class="act-btn ghost" data-race="menu">Menu</button></div></div>`;
    el.hidden = false;
}

// =====================================================================
//  CAMERA, HUD, MINIMAP, SOUND
// =====================================================================
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
function placeCamera(snap = false, dt = 0.016) {
    const r = player, fx = Math.cos(r.heading), fz = -Math.sin(r.heading);
    const city = TRACK.theme === 'city';
    const [back, up, ahead] = camMode === 0 ? (city ? [6.8, 4.2, 6] : [8.5, 3.4, 6]) : [5.2, 2.0, 8];
    const want = new THREE.Vector3(r.x - fx * back, up, r.z - fz * back);
    const look = new THREE.Vector3(r.x + fx * ahead, 0.9, r.z + fz * ahead);
    if (snap) { camPos.copy(want); camLook.copy(look); }
    else { const k = Math.min(1, dt * 6); camPos.lerp(want, k); camLook.lerp(look, Math.min(1, dt * 10)); }
    if (window.__aerial) { camPos.set(r.x + window.__aerial * 0.6, window.__aerial, r.z + window.__aerial * 0.6); camLook.set(r.x, 0, r.z); }   // testing only
    camera.position.copy(camPos);
    if (efx) { const [sx, sy] = efx.shakeOffset(r.v / r.perf.vmax, elapsed); camera.position.x += sx; camera.position.y += sy; }
    camera.lookAt(camLook);
    camera.fov = 60 + Math.min(14, Math.max(0, r.v - 30) * 0.25) + (r.slip ? 3 : 0); camera.updateProjectionMatrix();
}
let mapCtx = null, mapScale = 1, mapOff = [0, 0];
function drawMapBase() {
    const c = document.getElementById('race-map'); mapCtx = c.getContext('2d');
    const xs = samples.map(s => s.p.x), zs = samples.map(s => s.p.z);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minZ = Math.min(...zs), maxZ = Math.max(...zs);
    mapScale = Math.min((c.width - 20) / (maxX - minX), (c.height - 20) / (maxZ - minZ));
    mapOff = [10 - minX * mapScale + (c.width - 20 - (maxX - minX) * mapScale) / 2, 10 - minZ * mapScale + (c.height - 20 - (maxZ - minZ) * mapScale) / 2];
}
function drawMap() {
    const c = mapCtx.canvas, x = mapCtx;
    x.clearRect(0, 0, c.width, c.height);
    x.lineWidth = 6; x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineJoin = 'round'; x.beginPath();
    samples.forEach((s, i) => { const px = s.p.x * mapScale + mapOff[0], pz = s.p.z * mapScale + mapOff[1]; i ? x.lineTo(px, pz) : x.moveTo(px, pz); });
    x.closePath(); x.stroke();
    const dot = (r, col, size) => { x.fillStyle = col; x.beginPath(); x.arc(r.x * mapScale + mapOff[0], r.z * mapScale + mapOff[1], size, 0, Math.PI * 2); x.fill(); };
    rivals.forEach(r => dot(r, r.design.paint, 5));
    if (ghost && ghost.holder.visible) dot({ x: ghost.holder.position.x, z: ghost.holder.position.z }, 'rgba(0,229,255,.8)', 5);
    dot(player, '#fff', 7); dot(player, '#E10600', 5);
}
let lastHud = '';
function hud() {
    const units = window.getUnits ? window.getUnits() : 'mph';
    const spd = Math.abs(player.v) * (units === 'mph' ? 2.23694 : 3.6);
    const lapShown = Math.max(1, Math.min(TRACK.laps, player.lap + 1));
    const left = mode === 'race'
        ? `<div class="hud-pos"><b>P${positionOf(player)}</b><span>/${rivals.length + 1}</span></div><div class="hud-lap">LAP ${lapShown}/${TRACK.laps}</div>`
        : `<div class="hud-pos"><b>TIME</b></div><div class="hud-lap">TRIAL · LAP ${Math.max(1, player.lap + 1)}</div>`;
    const lapNow = race.phase === 'go' && player.lap >= 0 ? race.raceTime - player.lapStart : 0;
    const right = `<div class="hud-time">${fmtTime(lapNow)}</div><div class="hud-best">Best ${fmtTime(store('raceBest_' + TRACK.id, null))}</div>`;
    const html = `<div class="hud-left">${left}</div><div class="hud-right">${right}</div><div class="hud-speed"><b>${Math.round(spd)}</b><span>${units === 'mph' ? 'MPH' : 'KM/H'}</span></div>`;
    if (html !== lastHud) { document.getElementById('race-hud').innerHTML = html; lastHud = html; }
}
let flashTimer = null;
function flash(text, ms = 1800) {
    const el = document.getElementById('race-flash'); el.textContent = text; el.classList.add('show');
    clearTimeout(flashTimer); flashTimer = setTimeout(() => el.classList.remove('show'), ms);
}
let lastBump = 0;
function bump(vol) {
    const now = performance.now(); if (now - lastBump < 300) return; lastBump = now;
    const ctx = window.getAudio && window.getAudio(); if (!ctx || !soundOn) return;
    const len = Math.floor(ctx.sampleRate * 0.25), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(), g = ctx.createGain(); src.buffer = buf; g.gain.value = vol * 0.5;
    src.connect(g); g.connect(ctx.destination); src.start();
}
// engine: two oscillators whose pitch follows the speed through six imaginary gears
let engine = null, soundOn = store('raceSound', true);
function startEngine() {
    const ctx = window.getAudio && window.getAudio(); if (!ctx || engine || !soundOn) return;
    const ev = player.stats.engine.sound === 0;
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o1.type = ev ? 'sine' : 'sawtooth'; o2.type = ev ? 'triangle' : 'square';
    f.type = 'lowpass'; f.frequency.value = ev ? 3000 : 900; g.gain.value = 0.0;
    o1.connect(f); o2.connect(f); f.connect(g); g.connect(ctx.destination); o1.start(); o2.start();
    engine = { ctx, o1, o2, g, ev };
}
function updateEngine() {
    if (!engine) return;
    const v = Math.abs(player.v), vmax = player.perf.vmax;
    let f;
    if (engine.ev) f = 200 + v / vmax * 1600;
    else { const gearW = vmax / 6, inGear = (v % gearW) / gearW, gear = Math.min(5, Math.floor(v / gearW)); f = (player.stats.engine.sound || 90) * (0.55 + inGear * 1.1 + gear * 0.05); }
    const t = engine.ctx.currentTime;
    engine.o1.frequency.setTargetAtTime(f, t, 0.05); engine.o2.frequency.setTargetAtTime(f * 0.5, t, 0.05);
    engine.g.gain.setTargetAtTime(input.gas ? 0.07 : 0.035, t, 0.1);
}
function stopEngine() {
    if (!engine) return;
    try { engine.g.gain.setTargetAtTime(0, engine.ctx.currentTime, 0.05); engine.o1.stop(engine.ctx.currentTime + 0.3); engine.o2.stop(engine.ctx.currentTime + 0.3); } catch (e) { /* already stopped */ }
    engine = null;
}

// =====================================================================
//  MAIN LOOP
// =====================================================================
// smoke when sliding, dust on the grass, speed lines, headlights
function updateEffects(dt) {
    elapsed += dt; puffT += dt;
    const r = player, fwdX = Math.cos(r.heading), fwdZ = -Math.sin(r.heading), back = r.design.L * 0.32;
    if (puffT > 0.06 && race.phase !== 'lights') {
        puffT = 0;
        const kind = r.onGrass && r.v > 8 ? 'dust' : r.sliding && r.v > 12 ? 'smoke' : null;
        if (kind) for (const side of [-1, 1]) efx.puff(r.x - fwdX * back + fwdZ * side * 0.8, r.z - fwdZ * back - fwdX * side * 0.8, kind, r.v * fwdX, r.v * fwdZ);
    }
    efx.update(dt);
    efx.drawSpeedLines(r.v / r.perf.vmax, r.slip, dt);
    if (headlight && headlight.visible) {
        headlight.position.set(r.x + fwdX * 1.8, 1.0, r.z + fwdZ * 1.8);
        headlight.target.position.set(r.x + fwdX * 25, 0, r.z + fwdZ * 25); headlight.target.updateMatrixWorld();
        carGlow.position.set(r.x - fwdX * 2, 4.5, r.z - fwdZ * 2);
    }
    const tag = document.getElementById('race-slip'); if (tag) tag.classList.toggle('show', !!r.slip);
}
// keep the shadow area centred on the player, and the sky around the camera
function followSun() {
    const d = sun.userData.dir;
    sun.position.set(player.x + d.x * 200, d.y * 200, player.z + d.z * 200); sun.target.position.set(player.x, 0, player.z); sun.target.updateMatrixWorld();
    sky.position.copy(camera.position);
}
// 'auto' quality: if the frame rate stays low for a few seconds, step down a level
let fpsTime = 0, fpsFrames = 0;
function watchFrameRate(dt) {
    if (qualitySetting !== 'auto' || race.phase !== 'go') return;
    fpsTime += dt; fpsFrames++;
    if (fpsTime < 4) return;
    const fps = fpsFrames / fpsTime; fpsTime = 0; fpsFrames = 0;
    if (fps < 42 && quality !== 'low') { applyQuality(quality === 'high' ? 'medium' : 'low'); flash('Graphics set to ' + SC.QUALITY[quality].label + ' for smoother racing', 2200); }
}
function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - lastT) / 1000 || 0); lastT = now;
    if (!race || race.paused) { if (sky) sky.position.copy(camera.position); renderer.render(scene, camera); return; }
    race.t += dt;
    if (race.phase === 'lights') {
        const lit = Math.min(5, Math.floor(race.t / 0.8));
        world.lightMats.forEach((m, i) => { m.emissiveIntensity = i < lit ? 4 : 0; });
        if (race.t > 4.0 + (race.goDelay ??= 0.3 + Math.random() * 0.8)) {
            race.phase = 'go'; world.lightMats.forEach(m => { m.emissiveIntensity = 0; }); flash('GO!', 900);
            player.lapStart = race.raceTime; rivals.forEach(r => { r.lapStart = race.raceTime; });
        }
    }
    if (race.phase === 'go' || race.phase === 'done') race.raceTime += dt;
    // fixed small steps keep the driving stable
    const steps = Math.ceil(dt / 0.01), h = dt / steps;
    for (let i = 0; i < steps; i++) { drivePlayer(h); rivals.forEach(r => driveRival(r, h)); collisions(); }
    if (mode === 'trial' && race.phase === 'go') {
        race.recT = (race.recT || 0) + dt;
        while (race.recT >= 0.05) { race.recording.push([+player.x.toFixed(2), +player.z.toFixed(2), +player.heading.toFixed(3)]); race.recT -= 0.05; }
        updateGhost();
    }
    updateCars(dt); placeCamera(false, dt); updateEngine();
    followSun(); world.update(dt); watchFrameRate(dt);
    updateEffects(dt);
    hud(); drawMap();
    renderer.render(scene, camera);
}

// =====================================================================
//  CONTROLS (touch buttons with pointer events, keyboard, optional tilt)
// =====================================================================
function bindControls() {
    document.querySelectorAll('[data-pad]').forEach(btn => {
        const key = btn.dataset.pad;
        const on = e => { e.preventDefault(); btn.setPointerCapture && btn.setPointerCapture(e.pointerId); input[key] = true; btn.classList.add('down'); getAudioStart(); };
        const off = e => { e.preventDefault(); input[key] = false; btn.classList.remove('down'); };
        btn.addEventListener('pointerdown', on); btn.addEventListener('pointerup', off); btn.addEventListener('pointercancel', off); btn.addEventListener('lostpointercapture', off);
        btn.addEventListener('contextmenu', e => e.preventDefault());
    });
    const keys = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'gas', KeyW: 'gas', ArrowDown: 'brake', KeyS: 'brake', Space: 'brake' };
    window.addEventListener('keydown', e => { if (!isRacing()) return; if (keys[e.code]) { input[keys[e.code]] = true; e.preventDefault(); getAudioStart(); } if (e.code === 'KeyC') camMode = 1 - camMode; if (e.code === 'Escape') togglePause(); });
    window.addEventListener('keyup', e => { if (keys[e.code]) input[keys[e.code]] = false; });
    window.addEventListener('blur', () => { Object.keys(input).forEach(k => { if (k !== 'tilt') input[k] = false; }); });
}
function getAudioStart() { if (!engine) startEngine(); }
let tiltOn = false;
function tiltHandler(e) { if (e.gamma == null) return; const landscape = Math.abs(window.orientation || 0) === 90 || innerWidth > innerHeight; const raw = landscape ? e.beta * (window.orientation === -90 ? -1 : 1) : e.gamma; input.tilt = -Math.max(-1, Math.min(1, raw / 25)); }
async function toggleTilt() {
    if (!tiltOn) {
        try { if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) { const p = await DeviceOrientationEvent.requestPermission(); if (p !== 'granted') return; } } catch (e) { return; }
        window.addEventListener('deviceorientation', tiltHandler); tiltOn = true; flash('Tilt steering on');
    } else { window.removeEventListener('deviceorientation', tiltHandler); input.tilt = 0; tiltOn = false; flash('Tilt steering off'); }
    document.getElementById('race-tilt').classList.toggle('active', tiltOn);
}
const isRacing = () => !document.getElementById('race-stage').hidden;
function togglePause() {
    if (!race || race.phase === 'done') return;
    race.paused = !race.paused;
    document.getElementById('race-pause-panel').hidden = !race.paused;
    if (race.paused) stopEngine();
}

// =====================================================================
//  MENU AND SCREEN
// =====================================================================
function renderMenu() {
    const d = loadDesign(), s = carStats(d), units = window.getUnits ? window.getUnits() : 'mph';
    const medals = store('raceMedals', {}), best = store('raceBest_' + TRACK.id, null);
    const medalFor = (tid, k) => ({ 1: '🥇', 2: '🥈', 3: '🥉' }[medals[tid + '_' + k]] || '');
    const trackCard = t => {
        const got = Object.keys(DIFF).map(k => medalFor(t.id, k)).join('');
        return `<button class="track-card ${t === TRACK ? 'active' : ''}" data-track="${t.id}"><b>${t.name}</b><span>${t.laps} laps · ${t.theme === 'city' ? 'street circuit' : t.theme === 'forest' ? 'high speed' : 'flowing'}</span><span class="tc-medals">${got || '&nbsp;'}</span></button>`;
    };
    document.getElementById('race-menu').innerHTML = `
        <div class="race-menu-grid">
            <div class="panel">
                <span class="kicker">Your car</span><h2>${escapeHtml(d.name || 'My Supercar')}</h2>
                <p class="small">${escapeHtml((PRESETS[d.preset] || {}).label || 'Custom')} · ${ENGINES[d.engine].label} · ${s.bhp} bhp · ${units === 'mph' ? s.mph + ' mph' : Math.round(s.mph * 1.609) + ' km/h'} · 0–62 in ${s.z62.toFixed(1)} s</p>
                <button class="act-btn ghost" data-screen="build">Change it in Build</button>
                <p class="b-label" style="margin-top:18px">Medal points</p>
                <p class="small">${medalPoints()} points so far. Medals unlock new paint finishes, rims and wings in Build.</p>
            </div>
            <div class="panel">
                <span class="kicker">Choose a track</span>
                <div class="track-cards">${TRACKS.map(trackCard).join('')}</div>
                <h2 style="margin-top:12px">${TRACK.name}</h2>
                <p class="small">${TRACK.about} ${(trackLen / 1000).toFixed(1)} km · ${TRACK.laps} laps · Best lap ${fmtTime(best)}</p>
                <p class="b-label">Race against 3 rivals</p>
                <div class="opts">${Object.keys(DIFF).map(k => `<button class="opt ${k === difficulty ? 'active' : ''}" data-diff="${k}">${k[0].toUpperCase() + k.slice(1)} ${medalFor(TRACK.id, k)}</button>`).join('')}</div>
                <div class="rr-actions"><button class="big-btn" data-race="start-race">Start race</button><button class="act-btn" data-race="start-trial">Time trial (with ghost)</button></div>
            </div>
        </div>
        <div class="panel how"><h3>Time of day</h3><p>Race in daylight, at sunset, or at night with your headlights on.</p>
            <div class="opts">${Object.entries(SC.TIMES).map(([k, v]) => `<button class="opt ${k === timeOfDay ? 'active' : ''}" data-time="${k}">${v}</button>`).join('')}</div></div>
        <div class="panel how"><h3>Graphics</h3><p>Higher quality looks better; lower is smoother on older tablets. Auto starts at a sensible level and steps down if racing gets jerky.</p>
            <div class="opts">${['auto', 'low', 'medium', 'high'].map(k => `<button class="opt ${k === qualitySetting ? 'active' : ''}" data-quality="${k}">${k === 'auto' ? `Auto (${SC.QUALITY[quality].label})` : SC.QUALITY[k].label}</button>`).join('')}</div></div>
        <div class="panel how"><h3>How to drive</h3><p><b>Tablet and phone:</b> hold the arrow buttons on the left to steer, and the pedals on the right to go and brake. You can also turn on tilt steering. <b>Driving help</b> (on at the start) slows you down before tight corners and nudges you back onto the road. <b>Laptop:</b> arrow keys or W A S D, C changes the camera, Esc pauses.</p></div>`;
}
function onMenuClick(e) {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.diff) { difficulty = b.dataset.diff; renderMenu(); return; }
    if (b.dataset.track) { loadTrack(b.dataset.track); renderMenu(); return; }
    if (b.dataset.time) { timeOfDay = b.dataset.time; storeSet('raceTime', timeOfDay); setAtmosphere(TRACK.theme); renderMenu(); return; }
    if (b.dataset.quality) {
        qualitySetting = b.dataset.quality; storeSet('raceQuality', qualitySetting);
        applyQuality(qualitySetting === 'auto' ? SC.guessQuality() : qualitySetting); renderMenu(); return;
    }
    if (b.dataset.race === 'start-race' || b.dataset.race === 'start-trial') { mode = b.dataset.race === 'start-race' ? 'race' : 'trial'; showStage(); }
}
function showStage() {
    document.getElementById('race-menu').hidden = true;
    document.getElementById('race-stage').hidden = false;
    document.getElementById('race-result').hidden = true;
    document.getElementById('race-pause-panel').hidden = true;
    document.body.classList.add('racing');
    resize(); setupRace(); startEngine();
}
function showMenu() {
    stopEngine(); race = null;
    document.getElementById('race-stage').hidden = true;
    document.getElementById('race-menu').hidden = false;
    document.body.classList.remove('racing');
    renderMenu();
}
function resize() {
    if (!renderer) return;
    const el = document.getElementById('race-canvas-wrap'), w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// =====================================================================
//  CITY DETAILS: buildings with windows, street lamps, traffic lights, signs, zebra crossings
// =====================================================================
function canvasTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
// one window bay (4 m wide, 3.5 m tall) that repeats over every wall; the wall is white so each building's colour shows through
function windowTexture() {
    // two matching textures: the wall with windows, and a "glow" map where only the lit windows shine (used at night)
    const lit = Math.random() < 0.3;
    const draw = glow => (x, w, h) => {
        x.fillStyle = glow ? '#000' : '#ffffff'; x.fillRect(0, 0, w, h);
        if (!glow) { x.fillStyle = '#c8c8c8'; x.fillRect(0, h - 8, w, 8); }                 // floor line
        const g = x.createLinearGradient(0, 22, 0, 82);
        g.addColorStop(0, lit ? '#ffe7a3' : glow ? '#000' : '#3c5872'); g.addColorStop(1, lit ? '#f4c86a' : glow ? '#000' : '#1c2b3a');
        x.fillStyle = g; x.fillRect(22, 22, 84, 62);
        if (!glow) { x.fillStyle = '#e8e8e8'; x.fillRect(62, 22, 4, 62); }                   // window frame
    };
    const t = canvasTex(128, 112, draw(false)), e = canvasTex(128, 112, draw(true));
    t.wrapS = t.wrapT = e.wrapS = e.wrapT = THREE.RepeatWrapping;
    t.userData.glow = e;
    return t;
}
function buildCity(group, nearTrack) {
    const BAY_W = 4, BAY_H = 3.5, extras = [];
    const palette = [0x8a8f98, 0x6d7480, 0xb7aa96, 0x9c6b52, 0x5c6f82, 0xc9c4ba, 0x7d5b4a, 0xa49a8a].map(c => new THREE.Color(c));
    const pos = [], nor = [], uv = [], col = [], idx = [];
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), nm = new THREE.Matrix3();
    for (let i = 0; i < N; i += 14) for (const side of [1, -1]) {
        const s = samples[i], w = 14 + Math.random() * 12, dpt = 14 + Math.random() * 10, h = BAY_H * Math.round(4 + Math.random() * 10);
        const off = side * (HW + RUNOFF + 9 + dpt / 2), x = s.p.x + s.n.x * off, z = s.p.z + s.n.z * off;
        if (nearTrack(x, z) < HW + RUNOFF + 8 + dpt / 2) continue;
        const box = new THREE.BoxGeometry(w, h, dpt);
        m.compose(new THREE.Vector3(x, h / 2, z), q.setFromAxisAngle(up, s.heading), new THREE.Vector3(1, 1, 1)); nm.getNormalMatrix(m);
        const P = box.attributes.position, Nn = box.attributes.normal, U = box.attributes.uv, base = pos.length / 3, c = palette[Math.floor(Math.random() * palette.length)];
        for (let v = 0; v < P.count; v++) {
            const p = new THREE.Vector3().fromBufferAttribute(P, v).applyMatrix4(m), n = new THREE.Vector3().fromBufferAttribute(Nn, v).applyMatrix3(nm).normalize();
            pos.push(p.x, p.y, p.z); nor.push(n.x, n.y, n.z); col.push(c.r, c.g, c.b);
            const face = Math.floor(v / 4);           // BoxGeometry faces: +x, -x, +y, -y, +z, -z (4 points each)
            if (face === 2 || face === 3) uv.push(0.02, 0.02);                          // roof: plain wall colour
            else uv.push(U.getX(v) * (face < 2 ? dpt : w) / BAY_W, U.getY(v) * h / BAY_H);
        }
        box.index.array.forEach(k => idx.push(base + k));
        box.dispose();
        extras.push({ x, z, w, dpt, h, heading: s.heading, side, c });
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx);
    const wt = windowTexture();
    group.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: wt, vertexColors: true, roughness: 0.75, emissive: 0xffd890, emissiveMap: wt.userData.glow, emissiveIntensity: 0.05 })));

    // building details: a shop awning facing the street, a ledge round the roof, rooftop units, and some stepped towers
    const unit = new THREE.BoxGeometry(1, 1, 1), n = extras.length;
    const awnings = new THREE.InstancedMesh(unit, new THREE.MeshStandardMaterial({ roughness: 0.8 }), n);
    const ledges = new THREE.InstancedMesh(unit, new THREE.MeshStandardMaterial({ color: 0xd8d4cc, roughness: 0.9 }), n);
    const acs = new THREE.InstancedMesh(unit, new THREE.MeshStandardMaterial({ color: 0x9aa0a8, metalness: 0.4, roughness: 0.5 }), n * 3);
    const tt = windowTexture();
    const towers = new THREE.InstancedMesh(unit, new THREE.MeshStandardMaterial({ map: tt, roughness: 0.75, emissive: 0xffd890, emissiveMap: tt.userData.glow, emissiveIntensity: 0.05 }), n);
    const awningCols = [0xc0392b, 0x1e8449, 0x1f4e8c, 0xd68910, 0x6c3483, 0x117a65].map(c => new THREE.Color(c));
    const q2 = new THREE.Quaternion(), M = new THREE.Matrix4(), V = (x, y, z) => new THREE.Vector3(x, y, z);
    let na = 0, nt = 0;
    extras.forEach((b, i) => {
        q2.setFromAxisAngle(up, b.heading);
        const toRoad = V(0, 0, b.side > 0 ? -1 : 1).applyQuaternion(q2);   // the wall facing the street
        const across = V(1, 0, 0).applyQuaternion(q2);
        const front = (b.dpt / 2 + 0.9);
        awnings.setMatrixAt(i, M.compose(V(b.x + toRoad.x * front, 3.4, b.z + toRoad.z * front), q2, V(b.w * 0.85, 0.18, 1.8)));
        awnings.setColorAt(i, awningCols[i % awningCols.length]);
        ledges.setMatrixAt(i, M.compose(V(b.x, b.h + 0.3, b.z), q2, V(b.w + 0.6, 0.6, b.dpt + 0.6)));
        for (let k = 0; k < 3; k++) {
            const ox = (k - 1) * b.w * 0.25, oz = (k % 2 ? 1 : -1) * b.dpt * 0.18;
            acs.setMatrixAt(na++, M.compose(V(b.x + across.x * ox - toRoad.x * oz, b.h + 1.2, b.z + across.z * ox - toRoad.z * oz), q2, V(2.2, 1.4, 1.6)));
        }
        if (i % 4 === 0) {   // a narrower tower on top
            const th = BAY_H * (3 + (i % 3) * 2);
            towers.setMatrixAt(nt, M.compose(V(b.x, b.h + th / 2, b.z), q2, V(b.w * 0.6, th, b.dpt * 0.6)));
            towers.setColorAt(nt++, b.c);
        }
    });
    acs.count = na; towers.count = nt;
    // windows on the towers: scale the repeating texture to the tower's size (approximate: one repeat per 4 m by 3.5 m)
    towers.material.map.repeat.set(4, 6); tt.userData.glow.repeat.set(4, 6);
    [awnings, ledges, acs, towers].forEach(o => { o.castShadow = true; o.receiveShadow = true; group.add(o); });

    // pavement props sit between the barrier and the buildings
    const kerbside = HW + RUNOFF + 2.5;
    const steel = new THREE.MeshStandardMaterial({ color: 0x3a3f48, metalness: 0.6, roughness: 0.4 });
    const place = (obj, d, side, back = 0) => {
        const p = pathAt(d, 0, 0), nx = Math.sin(p.heading), nz = Math.cos(p.heading);
        obj.position.set(p.x + nx * side * (kerbside + back), 0, p.z + nz * side * (kerbside + back));
        obj.rotation.y = p.heading + (side > 0 ? 0 : Math.PI);    // so "forward" (local -z) faces the road
        group.add(obj); return obj;
    };
    // corners: where the track turns most sharply
    const corners = [];
    for (let i = 0; i < N; i++) {
        const k = Math.abs(samples[i].ks); if (k < 0.012) continue;
        let peak = true; for (let j = -40; j <= 40 && peak; j++) if (Math.abs(samples[(i + j + N) % N].ks) > k) peak = false;
        if (peak && !corners.some(c => Math.abs(c - i) < 40 || Math.abs(c - i) > N - 40)) corners.push(i);
    }
    // the outside of a corner is the side away from where the curve bends
    const outsideSide = i => Math.sign(samples[i].ks) > 0 ? -1 : 1;
    const insideCheck = (d, side) => { const p = pathAt(d, 0, 0), nx = Math.sin(p.heading), nz = Math.cos(p.heading); return nearTrack(p.x + nx * side * (kerbside + 1), p.z + nz * side * (kerbside + 1)) > HW + RUNOFF + 0.5; };

    // street lamps every 32 m on both sides (instanced: pole, arm, lamp)
    const lampSpots = [];
    for (let d = 16; d < trackLen; d += 32) for (const side of [1, -1]) if (insideCheck(d, side)) lampSpots.push([d, side]);
    const poles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.16, 7, 8), steel, lampSpots.length);
    const arms = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.12, 2.2), steel, lampSpots.length);
    const heads = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.18, 0.9), new THREE.MeshStandardMaterial({ color: 0xfff3d0, emissive: 0xffe9b0, emissiveIntensity: 0.8 }), lampSpots.length);
    const tmp = new THREE.Object3D();
    lampSpots.forEach(([d, side], n) => {
        const holder = new THREE.Object3D(); place(holder, d, side); group.remove(holder); holder.updateMatrix();
        const set = (mesh, y, zOff) => { tmp.position.set(0, y, zOff); tmp.rotation.set(0, 0, 0); tmp.updateMatrix(); mesh.setMatrixAt(n, new THREE.Matrix4().multiplyMatrices(holder.matrix, tmp.matrix)); };
        set(poles, 3.5, 0); set(arms, 7, -1.0); set(heads, 6.85, -2.0);
    });
    group.add(poles, arms, heads);

    // traffic lights before each corner, on both sides
    const housing = new THREE.MeshStandardMaterial({ color: 0x15171b, roughness: 0.6 });
    const lampMat = { r: new THREE.MeshStandardMaterial({ color: 0x330000, emissive: 0xff2010, emissiveIntensity: 1.6 }),
                      a: new THREE.MeshStandardMaterial({ color: 0x221500, emissive: 0xff9a00, emissiveIntensity: 0.15 }),
                      g: new THREE.MeshStandardMaterial({ color: 0x002200, emissive: 0x20ff60, emissiveIntensity: 0.15 }) };
    corners.forEach((ci, n) => {
        for (const side of [1, -1]) {
            const d = samples[ci].d - 26; if (!insideCheck(d, side)) continue;
            const tl = new THREE.Group();
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 4.4, 8), steel); pole.position.y = 2.2; tl.add(pole);
            const box = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.0, 0.5), housing); box.position.y = 5.2; tl.add(box);
            // alternate colours so the street looks alive
            const on = ['r', 'g', 'a'][(n + (side > 0 ? 0 : 1)) % 3];
            [['r', 5.85], ['a', 5.2], ['g', 4.55]].forEach(([k, y]) => {
                const m2 = k === on ? lampMat[k] : new THREE.MeshStandardMaterial({ color: 0x222428 });
                const l = new THREE.Mesh(new THREE.CircleGeometry(0.24, 16), m2); l.position.set(0, y, -0.26); l.rotation.y = Math.PI; tl.add(l);
            });
            place(tl, d, side, -1.2);
            tl.rotation.y += Math.PI / 2 * side;           // face the oncoming cars
        }
    });
    // chevron boards on the outside of each corner
    const chevTex = canvasTex(256, 64, (x, w, h) => {
        x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.fillStyle = '#111111';
        for (let i = 0; i < 4; i++) { const cx = 30 + i * 62; x.beginPath(); x.moveTo(cx, 6); x.lineTo(cx + 24, 32); x.lineTo(cx, 58); x.lineTo(cx + 14, 58); x.lineTo(cx + 38, 32); x.lineTo(cx + 14, 6); x.fill(); }
    });
    corners.forEach(ci => {
        const side = outsideSide(ci);
        for (const dd of [-10, 0, 10]) {
            const d = samples[ci].d + dd; if (!insideCheck(d, side)) continue;
            const sign = new THREE.Group();
            const board = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshBasicMaterial({ map: chevTex, side: THREE.DoubleSide }));
            board.position.y = 1.9; if (Math.sign(samples[ci].ks) > 0) board.scale.x = -1; sign.add(board);
            for (const px of [-0.9, 0.9]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.9, 0.08), steel); p.position.set(px, 0.95, 0); sign.add(p); }
            place(sign, d, side, -2.4);
        }
    });
    // road signs on the straights: speed limit, keep left, street name
    const signTex = [
        canvasTex(128, 128, (x) => { x.fillStyle = '#fff'; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.lineWidth = 14; x.strokeStyle = '#d00'; x.beginPath(); x.arc(64, 64, 52, 0, 7); x.stroke(); x.fillStyle = '#111'; x.font = '900 58px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('30', 64, 68); }),
        canvasTex(128, 128, (x) => { x.fillStyle = '#1652b8'; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 12; x.beginPath(); x.moveTo(84, 36); x.lineTo(46, 84); x.stroke(); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(30, 96); x.lineTo(38, 68); x.lineTo(60, 88); x.fill(); }),
        canvasTex(256, 64, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.strokeStyle = '#111'; x.lineWidth = 6; x.strokeRect(3, 3, w - 6, h - 6); x.fillStyle = '#111'; x.font = '700 30px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('LEGENDS STREET', w / 2, h / 2 + 2); })
    ];
    let k = 0;
    for (let d = 60; d < trackLen; d += 95) {
        if (corners.some(ci => Math.abs(samples[ci].d - d) < 30)) continue;
        const side = k % 2 ? 1 : -1; if (!insideCheck(d, side)) continue;
        const kind = k++ % 3, sign = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8), steel); pole.position.y = 1.3; sign.add(pole);
        const face = kind === 2 ? new THREE.PlaneGeometry(2, 0.5) : new THREE.CircleGeometry(0.45, 24);
        const plate = new THREE.Mesh(face, new THREE.MeshBasicMaterial({ map: signTex[kind], side: THREE.DoubleSide })); plate.position.y = 2.75; sign.add(plate);
        place(sign, d, side, -0.6);
        sign.rotation.y += Math.PI / 2 * side;
    }
    // zebra crossings across two straights
    const zebra = canvasTex(256, 64, (x, w, h) => { x.fillStyle = '#34373d'; x.fillRect(0, 0, w, h); x.fillStyle = '#f2f2f2'; for (let i = 0; i < 8; i++) x.fillRect(8 + i * 32, 0, 18, h); });
    for (const frac of [0.3, 0.72]) {
        const d = trackLen * frac; if (corners.some(ci => Math.abs(samples[ci].d - d) < 25)) continue;
        const p = pathAt(d, 0, 0), z = new THREE.Mesh(new THREE.PlaneGeometry(TRACK.width, 3.2), new THREE.MeshStandardMaterial({ map: zebra, roughness: 0.9 }));
        z.rotation.x = -Math.PI / 2; z.rotation.z = p.heading + Math.PI / 2; z.position.set(p.x, 0.033, p.z); group.add(z);
    }
}

function loadTrack(id) {
    const t = TRACKS.find(x => x.id === id) || TRACKS[0];
    if (world && TRACK === t) return;
    if (world) { scene.remove(world.group); world.group.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); }); }
    TRACK = t; storeSet('raceTrack', t.id);
    buildSamples();
    world = buildTrack(scene);
    setAtmosphere(t.theme);
    drawMapBase();
}
// sky, haze, sun direction and reflections for a circuit's theme
function setAtmosphere(theme) {
    const th = look = SC.lookFor(theme, timeOfDay);
    if (sky) { scene.remove(sky); sky.geometry.dispose(); sky.material.dispose(); }
    sky = SC.makeSky(th); scene.add(sky);
    const haze = SC.horizonColour(th);
    scene.background = haze;
    scene.fog = new THREE.Fog(haze, th.fog[0], th.fog[1]);
    if (!SC.hasPhotoSky(th)) SC.whenSkyLoads(() => { if (TRACK && TRACK.theme === theme && look === th) setAtmosphere(theme); });
    if (scene.environment) scene.environment.dispose();
    scene.environment = SC.makeEnvironment(renderer, th);
    scene.environmentIntensity = th.light.env;
    sun.intensity = th.light.sun; sun.color.set(th.light.sunColor); hemi.intensity = th.light.hemi;
    SC.setTreeLight(th);
    renderer.toneMappingExposure = th.light.exposure;
    if (headlight) headlight.visible = carGlow.visible = timeOfDay === 'night';
    // glowing things (lamps, lit windows, tail lights) glow brighter in the dark
    world.group.traverse(o => { if (o.material) [].concat(o.material).forEach(m => {
        if (!m.emissive) return;
        if (m.userData.baseGlow === undefined) m.userData.baseGlow = m.emissiveIntensity;
        // lit windows only show at sunset and night; other lamps just glow brighter in the dark
        m.emissiveIntensity = m.emissiveMap ? th.glow * 1.4 : m.userData.baseGlow * (1 + th.glow * 2);
    }); });
    sun.userData.dir = new THREE.Vector3(...th.sun).normalize();
    camera.far = th.fog[1] + 900; camera.updateProjectionMatrix();
}
// apply a quality level: sharpness and shadows
function applyQuality(q) {
    quality = q; SC.setDetail(q !== 'low');
    const Q = SC.QUALITY[q];
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, Q.pixelRatio));
    const wantShadows = Q.shadows > 0;
    if (renderer.shadowMap.enabled !== wantShadows) { renderer.shadowMap.enabled = wantShadows; scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => { m.needsUpdate = true; }); }); }
    sun.castShadow = wantShadows;
    if (wantShadows) {
        if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
        sun.shadow.mapSize.set(Q.shadows, Q.shadows);
        const c = sun.shadow.camera; c.left = c.bottom = -Q.shadowSize; c.right = c.top = Q.shadowSize; c.near = 10; c.far = 400; c.updateProjectionMatrix();
    }
    [player, ...rivals].forEach(r => { if (r) r.blob.visible = !wantShadows; });
    resize();
}
function init() {
    const wrap = document.getElementById('race-canvas-wrap'), canvas = document.createElement('canvas');
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: (window.devicePixelRatio || 1) < 2 }); } catch (e) { return false; }
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    wrap.prepend(canvas);
    scene = new THREE.Scene();
    hemi = new THREE.HemisphereLight(0xcfe8ff, 0x4a5a3a, 0.7); scene.add(hemi);
    sun = new THREE.DirectionalLight(0xfff0d8, 2.8); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.04;
    scene.add(sun, sun.target);
    camera = new THREE.PerspectiveCamera(60, 1, 0.5, 2600);
    SC.setDetail(quality !== 'low');
    // the speed lines are drawn on a see-through layer over the 3D view
    const overlay = document.createElement('canvas'); overlay.className = 'race-fx';
    canvas.after(overlay);
    efx = new Effects(scene, overlay);
    // headlights for night races (one light that follows your car)
    headlight = new THREE.SpotLight(0xfff4e0, 60, 90, 0.45, 0.5, 1.4); headlight.visible = false;
    carGlow = new THREE.PointLight(0xc8d8ff, 18, 14, 1.6); carGlow.visible = false;   // like light from street lamps falling on your car
    scene.add(headlight, headlight.target, carGlow);
    loadTrack(store('raceTrack', 'coast'));
    applyQuality(quality);
    bindControls();
    new ResizeObserver(resize).observe(wrap);
    return true;
}
export function enter() {
    if (!started) {
        started = true;
        if (!init()) { document.getElementById('race-menu').innerHTML = `<div class="b-nogl" style="position:static"><h2>3D isn't available here</h2><p>This device or browser can't show 3D graphics, so racing can't open. Everything else in the app still works.</p></div>`; return; }
        document.getElementById('race-menu').addEventListener('click', onMenuClick);
        document.getElementById('race-stage').addEventListener('click', e => {
            const b = e.target.closest('button'); if (!b) return;
            if (b.dataset.race === 'again') showStage();
            if (b.dataset.race === 'menu') showMenu();
            if (b.dataset.race === 'pause') togglePause();
            if (b.dataset.race === 'resume') togglePause();
            if (b.id === 'race-tilt') toggleTilt();
            if (b.id === 'race-cam') camMode = 1 - camMode;
            if (b.id === 'race-help') { help = !help; storeSet('raceHelp', help); b.classList.toggle('active', help); flash(help ? 'Driving help on' : 'Driving help off'); }
            if (b.id === 'race-sound') { soundOn = !soundOn; storeSet('raceSound', soundOn); b.classList.toggle('active', soundOn); soundOn ? startEngine() : stopEngine(); }
        });
        document.getElementById('race-sound').classList.toggle('active', soundOn);
        document.getElementById('race-help').classList.toggle('active', help);
    }
    if (!renderer) return;
    if (document.getElementById('race-stage').hidden) renderMenu();
    if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(frame); }
}
export function leave() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    stopEngine();
    if (race && race.phase !== 'done') showMenu();
    document.body.classList.remove('racing');
}
// for testing: drive automatically along the racing line
export function autopilot(on) { window.__autopilot = on; }
export function debug() { return { mode, phase: race && race.phase, lap: player && player.lap, idx: player && player.idx, v: player && player.v, pos: player && positionOf(player), best: player && player.best, rivals: rivals.map(r => [r.lap, Math.round(r.v)]), rivalLat: rivals.map(r => [+r.lat.toFixed(2), +r.latV.toFixed(2)]), trackLen, ghost: !!(ghost && ghost.holder.visible), slip: player && player.slip, time: timeOfDay, quality, shadows: renderer.shadowMap.enabled, calls: renderer.info.render.calls, tris: renderer.info.render.triangles, grassPct: player ? Math.round(100 * (player.grassTime || 0) / (player.driveTime || 1)) : 0, raceTime: race && race.raceTime }; }
export function setHelp(on) { help = on; }
