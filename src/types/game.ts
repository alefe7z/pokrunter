/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ElementType = 'normal' | 'fire' | 'water' | 'grass' | 'electric' | 'dragon' | 'ghost' | 'ground';

export interface Move {
  id: string;
  name: string;
  type: ElementType;
  power: number;
  cooldown: number; // in seconds
  description: string;
  range: number;
  color: string;
  projectileSpeed?: number;
  isArea?: boolean;
}

export type EvolutionTriggerType = 'level' | 'stone' | 'friendship' | 'stat_ratio';

export interface EvolutionCondition {
  targetSpeciesId: string;
  trigger: EvolutionTriggerType;
  requiredLevel?: number;
  requiredItem?: string; // e.g. 'fire_stone', 'sun_shard'
  requiredFriendship?: number; // 0-100
  statRatio?: {
    statA: 'attack' | 'spAttack';
    statB: 'attack' | 'spAttack';
    condition: 'greater' | 'less' | 'equal';
  };
  description: string;
}

export interface MonsterStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface MonsterSpecies {
  id: string;
  dexNumber: number;
  name: string;
  category: string;
  primaryType: ElementType;
  secondaryType?: ElementType;
  baseStats: MonsterStats;
  moves: string[]; // move IDs
  evolutions: EvolutionCondition[];
  description: string;
  height: string;
  weight: string;
  catchRate: number; // 1 to 255
  modelType: string;
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
    glow?: string;
  };
}

export interface ActiveMonster {
  instanceId: string;
  speciesId: string;
  nickname: string;
  level: number;
  exp: number;
  maxExp: number;
  currentHp: number;
  maxHp: number;
  stats: MonsterStats;
  friendship: number; // 0-100
  moves: string[]; // move IDs
  moveCooldowns: Record<string, number>; // moveId -> timestamp available
  isMega: boolean;
  caughtWithBall: string;
  caughtAt: string;
}

export interface WildMonsterInstance {
  id: string;
  speciesId: string;
  level: number;
  currentHp: number;
  maxHp: number;
  position: [number, number, number];
  rotation: number;
  state: 'wandering' | 'alert' | 'attacking' | 'fleeing' | 'captured';
  targetPos?: [number, number, number];
  attackCooldown: number;
  spawnCenter: [number, number, number];
  meshGroup?: any;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'ball' | 'medicine' | 'stone' | 'berry';
  quantity: number;
  description: string;
  ballMultiplier?: number;
  healAmount?: number;
  icon: string;
  color: string;
}

export interface PlayerState {
  name: string;
  position: [number, number, number];
  rotation: number;
  speed: number;
  party: ActiveMonster[];
  activePartnerIndex: number;
  box: ActiveMonster[];
  inventory: InventoryItem[];
  seenDex: string[];
  caughtDex: string[];
  megaGauge: number; // 0 to 100
}

export interface FloatingDamage {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  isCrit?: boolean;
}

export interface CaptureAttempt {
  monster: WildMonsterInstance;
  ballType: string;
  shakes: number;
  success: boolean;
  phase: 'throw' | 'pull' | 'shake' | 'result';
}
