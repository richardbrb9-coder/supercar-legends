// Supercar Legends: the Formula racer, a modern open-wheel single-seater. It is built differently from the other cars:
// a narrow tub in the middle with the wheels out in the open on wishbones, wings front and rear, and an open cockpit
// under a 'halo' hoop. It is an original design in the spirit of 2020s Grand Prix cars, not a copy of any team's car.
// Everything is made in code. It hands back the same kind of model as the other cars (see createCar in carmodel.js),
// so the builder, the race, replays and the cockpit view all work with it.
// This file does not load carmodel.js (carmodel.js loads this one). The parts it borrows from there, such as the wheels,
// the materials and the helmeted driver, are handed in by carmodel.js each time it asks for a car ('kit'), so the two files
// can never trip over each other while they are loading, online or offline.
import * as THREE from './lib/three.module.min.js';
import { curve, lerp } from './curves.js';

// A design is a Formula racer if it has the open cockpit (so it stays one after the sliders have been moved)
export const isFormula = d => !!d && d.cabinStyle === 'open';
// The tyres: wide slicks on 18-inch rims, the fronts a little narrower than the rears, each held on by one big centre nut
export const FORMULA_TYRES = { front: { tw: 0.31, rimK: 0.66, square: true, nut: true }, rear: { tw: 0.39, rimK: 0.66, square: true, nut: true } };
const spow = (v, p) => Math.sign(v) * Math.pow(Math.abs(v), p);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// =====================================================================
//  THE CAR'S MEASUREMENTS
// =====================================================================
// Distances along the car are given in metres back from the tip of the nose on a standard 5.5 m car ('m'), and stretch with
// the Length slider. Heights are in metres above the road. Widths out at the wheels and wings stretch with the Width slider.
export function formulaFrame(d) {
    const L = d.L, kz = d.W / 2, R = d.wheel, dy = (d.ride || 0.06) - 0.06, n = d.nose || 0.3;
    const at = m => L / 2 - (m / 5.5) * L;                 // where along the car (x) a distance back from the nose is
    const fl = 0.065 + dy;                                 // the top of the flat floor
    // the middle body from nose to tail: its top, its underside and its half-width
    const top = curve([[0.07, n - 0.03 + dy], [0.2, n + 0.012 + dy], [0.55, 0.42 + (n - 0.3) * 0.6 + dy], [1.1, 0.58 + dy], [1.65, 0.625 + dy], [2.0, 0.64 + dy], [2.6, 0.665 + dy], [2.9, 0.66 + dy], [3.3, 0.62 + dy], [3.95, 0.52 + dy], [4.5, 0.43 + dy], [4.95, 0.37 + dy], [5.25, 0.34 + dy]]);
    const under = curve([[0.07, n - 0.1 + dy], [0.2, n - 0.105 + dy], [0.55, 0.22 + (n - 0.3) * 0.5 + dy], [1.1, 0.27 + dy], [1.5, 0.2 + dy], [1.72, 0.09 + dy], [1.98, fl], [4.4, fl], [4.62, 0.12 + dy], [4.95, 0.22 + dy], [5.25, 0.27 + dy]]);
    const half = curve([[0.07, 0.06], [0.2, 0.085], [0.55, 0.13], [1.1, 0.19], [1.65, 0.27], [2.0, 0.31], [2.6, 0.33], [3.0, 0.33], [3.6, 0.3], [4.1, 0.2], [4.5, 0.13], [4.95, 0.07], [5.25, 0.05]]);
    // the cockpit opening: a rounded slot in the top of the tub
    const C0 = 2.02, C1 = 2.73;
    const open = m => m <= C0 || m >= C1 ? 0 : 0.235 * Math.pow(Math.sin(Math.PI * (m - C0) / (C1 - C0)), 0.45);
    // the airbox over the driver's head, running back as the spine of the engine cover
    const spineTop = curve([[2.74, 0.925 + dy], [2.86, 0.955 + dy], [3.1, 0.94 + dy], [3.5, 0.85 + dy], [4.1, 0.66 + dy], [4.75, 0.44 + dy]]);
    const spineHalf = curve([[2.74, 0.1], [3.1, 0.095], [3.9, 0.06], [4.75, 0.03]]);
    const F = { d, L, kz, R, dy, at, fl, floorY: fl - 0.02, top, under, half, open, C0, C1, spineTop, spineHalf,
        frontAxle: 1.1, rearAxle: 4.7, helmet: { m: 2.5, y: 0.755 + dy }, wheelM: 2.12, wheelY: 0.595 + dy, mirror: { m: 2.02, y: 0.7 + dy, z: 0.47 } };
    return F;
}
// where a wheel sits
function wheelPlace(F, front, side) {
    const tw = (front ? FORMULA_TYRES.front : FORMULA_TYRES.rear).tw;
    return { x: F.at(front ? F.frontAxle : F.rearAxle), z: side * (F.d.W / 2 - tw / 2), tw };
}
// The suspension links at one corner. Each link runs from one or more mounts on the body (in a row along the car)
// out to a single joint at the wheel: [thickness, x at the wheel, how far along the car each body mount is, body y, body z, wheel y, wheel z]
export function cornerLinks(F, front, side) {
    const { x, z, tw } = wheelPlace(F, front, side), R = F.R, dy = F.dy, zj = z - side * (tw * 0.28 + 0.03);
    if (front) { const zb = side * 0.17; return { x, zi: zb, zo: zj, links: [
        [0.022, x, [0.1, -0.55], 0.31 + dy, zb, R - 0.15, zj],                    // lower wishbone
        [0.022, x, [0.04, -0.48], 0.54 + dy, zb, R + 0.15, zj],                   // upper wishbone
        [0.018, x, [-0.03], 0.57 + dy, side * 0.15, R - 0.13, zj - side * 0.02],  // push rod, up to the rocker on top of the tub
        [0.014, x + 0.09, [0.03], 0.53 + dy, zb, R + 0.12, zj]                    // steering arm
    ] }; }
    const zb = side * 0.09; return { x, zi: zb, zo: zj, links: [
        [0.022, x, [0.55, -0.08], 0.19 + dy, zb, R - 0.16, zj],                   // lower wishbone
        [0.022, x, [0.42, -0.04], 0.37 + dy, zb, R + 0.14, zj],                   // upper wishbone
        [0.018, x, [0.2], 0.16 + dy, side * 0.12, R + 0.12, zj],                  // pull rod, down to the gearbox
        [0.036, x, [0], R - 0.03 + dy, side * 0.08, R, zj + side * 0.02],         // drive shaft
        [0.014, x - 0.1, [-0.04], 0.2 + dy, zb, R - 0.14, zj]                     // toe link
    ] };
}

