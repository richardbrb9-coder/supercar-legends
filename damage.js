// Supercar Legends: crash damage for the race cars. When cars bump each other (or you scrape a barrier) they pick up
// scuffs and scratches, a few small dents, and now and then a small part is knocked off and tumbles onto the track.
// IT ONLY CHANGES HOW A CAR LOOKS. Nothing here touches speed, grip, steering or any of the car's numbers.
// It is kept mild on purpose: no wrecks, no fire, no smoke. The damage builds up a little with each bump, up to a limit.
//
// How it works, for each race car:
//  - scuffs and scratches are drawn on a small see-through picture of the body, shown as a thin skin over the paint
//    (so the big paint picture is never redrawn in the middle of a race);
//  - a dent gently pushes in the points of the body near the bump (each race car has its own shape, so no other car changes);
//  - a loose part (door mirror, wing end plate, the end of the splitter: labelled 'loose' in carmodel.js and formula.js)
//    is folded away to nothing on the car, and a copy of that very part (its own shape, size and colours) bounces along
//    the road, lies there for a while and then shrinks away. The meshes for the falling pieces come from a small pool.
// Work is only done at the moment of a bump. The falling pieces are the only thing updated every frame, and only while
// one is moving. Each bump is described by a small record, so a replay can show the same damage at the same moment.
import * as THREE from './lib/three.module.min.js';

// the most damage one car can collect in a race
const MAX_SCUFFS = 14, MAX_DENTS = 6, MAX_PARTS = 2, MAX_CHIPS = 2;
const DENT_LIMIT = 0.075;                     // no point of the body ever moves further than this (metres)
const PIECES = 12, PIECE_STAYS = 8, PIECE_FADES = 1.2;   // falling pieces: how many at once, how long they lie on the road and how long they take to shrink away (seconds)
const SPLITTER_CUT = 0.85;                    // a splitter only ever loses a corner: the outer end of each half

