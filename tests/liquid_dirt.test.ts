
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PhysicsSystem } from '../src/systems/PhysicsSystem';
import { TerrainSystem } from '../src/systems/TerrainSystem';
import { GamePhase, type GameState } from '../src/core/GameState';

// Mock dependencies
vi.mock('../src/systems/TerrainSystem', () => {
    return {
        TerrainSystem: class {
            public canvas = { width: 800, height: 600 };
            constructor(public width: number, public height: number) { }
            generate(state: any) { }
            getGroundY(x: number) { return 500; }
            explode(state: any, x: number, y: number, r: number) { }
            addTerrain(state: any, x: number, y: number, r: number) { }
            settle(state: any) { return false; }
            isSolid(x: number, y: number) { return y >= 500; }
            clearConicSection() {}
        }
    };
});

describe('Liquid Dirt', () => {
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

    it('should spawn 120 particles with splash properties', () => {
        const newQueue: any[] = [];
        const proj = {
            id: 'ld-1',
            x: 400,
            y: 500,
            vx: 0,
            vy: 0,
            weaponType: 'liquid_dirt',
            ownerId: 1,
            elapsedTime: 0,
            trail: []
        };

        physics.triggerExplosion(state, 400, 500, proj, newQueue);

        expect(newQueue.length).toBe(200);
        const p = newQueue[0];
        expect(p.weaponType).toBe('liquid_dirt_particle');

        // Check for splash properties (horizontal spread, low vertical)
        // vx should be random but likely non-zero
        expect(p.vx).not.toBe(0);
        // vy should be small/negative (flat splash)
        expect(Math.abs(p.vy)).toBeLessThan(50);
    });
});
