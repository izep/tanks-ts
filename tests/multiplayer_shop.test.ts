
import { describe, it, expect, beforeEach } from 'vitest';
import { ShopSystem } from '../src/systems/ShopSystem';
import { GameState, GamePhase } from '../src/core/GameState';
import { SoundManager } from '../src/core/SoundManager';

class MockSoundManager extends SoundManager {
    constructor() {
        super();
        this.ctx = { createGain: () => ({ connect: () => {}, gain: { value: 0 } }) } as any;
    }
    playUI() { }
}

global.window = {
    AudioContext: class {
        createGain() { return { connect: () => {}, gain: { value: 0 } }; }
        createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
        destination: {}
        currentTime: 0
    },
    addEventListener: () => {}
} as any;

describe('Multiplayer Shop Logic', () => {
    let shopSystem: ShopSystem;
    let mockState: GameState;
    let mockSoundManager: SoundManager;

    beforeEach(() => {
        mockSoundManager = new MockSoundManager();
        shopSystem = new ShopSystem(mockSoundManager);

        // Setup state with mixed players
        mockState = {
            phase: GamePhase.SHOP,
            tanks: [
                { id: 1, name: 'P1 (Human)', isAi: false, credits: 100 } as any,
                { id: 2, name: 'P2 (AI)', isAi: true, credits: 100 } as any,
                { id: 3, name: 'P3 (Human)', isAi: false, credits: 100 } as any,
                { id: 4, name: 'P4 (AI)', isAi: true, credits: 100 } as any
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

    it('should initialize shop turn to first human player', () => {
        // Set index to something random
        mockState.currentPlayerIndex = 3;

        const result = shopSystem.initShopTurn(mockState);

        expect(result).toBe(true);
        expect(mockState.currentPlayerIndex).toBe(0); // P1 is first human
    });

    it('should cycle to next human player', () => {
        // Start at P1 (index 0)
        mockState.currentPlayerIndex = 0;

        const result = shopSystem.tryNextShopTurn(mockState);

        expect(result).toBe(true);
        expect(mockState.currentPlayerIndex).toBe(2); // P3 is next human (index 2), skipping P2 (AI, index 1)
    });

    it('should return false when no more human players', () => {
        // Start at P3 (index 2)
        mockState.currentPlayerIndex = 2;

        const result = shopSystem.tryNextShopTurn(mockState);

        expect(result).toBe(false);
        // Index shouldn't necessarily change if false returned, or doesn't matter as we proceed to next round
        expect(mockState.currentPlayerIndex).toBe(2);
    });

    it('should handle all AI scenario gracefully', () => {
        mockState.tanks = [
            { id: 1, isAi: true } as any,
            { id: 2, isAi: true } as any
        ];

        const result = shopSystem.initShopTurn(mockState);
        expect(result).toBe(false);
    });

    it('should handle all Human scenario', () => {
        mockState.tanks = [
            { id: 1, isAi: false } as any,
            { id: 2, isAi: false } as any
        ];

        shopSystem.initShopTurn(mockState);
        expect(mockState.currentPlayerIndex).toBe(0);

        let next = shopSystem.tryNextShopTurn(mockState);
        expect(next).toBe(true);
        expect(mockState.currentPlayerIndex).toBe(1);

        next = shopSystem.tryNextShopTurn(mockState);
        expect(next).toBe(false);
    });
});
