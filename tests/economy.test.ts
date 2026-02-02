import { describe, it, expect, beforeEach } from 'vitest';
import { EconomySystem } from '../src/systems/EconomySystem';
import { WEAPONS } from '../src/core/WeaponData';

describe('EconomySystem', () => {
    let economySystem: EconomySystem;

    beforeEach(() => {
        economySystem = new EconomySystem('low');
    });

    describe('Initialization', () => {
        it('should initialize with base prices from WeaponData', () => {
            expect(economySystem.getPrice('baby_missile')).toBe(WEAPONS.baby_missile.cost);
            expect(economySystem.getPrice('missile')).toBe(WEAPONS.missile.cost);
            expect(economySystem.getPrice('nuke')).toBe(WEAPONS.nuke.cost);
        });

        it('should support different volatility levels', () => {
            const noneSystem = new EconomySystem('none');
            const lowSystem = new EconomySystem('low');
            const mediumSystem = new EconomySystem('medium');
            const highSystem = new EconomySystem('high');

            expect(noneSystem).toBeDefined();
            expect(lowSystem).toBeDefined();
            expect(mediumSystem).toBeDefined();
            expect(highSystem).toBeDefined();
        });
    });

    describe('Price Fluctuation', () => {
        it('should increase price on purchase', () => {
            const basePrice = economySystem.getPrice('missile');
            economySystem.updatePrice('missile', true);
            const newPrice = economySystem.getPrice('missile');
            expect(newPrice).toBeGreaterThan(basePrice);
        });

        it('should decrease price on sale', () => {
            const basePrice = economySystem.getPrice('missile');
            economySystem.updatePrice('missile', false);
            const newPrice = economySystem.getPrice('missile');
            expect(newPrice).toBeLessThan(basePrice);
        });

        it('should clamp prices to 50%-200% of base price', () => {
            const basePrice = WEAPONS.missile.cost;
            const minPrice = basePrice * 0.5;
            const maxPrice = basePrice * 2.0;

            // Try to push price up beyond 200%
            for (let i = 0; i < 50; i++) {
                economySystem.updatePrice('missile', true);
            }
            expect(economySystem.getPrice('missile')).toBeLessThanOrEqual(maxPrice);

            // Reset and try to push price down below 50%
            economySystem = new EconomySystem('low');
            for (let i = 0; i < 50; i++) {
                economySystem.updatePrice('missile', false);
            }
            expect(economySystem.getPrice('missile')).toBeGreaterThanOrEqual(minPrice);
        });

        it('should have different price change rates based on volatility', () => {
            const noneSystem = new EconomySystem('none');
            const lowSystem = new EconomySystem('low');
            const highSystem = new EconomySystem('high');

            const basePrice = WEAPONS.missile.cost;

            noneSystem.updatePrice('missile', true);
            lowSystem.updatePrice('missile', true);
            highSystem.updatePrice('missile', true);

            const nonePrice = noneSystem.getPrice('missile');
            const lowPrice = lowSystem.getPrice('missile');
            const highPrice = highSystem.getPrice('missile');

            // None volatility should not change price
            expect(nonePrice).toBe(basePrice);
            
            // High volatility should change more than low
            expect(highPrice - basePrice).toBeGreaterThan(lowPrice - basePrice);
        });
    });

    describe('Market Forces', () => {
        it('should drift prices toward base over time', () => {
            const basePrice = economySystem.getPrice('missile');

            // Push price up
            for (let i = 0; i < 10; i++) {
                economySystem.updatePrice('missile', true);
            }
            const highPrice = economySystem.getPrice('missile');
            expect(highPrice).toBeGreaterThan(basePrice);

            // Apply market forces multiple times
            for (let i = 0; i < 20; i++) {
                economySystem.applyMarketForces();
            }
            
            const driftedPrice = economySystem.getPrice('missile');
            
            // Price should have moved toward base
            expect(Math.abs(driftedPrice - basePrice)).toBeLessThan(Math.abs(highPrice - basePrice));
        });
    });

    describe('Volatility Control', () => {
        it('should allow changing volatility', () => {
            economySystem.setVolatility('high');
            const basePrice = economySystem.getPrice('missile');
            economySystem.updatePrice('missile', true);
            const highVolPrice = economySystem.getPrice('missile');

            economySystem.setVolatility('none');
            economySystem.updatePrice('missile', true);
            const noVolPrice = economySystem.getPrice('missile');

            // High volatility should cause bigger change
            expect(highVolPrice - basePrice).toBeGreaterThan(noVolPrice - highVolPrice);
        });
    });

    describe('Market State', () => {
        it('should track purchase and sales counts', () => {
            const marketState = economySystem.getMarketState();
            expect(marketState.purchaseCount['missile']).toBe(0);
            expect(marketState.salesCount['missile']).toBe(0);

            economySystem.updatePrice('missile', true);
            expect(marketState.purchaseCount['missile']).toBe(1);

            economySystem.updatePrice('missile', false);
            expect(marketState.salesCount['missile']).toBe(1);
        });

        it('should return readonly market state', () => {
            const marketState = economySystem.getMarketState();
            expect(marketState).toBeDefined();
            expect(marketState.basePrices).toBeDefined();
            expect(marketState.currentPrices).toBeDefined();
        });
    });

    describe('Price Rounding', () => {
        it('should return rounded prices', () => {
            const price = economySystem.getPrice('missile');
            expect(Number.isInteger(price)).toBe(true);
        });
    });
});
