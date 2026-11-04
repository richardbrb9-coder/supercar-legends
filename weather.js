// Supercar Legends: weather for the race. Rain (falling streaks, a wet shiny road, spray, the sound of rain) and snow (drifting
// flakes, white verges and trees, a pale road). It only changes how things look and sound: the grip stays the same, because
// this is for children. The falling rain and snow live in a box that follows the camera, so a few thousand drops look endless.
import * as THREE from './lib/three.module.min.js';

export const WEATHERS = { sunny: 'Sunny', rain: 'Rain', snow: 'Snow' };

function dotTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d');
    const g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.7)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c);
}

export class Weather {
    constructor(scene) {
        this.scene = scene; this.kind = 'sunny'; this.group = new THREE.Group(); this.group.frustumCulled = false; scene.add(this.group);
        this.box = new THREE.Vector3(60, 26, 60); this.t = 0;
        this.sound = null;
    }
    // kind: sunny | rain | snow; density 0..1 (from the graphics quality)
    set(kind, density = 1, night = false) {
        this.clear(); this.kind = kind;
        if (kind === 'rain') this.makeRain(Math.round(4200 * density), night);
        if (kind === 'snow') this.makeSnow(Math.round(6500 * density), night);
    }
    clear() {
        for (const o of [...this.group.children]) { this.group.remove(o); o.geometry.dispose(); if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
        this.drops = null; this.flakes = null;
    }
    makeRain(n, night) {
        // each drop is a short line; its two ends move together, the top end a little behind (streaks lengthen with speed)
        const pos = new Float32Array(n * 6), seed = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { seed[i * 3] = Math.random(); seed[i * 3 + 1] = Math.random(); seed[i * 3 + 2] = Math.random(); }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const m = new THREE.LineBasicMaterial({ color: night ? 0x8fa3c2 : 0xc9d6e6, transparent: true, opacity: night ? 0.35 : 0.5, depthWrite: false, fog: false });
        const lines = new THREE.LineSegments(g, m); lines.frustumCulled = false; this.group.add(lines);
        this.drops = { lines, pos, seed, n, speed: 22 };
    }
    makeSnow(n, night) {
        const pos = new Float32Array(n * 3), seed = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { seed[i * 3] = Math.random(); seed[i * 3 + 1] = Math.random(); seed[i * 3 + 2] = Math.random(); }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const m = new THREE.PointsMaterial({ color: night ? 0xc9d3e6 : 0xffffff, size: 0.28, map: dotTexture(), transparent: true, depthWrite: false, opacity: 0.95, fog: false });
        const pts = new THREE.Points(g, m); pts.frustumCulled = false; this.group.add(pts);
        this.flakes = { pts, pos, seed, n, speed: 1.6 };
    }
    // cam: the camera position; vel: the player's velocity (x, z) so rain streaks slant as you drive into it
    update(dt, cam, velX = 0, velZ = 0) {
        this.t += dt; const B = this.box, wrap = (v, s) => ((v % s) + s) % s;
        if (this.drops) {
            const { pos, seed, n, speed } = this.drops, fall = this.t * speed;
            // the streak points from where the drop was a moment ago, so it leans back past the camera at speed
            const sx = -velX * 0.045, sz = -velZ * 0.045, sy = 0.9;
            for (let i = 0; i < n; i++) {
                const a = seed[i * 3], b = seed[i * 3 + 1], c = seed[i * 3 + 2];
                const x = cam.x - B.x / 2 + wrap(a * B.x - cam.x, B.x), z = cam.z - B.z / 2 + wrap(c * B.z - cam.z, B.z);
                const y = cam.y - B.y * 0.35 + wrap(b * B.y - fall * (0.85 + a * 0.3), B.y);
                const k = i * 6; pos[k] = x; pos[k + 1] = y; pos[k + 2] = z; pos[k + 3] = x - sx; pos[k + 4] = y + sy; pos[k + 5] = z - sz;
            }
            this.drops.lines.geometry.attributes.position.needsUpdate = true;
        }
        if (this.flakes) {
            const { pos, seed, n, speed } = this.flakes, fall = this.t * speed;
            for (let i = 0; i < n; i++) {
                const a = seed[i * 3], b = seed[i * 3 + 1], c = seed[i * 3 + 2], sway = Math.sin(this.t * (0.6 + a) + c * 20) * 0.6;
                pos[i * 3] = cam.x - B.x / 2 + wrap(a * B.x - cam.x + sway, B.x);
                pos[i * 3 + 1] = cam.y - B.y * 0.35 + wrap(b * B.y - fall * (0.7 + c * 0.6), B.y);
                pos[i * 3 + 2] = cam.z - B.z / 2 + wrap(c * B.z - cam.z + Math.cos(this.t * 0.5 + a * 9) * 0.6, B.z);
            }
            this.flakes.pts.geometry.attributes.position.needsUpdate = true;
        }
    }
    // the gentle hiss of rain: filtered noise, looping
    startSound(ctx, on) {
        this.stopSound(); if (!ctx || !on || this.kind !== 'rain') return;
        const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
        let last = 0; for (let i = 0; i < len; i++) { last = last * 0.6 + (Math.random() * 2 - 1) * 0.4; d[i] = last + (Math.random() < 0.0015 ? (Math.random() - 0.5) * 1.5 : 0); }
        const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        src.buffer = buf; src.loop = true; f.type = 'bandpass'; f.frequency.value = 2600; f.Q.value = 0.5; g.gain.value = 0.09;
        src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
        this.sound = { src, g };
    }
    stopSound() { if (this.sound) { try { this.sound.src.stop(); } catch (e) { /* already stopped */ } this.sound = null; } }
}

// How weather changes the light and sky for a given time of day (applied on top of lookFor's colours)
export function weatherLook(t, kind) {
    if (kind === 'sunny') return t;
    const night = t.time === 'night', sunset = t.time === 'sunset';
    const o = { ...t, weather: kind, light: { ...t.light } };
    if (kind === 'rain') {
        Object.assign(o, night ? { top: 0x07090d, horizon: 0x1c222b } : sunset ? { top: 0x3d434f, horizon: 0x8a7f78 } : { top: 0x6e7782, horizon: 0xa9b1ba });
        o.clouds = 1; o.stars = 0; o.fog = [t.fog[0] * 0.45, t.fog[1] * 0.42];
        o.light.sun *= 0.35; o.light.hemi *= night ? 1.1 : 1.15; o.light.env *= 0.75; o.light.exposure *= night ? 1 : 1.06;
    }
    if (kind === 'snow') {
        Object.assign(o, night ? { top: 0x0b0e15, horizon: 0x2a3140 } : sunset ? { top: 0x59607a, horizon: 0xc9b6ad } : { top: 0x9aa3ae, horizon: 0xdfe4ea });
        o.clouds = 1; o.stars = 0; o.fog = [t.fog[0] * 0.4, t.fog[1] * 0.38];
        o.light.sun *= 0.45; o.light.hemi *= 1.25; o.light.env *= 0.9; o.light.exposure *= night ? 1.05 : 0.98;
    }
    return o;
}
