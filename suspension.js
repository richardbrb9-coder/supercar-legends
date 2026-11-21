// Supercar Legends: suspension for the race cars. The car's body rides on four springs: it dips its nose when braking,
// squats when accelerating, leans out of corners and bounces over kerbs and grass, while the wheels stay on the road.
// It is worked out from how each car's speed and direction change, so it works the same for you, the rivals and replays.
// It only changes how the cars look: the driving is exactly the same.
// The player's car also gets the real parts you can see through the wheels and under the car: wishbones, coil springs
// and dampers, which move with each wheel.
import * as THREE from './lib/three.module.min.js';

const PIVOT_Y = 0.45;                         // the body leans around a point about this high (roughly its centre of weight)
// springiness: how fast the body settles (rad/s) and how much it is damped (1 = no bounce)
const PITCH = { w: 8.5, z: 0.5, k: 0.0042, max: 0.045 };   // per m/s² of speeding up / slowing down
const ROLL = { w: 9.5, z: 0.45, k: 0.0034, max: 0.055 };      // per m/s² of cornering
const HEAVE = { w: 13, z: 0.42 };

// Split a race car into the body (on springs) and the wheels, and add the suspension parts if asked.
export function fitSuspension(racer, parts = false) {
    const g = racer.model.group, wheels = racer.model.wheels;
    const sprung = new THREE.Group(); sprung.name = 'sprung';
    for (const c of [...g.children]) if (!wheels.includes(c)) sprung.add(c);
    g.add(sprung);
    const R = racer.design.wheel;
    const s = { sprung, pitch: 0, pitchV: 0, roll: 0, rollV: 0, heave: 0, heaveV: 0, lastV: 0, lastH: null, accel: 0, lat: 0,
        bumps: wheels.map(() => 0), heat: 0, corners: [], R };
    if (parts) s.corners = wheels.map(w => buildCorner(g, w, racer.model.mats, R));
    racer.susp = s;
    return s;
}

