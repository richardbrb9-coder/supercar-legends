// Supercar Legends: speed effects for the race. Sparks, tyre smoke and dust, speed lines, camera shake.
// Everything uses small reusable pools, so nothing is created while racing and the tablet stays smooth.
import * as THREE from './lib/three.module.min.js';

function softDot(inner, outer) {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, inner); g.addColorStop(1, outer);
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
}

export class Effects {
    constructor(scene, overlay) {
        this.scene = scene;
        this.overlay = overlay; this.ctx2d = overlay.getContext('2d');
        // smoke and dust: soft sprites that grow and fade
        this.puffs = [];
        const smokeTex = softDot('rgba(255,255,255,0.9)', 'rgba(255,255,255,0)');
        for (let i = 0; i < 48; i++) {
            const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 }));
            s.visible = false; scene.add(s); this.puffs.push({ s, life: 0, max: 1, vx: 0, vy: 0, vz: 0, grow: 1 });
        }
        this.puffIdx = 0;
        // sparks: bright points with gravity
        this.SPARKS = 160;
        const g = new THREE.BufferGeometry();
        this.sparkPos = new Float32Array(this.SPARKS * 3); this.sparkVel = new Float32Array(this.SPARKS * 3); this.sparkLife = new Float32Array(this.SPARKS);
        g.setAttribute('position', new THREE.BufferAttribute(this.sparkPos, 3));
        this.sparks = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffc04a, size: 0.22, map: softDot('rgba(255,240,200,1)', 'rgba(255,140,0,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        this.sparks.frustumCulled = false; scene.add(this.sparks);
        this.sparkIdx = 0;
        for (let i = 0; i < this.SPARKS; i++) this.sparkPos[i * 3 + 1] = -100;
        // speed lines
        this.lines = Array.from({ length: 46 }, () => ({ a: Math.random() * Math.PI * 2, r: Math.random(), speed: 0.6 + Math.random() * 0.8 }));
        this.shake = 0;
        this.enabled = true;
    }
    // a burst of sparks at a point, flying away from 'dir'
    sparksAt(x, y, z, dirX, dirZ, count = 24) {
        if (!this.enabled) return;
        for (let n = 0; n < count; n++) {
            const i = this.sparkIdx = (this.sparkIdx + 1) % this.SPARKS;
            this.sparkPos.set([x, y, z], i * 3);
            const sp = 4 + Math.random() * 7, side = (Math.random() - 0.5) * 6;
            this.sparkVel.set([dirX * sp - dirZ * side, 2 + Math.random() * 4, dirZ * sp + dirX * side], i * 3);
            this.sparkLife[i] = 0.35 + Math.random() * 0.4;
        }
        this.shake = Math.max(this.shake, 0.35);
    }
    // one puff of tyre smoke (grey-white) or dust (brown)
    puff(x, z, kind, vx = 0, vz = 0) {
        if (!this.enabled) return;
        const p = this.puffs[this.puffIdx = (this.puffIdx + 1) % this.puffs.length];
        p.s.position.set(x, 0.4, z); p.s.visible = true;
        p.s.material.color.set(kind === 'dust' ? 0xb59a6a : 0xe6e8ec);
        p.life = 0; p.max = kind === 'dust' ? 1.1 : 0.9; p.grow = kind === 'dust' ? 3.5 : 2.6;
        p.vx = vx * 0.2 + (Math.random() - 0.5); p.vy = 0.6 + Math.random() * 0.5; p.vz = vz * 0.2 + (Math.random() - 0.5);
        p.s.scale.setScalar(0.8);
    }
    bump(amount) { this.shake = Math.max(this.shake, amount); }
    update(dt) {
        for (const p of this.puffs) {
            if (!p.s.visible) continue;
            p.life += dt; const t = p.life / p.max;
            if (t >= 1) { p.s.visible = false; continue; }
            p.s.position.x += p.vx * dt; p.s.position.y += p.vy * dt; p.s.position.z += p.vz * dt;
            p.s.scale.setScalar(0.8 + t * p.grow);
            p.s.material.opacity = 0.55 * (1 - t);
        }
        let any = false;
        for (let i = 0; i < this.SPARKS; i++) {
            if (this.sparkLife[i] <= 0) continue;
            any = true; this.sparkLife[i] -= dt;
            const k = i * 3;
            this.sparkVel[k + 1] -= 18 * dt;
            this.sparkPos[k] += this.sparkVel[k] * dt; this.sparkPos[k + 1] += this.sparkVel[k + 1] * dt; this.sparkPos[k + 2] += this.sparkVel[k + 2] * dt;
            if (this.sparkPos[k + 1] < 0.02) { this.sparkPos[k + 1] = 0.02; this.sparkVel[k + 1] *= -0.3; }
            if (this.sparkLife[i] <= 0) this.sparkPos[k + 1] = -100;
        }
        if (any || this.sparksWere) this.sparks.geometry.attributes.position.needsUpdate = true;
        this.sparksWere = any;
        this.shake = Math.max(0, this.shake - dt * 1.6);
    }
    // camera shake offset (small, and only when something happens or at very high speed)
    shakeOffset(speedFrac, t) {
        const s = this.shake * 0.25 + Math.max(0, speedFrac - 0.8) * 0.05;
        return [Math.sin(t * 61) * s, Math.sin(t * 47 + 1) * s * 0.7];
    }
    // speed lines drawn on a 2D layer over the 3D view, getting stronger with speed (and with slipstream)
    drawSpeedLines(speedFrac, boost, dt) {
        const c = this.overlay, x = this.ctx2d;
        const w = c.clientWidth, h = c.clientHeight;
        if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
        x.clearRect(0, 0, w, h);
        const strength = Math.max(0, (speedFrac - 0.55) / 0.45) + (boost ? 0.5 : 0);
        if (!this.enabled || strength <= 0) return;
        const cx = w / 2, cy = h * 0.42, R = Math.hypot(w, h) / 2;
        x.lineCap = 'round';
        for (const l of this.lines) {
            l.r += dt * l.speed * (1.2 + strength * 2.5);
            if (l.r > 1) { l.r = 0.25 + Math.random() * 0.2; l.a = Math.random() * Math.PI * 2; }
            const r0 = R * l.r, r1 = r0 + R * (0.05 + 0.12 * strength) * l.speed;
            x.strokeStyle = boost ? `rgba(0,229,255,${0.35 * Math.min(1, strength)})` : `rgba(255,255,255,${0.28 * Math.min(1, strength)})`;
            x.lineWidth = 1.5 + l.speed * 1.5;
            x.beginPath(); x.moveTo(cx + Math.cos(l.a) * r0, cy + Math.sin(l.a) * r0 * 0.7); x.lineTo(cx + Math.cos(l.a) * r1, cy + Math.sin(l.a) * r1 * 0.7); x.stroke();
        }
    }
    clear() {
        for (const p of this.puffs) p.s.visible = false;
        this.sparkLife.fill(0); for (let i = 0; i < this.SPARKS; i++) this.sparkPos[i * 3 + 1] = -100;
        this.sparks.geometry.attributes.position.needsUpdate = true;
        this.ctx2d.clearRect(0, 0, this.overlay.width, this.overlay.height);
    }
}
