// Supercar Legends: the car model shared by the builder and the race.
// Everything is made in code: no model files, no textures to download, so it works offline and stays small.
import * as THREE from './lib/three.module.min.js';

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
                noseW: 0.62, noseW2: 0.82, noseTip: 0.45, noseLift: 3.0, wbFrac: 0.588, axleShift: 0.045, round: 0.32, fenderH: 0.03, fenderReach: 2.2,
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
function cabinTexture(d, pr) {
    const W = 512, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'), Y = v => (1 - v) * H, glass = '#0b0f14';
    const span = pr.c1 - pr.c0, rake = (pr.rakeEnd - pr.c0) / span, roofEnd = (pr.roofEnd - pr.c0) / span;
    const rect = (u0, u1, v0, v1) => x.fillRect(u0 * W, Y(v1), (u1 - u0) * W, Y(v0) - Y(v1));
    const style = pr.q.cabinStyle;
    x.fillStyle = style === 'glasshouse' || style === 'tallglass' || style === 'visor' ? d.paint : glass; x.fillRect(0, 0, W, H);
    if (style === 'glasshouse') {
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
    if (style === 'bubble') { x.fillStyle = d.paint; rect(rake * 0.9, 1, 0.45, 0.55); }   // painted roof spine
    if (style === 'visor') {                                     // a curved windscreen wrapping round into the sides, like a helmet visor
        x.fillStyle = glass;
        // it ends at the front of the roof in the middle, and wraps further back round each side
        x.beginPath(); x.moveTo(0.02 * W, Y(0.262)); x.lineTo(0.02 * W, Y(0.738)); x.lineTo((rake + 0.12) * W, Y(0.738));
        x.quadraticCurveTo((rake - 0.06) * W, Y(0.5), (rake + 0.12) * W, Y(0.262)); x.closePath(); x.fill();
        rect(rake + 0.16, 0.74, 0.262, 0.38); rect(rake + 0.16, 0.74, 0.62, 0.738);   // side windows behind it
    }
    if (style === 'tallglass') {                                 // big windscreen, tall side glass, painted roof and engine cover
        x.fillStyle = glass;
        rect(0.02, rake + 0.03, 0.255, 0.745);
        rect(rake + 0.04, 0.55, 0.255, 0.4); rect(rake + 0.04, 0.55, 0.6, 0.745);           // door windows
        rect(0.58, 0.68, 0.38, 0.62);                                                        // small rear window over the engine
        if (d.engine !== 'ev' && d.preset !== 'electric') {      // engine cover vents (an electric car has no engine to cool there)
            x.fillStyle = 'rgba(0,0,0,.55)'; for (let i = 0; i < 4; i++) rect(0.72 + i * 0.05, 0.75 + i * 0.05, 0.42, 0.58);
        }
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

// =====================================================================
//  WHEELS
// =====================================================================
function makeWheel(p, mats, front, lite = false) {
    const g = new THREE.Group();
    const R = p.wheel, tw = front ? 0.27 : 0.32, rimR = R * 0.72;
    // tyre: a rounded profile spun around the axle
    const prof = [];
    const tp = lite ? 6 : 12, ts = lite ? 18 : 28;
    for (let i = 0; i <= tp; i++) { const a = -Math.PI / 2 + Math.PI * i / tp; prof.push(new THREE.Vector2(rimR + (R - rimR) * (0.55 + 0.45 * Math.cos(a)), (tw / 2) * Math.sin(a))); }
    const tyre = new THREE.Mesh(new THREE.LatheGeometry(prof, ts), mats.tyre);
    tyre.rotation.x = Math.PI / 2; g.add(tyre);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(rimR, rimR, tw * 0.9, ts, 1, true), mats.rim);
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
    if (p.rim === 'wire') {                 // many thin crossed spokes and a central spinner
        spoke(24, rimR * 0.022, 0.18, 0.01); spoke(24, rimR * 0.022, -0.18, 0.01);
        for (const r of [0, Math.PI / 2]) { const ear = new THREE.Mesh(new THREE.BoxGeometry(rimR * 0.5, rimR * 0.08, 0.04), mats.rim); ear.rotation.z = r + 0.4; ear.position.z = 0.03; face.add(ear); }
    }
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
function liveryTexture(d) {
    const W = 1024, H = 512, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
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
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return t;
}
function paintMaterial(design, plain = false) {
    const f = FINISHES[design.finish], useMap = !plain && hasLivery(design);
    return new THREE.MeshPhysicalMaterial({ color: useMap ? '#ffffff' : design.paint, map: useMap ? liveryTexture(design) : null,
        metalness: f.metalness, roughness: f.roughness, clearcoat: f.clearcoat, clearcoatRoughness: 0.08,
        iridescence: f.iridescence, iridescenceIOR: 1.6, side: THREE.DoubleSide });
}
function buildMaterials(design) {
    const rc = RIM_COLOURS[design.rimColour];
    return {
        paint: paintMaterial(design),
        paintPlain: paintMaterial(design, true),
        glass: new THREE.MeshPhysicalMaterial({ color: 0x0a0d12, metalness: 0.3, roughness: 0.06, clearcoat: 1, side: THREE.DoubleSide }),
        carbon: new THREE.MeshStandardMaterial({ color: 0x15171b, metalness: 0.4, roughness: 0.45 }),
        tyre: new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.9, side: THREE.DoubleSide }),
        rim: rc === 'chrome' ? new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.05 })
                             : new THREE.MeshStandardMaterial({ color: rc, metalness: 0.8, roughness: 0.3, side: THREE.DoubleSide }),
        brake: new THREE.MeshStandardMaterial({ color: 0x5a5f68, metalness: 0.9, roughness: 0.4 }),
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
// Build a whole car as a group. Returns { group, mats, wheels, dispose }. The car points along +x and sits on y = 0.
// merge: combine parts for speed (used in races, where the car doesn't change)
// lite: a lighter build with fewer points on the curves (the same shape and paint), for the rival cars in a race
export function createCar(design, { merge = false, lite = false } = {}) {
    const mats = buildMaterials(design), wheels = [];
    const p = design, pr = profiles(p);
    const car = new THREE.Group();
    const body = new THREE.Mesh(bodyGeometry(p, pr, lite), mats.paint); car.add(body);
    // the cabin uses the same paint finish as the body, so the roof matches; the dark windows still shine through the clearcoat
    const fin = FINISHES[p.finish] || FINISHES.gloss;
    const cabinMat = new THREE.MeshPhysicalMaterial({ map: cabinTexture(p, pr), metalness: fin.metalness, roughness: Math.min(fin.roughness, 0.4), clearcoat: 1, clearcoatRoughness: 0.05,
        iridescence: fin.iridescence, iridescenceIOR: 1.6, side: THREE.DoubleSide });
    mats.cabin = cabinMat;
    car.add(new THREE.Mesh(cabinGeometry(p, pr, lite), cabinMat));
    const X = s => p.L / 2 - s * p.L;
    // wheels
    for (const [s, front] of [[pr.frontAxle, true], [pr.rearAxle, false]]) for (const side of [1, -1]) {
        const w = makeWheel(p, mats, front, lite);
        w.position.set(X(s), p.wheel, side * (p.W / 2 - (front ? 0.16 : 0.15)));
        if (side < 0) w.rotation.y = Math.PI;
        w.userData = { front, side };
        if (front && p.wheelCovers) {
            // a smooth, slightly domed cover over the outside of the wheel (it turns with the steering but hides the spokes)
            const cover = new THREE.Mesh(new THREE.CylinderGeometry(p.wheel * 0.7, p.wheel * 0.74, 0.03, 28), mats.paintPlain);
            cover.rotation.x = Math.PI / 2; cover.position.z = 0.135; w.add(cover);
        }
        car.add(w); wheels.push(w);
    }
    // lights
    const q = pr.q;
    for (const side of [1, -1]) {
        if (q.lamps === 'round') {          // round lamps in the front corners, behind glass covers
            const ls = 0, z = side * pr.width(0) * 0.7, y = pr.topAt(0, 0.72) - 0.12;
            const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.115, 20, 12, 0, Math.PI), mats.head); lamp.rotation.y = Math.PI / 2; lamp.scale.z = 0.5;
            lamp.position.set(X(ls) + 0.005, y, z); car.add(lamp);
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.118, 0.014, 8, 24), mats.chrome); ring.rotation.y = Math.PI / 2; ring.position.set(X(ls) + 0.01, y, z); car.add(ring);
        } else if (q.lamps === 'pods') {    // two stacked lamps in a dark teardrop pod on each front wing
            // (the 90s supercar's lamps sit out towards the corners of its narrow nose, slightly further back)
            const wide = p.preset === 'super90', ls = wide ? 0.075 : 0.05, f = wide ? 0.84 : 0.66;
            const z = side * pr.width(ls) * f, y = pr.topAt(ls, f) - 0.04;
            const pod = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), mats.lens); pod.scale.set(p.preset === 'super90' ? 0.27 : 0.2, 0.075, 0.13);
            pod.position.set(X(ls), y, z); pod.rotation.z = -0.35; pod.rotation.y = side * 0.35; car.add(pod);
            for (const [dx, dy, dz] of [[0.06, 0.01, -0.04], [-0.05, 0.035, 0.03]]) {
                const l = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), mats.head); l.position.set(X(ls) + dx, y + dy, z + side * dz); car.add(l);
            }
        } else if (q.lamps === 'twin') {    // two separate round lamps side by side at the front corner of each wing, facing forwards and a little up
            for (const [ls, f] of [[0.07, 0.6], [0.085, 0.8]]) {
                const w = pr.width(ls), y = pr.surfAt(ls, f), z = side * w * f;
                const n = new THREE.Vector3(1, 0.55, side * 0.28).normalize();     // which way the lamp faces
                const base = new THREE.Vector3(X(ls), y, z).addScaledVector(n, -0.01);
                const q4 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
                const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.07, 0.07, 24), mats.dark); cup.quaternion.copy(q4); cup.position.copy(base); car.add(cup);
                const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 24), mats.head); lens.quaternion.copy(q4); lens.position.copy(base).addScaledVector(n, 0.036); car.add(lens);
                const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 8, 24), mats.chrome); bezel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); bezel.position.copy(base).addScaledVector(n, 0.038); car.add(bezel);
            }
        } else if (q.lamps === 'hidden') {  // closed pop-up lamps: a thin outline of the lid on each side of the nose
            const ls = 0.07, z = side * pr.width(ls) * 0.6, y = pr.topAt(ls, 0.6) + 0.004;
            const lid = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.006, 0.3), mats.dark); lid.position.set(X(ls), y, z); lid.rotation.z = -0.16; car.add(lid);
            const inner = new THREE.Mesh(new THREE.BoxGeometry(0.235, 0.008, 0.275), mats.paintPlain); inner.position.set(X(ls), y + 0.002, z); inner.rotation.z = -0.16; car.add(inner);
            const ind = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.035, 0.12), mats.amber); ind.position.set(X(0) + 0.005, pr.base(0) + 0.07, side * pr.width(0) * 0.62); car.add(ind);
        } else if (q.lamps === 'blade') {   // slim swept LED blades on each front corner, in an L shape
            const ls = 0.04, z = side * pr.width(ls) * 0.72, y = pr.topAt(ls, 0.72) + 0.005;
            const housing = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.14), mats.lens); housing.position.set(X(ls) - 0.04, y - 0.01, z); housing.rotation.y = side * 0.45; housing.rotation.z = -0.28; car.add(housing);
            const a = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.035), mats.head);
            a.position.set(X(ls) - 0.04, y, z + side * 0.03); a.rotation.y = side * 0.45; a.rotation.z = -0.28; car.add(a);
            const b = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.18), mats.head);
            b.position.set(X(ls) + 0.12, y - 0.045, z - side * 0.05); b.rotation.z = -0.28; car.add(b);
        } else {
            const h = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.36), mats.head);
            h.position.set(X(0.045), pr.topAt(0.045, 0.62) - 0.02, side * pr.width(0.045) * 0.62); h.rotation.z = -0.3; car.add(h);
        }
    }
    // grille: a wide shield shape on the nose (about 0.95 m across on the 60s GT, like the real car)
    if (q.grille === 'shield') {
        const gw = pr.width(0) * 0.68, gh = (pr.centre(0) - pr.base(0)) * 0.55, sh = new THREE.Shape();
        sh.moveTo(-gw, 0); sh.lineTo(gw, 0); sh.quadraticCurveTo(gw * 1.02, gh * 0.75, gw * 0.55, gh); sh.quadraticCurveTo(0, gh * 1.18, -gw * 0.55, gh); sh.quadraticCurveTo(-gw * 1.02, gh * 0.75, -gw, 0);
        const gy = pr.base(0) + 0.05;
        const make = (shape, mat, depth, dx) => { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }); g.rotateY(Math.PI / 2); const m = new THREE.Mesh(g, mat); m.position.set(X(0) + dx, gy, 0); car.add(m); return m; };
        make(sh, mats.chrome, 0.02, -0.005);
        const inner = make(sh, mats.grille, 0.02, 0.006); inner.scale.set(1, 0.86, 0.9); inner.position.y += gh * 0.06;
        // horizontal slats, each as wide as the grille is at its height (the shield narrows towards the top)
        for (let i = 1; i < 6; i++) { const t = i / 6.5, half = gw * lerp(0.97, 0.62, Math.pow(t, 1.8)); const bar = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.008, half * 2), mats.chrome); bar.position.set(X(0) + 0.03, gy + gh * t, 0); car.add(bar); }
    }
    // chrome bumpers with overriders
    if (q.bumpers) for (const [s0, dir] of [[0, 1], [1, -1]]) {
        const y = pr.base(s0) + 0.03, wz = pr.width(s0) * 1.85;
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, wz, 10), mats.chrome); bar.rotation.x = Math.PI / 2;
        bar.position.set(X(s0) + dir * 0.04, y, 0); car.add(bar);
        for (const side of [1, -1]) { const ov = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.2, 10), mats.chrome); ov.position.set(X(s0) + dir * 0.05, y + 0.07, side * wz * 0.3); car.add(ov); }
    }
    // scoops: on the bonnet (60s) or on the roof (hypercar)
    if (q.scoop === 'bonnet') {
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
    if (q.scoop === 'snorkel') {
        const ss = lerp(pr.rakeEnd, pr.roofEnd, 0.12), y = pr.roof(ss);
        const sc = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.24), mats.paintPlain); sc.position.set(X(ss) - 0.16, y + 0.01, 0); car.add(sc);
        const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.035, 0.2), mats.dark); mouth.position.set(X(ss) + 0.05, y + 0.02, 0); car.add(mouth);
    }
    // rows of louvres on the bonnet, either side of the middle
    if (q.scoop === 'louvres') for (const side of [1, -1]) for (let i = 0; i < 7; i++) {
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
    if (q.scoop === 'bonnetvent') {
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
        const NU = 24, NV = 16, pos = [], idx = [];   // (enough points that it follows the curve of the nose)
        for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) {
            const v = j / NV, y = lerp(yBot, yTop, v), half = lerp(halfBot, halfTop, v), z = lerp(-half, half, i / NU);
            pos.push(onNose(y, z), y, z);
        }
        for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) { const a0 = j * (NU + 1) + i, b0 = a0 + NU + 1; idx.push(a0, a0 + 1, b0, a0 + 1, b0 + 1, b0); }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
        car.add(new THREE.Mesh(g, mats.intake));
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
        for (let i = -3; i <= 3; i++) { const fin = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.09, 0.015), mats.carbon); fin.position.set(X(1) - 0.04, y + 0.05, i * w / 7); car.add(fin); }
    }
    // a low oval air intake in the nose
    if (q.mouth) {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.03, 28), mats.dark);
        m.rotation.z = Math.PI / 2; m.scale.set(0.045, 1, pr.width(0) * 0.36);
        m.position.set(X(0) + 0.005, pr.base(0) + 0.055, 0); car.add(m);
    }
    // a big sweeping air intake on each side, behind the doors
    if (q.sideIntake) for (const side of [1, -1]) {
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
    if (q.rearGrille) {
        const y0 = pr.base(1) + 0.06, y1 = lerp(pr.base(1), pr.centre(1), 0.62), w = pr.width(1) * 1.7;
        const panel = new THREE.Mesh(new THREE.BoxGeometry(0.02, y1 - y0, w), mats.grille); panel.position.set(X(1) - 0.005, (y0 + y1) / 2, 0); car.add(panel);
        for (let i = 1; i < 5; i++) { const slat = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, w * 0.96), mats.dark); slat.position.set(X(1) - 0.012, y0 + (y1 - y0) * i / 5, 0); car.add(slat); }
    }
    // exhausts
    if (q.exhaust === 'quad' || q.exhaust === 'twin') {
        const y0 = lerp(pr.base(0.99), pr.centre(0.99), q.exhaust === 'quad' ? 0.45 : 0.15);
        const pipes = q.exhaust === 'quad' ? [[0.065, 0.065], [-0.065, 0.065], [0.065, -0.065], [-0.065, -0.065]] : [[0.32, 0], [-0.32, 0]];
        if (q.exhaust === 'quad') { const surround = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 24), mats.dark); surround.rotation.z = Math.PI / 2; surround.position.set(X(1) - 0.005, y0, 0); car.add(surround); }
        for (const [dz, dy] of pipes) {
            const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 14, 1, true), mats.chrome); pipe.rotation.z = Math.PI / 2;
            pipe.position.set(X(1) - 0.02, y0 + dy, dz); car.add(pipe);
        }
    }
    if (p.lamps === 'round' || p.lamps === 'pods') {   // classic round tail lamps, two each side
        const ty = lerp(pr.base(1), pr.centre(1), p.rearGrille ? 0.78 : 0.7);
        for (const side of [1, -1]) for (const k of [0.62, 0.82]) {
            const l = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 16), mats.tail); l.rotation.z = Math.PI / 2;
            l.position.set(X(1) - 0.005, ty, side * pr.width(1) * k); car.add(l);
        }
    } else if (p.tailBig) {             // one big round lamp on each side of a tall flat tail
        const ty = lerp(pr.base(1), pr.centre(1), 0.6);
        for (const side of [1, -1]) {
            const z = side * pr.width(1) * 0.68;
            const l = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 24), mats.tail); l.rotation.z = Math.PI / 2; l.position.set(X(1) - 0.005, ty, z); car.add(l);
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.014, 8, 24), mats.dark); ring.rotation.y = Math.PI / 2; ring.position.set(X(1) - 0.01, ty, z); car.add(ring);
            const amber = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.034, 16), mats.amber); amber.rotation.z = Math.PI / 2; amber.position.set(X(1) - 0.01, ty, z); car.add(amber);
        }
    } else if (p.tailBar) {             // a slim light bar right across the back, curling round the corners
        const ty = lerp(pr.base(1), pr.centre(1), 0.82), wz = pr.width(0.99) * 1.82;
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.035, wz), mats.tail); bar.position.set(X(1) - 0.01, ty, 0); car.add(bar);
        if (pr.q.tailW > 0.5) for (const side of [1, -1]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.03), mats.tail); c.position.set(X(0.975), ty - 0.02, side * pr.width(0.97) * 0.97); c.rotation.z = 0.12; car.add(c); }
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
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
        car.add(new THREE.Mesh(g, mats.paintPlain));
    }
    // rally lights: a pod of four round driving lamps across the front of the bonnet
    if (p.rallyLights) {
        const s0 = 0.05, halfW = pr.width(s0), gap = Math.min(0.3, halfW * 0.44), r = Math.min(0.088, gap * 0.36);
        const y0 = pr.topAt(s0, 0) + r * 0.85, x0 = X(s0) + 0.02;
        const pod = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, gap * 3 + r * 2.4), mats.dark); pod.position.set(x0 - 0.04, y0 - r * 0.9, 0); car.add(pod);
        for (const z of [-1.5, -0.5, 0.5, 1.5].map(k => k * gap)) {
            const can = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.85, 0.11, 20), mats.dark); can.rotation.z = Math.PI / 2; can.position.set(x0, y0, z); car.add(can);
            const lens = new THREE.Mesh(new THREE.CircleGeometry(r * 0.86, 20), mats.head); lens.rotation.y = Math.PI / 2; lens.position.set(x0 + 0.056, y0, z); car.add(lens);
            const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.93, r * 0.12, 6, 20), mats.chrome); ring.rotation.y = Math.PI / 2; ring.position.set(x0 + 0.058, y0, z); car.add(ring);
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
    if (merge) { wheels.forEach(w => { w.userData.wheelRoot = true; mergeByMaterial(w); }); mergeByMaterial(car); }
    const dispose = () => { car.traverse(o => { if (o.geometry) o.geometry.dispose(); }); Object.values(mats).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); };
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
