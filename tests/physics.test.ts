import { describe, it, expect, vi } from 'vitest';
import { PhysicsSystem } from '../src/systems/PhysicsSystem';
import { TerrainSystem } from '../src/systems/TerrainSystem';
import { GameState, GamePhase } from '../src/core/GameState';

// Mock Canvas and Context for Node environment
class MockContext {
    clearRect() { }
    beginPath() { }
    moveTo() { }
    lineTo() { }
    closePath() { }
    fill() { }
    arc() { }
    getImageData() {
        return { data: new Uint8ClampedArray(4) }; // Always transparent
    }
}

class MockCanvas {
    width = 800;
    height = 600;
    getContext() { return new MockContext(); }
}

globalThis.HTMLCanvasElement = MockCanvas as any;
globalThis.document = {
    createElement: () => new MockCanvas()
} as any;

describe('PhysicsSystem', () => {
    const terrain = new TerrainSystem(800, 600);
    const physics = new PhysicsSystem(terrain);

    const mockState: GameState = {
        phase: GamePhase.PROJECTILE_FLYING,
        tanks: [],
        projectiles: [],
        explosions: [],
        currentPlayerIndex: 0,
        roundNumber: 1,
        maxRounds: 10,
        wind: 10, // Positive wind
        gravity: 98,
        terrainDirty: false,
        lastExplosionTime: 0
    };

    it('should update projectile position based on gravity and wind', () => {
        const proj: any = {
            id: '1',
            x: 100,
            y: 100,
            vx: 100,
            vy: 0,
            weaponType: 'missile',
            ownerId: 1,
            elapsedTime: 0,
            trail: []
        };
        mockState.projectiles = [proj];

        // Step 0.1s
        // vx should increase by wind * dt * 6 = 10 * 0.1 * 6 = 6
        // vy should increase by gravity * dt * 10 = 98 * 0.1 * 10 = 98

        physics.update(mockState, 0.1);

        expect(proj.vx).toBeCloseTo(106);
        expect(proj.vy).toBeCloseTo(98);
        expect(proj.x).toBeCloseTo(100 + 106 * 0.1); // using new velocity approx
        // Actually current implementation uses new velocity for position update:
        // proj.vx += ...
        // proj.x += proj.vx * dt
    });

    it('should detect boundary collision', () => {
        const proj: any = {
            id: '2',
            x: -10, // Out of bounds
            y: 100,
            vx: 0,
            vy: 0,
            weaponType: 'missile',
            ownerId: 1,
            elapsedTime: 0,
            trail: []
        };
        mockState.projectiles = [proj];

        physics.update(mockState, 0.1);

        expect(mockState.projectiles.length).toBe(0);
    });
});
