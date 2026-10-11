// Supercar Legends: the car model shared by the builder and the race.
// Everything is made in code: no model files, no textures to download, so it works offline and stays small.
import * as THREE from './lib/three.module.min.js';

// =====================================================================
//  DESIGN SETTINGS
// =====================================================================
export const PRESETS = {
    gt60:     { label: '60s GT',          L: 4.45, W: 1.72, nose: 0.66, deck: 0.86, roof: 1.24, tail: 0.84, cabin: [0.50, 0.80], fast: 0.55, ride: 0.13, wheel: 0.33 },
    wedge70:  { label: '70s wedge',       L: 4.20, W: 1.92, nose: 0.40, deck: 0.80, roof: 1.07, tail: 0.98, cabin: [0.36, 0.66], fast: 0.25, ride: 0.11, wheel: 0.33 },
    super90:  { label: '90s supercar',    L: 4.40, W: 1.90, nose: 0.50, deck: 0.84, roof: 1.12, tail: 0.94, cabin: [0.33, 0.66], fast: 0.65, ride: 0.11, wheel: 0.34 },
    hyper:    { label: 'Modern hypercar', L: 4.65, W: 2.02, nose: 0.46, deck: 0.80, roof: 1.12, tail: 0.98, cabin: [0.30, 0.62], fast: 0.85, ride: 0.09, wheel: 0.36 },
    longtail: { label: 'Longtail',        L: 5.10, W: 1.98, nose: 0.46, deck: 0.82, roof: 1.10, tail: 0.92, cabin: [0.27, 0.55], fast: 0.9,  ride: 0.09, wheel: 0.36 },
    electric: { label: 'Electric',        L: 4.60, W: 1.98, nose: 0.56, deck: 0.86, roof: 1.18, tail: 0.94, cabin: [0.26, 0.74], fast: 0.7,  ride: 0.11, wheel: 0.36 }
};
export const PAINTS = ['#E10600', '#FFB300', '#C6FF00', '#00B8D9', '#1E3A8A', '#7E57C2', '#F4F6F8', '#9AA3AF', '#1B1F26', '#0B0C0F', '#FF6D00', '#00A86B'];
export const FINISHES = {
    gloss:    { label: 'Gloss',    metalness: 0.1,  roughness: 0.35, clearcoat: 1, iridescence: 0 },
    metallic: { label: 'Metallic', metalness: 0.75, roughness: 0.32, clearcoat: 1, iridescence: 0 },
    pearl:    { label: 'Pearl',    metalness: 0.35, roughness: 0.25, clearcoat: 1, iridescence: 0.8 },
    matte:    { label: 'Matte',    metalness: 0.2,  roughness: 0.85, clearcoat: 0, iridescence: 0 },
    chrome:   { label: 'Chrome',   metalness: 1,    roughness: 0.06, clearcoat: 1, iridescence: 0 }
};
export const RIMS = { five: '5-spoke', ten: '10-spoke', mesh: 'Mesh', turbine: 'Turbine', disc: 'Aero disc' };
export const RIM_COLOURS = { silver: '#C9CED6', black: '#16181C', gold: '#C9A227', bronze: '#8C5A2B', white: '#F4F6F8', chrome: 'chrome' };
export const WINGS = { none: 'None', ducktail: 'Ducktail', gt: 'GT wing', swan: 'Swan-neck' };
export const ENGINES = {
    v8:     { label: 'V8',        bhp: 620,  kg: 210, awd: false, note: 'Twin-turbo V8',               sound: 90 },
    v10:    { label: 'V10',       bhp: 640,  kg: 230, awd: false, note: 'High-revving V10',           sound: 120 },
    v12:    { label: 'V12',       bhp: 780,  kg: 270, awd: false, note: 'Naturally aspirated V12',    sound: 140 },
    hybrid: { label: 'Hybrid V8', bhp: 950,  kg: 350, awd: true,  note: 'V8 plus electric motors',     sound: 100 },
    ev:     { label: 'Electric',  bhp: 1400, kg: 620, awd: true,  note: 'Four electric motors',        sound: 0 }
};
export const DEFAULT = { preset: 'hyper', ...PRESETS.hyper, paint: '#E10600', finish: 'metallic', rim: 'five', rimColour: 'silver', caliper: '#FFB300',
    rimSize: 1, wing: 'gt', splitter: true, skirts: true, engine: 'v8', name: 'My Supercar' };
