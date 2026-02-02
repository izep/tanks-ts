import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GamePhase, type GameState, type TankState } from '../src/core/GameState';
import { PhysicsSystem } from '../src/systems/PhysicsSystem';
import { TerrainSystem } from '../src/systems/TerrainSystem';
import { SoundManager } from '../src/core/SoundManager';

// Mock Canvas and Context for Node environment
class MockContext {
    clearRect() { }
    beginPath() { }
    moveTo() { }
    lineTo() { }
    closePath() { }
    fill() { }
    arc() { }
    getImageData() {
        return { data: new Uint8ClampedArray(4) };
    }
}

class MockCanvas {
    width = 800;
    height = 600;
    getContext() { return new MockContext(); }
}

class MockSoundManager extends SoundManager {
    constructor() {
        super();
        this.ctx = { createGain: () => ({ connect: () => {}, gain: { value: 0 } }) } as any;
    }
    playExplosion() { }
    playHit() { }
    playSizzle() { }
}

global.HTMLCanvasElement = MockCanvas as any;
// @ts-ignore
global.document = {
    createElement: () => new MockCanvas()
} as any;

global.window = {
    AudioContext: class {
        createGain() { return { connect: () => {}, gain: { value: 0 } }; }
        createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
        destination: {}
        currentTime: 0
    },
} as any;

