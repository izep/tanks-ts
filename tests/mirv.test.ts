import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PhysicsSystem } from '../src/systems/PhysicsSystem';
import { TerrainSystem } from '../src/systems/TerrainSystem';
import { GamePhase, type GameState } from '../src/core/GameState';
import { SoundManager } from '../src/core/SoundManager';

// Mock document for TerrainSystem canvas
global.document = {
    createElement: (tag: string) => {
        if (tag === 'canvas') {
            return {
                width: 0,
                height: 0,
                getContext: () => ({
                    fillStyle: '',
                    fillRect: () => {},
                    clearRect: () => {},
                    getImageData: () => ({ data: new Uint8ClampedArray(800 * 600 * 4) }),
                    putImageData: () => {},
                    beginPath: () => {},
                    arc: () => {},
                    fill: () => {},
                    moveTo: () => {},
                    lineTo: () => {},
                    closePath: () => {}
                })
            };
        }
        return {};
    }
} as any;

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

describe('MIRV Mechanics', () => {
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

    it('should deploy 5 missile warheads at apogee', () => {
        // Add MIRV projectile ascending (vy < 0)
        const mirv = {
            id: 'm-1',
            x: 400,
            y: 200,
            vx: 50,
            vy: -100, // Ascending
            weaponType: 'mirv',
            ownerId: 1,
            elapsedTime: 0,
            trail: [],
            splitDone: false
        };
        state.projectiles.push(mirv);

        // Update until vy becomes positive (past apogee)
        let iterations = 0;
        while (mirv.vy < 0 && iterations < 50) {
            physics.update(state, 0.1);
            iterations++;
        }

        // Now vy > 0, next update should split
        const beforeCount = state.projectiles.length;
        physics.update(state, 0.1);
        
        // Should have deployed 5 warheads (parent removed, 5 added)
        expect(state.projectiles.length).toBe(5);
        
        // All should be missiles
        state.projectiles.forEach(proj => {
            expect(proj.weaponType).toBe('missile');
        });
    });

    it('should spread warheads evenly', () => {
        const mirv = {
            id: 'm-2',
            x: 400,
            y: 200,
            vx: 50,
            vy: 10, // Already descending
            weaponType: 'mirv',
            ownerId: 1,
            elapsedTime: 0,
            trail: [],
            splitDone: false
        };
        state.projectiles.push(mirv);

        physics.update(state, 0.1);

        // Should have 5 warheads
        expect(state.projectiles.length).toBe(5);

        // Velocity offsets should be -100, -50, 0, 50, 100
        const velocities = state.projectiles.map(p => p.vx).sort((a, b) => a - b);
        expect(velocities[0]).toBeCloseTo(50 - 100, 0); // -50
        expect(velocities[1]).toBeCloseTo(50 - 50, 0);  // 0
        expect(velocities[2]).toBeCloseTo(50, 0);       // 50
        expect(velocities[3]).toBeCloseTo(50 + 50, 0);  // 100
        expect(velocities[4]).toBeCloseTo(50 + 100, 0); // 150
    });

    it('should fizzle if hits terrain before apogee', () => {
        // Create terrain at ground level
        terrain.generate(state);
        
        // Get actual ground level at x=400
        const groundY = terrain.getGroundY(400);
        
        const mirv = {
            id: 'm-3',
            x: 400,
            y: groundY - 10, // Just 10 pixels above ground
            vx: 50,
            vy: 5, // Descending
            weaponType: 'mirv',
            ownerId: 1,
            elapsedTime: 0,
            trail: [],
            splitDone: false
        };
        state.projectiles.push(mirv);

        // Update until collision
        let iterations = 0;
        while (state.projectiles.some(p => p.id === 'm-3') && iterations < 20) {
            physics.update(state, 0.1);
            iterations++;
        }

        // MIRV should have exploded without splitting
        // No warheads created (would have 5 if split)
        expect(state.projectiles.filter(p => p.weaponType === 'missile').length).toBe(0);
    });

    it('should only split once', () => {
        const mirv = {
            id: 'm-4',
            x: 400,
            y: 200,
            vx: 50,
            vy: 10,
            weaponType: 'mirv',
            ownerId: 1,
            elapsedTime: 0,
            trail: [],
            splitDone: false
        };
        state.projectiles.push(mirv);

        physics.update(state, 0.1);
        expect(state.projectiles.length).toBe(5);

        // Update again - should not create more
        physics.update(state, 0.1);
        // Some may have exploded, but no additional warheads
        expect(state.projectiles.length).toBeLessThanOrEqual(5);
    });
});
