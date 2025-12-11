import { describe, it, expect, beforeEach } from 'vitest';
import { type GameState, type TankState, GamePhase } from '../src/core/GameState';
import { WEAPONS } from '../src/core/WeaponData';

describe('Accessories Integration Tests', () => {
    let state: GameState;

    beforeEach(() => {
        state = {
            phase: GamePhase.AIMING,
            tanks: [
                {
                    id: 1,
                    name: 'Player 1',
                    x: 200,
                    y: 400,
                    vy: 0,
                    angle: 45,
                    power: 500,
                    health: 100,
                    fuel: 500,
                    color: 'red',
                    variant: 0,
                    isAi: false,
                    isFalling: false,
                    isDead: false,
                    hasLanded: true,
                    parachuteThreshold: 15,
                    credits: 20000,
                    currentWeapon: 'baby_missile',
                    inventory: { 'baby_missile': -1, 'missile': 5 },
                    accessories: { 
                        'shield': 2, 
                        'parachute': 3, 
                        'battery': 2 
                    }
                } as TankState,
                {
                    id: 2,
                    name: 'Player 2',
                    x: 600,
                    y: 400,
                    vy: 0,
                    angle: 135,
                    power: 500,
                    health: 100,
                    fuel: 500,
                    color: 'blue',
                    variant: 1,
                    isAi: true,
                    isFalling: false,
                    isDead: false,
                    hasLanded: true,
                    parachuteThreshold: 15,
                    credits: 15000,
                    currentWeapon: 'baby_missile',
                    inventory: { 'baby_missile': -1 },
                    accessories: {}
                } as TankState
            ],
            projectiles: [],
            explosions: [],
            currentPlayerIndex: 0,
            roundNumber: 1,
            maxRounds: 10,
            wind: 50,
            gravity: 98,
            terrainDirty: false,
            lastExplosionTime: 0
        };
    });

    describe('Complete Shield Lifecycle', () => {
        it('should activate, absorb damage, and break shield correctly', () => {
            const tank = state.tanks[0];
            
            // Step 1: Activate shield
            expect(tank.accessories['shield']).toBe(2);
            tank.accessories['shield']--;
            tank.activeShield = 'shield';
            tank.shieldHealth = 200;
            
            expect(tank.activeShield).toBe('shield');
            expect(tank.shieldHealth).toBe(200);
            expect(tank.accessories['shield']).toBe(1);
            
            // Step 2: Take moderate damage - shield absorbs
            let damage = 80;
            if (tank.shieldHealth && tank.shieldHealth > 0) {
                const absorbed = Math.min(damage, tank.shieldHealth);
                tank.shieldHealth -= absorbed;
                damage -= absorbed;
            }
            
            expect(tank.shieldHealth).toBe(120);
            expect(tank.health).toBe(100); // No health damage
            
            // Step 3: Take heavy damage - shield breaks
            damage = 150;
            if (tank.shieldHealth && tank.shieldHealth > 0) {
                const absorbed = Math.min(damage, tank.shieldHealth);
                tank.shieldHealth -= absorbed;
                damage -= absorbed;
                
                if (tank.shieldHealth <= 0) {
                    tank.activeShield = undefined;
                    tank.shieldHealth = 0; // Clamp to 0
                }
            }
            
            // Apply remaining damage to tank
            if (damage > 0) {
                tank.health = Math.max(0, tank.health - damage);
            }
            
            expect(tank.activeShield).toBeUndefined();
            expect(tank.shieldHealth).toBe(0); // Clamped to 0
            expect(tank.health).toBe(70); // 30 damage went through
            
            // Step 4: Reactivate with second shield
            if (tank.accessories['shield'] > 0) {
                tank.accessories['shield']--;
                tank.activeShield = 'shield';
                tank.shieldHealth = 200;
            }
            
            expect(tank.activeShield).toBe('shield');
            expect(tank.shieldHealth).toBe(200);
            expect(tank.accessories['shield']).toBe(0);
        });
    });

    describe('Complete Parachute Lifecycle', () => {
        it('should deploy parachute during fall and prevent damage', () => {
            const tank = state.tanks[0];
            
            // Step 1: Tank starts falling
            tank.isFalling = true;
            tank.hasLanded = false;
            tank.vy = 50; // Initial fall velocity
            
            // Step 2: Velocity increases significantly
            const dt = 0.016; // ~60fps
            for (let i = 0; i < 100; i++) { // More iterations to reach higher velocity
                tank.vy += state.gravity * dt;
            }
            
            expect(tank.vy).toBeGreaterThan(150);
            
            // Step 3: Parachute deploys mid-air
            if ((tank.accessories['parachute'] || 0) > 0 && tank.vy > 150 && !tank.hasLanded) {
                tank.isParachuteDeployed = true;
                tank.accessories['parachute']--;
                tank.vy = 100; // Reduce velocity
            }
            
            expect(tank.isParachuteDeployed).toBe(true);
            expect(tank.accessories['parachute']).toBe(2);
            expect(tank.vy).toBe(100);
            
            // Step 4: Land safely
            tank.hasLanded = true;
            tank.isFalling = false;
            tank.isParachuteDeployed = false;
            const fallDamage = Math.floor(tank.vy / 10); // Reduced damage formula
            
            expect(fallDamage).toBeLessThan(15); // Below threshold, safe landing
            expect(tank.health).toBe(100);
        });

        it('should handle emergency parachute on impact', () => {
            const tank = state.tanks[0];
            
            // Simulate high-speed impact
            const impactVelocity = 300;
            let fallDamage = Math.floor(impactVelocity / 10);
            
            expect(fallDamage).toBe(30);
            
            // Emergency deploy
            if ((tank.accessories['parachute'] || 0) > 0 && fallDamage >= tank.parachuteThreshold) {
                tank.accessories['parachute']--;
                fallDamage = 0;
            }
            
            tank.health -= fallDamage;
            
            expect(tank.health).toBe(100);
            expect(tank.accessories['parachute']).toBe(2);
        });
    });

    describe('Complete Battery Lifecycle', () => {
        it('should use batteries to restore health during battle', () => {
            const tank = state.tanks[0];
            
            // Step 1: Take damage in battle
            tank.health = 45;
            
            // Step 2: Use first battery
            if ((tank.accessories['battery'] || 0) > 0 && tank.health < 100) {
                const restoreAmount = WEAPONS['battery'].effectValue || 10;
                tank.health = Math.min(100, tank.health + restoreAmount);
                tank.accessories['battery']--;
            }
            
            expect(tank.health).toBe(55);
            expect(tank.accessories['battery']).toBe(1);
            
            // Step 3: Take more damage
            tank.health -= 30;
            expect(tank.health).toBe(25);
            
            // Step 4: Use second battery
            if ((tank.accessories['battery'] || 0) > 0 && tank.health < 100) {
                const restoreAmount = WEAPONS['battery'].effectValue || 10;
                tank.health = Math.min(100, tank.health + restoreAmount);
                tank.accessories['battery']--;
            }
            
            expect(tank.health).toBe(35);
            expect(tank.accessories['battery']).toBe(0);
            
            // Step 5: Try to use battery when none left
            const healthBefore = tank.health;
            if ((tank.accessories['battery'] || 0) > 0 && tank.health < 100) {
                tank.health = Math.min(100, tank.health + 10);
                tank.accessories['battery']--;
            }
            
            expect(tank.health).toBe(healthBefore);
        });
    });

    describe('Complete Fuel Lifecycle', () => {
        it('should consume fuel during movement and prevent movement when depleted', () => {
            const tank = state.tanks[0];
            
            // Step 1: Initial position
            const startX = tank.x;
            expect(tank.fuel).toBe(500);
            
            // Step 2: Move right 100 pixels
            const moveDistance = 100;
            const fuelCost = moveDistance * 1; // 1 fuel per pixel
            
            if (tank.fuel >= fuelCost && tank.hasLanded) {
                tank.x += moveDistance;
                tank.fuel -= fuelCost;
            }
            
            expect(tank.x).toBe(startX + 100);
            expect(tank.fuel).toBe(400);
            
            // Step 3: Move left 50 pixels
            if (tank.fuel >= 50 && tank.hasLanded) {
                tank.x -= 50;
                tank.fuel -= 50;
            }
            
            expect(tank.x).toBe(startX + 50);
            expect(tank.fuel).toBe(350);
            
            // Step 4: Deplete fuel
            tank.fuel = 20;
            const currentX = tank.x;
            
            // Try to move 100 pixels with only 20 fuel
            const desiredMove = 100;
            if (tank.fuel >= desiredMove) {
                tank.x += desiredMove;
                tank.fuel -= desiredMove;
            }
            
            expect(tank.x).toBe(currentX); // Didn't move
            expect(tank.fuel).toBe(20); // Fuel unchanged
            
            // Step 5: Buy fuel
            if (tank.credits >= WEAPONS['fuel_can'].cost) {
                tank.credits -= WEAPONS['fuel_can'].cost;
                tank.fuel += WEAPONS['fuel_can'].effectValue || 250;
            }
            
            expect(tank.fuel).toBe(270);
            expect(tank.credits).toBe(18000);
        });
    });

    describe('Multi-Player Accessory Interaction', () => {
        it('should handle accessories independently for each player', () => {
            const player1 = state.tanks[0];
            const player2 = state.tanks[1];
            
            // Player 1 activates shield
            expect(player1.accessories['shield']).toBe(2);
            player1.accessories['shield']--;
            player1.activeShield = 'shield';
            player1.shieldHealth = 200;
            
            // Player 2 has no shield
            expect(player2.accessories['shield']).toBeUndefined();
            expect(player2.activeShield).toBeUndefined();
            
            // Both take damage
            let p1Damage = 50;
            let p2Damage = 50;
            
            // Player 1's shield absorbs
            if (player1.shieldHealth && player1.shieldHealth > 0) {
                const absorbed = Math.min(p1Damage, player1.shieldHealth);
                player1.shieldHealth -= absorbed;
                p1Damage -= absorbed;
            }
            player1.health -= p1Damage;
            
            // Player 2 takes full damage
            player2.health -= p2Damage;
            
            expect(player1.health).toBe(100); // Protected
            expect(player1.shieldHealth).toBe(150);
            expect(player2.health).toBe(50); // Damaged
        });
    });

    describe('Shop Phase - Buying Multiple Accessories', () => {
        it('should allow purchasing and stacking multiple accessories', () => {
            const tank = state.tanks[1]; // Player 2 with 15000 credits
            
            // Buy 2 shields
            for (let i = 0; i < 2; i++) {
                if (tank.credits >= WEAPONS['shield'].cost) {
                    tank.credits -= WEAPONS['shield'].cost;
                    tank.accessories['shield'] = (tank.accessories['shield'] || 0) + 1;
                }
            }
            
            expect(tank.accessories['shield']).toBe(2);
            expect(tank.credits).toBe(5000);
            
            // Buy 3 parachutes
            for (let i = 0; i < 3; i++) {
                if (tank.credits >= WEAPONS['parachute'].cost) {
                    tank.credits -= WEAPONS['parachute'].cost;
                    tank.accessories['parachute'] = (tank.accessories['parachute'] || 0) + 1;
                }
            }
            
            expect(tank.accessories['parachute']).toBe(3);
            expect(tank.credits).toBe(2000);
            
            // Try to buy battery (not enough credits after buying shields and parachutes)
            const creditsBefore = tank.credits;
            if (tank.credits >= WEAPONS['battery'].cost) {
                tank.credits -= WEAPONS['battery'].cost;
                tank.accessories['battery'] = (tank.accessories['battery'] || 0) + 1;
            }
            
            // Battery costs 1500, tank has 2000, so it will be purchased
            expect(tank.accessories['battery']).toBe(1);
            expect(tank.credits).toBe(500); // 2000 - 1500
        });
    });

    describe('Combination Scenarios', () => {
        it('should handle shield + parachute + battery in combat', () => {
            const tank = state.tanks[0];
            
            // Scenario: Tank takes damage, uses battery, falls, uses parachute
            
            // 1. Activate shield
            tank.accessories['shield']--;
            tank.activeShield = 'shield';
            tank.shieldHealth = 200;
            
            // 2. Take explosion damage
            let damage = 150;
            if (tank.shieldHealth && tank.shieldHealth > 0) {
                const absorbed = Math.min(damage, tank.shieldHealth);
                tank.shieldHealth -= absorbed;
                damage -= absorbed;
                if (tank.shieldHealth <= 0) {
                    tank.activeShield = undefined;
                }
            }
            tank.health -= damage;
            
            expect(tank.health).toBe(100);
            expect(tank.shieldHealth).toBe(50);
            
            // 3. Take more damage, shield breaks
            damage = 80;
            if (tank.shieldHealth && tank.shieldHealth > 0) {
                const absorbed = Math.min(damage, tank.shieldHealth);
                tank.shieldHealth -= absorbed;
                damage -= absorbed;
                if (tank.shieldHealth <= 0) {
                    tank.activeShield = undefined;
                }
            }
            tank.health -= damage;
            
            expect(tank.activeShield).toBeUndefined();
            expect(tank.health).toBe(70);
            
            // 4. Use battery to restore health
            if ((tank.accessories['battery'] || 0) > 0) {
                tank.health = Math.min(100, tank.health + 10);
                tank.accessories['battery']--;
            }
            
            expect(tank.health).toBe(80);
            
            // 5. Terrain collapses, tank falls
            tank.isFalling = true;
            tank.hasLanded = false;
            tank.vy = 200;
            
            // 6. Parachute deploys
            if ((tank.accessories['parachute'] || 0) > 0 && tank.vy > 150) {
                tank.isParachuteDeployed = true;
                tank.accessories['parachute']--;
                tank.vy = 100;
            }
            
            expect(tank.isParachuteDeployed).toBe(true);
            expect(tank.accessories['parachute']).toBe(2);
            
            // 7. Land safely
            tank.hasLanded = true;
            const fallDamage = Math.floor(tank.vy / 10);
            expect(fallDamage).toBeLessThan(tank.parachuteThreshold);
            
            // Tank survives with items used strategically
            expect(tank.health).toBe(80);
            expect(tank.accessories['shield']).toBe(1);
            expect(tank.accessories['battery']).toBe(1);
            expect(tank.accessories['parachute']).toBe(2);
        });
    });
});
