import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameState, GamePhase, CONSTANTS } from '../src/core/GameState';
import { PhysicsSystem } from '../src/systems/PhysicsSystem';
import { TerrainSystem } from '../src/systems/TerrainSystem';
import { SoundManager } from '../src/core/SoundManager';
import { WEAPONS } from '../src/core/WeaponData';

// Mock SoundManager
class MockSoundManager extends SoundManager {
    constructor() {
        super();
        this.ctx = { createGain: () => ({ connect: () => {}, gain: { value: 0 } }) } as any;
    }
    playExplosion() { }
    playHit() { }
    playSizzle() { }
}

// Mock window for tests
global.window = {
    AudioContext: class {
        createGain() { return { connect: () => {}, gain: { value: 0 } }; }
        createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
        destination: {}
        currentTime: 0
    },
} as any;

describe('Riot Bombs', () => {
    let state: GameState;
    let terrainSystem: TerrainSystem;
    let physicsSystem: PhysicsSystem;
    let soundManager: SoundManager;

    beforeEach(() => {
        soundManager = new MockSoundManager();
        
        // Mock TerrainSystem
        terrainSystem = {
            explode: vi.fn(),
            isSolid: vi.fn((x, y) => y >= 515),
            getGroundY: vi.fn(() => 515),
            addTerrain: vi.fn(),
            burnTerrain: vi.fn(),
            clearConicSection: vi.fn()
        } as any;
        
        physicsSystem = new PhysicsSystem(terrainSystem, soundManager);

        state = {
            tanks: [
                {
                    id: 1,
                    playerId: 'human',
                    x: 400,
                    y: 500,
                    health: 100,
                    color: 'green',
                    angle: 45,
                    power: 500,
                    inventory: {},
                    accessories: {},
                    credits: 10000,
                    isDead: false,
                    isFalling: false,
                    vy: 0,
                    hasLanded: true
                },
                {
                    id: 2,
                    playerId: 'ai-1',
                    x: 700,
                    y: 500,
                    health: 100,
                    color: 'red',
                    angle: 135,
                    power: 500,
                    inventory: {},
                    accessories: {},
                    credits: 0,
                    isDead: false,
                    isFalling: false,
                    vy: 0,
                    hasLanded: true
                }
            ],
            projectiles: [],
            explosions: [],
            currentTankIndex: 0,
            round: 1,
            wind: 0,
            gravity: CONSTANTS.DEFAULT_GRAVITY,
            phase: GamePhase.AIMING,
            terrainDirty: false
        };
    });

    it('Riot Bomb should have correct specs', () => {
        expect(WEAPONS.riot_bomb.cost).toBe(5000);
        expect(WEAPONS.riot_bomb.radius).toBe(30);
        expect(WEAPONS.riot_bomb.damage).toBe(0);
        expect(WEAPONS.riot_bomb.bundleSize).toBe(5);
        expect(WEAPONS.riot_bomb.type).toBe('dirt_destroyer');
    });

    it('Heavy Riot Bomb should have correct specs', () => {
        expect(WEAPONS.heavy_riot_bomb.cost).toBe(4750);
        expect(WEAPONS.heavy_riot_bomb.radius).toBe(45);
        expect(WEAPONS.heavy_riot_bomb.damage).toBe(0);
        expect(WEAPONS.heavy_riot_bomb.bundleSize).toBe(2);
        expect(WEAPONS.heavy_riot_bomb.type).toBe('dirt_destroyer');
    });

    it('Riot Bomb should destroy terrain in spherical pattern', () => {
        // Trigger riot bomb explosion
        physicsSystem.triggerExplosion(state, 500, 500, { 
            weaponType: 'riot_bomb', 
            ownerId: 1 
        });

        // Verify explode was called with correct radius
        expect(terrainSystem.explode).toHaveBeenCalledWith(state, 500, 500, 30);
    });

    it('Riot Bomb should deal zero damage to tanks', () => {
        const tank1InitialHealth = state.tanks[0].health;
        const tank2InitialHealth = state.tanks[1].health;

        // Explode riot bomb right on tank 1
        physicsSystem.triggerExplosion(state, 400, 500, {
            weaponType: 'riot_bomb',
            ownerId: 2
        });

        // Verify no damage dealt
        expect(state.tanks[0].health).toBe(tank1InitialHealth);
        expect(state.tanks[1].health).toBe(tank2InitialHealth);
    });

    it('Heavy Riot Bomb should have larger blast radius', () => {
        // Trigger heavy riot bomb
        physicsSystem.triggerExplosion(state, 500, 500, {
            weaponType: 'heavy_riot_bomb',
            ownerId: 1
        });

        // Verify larger crater (45px radius)
        expect(terrainSystem.explode).toHaveBeenCalledWith(state, 500, 500, 45);
    });

    it('Heavy Riot Bomb should also deal zero damage', () => {
        const initialHealth = state.tanks[0].health;

        // Explode heavy riot bomb on tank
        physicsSystem.triggerExplosion(state, 400, 490, {
            weaponType: 'heavy_riot_bomb',
            ownerId: 2
        });

        expect(state.tanks[0].health).toBe(initialHealth);
    });

    it('Riot Bomb projectile should follow physics', () => {
        // Fire riot bomb as projectile
        state.phase = GamePhase.PROJECTILE_FLYING;
        state.projectiles.push({
            id: 'test-proj',
            x: 400,
            y: 400,
            vx: 100,
            vy: -150,
            weaponType: 'riot_bomb',
            ownerId: 1,
            elapsedTime: 0,
            trail: []
        });

        // Update physics
        const initialY = state.projectiles[0].y;
        physicsSystem.update(state, 1/60); // 1 frame

        // Verify projectile moved
        expect(state.projectiles[0].y).not.toBe(initialY);
    });

    it('Riot Bombs should clear terrain without damaging tanks', () => {
        const tank1InitialHealth = state.tanks[0].health;
        const tank2InitialHealth = state.tanks[1].health;

        // Fire riot bomb at both tanks
        physicsSystem.triggerExplosion(state, 400, 500, {
            weaponType: 'riot_bomb',
            ownerId: 2
        });
        
        physicsSystem.triggerExplosion(state, 700, 500, {
            weaponType: 'heavy_riot_bomb',
            ownerId: 1
        });

        // Verify no damage dealt and terrain cleared
        expect(state.tanks[0].health).toBe(tank1InitialHealth);
        expect(state.tanks[1].health).toBe(tank2InitialHealth);
        expect(terrainSystem.explode).toHaveBeenCalled();
    });
});