// a thin beam from a to b (in the corner's flat frame), merged into one geometry with others
function beamGeo(a, b, t) {
    const d = new THREE.Vector3().subVectors(b, a), len = d.length();
    const geo = new THREE.BoxGeometry(t, t, len);
    const m = new THREE.Matrix4().lookAt(new THREE.Vector3(), d, new THREE.Vector3(0, 1, 0));
    m.setPosition(new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5));
    return geo.applyMatrix4(m);
}
function mergeGeos(list) {
    const total = list.reduce((n, x) => n + (x.index ? x.index.count : x.attributes.position.count), 0), pos = new Float32Array(total * 3), nor = new Float32Array(total * 3);
    let o = 0;
    for (let x of list) { if (x.index) x = x.toNonIndexed(); pos.set(x.attributes.position.array, o); nor.set(x.attributes.normal.array, o); o += x.attributes.position.array.length; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); return g;
}
// An A-shaped wishbone, pointing along +z, length 1 (it is stretched to fit each frame): two pivots on the body, one at the wheel
function wishboneGeo(spread) {
    const t = 0.026;
    return mergeGeos([beamGeo(new THREE.Vector3(-spread, 0, 0), new THREE.Vector3(0, 0, 1), t), beamGeo(new THREE.Vector3(spread, 0, 0), new THREE.Vector3(0, 0, 1), t),
        new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8).rotateZ(Math.PI / 2).translate(-spread, 0, 0), new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8).rotateZ(Math.PI / 2).translate(spread, 0, 0)]);
}
// A coil spring along +y, height 1 (stretched as it squashes)
function coilGeo(r, turns) {
    const pts = []; const n = turns * 14;
    for (let i = 0; i <= n; i++) { const a = (i / 14) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, i / n, Math.sin(a) * r)); }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n, 0.009, 5, false);
}
let SHARED = null;
function shared() {
    if (SHARED) return SHARED;
    SHARED = {
        arm: wishboneGeo(0.16), coil: coilGeo(0.042, 6),
        damper: new THREE.CylinderGeometry(0.022, 0.022, 1, 10).translate(0, 0.5, 0),
        rod: new THREE.CylinderGeometry(0.009, 0.009, 1, 6).translate(0, 0.5, 0),
        upright: new THREE.BoxGeometry(0.07, 0.3, 0.05),
        metal: new THREE.MeshStandardMaterial({ color: 0x3a3e46, metalness: 0.75, roughness: 0.38 }),
        black: new THREE.MeshStandardMaterial({ color: 0x15171b, metalness: 0.3, roughness: 0.55 }),
        rodMat: new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.12 })
    };
    for (const v of Object.values(SHARED)) if (v.isBufferGeometry) v.userData.shared = true;   // (kept when a car is thrown away)
    return SHARED;
}
// The parts at one corner: they live on the car (not on the body), so each frame they're stretched between the
// body's mounting points and the wheel
function buildCorner(g, wheel, mats, R) {
    const S = shared(), side = wheel.userData.side, x = wheel.position.x, zo = wheel.position.z - side * 0.13, zi = wheel.position.z - side * 0.5;
    const mk = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.castShadow = false; m.frustumCulled = false; g.add(m); return m; };
    const springMat = mats.caliper;                            // springs painted the same colour as the brake callipers
    return {
        side, x, zo, zi, wheel,
        lower: mk(S.arm, S.metal), upper: mk(S.arm, S.metal), coil: mk(S.coil, springMat), damper: mk(S.damper, S.black), rod: mk(S.rod, S.rodMat), upright: mk(S.upright, S.metal),
        // heights at rest (y up from the ground)
        lo: R - 0.13, li: R - 0.1, uo: R + 0.12, ui: R + 0.15, top: R + 0.44
    };
}
// stretch a part (whose length runs along +z, or +y for springs) from point a to point b, keeping it square to the car's length
function stretchZ(m, x, ay, az, by, bz) {
    const dy = by - ay, dz = bz - az, len = Math.hypot(dy, dz);
    m.position.set(x, ay, az); m.rotation.set(Math.atan2(-dy, dz), 0, 0); m.scale.set(1, 1, len);
}
function stretchY(m, x, ay, az, by, bz) {
    const dy = by - ay, dz = bz - az, len = Math.hypot(dy, dz);
    m.position.set(x, ay, az); m.rotation.set(Math.atan2(dz, dy), 0, 0); m.scale.set(1, len, 1);
}
function spring(st, P, target, dt, key) {
    // a damped spring towards the target (pitch, roll or heave)
    const v = key + 'V', a = P.w * P.w * (target - st[key]) - 2 * P.z * P.w * st[v];
    st[v] += a * dt; st[key] += st[v] * dt;
}