// =====================================================================
//  SHAPE HELPERS
// =====================================================================
// Join rows of points into a skin. Each point is [x, y, z, u, v] (u, v = where it is on the paint picture).
// wrap: each row is a closed loop; capA / capB: close the first / last row with a flat end
function skin(rows, wrap = false, capA = false, capB = false) {
    const K = rows[0].length, pos = [], uv = [], idx = [];
    for (const r of rows) for (const p of r) { pos.push(p[0], p[1], p[2]); uv.push(p[3] || 0, p[4] || 0); }
    const kn = wrap ? K : K - 1;
    for (let i = 0; i < rows.length - 1; i++) for (let k = 0; k < kn; k++) { const a = i * K + k, b = i * K + (k + 1) % K, c = a + K, e = b + K; idx.push(a, c, b, b, c, e); }
    for (const [ri, on] of [[0, capA], [rows.length - 1, capB]]) if (on) {
        const r = rows[ri], ci = pos.length / 3, c = [0, 0, 0, 0, 0];
        for (const p of r) for (let j = 0; j < 5; j++) c[j] += (p[j] || 0) / K;
        pos.push(c[0], c[1], c[2]); uv.push(c[3], c[4]);
        for (let k = 0; k < K; k++) idx.push(ci, ri * K + k, ri * K + (k + 1) % K);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
}
// several shapes joined into one (positions, normals and paint-picture positions)
function joinGeos(list) {
    const flat = list.map(g => g.index ? g.toNonIndexed() : g), total = flat.reduce((s, g) => s + g.attributes.position.count, 0);
    const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), uv = new Float32Array(total * 2); let o = 0;
    for (const g of flat) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    return out;
}
// a thin beam from a to b
function beamGeo(a, b, t) {
    const dir = new THREE.Vector3().subVectors(b, a), g = new THREE.BoxGeometry(t, dir.length(), t);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
}
// The paint picture is laid over the car from above, like a sheet: the middle of the picture runs along the centre line
// and it spreads out to each side (more picture is given to the middle, where the stripes and number go).
const DRAPE0 = 0.25 / 0.912 / 0.35;                         // how fast the picture spreads at the centre line (per metre)
const drape = z => 0.25 * (1 - Math.exp(-Math.abs(z) / 0.35)) / 0.912;
const UNDER = 0.36;                                          // undersides tuck in below the sides
// The sides of the engine cover, its fin and the rear wing end plates are painted from the side instead, in two strips
// along the edges of the picture (one for each side of the car): heights 0.3 m to 1.0 m fill the strip
const stripV = (y, right) => { const v = 0.006 + 0.113 * (y - 0.3) / 0.7; return right ? v : 1 - v; };

// A wing element: a thin curved blade running across the car. where(z) gives its front edge [x, y], its length front to
// back (chord), its tilt (the back edge raised) and its thickness at that point across the car.
function wingElement(zs, where) {
    const rows = zs.map(z => {
        const { x, y, chord, tilt, th = 0.016, camber = 0.03 } = where(z), c = Math.cos(tilt), s = Math.sin(tilt);
        return [[0, 0], [0.25, th * 0.5], [0.7, th * 0.4], [1, 0], [0.7, -th * 0.6 - camber * 0.5], [0.25, -th * 0.7 - camber]]
            .map(([f, h]) => [x - c * f * chord + s * h, y + s * f * chord + c * h, z]);
    });
    return skin(rows, true, true, true);
}
// a flat plate standing along the car (a fin or an end plate), from its outline [x, y] seen from the side; painted from the side if asked
function sidePlate(F, outline, z, thick, painted) {
    const sh = new THREE.Shape(); outline.forEach(([x, y], i) => i ? sh.lineTo(x, y) : sh.moveTo(x, y));
    const faces = [];
    for (const sgn of [1, -1]) {
        const g = new THREE.ShapeGeometry(sh), p = g.attributes.position, uv = g.attributes.uv;
        for (let i = 0; i < p.count; i++) { uv.setXY(i, (F.L / 2 - p.getX(i)) / F.L, painted ? stripV(p.getY(i) - F.dy, z + sgn * 0.001 >= 0) : 0); p.setZ(i, z + sgn * thick / 2); }
        faces.push(g);
    }
    return joinGeos(faces);
}

