/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import {
  createCelMaterial,
  attachCelOutline,
  generateTrainerFaceTexture,
  generateWoodTexture,
  generateBarkTexture,
  createWindVegetationMaterial,
  createTreeFoliageMaterial,
  createHangingVineMaterial,
  WindUniforms,
} from './shaders';

// -------------------------------------------------------------
// TRAINER 3D MODEL (Faithful to Nintendo 3DS & Reference Image!)
// -------------------------------------------------------------
export function createTrainerModel(): THREE.Group {
  const trainer = new THREE.Group();
  trainer.name = 'Trainer';

  const skinMat = createCelMaterial('#fed7aa', null, 0.4);
  const faceTexture = generateTrainerFaceTexture();
  const faceMat = createCelMaterial('#ffffff', faceTexture, 0.4);
  const shirtMat = createCelMaterial('#f8fafc', null, 0.5);
  const collarMat = createCelMaterial('#38bdf8', null, 0.4);
  const shortsMat = createCelMaterial('#2563eb', null, 0.5);
  const hatMat = createCelMaterial('#334155', null, 0.4);
  const hatBandMat = createCelMaterial('#94a3b8', null, 0.3);
  const backpackMat = createCelMaterial('#854d0e', null, 0.4);
  const backpackDarkMat = createCelMaterial('#713f12', null, 0.4);
  const buckleMat = createCelMaterial('#facc15', null, 0.2); // Golden brass
  const shoeMat = createCelMaterial('#713f12', null, 0.4);
  const soleMat = createCelMaterial('#1e293b', null, 0.6);
  const sockMat = createCelMaterial('#334155', null, 0.6);
  const hairMat = createCelMaterial('#451a03', null, 0.5);

  const bodyRoot = new THREE.Group();

  // 1. Shoes & Feet
  const shoeGeo = new THREE.BoxGeometry(0.24, 0.18, 0.44);
  const soleGeo = new THREE.BoxGeometry(0.26, 0.05, 0.46);

  const leftShoeGroup = new THREE.Group();
  leftShoeGroup.position.set(-0.2, 0.1, 0.05);
  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.castShadow = true;
  attachCelOutline(leftShoe, 0.04);
  const leftSole = new THREE.Mesh(soleGeo, soleMat);
  leftSole.position.y = -0.09;
  leftShoeGroup.add(leftShoe, leftSole);
  bodyRoot.add(leftShoeGroup);

  const rightShoeGroup = new THREE.Group();
  rightShoeGroup.position.set(0.2, 0.1, 0.05);
  const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
  rightShoe.castShadow = true;
  attachCelOutline(rightShoe, 0.04);
  const rightSole = new THREE.Mesh(soleGeo, soleMat);
  rightSole.position.y = -0.09;
  rightShoeGroup.add(rightShoe, rightSole);
  bodyRoot.add(rightShoeGroup);

  // 2. Socks
  const sockGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.38, 16);
  const leftSock = new THREE.Mesh(sockGeo, sockMat);
  leftSock.position.set(-0.2, 0.36, 0);
  attachCelOutline(leftSock, 0.035);
  bodyRoot.add(leftSock);

  const rightSock = new THREE.Mesh(sockGeo, sockMat);
  rightSock.position.set(0.2, 0.36, 0);
  attachCelOutline(rightSock, 0.035);
  bodyRoot.add(rightSock);

  // 3. Legs (Animated)
  const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.48, 16);
  const leftLeg = new THREE.Mesh(legGeo, skinMat);
  leftLeg.position.set(-0.2, 0.76, 0);
  attachCelOutline(leftLeg, 0.035);
  bodyRoot.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, skinMat);
  rightLeg.position.set(0.2, 0.76, 0);
  attachCelOutline(rightLeg, 0.035);
  bodyRoot.add(rightLeg);

  // 4. Bermuda Shorts (Signature Blue)
  const shortsGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.52, 16);
  const shorts = new THREE.Mesh(shortsGeo, shortsMat);
  shorts.position.set(0, 1.15, 0);
  shorts.castShadow = true;
  attachCelOutline(shorts, 0.035);
  bodyRoot.add(shorts);

  // Shorts Belt & Poké-Ball Holder
  const beltGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.08, 16);
  const beltMat = createCelMaterial('#1e293b', null, 0.3);
  const belt = new THREE.Mesh(beltGeo, beltMat);
  belt.position.set(0, 1.38, 0);
  bodyRoot.add(belt);

  // Miniature decorative Poke-Ball clip on belt
  const miniBallGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const miniBallMat = createCelMaterial('#ef4444', null, 0.2);
  const miniBall = new THREE.Mesh(miniBallGeo, miniBallMat);
  miniBall.position.set(0.3, 1.38, 0.15);
  bodyRoot.add(miniBall);

  // 5. Torso (White collared Polo Shirt)
  const torsoGeo = new THREE.CylinderGeometry(0.28, 0.31, 0.7, 16);
  const torso = new THREE.Mesh(torsoGeo, shirtMat);
  torso.position.set(0, 1.7, 0);
  torso.castShadow = true;
  attachCelOutline(torso, 0.035);
  bodyRoot.add(torso);

  // Polo Collar & Placket
  const collarGeo = new THREE.TorusGeometry(0.2, 0.05, 8, 20);
  collarGeo.rotateX(Math.PI / 2);
  const collar = new THREE.Mesh(collarGeo, collarMat);
  collar.position.set(0, 2.02, 0);
  bodyRoot.add(collar);

  // 6. Leather Backpack (Detailed signature prop from screenshot!)
  const backpackGeo = new THREE.BoxGeometry(0.48, 0.56, 0.3);
  const backpack = new THREE.Mesh(backpackGeo, backpackMat);
  backpack.position.set(0, 1.7, -0.28);
  backpack.castShadow = true;
  attachCelOutline(backpack, 0.04);

  // Flap pocket with brass buckle
  const pocketGeo = new THREE.BoxGeometry(0.36, 0.24, 0.12);
  const pocket = new THREE.Mesh(pocketGeo, backpackDarkMat);
  pocket.position.set(0, -0.06, -0.16);
  const buckleGeo = new THREE.BoxGeometry(0.08, 0.08, 0.04);
  const buckle = new THREE.Mesh(buckleGeo, buckleMat);
  buckle.position.set(0, 0, -0.08);
  pocket.add(buckle);
  backpack.add(pocket);

  // Backpack Straps over shoulders
  const strapGeo = new THREE.BoxGeometry(0.09, 0.6, 0.04);
  const leftStrap = new THREE.Mesh(strapGeo, backpackDarkMat);
  leftStrap.position.set(-0.18, 0.06, 0.24);
  backpack.add(leftStrap);

  const rightStrap = new THREE.Mesh(strapGeo, backpackDarkMat);
  rightStrap.position.set(0.18, 0.06, 0.24);
  backpack.add(rightStrap);

  bodyRoot.add(backpack);

  // 7. Arms (Animated)
  const armGeo = new THREE.CylinderGeometry(0.08, 0.075, 0.6, 12);
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.36, 1.95, 0);
  const leftArm = new THREE.Mesh(armGeo, skinMat);
  leftArm.position.y = -0.28;
  attachCelOutline(leftArm, 0.035);
  // Short sleeve
  const sleeveGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.2, 12);
  const leftSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
  leftSleeve.position.y = -0.08;
  leftArmGroup.add(leftArm, leftSleeve);
  bodyRoot.add(leftArmGroup);

  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.36, 1.95, 0);
  const rightArm = new THREE.Mesh(armGeo, skinMat);
  rightArm.position.y = -0.28;
  attachCelOutline(rightArm, 0.035);
  const rightSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
  rightSleeve.position.y = -0.08;
  rightArmGroup.add(rightArm, rightSleeve);
  bodyRoot.add(rightArmGroup);

  // 8. Head & Face (With Expressive Anime Face Texture!)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 2.25, 0);

  const headGeo = new THREE.SphereGeometry(0.28, 20, 20);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  attachCelOutline(headMesh, 0.035);
  headGroup.add(headMesh);

  // Anime Face Front Decal
  const faceDecalGeo = new THREE.PlaneGeometry(0.36, 0.36);
  const faceDecal = new THREE.Mesh(faceDecalGeo, faceMat);
  faceDecal.position.set(0, -0.02, 0.26);
  headGroup.add(faceDecal);

  // Layered Anime Hair (Brown tufts)
  const hairBackGeo = new THREE.SphereGeometry(0.31, 16, 16);
  const hairBack = new THREE.Mesh(hairBackGeo, hairMat);
  hairBack.position.set(0, 0.05, -0.06);
  headGroup.add(hairBack);

  // Bangs framing forehead
  for (let b = -2; b <= 2; b++) {
    const bangGeo = new THREE.ConeGeometry(0.07, 0.22, 5);
    const bang = new THREE.Mesh(bangGeo, hairMat);
    bang.position.set(b * 0.08, 0.12, 0.24);
    bang.rotation.z = b * 0.15;
    bang.rotation.x = 0.3;
    headGroup.add(bang);
  }

  // 9. Explorer / Bucket Hat (Matching screenshot!)
  const hatCrownGeo = new THREE.CylinderGeometry(0.29, 0.33, 0.26, 24);
  const hatCrown = new THREE.Mesh(hatCrownGeo, hatMat);
  hatCrown.position.set(0, 0.22, 0);
  attachCelOutline(hatCrown, 0.035);

  const hatBrimGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.04, 28);
  const hatBrim = new THREE.Mesh(hatBrimGeo, hatMat);
  hatBrim.position.set(0, 0.11, 0);
  attachCelOutline(hatBrim, 0.035);

  const hatBandGeo = new THREE.CylinderGeometry(0.31, 0.32, 0.06, 24);
  const hatBand = new THREE.Mesh(hatBandGeo, hatBandMat);
  hatBand.position.set(0, 0.18, 0);

  headGroup.add(hatCrown, hatBrim, hatBand);
  bodyRoot.add(headGroup);

  trainer.add(bodyRoot);
  trainer.userData = {
    leftArmGroup,
    rightArmGroup,
    leftLeg,
    rightLeg,
  };

  return trainer;
}

