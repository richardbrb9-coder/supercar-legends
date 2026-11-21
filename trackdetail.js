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
