// Supercar Legends: the view from the driver's seat. A cockpit built around the driver's eye, fitted to the shape of the car
// you designed: dashboard, working dials, a steering wheel that turns, the window pillars, roof lining, door tops and mirrors.
// Three styles: classic (60s and 70s), 90s, and modern. Everything is in the car's own space (x forward, y up, z to the right),
// so it moves with the car. The car's own cabin shell is hidden while you're inside it; its bonnet stays, seen through the glass.
import * as THREE from './lib/three.module.min.js';
import { carFrame, lerp } from './carmodel.js';

export const COCKPIT_STYLE = { gt60: 'classic', wedge70: 'classic', super90: 'nineties' };   // everything else is 'modern'

function canvasTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
// a beam (box) from point a to point b
function beam(a, b, t, mat, w = t) {
    const d = new THREE.Vector3().subVectors(b, a), m = new THREE.Mesh(new THREE.BoxGeometry(w, d.length(), t), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
}
// dial angles: 0 at bottom-left, full scale at bottom-right, sweeping clockwise over the top
const dialAngle = t => Math.PI * 1.25 - Math.max(0, Math.min(1, t)) * Math.PI * 1.5;
function dialFace(style, label, max, step, red) {
    return canvasTex(256, 256, (x, w) => {
        const c = w / 2, R = w * 0.47;
        const face = { classic: '#efe6cf', nineties: '#101114', modern: '#0b0c0f' }[style], ink = style === 'classic' ? '#1a1a1a' : '#f2f2f2';
        x.fillStyle = face; x.beginPath(); x.arc(c, c, R, 0, Math.PI * 2); x.fill();
        if (red) { x.strokeStyle = '#e10600'; x.lineWidth = 10; x.beginPath(); x.arc(c, c, R * 0.86, -(dialAngle(red)), -(dialAngle(1)), false); x.stroke(); }
        x.strokeStyle = ink; x.fillStyle = ink; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.font = `700 ${w * 0.075}px ${style === 'classic' ? 'Georgia, serif' : '"Exo 2", Arial, sans-serif'}`;
        for (let v = 0; v <= max + 1e-6; v += step / 2) {
            const a = dialAngle(v / max), major = Math.abs((v / step) - Math.round(v / step)) < 1e-6, r0 = major ? R * 0.78 : R * 0.84;
            x.lineWidth = major ? 4 : 2; x.beginPath(); x.moveTo(c + Math.cos(a) * r0, c - Math.sin(a) * r0); x.lineTo(c + Math.cos(a) * R * 0.92, c - Math.sin(a) * R * 0.92); x.stroke();
            if (major) x.fillText(String(Math.round(v)), c + Math.cos(a) * R * 0.62, c - Math.sin(a) * R * 0.62);
        }
        x.font = `600 ${w * 0.06}px "Exo 2", Arial, sans-serif`; x.fillText(label, c, c + R * 0.42);
    });
}
function carbonTex() {
    return canvasTex(128, 128, (x, w) => {
        for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = (i + j) % 2 ? '#1c1e22' : '#121316'; x.fillRect(i * 16, j * 16, 16, 16); x.fillStyle = 'rgba(255,255,255,0.05)'; x.fillRect(i * 16, j * 16, 16, 3); }
    });
}
function woodTex() {
    return canvasTex(256, 64, (x, w, h) => {
        x.fillStyle = '#6b3a1c'; x.fillRect(0, 0, w, h);
        for (let i = 0; i < 40; i++) { x.strokeStyle = `rgba(${40 + Math.random() * 40},${18 + Math.random() * 15},6,0.5)`; x.lineWidth = 1 + Math.random() * 2; x.beginPath(); const y = Math.random() * h; x.moveTo(0, y); x.bezierCurveTo(w * 0.3, y + 6, w * 0.6, y - 6, w, y + 2); x.stroke(); }
    });
}

