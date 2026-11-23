// Supercar Legends: the two extra garage looks.
//   Spotlight: a dark room lit by long bright light bars. The bars follow the camera and gently rock, so as the car
//              is spun, long streaks of light glide over the paint, glass and chrome. The floor is dark and glossy.
//   Showroom:  a bright white room with a curved backdrop, big soft ceiling panels and a soft shadow under the car.
// To stay smooth on tablets nearly all of the light comes from a small picture of the room wrapped round the car
// (an environment map), which costs nothing to turn. No light here casts a real-time shadow: the showroom shadow is
// drawn once each time the car changes, and the Spotlight floor draws the car a second time at half size for its reflection.
// Everything made here is thrown away again when the look is switched off, so Studio, Day and Night are untouched.
import * as THREE from './lib/three.module.min.js';

const DEG = Math.PI / 180;
// The Spotlight lights, as seen from the camera (which sits on +Z). a: angle up from the floor behind the camera, going
// over the top to the floor behind the car. They all run left to right. A few broad ones, like the big soft lights of a
// photo studio: lots of thin ones turn a curvy car into a zebra.
const TUBES = [
    { a: 6, w: 2.6, len: 26, power: 1.6, edge: 1, tint: [0.7, 0.82, 1.0] },   // low, wide and dim behind the camera: stops the doors going black
    { a: 36, w: 1.0, len: 15, power: 17, edge: 1 },                           // a slimmer bright line along the side
    { a: 72, w: 2.6, len: 17, power: 15, edge: 0.3 },                         // the big soft light overhead
    { a: 126, w: 1.1, len: 17, power: 20, edge: 0.6, tint: [0.88, 0.94, 1.0] } // over the back: streaks along the bonnet and roof
];
// The tall light bars standing in an arc behind the car (degrees left and right of straight behind, and how far away)
const BARS = [-58, -42, -25, -8, 8, 25, 42, 58], BAR_R = 10.5, BAR_H = 5.2;

