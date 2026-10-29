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
// ANIME SKY DOME SHADER (Matching user's reference image!)
// Makoto Shinkai / Studio Ghibli style with God Rays & Cumulus Clouds
// -------------------------------------------------------------
export function createAnimeSkyDomeMaterial(uTimeRef: { value: number }): THREE.ShaderMaterial {
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

    // Fast 2D simplex/fbm noise
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

    void main() {
      vec3 dir = normalize(vWorldPosition);
      float h = clamp(dir.y, -0.1, 1.0);

      // 1. Radiant Anime Sky Gradient (Deep Azure Zenith to Luminous Aquamarine Horizon)
      vec3 zenithColor = vec3(0.01, 0.52, 0.88); // #0284c7
      vec3 midColor = vec3(0.22, 0.74, 0.98);    // #38bdf8
      vec3 horizonColor = vec3(0.72, 0.89, 0.99);// #bae6fd
      vec3 mistColor = vec3(0.88, 0.96, 1.0);    // #e0f2fe

      vec3 sky = mix(horizonColor, midColor, clamp(h * 2.2, 0.0, 1.0));
      sky = mix(sky, zenithColor, clamp((h - 0.35) * 1.8, 0.0, 1.0));
      sky = mix(mistColor, sky, clamp(h * 5.0, 0.0, 1.0));

      // 2. Distant Soft Blue-Green Mountain Silhouettes (Matching reference horizon!)
      if (h > -0.02 && h < 0.12) {
        float mNoise = fbm(vec2(dir.x * 5.5, dir.z * 5.5)) * 0.075 + 0.015;
        if (h < mNoise) {
          float mFactor = clamp(h / mNoise, 0.0, 1.0);
          vec3 mountainCol = mix(vec3(0.28, 0.52, 0.44), vec3(0.55, 0.74, 0.82), mFactor);
          sky = mountainCol;
        }
      }

      // 3. Volumetric Anime Cumulus Clouds
      if (h > 0.04) {
        vec2 cloudCoord = (dir.xz / (dir.y + 0.4)) * 2.2;
        cloudCoord.x += uTime * 0.022; // gentle cloud drift
        cloudCoord.y += uTime * 0.006;

        float n = fbm(cloudCoord * 1.6);
        float billow = fbm(cloudCoord * 3.2 + vec2(n * 0.4, 0.0));
        float cloudDensity = smoothstep(0.44, 0.72, n * 0.65 + billow * 0.35);

        // Anime 3-Tone Cloud Shading (Pure Sunlit White + Ambient Lavender Shadow)
        vec3 cloudHighlight = vec3(1.0, 1.0, 1.0);
        vec3 cloudMidtone = vec3(0.89, 0.95, 1.0);
        vec3 cloudShadow = vec3(0.62, 0.75, 0.98); // soft anime sky shadow

        float lightStep = smoothstep(0.48, 0.65, n);
        vec3 cloudCol = mix(cloudShadow, cloudHighlight, lightStep);

        float horizonFade = smoothstep(0.04, 0.22, h);
        sky = mix(sky, cloudCol, cloudDensity * horizonFade * 0.96);
      }

      // 4. Diagonal Crepuscular God Rays (Majestic light shafts from reference image!)
      vec3 sunDir = normalize(uSunPosition);
      float sunDot = max(0.0, dot(dir, sunDir));

      // Angled light streaks
      vec2 rayUv = vec2(dot(dir, vec3(0.7, 0.2, -0.6)) * 4.0, dir.y * 2.5);
      float rayNoise = fbm(rayUv * 2.0 + vec2(uTime * 0.04, 0.0));
      float godRay = pow(sunDot, 3.2) * smoothstep(0.3, 0.75, rayNoise);

      vec3 rayColor = vec3(1.0, 0.96, 0.84); // Golden-white solar warmth
      sky += rayColor * godRay * 0.38;

      // 5. Sun Disc & Corona Glow
      float sunCorona = pow(sunDot, 12.0) * 0.45;
      float sunDisc = smoothstep(0.9985, 0.9998, sunDot);
      sky += vec3(1.0, 0.98, 0.85) * (sunCorona + sunDisc * 1.2);

      gl_FragColor = vec4(sky, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: uTimeRef,
      uSunPosition: { value: new THREE.Vector3(45, 65, 40) },
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

// -------------------------------------------------------------
// REALISTIC LIVING OCEAN WATER SHADER
// Gerstner Waves, Dynamic Foam Crests, Sun Glitter & Crystal Turquoise Depth
// -------------------------------------------------------------
export function createRealisticOceanMaterial(uTimeRef: { value: number }): THREE.ShaderMaterial {
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
      // Near beach (x around 48-56) is crystal clear cyan; open sea is deep blue
      float depthFactor = clamp((56.0 - vWorldPosition.x) / 35.0, 0.0, 1.0);
      vec3 shallowColor = vec3(0.08, 0.78, 0.88); // Radiant cyan-turquoise #14b8a6 / #06b6d4
      vec3 midWaterColor = vec3(0.02, 0.48, 0.82);// Cerulean blue #0284c7
      vec3 deepColor = vec3(0.01, 0.20, 0.52);    // Deep oceanic sapphire #0369a1

      vec3 waterBase = mix(shallowColor, midWaterColor, depthFactor);
      waterBase = mix(waterBase, deepColor, clamp(depthFactor * 1.5 - 0.4, 0.0, 1.0));

      // 3. Shimmering Underwater Caustics
      vec2 causticCoord = vWorldPosition.xz * 0.75 + vec2(uTime * 0.35, -uTime * 0.25);
      float c1 = noise(causticCoord);
      float c2 = noise(causticCoord * 1.8 - vec2(uTime * 0.2, uTime * 0.3));
      float caustic = pow(min(c1, c2), 1.8) * 0.35 * (1.0 - depthFactor * 0.6);
      waterBase += vec3(0.4, 0.9, 1.0) * caustic;

      // 4. White Cresting Wave Foam & Shoreline Breakers (Espuma do mar)
      float foamNoise = noise(vWorldPosition.xz * 1.4 + vec2(uTime * 0.6, uTime * 0.4));
      // Foam forms on wave crests
      float waveFoam = smoothstep(0.26, 0.42, vWaveHeight + foamNoise * 0.15);

      // Shoreline breaking surf foam (rolling onto beach sand at x ~ 48 to 56)
      float shoreDist = abs(vWorldPosition.x - 52.0);
      float shoreWave = sin(vWorldPosition.z * 0.35 - uTime * 2.2) * 1.8;
      float shoreFoam = smoothstep(2.5, 0.2, shoreDist + shoreWave) * 0.85;

      float totalFoam = clamp(waveFoam * 0.9 + shoreFoam, 0.0, 1.0);
      vec3 foamColor = vec3(0.96, 0.98, 1.0);
      waterBase = mix(waterBase, foamColor, totalFoam);

      // 5. Sun Specular Reflection & Glistening Highlights
      vec3 halfVec = normalize(sunDir + viewDir);
      float spec = pow(max(0.0, dot(vNormal, halfVec)), 80.0) * 1.8;
      vec3 sunSpecColor = vec3(1.0, 0.98, 0.88);

      // 6. Sky Fresnel Reflection
      vec3 skyReflectColor = vec3(0.48, 0.82, 0.98);
      vec3 finalColor = mix(waterBase, skyReflectColor, fresnel * 0.55);
      finalColor += sunSpecColor * spec;

      // Opacity: slightly translucent near shore so sand peeks through, solid in deep sea
      float opacity = mix(0.85, 0.96, clamp(depthFactor, 0.0, 1.0));

      gl_FragColor = vec4(finalColor, opacity);
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: uTimeRef,
      uSunPosition: { value: new THREE.Vector3(45, 65, 40) },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: true,
  });
}
