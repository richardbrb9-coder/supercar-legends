// Supercar Legends: the car model shared by the builder and the race.
// Everything is made in code: no model files, no textures to download, so it works offline and stays small.
import * as THREE from './lib/three.module.min.js';
import { flakeTexture } from './reflections.js';

// =====================================================================
//  DESIGN SETTINGS
// =====================================================================
export const PRESETS = {
    // Inspired by the classic 1960s British grand tourer: long bonnet, rounded body, framed windows, chrome trim, wire wheels
    // (proportions measured from a side photo: windscreen at 41°, roof crown just behind it, then a long gentle fastback to the tail)
    gt60:     { label: '60s GT',          L: 4.57, W: 1.70, nose: 0.70, deck: 0.94, roof: 1.34, tail: 0.86, cabin: [0.345, 0.87], fast: 0, ride: 0.15, wheel: 0.34,
                rake: 0.17, screenBow: 0.55, roofDrop: 0.955, bulge: 0.025,
                cross: 'triple', crossB: 0.045, crossW: 0.085, noseW: 0.84, noseTip: 0.93, noseLift: 0.9, wbFrac: 0.555, axleShift: -0.06, round: 0.5, fenderH: 0.1, fenderReach: 3.2, cabinStyle: 'glasshouse', cabinWB: 0.9, cabinWT: 0.74,
                grille: 'shield', lamps: 'round', bumpers: true, scoop: 'bonnet', exhaust: 'twin',
                style: { wing: 'none', splitter: false, skirts: false, rim: 'wire', rimColour: 'chrome' } },
    // Inspired by the 1970s Italian rally wedge: very short and wide, sharp nose with bonnet louvres, wraparound visor windscreen,
    // bulging arches, roof spoiler bar, tall flat tail with big round lamps, bronze wheels
    // (shape measured from scaled side and top drawings: a straight wedge nose, a long wraparound windscreen, a short flat
    //  roof that ends sharply, then the engine cover sloping down to a low chopped tail)
    wedge70:  { label: '70s wedge',       L: 3.71, W: 1.75, nose: 0.42, deck: 0.80, roof: 1.11, tail: 0.86, cabin: [0.27, 0.72], fast: 0, ride: 0.12, wheel: 0.33,
                rake: 0.5, screenBow: 0.62, roofLen: 0.86, deckRear: 1.11,
                noseW: 0.62, noseW2: 0.82, noseTip: 0.4, noseLift: 3.0, wbFrac: 0.588, axleShift: 0.045, round: 0.27, fenderH: 0.03, fenderReach: 2.2,
                cabinStyle: 'visor', cabinWB: 0.84, cabinWT: 0.66, grille: 'none', lamps: 'hidden', bumpers: false, scoop: 'louvres', exhaust: 'twin',
                roofBar: true, tailBig: true,
                style: { wing: 'none', splitter: false, skirts: false, rim: 'five', rimColour: 'bronze', rallyLights: true } },
    // Inspired by the famous early-1990s British supercar: compact and smooth, cab-forward with a roof intake, lamps under covers,
    // a low nose intake, big side air intakes, a full-width mesh grille at the back and no fixed wing
    // (shape measured from scaled side, top and front drawings: low rounded nose, long raked windscreen, narrow central cabin,
    //  one long slope from the roof to a low flat tail)
    super90:  { label: '90s supercar',    L: 4.29, W: 1.82, nose: 0.40, deck: 0.79, roof: 1.12, tail: 0.88, cabin: [0.26, 0.9], fast: 0, ride: 0.12, wheel: 0.335,
                rake: 0.34, screenBow: 0.6, roofDrop: 0.975, deckRear: 1.12,
                noseW: 0.42, noseW2: 0.76, noseTip: 0.9, noseLift: 2.4, wbFrac: 0.634, axleShift: 0.005, round: 0.38, fenderH: 0.0, fenderReach: 1.8,
                cabinStyle: 'tallglass', cabinWB: 0.66, cabinWT: 0.48, grille: 'none', lamps: 'pods', bumpers: false, scoop: 'snorkel', exhaust: 'none',
                mouth: true, sideIntake: true, rearGrille: true,
                style: { wing: 'none', splitter: false, skirts: false, rim: 'five', rimColour: 'silver' } },
    // Inspired by the Italian carbon-fibre hypercars of around 2000: low pointed nose with a raised triangle on the bonnet, twin round
    // lamps set into the tops of the front wings, a narrow waist between big wheel arches, glass bubble canopy, roof scoop, quad exhaust
    // (shape measured from scaled side, top and front drawings)
    hyper:    { label: 'Modern hypercar', L: 4.44, W: 2.06, nose: 0.34, deck: 0.82, roof: 1.14, tail: 0.84, cabin: [0.27, 0.68], fast: 0, ride: 0.10, wheel: 0.36,
                rake: 0.42, screenBow: 0.6, roofLen: 0.6, roofDrop: 0.97, deckRear: 1.13, waist: 0.845, noseTip: 0.8, noseW: 0.42, noseW2: 0.86,
                cross: 'vee', crossB: 0, crossW: 0.03,
                wbFrac: 0.615, axleShift: 0.04, round: 0.42, fenderH: 0.08, fenderReach: 2.3, cabinStyle: 'bubble', cabinWB: 0.74, cabinWT: 0.46,
                grille: 'none', lamps: 'twin', bumpers: false, scoop: 'roof', exhaust: 'quad',
                style: { wing: 'none', splitter: true, skirts: true, rim: 'ten', rimColour: 'silver' } },
    // Inspired by the 2020s British streamliner: a teardrop with a very long tail tapering to a narrow tip, a long glass canopy,
    // covers over the front wheels, slim lamps and a light bar at the tip of the tail
    // (shape measured from a side photo and the official sizes: a long low nose, a teardrop canopy peaking just behind
    //  the middle, then one long gentle slope down to the narrow tail)
    longtail: { label: 'Longtail',        L: 5.14, W: 2.03, nose: 0.60, deck: 0.84, roof: 1.18, tail: 0.67, cabin: [0.22, 0.86], fast: 0, ride: 0.1, wheel: 0.35,
                rake: 0.3, screenBow: 0.6, roofLen: 0.47, roofDrop: 0.965, deckRear: 0.97,
                noseW: 0.5, noseW2: 0.7, noseTip: 0.62, noseLift: 2.6, wbFrac: 0.531, axleShift: -0.04, round: 0.4, fenderH: 0.1, fenderReach: 2.4,
                tailMid: 0.45, tailW: 0.24, cabinStyle: 'canopy', cabinWB: 0.78, cabinWT: 0.5, grille: 'none', lamps: 'slim', bumpers: false, scoop: 'none', exhaust: 'none',
                tailBar: true, wheelCovers: true,
                style: { wing: 'none', splitter: false, skirts: false, rim: 'ten', rimColour: 'silver' } },
    // Inspired by the 2020s Croatian electric hypercar: wide and muscular, long bonnet with a big vent, slim swept LED lamps, big corner
    // intakes, dark glass roof, large side scoops, a full-width light bar, ducktail and deep diffuser, and no exhausts
    // (shape measured from scaled side, top and front drawings: bonnet swell and dip, long gently raked windscreen, high roof,
    //  long fastback down to a low tail)
    electric: { label: 'Electric',        L: 4.75, W: 1.99, nose: 0.51, deck: 0.81, roof: 1.21, tail: 0.86, cabin: [0.29, 0.92], fast: 0, ride: 0.11, wheel: 0.36,
                rake: 0.37, screenBow: 0.6, roofDrop: 0.965, bulge: 0.025, deckRear: 1.11,
                noseW: 0.55, noseW2: 0.84, noseTip: 0.8, noseLift: 2.4, wbFrac: 0.578, axleShift: 0.01, round: 0.36, fenderH: 0.05, fenderReach: 2.4,
                cabinStyle: 'tallglass', cabinWB: 0.68, cabinWT: 0.62, grille: 'none', lamps: 'blade', bumpers: false, scoop: 'bonnetvent', exhaust: 'none',
                mouth: false, sideIntake: true, rearGrille: true, cornerIntakes: true, tailBar: true, diffuser: true,
                style: { wing: 'ducktail', splitter: true, skirts: true, rim: 'turbine', rimColour: 'black' } }
};
export const PAINTS = ['#E10600', '#FFB300', '#C6FF00', '#00B8D9', '#1E3A8A', '#7E57C2', '#F4F6F8', '#9AA3AF', '#1B1F26', '#0B0C0F', '#FF6D00', '#00A86B'];
export const FINISHES = {
    gloss:    { label: 'Gloss',    metalness: 0.1,  roughness: 0.35, clearcoat: 1, iridescence: 0 },
    metallic: { label: 'Metallic', metalness: 0.75, roughness: 0.32, clearcoat: 1, iridescence: 0 },
    pearl:    { label: 'Pearl',    metalness: 0.35, roughness: 0.25, clearcoat: 1, iridescence: 0.8 },
    matte:    { label: 'Matte',    metalness: 0.2,  roughness: 0.85, clearcoat: 0, iridescence: 0 },
    chrome:   { label: 'Chrome',   metalness: 1,    roughness: 0.06, clearcoat: 1, iridescence: 0 }
};
export const RIMS = { five: '5-spoke', ten: '10-spoke', mesh: 'Mesh', wire: 'Wire', turbine: 'Turbine', disc: 'Aero disc' };
export const RIM_COLOURS = { silver: '#C9CED6', black: '#16181C', gold: '#C9A227', bronze: '#8C5A2B', white: '#F4F6F8', chrome: 'chrome' };
export const WINGS = { none: 'None', ducktail: 'Ducktail', gt: 'GT wing', swan: 'Swan-neck' };
export const ENGINES = {
    v8:     { label: 'V8',        bhp: 620,  kg: 210, awd: false, note: 'Twin-turbo V8',               sound: 90 },
    v10:    { label: 'V10',       bhp: 640,  kg: 230, awd: false, note: 'High-revving V10',           sound: 120 },
    v12:    { label: 'V12',       bhp: 780,  kg: 270, awd: false, note: 'Naturally aspirated V12',    sound: 140 },
    hybrid: { label: 'Hybrid V8', bhp: 950,  kg: 350, awd: true,  note: 'V8 plus electric motors',     sound: 100 },
    ev:     { label: 'Electric',  bhp: 1400, kg: 620, awd: true,  note: 'Four electric motors',        sound: 0 }
};
// Shape and detail settings every design has (presets that don't mention one get these)
export const SHAPE_DEFAULTS = { waist: 0.95, rallyLights: false, rake: 0.34, screenBow: 0.74, roofDrop: 0.995, bulge: 0, deckRear: 1, roofLen: 0, noseW2: 0.9, cross: 'flat', crossB: 0.07, crossW: 0.09, noseW: 0.72, noseTip: 0.78, noseLift: 2.4, wbFrac: 0.6, axleShift: 0, round: 0.38, fenderH: 0.06, fenderReach: 2.5, cabinStyle: 'canopy', cabinWB: 0.82, cabinWT: 0.58,
    grille: 'none', lamps: 'slim', bumpers: false, scoop: 'none', exhaust: 'none', mouth: false, sideIntake: false, rearGrille: false, cornerIntakes: false, tailBar: false, diffuser: false, roofBar: false, tailBig: false, tailMid: 0.96, tailW: 0.88, wheelCovers: false };
// Apply a body style: its shape, its details, and the parts that suit it
export function applyPreset(design, key) {
    const { label, style, ...shape } = PRESETS[key];
    return Object.assign(design, SHAPE_DEFAULTS, shape, style || {}, { preset: key });
}
export const DEFAULT = { preset: 'hyper', rallyLights: false, ...SHAPE_DEFAULTS, ...(({ label, style, ...shape }) => shape)(PRESETS.hyper), ...PRESETS.hyper.style,
    paint: '#E10600', finish: 'metallic', caliper: '#FFB300', rimSize: 1, engine: 'v8', name: 'My Supercar',
    livery: 'none', stripeColour: '#F4F6F8', twoTone: false, paint2: '#1B1F26', number: '', tag: '' };
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
    const q = { ...SHAPE_DEFAULTS, ...p };
    const wb = p.L * q.wbFrac;                                // wheelbase
    const frontAxle = 0.5 + q.axleShift - wb / 2 / p.L, rearAxle = 0.5 + q.axleShift + wb / 2 / p.L;
    // centre line of the body: bonnet, scuttle, rear deck
    const deckR = p.deck * q.deckRear;                        // the rear deck can sit higher than the scuttle (deckRear > 1)
    // bulge: the bonnet swells gently in the middle (over the front wheels) and dips a little before the windscreen
    const centre = curve(q.bulge > 0 && c0 > 0.26
        ? [[0, p.nose * q.noseTip], [0.025, p.nose], [0.11, lerp(p.nose, p.deck, 0.7)], [0.2, p.deck * 0.98 + q.bulge], [c0, p.deck * 0.98], [c1, deckR], [0.94, p.tail], [1, p.tail * 0.93]]
        : [[0, p.nose * q.noseTip], [0.025, p.nose], [0.14, lerp(p.nose, p.deck, 0.45)], [c0, p.deck * 0.98], [c1, deckR], [0.94, p.tail], [1, p.tail * 0.93]]);
    const width = curve([[0, W2 * q.noseW], [0.05, W2 * Math.max(q.noseW2, q.noseW + 0.08)], [frontAxle, W2 * 0.99], [0.45, W2 * q.waist], [rearAxle, W2], [lerp(rearAxle, 0.95, 0.45), W2 * lerp(1, q.tailMid, 0.6)], [0.95, W2 * q.tailMid], [1, W2 * q.tailW]]);
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
        let y = 0; const x = s * p.L, reach = archR * q.fenderReach;
        for (const ax of [frontAxle, rearAxle]) {
            const dx = Math.abs(x - ax * p.L);
            if (dx < reach) { const t = 0.5 + 0.5 * Math.cos(Math.PI * dx / reach); y = Math.max(y, lerp(centre(s) + 0.03, wheelR + archR + q.fenderH, t)); }
        }
        return y;
    };
    const base = s => p.ride + (s < 0.07 ? (0.07 - s) * q.noseLift : 0) + (s > 0.9 ? (s - 0.9) * 2.2 : 0);
    // the greenhouse (cabin): windscreen rises fast, the roof is flat, then it falls to the tail
    // rake: how much of the cabin the windscreen takes; screenBow: how curved the windscreen is; roofDrop: how far the roof
    // falls before the rear window (below 0.99 the roof gets a gentle crown and a long fastback, like a 60s GT)
    // roofLen (if set): how much of the cabin the roof reaches before it falls away; otherwise it comes from 'fast'
    const rakeEnd = c0 + (c1 - c0) * q.rake, roofEnd = c0 + (c1 - c0) * (q.roofLen > 0 ? q.roofLen : lerp(0.62, 0.42, p.fast));
    const roof = curve(q.roofDrop < 0.99
        ? [[c0, p.deck * 0.98], [lerp(c0, rakeEnd, 0.5), lerp(p.deck, p.roof, q.screenBow)], [rakeEnd, p.roof * lerp(1, q.roofDrop, 0.4)], [lerp(rakeEnd, roofEnd, 0.4), p.roof], [roofEnd, p.roof * q.roofDrop], [c1, deckR * 0.93]]
        : [[c0, p.deck * 0.98], [lerp(c0, rakeEnd, 0.5), lerp(p.deck, p.roof, q.screenBow)], [rakeEnd, p.roof], [roofEnd, p.roof * q.roofDrop], [c1, deckR]]);
    const shoulder = s => Math.max(centre(s) + 0.03, fender(s));
    // the height of the body surface across the car (u = -1 left side … 1 right side)
    // 'triple' (60s GT): seen from the front, the bonnet is a wide dome in the middle with a valley each side, then a narrower
    // rounded wing over each front wheel. It fades out where the bonnet meets the windscreen.
    const tripleAmt = s => q.cross !== 'triple' ? 0 : s < c0 - 0.06 ? 1 : s > c0 + 0.02 ? 0 : (c0 + 0.02 - s) / 0.08;
    const dome = (a, mid, half) => { const d = Math.abs(a - mid) / half; return d < 1 ? Math.cos(d * Math.PI / 2) ** 2 : 0; };
    // 'vee' (modern hypercar): a raised triangle on the bonnet, its point at the nose and its base at the windscreen,
    // with a crisp edge and a shallow channel each side before the wings
    const veeAmt = s => q.cross !== 'vee' ? 0 : s > c0 + 0.01 ? 0 : s < c0 - 0.04 ? 1 : (c0 + 0.01 - s) / 0.05;
    const veeHalf = s => lerp(0.12, 0.62, Math.min(1, s / Math.max(0.05, c0 - 0.02)));
    const sstep = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
    const topAt = (s, u) => {
        const c = centre(s), a = Math.abs(u), base = c + (shoulder(s) - c) * Math.pow(a, 3.2), t = tripleAmt(s), v = veeAmt(s);
        if (v) { const h = veeHalf(s), tip = sstep(0.02, 0.1, s); return base + v * tip * (q.crossB * sstep(h + 0.16, h - 0.04, a) - q.crossW * dome(a, h + 0.24, 0.2)); }
        if (!t) return base;
        return base + t * (q.crossB * (dome(a, 0, 0.44) - 1) + q.crossW * dome(a, 0.77, 0.3));
    };
    const bottomAt = (s, u) => { const b0 = base(s), a = arch(s), t = Math.min(1, Math.max(0, (Math.abs(u) - 0.5) / 0.16)); return b0 + Math.max(0, a - b0) * t * t * (3 - 2 * t); };
    // the real height of the body's skin at side position u (topAt is the top of the cross-section; the rounded edges fall away below it)
    const surfAt = (s, u) => {
        const a = Math.min(0.999, Math.abs(u)), c = Math.pow(a, 1 / q.round), sn = Math.sqrt(1 - c * c);
        const v = Math.pow(sn, 0.5 + (q.round - 0.38) * 0.6), yt = topAt(s, a), yb = Math.min(yt - 0.03, bottomAt(s, a));
        return lerp((yt + yb) / 2, yt, v);
    };
    return { centre, width, arch, base, roof, topAt, bottomAt, surfAt, veeHalf, top: centre, c0, c1, frontAxle, rearAxle, wheelR, rakeEnd, roofEnd, q };
}

