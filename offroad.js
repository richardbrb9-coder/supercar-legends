// Supercar Legends: the Off-roader, a tall, square luxury 4x4. It is built differently from the supercars: they are smooth
// rounded shapes, and this is a box made of flat panels with crisp edges, so it has its own builder here.
// It is an original design in the spirit of the classic square luxury off-roaders (flat glass, round lamps, indicators
// perched on the front wings, a spare wheel on the back door), not a copy of any maker's car, and it carries no badges.
// Everything is made in code. It hands back the same kind of model as the other cars (see createCar in carmodel.js),
// so the builder, the race, replays and the cockpit view all work with it.
// This file does not load carmodel.js (carmodel.js loads this one). The parts it borrows from there, such as the wheels,
// the materials and the helmeted driver, are handed in by carmodel.js each time it asks for a car ('kit').
import * as THREE from './lib/three.module.min.js';
import { lerp } from './curves.js';

// A design is an Off-roader if it has the box cabin (so it stays one after the sliders have been moved)
export const isOffroad = d => !!d && d.cabinStyle === 'box';
// The slider ranges this body style allows: [lowest, highest]
export const OFFROAD_LIMITS = { L: [4.6, 5.0], W: [1.9, 2.1], roof: [1.85, 2.05], ride: [0.2, 0.3], wheel: [0.38, 0.43] };
// The tyres: chunky all-terrain tyres, the same width front and rear, with square shoulders
const TYRE = { tw: 0.3, rimK: 0.66, square: true };
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// =====================================================================
//  THE CAR'S MEASUREMENTS
// =====================================================================
// Distances along the car are given in metres back from the front bumper on a standard 4.82 m car ('m'), and stretch with
// the Length slider. Heights are in metres above the road on a car at the standard ride height (0.24 m), and the whole
// body rises and falls with the Ride height slider. Widths stretch with the Width slider.
const STD_L = 4.82, STD_W = 1.98, STD_RIDE = 0.24;
const FRONT = 0.14, REAR = 4.55;            // the front and rear faces of the body (the bumpers and the spare wheel stand proud of them)
const COWL0 = 1.44, COWL1 = 1.5;            // where the bonnet ends and the cabin begins
const SCREEN0 = 1.52, SCREEN1 = 1.76;       // the bottom and the top of the windscreen (it leans back only a little)
const AXLES = [0.83, 3.72];                 // front and rear axles (2.89 m apart)
const BELT = 1.3, SHOULDER = 1.19, SILL = 0.46;   // the bottom of the windows, the crease along the side, and the bottom of the body
const DOORS = [1.5, 2.62, 3.56];            // door edges: front of the front door, between the doors, back of the rear door
// The paint picture: along the picture = along the car. Around it, each side is laid out by height (V_SIDE of the picture
// per metre, the bottom of the windows at V_BELT) and the top, front and back by distance from the centre line (V_TOP per metre).
// (the thin window pillars get only a sliver of the picture, which leaves the roof and bonnet enough for stripes of a sensible width)
export const V_SIDE = 0.2, V_TOP = 0.156;
const V_BELT = 0.36, V_ROOF = 0.375;
export function offroadFrame(d) {
    const L = d.L, kx = L / STD_L, kz = d.W / STD_W, R = d.wheel, dy = (d.ride || STD_RIDE) - STD_RIDE;
    const at = m => L / 2 - m * kx;
    const B = 0.89 * kz, zBelt = 0.862 * kz, zEdge = 0.8 * kz;       // half-widths: the slab sides, the bottom of the windows, the roof's edge
    const edge = d.roof - 0.06, Ra = R + 0.075, N = 2.5;             // edge: the top of the side windows' frame; Ra, N: the size and squareness of the wheel arches
    // how high the wheel arch reaches at a distance m back from the nose (0 if not over a wheel)
    const arch = m => { let y = 0; for (const a of AXLES) { const k = Math.abs((m - a) * kx) / Ra; if (k < 1) y = Math.max(y, R - dy + Ra * Math.pow(1 - Math.pow(k, N), 1 / N)); } return y; };
    // where each side of the picture a height is (y = height on a car at the standard ride height)
    const vSide = y => y <= BELT ? V_BELT - (BELT - y) * V_SIDE : V_BELT + (y - BELT) / (edge - BELT) * (V_ROOF - V_BELT);
    const vTop = z => 0.5 - (z / kz) * V_TOP;
    return { d, L, kx, kz, R, dy, at, B, zBelt, zEdge, edge, Ra, N, arch, vSide, vTop, zin: B - 0.37, wheelZ: d.W / 2 - 0.155 };
}

