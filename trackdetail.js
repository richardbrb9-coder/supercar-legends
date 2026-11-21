// Supercar Legends: details on the road. A darker rubbered racing line, tyre marks where drivers brake for the corners,
// a few patched repairs, and proper raised kerbs on the corners: a sloped edge, a flat top, crisp red and white stripes
// with ridges across them and smudges of tyre rubber. Everything is drawn in code (no picture files).
import * as THREE from './lib/three.module.min.js';

const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const KERB_KS = 0.004;          // corners sharper than this get kerbs (the same rule as the kerb colours)

// streaks along the road, used to break up the rubber and skid marks
function streakTexture() {
    const c = document.createElement('canvas'); c.width = 128; c.height = 256; const x = c.getContext('2d');
    x.fillStyle = '#c4c4c4'; x.fillRect(0, 0, 128, 256);
    for (let i = 0; i < 90; i++) {
        const u = Math.random() * 128, w = 0.6 + Math.random() * 2.5, g = Math.floor(120 + Math.random() * 135);
        x.fillStyle = `rgb(${g},${g},${g})`; x.globalAlpha = 0.5 + Math.random() * 0.5; x.fillRect(u, 0, w, 256);
    }
    x.globalAlpha = 1;
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * 0.4})`; x.fillRect(Math.random() * 128, Math.random() * 256, 6 + Math.random() * 20, 10 + Math.random() * 60); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8;
    return t;
}

// The road marks: a see-through dark layer just above the road, darker where cars drive and brake
export function roadMarks({ samples, N, HW, trackLen, rand = Math.random }) {
    const cols = 24, ks = i => Math.abs(samples[((i % N) + N) % N].ks);
    // how hard drivers brake at each point: a corner coming up, but not here yet
    const brake = new Float32Array(N), exitK = new Float32Array(N);
    for (let i = 0; i < N; i++) {
        let ahead = 0; for (let k = 12; k <= 42; k += 3) ahead = Math.max(ahead, ks(i + k));
        brake[i] = smooth(0.006, 0.02, ahead) * (1 - smooth(0.004, 0.014, ks(i)));
        let behind = 0; for (let k = 3; k <= 15; k += 3) behind = Math.max(behind, ks(i - k));
        exitK[i] = smooth(0.008, 0.02, behind) * (1 - smooth(0.006, 0.016, ks(i)));
    }
    // a few repaired patches of newer, darker tarmac
    const patches = [];
    for (let k = 0; k < 7; k++) { const i0 = Math.floor(rand() * N), len = 4 + Math.floor(rand() * 10), j0 = Math.floor(rand() * (cols - 6)); patches.push([i0, i0 + len, j0, j0 + 2 + Math.floor(rand() * 6)]); }
    const pos = [], col = [], uv = [], idx = [];
    for (let i = 0; i <= N; i++) {
        const s = samples[i % N], line = s.line * 0.9;
        for (let j = 0; j <= cols; j++) {
            const lat = -HW + (2 * HW) * j / cols, p = s.p.clone().addScaledVector(s.n, lat);
            pos.push(p.x, 0.024, p.z);
            const dl = lat - line, g = w => Math.exp(-(dl * dl) / (w * w));
            let a = 0.3 * g(1.5);                                       // the rubbered line
            a += 0.55 * brake[i % N] * g(1.9);                           // braking marks
            a += 0.3 * exitK[i % N] * g(1.7);                           // wheelspin marks out of the corners
            for (const [i0, i1, j0, j1] of patches) if (i >= i0 && i <= i1 && j >= j0 && j <= j1) a += 0.2;
            a *= smooth(HW, HW - 0.6, Math.abs(lat));                    // fades out before the white lines
            col.push(0.02, 0.02, 0.025, Math.min(0.75, a));
            uv.push(j / cols * 5, (i * trackLen / N) / 9);   // (counted on past the start line, so there's no seam)
        }
        if (i < N) for (let j = 0; j < cols; j++) { const a = i * (cols + 1) + j, b = a + cols + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 4));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    const m = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, userData: { roadMarks: true }, depthWrite: false, alphaMap: streakTexture(), side: THREE.DoubleSide,
        polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const mesh = new THREE.Mesh(g, m); mesh.renderOrder = 1; mesh.name = 'roadMarks';
    return mesh;
}

// kerb paint: red and white stripes (one of each down the picture), grubby, with tyre rubber along the inner edge
function kerbTextures() {
    const W = 64, H = 128;
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    x.fillStyle = '#c9180f'; x.fillRect(0, 0, W, H / 2); x.fillStyle = '#ecebe4'; x.fillRect(0, H / 2, W, H / 2);
    for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(30,25,20,${Math.random() * 0.12})`; x.fillRect(Math.random() * W, Math.random() * H, 1 + Math.random() * 4, 1 + Math.random() * 3); }   // grime
    const gr = x.createLinearGradient(0, 0, W * 0.45, 0); gr.addColorStop(0, 'rgba(15,15,18,0.55)'); gr.addColorStop(1, 'rgba(15,15,18,0)');
    x.fillStyle = gr; x.fillRect(0, 0, W * 0.45, H);                    // rubber from cars running wide over the inner edge
    for (let v = 0; v < H; v += 16) { x.fillStyle = 'rgba(0,0,0,0.16)'; x.fillRect(0, v, W, 2); }   // the shadow of each ridge
    const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; map.wrapT = THREE.RepeatWrapping; map.anisotropy = 8;
    // ridges across the kerb (a normal map: each ridge tilts up, then down)
    const n = document.createElement('canvas'); n.width = 4; n.height = H; const y = n.getContext('2d');
    for (let v = 0; v < H; v++) { const ph = (v % 16) / 16, k = Math.round(128 + (ph < 0.5 ? 55 : -55)); y.fillStyle = `rgb(128,${k},255)`; y.fillRect(0, v, 4, 1); }
    const nor = new THREE.CanvasTexture(n); nor.wrapT = THREE.RepeatWrapping; nor.colorSpace = THREE.NoColorSpace;
    return { map, nor };
}

