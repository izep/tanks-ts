import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameFlowSystem } from '../src/systems/GameFlowSystem';
import { TerrainSystem } from '../src/systems/TerrainSystem';
import { PhysicsSystem } from '../src/systems/PhysicsSystem';
import { SoundManager } from '../src/core/SoundManager';
import { GameState, GamePhase, CONSTANTS } from '../src/core/GameState';

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

global.HTMLCanvasElement = MockCanvas as any;
// @ts-ignore
global.document = {
    createElement: () => new MockCanvas()
} as any;

// Mocks
class MockSoundManager extends SoundManager {
    constructor() {
        super();
        this.ctx = { createGain: () => ({ connect: () => {}, gain: { value: 0 } }) } as any;
    }
    playUI() {}
}

// Mock window
global.window = {
    AudioContext: class {
        createGain() { return { connect: () => {}, gain: { value: 0 } }; }
        createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
        destination: {}
        currentTime: 0
    },
} as any;

class MockTerrainSystem extends TerrainSystem {
    async generate(state: GameState) {}
    settle(state: GameState) { return false; }
}

describe('GameFlowSystem', () => {
    let gameFlow: GameFlowSystem;
    let state: GameState;

    beforeEach(() => {
        const terrain = new MockTerrainSystem(800, 600);
        const sound = new MockSoundManager();
        const physics = new PhysicsSystem(terrain, sound); // We can use real physics or mock it
        
        gameFlow = new GameFlowSystem(terrain, physics, sound);

        state = {
            phase: GamePhase.SHOP,
            tanks: [
                { id: 1, x: 0, y: 0, health: 0 } as any,
                { id: 2, x: 0, y: 0, health: 0 } as any,
                { id: 3, x: 0, y: 0, health: 0 } as any,
                { id: 4, x: 0, y: 0, health: 0 } as any
            ],
            projectiles: [],
            explosions: [],
            currentPlayerIndex: 0,
            roundNumber: 1,
            maxRounds: 5,
            wind: 0,
            gravity: 98,
            terrainDirty: false,
            lastExplosionTime: 0
        };
    });

    it('should reposition 4 tanks within screen bounds on next round', async () => {
        await gameFlow.handleNextRound(state);

        expect(state.roundNumber).toBe(2);
        expect(state.tanks.length).toBe(4);

        // Verify positions
        state.tanks.forEach((tank, i) => {
            expect(tank.x).toBeGreaterThan(0);
            expect(tank.x).toBeLessThan(CONSTANTS.SCREEN_WIDTH);
            
            // Expected dynamic spacing: 800 / 4 = 200 per section.
            // Centers: 100, 300, 500, 700
            const expectedX = (CONSTANTS.SCREEN_WIDTH / 4) * i + (CONSTANTS.SCREEN_WIDTH / 8);
            expect(tank.x).toBeCloseTo(expectedX);
        });
    });
});
