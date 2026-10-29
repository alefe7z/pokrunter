/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ActiveMonster,
  FloatingDamage,
  InventoryItem,
  MonsterSpecies,
  Move,
  TimeOfDayData,
  TimePhase,
  WildMonsterInstance,
} from '../types/game';
import { MONSTERS_DATABASE } from '../data/monsters';
import { MOVES_DATABASE, calculateDamageMultiplier } from '../data/moves';
import { soundManager } from '../audio/soundManager';
import {
  createTrainerModel,
  createMonsterModel,
  createPokeSphere,
  createResearchVilla,
  createFenceSegment,
  createPalmTree,
  createAnimeForestTree,
  createTropicalFern,
  createVariegatedBush,
  createForestFlowerShrub,
  createFallenMossLog,
  createForestKomorebiRays,
  createForestSporeParticles,
  createFlowerPatch,
  createGraniteBoulder,
} from './proceduralModels';
import {
  generateStylizedGrassTexture,
  generateCliffRockTexture,
  generateSandTexture,
  generateForestPathTexture,
  createCelMaterial,
  createWindVegetationMaterial,
  createGrassBladeClumpGeometry,
  createWildShrubGeometry,
  createAnimeSkyDomeMaterial,
  createGoldenWheatStalkGeometry,
  createRealisticOceanMaterial,
  WindUniforms,
  SkyDomeUniforms,
  OceanUniforms,
} from './shaders';

// Pre-allocated math variables for zero-GC render loop
const _vec3 = new THREE.Vector3();
const _vec3_2 = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _c1 = new THREE.Color();
const _c2 = new THREE.Color();
const _c3 = new THREE.Color();
const _c4 = new THREE.Color();

export interface EngineCallbacks {
  onMinimapUpdate: (data: { playerX: number; playerZ: number; playerRot: number; monsters: { id: string; speciesId: string; x: number; z: number; hpPercent: number }[] }) => void;
  onTargetChanged: (monster: WildMonsterInstance | null) => void;
  onDamageNumber: (damage: FloatingDamage) => void;
  onMonsterCaught: (monster: ActiveMonster) => void;
  onCaptureStatus: (text: string | null) => void;
  onLevelUp: (monster: ActiveMonster) => void;
  onEvolutionReady: (monster: ActiveMonster, targetSpeciesId: string) => void;
  onBattleLog: (msg: string) => void;
  onTimeUpdate?: (timeData: TimeOfDayData) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private isSoftwareGl: boolean;
  private frameId: number = 0;
  private clock: THREE.Clock;
  private callbacks: EngineCallbacks;

  // Player & Controls
  private playerGroup: THREE.Group;
  private partnerMonsterGroup: THREE.Group | null = null;
  private playerPos = new THREE.Vector3(0, 0, 15);
  private playerVelocity = new THREE.Vector3();
  private playerRotation: number = Math.PI;
  private cameraAngle = { yaw: Math.PI, pitch: 0.35, distance: 7.5 };
  private keys: Record<string, boolean> = {};
  private isPointerDown: boolean = false;
  private lastPointerPos = { x: 0, y: 0 };
  private animTime: number = 0;

  // Wind & Dynamic Living Vegetation
  private windUniforms: WindUniforms = {
    uTime: { value: 0 },
    uPlayerPos: { value: new THREE.Vector3(0, 0, 15) },
  };
  private grassInstancedMesh: THREE.InstancedMesh | null = null;
  private shrubInstancedMesh: THREE.InstancedMesh | null = null;

  // 3D Object Collisions (Trees, Boulders, Fences, Buildings)
  private collisionCircles: { x: number; z: number; radius: number }[] = [];
  private collisionSegments: { x1: number; z1: number; x2: number; z2: number; thickness: number }[] = [];
  private collisionAABBs: { minX: number; maxX: number; minZ: number; maxZ: number }[] = [];

  // Game World State
  private wildMonsters: WildMonsterInstance[] = [];
  private lockedTarget: WildMonsterInstance | null = null;
  private activePartner: ActiveMonster;
  private inventory: InventoryItem[];

  // Projectiles & Particles
  private activeProjectiles: {
    mesh: THREE.Object3D;
    velocity: THREE.Vector3;
    lifetime: number;
    move: Move;
    fromPlayer: boolean;
  }[] = [];

  private thrownSphere: {
    mesh: THREE.Group;
    pos: THREE.Vector3;
    velocity: THREE.Vector3;
    targetMonster: WildMonsterInstance;
    ballType: string;
    phase: 'flight' | 'capture_pull' | 'wobble' | 'done';
    wobbleCount: number;
    timer: number;
  } | null = null;

  // Environment elements
  private waterMesh: THREE.Mesh | null = null;
  private tallGrassZones: THREE.Vector3[] = [];
  private sporeParticles: THREE.Points | null = null;

  // Dynamic Day/Night Cycle State
  private gameTime: number = 11.5; // Start at 11:30 AM (brilliant sunny day)
  private timeSpeed: number = 0.045; // hours per real second (~8.8 min full 24h cycle)
  private timeMultiplier: number = 1.0;
  private isTimePaused: boolean = false;
  private lastTimeSync: number = 0;

  // Dynamic Lighting & Atmosphere Rig
  private sunLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private ambientLight!: THREE.AmbientLight;
  private skyDomeMesh!: THREE.Mesh;
  private skyDomeMat!: THREE.ShaderMaterial;
  private skyUniforms!: SkyDomeUniforms;
  private oceanUniforms!: OceanUniforms;
  private komorebiGroups: THREE.Group[] = [];
  private researchVilla: THREE.Group | null = null;

  constructor(
    container: HTMLElement,
    activePartner: ActiveMonster,
    inventory: InventoryItem[],
    callbacks: EngineCallbacks
  ) {
    this.container = container;
    this.activePartner = activePartner;
    this.inventory = inventory;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    // 3. Scene, Anime Sky Dome & Camera
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2('#bae6fd', 0.0055);

    // Dynamic Atmosphere & Sky Dome Uniforms
    this.skyUniforms = {
      uTime: this.windUniforms.uTime,
      uSunPosition: { value: new THREE.Vector3(45, 75, 40) },
      uMoonPosition: { value: new THREE.Vector3(-45, -75, -40) },
      uTimeOfDay: { value: this.gameTime },
      uSkyTopColor: { value: new THREE.Color('#0284c7') },
      uSkyBottomColor: { value: new THREE.Color('#bae6fd') },
      uCloudHighlightColor: { value: new THREE.Color('#ffffff') },
      uCloudShadowColor: { value: new THREE.Color('#93c5fd') },
      uSunColor: { value: new THREE.Color('#fffbeb') },
      uStarIntensity: { value: 0.0 },
      uRayIntensity: { value: 1.0 },
    };

    this.oceanUniforms = {
      uTime: this.windUniforms.uTime,
      uSunPosition: this.skyUniforms.uSunPosition,
      uSkyReflectColor: { value: new THREE.Color('#48d2fa') },
      uSunSpecColor: { value: new THREE.Color('#fffbeb') },
    };

    // Anime Sky Dome with God Rays & Volumetric Cumulus Clouds
    const skyDomeGeo = new THREE.SphereGeometry(480, 48, 36);
    this.skyDomeMat = createAnimeSkyDomeMaterial(this.windUniforms.uTime, this.skyUniforms);
    this.skyDomeMesh = new THREE.Mesh(skyDomeGeo, this.skyDomeMat);
    this.scene.add(this.skyDomeMesh);

    this.camera = new THREE.PerspectiveCamera(
      52,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      600
    );

    // 4. Studio Environment
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 5. Lighting Rig
    this.setupLighting();

    // 6. Build World (Terrain, Ocean, Villa, Cliffs, Props)
    this.buildWorld();

    // Initialize atmospheric lighting & shadows to initial time of day
    this.updateTimeOfDay(0);

    // 7. Player & Partner Setup
    this.playerGroup = createTrainerModel();
    this.scene.add(this.playerGroup);
    this.updatePartnerModel();

    // 8. Spawn Wild Monsters
    this.spawnWildMonsters();

    // 9. Input Listeners
    this.setupInputs();

    // 10. Start Loop
    this.startLoop();
  }

  private setupLighting() {
    // Warm Sun / Moon Key Directional Light with Real-Time Shadows
    this.sunLight = new THREE.DirectionalLight('#fffbeb', 1.8);
    this.sunLight.position.set(45, 75, 40);
    this.sunLight.castShadow = !this.isSoftwareGl;
    if (this.sunLight.shadow) {
      this.sunLight.shadow.mapSize.width = 1024;
      this.sunLight.shadow.mapSize.height = 1024;
      this.sunLight.shadow.camera.near = 10;
      this.sunLight.shadow.camera.far = 300;
      const d = 55;
      this.sunLight.shadow.camera.left = -d;
      this.sunLight.shadow.camera.right = d;
      this.sunLight.shadow.camera.top = d;
      this.sunLight.shadow.camera.bottom = -d;
      this.sunLight.shadow.bias = -0.0005;
      this.sunLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.sunLight);

    // Dynamic Hemisphere Fill
    this.hemiLight = new THREE.HemisphereLight('#bae6fd', '#15803d', 0.85);
    this.scene.add(this.hemiLight);

    // Dynamic Ambient Fill
    this.ambientLight = new THREE.AmbientLight('#ffffff', 0.3);
    this.scene.add(this.ambientLight);
  }