// =====================================================================
//  THE BODY
// =====================================================================
// One row of points round the middle body at a distance m back from the nose. It starts and ends at the edge of the cockpit
// opening (where there is one; elsewhere the two ends meet on top), going down the right side, underneath and up the left.
function bodyRow(F, m, n) {
    const x = F.at(m), w = F.half(m), y0 = F.under(m), y1 = Math.max(y0 + 0.02, F.top(m)), mid = (y0 + y1) / 2, hh = (y1 - y0) / 2;
    const e = lerp(0.8, 0.5, Math.min(1, m / 1.65)), o = F.open(m), u = m / 5.5;      // (the nose is rounder than the squarer tub)
    const aRim = o > 0.001 ? Math.acos(Math.pow(Math.min(0.98, o / w), 1 / e)) : Math.PI / 2, right = [];
    for (let j = 0; j < n; j++) {
        const a = aRim - (j / (n - 1)) * (aRim + Math.PI / 2), c = Math.max(0, Math.cos(a)), sn = Math.sin(a);
        const z = w * Math.pow(c, e), y = mid + hh * spow(sn, 0.6), g = a >= 0 ? drape(z) : lerp(drape(w), UNDER, -sn);
        right.push([x, y, z, u, g]);
    }
    return [...right.map(p => [p[0], p[1], p[2], u, 0.5 - p[4]]), ...right.slice().reverse().map(p => [p[0], p[1], -p[2], u, 0.5 + p[4]])];
}
// where along the car the rows of points go: evenly spaced, with extra ones at the ends of the cockpit opening so its outline is smooth
function bodyStations(F, N) {
    const a = 0.07, b = 5.25, list = [], span = F.C1 - F.C0;
    for (let i = 0; i <= N; i++) list.push(lerp(a, b, i / N));
    for (const t of [0, 0.015, 0.05, 0.11, 0.2]) list.push(F.C0 + span * t, F.C1 - span * t);
    list.sort((p, q) => p - q);
    return list.filter((m, i) => i === 0 || m - list[i - 1] > 0.012);
}
function bodyGeometry(F, lite) {
    const ms = bodyStations(F, lite ? 26 : 60), n = lite ? 8 : 15;
    return skin(ms.map(m => bodyRow(F, m, n)), false, true, true);
}
// the inside of the cockpit: dark walls dropping from the opening's edge to a floor
function pitGeometry(F, lite) {
    const ms = bodyStations(F, lite ? 26 : 60).filter(m => m > F.C0 - 0.03 && m < F.C1 + 0.03), yF = 0.24 + F.dy;
    return skin(ms.map(m => { const row = bodyRow(F, m, 3), a = row[0], o = F.open(m), x = a[0]; return [[x, a[1], a[2]], [x, yF, o * 0.92], [x, yF, 0], [x, yF, -o * 0.92], [x, a[1], -a[2]]]; }));
}
// the edge of the cockpit opening (for the padded rim), as a closed loop of points
function rimPoints(F, steps) {
    const pts = [], span = F.C1 - F.C0;
    for (const side of [1, -1]) for (let i = 0; i < steps; i++) {
        const t = (i + 0.5) / steps, m = side > 0 ? F.C0 + span * t : F.C1 - span * t, row = bodyRow(F, m, 3);
        pts.push(V(row[0][0], row[0][1] + 0.004, side * row[0][2]));
    }
    return pts;
}
// A sidepod: a pod each side of the tub with an air intake at the front, cut away underneath at the front (the undercut)
// and sloping down and inwards to the rear (the narrow 'coke-bottle' waist)
function podGeometry(F, side, lite) {
    const kz = F.kz, dy = F.dy;
    const zo = curve([[2.23, 0.76], [2.6, 0.8], [3.1, 0.8], [3.65, 0.68], [3.95, 0.5], [4.26, 0.34]]);
    const y1 = curve([[2.23, 0.6], [2.5, 0.62], [2.9, 0.6], [3.4, 0.48], [3.85, 0.32], [4.26, 0.14]]);
    const y0 = curve([[2.23, 0.33], [2.5, 0.3], [2.9, 0.24], [3.3, 0.12], [3.5, 0.055], [4.26, 0.055]]);
    const N = lite ? 9 : 22, Kp = lite ? 12 : 22, rows = [], mouth = [];
    for (let i = -1; i <= N; i++) {
        const lip = i < 0, m = lip ? 2.23 : lerp(2.26, 4.26, i / N), x = F.at(lip ? 2.225 : m), zi = Math.max(0.05, Math.min(0.26, F.half(m) - 0.06));
        const za = zi, zb = zo(m) * kz, ya = y0(m) + dy, yb = Math.max(ya + 0.03, y1(m) + dy), k = lip ? 0.84 : 1, row = [];
        for (let j = 0; j < Kp; j++) {
            const a = (j / Kp) * Math.PI * 2 - Math.PI / 2, c = Math.cos(a), sn = Math.sin(a);
            const z = (za + zb) / 2 + (zb - za) / 2 * k * spow(c, 0.5), y = (ya + yb) / 2 + (yb - ya) / 2 * k * spow(sn, 0.55);
            const g = sn >= 0 ? drape(z) : lerp(drape(z), UNDER, -sn);
            row.push([x, y, side * z, m / 5.5, side > 0 ? 0.5 - g : 0.5 + g]);
            if (lip) mouth.push([x - 0.02, (ya + yb) / 2 + (y - (ya + yb) / 2) * 0.96, side * ((za + zb) / 2 + (z - (za + zb) / 2) * 0.96)]);
        }
        rows.push(row);
    }
    return { pod: skin(rows, true, false, true), mouth: skin([mouth], true, true) };
}
// The airbox (the engine's air intake over the driver's head, in the roll hoop) and the spine of the engine cover behind it.
// It is painted from the side (see stripV), so numbers and stickers can go on it.
function spineGeometry(F, lite) {
    const N = lite ? 8 : 20, n = lite ? 4 : 7, rows = [];
    for (let i = 0; i <= N; i++) {
        const m = lerp(2.74, 4.75, i / N), x = F.at(m), yt = F.spineTop(m), yb = F.top(m) - 0.1, wt = F.spineHalf(m), right = [];
        for (let j = 0; j < n; j++) { const a = (j / (n - 1)) * Math.PI / 2, h = Math.sin(a), y = lerp(yb, yt, h); right.push([x, y, lerp(wt * 1.6, wt, h) * Math.pow(Math.cos(a), 0.6)]); }
        rows.push([...right.map(p => [p[0], p[1], p[2], m / 5.5, stripV(p[1] - F.dy, true)]), ...right.slice().reverse().map(p => [p[0], p[1], -p[2], m / 5.5, stripV(p[1] - F.dy, false)])]);
    }
    return skin(rows, false, true, false);
}

