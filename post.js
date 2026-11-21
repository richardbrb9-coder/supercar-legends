// Supercar Legends: "film camera" effects for the race, drawn after the 3D picture. A soft glow around the brightest things
// (lamps, tail lights, sunlit chrome and paint), motion blur towards the edges at speed, a gentle colour grade and a vignette.
// The scene is drawn into a picture of its own first; the glow is worked out on a quarter-size copy, so it stays cheap.
// Used on Medium and High graphics; Low draws straight to the screen as before.
import * as THREE from './lib/three.module.min.js';

const FULL_VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
// keep only what is brighter than the threshold (the scene picture is not yet tone-mapped, so lamps go well above 1)
const BRIGHT = `uniform sampler2D src; uniform float threshold; varying vec2 vUv;
void main() { vec3 c = texture2D(src, vUv).rgb; if (any(isnan(c)) || any(isinf(c))) c = vec3(0.0); c = clamp(c, 0.0, 40.0); float l = max(c.r, max(c.g, c.b));   // (guard against stray bad pixels)
 gl_FragColor = vec4(c * smoothstep(threshold, threshold * 1.8, l), 1.0); }`;
const BLUR = `uniform sampler2D src; uniform vec2 dir; varying vec2 vUv;
void main() {
  vec3 c = texture2D(src, vUv).rgb * 0.227;
  c += (texture2D(src, vUv + dir * 1.385).rgb + texture2D(src, vUv - dir * 1.385).rgb) * 0.316;
  c += (texture2D(src, vUv + dir * 3.231).rgb + texture2D(src, vUv - dir * 3.231).rgb) * 0.070;
  gl_FragColor = vec4(c, 1.0); }`;
const FINAL = `uniform sampler2D src; uniform sampler2D glow; uniform float glowAmt; uniform float blur; uniform float vignette; uniform float sat; uniform vec2 centre;
uniform sampler2D depthTex; uniform float hasDepth; uniform float camNear; uniform float camFar; uniform float focus; uniform float dofAmt; uniform sampler2D soft;
uniform vec2 sunUV; uniform float sunVis; uniform vec3 sunCol; uniform float aspect;
varying vec2 vUv;
float viewDist(vec2 uv) { float z = texture2D(depthTex, uv).x * 2.0 - 1.0; return 2.0 * camNear * camFar / (camFar + camNear - z * (camFar - camNear)); }
// a soft round blob for the lens flare's ghosts
float blob(vec2 p, float r) { vec2 d = (vUv - p) * vec2(aspect, 1.0); return smoothstep(r, r * 0.35, length(d)); }
void main() {
  // motion blur: average a few samples back towards the centre of view, more at the edges and more at speed
  vec2 d = vUv - centre; float edge = smoothstep(0.08, 0.6, length(d));
  vec3 c = vec3(0.0); float wsum = 0.0;
  for (int i = 0; i < 6; i++) { float t = float(i) / 5.0; float w = 1.0 - t * 0.6; c += texture2D(src, vUv - d * t * blur * edge * 0.09).rgb * w; wsum += w; }
  c /= wsum;
  // replays: like a TV camera's long lens, things far nearer or further than the car go soft
  if (dofAmt > 0.0 && hasDepth > 0.5) {
    float dist = viewDist(vUv), coc = clamp(abs(dist - focus) / (focus * 0.9 + 4.0), 0.0, 1.0) * dofAmt;
    c = mix(c, texture2D(soft, vUv).rgb, coc);
  }
  c += texture2D(glow, vUv).rgb * glowAmt;
  // the sun in a camera lens: a glow round it, a faint streak and a line of coloured ghosts through the middle of the
  // picture (only when the sun is in view and nothing is in front of it)
  if (sunVis > 0.0) {
    float open = 1.0;
    if (hasDepth > 0.5) {
      open = step(0.9999, texture2D(depthTex, sunUV).x) + step(0.9999, texture2D(depthTex, sunUV + vec2(0.008, 0.0)).x) + step(0.9999, texture2D(depthTex, sunUV - vec2(0.008, 0.0)).x)
           + step(0.9999, texture2D(depthTex, sunUV + vec2(0.0, 0.01)).x) + step(0.9999, texture2D(depthTex, sunUV - vec2(0.0, 0.01)).x);
      open /= 5.0;
    }
    float v = sunVis * open;
    if (v > 0.0) {
      vec2 d = (vUv - sunUV) * vec2(aspect, 1.0); float r = length(d);
      c += sunCol * v * (0.55 * exp(-r * 9.0) + 0.12 * exp(-r * 2.5) + 0.06 * exp(-abs(d.y) * 60.0) * exp(-abs(d.x) * 1.8));
      vec2 axis = vec2(0.5) - sunUV;
      c += vec3(1.0, 0.75, 0.45) * v * 0.07 * blob(sunUV + axis * 0.55, 0.035);
      c += vec3(0.55, 0.85, 1.0) * v * 0.05 * blob(sunUV + axis * 1.25, 0.06);
      c += vec3(0.7, 1.0, 0.7) * v * 0.04 * blob(sunUV + axis * 1.6, 0.02);
      c += vec3(1.0, 0.6, 0.9) * v * 0.035 * (blob(sunUV + axis * 2.05, 0.11) - blob(sunUV + axis * 2.05, 0.095));
    }
  }
  // a gentle grade: a little more colour, then the same film tone curve the race always uses
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = mix(vec3(l), c, sat);
  gl_FragColor = vec4(c, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  // vignette: the corners a touch darker, like a camera lens
  float v = smoothstep(0.95, 0.35, length((vUv - 0.5) * vec2(1.25, 1.0)));
  gl_FragColor.rgb *= mix(1.0, v, vignette);
}`;