  // -------------------------------------------------------------
  // TERRAIN HEIGHT MAP
  // -------------------------------------------------------------
  public getTerrainHeight(x: number, z: number): number {
    // Sea boundary: beyond x > 55 or z < -55 is water
    if (x > 50 && z > 10) {
      // Beach leading to ocean
      const dist = x - 50;
      return Math.max(-4, 2 - dist * 0.4);
    }
    if (x < -60 || x > 70 || z < -70 || z > 70) {
      return -5; // deep water
    }

    // Coastal cliff ridge overlooking the sea (matching screenshot)
    const cliffCurve = Math.sin(z * 0.05) * 6;
    if (x > 28 + cliffCurve && z > -20 && z < 45) {
      // Dramatic coastal drop
      const cliffDist = x - (28 + cliffCurve);
      return Math.max(0, 7.5 - cliffDist * 1.5);
    }

    // Rolling green plateau
    const hill1 = Math.sin(x * 0.04) * Math.cos(z * 0.04) * 2.8;
    const hill2 = Math.cos(x * 0.08 + z * 0.06) * 1.2;
    const baseElevation = 5.5;

    // Villa headland (z between -30 and -5, x between 0 and 30)
    if (x >= -5 && x <= 35 && z >= -35 && z <= -5) {
      return 6.5; // Flat terrace for laboratory
    }

    return Math.max(0, baseElevation + hill1 + hill2);
  }

  private buildWorld() {
    // 1. Grassy Plateau with Stylized Painted Anime Grass Texture
    const terrainGeo = new THREE.PlaneGeometry(180, 180, 90, 90);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      const vy = this.getTerrainHeight(vx, vz);
      posAttr.setY(i, vy);
    }
    terrainGeo.computeVertexNormals();

    const grassTex = generateStylizedGrassTexture();
    const grassMat = createCelMaterial('#ffffff', grassTex, 0.7);
    const terrainMesh = new THREE.Mesh(terrainGeo, grassMat);
    terrainMesh.receiveShadow = true;
    this.scene.add(terrainMesh);

    // 1b. Red Terracotta Coastal Cliff Face (Layered geological rock)
    const cliffGeo = new THREE.CylinderGeometry(45, 55, 14, 32, 1, true, 0, Math.PI);
    const cliffTex = generateCliffRockTexture();
    const cliffMat = createCelMaterial('#ffffff', cliffTex, 0.8);
    const cliffMesh = new THREE.Mesh(cliffGeo, cliffMat);
    cliffMesh.position.set(22, 1, 10);
    cliffMesh.rotation.y = -Math.PI / 4;
    cliffMesh.receiveShadow = true;
    this.scene.add(cliffMesh);

    // 2. Realistic Living Ocean with Rolling Gerstner Waves, Surf Foam & Sun Glitter
    const waterGeo = new THREE.PlaneGeometry(500, 500, 128, 128);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = createRealisticOceanMaterial(this.windUniforms.uTime, this.oceanUniforms);
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.position.set(0, 0.15, 0);
    this.scene.add(this.waterMesh);

    // 3. Sandy Shoreline with Ripple Texture
    const sandGeo = new THREE.PlaneGeometry(40, 140);
    sandGeo.rotateX(-Math.PI / 2);
    const sandTex = generateSandTexture();
    const sandMat = createCelMaterial('#ffffff', sandTex, 0.85);
    const sandMesh = new THREE.Mesh(sandGeo, sandMat);
    sandMesh.position.set(58, 0.1, 0);
    sandMesh.receiveShadow = true;
    this.scene.add(sandMesh);

    // 4. Professor's Research Villa (The blue-roof manor on the headland!)
    this.collisionCircles = [];
    this.collisionSegments = [];
    this.collisionAABBs = [];

    const villa = createResearchVilla();
    this.researchVilla = villa;
    villa.position.set(12, this.getTerrainHeight(12, -22), -22);
    villa.rotation.y = Math.PI * 0.1;
    this.scene.add(villa);
    // Villa building collision boundary
    this.collisionAABBs.push({ minX: 12 - 9.5, maxX: 12 + 9.5, minZ: -22 - 6.5, maxZ: -22 + 6.5 });

    // 5. White Wooden Fences Along the Cliff Path (From screenshot foreground!)
    const fencePoints: [number, number][] = [
      [-14, 20], [-10, 19], [-6, 18], [-2, 17], [2, 16], [6, 15], [10, 14], [14, 12], [18, 9], [22, 5], [24, 0], [25, -6]
    ];
    for (let i = 0; i < fencePoints.length - 1; i++) {
      const [p1x, p1z] = fencePoints[i];
      const [p2x, p2z] = fencePoints[i + 1];
      const dx = p2x - p1x;
      const dz = p2z - p1z;
      const length = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dz, dx);
      const p1y = this.getTerrainHeight(p1x, p1z);

      const fence = createFenceSegment(length);
      fence.position.set(p1x, p1y, p1z);
      fence.rotation.y = -angle;
      this.scene.add(fence);

      // Register fence collision segment
      this.collisionSegments.push({ x1: p1x, z1: p1z, x2: p2x, z2: p2z, thickness: 0.45 });