// =====================================================================
//  THE WHOLE CAR
// =====================================================================
// Build a Formula racer. Same options and the same kind of result as createCar (which calls this for Formula designs).
// kit: the shared car parts from carmodel.js (makeWheel, buildMaterials, mergeByMaterial, interiorKit, helmetedDriver, bar, rod, disposer)
export function createFormulaCar(design, { merge = false, lite = false, draft = false } = {}, kit) {
    const { makeWheel, buildMaterials, mergeByMaterial, interiorKit, helmetedDriver, bar, rod, disposer } = kit;
    const p = design, F = formulaFrame(p), mats = buildMaterials(p, lite || draft), wheels = [], car = new THREE.Group();
    const { at, kz, dy } = F, add = (g, mat) => { const m = new THREE.Mesh(g, mat); car.add(m); return m; };
    mats.carbon.side = THREE.DoubleSide;                                                       // (thin wings and plates are seen from both sides)
    mats.halo = new THREE.MeshStandardMaterial({ color: 0x8f949c, metalness: 0.9, roughness: 0.34 });   // bare titanium
    mats.tyre.map = slickTexture(p.caliper);
    const { col, part } = interiorKit(car, p, mats, false);

    // ---- the middle body, the cockpit, the sidepods and the engine cover ----
    add(bodyGeometry(F, lite), mats.paint);
    add(pitGeometry(F, lite), mats.intake);
    for (const side of [1, -1]) { const g = podGeometry(F, side, lite); add(g.pod, mats.paint); add(g.mouth, mats.intake); }
    add(spineGeometry(F, lite), mats.paint);
    // the air intake in the front of the airbox: a dark oval mouth with a painted lip
    const yIn = F.spineTop(2.74) - 0.085, xIn = at(2.74);
    const mouth = add(new THREE.CircleGeometry(1, lite ? 10 : 20), mats.intake); mouth.rotation.y = Math.PI / 2; mouth.scale.set(0.07, 0.055, 1); mouth.position.set(xIn + 0.004, yIn, 0);
    if (!lite) { const lip = add(new THREE.TorusGeometry(1, 0.13, 6, 24), mats.paintPlain); lip.rotation.y = Math.PI / 2; lip.scale.set(0.074, 0.059, 0.07); lip.position.set(xIn + 0.004, yIn, 0); }
    // the shark fin along the top of the engine cover
    const fin = [[3.25, 0.905], [3.6, 0.93], [4.45, 0.905], [4.72, 0.8], [4.76, 0.45]].map(([m, y]) => [at(m), y + dy]);
    for (let m = 4.75; m >= 3.25; m -= 0.25) fin.push([at(m), F.spineTop(m) - 0.03]);
    add(sidePlate(F, fin, 0, 0.012, true), mats.paint);

    // ---- the flat floor, its edges, and the diffuser sweeping up at the back ----
    const fs = new THREE.Shape(), fo = [[1.55, 0.2], [2.0, 0.32], [2.2, 0.8], [3.9, 0.82], [4.3, 0.6], [4.4, 0.5]];
    fs.moveTo(at(1.55), 0); fo.forEach(([m, z]) => fs.lineTo(at(m), z * kz)); fo.slice().reverse().forEach(([m, z]) => fs.lineTo(at(m), -z * kz));
    const floor = new THREE.ExtrudeGeometry(fs, { depth: 0.02, bevelEnabled: false }); floor.rotateX(Math.PI / 2); floor.translate(0, F.fl, 0);
    add(floor, mats.carbon);
    if (!lite) {
        const plank = add(new THREE.BoxGeometry(at(1.6) - at(4.4), 0.012, 0.3), mats.dark); plank.position.set((at(1.6) + at(4.4)) / 2, F.floorY - 0.006, 0);   // the wear plank under the floor
        for (const side of [1, -1]) {
            // a slim raised wing along the floor's edge, on little stays
            const ew = add(new THREE.BoxGeometry(at(3.0) - at(3.85), 0.008, 0.07), mats.carbon); ew.position.set((at(3.0) + at(3.85)) / 2, F.fl + 0.04, side * 0.84 * kz);
            for (const m of [3.08, 3.42, 3.77]) { const st = add(new THREE.BoxGeometry(0.03, 0.04, 0.006), mats.carbon); st.position.set(at(m), F.fl + 0.02, side * 0.82 * kz); }
            // two low, curved vanes at the front of the floor that steer the air outwards (smooth humps, so they don't read as teeth)
            for (const [z, h] of [[0.5, 0.09], [0.64, 0.065]]) {
                const o = []; for (let i = 0; i <= 10; i++) { const t = i / 10; o.push([at(lerp(2.16, 2.7, t)), F.fl + h * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.8)), 0.8)]); }
                add(sidePlate(F, o, side * z * kz, 0.008, false), mats.carbon);
            }
        }
    }
    const ramp = m => F.floorY + 0.01 + 0.317 * Math.pow(Math.max(0, m - 4.36), 1.6), rows = [];
    for (let i = 0; i <= 6; i++) { const m = lerp(4.36, 5.2, i / 6); rows.push([[at(m), ramp(m), 0.5 * kz], [at(m), ramp(m), -0.5 * kz]]); }
    add(skin(rows), mats.intake);
    // its fences: the two outer ones close the sides of the tunnel down to the floor; the inner ones are shallow ribs under its roof
    for (const z of lite ? [-0.5, 0, 0.5] : [-0.5, -0.25, 0, 0.25, 0.5]) {
        const outer = Math.abs(z) === 0.5, o = [], back = [];
        for (let i = 0; i <= 6; i++) { const m = lerp(4.36, 5.2, i / 6); o.push([at(m), ramp(m)]); back.unshift([at(m), outer ? F.floorY : Math.max(F.floorY, ramp(m) - 0.05)]); }
        add(sidePlate(F, [...o, ...back], z * kz, 0.008, false), mats.carbon);
    }

    // ---- the front wing: stacked curved elements between two end plates, swept back towards the tips ----
    const zsF = (lite ? [-1, -0.6, -0.2, 0.2, 0.6, 1] : [-1, -0.85, -0.68, -0.5, -0.32, -0.14, 0.14, 0.32, 0.5, 0.68, 0.85, 1]).map(t => t * 0.965 * kz);
    // each element: [front edge at the middle (m), how far it sweeps back by the tips, height, length at the middle and at the tips, tilt, extra rise part-way out]
    const fw = [[0, 0.22, 0.085, 0.26, 0.2, 0.07, 0], [0.2, 0.2, 0.118, 0.17, 0.17, 0.21, 0.01], [0.33, 0.18, 0.158, 0.15, 0.15, 0.35, 0.025], [0.42, 0.15, 0.205, 0.13, 0.13, 0.49, 0.04]];
    fw.forEach(([m0, sweep, y, c0, c1, tilt, rise], j) => {
        const g = wingElement(zsF, z => { const t = Math.abs(z) / (0.965 * kz); return { x: at(m0 + sweep * t * t), y: y + dy + rise * Math.sin(Math.PI * Math.min(1, t * 1.1)), chord: lerp(c0, c1, t), tilt, th: 0.014, camber: 0.022 }; });
        add(g, j < 2 ? mats.carbon : mats.paintPlain);
    });
    for (const side of [1, -1]) add(sidePlate(F, [[0.24, 0.07], [0.7, 0.07], [0.7, 0.3], [0.66, 0.335], [0.56, 0.33], [0.42, 0.24], [0.3, 0.14]].map(([m, y]) => [at(m), y + dy]), side * 0.975 * kz, 0.012, false), mats.paintPlain);
    // two short pylons hold the wing up under the nose
    for (const side of [1, -1]) car.add(bar(V(at(0.3), 0.1 + dy, side * 0.07), V(at(0.36), F.under(0.36) + 0.02, side * 0.07), 0.012, mats.carbon, 0.1));

    // ---- the rear wing: main plane, upper flap, end plates, a swan-neck pylon and a beam wing low down ----
    const zsR = (lite ? [-1, 0, 1] : [-1, -0.6, -0.2, 0.2, 0.6, 1]).map(t => t * 0.53 * kz), spoon = z => 0.03 * Math.pow(z / (0.53 * kz), 2);
    add(wingElement(zsR, z => ({ x: at(5.1), y: 0.765 + dy + spoon(z), chord: 0.3, tilt: 0.24, th: 0.022, camber: 0.045 })), mats.carbon);
    add(wingElement(zsR, z => ({ x: at(5.36), y: 0.865 + dy + spoon(z) * 0.6, chord: 0.14, tilt: 0.55, th: 0.012, camber: 0.02 })), mats.paintPlain);
    add(wingElement(zsR, () => ({ x: at(5.06), y: 0.4 + dy, chord: 0.17, tilt: 0.28, th: 0.014, camber: 0.025 })), mats.carbon);
    if (!lite) add(wingElement(zsR, () => ({ x: at(5.2), y: 0.455 + dy, chord: 0.11, tilt: 0.52, th: 0.01, camber: 0.015 })), mats.carbon);
    const plate = [[5.02, 0.34], [4.985, 0.5], [5.0, 0.7], [5.05, 0.86], [5.1, 0.925], [5.17, 0.945], [5.5, 0.945], [5.5, 0.5], [5.44, 0.4], [5.34, 0.34]].map(([m, y]) => [at(m), y + dy]);
    for (const side of [1, -1]) {
        add(sidePlate(F, plate, side * 0.535 * kz, 0.012, true), mats.paint);
        const led = add(new THREE.BoxGeometry(0.012, 0.16, 0.014), mats.tail); led.position.set(at(5.5) - 0.004, 0.66 + dy, side * 0.535 * kz);   // a red light strip on the back edge of each end plate
    }
    add(sidePlate(F, [[4.84, 0.37], [4.93, 0.37], [5.05, 0.6], [5.13, 0.8], [5.18, 0.855], [5.27, 0.86], [5.27, 0.835], [5.19, 0.83], [5.1, 0.82], [5.0, 0.62], [4.88, 0.42]].map(([m, y]) => [at(m), y + dy]), 0, 0.028, false), mats.carbon);
    // the exhaust: one fat tailpipe poking out under the wing
    const pipe = add(new THREE.CylinderGeometry(0.045, 0.045, 0.2, lite ? 8 : 16, 1, true), mats.intake); pipe.rotation.z = Math.PI / 2; pipe.position.set(at(5.12), 0.415 + dy, 0);
    // the rain light: a strip of red lamps on the very back of the car (it glows brighter under braking, like tail lights)
    const rain = add(new THREE.BoxGeometry(0.03, 0.1, 0.05), mats.tail); rain.position.set(at(5.26), 0.305 + dy, 0);

    // ---- the halo: a titanium hoop round the cockpit, on one pillar in front of the driver ----
    const hp = [[2.08, 0.87, 0], [2.12, 0.868, 0.12], [2.24, 0.855, 0.24], [2.42, 0.835, 0.295], [2.65, 0.8, 0.305], [2.85, 0.74, 0.3], [2.98, 0.65, 0.29]];
    const hoop = [...hp.slice(1).reverse().map(([m, y, z]) => V(at(m), y + dy, -z)), ...hp.map(([m, y, z]) => V(at(m), y + dy, z))];
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hoop, false, 'centripetal'), lite ? 18 : 48, 0.031, lite ? 5 : 8, false), mats.halo);
    const foot = V(at(1.95), F.top(1.95) - 0.02, 0), crown = V(at(2.085), 0.862 + dy, 0);
    const pillar = rod(foot, crown, 0.013, mats.halo, lite ? 6 : 10); pillar.scale.set(3.6, 1, 1); car.add(pillar);   // (a thin blade, so the driver can see round it)
    const knot = add(new THREE.SphereGeometry(0.032, 10, 8), mats.halo); knot.position.copy(crown); knot.scale.set(1.7, 0.95, 0.8);

    // ---- the cockpit: padded rim, headrest, steering wheel with its little screen, and the helmeted driver ----
    const hx = at(F.helmet.m), hy = F.helmet.y;
    helmetedDriver(part, hx, hy, 0);
    const rest = []; for (let i = 0; i <= 10; i++) { const a = lerp(-1.95, 1.95, i / 10); rest.push(V(hx - Math.cos(a) * 0.17, hy - 0.05, Math.sin(a) * 0.168)); }
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rest), lite ? 8 : 16, 0.045, lite ? 5 : 8, false), mats.dark);   // the headrest: a padded horseshoe round the back of the helmet
    if (!lite) add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rimPoints(F, 12), true), 48, 0.013, 6, true), mats.dark);
    steeringWheel(F, { col, part, car, mats, lite, bar });
    if (!lite) {   // the little TV camera pod on top of the airbox, and the air-speed probe on the nose
        const cam = add(new THREE.BoxGeometry(0.11, 0.035, 0.2), mats.carbon); cam.position.set(at(2.95), F.spineTop(2.95) + 0.035, 0);
        const stem = add(new THREE.BoxGeometry(0.06, 0.04, 0.02), mats.carbon); stem.position.set(at(2.95), F.spineTop(2.95) + 0.01, 0);
        car.add(bar(V(at(0.9), F.top(0.9) - 0.01, 0), V(at(0.9), F.top(0.9) + 0.07, 0), 0.006, mats.carbon)); car.add(bar(V(at(0.9), F.top(0.9) + 0.07, 0), V(at(0.84), F.top(0.9) + 0.07, 0), 0.006, mats.chrome));
    }
    // mirrors on stalks, out beyond the cockpit sides
    for (const side of [1, -1]) {
        const mp = V(at(F.mirror.m), F.mirror.y, side * F.mirror.z);
        const shell = add(new THREE.SphereGeometry(1, lite ? 8 : 14, lite ? 6 : 10, 0, Math.PI), mats.paintPlain); shell.rotation.y = Math.PI / 2; shell.scale.set(0.082, 0.042, 0.06); shell.position.copy(mp);   // a rounded shell, open at the back
        const glass = add(new THREE.CircleGeometry(1, lite ? 8 : 16), mats.chrome); glass.rotation.y = -Math.PI / 2; glass.scale.set(0.076, 0.037, 1); glass.position.set(mp.x - 0.002, mp.y, mp.z);
        car.add(bar(V(mp.x, mp.y - 0.03, mp.z - side * 0.03), V(mp.x - 0.04, F.top(F.mirror.m) - 0.05, side * (F.half(F.mirror.m) - 0.02)), 0.012, mats.carbon, 0.03));
        if (!lite) car.add(bar(V(mp.x, mp.y - 0.03, mp.z + side * 0.04), V(at(2.3), 0.6 + dy, side * 0.6 * kz), 0.008, mats.carbon, 0.02));   // a stay down to the sidepod
    }

    // ---- wheels: slick tyres with a coloured band, brake ducts inside, and the suspension links out to them ----
    const links = [];
    for (const front of [true, false]) for (const side of [1, -1]) {
        const o = front ? FORMULA_TYRES.front : FORMULA_TYRES.rear, w = makeWheel(p, mats, front, lite, false, o), pl = wheelPlace(F, front, side), rimR = p.wheel * o.rimK;
        w.position.set(pl.x, p.wheel, pl.z);
        if (side < 0) { w.rotation.y = Math.PI; const cal = w.userData.cal; cal.position.x *= -1; cal.rotation.z *= -1; }
        Object.assign(w.userData, { front, side });
        // the brake duct: a carbon drum closing the inside of the wheel, with a scoop at the front to catch cooling air
        const drum = new THREE.Mesh(new THREE.CylinderGeometry(rimR * 0.93, rimR * 0.93, 0.05, lite ? 12 : 24), mats.carbon); drum.rotation.x = Math.PI / 2; drum.position.z = -o.tw * 0.28; w.add(drum);
        const scoop = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.13, 0.06), mats.carbon); scoop.position.set(side * rimR * 0.5, 0.02, -o.tw * 0.28 - 0.04); w.add(scoop);
        car.add(w); wheels.push(w);
        // the links are one piece per corner, kept apart from the rest so the race can make them follow the wheel (see suspension.js)
        const cl = cornerLinks(F, front, side), geos = [];
        for (const [t, x0, legs, yi, zi, yo, zo] of lite ? cl.links.slice(0, front ? 3 : 4) : cl.links) for (const dx of legs) geos.push(beamGeo(V(x0 + dx, yi, zi), V(x0, yo, zo), t));
        const mesh = new THREE.Mesh(joinGeos(geos), mats.carbon); mesh.userData.keep = true; car.add(mesh);
        links.push({ mesh, wheel: w, side, x: cl.x, zi: cl.zi, zo: cl.zo });
    }
    if (merge) { wheels.forEach(w => { const sp = w.userData.spin; sp.userData.wheelRoot = true; mergeByMaterial(sp); w.userData.wheelRoot = true; mergeByMaterial(w); }); mergeByMaterial(car); }
    return { group: car, mats, wheels, links, dispose: disposer(car, mats), draft: draft && !lite };
}
// the steering wheel: a small squared-off racing wheel with two grips and a little screen, and the driver's arms reaching it
function steeringWheel(F, { col, part, car, mats, lite, bar }) {
    const g = new THREE.Group(); g.position.set(F.at(F.wheelM), F.wheelY, 0); g.rotation.z = -0.3; car.add(g);
    const inWheel = (geo, i) => { const m = new THREE.Mesh(col(geo, i), mats.interior); g.add(m); return m; };
    inWheel(new THREE.BoxGeometry(0.028, 0.105, 0.2), 0);
    for (const sd of [1, -1]) inWheel(new THREE.BoxGeometry(0.036, 0.13, 0.036), 4).position.z = sd * 0.115;
    if (!lite) { inWheel(new THREE.BoxGeometry(0.006, 0.045, 0.085), 13).position.set(-0.016, 0.018, 0); for (const sd of [1, -1]) inWheel(new THREE.BoxGeometry(0.008, 0.016, 0.016), 5).position.set(-0.016, -0.03, sd * 0.06); }
    const hx = F.at(F.helmet.m), hy = F.helmet.y;
    for (const sd of [1, -1]) { const arm = bar(V(hx + 0.02, hy - 0.2, sd * 0.19), V(F.at(F.wheelM) - 0.02, F.wheelY + 0.01, sd * 0.118), 0.07, mats.interior); col(arm.geometry, 4); car.add(arm);
        const glove = part(new THREE.SphereGeometry(0.04, 8, 6), 2); glove.position.set(F.at(F.wheelM) - 0.01, F.wheelY + 0.015, sd * 0.118); }
}
// The slick tyre's picture: smooth black rubber with a coloured band round each sidewall (no maker's name anywhere).
// across the picture = around the tyre; down = from one sidewall, over the tread, to the other sidewall
function slickTexture(band) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 128; const x = c.getContext('2d');
    x.fillStyle = '#222326'; x.fillRect(0, 0, 512, 128);
    x.fillStyle = '#1a1b1d'; x.fillRect(0, 30, 512, 68);                               // the smooth tread
    x.fillStyle = 'rgba(70,72,78,0.35)'; for (const y of [44, 64, 84]) x.fillRect(0, y, 512, 1.5);   // faint wear lines
    x.fillStyle = band || '#FFB300';
    for (const y of [17, 105]) { x.fillRect(0, y, 512, 6); for (let i = 0; i < 512; i += 128) x.clearRect(i + 50, y, 5, 6); }   // the band, with small gaps like the breaks in painted lettering
    x.globalCompositeOperation = 'destination-over'; x.fillStyle = '#222326'; x.fillRect(0, 0, 512, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 4;
    return t;
}

