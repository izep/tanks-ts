
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PhysicsSystem } from '../src/systems/PhysicsSystem';
import { TerrainSystem } from '../src/systems/TerrainSystem';
import { GamePhase, type GameState } from '../src/core/GameState';
import { SoundManager } from '../src/core/SoundManager';

// Mock Terrain with a Slope
// Slope down to the right: y increases as x increases.
vi.mock('../src/systems/TerrainSystem', () => {
    return {
        TerrainSystem: class {
            public canvas = { width: 800, height: 600 };
            constructor(public width: number, public height: number) { }
            generate(state: any) { }
            // Slope: y = x (45 degrees down)
            getGroundY(x: number) { return x; }
            isSolid(x: number, y: number) { return y >= x; }
            getNormal(x: number) {
                // Normal to y=x line (vector -1, 1 normalized?? No.)
                // Derivative y' = 1.
                // Tangent vector (1, 1).
                // Normal vector (-1, 1) or (1, -1). 
                // Upward normal: (-0.707, -0.707) points up-left? No.
                // Y is down.
                // Ground surface -> /
                // Normal points Up-Left? 
                // let's just use simple approximation or mock return.
                return { x: -0.707, y: -0.707 };
            }
            explode(state: any, x: number, y: number, r: number) { }
            addTerrain(state: any, x: number, y: number, r: number) { }
            settle(state: any) { return false; }
        }
    };
});

class MockSoundManager extends SoundManager {
    constructor() {
        super();
        this.ctx = { createGain: () => ({ connect: () => {}, gain: { value: 0 } }) } as any;
    }
    playExplosion() { }
    playHit() { }
    playSizzle() { }
}

global.window = {
    AudioContext: class {
        createGain() { return { connect: () => {}, gain: { value: 0 } }; }
        createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
        destination: {}
        currentTime: 0
    },
} as any;

describe('PhysicsSystem Roller', () => {
    let physics: PhysicsSystem;
    let terrain: TerrainSystem;
    let state: GameState;
    let soundManager: SoundManager;

    beforeEach(() => {
        terrain = new TerrainSystem(800, 600);
        soundManager = new MockSoundManager();
        physics = new PhysicsSystem(terrain, soundManager);

        state = {
            phase: GamePhase.PROJECTILE_FLYING,
            tanks: [],
            projectiles: [],
            explosions: [],
            currentPlayerIndex: 0,
            roundNumber: 1,
            maxRounds: 10,
            wind: 0,
            gravity: 100,
            terrainDirty: false,
            lastExplosionTime: 0
        };
    });

    it('Roller should accelerate down a slope', () => {
        const roller = {
            id: 'r-1', x: 100, y: 100, vx: 1, vy: 0, // Slight push right to detect slope
            weaponType: 'roller', ownerId: 1, elapsedTime: 0, trail: []
        };
        state.projectiles.push(roller);

        // 1. Initial Fall
        physics.update(state, 0.1);
        // mocked terrain y=x. at x=100, y=100.
        // It lands immediately.

        // 2. Roll
        // On a slope y=x (Recall Y is down), this is a 45 degree slope DOWN TO THE RIGHT.
        // \
        //  \
        //   \
        // Wait, y=x means (0,0) (10,10). 
        // 0-----10
        // |
        // |
        // 10
        // This is a slope going DOWN (visually) as X increases.
        // So it should accelerate to the RIGHT (Positive X).

        const initialVx = roller.vx;

        // Update multiple times to simulate rolling
        for (let i = 0; i < 10; i++) {
            physics.update(state, 0.1);
        }

        // Should have positive VX (rolling right)
        expect(roller.vx).toBeGreaterThan(0);
        expect(roller.x).toBeGreaterThan(100);
    });

    it('Roller should stop and explode when velocity too low', () => {
        const roller = {
            id: 'r-2', x: 200, y: 200, vx: 3, vy: 0, // Low velocity
            weaponType: 'roller', ownerId: 1, elapsedTime: 0, trail: []
        };
        state.projectiles.push(roller);

        // Update physics - friction should slow it down
        for (let i = 0; i < 20; i++) {
            physics.update(state, 0.1);
        }

        // Should have exploded (removed from projectiles)
        expect(state.projectiles.length).toBe(0);
    });

    it('Roller should explode on tank collision', () => {
        // Add tank without shield
        state.tanks.push({
            id: 't-1', x: 250, y: 250, health: 100, maxHealth: 100,
            fuel: 100, maxFuel: 100, money: 10000, angle: 45, power: 50,
            color: '#00FF00', name: 'Test Tank', isAI: false,
            inventory: new Map(), activeShield: false, shieldHealth: 0,
            parachutes: 0, batteries: 0, deaths: 0, kills: 0
        });

        const roller = {
            id: 'r-3', x: 200, y: 200, vx: 20, vy: 0,
            weaponType: 'roller', ownerId: 2, elapsedTime: 0, trail: [], state: 'rolling'
        };
        state.projectiles.push(roller);

        // Update multiple frames until collision or removal
        let iterations = 0;
        while (state.projectiles.length > 0 && iterations < 50) {
            physics.update(state, 0.1);
            iterations++;
        }

        // Projectile should be removed (exploded on tank)
        expect(state.projectiles.length).toBe(0);
    });

    it('Roller should bounce off shielded tank', () => {
        // Add tank WITH shield closer
        state.tanks.push({
            id: 't-2', x: 255, y: 255, health: 100, maxHealth: 100,
            fuel: 100, maxFuel: 100, money: 10000, angle: 45, power: 50,
            color: '#00FF00', name: 'Shielded Tank', isAI: false,
            inventory: new Map(), activeShield: true, shieldHealth: 50,
            parachutes: 0, batteries: 0, deaths: 0, kills: 0
        });

        const roller = {
            id: 'r-4', x: 240, y: 240, vx: 50, vy: 0,
            weaponType: 'roller', ownerId: 2, elapsedTime: 0, trail: [], state: 'rolling'
        };
        state.projectiles.push(roller);

        // Update one frame - should hit shield and bounce
        physics.update(state, 0.1);

        // Projectile should still exist (bounced instead of exploding)
        expect(state.projectiles.length).toBe(1);
        // After bounce, velocity should be negative (reversed)
        expect(roller.vx).toBeLessThan(0);
    });
});