// =====================================================================
//  SHAPE HELPERS
// =====================================================================
// Join rows of points into a skin. Each point is [x, y, z, u, v] (u, v = where it is on the paint picture).
// wrap: each row is a closed loop; capA / capB: close the first / last row with a flat end (with its own crisp edge);
// pick(i, k): which of two skins a patch belongs to (0 or 1), or -1 to leave it out. Returns the two skins.
// ends: the flat ends are stood across the car and may be any outline (cut up properly, instead of as a fan from the middle)
function skin(rows, { wrap = false, capA = false, capB = false, pick = null, ends = false } = {}) {
    const K = rows[0].length, pos = [], uv = [], idx = [[], []];
    for (const r of rows) for (const p of r) { pos.push(p[0], p[1], p[2]); uv.push(p[3] || 0, p[4] || 0); }
    const kn = wrap ? K : K - 1;
    for (let i = 0; i < rows.length - 1; i++) for (let k = 0; k < kn; k++) {
        const g = pick ? pick(i, k) : 0; if (g < 0) continue;
        const a = i * K + k, b = i * K + (k + 1) % K, c = a + K, e = b + K; idx[g].push(a, c, b, b, c, e);
    }
    for (const [ri, on, flip] of [[0, capA, false], [rows.length - 1, capB, true]]) if (on) {
        const r = rows[ri], base = pos.length / 3, c = [0, 0, 0, 0, 0];
        for (const p of r) { pos.push(p[0], p[1], p[2]); uv.push(p[3] || 0, p[4] || 0); for (let j = 0; j < 5; j++) c[j] += (p[j] || 0) / K; }
        pos.push(c[0], c[1], c[2]); uv.push(c[3], c[4]);
        if (ends) {     // (the first end faces forwards, the last one backwards)
            for (const [i0, i1, i2] of THREE.ShapeUtils.triangulateShape(r.map(q => new THREE.Vector2(q[2], q[1])), [])) {
                const A = r[i0], Bp = r[i1], C = r[i2], nx = (Bp[1] - A[1]) * (C[2] - A[2]) - (Bp[2] - A[2]) * (C[1] - A[1]);
                if ((nx > 0) !== flip) idx[0].push(base + i0, base + i1, base + i2); else idx[0].push(base + i0, base + i2, base + i1);
            }
        } else for (let k = 0; k < (wrap ? K : K - 1); k++) { const a = base + k, b = base + (k + 1) % K; if (flip) idx[0].push(base + K, b, a); else idx[0].push(base + K, a, b); }
    }
    return idx.map(ix => {
        if (!ix.length) return null;
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        g.setIndex(ix); g.computeVertexNormals();
        return g.toNonIndexed();          // (so points only one of the two skins uses are dropped)
    });
}
// round off the corners of a flat outline [[a, b], ...] with radius r
function rounded(pts, r, seg = 3) {
    const out = [], n = pts.length;
    for (let i = 0; i < n; i++) {
        const p = pts[i], a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
        const la = Math.hypot(a[0] - p[0], a[1] - p[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]), ra = Math.min(r, la / 2), rb = Math.min(r, lb / 2);
        const p0 = [p[0] + (a[0] - p[0]) / la * ra, p[1] + (a[1] - p[1]) / la * ra], p1 = [p[0] + (b[0] - p[0]) / lb * rb, p[1] + (b[1] - p[1]) / lb * rb];
        for (let j = 0; j <= seg; j++) { const t = j / seg, u = 1 - t; out.push([u * u * p0[0] + 2 * u * t * p[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * p[1] + t * t * p1[1]]); }
    }
    return out;
}
// A flat panel cut from an outline drawn flat, with holes in it. place(a, b) says where each drawn point goes on the
// car: [x, y, z, u, v]. flip: turn it to face the other way.
function panel(outline, holes, place, flip) {
    const sh = new THREE.Shape(outline.map(p => new THREE.Vector2(p[0], p[1])));
    for (const h of holes) sh.holes.push(new THREE.Path(h.map(p => new THREE.Vector2(p[0], p[1]))));
    const g = new THREE.ShapeGeometry(sh), p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) { const q = place(p.getX(i), p.getY(i)); p.setXYZ(i, q[0], q[1], q[2]); uv.setXY(i, q[3] || 0, q[4] || 0); }
    if (flip) { const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } }
    g.computeVertexNormals();
    return g;
}
// the rubber seal round a window: a narrow strip from the edge of the hole back to the glass (off = how far in the glass sits)
function seal(hole, place, off) {
    const rows = [hole.map(p => place(p[0], p[1])), hole.map(p => { const q = place(p[0], p[1]); return [q[0] + off[0], q[1] + off[1], q[2] + off[2]]; })];
    return skin(rows, { wrap: true })[0];
}
// turn a shape inside out (for the dark lining of the cabin, seen through the windows)
function inward(g) { const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } g.computeVertexNormals(); return g; }

// =====================================================================
//  THE BODY
// =====================================================================
// One row of points round the lower body at a distance m back from the nose: from the middle of the top, down the right
// side, underneath and back up the left. Ahead of the windscreen the top is the raised bonnet with a lower wing each
// side; behind it the top is left open (the cabin stands on it). inset: pulled in a little (the rounded ends).
function bodyRow(F, m, inset = 0) {
    const { B, dy, kz } = F, x = F.at(m), cab = Math.min(1, Math.max(0, (m - COWL0) / (COWL1 - COWL0))), t = Math.min(1, Math.max(0, (m - FRONT) / (COWL0 - FRONT)));
    const sh = SHOULDER + dy, belt = BELT + dy, sill = SILL + dy, yb = lerp(1.2, 1.262, t) + dy, zb = lerp(0.655, 0.685, t) * kz;
    const bonnet = [[0, yb + 0.014], [zb * 0.55, yb + 0.011], [zb - 0.025, yb], [zb, yb - 0.022], [zb + 0.012, sh + 0.032], [zb + 0.035, sh + 0.014]];
    const deck = [[0, belt], [0.3 * kz, belt], [0.6 * kz, belt], [0.72 * kz, belt], [0.8 * kz, belt], [F.zBelt, belt]];
    const top = bonnet.map((p, i) => [lerp(p[0], deck[i][0], cab), lerp(p[1], deck[i][1], cab)]);
    const a = F.arch(m) + dy, over = a > sill, low = Math.max(sill, a), bev = over ? 0 : 0.03;
    const pts = [...top, [B - 0.03, sh + 0.004], [B - 0.011, sh - 0.006], [B, sh - 0.024], [B, low + bev], [B - bev, low], [F.zin, low], [F.zin, sill], [0, sill]];
    const right = pts.map(([z, y], i) => {
        const onTop = i < 5 || (i <= 6 && cab < 0.5), zz = z * (1 - inset / B), yy = i <= 8 ? y - inset : y + inset;
        return [x, yy, zz, m / STD_L, onTop ? F.vTop(z) : F.vSide(y - dy)];
    });
    return [...right, ...right.slice(1, -1).reverse().map(p => [p[0], p[1], -p[2], p[3], 1 - p[4]])];
}
// where along the car the rows go: close together round the wheel arches, and every so often along the doors
function bodyStations(F, lite) {
    const n = lite ? 8 : 14, list = [FRONT + 0.03, 0.25, 1.36, COWL0, COWL1, SCREEN0, 1.8, 2.1, 2.4, 2.7, 3.0, 4.36, REAR - 0.025], half = F.Ra / F.kx;
    for (const a of AXLES) for (let i = 0; i <= n; i++) list.push(a - half * Math.cos(Math.PI * i / n) * 0.9999);
    list.sort((p, q) => p - q);
    return list.filter((m, i) => i === 0 || m - list[i - 1] > 0.004);
}
// The lower body: painted outside, dark underneath and inside the wheel arches
function bodyGeometry(F, lite) {
    const ms = bodyStations(F, lite), rows = [bodyRow(F, FRONT, 0.02), ...ms.map(m => bodyRow(F, m)), bodyRow(F, REAR, 0.02)], all = [FRONT, ...ms, REAR];
    const K = rows[0].length;
    return skin(rows, { wrap: true, capA: true, capB: true, ends: true, pick: (i, k) => (k <= 4 || k >= K - 5) && all[i] >= SCREEN0 - 0.001 ? -1 : k >= 10 && k <= 15 ? 1 : 0 });
}
// A flared wheel arch: a chunky lip standing out from the side of the body, following the arch
function flareGeometry(F, axle, side, lite) {
    const { R, Ra, N, B, dy } = F, n = lite ? 8 : 16, x0 = F.at(axle), rows = [];
    const a0 = Math.asin(Math.pow(Math.min(0.9, Math.max(0, (SILL + dy - 0.05 - R) / Ra)), N / 2));
    for (let i = 0; i <= n; i++) {
        const a = lerp(a0, Math.PI - a0, i / n), c = Math.cos(a), s = Math.sin(a), px = Math.sign(c) * Math.pow(Math.abs(c), 2 / N), py = Math.pow(Math.abs(s), 2 / N);
        let nx = Math.sign(c) * Math.pow(Math.abs(px), N - 1), ny = Math.pow(py, N - 1); const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
        rows.push([[0.085, -0.004], [0.072, 0.07], [0.04, 0.098], [-0.004, 0.096], [-0.01, -0.012]].map(([off, z]) => [x0 - (px * Ra + nx * off), R + py * Ra + ny * off, side * (B + z)]));   // (x0 - ...: the row runs from the front of the arch to the back)
    }
    return skin(rows, { capA: true, capB: true })[0];
}