export function buildCockpit(design, units = 'mph') {
    const { pr, X } = carFrame(design), q = pr.q, style = COCKPIT_STYLE[design.preset] || 'modern', L = design.L;
    const g = new THREE.Group();
    // where the driver sits: behind the top of the windscreen, under the roof; the 90s supercar has a centre seat
    const sEye = Math.min(pr.c1 - 0.05, Math.max(pr.rakeEnd + 0.3 / L, pr.c0 + 0.38 * (pr.c1 - pr.c0)));
    const xe = X(sEye), ye = pr.roof(sEye) - 0.12, ze = design.preset === 'super90' ? 0 : -pr.width(sEye) * q.cabinWB * 0.3;
    const eye = new THREE.Vector3(xe, ye, ze);
    // the windscreen: its base on the bonnet line, its top where the roof begins
    const xWS = X(pr.c0 + 0.01), yWS = pr.roof(pr.c0 + 0.01), xTop = X(pr.rakeEnd), yRoof = pr.roof(pr.rakeEnd) - 0.03;
    const hb = pr.width(pr.c0) * q.cabinWB * 0.97, ht = pr.width(pr.rakeEnd) * q.cabinWT * 0.98;
    const mats = {
        trim: new THREE.MeshStandardMaterial({ color: style === 'modern' ? 0xffffff : 0x17181b, map: style === 'modern' ? carbonTex() : null, roughness: 0.75 }),
        soft: new THREE.MeshStandardMaterial({ color: style === 'classic' ? 0x3a2418 : 0x24262b, roughness: 0.9 }),
        liner: new THREE.MeshBasicMaterial({ color: style === 'classic' ? 0x4d463a : 0x1a1b1f, side: THREE.DoubleSide }),   // not lit by the grass below
        tub: new THREE.MeshBasicMaterial({ color: 0x0d0e10, side: THREE.DoubleSide }),
        metal: new THREE.MeshStandardMaterial({ color: style === 'nineties' ? 0xb8bcc4 : 0xffffff, metalness: 1, roughness: style === 'nineties' ? 0.35 : 0.12 }),
        wood: new THREE.MeshStandardMaterial({ map: woodTex(), roughness: 0.35 }),
        paint: new THREE.MeshStandardMaterial({ color: design.paint, metalness: 0.4, roughness: 0.35 }),
        glass: new THREE.MeshPhysicalMaterial({ color: 0xbfd6e6, transparent: true, opacity: 0.07, roughness: 0.05, metalness: 0, depthWrite: false, side: THREE.DoubleSide }),
        mirror: new THREE.MeshBasicMaterial({ color: 0x9aa6b2 }),   // shows the view behind once the race gives it a picture (setMirror)
        accent: new THREE.MeshStandardMaterial({ color: design.stripeColour && design.stripeColour !== design.paint ? design.stripeColour : '#E10600', roughness: 0.5 })
    };
    // dashboard: a shaped slab right across the car, from the bottom of the windscreen back towards the driver
    const yTop = ye - 0.27, xBack = xe + 0.44;
    const prof = new THREE.Shape();
    const yFront = yWS + 0.012;   // the dash top runs right up to the bottom of the windscreen (no gap)
    prof.moveTo(xWS + 0.06, yFront); prof.lineTo(xBack + 0.06, yTop + 0.015); prof.quadraticCurveTo(xBack - 0.02, yTop, xBack - 0.03, yTop - 0.08);
    prof.lineTo(xBack + 0.05, yTop - 0.42); prof.lineTo(xWS + 0.06, yTop - 0.42); prof.closePath();
    const dashW = hb * 2;
    const dashGeo = new THREE.ExtrudeGeometry(prof, { depth: dashW, bevelEnabled: false }); dashGeo.translate(0, 0, -dashW / 2);
    g.add(new THREE.Mesh(dashGeo, mats.soft));
    if (style === 'classic') {             // a strip of polished wood across the dash face
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.07, dashW * 0.98), mats.wood); strip.position.set(xBack - 0.035, yTop - 0.13, 0); g.add(strip);
    } else {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, dashW * 0.98), mats.trim); strip.position.set(xBack - 0.035, yTop - 0.13, 0); g.add(strip);
    }
    // instruments in a hood in front of the driver
    const ix = xBack + 0.04, iy = yTop - 0.02, max = units === 'mph' ? 220 : 340;
    // a small curved hood shading the instruments
    const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.09, 24, 1, true, -Math.PI / 2, Math.PI), mats.soft);
    hood.rotation.x = Math.PI / 2; hood.scale.set(1, 1, 0.5); hood.position.set(ix + 0.03, iy + 0.06, ze); g.add(hood);
    const needles = [];
    const addDial = (dz, r, label, mx, step, red, key) => {
        const face = new THREE.Mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshBasicMaterial({ map: dialFace(style, label, mx, step, red) }));
        face.rotation.y = -Math.PI / 2; face.position.set(ix, iy, ze + dz); g.add(face);
        const bezel = new THREE.Mesh(new THREE.TorusGeometry(r * 1.03, r * 0.06, 6, 32), style === 'modern' ? mats.trim : mats.metal);
        bezel.rotation.y = Math.PI / 2; bezel.position.copy(face.position); bezel.position.x -= 0.003; g.add(bezel);
        const pivot = new THREE.Group(); pivot.rotation.y = -Math.PI / 2; pivot.position.copy(face.position); pivot.position.x -= 0.006; g.add(pivot);
        const nd = new THREE.Mesh(new THREE.BoxGeometry(r * 0.8, r * 0.05, 0.004), new THREE.MeshBasicMaterial({ color: style === 'classic' ? 0xffffff : 0xff3b1f }));
        nd.geometry.translate(r * 0.4, 0, 0); const arm = new THREE.Group(); arm.add(nd); pivot.add(arm);
        needles.push({ arm, key });
    };
    let screen = null;
    if (style === 'modern') {
        // a digital display: speed, gear and a rev bar
        const c = document.createElement('canvas'); c.width = 512; c.height = 256;
        const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
        const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.15), new THREE.MeshBasicMaterial({ map: tex }));
        sc.rotation.y = -Math.PI / 2; sc.position.set(ix, iy, ze); g.add(sc);
        screen = { c, x: c.getContext('2d'), tex, last: -1, t: 0 };
    } else {
        addDial(-0.085, 0.07, units === 'mph' ? 'MPH' : 'KM/H', max, units === 'mph' ? 40 : 60, 0, 'speed');
        addDial(0.085, 0.07, 'RPM x1000', 9, 1, 7.2 / 9, 'rpm');
    }
    // the steering wheel, on a column tilted towards the driver
    const col = new THREE.Group(); col.position.set(xe + 0.32, ye - 0.3, ze); col.rotation.z = -0.38; g.add(col);
    const spin = new THREE.Group(); col.add(spin);
    const R = style === 'nineties' ? 0.165 : 0.18;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R, style === 'classic' ? 0.012 : 0.02, 10, 40), style === 'classic' ? mats.wood : mats.soft);
    rim.rotation.y = Math.PI / 2; spin.add(rim);
    if (style === 'modern') {              // a flat-bottomed wheel with a coloured marker at the top
        const flat = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, R * 1.3), mats.soft); flat.position.set(0, -R * 0.9, 0); spin.add(flat);
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.03), mats.accent); top.position.set(-0.004, R, 0); spin.add(top);
    }
    const spokeMat = style === 'classic' ? mats.metal : mats.trim, spokes = style === 'classic' ? [0, 2.094, 4.189] : [-0.35, Math.PI + 0.35, Math.PI * 1.5];
    for (const a of spokes) { const sp = beam(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, Math.sin(a + Math.PI / 2) * R, Math.cos(a + Math.PI / 2) * R), style === 'classic' ? 0.01 : 0.025, spokeMat, 0.012); spin.add(sp); }
    const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.04, 20), style === 'classic' ? mats.metal : mats.soft); boss.rotation.z = Math.PI / 2; spin.add(boss);
    col.add(beam(new THREE.Vector3(0.02, 0, 0), new THREE.Vector3(0.3, 0, 0), 0.05, mats.soft));
    // the inside of the car: a dark floor and side panels from the dashboard back behind the driver (they hide the body shell)
    const yBelt0 = pr.topAt(sEye, q.cabinWB) + 0.02, xRear = xe - 1.0, floorY = Math.min(yTop - 0.45, ye - 0.75);
    const floor = new THREE.Mesh(new THREE.BoxGeometry(xBack - xRear, 0.02, hb * 2), mats.tub); floor.position.set((xBack + xRear) / 2, floorY, 0); g.add(floor);
    for (const sd of [1, -1]) {
        const side = new THREE.Mesh(new THREE.BoxGeometry(xWS - xRear, yBelt0 - floorY, 0.02), mats.tub); side.position.set((xWS + xRear) / 2, (yBelt0 + floorY) / 2, sd * hb); g.add(side);
    }
    const bulk = new THREE.Mesh(new THREE.BoxGeometry(0.02, Math.max(0.1, yRoof - floorY), hb * 2), mats.tub); bulk.position.set(xRear, (yRoof + floorY) / 2, 0); g.add(bulk);
    // window pillars, the frame along the top of the windscreen, and the roof lining over the driver
    const pillarT = style === 'classic' ? 0.035 : 0.045;
    for (const sd of [1, -1]) {
        g.add(beam(new THREE.Vector3(xWS, yWS, sd * hb), new THREE.Vector3(xTop, yRoof, sd * ht), pillarT, mats.trim, pillarT * 1.2));
        // the door top and door panel, below the side window
        const yBelt = pr.topAt(sEye, q.cabinWB) + 0.02, door = new THREE.Mesh(new THREE.BoxGeometry(xWS - (xe - 0.9), 0.32, 0.06), mats.soft);
        door.position.set((xWS + xe - 0.9) / 2, yBelt - 0.16, sd * (hb + 0.01)); g.add(door);
        const sill = new THREE.Mesh(new THREE.BoxGeometry(xWS - (xe - 0.9), 0.035, 0.1), style === 'classic' ? mats.wood : mats.trim);
        sill.position.set(door.position.x, yBelt, sd * (hb - 0.02)); g.add(sill);
        // a door mirror outside the bottom of each pillar
        const arm = beam(new THREE.Vector3(xWS - 0.08, yWS + 0.02, sd * hb), new THREE.Vector3(xWS - 0.1, yWS + 0.06, sd * (hb + 0.14)), 0.02, mats.paint); g.add(arm);
        const mh = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), mats.paint); mh.scale.set(0.05, 0.055, 0.1); mh.position.set(xWS - 0.08, yWS + 0.08, sd * (hb + 0.2)); g.add(mh);
        const mg = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.09), mats.mirror); mg.rotation.y = -Math.PI / 2 + sd * 0.25; mg.position.set(xWS - 0.13, yWS + 0.08, sd * (hb + 0.2)); g.add(mg);
    }
    g.add(beam(new THREE.Vector3(xTop, yRoof, -ht), new THREE.Vector3(xTop, yRoof, ht), 0.05, mats.trim, 0.09));
    const liner = new THREE.Mesh(new THREE.BoxGeometry(xTop - (xe - 0.8), 0.03, ht * 2.05), mats.liner); liner.position.set((xTop + xe - 0.8) / 2, yRoof + 0.02, 0); g.add(liner);
    // rear-view mirror hanging from the top of the windscreen
    const rv = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.042, 0.14), mats.soft); rv.position.set(xTop - 0.04, yRoof - 0.05, 0); g.add(rv);
    const rvg = new THREE.Mesh(new THREE.PlaneGeometry(0.128, 0.032), mats.mirror); rvg.rotation.y = -Math.PI / 2; rvg.position.set(xTop - 0.054, yRoof - 0.05, 0); g.add(rvg);
    // the glass itself (very faint; rain will land on it later)
    const glassGeo = new THREE.BufferGeometry();
    glassGeo.setAttribute('position', new THREE.Float32BufferAttribute([xWS, yWS, -hb, xWS, yWS, hb, xTop, yRoof, ht, xTop, yRoof, -ht], 3));
    glassGeo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2)); glassGeo.setIndex([0, 1, 2, 0, 2, 3]); glassGeo.computeVertexNormals();
    const glass = new THREE.Mesh(glassGeo, mats.glass); glass.renderOrder = 2; g.add(glass);
    // raindrops, snowflakes and the wipers are painted onto a see-through layer laid over the windscreen
    const screenRain = windscreen(glassGeo, hb, ht, Math.hypot(xTop - xWS, yRoof - yWS), style); g.add(screenRain.mesh);
    g.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });

    // per frame: steering, needles, the digital display. info: { steer, speedFrac, mph, rpm (0..1), gear }
    function update(info, dt) {
        screenRain.update(info, dt);
        spin.rotation.x = -info.steer * 2.4;
        for (const n of needles) n.arm.rotation.z = dialAngle(n.key === 'speed' ? info.speed / max : info.rpm * 8 / 9);
        if (screen) {
            screen.t += dt; if (screen.t < 0.08) return; screen.t = 0;
            const v = Math.round(info.speed); const key = v * 10 + info.gear + Math.round(info.rpm * 20) * 1000; if (key === screen.last) return; screen.last = key;
            const x = screen.x, w = screen.c.width, h = screen.c.height;
            x.fillStyle = '#07080a'; x.fillRect(0, 0, w, h);
            const bars = 24, lit = Math.round(info.rpm * bars);
            for (let i = 0; i < bars; i++) { x.fillStyle = i < lit ? (i > bars * 0.82 ? '#ff3b1f' : i > bars * 0.6 ? '#ffb300' : '#38e07b') : '#1b1d22'; x.fillRect(24 + i * 19.5, 18, 15, 30); }
            x.fillStyle = '#f4f6f8'; x.textAlign = 'center'; x.textBaseline = 'middle';
            x.font = '900 120px Orbitron, "Exo 2", Arial, sans-serif'; x.fillText(String(v), w * 0.42, h * 0.62);
            x.font = '700 30px "Exo 2", Arial, sans-serif'; x.fillText(units === 'mph' ? 'MPH' : 'KM/H', w * 0.42, h * 0.9);
            x.fillStyle = '#00e5ff'; x.font = '900 96px Orbitron, Arial, sans-serif'; x.fillText(String(info.gear), w * 0.86, h * 0.62);
            screen.tex.needsUpdate = true;
        }
    }
    function dispose() { screenRain.dispose(); g.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); }
    // the bonnet camera: just ahead of the bottom of the windscreen, looking along the bonnet
    // (for long bonnets it sits further forward, over the middle of the bonnet, so scoops and bulges don't block the view)
    // (cars with a short low bonnet get it just ahead of the windscreen, a little higher, so the bonnet stays in view)
    const short = pr.c0 < 0.33, sB = short ? pr.c0 - 0.02 : Math.max(0.12, pr.c0 * 0.8), bonnet = new THREE.Vector3(X(sB) + (short ? 0.05 : 0), pr.centre(sB) + (short ? 0.4 : 0.3), 0);
    // the mirrors show the picture from a camera looking backwards (flipped left to right, like a real mirror)
    function setMirror(tex) { const m = mats.mirror; if (m.map === tex) return; m.map = tex; m.color.set(0xffffff); m.needsUpdate = true; }
    return { group: g, eye, bonnet, style, glass, update, dispose, setMirror };
}

