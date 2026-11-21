// Supercar Legends: the extra race sounds that make it feel like you're there. Gear changes (a quick cut in the engine),
// exhaust pops and crackles when you lift off, a turbo whistle and the "pssh" as it lets go, wind rushing past, the
// rumble of the kerbs and grass, the other cars' engines (coming from their side, dropping in pitch as they go past),
// a muffled sound from inside the cockpit, and an echo off the buildings on the city track.
// It's all made in code from noise and tones, plus the engine recordings the race already has: nothing to download.

const RIVAL_VOICES = 3;

// (made once per sound system and kept, so pausing and carrying on doesn't redo the work)
const cache = new WeakMap();
function cached(ctx, key, make) { let c = cache.get(ctx); if (!c) cache.set(ctx, c = {}); return c[key] || (c[key] = make()); }
function noiseBuffer(ctx, seconds = 2) {
    const len = Math.floor(ctx.sampleRate * seconds), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return b;
}
// a short, soft "room" echo: smoothed noise fading away (for the buildings in the city)
function echoImpulse(ctx, seconds, decay) {
    const len = Math.floor(ctx.sampleRate * seconds), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    let last = 0; for (let i = 0; i < len; i++) { last = last * 0.82 + (Math.random() * 2 - 1) * 0.18; d[i] = last * 2.5 * Math.pow(1 - i / len, decay) * (i < ctx.sampleRate * 0.012 ? 0 : 1); }
    return b;
}