// =====================================================================
//  THE CABIN: flat panels with flat glass, thin pillars and a nearly flat roof
// =====================================================================
// the window openings in one side, drawn as [distance back from the nose, height]
function sideWindows(F) {
    const belt = BELT + F.dy, g0 = belt + 0.05, g1 = F.edge + F.dy - 0.055, lean = y => SCREEN0 + (SCREEN1 - SCREEN0) * (y - belt) / (F.edge + F.dy - belt);
    return [[[lean(g0) + 0.11, g0], [2.555, g0], [2.555, g1], [lean(g1) + 0.11, g1]], [[2.675, g0], [3.495, g0], [3.495, g1], [2.675, g1]], [[3.605, g0], [4.44, g0], [4.44, g1], [3.605, g1]]].map(w => rounded(w, 0.035));
}
// Build the cabin's panels. Returns { frame: [painted panels], glass: [panes], seals: [window rubbers] }
function cabinGeometry(F, lite) {
    const { at, dy, kz, zBelt, zEdge } = F, belt = BELT + dy, edge = F.edge + dy, frame = [], glass = [], seals = [], deep = 0.014;
    // the two sides
    for (const side of [1, -1]) {
        const place = (a, b) => { const t = (b - belt) / (edge - belt), v = F.vSide(b - dy); return [at(a), b, side * lerp(zBelt, zEdge, t), a / STD_L, side > 0 ? v : 1 - v]; };
        const holes = sideWindows(F), back = (a, b) => { const q = place(a, b); q[2] -= side * deep; return q; };
        frame.push(panel([[SCREEN0, belt], [SCREEN1, edge], [REAR, edge], [REAR, belt]], holes, place, side > 0));
        for (const h of holes) { glass.push(panel(h, [], back, side > 0)); if (!lite) seals.push(seal(h, place, [0, 0, -side * deep])); }
    }
    // the windscreen: one flat pane in a painted frame, leaning back only a little
    {
        const xB = at(SCREEN0), xT = at(SCREEN1), S = Math.hypot(xB - xT, edge - belt);
        const place = (z, w) => { const t = w / S; return [lerp(xB, xT, t), lerp(belt, edge, t), z, lerp(SCREEN0, SCREEN1, t) / STD_L, F.vTop(z)]; };
        const w0 = 0.055, w1 = S - 0.06, h0 = lerp(zBelt, zEdge, w0 / S) - 0.065, h1 = lerp(zBelt, zEdge, w1 / S) - 0.065, hole = rounded([[-h0, w0], [h0, w0], [h1, w1], [-h1, w1]], 0.04);
        const nx = (edge - belt) / S, ny = (xB - xT) / S, off = [-nx * deep, -ny * deep, 0], back = (z, w) => { const q = place(z, w); q[0] += off[0]; q[1] += off[1]; return q; };
        frame.push(panel([[-zBelt, 0], [zBelt, 0], [zEdge, S], [-zEdge, S]], [hole], place, true));
        glass.push(panel(hole, [], back, true)); if (!lite) seals.push(seal(hole, place, off));
    }
    // the top half of the back door, with its window
    {
        const place = (z, y) => [at(REAR), y, z, 0.997, F.vTop(z)], back = (z, y) => [at(REAR) + deep, y, z, 0.997, F.vTop(z)];
        const hole = rounded([[-0.5 * kz, belt + 0.075], [0.5 * kz, belt + 0.075], [0.5 * kz, edge - 0.07], [-0.5 * kz, edge - 0.07]], 0.035);
        frame.push(panel([[-zBelt, belt], [zBelt, belt], [zEdge, edge], [-zEdge, edge]], [hole], place, false));
        glass.push(panel(hole, [], back, false)); if (!lite) seals.push(seal(hole, place, [deep, 0, 0]));
    }
    // the roof: nearly flat, with a tight curve down to each side, a small lip over the windscreen and a square back edge
    const prof = [[zEdge, 0], [zEdge - 0.003, 0.022], [zEdge - 0.02, 0.04], [zEdge - 0.06, 0.05], [zEdge * 0.55, 0.056], [0, 0.06]];
    const ring = [...prof.map(([z, h]) => [-z, h]), ...prof.slice(0, -1).reverse().map(([z, h]) => [z, h])];   // (from the left edge over the top to the right edge)
    const row = (m, k) => ring.map(([z, h]) => [at(m), edge + h * k - (1 - k) * 0.012, z * (k < 1 ? 0.994 : 1), m / STD_L, F.vTop(z)]);
    const ms = lite ? [SCREEN1 + 0.02, REAR - 0.02] : [SCREEN1 + 0.02, 2.4, 3.1, 3.8, REAR - 0.02];
    frame.push(skin([row(SCREEN1 - 0.03, 0.72), ...ms.map(m => row(m, 1)), row(REAR + 0.004, 0.8)], { capA: true, capB: true })[0]);
    return { frame, glass, seals };
}