export class Post {
    constructor(renderer) {
        this.renderer = renderer;
        const gl = renderer.getContext(), canFloat = renderer.capabilities.isWebGL2 && !!gl.getExtension('EXT_color_buffer_float');
        this.type = canFloat ? THREE.HalfFloatType : THREE.UnsignedByteType;
        const opts = { type: this.type, depthBuffer: true, samples: renderer.capabilities.isWebGL2 ? 2 : 0 };
        // the depth picture (how far away each point is) is kept on WebGL2, for the lens flare and the replays' soft focus
        if (renderer.capabilities.isWebGL2) { opts.depthTexture = new THREE.DepthTexture(4, 4); opts.depthTexture.type = THREE.UnsignedIntType; }
        this.scene = new THREE.WebGLRenderTarget(4, 4, opts);
        this.hasDepth = !!opts.depthTexture;
        const small = { type: this.type, depthBuffer: false };
        this.a = new THREE.WebGLRenderTarget(4, 4, small); this.b = new THREE.WebGLRenderTarget(4, 4, small);
        this.c = new THREE.WebGLRenderTarget(4, 4, small); this.d = new THREE.WebGLRenderTarget(4, 4, small);   // (a soft copy of the picture, for replays)
        this.copyMat = new THREE.ShaderMaterial({ vertexShader: FULL_VERT, fragmentShader: `uniform sampler2D src; varying vec2 vUv; void main() { gl_FragColor = vec4(texture2D(src, vUv).rgb, 1.0); }`, uniforms: { src: { value: null } }, depthTest: false, depthWrite: false, toneMapped: false });
        this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); this.quad.frustumCulled = false;
        this.holder = new THREE.Scene(); this.holder.add(this.quad);
        const mat = (frag, uniforms, toneMapped = false) => new THREE.ShaderMaterial({ vertexShader: FULL_VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false, toneMapped });
        this.brightMat = mat(BRIGHT, { src: { value: null }, threshold: { value: canFloat ? 1.1 : 0.85 } });
        this.blurMat = mat(BLUR, { src: { value: null }, dir: { value: new THREE.Vector2() } });
        this.finalMat = mat(FINAL, { src: { value: null }, glow: { value: null }, glowAmt: { value: 0.55 }, blur: { value: 0 }, vignette: { value: 0.35 }, sat: { value: 1.08 }, centre: { value: new THREE.Vector2(0.5, 0.52) },
            depthTex: { value: this.hasDepth ? this.scene.depthTexture : null }, hasDepth: { value: this.hasDepth ? 1 : 0 }, camNear: { value: 0.5 }, camFar: { value: 2000 }, focus: { value: 20 }, dofAmt: { value: 0 }, soft: { value: null },
            sunUV: { value: new THREE.Vector2() }, sunVis: { value: 0 }, sunCol: { value: new THREE.Color(1, 0.92, 0.8) }, aspect: { value: 1 } }, true);
        this.w = 0; this.h = 0;
    }
    setSize(w, h) {
        // w, h in real pixels (canvas size times the pixel ratio)
        if (w === this.w && h === this.h) return; this.w = w; this.h = h;
        this.scene.setSize(w, h);
        const sw = Math.max(1, Math.round(w / 4)), sh = Math.max(1, Math.round(h / 4));
        this.a.setSize(sw, sh); this.b.setSize(sw, sh); this.c.setSize(sw, sh); this.d.setSize(sw, sh);
        this.finalMat.uniforms.aspect.value = w / h;
    }
    // call before drawing the 3D picture: everything drawn until finish() goes into the scene picture
    begin() { this.renderer.setRenderTarget(this.scene); this.renderer.clear(); }
    pass(material, target) { this.quad.material = material; this.renderer.setRenderTarget(target); this.renderer.render(this.holder, this.cam); }
    // speedFrac 0..1 sets the motion blur; glow 0..1 its strength (stronger at night)
    // opts: { camera, sun: { uv: Vector2, vis: 0..1, colour }, focus: metres (replays: the car being filmed) }
    finish(speedFrac = 0, glow = 0.55, opts = {}) {
        const r = this.renderer, sw = this.a.width, sh = this.a.height;
        this.brightMat.uniforms.src.value = this.scene.texture; this.pass(this.brightMat, this.a);
        for (let i = 0; i < 2; i++) {
            this.blurMat.uniforms.src.value = this.a.texture; this.blurMat.uniforms.dir.value.set(1.6 / sw, 0); this.pass(this.blurMat, this.b);
            this.blurMat.uniforms.src.value = this.b.texture; this.blurMat.uniforms.dir.value.set(0, 1.6 / sh); this.pass(this.blurMat, this.a);
        }
        const u = this.finalMat.uniforms;
        // replays: a soft, blurred copy of the whole picture to fade to away from the focus
        u.dofAmt.value = opts.focus && this.hasDepth ? 0.6 : 0;
        if (u.dofAmt.value > 0) {
            this.copyMat.uniforms.src.value = this.scene.texture; this.pass(this.copyMat, this.c);
            for (let i = 0; i < 2; i++) {
                this.blurMat.uniforms.src.value = this.c.texture; this.blurMat.uniforms.dir.value.set(1.4 / sw, 0); this.pass(this.blurMat, this.d);
                this.blurMat.uniforms.src.value = this.d.texture; this.blurMat.uniforms.dir.value.set(0, 1.4 / sh); this.pass(this.blurMat, this.c);
            }
            u.soft.value = this.c.texture; u.focus.value = opts.focus;
        }
        if (opts.camera) { u.camNear.value = opts.camera.near; u.camFar.value = opts.camera.far; }
        const sun = opts.sun; u.sunVis.value = sun ? sun.vis : 0; if (sun) { u.sunUV.value.copy(sun.uv); if (sun.colour) u.sunCol.value.copy(sun.colour); }
        u.src.value = this.scene.texture; u.glow.value = this.a.texture; u.glowAmt.value = glow;
        u.blur.value = Math.max(0, (speedFrac - 0.45) / 0.55);
        this.pass(this.finalMat, null);
    }
    dispose() { if (this.scene.depthTexture) this.scene.depthTexture.dispose(); [this.scene, this.a, this.b, this.c, this.d].forEach(t => t.dispose()); [this.brightMat, this.blurMat, this.finalMat, this.copyMat].forEach(m => m.dispose()); this.quad.geometry.dispose(); }
}
