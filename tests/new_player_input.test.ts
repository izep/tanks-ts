
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlayerInputSystem } from '../src/systems/PlayerInputSystem';
import { GameState, GamePhase, CONSTANTS } from '../src/core/GameState';
import { InputManager, GameAction } from '../src/core/InputManager';
import { TerrainSystem } from '../src/systems/TerrainSystem';
import { PhysicsSystem } from '../src/systems/PhysicsSystem';
import { SoundManager } from '../src/core/SoundManager';

// Mocks
class MockTerrainSystem extends TerrainSystem {
    constructor() { super(800, 600); }
    getGroundY(x: number) { return 500; }
}
class MockPhysicsSystem extends PhysicsSystem {
    fireProjectile(state: GameState, power: number, angle: number, weaponId: string) {}
}
class MockSoundManager extends SoundManager {
    constructor() {
        super();
        this.ctx = { createGain: () => ({ connect: () => {}, gain: { value: 0 } }) } as any;
    }
    playFire() {}
    playUI() {}
    playExplosion() {}
    playHit() {}
    playSizzle() {}
}

// Mock window and document
global.window = {
    AudioContext: class {
        createGain() { return { connect: () => {}, gain: { value: 0 } }; }
        createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
        destination: {}
        currentTime: 0
    },
    addEventListener: () => {}
} as any;

global.document = {
    createElement: () => ({
        getContext: () => ({
            clearRect: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            closePath: () => {},
            fill: () => {},
            getImageData: () => ({ data: new Uint8ClampedArray(10) }),
            putImageData: () => {}
        })
    })
} as any;

describe('PlayerInputSystem', () => {
    let system: PlayerInputSystem;
    let inputManager: InputManager;
    let mockState: GameState;
    let physics: PhysicsSystem;

    beforeEach(() => {
        inputManager = new InputManager();
        const terrain = new MockTerrainSystem();
        physics = new MockPhysicsSystem(terrain);
        const sound = new MockSoundManager();

        system = new PlayerInputSystem(inputManager, terrain, physics, sound);

        mockState = {
            phase: GamePhase.AIMING,
            tanks: [
                {
                    id: 1,
                    x: 100, y: 500,
                    angle: 90,
                    power: 500,
                    fuel: 250,
                    health: 100,
                    currentWeapon: 'missile',
                    inventory: { 'missile': 10 },
                    accessories: { 'battery': 1 },
                    hasLanded: true,
                    isAi: false
                } as any
            ],
            currentPlayerIndex: 0,
            projectiles: [],
            explosions: [],
            roundNumber: 1,
            maxRounds: 10,
            wind: 0,
            gravity: 98,
            terrainDirty: false,
            lastExplosionTime: 0
        };
    });

    it('should adjust angle when aiming', () => {
        // Simulate input
        vi.spyOn(inputManager, 'isActionActive').mockImplementation((action) => action === GameAction.AIM_UP);

        const initialAngle = mockState.tanks[0].angle;
        system.handleAimingInput(mockState, 0.1);

        expect(mockState.tanks[0].angle).toBeGreaterThan(initialAngle);
    });

    it('should adjust power', () => {
        vi.spyOn(inputManager, 'isActionActive').mockImplementation((action) => action === GameAction.POWER_UP);

        const initialPower = mockState.tanks[0].power;
        system.handleAimingInput(mockState, 0.1);

        expect(mockState.tanks[0].power).toBeGreaterThan(initialPower);
    });

    it('should move tank and consume fuel', () => {
        vi.spyOn(inputManager, 'isActionActive').mockImplementation((action) => action === GameAction.MOVE_RIGHT);

        const initialX = mockState.tanks[0].x;
        const initialFuel = mockState.tanks[0].fuel;

        system.handleAimingInput(mockState, 0.1);

        expect(mockState.tanks[0].x).toBeGreaterThan(initialX);
        expect(mockState.tanks[0].fuel).toBeLessThan(initialFuel);
    });

    it('should fire weapon', () => {
        vi.spyOn(inputManager, 'isActionTriggered').mockImplementation((action) => action === GameAction.FIRE);
        const fireSpy = vi.spyOn(physics, 'fireProjectile');

        system.handleAimingInput(mockState, 0.1);

        expect(fireSpy).toHaveBeenCalled();
    });

    it('should use battery', () => {
        vi.spyOn(inputManager, 'isActionTriggered').mockImplementation((action) => action === GameAction.USE_BATTERY);
        mockState.tanks[0].health = 50;

        system.handleAimingInput(mockState, 0.1);

        expect(mockState.tanks[0].health).toBe(60); // +10
        expect(mockState.tanks[0].accessories['battery']).toBe(0);
    });
});