// a small repeatable random-number maker: the same seed always gives the same scratches (so replays match the race)
function seeded(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// the smallest turn that gets an angle to the same flat position (a piece lying face up or face down looks the same)
const flat = a => a - Math.PI * Math.round(a / Math.PI);

export class Damage {
    constructor(scene) {
        this.scene = scene;
        // the pool of falling pieces, re-used all race long. A knocked-off part is shown with a copy of its own shape and
        // the car's own materials; a chip of bodywork is a small flat block in the car's paint colour.
        this.box = new THREE.BoxGeometry(1, 1, 1);
        this.pieces = [];
        for (let i = 0; i < PIECES; i++) {
            const chip = new THREE.MeshStandardMaterial({ color: 0x1b1d22, roughness: 0.4, metalness: 0.2 });
            const m = new THREE.Mesh(this.box, chip);
            m.visible = false; m.castShadow = false; m.frustumCulled = false; m.rotation.order = 'YXZ'; scene.add(m);   // (YXZ: the turn round the upright comes last, so it can lie flat whichever way it points)
            this.pieces.push({ m, chip, own: null, size: new THREE.Vector3(), vx: 0, vy: 0, vz: 0, wx: 0, wy: 0, wz: 0, life: 0, rest: false, hy: 0.02 });
        }
        this.next = 0; this.moving = false;
        this.c = new THREE.Vector3(); this.uv = [0, 0];
    }

    // Get a race car ready (call after its suspension is fitted). Nothing shows until its first bump.
    fit(racer) {
        const model = racer.model, root = racer.susp ? racer.susp.sprung : model.group, mats = model.mats;
        const meshes = []; root.traverse(o => { if (o.isMesh && o.geometry.attributes.position && o.material !== mats.spinBlur) meshes.push(o); });
        const paint = meshes.find(m => m.material === mats.paint && m.geometry.attributes.uv) || null;
        const box = new THREE.Box3(); if (paint) { paint.geometry.computeBoundingBox(); box.copy(paint.geometry.boundingBox); } else box.setFromObject(root);
        const d = { meshes, paint, box, inside: mats.interior || null, parts: [], shell: null, tex: null, ctx: null, W: 0, H: 0, scuffs: 0, dents: 0, lost: 0, chips: 0,
            mPerU: box.max.x - box.min.x, mPerV: 2 * ((box.max.z - box.min.z) + (box.max.y - box.min.y)) * 0.9 };
        // the scuff skin: the same shape as the painted body (it shares its points, so it follows every dent), with its own small picture
        if (paint) {
            const cv = document.createElement('canvas'); cv.width = racer.isPlayer ? 1024 : 512; cv.height = cv.width / 2;
            d.W = cv.width; d.H = cv.height; d.ctx = cv.getContext('2d');
            d.tex = new THREE.CanvasTexture(cv); d.tex.colorSpace = THREE.SRGBColorSpace; d.tex.anisotropy = 4;
            d.shell = new THREE.Mesh(paint.geometry, new THREE.MeshStandardMaterial({ map: d.tex, transparent: true, depthWrite: false, roughness: 0.8, metalness: 0.05,
                side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
            d.shell.castShadow = false; d.shell.visible = false; d.shell.userData.damageSkin = true; paint.parent.add(d.shell);
        }
        // the loose parts: which points of which shape belong to each one, and where it sits on the car
        const byName = {}, bb = new THREE.Box3(), v = new THREE.Vector3();
        for (const e of model.group.userData.loose || []) {
            const pos = e.mesh.geometry.attributes.position; bb.makeEmpty();
            for (let i = e.start; i < e.start + e.count; i++) bb.expandByPoint(v.fromBufferAttribute(pos, i));
            if (e.name === 'splitter') {   // the splitter loses one end at a time: the points past the cut are folded back to it
                const half = bb.max.z, cut = half * SPLITTER_CUT;
                for (const side of [1, -1]) {
                    const p = byName['splitter' + (side > 0 ? 'R' : 'L')] = byName['splitter' + (side > 0 ? 'R' : 'L')] || { ranges: [], box: new THREE.Box3(), lost: false };
                    p.ranges.push({ mesh: e.mesh, start: e.start, count: e.count, clip: side, cut });
                    p.box.expandByPoint(v.set(bb.min.x, bb.min.y, side * cut)).expandByPoint(v.set(bb.max.x, bb.max.y, side * half));
                }
                continue;
            }
            const p = byName[e.name] = byName[e.name] || { ranges: [], box: new THREE.Box3(), lost: false };
            p.ranges.push({ mesh: e.mesh, start: e.start, count: e.count, clip: 0, cut: 0 }); p.box.union(bb);
        }
        for (const p of Object.values(byName)) { p.centre = p.box.getCenter(new THREE.Vector3()); p.size = p.box.getSize(new THREE.Vector3()); d.parts.push(p); }
        racer.damage = d;
        return d;
    }
    // throw away a car's damage skin (the car's own shapes are thrown away with the car)
    unfit(racer) {
        const d = racer.damage; if (!d) return;
        if (d.shell) { if (d.shell.parent) d.shell.parent.remove(d.shell); d.shell.material.dispose(); d.tex.dispose(); d.ctx.canvas.width = d.ctx.canvas.height = 0; }
        racer.damage = null;
    }
    // the objects whose drawing programs should be made ready before the race starts (so the first bump doesn't stutter)
    warmUp(racer) { return [racer.damage && racer.damage.shell, this.pieces[0].m].filter(Boolean); }   // (a knocked-off part is drawn with the car's own materials, which are ready already)

    // A bump. (lx, lz) points from the middle of the car towards what it hit, in the car's own directions (x = forwards,
    // z = to its right). sev is how hard, 0 to 1. colour is the other car's paint (it leaves a streak), or null for a barrier.
    // light = scuffs only. Returns a small record of what happened (for the replay), or null if this car has had its share.
    hit(racer, lx, lz, sev, colour, light = false) {
        const d = racer.damage; if (!d) return null;
        const len = Math.hypot(lx, lz) || 1; lx /= len; lz /= len;
        const scuff = !!d.paint && d.scuffs < MAX_SCUFFS, dent = !light && sev >= 0.35 && d.dents < MAX_DENTS;
        // now and then a harder bump knocks off the nearest loose part; if there is none nearby, a small chip of bodywork
        let part = -1;
        if (!light && sev >= 0.45 && Math.random() < 0.6) {
            this.edgePoint(d, lx, lz, 1);
            let best = 1.5;
            if (d.lost < MAX_PARTS) d.parts.forEach((p, i) => { const dist = Math.hypot(p.centre.x - this.c.x, p.centre.z - this.c.z); if (!p.lost && dist < best) { best = dist; part = i; } });
            if (part < 0 && d.chips < MAX_CHIPS) part = -2;
        }
        if (!scuff && !dent && part === -1) return null;
        const ev = { lx, lz, sev, colour, seed: (Math.random() * 4294967296) >>> 0, scuff, dent, part };
        this.apply(racer, ev, true);
        return ev;
    }
    // Carry out a bump from its record. pieces = also throw the knocked-off piece onto the road.
    apply(racer, ev, pieces) {
        const d = racer.damage; if (!d) return;
        const rnd = seeded(ev.seed), ends = Math.abs(ev.lx) > Math.abs(ev.lz);   // ends: a bump on the nose or tail (not a side)
        // where on the body: the point of the body nearest to where the bump came from, moved along a little at random so
        // that bumps from the same direction don't all land on one spot
        this.edgePoint(d, ev.lx, ev.lz, 0.96);
        if (ends) this.c.z += (rnd() - 0.5) * (d.box.max.z - d.box.min.z) * 0.5; else this.c.x += (rnd() - 0.5) * Math.min(1.4, d.mPerU * 0.3);
        const px = this.c.x, pz = this.c.z;
        if (d.paint) this.nearest(d);
        if (ev.scuff && d.paint) { this.scuff(d, this.uv[0], this.uv[1], !ends, ev.sev, ev.colour, rnd); d.scuffs++; }
        if (ev.dent) { this.dent(d, this.c, -ev.lx, -ev.lz, 0.26 + 0.2 * ev.sev, 0.02 + 0.035 * ev.sev); d.dents++; }
        if (ev.part >= 0 && d.parts[ev.part] && !d.parts[ev.part].lost) {
            const p = d.parts[ev.part]; p.lost = true; d.lost++;
            const piece = pieces ? this.takePiece() : null;
            if (piece) this.copyPart(piece, p);                 // (copied before it is folded away on the car)
            for (const r of p.ranges) this.fold(r, p.centre);
            if (piece) this.throwPiece(piece, racer, p.centre.x, p.centre.y, p.centre.z, rnd);
        }
        if (ev.part === -2) {
            d.chips++;
            if (pieces) { const piece = this.takePiece(); piece.m.material.color.set(racer.design.paint); piece.size.set(0.16, 0.02, 0.1); piece.m.scale.copy(piece.size); this.throwPiece(piece, racer, px, d.box.min.y + 0.3, pz, rnd); }
        }
    }
    // Put a car back to how it started (used when a replay begins: the damage then comes back bump by bump)
    reset(racer) {
        const d = racer.damage; if (!d) return;
        for (const m of d.meshes) {
            const keep = m.userData.pristine; if (!keep || !keep.changed) continue;
            const g = m.geometry; g.attributes.position.array.set(keep.pos); g.attributes.position.needsUpdate = true;
            if (g.attributes.normal) { g.attributes.normal.array.set(keep.nor); g.attributes.normal.needsUpdate = true; }
            keep.changed = false;
        }
        if (d.shell) { d.ctx.clearRect(0, 0, d.W, d.H); d.tex.needsUpdate = true; d.shell.visible = false; }
        for (const p of d.parts) p.lost = false;
        d.scuffs = d.dents = d.lost = d.chips = 0;
    }

    // ---- where a bump lands ----
    // the point on the edge of the car's outline (seen from above) in the direction of the bump, at about bumper height
    edgePoint(d, lx, lz, k) {
        const b = d.box, hx = lx > 0 ? b.max.x : -b.min.x, hz = lz > 0 ? b.max.z : -b.min.z;
        const t = Math.min(Math.abs(lx) > 1e-4 ? hx / Math.abs(lx) : 1e9, Math.abs(lz) > 1e-4 ? hz / Math.abs(lz) : 1e9) * k;
        this.c.set(lx * t, b.min.y + (b.max.y - b.min.y) * 0.4, lz * t);
    }
    // move this.c onto the nearest point of the painted body, and note where that is in the body's picture
    nearest(d) {
        const pos = d.paint.geometry.attributes.position.array, uv = d.paint.geometry.attributes.uv.array, cx = this.c.x, cy = this.c.y, cz = this.c.z;
        let best = 0, bd = Infinity;
        for (let i = 0, n = pos.length; i < n; i += 3) {
            const dx = pos[i] - cx, dy = pos[i + 1] - cy, dz = pos[i + 2] - cz, dd = dx * dx + dy * dy * 0.3 + dz * dz;
            if (dd < bd) { bd = dd; best = i; }
        }
        this.c.set(pos[best], pos[best + 1], pos[best + 2]);
        this.uv[0] = uv[best / 3 * 2]; this.uv[1] = uv[best / 3 * 2 + 1];
    }

    // ---- scuffs and scratches ----
    // Drawn at (u, v) in the body's picture: u runs nose to tail, v runs around the body. A soft dull smudge, then a
    // handful of thin scratches: pale (down to the primer), dark (rubber and dirt) and a streak of the other car's paint.
    scuff(d, u, v, alongCar, sev, colour, rnd) {
        const x = d.ctx, W = d.W, H = d.H, pxU = W / d.mPerU, pxV = H / d.mPerV;      // pixels per metre each way
        const cx = Math.max(0.03, Math.min(0.97, u)) * W, cy = (1 - v) * H, size = 0.16 + 0.16 * sev;
        x.save(); x.translate(cx, cy); x.scale(pxU, pxV);                              // from here on, 1 unit = 1 metre on the car
        if (!alongCar) x.rotate(Math.PI / 2);                                          // on the nose or tail the scratches run across the car
        const g = x.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, `rgba(38,38,42,${0.3 + 0.25 * sev})`); g.addColorStop(1, 'rgba(38,38,42,0)');
        x.save(); x.scale(size * 1.5, size * 0.75); x.fillStyle = g; x.beginPath(); x.arc(0, 0, 1, 0, Math.PI * 2); x.fill(); x.restore();
        x.lineCap = 'round';
        const n = 5 + Math.round(sev * 6);
        for (let i = 0; i < n; i++) {
            const r = rnd(), len = 0.1 + rnd() * (0.22 + 0.35 * sev), ox = (rnd() - 0.5) * size * 1.6, oy = (rnd() - 0.5) * size * 0.9, tilt = (rnd() - 0.5) * 0.12;
            x.strokeStyle = r < 0.42 ? 'rgba(226,226,220,0.7)' : r < 0.7 || !colour ? 'rgba(24,24,27,0.65)' : colour;
            x.lineWidth = 0.004 + rnd() * (r >= 0.7 && colour ? 0.02 : 0.008);
            x.beginPath(); x.moveTo(ox - len / 2, oy - tilt * len); x.lineTo(ox + len / 2, oy + tilt * len); x.stroke();
        }
        x.restore();
        d.tex.needsUpdate = true; d.shell.visible = true;
    }

    // ---- dents ----
    // Push the points of the body within 'radius' of 'at' a little way in the direction (dx, dz): most in the middle,
    // fading smoothly to nothing at the edge, and tilt the surface there so the light catches the dip.
    dent(d, at, dx, dz, radius, depth) {
        const r2 = radius * radius, ax = at.x, ay = at.y, az = at.z;
        for (const m of d.meshes) {
            if (m === d.shell || m.material === d.inside) continue;         // (the scuff skin shares the painted body's points; the driver and the inside of the car are never bent)
            const g = m.geometry, pos = g.attributes.position.array, nor = g.attributes.normal ? g.attributes.normal.array : null;
            let keep = m.userData.pristine, touched = false;
            for (let i = 0, n = pos.length; i < n; i += 3) {
                const qx = pos[i] - ax, qy = pos[i + 1] - ay, qz = pos[i + 2] - az, q2 = qx * qx + qy * qy + qz * qz;
                if (q2 >= r2) continue;
                if (!keep) keep = m.userData.pristine = { pos: pos.slice(), nor: nor ? nor.slice() : null, changed: true };   // remember the undamaged shape (once)
                touched = true;
                const t2 = q2 / r2, f = (1 - t2) * (1 - t2), o = keep.pos;
                let nx = pos[i] + dx * depth * f, nz = pos[i + 2] + dz * depth * f;
                // never further than the limit from where the point started
                if (Math.abs(pos[i] - o[i]) + Math.abs(pos[i + 2] - o[i + 2]) > DENT_LIMIT * 2) continue;   // (a part that has already been knocked off)
                const ex = nx - o[i], ez = nz - o[i + 2], e = Math.hypot(ex, ez);
                if (e > DENT_LIMIT) { nx = o[i] + ex * DENT_LIMIT / e; nz = o[i + 2] + ez * DENT_LIMIT / e; }
                pos[i] = nx; pos[i + 2] = nz;
                if (nor) {   // lean the surface towards the middle of the dent
                    const q = Math.sqrt(q2) || 1, k = 6 * depth / radius * Math.sqrt(t2) * (1 - t2);
                    let a = nor[i] - qx / q * k, b = nor[i + 1] - qy / q * k, c = nor[i + 2] - qz / q * k; const l = Math.hypot(a, b, c) || 1;
                    nor[i] = a / l; nor[i + 1] = b / l; nor[i + 2] = c / l;
                }
            }
            if (touched) { keep.changed = true; g.attributes.position.needsUpdate = true; if (nor) g.attributes.normal.needsUpdate = true; }
        }
    }

    // ---- loose parts ----
    // take a part off the car: fold all its points into one spot, so nothing of it is drawn (a splitter end is cut back instead)
    fold(r, centre) {
        const m = r.mesh, g = m.geometry, pos = g.attributes.position.array;
        let keep = m.userData.pristine;
        if (!keep) keep = m.userData.pristine = { pos: pos.slice(), nor: g.attributes.normal ? g.attributes.normal.array.slice() : null, changed: true };
        keep.changed = true;
        for (let i = r.start * 3, n = (r.start + r.count) * 3; i < n; i += 3) {
            if (r.clip) { if (pos[i + 2] * r.clip > r.cut) pos[i + 2] = r.cut * r.clip; }
            else { pos[i] = centre.x; pos[i + 1] = centre.y; pos[i + 2] = centre.z; }
        }
        g.attributes.position.needsUpdate = true;
    }
    // the next mesh from the pool, emptied (as a plain chip of bodywork, until copyPart gives it a part's shape)
    takePiece() {
        const p = this.pieces[this.next = (this.next + 1) % PIECES];
        this.release(p); return p;
    }
    // give a pool mesh back its plain block, and throw away the copy of a part it was showing
    release(p) {
        p.m.visible = false;
        if (p.own) { p.own.dispose(); p.own = null; }
        p.m.geometry = this.box; p.m.material = p.chip; p.m.scale.set(1, 1, 1);
    }
    // Make a pool mesh look exactly like a loose part: a copy of the part's own points (with its paint, carbon, chrome
    // and glass), centred on the part. Done once, at the moment the part comes off.
    copyPart(piece, part) {
        let n = 0; for (const r of part.ranges) n += r.count;
        const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), mats = [], g = new THREE.BufferGeometry(), cx = part.centre.x, cy = part.centre.y, cz = part.centre.z;
        let at = 0;
        for (const r of part.ranges) {
            const a = r.mesh.geometry.attributes, P = a.position.array, Nn = a.normal ? a.normal.array : null, U = a.uv ? a.uv.array : null;
            for (let i = 0; i < r.count; i++) {
                const j = (r.start + i) * 3, k = (at + i) * 3;
                let z = P[j + 2]; if (r.clip && z * r.clip < r.cut) z = r.cut * r.clip;   // (of a splitter, only the end that broke off)
                pos[k] = P[j] - cx; pos[k + 1] = P[j + 1] - cy; pos[k + 2] = z - cz;
                if (Nn) { nor[k] = Nn[j]; nor[k + 1] = Nn[j + 1]; nor[k + 2] = Nn[j + 2]; }
                if (U) { uv[(at + i) * 2] = U[(r.start + i) * 2]; uv[(at + i) * 2 + 1] = U[(r.start + i) * 2 + 1]; }
            }
            let mi = mats.indexOf(r.mesh.material); if (mi < 0) { mi = mats.length; mats.push(r.mesh.material); }
            g.addGroup(at, r.count, mi); at += r.count;
        }
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        g.computeBoundingBox(); g.boundingBox.getSize(piece.size);
        piece.own = g; piece.m.geometry = g; piece.m.material = mats; piece.m.scale.set(1, 1, 1);
    }
    // A piece comes off at (x, y, z) on the car: it pops up, carries on with some of the car's speed, bounces and tumbles,
    // lies on the road for a while and then shrinks away.
    throwPiece(p, racer, x, y, z, rnd) {
        const m = p.m, c = Math.cos(racer.heading), s = Math.sin(racer.heading);
        m.position.set(racer.x + x * c + z * s, Math.max(0.1, y), racer.z - x * s + z * c);
        m.rotation.set(rnd() * 3, racer.heading, rnd() * 3); m.visible = true;
        const out = (z >= 0 ? 1 : -1) * (0.8 + rnd() * 1.6), v = racer.v * (0.6 + rnd() * 0.25);   // (out: a little way off to the car's side)
        p.vx = c * v + s * out; p.vz = -s * v + c * out; p.vy = 3.2 + rnd() * 2.2;
        p.wx = (rnd() - 0.5) * 16; p.wy = (rnd() - 0.5) * 10; p.wz = (rnd() - 0.5) * 16;
        p.life = 0; p.rest = false; p.hy = Math.max(0.01, Math.min(p.size.x, p.size.y, p.size.z) / 2) + 0.02;   // (how high its middle sits when it lies on the road)
        this.moving = true;
    }
    // every frame (it does nothing at all unless a piece is on the road)
    update(dt) {
        if (!this.moving) return;
        let any = false;
        for (const p of this.pieces) {
            const m = p.m; if (!m.visible) continue;
            any = true; p.life += dt;
            if (!p.rest) {
                p.vy -= 16 * dt;
                m.position.x += p.vx * dt; m.position.y += p.vy * dt; m.position.z += p.vz * dt;
                m.rotation.x += p.wx * dt; m.rotation.y += p.wy * dt; m.rotation.z += p.wz * dt;
                if (m.position.y < p.hy) {
                    m.position.y = p.hy;
                    if (p.vy < -1.4) { p.vy *= -0.42; p.vx *= 0.68; p.vz *= 0.68; p.wx *= 0.6; p.wy *= 0.6; p.wz *= 0.6; }   // a bounce
                    else {   // sliding to a stop
                        p.vy = 0; const k = Math.max(0, 1 - dt * 3.5); p.vx *= k; p.vz *= k; p.wx *= k; p.wz *= k; p.wy *= k;
                        if (p.vx * p.vx + p.vz * p.vz < 0.05) p.rest = true;
                    }
                }
            } else {   // lying on the road: it tips over onto its flattest side
                const k = Math.min(1, dt * 8), S = p.size, tx = S.z < S.y && S.z <= S.x ? -Math.PI / 2 : 0, tz = S.x < S.y && S.x < S.z ? Math.PI / 2 : 0;
                m.rotation.x += flat(tx - m.rotation.x) * k; m.rotation.z += flat(tz - m.rotation.z) * k;
            }
            if (p.life > PIECE_STAYS) {   // shrink away (it uses the car's own materials, so it can't simply fade)
                const o = 1 - (p.life - PIECE_STAYS) / PIECE_FADES;
                if (o <= 0) this.release(p); else if (p.own) m.scale.setScalar(o); else m.scale.copy(p.size).multiplyScalar(o);
            }
        }
        this.moving = any;
    }
    // sweep the track (a new race, a replay starting again)
    clearPieces() { for (const p of this.pieces) this.release(p); this.moving = false; }   // (this also lets go of the old cars' materials)
}