// =====================================================================
//  PAINT (called by liveryTexture in carmodel.js; x = the picture being painted, W x H pixels, Y(v) = how far down it v is)
// =====================================================================
// drawing on the top of the car, to be read from the front: fn draws centred, in pixels (px = pixels per metre)
function onTop(x, d, W, H, Y, m, fn) { const px = W / d.L; x.save(); x.transform(0, -DRAPE0 * H / px, -1, 0, (m / 5.5) * W, Y(0.5)); fn(px); x.restore(); }
// drawing on one side of the engine cover, fin or rear wing end plate (it reads the right way round on each side)
function onStrip(x, d, W, H, Y, m, y, side, fn) {
    const px = W / d.L, k = (0.113 / 0.7) * H / px, right = side === 'right';
    x.save(); x.translate((m / 5.5) * W, Y(stripV(y, right))); x.scale(right ? -1 : 1, (right ? 1 : -1) * k); fn(px); x.restore();
}
// two-tone paint: the second colour on the outer halves of the sidepods and the lower body
export function formulaTwoTone(x, d, W, H, Y) { x.fillStyle = d.paint2; x.fillRect(0, Y(0.3), W, Y(0.14) - Y(0.3)); x.fillRect(0, Y(0.86), W, Y(0.7) - Y(0.86)); }
// Motorsport team schemes on the Formula racer: stripes and blocks of colour, and made-up sponsors on the airbox,
// the rear wing end plates and the top of the tub (kit: the sponsor list and sticker drawing from carmodel.js)
export function formulaTeam(x, d, W, H, Y, band, { sponsorSticker, SPONSORS }) {
    const sc = d.stripeColour, p2 = d.paint2, S = i => SPONSORS[i % SPONSORS.length], U = m => (m / 5.5) * W;
    const sticker = (sp, wM, hM) => px => sponsorSticker(x, sp, wM * px, hM * px);
    const both = fn => { for (const side of ['right', 'left']) fn(side); };
    // a sweep of colour along the bottom of the engine cover, on both sides
    const sweep = colour => both(side => { const r = side === 'right', v = y => Y(stripV(y, r)); x.fillStyle = colour; x.beginPath(); x.moveTo(U(2.7), v(0.3)); x.lineTo(U(2.7), v(0.74)); x.quadraticCurveTo(U(3.8), v(0.6), U(4.8), v(0.5)); x.lineTo(U(4.8), v(0.3)); x.fill(); });
    let kit = [0, 2, 4];
    if (d.livery === 'rally') {
        x.fillStyle = sc; band(0.43, 0.465); band(0.535, 0.57); x.fillStyle = p2; band(0.475, 0.525);
        sweep(sc);
    }
    if (d.livery === 'endurance') {
        x.fillStyle = p2; band(0.385, 0.615); x.fillStyle = sc; band(0.4, 0.6);
        x.fillStyle = sc; x.fillRect(0.4 * W, Y(0.86), 0.08 * W, Y(0.14) - Y(0.86)); x.fillStyle = p2; x.fillRect(0.48 * W, Y(0.86), 0.012 * W, Y(0.14) - Y(0.86)); x.fillRect(0.388 * W, Y(0.86), 0.012 * W, Y(0.14) - Y(0.86));
        sweep(p2); kit = [5, 3, 0];
    }
    if (d.livery === 'gt') {
        formulaTwoTone(x, d, W, H, Y);
        for (let i = 0; i < 3; i++) { x.fillStyle = i === 1 ? p2 : sc; x.beginPath(); const u = U(0.75 + i * 0.22); x.moveTo(u, Y(0.4)); x.lineTo(u + U(0.1), Y(0.4)); x.lineTo(u + U(0.32), Y(0.6)); x.lineTo(u + U(0.22), Y(0.6)); x.fill(); }
        both(side => { const r = side === 'right', sq = U(0.09); for (let i = 0; i < 7; i++) for (let j = 0; j < 3; j++) { x.fillStyle = (i + j) % 2 ? '#111' : '#fff'; const v0 = stripV(0.52 + j * 0.055, r), v1 = stripV(0.575 + j * 0.055, r); x.fillRect(U(4.05) + i * sq, Math.min(Y(v0), Y(v1)), sq, Math.abs(Y(v1) - Y(v0))); } });
        kit = [7, 1, 2];
    }
    both(side => { onStrip(x, d, W, H, Y, 3.12, 0.8, side, sticker(S(kit[0]), 0.5, 0.12)); onStrip(x, d, W, H, Y, 5.27, 0.55, side, sticker(S(kit[1]), 0.4, 0.1)); });
    onTop(x, d, W, H, Y, 1.5, sticker(S(kit[2]), 0.3, 0.075));
}
// the race number (on the nose and on both sides of the fin) and the driver's tag (on the rear wing end plates)
export function formulaMarks(x, d, W, H, Y, num, tag) {
    const text = (str, size, font, maxW) => px => {
        x.font = `900 ${size * px}px ${font}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
        const w = x.measureText(str).width, k = maxW && w > maxW * px ? maxW * px / w : 1; x.scale(k, 1);
        x.lineWidth = size * px * 0.16; x.strokeStyle = '#111'; x.strokeText(str, 0, 0); x.fillStyle = '#F4F6F8'; x.fillText(str, 0, 0);
    };
    if (num) { onTop(x, d, W, H, Y, 1.02, text(num, 0.15, 'Orbitron, Arial Black, sans-serif', 0.24)); for (const side of ['right', 'left']) onStrip(x, d, W, H, Y, 4.08, 0.79, side, text(num, 0.2, 'Orbitron, Arial Black, sans-serif')); }
    if (tag) for (const side of ['right', 'left']) onStrip(x, d, W, H, Y, 5.25, 0.76, side, text(tag, 0.1, '"Exo 2", Arial, sans-serif', 0.44));
}
// fine dark lines where the body panels join: the nose cone and the engine cover lift off
export function formulaPanelLines(x, d, W, H, Y) {
    x.strokeStyle = 'rgba(0,0,0,0.5)'; x.lineWidth = 1.2;
    for (const m of [1.02, 2.95]) { x.beginPath(); x.moveTo((m / 5.5) * W, Y(0.86)); x.lineTo((m / 5.5) * W, Y(0.14)); x.stroke(); }
    // cooling gills: a row of dark slots on the shoulder of each sidepod
    x.fillStyle = 'rgba(8,9,11,0.85)';
    for (const sgn of [1, -1]) for (let i = 0; i < 6; i++) { const u = ((3.02 + i * 0.085) / 5.5) * W, v0 = Y(0.5 - sgn * 0.185), v1 = Y(0.5 - sgn * 0.215); x.beginPath(); x.moveTo(u, v0); x.lineTo(u + 0.006 * W, v0); x.lineTo(u + 0.011 * W, v1); x.lineTo(u + 0.005 * W, v1); x.fill(); }
}

// =====================================================================
//  STATS: light and full of downforce, so it corners and brakes best of all, but its wings and open wheels
//  drag it back on the straights, and its rear tyres alone must put the power down
// =====================================================================
export function formulaStats(design, e) {
    const kg = Math.round(430 + 20 * design.L * design.W + e.kg);
    const cd = 0.8, area = design.W * 0.62;
    const v = Math.cbrt((2 * e.bhp * 745.7 * 0.82) / (1.225 * cd * area));
    const mph = Math.round(Math.min(310, v / 0.44704));
    const z62 = Math.max(2.4, 1.3 + 1.05 * (kg / e.bhp) - (e.awd ? 0.3 : 0));
    const handling = Math.round(Math.min(100, 88 + (design.W - 2) * 30 - (kg - 830) / 25 + (0.06 - design.ride) * 120));
    const braking = Math.round(Math.min(100, 90 - (kg - 830) / 20 + (design.wheel - 0.36) * 300));
    return { bhp: e.bhp, mph, z62: Math.round(z62 * 10) / 10, kg, handling: Math.max(10, handling), braking: Math.max(10, braking), engine: e };
}
