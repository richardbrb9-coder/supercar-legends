// Supercar Legends: live reflections. A small six-sided camera rides along just above your car and photographs the
// world around it (the road, kerbs, trees, grandstands, the other cars and the sky), so the paint, glass and chrome
// reflect where you really are, instead of a plain sky and a flat green ground.
// To stay smooth on tablets it takes only one of its six pictures each frame (a full refresh about ten times a second),
// at a small size, without redrawing shadows.
import * as THREE from './lib/three.module.min.js';

export class ReflectionProbe {
    constructor(renderer, size = 128, everyNth = 1) {
        this.renderer = renderer; this.everyNth = everyNth; this.tick = 0; this.face = 0; this.ready = false;
        const canFloat = renderer.capabilities.isWebGL2;
        this.rt = new THREE.WebGLCubeRenderTarget(size, { type: canFloat ? THREE.HalfFloatType : THREE.UnsignedByteType, generateMipmaps: false });
        this.cam = new THREE.CubeCamera(0.4, 260, this.rt);
        this.cam.coordinateSystem = renderer.coordinateSystem; this.cam.updateCoordinateSystem();
        this.texture = this.rt.texture;
        this.hidden = [];
    }
    // Take the next picture. pos: where the car is (the camera sits a little above its roof). hide: things not to photograph.
    // sky: the sky dome, which is far bigger than this camera can see, so it's shrunk round the camera while it photographs
    update(scene, pos, hide = [], sky = null) {
        if (++this.tick % this.everyNth) return;
        const r = this.renderer, cam = this.cam;
        cam.position.set(pos.x, 1.0, pos.z); cam.updateMatrixWorld(true);
        let skyPos = null, skyScale = 1;
        if (sky) { skyPos = sky.position.clone(); skyScale = sky.scale.x; sky.position.copy(cam.position); sky.scale.setScalar(0.1); sky.updateMatrixWorld(); }
        const vis = hide.map(o => o.visible); hide.forEach(o => { o.visible = false; });
        const prevTarget = r.getRenderTarget(), prevFace = r.getActiveCubeFace(), prevMip = r.getActiveMipmapLevel(), autoShadow = r.shadowMap.autoUpdate;
        r.shadowMap.autoUpdate = false;                          // (reuse the shadows already drawn this frame)
        // the first time, take all six pictures so nothing looks blank
        const faces = this.ready ? [this.face] : [0, 1, 2, 3, 4, 5];
        for (const f of faces) { r.setRenderTarget(this.rt, f); r.render(scene, cam.children[f]); }
        r.setRenderTarget(prevTarget, prevFace, prevMip); r.shadowMap.autoUpdate = autoShadow;
        hide.forEach((o, i) => { o.visible = vis[i]; });
        if (sky) { sky.position.copy(skyPos); sky.scale.setScalar(skyScale); sky.updateMatrixWorld(); }
        // (the picture straight down is only the road under the car, so after the first time it is skipped)
        this.face = (this.face + 1) % 6; if (this.face === 3) this.face = 4;
        // after the last face the blurred versions (for satin and matte paint) are worked out again
        if (!this.ready || this.face === 0) this.texture.needsPMREMUpdate = true;
        this.ready = true;
    }
    dispose() { this.rt.dispose(); }
}

// The materials on a car that should show the live reflections
export function reflectiveMaterials(model) {
    const m = model.mats, out = [];
    for (const k of ['paint', 'paintPlain', 'cabin', 'glass', 'chrome', 'rim', 'lens', 'head', 'tail', 'carbon', 'grille']) if (m[k]) out.push(m[k]);
    return out;
}

// Fine metallic flakes under the clear coat: a speckled bump picture that catches the sun in tiny glints
let FLAKE = null;
export function flakeTexture() {
    if (FLAKE) return FLAKE;
    const n = 256, c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d'), img = x.createImageData(n, n);
    for (let i = 0; i < n * n; i++) {
        // each flake tilts a random way: a normal map of small random slopes
        const a = Math.random() * Math.PI * 2, t = Math.random() * 0.55;
        img.data[i * 4] = 128 + Math.cos(a) * t * 127; img.data[i * 4 + 1] = 128 + Math.sin(a) * t * 127; img.data[i * 4 + 2] = 255; img.data[i * 4 + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    FLAKE = new THREE.CanvasTexture(c); FLAKE.wrapS = FLAKE.wrapT = THREE.RepeatWrapping; FLAKE.repeat.set(60, 24);
    FLAKE.colorSpace = THREE.NoColorSpace;
    return FLAKE;
}
