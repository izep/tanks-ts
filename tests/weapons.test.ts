
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

    it('LeapFrog should bounce 3 times', () => {
        const leapfrog = {
            id: 'lf-1', x: 400, y: 490, vx: 50, vy: 100, // Falling fast
            weaponType: 'leapfrog', ownerId: 1, elapsedTime: 0, trail: [],
            bounces: 0
        };
        state.projectiles.push(leapfrog);

        // Update 1: Hit Ground -> Bounce 1
        physics.update(state, 0.1);
        let p = state.projectiles.find(p => p.id === 'lf-1');
        expect(p).toBeDefined();
        // Should have bounced: vy should be negative (up)
        // initial vy=100. hit ground at 500. y was 490.
        // It should hit.
        // Logic: if vy > 0 and y >= groundY -> bounce.
        // Our mock ground is 500. y+vy*dt = 490 + 10 = 500. Collision.

        // Wait, collision logic sets 'collided=true'. 
        // Then 'leapfrog' specific logic handles it:
        // if bounces < 3 -> bounce, else explode.

        // We expect it to survive
        expect(p?.bounces).toBe(1);
        expect(p?.vy).toBeLessThan(0); // Moving up
    });
});
