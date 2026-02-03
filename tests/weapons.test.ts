
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PhysicsSystem } from '../src/systems/PhysicsSystem';
import { TerrainSystem } from '../src/systems/TerrainSystem';
import { GamePhase, type GameState } from '../src/core/GameState';

vi.mock('../src/systems/TerrainSystem', () => {
    return {
        TerrainSystem: class {
            public canvas = { width: 800, height: 600 };
            constructor(public width: number, public height: number) { }
            generate(state: any) { }
            getGroundY(x: number) { return 500; } // Flat ground
            explode(state: any, x: number, y: number, r: number) { console.log('MockExplode at', x, y); }
            addTerrain(state: any, x: number, y: number, r: number) { }
            settle(state: any) { return false; }
            isSolid(x: number, y: number) { return y >= 500; }
        }
    };
});

describe('PhysicsSystem Weapons', () => {
    let physics: PhysicsSystem;
    let terrain: TerrainSystem;
    let state: GameState;
    let soundManagerMock: any;

    beforeEach(() => {
        terrain = new TerrainSystem(800, 600);
        soundManagerMock = {
            playExplosion: vi.fn(),
            playHit: vi.fn(),
            playShoot: vi.fn()
        };
        physics = new PhysicsSystem(terrain, soundManagerMock);

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

    it('LeapFrog should launch 3 sequential warheads', () => {
        // Fire initial leapfrog
        const leapfrog = {
            id: 'lf-1', x: 400, y: 490, vx: 50, vy: 100,
            weaponType: 'leapfrog', ownerId: 1, elapsedTime: 0, trail: [],
            leapfrogStage: 0
        };
        state.projectiles.push(leapfrog);

        // Update: First warhead hits ground
        physics.update(state, 0.1);
        
        // First warhead should be removed
        const first = state.projectiles.find(p => p.id === 'lf-1');
        expect(first).toBeUndefined();
        
        // Second warhead should be launched
        expect(state.projectiles.length).toBe(1);
        expect(state.projectiles[0].weaponType).toBe('leapfrog');
        expect(state.projectiles[0].leapfrogStage).toBe(1);
        
        // Verify explosion occurred
        expect(state.explosions.length).toBeGreaterThan(0);

        // Fly second warhead until it hits
        let iterations = 0;
        while (state.projectiles.length > 0 && state.projectiles[0].leapfrogStage === 1 && iterations < 100) {
            physics.update(state, 0.1);
            iterations++;
        }

        // Third warhead should be launched
        if (state.projectiles.length > 0) {
            expect(state.projectiles[0].weaponType).toBe('leapfrog');
            expect(state.projectiles[0].leapfrogStage).toBe(2);

            // Fly third warhead until it hits
            iterations = 0;
            while (state.projectiles.length > 0 && iterations < 100) {
                physics.update(state, 0.1);
                iterations++;
            }
        }

        // All 3 warheads should have exploded (no more projectiles)
        expect(state.projectiles.length).toBe(0);
    });
});
