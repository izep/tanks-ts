
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShopSystem } from '../src/systems/ShopSystem';
import { GameState, GamePhase } from '../src/core/GameState';
import { SoundManager } from '../src/core/SoundManager';
import { WEAPONS } from '../src/core/WeaponData';

class MockSoundManager extends SoundManager {
    constructor() {
        super();
        this.ctx = { createGain: () => ({ connect: () => {}, gain: { value: 0 } }) } as any;
    }
    playUI() { }
    playFire() { }
    playExplosion() { }
    playHit() { }
    playSizzle() { }
}

// Mock window for SoundManager and others
global.window = {
    AudioContext: class {
        createGain() { return { connect: () => {}, gain: { value: 0 } }; }
        createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
        destination: {}
        currentTime: 0
    },
    addEventListener: () => {}
} as any;

describe('ShopSystem', () => {
    let shopSystem: ShopSystem;
    let mockState: GameState;
    let mockSoundManager: SoundManager;

    beforeEach(() => {
        mockSoundManager = new MockSoundManager();
        shopSystem = new ShopSystem(mockSoundManager);

        mockState = {
            phase: GamePhase.SHOP,
            tanks: [
                {
                    id: 1,
                    name: 'Player 1',
                    credits: 5000,
                    inventory: { 'missile': 10 },
                    accessories: {},
                    currentWeapon: 'missile'
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

    it('should allow buying a weapon if player has enough credits', () => {
        // Assume 'missile' cost is 2000 (from WeaponData)
        // WEAPONS should be available if imported
        const weaponId = 'missile';
        const cost = WEAPONS[weaponId].cost;

        // Reset inventory for test
        mockState.tanks[0].inventory[weaponId] = 0;
        mockState.tanks[0].credits = cost + 100;

        shopSystem.handleBuyWeapon(mockState, weaponId);

        expect(mockState.tanks[0].credits).toBe(100);
        expect(mockState.tanks[0].inventory[weaponId]).toBe(1);
    });

    it('should not allow buying a weapon if player does not have enough credits', () => {
        const weaponId = 'nuke'; // Cost 20000
        mockState.tanks[0].credits = 100;

        shopSystem.handleBuyWeapon(mockState, weaponId);

        expect(mockState.tanks[0].credits).toBe(100);
        expect(mockState.tanks[0].inventory[weaponId]).toBeFalsy();
    });

    it('should handle item purchases (fuel)', () => {
        const itemId = 'fuel_can';
        const initialFuel = 250;
        mockState.tanks[0].fuel = initialFuel;
        mockState.tanks[0].credits = 5000;

        shopSystem.handleBuyWeapon(mockState, itemId);

        expect(mockState.tanks[0].credits).toBe(5000 - WEAPONS[itemId].cost);
        expect(mockState.tanks[0].fuel).toBeGreaterThan(initialFuel);
    });

    it('should handle item purchases (shield)', () => {
        const itemId = 'shield';
        mockState.tanks[0].accessories = {};
        mockState.tanks[0].credits = 5000;

        shopSystem.handleBuyWeapon(mockState, itemId);

        expect(mockState.tanks[0].accessories['shield']).toBe(1);
    });

    it('should set current weapon', () => {
        mockState.tanks[0].inventory['nuke'] = 1;
        shopSystem.handleSetWeapon(mockState, 'nuke');
        expect(mockState.tanks[0].currentWeapon).toBe('nuke');
    });

    it('should set active shield', () => {
        mockState.tanks[0].accessories['shield'] = 1;
        shopSystem.handleSetShield(mockState, 'shield');
        expect(mockState.tanks[0].activeShield).toBe('shield');
        expect(mockState.tanks[0].shieldHealth).toBe(200);
    });
});