// Raised kerbs on both sides of every corner
export function kerbs({ samples, N, HW, trackLen }) {
    const STRIPE = 3.0;               // metres for one red and one white stripe
    // the shape across the kerb: (distance out from the road's edge, height)
    const prof = [[-0.03, 0.025], [0.06, 0.05], [0.25, 0.062], [1.1, 0.062], [1.3, 0.04]];
    const on = i => Math.abs(samples[((i % N) + N) % N].ks) >= KERB_KS;
    // find each run of corner samples (a run may wrap past the start line)
    let start = 0; while (on(start) && start < N) start++;
    if (start >= N) start = 0;
    const runs = []; let cur = null;
    for (let k = 0; k <= N; k++) {
        const i = (start + k) % N;
        if (on(i) && k < N) { if (!cur) cur = [start + k, start + k]; else cur[1] = start + k; }
        else if (cur) { runs.push(cur); cur = null; }
    }
    const { map, nor } = kerbTextures();
    const mat = new THREE.MeshStandardMaterial({ map, normalMap: nor, normalScale: new THREE.Vector2(0.9, 0.9), roughness: 0.62 });
    const pos = [], uv = [], idx = [];
    for (const [a, b] of runs) {
        const n = b - a + 1; if (n < 3) continue;
        for (const side of [1, -1]) {
            const base = pos.length / 3;
            for (let k = 0; k <= n; k++) {
                const s = samples[(a + k) % N], ramp = Math.min(1, k / 2, (n - k) / 2);   // the ends slope down into the grass
                const along = ((a + k) * trackLen / N) / STRIPE;   // (keeps counting past the start line)
                for (let q = 0; q < prof.length; q++) {
                    const [off, h] = prof[q], p = s.p.clone().addScaledVector(s.n, side * (HW + off));
                    pos.push(p.x, 0.02 + (h - 0.02) * ramp, p.z);
                    uv.push(q / (prof.length - 1), along);
                }
                if (k < n) for (let q = 0; q < prof.length - 1; q++) {
                    const i0 = base + k * prof.length + q, i1 = i0 + prof.length;
                    if (side > 0) idx.push(i0, i1, i0 + 1, i0 + 1, i1, i1 + 1); else idx.push(i0, i0 + 1, i1, i0 + 1, i1 + 1, i1);   // (faces pointing up)
                }
            }
        }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, mat); mesh.receiveShadow = true; mesh.name = 'kerbs';
    return mesh;
}
// how high a kerb is at this point (for the suspension): the sloped edge, then the ridged top
export function kerbHeight(t, d) {   // t: 0..1.3 m out from the road edge; d: distance along the track
    if (t < 0.06) return 0.045 * Math.max(0, t / 0.06);
    return 0.052 + 0.005 * Math.abs(Math.sin(d * Math.PI / 0.375));
}

