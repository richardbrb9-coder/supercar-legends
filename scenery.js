// Supercar Legends: the look of the race world. Sky, distant hills, reflections, shadows, quality levels,
// and the scenery for each circuit. Everything is made in code, so it works offline and needs no downloads.
import * as THREE from './lib/three.module.min.js';

// =====================================================================
//  QUALITY LEVELS (chosen automatically, or by the player in the race menu)
// =====================================================================
export const QUALITY = {
    low:    { label: 'Low',    pixelRatio: 0.9,  shadows: 0,    shadowSize: 0,  density: 0.45 },
    medium: { label: 'Medium', pixelRatio: 1.1,  shadows: 1024, shadowSize: 60, density: 0.75 },
    high:   { label: 'High',   pixelRatio: 1.5,  shadows: 2048, shadowSize: 85, density: 1 }
};
// A first guess before we've measured the frame rate: tablets and phones start at medium
export function guessQuality() {
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    return touch ? 'medium' : 'high';
}

// =====================================================================
//  SKY (a big sphere around the camera: gradient, sun and soft clouds)
// =====================================================================
export const THEMES = {
    coast:  { top: 0x2f7fd6, horizon: 0xbfe0f5, sun: [0.55, 0.42, -0.72], fog: [260, 1500], ground: 0x4a8a3c, hills: 0x5f7f6a },
    city:   { top: 0x4f86c6, horizon: 0xd4dde6, sun: [-0.5, 0.5, -0.7],   fog: [180, 900],  ground: 0x4a4f57, hills: 0x8a95a3 },
    forest: { top: 0x3a86d8, horizon: 0xcfe6f5, sun: [0.6, 0.38, 0.7],    fog: [280, 1700], ground: 0x3f7a35, hills: 0x4d6e55 }
};
// Time of day changes the colours, sun height and light strength of any theme
export const TIMES = { day: 'Day', sunset: 'Sunset', night: 'Night' };
export function lookFor(themeKey, time = 'day') {
    const t = { ...THEMES[themeKey], time, light: { sun: 2.8, sunColor: 0xfff0d8, hemi: 0.7, env: 0.9, exposure: 1.05 }, clouds: themeKey === 'city' ? 0.5 : 0.8, stars: 0, glow: 0 };
    if (time === 'sunset') Object.assign(t, { top: 0x3a4f8c, horizon: 0xf2a65a, sun: [t.sun[0], 0.08, t.sun[2]], fog: [t.fog[0] * 0.9, t.fog[1] * 0.9],
        light: { sun: 2.2, sunColor: 0xffb070, hemi: 0.5, env: 0.75, exposure: 1.1 }, clouds: 0.6, glow: 0.4 });
    if (time === 'night') Object.assign(t, { top: 0x05070f, horizon: 0x1a2236, sun: [-t.sun[0], 0.35, -t.sun[2]], fog: [t.fog[0] * 0.5, t.fog[1] * 0.45],
        light: { sun: 0.5, sunColor: 0x9fb4ff, hemi: 0.32, env: 0.45, exposure: 1.25 }, clouds: 0.15, stars: 1, glow: 1 });
    return t;
}
const SKY_VERT = `varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const SKY_FRAG = `
uniform vec3 top; uniform vec3 horizon; uniform vec3 sunDir; uniform float clouds; uniform float stars; uniform float night;
varying vec3 vDir;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
void main() {
  vec3 d = normalize(vDir); float h = d.y;
  vec3 col = mix(horizon, top, pow(clamp(h, 0.0, 1.0), 0.55));
  if (h < 0.0) col = horizon * 0.92;
  float s = max(dot(d, normalize(sunDir)), 0.0);
  vec3 sunCol = mix(vec3(1.0, 0.92, 0.75), vec3(0.85, 0.9, 1.0), night);
  col += sunCol * (pow(s, 900.0) * 3.0 * (1.0 - night * 0.6) + pow(s, 12.0) * 0.25 * (1.0 - night));
  if (stars > 0.0 && h > 0.05) { vec2 g = floor(d.xz / (h + 0.3) * 260.0); float st = step(0.997, hash(g)); col += vec3(st) * stars * 0.9; }
  if (h > 0.02 && clouds > 0.0) {
    vec2 uv = d.xz / (h + 0.12) * 1.6;
    float c = smoothstep(0.52, 0.78, fbm(uv + vec2(3.7, 1.1)));
    col = mix(col, mix(vec3(1.0) * (0.92 + 0.08 * s), horizon * 0.6, night), c * clouds * smoothstep(0.02, 0.2, h));
  }
  gl_FragColor = vec4(col, 1.0);
}`;
// Photographed skies (free CC0 skies from Poly Haven, shrunk and saved in skies/ so they work offline).
// They load in the background; until they arrive (or if they can't load) the drawn sky above is used.
const SKY_FILES = { day: 'skies/day.webp', sunset: 'skies/sunset.webp', night: 'skies/night.webp' };
const photoSkies = {}, skyWaiters = [];
for (const [time, url] of Object.entries(SKY_FILES)) {
    photoSkies[time] = { tex: null, sunU: 0.25, horizon: null };
    new THREE.TextureLoader().load(url, tex => {
        tex.colorSpace = THREE.SRGBColorSpace;
        // measure the photo once: where its sun (brightest spot) is, and the colour just above the horizon (for the haze)
        const img = tex.image, c = document.createElement('canvas'); c.width = 256; c.height = 128;
        const x = c.getContext('2d'); x.drawImage(img, 0, 0, 256, 128);
        const d = x.getImageData(0, 0, 256, 128).data; let best = -1, bu = 0.25, r = 0, g = 0, b = 0;
        for (let j = 20; j < 62; j++) for (let i = 0; i < 256; i++) { const k = (j * 256 + i) * 4, l = d[k] + d[k + 1] + d[k + 2]; if (l > best) { best = l; bu = i / 256; } }
        for (let i = 0; i < 256; i++) { const k = (60 * 256 + i) * 4; r += d[k]; g += d[k + 1]; b += d[k + 2]; }
        photoSkies[time] = { tex, sunU: bu, horizon: new THREE.Color().setRGB(r / 256 / 255, g / 256 / 255, b / 256 / 255, THREE.SRGBColorSpace) };
        skyWaiters.splice(0).forEach(f => f());
    });
}
// call f once a photo sky that wasn't ready yet has arrived (so the race can swap the drawn sky for the photo)
export function whenSkyLoads(f) { skyWaiters.push(f); }
export function hasPhotoSky(t) { return !!(photoSkies[t.time] && photoSkies[t.time].tex); }
// the haze colour that blends the distant scenery into the sky
export function horizonColour(t) { const p = photoSkies[t.time]; return p && p.horizon ? p.horizon.clone() : new THREE.Color(t.horizon); }
export function makeSky(t) {
    const photo = photoSkies[t.time];
    if (photo && photo.tex) {
        const sky = new THREE.Mesh(new THREE.SphereGeometry(2000, 48, 24),
            new THREE.MeshBasicMaterial({ map: photo.tex, side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false }));
        // turn the photo so its sun sits where the scene's sunlight comes from
        const a = photo.sunU * Math.PI * 2, ax = -Math.cos(a), az = Math.sin(a);
        sky.rotation.y = Math.atan2(t.sun[0], t.sun[2]) - Math.atan2(ax, az);
        sky.renderOrder = -1; sky.frustumCulled = false;
        return sky;
    }
    const mat = new THREE.ShaderMaterial({
        uniforms: { top: { value: new THREE.Color(t.top) }, horizon: { value: new THREE.Color(t.horizon) },
                    sunDir: { value: new THREE.Vector3(...t.sun).normalize() }, clouds: { value: t.clouds }, stars: { value: t.stars }, night: { value: t.stars } },
        vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false, fog: false });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(2000, 32, 16), mat);
    sky.renderOrder = -1; sky.frustumCulled = false;
    return sky;
}
// Reflections for the cars' paint: the sky and the ground, blurred into an environment map
export function makeEnvironment(renderer, t) {
    const env = new THREE.Scene();
    env.add(makeSky(t));
    const ground = new THREE.Mesh(new THREE.CircleGeometry(1900, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(t.ground).multiplyScalar(t.stars ? 0.15 : 1) }));
    ground.material.toneMapped = false;
    ground.rotation.x = -Math.PI / 2; ground.position.y = -20; env.add(ground);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const tex = pmrem.fromScene(env, 0.02, 1, 2500).texture;
    pmrem.dispose();
    env.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    return tex;
}

// =====================================================================
//  TEXTURES (drawn on canvases)
// =====================================================================
function canvasTex(w, h, draw, repeat = true) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
}
const rand = (a, b) => a + Math.random() * (b - a);
// Free CC0 textures from Poly Haven (polyhaven.com), saved in textures/ so they work offline
const loader = new THREE.TextureLoader(), texCache = {};
export let useDetailMaps = true;   // normal maps are skipped on Low quality
export function setDetail(on) { useDetailMaps = on; }
export function photoTex(name, kind = 'col') {
    const key = name + kind;
    if (!texCache[key]) {
        const t = loader.load(`textures/${name}_${kind}.webp`);
        t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
        if (kind === 'col') t.colorSpace = THREE.SRGBColorSpace;
        texCache[key] = t;
    }
    return texCache[key].clone();   // clones share the image, so it's loaded once
}
// a material using a photo texture, repeated every 'metres', with an optional colour tint
export function photoMat(name, rx, ry, tint = 0xffffff, rough = 0.95) {
    const map = photoTex(name, 'col'); map.repeat.set(rx, ry);
    const m = new THREE.MeshStandardMaterial({ map, color: tint, roughness: rough });
    if (useDetailMaps) { const n = photoTex(name, 'nor'); n.repeat.set(rx, ry); m.normalMap = n; m.normalScale.set(0.8, 0.8); }
    return m;
}
export function asphaltTexture() {
    return canvasTex(512, 512, (x, w, h) => {
        x.fillStyle = '#3a3d43'; x.fillRect(0, 0, w, h);
        for (let i = 0; i < 9000; i++) { const g = 40 + Math.random() * 50; x.fillStyle = `rgba(${g},${g},${g + 4},.45)`; x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); }
        for (let i = 0; i < 14; i++) { x.fillStyle = `rgba(20,22,26,${rand(0.05, 0.12)})`; x.beginPath(); x.ellipse(rand(60, w - 60), rand(0, h), rand(20, 60), rand(40, 120), 0, 0, 7); x.fill(); }
        x.fillStyle = '#ececec'; x.fillRect(0, 0, 12, h); x.fillRect(w - 12, 0, 12, h);           // white edge lines
    });
}
function grassTexture(base) {
    const c = new THREE.Color(base);
    return canvasTex(256, 256, (x, w, h) => {
        x.fillStyle = '#' + c.getHexString(); x.fillRect(0, 0, w, h);
        for (let i = 0; i < 60; i++) { const k = rand(-0.06, 0.06), cc = c.clone().offsetHSL(rand(-0.02, 0.02), 0, k); x.fillStyle = '#' + cc.getHexString(); x.globalAlpha = 0.5; x.beginPath(); x.arc(rand(0, w), rand(0, h), rand(10, 40), 0, 7); x.fill(); }
        x.globalAlpha = 1;
        for (let i = 0; i < 4000; i++) { const cc = c.clone().offsetHSL(0, 0, rand(-0.1, 0.1)); x.fillStyle = '#' + cc.getHexString(); x.fillRect(Math.random() * w, Math.random() * h, 1, 2); }
    });
}

// =====================================================================
//  SCENERY BUILDERS
//  ctx: { group, samples, N, trackLen, HW, RUNOFF, pathAt, nearTrack, bounds, theme, quality }
//  pathAt(d, lateral, 0) gives the point at distance d along the track, 'lateral' metres to one side.
// =====================================================================
// Put an object beside the track facing the road. lateral > 0 and < 0 are the two sides.
function placeBeside(ctx, obj, d, lateral) {
    const p = ctx.pathAt(d, lateral, 0);
    obj.position.set(p.x, 0, p.z);
    obj.rotation.y = p.heading + (lateral > 0 ? Math.PI : 0);   // local -z then faces the road
    ctx.group.add(obj);
    return obj;
}
const cornerList = ctx => {
    const { samples, N } = ctx, out = [];
    for (let i = 0; i < N; i++) {
        const k = Math.abs(samples[i].ks); if (k < 0.008) continue;
        let peak = true; for (let j = -40; j <= 40 && peak; j++) if (Math.abs(samples[(i + j + N) % N].ks) > k) peak = false;
        if (peak && !out.some(c => Math.abs(c - i) < 40 || Math.abs(c - i) > N - 40)) out.push(i);
    }
    return out;
};
// the outside of a corner (as a lateral sign for pathAt)
const outside = (ctx, i) => Math.sign(ctx.samples[i].ks) || 1;

const GRASS_TINT = 0x8fd06a;   // the photo grass is quite yellow; this tints it a fresher green
function ground(ctx, color) {
    const { bounds } = ctx, gw = bounds.maxX - bounds.minX + 1600, gd = bounds.maxZ - bounds.minZ + 1600;
    const g = new THREE.Mesh(new THREE.PlaneGeometry(gw, gd), photoMat('leafy_grass', gw / 9, gd / 9, GRASS_TINT));
    g.rotation.x = -Math.PI / 2; g.position.set((bounds.minX + bounds.maxX) / 2, -0.02, (bounds.minZ + bounds.maxZ) / 2);
    g.receiveShadow = true; ctx.group.add(g);
}
// a ring of low hills far away, softened by the haze
function hills(ctx, color, height = 60) {
    const { bounds } = ctx, cx = (bounds.minX + bounds.maxX) / 2, cz = (bounds.minZ + bounds.maxZ) / 2;
    const R = Math.hypot(bounds.maxX - bounds.minX, bounds.maxZ - bounds.minZ) / 2 + 380, seg = 160, pos = [], idx = [];
    const phase = [rand(0, 6), rand(0, 6), rand(0, 6)];
    for (let i = 0; i <= seg; i++) {
        const a = i / seg * Math.PI * 2;
        const hgt = height * (0.45 + 0.3 * Math.sin(a * 3 + phase[0]) + 0.2 * Math.sin(a * 7 + phase[1]) + 0.1 * Math.sin(a * 17 + phase[2]));
        const r1 = R, r2 = R + 220;
        pos.push(cx + Math.cos(a) * r1, -1, cz + Math.sin(a) * r1, cx + Math.cos(a) * (r1 + 90), hgt, cz + Math.sin(a) * (r1 + 90), cx + Math.cos(a) * r2, hgt * 0.7, cz + Math.sin(a) * r2);
        if (i < seg) { const b = i * 3; idx.push(b, b + 3, b + 1, b + 1, b + 3, b + 4, b + 1, b + 4, b + 2, b + 2, b + 4, b + 5); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    ctx.group.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true, side: THREE.DoubleSide })));
}
// two kinds of tree (pine and round), in varied greens; they cast shadows
function trees(ctx, count, minGap = 8, area = null) {
    const { bounds, nearTrack, HW, RUNOFF } = ctx;
    const n = Math.round(count * ctx.quality.density);
    const pineTop = new THREE.InstancedMesh(new THREE.ConeGeometry(2.6, 7.5, 7), new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9 }), n);
    const roundTop = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(3.2, 0), new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9 }), n);
    const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.3, 0.45, 3, 6), new THREE.MeshStandardMaterial({ color: 0x5b3a1e, roughness: 1 }), n * 2);
    const m = new THREE.Matrix4(), col = new THREE.Color(); let np = 0, nr = 0, nt = 0, tries = 0;
    const greens = [0x24592b, 0x2e6b30, 0x3b7d33, 0x1f4d2a, 0x4a8a35, 0x5a8f2e];
    while (np + nr < n && tries < n * 25) {
        tries++;
        const x = area ? area.x + rand(-area.r, area.r) : rand(bounds.minX - 120, bounds.maxX + 120);
        const z = area ? area.z + rand(-area.r, area.r) : rand(bounds.minZ - 120, bounds.maxZ + 120);
        if (nearTrack(x, z) < HW + RUNOFF + minGap) continue;
        if (ctx.avoid && ctx.avoid(x, z)) continue;
        const sc = rand(0.7, 1.5); col.set(greens[Math.floor(Math.random() * greens.length)]).offsetHSL(0, 0, rand(-0.04, 0.04));
        m.makeScale(sc, sc, sc).setPosition(x, 1.5 * sc, z); trunks.setMatrixAt(nt++, m);
        if (Math.random() < 0.55) { m.makeScale(sc, sc, sc).setPosition(x, 6.2 * sc, z); pineTop.setMatrixAt(np, m); pineTop.setColorAt(np++, col); }
        else { m.makeScale(sc, sc * rand(0.85, 1.15), sc).setPosition(x, 5.5 * sc, z); roundTop.setMatrixAt(nr, m); roundTop.setColorAt(nr++, col); }
    }
    pineTop.count = np; roundTop.count = nr; trunks.count = nt;
    [pineTop, roundTop, trunks].forEach(o => { o.castShadow = true; ctx.group.add(o); });
}
// gravel traps on the outside of corners (between the kerb and the barrier)
function gravel(ctx) {
    const { samples, N, HW, RUNOFF, pathAt } = ctx, pos = [], col = [], idx = [], uv = [];
    const sand = new THREE.Color(0xffffff);
    for (const ci of cornerList(ctx)) {
        const side = outside(ctx, ci), d0 = samples[ci].d - 45, steps = 30;
        const base = pos.length / 3;
        for (let k = 0; k <= steps; k++) {
            const d = d0 + k * 90 / steps, fade = Math.sin(Math.PI * k / steps);
            const a = pathAt(d, side * (HW + 1.4), 0), b = pathAt(d, side * (HW + 1.4 + (RUNOFF - 1.8) * Math.max(0.15, fade)), 0);
            pos.push(a.x, 0.025, a.z, b.x, 0.025, b.z); uv.push(d / 4, 0, d / 4, (RUNOFF - 1.8) * Math.max(0.15, fade) / 4);
            const c = sand.clone(); col.push(c.r, c.g, c.b, c.r, c.g, c.b);
            if (k < steps) { const q = base + k * 2; idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); }
        }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const gm = photoMat('coast_sand_01', 1, 1, 0xf0e2c0); gm.side = THREE.DoubleSide;
    const mesh = new THREE.Mesh(g, gm); mesh.receiveShadow = true;
    ctx.group.add(mesh);
}
// stacks of old tyres along the barrier on the outside of corners
function tyreWalls(ctx) {
    const { samples, HW, RUNOFF, pathAt } = ctx, spots = [];
    for (const ci of cornerList(ctx)) {
        const side = outside(ctx, ci);
        for (let d = samples[ci].d - 30; d <= samples[ci].d + 30; d += 0.75) for (let lvl = 0; lvl < 3; lvl++) spots.push([d, side, lvl]);
    }
    const tyres = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 10), new THREE.MeshStandardMaterial({ roughness: 0.9 }), spots.length);
    const m = new THREE.Matrix4(), c = new THREE.Color();
    spots.forEach(([d, side, lvl], i) => {
        const p = pathAt(d, side * (HW + RUNOFF - 0.45), 0);
        m.makeTranslation(p.x, 0.15 + lvl * 0.27, p.z); tyres.setMatrixAt(i, m);
        tyres.setColorAt(i, c.set(Math.floor(d / 0.75) % 9 === 0 && lvl === 1 ? 0xf2f2f2 : 0x16171a));
    });
    tyres.castShadow = true; ctx.group.add(tyres);
}
// advertising boards along the straights, for made-up brands
const BRANDS = [['TURBO COLA', '#E10600', '#fff'], ['APEX TYRES', '#111', '#FFB300'], ['NITRO FUEL', '#1E3A8A', '#C6FF00'], ['VELOCITY WATCHES', '#F4F6F8', '#111'],
                ['LEGENDS TV', '#00B8D9', '#111'], ['PIT STOP PIZZA', '#FF6D00', '#fff'], ['SUPERCAR LEGENDS', '#111', '#E10600'], ['GRID GUM', '#7E57C2', '#fff']];
function adBoards(ctx, every = 70) {
    const { trackLen, HW, RUNOFF, samples, N } = ctx;
    const mats = BRANDS.map(([text, bg, fg]) => new THREE.MeshStandardMaterial({ roughness: 0.6, map: canvasTex(512, 96, (x, w, h) => {
        x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = fg; x.font = '900 54px Arial Black, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + 3);
    }, false) }));
    const legs = new THREE.MeshStandardMaterial({ color: 0x2a2f39 });
    let k = 0;
    for (let d = 30; d < trackLen - 20; d += every) {
        const i = Math.floor(d / trackLen * N); if (Math.abs(samples[i].ks) > 0.004) continue;
        const side = k % 2 ? 1 : -1, board = new THREE.Group();
        const face = new THREE.Mesh(new THREE.BoxGeometry(7, 1.3, 0.12), mats[k++ % mats.length]); face.position.y = 1.4; board.add(face);
        for (const px of [-3, 3]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.8, 0.12), legs); leg.position.set(px, 0.4, 0); board.add(leg); }
        board.traverse(o => { o.castShadow = true; });
        placeBeside(ctx, board, d, side * (HW + RUNOFF + 0.6));
    }
}
// small marshal huts with an orange flag
function marshalPosts(ctx, every = 280) {
    const { trackLen, HW, RUNOFF } = ctx;
    const hutMat = new THREE.MeshStandardMaterial({ color: 0xf2f2f2 }), roofMat = new THREE.MeshStandardMaterial({ color: 0xE10600 }), flagMat = new THREE.MeshStandardMaterial({ color: 0xff7a00, side: THREE.DoubleSide });
    let k = 0;
    for (let d = 120; d < trackLen - 60; d += every) {
        const post = new THREE.Group();
        const hut = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 1.8), hutMat); hut.position.y = 1.1; post.add(hut);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 2.2), roofMat); roof.position.y = 2.3; post.add(roof);
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6), hutMat); pole.position.set(1.4, 1.2, 0); post.add(pole);
        const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), flagMat); flag.position.set(1.8, 2.1, 0); post.add(flag);
        post.traverse(o => { o.castShadow = true; });
        placeBeside(ctx, post, d, (k++ % 2 ? 1 : -1) * (HW + ctx.RUNOFF + 3.5));
    }
}
// a grandstand with a crowd (the crowd is a texture of coloured dots on each step)
function crowdTexture() {
    return canvasTex(512, 64, (x, w, h) => {
        x.fillStyle = '#2b3240'; x.fillRect(0, 0, w, h);
        const cols = ['#E10600', '#FFB300', '#F4F6F8', '#00B8D9', '#1E3A8A', '#43A047', '#FF6D00', '#7E57C2', '#d9b38c', '#8d5524'];
        for (let i = 0; i < 260; i++) { const cx = rand(0, w), cy = rand(14, h - 6); x.fillStyle = cols[Math.floor(Math.random() * cols.length)]; x.fillRect(cx, cy, 5, h - cy); x.fillStyle = Math.random() < 0.5 ? '#d9b38c' : '#8d5524'; x.beginPath(); x.arc(cx + 2.5, cy - 2, 3, 0, 7); x.fill(); }
    });
}
function grandstand(ctx, d, lateral, length = 70, rows = 8) {
    const st = new THREE.Group(), steps = new THREE.MeshStandardMaterial({ color: 0x9aa3af, roughness: 0.8 });
    const crowd = crowdTexture(); crowd.repeat.set(length / 14, 1);
    const crowdMat = new THREE.MeshStandardMaterial({ map: crowd, roughness: 0.9 });
    for (let r = 0; r < rows; r++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(length, 0.9, 1.6), steps); step.position.set(0, 0.45 + r * 0.9, r * 1.6); st.add(step);
        const people = new THREE.Mesh(new THREE.PlaneGeometry(length, 0.9), crowdMat); people.position.set(0, 1.35 + r * 0.9, r * 1.6 - 0.75); people.rotation.y = Math.PI; st.add(people);
    }
    const back = new THREE.Mesh(new THREE.BoxGeometry(length, rows * 0.9 + 4, 0.4), steps); back.position.set(0, (rows * 0.9 + 4) / 2, rows * 1.6); st.add(back);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(length + 2, 0.35, rows * 1.6 + 3), new THREE.MeshStandardMaterial({ color: 0xE10600, roughness: 0.5 }));
    roof.position.set(0, rows * 0.9 + 4.2, rows * 0.8 - 0.5); st.add(roof);
    for (let x = -length / 2; x <= length / 2; x += length / 6) { const col = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, rows * 0.9 + 4.2, 8), steps); col.position.set(x, (rows * 0.9 + 4.2) / 2, -0.6); st.add(col); }
    st.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    placeBeside(ctx, st, d, lateral);   // rows climb away from the road (local +z)
    return st;
}

// =====================================================================
//  LE MANS: pit building, big grandstand, footbridge, Ferris wheel, forest, hills
// =====================================================================
function leMans(ctx) {
    const { HW, RUNOFF, pathAt, nearTrack, bounds } = ctx;
    ground(ctx, THEMES.forest.ground);
    hills(ctx, THEMES.forest.hills, 70);
    // pit building along the start straight (one side), grandstand opposite
    const pitLen = 170, pitD = 25 + pitLen / 2;
    const pits = new THREE.Group();
    const garageTex = canvasTex(256, 128, (x, w, h) => {
        x.fillStyle = '#e8e8ea'; x.fillRect(0, 0, w, h);
        x.fillStyle = '#2a2f39'; x.fillRect(18, 34, w - 36, h - 34);
        for (let y = 40; y < h; y += 8) { x.fillStyle = '#3a4150'; x.fillRect(18, y, w - 36, 2); }
        x.fillStyle = '#E10600'; x.fillRect(0, 0, w, 16);
    });
    garageTex.repeat.set(pitLen / 8, 1);
    const pitBody = new THREE.Mesh(new THREE.BoxGeometry(pitLen, 6, 12), [
        new THREE.MeshStandardMaterial({ color: 0xe8e8ea }), new THREE.MeshStandardMaterial({ color: 0xe8e8ea }),
        new THREE.MeshStandardMaterial({ color: 0xcfd3d8 }), new THREE.MeshStandardMaterial({ color: 0xcfd3d8 }),
        new THREE.MeshStandardMaterial({ color: 0xe8e8ea }), new THREE.MeshStandardMaterial({ map: garageTex })]);
    pitBody.position.set(0, 3, 6); pits.add(pitBody);
    const terrace = new THREE.Mesh(new THREE.BoxGeometry(pitLen, 0.4, 14), new THREE.MeshStandardMaterial({ color: 0x2a2f39 })); terrace.position.set(0, 6.2, 6); pits.add(terrace);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(pitLen - 4, 3, 9), new THREE.MeshStandardMaterial({ color: 0x1c2b3a, metalness: 0.6, roughness: 0.15 })); glass.position.set(0, 7.9, 7); pits.add(glass);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(pitLen + 2, 0.5, 15), new THREE.MeshStandardMaterial({ color: 0xE10600 })); roof.position.set(0, 9.6, 6); pits.add(roof);
    pits.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    placeBeside(ctx, pits, pitD, -(HW + RUNOFF + 4));   // the garage doors (the -z face) look onto the track
    grandstand(ctx, pitD, HW + RUNOFF + 3, 120, 10);
    // a footbridge arching over the track, with a sign on it
    const bd = 290, bridge = new THREE.Group(), span = (HW + RUNOFF) * 2 + 6;
    const arch = new THREE.Mesh(new THREE.TorusGeometry(span / 2, 1.1, 10, 40, Math.PI), new THREE.MeshStandardMaterial({ color: 0x16171a, roughness: 0.7 }));
    arch.position.y = 0; bridge.add(arch);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(span, 1.2, 2.6), new THREE.MeshStandardMaterial({ color: 0xF4F6F8 })); deck.position.y = span / 2 - 1.5; bridge.add(deck);
    const signTex = canvasTex(1024, 96, (x, w, h) => { x.fillStyle = '#E10600'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = '900 64px Arial Black, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('SUPERCAR LEGENDS', w / 2, h / 2 + 4); }, false);
    // the group is turned so local x runs across the track and local z along it; the signs face both ways along the track
    for (const face of [1, -1]) { const sign = new THREE.Mesh(new THREE.PlaneGeometry(span * 0.7, span * 0.07), new THREE.MeshBasicMaterial({ map: signTex })); sign.position.set(0, span / 2 - 1.5, face * 1.32); sign.rotation.y = face > 0 ? 0 : Math.PI; bridge.add(sign); }
    bridge.traverse(o => { o.castShadow = true; });
    const bp = pathAt(bd, 0, 0); bridge.position.set(bp.x, 0, bp.z); bridge.rotation.y = bp.heading + Math.PI / 2;
    ctx.group.add(bridge);
    // a Ferris wheel in the infield, near the start
    const start = pathAt(150, 0, 0);
    let best = null;
    for (let gx = bounds.minX; gx < bounds.maxX; gx += 20) for (let gz = bounds.minZ; gz < bounds.maxZ; gz += 20) {
        const nt = nearTrack(gx, gz); if (nt < 55 || nt > 95) continue;
        const dd = Math.hypot(gx - start.x, gz - start.z); if (!best || dd < best.dd) best = { x: gx, z: gz, dd };
    }
    let wheel = null;
    if (best) {
        const fw = new THREE.Group(), R = 20, steel = new THREE.MeshStandardMaterial({ color: 0xF4F6F8, metalness: 0.4, roughness: 0.4 });
        wheel = new THREE.Group(); wheel.position.y = R + 4; fw.add(wheel);
        for (const zz of [-1.5, 1.5]) { const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.35, 6, 48), steel); rim.position.z = zz; wheel.add(rim); }
        for (let i = 0; i < 16; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.2, R * 2, 0.2), steel); sp.rotation.z = i / 16 * Math.PI; wheel.add(sp); }
        const cabCols = [0xE10600, 0xFFB300, 0x00B8D9, 0x43A047, 0x7E57C2, 0xFF6D00];
        wheel.userData.cabins = [];
        for (let i = 0; i < 16; i++) {
            const a = i / 16 * Math.PI * 2, cab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 2.4), new THREE.MeshStandardMaterial({ color: cabCols[i % cabCols.length] }));
            cab.position.set(Math.cos(a) * R, Math.sin(a) * R - 1, 0); wheel.add(cab); wheel.userData.cabins.push([cab, a]);
        }
        for (const side of [-1, 1]) for (const lean of [-1, 1]) {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.7, R + 7, 0.7), steel);
            leg.position.set(lean * 6, (R + 4) / 2, side * 3); leg.rotation.z = lean * 0.3; fw.add(leg);
        }
        fw.traverse(o => { if (o.isMesh) o.castShadow = true; });
        fw.position.set(best.x, 0, best.z); fw.rotation.y = Math.atan2(best.x - start.x, best.z - start.z); ctx.group.add(fw);
    }
    gravel(ctx); tyreWalls(ctx); adBoards(ctx, 65); marshalPosts(ctx, 300);
    ctx.avoid = (x, z) => best && Math.hypot(x - best.x, z - best.z) < 35;
    trees(ctx, 1400, 10);
    return { update(dt) {
        if (!wheel) return;
        wheel.rotation.z += dt * 0.08;
        for (const [cab] of wheel.userData.cabins) cab.rotation.z = -wheel.rotation.z;   // cabins stay upright
    } };
}

// =====================================================================
//  COASTLINE: an island with cliffs, the sea, a lighthouse
// =====================================================================
function coast(ctx) {
    const { samples, N, HW, RUNOFF } = ctx;
    // island outline: furthest track point in each direction from the middle, plus a margin
    let cx = 0, cz = 0; samples.forEach(s => { cx += s.p.x; cz += s.p.z; }); cx /= N; cz /= N;
    const SEG = 96, rad = new Array(SEG).fill(0);
    samples.forEach(s => { const a = Math.atan2(s.p.z - cz, s.p.x - cx), k = Math.floor(((a + Math.PI) / (Math.PI * 2)) * SEG) % SEG, r = Math.hypot(s.p.x - cx, s.p.z - cz);
        for (let j = -3; j <= 3; j++) { const kk = (k + j + SEG) % SEG; rad[kk] = Math.max(rad[kk], r); } });
    const outline = rad.map((r, k) => { const a = k / SEG * Math.PI * 2 - Math.PI, rr = r + 38 + 12 * Math.sin(k * 0.7) + 6 * Math.sin(k * 2.3); return [cx + Math.cos(a) * rr, cz + Math.sin(a) * rr]; });
    // grass top (with texture) as a flat shape
    const shape = new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x, -z)));
    const top = new THREE.Mesh(new THREE.ShapeGeometry(shape, 4), photoMat('leafy_grass', 1 / 9, 1 / 9, GRASS_TINT));
    top.rotation.x = -Math.PI / 2; top.position.y = -0.02; top.receiveShadow = true; ctx.group.add(top);
    // a sandy beach band and rocky cliffs down to the sea
    const pos = [], col = [], idx = [], rock = new THREE.Color(0x9b8a76), sandC = new THREE.Color(0xe3cf9a);
    outline.forEach(([x, z], k) => {
        const dx = x - cx, dz = z - cz, l = Math.hypot(dx, dz), ux = dx / l, uz = dz / l, drop = 1.6 + 0.6 * Math.sin(k * 1.3);
        pos.push(x, -0.02, z, x + ux * 3, -drop * 0.7, z + uz * 3, x + ux * 6, -drop, z + uz * 6, x + ux * 16, -drop - 0.6, z + uz * 16);
        const r = rock.clone().offsetHSL(0, 0, rand(-0.06, 0.06)); col.push(...rock.toArray(), ...r.toArray(), ...sandC.toArray(), ...sandC.toArray());
        const b = k * 4, nb = ((k + 1) % SEG) * 4;
        for (let j = 0; j < 3; j++) idx.push(b + j, nb + j, b + j + 1, b + j + 1, nb + j, nb + j + 1);
    });
    const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); cg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); cg.setIndex(idx); cg.computeVertexNormals();
    ctx.group.add(new THREE.Mesh(cg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true, side: THREE.DoubleSide })));
    // the sea: a big shiny plane that reflects the sky, with a gentle ripple texture
    const ripple = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#1d6fa5'; x.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { x.strokeStyle = `rgba(255,255,255,${rand(0.03, 0.12)})`; x.lineWidth = 1.5; const yy = rand(0, h), xx = rand(0, w); x.beginPath(); x.moveTo(xx, yy); x.quadraticCurveTo(xx + 8, yy - 3, xx + 16, yy); x.stroke(); } });
    ripple.repeat.set(220, 220);
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(8000, 8000), new THREE.MeshStandardMaterial({ map: ripple, color: 0xffffff, metalness: 0.35, roughness: 0.18 }));
    sea.rotation.x = -Math.PI / 2; sea.position.set(cx, -1.9, cz); ctx.group.add(sea);
    // a lighthouse on the edge of the island nearest the start
    const sp = samples[0].p; let li = 0, ld = Infinity;
    outline.forEach(([x, z], k) => { const d = Math.hypot(x - sp.x, z - sp.z); if (d < ld && Math.hypot(x - sp.x, z - sp.z) > 60) { ld = d; li = k; } });
    const [lx, lz] = outline[li], lh = new THREE.Group();
    for (let i = 0; i < 6; i++) { const ring = new THREE.Mesh(new THREE.CylinderGeometry(2.6 - i * 0.2, 2.8 - i * 0.2, 3.5, 16), new THREE.MeshStandardMaterial({ color: i % 2 ? 0xE10600 : 0xF4F6F8 })); ring.position.y = 1.75 + i * 3.5; lh.add(ring); }
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 2.4, 12), new THREE.MeshStandardMaterial({ color: 0xfff6c8, emissive: 0xffe9a0, emissiveIntensity: 0.9 })); lamp.position.y = 22.2; lh.add(lamp);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.4, 12), new THREE.MeshStandardMaterial({ color: 0x16171a })); cap.position.y = 24.6; lh.add(cap);
    lh.traverse(o => { if (o.isMesh) o.castShadow = true; });
    lh.position.set(lx - (lx - cx) * 0.03, 0, lz - (lz - cz) * 0.03); ctx.group.add(lh);
    // circuit furniture and trees
    gravel(ctx); tyreWalls(ctx); adBoards(ctx, 75); marshalPosts(ctx, 320);
    grandstand(ctx, 70, -(HW + RUNOFF + 4), 70, 7); grandstand(ctx, 150, HW + RUNOFF + 4, 60, 6);
    ctx.avoid = (x, z) => { const a = Math.atan2(z - cz, x - cx), k = Math.floor(((a + Math.PI) / (Math.PI * 2)) * SEG) % SEG; const [ox, oz] = outline[k]; return Math.hypot(x - cx, z - cz) > Math.hypot(ox - cx, oz - cz) - 8; };
    trees(ctx, 260, 9);
    return { cx, cz };
}

// =====================================================================
//  CITY EXTRAS: parked cars, trees along the pavement, shop awnings
// =====================================================================
function cityExtras(ctx) {
    const { samples, N, trackLen, HW, RUNOFF, pathAt, nearTrack } = ctx;
    const curb = HW + RUNOFF + 4.5;
    // parked cars: a body and a cabin each, instanced, in many colours
    const spots = [];
    for (let d = 8; d < trackLen; d += 7.5) for (const side of [1, -1]) {
        if (Math.random() < 0.35) continue;
        const i = Math.floor(d / trackLen * N); if (Math.abs(samples[i].ks) > 0.003) continue;
        const p = pathAt(d, side * curb, 0); if (nearTrack(p.x, p.z) < curb - 0.5) continue;
        spots.push([p, side]);
    }
    const body = new THREE.InstancedMesh(new THREE.BoxGeometry(4.2, 0.8, 1.8), new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.4 }), spots.length);
    const cabin = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, 0.6, 1.6), new THREE.MeshStandardMaterial({ color: 0x1a2028, roughness: 0.15, metalness: 0.5 }), spots.length);
    const wheels = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.34, 0.34, 1.86, 10), new THREE.MeshStandardMaterial({ color: 0x111111 }), spots.length * 2);
    const carCols = [0xc0392b, 0x2c3e50, 0xecf0f1, 0x7f8c8d, 0x2980b9, 0xf1c40f, 0x16a085, 0x8e44ad, 0x34495e, 0xd35400].map(c => new THREE.Color(c));
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1);
    spots.forEach(([p, side], i) => {
        q.setFromAxisAngle(up, p.heading);
        body.setMatrixAt(i, m.compose(new THREE.Vector3(p.x, 0.75, p.z), q, one)); body.setColorAt(i, carCols[Math.floor(Math.random() * carCols.length)]);
        const off = new THREE.Vector3(-0.2, 0, 0).applyQuaternion(q);
        cabin.setMatrixAt(i, m.compose(new THREE.Vector3(p.x + off.x, 1.45, p.z + off.z), q, one));
        for (const [w, dx] of [[0, 1.35], [1, -1.35]]) {
            const o = new THREE.Vector3(dx, 0, 0).applyQuaternion(q), wq = q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2));
            wheels.setMatrixAt(i * 2 + w, m.compose(new THREE.Vector3(p.x + o.x, 0.34, p.z + o.z), wq, one));
        }
    });
    [body, cabin, wheels].forEach(o => { o.castShadow = true; ctx.group.add(o); });
    // pavement trees
    const tspots = [];
    for (let d = 14; d < trackLen; d += 26) for (const side of [1, -1]) {
        const p = pathAt(d, side * (curb + 3), 0); if (nearTrack(p.x, p.z) < curb + 2) continue; tspots.push(p);
    }
    const tops = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.2, 0), new THREE.MeshStandardMaterial({ color: 0x3f7d34, flatShading: true }), tspots.length);
    const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.24, 3, 6), new THREE.MeshStandardMaterial({ color: 0x5b3a1e }), tspots.length);
    tspots.forEach((p, i) => { m.makeTranslation(p.x, 1.5, p.z); trunks.setMatrixAt(i, m); m.makeScale(1, rand(0.9, 1.25), 1).setPosition(p.x, 4.2, p.z); tops.setMatrixAt(i, m); });
    [tops, trunks].forEach(o => { o.castShadow = true; ctx.group.add(o); });
}

// =====================================================================
//  ENTRY POINT: called once a track's road has been built
// =====================================================================
export function decorate(ctx) {
    if (ctx.theme === 'forest') return leMans(ctx);
    if (ctx.theme === 'coast') { coast(ctx); return { update() {} }; }
    cityExtras(ctx);
    hills(ctx, THEMES.city.hills, 90);
    return { update() {} };
}
// Tyre marks: two dark lines along the racing line through each corner
export function tyreMarks(ctx) {
    const { samples, pathAt } = ctx, pos = [], idx = [];
    for (const ci of cornerList(ctx)) for (const tyre of [-0.85, 0.85]) {
        const d0 = samples[ci].d - 40, steps = 40, base = pos.length / 3;
        for (let k = 0; k <= steps; k++) {
            const d = d0 + k * 2, a = pathAt(d, tyre - 0.15, 0.9), b = pathAt(d, tyre + 0.15, 0.9);
            pos.push(a.x, 0.03, a.z, b.x, 0.03, b.z);
            if (k < steps) { const q = base + k * 2; idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); }
        }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x0b0b0c, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide }));
    mesh.renderOrder = 1; ctx.group.add(mesh);
}
