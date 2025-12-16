
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
});