// -------------------------------------------------------------
// ENHANCED PROCEDURAL 3D MONSTERS
// Stylized with Cel-Outlines, Anime Eyes & Rich Anatomy!
// -------------------------------------------------------------
export function createMonsterModel(speciesId: string): THREE.Group {
  const group = new THREE.Group();
  group.name = `Monster_${speciesId}`;

  switch (speciesId) {
    case 'flameling':
    case 'pyrodash':
    case 'solarex':
    case 'crimsonflare':
    case 'ignititan':
      buildEnhancedFireMonster(group, speciesId);
      break;

    case 'sproutlet':
    case 'florafawn':
    case 'sylvaidon':
    case 'verdantha':
      buildEnhancedGrassMonster(group, speciesId);
      break;

    case 'bubblot':
    case 'tidebeast':
    case 'leviathos':
    case 'glaciocean':
      buildEnhancedWaterMonster(group, speciesId);
      break;

    case 'voltmouse':
    case 'raigryph':
    case 'ampeon':
      buildEnhancedElectricMonster(group, speciesId);
      break;

    case 'drakonil':
    case 'cosmodrake':
      buildEnhancedDragonMonster(group, speciesId);
      break;

    default:
      buildEnhancedFireMonster(group, 'flameling');
  }

  return group;
}