const STORE_KEY = 'builderDesign';
export function loadDesign() {
    try { const d = JSON.parse(localStorage.getItem(STORE_KEY)); if (d && d.L) return { ...DEFAULT, ...d }; } catch (e) { /* ignore */ }
    return { ...DEFAULT };
}
export function saveDesign(design) { try { localStorage.setItem(STORE_KEY, JSON.stringify(design)); } catch (e) { /* storage unavailable */ } }

// =====================================================================
//  SMOOTH CURVES (monotone cubic, so the body never bulges where it shouldn't)
// =====================================================================
function curve(points) {
    const xs = points.map(p => p[0]), ys = points.map(p => p[1]), n = xs.length;
    const d = [], m = [];
    for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
        if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
        const a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b;
        if (h > 9) { const t = 3 / Math.sqrt(h); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
    }
    return x => {
        if (x <= xs[0]) return ys[0];
        if (x >= xs[n - 1]) return ys[n - 1];
        let i = 0; while (x > xs[i + 1]) i++;
        const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t;
        return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
    };
}
export const lerp = (a, b, t) => a + (b - a) * t;
const spow = (v, p) => Math.sign(v) * Math.pow(Math.abs(v), p);

// =====================================================================
//  THE BODY (lofted cross-sections along the car, s = 0 at the nose, 1 at the tail)
// =====================================================================
function profiles(p) {
    const [c0, c1] = p.cabin;
    const W2 = p.W / 2, wheelR = p.wheel;
    const wb = p.L * 0.6;                                     // wheelbase
    const frontAxle = 0.5 - wb / 2 / p.L, rearAxle = 0.5 + wb / 2 / p.L;
    // centre line of the body: bonnet, scuttle, rear deck
    const centre = curve([[0, p.nose * 0.78], [0.025, p.nose], [0.14, lerp(p.nose, p.deck, 0.45)], [c0, p.deck * 0.98], [c1, p.deck], [0.94, p.tail], [1, p.tail * 0.93]]);
    const width = curve([[0, W2 * 0.72], [0.05, W2 * 0.9], [frontAxle, W2 * 0.99], [0.45, W2 * 0.95], [rearAxle, W2], [0.95, W2 * 0.96], [1, W2 * 0.88]]);
    const archR = wheelR + 0.055;
    // how high the wheel arch reaches at this point (0 if not over a wheel)
    const arch = s => {
        let y = 0; const x = s * p.L;
        for (const ax of [frontAxle, rearAxle]) {
            const dx = Math.abs(x - ax * p.L);
            if (dx < archR) y = Math.max(y, wheelR + Math.sqrt(archR * archR - dx * dx));
        }
        return y;
    };
    // the wings rise over the wheels, smoothly, so the bonnet sits between them
    const fender = s => {
        let y = 0; const x = s * p.L, reach = archR * 2.5;
        for (const ax of [frontAxle, rearAxle]) {
            const dx = Math.abs(x - ax * p.L);
            if (dx < reach) { const t = 0.5 + 0.5 * Math.cos(Math.PI * dx / reach); y = Math.max(y, lerp(centre(s) + 0.03, wheelR + archR + 0.06, t)); }
        }
        return y;
    };
    const base = s => p.ride + (s < 0.07 ? (0.07 - s) * 2.4 : 0) + (s > 0.9 ? (s - 0.9) * 2.2 : 0);
    // the greenhouse (cabin): windscreen rises fast, the roof is flat, then it falls to the tail
    const rakeEnd = c0 + (c1 - c0) * 0.34, roofEnd = c0 + (c1 - c0) * lerp(0.62, 0.42, p.fast);
    const roof = curve([[c0, p.deck * 0.98], [lerp(c0, rakeEnd, 0.5), lerp(p.deck, p.roof, 0.74)], [rakeEnd, p.roof], [roofEnd, p.roof * 0.995], [c1, p.deck]]);
    const shoulder = s => Math.max(centre(s) + 0.03, fender(s));
    // the height of the body surface across the car (u = -1 left side … 1 right side)
    const topAt = (s, u) => { const c = centre(s); return c + (shoulder(s) - c) * Math.pow(Math.abs(u), 3.2); };
    const bottomAt = (s, u) => { const b0 = base(s), a = arch(s), t = Math.min(1, Math.max(0, (Math.abs(u) - 0.5) / 0.16)); return b0 + Math.max(0, a - b0) * t * t * (3 - 2 * t); };
    return { centre, width, arch, base, roof, topAt, bottomAt, top: centre, c0, c1, frontAxle, rearAxle, wheelR };
}