// =====================================================================
//  BARRIERS: steel crash barriers (or concrete blocks in the city) with a catch fence behind
// =====================================================================
const CHUNK = 160;   // samples per section (about 220 m): sections off screen aren't drawn at all
// Push a shape (points across: [distance out from the barrier line, height]) along part of the track on one side
function extrude({ samples, N, trackLen }, base, side, prof, uvU, uvV, i0, i1) {
    const pos = [], uv = [], idx = [], P = prof.length;
    for (let i = i0; i <= i1; i++) {
        const s = samples[i % N], d = i * trackLen / N;
        for (let q = 0; q < P; q++) { const [off, h] = prof[q], p = s.p.clone().addScaledVector(s.n, side * (base + off)); pos.push(p.x, h, p.z); uv.push(uvU(d), uvV(q, h)); }
        if (i < i1) for (let q = 0; q < P - 1; q++) { const a = (i - i0) * P + q, b = a + P; if (side > 0) idx.push(a, b, a + 1, a + 1, b, b + 1); else idx.push(a, a + 1, b, a + 1, b + 1, b); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals(); return g;
}
// join indexed geometries (keeping the shared corners)
function mergeIndexed(list) {
    const out = new THREE.BufferGeometry(), names = ['position', 'normal', 'uv'], idx = []; let off = 0;
    for (const n of names) { const size = n === 'uv' ? 2 : 3, arr = new Float32Array(list.reduce((k, g) => k + g.attributes[n].array.length, 0)); let o = 0; for (const g of list) { arr.set(g.attributes[n].array, o); o += g.attributes[n].array.length; } out.setAttribute(n, new THREE.BufferAttribute(arr, size)); }
    for (const g of list) { for (const v of g.index.array) idx.push(v + off); off += g.attributes.position.count; g.dispose(); }
    out.setIndex(idx); return out;
}
// one mesh per section and side, so the tablet only draws the parts in view
function sections(ctx, base, prof, uvU, uvV, mat, opts = {}) {
    const out = [];
    for (const side of [1, -1]) for (let i0 = 0; i0 < ctx.N; i0 += CHUNK) {
        const i1 = Math.min(ctx.N, i0 + CHUNK), geos = [].concat(prof).map(pr => extrude(ctx, base, side, pr, uvU, uvV, i0, i1));
        const m = new THREE.Mesh(geos.length > 1 ? mergeIndexed(geos) : geos[0], mat); Object.assign(m, opts); m.userData.seeThrough = true; out.push(m);
    }
    return out;
}
// galvanised steel, a little streaky
function steelTexture() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 32; const x = c.getContext('2d');
    x.fillStyle = '#b9bec4'; x.fillRect(0, 0, 256, 32);
    for (let i = 0; i < 120; i++) { x.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '60,64,70'},${Math.random() * 0.12})`; x.fillRect(Math.random() * 256, Math.random() * 32, 10 + Math.random() * 60, 1 + Math.random() * 3); }
    for (let u = 0; u < 256; u += 64) { x.fillStyle = 'rgba(40,44,50,0.5)'; x.fillRect(u, 0, 2, 32); x.fillStyle = 'rgba(30,30,30,0.6)'; for (const v of [8, 24]) { x.beginPath(); x.arc(u + 6, v, 2, 0, 7); x.fill(); } }   // joins and bolts
    const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
// concrete blocks painted red and white (one block of each across the picture), with joins and road grime at the bottom
function blockTexture() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
    x.fillStyle = '#d0140c'; x.fillRect(0, 0, 128, 64); x.fillStyle = '#eeede8'; x.fillRect(128, 0, 128, 64);
    for (let i = 0; i < 300; i++) { x.fillStyle = `rgba(40,35,30,${Math.random() * 0.1})`; x.fillRect(Math.random() * 256, Math.random() * 64, 1 + Math.random() * 6, 1 + Math.random() * 3); }
    const g = x.createLinearGradient(0, 64, 0, 40); g.addColorStop(0, 'rgba(25,25,25,0.55)'); g.addColorStop(1, 'rgba(25,25,25,0)'); x.fillStyle = g; x.fillRect(0, 40, 256, 24);
    for (const u of [0, 128]) { x.fillStyle = 'rgba(20,20,20,0.8)'; x.fillRect(u, 0, 3, 64); }   // the gap between blocks
    for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(15,15,15,0.35)'; x.fillRect(Math.random() * 256, 44 + Math.random() * 16, 20 + Math.random() * 40, 2 + Math.random() * 3); }   // tyre scuffs
    const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
// chain-link wire for the catch fence (see-through between the wires)
function wireTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    x.strokeStyle = 'rgba(200,205,210,1)'; x.lineWidth = 3;
    x.beginPath(); x.moveTo(0, 0); x.lineTo(64, 64); x.moveTo(64, 0); x.lineTo(0, 64); x.moveTo(-32, 32); x.lineTo(32, -32); x.moveTo(32, 96); x.lineTo(96, 32); x.moveTo(-32, 32); x.lineTo(32, 96); x.moveTo(32, -32); x.lineTo(96, 32); x.stroke();
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
// posts along both sides every 'every' metres, placed smoothly between the track's sample points
function postSpots(ctx, every, off) {
    const { samples, N, trackLen } = ctx, out = [];
    for (let d = 0; d < trackLen - 0.5; d += every) for (const s of [1, -1]) {
        const f = d / trackLen * N, i = Math.floor(f) % N, t = f - Math.floor(f), a = samples[i], b = samples[(i + 1) % N];
        const p = a.p.clone().lerp(b.p, t), n = a.n.clone().lerp(b.n, t).normalize();
        p.addScaledVector(n, s * off); out.push({ p, heading: a.heading });
    }
    return out;
}
// ctx: { samples, N, trackLen, HW, RUNOFF, city }. Returns a group with everything.
export function barriers(ctx) {
    const { HW, RUNOFF, city } = ctx, base = HW + RUNOFF, group = new THREE.Group(); group.name = 'barriers';
    const add = list => list.forEach(m => group.add(m));
    if (city) {
        // concrete blocks 2 m long: a sloped face, a flat top, painted red and white (the dirt is at the bottom)
        const prof = [[-0.32, 0], [-0.3, 0.25], [-0.14, 0.95], [-0.1, 1.05], [0.12, 1.05], [0.16, 0.95], [0.2, 0]];
        const vmap = (q) => [0, 0.24, 0.88, 0.98, 1, 0.98, 0.1][q];
        add(sections(ctx, base, [prof], d => d / 4, vmap, new THREE.MeshStandardMaterial({ map: blockTexture(), roughness: 0.8 }), { castShadow: true, receiveShadow: true }));
    } else {
        // steel crash barrier: two wavy rails facing the track, on posts every 2 m (the rails don't cast shadows: the posts do)
        const w = (y) => [[-0.05, y], [-0.13, y + 0.07], [-0.07, y + 0.13], [-0.13, y + 0.19], [-0.05, y + 0.25]];
        const steel = new THREE.MeshStandardMaterial({ map: steelTexture(), metalness: 0.7, roughness: 0.38, side: THREE.DoubleSide });
        add(sections(ctx, base, [w(0.42), w(0.78)], d => d / 4, q => q / 4, steel, { receiveShadow: true }));
        const spots = postSpots(ctx, 2, base);
        const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 1.08, 0.14), new THREE.MeshStandardMaterial({ color: 0x8d939b, metalness: 0.6, roughness: 0.5 }), spots.length);
        const mx = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1);
        spots.forEach(({ p, heading }, i) => { e.set(0, heading, 0); q.setFromEuler(e); mx.compose(new THREE.Vector3(p.x, 0.54, p.z), q, one); posts.setMatrixAt(i, mx); });
        posts.castShadow = true; posts.userData.seeThrough = true; group.add(posts);
    }
    // the catch fence: wire mesh on posts, behind the barrier. The wire is cut out (not see-through glass), so it sorts
    // correctly with the ghost car, rain and snow, and it fades away in the distance like a real fence
    const fb = city ? 1.05 : 0.2, top = city ? 3.8 : 3.4, fo = city ? 0.05 : 0.45;
    const wire = new THREE.MeshStandardMaterial({ map: wireTexture(), alphaTest: 0.35, alphaToCoverage: true, side: THREE.DoubleSide, metalness: 0.5, roughness: 0.5 });
    add(sections(ctx, base + fo, [[[0, fb], [0, top], [-0.35, top + 0.35]]], d => d / 0.3, (q, h) => h / 0.3, wire));
    const pb = city ? fb : 0, ph = top + 0.4 - pb, spots = postSpots(ctx, 4, base + fo + 0.03);
    const fpost = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.045, 0.05, ph, 6).translate(0, ph / 2, 0), new THREE.MeshStandardMaterial({ color: 0x5d636b, metalness: 0.6, roughness: 0.45 }), spots.length);
    const mx = new THREE.Matrix4();
    spots.forEach(({ p }, i) => { mx.makeTranslation(p.x, pb, p.z); fpost.setMatrixAt(i, mx); });
    fpost.castShadow = true; fpost.userData.seeThrough = true; group.add(fpost);
    return group;
}
