
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEngine } from '../src/core/GameEngine';
import { GamePhase, type GameState, type TankState } from '../src/core/GameState';
import { WEAPONS } from '../src/core/WeaponData';
import { InputManager, GameAction } from '../src/core/InputManager';

// Mock dependencies
vi.mock('../src/systems/RenderSystem', () => ({
    RenderSystem: class {
        render = vi.fn();
        resize = vi.fn();
    }
}));
// We need to test InputManager, so we won't mock it.
// Instead, we'll mock the global objects it depends on.
vi.mock('../src/core/SoundManager', () => ({
    SoundManager: class {
        playUI = vi.fn();
        playFire = vi.fn();
        playExplosion = vi.fn();
    }
}));
vi.mock('../src/ui/UIManager', () => ({
    UIManager: class {
        update = vi.fn();
    }
}));
vi.mock('../src/systems/TerrainSystem', () => ({
    TerrainSystem: class {
        getGroundY = vi.fn().mockReturnValue(500);
        generate = vi.fn();
    }
}));

// Mock DOM environment for InputManager
// @ts-ignore
global.window = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
};

// Mock Canvas
class MockCanvas {
    getContext = () => ({
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        fillRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        arc: vi.fn(),
    });
    width = 800;
    height = 600;
}

global.HTMLCanvasElement = MockCanvas as any;


describe('Accessories Integration Test', () => {
    let engine: GameEngine;
    let state: GameState;
    let inputManager: InputManager;

    beforeEach(() => {
        const canvas = new MockCanvas() as unknown as HTMLCanvasElement;
        engine = new GameEngine(canvas);
        inputManager = engine.inputManager;

        state = {
            phase: GamePhase.AIMING,
            tanks: [
                { id: 1, name: 'P1', x: 100, y: 500, health: 100, fuel: 100, accessories: { shield: 1, battery: 2 }, activeShield: undefined, shieldHealth: 0, hasLanded: true } as unknown as TankState,
            ],
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

        engine.state = state;
    });

    it('should toggle shield on and off', () => {
        const tank = state.tanks[0];

        // Turn shield on
        inputManager.handleInput(GameAction.TOGGLE_SHIELD, true);
        // @ts-ignore - private method access for testing
        engine.handleAimingInput(0.1);
        inputManager.handleInput(GameAction.TOGGLE_SHIELD, false); // Untrigger

        expect(tank.activeShield).toBe('shield');
        expect(tank.shieldHealth).toBe(200);
        expect(tank.accessories['shield']).toBe(0);

        // Turn shield off
        inputManager.handleInput(GameAction.TOGGLE_SHIELD, true);
        // @ts-ignore - private method access for testing
        engine.handleAimingInput(0.1);

        expect(tank.activeShield).toBeUndefined();
        expect(tank.shieldHealth).toBe(0);
    });

    it('should use a battery to restore health', () => {
        const tank = state.tanks[0];
        tank.health = 50;

        inputManager.handleInput(GameAction.USE_BATTERY, true);
        // @ts-ignore - private method access for testing
        engine.handleAimingInput(0.1);

        const restoreAmount = WEAPONS['battery'].effectValue || 10;
        expect(tank.health).toBe(50 + restoreAmount);
        expect(tank.accessories['battery']).toBe(1);
    });

    it('should not use a battery if health is full', () => {
        const tank = state.tanks[0];

        inputManager.handleInput(GameAction.USE_BATTERY, true);
        // @ts-ignore - private method access for testing
        engine.handleAimingInput(0.1);

        expect(tank.health).toBe(100);
        expect(tank.accessories['battery']).toBe(2);
    });

    it('should consume fuel when moving', () => {
        const tank = state.tanks[0];

        inputManager.handleInput(GameAction.MOVE_RIGHT, true);
        // @ts-ignore - private method access for testing
        engine.handleAimingInput(0.1);

        expect(tank.fuel).toBeLessThan(100);
        expect(tank.x).toBeGreaterThan(100);
    });
});
