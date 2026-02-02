import { describe, it, expect } from 'vitest';
import { WEAPONS } from '../src/core/WeaponData';

describe('Tracer Weapons', () => {
    it('should have Tracer weapon with correct cost and bundle size', () => {
        const tracer = WEAPONS['tracer'];
        expect(tracer).toBeDefined();
        expect(tracer.name).toBe('Tracer');
        expect(tracer.cost).toBe(10);
        expect(tracer.bundleSize).toBe(20);
        expect(tracer.damage).toBe(0);
        expect(tracer.radius).toBe(0);
        expect(tracer.type).toBe('tracer');
    });

    it('should have Smoke Tracer weapon with correct cost and bundle size', () => {
        const smokeTracer = WEAPONS['smoke_tracer'];
        expect(smokeTracer).toBeDefined();
        expect(smokeTracer.name).toBe('Smoke Tracer');
        expect(smokeTracer.cost).toBe(500);
        expect(smokeTracer.bundleSize).toBe(10);
        expect(smokeTracer.damage).toBe(0);
        expect(smokeTracer.radius).toBe(0);
        expect(smokeTracer.type).toBe('smoke_tracer');
        expect(smokeTracer.trailColor).toBe('#00FF00');
        expect(smokeTracer.trailDuration).toBe(4000);
    });

    it('Tracer should have zero damage (utility weapon)', () => {
        const tracer = WEAPONS['tracer'];
        expect(tracer.damage).toBe(0);
        expect(tracer.radius).toBe(0);
        expect(tracer.description).toContain('no damage');
    });

    it('Smoke Tracer should have zero damage (utility weapon)', () => {
        const smokeTracer = WEAPONS['smoke_tracer'];
        expect(smokeTracer.damage).toBe(0);
        expect(smokeTracer.radius).toBe(0);
        expect(smokeTracer.description).toContain('smoke trail');
    });

    it('Both tracers should be affordable utility weapons', () => {
        const tracer = WEAPONS['tracer'];
        const smokeTracer = WEAPONS['smoke_tracer'];
        
        // Tracer is cheapest weapon ($10)
        expect(tracer.cost).toBe(10);
        
        // Smoke tracer is more expensive but still cheap
        expect(smokeTracer.cost).toBe(500);
        expect(smokeTracer.cost).toBeLessThan(1000);
        
        // Both have good bundle sizes
        expect(tracer.bundleSize).toBeGreaterThanOrEqual(10);
        expect(smokeTracer.bundleSize).toBeGreaterThanOrEqual(5);
    });
});