function buildEnhancedFireMonster(group: THREE.Group, id: string) {
  const isStarter = id === 'flameling';
  const isTitan = id === 'ignititan';
  const scale = isStarter ? 0.8 : isTitan ? 1.6 : 1.3;

  const primaryColor = isTitan ? '#7c2d12' : isStarter ? '#f97316' : '#dc2626';
  const bodyMat = createCelMaterial(primaryColor, null, 0.4);
  const bellyMat = createCelMaterial('#fef08a', null, 0.5);
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#0f172a' });
  const catchLightMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const flameMat = new THREE.MeshBasicMaterial({ color: '#facc15' });

  // Body
  const bodyGeo = new THREE.SphereGeometry(0.48 * scale, 16, 16);
  bodyGeo.scale(1, 1.15, 1.1);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.55 * scale;
  body.castShadow = true;
  attachCelOutline(body, 0.04);
  group.add(body);

  // Cute cream belly patch
  const bellyGeo = new THREE.SphereGeometry(0.42 * scale, 14, 14);
  const belly = new THREE.Mesh(bellyGeo, bellyMat);
  belly.position.set(0, 0.5 * scale, 0.22 * scale);
  belly.scale.set(0.85, 1.1, 0.45);
  group.add(belly);

  // Head
  const headGeo = new THREE.SphereGeometry(0.38 * scale, 16, 16);
  const head = new THREE.Mesh(headGeo, bodyMat);
  head.position.set(0, 1.05 * scale, 0.22 * scale);
  head.castShadow = true;
  attachCelOutline(head, 0.04);
  group.add(head);

  // Snout
  const snoutGeo = new THREE.ConeGeometry(0.18 * scale, 0.32 * scale, 10);
  snoutGeo.rotateX(Math.PI / 2);
  const snout = new THREE.Mesh(snoutGeo, bellyMat);
  snout.position.set(0, 0.98 * scale, 0.54 * scale);
  group.add(snout);

  // Anime Eyes with Catchlight sparkles!
  [-0.18, 0.18].forEach((ex) => {
    const eyeGeo = new THREE.SphereGeometry(0.08 * scale, 10, 10);
    eyeGeo.scale(1, 1.4, 0.5);
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(ex * scale, 1.12 * scale, 0.5 * scale);
    const catchLight = new THREE.Mesh(new THREE.SphereGeometry(0.03 * scale, 6, 6), catchLightMat);
    catchLight.position.set(-0.02 * scale, 0.04 * scale, 0.04 * scale);
    eye.add(catchLight);
    group.add(eye);
  });

  // Expressive Fox Ears
  [-0.26, 0.26].forEach((ex, i) => {
    const earGeo = new THREE.ConeGeometry(0.14 * scale, 0.42 * scale, 8);
    const ear = new THREE.Mesh(earGeo, bodyMat);
    ear.position.set(ex * scale, 1.45 * scale, 0.15 * scale);
    ear.rotation.z = i === 0 ? 0.3 : -0.3;
    attachCelOutline(ear, 0.04);
    group.add(ear);
  });

  // Flaming Tail (Multi-tiered fire plume)
  const tailBaseGeo = new THREE.CylinderGeometry(0.1 * scale, 0.22 * scale, 0.6 * scale, 10);
  const tail = new THREE.Mesh(tailBaseGeo, bodyMat);
  tail.position.set(0, 0.65 * scale, -0.45 * scale);
  tail.rotation.x = -Math.PI / 3.5;
  attachCelOutline(tail, 0.04);
  group.add(tail);

  const flameGeo1 = new THREE.SphereGeometry(0.26 * scale, 12, 12);
  flameGeo1.scale(1, 2.0, 1);
  const flameTip1 = new THREE.Mesh(flameGeo1, flameMat);
  flameTip1.position.set(0, 1.05 * scale, -0.85 * scale);
  group.add(flameTip1);

  // Paws
  const pawGeo = new THREE.CylinderGeometry(0.1 * scale, 0.13 * scale, 0.35 * scale, 10);
  [
    [-0.26, 0.18, 0.25],
    [0.26, 0.18, 0.25],
    [-0.26, 0.18, -0.25],
    [0.26, 0.18, -0.25],
  ].forEach(([px, py, pz]) => {
    const paw = new THREE.Mesh(pawGeo, bodyMat);
    paw.position.set(px * scale, py * scale, pz * scale);
    paw.castShadow = true;
    attachCelOutline(paw, 0.04);
    group.add(paw);
  });
}

function buildEnhancedGrassMonster(group: THREE.Group, id: string) {
  const isStarter = id === 'sproutlet';
  const scale = isStarter ? 0.85 : 1.4;

  const primaryColor = isStarter ? '#22c55e' : '#15803d';
  const bodyMat = createCelMaterial(primaryColor, null, 0.4);
  const bellyMat = createCelMaterial('#dcfce7', null, 0.5);
  const petalMat = createCelMaterial('#ec4899', null, 0.3);
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#064e3b' });
  const catchLightMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

  const bodyGeo = new THREE.CapsuleGeometry(0.38 * scale, 0.5 * scale, 10, 16);
  bodyGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.58 * scale;
  body.castShadow = true;
  attachCelOutline(body, 0.04);
  group.add(body);

  // Head
  const headGeo = new THREE.SphereGeometry(0.36 * scale, 16, 16);
  const head = new THREE.Mesh(headGeo, bodyMat);
  head.position.set(0, 1.02 * scale, 0.38 * scale);
  attachCelOutline(head, 0.04);
  group.add(head);

  // Big gentle anime eyes
  [-0.18, 0.18].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075 * scale, 8, 8), eyeMat);
    eye.position.set(ex * scale, 1.08 * scale, 0.65 * scale);
    const cl = new THREE.Mesh(new THREE.SphereGeometry(0.03 * scale, 6, 6), catchLightMat);
    cl.position.set(-0.02 * scale, 0.03 * scale, 0.04 * scale);
    eye.add(cl);
    group.add(eye);
  });

  // Blooming Flower Bulb on Back
  const flowerCore = new THREE.Mesh(new THREE.SphereGeometry(0.24 * scale, 12, 12), petalMat);
  flowerCore.position.set(0, 0.95 * scale, -0.15 * scale);
  attachCelOutline(flowerCore, 0.04);
  group.add(flowerCore);

  for (let p = 0; p < 5; p++) {
    const petalGeo = new THREE.ConeGeometry(0.12 * scale, 0.35 * scale, 6);
    petalGeo.rotateZ(Math.PI / 4);
    const petal = new THREE.Mesh(petalGeo, petalMat);
    petal.position.set(0, 0.95 * scale, -0.15 * scale);
    petal.rotation.y = (p / 5) * Math.PI * 2;
    group.add(petal);
  }

  // Four slender legs
  const legGeo = new THREE.CylinderGeometry(0.09 * scale, 0.07 * scale, 0.52 * scale, 10);
  [
    [-0.24, 0.26, 0.32],
    [0.24, 0.26, 0.32],
    [-0.24, 0.26, -0.32],
    [0.24, 0.26, -0.32],
  ].forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(legGeo, bodyMat);
    leg.position.set(lx * scale, ly * scale, lz * scale);
    leg.castShadow = true;
    attachCelOutline(leg, 0.04);
    group.add(leg);
  });
}