// =====================================================================
//  THE WHOLE CAR
// =====================================================================
// Build an Off-roader. Same options and the same kind of result as createCar (which calls this for Off-roader designs).
// kit: the shared car parts from carmodel.js (makeWheel, buildMaterials, mergeByMaterial, interiorKit, helmetedDriver, bucketSeat, bar, rod, disposer)
export function createOffroadCar(design, { merge = false, lite = false, draft = false } = {}, kit) {
    const { makeWheel, buildMaterials, mergeByMaterial, interiorKit, helmetedDriver, bucketSeat, bar, rod, disposer } = kit;
    const p = design, F = offroadFrame(p), mats = buildMaterials(p, lite || draft), wheels = [], car = new THREE.Group(), fine = !lite;
    const { at, kz, dy, B, R } = F, belt = BELT + dy, sh = SHOULDER + dy, sill = SILL + dy, edge = F.edge + dy, top = p.roof + dy;
    const add = (g, mat) => { const m = new THREE.Mesh(g, mat); car.add(m); return m; };
    // a plain block: lx long, ly high, lz wide, centred at (x, y, z)
    const block = (lx, ly, lz, x, y, z, mat) => { const m = add(new THREE.BoxGeometry(lx, ly, lz), mat); m.position.set(x, y, z); return m; };
    const tag = (name, ...list) => { for (const m of list) if (m) m.userData.loose = name; };     // (parts a bump in a race can knock off: see damage.js)
    // the cabin is its own copy of the paint, so the driver's-seat view can hide it; its lining and glass are marked the same way
    mats.cabin = mats.paint.clone(); mats.cabin.side = fine ? THREE.FrontSide : THREE.DoubleSide; mats.cabin.userData.cabinPart = true;
    mats.steel = new THREE.MeshStandardMaterial({ color: 0xb9bec6, metalness: 0.95, roughness: 0.3 });    // brushed stainless steel
    mats.tyre.map = treadTexture();
    if (fine) {
        mats.liner = new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.9, side: THREE.BackSide }); mats.liner.userData.cabinPart = true;
        mats.glass = new THREE.MeshPhysicalMaterial({ color: 0x06080b, metalness: 0, roughness: 0.05, clearcoat: 0.6, envMapIntensity: 0.4, transparent: true, opacity: 0.78, depthWrite: false, side: THREE.DoubleSide });   // tinted glass you can see through
    }
    mats.glass.userData.cabinPart = true;

    // ---- the lower body, the wheel-arch flares and the cabin ----
    const [skinGeo, underGeo] = bodyGeometry(F, lite);
    add(skinGeo, mats.paint); add(underGeo, mats.intake);
    for (const axle of AXLES) for (const side of [1, -1]) add(flareGeometry(F, axle, side, lite), mats.paintPlain);
    const cab = cabinGeometry(F, lite);
    for (const g of cab.frame) { add(g, mats.cabin); if (fine) add(g, mats.liner); }
    for (const g of cab.glass) add(g, mats.glass);
    for (const g of cab.seals) add(g, mats.dark).material.side = THREE.DoubleSide;
    // the rain gutter along each edge of the roof
    for (const side of [1, -1]) block(at(SCREEN1 + 0.04) - at(REAR - 0.01), 0.02, 0.022, (at(SCREEN1 + 0.04) + at(REAR - 0.01)) / 2, edge + 0.004, side * (F.zEdge + 0.006), mats.paintPlain);

    // ---- the front: an upright slatted grille between two round lamps, and indicators perched on the wings ----
    const xf = at(FRONT), gw = 0.43 * kz, gy0 = 0.775 + dy, gy1 = 1.15 + dy;
    block(0.012, gy1 - gy0, gw * 2, xf + 0.005, (gy0 + gy1) / 2, 0, mats.intake);
    for (const y of [gy0, gy1]) block(0.045, 0.022, gw * 2 + 0.022, xf + 0.018, y, 0, mats.chrome);
    for (const z of [-gw, gw]) block(0.045, gy1 - gy0, 0.022, xf + 0.018, (gy0 + gy1) / 2, z, mats.chrome);
    for (let i = 0; i < 3; i++) {
        const y = lerp(gy0, gy1, (i + 1) / 4), slat = block(0.05, 0.05, gw * 2 - 0.02, xf + 0.022, y, 0, mats.grille); slat.rotation.z = 0.3;
        if (fine) block(0.006, 0.012, gw * 2 - 0.02, xf + 0.05, y + 0.012, 0, mats.chrome);
    }
    const lr = 0.115, ly = 0.965 + dy;
    for (const side of [1, -1]) {
        const z = side * 0.665 * kz, disc = (r, mat, dx, seg = 24) => { const m = add(new THREE.CircleGeometry(r, lite ? 12 : seg), mat); m.rotation.y = Math.PI / 2; m.position.set(xf + dx, ly, z); return m; };
        const ring = (r, tube, mat, dx) => { const m = add(new THREE.TorusGeometry(r, tube, 6, lite ? 14 : 28), mat); m.rotation.y = Math.PI / 2; m.position.set(xf + dx, ly, z); return m; };
        ring(lr, 0.013, mats.chrome, 0.012);
        if (lite) { disc(lr * 0.96, mats.head, 0.006); continue; }
        disc(lr * 0.98, mats.carbon, 0.004);
        ring(lr * 0.76, 0.01, mats.head, 0.012);                                                  // a ring of light round the lamp
        const eye = add(new THREE.SphereGeometry(lr * 0.4, 14, 10), mats.head); eye.scale.x = 0.5; eye.position.set(xf + 0.008, ly, z);
        const cover = add(new THREE.SphereGeometry(lr * 0.97, 18, 6, 0, Math.PI * 2, 0, Math.PI / 2), mats.lens); cover.rotation.z = -Math.PI / 2; cover.scale.y = 0.22; cover.position.set(xf + 0.012, ly, z);
        // the indicator: an amber lens on a dark base, sitting on top of the wing
        const ix = at(0.37), iy = sh + 0.012, iz = side * 0.775 * kz;
        tag(side > 0 ? 'podR' : 'podL', block(0.18, 0.02, 0.085, ix, iy + 0.008, iz, mats.dark), block(0.15, 0.036, 0.068, ix, iy + 0.034, iz, mats.amber));
    }
    if (lite) for (const side of [1, -1]) tag(side > 0 ? 'podR' : 'podL', block(0.16, 0.05, 0.075, at(0.37), sh + 0.035, side * 0.775 * kz, mats.amber));

    // ---- chunky bumpers ----
    const bumper = (pts, y0, y1, mat) => {
        const s = new THREE.Shape(); pts.forEach(([m, z], i) => i ? s.lineTo(at(m), z * kz) : s.moveTo(at(m), z * kz));
        const bev = 0.014, g = new THREE.ExtrudeGeometry(s, { depth: y1 - y0 - bev * 2, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: lite ? 1 : 2, curveSegments: 1 });
        g.rotateX(Math.PI / 2); g.translate(0, y1 - bev, 0); return add(g, mat);
    };
    const mirrorZ = pts => [...pts, ...pts.slice().reverse().map(([m, z]) => [m, -z])];
    bumper(mirrorZ([[0.185, 0], [0.185, 0.86], [0.32, 0.86], [0.32, 0.95], [0.13, 0.925], [0.045, 0.8], [0.015, 0.62], [0.015, 0]]), 0.5 + dy, 0.715 + dy, mats.paintPlain);
    bumper(mirrorZ([[0.185, 0], [0.185, 0.84], [0.3, 0.84], [0.3, 0.93], [0.14, 0.9], [0.06, 0.78], [0.035, 0.6], [0.035, 0]]), 0.43 + dy, 0.5 + dy, mats.dark);
    const xb = at(0.015) + 0.012;
    block(0.02, 0.105, 0.56 * kz, xb - 0.006, 0.6 + dy, 0, mats.intake);                           // the air intakes in the bumper: one in the middle...
    for (const side of [1, -1]) { const s = block(0.02, 0.105, 0.2 * kz, xb - 0.012, 0.6 + dy, side * 0.47 * kz, mats.intake); s.rotation.y = -side * 0.12; }   // ...and one each side
    block(0.07, 0.07, 0.7 * kz, at(0.05), 0.455 + dy, 0, mats.steel).rotation.z = -0.5;             // a steel guard plate under the nose
    const xr = at(REAR);
    bumper(mirrorZ([[REAR - 0.03, 0], [REAR - 0.03, 0.86], [REAR - 0.2, 0.86], [REAR - 0.2, 0.95], [REAR + 0.03, 0.925], [REAR + 0.09, 0.8], [REAR + 0.105, 0.6], [REAR + 0.105, 0]]), 0.5 + dy, 0.7 + dy, mats.paintPlain);
    bumper(mirrorZ([[REAR - 0.03, 0], [REAR - 0.03, 0.84], [REAR - 0.18, 0.84], [REAR - 0.18, 0.93], [REAR + 0.02, 0.9], [REAR + 0.07, 0.78], [REAR + 0.085, 0.6], [REAR + 0.085, 0]]), 0.43 + dy, 0.5 + dy, mats.dark);

    // ---- along each side: the rubbing strip, the side step, the exhausts, door handles, hinges and a big mirror ----
    const stepA = AXLES[0] + (F.Ra + 0.1) / F.kx, stepB = AXLES[1] - (F.Ra + 0.1) / F.kx, span = (a, b) => [at(a) - at(b), (at(a) + at(b)) / 2];
    for (const side of [1, -1]) {
        for (const [a, b] of [[stepA, stepB], [AXLES[1] + (F.Ra + 0.1) / F.kx, REAR - 0.03]]) {
            const [len, mid] = span(a, b); block(len, 0.06, 0.024, mid, 0.79 + dy, side * (B + 0.01), mats.dark);
            if (fine) block(len - 0.02, 0.014, 0.008, mid, 0.79 + dy, side * (B + 0.024), mats.steel);
        }
        if (p.skirts) {     // the side step: a running board between the wheels, with a steel edge
            const [len, mid] = span(stepA - 0.03, stepB + 0.03); block(len, 0.04, 0.16, mid, 0.385 + dy, side * (B + 0.03), mats.dark);
            block(len - 0.04, 0.028, 0.02, mid, 0.385 + dy, side * (B + 0.112), mats.steel);
            for (const m of [stepA + 0.25, stepB - 0.25]) block(0.05, 0.09, 0.1, at(m), 0.43 + dy, side * (B - 0.04), mats.dark);
        }
        if (p.engine !== 'ev') for (const m of [stepB - 0.2, stepB - 0.08]) {     // two exhaust pipes poking out sideways, just ahead of the rear wheel
            const tip = add(new THREE.CylinderGeometry(0.036, 0.036, 0.16, lite ? 8 : 14, 1, true), mats.steel); tip.material.side = THREE.DoubleSide; tip.rotation.x = Math.PI / 2; tip.rotation.z = side * 0.25; tip.position.set(at(m), 0.325 + dy, side * (B + 0.02));
            if (fine) { const hole = add(new THREE.CircleGeometry(0.033, 12), mats.intake); hole.rotation.y = side > 0 ? 0 : Math.PI; hole.rotation.order = 'YXZ'; hole.position.set(at(m) - 0.012, 0.325 + dy, side * (B + 0.085)); }
        }
        if (fine) {
            for (const m of [DOORS[1] - 0.2, DOORS[2] - 0.2]) {      // door handles: a chunky grip with a push button
                block(0.15, 0.04, 0.03, at(m), 1.1 + dy, side * (B + 0.012), mats.dark);
                const btn = add(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 10), mats.chrome); btn.rotation.x = Math.PI / 2; btn.position.set(at(m - 0.1), 1.1 + dy, side * (B + 0.004));
            }
            for (const m of [DOORS[0] + 0.04, DOORS[1] + 0.04]) for (const y of [0.7, 1.06]) {      // the door hinges, out in the open
                block(0.07, 0.085, 0.02, at(m), y + dy, side * (B + 0.008), mats.grille);
                const pin = add(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 8), mats.grille); pin.position.set(at(m - 0.035), y + dy, side * (B + 0.016));
            }
        }
        // the door mirror: a big upright housing on a short arm
        const mx = at(SCREEN0 + 0.14), my = belt + 0.14, mz = side * (F.zBelt + 0.17);
        const arm = bar(V(mx, belt + 0.07, side * (F.zBelt - 0.01)), V(mx, my - 0.03, mz - side * 0.05), 0.035, mats.dark, 0.05); car.add(arm);
        const shell = block(0.08, 0.17, 0.18, mx, my, mz, mats.dark), cap = block(0.055, 0.178, 0.188, mx + 0.03, my, mz, mats.paintPlain);
        const glass = add(new THREE.PlaneGeometry(0.155, 0.145), mats.chrome); glass.rotation.y = -Math.PI / 2; glass.position.set(mx - 0.042, my, mz);
        tag(side > 0 ? 'mirrorR' : 'mirrorL', arm, shell, cap, glass);
    }
    if (fine) {   // two wipers parked at the bottom of the windscreen
        for (const z of [-0.08, 0.42]) car.add(bar(V(at(SCREEN0) - 0.012, belt + 0.035, z * kz), V(at(SCREEN0 + 0.012) - 0.014, belt + 0.06, (z - 0.42) * kz), 0.012, mats.dark, 0.02));
        block(0.06, 0.012, 1.3 * kz, at(COWL1 - 0.01), belt + 0.002, 0, mats.dark);          // the air grille below the windscreen
    }

    // ---- the back: a side-hinged door carrying the spare wheel under a cover, and small square lamps low down ----
    const sy = 1.11 + dy, sx = xr - 0.02 * F.kx - 0.125, sR = Math.min(R, 0.4), sW = 0.245;
    block(0.06, 0.22, 0.22, xr - 0.02, sy, 0, mats.dark);                                         // the bracket holding it to the door
    const tyreProf = [[0.7, -0.5], [0.94, -0.5], [1, -0.4], [1, 0.4], [0.94, 0.5], [0.7, 0.5]].map(([r, w]) => new THREE.Vector2(r * sR, w * sW));
    const spare = add(new THREE.LatheGeometry(tyreProf, lite ? 16 : 32), mats.dark); spare.rotation.z = Math.PI / 2; spare.position.set(sx, sy, 0);
    block(0.02, sR * 1.2, sR * 1.2, sx, sy, 0, mats.dark);
    // the cover: a steel band round the tread and a painted face (plain: no badge)
    const band = add(new THREE.CylinderGeometry(sR + 0.008, sR + 0.008, sW + 0.012, lite ? 16 : 36, 1, true), mats.steel); band.rotation.z = Math.PI / 2; band.position.set(sx, sy, 0);
    const faceProf = [[0, 0.03], [0.5, 0.027], [0.8, 0.018], [0.93, 0.004], [1, -0.02]].map(([r, h]) => new THREE.Vector2(r * (sR + 0.008), h));
    const face = add(new THREE.LatheGeometry(faceProf, lite ? 16 : 36), mats.paintPlain); face.rotation.z = Math.PI / 2; face.position.set(sx - sW / 2 - 0.006, sy, 0);
    const hoop = fine ? add(new THREE.TorusGeometry(sR * 0.55, 0.006, 5, 32), mats.steel) : null; if (hoop) { hoop.rotation.y = Math.PI / 2; hoop.position.set(sx - sW / 2 - 0.03, sy, 0); }
    tag('spare', band, face, hoop);
    for (const side of [1, -1]) {     // tail lamps: red with an amber end, in a dark surround
        block(0.03, 0.115, 0.27 * kz, xr - 0.008, 0.865 + dy, side * 0.7 * kz, mats.dark);
        block(0.03, 0.085, 0.16 * kz, xr - 0.014, 0.865 + dy, side * 0.665 * kz, mats.tail);
        block(0.03, 0.085, 0.07 * kz, xr - 0.014, 0.865 + dy, side * 0.79 * kz, mats.amber);
    }
    block(0.03, 0.022, 0.32 * kz, xr - 0.012, edge + 0.018, 0, mats.tail);                          // the high brake light under the roof's back edge
    if (fine) {
        for (const z of [-0.76, 0.76]) block(0.006, belt - 0.74 - dy, 0.008, xr - 0.003, (belt + 0.74 + dy) / 2, z * kz, mats.intake);   // the edges of the back door
        block(0.006, 0.008, 1.52 * kz, xr - 0.003, 0.74 + dy, 0, mats.intake);
        for (const y of [0.82, 1.2]) block(0.03, 0.09, 0.07, xr - 0.012, y + dy, -0.72 * kz, mats.grille);                             // its hinges on one side...
        block(0.035, 0.045, 0.15, xr - 0.014, 1.12 + dy, 0.62 * kz, mats.dark);                                                         // ...and its handle on the other
    }

    // ---- underneath: the chassis rails and the two solid axles (dark, so they sit back in the shadows) ----
    for (const side of [1, -1]) block(at(0.3) - at(REAR - 0.1), 0.1, 0.09, (at(0.3) + at(REAR - 0.1)) / 2, sill - 0.05, side * 0.4 * kz, mats.dark);
    for (const [i, axle] of AXLES.entries()) {
        const tube = add(new THREE.CylinderGeometry(0.05, 0.05, F.wheelZ * 2 - 0.3, 8), mats.dark); tube.rotation.x = Math.PI / 2; tube.position.set(at(axle), R, 0);
        const diff = add(new THREE.SphereGeometry(0.14, 10, 8), mats.dark); diff.position.set(at(axle), R, (i ? 0.1 : 0.2) * kz); diff.scale.set(1, 1, 0.8);
    }

    // ---- extras: roof lights, a bull bar, and a spoiler on the back of the roof ----
    if (p.rallyLights) {
        const lx = at(SCREEN1 + 0.1), r = 0.08, y0 = top + r + 0.03;
        block(0.05, 0.03, 1.36 * kz, lx - 0.05, top + 0.022, 0, mats.dark);
        for (const z of [-0.5, 0.5]) block(0.04, 0.05, 0.04, lx - 0.05, top + 0.005, z * kz, mats.dark);
        for (const z of [-0.54, -0.18, 0.18, 0.54].map(k => k * kz)) {
            const can = add(new THREE.CylinderGeometry(r, r * 0.85, 0.11, lite ? 10 : 20), mats.dark); can.rotation.z = Math.PI / 2; can.position.set(lx, y0, z);
            const lens = add(new THREE.CircleGeometry(r * 0.86, lite ? 10 : 20), mats.head); lens.rotation.y = Math.PI / 2; lens.position.set(lx + 0.056, y0, z);
            if (fine) { const ring = add(new THREE.TorusGeometry(r * 0.93, r * 0.12, 6, 20), mats.chrome); ring.rotation.y = Math.PI / 2; ring.position.set(lx + 0.058, y0, z); }
        }
    }
    if (p.splitter) {     // a steel bull bar: a hoop standing up in front of the grille
        const x0 = at(0.0) + 0.02, x1 = x0 - 0.05, y0 = 0.66 + dy, y1 = gy1 - 0.04, zw = 0.5 * kz, r = 0.028, seg = lite ? 6 : 10;
        for (const side of [1, -1]) { car.add(rod(V(x0, y0, side * zw), V(x1, y1, side * zw), r, mats.steel, seg)); const k = add(new THREE.SphereGeometry(r, 8, 6), mats.steel); k.position.set(x1, y1, side * zw); }
        car.add(rod(V(x1, y1, -zw), V(x1, y1, zw), r, mats.steel, seg)); car.add(rod(V(lerp(x0, x1, 0.45), lerp(y0, y1, 0.45), -zw), V(lerp(x0, x1, 0.45), lerp(y0, y1, 0.45), zw), r * 0.8, mats.steel, seg));
    }
    if (p.wing === 'ducktail') { const lip = block(0.22, 0.028, F.zEdge * 2 - 0.1, at(REAR - 0.09), top + 0.012, 0, mats.paintPlain); lip.rotation.z = -0.16; }
    if (p.wing === 'gt' || p.wing === 'swan') {     // a racing wing would look silly up here: these fit a neat spoiler blade above the back of the roof
        const h = p.wing === 'swan' ? 0.15 : 0.1, wx = at(REAR - 0.1), w = F.zEdge * 2 - 0.08;
        const blade = block(0.27, 0.022, w, wx, top + h, 0, mats.carbon); blade.rotation.z = -0.2;
        for (const side of [1, -1]) {
            const st = block(0.1, h + 0.02, 0.02, wx + 0.03, top + h / 2 - 0.01, side * w * 0.3, mats.carbon); if (p.wing === 'swan') st.rotation.z = 0.3;
            tag(side > 0 ? 'plateR' : 'plateL', block(0.3, 0.09, 0.012, wx, top + h - 0.01, side * w / 2, mats.carbon));
        }
    }

    // ---- inside (only on the car seen close up): a dark lining, saddle-brown seats, the dashboard and the helmeted driver ----
    if (fine) {
        const { col, part } = interiorKit(car, p, mats, false);
        const x0 = at(COWL1 + 0.04), x1 = at(REAR - 0.03), fy = 0.95 + dy, tub = inward(new THREE.BoxGeometry(x0 - x1, belt + 0.01 - fy, (F.zBelt - 0.02) * 2));
        part(tub, 4).position.set((x0 + x1) / 2, (belt + 0.01 + fy) / 2, 0);
        part(new THREE.BoxGeometry(0.34, 0.1, (F.zBelt - 0.04) * 2), 0).position.set(at(SCREEN0 + 0.22), belt - 0.02, 0);          // the dashboard
        const hy = 1.5 + dy, zs = 0.4 * kz, xs = at(2.42), xr2 = at(3.32);
        bucketSeat(part, xs, hy, -zs, 0.46, [14, 15, 10]); bucketSeat(part, xs, hy, zs, 0.46, [14, 15, 10], true);
        for (const z of [-zs, zs]) bucketSeat(part, xr2, hy - 0.02, z, 0.5, [14, 15, 10], true);
        helmetedDriver(part, xs, hy, -zs);
        const wg = new THREE.Group(); wg.position.set(at(2.06), belt + 0.06, -zs); wg.rotation.set(0, Math.PI / 2, 0); wg.rotateX(-0.35); car.add(wg);
        wg.add(new THREE.Mesh(col(new THREE.TorusGeometry(0.17, 0.016, 6, 20), 6), mats.interior)); wg.add(new THREE.Mesh(col(new THREE.BoxGeometry(0.3, 0.04, 0.012), 6), mats.interior));
        for (const dz of [-1, 1]) { const arm = bar(V(xs + 0.04, hy - 0.2, -zs + dz * 0.2), V(at(2.08), belt + 0.08, -zs + dz * 0.14), 0.075, mats.interior); col(arm.geometry, 4); car.add(arm); }
    }

    // ---- wheels: tall all-terrain tyres on big rims ----
    for (const [i, axle] of AXLES.entries()) for (const side of [1, -1]) {
        const front = i === 0, w = makeWheel(p, mats, front, lite, false, TYRE);
        w.position.set(at(axle), R, side * F.wheelZ);
        if (side < 0) { w.rotation.y = Math.PI; const cal = w.userData.cal; cal.position.x *= -1; cal.rotation.z *= -1; }
        Object.assign(w.userData, { front, side });
        car.add(w); wheels.push(w);
    }
    if (merge) { wheels.forEach(w => { const sp = w.userData.spin; sp.userData.wheelRoot = true; mergeByMaterial(sp); w.userData.wheelRoot = true; mergeByMaterial(w); }); mergeByMaterial(car); }
    return { group: car, mats, wheels, lean: 1.35, dispose: disposer(car, mats), draft: draft && fine };   // (lean: tall and softly sprung, it rolls and dips more than a supercar: looks only)
}
// The all-terrain tyre's picture: big chunky tread blocks with deep grooves between them, and lugs wrapping onto the
// sidewalls (no maker's name anywhere). Across the picture = around the tyre; down = sidewall, tread, sidewall.
let TREAD = null;
function treadTexture() {
    if (TREAD) return TREAD;
    const c = document.createElement('canvas'); c.width = 512; c.height = 128; const x = c.getContext('2d');
    x.fillStyle = '#1f2023'; x.fillRect(0, 0, 512, 128);
    x.fillStyle = '#08080a'; x.fillRect(0, 26, 512, 76);                                 // the grooves
    x.fillStyle = '#26272b';
    for (let i = 0; i < 32; i++) {
        const u = i * 16;
        x.fillRect(u + 1, 18, 11, 22); x.fillRect(u + 9, 88, 11, 22);                    // shoulder lugs, wrapping onto each sidewall
        x.fillRect(u + (i % 2 ? 2 : 8), 44, 10, 17); x.fillRect(u + (i % 2 ? 8 : 2), 66, 10, 17);   // staggered blocks down the middle
    }
    x.fillStyle = '#2f3136'; x.fillRect(0, 7, 512, 2); x.fillRect(0, 119, 512, 2);       // a raised ring on each sidewall
    TREAD = new THREE.CanvasTexture(c); TREAD.colorSpace = THREE.SRGBColorSpace; TREAD.wrapS = THREE.RepeatWrapping; TREAD.anisotropy = 4;
    return TREAD;
}
export const isOffroadTexture = t => t === TREAD;      // (shared by every Off-roader, so it is kept when one car is thrown away)

