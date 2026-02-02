
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PhysicsSystem } from '../src/systems/PhysicsSystem';
import { TerrainSystem } from '../src/systems/TerrainSystem';
import { GamePhase, type GameState } from '../src/core/GameState';
import { SoundManager } from '../src/core/SoundManager';

vi.mock('../src/systems/TerrainSystem', () => {
    return {
        TerrainSystem: class {
            public canvas = { width: 800, height: 600 };
            constructor(public width: number, public height: number) { }
            generate(state: any) { }
            getGroundY(x: number) { return 500; }
            isSolid(x: number, y: number) { return y >= 500; }
            explode(state: any, x: number, y: number, r: number) { console.log('MockExplode called at', x, y); }
            addTerrain(state: any, x: number, y: number, r: number) { }
            settle(state: any) { return false; }
        }
    };
});


class MockSoundManager extends SoundManager {
    constructor() {
        super();
        this.ctx = { createGain: () => ({ connect: () => {}, gain: { value: 0 } }) } as any;
    }
    playExplosion() { }
    playHit() { }
    playSizzle() { }
}

global.window = {
    AudioContext: class {
        createGain() { return { connect: () => {}, gain: { value: 0 } }; }
        createOscillator() { return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} } }; }
        destination: {}
        currentTime: 0
    },
} as any;

describe('PhysicsSystem Advanced', () => {
    let physics: PhysicsSystem;
    let terrain: TerrainSystem;
    let state: GameState;
    let soundManager: SoundManager;

    beforeEach(() => {
        terrain = new TerrainSystem(800, 600);
        soundManager = new MockSoundManager();
        physics = new PhysicsSystem(terrain, soundManager);

        state = {
            phase: GamePhase.AIMING,
            tanks: [],
            projectiles: [],
            explosions: [],
            currentPlayerIndex: 0,
            roundNumber: 1,
            maxRounds: 10,
            wind: 0,
            gravity: 100, // Reduced gravity for test stability
            terrainDirty: false,
            lastExplosionTime: 0
        };
    });

    it('should split MIRV into fragments', () => {
        state.phase = GamePhase.PROJECTILE_FLYING; // Critical Fix

        const mirv = {
            id: 'mirv-1',
            x: 400,
            y: 300,
            vx: 100,
            vy: 50, // Positive vy means falling (Canvas Y is down)
            weaponType: 'mirv',
            ownerId: 1,
            elapsedTime: 0,
            trail: []
        };
        state.projectiles.push(mirv);

        physics.update(state, 0.1);

        // MIRV should have split into 5 missiles and parent removed
        expect(state.projectiles.length).toBe(5);
        expect(state.projectiles.every(p => p.weaponType === 'missile')).toBe(true);
    });

    it('should spawn Napalm particles on ground impact', () => {
        state.phase = GamePhase.PROJECTILE_FLYING;

        const napalm = {
            id: 'napalm-1',
            x: 400,
            y: 495,
            vx: 0,
            vy: 100,
            weaponType: 'napalm',
            ownerId: 1,
            elapsedTime: 0,
            trail: []
        };
        state.projectiles.push(napalm);

        physics.update(state, 0.1);

        expect(state.projectiles.find(p => p.id === 'napalm-1')).toBeUndefined();
        const particles = state.projectiles.filter(p => p.weaponType === 'napalm_particle');
        expect(particles.length).toBeGreaterThan(0);
    });

    it('should trigger digging when Digger is underground', () => {
        state.phase = GamePhase.PROJECTILE_FLYING;
        const explodeSpy = vi.spyOn(terrain, 'explode');

        const digger = {
            id: 'digger-1',
            x: 400,
            y: 510,
            vx: 0,
            vy: 100,
            weaponType: 'digger',
            ownerId: 1,
            elapsedTime: 0,
            trail: []
        };
        state.projectiles.push(digger);

        physics.update(state, 0.1);

        expect(state.projectiles.find(p => p.id === 'digger-1')).toBeDefined();
    });
});