      // Wildflower patches along the fence (matching screenshot!)
      if (i % 2 === 0) {
        const flowers = createFlowerPatch();
        flowers.position.set(p1x + 0.8, p1y, p1z + 0.5);
        this.scene.add(flowers);
      }
    }

    // 6. Natural Granite Moss Boulders (Signature boulder in foreground of screenshot!)
    const boulderCoords = [
      [-2, 12], [4, 13], [12, 10], [-8, 22], [16, 2], [22, 15]
    ];
    boulderCoords.forEach(([bx, bz]) => {
      const by = this.getTerrainHeight(bx, bz);
      const boulder = createGraniteBoulder();
      boulder.position.set(bx, by, bz);
      boulder.rotation.y = Math.random() * Math.PI * 2;
      const scale = 0.8 + Math.random() * 0.5;
      boulder.scale.set(scale, scale, scale);
      this.scene.add(boulder);

      // Register boulder collision circle
      this.collisionCircles.push({ x: bx, z: bz, radius: 1.15 * scale });
    });

    // 7. Dense Living Anime Forest & Coastal Palms (From user's uploaded Pokémon Anime references!)
    // 7a. Winding Forest Trail with Earthy Loam, Moss & Stepping Stones
    const trailPoints: [number, number][] = [
      [-6, 14], [-11, 16], [-16, 14], [-21, 12], [-26, 15], [-31, 13], [-36, 16]
    ];
    const pathTex = generateForestPathTexture();
    const pathMat = createCelMaterial('#ffffff', pathTex, 0.85);
    for (let t = 0; t < trailPoints.length - 1; t++) {
      const [t1x, t1z] = trailPoints[t];
      const [t2x, t2z] = trailPoints[t + 1];
      const tLen = Math.hypot(t2x - t1x, t2z - t1z);
      const tAngle = Math.atan2(t2z - t1z, t2x - t1x);
      const trailGeo = new THREE.PlaneGeometry(3.6, tLen + 0.6);
      trailGeo.rotateX(-Math.PI / 2);
      const trailMesh = new THREE.Mesh(trailGeo, pathMat);
      const mx = (t1x + t2x) / 2;
      const mz = (t1z + t2z) / 2;
      trailMesh.position.set(mx, this.getTerrainHeight(mx, mz) + 0.04, mz);
      trailMesh.rotation.y = -tAngle + Math.PI / 2;
      trailMesh.receiveShadow = true;
      this.scene.add(trailMesh);
    }

    // 7b. Deep Inland Forest Wall & Foreground Framing Trees (Matching reference images!)
    const forestTreePositions: [number, number, number][] = [
      // Foreground Framing Trees along the Forest Trail Entry
      [-8, 10, 1.25],   [-10, 22, 1.3],   [-15, 6, 1.35],   [-14, 25, 1.25],
      // Deep Inland Forest Canopy Wall (Dense lush backdrop)
      [-38, -38, 1.4],  [-30, -35, 1.25], [-22, -32, 1.35], [-16, -35, 1.15],
      [-44, -22, 1.45], [-36, -20, 1.3],  [-28, -18, 1.2],  [-20, -15, 1.3],
      [-46, -5, 1.4],   [-38, -2, 1.35],  [-30, 2, 1.25],   [-24, 6, 1.3],
      [-45, 15, 1.4],   [-38, 20, 1.3],   [-28, 24, 1.35],  [-20, 26, 1.2],
      [-42, 34, 1.35],  [-34, 36, 1.25],  [-25, 38, 1.2],   [-16, 35, 1.3],
      // Glade Openings & Ancient Landmark Trees
      [-12, -8, 1.3],   [-6, -18, 1.2],   [-22, 18, 1.35],  [-28, 8, 1.25],
    ];

    forestTreePositions.forEach(([tx, tz, tScale]) => {
      const ty = this.getTerrainHeight(tx, tz);
      const tree = createAnimeForestTree(this.windUniforms);
      tree.position.set(tx, ty, tz);
      tree.rotation.y = Math.random() * Math.PI * 2;
      tree.scale.set(tScale, tScale, tScale);
      this.scene.add(tree);

      // Register collision for tree trunk and roots
      this.collisionCircles.push({ x: tx, z: tz, radius: 1.35 * tScale });
    });

    // 7c. Fallen Mossy Logs with Shelf Mushrooms along the Forest Path
    const fallenLogCoords: [number, number, number][] = [
      [-17, 18, 0.35],
      [-25, 10, -0.4],
      [-21, 28, 0.8],
      [-12, -2, -0.6],
    ];
    fallenLogCoords.forEach(([lx, lz, lRot]) => {
      const ly = this.getTerrainHeight(lx, lz);
      const log = createFallenMossLog();
      log.position.set(lx, ly, lz);
      log.rotation.y = lRot;
      this.scene.add(log);

      // Register collision segment for fallen log
      const halfLen = 1.6;
      const cosR = Math.cos(lRot);
      const sinR = Math.sin(lRot);
      this.collisionSegments.push({
        x1: lx - cosR * halfLen,
        z1: lz - sinR * halfLen,
        x2: lx + cosR * halfLen,
        z2: lz + sinR * halfLen,
        thickness: 0.85,
      });
    });

    // 7d. Atmospheric Forest Komorebi (Sunbeams cutting through the canopy)
    const komorebi1 = createForestKomorebiRays();
    komorebi1.position.set(-18, this.getTerrainHeight(-18, 14), 14);
    this.scene.add(komorebi1);

    const komorebi2 = createForestKomorebiRays();
    komorebi2.position.set(-27, this.getTerrainHeight(-27, 8), 8);
    this.scene.add(komorebi2);

    this.komorebiGroups = [komorebi1, komorebi2];

    // 7e. Floating Forest Spores & Pollen Motes (Drifting anime light particles!)
    this.sporeParticles = createForestSporeParticles(220);
    this.scene.add(this.sporeParticles);

    // Coastal & Beach Palm Trees
    const palmPositions: [number, number, number][] = [
      [26, 22, 1.05], [28, 12, 1.1], [22, -15, 1.0], [16, -28, 1.15],
      [55, 15, 1.0], [58, -5, 1.1], [52, 28, 0.95],
    ];

    palmPositions.forEach(([px, pz, pScale]) => {
      const py = this.getTerrainHeight(px, pz);
      const palm = createPalmTree();
      palm.position.set(px, py, pz);
      palm.rotation.y = Math.random() * Math.PI * 2;
      palm.scale.set(pScale, pScale, pScale);
      this.scene.add(palm);

      this.collisionCircles.push({ x: px, z: pz, radius: 0.8 * pScale });
    });

    // 7f. Rich Living Undergrowth: Tropical Ferns, Variegated Bushes & Flowering Forest Shrubs
    const fernCoords: [number, number][] = [
      [-8, 17], [-12, 13], [-15, 19], [-19, 11], [-24, 17], [-18, 27],
      [-23, -8], [-9, -15], [-14, -23], [-27, -24], [-31, 11], [-21, 21],
      [-5, 20], [-13, 8], [-26, 5], [-17, 32],
    ];

    fernCoords.forEach(([fx, fz]) => {
      const fy = this.getTerrainHeight(fx, fz);
      const fern = createTropicalFern(this.windUniforms);
      fern.position.set(fx, fy, fz);
      fern.rotation.y = Math.random() * Math.PI * 2;
      const fScale = 0.9 + Math.random() * 0.45;
      fern.scale.set(fScale, fScale, fScale);
      this.scene.add(fern);
    });

    const variegatedCoords: [number, number][] = [
      [-13, 17], [-19, 15], [-25, 21], [-11, -11], [-17, -17], [-23, -3],
      [-7, 12], [-17, 29], [-27, 33], [-9, 26], [-22, 13], [-29, 19],
    ];

    variegatedCoords.forEach(([vx, vz]) => {
      const vy = this.getTerrainHeight(vx, vz);
      const bush = createVariegatedBush(this.windUniforms);
      bush.position.set(vx, vy, vz);
      bush.rotation.y = Math.random() * Math.PI * 2;
      const bScale = 0.95 + Math.random() * 0.4;
      bush.scale.set(bScale, bScale, bScale);
      this.scene.add(bush);
    });

    // Flowering Forest Shrubs with Pink & White Blossoms (From reference image!)
    const flowerShrubCoords: [number, number][] = [
      [-10, 15], [-14, 11], [-18, 17], [-22, 9], [-16, 23], [-20, 25],
      [-8, 8], [-12, -6], [-25, 14], [-30, 7],
    ];

    flowerShrubCoords.forEach(([sx, sz]) => {
      const sy = this.getTerrainHeight(sx, sz);
      const shrub = createForestFlowerShrub(this.windUniforms);
      shrub.position.set(sx, sy, sz);
      shrub.rotation.y = Math.random() * Math.PI * 2;
      const sScale = 0.9 + Math.random() * 0.35;
      shrub.scale.set(sScale, sScale, sScale);
      this.scene.add(shrub);
    });

    // 8. Distant Island in the ocean (Like screenshot!)
    const islandGeo = new THREE.ConeGeometry(9, 7, 8);
    const islandTex = generateCliffRockTexture();
    const islandMat = createCelMaterial('#ffffff', islandTex, 0.8);
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.set(65, 1, 35);
    this.scene.add(island);

    const islandPalm = createPalmTree();
    islandPalm.position.set(65, 4.5, 35);
    this.scene.add(islandPalm);

    // 9. Procedural Anime Fluffy Clouds in Sky
    for (let c = 0; c < 12; c++) {
      const cloudGroup = new THREE.Group();
      const cloudMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.9 });
      for (let p = 0; p < 5; p++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(6 + Math.random() * 5, 8, 8),
          cloudMat
        );
        puff.position.set((p - 2) * 5 + (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 4);
        cloudGroup.add(puff);
      }
      cloudGroup.position.set(
        (Math.random() - 0.5) * 300,
        45 + Math.random() * 20,
        (Math.random() - 0.5) * 300
      );
      this.scene.add(cloudGroup);
    }

    // 10. REAL-TIME WIND-REACTIVE LIVING GRASS (2,800 instances)
    const grassGeo = createGrassBladeClumpGeometry();
    const livingGrassMat = createWindVegetationMaterial('#4ade80', this.windUniforms);
    const grassCount = 2800;
    this.grassInstancedMesh = new THREE.InstancedMesh(grassGeo, livingGrassMat, grassCount);
    this.grassInstancedMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const grassPalette = [
      new THREE.Color('#4ade80'),
      new THREE.Color('#22c55e'),
      new THREE.Color('#86efac'),
      new THREE.Color('#16a34a'),
      new THREE.Color('#facc15'), // sun-bleached golden blade
    ];

    let validCount = 0;
    for (let i = 0; i < grassCount; i++) {
      const gx = -45 + Math.random() * 75;
      const gz = -42 + Math.random() * 85;

      // Skip deep ocean and villa interior
      if (gx > 46 && gz > 12) continue;
      if (gx >= 0 && gx <= 24 && gz >= -30 && gz <= -12) continue;

      const gy = this.getTerrainHeight(gx, gz);
      if (gy <= 0.6) continue; // beach/water boundary

      dummy.position.set(gx, gy, gz);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      const s = 0.8 + Math.random() * 0.45;
      dummy.scale.set(s, s * (0.9 + Math.random() * 0.3), s);
      dummy.updateMatrix();

      this.grassInstancedMesh.setMatrixAt(validCount, dummy.matrix);
      const col = grassPalette[Math.floor(Math.random() * grassPalette.length)];
      this.grassInstancedMesh.setColorAt(validCount, col);
      validCount++;
    }

    this.grassInstancedMesh.count = validCount;
    this.grassInstancedMesh.instanceMatrix.needsUpdate = true;
    if (this.grassInstancedMesh.instanceColor) {
      this.grassInstancedMesh.instanceColor.needsUpdate = true;
    }
    this.grassInstancedMesh.computeBoundingSphere();
    this.scene.add(this.grassInstancedMesh);

    // 11. LIVING WILD SHRUBS & BUSHES ("Matinhos Selvagens" - 350 instances)
    const shrubGeo = createWildShrubGeometry();
    const shrubMat = createWindVegetationMaterial('#15803d', this.windUniforms);
    const shrubCount = 350;
    this.shrubInstancedMesh = new THREE.InstancedMesh(shrubGeo, shrubMat, shrubCount);
    this.shrubInstancedMesh.castShadow = true;
    this.shrubInstancedMesh.receiveShadow = true;

    const shrubPalette = [
      new THREE.Color('#15803d'),
      new THREE.Color('#16a34a'),
      new THREE.Color('#14532d'),
      new THREE.Color('#10b981'),
    ];

    let shrubValid = 0;
    for (let i = 0; i < shrubCount; i++) {
      const sx = -40 + Math.random() * 65;
      const sz = -38 + Math.random() * 75;
      const sy = this.getTerrainHeight(sx, sz);
      if (sy <= 0.8) continue;
      if (sx >= 0 && sx <= 24 && sz >= -30 && sz <= -12) continue;

      dummy.position.set(sx, sy, sz);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      const s = 0.6 + Math.random() * 0.7;
      dummy.scale.set(s, s * 0.8, s);
      dummy.updateMatrix();

      this.shrubInstancedMesh.setMatrixAt(shrubValid, dummy.matrix);
      const col = shrubPalette[Math.floor(Math.random() * shrubPalette.length)];
      this.shrubInstancedMesh.setColorAt(shrubValid, col);
      shrubValid++;
    }

    this.shrubInstancedMesh.count = shrubValid;
    this.shrubInstancedMesh.instanceMatrix.needsUpdate = true;
    if (this.shrubInstancedMesh.instanceColor) {
      this.shrubInstancedMesh.instanceColor.needsUpdate = true;
    }
    this.shrubInstancedMesh.computeBoundingSphere();
    this.scene.add(this.shrubInstancedMesh);

    // 12. GOLDEN WHEAT & TALL FIELD STALKS (From user reference image foreground!)
    const wheatGeo = createGoldenWheatStalkGeometry();
    const wheatMat = createWindVegetationMaterial('#eab308', this.windUniforms);
    const wheatCount = 200;
    const wheatInstancedMesh = new THREE.InstancedMesh(wheatGeo, wheatMat, wheatCount);
    wheatInstancedMesh.receiveShadow = true;

    const wheatPalette = [
      new THREE.Color('#eab308'), // golden grain
      new THREE.Color('#facc15'), // bright sunlight wheat
      new THREE.Color('#ca8a04'), // amber harvest
      new THREE.Color('#a3e635'), // young golden-green stalk
    ];

    let wheatValid = 0;
    for (let w = 0; w < wheatCount; w++) {
      const wx = -20 + Math.random() * 40;
      const wz = 6 + Math.random() * 26;
      const wy = this.getTerrainHeight(wx, wz);
      if (wy <= 1.0) continue;

      dummy.position.set(wx, wy, wz);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      const ws = 0.9 + Math.random() * 0.45;
      dummy.scale.set(ws, ws, ws);
      dummy.updateMatrix();

      wheatInstancedMesh.setMatrixAt(wheatValid, dummy.matrix);
      const col = wheatPalette[Math.floor(Math.random() * wheatPalette.length)];
      wheatInstancedMesh.setColorAt(wheatValid, col);
      wheatValid++;
    }

    wheatInstancedMesh.count = wheatValid;
    wheatInstancedMesh.instanceMatrix.needsUpdate = true;
    if (wheatInstancedMesh.instanceColor) {
      wheatInstancedMesh.instanceColor.needsUpdate = true;
    }
    wheatInstancedMesh.computeBoundingSphere();
    this.scene.add(wheatInstancedMesh);
  }

  // -------------------------------------------------------------
  // WILD MONSTERS MANAGEMENT
  // -------------------------------------------------------------
  private spawnWildMonsters() {
    const spawns: { speciesId: string; pos: [number, number, number]; level: number }[] = [
      { speciesId: 'flameling', pos: [8, 0, 20], level: 4 },
      { speciesId: 'sproutlet', pos: [-12, 0, 8], level: 5 },
      { speciesId: 'bubblot', pos: [52, 0, 12], level: 4 },
      { speciesId: 'voltmouse', pos: [-6, 0, 28], level: 6 },
      { speciesId: 'drakonil', pos: [24, 0, 18], level: 7 },
      { speciesId: 'pyrodash', pos: [15, 0, 32], level: 16 },
      { speciesId: 'florafawn', pos: [-22, 0, 22], level: 17 },
      { speciesId: 'tidebeast', pos: [56, 0, -8], level: 18 },
    ];

    spawns.forEach((s, idx) => {
      const y = this.getTerrainHeight(s.pos[0], s.pos[2]);
      const species = MONSTERS_DATABASE[s.speciesId];
      if (!species) return;

      const maxHp = Math.floor(species.baseStats.hp * (1 + s.level * 0.1));
      const model = createMonsterModel(s.speciesId);
      model.position.set(s.pos[0], y, s.pos[2]);
      this.scene.add(model);

      this.wildMonsters.push({
        id: `wild_${idx}_${s.speciesId}`,
        speciesId: s.speciesId,
        level: s.level,
        currentHp: maxHp,
        maxHp,
        position: [s.pos[0], y, s.pos[2]],
        rotation: Math.random() * Math.PI * 2,
        state: 'wandering',
        attackCooldown: 2 + Math.random() * 2,
        spawnCenter: [s.pos[0], y, s.pos[2]],
        meshGroup: model,
      });
    });
  }

  public updatePartnerModel() {
    if (this.partnerMonsterGroup) {
      this.scene.remove(this.partnerMonsterGroup);
      this.partnerMonsterGroup = null;
    }
    this.partnerMonsterGroup = createMonsterModel(this.activePartner.speciesId);
    this.scene.add(this.partnerMonsterGroup);
  }

  public setActivePartner(partner: ActiveMonster) {
    this.activePartner = partner;
    this.updatePartnerModel();
  }

  public setInventory(inv: InventoryItem[]) {
    this.inventory = inv;
  }

  // -------------------------------------------------------------
  // CONTROLS & INPUTS
  // -------------------------------------------------------------
  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === 'Tab') {
        e.preventDefault();
        this.cycleTarget();
      }
      if (e.key === 'q' || e.key === 'Q') {
        this.cycleTarget();
      }
      if (e.key === '1') this.useMove(0);
      if (e.key === '2') this.useMove(1);
      if (e.key === '3') this.useMove(2);
      if (e.key === '4') this.useMove(3);
      if (e.key === 'e' || e.key === 'E') this.throwCaptureBall('poke_sphere');
      if (e.key === ' ' || e.key === 'Space') {
        this.playerDodge();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Pointer look
    this.container.addEventListener('pointerdown', (e) => {
      this.isPointerDown = true;
      this.lastPointerPos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isPointerDown) return;
      const dx = e.clientX - this.lastPointerPos.x;
      const dy = e.clientY - this.lastPointerPos.y;
      this.lastPointerPos = { x: e.clientX, y: e.clientY };

      this.cameraAngle.yaw -= dx * 0.007;
      this.cameraAngle.pitch = Math.max(0.08, Math.min(1.2, this.cameraAngle.pitch + dy * 0.005));
    });

    window.addEventListener('pointerup', () => {
      this.isPointerDown = false;
    });

    // Wheel zoom
    this.container.addEventListener('wheel', (e) => {
      this.cameraAngle.distance = Math.max(3.5, Math.min(14, this.cameraAngle.distance + e.deltaY * 0.008));
    }, { passive: true });

    // Window resize
    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public cycleTarget() {
    if (this.wildMonsters.length === 0) {
      this.lockedTarget = null;
      this.callbacks.onTargetChanged(null);
      return;
    }

    // Find living monsters sorted by distance to player
    const sorted = [...this.wildMonsters]
      .filter((m) => m.currentHp > 0 && m.state !== 'captured')
      .sort((a, b) => {
        const da = Math.hypot(a.position[0] - this.playerPos.x, a.position[2] - this.playerPos.z);
        const db = Math.hypot(b.position[0] - this.playerPos.x, b.position[2] - this.playerPos.z);
        return da - db;
      });

    if (sorted.length === 0) {
      this.lockedTarget = null;
      this.callbacks.onTargetChanged(null);
      return;
    }

    if (!this.lockedTarget) {
      this.lockedTarget = sorted[0];
    } else {
      const idx = sorted.findIndex((m) => m.id === this.lockedTarget!.id);
      this.lockedTarget = sorted[(idx + 1) % sorted.length];
    }

    soundManager.playClick();
    this.callbacks.onTargetChanged(this.lockedTarget);
  }

  public playerDodge() {
    soundManager.playAttackSound('normal');
    _forward.set(Math.sin(this.playerRotation), 0, Math.cos(this.playerRotation)).normalize();
    this.playerVelocity.addScaledVector(_forward, 9);
    this.callbacks.onBattleLog(`${this.activePartner.nickname} esquivou com agilidade!`);
  }

  // -------------------------------------------------------------
  // REAL-TIME BATTLE & MOVES
  // -------------------------------------------------------------
  public useMove(moveIndex: number) {
    const moveId = this.activePartner.moves[moveIndex];
    if (!moveId) return;

    const move = MOVES_DATABASE[moveId];
    if (!move) return;

    // Check cooldown
    const now = Date.now();
    const readyAt = this.activePartner.moveCooldowns[moveId] || 0;
    if (now < readyAt) {
      return; // Still cooling down
    }

    // Set cooldown
    this.activePartner.moveCooldowns[moveId] = now + move.cooldown * 1000;

    // Play attack sound
    soundManager.playAttackSound(move.type);

    // Target or forward
    let targetDir = new THREE.Vector3(Math.sin(this.playerRotation), 0, Math.cos(this.playerRotation));
    if (this.lockedTarget) {
      targetDir.set(
        this.lockedTarget.position[0] - this.playerPos.x,
        0,
        this.lockedTarget.position[2] - this.playerPos.z
      ).normalize();
    }

    this.callbacks.onBattleLog(`${this.activePartner.nickname} usou ${move.name}!`);

    // Create projectile or instant impact
    if (move.projectileSpeed && move.projectileSpeed > 0) {
      const projGeo = new THREE.SphereGeometry(0.35, 8, 8);
      const projMat = new THREE.MeshBasicMaterial({ color: move.color });
      const projMesh = new THREE.Mesh(projGeo, projMat);

      const spawnPos = this.playerPos.clone().add(new THREE.Vector3(0, 1.2, 0)).addScaledVector(targetDir, 0.8);
      projMesh.position.copy(spawnPos);
      this.scene.add(projMesh);

      this.activeProjectiles.push({
        mesh: projMesh,
        velocity: targetDir.clone().multiplyScalar(move.projectileSpeed),
        lifetime: move.range / move.projectileSpeed,
        move,
        fromPlayer: true,
      });
    } else {
      // Melee attack hit detection
      this.executeMeleeHit(move);
    }
  }

  private executeMeleeHit(move: Move) {
    if (!this.lockedTarget) {
      // Hit nearest within range
      const nearby = this.wildMonsters.find(
        (m) =>
          m.currentHp > 0 &&
          Math.hypot(m.position[0] - this.playerPos.x, m.position[2] - this.playerPos.z) < move.range
      );
      if (nearby) this.applyDamageToMonster(nearby, move);
    } else {
      const dist = Math.hypot(
        this.lockedTarget.position[0] - this.playerPos.x,
        this.lockedTarget.position[2] - this.playerPos.z
      );
      if (dist <= move.range + 1.5) {
        this.applyDamageToMonster(this.lockedTarget, move);
      } else {
        this.callbacks.onBattleLog('O golpe errou o alvo! Chegue mais perto.');
      }
    }
  }

  private applyDamageToMonster(target: WildMonsterInstance, move: Move) {
    const defenderSpecies = MONSTERS_DATABASE[target.speciesId];
    if (!defenderSpecies) return;

    const mult = calculateDamageMultiplier(move.type, defenderSpecies.primaryType);
    const isCrit = Math.random() < 0.15;
    const baseDamage = ((2 * this.activePartner.level / 5 + 2) * move.power * (this.activePartner.stats.attack / (defenderSpecies.baseStats.defense * 0.8))) / 50 + 2;
    const finalDamage = Math.max(1, Math.floor(baseDamage * mult * (isCrit ? 1.5 : 1.0)));

    target.currentHp = Math.max(0, target.currentHp - finalDamage);
    target.state = 'alert'; // Aggro

    soundManager.playHitSound(mult > 1.0);

    // Floating damage text
    this.callbacks.onDamageNumber({
      id: Math.random().toString(),
      text: `${finalDamage}${mult > 1.0 ? ' Super Efetivo!' : mult < 1.0 ? ' Pouco Efetivo' : ''}${isCrit ? ' CRÍTICO!' : ''}`,
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 80,
      y: window.innerHeight / 2 - 40 + (Math.random() - 0.5) * 40,
      color: mult > 1.0 ? '#ef4444' : mult < 1.0 ? '#94a3b8' : '#f59e0b',
      isCrit,
    });

    if (target.currentHp <= 0) {
      target.state = 'wandering';
      soundManager.playMonsterCry(target.speciesId);
      this.callbacks.onBattleLog(`${defenderSpecies.name} selvagem foi derrotado!`);
      this.gainExperience(target.level * 45);

      // Despawn / respawn after 10s
      setTimeout(() => {
        target.currentHp = target.maxHp;
        target.position = [target.spawnCenter[0], target.spawnCenter[1], target.spawnCenter[2]];
      }, 10000);
    }
  }

  private gainExperience(expGained: number) {
    this.activePartner.exp += expGained;
    this.activePartner.friendship = Math.min(100, this.activePartner.friendship + 3);
    this.callbacks.onBattleLog(`${this.activePartner.nickname} ganhou ${expGained} EXP! (+3 Amizade)`);

    if (this.activePartner.exp >= this.activePartner.maxExp) {
      this.activePartner.level += 1;
      this.activePartner.exp -= this.activePartner.maxExp;
      this.activePartner.maxExp = Math.floor(this.activePartner.maxExp * 1.3);

      // Stat increases
      const species = MONSTERS_DATABASE[this.activePartner.speciesId];
      if (species) {
        this.activePartner.maxHp += Math.floor(species.baseStats.hp * 0.12);
        this.activePartner.currentHp = this.activePartner.maxHp;
        this.activePartner.stats.attack += Math.floor(species.baseStats.attack * 0.1);
        this.activePartner.stats.defense += Math.floor(species.baseStats.defense * 0.1);
        this.activePartner.stats.spAttack += Math.floor(species.baseStats.spAttack * 0.1);
        this.activePartner.stats.spDefense += Math.floor(species.baseStats.spDefense * 0.1);
        this.activePartner.stats.speed += Math.floor(species.baseStats.speed * 0.1);
      }

      soundManager.playCatchSuccess();
      this.callbacks.onLevelUp(this.activePartner);
      this.callbacks.onBattleLog(`PARABÉNS! ${this.activePartner.nickname} subiu para o Nível ${this.activePartner.level}!`);

      // Check level-based or stat-based evolution!
      this.checkEvolutionConditions();
    }
  }

  public checkEvolutionConditions() {
    const species = MONSTERS_DATABASE[this.activePartner.speciesId];
    if (!species || !species.evolutions) return;

    for (const evo of species.evolutions) {
      if (evo.trigger === 'level' && evo.requiredLevel && this.activePartner.level >= evo.requiredLevel) {
        this.callbacks.onEvolutionReady(this.activePartner, evo.targetSpeciesId);
        break;
      }
      if (evo.trigger === 'friendship' && evo.requiredFriendship && this.activePartner.friendship >= evo.requiredFriendship) {
        this.callbacks.onEvolutionReady(this.activePartner, evo.targetSpeciesId);
        break;
      }
      if (evo.trigger === 'stat_ratio' && evo.statRatio && evo.requiredLevel && this.activePartner.level >= evo.requiredLevel) {
        const valA = this.activePartner.stats[evo.statRatio.statA];
        const valB = this.activePartner.stats[evo.statRatio.statB];
        if (evo.statRatio.condition === 'greater' && valA > valB) {
          this.callbacks.onEvolutionReady(this.activePartner, evo.targetSpeciesId);
          break;
        }
      }
    }
  }

  // -------------------------------------------------------------
  // MONSTER CAPTURE SYSTEM
  // -------------------------------------------------------------
  public throwCaptureBall(ballItemId: string = 'poke_sphere') {
    if (this.thrownSphere) return; // Already throwing
    const ballItem = this.inventory.find((i) => i.id === ballItemId && i.quantity > 0);
    if (!ballItem) {
      this.callbacks.onBattleLog('Você não possui esta esfera na mochila!');
      return;
    }

    // Determine target
    let target = this.lockedTarget;
    if (!target) {
      // Target closest wild monster within 18 meters
      target = this.wildMonsters.find((m) => {
        if (m.currentHp <= 0 || m.state === 'captured') return false;
        const dist = Math.hypot(m.position[0] - this.playerPos.x, m.position[2] - this.playerPos.z);
        return dist < 18;
      }) || null;
    }

    if (!target) {
      this.callbacks.onBattleLog('Nenhum monstro selvagem próximo para capturar! Aproxime-se de um monstro.');
      return;
    }

    // Consume ball
    ballItem.quantity -= 1;
    soundManager.playThrowSound();

    const sphereMesh = createPokeSphere(ballItemId);
    const startPos = this.playerPos.clone().add(new THREE.Vector3(0, 1.6, 0));
    sphereMesh.position.copy(startPos);
    this.scene.add(sphereMesh);

    // Calculate arc trajectory
    const targetPos = new THREE.Vector3(...target.position).add(new THREE.Vector3(0, 0.5, 0));
    const toTarget = targetPos.clone().sub(startPos);
    const flightDuration = 0.75;
    const velocity = new THREE.Vector3(
      toTarget.x / flightDuration,
      (toTarget.y + 0.5 * 18 * flightDuration * flightDuration) / flightDuration,
      toTarget.z / flightDuration
    );

    this.thrownSphere = {
      mesh: sphereMesh,
      pos: startPos,
      velocity,
      targetMonster: target,
      ballType: ballItemId,
      phase: 'flight',
      wobbleCount: 0,
      timer: 0,
    };

    this.callbacks.onCaptureStatus(`Lançou ${ballItem.name}!`);
    this.callbacks.onBattleLog(`Você arremessou ${ballItem.name}!`);
  }

  private updateCaptureProcess(delta: number) {
    if (!this.thrownSphere) return;

    const s = this.thrownSphere;
    s.timer += delta;

    if (s.phase === 'flight') {
      s.velocity.y -= 18 * delta; // Gravity
      s.pos.addScaledVector(s.velocity, delta);
      s.mesh.position.copy(s.pos);
      s.mesh.rotation.x += 10 * delta;

      // Check hit target
      const targetPos = new THREE.Vector3(...s.targetMonster.position);
      if (s.pos.distanceTo(targetPos) < 1.0 || s.pos.y <= this.getTerrainHeight(s.pos.x, s.pos.z) + 0.2) {
        s.phase = 'capture_pull';
        s.timer = 0;
        soundManager.playAttackSound('dragon'); // Energy beam whoosh
        this.callbacks.onCaptureStatus('Puxando para dentro da esfera...');

        // Shrink wild monster into sphere
        if (s.targetMonster.meshGroup) {
          s.targetMonster.meshGroup.visible = false;
        }
      }
    } else if (s.phase === 'capture_pull') {
      if (s.timer > 0.6) {
        s.phase = 'wobble';
        s.timer = 0;
        s.wobbleCount = 0;
      }
    } else if (s.phase === 'wobble') {
      // 3 Wobbles
      const wobbleInterval = 0.85;
      const wobbleProgress = (s.timer % wobbleInterval) / wobbleInterval;

      if (wobbleProgress < 0.3) {
        s.mesh.rotation.z = Math.sin(wobbleProgress * Math.PI * 4) * 0.45;
      } else {
        s.mesh.rotation.z = 0;
      }

      if (s.timer >= (s.wobbleCount + 1) * wobbleInterval && s.wobbleCount < 3) {
        s.wobbleCount++;
        soundManager.playBallWobble();
        this.callbacks.onCaptureStatus(`Balançou... (${s.wobbleCount}/3)`);
      }

      if (s.timer >= 3.2) {
        // Resolve Catch Formula
        const targetSpecies = MONSTERS_DATABASE[s.targetMonster.speciesId];
        const ballItem = this.inventory.find((i) => i.id === s.ballType);
        const ballMult = ballItem?.ballMultiplier || 1.0;

        const maxHp = s.targetMonster.maxHp;
        const curHp = s.targetMonster.currentHp;
        const catchRate = targetSpecies ? targetSpecies.catchRate : 100;

        // Pokémon catch formula approximation
        const a = (((3 * maxHp - 2 * curHp) * catchRate * ballMult) / (3 * maxHp)) / 255;
        const isCaught = Math.random() < Math.max(0.2, Math.min(0.95, a));

        if (isCaught) {
          // Success!
          s.phase = 'done';
          soundManager.playCatchSuccess();
          this.callbacks.onCaptureStatus(`Conseguido! ${targetSpecies?.name || 'Monstro'} foi capturado!`);
          this.callbacks.onBattleLog(`Incrível! ${targetSpecies?.name} foi capturado com sucesso!`);

          s.targetMonster.state = 'captured';

          // Create new active monster
          const caughtMon: ActiveMonster = {
            instanceId: 'caught_' + Math.random().toString(36).substring(2, 9),
            speciesId: s.targetMonster.speciesId,
            nickname: targetSpecies?.name || 'Monstro',
            level: s.targetMonster.level,
            exp: 0,
            maxExp: s.targetMonster.level * 90,
            currentHp: s.targetMonster.currentHp,
            maxHp: s.targetMonster.maxHp,
            stats: {
              hp: s.targetMonster.maxHp,
              attack: Math.floor((targetSpecies?.baseStats.attack || 50) * (1 + s.targetMonster.level * 0.1)),
              defense: Math.floor((targetSpecies?.baseStats.defense || 50) * (1 + s.targetMonster.level * 0.1)),
              spAttack: Math.floor((targetSpecies?.baseStats.spAttack || 50) * (1 + s.targetMonster.level * 0.1)),
              spDefense: Math.floor((targetSpecies?.baseStats.spDefense || 50) * (1 + s.targetMonster.level * 0.1)),
              speed: Math.floor((targetSpecies?.baseStats.speed || 50) * (1 + s.targetMonster.level * 0.1)),
            },
            friendship: 50,
            moves: [...(targetSpecies?.moves || ['tackle'])],
            moveCooldowns: {},
            isMega: false,
            caughtWithBall: s.ballType,
            caughtAt: 'Litoral de PokeRealm',
          };

          this.callbacks.onMonsterCaught(caughtMon);

          setTimeout(() => {
            if (this.thrownSphere) {
              this.scene.remove(this.thrownSphere.mesh);
              this.thrownSphere = null;
            }
            this.callbacks.onCaptureStatus(null);
          }, 2500);
        } else {
          // Breakout!
          s.phase = 'done';
          soundManager.playBreakoutSound();
          this.callbacks.onCaptureStatus(`Oh não! O monstro se libertou!`);
          this.callbacks.onBattleLog(`${targetSpecies?.name} quebrou a esfera e escapou!`);

          if (s.targetMonster.meshGroup) {
            s.targetMonster.meshGroup.visible = true;
          }
          s.targetMonster.state = 'attacking';

          setTimeout(() => {
            if (this.thrownSphere) {
              this.scene.remove(this.thrownSphere.mesh);
              this.thrownSphere = null;
            }
            this.callbacks.onCaptureStatus(null);
          }, 1500);
        }
      }
    }
  }

  // -------------------------------------------------------------
  // ANIMATION & GAME LOOP
  // -------------------------------------------------------------
  private startLoop() {
    const tick = () => {
      const delta = Math.min(this.clock.getDelta(), 0.1);
      this.update(delta);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        // Safe paced callback on software WebGL
        const gl = this.renderer.getContext() as WebGL2RenderingContext;
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            this.frameId = window.setTimeout(poll, 5);
          } else {
            gl.deleteSync(sync);
            this.frameId = window.setTimeout(tick, 60);
          }
        };
        this.frameId = window.setTimeout(poll, 5);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    tick();
  }

  private update(delta: number) {
    this.animTime += delta;

    // 0. Dynamic Day/Night Cycle & Sky/Lighting Shifting
    this.updateTimeOfDay(delta);

    // Update Wind and Player interaction uniforms for living vegetation
    this.windUniforms.uTime.value = this.animTime;
    this.windUniforms.uPlayerPos.value.copy(this.playerPos);

    // 1. Water waves handled in GPU vertex shader via this.windUniforms.uTime
    if (this.waterMesh) {
      this.waterMesh.position.y = 0.12;
    }

    // 2. Player movement
    this.updatePlayer(delta);

    // 3. Partner monster follow
    this.updatePartner(delta);

    // 4. Wild monsters AI & state
    this.updateWildMonsters(delta);

    // 5. Projectiles
    this.updateProjectiles(delta);

    // 6. Capture sphere
    this.updateCaptureProcess(delta);

    // 7. Update 3rd person follow camera
    this.updateCamera(delta);

    // 8. Animate floating forest spore/pollen particles
    if (this.sporeParticles) {
      const posAttr = this.sporeParticles.geometry.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) + Math.sin(this.animTime * 1.5 + i * 0.7) * 0.005;
        let x = posAttr.getX(i) + Math.cos(this.animTime * 0.9 + i * 0.5) * 0.004;
        if (y > 7.5) y = 1.2;
        if (y < 1.2) y = 7.5;
        posAttr.setY(i, y);
        posAttr.setX(i, x);
      }
      posAttr.needsUpdate = true;
    }

    // 9. Sync minimap
    this.syncMinimap();
  }

  private updatePlayer(delta: number) {
    // Determine movement direction relative to camera yaw
    let moveX = 0;
    let moveZ = 0;

    if (this.keys['w'] || this.keys['arrowup']) moveZ += 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveZ -= 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

    const isMoving = moveX !== 0 || moveZ !== 0;
    const isSprinting = this.keys['shift'];
    const baseSpeed = isSprinting ? 10.5 : 6.0;

    if (isMoving) {
      // Calculate angle from camera yaw
      const moveAngle = Math.atan2(moveX, moveZ) + this.cameraAngle.yaw;
      this.playerRotation = THREE.MathUtils.damp(this.playerRotation, moveAngle, 12, delta);

      _forward.set(Math.sin(moveAngle), 0, Math.cos(moveAngle)).normalize();
      this.playerPos.addScaledVector(_forward, baseSpeed * delta);
    }

    // Apply friction to playerVelocity (e.g. from dodge)
    this.playerPos.addScaledVector(this.playerVelocity, delta);
    this.playerVelocity.multiplyScalar(Math.pow(0.05, delta));

    // Resolve Collisions with all 3D world objects (fences, trees, rocks, villa)!
    this.resolveCollisions(this.playerPos, 0.45);

    // Clamp terrain height
    const currentY = this.getTerrainHeight(this.playerPos.x, this.playerPos.z);
    this.playerPos.y = currentY;

    // Update Player Group
    this.playerGroup.position.copy(this.playerPos);
    this.playerGroup.rotation.y = this.playerRotation;

    // Legs / arms run animation
    const uData = this.playerGroup.userData;
    if (uData && uData.leftLeg && uData.rightLeg) {
      if (isMoving) {
        const stride = Math.sin(this.animTime * (isSprinting ? 14 : 9));
        uData.leftLeg.rotation.x = stride * 0.6;
        uData.rightLeg.rotation.x = -stride * 0.6;
        if (uData.leftArmGroup && uData.rightArmGroup) {
          uData.leftArmGroup.rotation.x = -stride * 0.5;
          uData.rightArmGroup.rotation.x = stride * 0.5;
        }
      } else {
        uData.leftLeg.rotation.x = THREE.MathUtils.damp(uData.leftLeg.rotation.x, 0, 8, delta);
        uData.rightLeg.rotation.x = THREE.MathUtils.damp(uData.rightLeg.rotation.x, 0, 8, delta);
        if (uData.leftArmGroup && uData.rightArmGroup) {
          uData.leftArmGroup.rotation.x = THREE.MathUtils.damp(uData.leftArmGroup.rotation.x, 0, 8, delta);
          uData.rightArmGroup.rotation.x = THREE.MathUtils.damp(uData.rightArmGroup.rotation.x, 0, 8, delta);
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 3D OBJECT COLLISION RESOLVER (Trees, Rocks, Fences, Villa, Map Bounds)
  // -------------------------------------------------------------
  public resolveCollisions(pos: THREE.Vector3, radius: number = 0.45): void {
    // 1. World Boundaries
    pos.x = Math.max(-55, Math.min(62, pos.x));
    pos.z = Math.max(-62, Math.min(62, pos.z));

    // 2. Coastal Cliff Edge (Drop into Ocean Barrier)
    if (pos.x > 27.5 && pos.z > -12 && pos.z < 42) {
      pos.x = 27.5;
    }

    // 3. Tree Trunks & Granite Moss Boulders (Circle Collisions)
    for (const c of this.collisionCircles) {
      const dx = pos.x - c.x;
      const dz = pos.z - c.z;
      const distSq = dx * dx + dz * dz;
      const minDist = radius + c.radius;
      if (distSq < minDist * minDist && distSq > 0.00001) {
        const dist = Math.sqrt(distSq);
        const push = minDist - dist;
        pos.x += (dx / dist) * push;
        pos.z += (dz / dist) * push;
      }
    }

    // 4. White Wooden Fences (Line Segment Collisions with smooth sliding)
    for (const seg of this.collisionSegments) {
      const sx = seg.x2 - seg.x1;
      const sz = seg.z2 - seg.z1;
      const lenSq = sx * sx + sz * sz;
      if (lenSq === 0) continue;

      const px = pos.x - seg.x1;
      const pz = pos.z - seg.z1;
      const t = Math.max(0, Math.min(1, (px * sx + pz * sz) / lenSq));

      const closeX = seg.x1 + t * sx;
      const closeZ = seg.z1 + t * sz;

      const dx = pos.x - closeX;
      const dz = pos.z - closeZ;
      const distSq = dx * dx + dz * dz;
      const minDist = radius + seg.thickness;

      if (distSq < minDist * minDist && distSq > 0.00001) {
        const dist = Math.sqrt(distSq);
        const push = minDist - dist;
        pos.x += (dx / dist) * push;
        pos.z += (dz / dist) * push;
      }
    }

    // 5. Research Villa Laboratory Building (AABB Collision)
    for (const box of this.collisionAABBs) {
      if (
        pos.x + radius > box.minX &&
        pos.x - radius < box.maxX &&
        pos.z + radius > box.minZ &&
        pos.z - radius < box.maxZ
      ) {
        const penLeft = (pos.x + radius) - box.minX;
        const penRight = box.maxX - (pos.x - radius);
        const penBottom = (pos.z + radius) - box.minZ;
        const penTop = box.maxZ - (pos.z - radius);

        const minPen = Math.min(penLeft, penRight, penBottom, penTop);
        if (minPen === penLeft) pos.x = box.minX - radius;
        else if (minPen === penRight) pos.x = box.maxX + radius;
        else if (minPen === penBottom) pos.z = box.minZ - radius;
        else if (minPen === penTop) pos.z = box.maxZ + radius;
      }
    }
  }

  private updatePartner(delta: number) {
    if (!this.partnerMonsterGroup) return;

    // Follow offset behind player
    const followOffset = new THREE.Vector3(
      -Math.sin(this.playerRotation) * 2.2 + 0.8,
      0,
      -Math.cos(this.playerRotation) * 2.2
    );
    const targetPos = this.playerPos.clone().add(followOffset);
    targetPos.y = this.getTerrainHeight(targetPos.x, targetPos.z);

    // Smoothly damp partner position
    this.partnerMonsterGroup.position.x = THREE.MathUtils.damp(this.partnerMonsterGroup.position.x, targetPos.x, 6, delta);
    this.partnerMonsterGroup.position.z = THREE.MathUtils.damp(this.partnerMonsterGroup.position.z, targetPos.z, 6, delta);
    this.resolveCollisions(this.partnerMonsterGroup.position, 0.45);
    this.partnerMonsterGroup.position.y = this.getTerrainHeight(this.partnerMonsterGroup.position.x, this.partnerMonsterGroup.position.z);

    // Look towards player or movement
    const lookAngle = Math.atan2(
      this.playerPos.x - this.partnerMonsterGroup.position.x,
      this.playerPos.z - this.partnerMonsterGroup.position.z
    );
    this.partnerMonsterGroup.rotation.y = THREE.MathUtils.damp(this.partnerMonsterGroup.rotation.y, lookAngle, 8, delta);
  }

  private updateWildMonsters(delta: number) {
    this.wildMonsters.forEach((m) => {
      if (m.currentHp <= 0 || m.state === 'captured') return;

      const distToPlayer = Math.hypot(m.position[0] - this.playerPos.x, m.position[2] - this.playerPos.z);

      if (distToPlayer < 7.0 && m.state === 'wandering') {
        m.state = 'alert';
      } else if (distToPlayer > 18.0 && m.state === 'alert') {
        m.state = 'wandering';
      }

      if (m.state === 'alert') {
        // Approach player slowly and attack
        m.attackCooldown -= delta;
        const angle = Math.atan2(this.playerPos.x - m.position[0], this.playerPos.z - m.position[2]);
        m.rotation = THREE.MathUtils.damp(m.rotation, angle, 6, delta);

        if (distToPlayer > 4.5) {
          m.position[0] += Math.sin(angle) * 3.2 * delta;
          m.position[2] += Math.cos(angle) * 3.2 * delta;
        }

        if (m.attackCooldown <= 0) {
          m.attackCooldown = 3.5 + Math.random() * 2;
          this.wildMonsterAttack(m);
        }
      } else if (m.state === 'wandering') {
        // Idle wandering around spawn center
        const idleWander = Math.sin(this.animTime * 0.4 + m.position[0]);
        m.rotation += idleWander * 0.02;
        m.position[0] += Math.sin(m.rotation) * 0.8 * delta;
        m.position[2] += Math.cos(m.rotation) * 0.8 * delta;

        // Leash to spawn center
        const leashDist = Math.hypot(m.position[0] - m.spawnCenter[0], m.position[2] - m.spawnCenter[2]);
        if (leashDist > 12) {
          m.rotation = Math.atan2(m.spawnCenter[0] - m.position[0], m.spawnCenter[2] - m.position[2]);
        }
      }

      // Update mesh position
      m.position[1] = this.getTerrainHeight(m.position[0], m.position[2]);
      if (m.meshGroup) {
        m.meshGroup.position.set(m.position[0], m.position[1], m.position[2]);
        m.meshGroup.rotation.y = m.rotation;
      }
    });
  }

  private wildMonsterAttack(monster: WildMonsterInstance) {
    const species = MONSTERS_DATABASE[monster.speciesId];
    if (!species) return;

    soundManager.playAttackSound(species.primaryType);
    this.callbacks.onBattleLog(`${species.name} selvagem atacou com força!`);

    // Player takes damage if close
    const dist = Math.hypot(monster.position[0] - this.playerPos.x, monster.position[2] - this.playerPos.z);
    if (dist < 6.0) {
      const dmg = Math.max(4, Math.floor(species.baseStats.attack * 0.25));
      this.activePartner.currentHp = Math.max(1, this.activePartner.currentHp - dmg);
      soundManager.playHitSound(false);

      this.callbacks.onDamageNumber({
        id: Math.random().toString(),
        text: `-${dmg}`,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 + 50,
        color: '#ef4444',
      });
    }
  }

  private updateProjectiles(delta: number) {
    for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
      const p = this.activeProjectiles[i];
      p.lifetime -= delta;
      p.mesh.position.addScaledVector(p.velocity, delta);

      // Check hit against wild monsters
      if (p.fromPlayer) {
        for (const m of this.wildMonsters) {
          if (m.currentHp <= 0 || m.state === 'captured') continue;
          const dist = p.mesh.position.distanceTo(new THREE.Vector3(m.position[0], m.position[1] + 0.6, m.position[2]));
          if (dist < 1.4) {
            this.applyDamageToMonster(m, p.move);
            p.lifetime = -1; // Explode
            break;
          }
        }
      }

      if (p.lifetime <= 0) {
        this.scene.remove(p.mesh);
        this.activeProjectiles.splice(i, 1);
      }
    }
  }

  private updateCamera(delta: number) {
    // Third-person camera calculations
    const targetLookAt = this.playerPos.clone().add(new THREE.Vector3(0, 1.4, 0));

    const cx = targetLookAt.x + Math.sin(this.cameraAngle.yaw) * Math.cos(this.cameraAngle.pitch) * this.cameraAngle.distance;
    const cy = targetLookAt.y + Math.sin(this.cameraAngle.pitch) * this.cameraAngle.distance;
    const cz = targetLookAt.z + Math.cos(this.cameraAngle.yaw) * Math.cos(this.cameraAngle.pitch) * this.cameraAngle.distance;

    // Prevent camera from clipping through terrain
    const terrainUnderCam = this.getTerrainHeight(cx, cz) + 0.8;
    const camY = Math.max(terrainUnderCam, cy);

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, cx, 14, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, camY, 14, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, cz, 14, delta);

    this.camera.lookAt(targetLookAt);
  }

  private syncMinimap() {
    const monstersData = this.wildMonsters
      .filter((m) => m.currentHp > 0 && m.state !== 'captured')
      .map((m) => ({
        id: m.id,
        speciesId: m.speciesId,
        x: m.position[0],
        z: m.position[2],
        hpPercent: m.currentHp / m.maxHp,
      }));

    this.callbacks.onMinimapUpdate({
      playerX: this.playerPos.x,
      playerZ: this.playerPos.z,
      playerRot: this.playerRotation,
      monsters: monstersData,
    });
  }

  // -------------------------------------------------------------
  // DYNAMIC DAY / NIGHT ATMOSPHERE & LIGHTING ENGINE
  // -------------------------------------------------------------
  private updateTimeOfDay(delta: number) {
    if (!this.isTimePaused) {
      // Advance time: default ~8.8 min full 24h cycle
      this.gameTime = (this.gameTime + delta * this.timeSpeed * this.timeMultiplier) % 24;
      if (this.gameTime < 0) this.gameTime += 24;
    }

    const t = this.gameTime;

    // Celestial angle (0 = sunrise 06:00, PI/2 = noon 12:00, PI = sunset 18:00, 3PI/2 = midnight 00:00)
    const angle = ((t - 6.0) / 24.0) * Math.PI * 2;
    const sinA = Math.sin(angle);
    const cosA = Math.cos(angle);

    // Sun 3D Celestial Position
    const sunX = -cosA * 190 + sinA * 25;
    const sunY = sinA * 220;
    const sunZ = -cosA * 95 + 35;
    this.skyUniforms.uSunPosition.value.set(sunX, sunY, sunZ);
    this.oceanUniforms.uSunPosition.value.set(sunX, sunY, sunZ);

    // Moon 3D Celestial Position (Opposing arc)
    const moonX = -sunX;
    const moonY = -sunY;
    const moonZ = -sunZ + 70;
    this.skyUniforms.uMoonPosition.value.set(moonX, moonY, moonZ);
    this.skyUniforms.uTimeOfDay.value = t;

    // Calculate phase blending weights (0 to 1)
    let dayWeight = 0;
    let sunsetWeight = 0;
    let nightWeight = 0;
    let dawnWeight = 0;

    if (t >= 5.0 && t < 7.5) {
      // Dawn transition (05:00 to 07:30)
      const f = (t - 5.0) / 2.5;
      dawnWeight = Math.sin(f * Math.PI);
      nightWeight = Math.max(0, (1.0 - f) * 0.9);
      dayWeight = Math.max(0, f - 0.2);
    } else if (t >= 7.5 && t < 16.5) {
      // Full Day (07:30 to 16:30)
      dayWeight = 1.0;
    } else if (t >= 16.5 && t < 20.5) {
      // Sunset / Dusk transition (16:30 to 20:30)
      const f = (t - 16.5) / 4.0;
      sunsetWeight = Math.sin(f * Math.PI);
      dayWeight = Math.max(0, (1.0 - f) * 0.9);
      nightWeight = Math.max(0, f - 0.2);
    } else {
      // Full Night (20:30 to 05:00)
      nightWeight = 1.0;
    }

    const totalW = dayWeight + sunsetWeight + nightWeight + dawnWeight || 1;
    const wDay = dayWeight / totalW;
    const wSunset = sunsetWeight / totalW;
    const wNight = nightWeight / totalW;
    const wDawn = dawnWeight / totalW;

    // 1. Sky Dome Zenith Color
    const cSkyTop = _c1.set('#0284c7').multiplyScalar(wDay)
      .add(_c2.set('#4c1d95').multiplyScalar(wSunset))
      .add(_c3.set('#020617').multiplyScalar(wNight))
      .add(_c4.set('#1e3a8a').multiplyScalar(wDawn));
    this.skyUniforms.uSkyTopColor.value.copy(cSkyTop);

    // 2. Sky Dome Horizon Color
    const cSkyBottom = _c1.set('#bae6fd').multiplyScalar(wDay)
      .add(_c2.set('#ea580c').multiplyScalar(wSunset))
      .add(_c3.set('#0f172a').multiplyScalar(wNight))
      .add(_c4.set('#f472b6').multiplyScalar(wDawn));
    this.skyUniforms.uSkyBottomColor.value.copy(cSkyBottom);

    // 3. Volumetric Cumulus Clouds Highlight & Ambient Shadow
    const cCloudHi = _c1.set('#ffffff').multiplyScalar(wDay)
      .add(_c2.set('#fed7aa').multiplyScalar(wSunset))
      .add(_c3.set('#334155').multiplyScalar(wNight))
      .add(_c4.set('#fef08a').multiplyScalar(wDawn));
    this.skyUniforms.uCloudHighlightColor.value.copy(cCloudHi);

    const cCloudSh = _c1.set('#93c5fd').multiplyScalar(wDay)
      .add(_c2.set('#7c2d12').multiplyScalar(wSunset))
      .add(_c3.set('#090d16').multiplyScalar(wNight))
      .add(_c4.set('#a855f7').multiplyScalar(wDawn));
    this.skyUniforms.uCloudShadowColor.value.copy(cCloudSh);

    // 4. Sun & Moon Celestial Disc Tint
    const cSun = _c1.set('#fffbeb').multiplyScalar(wDay)
      .add(_c2.set('#fb923c').multiplyScalar(wSunset))
      .add(_c3.set('#93c5fd').multiplyScalar(wNight))
      .add(_c4.set('#fef08a').multiplyScalar(wDawn));
    this.skyUniforms.uSunColor.value.copy(cSun);

    // 5. Stars Twinkle & Crepuscular God Rays
    this.skyUniforms.uStarIntensity.value = Math.min(1.0, wNight * 1.15 + wSunset * 0.15);
    this.skyUniforms.uRayIntensity.value = Math.max(0, wDay * 1.0 + wDawn * 0.8 + wSunset * 0.5 - wNight * 1.4);

    // 6. Directional Key Light & Dynamic Shadows
    const isSunUp = sinA > -0.05;
    if (isSunUp) {
      this.sunLight.position.set(sunX, Math.max(12, sunY), sunZ);
      this.sunLight.color.copy(cSun);
      this.sunLight.intensity = Math.max(0.25, (sinA * 1.6 + 0.3) * (1 - wNight * 0.75));
      this.sunLight.castShadow = !this.isSoftwareGl;
    } else {
      // Silvery moonlight takes over casting soft nocturnal shadows
      this.sunLight.position.set(moonX, Math.max(18, moonY), moonZ);
      this.sunLight.color.set('#93c5fd');
      this.sunLight.intensity = 0.45;
      this.sunLight.castShadow = !this.isSoftwareGl;
    }

    // 7. Hemisphere & Ambient Lights
    const cHemiSky = _c1.set('#bae6fd').multiplyScalar(wDay)
      .add(_c2.set('#c084fc').multiplyScalar(wSunset))
      .add(_c3.set('#1e1b4b').multiplyScalar(wNight))
      .add(_c4.set('#a5b4fc').multiplyScalar(wDawn));
    const cHemiGround = _c1.set('#15803d').multiplyScalar(wDay)
      .add(_c2.set('#854d0e').multiplyScalar(wSunset))
      .add(_c3.set('#052e16').multiplyScalar(wNight))
      .add(_c4.set('#166534').multiplyScalar(wDawn));
    this.hemiLight.color.copy(cHemiSky);
    this.hemiLight.groundColor.copy(cHemiGround);
    this.hemiLight.intensity = wDay * 0.85 + wSunset * 0.72 + wNight * 0.34 + wDawn * 0.65;

    const cAmbient = _c1.set('#ffffff').multiplyScalar(wDay)
      .add(_c2.set('#fdba74').multiplyScalar(wSunset))
      .add(_c3.set('#38bdf8').multiplyScalar(wNight))
      .add(_c4.set('#fef3c7').multiplyScalar(wDawn));
    this.ambientLight.color.copy(cAmbient);
    this.ambientLight.intensity = wDay * 0.35 + wSunset * 0.28 + wNight * 0.16 + wDawn * 0.25;

    // 8. Atmospheric Distance Fog
    if (this.scene.fog instanceof THREE.FogExp2) {
      const cFog = _c1.set('#bae6fd').multiplyScalar(wDay)
        .add(_c2.set('#fb923c').multiplyScalar(wSunset))
        .add(_c3.set('#0b1329').multiplyScalar(wNight))
        .add(_c4.set('#cbd5e1').multiplyScalar(wDawn));
      this.scene.fog.color.copy(cFog);
      this.scene.fog.density = wNight > 0.5 ? 0.0068 : 0.0055;
    }

    // 9. Ocean Water Sky Reflections & Specular Highlights
    const cSkyReflect = _c1.set('#48d2fa').multiplyScalar(wDay)
      .add(_c2.set('#f472b6').multiplyScalar(wSunset))
      .add(_c3.set('#1e293b').multiplyScalar(wNight))
      .add(_c4.set('#93c5fd').multiplyScalar(wDawn));
    this.oceanUniforms.uSkyReflectColor.value.copy(cSkyReflect);
    this.oceanUniforms.uSunSpecColor.value.copy(isSunUp ? cSun : _c1.set('#93c5fd').multiplyScalar(0.75));

    // 10. Research Villa Laboratory Windows (Glow amber at night/dusk!)
    if (this.researchVilla && this.researchVilla.userData.windowMat) {
      const winMat = this.researchVilla.userData.windowMat as THREE.MeshStandardMaterial;
      const nightGlow = Math.max(0, wNight + wSunset * 0.65);
      if (nightGlow > 0.05) {
        winMat.emissive.set('#f59e0b');
        winMat.emissiveIntensity = nightGlow * (1.1 + Math.sin(this.animTime * 1.8) * 0.12);
        winMat.color.set('#fde047');
      } else {
        winMat.emissive.set('#000000');
        winMat.emissiveIntensity = 0.0;
        winMat.color.set('#38bdf8');
      }
    }

    // 11. Forest Komorebi light rays opacity (Sunbeams fade at night)
    for (const kGroup of this.komorebiGroups) {
      kGroup.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
          (child.material as THREE.Material).opacity = wDay * 0.16 + wDawn * 0.12 + wSunset * 0.06;
        }
      });
    }

    // 12. Floating Spores/Bioluminescent motes
    if (this.sporeParticles) {
      const pMat = this.sporeParticles.material as THREE.PointsMaterial;
      if (wNight > 0.4) {
        pMat.color.set('#38bdf8'); // ethereal bioluminescent blue fireflies
      } else {
        pMat.color.set('#fef08a'); // sunny golden pollen motes
      }
    }

    // 13. Sync time callback with UI periodically
    if (this.animTime - this.lastTimeSync > 0.25) {
      this.lastTimeSync = this.animTime;
      if (this.callbacks.onTimeUpdate) {
        this.callbacks.onTimeUpdate(this.getTimeOfDayData());
      }
    }
  }

  public getTimeOfDayData(): TimeOfDayData {
    const t = (this.gameTime % 24 + 24) % 24;
    const hours = Math.floor(t);
    const minutes = Math.floor((t - hours) * 60);

    let phase: TimePhase = 'day';
    let phaseName = 'Pleno Dia';

    if (t >= 5.0 && t < 7.5) {
      phase = 'dawn';
      phaseName = 'Alvorecer';
    } else if (t >= 7.5 && t < 17.5) {
      phase = 'day';
      phaseName = 'Pleno Dia';
    } else if (t >= 17.5 && t < 20.5) {
      phase = 'dusk';
      phaseName = 'Pôr do Sol';
    } else {
      phase = 'night';
      phaseName = 'Noite Estrelada';
    }

    const padH = String(hours).padStart(2, '0');
    const padM = String(minutes).padStart(2, '0');

    return {
      timeInHours: t,
      hours,
      minutes,
      phase,
      phaseName,
      formattedTime: `${padH}:${padM}`,
      isNight: phase === 'night' || phase === 'dusk',
    };
  }

  public setTimeOfDay(hours: number): void {
    this.gameTime = (hours % 24 + 24) % 24;
    this.updateTimeOfDay(0);
    if (this.callbacks.onTimeUpdate) {
      this.callbacks.onTimeUpdate(this.getTimeOfDayData());
    }
  }

  public setTimeSpeed(multiplier: number): void {
    this.timeMultiplier = multiplier;
  }

  public toggleTimePause(): boolean {
    this.isTimePaused = !this.isTimePaused;
    return this.isTimePaused;
  }

  public dispose() {
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
}
