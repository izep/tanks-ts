
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEngine } from '../src/core/GameEngine';
import { GamePhase, type GameState, type TankState } from '../src/core/GameState';
import { WEAPONS } from '../src/core/WeaponData';

// Mock dependencies
vi.mock('../src/systems/RenderSystem', () => ({
    RenderSystem: class {
        render = vi.fn();
        resize = vi.fn();
    }
}));
vi.mock('../src/core/InputManager', () => ({
    InputManager: class {
        update = vi.fn();
        isActionActive = vi.fn();
        getAngleChange = vi.fn();
        getPowerChange = vi.fn();
    }
}));
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
        onBuyWeapon = vi.fn();
    }
}));
vi.mock('../src/systems/TerrainSystem', () => ({
    TerrainSystem: class {
        getGroundY = vi.fn().mockReturnValue(500);
        generate = vi.fn();
    }
}));

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


describe('Shop System Integration Test', () => {
    let engine: GameEngine;
    let state: GameState;

    beforeEach(() => {
        const canvas = new MockCanvas() as unknown as HTMLCanvasElement;
        engine = new GameEngine(canvas);

        // Setup initial state for testing the shop
        state = {
            phase: GamePhase.SHOP,
            tanks: [
                { id: 1, name: 'P1', credits: 10000, inventory: { 'missile': -1 }, fuel: 100, accessories: { shield: 0 } } as unknown as TankState,
                { id: 2, name: 'P2', credits: 100, inventory: { 'missile': -1 }, fuel: 100, accessories: { shield: 0 } } as unknown as TankState,
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

    it('should allow a player to buy a weapon if they have enough credits', () => {
        const tank = state.tanks[0];
        const weaponId = 'tracer'; // Costs 500
        const cost = WEAPONS[weaponId].cost;

        // @ts-ignore - private method access for testing
        engine.handleBuyWeapon(weaponId);

        expect(tank.credits).toBe(10000 - cost);
        expect(tank.inventory['tracer']).toBe(1);
    });

    it('should not allow a player to buy a weapon if they have insufficient credits', () => {
        const tank = state.tanks[1]; // 100 credits
        const weaponId = 'nuke'; // Costs 20000

        // @ts-ignore - private method access for testing
        engine.handleBuyWeapon(weaponId);

        expect(tank.credits).toBe(100);
        expect(tank.inventory['nuke']).toBeUndefined();
    });

    it('buying a fuel can should increase the tank fuel', () => {
        const tank = state.tanks[0];
        tank.fuel = 50;
        const itemId = 'fuel_can'; // Costs 2000
        const cost = WEAPONS[itemId].cost;
        const fuelValue = WEAPONS[itemId].effectValue || 0;

        // @ts-ignore - private method access for testing
        engine.handleBuyWeapon(itemId);

        expect(tank.credits).toBe(10000 - cost);
        expect(tank.fuel).toBe(50 + fuelValue);
    });

    it('buying a shield should add a shield to the tank accessories', () => {
        const tank = state.tanks[0];
        const itemId = 'shield'; // Costs 5000
        const cost = WEAPONS[itemId].cost;

        // @ts-ignore - private method access for testing
        engine.handleBuyWeapon(itemId);

        expect(tank.credits).toBe(10000 - cost);
        expect(tank.accessories['shield']).toBe(1);
    });
});
