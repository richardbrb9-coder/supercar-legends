// Supercar Legends: the two extra garage looks.
//   Spotlight: a dark room lit by long bright light bars. The bars follow the camera and gently rock, so as the car
//              is spun, long streaks of light glide over the paint, glass and chrome. The floor is dark and glossy.
//   Showroom:  a bright white room with a curved backdrop, big soft ceiling panels and a soft shadow under the car.
// To stay smooth on tablets nearly all of the light comes from a small picture of the room wrapped round the car
// (an environment map), which costs nothing to turn. No light here casts a real-time shadow: the showroom shadow is
// drawn once each time the car changes, and the Spotlight floor draws the car a second time at half size for its reflection.
// Everything made here is thrown away again when the look is switched off, so Studio, Day and Night are untouched
// (apart from the two pictures of the rooms, which are kept so a second visit is instant).
// The looks borrow the garage's own lights (and two spare ones it keeps switched off) instead of adding new ones:
// a different number of lights would make the graphics chip rebuild every paint and glass program, which is a
// noticeable stall on a tablet the first time a look is picked.
import * as THREE from './lib/three.module.min.js';

const DEG = Math.PI / 180;
// The Spotlight lights, as seen from the camera (which sits on +Z). a: angle up from the floor behind the camera, going
// over the top to the floor behind the car. They all run left to right. A few broad ones, like the big soft lights of a
// photo studio: lots of thin ones turn a curvy car into a zebra.
const TUBES = [
    { a: 6, w: 2.6, len: 26, power: 1.1, edge: 1, tint: [0.7, 0.82, 1.0] },   // low, wide and dim behind the camera: stops the doors going black
    { a: 36, w: 1.8, len: 15, power: 10, edge: 1 },                           // a softer bright line along the side (a thin one shows as several stripes on a sculpted door)
    { a: 72, w: 2.6, len: 17, power: 15, edge: 0.3 },                         // the big soft light overhead
    { a: 126, w: 1.1, len: 17, power: 20, edge: 0.6, tint: [0.88, 0.94, 1.0] } // over the back: streaks along the bonnet and roof
];
// The tall light bars standing in an arc behind the car (degrees left and right of straight behind, and how far away)
const BARS = [-58, -42, -25, -8, 8, 25, 42, 58], BAR_R = 10.5, BAR_H = 5.2;

// Showroom lights: a soft white sky-and-floor light, a gentle key from above the front corner, a weak fill
const SHOW = { hemi: 0.6, ground: 0x8d929b, key: 1.6, keyPos: [3, 9, 4.5], fill: 0, fillPos: [-6, 2, 2] };
// The showroom as the paint sees it: brightness of the upper walls, the band low on the walls, and the floor
const ROOM = { upper: 0.7, lower: 0.3, floor: 0.2 };

// The showroom shadow layers: [colour, strength], and which heights each one picks up (1 = touching the floor, 0 = 1.1 m up)
const SHADOW = { wide: [0x2a2e36, 0.6], body: [0x15171c, 0.92], contact: [0x040506, 1], bodyBand: [0.35, 0.85], contactBand: [0.92, 0.985] };