// =====================================================================
//  PAINT (called by liveryTexture in carmodel.js; x = the picture being painted, W x H pixels, Y(v) = how far down it v is)
// =====================================================================
// fine lines where the doors meet the body, and the fuel filler flap (the charging flap on an electric one)
export function offroadPanelLines(x, d, W, H, Y) {
    const F = offroadFrame(d), U = m => (m / STD_L) * W, px = W / d.L;
    for (const right of [true, false]) {
        const P = y => Y(right ? F.vSide(y) : 1 - F.vSide(y));
        const line = pts => { for (const [colour, off, wd] of [['rgba(255,255,255,0.16)', 0.9, 0.005], ['rgba(0,0,0,0.72)', 0, 0.008]]) {
            x.strokeStyle = colour; x.lineWidth = wd * px; x.lineJoin = 'round'; x.lineCap = 'round'; x.beginPath(); pts.forEach(([m, y], i) => i ? x.lineTo(U(m) + off, P(y) + off) : x.moveTo(U(m) + off, P(y) + off)); x.stroke(); } };
        const archTop = F.arch(DOORS[2]) + 0.1;
        line([[DOORS[0], SILL + 0.04], [DOORS[0], BELT]]);
        line([[DOORS[1], SILL + 0.04], [DOORS[1], F.edge]]);
        line([[DOORS[2], Math.max(SILL + 0.04, archTop)], [DOORS[2], F.edge]]);
        line([[DOORS[0], SILL + 0.04], [AXLES[1] - (F.Ra + 0.09) / F.kx, SILL + 0.04]]);
        if (right) { const m = 4.37, y = 1.04, r = 0.055; x.save(); x.translate(U(m), P(y)); x.scale(1, V_SIDE * H / px);   // the flap, on the right rear wing
            for (const [colour, off] of [['rgba(255,255,255,0.16)', 0.9], ['rgba(0,0,0,0.72)', 0]]) { x.strokeStyle = colour; x.lineWidth = 0.008 * px; x.beginPath(); x.roundRect(-r * px + off, -r * px + off, r * 2 * px, r * 2 * px, r * 0.35 * px); x.stroke(); }
            x.restore(); }
    }
}