function buildEnhancedWaterMonster(group: THREE.Group, id: string) {
  const isStarter = id === 'bubblot';
  const scale = isStarter ? 0.85 : 1.4;

  const bodyMat = createCelMaterial(isStarter ? '#0ea5e9' : '#0284c7', null, 0.3);
  const bellyMat = createCelMaterial('#e0f2fe', null, 0.5);
  const finMat = createCelMaterial('#38bdf8', null, 0.2);
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#082f49' });
  const catchLightMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

  const bodyGeo = new THREE.CapsuleGeometry(0.42 * scale, 0.65 * scale, 12, 16);
  bodyGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.52 * scale;
  body.castShadow = true;
  attachCelOutline(body, 0.04);
  group.add(body);

  const headGeo = new THREE.SphereGeometry(0.38 * scale, 16, 16);
  const head = new THREE.Mesh(headGeo, bodyMat);
  head.position.set(0, 0.92 * scale, 0.44 * scale);
  attachCelOutline(head, 0.04);
  group.add(head);

  // Bubble Scarf
  const collarGeo = new THREE.TorusGeometry(0.36 * scale, 0.12 * scale, 10, 20);
  collarGeo.rotateX(Math.PI / 2);
  const collar = new THREE.Mesh(collarGeo, finMat);
  collar.position.set(0, 0.76 * scale, 0.38 * scale);
  group.add(collar);

  // Eyes
  [-0.18, 0.18].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08 * scale, 8, 8), eyeMat);
    eye.position.set(ex * scale, 0.98 * scale, 0.72 * scale);
    const cl = new THREE.Mesh(new THREE.SphereGeometry(0.03 * scale, 6, 6), catchLightMat);
    cl.position.set(-0.02 * scale, 0.03 * scale, 0.04 * scale);
    eye.add(cl);
    group.add(eye);
  });

  // Flippers
  const flipGeo = new THREE.BoxGeometry(0.45 * scale, 0.1 * scale, 0.26 * scale);
  const leftFlip = new THREE.Mesh(flipGeo, finMat);
  leftFlip.position.set(-0.42 * scale, 0.28 * scale, 0.22 * scale);
  leftFlip.rotation.z = -0.3;
  attachCelOutline(leftFlip, 0.04);
  group.add(leftFlip);

  const rightFlip = new THREE.Mesh(flipGeo, finMat);
  rightFlip.position.set(0.42 * scale, 0.28 * scale, 0.22 * scale);
  rightFlip.rotation.z = 0.3;
  attachCelOutline(rightFlip, 0.04);
  group.add(rightFlip);
}

function buildEnhancedElectricMonster(group: THREE.Group, id: string) {
  const isMouse = id === 'voltmouse';
  const scale = isMouse ? 0.75 : 1.35;

  const yellowMat = createCelMaterial('#eab308', null, 0.3);
  const cheekMat = createCelMaterial('#ef4444', null, 0.4);
  const earTipMat = createCelMaterial('#0f172a', null, 0.4);
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#0f172a' });
  const catchLightMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

  const bodyGeo = new THREE.SphereGeometry(0.42 * scale, 16, 16);
  bodyGeo.scale(1, 1.25, 1);
  const body = new THREE.Mesh(bodyGeo, yellowMat);
  body.position.y = 0.52 * scale;
  body.castShadow = true;
  attachCelOutline(body, 0.04);
  group.add(body);

  const headGeo = new THREE.SphereGeometry(0.38 * scale, 16, 16);
  const head = new THREE.Mesh(headGeo, yellowMat);
  head.position.set(0, 0.98 * scale, 0.12 * scale);
  attachCelOutline(head, 0.04);
  group.add(head);

  // Red Cheek Pouches
  [-0.26, 0.26].forEach((cx) => {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.11 * scale, 8, 8), cheekMat);
    cheek.position.set(cx * scale, 0.92 * scale, 0.38 * scale);
    group.add(cheek);
  });

  // Eyes
  [-0.16, 0.16].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075 * scale, 8, 8), eyeMat);
    eye.position.set(ex * scale, 1.05 * scale, 0.42 * scale);
    const cl = new THREE.Mesh(new THREE.SphereGeometry(0.03 * scale, 6, 6), catchLightMat);
    cl.position.set(-0.02 * scale, 0.03 * scale, 0.04 * scale);
    eye.add(cl);
    group.add(eye);
  });

  // Long Pointy Ears with black tips
  [-0.24, 0.24].forEach((ex, i) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.11 * scale, 0.55 * scale, 8), yellowMat);
    ear.position.set(ex * scale, 1.48 * scale, 0.05 * scale);
    ear.rotation.z = i === 0 ? 0.35 : -0.35;
    attachCelOutline(ear, 0.04);
    group.add(ear);
  });
}

function buildEnhancedDragonMonster(group: THREE.Group, id: string) {
  const isStarter = id === 'drakonil';
  const scale = isStarter ? 0.9 : 1.7;

  const purpleMat = createCelMaterial('#7c3aed', null, 0.3);
  const bellyMat = createCelMaterial('#c4b5fd', null, 0.4);
  const hornMat = createCelMaterial('#facc15', null, 0.2);

  const bodyGeo = new THREE.ConeGeometry(0.45 * scale, 1.0 * scale, 10);
  const body = new THREE.Mesh(bodyGeo, purpleMat);
  body.position.y = 0.65 * scale;
  body.castShadow = true;
  attachCelOutline(body, 0.04);
  group.add(body);

  const headGeo = new THREE.BoxGeometry(0.42 * scale, 0.38 * scale, 0.52 * scale);
  const head = new THREE.Mesh(headGeo, purpleMat);
  head.position.set(0, 1.35 * scale, 0.25 * scale);
  attachCelOutline(head, 0.04);
  group.add(head);

  // Mystic Horns
  [-0.22, 0.22].forEach((hx, i) => {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.09 * scale, 0.48 * scale, 6), hornMat);
    horn.position.set(hx * scale, 1.7 * scale, 0.12 * scale);
    horn.rotation.x = -Math.PI / 4;
    horn.rotation.z = i === 0 ? 0.2 : -0.2;
    group.add(horn);
  });
}

