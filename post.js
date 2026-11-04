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
varying vec2 vUv;
void main() {
  // motion blur: average a few samples back towards the centre of view, more at the edges and more at speed
  vec2 d = vUv - centre; float edge = smoothstep(0.08, 0.6, length(d));
  vec3 c = vec3(0.0); float wsum = 0.0;
  for (int i = 0; i < 6; i++) { float t = float(i) / 5.0; float w = 1.0 - t * 0.6; c += texture2D(src, vUv - d * t * blur * edge * 0.09).rgb * w; wsum += w; }
  c /= wsum;
  c += texture2D(glow, vUv).rgb * glowAmt;
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
        this.scene = new THREE.WebGLRenderTarget(4, 4, opts);
        const small = { type: this.type, depthBuffer: false };
        this.a = new THREE.WebGLRenderTarget(4, 4, small); this.b = new THREE.WebGLRenderTarget(4, 4, small);
        this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); this.quad.frustumCulled = false;
        this.holder = new THREE.Scene(); this.holder.add(this.quad);
        const mat = (frag, uniforms, toneMapped = false) => new THREE.ShaderMaterial({ vertexShader: FULL_VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false, toneMapped });
        this.brightMat = mat(BRIGHT, { src: { value: null }, threshold: { value: canFloat ? 1.1 : 0.85 } });
        this.blurMat = mat(BLUR, { src: { value: null }, dir: { value: new THREE.Vector2() } });
        this.finalMat = mat(FINAL, { src: { value: null }, glow: { value: null }, glowAmt: { value: 0.55 }, blur: { value: 0 }, vignette: { value: 0.35 }, sat: { value: 1.08 }, centre: { value: new THREE.Vector2(0.5, 0.52) } }, true);
        this.w = 0; this.h = 0;
    }
    setSize(w, h) {
        // w, h in real pixels (canvas size times the pixel ratio)
        if (w === this.w && h === this.h) return; this.w = w; this.h = h;
        this.scene.setSize(w, h);
        const sw = Math.max(1, Math.round(w / 4)), sh = Math.max(1, Math.round(h / 4));
        this.a.setSize(sw, sh); this.b.setSize(sw, sh);
    }
    // call before drawing the 3D picture: everything drawn until finish() goes into the scene picture
    begin() { this.renderer.setRenderTarget(this.scene); this.renderer.clear(); }
    pass(material, target) { this.quad.material = material; this.renderer.setRenderTarget(target); this.renderer.render(this.holder, this.cam); }
    // speedFrac 0..1 sets the motion blur; glow 0..1 its strength (stronger at night)
    finish(speedFrac = 0, glow = 0.55) {
        const r = this.renderer, sw = this.a.width, sh = this.a.height;
        this.brightMat.uniforms.src.value = this.scene.texture; this.pass(this.brightMat, this.a);
        for (let i = 0; i < 2; i++) {
            this.blurMat.uniforms.src.value = this.a.texture; this.blurMat.uniforms.dir.value.set(1.6 / sw, 0); this.pass(this.blurMat, this.b);
            this.blurMat.uniforms.src.value = this.b.texture; this.blurMat.uniforms.dir.value.set(0, 1.6 / sh); this.pass(this.blurMat, this.a);
        }
        const u = this.finalMat.uniforms;
        u.src.value = this.scene.texture; u.glow.value = this.a.texture; u.glowAmt.value = glow;
        u.blur.value = Math.max(0, (speedFrac - 0.45) / 0.55);
        this.pass(this.finalMat, null);
    }
    dispose() { [this.scene, this.a, this.b].forEach(t => t.dispose()); [this.brightMat, this.blurMat, this.finalMat].forEach(m => m.dispose()); this.quad.geometry.dispose(); }
}
