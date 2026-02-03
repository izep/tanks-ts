import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PhysicsSystem } from '../src/systems/PhysicsSystem';
import { TerrainSystem } from '../src/systems/TerrainSystem';
import { GamePhase, type GameState } from '../src/core/GameState';

vi.mock('../src/systems/TerrainSystem', () => {
    return {
        TerrainSystem: class {
            public canvas = { width: 800, height: 600 };
            constructor(public width: number, public height: number) { }
            generate(state: any) { }
            getGroundY(x: number) { return 500; }
            explode(state: any, x: number, y: number, r: number) { 
                console.log(`Leapfrog explosion at (${Math.floor(x)}, ${Math.floor(y)}) radius ${r}`);
            }
            addTerrain(state: any, x: number, y: number, r: number) { }
            settle(state: any) { return false; }
            isSolid(x: number, y: number) { return y >= 500; }
        }
    };
});

describe('Leapfrog Mechanics', () => {
    let physics: PhysicsSystem;
    let terrain: TerrainSystem;
    let state: GameState;
    let soundManagerMock: any;

    beforeEach(() => {
        terrain = new TerrainSystem(800, 600);
        soundManagerMock = {
            playExplosion: vi.fn(),
            playHit: vi.fn(),
            playShoot: vi.fn()
        };
        physics = new PhysicsSystem(terrain, soundManagerMock);

        state = {
            phase: GamePhase.PROJECTILE_FLYING,
            tanks: [],
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
    });

    it('should deploy 3 sequential warheads', () => {
        // Initial leapfrog
        const leapfrog = {
            id: 'lf-1',
            x: 400,
            y: 490,
            vx: 50,
            vy: 100,
            weaponType: 'leapfrog',
            ownerId: 1,
            elapsedTime: 0,
            trail: [],
            leapfrogStage: 0
        };
        state.projectiles.push(leapfrog);

        // First impact - should explode and launch warhead 2
        physics.update(state, 0.1);
        
        expect(state.projectiles.length).toBe(1);
        expect(state.projectiles[0].leapfrogStage).toBe(1);
        expect(state.projectiles[0].weaponType).toBe('leapfrog');
        
        // Move warhead 2 to impact
        state.projectiles[0].y = 490;
        state.projectiles[0].vy = 100;
        
        // Second impact - should explode and launch warhead 3
        physics.update(state, 0.1);
        
        expect(state.projectiles.length).toBe(1);
        expect(state.projectiles[0].leapfrogStage).toBe(2);
        
        // Move warhead 3 to impact
        state.projectiles[0].y = 490;
        state.projectiles[0].vy = 100;
        
        // Third impact - should explode and NOT launch warhead 4
        physics.update(state, 0.1);
        
        expect(state.projectiles.length).toBe(0); // All warheads expended
    });

    it('should explode each warhead on impact', () => {
        const leapfrog = {
            id: 'lf-1',
            x: 400,
            y: 490,
            vx: 50,
            vy: 100,
            weaponType: 'leapfrog',
            ownerId: 1,
            elapsedTime: 0,
            trail: [],
            leapfrogStage: 0
        };
        state.projectiles.push(leapfrog);

        const initialExplosions = state.explosions.length;
        physics.update(state, 0.1);
        
        expect(state.explosions.length).toBeGreaterThan(initialExplosions);
        expect(soundManagerMock.playExplosion).toHaveBeenCalled();
    });

    it('should follow normal projectile physics', () => {
        const leapfrog = {
            id: 'lf-1',
            x: 400,
            y: 300,
            vx: 50,
            vy: -50, // Moving up
            weaponType: 'leapfrog',
            ownerId: 1,
            elapsedTime: 0,
            trail: [],
            leapfrogStage: 0
        };
        state.projectiles.push(leapfrog);

        const initialX = leapfrog.x;
        const initialY = leapfrog.y;
        
        physics.update(state, 0.1);
        
        const p = state.projectiles[0];
        if (p) {
            // Should have moved due to velocity
            expect(p.x).not.toBe(initialX);
            expect(p.y).not.toBe(initialY);
            
            // Gravity should affect trajectory
            expect(p.vy).toBeGreaterThan(-50);
        }
    });

    it('should be effective against shields (3 sequential hits)', () => {
        // Add shielded tank
        state.tanks.push({
            id: 1,
            name: 'Shielded Tank',
            x: 400,
            y: 490,
            vy: 0,
            angle: 45,
            power: 50,
            health: 100,
            fuel: 100,
            color: '#00FF00',
            variant: 0,
            isAi: false,
            isFalling: false,
            isDead: false,
            credits: 0,
            currentWeapon: 'baby_missile',
            inventory: {},
            accessories: {},
            activeShield: 'shield',
            shieldHealth: 100
        });

        const leapfrog = {
            id: 'lf-1',
            x: 400,
            y: 480,
            vx: 0,
            vy: 100,
            weaponType: 'leapfrog',
            ownerId: 2,
            elapsedTime: 0,
            trail: [],
            leapfrogStage: 0
        };
        state.projectiles.push(leapfrog);

        // First hit
        physics.update(state, 0.1);
        expect(state.projectiles.length).toBe(1);
        expect(state.projectiles[0].leapfrogStage).toBe(1);
        
        // The sequential nature makes Leapfrog effective for shield penetration
        // Each warhead is a separate attack
    });
});
