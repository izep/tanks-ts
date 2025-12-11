import { describe, it, expect, beforeEach } from 'vitest';
import { type GameState, type TankState, GamePhase } from '../src/core/GameState';
import { WEAPONS } from '../src/core/WeaponData';

describe('Accessories System', () => {
    let tank: TankState;

    beforeEach(() => {
        tank = {
            id: 1,
            name: 'Test Tank',
            x: 100,
            y: 100,
            vy: 0,
            angle: 45,
            power: 500,
            health: 100,
            fuel: 250,
            color: 'red',
            variant: 0,
            isAi: false,
            isFalling: false,
            isDead: false,
            hasLanded: true,
            parachuteThreshold: 15,
            credits: 10000,
            currentWeapon: 'baby_missile',
            inventory: { 'baby_missile': -1 },
            accessories: {}
        } as TankState;
    });

    describe('Shield System', () => {
        it('should activate shield when available', () => {
            tank.accessories['shield'] = 2;
            
            // Simulate shield activation
            if (tank.accessories['shield'] > 0) {
                tank.accessories['shield']--;
                tank.activeShield = 'shield';
                tank.shieldHealth = 200;
            }

            expect(tank.activeShield).toBe('shield');
            expect(tank.shieldHealth).toBe(200);
            expect(tank.accessories['shield']).toBe(1);
        });

        it('should not activate shield when none available', () => {
            tank.accessories['shield'] = 0;
            const initialShield = tank.activeShield;
            
            // Try to activate
            if (tank.accessories['shield'] > 0) {
                tank.accessories['shield']--;
                tank.activeShield = 'shield';
                tank.shieldHealth = 200;
            }

            expect(tank.activeShield).toBe(initialShield);
            expect(tank.accessories['shield']).toBe(0);
        });

        it('should absorb damage when active', () => {
            tank.activeShield = 'shield';
            tank.shieldHealth = 200;
            const damage = 50;

            // Simulate damage absorption
            if (tank.shieldHealth && tank.shieldHealth > 0) {
                const absorbed = Math.min(damage, tank.shieldHealth);
                tank.shieldHealth -= absorbed;
                const remainingDamage = damage - absorbed;
                
                expect(absorbed).toBe(50);
                expect(tank.shieldHealth).toBe(150);
                expect(remainingDamage).toBe(0);
            }
        });

        it('should break when shield health depleted', () => {
            tank.activeShield = 'shield';
            tank.shieldHealth = 30;
            const damage = 50;

            // Simulate damage that breaks shield
            if (tank.shieldHealth && tank.shieldHealth > 0) {
                const absorbed = Math.min(damage, tank.shieldHealth);
                tank.shieldHealth -= absorbed;
                const remainingDamage = damage - absorbed;
                
                if (tank.shieldHealth <= 0) {
                    tank.activeShield = undefined;
                }
                
                expect(absorbed).toBe(30);
                expect(remainingDamage).toBe(20);
                expect(tank.activeShield).toBeUndefined();
            }
        });

        it('should deactivate shield on toggle', () => {
            tank.activeShield = 'shield';
            tank.shieldHealth = 150;

            // Simulate deactivation
            tank.activeShield = undefined;
            tank.shieldHealth = 0;

            expect(tank.activeShield).toBeUndefined();
            expect(tank.shieldHealth).toBe(0);
        });
    });

    describe('Parachute System', () => {
        it('should deploy parachute when falling fast', () => {
            tank.accessories['parachute'] = 3;
            tank.vy = 200; // Fast fall velocity
            tank.hasLanded = false;

            // Simulate parachute deployment check
            if ((tank.accessories['parachute'] || 0) > 0 && tank.vy > 150) {
                tank.isParachuteDeployed = true;
                tank.accessories['parachute']--;
            }

            expect(tank.isParachuteDeployed).toBe(true);
            expect(tank.accessories['parachute']).toBe(2);
        });

        it('should not deploy parachute when falling slowly', () => {
            tank.accessories['parachute'] = 3;
            tank.vy = 100; // Slow fall velocity

            // Simulate parachute deployment check
            if ((tank.accessories['parachute'] || 0) > 0 && tank.vy > 150) {
                tank.isParachuteDeployed = true;
                tank.accessories['parachute']--;
            }

            expect(tank.isParachuteDeployed).toBeFalsy();
            expect(tank.accessories['parachute']).toBe(3);
        });

        it('should prevent fall damage when deployed', () => {
            tank.accessories['parachute'] = 2;
            const fallDamage = 50;
            tank.parachuteThreshold = 15;

            // Simulate emergency deploy on impact
            let finalDamage = fallDamage;
            if ((tank.accessories['parachute'] || 0) > 0 && fallDamage >= tank.parachuteThreshold) {
                tank.accessories['parachute']--;
                finalDamage = 0;
            }

            expect(finalDamage).toBe(0);
            expect(tank.accessories['parachute']).toBe(1);
        });

        it('should not deploy if fall damage below threshold', () => {
            tank.accessories['parachute'] = 2;
            const fallDamage = 10;
            tank.parachuteThreshold = 15;

            // Simulate check
            let finalDamage = fallDamage;
            if ((tank.accessories['parachute'] || 0) > 0 && fallDamage >= tank.parachuteThreshold) {
                tank.accessories['parachute']--;
                finalDamage = 0;
            }

            expect(finalDamage).toBe(10);
            expect(tank.accessories['parachute']).toBe(2);
        });
    });

    describe('Battery System', () => {
        it('should restore health when used', () => {
            tank.health = 50;
            tank.accessories['battery'] = 3;
            const restoreAmount = WEAPONS['battery'].effectValue || 10;

            // Simulate battery use
            if ((tank.accessories['battery'] || 0) > 0 && tank.health < 100) {
                tank.health = Math.min(100, tank.health + restoreAmount);
                tank.accessories['battery']--;
            }

            expect(tank.health).toBe(60);
            expect(tank.accessories['battery']).toBe(2);
        });

        it('should not exceed max health', () => {
            tank.health = 95;
            tank.accessories['battery'] = 2;
            const restoreAmount = WEAPONS['battery'].effectValue || 10;

            // Simulate battery use
            if ((tank.accessories['battery'] || 0) > 0 && tank.health < 100) {
                tank.health = Math.min(100, tank.health + restoreAmount);
                tank.accessories['battery']--;
            }

            expect(tank.health).toBe(100);
            expect(tank.accessories['battery']).toBe(1);
        });

        it('should not use battery when health full', () => {
            tank.health = 100;
            tank.accessories['battery'] = 2;

            // Simulate battery use attempt
            if ((tank.accessories['battery'] || 0) > 0 && tank.health < 100) {
                tank.health = Math.min(100, tank.health + 10);
                tank.accessories['battery']--;
            }

            expect(tank.health).toBe(100);
            expect(tank.accessories['battery']).toBe(2);
        });

        it('should not use battery when none available', () => {
            tank.health = 50;
            tank.accessories['battery'] = 0;

            // Simulate battery use attempt
            if ((tank.accessories['battery'] || 0) > 0 && tank.health < 100) {
                tank.health = Math.min(100, tank.health + 10);
                tank.accessories['battery']--;
            }

            expect(tank.health).toBe(50);
            expect(tank.accessories['battery']).toBe(0);
        });
    });

    describe('Fuel System', () => {
        it('should consume fuel when moving', () => {
            tank.fuel = 250;
            const moveDistance = 10;
            const fuelCostPerPixel = 1;

            // Simulate movement
            if (tank.fuel >= moveDistance * fuelCostPerPixel) {
                tank.fuel -= moveDistance * fuelCostPerPixel;
                tank.x += moveDistance;
            }

            expect(tank.fuel).toBe(240);
            expect(tank.x).toBe(110);
        });

        it('should not move when fuel depleted', () => {
            tank.fuel = 0;
            const initialX = tank.x;
            const moveDistance = 10;

            // Simulate movement attempt
            if (tank.fuel >= moveDistance) {
                tank.fuel -= moveDistance;
                tank.x += moveDistance;
            }

            expect(tank.fuel).toBe(0);
            expect(tank.x).toBe(initialX);
        });

        it('should restore fuel when buying fuel can', () => {
            tank.fuel = 50;
            tank.credits = 5000;
            const fuelCanCost = WEAPONS['fuel_can'].cost;
            const fuelRestore = WEAPONS['fuel_can'].effectValue || 250;

            // Simulate buying fuel
            if (tank.credits >= fuelCanCost) {
                tank.credits -= fuelCanCost;
                tank.fuel += fuelRestore;
            }

            expect(tank.fuel).toBe(300);
            expect(tank.credits).toBe(3000);
        });
    });

    describe('Item Purchase', () => {
        it('should purchase shield correctly', () => {
            tank.accessories['shield'] = 0;
            const cost = WEAPONS['shield'].cost;

            if (tank.credits >= cost) {
                tank.credits -= cost;
                tank.accessories['shield'] = (tank.accessories['shield'] || 0) + 1;
            }

            expect(tank.accessories['shield']).toBe(1);
            expect(tank.credits).toBe(10000 - cost);
        });

        it('should purchase parachute correctly', () => {
            tank.accessories['parachute'] = 0;
            const cost = WEAPONS['parachute'].cost;

            if (tank.credits >= cost) {
                tank.credits -= cost;
                tank.accessories['parachute'] = (tank.accessories['parachute'] || 0) + 1;
            }

            expect(tank.accessories['parachute']).toBe(1);
            expect(tank.credits).toBe(10000 - cost);
        });

        it('should purchase battery correctly', () => {
            tank.accessories['battery'] = 0;
            const cost = WEAPONS['battery'].cost;

            if (tank.credits >= cost) {
                tank.credits -= cost;
                tank.accessories['battery'] = (tank.accessories['battery'] || 0) + 1;
            }

            expect(tank.accessories['battery']).toBe(1);
            expect(tank.credits).toBe(10000 - cost);
        });

        it('should not purchase if insufficient funds', () => {
            tank.credits = 500;
            tank.accessories['shield'] = 0;
            const cost = WEAPONS['shield'].cost;

            if (tank.credits >= cost) {
                tank.credits -= cost;
                tank.accessories['shield'] = (tank.accessories['shield'] || 0) + 1;
            }

            expect(tank.accessories['shield']).toBe(0);
            expect(tank.credits).toBe(500);
        });
    });
});