// -------------------------------------------------------------
// POKÉ-SPHERE 3D PROJECTILE
// -------------------------------------------------------------
export function createPokeSphere(ballType: string = 'poke_sphere'): THREE.Group {
  const sphereGroup = new THREE.Group();

  let topColor = '#ef4444';
  if (ballType === 'great_sphere') topColor = '#2563eb';
  if (ballType === 'ultra_sphere') topColor = '#1e293b';

  const topMat = createCelMaterial(topColor, null, 0.2);
  const bottomMat = createCelMaterial('#f8fafc', null, 0.2);
  const bandMat = createCelMaterial('#0f172a', null, 0.3);
  const buttonMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });

  const radius = 0.2;

  const topGeo = new THREE.SphereGeometry(radius, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2);
  const topMesh = new THREE.Mesh(topGeo, topMat);
  attachCelOutline(topMesh, 0.04);
  sphereGroup.add(topMesh);

  const bottomGeo = new THREE.SphereGeometry(radius, 20, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const bottomMesh = new THREE.Mesh(bottomGeo, bottomMat);
  attachCelOutline(bottomMesh, 0.04);
  sphereGroup.add(bottomMesh);

  const bandGeo = new THREE.CylinderGeometry(radius * 1.02, radius * 1.02, 0.04, 20);
  const bandMesh = new THREE.Mesh(bandGeo, bandMat);
  sphereGroup.add(bandMesh);

  const buttonGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.025, 16);
  buttonGeo.rotateX(Math.PI / 2);
  const buttonMesh = new THREE.Mesh(buttonGeo, buttonMat);
  buttonMesh.position.set(0, 0, radius * 1.03);
  sphereGroup.add(buttonMesh);

  return sphereGroup;
}

// -------------------------------------------------------------
// ENVIRONMENT PROPS (Matching User's Reference Screenshot!)
// -------------------------------------------------------------

// 1. Coastal Research Villa / Laboratory
export function createResearchVilla(): THREE.Group {
  const villa = new THREE.Group();
  villa.name = 'ResearchVilla';

  const wallMat = createCelMaterial('#e2e8f0', null, 0.6);
  const roofMat = createCelMaterial('#1d4ed8', null, 0.3);
  const trimMat = createCelMaterial('#ffffff', null, 0.4);
  const glassMat = createCelMaterial('#38bdf8', null, 0.1);

  // Main 2-story Hall
  const mainGeo = new THREE.BoxGeometry(18, 9, 12);
  const mainBuilding = new THREE.Mesh(mainGeo, wallMat);
  mainBuilding.position.y = 4.5;
  mainBuilding.castShadow = true;
  attachCelOutline(mainBuilding, 0.02);
  villa.add(mainBuilding);

  // Blue Pitch Roof
  const roofGeo = new THREE.ConeGeometry(14, 5, 4);
  roofGeo.rotateY(Math.PI / 4);
  roofGeo.scale(1.4, 1, 0.95);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, 11, 0);
  roof.castShadow = true;
  attachCelOutline(roof, 0.02);
  villa.add(roof);

  // Central Observatory Dome
  const towerGeo = new THREE.CylinderGeometry(2.8, 3.0, 4, 20);
  const tower = new THREE.Mesh(towerGeo, trimMat);
  tower.position.set(0, 10.5, 0);
  villa.add(tower);

  const domeGeo = new THREE.SphereGeometry(2.8, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeo, roofMat);
  dome.position.set(0, 12.5, 0);
  attachCelOutline(dome, 0.02);
  villa.add(dome);

  // Grand Portico & Pillars
  const columnGeo = new THREE.CylinderGeometry(0.45, 0.5, 5.5, 14);
  [-4.5, -1.5, 1.5, 4.5].forEach((cx) => {
    const col = new THREE.Mesh(columnGeo, trimMat);
    col.position.set(cx, 2.75, 6.8);
    col.castShadow = true;
    attachCelOutline(col, 0.03);
    villa.add(col);
  });

  // Entrance Balcony
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(11, 0.9, 3.2), roofMat);
  canopy.position.set(0, 5.8, 7.2);
  villa.add(canopy);

  // Steps
  const steps = new THREE.Mesh(new THREE.BoxGeometry(12, 0.8, 5), trimMat);
  steps.position.set(0, 0.4, 8.5);
  villa.add(steps);

  // Dynamic Illumination Windows & Observatory Beacon (Light up warm gold at dusk/night!)
  const windowMat = new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    emissive: new THREE.Color('#000000'),
    emissiveIntensity: 0.0,
    roughness: 0.2,
  });

  const windowPositions: [number, number, number][] = [
    // 1st Floor
    [-6.5, 2.5, 6.05], [-2.5, 2.5, 6.05], [2.5, 2.5, 6.05], [6.5, 2.5, 6.05],
    // 2nd Floor
    [-6.5, 6.8, 6.05], [-2.5, 6.8, 6.05], [2.5, 6.8, 6.05], [6.5, 6.8, 6.05],
    // Sides
    [-9.05, 4.5, 0], [9.05, 4.5, 0],
  ];

  const winGeo = new THREE.BoxGeometry(1.6, 2.0, 0.1);
  const winFrameGeo = new THREE.BoxGeometry(1.8, 2.2, 0.08);

  windowPositions.forEach(([wx, wy, wz]) => {
    const winGroup = new THREE.Group();
    const frame = new THREE.Mesh(winFrameGeo, trimMat);
    const glass = new THREE.Mesh(winGeo, windowMat);
    winGroup.add(frame);
    winGroup.add(glass);
    winGroup.position.set(wx, wy, wz);
    if (Math.abs(wx) > 8.0) winGroup.rotation.y = Math.PI / 2;
    villa.add(winGroup);
  });

  // Warm Entrance Lantern
  const lanternMat = new THREE.MeshBasicMaterial({ color: '#fef08a' });
  const lanternGeo = new THREE.DodecahedronGeometry(0.35);
  const lantern = new THREE.Mesh(lanternGeo, lanternMat);
  lantern.position.set(0, 4.8, 7.2);
  villa.add(lantern);

  // Dome Observatory Beacon (Rotates or pulses at night)
  const beaconGeo = new THREE.SphereGeometry(0.5, 12, 12);
  const beaconMat = new THREE.MeshBasicMaterial({ color: '#38bdf8' });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.set(0, 15.3, 0);
  villa.add(beacon);

  villa.userData = {
    windowMat,
    beaconMat,
  };

  return villa;
}