export class RaceSound {
    // out: where the sounds go (the race's master volume). engineBuf: a looping engine recording for the rivals, if loaded.
    // out: the race's master volume. post: the node after it (the cockpit muffle), for the echo. presence: the race's
    // higher-tones copy, so the rivals can be heard on small speakers too.
    constructor(ctx, out, { city = false, turbo = false, ev = false, post = null, presence = null } = {}) {
        this.ctx = ctx; this.out = out; this.turbo = turbo && !ev; this.ev = ev; this.noise = cached(ctx, 'noise', () => noiseBuffer(ctx));
        const t = ctx.currentTime, loopNoise = (filterType, freq, q = 0.7) => {
            const s = ctx.createBufferSource(); s.buffer = this.noise; s.loop = true;
            const f = ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q;
            const g = ctx.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random()); return { s, f, g };
        };
        this.wind = loopNoise('lowpass', 400);
        this.grass = loopNoise('bandpass', 650, 0.8);       // a gravelly rumble (grass, and kerbs), audible on small speakers
        // kerb rumble: a buzz at the rate the tyres cross the ridges, plus a little thud
        this.kerbOsc = ctx.createOscillator(); this.kerbOsc.type = 'sawtooth';
        const kf = ctx.createBiquadFilter(); kf.type = 'lowpass'; kf.frequency.value = 420; this.kerbG = ctx.createGain(); this.kerbG.gain.value = 0;
        this.kerbOsc.connect(kf); kf.connect(this.kerbG); this.kerbG.connect(out); this.kerbOsc.start();
        // turbo whistle: a high, slightly breathy tone
        if (this.turbo) {
            this.whistle = ctx.createOscillator(); this.whistle.type = 'sine'; this.whistleG = ctx.createGain(); this.whistleG.gain.value = 0;
            this.whistle.connect(this.whistleG); this.whistleG.connect(out); this.whistle.start();
        }
        // the rivals: a few engine voices, each placed left or right
        this.voices = [];
        for (let i = 0; i < RIVAL_VOICES; i++) {
            const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null, g = ctx.createGain(); g.gain.value = 0;
            const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
            const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(); o1.type = 'sawtooth'; o2.type = 'square';
            const og = ctx.createGain(); og.gain.value = 0.5; o1.connect(og); o2.connect(og); og.connect(lp); o1.start(); o2.start();
            lp.connect(g); if (pan) { g.connect(pan); pan.connect(out); if (presence) pan.connect(presence); } else { g.connect(out); if (presence) g.connect(presence); }
            this.voices.push({ g, pan, lp, o1, o2, og, loop: null, car: null });
        }
        // the city: a short echo off the buildings
        if (city && ctx.createConvolver) {
            const conv = ctx.createConvolver(); conv.buffer = cached(ctx, 'echo', () => echoImpulse(ctx, 0.7, 2.6)); const wet = ctx.createGain(); wet.gain.value = 0.18;
            out.connect(conv); conv.connect(wet); wet.connect(post || ctx.destination);
            this.echo = { conv, wet };
        }
        this.lastGear = null; this.lastGas = false; this.cutUntil = 0; this.nextCrackle = 0; this.nextPop = 0;
    }
    // give the rivals the real engine recording once it has loaded
    useEngineRecording(buf) {
        if (!buf || this.ev) return;
        for (const v of this.voices) {
            if (v.loop) continue;
            const s = this.ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.connect(v.lp); s.start(0, Math.random() * buf.duration);
            v.loop = s; v.og.gain.value = 0; try { v.o1.stop(); v.o2.stop(); } catch (e) { /* already stopped */ } v.o1 = v.o2 = null;   // (the recording takes over from the made-up tone)
        }
    }
    // a short burst of filtered noise: a pop, a crackle, a "pssh"
    burst(at, { freq = 900, q = 1.2, type = 'bandpass', len = 0.03, vol = 0.2, decay = 0.02 }) {
        const ctx = this.ctx, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        s.buffer = this.noise; f.type = type; f.frequency.value = freq; f.Q.value = q;
        g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vol, at + 0.003); g.gain.setTargetAtTime(0, at + 0.004, decay);
        s.connect(f); f.connect(g); g.connect(this.out); s.start(at, Math.random() * 1.5, len + decay * 6); s.onended = () => { s.disconnect(); g.disconnect(); };
    }
    // pops and crackles from the exhaust as the engine lifts off at high revs
    crackle(amount) {
        const t = this.ctx.currentTime, n = Math.round(3 + amount * 7);
        for (let i = 0; i < n; i++) {
            const at = t + 0.03 + Math.random() * (0.35 + amount * 0.5), big = Math.random() < 0.3;
            this.burst(at, { freq: big ? 380 + Math.random() * 200 : 900 + Math.random() * 1400, q: big ? 0.9 : 2, vol: (big ? 0.5 : 0.22) * (0.5 + amount * 0.5), decay: big ? 0.035 : 0.012 });
        }
    }
    // s: { v, vmax, gear, rpm, gas, onKerb, onGrass, cockpit, engineOn, soundOn, rivals: [{ dist, side, closing, v, vmax }] }
    // returns how much to turn the engine down this moment (a quick dip during each gear change)
    update(dt, s) {
        const ctx = this.ctx, t = ctx.currentTime, k = (p, v, tc = 0.06) => p.setTargetAtTime(v, t, tc);
        const sp = Math.min(1, Math.abs(s.v) / s.vmax), loud = s.soundOn ? 1 : 0, eng = s.soundOn && s.engineOn ? 1 : 0;
        // gear changes: up a gear with your foot down = a quick cut and a pop; lifting off from high revs = crackles
        // (not too often: at most one pop a gear change, and crackles no more than every 1.5 seconds)
        if (this.lastGear == null) this.lastGear = s.gear;
        if (!this.ev && eng) {
            if (s.gear > this.lastGear && s.gas && t > this.nextPop) { this.nextPop = t + 0.4; this.cutUntil = t + 0.11; this.burst(t + 0.02, { freq: 520, q: 1, vol: 0.32, decay: 0.03 }); }
            if (this.lastGas && !s.gas && s.v > 20 && s.rpm > 0.45 && t > this.nextCrackle) {
                this.nextCrackle = t + 1.5;
                this.crackle(Math.min(1, (s.rpm - 0.45) / 0.5));
                if (this.turbo) this.burst(t + 0.02, { type: 'highpass', freq: 1800, q: 0.5, len: 0.25, vol: 0.12, decay: 0.12 });   // the turbo letting go
            }
        }
        this.lastGear = s.gear; this.lastGas = s.gas;
        const cut = t < this.cutUntil ? 0.25 : 1;
        // wind: rises with speed (quieter inside the car)
        k(this.wind.g.gain, loud * sp * sp * (s.cockpit ? 0.05 : 0.14)); k(this.wind.f.frequency, 300 + sp * 2200, 0.2);
        // kerbs and grass
        k(this.kerbG.gain, loud * (s.onKerb && s.v > 5 ? 0.07 : 0), 0.02); k(this.kerbOsc.frequency, Math.max(20, Math.abs(s.v) / 0.375), 0.03);
        k(this.grass.g.gain, loud * ((s.onGrass ? 0.09 : 0) + (s.onKerb ? 0.04 : 0)) * Math.min(1, s.v / 25), 0.05);
        // turbo whistle: rises with the revs while your foot is down
        if (this.whistle) { k(this.whistleG.gain, eng * (s.gas ? 0.005 + s.rpm * 0.01 : 0), 0.08); k(this.whistle.frequency, 2100 + s.rpm * 1300, 0.12); }   // (kept below 3.5 kHz, and it glides, so it's never piercing)
        // the rivals: the nearest few, louder when close, from their side, higher pitched as they come towards you
        const near = (s.rivals || []).filter(r => r.dist < 70).sort((a, b) => a.dist - b.dist).slice(0, RIVAL_VOICES);
        this.voices.forEach((vo, i) => {
            const r = near[i];
            if (!r || !eng) { k(vo.g.gain, 0, 0.15); return; }
            const doppler = 343 / Math.max(250, 343 - r.closing * 2.2), revs = 0.5 + 0.9 * ((r.v / r.vmax * 6) % 1) * 0.6 + r.v / r.vmax * 0.5;
            k(vo.g.gain, 0.1 / (1 + r.dist / 7) / (1 + i * 0.5) * (s.cockpit ? 0.6 : 1), 0.08);   // (the nearest loudest; a pack never drowns your own engine)
            if (vo.pan) k(vo.pan.pan, Math.max(-0.9, Math.min(0.9, r.side)), 0.08);
            const f = 70 * revs * doppler; if (vo.o1) { k(vo.o1.frequency, f, 0.05); k(vo.o2.frequency, f * 0.5, 0.05); }
            if (vo.loop) k(vo.loop.playbackRate, Math.max(0.4, (0.6 + revs * 0.8) * doppler), 0.05);
            k(vo.lp.frequency, 900 + 1600 / (1 + r.dist / 15), 0.1);
        });
        return cut;
    }
    stop() {
        const all = [this.wind.s, this.grass.s, this.kerbOsc, this.whistle, ...this.voices.flatMap(v => [v.o1, v.o2, v.loop])];
        for (const n of all) if (n) { try { n.stop(); } catch (e) { /* already stopped */ } }
        if (this.echo) { const e = this.echo; try { e.wet.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15); } catch (er) { /* gone */ } setTimeout(() => { try { this.out.disconnect(e.conv); e.wet.disconnect(); } catch (er) { /* gone */ } }, 1200); }
    }
}