// Each frame. road(wx, wz) gives the height of the ground under a wheel (kerbs and grass are bumpy).
export function updateSuspension(r, dt, road) {
    const s = r.susp; if (!s || dt <= 0) return;
    // how hard the car is speeding up or slowing down, and cornering (smoothed a little, since replays are only 10 a second)
    let dh = s.lastH == null ? 0 : r.heading - s.lastH; while (dh > Math.PI) dh -= Math.PI * 2; while (dh < -Math.PI) dh += Math.PI * 2;
    const acc = (r.v - s.lastV) / dt, lat = (dh / dt) * r.v;
    s.lastV = r.v; s.lastH = r.heading;
    const k = Math.min(1, dt * 12);
    s.accel += (Math.max(-30, Math.min(30, acc)) - s.accel) * k; s.lat += (Math.max(-30, Math.min(30, lat)) - s.lat) * k;
    const clamp = (v, m) => Math.max(-m, Math.min(m, v));
    // the nose rises under power and dips under braking; the body leans out of the corner
    // (never so far that the nose or tail would touch the road)
    const pMax = Math.min(PITCH.max, (r.design.ride || 0.1) * 0.75 / (r.design.L / 2));
    spring(s, PITCH, clamp(s.accel * PITCH.k, pMax), dt, 'pitch');
    spring(s, ROLL, clamp(s.lat * ROLL.k, ROLL.max), dt, 'roll');
    // bumps under each wheel, from the road
    const w = r.model.wheels, c = Math.cos(r.heading), sn = Math.sin(r.heading);
    let sum = 0, front = 0, rear = 0, left = 0, right = 0;
    for (let i = 0; i < w.length; i++) {
        const lx = w[i].position.x, lz = w[i].userData.side * Math.abs(w[i].position.z);
        const wx = r.x + lx * c + lz * sn, wz = r.z - lx * sn + lz * c;       // the wheel's place on the ground
        const h = road ? road(wx, wz, r) : 0;
        s.bumps[i] += (h - s.bumps[i]) * Math.min(1, dt * 40);
        w[i].position.y = s.R + s.bumps[i];
        sum += s.bumps[i];
        if (w[i].userData.front) front += s.bumps[i]; else rear += s.bumps[i];
        if (w[i].userData.side > 0) right += s.bumps[i]; else left += s.bumps[i];
    }
    // the body follows the bumps through the springs (softened), and tips over them
    spring(s, HEAVE, sum / w.length * 0.6, dt, 'heave');
    const L = r.design.L * 0.6, W = r.design.W * 0.85;
    const pitch = clamp(s.pitch + (front - rear) / 2 / L * 0.6, pMax * 1.2), roll = clamp(s.roll - (right - left) / 2 / W * 0.6, ROLL.max * 1.2);
    // turn and lift the body around its pivot
    const sp = s.sprung;
    sp.rotation.set(roll, 0, pitch);
    const cy = PIVOT_Y;
    // keep the pivot where it was: position = pivot - rotated(pivot), plus the rise and fall
    sp.position.set(cy * Math.sin(pitch), s.heave + cy - cy * Math.cos(pitch) * Math.cos(roll), -cy * Math.sin(roll));
    // brakes glow when you brake hard from speed, and cool down slowly
    if (s.accel < -7 && r.v > 15) s.heat = Math.min(1, s.heat + dt * (-s.accel - 7) * 0.045);
    else s.heat = Math.max(0, s.heat - dt * 0.16);
    const bm = r.model.mats.brake; if (bm && bm.emissive) bm.emissiveIntensity = s.heat * s.heat * 3.2;
    // brake lights: brighter while the car is slowing down hard (so you can see the car in front braking)
    const tl = r.model.mats.tail;
    if (tl) { if (s.tailBase == null) s.tailBase = tl.emissiveIntensity; const want = s.accel < -4 && r.v > 2 ? 3.2 : 1; s.tailK = (s.tailK || 1) + (want - (s.tailK || 1)) * Math.min(1, dt * 14); tl.emissiveIntensity = s.tailBase * s.tailK; }
    // the spinning wheels blur into a soft disc at speed
    const blur = r.model.mats.spinBlur; if (blur) { blur.opacity = Math.max(0, Math.min(0.5, (Math.abs(r.v) - 9) / 45)); blur.visible = blur.opacity > 0.02; }
    // the suspension parts follow
    for (const q of s.corners) {
        const wx = q.x, bodyDy = s.heave + q.x * pitch - q.side * Math.abs(q.zi) * roll, wheelDy = q.wheel.position.y - s.R;
        stretchZ(q.lower, wx, q.li + bodyDy, q.zi, q.lo + wheelDy, q.zo);
        stretchZ(q.upper, wx, q.ui + bodyDy, q.zi, q.uo + wheelDy, q.zo);
        // the coil-over runs from the outer end of the lower wishbone up to a mount on the body
        const by = q.lo + wheelDy + 0.02, bz = q.zo - q.side * 0.08, ty = q.top + bodyDy, tz = q.zi + q.side * 0.08;
        stretchY(q.coil, wx, by + 0.06, bz, ty - 0.03, tz);
        stretchY(q.damper, wx, by, bz, by + (ty - by) * 0.5, bz + (tz - bz) * 0.5);
        stretchY(q.rod, wx, by, bz, ty, tz);
        q.upright.position.set(wx, (q.lo + q.uo) / 2 + wheelDy, q.zo + q.side * 0.02);
        q.upright.rotation.set(0, q.wheel.userData.front ? (q.wheel.rotation.y - (q.side < 0 ? Math.PI : 0)) : 0, 0);
    }
}
// a sudden jolt (hitting a barrier or another car)
export function jolt(r, amount) { const s = r.susp; if (s) { s.heaveV += amount; s.rollV += (Math.random() - 0.5) * amount * 2; } }