// =====================================================================
//  STATS: tall, heavy and square to the wind. Its four-wheel drive gets it off the line well, but it leans in the
//  corners, needs longer to stop, and its shape holds it back on a long straight
// =====================================================================
export function offroadStats(design, e) {
    const kg = Math.round(1500 + 90 * design.L * design.W + e.kg + (design.splitter ? 25 : 0) + (design.rallyLights ? 8 : 0));
    const cd = 0.54, area = design.W * design.roof * 0.8;
    const v = Math.cbrt((2 * e.bhp * 745.7 * 0.82) / (1.225 * cd * area));
    const mph = Math.round(Math.min(180, v / 0.44704));
    const z62 = Math.max(3, 0.6 + 1.05 * (kg / e.bhp) - 0.4);                 // (four-wheel drive, whatever the engine)
    const spoiler = { none: 0, ducktail: 1, gt: 2, swan: 3 }[design.wing] || 0;
    const handling = Math.round(Math.min(100, 32 + spoiler + (design.W - 1.98) * 40 - (kg - 2570) / 40 + (0.24 - design.ride) * 100 - (design.roof - 1.97) * 30));
    const braking = Math.round(Math.min(100, 38 - (kg - 2570) / 30 + (design.wheel - 0.405) * 200));
    return { bhp: e.bhp, mph, z62: Math.round(z62 * 10) / 10, kg, handling: Math.max(10, handling), braking: Math.max(10, braking), engine: e };
}