const QUAD_VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
// uRemap (first pass only): which heights count. The picture holds 1 where the car touches the floor, falling to 0 at 1.1 m up.
const BLUR_FRAG = `uniform sampler2D tMap; uniform vec2 uStep; uniform vec2 uRemap; varying vec2 vUv;
float tap(vec2 uv){ float v = texture2D(tMap, uv).r; return uRemap.y > 0.0 ? smoothstep(uRemap.x, uRemap.y, v) : v; }
void main(){
    float s = tap(vUv) * 0.1585;
    s += (tap(vUv + uStep) + tap(vUv - uStep)) * 0.1465;
    s += (tap(vUv + uStep * 2.0) + tap(vUv - uStep * 2.0)) * 0.1156;
    s += (tap(vUv + uStep * 3.0) + tap(vUv - uStep * 3.0)) * 0.0779;
    s += (tap(vUv + uStep * 4.0) + tap(vUv - uStep * 4.0)) * 0.0448;
    s += (tap(vUv + uStep * 5.0) + tap(vUv - uStep * 5.0)) * 0.0220;
    s += (tap(vUv + uStep * 6.0) + tap(vUv - uStep * 6.0)) * 0.0092;
    gl_FragColor = vec4(s, s, s, 1.0);
}`;
const FLOOR_VERT = `uniform mat4 uTexMatrix; varying vec4 vRefl; varying vec3 vWorld;
void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; vRefl = uTexMatrix * w; gl_Position = projectionMatrix * viewMatrix * w; }`;
// The glossy dark floor: a pool of light under the car, plus the mirror picture, smeared a little up and down like polished concrete
const FLOOR_FRAG = `uniform sampler2D tRefl; uniform float uStrength; uniform vec2 uTexel; varying vec4 vRefl; varying vec3 vWorld;
void main(){
    float d = length(vWorld.xz);
    vec3 col = vec3(0.0045, 0.005, 0.006) + vec3(0.030, 0.034, 0.042) * exp(-d * d / 26.0);
    if (uStrength > 0.0) {
        vec2 uv = vRefl.xy / vRefl.w;
        vec3 r = texture2D(tRefl, uv).rgb * 0.16;
        for (int i = 1; i <= 6; i++) {
            float f = float(i), k = 0.151 * exp(-f * f / 14.0);
            vec2 o = vec2(0.0, uTexel.y * f);
            r += (texture2D(tRefl, uv + o).rgb + texture2D(tRefl, uv - o).rgb) * k;
        }
        vec3 v = normalize(cameraPosition - vWorld);
        float fres = mix(0.16, 0.75, pow(1.0 - clamp(v.y, 0.0, 1.0), 3.0));
        col += min(r, vec3(6.0)) * fres * uStrength;
    }
    col *= 1.0 - smoothstep(9.0, 30.0, d);
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}`;
const COVE_VERT = 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
// The showroom's curved white backdrop: a plain painted surface, a touch greyer on the floor far from the car
const COVE_FRAG = `varying vec3 vP;
void main(){
    float d = length(vP.xz), h = vP.y;
    vec3 col = mix(vec3(0.905, 0.91, 0.92), vec3(0.975, 0.977, 0.98), smoothstep(0.0, 7.0, h));
    col *= 1.0 - 0.045 * smoothstep(2.5, 13.0, d) * (1.0 - smoothstep(0.0, 4.0, h));
    col += 0.035 * exp(-d * d / 30.0) * (1.0 - smoothstep(0.0, 1.0, h));
    gl_FragColor = vec4(pow(col, vec3(2.2)), 1.0);
    #include <colorspace_fragment>
}`;

export class GarageStage {
    // lights: the garage's own { hemi, sun, spare: [two directional lights kept at zero] }
    constructor(renderer, scene, lights) {
        this.renderer = renderer; this.scene = scene; this.lights = lights;
        this.mode = null; this.group = null; this.trash = []; this.car = null; this.t = 0;
        this.baseEnv = null; this.hidden = []; this.envs = {}; this.grace = 0; this.saved = null;
    }
    keep(x) { this.trash.push(x); return x; }
    // mode: 'spotlight', 'showroom', or anything else for none. hide: the old garage's own floor pieces.
    set(mode, car, hide = []) {
        const want = mode === 'spotlight' || mode === 'showroom' ? mode : null;
        if (want !== this.mode) {
            this.clear();
            if (want) {
                this.mode = want; this.baseEnv = this.scene.environment;
                this.hidden = hide.map(o => [o, o.visible]); hide.forEach(o => { o.visible = false; });
                const { hemi, sun } = this.lights;
                this.saved = { hc: hemi.color.clone(), hg: hemi.groundColor.clone(), sc: sun.color.clone(), sp: sun.position.clone() };
                this.group = new THREE.Group(); this.scene.add(this.group);
                if (want === 'spotlight') this.buildSpotlight(); else this.buildShowroom();
                this.shadowDirty = true; this.grace = 1;
            }
        }
        // (a new car takes a moment to build: don't count those slow frames against the tablet)
        if (car !== this.car) { this.car = car; this.shadowDirty = true; this.grace = 1; }
    }
    // Put everything back exactly as it was and free the pictures and shapes made for the look
    clear() {
        if (!this.mode) return;
        this.scene.remove(this.group);
        this.scene.environment = this.baseEnv; this.scene.environmentRotation.set(0, 0, 0, 'XYZ');
        this.hidden.forEach(([o, v]) => { o.visible = v; });
        // the garage's lights go back as they were (their brightness is set again by the garage itself)
        const { hemi, sun, spare } = this.lights, k = this.saved;
        hemi.color.copy(k.hc); hemi.groundColor.copy(k.hg); sun.color.copy(k.sc); sun.position.copy(k.sp);
        spare.forEach(l => { l.intensity = 0; });
        this.trash.forEach(x => x.dispose());
        this.trash = []; this.hidden = []; this.group = null; this.mode = null; this.baseEnv = null;
        this.floor = this.refl = this.rig = this.shadow = this.saved = null;
    }
    // Lights for the current look, applied every frame (the garage resets its own lights whenever the car is rebuilt)
    applyLights(az) {
        const { hemi, sun, spare } = this.lights;
        if (this.mode === 'spotlight') {
            hemi.color.setHex(0x8fa4c8); hemi.groundColor.setHex(0x06070a); hemi.intensity = 0.1;
            // two from behind for the outline, one soft one from above: they turn with the camera
            const c = Math.cos(az), s = Math.sin(az), put = (l, col, power, x, y, z) => { l.color.setHex(col); l.intensity = power; l.position.set(x * c + z * s, y, -x * s + z * c); };
            put(spare[0], 0xcfe0ff, 2.4, -5, 3.2, -6); put(spare[1], 0xcfe0ff, 2.4, 5, 3.2, -6); put(sun, 0xffffff, 0.5, 0, 7, 3);
        } else {
            hemi.color.setHex(0xffffff); hemi.groundColor.setHex(SHOW.ground); hemi.intensity = SHOW.hemi;
            sun.color.setHex(0xffffff); sun.intensity = SHOW.key; sun.position.set(...SHOW.keyPos);
            spare[0].color.setHex(0xffffff); spare[0].intensity = SHOW.fill; spare[0].position.set(...SHOW.fillPos);
            spare[1].intensity = 0;
        }
    }