// 2. White Wooden Fences (Foreground of screenshot!)
export function createFenceSegment(length: number = 4): THREE.Group {
  const fence = new THREE.Group();
  const woodTexture = generateWoodTexture();
  const fenceMat = createCelMaterial('#f8fafc', woodTexture, 0.4);

  // Left Post
  const postGeo = new THREE.BoxGeometry(0.32, 1.4, 0.32);
  const postCapGeo = new THREE.ConeGeometry(0.26, 0.2, 4);
  postCapGeo.rotateY(Math.PI / 4);

  const post = new THREE.Mesh(postGeo, fenceMat);
  post.position.set(0, 0.7, 0);
  post.castShadow = true;
  attachCelOutline(post, 0.03);
  fence.add(post);

  const cap = new THREE.Mesh(postCapGeo, fenceMat);
  cap.position.set(0, 1.45, 0);
  fence.add(cap);

  // Dual Rails
  const railGeo = new THREE.BoxGeometry(length, 0.14, 0.08);
  const topRail = new THREE.Mesh(railGeo, fenceMat);
  topRail.position.set(length / 2, 1.05, 0);
  topRail.castShadow = true;
  attachCelOutline(topRail, 0.025);
  fence.add(topRail);

  const bottomRail = new THREE.Mesh(railGeo, fenceMat);
  bottomRail.position.set(length / 2, 0.5, 0);
  bottomRail.castShadow = true;
  attachCelOutline(bottomRail, 0.025);
  fence.add(bottomRail);

  return fence;
}

// 3. Tropical Palm Tree
export function createPalmTree(): THREE.Group {
  const palm = new THREE.Group();
  const trunkMat = createCelMaterial('#9a3412', null, 0.6);
  const frondMat = createCelMaterial('#15803d', null, 0.3);

  // Curved segmented trunk
  const segments = 7;
  let currentY = 0;
  for (let i = 0; i < segments; i++) {
    const rB = 0.46 - i * 0.04;
    const rT = 0.42 - i * 0.04;
    const height = 0.95;
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, height, 10), trunkMat);
    seg.position.set(Math.sin(i * 0.28) * 0.25, currentY + height / 2, 0);
    seg.rotation.z = -0.07;
    seg.castShadow = true;
    attachCelOutline(seg, 0.03);
    palm.add(seg);
    currentY += height;
  }

  // Fan Fronds
  const frondGeo = new THREE.ConeGeometry(0.65, 3.2, 5);
  frondGeo.scale(1, 1, 0.12);
  frondGeo.translate(0, 1.6, 0);

  for (let f = 0; f < 8; f++) {
    const angle = (f / 8) * Math.PI * 2;
    const frond = new THREE.Mesh(frondGeo, frondMat);
    frond.position.set(0.25, currentY, 0);
    frond.rotation.y = angle;
    frond.rotation.x = Math.PI / 3.4;
    frond.castShadow = true;
    attachCelOutline(frond, 0.02);
    palm.add(frond);
  }

  return palm;
}

