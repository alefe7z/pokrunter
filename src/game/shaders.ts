/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

// -------------------------------------------------------------
// Procedural Canvas Texture Generators for Anime Cel-Shaded Look
// -------------------------------------------------------------

// 1. Stylized Anime Grass Texture with painted blade strokes & color variations
export function generateStylizedGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base lush grass gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#4ade80');
  grad.addColorStop(0.5, '#22c55e');
  grad.addColorStop(1, '#16a34a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Stylized painterly grass patches
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const len = 12 + Math.random() * 18;
    const angle = (Math.random() - 0.5) * 0.5 - Math.PI / 2;

    ctx.strokeStyle = Math.random() > 0.4 ? '#86efac' : '#15803d';
    ctx.lineWidth = 2 + Math.random() * 2;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  // Tiny scattered wildflower dots (yellow and white, like the screenshot!)
  for (let i = 0; i < 90; i++) {
    const fx = Math.random() * 512;
    const fy = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.3 ? '#facc15' : '#ffffff';
    ctx.beginPath();
    ctx.arc(fx, fy, 2.5 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
    // Center dot
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(fx, fy, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 2. Stylized Cliff Rock Strata Texture (Reddish-brown Mediterranean cliffs from screenshot)
export function generateCliffRockTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base earth reddish-terracotta
  ctx.fillStyle = '#9a3412';
  ctx.fillRect(0, 0, 512, 512);

  // Horizontal geological strata bands
  for (let y = 0; y < 512; y += 14 + Math.random() * 20) {
    const bandHeight = 8 + Math.random() * 14;
    const colors = ['#7c2d12', '#b45309', '#c2410c', '#672108', '#d97706'];
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 512; x += 32) {
      const wobble = Math.sin(x * 0.05) * 4 + (Math.random() - 0.5) * 3;
      ctx.lineTo(x, y + wobble);
    }
    ctx.lineTo(512, y + bandHeight);
    ctx.lineTo(0, y + bandHeight);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 3. Sandy Shoreline Texture
export function generateSandTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#fde047';
  ctx.fillRect(0, 0, 256, 256);

  // Gentle wave ripple lines
  for (let y = 0; y < 256; y += 12) {
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 256; x += 20) {
      ctx.lineTo(x, y + Math.sin(x * 0.1) * 3);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 4. Stylized Painted Wood for Fences
export function generateWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f8fafc'; // White painted wood
  ctx.fillRect(0, 0, 256, 256);

  // Soft wood grain lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  for (let x = 0; x < 256; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 6, 256);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 5. Stylized Anime Eyes Face Decal Texture
export function generateTrainerFaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Skin background
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(0, 0, 256, 256);

  // Left & Right Big Anime Eyes (Nintendo style!)
  const drawEye = (cx: number, cy: number) => {
    // White eye base
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 28, 38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    // Iris (Deep navy blue)
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 20, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(cx, cy + 6, 12, 0, Math.PI * 2);
    ctx.fill();

    // White shine catchlights (Classic anime sparkle!)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 6, cy - 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 8, cy + 12, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Eyelash upper arc
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy - 4, 32, -Math.PI * 0.85, -Math.PI * 0.15);
    ctx.stroke();
  };

  drawEye(80, 110);
  drawEye(176, 110);

  // Cute Eyebrows
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(80, 68, 22, -Math.PI * 0.75, -Math.PI * 0.25);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(176, 68, 22, -Math.PI * 0.75, -Math.PI * 0.25);
  ctx.stroke();

  // Gentle anime smile
  ctx.strokeStyle = '#9a3412';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(128, 175, 18, 0.1, Math.PI - 0.1);
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
  ctx.beginPath();
  ctx.ellipse(60, 145, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(196, 145, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 6. Stylized Anime Tree Bark Texture (Rich organic furrows, moss patches & knots)
export function generateBarkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep rich earth-bark base gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, '#382012');
  grad.addColorStop(0.5, '#452614');
  grad.addColorStop(1, '#2c170b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Vertical organic bark grooves and ridges
  for (let x = 0; x < 512; x += 6 + Math.random() * 8) {
    const furrowWidth = 2 + Math.random() * 4;
    const furrowColor = Math.random() > 0.4 ? '#231207' : '#523019';
    ctx.strokeStyle = furrowColor;
    ctx.lineWidth = furrowWidth;
    ctx.beginPath();
    let cx = x;
    ctx.moveTo(cx, 0);
    for (let y = 0; y <= 512; y += 24) {
      cx += (Math.random() - 0.5) * 5;
      ctx.lineTo(cx, y);
    }
    ctx.stroke();
  }

  // Soft moss & lichen green patches (classic Ghibli/Pokemon anime forest aesthetic!)
  for (let m = 0; m < 35; m++) {
    const mx = Math.random() * 512;
    const my = Math.random() * 512;
    const mr = 10 + Math.random() * 22;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(34, 197, 94, 0.35)' : 'rgba(21, 128, 61, 0.4)';
    ctx.beginPath();
    ctx.ellipse(mx, my, mr, mr * 1.6, (Math.random() - 0.5) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 7. Stylized Forest Soil & Trail Texture (Loam, moss & fallen leaf flakes)
export function generateForestPathTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#452a1a'; // Rich forest humus earth
  ctx.fillRect(0, 0, 512, 512);

  // Dappled patches of green moss creeping into soil
  for (let i = 0; i < 60; i++) {
    const px = Math.random() * 512;
    const py = Math.random() * 512;
    const pr = 14 + Math.random() * 28;
    ctx.fillStyle = Math.random() > 0.3 ? 'rgba(34, 197, 94, 0.28)' : 'rgba(74, 222, 128, 0.2)';
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tiny scattered forest pebbles & twigs
  for (let p = 0; p < 80; p++) {
    const px = Math.random() * 512;
    const py = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? '#78716c' : '#29180d';
    ctx.beginPath();
    ctx.ellipse(px, py, 2.5 + Math.random() * 2, 1.5 + Math.random() * 1.5, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// -------------------------------------------------------------
// Cel-Shading Stepped Lighting & Outline Material Helpers
// -------------------------------------------------------------

// Shared 3-step anime lighting ramp
let animeGradientMap: THREE.DataTexture | null = null;
export function getAnimeGradientMap(): THREE.DataTexture {
  if (animeGradientMap) return animeGradientMap;
  const size = 3;
  // Step 1: Deep shadow, Step 2: Mid-tone, Step 3: Direct sunlight
  const data = new Uint8Array([
    90, 95, 120, 255,     // Soft ambient shadow
    175, 180, 195, 255,   // Anime midtone
    255, 255, 255, 255,   // Crisp anime highlight
  ]);
  const texture = new THREE.DataTexture(data, size, 1, THREE.RGBAFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  animeGradientMap = texture;
  return texture;
}

// Create Cel-Shading Anime Material with Stepped Ramp
export function createCelMaterial(
  color: string | number,
  map?: THREE.Texture | null,
  roughness: number = 0.5
): THREE.MeshToonMaterial {
  const gradientMap = getAnimeGradientMap();
  const mat = new THREE.MeshToonMaterial({
    color,
    map: map || null,
    gradientMap,
  });
  return mat;
}

// Inverted Hull Cel-Outline Helper (Game Freak Nintendo 3DS Technique!)
export function attachCelOutline(
  mesh: THREE.Mesh,
  thickness: number = 0.035,
  outlineColor: string = '#1e1b4b'
): THREE.Mesh {
  const outlineMat = new THREE.MeshBasicMaterial({
    color: outlineColor,
    side: THREE.BackSide,
  });

  const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMat);
  outlineMesh.scale.multiplyScalar(1 + thickness);
  mesh.add(outlineMesh);
  return outlineMesh;
}

// -------------------------------------------------------------
// WIND-REACTIVE LIVING VEGETATION SHADER (Dynamic Grass & Shrubs)
// -------------------------------------------------------------
export interface WindUniforms {
  uTime: { value: number };
  uPlayerPos: { value: THREE.Vector3 };
}

export function createWindVegetationMaterial(
  color: string | number,
  uniforms: WindUniforms
): THREE.MeshToonMaterial {
  const gradientMap = getAnimeGradientMap();
  const mat = new THREE.MeshToonMaterial({
    color,
    gradientMap,
    side: THREE.DoubleSide,
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uPlayerPos = uniforms.uPlayerPos;

    shader.vertexShader = `
      uniform float uTime;
      uniform vec3 uPlayerPos;
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>

      #ifdef USE_INSTANCING
        vec4 instWorldPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      #else
        vec4 instWorldPos = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      #endif

      // Living wind sway wave
      float windWave = sin(uTime * 3.4 + instWorldPos.x * 0.45 + instWorldPos.z * 0.35);
      float gust = cos(uTime * 1.8 + instWorldPos.x * 0.2) * 0.5 + 0.5;
      float heightFactor = pow(clamp(position.y / 1.1, 0.0, 1.0), 1.5);

      transformed.x += (windWave * 0.38 + gust * 0.25) * heightFactor;
      transformed.z += (sin(uTime * 2.4 + instWorldPos.z * 0.35) * 0.25) * heightFactor;

      // Real-time player trample interaction (living grass responds to player presence!)
      float playerDist = distance(instWorldPos.xz, uPlayerPos.xz);
      if (playerDist < 1.7) {
        float pushStrength = (1.0 - playerDist / 1.7) * heightFactor * 1.5;
        vec2 pushDir = normalize(instWorldPos.xz - uPlayerPos.xz + vec2(0.0001));
        transformed.x += pushDir.x * pushStrength;
        transformed.z += pushDir.y * pushStrength;
        transformed.y -= pushStrength * 0.38;
      }
      `
    );
  };

  return mat;
}

// -------------------------------------------------------------
// DYNAMIC ANIME TREE FOLIAGE SHADER (Multi-Harmonic Wind & Leaf Flutter)
// -------------------------------------------------------------
export function createTreeFoliageMaterial(
  color: string | number,
  uniforms: WindUniforms,
  flutterScale: number = 1.0
): THREE.MeshToonMaterial {
  const gradientMap = getAnimeGradientMap();
  const mat = new THREE.MeshToonMaterial({
    color,
    gradientMap,
    side: THREE.DoubleSide,
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uPlayerPos = uniforms.uPlayerPos;

    shader.vertexShader = `
      uniform float uTime;
      uniform vec3 uPlayerPos;
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>

      #ifdef USE_INSTANCING
        vec4 treeWorldPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      #else
        vec4 treeWorldPos = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      #endif

      // 1. Primary bough wave (smooth organic sway of large tree branches)
      float mainSway = sin(uTime * 1.6 + treeWorldPos.x * 0.12 + treeWorldPos.z * 0.14) * 0.28;
      float windGust = cos(uTime * 2.6 + treeWorldPos.x * 0.18) * 0.16;

      // 2. High-frequency fluttering foliage leaves (Anime / Ghibli wind effect!)
      float leafFlutter = sin(uTime * 5.2 + position.x * 3.5 + position.y * 2.8) * 0.07 * ${flutterScale.toFixed(2)};
      float crossFlutter = cos(uTime * 4.4 + position.z * 3.2) * 0.05 * ${flutterScale.toFixed(2)};

      // Foliage deflection scales smoothly with local tree crown position
      float heightFactor = clamp(position.y / 3.0, 0.35, 1.4);

      transformed.x += (mainSway + windGust + leafFlutter) * heightFactor;
      transformed.z += (cos(uTime * 1.35 + treeWorldPos.z * 0.15) * 0.2 + crossFlutter) * heightFactor;
      transformed.y += sin(uTime * 2.0 + position.x * 1.5) * 0.035 * heightFactor;
      `
    );
  };

  return mat;
}

// -------------------------------------------------------------
// DYNAMIC HANGING LIANA / VINE SHADER (Pendulum Swaying in Breeze)
// -------------------------------------------------------------
export function createHangingVineMaterial(
  color: string | number,
  uniforms: WindUniforms
): THREE.MeshToonMaterial {
  const gradientMap = getAnimeGradientMap();
  const mat = new THREE.MeshToonMaterial({
    color,
    gradientMap,
    side: THREE.DoubleSide,
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;

    shader.vertexShader = `
      uniform float uTime;
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>

      #ifdef USE_INSTANCING
        vec4 vineWorldPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      #else
        vec4 vineWorldPos = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      #endif

      // Vine pendulum sway: bottom tip of the hanging vine has the largest swing arc!
      // For a centered cylinder of height ~2.0-3.0, displacement increases as position.y decreases
      float hangWeight = pow(clamp((2.0 - position.y) / 3.0, 0.05, 1.6), 1.4);

      float pendulum = sin(uTime * 2.2 + vineWorldPos.x * 0.3 + vineWorldPos.z * 0.25) * hangWeight * 0.32;
      float crossSway = cos(uTime * 1.8 + vineWorldPos.z * 0.4) * hangWeight * 0.18;

      transformed.x += pendulum;
      transformed.z += crossSway;
      `
    );
  };

  return mat;
}

// Generates a multi-blade grass clump geometry for dense instanced rendering
export function createGrassBladeClumpGeometry(): THREE.BufferGeometry {
  const bladePositions: number[] = [];
  const bladeNormals: number[] = [];
  const bladeIndices: number[] = [];

  const bladesCount = 5;
  let vertOffset = 0;

  for (let b = 0; b < bladesCount; b++) {
    const angle = (b / bladesCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const height = 0.85 + Math.random() * 0.4;
    const width = 0.09 + Math.random() * 0.04;
    const curve = 0.25 + Math.random() * 0.2;

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // 4 vertical segments per blade for smooth organic bending
    const segs = 3;
    for (let s = 0; s <= segs; s++) {
      const t = s / segs;
      const y = t * height;
      const w = width * (1.0 - t * 0.75); // taper to tip
      const lean = t * t * curve;

      // Left vertex
      const lx = cosA * lean - sinA * (w * 0.5);
      const lz = sinA * lean + cosA * (w * 0.5);
      bladePositions.push(lx, y, lz);
      bladeNormals.push(0, 1, 0);

      // Right vertex
      const rx = cosA * lean + sinA * (w * 0.5);
      const rz = sinA * lean - cosA * (w * 0.5);
      bladePositions.push(rx, y, rz);
      bladeNormals.push(0, 1, 0);

      if (s < segs) {
        const v0 = vertOffset + s * 2;
        const v1 = vertOffset + s * 2 + 1;
        const v2 = vertOffset + (s + 1) * 2;
        const v3 = vertOffset + (s + 1) * 2 + 1;

        bladeIndices.push(v0, v1, v2);
        bladeIndices.push(v1, v3, v2);
      }
    }

    vertOffset += (segs + 1) * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(bladePositions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(bladeNormals, 3));
  geo.setIndex(bladeIndices);
  geo.computeVertexNormals();
  return geo;
}

// Generates wild shrub & bush ("matinho selvagem") geometry
export function createWildShrubGeometry(): THREE.BufferGeometry {
  const geo = new THREE.DodecahedronGeometry(0.65, 1);
  geo.scale(1.2, 0.7, 1.2);
  geo.translate(0, 0.45, 0);
  return geo;
}

// -------------------------------------------------------------
// ANIME SKY DOME SHADER (Dynamic 24-Hour Day/Night Cycle)
// Day, Sunset/Dusk, Twinkling Starry Night, Dawn & Moon Disc
// -------------------------------------------------------------
export interface SkyDomeUniforms {
  uTime: { value: number };
  uSunPosition: { value: THREE.Vector3 };
  uMoonPosition: { value: THREE.Vector3 };
  uTimeOfDay: { value: number };
  uSkyTopColor: { value: THREE.Color };
  uSkyBottomColor: { value: THREE.Color };
  uCloudHighlightColor: { value: THREE.Color };
  uCloudShadowColor: { value: THREE.Color };
  uSunColor: { value: THREE.Color };
  uStarIntensity: { value: number };
  uRayIntensity: { value: number };
}

export function createAnimeSkyDomeMaterial(
  uTimeRef: { value: number },
  skyUniforms?: Partial<SkyDomeUniforms>
): THREE.ShaderMaterial {
  const vertexShader = `
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uSunPosition;
    uniform vec3 uMoonPosition;
    uniform float uTimeOfDay;
    uniform vec3 uSkyTopColor;
    uniform vec3 uSkyBottomColor;
    uniform vec3 uCloudHighlightColor;
    uniform vec3 uCloudShadowColor;
    uniform vec3 uSunColor;
    uniform float uStarIntensity;
    uniform float uRayIntensity;

    // Fast hash & 2D noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    float fbm(vec2 p) {
      float v = 0.0;
      v += 0.5000 * noise(p); p *= 2.02;
      v += 0.2500 * noise(p); p *= 2.03;
      v += 0.1250 * noise(p); p *= 2.01;
      v += 0.0625 * noise(p);
      return v;
    }

    // Procedural Anime Twinkling Stars
    float stars(vec3 dir, float t) {
      vec2 uv = dir.xz / (abs(dir.y) + 0.35) * 55.0;
      vec2 grid = floor(uv);
      vec2 sub = fract(uv) - 0.5;
      float rnd = hash(grid);
      if (rnd > 0.88) {
        float dist = length(sub);
        float twinkle = sin(t * 3.5 + rnd * 62.8) * 0.4 + 0.6;
        float brightness = pow(max(0.0, 1.0 - dist * 3.5), 3.0);
        return brightness * twinkle * ((rnd - 0.88) / 0.12);
      }
      return 0.0;
    }

    void main() {
      vec3 dir = normalize(vWorldPosition);
      float h = clamp(dir.y, -0.1, 1.0);

      // 1. Dynamic Sky Gradient from Zenith to Horizon
      vec3 sky = mix(uSkyBottomColor, uSkyTopColor, clamp(h * 1.8, 0.0, 1.0));

      // 2. Twinkling Star Field (Becomes brilliant as night falls)
      if (uStarIntensity > 0.01 && h > 0.08) {
        float starVal = stars(dir, uTime);
        // Add subtle nebula dust
        float nebula = fbm(dir.xz * 2.5) * 0.15;
        vec3 starColor = mix(vec3(0.9, 0.95, 1.0), vec3(0.7, 0.85, 1.0), hash(dir.xz * 10.0));
        sky += (starColor * starVal * 2.2 + vec3(0.12, 0.08, 0.28) * nebula) * uStarIntensity;
      }

      // 3. Distant Mountain Silhouettes (Dusk/Dawn rim, dark indigo at night)
      if (h > -0.02 && h < 0.11) {
        float mNoise = fbm(vec2(dir.x * 5.5, dir.z * 5.5)) * 0.075 + 0.015;
        if (h < mNoise) {
          float mFactor = clamp(h / mNoise, 0.0, 1.0);
          vec3 dayMountain = mix(vec3(0.28, 0.52, 0.44), vec3(0.55, 0.74, 0.82), mFactor);
          vec3 nightMountain = mix(vec3(0.04, 0.06, 0.14), vec3(0.08, 0.12, 0.22), mFactor);
          vec3 sunsetMountain = mix(vec3(0.35, 0.18, 0.25), vec3(0.72, 0.38, 0.35), mFactor);

          vec3 mountainCol = mix(dayMountain, sunsetMountain, clamp((1.0 - uRayIntensity) * 0.7, 0.0, 1.0));
          mountainCol = mix(mountainCol, nightMountain, uStarIntensity);
          sky = mountainCol;
        }
      }

      // 4. Volumetric Anime Cumulus Clouds
      if (h > 0.04) {
        vec2 cloudCoord = (dir.xz / (dir.y + 0.4)) * 2.2;
        cloudCoord.x += uTime * 0.022; // gentle cloud drift
        cloudCoord.y += uTime * 0.006;

        float n = fbm(cloudCoord * 1.6);
        float billow = fbm(cloudCoord * 3.2 + vec2(n * 0.4, 0.0));
        float cloudDensity = smoothstep(0.44, 0.72, n * 0.65 + billow * 0.35);

        // Anime 3-Tone Cloud Shading (Sunlit / Sunset / Night Silhouettes)
        float lightStep = smoothstep(0.48, 0.65, n);
        vec3 cloudCol = mix(uCloudShadowColor, uCloudHighlightColor, lightStep);

        float horizonFade = smoothstep(0.04, 0.22, h);
        sky = mix(sky, cloudCol, cloudDensity * horizonFade * 0.94);
      }

      // 5. Sun Celestial Disc & Crepuscular God Rays
      vec3 sunDir = normalize(uSunPosition);
      if (sunDir.y > -0.15) {
        float sunDot = max(0.0, dot(dir, sunDir));

        // Angled god ray light shafts (Fade at night)
        if (uRayIntensity > 0.05) {
          vec2 rayUv = vec2(dot(dir, vec3(0.7, 0.2, -0.6)) * 4.0, dir.y * 2.5);
          float rayNoise = fbm(rayUv * 2.0 + vec2(uTime * 0.04, 0.0));
          float godRay = pow(sunDot, 3.2) * smoothstep(0.3, 0.75, rayNoise);
          sky += uSunColor * godRay * 0.38 * uRayIntensity;
        }

        // Sun Disc & Corona Glow
        float sunCorona = pow(sunDot, 12.0) * 0.48;
        float sunDisc = smoothstep(0.9985, 0.9998, sunDot);
        sky += uSunColor * (sunCorona + sunDisc * 1.4);
      }

      // 6. Moon Celestial Disc & Silvery Lunar Corona (Visible at night/dusk)
      vec3 moonDir = normalize(uMoonPosition);
      if (moonDir.y > -0.1) {
        float moonDot = max(0.0, dot(dir, moonDir));
        if (moonDot > 0.8) {
          float moonCorona = pow(moonDot, 18.0) * 0.5 * uStarIntensity;
          float moonDisc = smoothstep(0.9982, 0.9997, moonDot);
          // Moon surface crater shading
          float crater = fbm(dir.xy * 30.0) * 0.25;
          vec3 moonColor = vec3(0.94, 0.97, 1.0) - crater;
          sky += (moonColor * moonDisc * 1.6 + vec3(0.65, 0.8, 1.0) * moonCorona) * uStarIntensity;
        }
      }

      gl_FragColor = vec4(sky, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: uTimeRef,
      uSunPosition: skyUniforms?.uSunPosition || { value: new THREE.Vector3(45, 65, 40) },
      uMoonPosition: skyUniforms?.uMoonPosition || { value: new THREE.Vector3(-45, -65, -40) },
      uTimeOfDay: skyUniforms?.uTimeOfDay || { value: 12.0 },
      uSkyTopColor: skyUniforms?.uSkyTopColor || { value: new THREE.Color('#0284c7') },
      uSkyBottomColor: skyUniforms?.uSkyBottomColor || { value: new THREE.Color('#bae6fd') },
      uCloudHighlightColor: skyUniforms?.uCloudHighlightColor || { value: new THREE.Color('#ffffff') },
      uCloudShadowColor: skyUniforms?.uCloudShadowColor || { value: new THREE.Color('#93c5fd') },
      uSunColor: skyUniforms?.uSunColor || { value: new THREE.Color('#fffbeb') },
      uStarIntensity: skyUniforms?.uStarIntensity || { value: 0.0 },
      uRayIntensity: skyUniforms?.uRayIntensity || { value: 1.0 },
    },
    side: THREE.BackSide,
    depthWrite: false,
  });
}

// -------------------------------------------------------------
// GOLDEN WHEAT / TALL GRASS STALK GEOMETRY (From reference foreground!)
// -------------------------------------------------------------
export function createGoldenWheatStalkGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  // Thin flexible stem + golden wheat seed ear at top
  const height = 1.35;
  const segs = 4;
  let vOffset = 0;

  // Stem
  for (let s = 0; s <= segs; s++) {
    const t = s / segs;
    const y = t * height;
    const curve = t * t * 0.25;
    const w = 0.03 * (1.0 - t * 0.4);

    positions.push(-w, y, curve);
    normals.push(0, 1, 0);
    positions.push(w, y, curve);
    normals.push(0, 1, 0);

    if (s < segs) {
      indices.push(vOffset + s * 2, vOffset + s * 2 + 1, vOffset + (s + 1) * 2);
      indices.push(vOffset + s * 2 + 1, vOffset + (s + 1) * 2 + 1, vOffset + (s + 1) * 2);
    }
  }
  vOffset += (segs + 1) * 2;

  // Golden wheat grains arrayed along top 40% of stem
  const grains = 6;
  for (let g = 0; g < grains; g++) {
    const gy = height * 0.65 + g * 0.08;
    const side = (g % 2 === 0 ? 1 : -1) * 0.08;
    const gw = 0.05;
    const gh = 0.07;

    const baseIdx = vOffset;
    positions.push(side, gy, 0.2);
    positions.push(side + gw * (side > 0 ? 1 : -1), gy + gh * 0.5, 0.2);
    positions.push(side, gy + gh, 0.2);
    normals.push(0, 0, 1);
    normals.push(0, 0, 1);
    normals.push(0, 0, 1);

    indices.push(baseIdx, baseIdx + 1, baseIdx + 2);
    vOffset += 3;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export interface OceanUniforms {
  uTime: { value: number };
  uSunPosition: { value: THREE.Vector3 };
  uSkyReflectColor: { value: THREE.Color };
  uSunSpecColor: { value: THREE.Color };
}

export function createRealisticOceanMaterial(
  uTimeRef: { value: number },
  oceanUniforms?: Partial<OceanUniforms>
): THREE.ShaderMaterial {
  const vertexShader = `
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vWaveHeight;
    uniform float uTime;

    // Gerstner Trochoidal Wave Function
    vec3 gerstnerWave(vec2 dir, float steepness, float wavelength, inout vec3 tangent, inout vec3 binormal, vec3 p) {
      float k = 6.28318 / wavelength;
      float c = sqrt(9.8 / k);
      vec2 d = normalize(dir);
      float f = k * (dot(d, p.xz) - c * uTime * 0.45);
      float a = steepness / k;

      tangent += vec3(
        -d.x * d.x * (steepness * sin(f)),
        d.x * (steepness * cos(f)),
        -d.x * d.y * (steepness * sin(f))
      );
      binormal += vec3(
        -d.x * d.y * (steepness * sin(f)),
        d.y * (steepness * cos(f)),
        -d.y * d.y * (steepness * sin(f))
      );

      return vec3(
        d.x * (a * cos(f)),
        a * sin(f),
        d.y * (a * cos(f))
      );
    }

    void main() {
      vUv = uv;
      vec3 p = position;
      vec3 tangent = vec3(1.0, 0.0, 0.0);
      vec3 binormal = vec3(0.0, 0.0, 1.0);

      // 4 Layered Gerstner Wave Trains
      vec3 w1 = gerstnerWave(vec2(0.85, 0.25), 0.24, 15.0, tangent, binormal, p);
      vec3 w2 = gerstnerWave(vec2(0.65, -0.35), 0.18, 9.5, tangent, binormal, p);
      vec3 w3 = gerstnerWave(vec2(1.0, 0.08), 0.14, 5.5, tangent, binormal, p);
      vec3 w4 = gerstnerWave(vec2(-0.25, 0.85), 0.08, 3.4, tangent, binormal, p);

      vec3 waveTotal = w1 + w2 + w3 + w4;
      p += waveTotal;
      vWaveHeight = waveTotal.y;

      vec3 norm = normalize(cross(binormal, tangent));
      vNormal = normalize(normalMatrix * norm);

      vec4 worldPos = modelMatrix * vec4(p, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vWaveHeight;
    uniform float uTime;
    uniform vec3 uSunPosition;
    uniform vec3 uSkyReflectColor;
    uniform vec3 uSunSpecColor;

    // Fast noise for water ripple caustics & foam
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec3 sunDir = normalize(uSunPosition);

      // 1. Fresnel Reflection Factor
      float fresnel = pow(1.0 - max(0.0, dot(vNormal, viewDir)), 3.2);

      // 2. Depth Gradient: Shallow Tropical Turquoise -> Deep Sapphire Blue
      float depthFactor = clamp((56.0 - vWorldPosition.x) / 35.0, 0.0, 1.0);
      vec3 shallowColor = vec3(0.08, 0.78, 0.88); // Radiant cyan-turquoise
      vec3 midWaterColor = vec3(0.02, 0.48, 0.82);// Cerulean blue
      vec3 deepColor = vec3(0.01, 0.16, 0.42);    // Deep oceanic sapphire

      vec3 waterBase = mix(shallowColor, midWaterColor, depthFactor);
      waterBase = mix(waterBase, deepColor, clamp(depthFactor * 1.5 - 0.4, 0.0, 1.0));

      // 3. Shimmering Underwater Caustics
      vec2 causticCoord = vWorldPosition.xz * 0.75 + vec2(uTime * 0.35, -uTime * 0.25);
      float c1 = noise(causticCoord);
      float c2 = noise(causticCoord * 1.8 - vec2(uTime * 0.2, uTime * 0.3));
      float caustic = pow(min(c1, c2), 1.8) * 0.35 * (1.0 - depthFactor * 0.6);
      waterBase += vec3(0.35, 0.85, 0.98) * caustic;

      // 4. White Cresting Wave Foam & Shoreline Breakers (Espuma do mar)
      float foamNoise = noise(vWorldPosition.xz * 1.4 + vec2(uTime * 0.6, uTime * 0.4));
      float waveFoam = smoothstep(0.26, 0.42, vWaveHeight + foamNoise * 0.15);

      // Shoreline breaking surf foam (rolling onto beach sand at x ~ 48 to 56)
      float shoreDist = abs(vWorldPosition.x - 52.0);
      float shoreWave = sin(vWorldPosition.z * 0.35 - uTime * 2.2) * 1.8;
      float shoreFoam = smoothstep(2.5, 0.2, shoreDist + shoreWave) * 0.85;

      float totalFoam = clamp(waveFoam * 0.9 + shoreFoam, 0.0, 1.0);
      vec3 foamColor = vec3(0.96, 0.98, 1.0);
      waterBase = mix(waterBase, foamColor, totalFoam);

      // 5. Sun / Moon Specular Reflection & Glistening Highlights
      vec3 halfVec = normalize(sunDir + viewDir);
      float spec = pow(max(0.0, dot(vNormal, halfVec)), 80.0) * 1.8;

      // 6. Sky Fresnel Reflection
      vec3 finalColor = mix(waterBase, uSkyReflectColor, fresnel * 0.55);
      finalColor += uSunSpecColor * spec;

      // Opacity
      float opacity = mix(0.85, 0.96, clamp(depthFactor, 0.0, 1.0));

      gl_FragColor = vec4(finalColor, opacity);
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: uTimeRef,
      uSunPosition: oceanUniforms?.uSunPosition || { value: new THREE.Vector3(45, 65, 40) },
      uSkyReflectColor: oceanUniforms?.uSkyReflectColor || { value: new THREE.Color('#48d2fa') },
      uSunSpecColor: oceanUniforms?.uSunSpecColor || { value: new THREE.Color('#fffbeb') },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: true,
  });
}
