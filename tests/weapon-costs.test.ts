import { describe, it, expect } from 'vitest';
import { WEAPONS } from '../src/core/WeaponData';

describe('Weapon Costs', () => {
    it('should match spec 001 requirements', () => {
        // From spec 001 and Requirements.md
        expect(WEAPONS.baby_missile.cost).toBe(500);
        expect(WEAPONS.missile.cost).toBe(1875);
        expect(WEAPONS.baby_nuke.cost).toBe(10000);
        expect(WEAPONS.nuke.cost).toBe(5000);
        expect(WEAPONS.mirv.cost).toBe(7500);
        expect(WEAPONS.death_head.cost).toBe(20000);
        expect(WEAPONS.funky_bomb.cost).toBe(15000);
        
        // From Requirements.md table
        expect(WEAPONS.leapfrog.cost).toBe(10000);
        expect(WEAPONS.napalm.cost).toBe(10000);
        expect(WEAPONS.hot_napalm.cost).toBe(20000);
        expect(WEAPONS.riot_charge.cost).toBe(2000);
        expect(WEAPONS.riot_blast.cost).toBe(5000);
        expect(WEAPONS.riot_bomb.cost).toBe(5000);
        expect(WEAPONS.heavy_riot_bomb.cost).toBe(4750);
        expect(WEAPONS.baby_digger.cost).toBe(3000);
        expect(WEAPONS.digger.cost).toBe(2500);
        expect(WEAPONS.heavy_digger.cost).toBe(6750);
        expect(WEAPONS.baby_sandhog.cost).toBe(10000);
        expect(WEAPONS.sandhog.cost).toBe(16750);
        expect(WEAPONS.heavy_sandhog.cost).toBe(25000);
        expect(WEAPONS.dirt_clod.cost).toBe(5000);
        expect(WEAPONS.dirt_ball.cost).toBe(5000);
        expect(WEAPONS.ton_of_dirt.cost).toBe(6750);
        expect(WEAPONS.liquid_dirt.cost).toBe(5000);
        expect(WEAPONS.dirt_charge.cost).toBe(5000);
        expect(WEAPONS.earth_disrupter.cost).toBe(5000);
        expect(WEAPONS.plasma_blast.cost).toBe(9000);
        expect(WEAPONS.laser.cost).toBe(5000);
        expect(WEAPONS.heavy_roller.cost).toBe(6750);
    });
});