// 4. Realistic Anime Forest Tree (Inspired by user's Pokémon Anime / Ghibli references!)
// Features buttress roots, organic bark texture, climbing ivy, pendulous swaying lianas & fluttering foliage
export function createAnimeForestTree(windUniforms?: WindUniforms): THREE.Group {
  const tree = new THREE.Group();
  tree.name = 'AnimeForestTree';

  // Organic bark texture with vertical ridges and moss patches
  const barkTex = generateBarkTexture();
  const trunkMat = createCelMaterial('#ffffff', barkTex, 0.75);
  const vineMat = windUniforms
    ? createHangingVineMaterial('#166534', windUniforms)
    : createCelMaterial('#166534', null, 0.5);
  const ivyLeafMat = createCelMaterial('#4ade80', null, 0.4);

  // Canopies with multi-tone fluttering wind materials
  const canopyMatSunlit = windUniforms
    ? createTreeFoliageMaterial('#84cc16', windUniforms, 1.2) // Sunlit lime-green canopy tips
    : createCelMaterial('#84cc16', null, 0.35);

  const canopyMatTop = windUniforms
    ? createTreeFoliageMaterial('#22c55e', windUniforms, 1.0) // Vibrant emerald
    : createCelMaterial('#22c55e', null, 0.4);

  const canopyMatMid = windUniforms
    ? createTreeFoliageMaterial('#16a34a', windUniforms, 0.8) // Rich forest midtone
    : createCelMaterial('#16a34a', null, 0.4);

  const canopyMatShadow = windUniforms
    ? createTreeFoliageMaterial('#14532d', windUniforms, 0.5) // Deep interior canopy shadow
    : createCelMaterial('#14532d', null, 0.5);

  // 1. Buttress Roots (Gripping the soil like massive ancient banyans/oaks)
  const rootAngles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3, Math.PI / 4];
  rootAngles.forEach((angle) => {
    const rootGeo = new THREE.CylinderGeometry(0.22, 0.56, 1.6, 8);
    const root = new THREE.Mesh(rootGeo, trunkMat);
    root.position.set(Math.cos(angle) * 0.82, 0.55, Math.sin(angle) * 0.82);
    root.rotation.z = Math.cos(angle) * 0.38;
    root.rotation.x = -Math.sin(angle) * 0.38;
    root.castShadow = true;
    attachCelOutline(root, 0.03);
    tree.add(root);
  });

  // 2. Main Sculpted Trunk with Gnarled Taper
  const mainTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 1.28, 3.6, 14), trunkMat);
  mainTrunk.position.y = 1.8;
  mainTrunk.castShadow = true;
  attachCelOutline(mainTrunk, 0.03);
  tree.add(mainTrunk);

  // 2b. Climbing Ivy Vines Wrapping the Trunk (Signature feature from anime reference image!)
  for (let ring = 0; ring < 4; ring++) {
    const ivyY = 0.8 + ring * 0.75;
    const ivyRotY = ring * 1.35;
    const ivySegment = new THREE.Mesh(
      new THREE.TorusGeometry(0.92 - ring * 0.04, 0.05, 6, 12, Math.PI * 1.2),
      vineMat
    );
    ivySegment.position.set(0, ivyY, 0);
    ivySegment.rotation.x = Math.PI / 2 + 0.25;
    ivySegment.rotation.y = ivyRotY;
    tree.add(ivySegment);

    // Scattered little ivy leaf clusters along the spiraling vine
    for (let l = 0; l < 3; l++) {
      const leafAngle = ivyRotY + (l / 3) * Math.PI * 1.2;
      const leafX = Math.cos(leafAngle) * (0.95 - ring * 0.04);
      const leafZ = Math.sin(leafAngle) * (0.95 - ring * 0.04);
      const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 0), ivyLeafMat);
      leaf.position.set(leafX, ivyY + (Math.random() - 0.5) * 0.15, leafZ);
      tree.add(leaf);
    }
  }

  // 3. Spreading Organic Boughs & Branches
  const boughConfigs = [
    { pos: [0.35, 3.3, 0.25], rot: [0.42, 0.2, 0.55], length: 2.4, rT: 0.38, rB: 0.55 },
    { pos: [-0.45, 3.2, -0.35], rot: [-0.38, -0.42, -0.5], length: 2.2, rT: 0.32, rB: 0.52 },
    { pos: [0.15, 3.5, -0.45], rot: [-0.48, 0.35, 0.12], length: 2.5, rT: 0.35, rB: 0.54 },
    { pos: [-0.35, 3.6, 0.35], rot: [0.35, -0.52, -0.32], length: 2.1, rT: 0.3, rB: 0.48 },
  ];

  boughConfigs.forEach((cfg) => {
    const bough = new THREE.Mesh(new THREE.CylinderGeometry(cfg.rT, cfg.rB, cfg.length, 8), trunkMat);
    bough.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
    bough.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
    bough.castShadow = true;
    attachCelOutline(bough, 0.03);
    tree.add(bough);
  });

  // 4. Trailing Lianas & Vines Hanging from Branches (With fluid pendulum wind sway!)
  const vineConfigs: [number, number, number, number][] = [
    [-1.2, 3.1, 0.5, 2.6],
    [1.1, 3.2, -0.7, 2.8],
    [-0.4, 3.0, -1.2, 2.4],
    [0.9, 2.9, 0.8, 2.2],
    [-0.8, 3.3, -0.6, 2.7],
  ];

  vineConfigs.forEach(([vx, vy, vz, vh]) => {
    const vine = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.025, vh, 8), vineMat);
    vine.position.set(vx, vy - vh / 2, vz);
    vine.rotation.z = (Math.random() - 0.5) * 0.12;
    tree.add(vine);

    // Leaf cluster near bottom of vine
    const bottomLeaf = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14, 0), ivyLeafMat);
    bottomLeaf.position.set(vx, vy - vh + 0.15, vz);
    tree.add(bottomLeaf);
  });

  // 5. Multi-Layered Billowing Anime Foliage Clouds (Lush Studio Ghibli / Pokémon Anime silhouette)
  const foliageClouds = [
    // Sunlit Crown Highlights (Brightest Lime Green)
    { x: 0.1, y: 6.5, z: 0.1, r: 2.0, mat: canopyMatSunlit },
    { x: 0.8, y: 6.2, z: -0.4, r: 1.7, mat: canopyMatSunlit },
    { x: -0.7, y: 6.1, z: 0.5, r: 1.8, mat: canopyMatSunlit },

    // Upper Spreading Tier (Vibrant Emerald)
    { x: 0, y: 5.4, z: 0, r: 2.6, mat: canopyMatTop },
    { x: 1.8, y: 5.1, z: 0.7, r: 2.2, mat: canopyMatTop },
    { x: -1.7, y: 5.0, z: -0.8, r: 2.3, mat: canopyMatTop },
    { x: 0.6, y: 5.2, z: -1.8, r: 2.1, mat: canopyMatTop },
    { x: -0.8, y: 5.3, z: 1.7, r: 2.2, mat: canopyMatTop },

    // Mid Bough Tier (Lush Forest Green)
    { x: -2.1, y: 4.3, z: 0.9, r: 2.2, mat: canopyMatMid },
    { x: 2.2, y: 4.4, z: -0.9, r: 2.3, mat: canopyMatMid },
    { x: 0.7, y: 4.5, z: 2.1, r: 2.0, mat: canopyMatMid },
    { x: -0.9, y: 4.4, z: -2.0, r: 2.1, mat: canopyMatMid },

    // Lower Deep Shadow Puffs (Deep Canopy Core)
    { x: -1.4, y: 3.6, z: -0.9, r: 1.8, mat: canopyMatShadow },
    { x: 1.5, y: 3.5, z: 1.0, r: 1.9, mat: canopyMatShadow },
    { x: 0, y: 3.7, z: -1.4, r: 1.7, mat: canopyMatShadow },
  ];

  foliageClouds.forEach((fc) => {
    const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(fc.r, 1), fc.mat);
    puff.position.set(fc.x, fc.y, fc.z);
    puff.castShadow = true;
    attachCelOutline(puff, 0.025);
    tree.add(puff);
  });

  return tree;
}

// Aliases for compatibility
export const createOakTree = createAnimeForestTree;

// 4b. Tropical Undergrowth Ferns (Broad serrated fronds from reference image!)
export function createTropicalFern(windUniforms?: WindUniforms): THREE.Group {
  const fern = new THREE.Group();
  const frondMat = windUniforms
    ? createWindVegetationMaterial('#15803d', windUniforms)
    : createCelMaterial('#15803d', null, 0.4);

  const frondCount = 7;
  for (let f = 0; f < frondCount; f++) {
    const angle = (f / frondCount) * Math.PI * 2;
    const frondGeo = new THREE.ConeGeometry(0.48, 1.8, 4);
    frondGeo.scale(1, 1, 0.1);
    frondGeo.translate(0, 0.9, 0);

    const frond = new THREE.Mesh(frondGeo, frondMat);
    frond.position.set(0, 0.1, 0);
    frond.rotation.y = angle;
    frond.rotation.x = Math.PI / 3.2;
    attachCelOutline(frond, 0.02);
    fern.add(frond);
  }

  return fern;
}

// 4c. Variegated Bush (Two-tone cream/emerald bush from reference image!)
export function createVariegatedBush(windUniforms?: WindUniforms): THREE.Group {
  const bush = new THREE.Group();
  const mainMat = windUniforms
    ? createWindVegetationMaterial('#16a34a', windUniforms)
    : createCelMaterial('#16a34a', null, 0.4);
  const creamMat = windUniforms
    ? createWindVegetationMaterial('#dcfce7', windUniforms)
    : createCelMaterial('#dcfce7', null, 0.3);

  for (let i = 0; i < 6; i++) {
    const puff = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.65 + Math.random() * 0.35, 1),
      i % 2 === 0 ? mainMat : creamMat
    );
    puff.position.set(
      (Math.random() - 0.5) * 1.1,
      0.45 + (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 1.1
    );
    attachCelOutline(puff, 0.025);
    bush.add(puff);
  }

  return bush;
}

