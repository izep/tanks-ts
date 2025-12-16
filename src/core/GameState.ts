import { AIController, AIPersonality } from './AIController';

export const GamePhase = {
  SETUP: 'SETUP',
  AIMING: 'AIMING',
  FIRING: 'FIRING',
  PROJECTILE_FLYING: 'PROJECTILE_FLYING',
  EXPLOSION: 'EXPLOSION',
  TERRAIN_SETTLING: 'TERRAIN_SETTLING',
  DEATH_SEQUENCE: 'DEATH_SEQUENCE',
  SHOP: 'SHOP',
  GAME_OVER: 'GAME_OVER'
} as const;

export type GamePhase = typeof GamePhase[keyof typeof GamePhase];


export interface TankState {
  id: number;
  name: string;
  x: number;
  y: number;
  vy: number;
  angle: number;
  power: number;
  health: number;
  fuel: number;
  color: string;
  variant: number; // 0-6 sprite index
  isAi: boolean;
  isFalling: boolean;
  parachuteThreshold?: number;
  isDead: boolean; // Queued for death
  credits: number;
  currentWeapon: string;
  inventory: Record<string, number>; // weaponId -> count
  accessories: Record<string, number>; // itemId -> count
  activeShield?: string;
  shieldHealth?: number;
  aiController?: AIController;
  aiPersonality?: AIPersonality;
  hasLanded?: boolean;
  isParachuteDeployed?: boolean;
  teamId?: number; // 0 = no team (FFA)
  lastWords?: string;
  sayTimer?: number;
  lastShotImpact?: { x: number, y: number };
}

export interface ProjectileState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  weaponType: string;
  ownerId: number;
  elapsedTime: number;
  trail: { x: number, y: number }[];
  splitDone?: boolean;
  generation?: number;
  state?: string; // flying, rolling, burrowing
  bounces?: number;
}

export interface ExplosionState {
  id: number;
  x: number;
  y: number;
  maxRadius: number;
  currentRadius: number;
  duration: number;
  elapsed: number;
  color: string;
}

export interface GameState {
  phase: GamePhase;
  tanks: TankState[];
  projectiles: ProjectileState[];
  explosions: ExplosionState[];
  currentPlayerIndex: number;
  roundNumber: number;
  maxRounds: number;
  wind: number;
  gravity: number; // typically 9.8 * scale
  terrainDirty: boolean; // Flag to check settling
  lastExplosionTime: number;
}

export const CONSTANTS = {
  SCREEN_WIDTH: 800,
  SCREEN_HEIGHT: 600,
  GRAVITY: 98, // Matches python 9.8 * 10
  FPS: 60
};