// Build a closed tube from rings of points, with caps at both ends
function loft(rings, closedEnds = true, withUV = false, byArc = true) {
    if (withUV) return loftUV(rings, byArc);
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
// Same as loft, with texture coordinates: u runs nose to tail, v runs around the body by distance, starting underneath
// (0 = underneath, about 0.25 = right side, 0.5 = top, 0.75 = left side). The seam is hidden under the car, and the first
// point of each ring is repeated so the texture doesn't smear there.
function loftUV(rings, byArc = true) {
    const K = rings[0].length, R = rings.length, pos = [], uv = [], idx = [];
    rings.forEach((r, i) => {
        const cum = [0];
        for (let k = 1; k <= K; k++) cum.push(cum[k - 1] + r[k % K].distanceTo(r[k - 1]));
        for (let k = 0; k <= K; k++) { const v = r[k % K]; pos.push(v.x, v.y, v.z); uv.push(i / (R - 1), byArc ? cum[k] / cum[K] : k / K); }
    });
    const W = K + 1;
    for (let i = 0; i < R - 1; i++) for (let k = 0; k < K; k++) {
        const a = i * W + k, b = i * W + k + 1, c = (i + 1) * W + k, d = (i + 1) * W + k + 1;
        idx.push(a, c, b, b, c, d);
    }
    for (const [ri, flip] of [[0, true], [R - 1, false]]) {
        const centre = rings[ri].reduce((acc, v) => acc.add(v), new THREE.Vector3()).multiplyScalar(1 / K);
        const ci = pos.length / 3; pos.push(centre.x, centre.y, centre.z); uv.push(ri ? 1 : 0, 0.5);
        for (let k = 0; k < K; k++) { const a = ri * W + k, b = ri * W + k + 1; flip ? idx.push(ci, a, b) : idx.push(ci, b, a); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
}
function bodyGeometry(p, pr, lite = false) {
    const N = lite ? 54 : 90, K = lite ? 48 : 84, rings = [];
    for (let i = 0; i <= N; i++) {
        const s = i / N, x = p.L / 2 - s * p.L, w = pr.width(s), ring = [];
        for (let k = 0; k < K; k++) {
            const a = (k / K) * Math.PI * 2 - Math.PI / 2, c = Math.cos(a), sn = Math.sin(a);   // start underneath
            const u = spow(c, pr.q.round), v = spow(sn, 0.5 + (pr.q.round - 0.38) * 0.6);   // a rounded square (rounder for older styles)
            const yt = pr.topAt(s, u), yb = Math.min(yt - 0.03, pr.bottomAt(s, u)), mid = (yt + yb) / 2;
            const y = v >= 0 ? lerp(mid, yt, v) : lerp(mid, yb, -v);
            ring.push(new THREE.Vector3(x, y, u * w * (1 - Math.max(0, v) * 0.06)));
        }
        rings.push(ring);
    }
    return loft(rings, true, true);
}
function cabinGeometry(p, pr, lite = false) {
    // The windows rise from the body's edge (the beltline), leaning in a little, to a flatter roof.
    // The lower half of each ring is tucked down inside the body so the cabin grows out of it with no ledge.
    const N = lite ? 28 : 48, K = p.cabinStyle === 'glasshouse' ? (lite ? 40 : 52) : (lite ? 28 : 36), rings = [];   // (more points round a glasshouse, for its crisp roof edge)
    for (let i = 0; i <= N; i++) {
        const s = lerp(pr.c0, pr.c1, i / N), x = p.L / 2 - s * p.L;
        const f = pr.q.cabinWB, w = pr.width(s);
        const yb = pr.topAt(s, f) - 0.015, yt = Math.max(yb + 0.015, pr.roof(s));
        const wb = w * f, wt = w * pr.q.cabinWT, ring = [];
        // a fastback roof runs down to meet the rear deck, so there it follows the deck's own curve (no step at the end)
        const hug = pr.q.roofDrop < 0.99;
        for (let k = 0; k < K; k++) {
            const a = (k / K) * Math.PI * 2 - Math.PI / 2, c = Math.cos(a), sn = Math.sin(a);   // start underneath, like the body
            if (sn >= 0) {
                let rise = Math.pow(sn, pr.q.cabinStyle === 'bubble' ? 0.62 : 0.38);   // steep sides and flatter roof, or a rounder bubble
                let z = spow(c, 0.7) * lerp(wb, wt, Math.pow(sn, 1.4));
                if (pr.q.cabinStyle === 'glasshouse') {
                    // 60s glasshouse: straight sides leaning in (where the side windows go), a crisp edge, then a flat roof panel
                    const t = Math.asin(Math.min(1, sn)) / (Math.PI / 2), edge = 0.48;
                    if (t < edge) { const f = t / edge; rise = 0.88 * f; z = Math.sign(c) * lerp(wb, wt, f); }
                    else { const f = (t - edge) / (1 - edge); rise = 0.88 + 0.12 * (1 - (1 - f) * (1 - f)); z = Math.sign(c) * wt * (1 - f) * (1 + 0.15 * f); }
                }
                // (where the roof dips below the deck the ring sinks out of sight inside the body)
                const y0 = hug ? pr.surfAt(s, z / w) - 0.02 : yb, y1 = hug ? pr.roof(s) : yt;
                ring.push(new THREE.Vector3(x, y0 + (y1 - y0) * rise, z));
            } else {
                ring.push(new THREE.Vector3(x, yb - 0.14 * Math.pow(-sn, 0.5), c * wb * 0.98));   // hidden inside the body
            }
        }
        rings.push(ring);
    }
    return loft(rings, true, true, false);
}
// The cabin is painted with its windows: framed glasshouse (60s), glass bubble with a painted roof spine, or all-glass canopy
// seeThrough (the detailed hypercar): the glass is tinted but lets you see the seats and driver inside
function cabinTexture(d, pr, seeThrough = false) {
    const s90 = isSuper90(pr.q), lt = isLongtail(pr.q), ev = isElectric(pr.q), w70 = isWedge70(pr.q), gt = isGT60(pr.q), S = (s90 || lt || ev || w70 || gt) && seeThrough ? 2 : 1; let gloss = null;   // (the closely-seen 90s supercar has fine lines on its cabin, so its picture is sharper)
    const W = 512, H = 256, c = document.createElement('canvas'); c.width = W * S; c.height = H * S;
    const x = c.getContext('2d'), Y = v => (1 - v) * H, glass = seeThrough ? (lt ? 'rgba(9,13,18,0.7)' : 'rgba(9,13,18,0.58)') : '#0b0f14'; x.scale(S, S);   // (a deeper tint on the Longtail: its canopy is nearly all glass)
    const span = pr.c1 - pr.c0, rake = (pr.rakeEnd - pr.c0) / span, roofEnd = (pr.roofEnd - pr.c0) / span;
    const rect = (u0, u1, v0, v1) => x.fillRect(u0 * W, Y(v1), (u1 - u0) * W, Y(v0) - Y(v1));
    const style = pr.q.cabinStyle;
    x.fillStyle = style === 'glasshouse' || style === 'tallglass' || style === 'visor' ? d.paint : glass; x.fillRect(0, 0, W, H);
    if (style === 'glasshouse' && gt && seeThrough) {
        gloss = document.createElement('canvas'); gloss.width = W / 2; gloss.height = H / 2; const mk = gloss.getContext('2d'); mk.scale(0.5, 0.5);
        cabin60(x, d, pr, W, Y, rake, 'rgba(9,13,18,0.67)', mk);
    } else if (style === 'glasshouse') {
        x.fillStyle = glass;
        // v: 0.25 = right beltline, 0.5 = middle of the roof, 0.75 = left beltline
        rect(0.03, rake - 0.01, 0.262, 0.738);                   // windscreen
        const fastback = pr.q.roofDrop < 0.99;                   // long fastback: side glass to where the roof falls, then a big rear window
        const sideEnd = fastback ? roofEnd + 0.03 : Math.min(0.9, roofEnd + 0.25);
        const sideTop = fastback ? 0.352 : 0.335;   // (the glass stops below the roof edge)
        rect(rake + 0.045, sideEnd, 0.262, sideTop);             // right side windows
        rect(rake + 0.045, sideEnd, 1 - sideTop, 0.738);         // left side windows
        if (fastback) rect(roofEnd + 0.06, 0.95, 0.36, 0.64); else rect(Math.max(roofEnd + 0.2, 0.72), 0.95, 0.36, 0.64);   // rear window
        const pillar = lerp(rake, sideEnd, fastback ? 0.45 : 0.52);
        x.fillStyle = d.paint; rect(pillar, pillar + 0.025, 0.2, 0.4); rect(pillar, pillar + 0.025, 0.6, 0.8);   // door pillars
    }
    if (style === 'bubble' && seeThrough) {
        // solid dark parts round the clear glass: the edge band where the glass is bonded on, the header above the windscreen,
        // a pillar behind each door window, and the cover over the engine bay at the back
        x.fillStyle = '#07090c'; rect(0, 1, 0, 0.268); rect(0, 1, 0.732, 1); rect(0, 0.035, 0, 1); rect(0.72, 1, 0, 1);
        rect(rake * 0.9, rake * 0.9 + 0.035, 0.36, 0.64);
        for (const [a, b] of [[0.262, 0.4], [0.6, 0.738]]) { x.beginPath(); x.moveTo((rake + 0.2) * W, Y(a)); x.lineTo((rake + 0.25) * W, Y(a)); x.lineTo((rake + 0.19) * W, Y(b)); x.lineTo((rake + 0.15) * W, Y(b)); x.fill(); }
        x.fillStyle = 'rgba(255,255,255,0.10)'; for (let i = 0; i < 5; i++) rect(0.76 + i * 0.04, 0.775 + i * 0.04, 0.3, 0.44), rect(0.76 + i * 0.04, 0.775 + i * 0.04, 0.56, 0.7);   // engine bay louvres
    }
    if (style === 'bubble') { x.fillStyle = d.paint; rect(rake * 0.9, 1, 0.45, 0.55); }   // painted roof spine
    if (style === 'canopy' && lt && seeThrough) cabinLT(x, d, pr, W, Y, rake);
    if (style === 'visor' && w70) {
        let mk = null; if (seeThrough) { gloss = document.createElement('canvas'); gloss.width = W / 2; gloss.height = H / 2; mk = gloss.getContext('2d'); mk.scale(0.5, 0.5); }
        cabin70(x, d, pr, W, Y, rake, seeThrough ? 'rgba(9,13,18,0.69)' : glass, mk);
    } else if (style === 'visor') {                              // a curved windscreen wrapping round into the sides, like a helmet visor
        x.fillStyle = glass;
        // it ends at the front of the roof in the middle, and wraps further back round each side
        x.beginPath(); x.moveTo(0.02 * W, Y(0.262)); x.lineTo(0.02 * W, Y(0.738)); x.lineTo((rake + 0.12) * W, Y(0.738));
        x.quadraticCurveTo((rake - 0.06) * W, Y(0.5), (rake + 0.12) * W, Y(0.262)); x.closePath(); x.fill();
        rect(rake + 0.16, 0.74, 0.262, 0.425); rect(rake + 0.16, 0.74, 0.575, 0.738);   // side windows behind it
    }
    if (style === 'tallglass' && s90) cabin90(x, d, pr, W, Y, rake, seeThrough ? 'rgba(9,13,18,0.66)' : glass);   // (a slightly deeper tint than the hypercar's: there is a lot of glass here)
    else if (style === 'tallglass' && ev) {
        let mk = null; if (seeThrough) { gloss = document.createElement('canvas'); gloss.width = W / 2; gloss.height = H / 2; mk = gloss.getContext('2d'); mk.scale(0.5, 0.5); }
        cabinEV(x, d, pr, W, Y, rake, seeThrough ? 'rgba(9,13,18,0.74)' : glass, mk);
    } else if (style === 'tallglass') {                            // big windscreen, tall side glass, painted roof and engine cover
        x.fillStyle = glass;
        rect(0.02, rake + 0.03, 0.255, 0.745);
        rect(rake + 0.04, 0.55, 0.255, 0.4); rect(rake + 0.04, 0.55, 0.6, 0.745);           // door windows
        rect(0.58, 0.68, 0.38, 0.62);                                                        // small rear window over the engine
        if (d.engine !== 'ev' && d.preset !== 'electric') {      // engine cover vents (an electric car has no engine to cool there)
            x.fillStyle = 'rgba(0,0,0,.55)'; for (let i = 0; i < 4; i++) rect(0.72 + i * 0.05, 0.75 + i * 0.05, 0.42, 0.58);
        }
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    if (gloss) t.userData.gloss = new THREE.CanvasTexture(gloss);   // (which parts are glass and which are paint)
    return t;
}

// The 70s wedge's cabin: one sweep of windscreen wrapped round like a helmet visor, a slim pillar each side, and door glass
// whose top edge curves down to the back of the door; behind that the roof is painted, with a dark louvred rear window.
// mk (if given): a second picture marking glass and paint (see cabinEV)
function cabin70(x, d, pr, W, Y, rake, glass, mk) {
    const D = doors70(pr), uP = D.uP, uB = D.uB, belt = 0.256, top = 0.368, hd = rake - 0.012, hs = Math.min(uB - 0.2, rake + 0.05), r = Math.min(0.17, (uB - hs - 0.03) * 0.75);
    const poly = (c, pts) => { c.beginPath(); pts.forEach(([u, v], i) => i ? c.lineTo(u * W, Y(v)) : c.moveTo(u * W, Y(v))); c.closePath(); };
    const mir = pts => pts.map(([u, v]) => [u, 1 - v]);
    // the windscreen: its top edge is furthest forward in the middle and sweeps back round each side
    const screen = [[0.02, belt], [uP, belt]]; for (let i = 0; i <= 12; i++) { const t = i / 12; screen.push([hd + (hs - hd) * Math.pow(Math.abs(2 * t - 1), 2), lerp(top, 1 - top, t)]); } screen.push([uP, 1 - belt], [0.02, 1 - belt]);
    // the door glass: its top edge follows the roof, then curves down to the belt at the back of the door
    const arc = (rr, grow, v1) => { const pts = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI / 2; pts.push([uB - r + (rr + grow) * Math.sin(a) + (r - rr), lerp(belt, v1, Math.cos(a))]); } return pts; };
    const win = [[uP + 0.035, belt], [hs + 0.032, top - 0.004], ...arc(r, 0, top - 0.004)];
    x.lineJoin = 'round'; x.lineCap = 'round'; if (mk) { mk.fillStyle = 'rgb(255,255,255)'; mk.fillRect(0, 0, W, Y(0)); }
    // (each pane is cut out of the paint first, so see-through glass really is see-through; then a black rubber seal goes round it)
    for (const p of [screen, win, mir(win)]) {
        poly(x, p); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.fill(); x.globalCompositeOperation = 'source-over'; x.fillStyle = glass; x.fill(); x.strokeStyle = '#07090c'; x.lineWidth = 2.8; x.stroke();
        if (mk) { poly(mk, p); mk.globalCompositeOperation = 'destination-out'; mk.fillStyle = '#000'; mk.fill(); mk.globalCompositeOperation = 'source-over'; mk.fillStyle = GLASS_EV; mk.fill(); } }
    // the top of each door: a cut that follows the curve of the glass, a little way up into the roof
    const cut = [[hs + 0.02, top + 0.016], ...arc(r, 0.016, top + 0.016).map(([u, v]) => [u, Math.max(belt, v)])];
    for (const pts of [cut, mir(cut)]) for (const [col, off, wd] of [['rgba(255,255,255,0.2)', 0.7, 0.9], ['rgba(0,0,0,0.75)', 0, 1.3]]) {
        x.strokeStyle = col; x.lineWidth = wd; x.beginPath(); pts.forEach(([u, v], i) => i ? x.lineTo(u * W + off, Y(v) + off) : x.moveTo(u * W + off, Y(v) + off)); x.stroke(); }
    // rear window, where the roof drops to the engine cover: dark, behind a set of black slats
    const u0 = Math.min(0.94, D.roofEnd + 0.035), rw = [u0 * W, Y(0.64), (0.985 - u0) * W, Y(0.36) - Y(0.64)];
    if (rw[2] > 8) { x.fillStyle = '#07090c'; x.beginPath(); x.roundRect(...rw, 4); x.fill();
        const n = Math.max(2, Math.round(rw[2] / 11)); for (let i = 0; i < n; i++) { const px = rw[0] + rw[2] * (i + 0.5) / n; x.fillStyle = 'rgba(150,158,170,0.3)'; x.fillRect(px - 1.6, rw[1] + 4, 1.1, rw[3] - 8); x.fillStyle = '#1b1e23'; x.fillRect(px - 0.5, rw[1] + 4, 3, rw[3] - 8); } }
}
// The Electric's cabin: a long windscreen between painted pillars, door windows with a small window behind each, doors that
// open upwards and take a piece of the painted roof with them, and a dark rear window with a slim brake light under it. mk (if given): a second picture marking glass and paint, so the glass
// can be smooth and dark while the painted roof keeps the paint's own finish
const GLASS_EV = 'rgba(0,70,0,0.3)';
function cabinEV(x, d, pr, W, Y, rake, glass, mk) {
    const D = doorsEV(pr), uP = D.uP, uB = D.uB, belt = 0.255, top = 0.408, hd = rake + 0.03;
    const poly = (c, pts) => { c.beginPath(); pts.forEach(([u, v], i) => i ? c.lineTo(u * W, Y(v)) : c.moveTo(u * W, Y(v))); c.closePath(); };
    const mir = pts => pts.map(([u, v]) => [u, 1 - v]);
    const win = [[uP + 0.045, belt], [hd + 0.035, top - 0.004], [uB - 0.03, top - 0.004], [uB + 0.005, belt]];
    const quarter = [[uB + 0.035, belt], [uB + 0.014, top - 0.03], [uB + 0.15, belt]];
    const screen = [[0.02, belt], [uP, belt], [hd, top], [hd, 1 - top], [uP, 1 - belt], [0.02, 1 - belt]];
    x.lineJoin = 'round'; x.lineCap = 'round'; if (mk) { mk.fillStyle = 'rgb(255,255,255)'; mk.fillRect(0, 0, W, Y(0)); }   // (red: how much clear coat, green: how rough, blue: how metallic, see-through-ness: how strongly it reflects)
    // (each pane is cut out of the paint first, so see-through glass really is see-through; then a black band goes round it, where the glass is bonded in)
    for (const [p, tint] of [[screen, glass], [win, glass], [mir(win), glass], [quarter, glass], [mir(quarter), glass]]) {
        poly(x, p); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.fill(); x.globalCompositeOperation = 'source-over'; x.fillStyle = tint; x.fill(); x.strokeStyle = '#07090c'; x.lineWidth = 2.6; x.stroke();
        if (mk) { poly(mk, p); mk.globalCompositeOperation = 'destination-out'; mk.fillStyle = '#000'; mk.fill(); mk.globalCompositeOperation = 'source-over'; mk.fillStyle = GLASS_EV; mk.fill(); } }
    // each door takes a piece of the roof with it: the cut runs up the pillar, along the roof close to the middle, and down behind the window
    const cut = [[uB - 0.004, top], [uB - 0.012, 0.487], [hd + 0.045, 0.487], [hd + 0.035, top]];
    for (const pts of [cut, mir(cut)]) for (const [col, off, wd] of [['rgba(255,255,255,0.2)', 0.7, 0.9], ['rgba(0,0,0,0.75)', 0, 1.3]]) {
        x.strokeStyle = col; x.lineWidth = wd; x.beginPath(); pts.forEach(([u, v], i) => i ? x.lineTo(u * W + off, Y(v) + off) : x.moveTo(u * W + off, Y(v) + off)); x.stroke(); }
    // rear window: dark glass down the fastback, with fine heater lines, and a slim brake light below it
    const rw = [0.655 * W, Y(0.63), 0.2 * W, Y(0.37) - Y(0.63)];
    x.fillStyle = '#090b0f'; x.beginPath(); x.roundRect(...rw, 6); x.fill(); if (mk) { mk.beginPath(); mk.roundRect(...rw, 6); mk.globalCompositeOperation = 'destination-out'; mk.fillStyle = '#000'; mk.fill(); mk.globalCompositeOperation = 'source-over'; mk.fillStyle = GLASS_EV; mk.fill(); }
    x.strokeStyle = 'rgba(120,130,145,0.16)'; x.lineWidth = 0.6; for (let i = 1; i < 8; i++) { const u = rw[0] + rw[2] * i / 8; x.beginPath(); x.moveTo(u, rw[1] + 5); x.lineTo(u, rw[1] + rw[3] - 5); x.stroke(); }
    x.strokeStyle = '#07090c'; x.lineWidth = 2.6; x.beginPath(); x.roundRect(...rw, 6); x.stroke();
    x.fillStyle = '#7a0f0a'; x.fillRect(0.875 * W, Y(0.56), 0.007 * W, Y(0.44) - Y(0.56));
}

// The 60s GT's cabin: a framed glasshouse you can see into. The windscreen sits between two slim painted pillars that run up
// the edge of the roof; each side has a small front quarter-light, the door glass and a rear side window that tapers to the
// back; a big rear window lies down the fastback. Every pane has a bright chrome frame, and a chrome rain gutter runs along
// each edge of the roof. mk (if given): a second picture marking glass and paint (see cabinEV)
function cabin60(x, d, pr, W, Y, rake, glass, mk) {
    const D = doors70(pr), uP = D.uP, uB = D.uB, belt = 0.257, top = 0.36, sTop = 0.378, hd = Math.max(0.08, rake - 0.012), qE = Math.min(0.93, Math.max(uB + 0.12, D.roofEnd + 0.05));
    const poly = (c, pts) => { c.beginPath(); pts.forEach(([u, v], i) => i ? c.lineTo(u * W, Y(v)) : c.moveTo(u * W, Y(v))); c.closePath(); };
    const mir = pts => pts.map(([u, v]) => [u, 1 - v]);
    const screen = [[0.025, sTop], [hd, sTop], [hd, 1 - sTop], [0.025, 1 - sTop]];
    const light = [[0.035, belt], [0.035, top], [uP - 0.008, top], [uP - 0.008, belt]];
    const win = [[uP + 0.008, belt], [uP + 0.008, top], [uB - 0.004, top], [uB - 0.004, belt]];
    const quarter = [[uB - 0.004, belt], [uB - 0.004, top], [lerp(uB, qE, 0.5), top], [qE, belt + 0.035], [qE - 0.015, belt]];
    const r0 = Math.min(0.9, D.roofEnd + 0.07), rear = [[r0, sTop + 0.004], [0.955, sTop], [0.955, 1 - sTop], [r0, 1 - sTop - 0.004]];
    const panes = [screen, win, mir(win), quarter, mir(quarter), rear]; if (uP - 0.008 > 0.06) panes.push(light, mir(light));
    const chrome = x.createLinearGradient(0, Y(0.75), 0, Y(0.25)); for (const [t, c] of [[0, '#8f979f'], [0.22, '#d3d8de'], [0.3, '#9aa1a9'], [0.5, '#c9ced5'], [0.7, '#9aa1a9'], [0.78, '#d3d8de'], [1, '#8f979f']]) chrome.addColorStop(t, c);   // (grey chrome, lighter where it faces the sky)
    x.lineJoin = 'round'; x.lineCap = 'round'; if (mk) { mk.fillStyle = 'rgb(255,255,255)'; mk.fillRect(0, 0, W, Y(0)); }
    // (each pane is cut out of the paint first, so the glass really is see-through; then a dark rubber seal and a chrome frame go round it)
    for (const p of panes) {
        poly(x, p); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.fill(); x.globalCompositeOperation = 'source-over'; x.fillStyle = glass; x.fill();
        x.strokeStyle = '#07090c'; x.lineWidth = 2.6; x.stroke(); x.strokeStyle = chrome; x.lineWidth = 1.0; x.stroke();
        if (mk) { poly(mk, p); mk.globalCompositeOperation = 'destination-out'; mk.fillStyle = '#000'; mk.fill(); mk.globalCompositeOperation = 'source-over'; mk.fillStyle = GLASS_EV; mk.fill(); } }
    // chrome rain gutters along the edges of the roof
    for (const v of [0.369, 0.631]) { x.strokeStyle = 'rgba(0,0,0,0.5)'; x.lineWidth = 1.8; x.beginPath(); x.moveTo(0.03 * W, Y(v)); x.lineTo((qE + 0.02) * W, Y(v)); x.stroke(); x.strokeStyle = chrome; x.lineWidth = 0.8; x.stroke(); }
    // the framed door: its cut runs up in front of the door glass, along under the gutter and down behind the glass
    const cut = [[uP, belt - 0.004], [uP, 0.3645], [uB - 0.004, 0.3645], [uB - 0.004, belt - 0.004]];
    for (const pts of [cut, mir(cut)]) for (const [col, off, wd] of [['rgba(255,255,255,0.2)', 0.7, 0.8], ['rgba(0,0,0,0.75)', 0, 1.1]]) {
        x.strokeStyle = col; x.lineWidth = wd; x.beginPath(); pts.forEach(([u, v], i) => i ? x.lineTo(u * W + off, Y(v) + off) : x.moveTo(u * W + off, Y(v) + off)); x.stroke(); }
}
// The 90s supercar's cabin: a windscreen between two painted pillars, door windows, doors that cut up into the roof, a rear
// window over the engine bay (lined with gold, as the famous car's was) and a vented engine cover
function cabin90(x, d, pr, W, Y, rake, glass) {
    const D = doors90(pr), uP = D.uP, belt = 0.25, top = 0.405, hd = rake + 0.03, ev = d.engine === 'ev';
    const poly = pts => { x.beginPath(); pts.forEach(([u, v], i) => i ? x.lineTo(u * W, Y(v)) : x.moveTo(u * W, Y(v))); x.closePath(); };
    const mir = pts => pts.map(([u, v]) => [u, 1 - v]);
    const win = [[uP + 0.04, belt], [hd + 0.035, top - 0.004], [0.545, top - 0.004], [0.57, belt]];
    const panes = [[[0.02, belt], [uP, belt], [hd, top], [hd, 1 - top], [uP, 1 - belt], [0.02, 1 - belt]], win, mir(win)];
    x.lineJoin = 'round'; x.lineCap = 'round';
    // (each pane is cut out of the paint first, so see-through glass really is see-through; then a black band goes round it, where the glass is bonded in)
    for (const p of panes) { poly(p); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.fill(); x.globalCompositeOperation = 'source-over'; x.fillStyle = glass; x.fill(); x.strokeStyle = '#07090c'; x.lineWidth = 2.6; x.stroke(); }
    // each door takes a piece of the roof with it: the cut runs up from the back of the window, along the roof and down to the pillar
    const cut = [[0.545, top], [0.54, 0.462], [hd + 0.045, 0.462], [hd + 0.035, top]];
    for (const pts of [cut, mir(cut)]) for (const [col, off, wd] of [['rgba(255,255,255,0.2)', 0.7, 0.9], ['rgba(0,0,0,0.75)', 0, 1.3]]) {
        x.strokeStyle = col; x.lineWidth = wd; x.beginPath(); pts.forEach(([u, v], i) => i ? x.lineTo(u * W + off, Y(v) + off) : x.moveTo(u * W + off, Y(v) + off)); x.stroke(); }
    // rear window: you look down through it at the engine, in a bay lined with gold foil
    const rw = [0.6 * W, Y(0.615), 0.1 * W, Y(0.385) - Y(0.615)];
    x.fillStyle = '#0a0c10'; x.beginPath(); x.roundRect(...rw, 5); x.fill();
    if (!ev) {
        const g = x.createLinearGradient(0, rw[1], 0, rw[1] + rw[3]); g.addColorStop(0, '#6e520f'); g.addColorStop(0.2, '#e6bf45'); g.addColorStop(0.5, '#a57f1e'); g.addColorStop(0.8, '#e6bf45'); g.addColorStop(1, '#6e520f');
        x.fillStyle = g; x.beginPath(); x.roundRect(rw[0] + 3, rw[1] + 3, rw[2] - 6, rw[3] - 6, 3); x.fill();
        x.fillStyle = '#15171b'; x.beginPath(); x.roundRect(rw[0] + 9, rw[1] + rw[3] * 0.27, rw[2] - 16, rw[3] * 0.46, 3); x.fill();          // the engine's air box
        x.fillStyle = '#8a919b'; for (let i = 0; i < 6; i++) for (const f of [0.38, 0.62]) { x.beginPath(); x.arc(rw[0] + 14 + i * (rw[2] - 28) / 5, rw[1] + rw[3] * f, 1.5, 0, Math.PI * 2); x.fill(); }
        x.fillStyle = 'rgba(9,13,18,0.34)'; x.beginPath(); x.roundRect(...rw, 5); x.fill();                                                    // the tint of the glass over it all
    }
    x.strokeStyle = '#07090c'; x.lineWidth = 2.6; x.beginPath(); x.roundRect(...rw, 5); x.stroke();
    // engine cover: its outline, and two banks of louvres with a glint of the gold lining between them
    x.strokeStyle = 'rgba(0,0,0,0.7)'; x.lineWidth = 1.3; x.beginPath(); x.roundRect(0.722 * W, Y(0.64), 0.262 * W, Y(0.36) - Y(0.64), 6); x.stroke();
    if (!ev) for (const [v0, v1] of [[0.385, 0.475], [0.525, 0.615]]) for (let i = 0; i < 5; i++) {
        const u = 0.745 + i * 0.044;
        x.fillStyle = '#050607'; x.fillRect(u * W, Y(v1), 0.026 * W, Y(v0) - Y(v1));
        x.fillStyle = 'rgba(230,191,69,0.55)'; x.fillRect((u + 0.017) * W, Y(v1) + 1, 0.006 * W, Y(v0) - Y(v1) - 2);
        x.fillStyle = 'rgba(255,255,255,0.22)'; x.fillRect((u - 0.004) * W, Y(v1), 0.004 * W, Y(v0) - Y(v1));
    }
}

// The Longtail's canopy: one sweep of glass over three seats. Slim dark pillars, doors that take a piece of the glass roof
// up with them, a darker sun-shade band over the heads, and a solid dark teardrop at the back that runs out into the tail
function cabinLT(x, d, pr, W, Y, rake) {
    const D = doorsLT(pr), uA = D.uA, uB = D.uB, belt = 0.262, top = 0.415, ev = d.engine === 'ev';
    const path = (pts, close) => { x.beginPath(); pts.forEach(([u, v], i) => i ? x.lineTo(u * W, Y(v)) : x.moveTo(u * W, Y(v))); if (close) x.closePath(); };
    const mir = pts => pts.map(([u, v]) => [u, 1 - v]);
    x.lineJoin = 'round'; x.lineCap = 'round';
    // the band where the glass is bonded on, all the way round
    x.fillStyle = '#07090c'; x.fillRect(0, Y(belt), W, Y(0) - Y(belt)); x.fillRect(0, Y(1), W, Y(1 - belt) - Y(1)); x.fillRect(0, 0, 0.028 * W, Y(0));
    // the solid tail of the canopy: it starts behind the passengers' heads and comes to a point over the engine
    const u0 = 0.66, u1 = 0.71;
    path([[u0, belt], [u1, 0.5], [u0, 1 - belt], [1, 1 - belt], [1, belt]], true); x.fill();
    // a darker sun-shade tint in the roof glass, over the seats
    path([[rake + 0.02, top + 0.012], [uB + 0.1, top + 0.012], [u1 - 0.03, 0.5], [uB + 0.1, 1 - top - 0.012], [rake + 0.02, 1 - top - 0.012]], true); x.fillStyle = 'rgba(6,9,13,0.4)'; x.fill();
    // a slim high-level brake light bedded in the solid part, and fine cooling slots behind it (none on an electric car)
    x.fillStyle = '#5a0c08'; x.fillRect(0.735 * W, Y(0.56), 0.008 * W, Y(0.44) - Y(0.56));
    if (!ev) for (let i = 0; i < 6; i++) for (const [v0, v1] of [[0.33, 0.455], [0.545, 0.67]]) { const u = 0.775 + i * 0.03;
        x.fillStyle = 'rgba(0,0,0,0.9)'; x.fillRect(u * W, Y(v1), 0.013 * W, Y(v0) - Y(v1)); x.fillStyle = 'rgba(255,255,255,0.13)'; x.fillRect((u - 0.003) * W, Y(v1), 0.003 * W, Y(v0) - Y(v1)); }
    // pillars and door cuts: a slim windscreen pillar each side, then the door's edge runs along the roof and down behind the seats
    const cut = [[uA, belt], [lerp(uA, rake, 0.55), lerp(belt, top, 0.62)], [rake + 0.015, top], [uB - 0.03, top], [uB, lerp(belt, top, 0.55)], [uB + 0.004, belt]];
    for (const pts of [cut, mir(cut)]) for (const [col, off, wd] of [['rgba(255,255,255,0.16)', 0.8, 1.6], ['#07090c', 0, 2.6]]) {
        x.strokeStyle = col; x.lineWidth = wd; x.beginPath(); pts.forEach(([u, v], i) => i ? x.lineTo(u * W + off, Y(v) + off) : x.moveTo(u * W + off, Y(v) + off)); x.stroke(); }
    // the header across the top of the windscreen
    x.strokeStyle = '#07090c'; x.lineWidth = 2.2; path([[rake + 0.015, top], [rake + 0.004, 0.5], [rake + 0.015, 1 - top]]); x.stroke();
}

// =====================================================================
//  WHEELS
// =====================================================================
// Tyre and brake disc pictures, drawn once and shared by every car
let TYRE_TEX = null, DISC_TEX = null;
function tyreTexture() {
    if (TYRE_TEX) return TYRE_TEX;
    // across the picture = around the tyre; down = from one sidewall, over the tread, to the other sidewall
    const c = document.createElement('canvas'); c.width = 512; c.height = 64; const x = c.getContext('2d');
    x.fillStyle = '#242529'; x.fillRect(0, 0, 512, 64);
    x.fillStyle = '#1a1b1e'; x.fillRect(0, 18, 512, 28);                      // the tread, a touch darker and worn smooth
    x.fillStyle = '#0a0a0c'; for (const y of [23, 31.5, 40]) x.fillRect(0, y, 512, 2);   // grooves round the tyre
    x.strokeStyle = '#0d0d0f'; x.lineWidth = 1.5;
    for (let i = 0; i < 512; i += 9) { x.beginPath(); x.moveTo(i, 18); x.lineTo(i + 5, 23); x.moveTo(i + 4, 42); x.lineTo(i + 9, 46); x.stroke(); }   // little cuts at the shoulders
    x.fillStyle = '#34363b'; x.fillRect(0, 7, 512, 1.5); x.fillRect(0, 56, 512, 1.5);   // raised rings on the sidewalls
    x.fillStyle = '#2c2e33'; for (let i = 0; i < 512; i += 64) { x.fillRect(i + 10, 10, 30, 2); x.fillRect(i + 42, 52, 30, 2); }   // moulded marks (no names)
    TYRE_TEX = new THREE.CanvasTexture(c); TYRE_TEX.colorSpace = THREE.SRGBColorSpace; TYRE_TEX.wrapS = THREE.RepeatWrapping; TYRE_TEX.anisotropy = 4;
    return TYRE_TEX;
}
function discTexture() {
    if (DISC_TEX) return DISC_TEX;
    // a drilled, grooved brake disc with its darker centre "hat"
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), m = 128;
    x.fillStyle = '#000'; x.fillRect(0, 0, 256, 256);
    const g = x.createRadialGradient(m, m, 40, m, m, 128); g.addColorStop(0, '#8d929b'); g.addColorStop(0.6, '#b9bec6'); g.addColorStop(1, '#7d828b');
    x.fillStyle = g; x.beginPath(); x.arc(m, m, 127, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(60,64,70,.35)'; x.lineWidth = 1; for (let r = 62; r < 126; r += 3.5) { x.beginPath(); x.arc(m, m, r, 0, Math.PI * 2); x.stroke(); }   // polished rings
    x.fillStyle = '#16171a';
    for (let i = 0; i < 36; i++) for (const [r, off] of [[80, 0], [96, 0.5], [112, 0]]) { const a = (i + off) / 36 * Math.PI * 2; x.beginPath(); x.arc(m + Math.cos(a) * r, m + Math.sin(a) * r, 3.2, 0, Math.PI * 2); x.fill(); }   // drilled holes
    x.strokeStyle = '#3a3d43'; x.lineWidth = 2.5; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.beginPath(); x.arc(m, m, 104, a, a + 0.35); x.stroke(); }   // curved slots
    x.fillStyle = '#4a4e56'; x.beginPath(); x.arc(m, m, 58, 0, Math.PI * 2); x.fill();   // the hat
    x.fillStyle = '#2a2c31'; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; x.beginPath(); x.arc(m + Math.cos(a) * 30, m + Math.sin(a) * 30, 6, 0, Math.PI * 2); x.fill(); }
    DISC_TEX = new THREE.CanvasTexture(c); DISC_TEX.colorSpace = THREE.SRGBColorSpace; DISC_TEX.anisotropy = 4;
    return DISC_TEX;
}
// A wheel: the group steers; its 'spin' group (tyre, rim, disc) turns as the car rolls; the calliper stays put, gripping the disc
function spinBlurMaterial(design) {
    const rc = RIM_COLOURS[design.rimColour], col = rc === 'chrome' ? '#e8ebef' : rc;
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), m = 64;
    const g = x.createRadialGradient(m, m, 0, m, m, 64);
    g.addColorStop(0, col); g.addColorStop(0.2, col); g.addColorStop(0.3, 'rgba(40,42,46,0.9)'); g.addColorStop(0.75, 'rgba(70,72,78,0.55)'); g.addColorStop(0.94, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    x.globalAlpha = 0.25; x.strokeStyle = col; for (let r = 22; r < 58; r += 5) { x.lineWidth = 1 + (r % 3); x.beginPath(); x.arc(m, m, r, 0, Math.PI * 2); x.stroke(); }   // the blur of the spokes
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false, metalness: 0.15, roughness: 0.4, visible: false });
}
function makeWheel(p, mats, front, lite = false, covered = false) {   // (covered: a smooth cover hides the spokes, so they are left out)
    const g = new THREE.Group(), spin = new THREE.Group(); g.add(spin); g.userData.spin = spin;
    const R = p.wheel, tw = front ? 0.27 : 0.32, rimR = R * 0.72;
    // tyre: a rounded profile spun around the axle
    const prof = [];
    const tp = lite ? 6 : 14, ts = lite ? 18 : 36;
    for (let i = 0; i <= tp; i++) { const a = -Math.PI / 2 + Math.PI * i / tp; prof.push(new THREE.Vector2(rimR + (R - rimR) * (0.55 + 0.45 * Math.cos(a)), (tw / 2) * Math.sin(a))); }
    const tyre = new THREE.Mesh(new THREE.LatheGeometry(prof, ts), mats.tyre);
    tyre.rotation.x = Math.PI / 2; spin.add(tyre);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(rimR, rimR, tw * 0.9, ts, 1, true), mats.rim);
    barrel.rotation.x = Math.PI / 2; spin.add(barrel);
    // the rim's lip, a bright edge where the tyre meets the wheel
    if (!lite) { const lip = new THREE.Mesh(new THREE.TorusGeometry(rimR * 0.99, 0.011, 6, ts), mats.rim); lip.position.z = tw * 0.44; spin.add(lip); }
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(rimR * 0.82, rimR * 0.82, 0.032, lite ? 16 : 32), mats.brake);
    disc.rotation.x = Math.PI / 2; disc.position.z = 0.02; spin.add(disc);
    // the calliper: a chunky clamp over the top-back of the disc (it doesn't turn with the wheel)
    const cal = new THREE.Group(); cal.position.set(-rimR * 0.5, rimR * 0.5, 0.025); cal.rotation.z = -0.78; g.add(cal); g.userData.cal = cal;
    const body = new THREE.Mesh(new THREE.BoxGeometry(rimR * 0.62, 0.075, 0.1), mats.caliper); cal.add(body);
    if (!lite) for (const dz of [-0.045, 0.045]) { const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, rimR * 0.66, 10), mats.caliper); pad.rotation.z = Math.PI / 2; pad.position.set(0, 0.03, dz); cal.add(pad); }
    const face = new THREE.Group(); face.position.z = tw * 0.42; spin.add(face);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(rimR * 0.18, rimR * 0.2, 0.05, 16), mats.rim);
    hub.rotation.x = Math.PI / 2; face.add(hub);
    // wheel nuts round the hub
    if (!lite && !covered && p.rim !== 'wire') for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2, n = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.03, 6), mats.chrome); n.rotation.x = Math.PI / 2; n.position.set(Math.cos(a) * rimR * 0.12, Math.sin(a) * rimR * 0.12, 0.03); face.add(n); }
    const spoke = (n, w, twist = 0, depth = 0.035, blade = false) => {   // (blade: each spoke twists about its own length, like a fan blade, and stays inside the rim)
        for (let i = 0; i < n; i++) {
            const s = new THREE.Mesh(new THREE.BoxGeometry(w, rimR * 0.85, depth), mats.rim);
            s.geometry.translate(0, rimR * 0.5, 0);
            if (blade) s.rotation.order = 'ZYX'; s.rotation.z = (i / n) * Math.PI * 2; s.rotation.y = twist; face.add(s);
        }
    };
    const rim = covered ? 'none' : p.rim;
    if (rim === 'five') spoke(5, rimR * 0.22);
    if (rim === 'ten') spoke(10, rimR * 0.09);
    if (rim === 'mesh') { spoke(14, rimR * 0.05); const m = new THREE.Group(); face.add(m); spoke(14, rimR * 0.05, 0.5); }
    if (rim === 'turbine') spoke(12, rimR * 0.16, 0.6, 0.02, true);
    if (rim === 'wire') {                 // many thin crossed spokes and a central spinner
        spoke(24, rimR * 0.022, 0.18, 0.01); spoke(24, rimR * 0.022, -0.18, 0.01);
        for (const r of [0, Math.PI / 2]) { const ear = new THREE.Mesh(new THREE.BoxGeometry(rimR * 0.5, rimR * 0.08, 0.04), mats.rim); ear.rotation.z = r + 0.4; ear.position.z = 0.03; face.add(ear); }
    }
    if (rim === 'disc') {
        const d = new THREE.Mesh(new THREE.CylinderGeometry(rimR * 0.98, rimR * 0.98, 0.03, 32), mats.rim);
        d.rotation.x = Math.PI / 2; face.add(d);
        for (let i = 0; i < 6; i++) { const h = new THREE.Mesh(new THREE.CylinderGeometry(rimR * 0.1, rimR * 0.1, 0.035, 12), mats.dark); h.rotation.x = Math.PI / 2; h.position.set(Math.cos(i * 1.047) * rimR * 0.62, Math.sin(i * 1.047) * rimR * 0.62, 0.005); face.add(h); }
    }
    // at speed the spokes blur into a soft disc, like a real wheel filmed going fast (see in the race)
    if (mats.spinBlur && !covered) { const b = new THREE.Mesh(new THREE.CircleGeometry(rimR * 0.97, 32), mats.spinBlur); b.position.z = tw * 0.42 + 0.045; g.add(b); }
    return g;
}