// 4d. Flowering Forest Shrub (With soft pink and white blossoms from reference image!)
export function createForestFlowerShrub(windUniforms?: WindUniforms): THREE.Group {
  const shrub = new THREE.Group();
  const leavesMat = windUniforms
    ? createWindVegetationMaterial('#22c55e', windUniforms)
    : createCelMaterial('#22c55e', null, 0.4);
  const petalPinkMat = createCelMaterial('#f472b6', null, 0.3);
  const petalWhiteMat = createCelMaterial('#fdf2f8', null, 0.3);

  // Leafy bush base
  for (let i = 0; i < 4; i++) {
    const puff = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.55 + Math.random() * 0.25, 1),
      leavesMat
    );
    puff.position.set(
      (Math.random() - 0.5) * 0.8,
      0.4 + (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.8
    );
    attachCelOutline(puff, 0.02);
    shrub.add(puff);
  }

  // Blossom flower clusters
  for (let b = 0; b < 10; b++) {
    const blossom = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 6, 6),
      b % 2 === 0 ? petalPinkMat : petalWhiteMat
    );
    blossom.position.set(
      (Math.random() - 0.5) * 0.9,
      0.45 + Math.random() * 0.35,
      (Math.random() - 0.5) * 0.9
    );
    shrub.add(blossom);
  }

  return shrub;
}

// 4e. Fallen Mossy Log with Forest Mushrooms (Classic Pokémon / Ghibli forest detail!)
export function createFallenMossLog(): THREE.Group {
  const logGroup = new THREE.Group();
  const barkTex = generateBarkTexture();
  const woodMat = createCelMaterial('#ffffff', barkTex, 0.8);
  const mossMat = createCelMaterial('#15803d', null, 0.6);
  const mushroomCapMat = createCelMaterial('#ea580c', null, 0.3);
  const mushroomStemMat = createCelMaterial('#fef3c7', null, 0.4);

  // Horizontal fallen trunk
  const trunkGeo = new THREE.CylinderGeometry(0.38, 0.45, 3.2, 10);
  trunkGeo.rotateZ(Math.PI / 2);
  const trunk = new THREE.Mesh(trunkGeo, woodMat);
  trunk.position.y = 0.38;
  trunk.castShadow = true;
  attachCelOutline(trunk, 0.03);
  logGroup.add(trunk);

  // Moss patch on top of the log
  const mossGeo = new THREE.BoxGeometry(2.4, 0.12, 0.5);
  const moss = new THREE.Mesh(mossGeo, mossMat);
  moss.position.set(0, 0.74, 0);
  logGroup.add(moss);

  // Shelf bracket mushrooms growing on the wood
  [-0.6, 0.1, 0.8].forEach((mx, i) => {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.18 + i * 0.04, 0.05, 0.06, 8), mushroomCapMat);
    cap.position.set(mx, 0.68, 0.38);
    cap.rotation.x = Math.PI / 6;
    logGroup.add(cap);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 6), mushroomStemMat);
    stem.position.set(mx, 0.62, 0.35);
    logGroup.add(stem);
  });

  return logGroup;
}

// 4f. Atmospheric Forest Komorebi (Sunbeams / God Rays filtering through tree crowns!)
export function createForestKomorebiRays(): THREE.Group {
  const raysGroup = new THREE.Group();
  const rayMat = new THREE.MeshBasicMaterial({
    color: '#fef08a',
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // 4 slanted volumetric light beams
  for (let r = 0; r < 4; r++) {
    const rayGeo = new THREE.ConeGeometry(0.7 + r * 0.3, 9.0, 8, 1, true);
    const ray = new THREE.Mesh(rayGeo, rayMat);
    ray.position.set((r - 1.5) * 3.2, 4.5, (Math.random() - 0.5) * 2.0);
    ray.rotation.x = Math.PI + 0.35;
    ray.rotation.z = -0.25;
    raysGroup.add(ray);
  }

  return raysGroup;
}

// 4g. Floating Forest Spores & Pollen Particles (Gentle drifting anime light motes!)
export function createForestSporeParticles(count: number = 180): THREE.Points {
  const geo = new THREE.BufferGeometry();
  const positions: number[] = [];

  for (let i = 0; i < count; i++) {
    // Distributed in the forest biome area (-38 to -10, 1 to 7 height, -30 to 30 z)
    const px = -40 + Math.random() * 32;
    const py = 1.0 + Math.random() * 6.5;
    const pz = -32 + Math.random() * 64;
    positions.push(px, py, pz);
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: '#bef264', // Soft luminous yellow-green spore
    size: 0.28,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  return points;
}

// 5. Wild Flower Clumps (Yellow Dandelions & White Daisies from image!)
export function createFlowerPatch(): THREE.Group {
  const patch = new THREE.Group();
  const stemMat = createCelMaterial('#15803d', null, 0.5);
  const yellowMat = createCelMaterial('#facc15', null, 0.2);
  const whiteMat = createCelMaterial('#ffffff', null, 0.2);

  for (let i = 0; i < 14; i++) {
    const flower = new THREE.Group();
    const isYellow = Math.random() > 0.35;
    const petMat = isYellow ? yellowMat : whiteMat;

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6), stemMat);
    stem.position.y = 0.175;
    flower.add(stem);

    const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), petMat);
    bloom.position.y = 0.36;
    flower.add(bloom);

    const rad = 0.8 * Math.random();
    const theta = Math.random() * Math.PI * 2;
    flower.position.set(Math.cos(theta) * rad, 0, Math.sin(theta) * rad);
    patch.add(flower);
  }

  return patch;
}

// 6. Natural Granite Moss Boulders (From screenshot)
export function createGraniteBoulder(): THREE.Group {
  const boulderGroup = new THREE.Group();
  const rockMat = createCelMaterial('#64748b', null, 0.7);

  const rockGeo = new THREE.DodecahedronGeometry(0.9, 1);
  rockGeo.scale(1.2, 0.8, 1.0);
  const rock = new THREE.Mesh(rockGeo, rockMat);
  rock.position.y = 0.4;
  rock.castShadow = true;
  attachCelOutline(rock, 0.035);
  boulderGroup.add(rock);

  return boulderGroup;
}