    // A small picture of a room, made from glowing shapes, for the car to reflect
    // (kept after the first time: making it again costs a stall each time the look is picked)
    bakeRoom(name, makeRoom, blur) {
        if (this.envs[name]) { this.scene.environment = this.envs[name].texture; return; }
        const room = makeRoom();
        const pmrem = new THREE.PMREMGenerator(this.renderer);
        const rt = this.envs[name] = pmrem.fromScene(room, blur, 0.1, 100);
        pmrem.dispose();
        const maps = new Set();
        room.traverse(o => { if (o.geometry) o.geometry.dispose(); [].concat(o.material || []).forEach(m => { if (m.map) maps.add(m.map); m.dispose(); }); });
        maps.forEach(t => t.dispose());
        this.scene.environment = rt.texture;
    }

    // ----------------------------------------------------------------- Spotlight
    buildSpotlight() {
        this.bakeRoom('spotlight', () => this.spotlightRoom(), 0.022);   // (very slightly soft, or the edges of the bars show up as fine stripes in the paint)

        // the bars you can actually see: the tall ones standing behind the car, each with a soft glow
        this.rig = new THREE.Group(); this.group.add(this.rig);
        const barMat = this.keep(new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 3.5, 4.0) }));
        const haloMat = this.keep(new THREE.MeshBasicMaterial({ map: this.keep(haloTexture()), color: new THREE.Color(0.4, 0.52, 0.8), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
        const barGeo = this.keep(new THREE.PlaneGeometry(0.11, BAR_H)), haloGeo = this.keep(new THREE.PlaneGeometry(1.7, BAR_H + 2.4));
        for (const b of BARS) {
            const x = Math.sin(b * DEG) * BAR_R, z = -Math.cos(b * DEG) * BAR_R, y = BAR_H / 2 + 0.02;
            const m = new THREE.Mesh(barGeo, barMat); m.position.set(x, y, z); m.lookAt(0, y, 0); this.rig.add(m);
            const g = new THREE.Mesh(haloGeo, haloMat); g.position.set(x * 1.01, y, z * 1.01); g.lookAt(0, y, 0); this.rig.add(g);
        }
        // (the real lights for the paint that isn't shiny are the garage's own: see applyLights)

        // the glossy floor, and the half-size mirror picture it shows
        const type = this.renderer.capabilities.isWebGL2 ? THREE.HalfFloatType : THREE.UnsignedByteType;
        this.refl = { rt: this.keep(new THREE.WebGLRenderTarget(4, 4, { type, depthBuffer: true })), cam: new THREE.PerspectiveCamera(), on: true, ready: false, slow: 0, size: new THREE.Vector2() };
        this.floor = new THREE.Mesh(this.keep(new THREE.CircleGeometry(32, 48)), this.keep(new THREE.ShaderMaterial({
            uniforms: { tRefl: { value: this.refl.rt.texture }, uTexMatrix: { value: new THREE.Matrix4() }, uStrength: { value: 1 }, uTexel: { value: new THREE.Vector2() } },
            vertexShader: FLOOR_VERT, fragmentShader: FLOOR_FRAG })));
        this.floor.rotation.x = -Math.PI / 2; this.group.add(this.floor);
        this.floor.material.uniforms.uStrength.value = 0;
        this.prepareMirror();
    }
    // The mirror draws the car with slightly different programs (no final colour grading): get the graphics chip to
    // build those in the background first, and only show the reflection once they're ready, so picking the look doesn't stall
    prepareMirror() {
        const rnd = this.renderer, r = this.refl, floor = this.floor, prev = rnd.getRenderTarget();
        this.applyLights(0);
        rnd.setRenderTarget(r.rt);
        let wait;
        try { wait = rnd.compileAsync(this.scene, r.cam); } catch (e) { wait = Promise.resolve(); }
        rnd.setRenderTarget(prev);
        const done = () => { if (this.refl === r) { r.ready = true; if (r.on) floor.material.uniforms.uStrength.value = 1; } };
        wait.then(done, done);
    }
    spotlightRoom() {
        const room = new THREE.Scene(); room.background = new THREE.Color(0x030405);
        // each bar is brightest along its middle and fades smoothly to nothing at its edges
        // (a hard-edged thin line turns into rows of fine stripes on satin paint)
        const beams = {}, beam = (edge, upright) => beams[edge + '|' + upright] || (beams[edge + '|' + upright] = beamTexture(edge, upright));
        const glow = (len, w, power, edge, tint = [1, 1, 1], upright = false) => {
            const m = new THREE.Mesh(new THREE.PlaneGeometry(upright ? w : len, upright ? len : w),
                new THREE.MeshBasicMaterial({ map: beam(edge, upright), color: new THREE.Color(tint[0] * power, tint[1] * power, tint[2] * power), side: THREE.DoubleSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
            room.add(m); return m;
        };
        const R = 7;
        for (const t of TUBES) { const m = glow(t.len, t.w, t.power, t.edge, t.tint); m.position.set(0, Math.sin(t.a * DEG) * R, Math.cos(t.a * DEG) * R); m.lookAt(0, 0, 0); }
        // the tall bars behind the car: they draw a bright edge round its outline
        for (const b of BARS) {
            const m = glow(BAR_H, 0.9, Math.abs(b) > 30 ? 22 : 9, 0.9, [0.85, 0.92, 1], true);
            m.position.set(Math.sin(b * DEG) * BAR_R, BAR_H / 2, -Math.cos(b * DEG) * BAR_R); m.lookAt(0, BAR_H / 2, 0);
        }
        return room;
    }
    updateSpotlight(camera, target, dt) {
        const az = Math.atan2(camera.position.x - target.x, camera.position.z - target.z);
        // the light bars rock slowly over the car, so the streaks keep gliding even when nothing is touched
        const roll = Math.sin(this.t * 0.45) * 0.27 + Math.sin(this.t * 0.17 + 1) * 0.08;
        this.rig.rotation.y = az;
        this.scene.environmentRotation.set(roll, az, 0, 'XYZ');
        this.applyLights(az);
        const r = this.refl;
        // (if the tablet can't keep up, the mirror picture is the first thing to go: about five seconds running mostly
        // below 28 frames a second. Not counted: the moment a car is being rebuilt, or while the mirror is still getting ready)
        if (r.on && r.ready && dt > 0 && this.grace <= 0) { r.slow = dt > 0.036 ? r.slow + 1 : Math.max(0, r.slow - 2); if (r.slow > 150) { r.on = false; this.floor.material.uniforms.uStrength.value = 0; } }
        if (r.on && r.ready) this.renderMirror(camera, target);
    }
    // Photograph the scene from under the floor, looking up: what a mirror on the floor would show
    renderMirror(camera, target) {
        const rnd = this.renderer, r = this.refl, cam = r.cam;
        rnd.getDrawingBufferSize(r.size);
        const w = Math.max(2, Math.round(r.size.x * 0.5)), h = Math.max(2, Math.round(r.size.y * 0.5));
        if (r.rt.width !== w || r.rt.height !== h) r.rt.setSize(w, h);
        cam.fov = camera.fov; cam.aspect = camera.aspect; cam.near = camera.near; cam.far = camera.far; cam.zoom = camera.zoom; cam.updateProjectionMatrix();
        cam.position.set(camera.position.x, -camera.position.y, camera.position.z); cam.up.set(0, -1, 0);
        cam.lookAt(target.x, -target.y, target.z); cam.updateMatrixWorld(true);
        const u = this.floor.material.uniforms;
        u.uTexMatrix.value.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(cam.projectionMatrix).multiply(cam.matrixWorldInverse);
        u.uTexel.value.set(1 / w, 1 / h);
        const prev = rnd.getRenderTarget(); this.floor.visible = false;
        rnd.setRenderTarget(r.rt); rnd.render(this.scene, cam); rnd.setRenderTarget(prev);
        this.floor.visible = true;
    }

    // ----------------------------------------------------------------- Showroom
    buildShowroom() {
        this.bakeRoom('showroom', () => this.showroomRoom(), 0.035);
        // the curved backdrop: floor, a smooth bend, then wall, all the way round
        const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(15, 0)];
        for (let i = 1; i <= 10; i++) { const a = i / 10 * Math.PI / 2; pts.push(new THREE.Vector2(15 + Math.sin(a) * 5, 5 - Math.cos(a) * 5)); }
        pts.push(new THREE.Vector2(20, 30));
        const cove = new THREE.Mesh(this.keep(new THREE.LatheGeometry(pts, 48)), this.keep(new THREE.ShaderMaterial({ vertexShader: COVE_VERT, fragmentShader: COVE_FRAG, side: THREE.DoubleSide })));
        cove.material.toneMapped = false; this.group.add(cove);


        // the shadow under the car: a picture of its underside taken from the floor, made into three soft layers:
        // a wide pale one, a darker one close under the body, and a small dark one where each tyre meets the floor
        const rt = (n) => this.keep(new THREE.WebGLRenderTarget(n, n, { depthBuffer: false }));
        const s = this.shadow = {
            depth: this.keep(new THREE.WebGLRenderTarget(512, 512)), a: rt(256), contact: rt(256), body: rt(256), b: rt(128), wide: rt(128),
            cam: new THREE.OrthographicCamera(-3.6, 3.6, 3.6, -3.6, 0, 1.1), depthMat: this.keep(new THREE.MeshDepthMaterial({ side: THREE.DoubleSide })),
            quadCam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
            blur: this.keep(new THREE.ShaderMaterial({ uniforms: { tMap: { value: null }, uStep: { value: new THREE.Vector2() }, uRemap: { value: new THREE.Vector2() } }, vertexShader: QUAD_VERT, fragmentShader: BLUR_FRAG, depthTest: false, depthWrite: false }))
        };
        s.cam.rotation.x = Math.PI / 2; s.cam.updateMatrixWorld(true);
        s.quad = new THREE.Mesh(this.keep(new THREE.PlaneGeometry(2, 2)), s.blur); s.quad.frustumCulled = false;
        const geo = this.keep(new THREE.PlaneGeometry(7.2, 7.2));
        const layer = (tex, col, opacity, y) => {
            const m = new THREE.Mesh(geo, this.keep(new THREE.MeshBasicMaterial({ color: col, alphaMap: tex, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide })));
            m.material.toneMapped = false; m.rotation.x = Math.PI / 2; m.position.y = y; m.renderOrder = 1; m.visible = false; this.group.add(m); return m;
        };
        s.planes = [layer(s.wide.texture, SHADOW.wide[0], SHADOW.wide[1], 0.003), layer(s.body.texture, SHADOW.body[0], SHADOW.body[1], 0.004), layer(s.contact.texture, SHADOW.contact[0], SHADOW.contact[1], 0.005)];
    }
    showroomRoom() {
        const room = new THREE.Scene();
        const panel = (w, h, v, place) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(v, v, v * 1.02), side: THREE.DoubleSide })); place(m); room.add(m); };
        // white walls with a soft grey band low down, a darker floor and a greyer ceiling. The grey band and floor give the
        // paint a gentle horizon line and darker lower sides, so the car's shape shows instead of looking flat white all over
        for (let i = 0; i < 4; i++) {
            const at = (y, m) => { m.position.set(Math.sin(i * Math.PI / 2) * 13, y, Math.cos(i * Math.PI / 2) * 13); m.rotation.y = i * Math.PI / 2; };
            panel(26, 6, ROOM.upper, m => at(6, m)); panel(26, 3.6, ROOM.lower, m => at(1.2, m));
        }
        panel(26, 26, ROOM.floor, m => { m.rotation.x = Math.PI / 2; m.position.y = -1.5; });
        panel(26, 26, 0.2, m => { m.rotation.x = Math.PI / 2; m.position.y = 9; });
        // ...with big soft light panels in the ceiling: two running along the car and one across each end
        for (const z of [-3, 3]) panel(15, 3.8, 5.2, m => { m.rotation.x = Math.PI / 2; m.position.set(0, 8.9, z); });
        for (const x of [-10.5, 10.5]) panel(2.4, 13, 5.2, m => { m.rotation.x = Math.PI / 2; m.position.set(x, 8.9, 0); });
        return room;
    }
    renderShadow() {
        const rnd = this.renderer, s = this.shadow, sc = this.scene;
        const prev = rnd.getRenderTarget(), bg = sc.background, col = rnd.getClearColor(new THREE.Color()), alpha = rnd.getClearAlpha();
        const vis = sc.children.map(o => o.visible); sc.children.forEach(o => { o.visible = o === this.car.group; });
        sc.background = null; sc.overrideMaterial = s.depthMat; rnd.setClearColor(0x000000, 1);
        rnd.setRenderTarget(s.depth); rnd.render(sc, s.cam);
        sc.overrideMaterial = null; sc.background = bg; sc.children.forEach((o, i) => { o.visible = vis[i]; });
        const u = s.blur.uniforms, pass = (from, to, x, y, remap) => { u.tMap.value = from.texture; u.uStep.value.set(x, y); u.uRemap.value.set(...(remap || [0, 0])); rnd.setRenderTarget(to); rnd.render(s.quad, s.quadCam); };
        const C = SHADOW.contactBand, B = SHADOW.bodyBand;
        pass(s.depth, s.a, 1.3 / 256, 0, C); pass(s.a, s.contact, 0, 1.3 / 256);          // tyres: only the last few centimetres, a little soft
        pass(s.depth, s.a, 2.0 / 256, 0, B); pass(s.a, s.body, 0, 2.0 / 256);             // the body: low parts only, softly
        pass(s.body, s.b, 2.4 / 128, 0); pass(s.b, s.wide, 0, 2.4 / 128);                 // and a wide pale spread of that
        rnd.setRenderTarget(prev); rnd.setClearColor(col, alpha);
        s.planes.forEach(p => { p.visible = true; });
    }

    // Once a frame, before the picture is drawn. target: the point the camera circles.
    update(camera, target, dt) {
        if (!this.mode) return;
        this.t += dt; this.grace -= dt;
        if (this.mode === 'spotlight') this.updateSpotlight(camera, target, dt);
        else { this.applyLights(0); if (this.shadowDirty && this.car && this.car.group.parent === this.scene) { this.shadowDirty = false; this.renderShadow(); } }
    }
}

// A soft glow to put behind a light bar
function haloTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 2, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(0.35, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// The glow across a light: full brightness in the middle, fading smoothly to nothing at the edges.
// edge: how much of the half-width is the fade (1 = a soft line, 0.3 = a flat panel with soft edges). upright: for a standing bar.
function beamTexture(edge, upright) {
    const n = 128, c = document.createElement('canvas'); c.width = upright ? n : 1; c.height = upright ? 1 : n;
    const x = c.getContext('2d'), img = x.createImageData(c.width, c.height);
    for (let i = 0; i < n; i++) {
        const u = Math.abs((i + 0.5) / n * 2 - 1), k = Math.min(1, (1 - u) / edge), v = Math.round(255 * k * k * (3 - 2 * k));
        img.data.set([v, v, v, 255], i * 4);
    }
    x.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; return t;
}