// =====================================================================
//  MATERIALS AND THE WHOLE CAR
// =====================================================================
export const LIVERIES = { none: 'Plain', twin: 'Twin stripes', single: 'Offset stripe', side: 'Side stripes', chequer: 'Chequered flag', lightning: 'Lightning' };
// Motorsport team paint jobs, with sponsor stickers. The sponsors are all made up (no real brands or logos).
export const TEAM_LIVERIES = { rally: 'Rally team', endurance: 'Endurance team', gt: 'GT team' };
const ALL_LIVERIES = [...Object.keys(LIVERIES), ...Object.keys(TEAM_LIVERIES)];
const SPONSORS = [
    { name: 'APEX TYRES', bg: '#111418', fg: '#FFB300', mark: 'ring' }, { name: 'NITRO FUEL', bg: '#E10600', fg: '#ffffff', mark: 'bolt' },
    { name: 'VELOCITY OIL', bg: '#ffffff', fg: '#1E3A8A', mark: 'drop' }, { name: 'BOLT BRAKES', bg: '#FFB300', fg: '#111418', mark: 'bolt' },
    { name: 'ROCKET PLUGS', bg: '#1E3A8A', fg: '#ffffff', mark: 'star' }, { name: 'ZOOM RADIO', bg: '#00A86B', fg: '#ffffff', mark: 'ring' },
    { name: 'COMET LIGHTS', bg: '#ffffff', fg: '#E10600', mark: 'star' }, { name: 'PEAK GEARS', bg: '#111418', fg: '#C6FF00', mark: 'peak' }
];
const hasLivery = d => (d.livery && d.livery !== 'none') || d.twoTone || String(d.number || '').trim() || String(d.tag || '').trim();
// A sponsor sticker, drawn centred on (0, 0), w x h pixels
function sponsorSticker(x, sp, w, h) {
    x.fillStyle = sp.bg; x.beginPath(); x.roundRect(-w / 2, -h / 2, w, h, h * 0.18); x.fill();
    x.strokeStyle = sp.fg; x.lineWidth = Math.max(1, h * 0.06); x.stroke();
    const m = h * 0.32, mx = -w / 2 + h * 0.5;
    x.fillStyle = sp.fg; x.strokeStyle = sp.fg; x.lineWidth = h * 0.09;
    if (sp.mark === 'ring') { x.beginPath(); x.arc(mx, 0, m, 0, Math.PI * 2); x.stroke(); }
    if (sp.mark === 'bolt') { x.beginPath(); x.moveTo(mx + m * 0.3, -m); x.lineTo(mx - m * 0.5, m * 0.15); x.lineTo(mx, m * 0.15); x.lineTo(mx - m * 0.3, m); x.lineTo(mx + m * 0.5, -m * 0.15); x.lineTo(mx, -m * 0.15); x.closePath(); x.fill(); }
    if (sp.mark === 'drop') { x.beginPath(); x.moveTo(mx, -m); x.quadraticCurveTo(mx + m, m * 0.3, mx, m); x.quadraticCurveTo(mx - m, m * 0.3, mx, -m); x.fill(); }
    if (sp.mark === 'star') { x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? m * 0.45 : m, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(mx + Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill(); }
    if (sp.mark === 'peak') { x.beginPath(); x.moveTo(mx - m, m * 0.7); x.lineTo(mx - m * 0.2, -m * 0.7); x.lineTo(mx + m * 0.25, 0); x.lineTo(mx + m * 0.55, -m * 0.4); x.lineTo(mx + m, m * 0.7); x.closePath(); x.fill(); }
    x.font = `italic 900 ${h * 0.5}px "Exo 2", Arial Black, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
    const tx = h * 0.45, avail = w - h * 1.2, tw = x.measureText(sp.name).width;
    x.save(); x.translate(tx, h * 0.03); if (tw > avail) x.scale(avail / tw, 1); x.fillText(sp.name, 0, 0); x.restore();
}
// Motorsport team schemes: stripes and colour blocks in the paint and stripe colours, then sponsor stickers
function teamLivery(x, d, W, H, Y, band, pxU, pxV) {
    const sc = d.stripeColour, p2 = d.paint2, k = pxV / pxU;
    // a sticker on a side of the car (reads the right way round on each side), or on the bonnet (reads from the front)
    const onSide = (u, v, wM, hM, sp, side) => {
        x.save(); x.translate(u * W, Y(v)); x.scale(side === 'right' ? -1 : 1, (side === 'right' ? 1 : -1) * k);
        sponsorSticker(x, sp, wM * pxU, hM * pxU); x.restore();
    };
    const onTop = (u, wM, hM, sp) => { x.save(); x.transform(0, -k, -1, 0, u * W, Y(0.5)); sponsorSticker(x, sp, wM * pxU, hM * pxU); x.restore(); };
    const S = i => SPONSORS[i % SPONSORS.length];
    const bonnetU = d.scoop === 'louvres' ? 0.235 : d.scoop === 'bonnetvent' || d.scoop === 'bonnet' ? 0.2 : 0.1;   // the bonnet sticker goes behind any louvres or vents
    if (d.livery === 'rally') {
        // three stripes from nose to tail over the top, and a sweep along each side rising towards the back
        x.fillStyle = sc; band(0.43, 0.465); band(0.535, 0.57); x.fillStyle = p2; band(0.475, 0.525);
        for (const [v0, dir] of [[0.22, 1], [0.78, -1]]) {
            x.fillStyle = sc; x.beginPath(); x.moveTo(0.02 * W, Y(v0)); x.quadraticCurveTo(0.5 * W, Y(v0 + dir * 0.02), 0.98 * W, Y(v0 + dir * 0.09));
            x.lineTo(0.98 * W, Y(v0 + dir * 0.06)); x.quadraticCurveTo(0.5 * W, Y(v0 - dir * 0.01), 0.02 * W, Y(v0 - dir * 0.025)); x.fill();
        }
        for (const side of ['right', 'left']) { const v = side === 'right' ? 0.258 : 0.742;
            const hi = side === 'right' ? 0.318 : 0.682;      // up on the doors, clear of the wheel arches
            onSide(0.32, hi, 0.58, 0.14, S(0), side); onSide(0.5, side === 'right' ? 0.238 : 0.762, 0.9, 0.17, S(1), side); onSide(0.68, hi, 0.58, 0.14, S(2), side); }
        onTop(bonnetU, 0.9, 0.22, S(4));
    }
    if (d.livery === 'endurance') {
        // a wide band over the top edged in the second colour, and a hoop of colour round the middle of the car
        x.fillStyle = p2; band(0.385, 0.615); x.fillStyle = sc; band(0.4, 0.6);
        x.fillStyle = sc; x.fillRect(0.4 * W, 0, 0.08 * W, H); x.fillStyle = p2; x.fillRect(0.48 * W, 0, 0.012 * W, H); x.fillRect(0.388 * W, 0, 0.012 * W, H);
        for (const side of ['right', 'left']) { const v = side === 'right' ? 0.255 : 0.745;
            const hi = side === 'right' ? 0.318 : 0.682;
            onSide(0.3, hi, 0.62, 0.15, S(5), side); onSide(0.62, hi, 0.62, 0.15, S(3), side); onSide(0.62, side === 'right' ? 0.24 : 0.76, 0.55, 0.13, S(6), side); }
        onTop(bonnetU, 0.8, 0.2, S(0));
    }
    if (d.livery === 'gt') {
        // slashes of colour on the front wings, a dark lower half and a chequered patch on the rear quarters
        x.fillStyle = p2; band(0, 0.22); band(0.78, 1);
        for (const [v0, dir] of [[0.3, 1], [0.7, -1]]) for (let i = 0; i < 3; i++) {
            const u = 0.12 + i * 0.05; x.fillStyle = i === 1 ? p2 : sc; x.beginPath();
            x.moveTo(u * W, Y(v0 - dir * 0.08)); x.lineTo((u + 0.025) * W, Y(v0 - dir * 0.08)); x.lineTo((u + 0.065) * W, Y(v0 + dir * 0.06)); x.lineTo((u + 0.04) * W, Y(v0 + dir * 0.06)); x.fill();
        }
        const sq = 10; for (const v0 of [0.23, 0.69]) for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? '#111' : '#fff'; x.fillRect(0.84 * W + i * sq, Y(v0 + 0.08) + j * sq, sq, sq); }
        for (const side of ['right', 'left']) { const v = side === 'right' ? 0.232 : 0.768;
            onSide(0.38, v, 0.75, 0.15, S(7), side); onSide(0.62, v, 0.75, 0.15, S(1), side); }
        onTop(bonnetU, 0.85, 0.2, S(2));
    }
}
// The livery is painted onto a canvas that wraps around the body (see loftUV for which way is which)
// hd: twice as sharp (for the car you look at closely: the builder and your own car in a race)
function liveryTexture(d, hd = false) {
    const W = 1024, H = 512, S = hd ? 2 : 1, spare = CANVAS_POOL[S].pop(), c = spare || document.createElement('canvas');
    if (!spare) { c.width = W * S; c.height = H * S; }
    const x = c.getContext('2d'); x.setTransform(S, 0, 0, S, 0, 0); x.globalAlpha = 1; x.lineCap = 'butt';
    const Y = v => (1 - v) * H;                                   // the texture is flipped vertically
    x.fillStyle = d.paint; x.fillRect(0, 0, W, H);
    if (d.twoTone) { x.fillStyle = d.paint2; x.fillRect(0, Y(0.24), W, Y(0) - Y(0.24)); x.fillRect(0, Y(1), W, Y(0.76) - Y(1)); }   // lower half of each side
    const sc = d.stripeColour;
    const band = (v0, v1, u0 = 0, u1 = 1) => { x.fillRect(u0 * W, Y(v1), (u1 - u0) * W, Y(v0) - Y(v1)); };
    x.fillStyle = sc;
    if (d.livery === 'twin') { band(0.462, 0.49); band(0.51, 0.538); }
    if (d.livery === 'single') { band(0.445, 0.5); }
    if (d.livery === 'side') { band(0.3, 0.325, 0.04, 0.96); band(0.675, 0.7, 0.04, 0.96); }
    if (d.livery === 'chequer') {
        const sq = 18;
        for (let i = 0; i < W * 0.16 / sq; i++) for (let j = 0; j < H / sq; j++) {
            x.fillStyle = (i + j) % 2 ? '#111' : '#fff'; x.fillRect(W * 0.72 + i * sq, j * sq, sq, sq);
        }
    }
    if (d.livery === 'lightning') {
        for (const [vMid, dir] of [[0.3, 1], [0.7, -1]]) {
            x.beginPath(); x.moveTo(0.08 * W, Y(vMid));
            const pts = [[0.3, 0.05], [0.36, -0.03], [0.62, 0.04], [0.68, -0.04], [0.92, 0]];
            pts.forEach(([u, dv]) => x.lineTo(u * W, Y(vMid + dv * dir)));
            x.lineWidth = 14; x.strokeStyle = sc; x.lineJoin = 'miter'; x.stroke();
        }
    }
    // race number roundels on both doors and the driver's tag, drawn so they read the right way round on each side
    const pxU = W / d.L, pxV = H / (2 * d.W + 2 * (d.deck - d.ride) + 0.4);   // pixels per metre along and around the body
    const team = TEAM_LIVERIES[d.livery];
    if (team) teamLivery(x, d, W, H, Y, band, pxU, pxV);
    const num = String(d.number || '').trim().slice(0, 2) || (team ? { rally: '4', endurance: '24', gt: '7' }[d.livery] : ''), tag = String(d.tag || '').trim().slice(0, 14);
    for (const side of ['right', 'left']) {
        const v = side === 'right' ? 0.29 : 0.71, flipX = side === 'right' ? -1 : 1, flipY = side === 'right' ? 1 : -1;
        const draw = (u, vv, fn) => { x.save(); x.translate(u * W, Y(vv)); x.scale(flipX, flipY * pxV / pxU); fn(); x.restore(); };
        if (num) draw(0.5, v, () => {
            x.fillStyle = '#F4F6F8'; x.beginPath(); x.arc(0, 0, 0.28 * pxU, 0, Math.PI * 2); x.fill();
            x.fillStyle = '#111'; x.font = `900 ${0.34 * pxU}px Orbitron, Arial Black, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(num, 0, 0.02 * pxU);
        });
        if (tag) draw(0.74, v, () => {
            x.fillStyle = sc === d.paint ? '#111' : sc; x.font = `800 ${0.16 * pxU}px "Exo 2", Arial, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(tag, 0, 0);
        });
    }
    if (isHyper(d)) panelLines(x, d, W, H, Y, pxU, pxV); else if (isSuper90(d)) panelLines90(x, d, W, H, Y, pxU, pxV); else if (isLongtail(d)) panelLinesLT(x, d, W, H, Y, pxU, pxV); else if (isElectric(d)) panelLinesEV(x, d, W, H, Y, pxU, pxV); else if (isWedge70(d)) panelLines70(x, d, W, H, Y, pxU, pxV); else if (isGT60(d)) panelLines60(x, d, W, H, Y, pxU, pxV);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = hd ? 8 : 4;
    t.addEventListener('dispose', () => { if (CANVAS_POOL[S].length < 1) CANVAS_POOL[S].push(c); });   // (kept for the next car, see CANVAS_POOL)
    return t;
}
// Paint canvases are kept and used again when a car is rebuilt (every slider move rebuilds the car), instead of making a new
// big canvas each time: [1] holds the normal size, [2] the sharp size
const CANVAS_POOL = { 1: [], 2: [] };
// (only one of each size is kept, and the builder empties the pool when you leave it, so the memory is given back)
export function clearPaintPool() { for (const k of [1, 2]) { CANVAS_POOL[k].forEach(c => { c.width = c.height = 0; }); CANVAS_POOL[k].length = 0; } }
// The modern hypercar gets the extra detail (panel lines, light units, interior and so on). It is recognised by its own
// parts, not by its name, so it stays detailed after the sliders have been moved (which renames the style 'custom').
const isHyper = d => d.lamps === 'twin' && d.cabinStyle === 'bubble' && d.cross === 'vee';
// The 90s supercar gets its own detail (centre driving seat, lamp pods, mesh tail and so on), recognised the same way
const isSuper90 = d => d.lamps === 'pods' && d.cabinStyle === 'tallglass' && d.scoop === 'snorkel';
// The Longtail gets its own detail too (three seats under the canopy, slim lamp strips, a light bar and flaps at the tail tip)
const isLongtail = d => d.lamps === 'slim' && d.cabinStyle === 'canopy' && !!d.wheelCovers && !!d.tailBar;
// The Electric gets its own detail as well (blade lamps, glass panels in the roof, a louvred bonnet vent, a charging flap, a meshed tail with a strip of light)
const isElectric = d => d.lamps === 'blade' && d.cabinStyle === 'tallglass' && d.scoop === 'bonnetvent';
// The 70s wedge gets its own detail too (visor windscreen you can see through, louvre slats, big round tail lamps, a rally car's touches)
const isWedge70 = d => d.lamps === 'hidden' && d.cabinStyle === 'visor' && d.scoop === 'louvres';
// The 60s GT gets its own detail as well (a framed glasshouse you can see into, chrome trim, wood and leather inside)
const isGT60 = d => d.lamps === 'round' && d.cabinStyle === 'glasshouse' && d.grille === 'shield';
const isDetailed = d => isHyper(d) || isSuper90(d) || isLongtail(d) || isElectric(d) || isWedge70(d) || isGT60(d);
// Does the driver sit in the middle? (the 90s supercar and the Longtail, recognised by their parts, so it still holds after the sliders are moved)
export const centreSeat = d => isSuper90(d) || isLongtail(d);
// Where a point on the body's skin falls on the paint picture, for the cross-section at s (matches loftUV: v by distance round the ring)
function ringV(p, pr, s) {
    const K = 84, pts = [], cum = [0], w = pr.width(s), e = 0.5 + (pr.q.round - 0.38) * 0.6;
    for (let k = 0; k <= K; k++) {
        const a = ((k % K) / K) * Math.PI * 2 - Math.PI / 2, c = Math.cos(a), sn = Math.sin(a);
        const u = spow(c, pr.q.round), v = spow(sn, e), yt = pr.topAt(s, u), yb = Math.min(yt - 0.03, pr.bottomAt(s, u)), mid = (yt + yb) / 2;
        pts.push([v >= 0 ? lerp(mid, yt, v) : lerp(mid, yb, -v), u * w * (1 - Math.max(0, v) * 0.06)]);
        if (k) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
    }
    const vK = kf => { const i = Math.min(K - 1, Math.floor(kf)); return lerp(cum[i], cum[i + 1], kf - i) / cum[K]; };
    return {
        // on the top of the body, u across (0 = middle, 1 = right edge)
        atU: u => vK((Math.acos(Math.pow(Math.min(1, Math.max(0, u)), 1 / pr.q.round)) + Math.PI / 2) / (Math.PI * 2) * K),
        // on the right side of the body, at height y
        atY: y => { for (let k = 2; k < K / 2 - 1; k++) if (pts[k][0] <= y && pts[k + 1][0] > y) return vK(k + (y - pts[k][0]) / (pts[k + 1][0] - pts[k][0])); return vK(K / 4); },
        // on the top of the body again, but worked out from the body's own points (exact even near the middle, where those points are far apart)
        atUx: u => { const a = Math.min(0.985, Math.max(0, u)), z = a * w * (1 - Math.pow(Math.sqrt(1 - Math.pow(a, 2 / pr.q.round)), e) * 0.06);
            for (let k = K / 4; k < K / 2; k++) if (pts[k][1] >= z && pts[k + 1][1] <= z) return vK(k + (pts[k][1] - z) / Math.max(1e-6, pts[k][1] - pts[k + 1][1])); return 0.5; }
    };
}
// Panel shut-lines, flush door handles, the fuel cap, side air intakes and engine-cover vents, drawn into the paint so they
// follow the body exactly whatever the sliders are set to (and cut through stripes and stickers, as real panel gaps do)
// The drawing tools the panel lines share: where things are on the paint picture, and a shut-line pen
function panelTools(x, d, W, H, Y, pxU, pxV) {
    const pr = profiles(d), k = pxV / pxU, rings = new Map();
    const R = s => { if (!rings.has(s)) rings.set(s, ringV(d, pr, s)); return rings.get(s); };
    const archR = (d.wheel + 0.055) / d.L, yLo = d.ride + 0.12, top = pr.q.cabinWB + 0.03;
    const PY = v => Y(v) / k;
    const each = fn => { for (const m of [0, 1]) fn(v => PY(m ? 1 - v : v), m); };
    const line = (pts, width = 0.008) => each(P => {
        for (const [col, off, wd] of [['rgba(255,255,255,0.16)', 0.9, width * 0.6], ['rgba(0,0,0,0.72)', 0, width]]) {
            x.strokeStyle = col; x.lineWidth = wd * pxU; x.lineJoin = 'round'; x.lineCap = 'round'; x.beginPath();
            pts.forEach(([u, v], i) => i ? x.lineTo(u * W + off, P(v) + off) : x.moveTo(u * W + off, P(v) + off)); x.stroke();
        }
    });
    const vTop = s => R(s).atU(top), vLow = s => R(s).atY(yLo);
    // a flush door handle: a slim slot at s, part-way (f) up the door
    const handle = (s, f) => each(P => { const v = lerp(vLow(s), vTop(s), f); x.fillStyle = 'rgba(0,0,0,0.78)'; x.beginPath(); x.roundRect((s - 0.016) * W, P(v) - 0.011 * pxU, 0.032 * W, 0.022 * pxU, 0.011 * pxU); x.fill();
        x.fillStyle = 'rgba(255,255,255,0.22)'; x.fillRect((s - 0.013) * W, P(v) + 0.006 * pxU * (P(0) < P(1) ? -1 : 1), 0.026 * W, 0.003 * pxU); });
    // a side air intake from s0 back to s1: a dark opening that widens towards the back, with slats
    const intake = (s0, s1, slats) => each(P => {
        const hi = pr.surfAt(s1, 0.97), a = lerp(yLo, hi, 0.24), b = lerp(yLo, hi, 0.66), mid = lerp(a, b, 0.4);
        const at = (s, y) => [s * W, P(R(s).atY(y))];
        const shape = inset => { x.beginPath(); x.moveTo(...at(s0 + inset * 2, mid)); for (let i = 1; i <= 6; i++) { const t = i / 6, s = lerp(s0, s1 - inset, t); x.lineTo(...at(s, lerp(mid, b - inset * 2, Math.pow(t, 0.7)))); }
            for (let i = 6; i >= 1; i--) { const t = i / 6, s = lerp(s0, s1 - inset, t); x.lineTo(...at(s, lerp(mid, a + inset * 2, Math.pow(t, 0.8)))); } x.closePath(); };
        const edge = (f, e, shift = 0) => t => at(lerp(s0, s1, t) - shift, lerp(mid, lerp(a, b, f), Math.pow(t, e)));
        const run = (fn, t0 = 0, t1 = 1, first = true) => { for (let i = 0; i <= 8; i++) { const q = fn(lerp(t0, t1, i / 8)); first && !i ? x.moveTo(...q) : x.lineTo(...q); } };
        // the opening gets darker towards the back, where it is deepest
        const g = x.createLinearGradient(s0 * W, 0, s1 * W, 0); g.addColorStop(0, '#2b2e34'); g.addColorStop(0.35, '#101114'); g.addColorStop(1, '#000000');
        shape(0); x.fillStyle = g; x.fill();
        // the inner floor of the duct catches the light: a wedge of the body colour along the bottom, fading into the dark
        x.save(); shape(0); x.clip();
        x.beginPath(); run(edge(0, 0.8)); run(edge(0.34, 0.78), 1, 0, false); x.closePath(); x.globalAlpha = 0.42; x.fillStyle = d.paint; x.fill();
        x.globalAlpha = 1; x.strokeStyle = 'rgba(0,0,0,0.9)'; x.lineWidth = 0.05 * pxU; x.beginPath(); run(edge(1.12, 0.7)); x.stroke();        // shadow under the top edge
        x.strokeStyle = 'rgba(120,128,140,0.8)'; x.lineWidth = 0.009 * pxU;
        for (const f of slats) { x.beginPath(); run(edge(f, 0.75, 0.004), 0.3, 1); x.stroke(); }
        x.restore();
        x.strokeStyle = 'rgba(255,255,255,0.45)'; x.lineWidth = 0.007 * pxU; x.lineCap = 'round'; x.beginPath(); run(edge(-0.035, 0.8), 0.08, 1); x.stroke();   // the lit lower lip
        x.strokeStyle = 'rgba(0,0,0,0.55)'; x.lineWidth = 0.008 * pxU; x.beginPath(); run(edge(1.03, 0.7), 0.05, 1); x.stroke();
    });
    return { pr, k, R, archR, yLo, top, PY, each, line, vTop, vLow, handle, intake };
}
function panelLines(x, d, W, H, Y, pxU, pxV) {
    const { pr, k, R, archR, yLo, PY, each, line, vTop, vLow, handle, intake } = panelTools(x, d, W, H, Y, pxU, pxV);
    const dA = pr.frontAxle + archR + 0.026, rearArch = pr.rearAxle - archR, dB = lerp(dA, rearArch, 0.5);
    x.save(); x.scale(1, k);                                      // (so lines are the same thickness along and around the body)
    // doors: front edge, sill and back edge (the top is the window line)
    const door = [[dA + 0.014, vTop(dA + 0.014)], [dA, lerp(vLow(dA), vTop(dA), 0.3)], [dA + 0.012, vLow(dA + 0.012)]];
    for (let i = 1; i <= 5; i++) { const s = lerp(dA + 0.012, dB - 0.012, i / 5); door.push([s, vLow(s)]); }
    door.push([dB, lerp(vLow(dB), vTop(dB), 0.25)], [dB + 0.014, vTop(dB + 0.014)]);
    line(door);
    handle(dB - 0.03, 0.74);                                      // flush door handles: a slim slot near the back of each door
    intake(dB + 0.055, rearArch - 0.012, [0.52, 0.76]);          // a side air intake in front of each back wheel, with two slats
    // fuel filler cap, on the left side only, above the intake
    { const s = lerp(dB, rearArch, 0.42), v = 1 - lerp(vLow(s), vTop(s), 0.86), r = 0.062 * pxU;
        for (const [col, off] of [['rgba(255,255,255,0.16)', 0.9], ['rgba(0,0,0,0.72)', 0]]) { x.strokeStyle = col; x.lineWidth = 0.008 * pxU; x.beginPath(); x.arc(s * W + off, PY(v) + off, r, 0, Math.PI * 2); x.stroke(); } }
    // bumper joins at the front and back corners
    for (const s of [Math.max(0.03, pr.frontAxle - archR - 0.022), Math.min(0.975, pr.rearAxle + archR + 0.022)]) line([[s, R(s).atY(pr.base(s) + 0.04)], [s, R(s).atU(0.96)]], 0.006);
    // engine cover behind the cabin: its outline, a centre spine, and rows of cooling slots either side
    const e0 = pr.c1 + 0.012, e1 = 0.945, half = s => lerp(0.56, 0.66, (s - e0) / (e1 - e0)), cover = [];
    for (let i = 0; i <= 8; i++) { const s = lerp(e0, e1, i / 8); cover.push([s, R(s).atU(half(s))]); }
    line(cover); line([[e0, 0.5], [e0, R(e0).atU(half(e0))]], 0.006); line([[e1, 0.5], [e1, R(e1).atU(half(e1))]]);
    each(P => { x.strokeStyle = 'rgba(0,0,0,0.8)'; x.lineWidth = 0.02 * pxU; x.lineCap = 'round';
        for (let i = 0; i < 6; i++) { const s = lerp(e0 + 0.03, e1 - 0.035, i / 5); x.beginPath(); x.moveTo(s * W, P(R(s).atU(0.16))); x.lineTo((s + 0.008) * W, P(R(s).atU(half(s) - 0.13))); x.stroke(); } });
    x.restore();
}
// Where the 90s supercar's lamp pods sit (how far back, how far out), and where its doors start and end
const POD90 = { s: 0.075, f: 0.84 };
function doors90(pr) { const span = pr.c1 - pr.c0, rake = (pr.rakeEnd - pr.c0) / span; return { span, rake, uP: rake * 0.75, sP: pr.c0 + span * (rake * 0.75 + 0.02), sB: pr.c0 + span * 0.57 }; }
// The 90s supercar's panel lines: doors that cut up into the roof (they carry on in the cabin's own picture), the front lid,
// long side intakes that start in the doors, the dark beds under the lamp covers, a vent behind each front wheel and the fuel flap
function panelLines90(x, d, W, H, Y, pxU, pxV) {
    const { pr, k, R, archR, yLo, PY, each, line, vTop, vLow, handle, intake } = panelTools(x, d, W, H, Y, pxU, pxV);
    const fArch = pr.frontAxle + archR, rearArch = pr.rearAxle - archR, D = doors90(pr);
    const dA = fArch + 0.03, dB = Math.max(dA + 0.12, Math.min(D.sB, rearArch - 0.03)), sP = Math.min(dB - 0.08, Math.max(dA + 0.03, D.sP));
    x.save(); x.scale(1, k);
    // doors: the front edge slants down and forwards from the foot of the windscreen pillar, then the sill and an upright back edge
    const sM = lerp(sP, dA, 0.65), door = [[sP, vTop(sP)], [sM, lerp(vLow(sM), vTop(sM), 0.5)], [dA, lerp(vLow(dA), vTop(dA), 0.16)], [dA + 0.012, vLow(dA + 0.012)]];
    for (let i = 1; i <= 5; i++) { const s = lerp(dA + 0.012, dB - 0.01, i / 5); door.push([s, vLow(s)]); }
    door.push([dB, lerp(vLow(dB), vTop(dB), 0.2)], [dB, vTop(dB)]);
    line(door);
    intake(lerp(dA, dB, 0.42), rearArch - 0.012, [0.42, 0.62, 0.82]);
    handle(dB - 0.04, 0.84);
    // front lid: a wide panel on the nose between the lamps, hinged at the windscreen
    const l0 = 0.115, l1 = Math.max(l0 + 0.04, pr.c0 - 0.022), lh = s => lerp(0.5, 0.64, (s - l0) / (l1 - l0)), lid = [[l0, 0.5]];
    for (let i = 0; i <= 8; i++) { const s = lerp(l0, l1, i / 8); lid.push([s, R(s).atU(lh(s))]); }
    lid.push([l1, 0.5]); line(lid, 0.007);
    // the dark bed under each lamp cover (the lamps and their clear cover are real parts sitting in it)
    each((P, m) => { const w = pr.width(POD90.s), pts = [];
        for (let i = 0; i < 20; i++) { const t = i / 20 * Math.PI * 2, al = 0.245 * Math.cos(t), ac = 0.1 * Math.sin(t), fw = al * 0.94 + ac * 0.34, out = ac * 0.94 - al * 0.34;
            const s = Math.max(0.012, POD90.s - fw / d.L), u = Math.min(0.985, Math.max(0.3, POD90.f + out / w)); pts.push([s * W, P(R(s).atU(u))]); }
        x.beginPath(); pts.forEach((q, i) => i ? x.lineTo(...q) : x.moveTo(...q)); x.closePath();
        // (a bright rim round it, like the polished edge of the lamp opening, then the dark bed with a soft shadowed edge)
        x.lineJoin = 'round'; x.strokeStyle = 'rgba(225,230,236,0.7)'; x.lineWidth = 0.026 * pxU; x.stroke(); x.strokeStyle = 'rgba(0,0,0,0.45)'; x.lineWidth = 0.014 * pxU; x.stroke();
        x.fillStyle = '#0a0b0e'; x.fill(); x.strokeStyle = '#0a0b0e'; x.lineWidth = 0.006 * pxU; x.stroke(); });
    // a slim outlet vent behind each front wheel
    each(P => { const s = fArch + 0.013, y0 = d.ride + 0.2, y1 = Math.max(y0 + 0.08, lerp(y0, pr.surfAt(s, 0.97), 0.62));
        for (const [col, wd, off] of [['rgba(255,255,255,0.2)', 0.03, 1], ['#07080a', 0.028, 0]]) { x.strokeStyle = col; x.lineWidth = wd * pxU; x.lineCap = 'round'; x.beginPath(); x.moveTo(s * W + off, P(R(s).atY(y0))); x.lineTo((s + 0.004) * W + off, P(R(s + 0.004).atY(y1))); x.stroke(); } });
    // fuel filler flap: a rounded square high on the right side, behind the door
    { const s = lerp(dB, rearArch, 0.55), v = lerp(vLow(s), vTop(s), 0.9), r = 0.06 * pxU;
        for (const [col, off] of [['rgba(255,255,255,0.16)', 0.9], ['rgba(0,0,0,0.72)', 0]]) { x.strokeStyle = col; x.lineWidth = 0.008 * pxU; x.beginPath(); x.roundRect(s * W - r + off, PY(v) - r + off, r * 2, r * 2, r * 0.35); x.stroke(); } }
    // bumper joins at the front and back corners
    for (const s of [Math.max(0.03, pr.frontAxle - archR - 0.022), Math.min(0.975, pr.rearAxle + archR + 0.022)]) line([[s, R(s).atY(pr.base(s) + 0.04)], [s, R(s).atU(0.96)]], 0.006);
    x.restore();
}
// Where the Longtail's doors start and end, along the body (sA, sB) and along the cabin's picture (uA, uB)
function doorsLT(pr) {
    const span = pr.c1 - pr.c0, archR = (pr.wheelR + 0.055) / pr.q.L, fArch = pr.frontAxle + archR, rearArch = pr.rearAxle - archR;
    const sA = fArch + 0.03, sB = Math.max(sA + 0.12, Math.min(pr.c0 + span * 0.5, rearArch - 0.04));
    return { span, fArch, rearArch, sA, sB, uA: Math.max(0.05, (sA - pr.c0) / span + 0.02), uB: Math.min(0.62, (sB - pr.c0) / span) };
}
const COPPER = '#b9763c';
// the line each of the Longtail's slim lamps follows over the nose: [how far back, how far out] from its inner end (t = 0) to its outer end (t = 1)
const lampLT = t => [0.017 + 0.05 * t * t, lerp(0.3, 0.93, t)];
// The Longtail's panel lines: smooth flanks with few joins. Doors that carry on up into the canopy, the front lid, the long
// engine cover, the two bending flaps at the tip of the tail, slim nose intakes, a fuel flap and a fine copper line along the sills
function panelLinesLT(x, d, W, H, Y, pxU, pxV) {
    const { pr, k, R, archR, yLo, PY, each, line, vTop, vLow, handle } = panelTools(x, d, W, H, Y, pxU, pxV);
    const D = doorsLT(pr), dA = D.sA, dB = D.sB, fArch = D.fArch, rearArch = D.rearArch, ev = d.engine === 'ev';
    x.save(); x.scale(1, k);
    // a fine copper line low along each side, from wheel to wheel
    each(P => { x.strokeStyle = COPPER; x.lineWidth = 0.014 * pxU; x.lineCap = 'round'; x.beginPath();
        for (let i = 0; i <= 12; i++) { const s = lerp(fArch + 0.012, rearArch - 0.012, i / 12), q = [s * W, P(R(s).atY(d.ride + 0.16))]; i ? x.lineTo(...q) : x.moveTo(...q); } x.stroke(); });
    // doors: the front edge leans forward to the foot of the windscreen pillar; the back edge is upright (both carry on in the cabin's picture)
    const sM = lerp(dA, dA + 0.02, 0.5), door = [[dA + 0.03, vTop(dA + 0.03)], [sM, lerp(vLow(sM), vTop(sM), 0.5)], [dA, lerp(vLow(dA), vTop(dA), 0.18)], [dA + 0.012, vLow(dA + 0.012)]];
    for (let i = 1; i <= 5; i++) { const s = lerp(dA + 0.012, dB - 0.01, i / 5); door.push([s, vLow(s)]); }
    door.push([dB, lerp(vLow(dB), vTop(dB), 0.2)], [dB, vTop(dB)]);
    line(door);
    handle(dB - 0.032, 0.8);
    // a slim outlet behind each front wheel, low in the door
    each(P => { const s = dA + 0.03, y0 = d.ride + 0.17, y1 = Math.max(y0 + 0.06, lerp(y0, pr.surfAt(s, 0.97), 0.42));
        for (const [col, wd, off] of [['rgba(255,255,255,0.2)', 0.028, 1], ['#07080a', 0.026, 0]]) { x.strokeStyle = col; x.lineWidth = wd * pxU; x.lineCap = 'round'; x.beginPath(); x.moveTo(s * W + off, P(R(s).atY(y0))); x.lineTo((s + 0.012) * W + off, P(R(s + 0.012).atY(y1))); x.stroke(); } });
    // front lid: one wide panel from behind the lamps to the windscreen
    const l0 = 0.075, l1 = Math.max(l0 + 0.04, pr.c0 - 0.016), lh = s => lerp(0.42, 0.7, (s - l0) / (l1 - l0)), lid = [[l0, 0.5]];
    for (let i = 0; i <= 8; i++) { const s = lerp(l0, l1, i / 8); lid.push([s, R(s).atU(lh(s))]); }
    lid.push([l1, 0.5]); line(lid, 0.007);
    // the dark bed under each slim lamp's clear cover (the strip of light and the lenses are real parts sitting on it), with a fine bright edge
    each(P => { const h = 0.0088, pts = [];
        for (let i = 0; i <= 14; i++) { const [s, u] = lampLT(i / 14); pts.push([(s - h * lerp(0.55, 1, i / 14)) * W, P(R(s - h).atU(u))]); }
        for (let i = 14; i >= 0; i--) { const [s, u] = lampLT(i / 14); pts.unshift([(s + h * lerp(0.55, 1, i / 14)) * W, P(R(s + h).atU(u))]); }
        x.beginPath(); pts.forEach((q, i) => i ? x.lineTo(...q) : x.moveTo(...q)); x.closePath();
        x.lineJoin = 'round'; x.strokeStyle = 'rgba(228,232,238,0.45)'; x.lineWidth = 0.012 * pxU; x.stroke(); x.strokeStyle = 'rgba(0,0,0,0.5)'; x.lineWidth = 0.007 * pxU; x.stroke(); x.fillStyle = '#0d0f13'; x.fill(); });
    // slim nose intakes, one under each lamp at the corner: dark, deeper towards the back, with a lit lower lip
    each(P => { const s0 = 0.014, s1 = 0.052, at = (s, f) => { const b = pr.base(s) + 0.03, t = pr.surfAt(s, 0.93); return [s * W, P(R(s).atY(lerp(b, t, f)))]; };
        const g = x.createLinearGradient(s0 * W, 0, s1 * W, 0); g.addColorStop(0, '#30333a'); g.addColorStop(0.4, '#0d0e11'); g.addColorStop(1, '#000');
        const sm = lerp(s0, s1, 0.5), shape = () => { x.beginPath(); x.moveTo(...at(s0 + 0.004, 0.3)); x.lineTo(...at(sm, 0.22)); x.lineTo(...at(s1, 0.25)); x.lineTo(...at(s1, 0.43)); x.lineTo(...at(sm, 0.47)); x.lineTo(...at(s0 + 0.004, 0.42)); x.closePath(); };
        shape(); x.fillStyle = g; x.fill();
        x.save(); shape(); x.clip(); x.globalAlpha = 0.5; x.fillStyle = d.paint; x.beginPath(); x.moveTo(...at(s0, 0.3)); x.lineTo(...at(sm, 0.22)); x.lineTo(...at(s1, 0.25)); x.lineTo(...at(s1 - 0.012, 0.31)); x.lineTo(...at(s0, 0.36)); x.fill(); x.restore(); shape();   // (the floor of the duct catches the light)
        x.strokeStyle = 'rgba(0,0,0,0.6)'; x.lineWidth = 0.008 * pxU; x.lineJoin = 'round'; x.stroke();
        x.strokeStyle = 'rgba(255,255,255,0.5)'; x.lineWidth = 0.006 * pxU; x.beginPath(); x.moveTo(...at(s0 + 0.006, 0.275)); x.lineTo(...at(sm, 0.195)); x.lineTo(...at(s1, 0.225)); x.stroke();
        x.strokeStyle = 'rgba(120,128,140,0.75)'; x.lineWidth = 0.007 * pxU; x.beginPath(); x.moveTo(...at(s0 + 0.008, 0.37)); x.lineTo(...at(s1 - 0.002, 0.36)); x.stroke(); });
    // the long engine cover: its edges run back along the tail to the flaps, with a fine line down the middle
    const e0 = pr.c1 + 0.01, e1 = 0.925, half = 0.6, cover = [];
    for (let i = 0; i <= 8; i++) { const s = lerp(e0, e1, i / 8); cover.push([s, R(s).atU(half)]); }
    line(cover, 0.007); line([[e0, 0.5], [e0, R(e0).atU(half)]], 0.006);
    // the flaps at the tip of the tail: two panels of the skin itself that bend up and down, each marked out by a slit at either end
    each(P => { const a0 = e1, a1 = 0.997;
        for (const [u, wd] of [[0.1, 0.008], [0.86, 0.008]]) for (const [col, off] of [['rgba(255,255,255,0.16)', 0.9], ['rgba(0,0,0,0.78)', 0]]) {
            x.strokeStyle = col; x.lineWidth = wd * pxU; x.lineCap = 'round'; x.beginPath(); for (let i = 0; i <= 4; i++) { const s = lerp(a0, a1, i / 4), q = [s * W + off, P(R(s).atU(u)) + off]; i ? x.lineTo(...q) : x.moveTo(...q); } x.stroke(); }
        // (where each flap bends there is no join, just a soft crease)
        x.strokeStyle = 'rgba(0,0,0,0.3)'; x.lineWidth = 0.012 * pxU; x.beginPath(); x.moveTo(a0 * W, P(R(a0).atU(0.1))); x.lineTo(a0 * W, P(R(a0).atU(0.86))); x.stroke();
        x.strokeStyle = 'rgba(255,255,255,0.14)'; x.lineWidth = 0.005 * pxU; x.beginPath(); x.moveTo((a0 + 0.0025) * W, P(R(a0).atU(0.1))); x.lineTo((a0 + 0.0025) * W, P(R(a0).atU(0.86))); x.stroke(); });
    // fuel flap: a rounded oblong high on the right side behind the door (a hybrid or electric car has a charging flap on the left as well)
    for (const left of d.engine === 'hybrid' || ev ? [0, 1] : [0]) { const s = lerp(dB, rearArch, 0.5), v0 = lerp(vLow(s), vTop(s), 0.88), v = left ? 1 - v0 : v0, r = 0.055 * pxU;
        for (const [col, off] of [['rgba(255,255,255,0.16)', 0.9], ['rgba(0,0,0,0.72)', 0]]) { x.strokeStyle = col; x.lineWidth = 0.008 * pxU; x.beginPath(); x.roundRect(s * W - r * 1.3 + off, PY(v) - r + off, r * 2.6, r * 2, r * 0.6); x.stroke(); } }
    x.restore();
}
// Where the Electric's doors start and end, along the body (sA, sB, and sP: the foot of the windscreen pillar) and along the cabin's picture (uP, uB)
function doorsEV(pr) {
    const span = pr.c1 - pr.c0, rake = (pr.rakeEnd - pr.c0) / span, archR = (pr.wheelR + 0.055) / pr.q.L, fArch = pr.frontAxle + archR, rearArch = pr.rearAxle - archR;
    // (the door's top corners are worked out along the cabin, then the body's lines are drawn to meet them, so the cuts line up wherever the cabin sliders are)
    const sA = fArch + 0.028, uP = Math.min(rake - 0.04, Math.max(0.03, (Math.max(sA + 0.02, pr.c0 + span * (rake * 0.72 + 0.02)) - pr.c0) / span - 0.02));
    const uB = Math.min(0.62, Math.max(rake + 0.14, (Math.max(sA + 0.12, Math.min(pr.c0 + span * 0.56, rearArch - 0.035)) - pr.c0) / span));
    return { span, rake, fArch, rearArch, uP, sP: pr.c0 + span * (uP + 0.02), sA, sB: pr.c0 + span * uB, uB };
}
const EVBLUE = '#35c8ff';
// the line each of the Electric's blade lamps follows: from its inner end on the nose (t = 0), sweeping back along the top of the wing (t = 1)
const lampEV = t => [0.028 + 0.08 * Math.pow(t, 1.6), lerp(0.48, 0.9, t)];
// the opening of the Electric's bonnet vent: from s0 back to s1, and how far out across the bonnet it reaches at each end
const VENT_EV = { s0: 0.088, s1: 0.142, u0: 0.4, u1: 0.48 };
// where the charging flap sits: on top of the left rear wing, over the wheel
const chargeEV = pr => [pr.rearAxle - 0.012, 0.8];
// The Electric's panel lines: doors that open up into the roof (they carry on in the cabin's own picture), the front lid round
// the bonnet vent, the opening of that vent, the beds of the blade lamps, deep side intakes that start in the doors, the rear
// clamshell, a carbon strip along the sills and a charging flap with a ring of light (or a fuel flap, if it has a petrol engine)
function panelLinesEV(x, d, W, H, Y, pxU, pxV) {
    const { pr, k, R, archR, PY, each, line, vTop, vLow, handle, intake } = panelTools(x, d, W, H, Y, pxU, pxV);
    const D = doorsEV(pr), dA = D.sA, fArch = D.fArch, rearArch = D.rearArch, sP = D.sP, dB = Math.max(dA + 0.1, Math.min(D.sB, rearArch - 0.02)), plug = d.engine === 'ev' || d.engine === 'hybrid';
    x.save(); x.scale(1, k);
    // a slim carbon strip low along each side, from wheel to wheel, with a fine bright edge
    each(P => { for (const [col, y, wd] of [['#0c0d10', d.ride + 0.115, 0.034], ['rgba(170,178,190,0.45)', d.ride + 0.134, 0.004]]) { x.strokeStyle = col; x.lineWidth = wd * pxU; x.lineCap = 'butt'; x.beginPath();
        for (let i = 0; i <= 12; i++) { const s = lerp(fArch + 0.006, rearArch - 0.006, i / 12), q = [s * W, P(R(s).atY(y))]; i ? x.lineTo(...q) : x.moveTo(...q); } x.stroke(); } });
    // doors: the front edge slants down and forwards from the foot of the windscreen pillar, then the sill and an upright back edge
    const sM = lerp(sP, dA, 0.6), door = [[sP, vTop(sP)], [sM, lerp(vLow(sM), vTop(sM), 0.55)], [dA, lerp(vLow(dA), vTop(dA), 0.2)], [dA + 0.012, vLow(dA + 0.012)]];
    for (let i = 1; i <= 5; i++) { const s = lerp(dA + 0.012, dB - 0.01, i / 5); door.push([s, vLow(s)]); }
    door.push([dB, lerp(vLow(dB), vTop(dB), 0.2)], [D.sB, vTop(D.sB)]);
    line(door);
    intake(lerp(dA, dB, 0.5), rearArch - 0.012, [0.45, 0.7]);    // a deep side intake that starts in the door and opens out in front of the back wheel
    handle(dB - 0.04, 0.87);                                      // flush pop-out handles
    // front lid: from behind the lamps to the windscreen, round the bonnet vent
    const l0 = 0.062, l1 = Math.max(l0 + 0.04, pr.c0 - 0.02), lh = s => lerp(0.4, 0.7, Math.min(1, (s - l0) / (l1 - l0) * 1.6)), lid = [[l0, 0.5]];
    for (let i = 0; i <= 10; i++) { const s = lerp(l0, l1, i / 10); lid.push([s, R(s).atU(lh(s))]); }
    lid.push([l1, 0.5]); line(lid, 0.007);
    // the bonnet vent's opening: dark and deep at the front, with its floor rising into the light at the back (the louvres are real parts over it)
    each(P => { const B = VENT_EV, N = 8, pts = [];
        for (let i = 0; i <= N; i++) pts.push([B.s0 * W, P(R(B.s0).atU(B.u0 * i / N))]);
        for (let i = N; i >= 0; i--) pts.push([B.s1 * W, P(R(B.s1).atU(B.u1 * i / N))]);
        const g = x.createLinearGradient(B.s0 * W, 0, B.s1 * W, 0); g.addColorStop(0, '#000'); g.addColorStop(0.55, '#0b0c0f'); g.addColorStop(1, '#2a2d33');
        x.beginPath(); pts.forEach((q, i) => i ? x.lineTo(...q) : x.moveTo(...q)); x.closePath(); x.fillStyle = g; x.fill(); x.lineJoin = 'round'; x.strokeStyle = '#050506'; x.lineWidth = 0.008 * pxU; x.stroke();
        x.strokeStyle = 'rgba(255,255,255,0.4)'; x.lineWidth = 0.006 * pxU; x.beginPath(); for (let i = 0; i <= N; i++) { const q = [(B.s1 + 0.0022) * W, P(R(B.s1).atU(B.u1 * i / N))]; i ? x.lineTo(...q) : x.moveTo(...q); } x.stroke(); });
    // the dark bed under each blade lamp's clear cover (the strip of light and the lenses are real parts sitting on it), with a fine bright edge
    each(P => { const h = 0.0105, pts = [];
        for (let i = 0; i <= 14; i++) { const [s, u] = lampEV(i / 14); pts.push([(s - h * lerp(0.4, 1, i / 14)) * W, P(R(s - h).atU(u))]); }
        for (let i = 14; i >= 0; i--) { const [s, u] = lampEV(i / 14); pts.unshift([(s + h * lerp(0.4, 1, i / 14)) * W, P(R(s + h).atU(u))]); }
        x.beginPath(); pts.forEach((q, i) => i ? x.lineTo(...q) : x.moveTo(...q)); x.closePath();
        x.lineJoin = 'round'; x.strokeStyle = 'rgba(228,232,238,0.45)'; x.lineWidth = 0.012 * pxU; x.stroke(); x.strokeStyle = 'rgba(0,0,0,0.5)'; x.lineWidth = 0.007 * pxU; x.stroke(); x.fillStyle = '#0d0f13'; x.fill(); });
    // the rear clamshell: its edge runs back from the top of each door, out over the rear wing, and across the tail
    const sE = 0.968, cs = [];
    for (let i = 0; i <= 10; i++) { const s = lerp(Math.min(D.sB, sE - 0.1), sE, i / 10); cs.push([s, R(s).atU(lerp(pr.q.cabinWB + 0.03, 0.9, Math.min(1, i / 3)))]); }
    cs.push([sE, 0.5]); line(cs, 0.007);
    // on top of the left rear wing: a charging flap (electric and hybrid), a rounded flap with a ring of light round the socket's cover; or a round fuel flap (petrol)
    if (!plug) { const [s, u] = chargeEV(pr), cx = s * W, cy = PY(1 - R(s).atU(u)), r = 0.052 * pxU;
        for (const [col, off] of [['rgba(255,255,255,0.16)', 0.9], ['rgba(0,0,0,0.72)', 0]]) { x.strokeStyle = col; x.lineWidth = 0.008 * pxU; x.beginPath(); x.arc(cx + off, cy + off, r, 0, Math.PI * 2); x.stroke(); }
        x.fillStyle = 'rgba(0,0,0,0.6)'; x.beginPath(); x.roundRect(cx + r * 0.45, cy - r * 0.22, r * 0.3, r * 0.44, r * 0.1); x.fill();
    } else { const [s, u] = chargeEV(pr), cx = s * W, cy = PY(1 - R(s).atU(u)), r = 0.05 * pxU;
        for (const [col, off] of [['rgba(255,255,255,0.16)', 0.9], ['rgba(0,0,0,0.72)', 0]]) { x.strokeStyle = col; x.lineWidth = 0.008 * pxU; x.beginPath(); x.roundRect(cx - r * 1.25 + off, cy - r + off, r * 2.5, r * 2, r * 0.55); x.stroke(); }
        x.fillStyle = 'rgba(0,0,0,0.5)'; x.beginPath(); x.arc(cx, cy, 0.03 * pxU, 0, Math.PI * 2); x.fill(); x.strokeStyle = EVBLUE; x.lineWidth = 0.007 * pxU; x.beginPath(); x.arc(cx, cy, 0.022 * pxU, 0, Math.PI * 2); x.stroke(); }
    // bumper joins at the front and back corners
    for (const s of [Math.max(0.03, pr.frontAxle - archR - 0.022), Math.min(0.975, pr.rearAxle + archR + 0.022)]) line([[s, R(s).atY(pr.base(s) + 0.04)], [s, R(s).atU(0.96)]], 0.006);
    x.restore();
}
// Where the 70s wedge's doors start and end (worked out along the cabin first, so the body's lines meet the cabin's)
function doors70(pr) {
    const span = pr.c1 - pr.c0, rake = (pr.rakeEnd - pr.c0) / span, roofEnd = (pr.roofEnd - pr.c0) / span, archR = (pr.wheelR + 0.055) / pr.q.L, fArch = pr.frontAxle + archR, rearArch = pr.rearAxle - archR;
    const sA = Math.max(fArch + 0.02, pr.c0 + 0.03), uP = Math.min(rake - 0.1, Math.max(0.06, (sA + 0.015 - pr.c0) / span));
    const uB = Math.min(0.9, Math.max(rake + 0.14, (Math.min(rearArch - 0.03, pr.c0 + span * (roofEnd - 0.03)) - pr.c0) / span));
    return { span, rake, roofEnd, fArch, rearArch, sA, uP, sP: pr.c0 + span * uP, uB, sB: pr.c0 + span * uB };
}
// Where the 70s wedge's louvres go: two banks of slats on the bonnet, and a row right across the engine cover behind the cabin
function louvres70(pr) {
    const front = [], rear = [], r0 = pr.c1 + 0.045, n = Math.max(0, Math.min(6, Math.floor((0.9 - r0) / 0.027) + 1));
    for (let i = 0; i < 5; i++) { const s = 0.108 + i * 0.021; if (s < pr.c0 - 0.03) front.push(s); }
    for (let i = 0; i < n; i++) rear.push(r0 + i * 0.027);
    return { front, rear, fu: [0.1, 0.47], ru: 0.47 };   // (kept to the flat middle of the body, so every slat is straight)
}
// where the fuel filler cap sits: on the rear deck, behind the cabin on the left
const cap70 = pr => [Math.min(0.9, pr.c1 + 0.05), 0.8];
// how high up the door the handle is, and where along it
function handle70(pr, D) { const s = Math.max(D.sA + 0.05, Math.min(D.sB, D.rearArch - 0.02) - 0.035); return [s, lerp(pr.q.ride + 0.12, pr.surfAt(s, 0.97), 0.8)]; }
// The 70s wedge's panel lines: doors, the front and rear clamshells (the whole nose and the whole tail lift up on the famous
// car), the lids of the pop-up lamps, a slim nose intake, the dark slots under the louvres, a small intake behind each door,
// recessed door handles and the fuel filler (or a charging flap, if it has an electric or hybrid engine)
function panelLines70(x, d, W, H, Y, pxU, pxV) {
    const { pr, k, R, top, PY, each, line, vTop, vLow, intake } = panelTools(x, d, W, H, Y, pxU, pxV);
    const D = doors70(pr), dA = D.sA, rearArch = D.rearArch, dB = Math.max(dA + 0.1, Math.min(D.sB, rearArch - 0.02)), sP = D.sP, plug = d.engine === 'ev' || d.engine === 'hybrid', LV = louvres70(pr);
    x.save(); x.scale(1, k);
    // (a four-sided patch on the top of the body, from s0 back to s1 and from u0 out to u1)
    const patch = (P, s0, s1, u0, u1, n = 6) => { x.beginPath(); for (let i = 0; i <= n; i++) x.lineTo(s0 * W, P(R(s0).atUx(lerp(u0, u1, i / n)))); for (let i = n; i >= 0; i--) x.lineTo(s1 * W, P(R(s1).atUx(lerp(u0, u1, i / n)))); x.closePath(); };
    // doors: a nearly upright front edge from the foot of the windscreen pillar, the sill, and the back edge up to the end of the door glass
    const door = [[sP, vTop(sP)], [dA, lerp(vLow(dA), vTop(dA), 0.45)], [dA + 0.008, vLow(dA + 0.008)]];
    for (let i = 1; i <= 5; i++) { const s = lerp(dA + 0.008, dB - 0.01, i / 5); door.push([s, vLow(s)]); }
    door.push([dB, lerp(vLow(dB), vTop(dB), 0.2)], [D.sB, vTop(D.sB)]);
    line(door);
    // front clamshell: its back edge runs across the bonnet under the windscreen, then along to the top of each door
    const l1 = Math.max(0.08, pr.c0 - 0.014), fc = []; for (let i = 0; i <= 8; i++) fc.push([l1, R(l1).atUx(top * i / 8)]);
    fc.push([sP, vTop(sP)]); line(fc, 0.007);
    // rear clamshell: its front edge runs across behind the cabin, then forward to the back of each door
    const sC = Math.min(0.92, pr.c1 + 0.012), rc = []; for (let i = 0; i <= 8; i++) rc.push([sC, R(sC).atUx(top * i / 8)]);
    rc.push([D.sB, vTop(D.sB)]); line(rc, 0.007);
    // the lids of the pop-up lamps, one each side of the nose
    { const a0 = 0.04, a1 = Math.min(0.092, pr.c0 - 0.06), lid = []; for (let i = 0; i <= 5; i++) lid.push([a0, R(a0).atUx(lerp(0.4, 0.8, i / 5))]); for (let i = 5; i >= 0; i--) lid.push([a1, R(a1).atUx(lerp(0.38, 0.84, i / 5))]); lid.push(lid[0]); line(lid, 0.007); }
    // a slim air intake low across the nose: a dark slot with two fine bars along it and a lit lower lip
    each(P => { const s0 = 0.0042, s1 = 0.0122; patch(P, s0, s1, 0, 0.52, 8); x.fillStyle = '#050607'; x.fill();
        x.lineCap = 'butt'; for (const [col, s, wd, u1] of [['rgba(125,132,144,0.8)', lerp(s0, s1, 0.36), 0.0035, 0.51], ['rgba(125,132,144,0.8)', lerp(s0, s1, 0.68), 0.0035, 0.51], ['rgba(255,255,255,0.4)', s0 - 0.0006, 0.003, 0.52]]) {
            x.strokeStyle = col; x.lineWidth = wd * pxU; x.beginPath(); for (let i = 0; i <= 8; i++) x.lineTo(s * W, P(R(s).atUx(u1 * i / 8))); x.stroke(); } });
    // the dark slots under the louvres (the slats themselves are real parts, each tipped up over its slot)
    each(P => { x.fillStyle = '#040506'; for (const s of LV.front) { patch(P, s - 0.004, s + 0.0105, LV.fu[0], LV.fu[1]); x.fill(); } for (const s of LV.rear) { patch(P, s - 0.006, s + 0.016, 0, LV.ru, 8); x.fill(); } });
    // engine cover: its outline round the louvres
    if (LV.rear.length) { const e0 = LV.rear[0] - 0.02, e1 = Math.min(0.955, LV.rear[LV.rear.length - 1] + 0.032), eu = LV.ru + 0.1, ec = [[e0, 0.5]];
        for (let i = 0; i <= 6; i++) { const s = lerp(e0, e1, i / 6); ec.push([s, R(s).atUx(eu)]); } ec.push([e1, 0.5]); line(ec, 0.006); }
    // a small air intake behind each door, in front of the back wheel
    if (rearArch - dB > 0.05) intake(dB + 0.012, rearArch - 0.008, [0.5]);
    // door handles: a small dark recess near the back of each door (the bright handle itself is a real part)
    each(P => { const [s, y] = handle70(pr, D), v = R(s).atY(y); x.fillStyle = 'rgba(0,0,0,0.8)'; x.beginPath(); x.roundRect((s - 0.014) * W, P(v) - 0.017 * pxU, 0.028 * W, 0.034 * pxU, 0.008 * pxU); x.fill(); });
    // on the left of the rear deck: a round fuel filler (its bright cap is a real part), or a rounded charging flap (electric and hybrid)
    { const [s, u] = cap70(pr), cx = s * W, cy = PY(1 - R(s).atUx(u)), r = 0.046 * pxU;
        for (const [col, off] of [['rgba(255,255,255,0.16)', 0.9], ['rgba(0,0,0,0.72)', 0]]) { x.strokeStyle = col; x.lineWidth = 0.008 * pxU; x.beginPath(); if (plug) x.roundRect(cx - r * 1.2 + off, cy - r + off, r * 2.4, r * 2, r * 0.5); else x.arc(cx + off, cy + off, r, 0, Math.PI * 2); x.stroke(); }
        if (plug) { x.fillStyle = 'rgba(0,0,0,0.55)'; x.beginPath(); x.arc(cx, cy, r * 0.5, 0, Math.PI * 2); x.fill(); } else { x.fillStyle = 'rgba(0,0,0,0.6)'; x.beginPath(); x.arc(cx, cy, r * 0.82, 0, Math.PI * 2); x.fill(); } }
    x.restore();
}
// Where the 60s GT's side vents go (one in each front wing, behind the wheel), its fuel filler (on the right rear wing) and its boot lid
function vent60(pr, D) { const v0 = D.fArch + 0.024, v1 = Math.min(D.sA - 0.024, v0 + 0.06), yLo = pr.q.ride + 0.12, hi = pr.surfAt((v0 + v1) / 2, 0.97); return { v0, v1, ya: lerp(yLo, hi, 0.4), yb: lerp(yLo, hi, 0.66), ok: v1 - v0 > 0.03 }; }
function cap60(pr) { const s = Math.min(0.955, pr.rearAxle + (pr.wheelR + 0.055) / pr.q.L + 0.035); return [s, lerp(pr.q.ride + 0.12, pr.surfAt(s, 0.97), 0.72)]; }
// The 60s GT's panel lines: doors that meet the framed windows, the long bonnet, the boot lid, a dark vent in each front wing
// (its chrome strakes are real parts) and the fuel filler (or a charging flap, if it has an electric or hybrid engine)
function panelLines60(x, d, W, H, Y, pxU, pxV) {
    const { pr, k, R, top, PY, each, line, vTop, vLow } = panelTools(x, d, W, H, Y, pxU, pxV);
    const D = doors70(pr), dA = D.sA, dB = Math.max(dA + 0.1, Math.min(D.sB, D.rearArch - 0.02)), sP = D.sP, plug = d.engine === 'ev' || d.engine === 'hybrid';
    x.save(); x.scale(1, k);
    // doors: the front edge drops from the foot of the windscreen pillar, the sill, and the back edge up to the end of the door glass
    const door = [[sP, vTop(sP)], [dA, lerp(vLow(dA), vTop(dA), 0.45)], [dA + 0.008, vLow(dA + 0.008)]];
    for (let i = 1; i <= 5; i++) { const s = lerp(dA + 0.008, dB - 0.01, i / 5); door.push([s, vLow(s)]); }
    door.push([dB, lerp(vLow(dB), vTop(dB), 0.2)], [D.sB, vTop(D.sB)]);
    line(door);
    // the bonnet: across behind the nose, back along the valley inside each wing, and across under the windscreen
    { const b0 = 0.05, b1 = Math.max(b0 + 0.05, pr.c0 - 0.014), bu = 0.56, bn = [];
        for (let i = 0; i <= 7; i++) bn.push([b0 + 0.012 * Math.pow(i / 7, 3), R(b0).atUx(bu * i / 7)]);
        for (let i = 1; i <= 8; i++) { const s = lerp(b0 + 0.012, b1, i / 8); bn.push([s, R(s).atUx(bu)]); }
        for (let i = 7; i >= 0; i--) bn.push([b1, R(b1).atUx(bu * i / 7)]);
        line(bn, 0.007); }
    // the boot lid, on the tail behind the rear window
    { const t0 = Math.min(0.93, pr.c1 + 0.01), t1 = 0.982, tu = 0.6, bl = [];
        if (t1 - t0 > 0.03) { for (let i = 0; i <= 6; i++) bl.push([t0, R(t0).atUx(tu * i / 6)]); for (let i = 1; i <= 4; i++) { const s = lerp(t0, t1, i / 4); bl.push([s, R(s).atUx(tu)]); } for (let i = 5; i >= 0; i--) bl.push([t1, R(t1).atUx(tu * i / 6)]); line(bl, 0.007); } }
    // a dark vent in each front wing
    { const V = vent60(pr, D); if (V.ok) each(P => { const at = (s, y) => [s * W, P(R(s).atY(y))]; x.beginPath(); x.moveTo(...at(V.v0, V.ya)); x.lineTo(...at(V.v1, V.ya)); x.lineTo(...at(V.v1, V.yb)); x.lineTo(...at(V.v0, V.yb)); x.closePath();
        x.fillStyle = '#050607'; x.fill(); x.lineJoin = 'round'; x.strokeStyle = 'rgba(255,255,255,0.22)'; x.lineWidth = 0.006 * pxU; x.stroke(); }); }
    // on the right rear wing: a round fuel filler (its chrome cap is a real part), or a rounded charging flap (electric and hybrid)
    each((P, m) => { if (m) return; const [s, y] = cap60(pr), cx = s * W, cy = P(R(s).atY(y)), r = 0.047 * pxU;
        for (const [col, off] of [['rgba(255,255,255,0.16)', 0.9], ['rgba(0,0,0,0.72)', 0]]) { x.strokeStyle = col; x.lineWidth = 0.008 * pxU; x.beginPath(); if (plug) x.roundRect(cx - r * 1.2 + off, cy - r + off, r * 2.4, r * 2, r * 0.5); else x.arc(cx + off, cy + off, r, 0, Math.PI * 2); x.stroke(); }
        x.fillStyle = plug ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.6)'; x.beginPath(); x.arc(cx, cy, r * (plug ? 0.45 : 0.8), 0, Math.PI * 2); x.fill(); });
    x.restore();
}
function paintMaterial(design, plain = false, hd = false) {
    const f = FINISHES[design.finish], useMap = !plain && (hasLivery(design) || isDetailed(design));
    return new THREE.MeshPhysicalMaterial({ color: useMap ? '#ffffff' : design.paint, map: useMap ? liveryTexture(design, hd && isDetailed(design)) : null,
        metalness: f.metalness, roughness: f.roughness, clearcoat: f.clearcoat, clearcoatRoughness: 0.08,
        iridescence: f.iridescence, iridescenceIOR: 1.6, side: THREE.DoubleSide,
        // metallic and pearl paint: tiny flakes under the smooth clear coat glint in the light
        ...(design.finish === 'metallic' || design.finish === 'pearl' ? { normalMap: flakeTexture(), normalScale: new THREE.Vector2(0.22, 0.22) } : {}) });
}
function buildMaterials(design, lite = false) {
    const rc = RIM_COLOURS[design.rimColour];
    return {
        paint: paintMaterial(design, false, !lite),
        paintPlain: paintMaterial(design, true),
        glass: new THREE.MeshPhysicalMaterial({ color: 0x0a0d12, metalness: 0.3, roughness: 0.06, clearcoat: 1, side: THREE.DoubleSide }),
        carbon: new THREE.MeshStandardMaterial({ color: 0x15171b, metalness: 0.4, roughness: 0.45 }),
        tyre: new THREE.MeshStandardMaterial({ color: 0xffffff, map: tyreTexture(), roughness: 0.88, side: THREE.DoubleSide }),
        rim: rc === 'chrome' ? new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.05 })
                             : new THREE.MeshStandardMaterial({ color: rc, metalness: 0.8, roughness: 0.3, side: THREE.DoubleSide }),
        brake: new THREE.MeshStandardMaterial({ color: 0xffffff, map: discTexture(), metalness: 0.85, roughness: 0.38, emissive: 0xff4010, emissiveMap: discTexture(), emissiveIntensity: 0 }),   // (glows when the brakes get hot)
        spinBlur: spinBlurMaterial(design),
        caliper: new THREE.MeshStandardMaterial({ color: design.caliper, roughness: 0.4 }),
        dark: new THREE.MeshStandardMaterial({ color: 0x0b0c0f, roughness: 0.6 }),
        chrome: new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.08 }),
        lens: new THREE.MeshPhysicalMaterial({ color: 0x1a2028, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.45, depthWrite: false }),
        grille: new THREE.MeshStandardMaterial({ color: 0x15171b, metalness: 0.6, roughness: 0.4 }),
        intake: new THREE.MeshStandardMaterial({ color: 0x0b0c0f, roughness: 0.7, side: THREE.DoubleSide }),
        amber: new THREE.MeshStandardMaterial({ color: 0xff8a00, emissive: 0xff6a00, emissiveIntensity: 0.6 }),
        head: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xdfeaff, emissiveIntensity: 1.2 }),
        tail: new THREE.MeshStandardMaterial({ color: 0x550000, emissive: 0xff1a10, emissiveIntensity: 1.4 })
    };
}
// Combine all the meshes under 'root' that share a material into one mesh each (fewer things to draw = smoother on tablets).
// Each part keeps its exact position; the look doesn't change.
function mergeByMaterial(root) {
    root.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), groups = new Map(), victims = [];
    root.traverse(o => {
        if (!o.isMesh || o === root || o.userData.keep) return;
        // only parts that belong directly to this root (not to a wheel, which turns on its own)
        let p = o.parent; while (p && p !== root) { if (p.userData.wheelRoot) return; p = p.parent; }
        const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
        g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
        if (!groups.has(o.material)) groups.set(o.material, []);
        groups.get(o.material).push(g); victims.push(o);
    });
    victims.forEach(o => { o.parent.remove(o); o.geometry.dispose(); });
    // drop now-empty helper groups (but never a wheel)
    const empties = []; root.traverse(o => { if (o !== root && o.isGroup && !o.userData.wheelRoot && o.children.length === 0) empties.push(o); });
    empties.forEach(o => o.parent && o.parent.remove(o));
    for (const [mat, list] of groups) {
        const useUV = list.every(g => g.attributes.uv), names = useUV ? ['position', 'normal', 'uv'] : ['position', 'normal'];
        const total = list.reduce((n, g) => n + g.attributes.position.count, 0), merged = new THREE.BufferGeometry();
        for (const name of names) {
            const size = name === 'uv' ? 2 : 3, arr = new Float32Array(total * size); let off = 0;
            for (const g of list) { arr.set(g.attributes[name].array, off); off += g.attributes[name].array.length; }
            merged.setAttribute(name, new THREE.BufferAttribute(arr, size));
        }
        list.forEach(g => g.dispose());
        root.add(new THREE.Mesh(merged, mat));
    }
}
// turn a shape inside out, so its inner surface is the one that shows (for the insides of pipes and lamp bowls)
function insideOut(g) { g.scale(-1, 1, 1); const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i)); return g; }
// a bar (box) from point a to point b
function bar(a, b, t, mat, w = t) {
    const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.BoxGeometry(w, d.length(), t), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
}
// the height of the cabin glass above a point (matches cabinGeometry for the bubble and canopy styles)
function cabinY(pr, s, zAbs) {
    const w = pr.width(s), wb = w * pr.q.cabinWB, wt = w * pr.q.cabinWT, hug = pr.q.roofDrop < 0.99;
    const yb = pr.topAt(s, pr.q.cabinWB) - 0.015, yt = Math.max(yb + 0.015, pr.roof(s));
    if (pr.q.cabinStyle === 'glasshouse') for (let i = 0; i <= 48; i++) {   // (straight sides, a crisp edge, then a flat roof panel: see cabinGeometry)
        const t = i / 48, edge = 0.48, f = t < edge ? t / edge : (t - edge) / (1 - edge), rise = t < edge ? 0.88 * f : 0.88 + 0.12 * (1 - (1 - f) * (1 - f)), z = t < edge ? lerp(wb, wt, f) : wt * (1 - f) * (1 + 0.15 * f);
        if (z <= zAbs || i === 48) { const y0 = hug ? pr.surfAt(s, z / w) - 0.02 : yb, y1 = hug ? pr.roof(s) : yt; return y0 + (y1 - y0) * rise; }
    }
    for (let i = 0; i <= 48; i++) {
        const a = i / 48 * Math.PI / 2, c = Math.cos(a), sn = Math.sin(a), z = Math.pow(c, 0.7) * lerp(wb, wt, Math.pow(sn, 1.4));
        if (z <= zAbs || i === 48) { const y0 = hug ? pr.surfAt(s, z / w) - 0.02 : yb, y1 = hug ? pr.roof(s) : yt; return y0 + (y1 - y0) * Math.pow(sn, pr.q.cabinStyle === 'bubble' ? 0.62 : 0.38); }
    }
}
// One small picture shared by the number plate and the nose badge. Both are made up: the plate's wording could never be a
// real registration, and the badge is a plain shape (a little chequered shield with three slashes), not any car maker's emblem
// and with no letters on it.
function detailTexture(s90 = false) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d'); x.scale(2, 2);
    // a patch of black diamond mesh (for grilles), beside the badge
    x.fillStyle = '#08090b'; x.fillRect(64, 64, 192, 64); x.save(); x.beginPath(); x.rect(64, 64, 192, 64); x.clip(); x.strokeStyle = '#4a4f58'; x.lineWidth = 0.9;
    for (let i = -70; i < 200; i += 4.5) { x.beginPath(); x.moveTo(64 + i, 64); x.lineTo(64 + i + 32, 128); x.moveTo(64 + i + 64, 64); x.lineTo(64 + i + 32, 128); x.stroke(); }
    x.restore();
    const old = s90 === 'gt';   // (the 60s GT wears an old-style plate: silver letters on black)
    x.fillStyle = old ? '#0c0d0f' : '#f2c200'; x.fillRect(0, 0, 256, 64); x.strokeStyle = old ? '#c9ced6' : '#111'; x.lineWidth = 3; x.strokeRect(3.5, 3.5, 249, 57);
    x.fillStyle = old ? '#e8ebef' : '#111'; x.font = '900 40px "Arial Black", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(old ? 'LEGEND 6' : s90 === 'w70' ? 'LEGEND 7' : s90 === 'ev' ? 'LEGEND 5' : s90 === 'lt' ? 'LEGEND 3' : s90 ? 'LEGEND 9' : 'LEGEND 1', 128, 34, 228);
    x.fillStyle = '#0b0c0f'; x.fillRect(0, 64, 64, 64);
    x.fillStyle = '#c9a227'; x.beginPath(); x.arc(32, 96, 31, 0, Math.PI * 2); x.fill(); x.fillStyle = '#0b0c0f'; x.beginPath(); x.arc(32, 96, 28, 0, Math.PI * 2); x.fill();
    if (s90 === 'ev') {   // the Electric's own badge: a bright blue ring round a white six-sided outline with a blue pulse line across it, on a black disc (no letters)
        x.fillStyle = EVBLUE; x.beginPath(); x.arc(32, 96, 31, 0, Math.PI * 2); x.fill(); x.fillStyle = '#0b0c0f'; x.beginPath(); x.arc(32, 96, 27, 0, Math.PI * 2); x.fill();
        x.strokeStyle = '#f4f6f8'; x.lineWidth = 3; x.lineJoin = 'round'; x.lineCap = 'round'; x.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + Math.PI / 6; x.lineTo(32 + Math.cos(a) * 20, 96 + Math.sin(a) * 20); } x.closePath(); x.stroke();
        x.strokeStyle = EVBLUE; x.lineWidth = 3.2; x.beginPath(); x.moveTo(18, 98); x.lineTo(26, 98); x.lineTo(30, 86); x.lineTo(35, 108); x.lineTo(39, 96); x.lineTo(46, 96); x.stroke();
        const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
    }
    if (s90 === 'gt') {   // the 60s GT's own badge: a chrome ring round a dark green disc, with a gold eight-spoked wheel on it (no letters, no wings)
        x.fillStyle = '#d5dae0'; x.beginPath(); x.arc(32, 96, 31, 0, Math.PI * 2); x.fill(); x.fillStyle = '#0e3b2a'; x.beginPath(); x.arc(32, 96, 26.5, 0, Math.PI * 2); x.fill();
        x.strokeStyle = '#e8c44a'; x.lineWidth = 3; x.beginPath(); x.arc(32, 96, 16, 0, Math.PI * 2); x.stroke(); x.lineWidth = 2; for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI; x.beginPath(); x.moveTo(32 + Math.cos(a) * 16, 96 + Math.sin(a) * 16); x.lineTo(32 - Math.cos(a) * 16, 96 - Math.sin(a) * 16); x.stroke(); }
        x.fillStyle = '#e8c44a'; x.beginPath(); x.arc(32, 96, 5, 0, Math.PI * 2); x.fill();
        const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
    }
    if (s90 === 'w70') {   // the 70s wedge's own badge: a bronze ring round a white disc, with a red wedge over two black speed lines (no letters)
        x.fillStyle = '#b07a3a'; x.beginPath(); x.arc(32, 96, 31, 0, Math.PI * 2); x.fill(); x.fillStyle = '#f4f6f8'; x.beginPath(); x.arc(32, 96, 26.5, 0, Math.PI * 2); x.fill();
        x.fillStyle = '#d0140c'; x.beginPath(); x.moveTo(12, 100); x.lineTo(50, 78); x.lineTo(50, 100); x.closePath(); x.fill();
        x.fillStyle = '#111418'; x.fillRect(16, 104, 34, 4); x.fillRect(22, 111, 22, 4);
        const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
    }
    if (s90 === 'lt') {   // the Longtail's own badge: a copper ring round a white teardrop with three speed lines, on a black disc (no letters)
        x.fillStyle = COPPER; x.beginPath(); x.arc(32, 96, 31, 0, Math.PI * 2); x.fill(); x.fillStyle = '#0b0c0f'; x.beginPath(); x.arc(32, 96, 27, 0, Math.PI * 2); x.fill();
        x.fillStyle = '#f4f6f8'; x.beginPath(); x.moveTo(32, 74); x.bezierCurveTo(45, 82, 42, 104, 32, 120); x.bezierCurveTo(22, 104, 19, 82, 32, 74); x.fill();
        x.strokeStyle = COPPER; x.lineWidth = 2.4; x.lineCap = 'round'; for (const [dx, y0, y1] of [[-13, 92, 108], [13, 92, 108]]) { x.beginPath(); x.moveTo(32 + dx, y0); x.lineTo(32 + dx * 0.8, y1); x.stroke(); }
        x.fillStyle = COPPER; x.beginPath(); x.arc(32, 88, 4, 0, Math.PI * 2); x.fill();
        const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
    }
    if (s90) {   // the 90s supercar's own badge: a green diamond with a white lightning bolt, edged in orange, on a black disc (no letters)
        x.fillStyle = '#0b0c0f'; x.beginPath(); x.arc(32, 96, 31, 0, Math.PI * 2); x.fill();
        x.beginPath(); x.moveTo(32, 68); x.lineTo(56, 96); x.lineTo(32, 124); x.lineTo(8, 96); x.closePath(); x.fillStyle = '#0a7d4f'; x.fill(); x.strokeStyle = '#ff7a1a'; x.lineWidth = 3; x.lineJoin = 'round'; x.stroke();
        x.fillStyle = '#f4f6f8'; x.beginPath(); x.moveTo(37, 76); x.lineTo(23, 99); x.lineTo(31, 99); x.lineTo(27, 116); x.lineTo(41, 93); x.lineTo(33, 93); x.closePath(); x.fill();
        const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
    }
    const shield = () => { x.beginPath(); x.moveTo(14, 76); x.lineTo(50, 76); x.lineTo(50, 98); x.quadraticCurveTo(48, 112, 32, 120); x.quadraticCurveTo(16, 112, 14, 98); x.closePath(); };
    shield(); x.fillStyle = '#b3121a'; x.fill(); x.save(); shield(); x.clip();
    for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) { x.fillStyle = (i + j) % 2 ? '#111' : '#f4f6f8'; x.fillRect(14 + i * 6, 76 + j * 6, 6, 6); }   // chequered band
    x.fillStyle = '#e8c44a'; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(17 + i * 10, 112); x.lineTo(23 + i * 10, 112); x.lineTo(31 + i * 10, 91); x.lineTo(25 + i * 10, 91); x.fill(); }   // three slashes
    x.restore(); shield(); x.strokeStyle = '#e8c44a'; x.lineWidth = 2; x.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
// The colours of the interior and the small outside trim, one small strip: every such part is painted from it, so they are
// all one material (and all hidden together in the driver's-seat view, where the cockpit model takes over).
// 3 = helmet, 5 = accent (seat stripes), 8 = helmet stripe
// 10, 11 = pale and darker tan leather (the Longtail's and the 60s GT's seats), 12 = copper, 13 = electric blue (the Electric's screen and seat stripe)
// 14, 15 = dark and light polished wood (the 60s GT's dashboard and steering wheel rim)
const INTERIOR = ['#17191d', '#2a2d33', '#050506', 'helmet', '#0c0d10', 'accent', '#3a3f47', '#c3cad4', 'stripe', '#7a828d', '#cfb48c', '#a98a62', COPPER, EVBLUE, '#5a3417', '#a8703a'];
function interiorTexture(d) {
    const c = document.createElement('canvas'); c.width = INTERIOR.length * 8; c.height = 8; const x = c.getContext('2d');
    // the helmet takes the brake calliper colour (a strong colour the builder chooses), or white if that is too dark to see
    const n = parseInt(String(d.caliper || '').slice(1), 16) || 0, lum = (0.3 * (n >> 16 & 255) + 0.59 * (n >> 8 & 255) + 0.11 * (n & 255)) / 255;
    const helmet = lum < 0.3 ? '#f4f6f8' : d.caliper, stripe = lum < 0.3 || lum > 0.85 ? '#e10600' : '#f4f6f8';
    INTERIOR.forEach((col, i) => { x.fillStyle = { helmet, stripe, accent: d.caliper }[col] || col; x.fillRect(i * 8, 0, 8, 8); });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t;
}
// The extra detail on the modern hypercar. Everything is placed from the body's own curves, so it follows the sliders.
// lite (rival cars in a race): only the few parts that show from a distance.
function hyperDetail(car, p, pr, mats, X, lite) {
    const q = pr.q, V = (x, y, z) => new THREE.Vector3(x, y, z), add = m => { car.add(m); return m; };
    const { col, part } = interiorKit(car, p, mats, lite);
    // door mirrors: small flat carbon shells on thin stalks, low at the front corners of the door windows
    for (const side of [1, -1]) {
        const s = pr.c0 + 0.05, w = pr.width(s), zb = w * (q.cabinWB + 0.035), base = V(X(s), pr.surfAt(s, q.cabinWB + 0.035) - 0.008, side * zb);
        const head = V(X(s) + 0.035, base.y + 0.052, side * Math.min(zb + 0.1, w - 0.05));
        const stalk = add(bar(base, V(head.x - 0.01, head.y - 0.008, head.z - side * 0.02), 0.022, lite ? mats.carbon : mats.interior, 0.01)); if (!lite) col(stalk.geometry, 2);
        const shell = lite ? add(new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), mats.carbon)) : part(new THREE.SphereGeometry(1, 14, 10), 4); shell.scale.set(0.046, 0.027, 0.066); shell.position.copy(head);
        if (!lite) { const glass = part(new THREE.SphereGeometry(1, 12, 8), 7); glass.scale.set(0.012, 0.02, 0.055); glass.position.set(head.x - 0.037, head.y, head.z); }
    }
    // short fins under the tail (the diffuser): they hug the rising underside, either side of the number plate
    const w1 = pr.width(1), xT = X(1), yT = pr.base(1);
    diffuserFins(car, pr, mats, X, lite ? [-0.47, 0.47] : [-0.63, -0.47, -0.31, 0.31, 0.47, 0.63]);
    if (lite) return;
    // the number plate, on a thin carbon backing
    if (!mats.detail) mats.detail = new THREE.MeshStandardMaterial({ map: detailTexture(), roughness: 0.45, metalness: 0.05 });
    const ph = Math.min(0.088, (yT - p.ride) * 0.45), pw = Math.min(0.42, w1 * 0.48), pg = new THREE.PlaneGeometry(pw, ph), puv = pg.attributes.uv;
    for (let i = 0; i < puv.count; i++) puv.setY(i, 0.5 + puv.getY(i) * 0.5);
    // (tucked up onto the tail itself: its top edge sits just under the exhaust pipes, over the bottom of their dark surround)
    const pTop = Math.max(lerp(pr.base(0.99), pr.centre(0.99), 0.45) - 0.125, yT - 0.02 + ph);
    pg.rotateY(-Math.PI / 2); const plate = add(new THREE.Mesh(pg, mats.detail)); plate.position.set(xT - 0.03, pTop - ph * 0.5, 0);
    const block = add(new THREE.Mesh(new THREE.BoxGeometry(0.03, ph + 0.014, pw + 0.014), mats.carbon)); block.position.set(xT - 0.013, plate.position.y, 0);
    noseBadge(car, pr, mats, X, 0.02);
    // amber indicators: a slim repeater on each front wing, behind the wheel arch
    for (const side of [1, -1]) {
        const s = pr.frontAxle + (p.wheel + 0.055) / p.L + 0.012, y = lerp(pr.bottomAt(s, 1), pr.topAt(s, 1), 0.5) + 0.06;
        const rp = add(new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.016, 0.012), mats.amber)); rp.position.set(X(s), y, side * (pr.width(s) * 0.995));
    }
    // splitter end fences and two support stays
    if (p.splitter) for (const side of [1, -1]) {
        const y = pr.base(0.03) + 0.01, xs = X(0.02) - 0.12;
        const fence = add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.012), mats.carbon)); fence.position.set(xs, y + 0.03, side * p.W * 0.424);
        add(bar(V(xs + 0.13, y, side * p.W * 0.2), V(xs + 0.07, pr.base(0.012) - 0.002, side * p.W * 0.2), 0.008, mats.chrome));
    }
    parkedWiper(car, pr, mats, X, col);
    // ---- the interior, seen through the glass: a dark tub, dashboard, steering wheel, two seats and a helmeted driver ----
    const span = pr.c1 - pr.c0, sA = pr.c0 + 0.004, sB = pr.c0 + span * 0.74;
    // the floor of what you can see: a dark lining laid just over the body under the glass
    cabinFloor(pr, X, sA, sB, part);
    const sSeat = Math.min(pr.c1 - 0.05, Math.max(pr.rakeEnd + 0.3 / p.L, pr.c0 + 0.38 * span));   // (the same place as the cockpit view's eye)
    const wS = pr.width(sSeat), zSeat = wS * q.cabinWB * 0.3, deck = pr.topAt(sSeat, 0.3), xS = X(sSeat);
    const head = z => Math.max(deck - 0.02, Math.min(deck + 0.17, cabinY(pr, sSeat, Math.abs(z) + 0.05) - 0.13));     // how high a helmet or headrest can sit under the glass
    dashAndWheel(car, pr, mats, X, { col, part }, { sD: lerp(pr.c0, sSeat, 0.52), sSeat, zD: -zSeat, uD: 0.3, screen: true });
    for (const side of [-1, 1]) { const z = side * zSeat; bucketSeat(part, xS, head(z), z); }
    helmetedDriver(part, xS, head(-zSeat), -zSeat);
}
// ---- parts the detailed cars share ----
// The interior and the small outside trim share one material (hidden in the driver's-seat view).
// (it glows very faintly in its own colours, so the bright helmet still reads through the tinted glass from the race cameras)
function interiorKit(car, p, mats, lite) {
    if (!lite) { const it = interiorTexture(p); mats.interior = new THREE.MeshStandardMaterial({ map: it, emissive: 0xffffff, emissiveMap: it, emissiveIntensity: 0.3, roughness: 0.5, metalness: 0.1 }); }
    const col = (g, i) => { const uv = g.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, (i + 0.5) / INTERIOR.length, 0.5); return g; };
    const part = (g, i) => { const m = new THREE.Mesh(col(g, i), mats.interior); car.add(m); return m; };
    return { col, part };
}
// short fins under the tail (a diffuser): they hug the rising underside; fs = where across the tail each one goes
function diffuserFins(car, pr, mats, X, fs) {
    const w1 = pr.width(1), xT = X(1), yT = pr.base(1), xF = X(0.905), yF = pr.base(0.905);
    for (const f of fs) {
        const sh = new THREE.Shape(); sh.moveTo(xT + 0.01, yT + 0.01); sh.lineTo(xF, yF + 0.005); sh.lineTo(xF, yF - 0.008); sh.lineTo(xT + 0.01, yT - 0.065);
        const g = new THREE.ExtrudeGeometry(sh, { depth: 0.014, bevelEnabled: false }); g.translate(0, 0, f * w1 - 0.007); car.add(new THREE.Mesh(g, mats.carbon));
    }
}
// the badge near the tip of the nose, lying on the bodywork
function noseBadge(car, pr, mats, X, s) {
    const V = (x, y, z) => new THREE.Vector3(x, y, z), ds = 0.012, a = V(X(s), pr.topAt(s, 0), 0), b = V(X(s + ds), pr.topAt(s + ds, 0), 0), up = b.clone().sub(a).normalize();
    const xAxis = V(0, 0, -1), n = new THREE.Vector3().crossVectors(xAxis, up), g = new THREE.CircleGeometry(0.03, 20), uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.25, uv.getY(i) * 0.5);
    g.applyMatrix4(new THREE.Matrix4().makeBasis(xAxis, up, n)); const badge = new THREE.Mesh(g, mats.detail); badge.position.copy(a).addScaledVector(n, 0.005); car.add(badge);
}
// a single wiper parked across the bottom of the windscreen
function parkedWiper(car, pr, mats, X, col) {
    const V = (x, y, z) => new THREE.Vector3(x, y, z), add = m => { car.add(m); return m; };
    const s0 = pr.c0 + 0.02, s1 = pr.c0 + 0.05, at = (s, z) => V(X(s), cabinY(pr, s, Math.abs(z)) + 0.012, z);
    const a = at(s0, 0.04), b = at(s1, -pr.width(s1) * pr.q.cabinWB * 0.55);
    col(add(bar(a, b, 0.012, mats.interior, 0.022)).geometry, 2); col(add(bar(V(a.x + 0.03, a.y - 0.02, a.z + 0.02), a.clone().lerp(b, 0.45), 0.01, mats.interior, 0.012)).geometry, 2);
}
// the floor of what you can see through the glass: a dark lining laid just over the body, from sA back to sB
function cabinFloor(pr, X, sA, sB, part) {
    const NS = 14, NU = 8, pos = [], idx = [];
    for (let i = 0; i <= NS; i++) for (let j = 0; j <= NU; j++) { const s = lerp(sA, sB, i / NS), u = lerp(-1, 1, j / NU) * pr.q.cabinWB * 0.985; pos.push(X(s), pr.surfAt(s, u) + 0.006, u * pr.width(s)); }
    for (let i = 0; i < NS; i++) for (let j = 0; j < NU; j++) { const a = i * (NU + 1) + j, b = a + NU + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(pos.length / 3 * 2).fill(0), 2)); g.setIndex(idx); g.computeVertexNormals();
    part(g, 0);
}
// dashboard: a long cowl under the windscreen with a hooded instrument binnacle and a steering wheel in front of the driver
// (o.zD: where across the car the driver sits; o.uD: where across the body the heights are measured; o.screen: a centre screen;
//  o.tone: the colours of the dash, the hood, the wheel's rim, its spokes and hub, and the mark at its top)
function dashAndWheel(car, pr, mats, X, { col, part }, o) {
    const q = pr.q, V = (x, y, z) => new THREE.Vector3(x, y, z), add = m => { car.add(m); return m; };
    const { sD, sSeat, zD } = o, tn = o.tone || [1, 4, 6, 6, 5], xS = X(sSeat), deck = pr.topAt(sSeat, o.uD), wD = pr.width(sD) * q.cabinWB * 0.92, yD = pr.topAt(sD, o.uD);
    const dash = part(new THREE.SphereGeometry(1, 16, 10), tn[0]); dash.scale.set(0.2, 0.075, wD); dash.position.set(X(sD), yD - 0.01, 0);
    const hood = part(new THREE.SphereGeometry(0.11, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), tn[1]); hood.scale.set(1.15, 0.75, 1.25); hood.position.set(X(sD) - 0.04, yD + 0.02, zD);
    if (o.screen) { const screen = part(new THREE.BoxGeometry(0.012, 0.07, 0.2), 6); screen.position.set(X(sD) - 0.11, yD + 0.045, 0); screen.rotation.z = 0.35; }
    // steering wheel, tilted towards the driver
    const xW = X(lerp(sD, sSeat, 0.5)), yW = yD + 0.035;
    const wg = new THREE.Group(); wg.position.set(xW, yW, zD); wg.rotation.set(0, Math.PI / 2, 0); wg.rotateX(-0.42); car.add(wg);
    const inWheel = (g, i) => { const m = new THREE.Mesh(col(g, i), mats.interior); wg.add(m); return m; };
    inWheel(new THREE.TorusGeometry(0.15, 0.016, 8, 24), tn[2]); inWheel(new THREE.BoxGeometry(0.03, 0.012, 0.04), tn[4]).position.y = 0.15;   // (a grey rim with a coloured mark at the top)
    inWheel(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12), tn[3]).rotation.x = Math.PI / 2;
    for (const a of [Math.PI / 2, -Math.PI / 2, Math.PI]) { const sp = inWheel(new THREE.BoxGeometry(0.03, 0.14, 0.012), tn[3]); sp.rotation.z = a; sp.translateY(0.075); }
    // the driver's arms reach the wheel
    for (const dz of [-1, 1]) { const sh = V(xS + 0.04, deck + 0.005, zD + dz * 0.2), hand = V(xW - 0.02, yW + 0.07, zD + dz * 0.13);
        col(add(bar(sh, hand, 0.075, mats.interior)).geometry, 4);
        const glove = part(new THREE.SphereGeometry(0.042, 10, 8), 2); glove.position.copy(hand); }
}
// a seat: a winged bucket back (w wide) with an accent stripe and a headrest; hy = how high a head sits in it
function bucketSeat(part, xS, hy, z, w = 0.4, tone = [0, 1, 5], empty = false) {   // (tone: the colours of the back, the wings and headrest, and the stripe)
    // (empty: nobody is sitting in it, so the back is squarer and the headrest low and flat, and it can't be mistaken for a person)
    if (empty) { const back = part(new THREE.BoxGeometry(0.07, 0.3, w * 0.86), tone[0]); back.position.set(xS - 0.2, hy - 0.2, z); back.rotation.z = 0.2;
        for (const dz of [-w / 2, w / 2]) { const wing = part(new THREE.BoxGeometry(0.16, 0.24, 0.035), tone[1]); wing.position.set(xS - 0.15, hy - 0.22, z + dz); wing.rotation.z = 0.2; }
        const stripe = part(new THREE.BoxGeometry(0.012, 0.24, 0.05), tone[2]); stripe.position.set(xS - 0.162, hy - 0.2, z); stripe.rotation.z = 0.2;
        const rest = part(new THREE.BoxGeometry(0.06, 0.07, w * 0.5), tone[1]); rest.position.set(xS - 0.235, hy - 0.035, z); rest.rotation.z = 0.2; return; }
    // (dark and rounded, so the seats sit back in the shadows and the helmet stands out)
    const seat = part(new THREE.SphereGeometry(1, 12, 8), tone[0]); seat.scale.set(0.065, 0.2, w * 0.52); seat.position.set(xS - 0.2, hy - 0.16, z); seat.rotation.z = 0.2;
    for (const dz of [-w / 2, w / 2]) { const wing = part(new THREE.SphereGeometry(1, 10, 6), tone[1]); wing.scale.set(0.11, 0.16, 0.032); wing.position.set(xS - 0.14, hy - 0.2, z + dz); wing.rotation.z = 0.2; }
    const stripe = part(new THREE.BoxGeometry(0.02, 0.26, 0.05), tone[2]); stripe.position.set(xS - 0.125, hy - 0.15, z); stripe.rotation.z = 0.2;
    const rest = part(new THREE.SphereGeometry(0.1, 12, 8), tone[1]); rest.scale.set(0.6, 0.85, 1.15); rest.position.set(xS - 0.2, hy + 0.02, z);
}
// the driver: racing suit shoulders and a full-face helmet with a dark visor (never a face)
function helmetedDriver(part, xS, hy, z) {
    const R = 0.125;
    const body = part(new THREE.SphereGeometry(1, 14, 10), 4); body.scale.set(0.15, 0.16, 0.25); body.position.set(xS - 0.04, hy - 0.2, z);
    const lid = part(new THREE.SphereGeometry(R, 20, 14), 3); lid.scale.set(1.12, 1, 0.94); lid.position.set(xS, hy, z);
    const visor = part(new THREE.SphereGeometry(R * 1.04, 20, 8, Math.PI * 0.48, Math.PI * 1.04, Math.PI * 0.3, Math.PI * 0.27), 2); visor.scale.set(1.12, 1, 0.94); visor.position.set(xS, hy, z);   // a wide black visor band
    const band = part(new THREE.TorusGeometry(R * 0.985, 0.02, 6, 24, Math.PI), 8); band.scale.set(1.12, 1, 1.6); band.position.set(xS, hy, z);   // a broad stripe over the top of the helmet, front to back
}
// The extra detail on the 90s supercar: the famous seating (the driver in the middle, a passenger seat set back on each side),
// mirrors on stalks, a roof intake you can see into, a meshed nose intake, indicators, wiper and badge.
// lite (rival cars in a race): only the mirrors and two diffuser fins.
function super90Detail(car, p, pr, mats, X, lite) {
    const q = pr.q, V = (x, y, z) => new THREE.Vector3(x, y, z), add = m => { car.add(m); return m; };
    const kit = interiorKit(car, p, mats, lite), { col, part } = kit, D = doors90(pr);
    // door mirrors: rounded shells held out on slim stalks from the top of each door, beside the windscreen pillars
    for (const side of [1, -1]) {
        const s = D.sP + 0.012, w = pr.width(s), u = q.cabinWB + 0.05, base = V(X(s), pr.surfAt(s, u) - 0.008, side * w * u);
        const head = V(X(s) + 0.02, base.y + 0.042, side * Math.min(w * u + 0.085, w - 0.01));
        const stalk = add(bar(base, V(head.x - 0.01, head.y - 0.008, head.z - side * 0.02), 0.018, lite ? mats.carbon : mats.interior, 0.012)); if (!lite) col(stalk.geometry, 2);
        const shell = lite ? add(new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), mats.carbon)) : part(new THREE.SphereGeometry(1, 14, 10), 4); shell.scale.set(0.042, 0.026, 0.066); shell.position.copy(head);
        if (!lite) { const glass = part(new THREE.SphereGeometry(1, 12, 8), 7); glass.scale.set(0.012, 0.02, 0.055); glass.position.set(head.x - 0.034, head.y, head.z); }
    }
    diffuserFins(car, pr, mats, X, lite ? [-0.4, 0.4] : [-0.52, -0.3, 0.3, 0.52]);
    if (lite) return;
    // the nose intake gets a mesh, and the nose a badge and a small amber indicator each side
    { const hw = pr.width(0) * 0.36 * 0.9, g = new THREE.CircleGeometry(1, 24), uv = g.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, lerp(0.3, 0.6, uv.getX(i)), lerp(0.05, 0.45, uv.getY(i)));
        g.rotateY(Math.PI / 2); const mesh = add(new THREE.Mesh(g, mats.detail)); mesh.scale.set(1, 0.036, hw); mesh.position.set(X(0) + 0.0215, pr.base(0) + 0.055, 0);
        for (const z of [-hw * 0.34, hw * 0.34]) { const b = add(new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.066, 0.008), mats.carbon)); b.position.set(X(0) + 0.024, pr.base(0) + 0.055, z); }
        for (const side of [1, -1]) { const ind = add(new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.022, 0.075), mats.amber)); ind.position.set(X(0) + 0.004, pr.base(0) + 0.06, side * pr.width(0) * 0.72); }
    }
    noseBadge(car, pr, mats, X, 0.03);
    // amber repeaters: a small round lamp on each front wing, behind the wheel arch
    for (const side of [1, -1]) {
        const s = pr.frontAxle + (p.wheel + 0.055) / p.L + 0.02, y = lerp(pr.bottomAt(s, 1), pr.topAt(s, 1), 0.5) + 0.1;
        const rp = add(new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.012, 12), mats.amber)); rp.rotation.x = Math.PI / 2; rp.position.set(X(s), y, side * (pr.width(s) * 0.992));
    }
    parkedWiper(car, pr, mats, X, col);
    // the roof intake: a low hollow scoop you can see into, tapering away to nothing along the roof
    { const sF = lerp(pr.rakeEnd, pr.roofEnd, 0.12) - 0.05 / p.L, len = 0.52, N = 10, K = 13, rings = [], sAt = t => Math.min(pr.c1 - 0.01, sF + t * len / p.L);
        for (let i = 0; i <= N; i++) { const t = i / N, s = sAt(t), yr = pr.roof(s) - 0.02, hw = 0.12 * (1 - 0.32 * t * t), h = 0.02 + 0.068 * Math.pow(1 - t, 0.75), ring = [];
            for (let k = 0; k < K; k++) { const a = Math.PI * k / (K - 1); ring.push(V(X(s), yr + h * spow(Math.sin(a), 0.6), hw * spow(Math.cos(a), 0.6))); }
            rings.push(ring); }
        add(new THREE.Mesh(loft(rings, false), mats.paintPlain));
        // a dark wall a little way inside it, the same shape as the scoop there
        { const r = rings[2], pos = [r[0].x, r[0].y, 0], idx = []; r.forEach(v => pos.push(v.x, v.y, v.z * 0.99)); for (let k = 1; k < K; k++) idx.push(0, k, k + 1);
            const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); const wall = add(new THREE.Mesh(g, mats.intake)); wall.position.y = -0.002; }
        const lip = add(new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.008, 0.2), mats.carbon)); lip.position.set(X(sAt(0.05)), pr.roof(sAt(0.05)) + 0.028, 0);   // a slim bar across the mouth
    }
    // ---- the interior, seen through the glass: the driver sits in the middle, with a passenger seat set back on each side ----
    const span = D.span, sSeat = Math.min(pr.c1 - 0.1, Math.max(pr.rakeEnd + 0.16 / p.L, pr.c0 + 0.4 * span)), back = 0.2, sPass = sSeat + back / p.L;
    cabinFloor(pr, X, pr.c0 + 0.004, pr.c0 + span * 0.585, part);
    const head = (s, z) => { const deck = pr.topAt(s, 0); return Math.max(deck - 0.02, Math.min(deck + 0.17, cabinY(pr, s, Math.abs(z) + 0.05) - 0.13)); };
    dashAndWheel(car, pr, mats, X, kit, { sD: lerp(pr.c0, sSeat, 0.55), sSeat, zD: 0, uD: 0, screen: false });
    const zP = pr.width(sPass) * q.cabinWB * 0.63;
    for (const side of [-1, 1]) bucketSeat(part, X(sPass), head(sPass, zP), side * zP, 0.3, [0, 1, 5], true);
    const hy = head(sSeat, 0) - 0.04;                              // (a little lower, clear of the roof intake above the driver's head)
    bucketSeat(part, X(sSeat), hy, 0, 0.36);
    helmetedDriver(part, X(sSeat), hy, 0);
}
// The 90s supercar's tail: a wide black mesh grille with a slim light cluster at each end, the number plate between them,
// four small exhausts low in the middle and a badge above
function super90Tail(car, p, pr, mats, X, lite) {
    const add = m => { car.add(m); return m; }, box = (dx, dy, dz, mat, x, y, z) => { const m = add(new THREE.Mesh(new THREE.BoxGeometry(dx, dy, dz), mat)); m.position.set(x, y, z); return m; };
    const xb = X(1), yB = pr.base(1), yC = pr.centre(1), w1 = pr.width(1), y0 = yB + 0.06, y1 = lerp(yB, yC, 0.7), gh = y1 - y0, gw = w1 * 1.7, gy = (y0 + y1) / 2;
    const cy = y0 + gh * 0.7, ch = Math.min(0.052, gh * 0.24), cw = w1 * 0.44, cz = w1 * 0.57;
    if (lite) {
        box(0.02, gh, gw, mats.grille, xb - 0.005, gy, 0);
        for (const side of [1, -1]) box(0.03, ch, cw, mats.tail, xb - 0.012, cy, side * cz);
        return;
    }
    if (!mats.detail) mats.detail = new THREE.MeshStandardMaterial({ map: detailTexture(true), roughness: 0.45, metalness: 0.05 });
    // the mesh, set back inside a dark frame
    { const g = new THREE.PlaneGeometry(gw, gh), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, lerp(0.26, 0.99, uv.getX(i)), lerp(0.02, 0.48, uv.getY(i)));
        g.rotateY(-Math.PI / 2); add(new THREE.Mesh(g, mats.detail)).position.set(xb - 0.004, gy, 0); }
    // (the frame stands well proud of the mesh, so the mesh sits back in a shadowed recess)
    for (const y of [y0, y1]) box(0.075, 0.02, gw + 0.02, mats.dark, xb - 0.03, y, 0);
    for (const side of [1, -1]) box(0.075, gh, 0.02, mats.dark, xb - 0.03, gy, side * gw / 2);
    if (!mats.clear) { mats.clear = mats.lens.clone(); mats.clear.opacity = 0.2; }
    // light clusters: from the outside in, a long red tail lamp with ribs across it, an amber indicator and a clear reversing lamp
    for (const side of [1, -1]) {
        box(0.024, ch + 0.018, cw + 0.018, mats.dark, xb - 0.014, cy, side * cz);
        const seg = (f0, f1, mat, dx = 0) => box(0.012, ch, (f1 - f0) * cw, mat, xb - 0.026 - dx, cy, side * (cz - cw / 2 + (f0 + f1) / 2 * cw));
        seg(0, 0.13, mats.glass); seg(0.15, 0.33, mats.amber); seg(0.35, 1, mats.tail);
        for (const f of [0.48, 0.61, 0.74, 0.87]) seg(f - 0.006, f + 0.006, mats.dark, 0.003);
        // each cluster sits back inside a raised dark surround, under one glossy lens
        for (const dy of [-1, 1]) box(0.04, 0.009, cw + 0.03, mats.dark, xb - 0.034, cy + dy * (ch / 2 + 0.0085), side * cz);
        for (const dz of [-1, 1]) box(0.04, ch + 0.026, 0.009, mats.dark, xb - 0.034, cy, side * cz + dz * (cw / 2 + 0.0105));
        box(0.004, ch + 0.008, cw + 0.012, mats.clear, xb - 0.044, cy, side * cz);
    }
    // the number plate, on a thin backing, between the lights
    { const pw = Math.min(0.4, w1 * 0.46), ph = Math.min(0.088, ch + 0.03), pg = new THREE.PlaneGeometry(pw, ph), puv = pg.attributes.uv;
        for (let i = 0; i < puv.count; i++) puv.setY(i, 0.5 + puv.getY(i) * 0.5);
        pg.rotateY(-Math.PI / 2); add(new THREE.Mesh(pg, mats.detail)).position.set(xb - 0.0275, cy, 0); box(0.022, ph + 0.014, pw + 0.014, mats.carbon, xb - 0.016, cy, 0); }
    // four small exhaust pipes side by side, poking out of a heat shield low in the middle (an electric car has none)
    if (p.engine !== 'ev') { const r = Math.min(0.034, gh * 0.15), ey = y0 + gh * 0.25;
        box(0.016, r * 2 + 0.034, 0.46, mats.dark, xb - 0.01, ey, 0);
        for (const z of [-0.165, -0.055, 0.055, 0.165]) {
            const put = (m, dx) => { m.position.set(xb - dx, ey, z); return add(m); };
            put(new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.1, 14, 1, true), mats.chrome), 0.03).rotation.z = Math.PI / 2;
            put(new THREE.Mesh(insideOut(new THREE.CylinderGeometry(r * 0.92, r * 0.8, 0.09, 14, 1, true)), mats.dark), 0.034).rotation.z = Math.PI / 2;
            put(new THREE.Mesh(new THREE.CircleGeometry(r * 0.84, 14), mats.dark), -0.01).rotation.y = -Math.PI / 2;
            put(new THREE.Mesh(new THREE.TorusGeometry(r, 0.005, 6, 18), mats.chrome), 0.08).rotation.y = Math.PI / 2;
        } }
    // the badge, above the grille
    { const g = new THREE.CircleGeometry(0.03, 20), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.25, uv.getY(i) * 0.5);
        g.rotateY(-Math.PI / 2); add(new THREE.Mesh(g, mats.detail)).position.set(xb - 0.003, lerp(y1, yC, 0.52), 0); }
}
// a strip laid on the body's skin (for slim lamps): at(t) gives [s, u] along it, half = half its width along the car,
// lift = how far it stands off the skin (straight out from it, whichever way the skin faces there)
// (skinPoint: the exact place on the body's skin, allowing for the way the body draws in a little towards its top)
function skinPoint(pr, X, side, s, u) {
    const a = Math.min(0.985, Math.abs(u)), v = Math.pow(Math.sqrt(1 - Math.pow(a, 2 / pr.q.round)), 0.5 + (pr.q.round - 0.38) * 0.6);
    return new THREE.Vector3(X(s), pr.surfAt(s, a), side * a * pr.width(s) * (1 - v * 0.06));
}
// how far out the body's skin is at height y, on the cross-section at s (for parts fixed to the car's sides)
function sideZ(pr, s, y) {
    const w = pr.width(s), e = 0.5 + (pr.q.round - 0.38) * 0.6, N = 40; let py = 0, pz = 0;
    for (let i = 0; i <= N; i++) { const a = lerp(-1.45, 1.45, i / N), u = Math.pow(Math.cos(a), pr.q.round), v = spow(Math.sin(a), e), yt = pr.topAt(s, u), yb = Math.min(yt - 0.03, pr.bottomAt(s, u)), mid = (yt + yb) / 2;
        const yy = v >= 0 ? lerp(mid, yt, v) : lerp(mid, yb, -v), zz = u * w * (1 - Math.max(0, v) * 0.06);
        if (i && (py - y) * (yy - y) <= 0 && yy !== py) return lerp(pz, zz, (y - py) / (yy - py));
        py = yy; pz = zz; }
    return w;
}
function skinStrip(pr, X, side, at, half, lift, mat, N = 10) {
    const pos = [], idx = [], P = (s, u) => skinPoint(pr, X, side, s, u);
    for (let i = 0; i <= N; i++) { const [s, u] = at(i / N);
        for (const ds of [-half, half]) { const ss = Math.max(0.006, s + ds), n = P(ss + 0.004, u).sub(P(ss - 0.004, u)).cross(P(ss, u + 0.02).sub(P(ss, u - 0.02))).normalize(); if (n.y < 0) n.negate();
            const v = P(ss, u).addScaledVector(n, lift); pos.push(v.x, v.y, v.z); } }
    for (let i = 0; i < N; i++) { const a = i * 2, b = a + 1, c = a + 2, e = a + 3; side > 0 ? idx.push(a, b, c, b, e, c) : idx.push(a, c, b, b, c, e); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    return new THREE.Mesh(g, mat);
}
// The Longtail's lamps: a slim unit swept round each front corner. Under a clear cover: a dark bed, a thin strip of running
// light along its top edge and three small lamp lenses. lite: just the strip of light.
function longtailLamps(car, pr, mats, X, lite, at = lampLT, lenses = [0.2, 0.36, 0.52]) {   // (the Electric's blade lamps are built the same way, along their own line)
    for (const side of [1, -1]) {
        if (lite) { car.add(skinStrip(pr, X, side, at, 0.006, 0.006, mats.head, 6)); continue; }
        if (!mats.clear) { mats.clear = mats.lens.clone(); mats.clear.opacity = 0.2; }
        car.add(skinStrip(pr, X, side, t => { const [s, u] = at(lerp(0.03, 0.985, t)); return [s + 0.0052, u]; }, 0.0022, 0.004, mats.head, 12));
        for (const t of lenses) { const [s, u] = at(t), ss = s - 0.003, lens = new THREE.Mesh(new THREE.SphereGeometry(0.017, 12, 8), mats.head);
            lens.scale.set(0.5, 0.62, 1); lens.position.copy(skinPoint(pr, X, side, ss, u)); lens.position.x += 0.005; lens.position.y += 0.003; car.add(lens);
            const rim = new THREE.Mesh(new THREE.TorusGeometry(0.019, 0.004, 6, 16), mats.dark); rim.rotation.y = Math.PI / 2; rim.scale.y = 0.62; rim.position.copy(lens.position); rim.position.x += 0.004; car.add(rim); }
        car.add(skinStrip(pr, X, side, t => at(lerp(0.02, 0.99, t)), 0.0078, 0.0075, mats.clear, 12));
    }
}
// The Longtail's tail tip: a slim strip of light right across it (a bright core inside a red strip, set back in a dark slot
// under a clear lens), the number plate, and two small oblong exhaust outlets you can see into (none on an electric car)
function longtailTail(car, p, pr, mats, X, lite) {
    const add = m => { car.add(m); return m; }, box = (dx, dy, dz, mat, x, y, z) => { const m = add(new THREE.Mesh(new THREE.BoxGeometry(dx, dy, dz), mat)); m.position.set(x, y, z); return m; };
    // the tail's flat end: its real top and bottom, and half its width at a given height (the same rounded shape the body is built from)
    const xb = X(1), w1 = pr.width(1), yC = pr.topAt(1, 0), yB = Math.min(yC - 0.03, pr.bottomAt(1, 0)), mid = (yB + yC) / 2, H = yC - yB, e = 0.5 + (pr.q.round - 0.38) * 0.6;
    const halfAt = y => { const v = Math.min(1, Math.abs(y - mid) / (H / 2)), c = Math.sqrt(Math.max(0, 1 - Math.pow(v, 2 / e))); return Math.pow(c, pr.q.round) * w1 * (1 - Math.max(0, (y - mid) / (H / 2)) * 0.06); };
    const bh = Math.max(0.014, Math.min(0.028, H * 0.09)), ty = lerp(yB, yC, 0.73), bw = Math.max(0.1, 2 * halfAt(ty + bh / 2 + 0.012) - 0.05);
    if (lite) { box(0.012, bh, bw, mats.tail, xb - 0.004, ty, 0); return; }
    if (!mats.detail) mats.detail = new THREE.MeshStandardMaterial({ map: detailTexture('lt'), roughness: 0.45, metalness: 0.05 });
    if (!mats.clear) { mats.clear = mats.lens.clone(); mats.clear.opacity = 0.2; }
    // the strip of light: a dark slot let into the tail, the red strip inside it with a bright line along its middle, and a clear lens nearly flush with the bodywork
    box(0.012, bh + 0.014, bw + 0.014, mats.dark, xb + 0.003, ty, 0);
    box(0.008, bh, bw, mats.tail, xb - 0.002, ty, 0);
    box(0.008, bh * 0.22, bw - 0.02, mats.head, xb - 0.0026, ty, 0);
    box(0.003, bh + 0.006, bw + 0.006, mats.clear, xb - 0.0085, ty, 0);
    // the number plate, set flat into the tail under the light (it never reaches below the bodywork)
    { const py = lerp(yB, yC, 0.4), ph = Math.min(0.074, H * 0.24), pw = Math.max(0.08, Math.min(0.3, 2 * halfAt(py - ph / 2 - 0.008) - 0.04, ph * 3.7)), pg = new THREE.PlaneGeometry(pw, ph), puv = pg.attributes.uv;
        for (let i = 0; i < puv.count; i++) puv.setY(i, 0.5 + puv.getY(i) * 0.5);
        pg.rotateY(-Math.PI / 2); add(new THREE.Mesh(pg, mats.detail)).position.set(xb - 0.0045, py, 0); box(0.008, ph + 0.01, pw + 0.01, mats.dark, xb, py, 0);
        // exhaust outlets: a bright frame round a dark hole, one each side of the plate
        if (p.engine !== 'ev') { const room = halfAt(py) - pw / 2 - 0.03, ew = Math.min(0.075, room), eh = Math.max(0.016, Math.min(0.034, H * 0.11)), t = 0.004, dp = 0.03, xo = xb - 0.004;
            if (ew > 0.03) for (const side of [1, -1]) { const z = side * (pw / 2 + 0.018 + ew / 2);
                for (const dy of [-1, 1]) box(dp, t, ew + t, mats.chrome, xo, py + dy * eh / 2, z);
                for (const dz of [-1, 1]) box(dp, eh + t, t, mats.chrome, xo, py, z + dz * ew / 2);
                box(0.004, eh, ew, mats.dark, xb - 0.002, py, z);
            } } }
}
// The extra detail on the Longtail: the driver in the middle with a tan passenger seat set back on each side, camera pods
// in place of door mirrors, wiper, badge and diffuser fins. lite (rival cars in a race): none of it.
function longtailDetail(car, p, pr, mats, X, lite) {
    const q = pr.q, V = (x, y, z) => new THREE.Vector3(x, y, z);
    const kit = interiorKit(car, p, mats, lite), { col, part } = kit, D = doorsLT(pr);
    if (lite) return;
    diffuserFins(car, pr, mats, X, [-0.78, -0.26, 0.26, 0.78]);
    if (!mats.detail) mats.detail = new THREE.MeshStandardMaterial({ map: detailTexture('lt'), roughness: 0.45, metalness: 0.05 });
    noseBadge(car, pr, mats, X, 0.05);
    // camera pods instead of door mirrors: a slim blade on a short arm at the front of each door, with a small lens facing back
    for (const side of [1, -1]) {
        const s = D.sA + 0.045, w = pr.width(s), u = Math.min(0.97, q.cabinWB + 0.07), base = V(X(s), pr.surfAt(s, u) - 0.006, side * w * u);
        const head = V(base.x - 0.01, base.y + 0.034, side * Math.min(w * u + 0.07, w + 0.012));
        const arm = bar(base, head, 0.012, mats.interior, 0.03); col(arm.geometry, 4); car.add(arm);
        const pod = part(new THREE.SphereGeometry(1, 12, 8), 4); pod.scale.set(0.06, 0.014, 0.024); pod.position.copy(head);
        const lens = part(new THREE.SphereGeometry(0.008, 8, 6), 7); lens.position.set(head.x - 0.054, head.y, head.z);
        const tip = part(new THREE.SphereGeometry(1, 8, 6), 12); tip.scale.set(0.02, 0.006, 0.025); tip.position.set(head.x + 0.02, head.y + 0.011, head.z);   // (a copper flash on top)
    }
    parkedWiper(car, pr, mats, X, col);
    // ---- the interior, seen through the canopy: the driver in the middle, a passenger seat set back on each side ----
    const span = D.span, sSeat = Math.min(pr.c1 - 0.1, Math.max(pr.rakeEnd + 0.16 / p.L, pr.c0 + 0.4 * span)), sPass = sSeat + 0.24 / p.L;
    cabinFloor(pr, X, pr.c0 + 0.004, pr.c0 + span * 0.725, part);
    const head = (s, z) => { const deck = pr.topAt(s, 0); return Math.max(deck - 0.02, Math.min(deck + 0.17, cabinY(pr, s, Math.abs(z) + 0.05) - 0.13)); };
    const sD = lerp(pr.c0, sSeat, 0.55);
    dashAndWheel(car, pr, mats, X, kit, { sD, sSeat, zD: 0, uD: 0, screen: false });
    // a slim screen each side of the wheel, and a tan pad along the top of the dash
    for (const side of [1, -1]) { const sc = part(new THREE.BoxGeometry(0.012, 0.055, 0.2), 6); sc.position.set(X(sD) - 0.1, pr.topAt(sD, 0) + 0.04, side * 0.3); sc.rotation.z = 0.35; }
    { const pad = part(new THREE.SphereGeometry(1, 12, 6), 11); pad.scale.set(0.055, 0.016, pr.width(sD) * q.cabinWB * 0.74); pad.position.set(X(sD) + 0.06, pr.topAt(sD, 0) + 0.052, 0); }
    const zP = pr.width(sPass) * q.cabinWB * 0.6, tan = [0, 1, 10];   // (dark seats with a tan stripe)
    for (const side of [-1, 1]) bucketSeat(part, X(sPass), head(sPass, zP), side * zP, 0.32, tan, true);
    const hy = head(sSeat, 0);
    bucketSeat(part, X(sSeat), hy, 0, 0.36, tan);
    helmetedDriver(part, X(sSeat), hy, 0);
}
// The Electric's tail: a mesh grille set back in a dark frame (cooling for the batteries and motors) with the number plate in
// the middle, a slim strip of light right across the tail under a clear lens, split into segments, and a badge between them.
// Everything is fitted inside the tail's own end face, so it follows the sliders. (There are no exhausts.)
function electricTail(car, p, pr, mats, X) {
    const add = m => { car.add(m); return m; }, box = (dx, dy, dz, mat, x, y, z) => { const m = add(new THREE.Mesh(new THREE.BoxGeometry(dx, dy, dz), mat)); m.position.set(x, y, z); return m; };
    const xb = X(1), w1 = pr.width(1), yC = pr.topAt(1, 0), yB = Math.min(yC - 0.03, pr.bottomAt(1, 0)), mid = (yB + yC) / 2, H = yC - yB, e = 0.5 + (pr.q.round - 0.38) * 0.6;
    const halfAt = y => { const v = Math.min(1, Math.abs(y - mid) / (H / 2)), c = Math.sqrt(Math.max(0, 1 - Math.pow(v, 2 / e))); return Math.pow(c, pr.q.round) * w1 * (1 - Math.max(0, (y - mid) / (H / 2)) * 0.06); };
    if (!mats.detail) mats.detail = new THREE.MeshStandardMaterial({ map: detailTexture('ev'), roughness: 0.45, metalness: 0.05 });
    if (!mats.clear) { mats.clear = mats.lens.clone(); mats.clear.opacity = 0.2; }
    // the strip of light: a dark slot, the red strip inside it with a bright line along its middle, fine dark joins between its segments, and a clear lens over it all
    // (it always sits clear of the ducktail's edge above it; on a short tail there is no room for the grille, so the strip sits at the top and the number plate under it)
    const duckY = p.wing === 'ducktail' ? pr.centre(0.95) + 0.024 : 9, yHi = Math.min(yC - 0.012, duckY), yLo = yB + 0.055, tall = H >= 0.3;
    const bh = Math.max(0.02, Math.min(0.038, H * 0.09)), ty = Math.min(tall ? lerp(yB, yC, 0.8) : 9, yHi - bh / 2 - 0.007), bw = Math.max(0.2, 2 * halfAt(ty + bh / 2 + 0.012) - 0.04);
    box(0.012, bh + 0.014, bw + 0.014, mats.dark, xb + 0.003, ty, 0);
    box(0.008, bh, bw, mats.tail, xb - 0.002, ty, 0);
    box(0.008, bh * 0.32, bw - 0.02, mats.head, xb - 0.0026, ty, 0);
    { const n = 11, seg = bw / n; for (let i = 1; i < n; i++) box(0.009, bh, 0.005, mats.dark, xb - 0.003, ty, (i - n / 2) * seg); }
    box(0.003, bh + 0.006, bw + 0.006, mats.clear, xb - 0.0085, ty, 0);
    // (the light wraps a little way round each corner, lying on the bodywork there)
    if (pr.q.tailW > 0.5) for (const side of [1, -1]) { const c = box(0.2, bh * 0.75, 0.02, mats.tail, X(0.975), ty - 0.012, side * (sideZ(pr, 0.975, ty - 0.012) - 0.004)); c.rotation.z = 0.12; }
    // the grille: black mesh set back inside a dark frame that stands proud of it, split in three by two carbon bars
    const grille = tall && pr.q.rearGrille, y0 = lerp(yB, yC, 0.16), y1 = Math.min(lerp(yB, yC, 0.58), ty - bh / 2 - 0.05), gh = y1 - y0, gy = (y0 + y1) / 2, gw = Math.max(0.2, 2 * Math.min(halfAt(y0), halfAt(y1)) - 0.08);
    if (grille) {
        const g = new THREE.PlaneGeometry(gw, gh), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, lerp(0.26, 0.99, uv.getX(i)), lerp(0.02, 0.48, uv.getY(i)));
        g.rotateY(-Math.PI / 2); add(new THREE.Mesh(g, mats.detail)).position.set(xb - 0.004, gy, 0);
        for (const y of [y0, y1]) box(0.05, 0.016, gw + 0.016, mats.dark, xb - 0.02, y, 0);
        for (const side of [1, -1]) { box(0.05, gh, 0.016, mats.dark, xb - 0.02, gy, side * gw / 2); box(0.03, gh, 0.012, mats.carbon, xb - 0.012, gy, side * gw * 0.24); }
        for (const f of [1 / 3, 2 / 3]) box(0.014, 0.006, gw, mats.carbon, xb - 0.008, y0 + gh * f, 0);
    }
    // the number plate, on a thin backing: in the middle of the grille, or (on a short tail) between the light and the diffuser, always in full view
    { const pTop = ty - bh / 2 - 0.016, ph = tall ? Math.min(0.08, gh * 0.6) : Math.max(0.03, Math.min(0.07, pTop - yLo)), py = tall ? gy : pTop - ph / 2;
        const pw = Math.max(0.08, Math.min(0.36, tall ? gw * 0.4 : 2 * halfAt(py - ph / 2) - 0.06, ph * 4.2)), pg = new THREE.PlaneGeometry(pw, ph), puv = pg.attributes.uv;
        for (let i = 0; i < puv.count; i++) puv.setY(i, 0.5 + puv.getY(i) * 0.5);
        pg.rotateY(-Math.PI / 2); add(new THREE.Mesh(pg, mats.detail)).position.set(xb - 0.0275, py, 0); box(0.022, ph + 0.014, pw + 0.014, mats.carbon, xb - 0.016, py, 0); }
    // the badge, between the grille and the light (left off a short tail)
    if (tall) { const r = Math.max(0.012, Math.min(0.024, (ty - bh / 2 - y1) * 0.36)), g = new THREE.CircleGeometry(r, 20), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.25, uv.getY(i) * 0.5);
        g.rotateY(-Math.PI / 2); add(new THREE.Mesh(g, mats.detail)).position.set(xb - 0.003, lerp(y1, ty - bh / 2, 0.5), 0); }
}
// The extra detail on the Electric: slim door mirrors, louvres over the bonnet vent, a lit ring on the charging flap, splitter
// fences, diffuser fins, wiper, badge, and the interior seen through the glass (the driver on the left with a helmet on, a dark
// empty passenger seat, and a wide screen across the dash). lite (rival cars in a race): none of it.
function electricDetail(car, p, pr, mats, X, lite) {
    if (lite) return;
    const q = pr.q, V = (x, y, z) => new THREE.Vector3(x, y, z), add = m => { car.add(m); return m; };
    const kit = interiorKit(car, p, mats, lite), { col, part } = kit, D = doorsEV(pr);
    if (!mats.detail) mats.detail = new THREE.MeshStandardMaterial({ map: detailTexture('ev'), roughness: 0.45, metalness: 0.05 });
    // door mirrors: slim blades on thin arms from the top of each door, beside the windscreen pillars
    for (const side of [1, -1]) {
        const s = D.sP + 0.014, w = pr.width(s), u = q.cabinWB + 0.05, base = V(X(s), pr.surfAt(s, u) - 0.008, side * w * u);
        const head = V(X(s) + 0.02, base.y + 0.05, side * Math.min(w * u + 0.1, w - 0.01));
        const arm = add(bar(base, V(head.x - 0.01, head.y - 0.006, head.z - side * 0.02), 0.012, mats.interior, 0.03)); col(arm.geometry, 2);
        const shell = part(new THREE.SphereGeometry(1, 14, 10), 4); shell.scale.set(0.05, 0.021, 0.07); shell.position.copy(head);
        const glass = part(new THREE.SphereGeometry(1, 12, 8), 7); glass.scale.set(0.012, 0.015, 0.058); glass.position.set(head.x - 0.04, head.y, head.z);
    }
    diffuserFins(car, pr, mats, X, [-0.66, -0.4, -0.14, 0.14, 0.4, 0.66]);
    noseBadge(car, pr, mats, X, 0.04);
    parkedWiper(car, pr, mats, X, col);
    // louvres over the bonnet vent: slim carbon slats lying across the opening, each tipped up at the back
    { const B = VENT_EV, n = 4, NU = 6;
        for (let i = 0; i < n; i++) for (const side of [1, -1]) { const f = (i + 0.5) / n, s = lerp(B.s0, B.s1, f), uMax = lerp(B.u0, B.u1, f) - 0.012, h = 0.0048, pos = [], idx = [], ep = [], ei = [];
            // (each slat: a sloping top, an upright back face under its raised edge, and a fine bright strip along that edge)
            for (let j = 0; j <= NU; j++) { const u = lerp(0.012, uMax, j / NU), a = skinPoint(pr, X, side, s - h, u), b = skinPoint(pr, X, side, s + h, u);
                pos.push(a.x, a.y + 0.002, a.z, b.x, b.y + 0.02, b.z, b.x, b.y - 0.002, b.z); ep.push(b.x + 0.0045, b.y + 0.0195, b.z, b.x - 0.0006, b.y + 0.0212, b.z); }
            for (let j = 0; j < NU; j++) { const a = j * 3, c = j * 2;
                if (side > 0) { idx.push(a, a + 1, a + 3, a + 1, a + 4, a + 3, a + 1, a + 2, a + 4, a + 2, a + 5, a + 4); ei.push(c, c + 1, c + 2, c + 1, c + 3, c + 2); }
                else { idx.push(a, a + 3, a + 1, a + 1, a + 3, a + 4, a + 1, a + 4, a + 2, a + 2, a + 4, a + 5); ei.push(c, c + 2, c + 1, c + 1, c + 2, c + 3); } }
            for (const [pp, ii, mat] of [[pos, idx, mats.carbon], [ep, ei, mats.chrome]]) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pp, 3)); g.setIndex(ii); g.computeVertexNormals(); add(new THREE.Mesh(g, mat)); } } }
    // real edges on the side intakes (their dark openings are part of the paintwork): a body-colour lip standing proud down the back of each
    // opening and along its top, and two carbon slats inside
    for (const side of [1, -1]) { const archR = (pr.wheelR + 0.055) / p.L, rearArch = pr.rearAxle - archR, dB = Math.max(D.sA + 0.1, Math.min(D.sB, rearArch - 0.02)), s0 = lerp(D.sA, dB, 0.5), s1 = rearArch - 0.012;
        const yL = p.ride + 0.12, hi = pr.surfAt(s1, 0.97), ya = lerp(yL, hi, 0.24), yb = lerp(yL, hi, 0.66), ym = lerp(ya, yb, 0.4);
        const at = (t, f, out) => { const ss = lerp(s0, s1, t), y = lerp(ym, lerp(ya, yb, f), Math.pow(t, 0.75)); return V(X(ss), y, side * (sideZ(pr, ss, y) + out)); };
        add(bar(at(1, -0.02, 0.003), at(1, 1.04, 0.003), 0.022, mats.paintPlain, 0.016));
        for (const [t0, t1] of [[0.4, 0.7], [0.7, 1]]) add(bar(at(t0, 1.0, 0.002), at(t1, 1.0, 0.002), 0.02, mats.paintPlain, 0.012));
        for (const f of [0.45, 0.7]) add(bar(at(0.5, f, -0.004), at(0.99, f, -0.004), 0.016, mats.carbon, 0.007)); }
    // the ring of light on the charging flap (on top of the left rear wing; a petrol car has a plain fuel flap there instead)
    if (p.engine === 'ev' || p.engine === 'hybrid') { const [s, u] = chargeEV(pr), P = (ss, uu) => skinPoint(pr, X, -1, ss, uu), n = P(s + 0.004, u).sub(P(s - 0.004, u)).cross(P(s, u + 0.02).sub(P(s, u - 0.02))).normalize(); if (n.y < 0) n.negate();
        const ring = add(new THREE.Mesh(new THREE.TorusGeometry(0.021, 0.0028, 6, 24), mats.head)); ring.quaternion.setFromUnitVectors(V(0, 0, 1), n); ring.position.copy(P(s, u)).addScaledVector(n, 0.002); }
    // splitter end fences and two support stays
    if (p.splitter) for (const side of [1, -1]) {
        const y = pr.base(0.03) + 0.01, xs = X(0.02) - 0.12;
        const fence = add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.055, 0.012), mats.carbon)); fence.position.set(xs, y + 0.028, side * p.W * 0.424);
        add(bar(V(xs + 0.13, y, side * p.W * 0.2), V(xs + 0.07, pr.base(0.012) - 0.002, side * p.W * 0.2), 0.008, mats.chrome));
    }
    // ---- the interior, seen through the glass: a dark tub, a dash with a wide screen, steering wheel, two seats and a helmeted driver on the left ----
    const span = pr.c1 - pr.c0;
    cabinFloor(pr, X, pr.c0 + 0.004, pr.c0 + span * 0.74, part);
    const sSeat = Math.min(pr.c1 - 0.05, Math.max(pr.rakeEnd + 0.3 / p.L, pr.c0 + 0.38 * span));   // (the same place as the cockpit view's eye)
    const wS = pr.width(sSeat), zSeat = wS * q.cabinWB * 0.3, deck = pr.topAt(sSeat, 0.3), xS = X(sSeat), sD = lerp(pr.c0, sSeat, 0.52), yD = pr.topAt(sD, 0.3);
    const head = z => Math.max(deck - 0.02, Math.min(deck + 0.17, cabinY(pr, sSeat, Math.abs(z) + 0.05) - 0.13));     // how high a helmet or headrest can sit under the glass
    dashAndWheel(car, pr, mats, X, kit, { sD, sSeat, zD: -zSeat, uD: 0.3, screen: false });
    // one wide screen across the dash, from in front of the driver to the passenger's side, lit along its top edge
    { const sw = Math.min(0.62, pr.width(sD) * q.cabinWB * 1.1), sc = part(new THREE.BoxGeometry(0.012, 0.06, sw), 6); sc.position.set(X(sD) - 0.11, yD + 0.045, zSeat * 0.3); sc.rotation.z = 0.35;
        const glow = part(new THREE.BoxGeometry(0.014, 0.007, sw * 0.96), 13); glow.position.set(X(sD) - 0.121, yD + 0.073, zSeat * 0.3); glow.rotation.z = 0.35; }
    bucketSeat(part, xS, head(zSeat), zSeat, 0.4, [0, 1, 6], true);    // (the passenger seat: empty, dark, with a low flat headrest)
    bucketSeat(part, xS, head(-zSeat), -zSeat, 0.4, [0, 1, 13]);
    helmetedDriver(part, xS, head(-zSeat), -zSeat);
}
// A point on the top of the body as it is really built (straight between the body's own points, which are far apart near the
// middle), for parts that must lie flat on it
function topPoint(pr, X, side, s, u) {
    const K = 84, w = pr.width(s), e = 0.5 + (pr.q.round - 0.38) * 0.6, a = Math.min(0.985, Math.abs(u)), z = a * w * (1 - Math.pow(Math.sqrt(1 - Math.pow(a, 2 / pr.q.round)), e) * 0.06); let pz = 0, py = 0;
    for (let k = K / 4; k <= K / 2; k++) { const an = (k / K) * Math.PI * 2 - Math.PI / 2, uu = Math.pow(Math.max(0, Math.cos(an)), pr.q.round), v = Math.pow(Math.sin(an), e), yt = pr.topAt(s, uu), yb = Math.min(yt - 0.03, pr.bottomAt(s, uu)), y = lerp((yt + yb) / 2, yt, v), zz = uu * w * (1 - v * 0.06);
        if (k > K / 4 && zz <= z) return new THREE.Vector3(X(s), lerp(py, y, (pz - z) / Math.max(1e-6, pz - zz)), side * z);
        pz = zz; py = y; }
    return new THREE.Vector3(X(s), py, side * z);
}
// A louvre slat lying across the body at s, from u0 to u1 (u: -1 = left edge … 1 = right edge): its front edge sits on the
// skin and its back edge is tipped up, with an upright face under that edge
function louvreSlat(pr, X, s, h, u0, u1, rise, mat, NU = 6) {
    const pos = [], idx = [];
    for (let j = 0; j <= NU; j++) { const u = lerp(u0, u1, j / NU), side = u < 0 ? -1 : 1, a = topPoint(pr, X, side, s - h, Math.abs(u)), b = topPoint(pr, X, side, s + h, Math.abs(u));
        pos.push(a.x, a.y + 0.004, a.z, b.x, b.y + rise, b.z, b.x, b.y - 0.002, b.z); }
    for (let j = 0; j < NU; j++) { const a = j * 3; idx.push(a, a + 1, a + 3, a + 1, a + 4, a + 3, a + 1, a + 2, a + 4, a + 2, a + 5, a + 4); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    return new THREE.Mesh(g, mat);
}
// The 70s wedge's tall flat tail: a big round lamp each side (a bright rim, a domed red lens and a small amber lens in its
// middle), a black mesh vent between them with the number plate on it, and the badge above. Everything is sized from the
// tail's real end face, so it stays on the bodywork whatever the sliders are set to.
function wedgeTail(car, p, pr, mats, X) {
    const add = m => { car.add(m); return m; }, box = (dx, dy, dz, mat, x, y, z) => { const m = add(new THREE.Mesh(new THREE.BoxGeometry(dx, dy, dz), mat)); m.position.set(x, y, z); return m; };
    const xb = X(1), w1 = pr.width(1), yC = pr.topAt(1, 0), yB = Math.min(yC - 0.03, pr.bottomAt(1, 0)), mid = (yB + yC) / 2, H = yC - yB, e = 0.5 + (pr.q.round - 0.38) * 0.6;
    const halfAt = y => { const v = Math.min(1, Math.abs(y - mid) / (H / 2)), c = Math.sqrt(Math.max(0, 1 - Math.pow(v, 2 / e))); return Math.pow(c, pr.q.round) * w1 * (1 - Math.max(0, (y - mid) / (H / 2)) * 0.06); };
    if (!mats.detail) mats.detail = new THREE.MeshStandardMaterial({ map: detailTexture('w70'), roughness: 0.45, metalness: 0.05 });
    const r = Math.max(0.03, Math.min(0.1, H * 0.23)), ty = lerp(yB, yC, 0.62), zL = Math.max(r + 0.05, Math.min(w1 * 0.7, halfAt(ty + r * 0.8) - r - 0.025, halfAt(ty - r * 0.8) - r - 0.025));
    for (const side of [1, -1]) { const z = side * zL, at = (m, dx) => { m.position.set(xb - dx, ty, z); add(m); return m; };
        at(new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.11, 8, 28), mats.chrome), 0.004).rotation.y = Math.PI / 2;
        at(new THREE.Mesh(new THREE.SphereGeometry(r * 0.93, 22, 10), mats.tail), 0).scale.x = 0.2;
        at(new THREE.Mesh(new THREE.SphereGeometry(r * 0.36, 14, 8), mats.amber), r * 0.14).scale.x = 0.3;
    }
    // the vent between the lamps: black mesh inside a bright frame that stands proud of it
    const gw = 2 * (zL - r - 0.045), gh = Math.min(r * 1.5, H * 0.3), y0 = ty - gh / 2, y1 = ty + gh / 2, vent = gw > 0.16;
    if (vent) {
        const g = new THREE.PlaneGeometry(gw, gh), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, lerp(0.26, 0.99, uv.getX(i)), lerp(0.02, 0.48, uv.getY(i)));
        g.rotateY(-Math.PI / 2); add(new THREE.Mesh(g, mats.detail)).position.set(xb - 0.003, ty, 0);
        for (const y of [y0, y1]) box(0.03, 0.009, gw + 0.009, mats.chrome, xb - 0.01, y, 0);   // (a bright edge, like the lamp rims)
        for (const side of [1, -1]) box(0.03, gh, 0.009, mats.chrome, xb - 0.01, ty, side * gw / 2);
        for (const f of [1 / 3, 2 / 3]) box(0.012, 0.006, gw, mats.dark, xb - 0.007, y0 + gh * f, 0);
    }
    // the number plate, on a thin backing, in the middle of the vent (or between the lamps, if there is no room for the vent)
    { const ph = Math.max(0.03, Math.min(0.08, gh * 0.62)), pw = Math.max(0.08, Math.min(0.36, (vent ? gw * 0.6 : 2 * (zL - r) - 0.03), ph * 4.2)), pg = new THREE.PlaneGeometry(pw, ph), puv = pg.attributes.uv;
        for (let i = 0; i < puv.count; i++) puv.setY(i, 0.5 + puv.getY(i) * 0.5);
        pg.rotateY(-Math.PI / 2); add(new THREE.Mesh(pg, mats.detail)).position.set(xb - 0.0225, ty, 0); box(0.018, ph + 0.012, pw + 0.012, mats.dark, xb - 0.013, ty, 0); }
    // the badge, above the vent (left off a low tail)
    if (yC - y1 > 0.075) { const br = Math.max(0.014, Math.min(0.026, (yC - y1) * 0.26)), g = new THREE.CircleGeometry(br, 20), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.25, uv.getY(i) * 0.5);
        g.rotateY(-Math.PI / 2); add(new THREE.Mesh(g, mats.detail)).position.set(xb - 0.003, lerp(y1, yC, 0.48), 0); }
}
// The extra detail on the 70s wedge, with a rally car's character: real louvre slats on the bonnet and across the engine
// cover, small round mirrors on stalks, bright door handles and fuel cap, lips on the side intakes, mud flaps, wiper, badge,
// and the interior seen through the visor (the driver on the left with a helmet on, a dark empty passenger seat, a dash and
// three-spoke wheel, and a roll-over hoop behind the seats). lite (rival cars in a race): none of it.
function wedgeDetail(car, p, pr, mats, X, lite) {
    if (lite) return;
    const q = pr.q, V = (x, y, z) => new THREE.Vector3(x, y, z), add = m => { car.add(m); return m; };
    const kit = interiorKit(car, p, mats, lite), { col, part } = kit, D = doors70(pr), LV = louvres70(pr);
    if (!mats.detail) mats.detail = new THREE.MeshStandardMaterial({ map: detailTexture('w70'), roughness: 0.45, metalness: 0.05 });
    const normalAt = (side, s, u) => { const P = (ss, uu) => skinPoint(pr, X, side, ss, uu), n = P(s + 0.004, u).sub(P(s - 0.004, u)).cross(P(s, u + 0.02).sub(P(s, u - 0.02))).normalize(); if (n.y < 0) n.negate(); return n; };
    // louvres: matt black slats, each tipped up at the back over its dark slot (black, so they never clash with stripes or stickers)
    for (const s of LV.front) for (const side of [1, -1]) add(louvreSlat(pr, X, s, 0.0052, side * LV.fu[side > 0 ? 0 : 1], side * LV.fu[side > 0 ? 1 : 0], 0.013, mats.carbon, 4));
    for (const s of LV.rear) add(louvreSlat(pr, X, s, 0.0085, -LV.ru, LV.ru, 0.021, mats.carbon, 8));
    // door mirrors: small round mirrors on short stalks, on the top of each door beside the windscreen pillar
    for (const side of [1, -1]) {
        const s = D.sP + 0.02, w = pr.width(s), u = q.cabinWB + 0.06, base = V(X(s), pr.surfAt(s, u) - 0.008, side * w * u), head = V(X(s) + 0.012, base.y + 0.05, side * Math.min(w * u + 0.06, w));
        col(add(bar(base, head, 0.012, mats.interior, 0.012)).geometry, 2);
        const shell = part(new THREE.SphereGeometry(1, 14, 10), 9); shell.scale.set(0.05, 0.034, 0.04); shell.position.set(head.x + 0.02, head.y + 0.012, head.z); shell.geometry.translate(0.35, 0, 0);   // (a bullet shape: rounded at the front, cut off flat at the back for the glass)
        const glass = part(new THREE.CircleGeometry(0.03, 16), 7); glass.rotation.y = -Math.PI / 2; glass.scale.z = 1.15; glass.position.set(head.x - 0.012, head.y + 0.012, head.z);
    }
    // door handles: a small bright bar in each recess
    for (const side of [1, -1]) { const [s, y] = handle70(pr, D), h = add(new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.014, 0.012), mats.chrome)); h.position.set(X(s), y + 0.004, side * (sideZ(pr, s, y) + 0.002)); }
    // the fuel cap: a bright round cap with a grip bar across it (an electric or hybrid car has a plain charging flap there instead)
    if (p.engine !== 'ev' && p.engine !== 'hybrid') { const [s, u] = cap70(pr), n = normalAt(-1, s, u), c = topPoint(pr, X, -1, s, u), qn = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), n);
        const cap = add(new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.037, 0.012, 20), mats.chrome)); cap.quaternion.copy(qn); cap.position.copy(c).addScaledVector(n, 0.005);
        const grip = add(new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.008, 0.011), mats.chrome)); grip.quaternion.copy(qn); grip.position.copy(c).addScaledVector(n, 0.014); }
    // real edges on the side intakes (their dark openings are part of the paintwork): a body-colour lip down the back and along the top, and a dark slat inside
    { const dB = Math.max(D.sA + 0.1, Math.min(D.sB, D.rearArch - 0.02)), s0 = dB + 0.012, s1 = D.rearArch - 0.008;
        if (D.rearArch - dB > 0.05) for (const side of [1, -1]) { const yL = p.ride + 0.12, hi = pr.surfAt(s1, 0.97), ya = lerp(yL, hi, 0.24), yb = lerp(yL, hi, 0.66), ym = lerp(ya, yb, 0.4);
            const at = (t, f, out) => { const ss = lerp(s0, s1, t), y = lerp(ym, lerp(ya, yb, f), Math.pow(t, 0.75)); return V(X(ss), y, side * (sideZ(pr, ss, y) + out)); };
            add(bar(at(1, -0.02, 0.003), at(1, 1.04, 0.003), 0.02, mats.paintPlain, 0.014));
            add(bar(at(0.45, 1.0, 0.002), at(1, 1.0, 0.002), 0.018, mats.paintPlain, 0.011));
            add(bar(at(0.5, 0.5, -0.004), at(0.99, 0.5, -0.004), 0.014, mats.dark, 0.007)); } }
    // mud flaps behind all four wheels
    for (const [ax, zin] of [[pr.frontAxle, 0.16], [pr.rearAxle, 0.15]]) for (const side of [1, -1]) { const s = ax + (p.wheel + 0.062) / p.L, yT = Math.max(pr.base(s) + 0.03, p.ride + 0.05), yLow = Math.min(yT - 0.04, 0.095);
        if (s < 0.985) { const f = add(new THREE.Mesh(new THREE.BoxGeometry(0.012, yT - yLow, 0.21), mats.dark)); f.position.set(X(s), (yT + yLow) / 2, side * (p.W / 2 - zin - 0.01)); f.rotation.z = 0.1; f.geometry.attributes.position.array.forEach((v, i, arr) => { if (i % 3 === 2 && arr[i - 1] < 0) arr[i] *= 0.8; });   // (tapered towards the bottom)
            const st = add(new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.02, 0.17), mats.paintPlain)); st.position.set(X(s) + (yT - yLow) * 0.02, yLow + (yT - yLow) * 0.3, f.position.z); st.rotation.z = 0.1; } }   // (a stripe in the car's colour)
    // a bright lip along the bottom of the nose intake, and a slim bar across its middle (they stand proud of the dark slot)
    { const onNose = (s, u) => skinPoint(pr, X, u < 0 ? -1 : 1, 0, Math.abs(u)).lerp(skinPoint(pr, X, u < 0 ? -1 : 1, 1 / 90, Math.abs(u)), s * 90);
        for (const [s, t, mat] of [[0.0036, 0.009, mats.chrome], [0.0082, 0.006, mats.carbon]]) for (let i = 0; i < 6; i++) { const a = onNose(s, lerp(-0.52, 0.52, i / 6)), b = onNose(s, lerp(-0.52, 0.52, (i + 1) / 6)); a.x += 0.005; b.x += 0.005; add(bar(a, b, t, mat, 0.012)); } }
    noseBadge(car, pr, mats, X, 0.031);
    parkedWiper(car, pr, mats, X, col);
    // ---- the interior, seen through the visor ----
    const span = pr.c1 - pr.c0;
    cabinFloor(pr, X, pr.c0 + 0.004, pr.c0 + span * 0.9, part);
    const sSeat = Math.min(pr.c1 - 0.05, Math.max(pr.rakeEnd + 0.3 / p.L, pr.c0 + 0.38 * span));   // (the same place as the cockpit view's eye)
    const wS = pr.width(sSeat), zSeat = wS * q.cabinWB * 0.3, deck = pr.topAt(sSeat, 0.3), xS = X(sSeat), sD = lerp(pr.c0, sSeat, 0.52);
    const head = z => Math.max(deck - 0.02, Math.min(deck + 0.17, cabinY(pr, sSeat, Math.abs(z) + 0.05) - 0.175));     // how high a helmet or headrest can sit under the glass
    dashAndWheel(car, pr, mats, X, kit, { sD, sSeat, zD: -zSeat, uD: 0.3, screen: false });
    // two round dials in the binnacle
    for (const dz of [-0.045, 0.045]) { const dial = part(new THREE.CircleGeometry(0.032, 14), 7); dial.rotation.y = -Math.PI / 2; dial.position.set(X(sD) - 0.135, pr.topAt(sD, 0.3) + 0.05, -zSeat + dz); }
    bucketSeat(part, xS, head(zSeat), zSeat, 0.4, [0, 1, 6], true);    // (the passenger seat: empty, dark, with a low flat headrest)
    bucketSeat(part, xS, head(-zSeat), -zSeat, 0.4, [0, 1, 5]);
    helmetedDriver(part, xS, head(-zSeat), -zSeat);
    // a roll-over hoop behind the seats, with a brace across it
    { const sH = Math.min(pr.c1 - 0.02, sSeat + 0.235 / p.L), wH = pr.width(sH), zh = wH * q.cabinWB * 0.66, yF = pr.topAt(sH, 0.5) - 0.02, yS = cabinY(pr, sH, zh + 0.04) - 0.03, yM = cabinY(pr, sH, zh * 0.45) - 0.045, xH = X(sH), tube = (a, b) => col(add(bar(a, b, 0.03, mats.interior)).geometry, 9);
        if (yS > yF + 0.08) { tube(V(xH, yF, zh), V(xH, yS, zh)); tube(V(xH, yF, -zh), V(xH, yS, -zh)); tube(V(xH, yS, zh), V(xH, yM, zh * 0.45)); tube(V(xH, yS, -zh), V(xH, yM, -zh * 0.45)); tube(V(xH, yM, zh * 0.45), V(xH, yM, -zh * 0.45)); tube(V(xH, yF, -zh), V(xH, yM, zh * 0.45)); } }
}
// a round rod from point a to point b
function rod(a, b, r, mat, seg = 10) {
    const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
}
// The 60s GT's tail: a small upright lamp cluster each side (a round amber lamp over a round red one, in a slim chrome bezel) and the
// number plate in a chrome frame, with a chrome plate lamp over it. Everything is sized from the tail's real end
// face, so it stays on the bodywork whatever the sliders are set to.
function gtTail(car, p, pr, mats, X) {
    const add = m => { car.add(m); return m; }, box = (dx, dy, dz, mat, x, y, z) => { const m = add(new THREE.Mesh(new THREE.BoxGeometry(dx, dy, dz), mat)); m.position.set(x, y, z); return m; };
    const xb = X(1), w1 = pr.width(1), yC = pr.topAt(1, 0), yB = Math.min(yC - 0.03, pr.bottomAt(1, 0)), mid = (yB + yC) / 2, H = yC - yB, e = 0.5 + (pr.q.round - 0.38) * 0.6;
    const halfAt = y => { const v = Math.min(1, Math.abs(y - mid) / (H / 2)), c = Math.sqrt(Math.max(0, 1 - Math.pow(v, 2 / e))); return Math.pow(c, pr.q.round) * w1 * (1 - Math.max(0, (y - mid) / (H / 2)) * 0.06); };
    if (!mats.detail) mats.detail = new THREE.MeshStandardMaterial({ map: detailTexture('gt'), roughness: 0.45, metalness: 0.05 });
    const r = Math.max(0.014, Math.min(0.034, H * 0.075)), ch = r * 5.0, ty = lerp(yB, yC, 0.62), zL = Math.max(0.12, Math.min(w1 * 0.8, halfAt(ty + ch / 2) - r * 1.3 - 0.025, halfAt(ty - ch / 2) - r * 1.3 - 0.025));
    for (const side of [1, -1]) { const z = side * zL;
        const bezel = add(new THREE.Mesh(new THREE.CapsuleGeometry(r * 1.3, ch - r * 2.6, 5, 16), mats.chrome)); bezel.scale.x = 0.2; bezel.position.set(xb - 0.003, ty, z);
        for (const [dy, mat] of [[r * 1.12, mats.amber], [-r * 1.12, mats.tail]]) { const l = add(new THREE.Mesh(new THREE.SphereGeometry(r, 16, 10), mat)); l.scale.x = 0.42; l.position.set(xb - r * 0.26 - 0.003, ty + dy, z); }   // two round lamps: amber over red
    }
    // the number plate in its chrome frame, low between the lamps, with a chrome plate lamp above it
    const room = 2 * (zL - r * 1.3) - 0.12, ph = Math.max(0.03, Math.min(0.085, H * 0.24, room / 4.2)), pw = ph * 4.2, py = ty - r * 3.4 + ph / 2;
    if (room > 0.14) { const pg = new THREE.PlaneGeometry(pw, ph), puv = pg.attributes.uv; for (let i = 0; i < puv.count; i++) puv.setY(i, 0.5 + puv.getY(i) * 0.5);
        pg.rotateY(-Math.PI / 2); add(new THREE.Mesh(pg, mats.detail)).position.set(xb - 0.0125, py, 0); box(0.012, ph + 0.014, pw + 0.014, mats.chrome, xb - 0.006, py, 0);
        box(0.03, 0.014, pw * 0.42, mats.chrome, xb - 0.012, py + ph / 2 + 0.02, 0); }
}
// The extra detail on the 60s GT, with 1960s craftsmanship: chrome door handles with push buttons, a chrome fuel cap, chrome
// strakes over the wing vents, chrome sill strips, small round mirrors, amber indicators under the headlamps, wiper and
// badge, and the interior seen through the glasshouse: tan leather seats, a wooden dashboard with round dials, a wood-rimmed
// three-spoke steering wheel and the driver with a full-face helmet on. lite (rival cars in a race): none of it.
function gtDetail(car, p, pr, mats, X, lite) {
    if (lite) return;
    const q = pr.q, V = (x, y, z) => new THREE.Vector3(x, y, z), add = m => { car.add(m); return m; };
    const kit = interiorKit(car, p, mats, lite), { col, part } = kit, D = doors70(pr);
    if (!mats.detail) mats.detail = new THREE.MeshStandardMaterial({ map: detailTexture('gt'), roughness: 0.45, metalness: 0.05 });
    // door mirrors: small round mirrors on short stalks, on the top of each door beside the windscreen pillar
    for (const side of [1, -1]) {
        const s = D.sP + 0.02, w = pr.width(s), u = q.cabinWB + 0.06, base = V(X(s), pr.surfAt(s, u) - 0.008, side * w * u), head = V(X(s) + 0.012, base.y + 0.05, side * Math.min(w * u + 0.06, w));
        col(add(bar(base, head, 0.01, mats.interior, 0.01)).geometry, 9);
        const shell = part(new THREE.SphereGeometry(1, 14, 10), 9); shell.scale.set(0.042, 0.029, 0.034); shell.position.set(head.x + 0.02, head.y + 0.012, head.z); shell.geometry.translate(0.35, 0, 0);
        const glass = part(new THREE.CircleGeometry(0.025, 16), 2); glass.rotation.y = -Math.PI / 2; glass.scale.z = 1.15; glass.position.set(head.x - 0.0095, head.y + 0.012, head.z);
    }
    // door handles: a slim chrome handle with a round push button in front of it
    for (const side of [1, -1]) { const [s, y] = handle70(pr, D), z = side * (sideZ(pr, s, y) + 0.008);
        const h = add(new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.015, 0.014), mats.chrome)); h.position.set(X(s), y, z);
        const b = add(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.016, 12), mats.chrome)); b.rotation.x = Math.PI / 2; b.position.set(X(s) + 0.068, y, z - side * 0.002); }
    // the fuel cap on the right rear wing: a chrome cap with a grip bar across it (an electric or hybrid car has a plain charging flap there instead)
    if (p.engine !== 'ev' && p.engine !== 'hybrid') { const [s, y] = cap60(pr), z = sideZ(pr, s, y) + 0.004;
        const cap = add(new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.038, 0.014, 20), mats.chrome)); cap.rotation.x = Math.PI / 2; cap.position.set(X(s), y, z);
        const grip = add(new THREE.Mesh(new THREE.BoxGeometry(0.054, 0.009, 0.012), mats.chrome)); grip.position.set(X(s), y, z + 0.008); }
    // two chrome strakes across each wing vent (the dark opening is part of the paintwork)
    { const VT = vent60(pr, D); if (VT.ok) for (const side of [1, -1]) for (const f of [0.3, 0.7]) { const y = lerp(VT.ya, VT.yb, f), at = s => V(X(s), y, side * (sideZ(pr, s, y) + 0.004)); add(bar(at(VT.v0 - 0.004), at(VT.v1 + 0.004), 0.008, mats.chrome, 0.012)); } }
    // a chrome strip along each sill, between the wheels
    { const s0 = D.fArch + 0.012, s1 = D.rearArch - 0.012, y = p.ride + 0.075; if (s1 - s0 > 0.08) for (const side of [1, -1]) for (let i = 0; i < 5; i++) { const at = t => { const s = lerp(s0, s1, t); return V(X(s), y, side * (sideZ(pr, s, y) + 0.003)); }; add(bar(at(i / 5), at((i + 1) / 5), 0.007, mats.chrome, 0.02)); } }
    // small amber indicator lamps under the headlamps, each in a chrome rim (left off a nose too low to hold them)
    { const HL = lamps60(pr); if (HL.y - HL.r - 0.085 > HL.yb) for (const side of [1, -1]) { const y = HL.y - HL.r - 0.05, z = side * HL.z;
        const l = add(new THREE.Mesh(new THREE.SphereGeometry(0.03, 14, 8), mats.amber)); l.scale.x = 0.4; l.position.set(X(0) + 0.004, y, z);
        const rim = add(new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.005, 6, 20), mats.chrome)); rim.rotation.y = Math.PI / 2; rim.position.set(X(0) + 0.005, y, z); } }
    noseBadge(car, pr, mats, X, 0.03);
    parkedWiper(car, pr, mats, X, col);
    // ---- the interior, seen through the glasshouse ----
    const span = pr.c1 - pr.c0;
    cabinFloor(pr, X, pr.c0 + 0.004, pr.c0 + span * 0.9, part);
    const sSeat = Math.min(pr.c1 - 0.05, Math.max(pr.rakeEnd + 0.3 / p.L, pr.c0 + 0.38 * span));   // (the same place as the cockpit view's eye)
    const wS = pr.width(sSeat), zSeat = wS * q.cabinWB * 0.3, deck = pr.topAt(sSeat, 0.3), xS = X(sSeat), sD = Math.min(lerp(pr.c0, sSeat, 0.52), lerp(pr.c0, pr.rakeEnd, 0.62));
    const head = z => Math.max(deck - 0.02, Math.min(deck + 0.17, cabinY(pr, sSeat, Math.abs(z) + 0.05) - 0.175));     // how high a helmet or headrest can sit under the roof
    // (a dark padded dash top, with a wood-rimmed wheel on bright spokes)
    dashAndWheel(car, pr, mats, X, kit, { sD, sSeat, zD: -zSeat, uD: 0.3, screen: false, tone: [4, 4, 15, 7, 15] });
    // the wooden dashboard: a plank right across the car, with two big dials in front of the driver and three small ones in the middle
    { const yD = pr.topAt(sD, 0.3), wD = pr.width(sD) * q.cabinWB * 0.86, xF = X(sD) - 0.17, plank = part(new THREE.BoxGeometry(0.02, 0.1, wD * 2), 14); plank.position.set(xF, yD + 0.035, 0);
        for (const [dz, r] of [[-zSeat - 0.055, 0.04], [-zSeat + 0.055, 0.04], [-0.07, 0.022], [0, 0.022], [0.07, 0.022]]) { const rim = part(new THREE.CircleGeometry(r + 0.006, 16), 7); rim.rotation.y = -Math.PI / 2; rim.position.set(xF - 0.011, yD + 0.04, dz);
            const dial = part(new THREE.CircleGeometry(r, 16), 2); dial.rotation.y = -Math.PI / 2; dial.position.set(xF - 0.0125, yD + 0.04, dz);
            const needle = part(new THREE.BoxGeometry(0.002, r * 0.85, 0.005), 7); needle.position.set(xF - 0.014, yD + 0.04 + r * 0.25, dz); needle.rotation.x = 0.7; } }
    bucketSeat(part, xS, head(zSeat), zSeat, 0.42, [10, 11, 11], true);    // (the passenger seat: empty, tan leather, with a low flat headrest)
    bucketSeat(part, xS, head(-zSeat), -zSeat, 0.42, [10, 11, 11]);
    helmetedDriver(part, xS, head(-zSeat), -zSeat);
    // two low rear seat backs behind the seats, in the darker leather
    { const sR = sSeat + 0.52 / p.L; if (sR < pr.c1 - 0.08) { const yR = pr.topAt(sR, 0.3), hR = Math.min(0.1, cabinY(pr, sR, zSeat) - yR - 0.16), wR = pr.width(sR) * q.cabinWB * 0.56; if (hR > 0.05) for (const side of [1, -1]) { const b = part(new THREE.SphereGeometry(1, 12, 8), 11); b.scale.set(0.05, hR * 0.6, wR / 2); b.position.set(X(sR), yR + hR * 0.45, side * (wR / 2 + 0.015)); b.rotation.z = 0.25; } } }
}
// where the 60s GT's round headlamps sit on the nose, and how big they can be (they shrink to fit a low nose)
function lamps60(pr) { const yt = pr.topAt(0, 0.72), yb = Math.min(yt - 0.03, pr.bottomAt(0, 0.72)), r = Math.max(0.045, Math.min(0.115, (yt - yb) * 0.27)); return { r, y: yt - r * 1.045, z: pr.width(0) * 0.7, yb }; }
// The measurements of a design's body (for the cockpit view): the profile curves, plus X(s), the position along the car
export function carFrame(design) { const pr = profiles(design); return { pr, X: s => design.L / 2 - s * design.L }; }
// Build a whole car as a group. Returns { group, mats, wheels, dispose }. The car points along +x and sits on y = 0.
// merge: combine parts for speed (used in races, where the car doesn't change)
// lite: a lighter build with fewer points on the curves (the same shape and paint), for the rival cars in a race
// draft: use the normal-size paint picture instead of the sharp one (the builder does this while a slider is being dragged)
export function createCar(design, { merge = false, lite = false, draft = false } = {}) {
    const mats = buildMaterials(design, lite || draft), wheels = [];
    const p = design, pr = profiles(p);
    const car = new THREE.Group();
    const body = new THREE.Mesh(bodyGeometry(p, pr, lite), mats.paint); car.add(body);
    // the cabin uses the same paint finish as the body, so the roof matches; the dark windows still shine through the clearcoat
    const fin = FINISHES[p.finish] || FINISHES.gloss;
    const hyper = isHyper(pr.q), s90 = isSuper90(pr.q), lt = isLongtail(pr.q), ev = isElectric(pr.q), w70 = isWedge70(pr.q), gt = isGT60(pr.q), fine = (hyper || s90 || lt || ev || w70 || gt) && !lite;        // fine: the small parts only the closely-seen car gets
    const cabinMat = new THREE.MeshPhysicalMaterial({ map: cabinTexture(p, pr, fine), transparent: fine, metalness: fin.metalness, roughness: Math.min(fin.roughness, 0.4), clearcoat: 1, clearcoatRoughness: 0.05,
        iridescence: fin.iridescence, iridescenceIOR: 1.6, side: fine ? THREE.BackSide : THREE.DoubleSide });   // (see-through glass shows only its outer skin, so it stays clear; the cabin's faces are wound inwards, so that is 'BackSide')
    if (fine && lt) Object.assign(cabinMat, { metalness: 0, roughness: 0.06, clearcoat: 0.5, envMapIntensity: 0.45, iridescence: 0 });   // (nearly all glass: dark and glossy, without the paint's metal flake washing it out)
    if (fine && (ev || w70 || gt) && cabinMat.map.userData.gloss) cabinMat.roughnessMap = cabinMat.metalnessMap = cabinMat.clearcoatMap = cabinMat.specularIntensityMap = cabinMat.map.userData.gloss;   // (smooth dark glass; the painted roof keeps the paint's finish)
    mats.cabin = cabinMat;
    car.add(new THREE.Mesh(cabinGeometry(p, pr, lite), cabinMat));
    const X = s => p.L / 2 - s * p.L;
    // wheels
    for (const [s, front] of [[pr.frontAxle, true], [pr.rearAxle, false]]) for (const side of [1, -1]) {
        const w = makeWheel(p, mats, front, lite, front && !!p.wheelCovers);
        w.position.set(X(s), p.wheel, side * (p.W / 2 - (front ? 0.16 : 0.15)));
        if (side < 0) { w.rotation.y = Math.PI; const cal = w.userData.cal; cal.position.x *= -1; cal.rotation.z *= -1; }   // (the callipers sit at the back of the disc on both sides)
        Object.assign(w.userData, { front, side });
        if (front && p.wheelCovers) {
            // a smooth cover over the outside of the wheel (it turns with the steering and hides the spokes): gently dished
            // towards the middle, with a fine groove near its edge and a rolled lip, so the light falls across it
            const R = p.wheel * 0.735, prof = [[0, 0.141], [0.12, 0.1412], [0.3, 0.1428], [0.55, 0.146], [0.8, 0.1505], [0.885, 0.1515], [0.9, 0.147], [0.915, 0.1515], [0.96, 0.151], [0.99, 0.147], [1, 0.14], [1, 0.118]];
            const cover = new THREE.Mesh(new THREE.LatheGeometry(prof.map(([r, z]) => new THREE.Vector2(r * R, z)), lite ? 20 : 36), mats.paintPlain);
            cover.rotation.x = Math.PI / 2; w.add(cover);
        }
        car.add(w); wheels.push(w);
    }
    // lights
    const q = pr.q;
    for (const side of [1, -1]) {
        if (q.lamps === 'round' && fine && gt) {   // (the 60s GT, close up) a bright lens in a chrome bowl, under a domed glass cover with a chrome rim
            const HL = lamps60(pr), r = HL.r, z = side * HL.z, x0 = X(0);
            if (!mats.clear) { mats.clear = mats.lens.clone(); mats.clear.opacity = 0.2; }
            const bowl = new THREE.Mesh(new THREE.CircleGeometry(r, 24), mats.chrome); bowl.rotation.y = Math.PI / 2; bowl.position.set(x0 + 0.003, HL.y, z); car.add(bowl);
            const lamp = new THREE.Mesh(new THREE.SphereGeometry(r * 0.6, 20, 10, 0, Math.PI), mats.head); lamp.rotation.y = Math.PI / 2; lamp.scale.z = 0.25; lamp.position.set(x0 + 0.004, HL.y, z); car.add(lamp);
            const cover = new THREE.Mesh(new THREE.SphereGeometry(r * 0.98, 20, 10, 0, Math.PI), mats.clear); cover.rotation.y = Math.PI / 2; cover.scale.z = 0.5; cover.position.set(x0 + 0.005, HL.y, z); car.add(cover);
            const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 1.02, r * 0.11, 8, 28), mats.chrome); ring.rotation.y = Math.PI / 2; ring.position.set(x0 + 0.01, HL.y, z); car.add(ring);
        } else if (q.lamps === 'round') {          // round lamps in the front corners, behind glass covers
            const ls = 0, z = side * pr.width(0) * 0.7, y = pr.topAt(0, 0.72) - 0.12;
            const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.115, 20, 12, 0, Math.PI), mats.head); lamp.rotation.y = Math.PI / 2; lamp.scale.z = 0.5;
            lamp.position.set(X(ls) + 0.005, y, z); car.add(lamp);
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.118, 0.014, 8, 24), mats.chrome); ring.rotation.y = Math.PI / 2; ring.position.set(X(ls) + 0.01, y, z); car.add(ring);
        } else if (q.lamps === 'pods') {    // two stacked lamps in a dark teardrop pod on each front wing
            // (the 90s supercar's lamps sit out towards the corners of its narrow nose, slightly further back)
            const wide = s90 || p.preset === 'super90', ls = wide ? POD90.s : 0.05, f = wide ? POD90.f : 0.66;
            const z = side * pr.width(ls) * f, y = pr.topAt(ls, f) - 0.04;
            const pod = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), mats.lens); pod.scale.set(wide ? 0.27 : 0.2, 0.075, 0.13);
            pod.position.set(X(ls), y, z); pod.rotation.z = -0.35; pod.rotation.y = side * 0.35; car.add(pod);
            if (fine && s90) {
                // under the clear cover: two projector lamps, each a bright lens in a chrome bowl, one behind and outside the other;
                // a slim running light along the inner edge; and a small amber indicator at the outer end
                if (!mats.clear) { mats.clear = mats.lens.clone(); mats.clear.opacity = 0.2; } pod.material = mats.clear;   // (its own clearer cover, so the lamps show through)
                const P = (s, u) => new THREE.Vector3(X(s), pr.surfAt(s, u), side * pr.width(s) * u), zAxis = new THREE.Vector3(0, 0, 1);
                for (const [ds, du, r] of [[-0.016, -0.05, 0.04], [0.012, 0.04, 0.036]]) {
                    const s = ls + ds, u = f + du, c = P(s, u), n = P(s + 0.012, u).sub(P(s - 0.012, u)).cross(P(s, u + 0.04).sub(P(s, u - 0.04))).normalize(); if (n.y < 0) n.negate();
                    n.lerp(new THREE.Vector3(1, 0.4, side * 0.1).normalize(), 0.35).normalize();
                    const qz = new THREE.Quaternion().setFromUnitVectors(zAxis, n), put = (m, h) => { m.quaternion.copy(qz); m.position.copy(c).addScaledVector(n, h); car.add(m); return m; };
                    put(new THREE.Mesh(new THREE.CircleGeometry(r, 20), mats.chrome), 0.003);
                    put(new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 6, 24), mats.chrome), 0.006);
                    put(new THREE.Mesh(new THREE.TorusGeometry(r * 0.6, 0.005, 6, 20), mats.carbon), 0.007);
                    put(new THREE.Mesh(new THREE.SphereGeometry(r * 0.55, 14, 10), mats.head), 0.004).scale.z = 0.55;
                }
                const a = P(ls - 0.034, f - 0.115), b = P(ls + 0.022, f - 0.075); a.y += 0.005; b.y += 0.005; car.add(bar(a, b, 0.007, mats.head, 0.012));
                const ind = new THREE.Mesh(new THREE.SphereGeometry(0.021, 12, 8), mats.amber); ind.scale.y = 0.5; ind.position.copy(P(ls + 0.04, f + 0.085)); car.add(ind);
            } else for (const [dx, dy, dz] of [[0.06, 0.01, -0.04], [-0.05, 0.035, 0.03]]) {
                const l = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), mats.head); l.position.set(X(ls) + dx, y + dy, z + side * dz); car.add(l);
            }
        } else if (q.lamps === 'twin') {    // two separate round lamps side by side at the front corner of each wing, facing forwards and a little up
            for (const [ls, f] of [[0.07, 0.6], [0.085, 0.8]]) {
                const w = pr.width(ls), y = pr.surfAt(ls, f), z = side * w * f;
                const n = new THREE.Vector3(1, 0.55, side * 0.28).normalize();     // which way the lamp faces
                if (fine) {
                    // the detailed unit leans most of the way towards the wing's own slope at this spot, so its rim sits evenly in
                    // the bodywork all the way round (otherwise the wing cuts across one side of it)
                    const P = (s, u) => new THREE.Vector3(X(s), pr.surfAt(s, u), side * pr.width(s) * u);
                    const sn = P(ls + 0.012, f).sub(P(ls - 0.012, f)).cross(P(ls, f + 0.04).sub(P(ls, f - 0.04))).normalize(); if (sn.y < 0) sn.negate();
                    n.lerp(sn, 0.7).normalize();
                }
                const base = new THREE.Vector3(X(ls), y, z).addScaledVector(n, fine ? -0.004 : -0.01);
                const q4 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n), qz = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
                const put = (m, h, qq = q4) => { m.quaternion.copy(qq); m.position.copy(base).addScaledVector(n, h); car.add(m); return m; };
                put(new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.07, 0.07, 24, 1, fine), mats.dark), 0);   // the housing (open at the top on the detailed car, to show the light unit inside)
                if (fine) {
                    // a proper light unit: a dark bowl, a small bright projector lens, a thin glowing ring of daytime running light, and a tinted clear cover over it all
                    put(new THREE.Mesh(insideOut(new THREE.CylinderGeometry(0.07, 0.03, 0.024, 24, 1, true)), mats.carbon), 0.024);
                    put(new THREE.Mesh(new THREE.CircleGeometry(0.034, 20), mats.dark), 0.0125, qz);
                    put(new THREE.Mesh(new THREE.SphereGeometry(0.024, 14, 10), mats.head), 0.017).scale.y = 0.6;
                    put(new THREE.Mesh(new THREE.TorusGeometry(0.057, 0.0045, 6, 36), mats.head), 0.032, qz);
                    put(new THREE.Mesh(new THREE.SphereGeometry(0.067, 20, 6, 0, Math.PI * 2, 0, Math.PI / 2), mats.lens), 0.036).scale.y = 0.2; mats.lens.opacity = 0.22;   // (a lighter tint than the other styles' lamp covers, so the light shows through)
                } else put(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 24), mats.head), 0.036);
                put(new THREE.Mesh(new THREE.TorusGeometry(0.07, fine ? 0.009 : 0.012, 8, 24), fine ? mats.carbon : mats.chrome), 0.038, qz);   // the rim (dark on the detailed unit, so the lit ring and lens stand out)
            }
        } else if (q.lamps === 'hidden') {  // closed pop-up lamps: a thin outline of the lid on each side of the nose
            const ls = 0.07, z = side * pr.width(ls) * 0.6, y = pr.topAt(ls, 0.6) + 0.004;
            if (w70) {   // (the 70s wedge's lids are outlined in its paintwork; its indicators lie on the nose, one at each end of the intake)
                const sI = 1 / (lite ? 54 : 90); car.add(skinStrip(pr, X, side, t => [sI, lerp(0.57, 0.87, t)], 0.0048, 0.004, mats.amber, 3)); continue; }
            const lid = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.006, 0.3), mats.dark); lid.position.set(X(ls), y, z); lid.rotation.z = -0.16; car.add(lid);
            const inner = new THREE.Mesh(new THREE.BoxGeometry(0.235, 0.008, 0.275), mats.paintPlain); inner.position.set(X(ls), y + 0.002, z); inner.rotation.z = -0.16; car.add(inner);
            const ind = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.035, 0.12), mats.amber); ind.position.set(X(0) + 0.005, pr.base(0) + 0.07, side * pr.width(0) * 0.62); car.add(ind);
        } else if (q.lamps === 'blade' && !ev) {   // slim swept LED blades on each front corner, in an L shape
            const ls = 0.04, z = side * pr.width(ls) * 0.72, y = pr.topAt(ls, 0.72) + 0.005;
            const housing = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.14), mats.lens); housing.position.set(X(ls) - 0.04, y - 0.01, z); housing.rotation.y = side * 0.45; housing.rotation.z = -0.28; car.add(housing);
            const a = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.035), mats.head);
            a.position.set(X(ls) - 0.04, y, z + side * 0.03); a.rotation.y = side * 0.45; a.rotation.z = -0.28; car.add(a);
            const b = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.18), mats.head);
            b.position.set(X(ls) + 0.12, y - 0.045, z - side * 0.05); b.rotation.z = -0.28; car.add(b);
        } else if (!lt && !ev) {
            const h = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.36), mats.head);
            h.position.set(X(0.045), pr.topAt(0.045, 0.62) - 0.02, side * pr.width(0.045) * 0.62); h.rotation.z = -0.3; car.add(h);
        }
    }
    if (lt) longtailLamps(car, pr, mats, X, lite);
    if (ev) longtailLamps(car, pr, mats, X, lite, lampEV, [0.3, 0.5]);   // blade lamps: a strip of light and two small lenses under a clear cover, swept back along each wing
    // grille: a wide shield shape on the nose (about 0.95 m across on the 60s GT, like the real car)
    if (q.grille === 'shield') {
        const gw = pr.width(0) * 0.68, gh = (pr.centre(0) - pr.base(0)) * 0.55, sh = new THREE.Shape();
        sh.moveTo(-gw, 0); sh.lineTo(gw, 0); sh.quadraticCurveTo(gw * 1.02, gh * 0.75, gw * 0.55, gh); sh.quadraticCurveTo(0, gh * 1.18, -gw * 0.55, gh); sh.quadraticCurveTo(-gw * 1.02, gh * 0.75, -gw, 0);
        const gy = pr.base(0) + 0.05;
        const make = (shape, mat, depth, dx) => { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }); g.rotateY(Math.PI / 2); const m = new THREE.Mesh(g, mat); m.position.set(X(0) + dx, gy, 0); car.add(m); return m; };
        make(sh, mats.chrome, 0.02, -0.005);
        const inner = make(sh, mats.grille, 0.02, 0.006); inner.scale.set(1, 0.86, 0.9); inner.position.y += gh * 0.06;
        // horizontal slats, each as wide as the grille is at its height (the shield narrows towards the top)
        if (fine && gt) {   // (close up) a fine black mesh inside the chrome surround, with three slim bars across it
            if (!mats.detail) mats.detail = new THREE.MeshStandardMaterial({ map: detailTexture('gt'), roughness: 0.45, metalness: 0.05 });
            const mg = new THREE.ShapeGeometry(sh, 10), mp = mg.attributes.position, mu = mg.attributes.uv;
            for (let i = 0; i < mp.count; i++) mu.setXY(i, lerp(0.27, 0.98, (mp.getX(i) + gw) / (2 * gw)), lerp(0.03, 0.47, Math.min(1, mp.getY(i) / (gh * 1.1))));
            mg.rotateY(Math.PI / 2); const mesh = new THREE.Mesh(mg, mats.detail); mesh.scale.set(1, 0.86, 0.9); mesh.position.set(X(0) + 0.0275, gy + gh * 0.06, 0); car.add(mesh);
            for (let i = 1; i <= 3; i++) { const t = i / 4.3, half = gw * lerp(0.97, 0.62, Math.pow(t, 1.8)) * 0.9; const bar = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.006, half * 2), mats.chrome); bar.position.set(X(0) + 0.031, gy + gh * t, 0); car.add(bar); }
        } else for (let i = 1; i < 6; i++) { const t = i / 6.5, half = gw * lerp(0.97, 0.62, Math.pow(t, 1.8)); const bar = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.008, half * 2), mats.chrome); bar.position.set(X(0) + 0.03, gy + gh * t, 0); car.add(bar); }
    }
    // chrome bumpers with overriders
    if (q.bumpers) for (const [s0, dir] of [[0, 1], [1, -1]]) {
        const y = pr.base(s0) + 0.03, wz = pr.width(s0) * 1.85;
        if (fine && gt) {   // (close up) the bar wraps round each corner, with rounded ends and two small over-riders
            const r = 0.027, xB = X(s0) + dir * 0.045, sr = s0 + dir * 0.04, V3 = (a, b, c) => new THREE.Vector3(a, b, c);
            car.add(rod(V3(xB, y, -wz / 2), V3(xB, y, wz / 2), r, mats.chrome, 12));
            for (const side of [1, -1]) { const a = V3(xB, y, side * wz / 2), b = V3(X(sr), y, side * Math.max(wz / 2, sideZ(pr, sr, y) + r + 0.004));
                car.add(rod(a, b, r, mats.chrome, 12));
                for (const pt of [a, b]) { const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), mats.chrome); ball.position.copy(pt); car.add(ball); }
                const ov = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.06, 4, 10), mats.chrome); ov.position.set(xB + dir * 0.014, y + 0.012, side * wz * 0.2); car.add(ov); }
            continue;
        }
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, wz, 10), mats.chrome); bar.rotation.x = Math.PI / 2;
        bar.position.set(X(s0) + dir * 0.04, y, 0); car.add(bar);
        for (const side of [1, -1]) { const ov = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.2, 10), mats.chrome); ov.position.set(X(s0) + dir * 0.05, y + 0.07, side * wz * 0.3); car.add(ov); }
    }
    // scoops: on the bonnet (60s) or on the roof (hypercar)
    if (q.scoop === 'bonnet' && fine && gt) {   // (close up) the scoop is cut off square at the front, with a dark mouth facing forwards
        const ss = 0.17, cut = 0.5, k = Math.sqrt(1 - cut * cut), g = new THREE.SphereGeometry(1, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), pa = g.attributes.position;
        for (let i = 0; i < pa.count; i++) if (pa.getX(i) > cut) pa.setX(i, cut);
        g.computeVertexNormals();
        const sc = new THREE.Mesh(g, mats.paintPlain); sc.scale.set(0.3, 0.05, 0.2); sc.position.set(X(ss), pr.centre(ss) - 0.01, 0); car.add(sc);
        const mouth = new THREE.Mesh(new THREE.CircleGeometry(1, 16, 0, Math.PI), mats.dark); mouth.rotation.y = Math.PI / 2; mouth.scale.set(0.2 * k * 0.88, 0.05 * k * 0.8, 1); mouth.position.set(X(ss) + 0.3 * cut + 0.002, pr.centre(ss) - 0.006, 0); car.add(mouth);
    } else if (q.scoop === 'bonnet') {
        const ss = 0.17, sc = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mats.paintPlain);
        sc.scale.set(0.3, 0.05, 0.2); sc.position.set(X(ss), pr.centre(ss) - 0.01, 0); car.add(sc);
        const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.3), mats.dark); mouth.position.set(X(ss) + 0.28, pr.centre(ss) + 0.012, 0); car.add(mouth);
    }
    if (q.scoop === 'roof') {
        const s0 = lerp(pr.rakeEnd, pr.roofEnd, 0.3), s1 = Math.min(pr.c1 - 0.02, s0 + 1.0 / p.L);
        const sh = new THREE.Shape(), len = (s1 - s0) * p.L, h0 = pr.roof(s0), h1 = pr.roof(s1);
        const hm = pr.roof(lerp(s0, s1, 0.5));
        sh.moveTo(0, h0 - 0.04); sh.lineTo(0, h0 + 0.07); sh.quadraticCurveTo(len * 0.5, hm + 0.08, len, h1 + 0.01); sh.lineTo(len, h1 - 0.04); sh.quadraticCurveTo(len * 0.5, hm - 0.04, 0, h0 - 0.04);
        const g = new THREE.ExtrudeGeometry(sh, { depth: 0.28, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
        g.translate(0, 0, -0.14);
        const sc = new THREE.Mesh(g, mats.paintPlain); sc.rotation.y = Math.PI; sc.position.set(X(s0), 0, 0); car.add(sc);
        const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.22), mats.dark); mouth.position.set(X(s0) + 0.02, h0 + 0.035, 0); car.add(mouth);
    }
    // a small roof intake just behind the windscreen
    if (q.scoop === 'snorkel' && !(fine && s90)) {
        const ss = lerp(pr.rakeEnd, pr.roofEnd, 0.12), y = pr.roof(ss);
        const sc = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.24), mats.paintPlain); sc.position.set(X(ss) - 0.16, y + 0.01, 0); car.add(sc);
        const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.035, 0.2), mats.dark); mouth.position.set(X(ss) + 0.05, y + 0.02, 0); car.add(mouth);
    }
    // rows of louvres on the bonnet, either side of the middle
    if (q.scoop === 'louvres' && !w70) for (const side of [1, -1]) for (let i = 0; i < 7; i++) {   // (the 70s wedge's louvres are slots in its paintwork, with real slats over them)
        const ss = 0.1 + i * 0.022, slat = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, pr.width(ss) * 0.42), mats.dark);
        slat.position.set(X(ss), pr.topAt(ss, 0.4) + 0.004, side * pr.width(ss) * 0.36); slat.rotation.z = -0.15; car.add(slat);
    }
    // a spoiler bar across the back of the roof, on two struts
    if (q.roofBar) {
        const ss = Math.min(pr.c1 - 0.02, pr.roofEnd + 0.012), y = pr.roof(ss) + 0.035, span = pr.width(ss) * 1.4;   // on the back edge of the roof
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, span), mats.dark); bar.position.set(X(ss), y, 0); bar.rotation.z = 0.15; car.add(bar);
        for (const side of [1, -1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.03), mats.dark); st.position.set(X(ss) + 0.02, y - 0.05, side * span * 0.42); car.add(st); }
    }
    // a wide dark vent across the bonnet
    if (q.scoop === 'bonnetvent' && !ev) {   // (the Electric's vent is an opening in its paintwork, with louvres over it)
        const ss = 0.11, w = pr.width(ss) * 0.9;
        const v = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, w), mats.dark); v.position.set(X(ss), pr.centre(ss) + 0.005, 0); v.rotation.z = -0.18; car.add(v);
        for (let i = -2; i <= 2; i++) { const fin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.035, 0.012), mats.carbon); fin.position.set(X(ss), pr.centre(ss) + 0.01, i * w / 5); fin.rotation.z = -0.18; car.add(fin); }
    }
    // one big dark air intake across the nose, wider at the top than the bottom (like an upside-down trapezium seen head-on).
    // Each point is laid onto the curved nose, so the intake hugs the bodywork instead of floating in front of it.
    if (q.cornerIntakes) {
        const W2 = p.W / 2, yTop = pr.base(0) + 0.14, yBot = pr.base(0.06) + 0.03, halfTop = W2 * 0.64, halfBot = W2 * 0.38;
        const ray = new THREE.Raycaster(), from = new THREE.Vector3(), back = new THREE.Vector3(-1, 0, 0);
        const onNose = (y, z) => { ray.set(from.set(p.L, y, z), back); const hit = ray.intersectObject(body)[0]; return (hit ? hit.point.x : X(0.05)) + 0.01; };
        const NU = 24, NV = 16, pos = [], idx = [], uvs = [];   // (enough points that it follows the curve of the nose)
        for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) {
            const v = j / NV, y = lerp(yBot, yTop, v), half = lerp(halfBot, halfTop, v), z = lerp(-half, half, i / NU);
            pos.push(onNose(y, z), y, z); uvs.push(0.625 + z / (2 * halfTop) * 0.7, 0.25 + (v - 0.5) * 1.4 * (yTop - yBot) / (2 * halfTop));
        }
        for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) { const a0 = j * (NU + 1) + i, b0 = a0 + NU + 1; idx.push(a0, a0 + 1, b0, a0 + 1, b0 + 1, b0); }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
        if (fine && ev) {   // the detailed Electric: black mesh in the opening, and two body-colour pillars that split it into a middle intake and a big one at each corner
            if (!mats.detail) mats.detail = new THREE.MeshStandardMaterial({ map: detailTexture('ev'), roughness: 0.45, metalness: 0.05 });
            g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx.slice().reverse()); g.computeVertexNormals(); car.add(new THREE.Mesh(g, mats.detail));
            for (const side of [1, -1]) { const pp = [], pi = [], hw = 0.028;
                for (let j = 0; j <= 8; j++) { const v = j / 8, y = lerp(yBot - 0.003, yTop + 0.003, v), zc = side * lerp(halfBot * 0.5, halfTop * 0.46, v); for (const dz of [-hw, hw]) pp.push(onNose(Math.min(yTop, Math.max(yBot, y)), zc + dz) + 0.007, y, zc + dz); }
                for (let j = 0; j < 8; j++) { const a = j * 2; pi.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
                const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(pp, 3)); pg.setIndex(pi); pg.computeVertexNormals(); car.add(new THREE.Mesh(pg, mats.paintPlain)); }
        } else car.add(new THREE.Mesh(g, mats.intake));
        // two slim bars across the opening
        for (const v of [0.35, 0.7]) {
            const y = lerp(yBot, yTop, v), half = lerp(halfBot, halfTop, v) * 0.96, pts = [];
            for (let i = 0; i <= NU; i++) { const z = lerp(-half, half, i / NU); pts.push(new THREE.Vector3(onNose(y, z) + 0.006, y, z)); }
            car.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.008, 5), mats.carbon));
        }
    }
    // a deep diffuser under the tail, with fins
    if (q.diffuser) {
        const w = pr.width(1) * 1.5, y = pr.base(1) + 0.03;
        const d = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, w), mats.carbon); d.position.set(X(1) - 0.02, y, 0); d.rotation.z = 0.22; car.add(d);
        if (!(fine && ev)) for (let i = -3; i <= 3; i++) { const fin = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.09, 0.015), mats.carbon); fin.position.set(X(1) - 0.04, y + 0.05, i * w / 7); car.add(fin); }
    }
    // a low oval air intake in the nose
    if (q.mouth) {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.03, 28), mats.dark);
        m.rotation.z = Math.PI / 2; m.scale.set(0.045, 1, pr.width(0) * 0.36);
        m.position.set(X(0) + 0.005, pr.base(0) + 0.055, 0); car.add(m);
    }
    // a big sweeping air intake on each side, behind the doors
    if (q.sideIntake && !s90 && !ev) for (const side of [1, -1]) {   // (the 90s supercar's and the Electric's are part of their paintwork instead)
        const s0 = p.tailBar ? 0.5 : 0.4, s1 = p.tailBar ? 0.71 : 0.69, yLo = pr.base(0.62) + 0.13, yHi = lerp(pr.base(0.62), pr.topAt(0.62, 1), 0.78);
        const sh = new THREE.Shape();
        const len = (s1 - s0) * p.L;    // a sweep that starts low along the door and rises to a deep opening in front of the rear wheel
        sh.moveTo(0, yLo + 0.03); sh.quadraticCurveTo(len * 0.6, yLo + 0.08, len, yHi); sh.lineTo(len, yHi - 0.2); sh.quadraticCurveTo(len * 0.55, yLo + 0.01, len * 0.04, yLo); sh.lineTo(0, yLo + 0.03);
        // the shape runs from the front edge (x = 0) backwards, so it's mirrored to point towards the tail
        const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), mats.intake);
        m.scale.x = -1; m.position.set(X(s0), 0, side * (pr.width(0.64) + 0.006));
        car.add(m);
    }
    // a full-width black mesh grille across the tail, with slats
    if (q.rearGrille && !s90 && !(fine && ev)) {
        const y0 = pr.base(1) + 0.06, y1 = lerp(pr.base(1), pr.centre(1), 0.62), w = pr.width(1) * 1.7;
        const panel = new THREE.Mesh(new THREE.BoxGeometry(0.02, y1 - y0, w), mats.grille); panel.position.set(X(1) - 0.005, (y0 + y1) / 2, 0); car.add(panel);
        for (let i = 1; i < 5; i++) { const slat = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, w * 0.96), mats.dark); slat.position.set(X(1) - 0.012, y0 + (y1 - y0) * i / 5, 0); car.add(slat); }
    }
    // exhausts
    if ((q.exhaust === 'quad' || q.exhaust === 'twin') && !((w70 || gt) && p.engine === 'ev')) {   // (an electric 70s wedge or 60s GT has none)
        const y0 = fine && gt ? pr.base(0.99) - 0.03 : lerp(pr.base(0.99), pr.centre(0.99), q.exhaust === 'quad' ? 0.45 : 0.15);   // (the 60s GT's pipes come out under its bumper)
        const pipes = q.exhaust === 'quad' ? [[0.065, 0.065], [-0.065, 0.065], [0.065, -0.065], [-0.065, -0.065]] : [[0.32, 0], [-0.32, 0]];
        if (q.exhaust === 'quad') { const surround = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 24), mats.dark); surround.rotation.z = Math.PI / 2; surround.position.set(X(1) - 0.005, y0, 0); car.add(surround); }
        for (const [dz, dy] of pipes) {
            const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 14, 1, true), mats.chrome); pipe.rotation.z = Math.PI / 2;
            pipe.position.set(X(1) - 0.02, y0 + dy, dz); car.add(pipe);
            if (hyper || (fine && (w70 || gt))) {   // a dark inside you can see into, and (close up) a rolled lip on the tip
                const inside = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.04, 0.12, lite ? 10 : 14, 1, true), mats.dark); insideOut(inside.geometry); inside.rotation.z = Math.PI / 2; inside.position.set(X(1) - 0.028, y0 + dy, dz); car.add(inside);
                const end = new THREE.Mesh(new THREE.CircleGeometry(0.042, lite ? 10 : 14), mats.dark); end.rotation.y = -Math.PI / 2; end.position.set(X(1) + 0.02, y0 + dy, dz); car.add(end);
                if (fine) { const lip = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.006, 6, 18), mats.chrome); lip.rotation.y = Math.PI / 2; lip.position.set(X(1) - 0.09, y0 + dy, dz); car.add(lip); }
            }
        }
    }
    if (s90) super90Tail(car, p, pr, mats, X, lite);
    else if (fine && gt) gtTail(car, p, pr, mats, X);
    else if (p.lamps === 'round' || p.lamps === 'pods') {   // classic round tail lamps, two each side
        const ty = lerp(pr.base(1), pr.centre(1), p.rearGrille ? 0.78 : 0.7);
        for (const side of [1, -1]) for (const k of [0.62, 0.82]) {
            const l = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 16), mats.tail); l.rotation.z = Math.PI / 2;
            l.position.set(X(1) - 0.005, ty, side * pr.width(1) * k); car.add(l);
        }
    } else if (p.tailBig && fine && w70) { wedgeTail(car, p, pr, mats, X);
    } else if (p.tailBig) {             // one big round lamp on each side of a tall flat tail
        const ty = lerp(pr.base(1), pr.centre(1), 0.6);
        for (const side of [1, -1]) {
            const z = side * pr.width(1) * 0.68;
            const l = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 24), mats.tail); l.rotation.z = Math.PI / 2; l.position.set(X(1) - 0.005, ty, z); car.add(l);
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.014, 8, 24), mats.dark); ring.rotation.y = Math.PI / 2; ring.position.set(X(1) - 0.01, ty, z); car.add(ring);
            const amber = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.034, 16), mats.amber); amber.rotation.z = Math.PI / 2; amber.position.set(X(1) - 0.01, ty, z); car.add(amber);
        }
    } else if (lt) { longtailTail(car, p, pr, mats, X, lite);
    } else if (fine && ev) { electricTail(car, p, pr, mats, X);
    } else if (p.tailBar) {             // a slim light bar right across the back, curling round the corners
        const ty = lerp(pr.base(1), pr.centre(1), 0.82), wz = pr.width(0.99) * 1.82;
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.035, wz), mats.tail); bar.position.set(X(1) - 0.01, ty, 0); car.add(bar);
        if (pr.q.tailW > 0.5) for (const side of [1, -1]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.03), mats.tail); c.position.set(X(0.975), ty - 0.02, side * pr.width(0.97) * 0.97); c.rotation.z = 0.12; car.add(c); }
    } else if (hyper) {                 // two round lamps each side, each a glowing ring round a centre lamp, set in a dark panel
        const ty = lerp(pr.base(1), pr.centre(1), 0.7), w1 = pr.width(1), r = Math.min(0.075, (pr.centre(1) - pr.base(1)) * 0.17), xb = X(1);
        for (const side of [1, -1]) {
            if (fine) {
                // a dark surround round each pair of lamps: a thin rounded panel lying flat on the tail (it leaves the paint and stripes around it alone)
                const hw = w1 * 0.15, rr = r * 1.3, sh = new THREE.Shape(); sh.moveTo(-hw, -rr); sh.lineTo(hw, -rr); sh.absarc(hw, 0, rr, -Math.PI / 2, Math.PI / 2, false); sh.lineTo(-hw, rr); sh.absarc(-hw, 0, rr, Math.PI / 2, Math.PI * 1.5, false);
                const pg = new THREE.ShapeGeometry(sh, 10); pg.rotateY(-Math.PI / 2); const panel = new THREE.Mesh(pg, mats.dark); panel.position.set(xb - 0.003, ty, side * w1 * 0.51); car.add(panel);
            }
            for (const [f, inner] of [[0.36, true], [0.66, false]]) {   // (set in a little from the corner, clear of the wing's edge)
                const z = side * w1 * f, at = (m, dx) => { m.position.set(xb - dx, ty, z); car.add(m); return m; };
                if (!fine) { const l = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.03, 14), mats.tail); l.rotation.z = Math.PI / 2; at(l, 0.005); continue; }
                // each lamp: one bright ring round a dark domed lens, with a small point of light in the middle
                at(new THREE.Mesh(new THREE.SphereGeometry(r * 0.78, 18, 10), mats.carbon), 0.004).scale.x = 0.24;
                at(new THREE.Mesh(new THREE.TorusGeometry(r * 0.84, r * 0.1, 8, 32), mats.tail), 0.012).rotation.y = Math.PI / 2;
                at(new THREE.Mesh(new THREE.SphereGeometry(r * 0.12, 10, 8), inner ? mats.tail : mats.amber), 0.02).scale.x = 0.6;   // (the outer lamps have amber indicators in the middle)
                at(new THREE.Mesh(new THREE.TorusGeometry(r * 1.0, 0.004, 6, 32), mats.chrome), 0.008).rotation.y = Math.PI / 2;
            }
        }
        // a slim high-level brake light in the middle of the tail's top edge
        if (fine) { const hi = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.014, w1 * 0.36), mats.tail); hi.position.set(xb - 0.004, pr.centre(1) - 0.035, 0); car.add(hi); }
    } else {
        const tl = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, pr.width(0.99) * 1.7), mats.tail);
        tl.position.set(X(0.995) - 0.01, lerp(pr.base(0.99), pr.centre(0.99), 0.72), 0); car.add(tl);
    }
    // aero
    // the raised bonnet triangle: its own panel with a flat top and sharp sloping edges, its point near the nose and its base at
    // the windscreen, following the shape of the bonnet underneath
    if (q.cross === 'vee') {
        const S = 26, sA = 0.025, sB = pr.c0 - 0.01, pos = [], idx = [];
        const cols = [-1.25, -1, -0.5, 0, 0.5, 1, 1.25];      // across: outer foot, top edge, top, ..., top edge, outer foot
        for (let i = 0; i <= S; i++) {
            const t = i / S, ss = lerp(sA, sB, t), w = pr.width(ss), hw = lerp(0.015, pr.veeHalf(sB), t), lift = lerp(0.012, 0.075, Math.min(1, t * 1.5));   // tapers to a sharp point
            for (const k of cols) {
                const foot = Math.abs(k) > 1, u = Math.sign(k) * Math.min(0.95, hw * (foot ? 1 + 0.06 / Math.max(0.05, hw * w) : Math.abs(k)));
                pos.push(X(ss), pr.surfAt(ss, u) + (foot ? -0.004 : lift), u * w);
            }
        }
        const C = cols.length;
        for (let i = 0; i < S; i++) for (let k = 0; k < C - 1; k++) { const a = i * C + k, b = a + C; idx.push(a, b, a + 1, a + 1, b, b + 1); }
        // each point takes the paint-map position of the bonnet straight below it, so stripes and liveries carry on over the panel
        const uv = [], ray = new THREE.Raycaster(), from = new THREE.Vector3(), down = new THREE.Vector3(0, -1, 0); body.updateMatrixWorld(true);
        for (let i = 0; i < pos.length; i += 3) { ray.set(from.set(pos[i], 3, pos[i + 2]), down); const hit = ray.intersectObject(body)[0]; uv.push(hit && hit.uv ? hit.uv.x : 0, hit && hit.uv ? hit.uv.y : 0.5); }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
        car.add(new THREE.Mesh(g, mats.paint));
    }
    // rally lights: a pod of four round driving lamps across the front of the bonnet
    if (p.rallyLights) {
        const s0 = 0.05, halfW = pr.width(s0), gap = Math.min(0.3, halfW * 0.44), r = Math.min(0.088, gap * 0.36);
        const y0 = Math.min(pr.topAt(s0, 0) + r * 0.85, w70 ? p.deck * 0.98 + r * 0.4 : 9), x0 = X(s0) + 0.02;   // (on the 70s wedge the pod never stands far above the bonnet line)
        const pod = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, gap * 3 + r * 2.4), mats.dark); pod.position.set(x0 - 0.04, y0 - r * 0.9, 0); car.add(pod);
        for (const z of [-1.5, -0.5, 0.5, 1.5].map(k => k * gap)) {
            const can = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.85, 0.11, 20), mats.dark); can.rotation.z = Math.PI / 2; can.position.set(x0, y0, z); car.add(can);
            const lens = new THREE.Mesh(new THREE.CircleGeometry(r * 0.86, 20), mats.head); lens.rotation.y = Math.PI / 2; lens.position.set(x0 + 0.056, y0, z); car.add(lens);
            const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.93, r * 0.12, 6, 20), mats.chrome); ring.rotation.y = Math.PI / 2; ring.position.set(x0 + 0.058, y0, z); car.add(ring);
            if (fine && w70) {   // rally touches: bright lamp shells with rounded backs, a domed lens, and one strip of tape across each lens
                can.material = mats.chrome; lens.geometry.dispose(); lens.geometry = new THREE.SphereGeometry(r * 0.86, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2); lens.rotation.set(0, 0, -Math.PI / 2); lens.scale.y = 0.16;
                const back = new THREE.Mesh(new THREE.SphereGeometry(r * 0.85, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), mats.chrome); back.rotation.z = Math.PI / 2; back.scale.y = 0.6; back.position.set(x0 - 0.055, y0, z); car.add(back);
                { const tape = new THREE.Mesh(new THREE.BoxGeometry(0.004, r * 0.2, r * 1.7), mats.dark); tape.position.set(x0 + 0.056 + r * 0.145, y0, z); car.add(tape); }
            }
        }
    }
    if (p.splitter) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.025, p.W * 0.86), mats.carbon); sp.position.set(X(0.02) - 0.12, pr.base(0.03) + 0.01, 0); car.add(sp); }
    if (p.skirts) for (const side of [1, -1]) {
        const sk = new THREE.Mesh(new THREE.BoxGeometry(p.L * 0.3, 0.06, 0.05), mats.carbon);
        sk.position.set(X(0.5), p.ride + 0.04, side * (pr.width(0.5) + 0.0)); car.add(sk);
    }
    if (p.wing === 'ducktail') {
        const d = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.07, pr.width(0.95) * 1.9), mats.paintPlain);
        d.position.set(X(0.95), pr.centre(0.95) + 0.03, 0); d.rotation.z = -0.25; car.add(d);
        if (fine && ev) { const lip = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.014, pr.width(0.95) * 1.9), mats.carbon); lip.position.set(X(0.95) - 0.143, pr.centre(0.95) + 0.03 + 0.079, 0); lip.rotation.z = -0.25; car.add(lip); }   // a fine carbon lip along its top edge
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
    if (hyper) hyperDetail(car, p, pr, mats, X, lite);
    if (s90) super90Detail(car, p, pr, mats, X, lite);
    if (lt) longtailDetail(car, p, pr, mats, X, lite);
    if (ev) electricDetail(car, p, pr, mats, X, lite);
    if (w70) wedgeDetail(car, p, pr, mats, X, lite);
    if (gt) gtDetail(car, p, pr, mats, X, lite);
    if (merge) { wheels.forEach(w => { const sp = w.userData.spin; sp.userData.wheelRoot = true; mergeByMaterial(sp); w.userData.wheelRoot = true; mergeByMaterial(w); }); mergeByMaterial(car); }
    // (the shared tyre and disc pictures, and shared suspension parts, are kept for the next car)
    const dispose = () => { car.traverse(o => { if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose(); }); Object.values(mats).forEach(m => { if (m.map && m.map !== TYRE_TEX && m.map !== DISC_TEX) m.map.dispose(); if (m.metalnessMap) m.metalnessMap.dispose(); m.dispose(); }); };
    return { group: car, mats, wheels, dispose, draft: draft && fine };
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


// =====================================================================
//  UNLOCKS: medals won in Race unlock extra parts in Build
// =====================================================================
// Points: gold 3, silver 2, bronze 1, counting your best medal on each track at each difficulty
export const UNLOCKS = [
    { pts: 1,  kind: 'finish',    value: 'pearl',     label: 'Pearl paint finish' },
    { pts: 3,  kind: 'rim',       value: 'turbine',   label: 'Turbine rims' },
    { pts: 5,  kind: 'wing',      value: 'swan',      label: 'Swan-neck wing' },
    { pts: 8,  kind: 'finish',    value: 'chrome',    label: 'Chrome paint finish' },
    { pts: 11, kind: 'livery',    value: 'chequer',   label: 'Chequered flag livery' },
    { pts: 14, kind: 'rim',       value: 'disc',      label: 'Aero disc rims' },
    { pts: 18, kind: 'rimColour', value: 'gold',      label: 'Gold rims' },
    { pts: 22, kind: 'livery',    value: 'lightning', label: 'Lightning livery' }
];
export function medalPoints() {
    let medals = {};
    try { medals = JSON.parse(localStorage.getItem('raceMedals')) || {}; } catch (e) { /* none yet */ }
    return Object.values(medals).reduce((sum, pos) => sum + ({ 1: 3, 2: 2, 3: 1 }[pos] || 0), 0);
}
// Is this option available? Things already on your car stay available.
export function lockFor(kind, value, design) {
    const u = UNLOCKS.find(x => x.kind === kind && x.value === value);
    if (!u || medalPoints() >= u.pts) return null;
    const current = { finish: design.finish, rim: design.rim, wing: design.wing, rimColour: design.rimColour, livery: design.livery }[kind];
    return current === value ? null : u;
}

// =====================================================================
//  SAVED CARS AND SHARE CODES
// =====================================================================
const CARS_KEY = 'builderCars';
export function loadSavedCars() { try { return JSON.parse(localStorage.getItem(CARS_KEY)) || []; } catch (e) { return []; } }
export function storeSavedCars(list) { try { localStorage.setItem(CARS_KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable */ } }
// A share code is the design's settings in a fixed order, as short text. No personal data, works offline.
const CODE_KEYS_1 = ['preset', 'L', 'W', 'nose', 'deck', 'roof', 'tail', 'cabin', 'fast', 'ride', 'wheel', 'paint', 'finish', 'rim', 'rimColour', 'caliper',
    'wing', 'splitter', 'skirts', 'engine', 'name', 'livery', 'stripeColour', 'twoTone', 'paint2', 'number', 'tag'];
// version 2 codes also carry the body-style details
const CODE_KEYS_2 = [...CODE_KEYS_1, 'wbFrac', 'axleShift', 'round', 'fenderH', 'fenderReach', 'cabinStyle', 'cabinWB', 'cabinWT', 'grille', 'lamps', 'bumpers', 'scoop', 'exhaust'];
// version 3 codes add the newer shape details
const CODE_KEYS_3 = [...CODE_KEYS_2, 'cross', 'crossB', 'crossW', 'noseW', 'noseTip', 'noseLift', 'mouth', 'sideIntake', 'rearGrille'];
const CODE_KEYS_4 = [...CODE_KEYS_3, 'cornerIntakes', 'tailBar', 'diffuser'];
const CODE_KEYS_5 = [...CODE_KEYS_4, 'roofBar', 'tailBig'];
const CODE_KEYS_6 = [...CODE_KEYS_5, 'tailMid', 'tailW', 'wheelCovers', 'noseW2'];
const CODE_KEYS_7 = [...CODE_KEYS_6, 'rake', 'screenBow', 'roofDrop', 'bulge'];
const CODE_KEYS_8 = [...CODE_KEYS_7, 'deckRear'];
const CODE_KEYS_9 = [...CODE_KEYS_8, 'roofLen', 'rallyLights'];
const CODE_KEYS = [...CODE_KEYS_9, 'waist'];
export function encodeDesign(d) {
    const arr = CODE_KEYS.map(k => {
        const v = d[k];
        if (typeof v === 'number') return Math.round(v * 1000) / 1000;
        if (Array.isArray(v)) return v.map(n => Math.round(n * 1000) / 1000);
        if (typeof v === 'boolean') return v ? 1 : 0;
        return v;
    });
    const json = JSON.stringify(arr);
    return 'SL10-' + btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function decodeDesign(code) {
    const m = String(code || '').trim().match(/^SL(\d{1,2})-([A-Za-z0-9_-]+)$/);
    if (!m) return null;
    const keys = { 1: CODE_KEYS_1, 2: CODE_KEYS_2, 3: CODE_KEYS_3, 4: CODE_KEYS_4, 5: CODE_KEYS_5, 6: CODE_KEYS_6, 7: CODE_KEYS_7, 8: CODE_KEYS_8, 9: CODE_KEYS_9, 10: CODE_KEYS }[m[1]];
    const ver = +m[1];
    try {
        let b = m[2].replace(/-/g, '+').replace(/_/g, '/'); while (b.length % 4) b += '=';
        const arr = JSON.parse(decodeURIComponent(escape(atob(b))));
        if (!Array.isArray(arr) || arr.length !== keys.length) return null;
        const d = { ...DEFAULT };
        const num = (v, lo, hi, def) => typeof v === 'number' && isFinite(v) ? Math.min(hi, Math.max(lo, v)) : def;
        const pickKey = (v, obj, def) => Object.prototype.hasOwnProperty.call(obj, v) ? v : def;
        const colour = (v, def) => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v : def;
        const raw = Object.fromEntries(keys.map((k, i) => [k, arr[i]]));
        d.preset = typeof raw.preset === 'string' ? raw.preset.slice(0, 20) : 'custom';
        d.L = num(raw.L, 3.5, 5.4, d.L); d.W = num(raw.W, 1.7, 2.1, d.W); d.nose = num(raw.nose, 0.3, 0.75, d.nose);
        d.deck = num(raw.deck, 0.7, 0.95, d.deck); d.roof = num(raw.roof, 1.0, 1.35, d.roof); d.tail = num(raw.tail, 0.6, 1.05, d.tail);
        d.cabin = Array.isArray(raw.cabin) && raw.cabin.length === 2 ? [num(raw.cabin[0], 0.2, 0.6, 0.3), num(raw.cabin[1], 0.5, 0.95, 0.62)] : d.cabin;
        d.fast = num(raw.fast, 0, 1, d.fast); d.ride = num(raw.ride, 0.06, 0.2, d.ride); d.wheel = num(raw.wheel, 0.31, 0.38, d.wheel);
        d.paint = colour(raw.paint, d.paint); d.finish = pickKey(raw.finish, FINISHES, d.finish); d.rim = pickKey(raw.rim, RIMS, d.rim);
        d.rimColour = pickKey(raw.rimColour, RIM_COLOURS, d.rimColour); d.caliper = colour(raw.caliper, d.caliper); d.wing = pickKey(raw.wing, WINGS, d.wing);
        d.splitter = !!raw.splitter; d.skirts = !!raw.skirts; d.engine = pickKey(raw.engine, ENGINES, d.engine);
        d.name = typeof raw.name === 'string' ? raw.name.slice(0, 24) : d.name;
        d.livery = typeof raw.livery === 'string' && ALL_LIVERIES.includes(raw.livery) ? raw.livery : 'none';
        d.stripeColour = colour(raw.stripeColour, d.stripeColour); d.twoTone = !!raw.twoTone; d.paint2 = colour(raw.paint2, d.paint2);
        d.number = String(raw.number ?? '').replace(/[^0-9]/g, '').slice(0, 2); d.tag = String(raw.tag ?? '').slice(0, 14);
        // body-style details (version 2 codes); older codes get the plain defaults
        const oneOf = (v, list, def) => list.includes(v) ? v : def;
        Object.assign(d, SHAPE_DEFAULTS);
        if (ver > 1) {
            d.wbFrac = num(raw.wbFrac, 0.5, 0.65, 0.6); d.axleShift = num(raw.axleShift, -0.08, 0.08, 0); d.round = num(raw.round, 0.3, 0.7, 0.38);
            d.fenderH = num(raw.fenderH, 0, 0.25, 0.06); d.fenderReach = num(raw.fenderReach, 1.8, 3.5, 2.5);
            d.cabinStyle = oneOf(raw.cabinStyle, ['canopy', 'glasshouse', 'bubble', 'tallglass', 'visor'], 'canopy'); d.cabinWB = num(raw.cabinWB, 0.6, 0.95, 0.82); d.cabinWT = num(raw.cabinWT, 0.4, 0.8, 0.58);
            d.grille = oneOf(raw.grille, ['none', 'shield'], 'none'); d.lamps = oneOf(raw.lamps, ['slim', 'round', 'pods', 'blade', 'hidden', 'twin'], 'slim'); d.bumpers = !!raw.bumpers;
            d.scoop = oneOf(raw.scoop, ['none', 'bonnet', 'roof', 'snorkel', 'bonnetvent', 'louvres'], 'none'); d.exhaust = oneOf(raw.exhaust, ['none', 'twin', 'quad'], 'none');
        }
        if (ver >= 3) {
            d.cross = oneOf(raw.cross, ['flat', 'triple', 'vee'], 'flat'); d.crossB = num(raw.crossB, 0, 0.12, 0.07); d.crossW = num(raw.crossW, 0, 0.15, 0.09);
            d.noseW = num(raw.noseW, 0.35, 0.95, 0.72); d.noseTip = num(raw.noseTip, 0.4, 1, 0.78); d.noseLift = num(raw.noseLift, 0.5, 3, 2.4);
            d.mouth = !!raw.mouth; d.sideIntake = !!raw.sideIntake; d.rearGrille = !!raw.rearGrille;
        }
        if (ver >= 4) { d.cornerIntakes = !!raw.cornerIntakes; d.tailBar = !!raw.tailBar; d.diffuser = !!raw.diffuser; }
        if (ver >= 5) { d.roofBar = !!raw.roofBar; d.tailBig = !!raw.tailBig; }
        if (ver >= 6) { d.tailMid = num(raw.tailMid, 0.4, 1, 0.96); d.tailW = num(raw.tailW, 0.2, 1, 0.88); d.wheelCovers = !!raw.wheelCovers; d.noseW2 = num(raw.noseW2, 0.6, 0.95, 0.9); }
        if (ver >= 7) { d.rake = num(raw.rake, 0.12, 0.5, 0.34); d.screenBow = num(raw.screenBow, 0.4, 0.9, 0.74); d.roofDrop = num(raw.roofDrop, 0.9, 1, 0.995); d.bulge = num(raw.bulge, 0, 0.06, 0); }
        if (ver >= 8) d.deckRear = num(raw.deckRear, 0.8, 1.3, 1);
        if (ver >= 9) { d.roofLen = num(raw.roofLen, 0, 0.95, 0); d.rallyLights = !!raw.rallyLights; }
        if (ver >= 10) d.waist = num(raw.waist, 0.8, 1, 0.95);
        return d;
    } catch (e) { return null; }
}