// Build a closed tube from rings of points, with caps at both ends
function loft(rings, closedEnds = true) {
    const K = rings[0].length, pos = [], idx = [];
    rings.forEach(r => r.forEach(v => pos.push(v.x, v.y, v.z)));
    for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < K; k++) {
        const a = i * K + k, b = i * K + (k + 1) % K, c = (i + 1) * K + k, d = (i + 1) * K + (k + 1) % K;
        idx.push(a, c, b, b, c, d);
    }
    if (closedEnds) for (const [ri, flip] of [[0, true], [rings.length - 1, false]]) {
        const centre = rings[ri].reduce((acc, v) => acc.add(v), new THREE.Vector3()).multiplyScalar(1 / K);
        const ci = pos.length / 3; pos.push(centre.x, centre.y, centre.z);
        for (let k = 0; k < K; k++) { const a = ri * K + k, b = ri * K + (k + 1) % K; flip ? idx.push(ci, a, b) : idx.push(ci, b, a); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
}
function bodyGeometry(p, pr) {
    const N = 90, K = 56, rings = [];
    for (let i = 0; i <= N; i++) {
        const s = i / N, x = p.L / 2 - s * p.L, w = pr.width(s), ring = [];
        for (let k = 0; k < K; k++) {
            const a = (k / K) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
            const u = spow(c, 0.38), v = spow(sn, 0.5);       // a rounded square
            const yt = pr.topAt(s, u), yb = Math.min(yt - 0.03, pr.bottomAt(s, u)), mid = (yt + yb) / 2;
            const y = v >= 0 ? lerp(mid, yt, v) : lerp(mid, yb, -v);
            ring.push(new THREE.Vector3(x, y, u * w * (1 - Math.max(0, v) * 0.06)));
        }
        rings.push(ring);
    }
    return loft(rings);
}
function cabinGeometry(p, pr) {
    const N = 40, K = 28, rings = [];
    for (let i = 0; i <= N; i++) {
        const s = lerp(pr.c0, pr.c1, i / N), x = p.L / 2 - s * p.L;
        const yb = pr.centre(s) - 0.05, yt = Math.max(yb + 0.02, pr.roof(s));
        const wb = pr.width(s) * 0.82, wt = pr.width(s) * 0.58, ring = [];
        for (let k = 0; k < K; k++) {
            const a = (k / K) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
            const t = (sn + 1) / 2;                          // 0 at the bottom of the ring, 1 at the top
            const y = lerp(yb, yt, Math.pow(t, 0.8));
            ring.push(new THREE.Vector3(x, y, spow(c, 0.5) * lerp(wb, wt, t)));
        }
        rings.push(ring);
    }
    return loft(rings);
}

// =====================================================================
//  WHEELS
// =====================================================================
function makeWheel(p, mats, front) {
    const g = new THREE.Group();
    const R = p.wheel, tw = front ? 0.27 : 0.32, rimR = R * 0.72;
    // tyre: a rounded profile spun around the axle
    const prof = [];
    for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + Math.PI * i / 12; prof.push(new THREE.Vector2(rimR + (R - rimR) * (0.55 + 0.45 * Math.cos(a)), (tw / 2) * Math.sin(a))); }
    const tyre = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), mats.tyre);
    tyre.rotation.x = Math.PI / 2; g.add(tyre);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(rimR, rimR, tw * 0.9, 28, 1, true), mats.rim);
    barrel.rotation.x = Math.PI / 2; g.add(barrel);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(rimR * 0.78, rimR * 0.78, 0.03, 24), mats.brake);
    disc.rotation.x = Math.PI / 2; disc.position.z = 0.02; g.add(disc);
    const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.08), mats.caliper);
    caliper.position.set(-rimR * 0.45, rimR * 0.5, 0.04); g.add(caliper);
    const face = new THREE.Group(); face.position.z = tw * 0.42; g.add(face);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(rimR * 0.18, rimR * 0.2, 0.05, 16), mats.rim);
    hub.rotation.x = Math.PI / 2; face.add(hub);
    const spoke = (n, w, twist = 0, depth = 0.035) => {
        for (let i = 0; i < n; i++) {
            const s = new THREE.Mesh(new THREE.BoxGeometry(w, rimR * 0.85, depth), mats.rim);
            s.geometry.translate(0, rimR * 0.5, 0);
            s.rotation.z = (i / n) * Math.PI * 2; s.rotation.y = twist; face.add(s);
        }
    };
    if (p.rim === 'five') spoke(5, rimR * 0.22);
    if (p.rim === 'ten') spoke(10, rimR * 0.09);
    if (p.rim === 'mesh') { spoke(14, rimR * 0.05); const m = new THREE.Group(); face.add(m); spoke(14, rimR * 0.05, 0.5); }
    if (p.rim === 'turbine') spoke(12, rimR * 0.16, 0.6, 0.02);
    if (p.rim === 'disc') {
        const d = new THREE.Mesh(new THREE.CylinderGeometry(rimR * 0.98, rimR * 0.98, 0.03, 32), mats.rim);
        d.rotation.x = Math.PI / 2; face.add(d);
        for (let i = 0; i < 6; i++) { const h = new THREE.Mesh(new THREE.CylinderGeometry(rimR * 0.1, rimR * 0.1, 0.035, 12), mats.dark); h.rotation.x = Math.PI / 2; h.position.set(Math.cos(i * 1.047) * rimR * 0.62, Math.sin(i * 1.047) * rimR * 0.62, 0.005); face.add(h); }
    }
    return g;
}