const QUAD_VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const BLUR_FRAG = `uniform sampler2D tMap; uniform vec2 uStep; varying vec2 vUv;
void main(){
    float s = texture2D(tMap, vUv).r * 0.1585;
    s += (texture2D(tMap, vUv + uStep).r + texture2D(tMap, vUv - uStep).r) * 0.1465;
    s += (texture2D(tMap, vUv + uStep * 2.0).r + texture2D(tMap, vUv - uStep * 2.0).r) * 0.1156;
    s += (texture2D(tMap, vUv + uStep * 3.0).r + texture2D(tMap, vUv - uStep * 3.0).r) * 0.0779;
    s += (texture2D(tMap, vUv + uStep * 4.0).r + texture2D(tMap, vUv - uStep * 4.0).r) * 0.0448;
    s += (texture2D(tMap, vUv + uStep * 5.0).r + texture2D(tMap, vUv - uStep * 5.0).r) * 0.0220;
    s += (texture2D(tMap, vUv + uStep * 6.0).r + texture2D(tMap, vUv - uStep * 6.0).r) * 0.0092;
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
        vec3 r = texture2D(tRefl, uv).rgb * 0.2;
        for (int i = 1; i <= 5; i++) {
            float f = float(i), k = 0.19 * exp(-f * f / 9.0);
            vec2 o = vec2(0.0, uTexel.y * f * 1.4);
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
    constructor(renderer, scene) {
        this.renderer = renderer; this.scene = scene;
        this.mode = null; this.group = null; this.trash = []; this.car = null; this.t = 0;
        this.baseEnv = null; this.hidden = [];
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
                this.group = new THREE.Group(); this.scene.add(this.group);
                if (want === 'spotlight') this.buildSpotlight(); else this.buildShowroom();
                this.shadowDirty = true;
            }
        }
        if (car !== this.car) { this.car = car; this.shadowDirty = true; }
    }
    // Put everything back exactly as it was and free the pictures and shapes made for the look
    clear() {
        if (!this.mode) return;
        this.scene.remove(this.group);
        this.scene.environment = this.baseEnv; this.scene.environmentRotation.set(0, 0, 0, 'XYZ');
        this.hidden.forEach(([o, v]) => { o.visible = v; });
        this.trash.forEach(x => x.dispose());
        this.trash = []; this.hidden = []; this.group = null; this.mode = null; this.baseEnv = null;
        this.floor = this.refl = this.rig = this.shadow = null;
    }

    // A small picture of a room, made from glowing shapes, for the car to reflect
    bakeRoom(room, blur) {
        const pmrem = new THREE.PMREMGenerator(this.renderer);
        const rt = this.keep(pmrem.fromScene(room, blur, 0.1, 100));
        pmrem.dispose();
        const maps = new Set();
        room.traverse(o => { if (o.geometry) o.geometry.dispose(); [].concat(o.material || []).forEach(m => { if (m.map) maps.add(m.map); m.dispose(); }); });
        maps.forEach(t => t.dispose());
        this.scene.environment = rt.texture;
    }

    // ----------------------------------------------------------------- Spotlight
    buildSpotlight() {
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
        this.bakeRoom(room, 0.022);   // (very slightly soft, or the edges of the bars show up as fine stripes in the paint)

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
        // real lights for the paint that isn't shiny: two from behind for the outline, one soft one from above
        const lamp = (col, power, x, y, z) => { const l = new THREE.DirectionalLight(col, power); l.position.set(x, y, z); this.rig.add(l); };
        lamp(0xcfe0ff, 2.4, -5, 3.2, -6); lamp(0xcfe0ff, 2.4, 5, 3.2, -6); lamp(0xffffff, 0.5, 0, 7, 3);
        this.group.add(new THREE.HemisphereLight(0x8fa4c8, 0x06070a, 0.1));

        // the glossy floor, and the half-size mirror picture it shows
        const type = this.renderer.capabilities.isWebGL2 ? THREE.HalfFloatType : THREE.UnsignedByteType;
        this.refl = { rt: this.keep(new THREE.WebGLRenderTarget(4, 4, { type, depthBuffer: true })), cam: new THREE.PerspectiveCamera(), on: true, slow: 0, size: new THREE.Vector2() };
        this.floor = new THREE.Mesh(this.keep(new THREE.CircleGeometry(32, 48)), this.keep(new THREE.ShaderMaterial({
            uniforms: { tRefl: { value: this.refl.rt.texture }, uTexMatrix: { value: new THREE.Matrix4() }, uStrength: { value: 1 }, uTexel: { value: new THREE.Vector2() } },
            vertexShader: FLOOR_VERT, fragmentShader: FLOOR_FRAG })));
        this.floor.rotation.x = -Math.PI / 2; this.group.add(this.floor);
    }
    updateSpotlight(camera, target, dt) {
        const az = Math.atan2(camera.position.x - target.x, camera.position.z - target.z);
        // the light bars rock slowly over the car, so the streaks keep gliding even when nothing is touched
        const roll = Math.sin(this.t * 0.42) * 0.2 + Math.sin(this.t * 0.17 + 1) * 0.07;
        this.rig.rotation.y = az;
        this.scene.environmentRotation.set(roll, az, 0, 'XYZ');
        const r = this.refl;
        // (if the tablet can't keep up, the mirror picture is the first thing to go)
        if (r.on && dt > 0) { r.slow = dt > 0.034 ? r.slow + 1 : Math.max(0, r.slow - 2); if (r.slow > 150) { r.on = false; this.floor.material.uniforms.uStrength.value = 0; } }
        if (r.on) this.renderMirror(camera, target);
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
        const room = new THREE.Scene();
        const panel = (w, h, v, place) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(v, v, v * 1.02), side: THREE.DoubleSide })); place(m); room.add(m); };
        // white walls, a pale floor and a greyer ceiling...
        for (let i = 0; i < 4; i++) panel(26, 9, 0.62, m => { m.position.set(Math.sin(i * Math.PI / 2) * 13, 4.5, Math.cos(i * Math.PI / 2) * 13); m.rotation.y = i * Math.PI / 2; });
        panel(26, 26, 0.5, m => { m.rotation.x = Math.PI / 2; m.position.y = -1.5; });
        panel(26, 26, 0.2, m => { m.rotation.x = Math.PI / 2; m.position.y = 9; });
        // ...with big soft light panels in the ceiling: two running along the car and one across each end
        for (const z of [-3, 3]) panel(15, 3.8, 5.2, m => { m.rotation.x = Math.PI / 2; m.position.set(0, 8.9, z); });
        for (const x of [-10.5, 10.5]) panel(2.4, 13, 5.2, m => { m.rotation.x = Math.PI / 2; m.position.set(x, 8.9, 0); });
        this.bakeRoom(room, 0.035);

        // the curved backdrop: floor, a smooth bend, then wall, all the way round
        const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(15, 0)];
        for (let i = 1; i <= 10; i++) { const a = i / 10 * Math.PI / 2; pts.push(new THREE.Vector2(15 + Math.sin(a) * 5, 5 - Math.cos(a) * 5)); }
        pts.push(new THREE.Vector2(20, 30));
        const cove = new THREE.Mesh(this.keep(new THREE.LatheGeometry(pts, 48)), this.keep(new THREE.ShaderMaterial({ vertexShader: COVE_VERT, fragmentShader: COVE_FRAG, side: THREE.DoubleSide })));
        cove.material.toneMapped = false; this.group.add(cove);

        this.group.add(new THREE.HemisphereLight(0xffffff, 0xc4c8ce, 0.75));
        const key = new THREE.DirectionalLight(0xffffff, 1.25); key.position.set(2.5, 9, 3.5); this.group.add(key);

        // the soft shadow under the car: a picture of its underside taken from the floor, blurred twice
        const rt = (n) => this.keep(new THREE.WebGLRenderTarget(n, n, { depthBuffer: false }));
        const s = this.shadow = {
            depth: this.keep(new THREE.WebGLRenderTarget(512, 512)), a: rt(256), tight: rt(256), b: rt(128), wide: rt(128),
            cam: new THREE.OrthographicCamera(-3.6, 3.6, 3.6, -3.6, 0, 1.1), depthMat: this.keep(new THREE.MeshDepthMaterial({ side: THREE.DoubleSide })),
            quadCam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
            blur: this.keep(new THREE.ShaderMaterial({ uniforms: { tMap: { value: null }, uStep: { value: new THREE.Vector2() } }, vertexShader: QUAD_VERT, fragmentShader: BLUR_FRAG, depthTest: false, depthWrite: false }))
        };
        s.cam.rotation.x = Math.PI / 2; s.cam.updateMatrixWorld(true);
        s.quad = new THREE.Mesh(this.keep(new THREE.PlaneGeometry(2, 2)), s.blur); s.quad.frustumCulled = false;
        const geo = this.keep(new THREE.PlaneGeometry(7.2, 7.2));
        const layer = (tex, opacity, y) => {
            const m = new THREE.Mesh(geo, this.keep(new THREE.MeshBasicMaterial({ color: 0x1a1d24, alphaMap: tex, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide })));
            m.material.toneMapped = false; m.rotation.x = Math.PI / 2; m.position.y = y; m.visible = false; this.group.add(m); return m;
        };
        s.planes = [layer(s.wide.texture, 0.75, 0.003), layer(s.tight.texture, 0.8, 0.004)];
    }
    renderShadow() {
        const rnd = this.renderer, s = this.shadow, sc = this.scene;
        const prev = rnd.getRenderTarget(), bg = sc.background, col = rnd.getClearColor(new THREE.Color()), alpha = rnd.getClearAlpha();
        const vis = sc.children.map(o => o.visible); sc.children.forEach(o => { o.visible = o === this.car.group; });
        sc.background = null; sc.overrideMaterial = s.depthMat; rnd.setClearColor(0x000000, 1);
        rnd.setRenderTarget(s.depth); rnd.render(sc, s.cam);
        sc.overrideMaterial = null; sc.background = bg; sc.children.forEach((o, i) => { o.visible = vis[i]; });
        const pass = (from, to, x, y) => { s.blur.uniforms.tMap.value = from.texture; s.blur.uniforms.uStep.value.set(x, y); rnd.setRenderTarget(to); rnd.render(s.quad, s.quadCam); };
        pass(s.depth, s.a, 1.1 / 256, 0); pass(s.a, s.tight, 0, 1.1 / 256);
        pass(s.tight, s.b, 2.6 / 128, 0); pass(s.b, s.wide, 0, 2.6 / 128);
        rnd.setRenderTarget(prev); rnd.setClearColor(col, alpha);
        s.planes.forEach(p => { p.visible = true; });
    }

    // Once a frame, before the picture is drawn. target: the point the camera circles.
    update(camera, target, dt) {
        if (!this.mode) return;
        this.t += dt;
        if (this.mode === 'spotlight') this.updateSpotlight(camera, target, dt);
        else if (this.shadowDirty && this.car && this.car.group.parent === this.scene) { this.shadowDirty = false; this.renderShadow(); }
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