// The windscreen in bad weather. Measurements in metres on the glass: x across (0 = middle), y up the glass from its bottom edge.
// Drops land at random, grow a little, and at speed run up and outwards; snowflakes land and stay. Two wipers sweep side by
// side from the bottom edge and clear whatever they pass over. Drawn on a canvas about 25 times a second.
function windscreen(glassGeo, hb, ht, height, style) {
    const CW = 1024, CH = 512, c = document.createElement('canvas'); c.width = CW; c.height = CH; const x = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(glassGeo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    mesh.renderOrder = 3; mesh.visible = false;
    const halfAt = y => lerp(hb, ht, y / height);                       // the glass narrows towards the top
    const toPx = (px, py) => [(px / halfAt(py) * 0.5 + 0.5) * CW, (1 - py / height) * CH];
    const drops = [], R = Math.min(hb, ht) * 0.95, pivots = [-hb * 0.42, hb * 0.18];   // wiper length and pivot points (offset like a real car)
    let t = 0, paint = 0, wipe = 0, weather = 'sunny', prevAngle = 0;
    // wiper angle: 0 lying flat along the bottom, up to ~105 degrees, out and back
    const wiperAngle = s => { const k = (s % 1); return (k < 0.5 ? k * 2 : 2 - k * 2); };
    function update(info, dt) {
        weather = info.weather || 'sunny';
        const wet = weather === 'rain', snow = weather === 'snow';
        if (!wet && !snow && drops.length === 0) { mesh.visible = false; return; }
        mesh.visible = true; t += dt;
        const mps = info.mps || 0;
        // new drops: more when it's raining hard and you're moving into the rain
        const rate = wet ? 26 + mps * 2.2 : snow ? 9 + mps * 0.5 : 0;
        for (let n = Math.floor(rate * dt + Math.random()); n > 0; n--) {
            const py = Math.random() * height, w = halfAt(py);
            drops.push({ x: (Math.random() * 2 - 1) * w, y: py, r: snow ? 0.007 + Math.random() * 0.012 : 0.007 + Math.random() * 0.012, snow, a: 0.55 + Math.random() * 0.4, run: 0 });
        }
        // at speed the air pushes raindrops up the glass and out to the sides (snow sticks)
        const push = Math.max(0, mps - 7) * 0.02;
        for (const d of drops) if (!d.snow) { d.y += push * dt * (0.6 + d.r * 80); d.x += d.x * push * dt * 0.5; if (push > 0.05) d.run = Math.min(0.06, d.run + push * dt * 0.4); }
        // the wipers: faster in rain than snow; the blades clear what they sweep across
        const period = wet ? 1.15 : 1.6; wipe += dt / period;
        const ang = wiperAngle(wipe) * 1.83, a0 = Math.min(prevAngle, ang), a1 = Math.max(prevAngle, ang) + 0.02; prevAngle = ang;
        for (let i = drops.length - 1; i >= 0; i--) {
            const d = drops[i];
            if (d.y > height || Math.abs(d.x) > halfAt(Math.min(height, d.y)) * 1.02) { drops.splice(i, 1); continue; }
            for (const px of pivots) {
                const dx = d.x - px, r = Math.hypot(dx, d.y); if (r > R || r < 0.04) continue;
                const a = Math.atan2(d.y, -dx);                          // the blades sweep from the right-hand side round to the left
                if (a >= a0 - 0.03 && a <= a1 + 0.03) { drops.splice(i, 1); break; }
            }
        }
        if (drops.length > 700) drops.splice(0, drops.length - 700);
        paint += dt; if (paint < 0.04) return; paint = 0;
        x.clearRect(0, 0, CW, CH);
        for (const d of drops) {
            const [cx, cy] = toPx(d.x, d.y), rx = d.r / halfAt(d.y) * 0.5 * CW, ry = d.r / height * CH;
            if (d.snow) { x.fillStyle = `rgba(250,252,255,${d.a})`; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); x.fill(); continue; }
            if (d.run > 0.005) { x.strokeStyle = `rgba(200,215,230,${d.a * 0.35})`; x.lineWidth = Math.max(1, rx * 0.7); x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx - (d.x * 0.3) / halfAt(d.y) * CW * 0.2, cy + d.run / height * CH); x.stroke(); }
            const gr = x.createRadialGradient(cx - rx * 0.3, cy - ry * 0.3, 0, cx, cy, Math.max(rx, ry));
            gr.addColorStop(0, `rgba(255,255,255,${d.a})`); gr.addColorStop(0.35, `rgba(215,225,238,${d.a * 0.55})`); gr.addColorStop(0.8, `rgba(120,135,155,${d.a * 0.5})`); gr.addColorStop(1, `rgba(20,26,36,${d.a * 0.7})`);
            x.fillStyle = gr; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); x.fill();
        }
        // the wiper blades and arms
        for (const px of pivots) {
            const ex = px - Math.cos(ang) * R, ey = Math.sin(ang) * R;
            const [ax, ay] = toPx(px, 0.01), [bx, by] = toPx(ex, ey), [mx, my] = toPx(px - Math.cos(ang) * R * 0.15, Math.sin(ang) * R * 0.15);
            x.strokeStyle = '#0b0c0e'; x.lineCap = 'round';
            x.lineWidth = 12; x.beginPath(); x.moveTo(mx, my); x.lineTo(bx, by); x.stroke();             // the rubber blade
            x.lineWidth = 7; x.beginPath(); x.moveTo(ax, ay); x.lineTo((ax + bx) / 2, (ay + by) / 2 - 3); x.stroke();   // the arm
        }
        tex.needsUpdate = true;
    }
    return { mesh, update, dispose: () => { tex.dispose(); mesh.material.dispose(); } };
}