// =====================================================================
//  MATERIALS AND THE WHOLE CAR
// =====================================================================
function paintMaterial(design) {
    const f = FINISHES[design.finish];
    return new THREE.MeshPhysicalMaterial({ color: design.paint, metalness: f.metalness, roughness: f.roughness, clearcoat: f.clearcoat, clearcoatRoughness: 0.08,
        iridescence: f.iridescence, iridescenceIOR: 1.6, side: THREE.DoubleSide });
}
function buildMaterials(design) {
    const rc = RIM_COLOURS[design.rimColour];
    return {
        paint: paintMaterial(design),
        glass: new THREE.MeshPhysicalMaterial({ color: 0x0a0d12, metalness: 0.3, roughness: 0.06, clearcoat: 1, side: THREE.DoubleSide }),
        carbon: new THREE.MeshStandardMaterial({ color: 0x15171b, metalness: 0.4, roughness: 0.45 }),
        tyre: new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.9, side: THREE.DoubleSide }),
        rim: rc === 'chrome' ? new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.05 })
                             : new THREE.MeshStandardMaterial({ color: rc, metalness: 0.8, roughness: 0.3, side: THREE.DoubleSide }),
        brake: new THREE.MeshStandardMaterial({ color: 0x5a5f68, metalness: 0.9, roughness: 0.4 }),
        caliper: new THREE.MeshStandardMaterial({ color: design.caliper, roughness: 0.4 }),
        dark: new THREE.MeshStandardMaterial({ color: 0x0b0c0f, roughness: 0.6 }),
        head: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xdfeaff, emissiveIntensity: 1.2 }),
        tail: new THREE.MeshStandardMaterial({ color: 0x550000, emissive: 0xff1a10, emissiveIntensity: 1.4 })
    };
}
// Build a whole car as a group. Returns { group, mats, wheels, dispose }. The car points along +x and sits on y = 0.
export function createCar(design) {
    const mats = buildMaterials(design), wheels = [];
    const p = design, pr = profiles(p);
    const car = new THREE.Group();
    const body = new THREE.Mesh(bodyGeometry(p, pr), mats.paint); car.add(body);
    car.add(new THREE.Mesh(cabinGeometry(p, pr), mats.glass));
    const X = s => p.L / 2 - s * p.L;
    // wheels
    for (const [s, front] of [[pr.frontAxle, true], [pr.rearAxle, false]]) for (const side of [1, -1]) {
        const w = makeWheel(p, mats, front);
        w.position.set(X(s), p.wheel, side * (p.W / 2 - (front ? 0.16 : 0.15)));
        if (side < 0) w.rotation.y = Math.PI;
        w.userData = { front, side };
        car.add(w); wheels.push(w);
    }
    // lights
    for (const side of [1, -1]) {
        const h = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.36), mats.head);
        h.position.set(X(0.045), pr.topAt(0.045, 0.62) - 0.02, side * pr.width(0.045) * 0.62); h.rotation.z = -0.3; car.add(h);
    }
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, pr.width(0.99) * 1.7), mats.tail);
    tl.position.set(X(0.995) - 0.01, lerp(pr.base(0.99), pr.centre(0.99), 0.72), 0); car.add(tl);
    // aero
    if (p.splitter) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.025, p.W * 0.86), mats.carbon); sp.position.set(X(0.02), p.ride + 0.06, 0); car.add(sp); }
    if (p.skirts) for (const side of [1, -1]) {
        const sk = new THREE.Mesh(new THREE.BoxGeometry(p.L * 0.3, 0.06, 0.05), mats.carbon);
        sk.position.set(X(0.5), p.ride + 0.04, side * (pr.width(0.5) + 0.0)); car.add(sk);
    }
    if (p.wing === 'ducktail') {
        const d = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.07, pr.width(0.95) * 1.9), mats.paint);
        d.position.set(X(0.95), pr.centre(0.95) + 0.03, 0); d.rotation.z = -0.25; car.add(d);
    }
    if (p.wing === 'gt' || p.wing === 'swan') {
        const span = p.W * 0.9, h = p.wing === 'swan' ? 0.38 : 0.3, sx = X(0.94);
        const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.quadraticCurveTo(0.12, 0.07, 0.36, 0.02); shape.quadraticCurveTo(0.14, -0.015, 0, 0);
        const wingGeo = new THREE.ExtrudeGeometry(shape, { depth: span, bevelEnabled: false });
        wingGeo.translate(-0.18, 0, -span / 2);
        const wing = new THREE.Mesh(wingGeo, mats.carbon); wing.position.set(sx, pr.centre(0.94) + h, 0); wing.rotation.z = 0.12; car.add(wing);
        for (const side of [1, -1]) {
            const plate = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.015), mats.carbon); plate.position.set(sx, pr.centre(0.94) + h, side * span / 2); car.add(plate);
            const strut = new THREE.Mesh(new THREE.BoxGeometry(0.1, h + (p.wing === 'swan' ? 0.12 : 0), 0.025), mats.carbon);
            if (p.wing === 'swan') { strut.position.set(sx - 0.05, pr.centre(0.94) + h / 2 + 0.05, side * span * 0.28); strut.rotation.z = 0.35; }
            else strut.position.set(sx, pr.centre(0.94) + h / 2, side * span * 0.3);
            car.add(strut);
        }
    }
    const dispose = () => { car.traverse(o => { if (o.geometry) o.geometry.dispose(); }); Object.values(mats).forEach(m => m.dispose()); };
    return { group: car, mats, wheels, dispose };
}
// =====================================================================
//  STATS (simple and fair, so every style is good at something)
// =====================================================================
export function carStats(design) {
    const e = ENGINES[design.engine];
    const aeroWing = { none: 0, ducktail: 0.25, gt: 0.8, swan: 1 }[design.wing] + (design.splitter ? 0.25 : 0) + (design.skirts ? 0.1 : 0);
    const kg = Math.round(600 + 85 * design.L * design.W + e.kg + (design.wing !== 'none' ? 12 : 0));
    const cd = 0.27 + (design.roof - 1.0) * 0.35 + aeroWing * 0.05 + (design.preset === 'wedge70' ? 0.02 : 0) - (design.preset === 'longtail' ? 0.03 : 0);
    const area = design.W * design.roof * 0.82;
    const v = Math.cbrt((2 * e.bhp * 745.7 * 0.82) / (1.225 * cd * area));
    const mph = Math.round(Math.min(310, v / 0.44704));
    const z62 = Math.max(1.8, 0.6 + 1.05 * (kg / e.bhp) - (e.awd ? 0.4 : 0));
    const handling = Math.round(Math.min(100, 40 + aeroWing * 22 + (design.W - 1.7) * 60 - (kg - 1300) / 25 + (0.14 - design.ride) * 120));
    const braking = Math.round(Math.min(100, 50 + aeroWing * 15 - (kg - 1300) / 20 + (design.wheel - 0.33) * 300));
    return { bhp: e.bhp, mph, z62: Math.round(z62 * 10) / 10, kg, handling: Math.max(10, handling), braking: Math.max(10, braking), engine: e };
}

