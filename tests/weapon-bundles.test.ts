import { describe, it, expect, beforeEach } from 'vitest';
import { ShopSystem } from '../src/systems/ShopSystem';
import { SoundManager } from '../src/core/SoundManager';
import { WEAPONS } from '../src/core/WeaponData';
import { GameState, GamePhase } from '../src/core/GameState';
import { EconomySystem } from '../src/systems/EconomySystem';

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

// Mock window for SoundManager
global.window = {
    AudioContext: class {
        createGain() { return { connect: () => {}, gain: { value: 0 } }; }
        createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
        destination: {}
        currentTime: 0
    },
    addEventListener: () => {}
} as any;

describe('Weapon Bundle System', () => {
    let shopSystem: ShopSystem;
    let mockState: GameState;

    beforeEach(() => {
        const soundManager = new MockSoundManager();
        const economySystem = new EconomySystem('none');
        shopSystem = new ShopSystem(soundManager, economySystem);

        mockState = {
            phase: 'SHOP' as GamePhase,
            tanks: [
                {
                    id: 0,
                    name: 'Test Tank',
                    x: 100,
                    y: 100,
                    vy: 0,
                    angle: 45,
                    power: 500,
                    health: 100,
                    fuel: 250,
                    color: '#FF0000',
                    variant: 0,
                    isAi: false,
                    isFalling: false,
                    isDead: false,
                    credits: 100000,
                    currentWeapon: 'baby_missile',
                    inventory: { 'baby_missile': -1 },
                    accessories: {}
                }
            ],
            projectiles: [],
            explosions: [],
            currentPlayerIndex: 0,
            roundNumber: 1,
            maxRounds: 10,
            wind: 0,
            gravity: 98,
            terrainDirty: false,
            lastExplosionTime: 0
        };
    });

    it('should add bundleSize items when purchasing missiles (x5)', () => {
        const weaponId = 'missile';
        mockState.tanks[0].inventory[weaponId] = 0;
        
        shopSystem.handleBuyWeapon(mockState, weaponId);
        
        expect(mockState.tanks[0].inventory[weaponId]).toBe(5);
    });

    it('should add bundleSize items when purchasing baby missiles (x10)', () => {
        const weaponId = 'baby_missile';
        mockState.tanks[0].inventory[weaponId] = 0; // Override infinite
        
        shopSystem.handleBuyWeapon(mockState, weaponId);
        
        expect(mockState.tanks[0].inventory[weaponId]).toBe(10);
    });

    it('should enforce 99 max inventory cap', () => {
        const weaponId = 'missile';
        mockState.tanks[0].inventory[weaponId] = 96;
        
        shopSystem.handleBuyWeapon(mockState, weaponId); // Try to add 5
        
        expect(mockState.tanks[0].inventory[weaponId]).toBe(99); // Capped at 99
    });

    it('should not purchase if already at 99', () => {
        const weaponId = 'missile';
        mockState.tanks[0].inventory[weaponId] = 99;
        const initialCredits = mockState.tanks[0].credits;
        
        shopSystem.handleBuyWeapon(mockState, weaponId);
        
        expect(mockState.tanks[0].inventory[weaponId]).toBe(99);
        expect(mockState.tanks[0].credits).toBe(initialCredits); // Credits unchanged
    });

    it('should handle bundle sizes correctly for various weapons', () => {
        // Test a few different bundle sizes
        const tests = [
            { weapon: 'nuke', expected: 1 },
            { weapon: 'mirv', expected: 3 },
            { weapon: 'napalm', expected: 10 },
            { weapon: 'baby_roller', expected: 10 },
            { weapon: 'roller', expected: 5 },
            { weapon: 'heavy_roller', expected: 2 }
        ];

        tests.forEach(test => {
            mockState.tanks[0].inventory[test.weapon] = 0;
            shopSystem.handleBuyWeapon(mockState, test.weapon);
            expect(mockState.tanks[0].inventory[test.weapon]).toBe(test.expected);
        });
    });

    it('all weapons should have bundleSize defined', () => {
        Object.keys(WEAPONS).forEach(key => {
            expect(WEAPONS[key].bundleSize).toBeDefined();
            expect(WEAPONS[key].bundleSize).toBeGreaterThan(0);
        });
    });
});