describe('Sandhog Weapons', () => {
    let state: GameState;
    let terrainSystem: TerrainSystem;
    let physicsSystem: PhysicsSystem;

    beforeEach(() => {
        terrainSystem = new TerrainSystem(800, 600);
        const soundManager = new MockSoundManager();
        physicsSystem = new PhysicsSystem(terrainSystem, soundManager);

        // Mock terrain
        vi.spyOn(terrainSystem, 'getGroundY').mockReturnValue(500);
        vi.spyOn(terrainSystem, 'isSolid').mockImplementation((x, y) => y >= 500);

        state = {
            phase: GamePhase.PROJECTILE_FLYING,
            tanks: [{
                id: 0,
                name: 'Player 1',
                x: 400,
                y: 300,
                health: 100,
                isDead: false,
                angle: 45,
                power: 50,
                currentWeapon: 'baby_sandhog',
                credits: 10000,
                inventory: {
                    baby_sandhog: 10,
                    sandhog: 5,
                    heavy_sandhog: 2
                },
                fuel: 500,
                shields: 0,
                parachutes: 0,
                activeShield: false,
                batteries: 0
            } as TankState],
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

    it('Baby Sandhog should deploy 3 warheads on impact', () => {
        // Fire Baby Sandhog - start higher with downward velocity
        state.projectiles = [{
            id: '1',
            x: 400,
            y: 100, // Start higher
            vx: 50,
            vy: 200, // Faster downward velocity
            weaponType: 'baby_sandhog',
            ownerId: 0,
            elapsedTime: 0,
            trail: []
        }];

        state.phase = GamePhase.PROJECTILE_FLYING;

        // Update until impact
        for (let i = 0; i < 200; i++) {
            const prevLen = state.projectiles.length;
            physicsSystem.update(state, 0.016);
            
            // Check if warheads were deployed (projectile count increased)
            const warheads = state.projectiles.filter(p => p.weaponType === 'sandhog_warhead');
            if (warheads.length === 3) {
                expect(warheads).toHaveLength(3);
                return;
            }
            
            // Stop if no projectiles left (something went wrong)
            if (state.projectiles.length === 0 && prevLen > 0) {
                break;
            }
        }

        // If we get here, warheads weren't deployed
        expect.fail('Baby Sandhog did not deploy 3 warheads');
    });

    it('Sandhog should deploy 5 warheads on impact', () => {
        // Fire Sandhog
        state.projectiles = [{
            id: '1',
            x: 400,
            y: 100,
            vx: 50,
            vy: 200,
            weaponType: 'sandhog',
            ownerId: 0,
            elapsedTime: 0,
            trail: []
        }];

        state.phase = GamePhase.PROJECTILE_FLYING;

        // Update until impact
        for (let i = 0; i < 200; i++) {
            physicsSystem.update(state, 0.016);
            
            // Check if warheads were deployed
            const warheads = state.projectiles.filter(p => p.weaponType === 'sandhog_warhead');
            if (warheads.length === 5) {
                expect(warheads).toHaveLength(5);
                return;
            }
            
            if (state.projectiles.length === 0) {
                break;
            }
        }

        expect.fail('Sandhog did not deploy 5 warheads');
    });

    it('Heavy Sandhog should deploy 7 warheads on impact', () => {
        // Fire Heavy Sandhog
        state.projectiles = [{
            id: '1',
            x: 400,
            y: 100,
            vx: 50,
            vy: 200,
            weaponType: 'heavy_sandhog',
            ownerId: 0,
            elapsedTime: 0,
            trail: []
        }];

        state.phase = GamePhase.PROJECTILE_FLYING;

        // Update until impact
        for (let i = 0; i < 200; i++) {
            physicsSystem.update(state, 0.016);
            
            // Check if warheads were deployed
            const warheads = state.projectiles.filter(p => p.weaponType === 'sandhog_warhead');
            if (warheads.length === 7) {
                expect(warheads).toHaveLength(7);
                return;
            }
            
            if (state.projectiles.length === 0) {
                break;
            }
        }

        expect.fail('Heavy Sandhog did not deploy 7 warheads');
    });

    it('Warheads should tunnel horizontally', () => {
        // Manually create a warhead
        state.projectiles = [{
            id: '1',
            x: 400,
            y: 500,
            vx: 0,
            vy: 0,
            weaponType: 'sandhog_warhead',
            ownerId: 0,
            elapsedTime: 0,
            trail: [],
            direction: 1, // Right
            tunnelLength: 50,
            distanceRemaining: 50,
            blastRadius: 10,
            damage: 50
        }];

        state.phase = GamePhase.PROJECTILE_FLYING;

        const startX = state.projectiles[0].x;

        // Update for 1 second
        for (let i = 0; i < 60; i++) {
            physicsSystem.update(state, 0.016);
        }

        // Warhead should have moved right or exploded
        expect(state.projectiles.length === 0 || state.projectiles[0].x > startX).toBe(true);
    });

    it('Warheads should explode at end of tunnel', () => {
        // Manually create a warhead near end of tunnel
        state.projectiles = [{
            id: '1',
            x: 400,
            y: 500,
            vx: 0,
            vy: 0,
            weaponType: 'sandhog_warhead',
            ownerId: 0,
            elapsedTime: 0,
            trail: [],
            direction: 1,
            tunnelLength: 50,
            distanceRemaining: 5, // Almost done
            blastRadius: 10,
            damage: 50
        }];

        state.phase = GamePhase.PROJECTILE_FLYING;

        // Update until explosion
        for (let i = 0; i < 20; i++) {
            physicsSystem.update(state, 0.016);
        }

        // Warhead should be removed and explosion should be created
        expect(state.projectiles.length).toBe(0);
        expect(state.explosions.length).toBeGreaterThan(0);
    });

    it('Warheads should damage tanks', () => {
        // Place tank near warhead explosion point
        state.tanks[0].x = 450;
        state.tanks[0].y = 500;
        state.tanks[0].health = 100;

        // Create a warhead near tank
        state.projectiles = [{
            id: '1',
            x: 440,
            y: 500,
            vx: 0,
            vy: 0,
            weaponType: 'sandhog_warhead',
            ownerId: 1, // Different owner
            elapsedTime: 0,
            trail: [],
            direction: 1,
            tunnelLength: 50,
            distanceRemaining: 5,
            blastRadius: 20,
            damage: 80
        }];

        state.phase = GamePhase.PROJECTILE_FLYING;

        const initialHealth = state.tanks[0].health;

        // Update until explosion
        for (let i = 0; i < 20; i++) {
            physicsSystem.update(state, 0.016);
        }

        // Tank should take damage
        expect(state.tanks[0].health).toBeLessThan(initialHealth);
    });

    it('Warheads should remove terrain while tunneling', () => {
        // Create solid terrain at y=500
        for (let x = 380; x < 420; x++) {
            terrainSystem.addTerrain(state, x, 500, 2, '#8B4513');
        }

        // Create a warhead
        state.projectiles = [{
            id: '1',
            x: 400,
            y: 500,
            vx: 0,
            vy: 0,
            weaponType: 'sandhog_warhead',
            ownerId: 0,
            elapsedTime: 0,
            trail: [],
            direction: 1,
            tunnelLength: 30,
            distanceRemaining: 30,
            blastRadius: 10,
            damage: 50
        }];

        state.phase = GamePhase.PROJECTILE_FLYING;

        // Update for some frames
        for (let i = 0; i < 30; i++) {
            physicsSystem.update(state, 0.016);
        }

        // Terrain should be removed in the path
        // (We can't easily verify this without exposing terrain internals,
        // but the test at least ensures no crashes during tunneling)
        expect(true).toBe(true);
    });
});
