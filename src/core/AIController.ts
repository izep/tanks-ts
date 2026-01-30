import type { GameState, TankState } from './GameState';
import { TerrainSystem } from '../systems/TerrainSystem';
import { CONSTANTS } from './GameState';

const AI_CONSTANTS = {
    MAX_SCREEN_WIDTH: 800,
    MAX_POWER: 1000,
    SIMULATION_STEP: 1 / 60, // Physics step
    SIMULATION_MAX_TIME: 10, // Max flight time to simulate
};

export const AIPersonality = {
    MORON: 'MORON',
    SHOOTER: 'SHOOTER',
    POOLSHARK: 'POOLSHARK',
    TOSSER: 'TOSSER',
    CHOOSER: 'CHOOSER',
    SPOILER: 'SPOILER',
    CYBORG: 'CYBORG',
    UNKNOWN: 'UNKNOWN'
} as const;

export type AIPersonality = typeof AIPersonality[keyof typeof AIPersonality];

export class AIController {
    public personality: AIPersonality;
    private actualPersonality: AIPersonality;

    // Tosser learning
    private lastShotAngle: number | null = null;
    private lastShotPower: number | null = null;

    constructor(personality: AIPersonality) {
        this.personality = personality;
        this.actualPersonality = personality;

        if (personality === AIPersonality.UNKNOWN) {
            const keys = Object.values(AIPersonality).filter(p => p !== AIPersonality.UNKNOWN);
            this.actualPersonality = keys[Math.floor(Math.random() * keys.length)];
        }
    }

    public decideShot(gameState: GameState, tankIndex: number, terrain: TerrainSystem): { angle: number, power: number, weapon: string } {
        const tank = gameState.tanks[tankIndex];
        const target = this.chooseTarget(gameState, tankIndex);

        if (!target) {
            return {
                angle: Math.floor(Math.random() * 120) + 30,
                power: Math.floor(Math.random() * 500) + 300,
                weapon: 'baby_missile'
            };
        }

        // Default weapon selection
        const weapon = this.chooseWeapon(tank, target);
        tank.currentWeapon = weapon;

        // Execute Strategy
        let shot = { angle: 45, power: 500 };
        switch (this.actualPersonality) {
            case AIPersonality.MORON: 
                shot = this.moronShot(); break;
            case AIPersonality.SHOOTER: 
                shot = this.shooterShot(gameState, tank, target, terrain); break;
            case AIPersonality.POOLSHARK: 
                shot = this.poolsharkShot(gameState, tank, target, terrain); break;
            case AIPersonality.TOSSER: 
                shot = this.tosserShot(tank, target); break;
            case AIPersonality.CHOOSER: 
                shot = this.chooserShot(gameState, tank, target, terrain); break;
            case AIPersonality.SPOILER: 
                shot = this.spoilerShot(gameState, tank, target, terrain); break;
            case AIPersonality.CYBORG: 
                shot = this.cyborgShot(gameState, tank, target, terrain); break;
        }

        // Apply randomness based on difficulty (could be added later)
        // Ensure bounds
        shot.angle = Math.max(0, Math.min(180, shot.angle));
        shot.power = Math.max(0, Math.min(1000, shot.power));

        // Save for Tosser learning
        this.lastShotAngle = shot.angle;
        this.lastShotPower = shot.power;

        return { ...shot, weapon };
    }

    private chooseTarget(gameState: GameState, tankIndex: number): TankState | null {
        const tank = gameState.tanks[tankIndex];
        const enemies = gameState.tanks.filter((t, i) => i !== tankIndex && t.health > 0);
        if (enemies.length === 0) return null;

        if (this.actualPersonality === AIPersonality.CYBORG) {
            // Prioritize weakest or richest
            return enemies.reduce((prev, curr) => {
                const prevScore = (100 - prev.health) + (prev.credits / 100);
                const currScore = (100 - curr.health) + (curr.credits / 100);
                return currScore > prevScore ? curr : prev;
            });
        }
        
        // Default: Closest
        return enemies.reduce((closest, current) => {
            const d1 = Math.abs(closest.x - tank.x);
            const d2 = Math.abs(current.x - tank.x);
            return d2 < d1 ? current : closest;
        });
    }

    // --- Strategies ---

    private moronShot(): { angle: number, power: number } {
        return {
            angle: Math.floor(Math.random() * 180),
            power: Math.floor(Math.random() * 1000)
        };
    }

    private shooterShot(state: GameState, tank: TankState, target: TankState, terrain: TerrainSystem): { angle: number, power: number } {
        // Try direct line of sight (low angle)
        const solution = this.solveTrajectory(state, tank, target, terrain, {
            minAngle: 0,
            maxAngle: 180,
            angleStep: 2,
            preferLowArc: true // Heuristic to pick lower angle if multiple solutions
        });
        
        if (solution) return solution;
        return this.moronShot(); // Fallback
    }

    private poolsharkShot(state: GameState, tank: TankState, target: TankState, terrain: TerrainSystem): { angle: number, power: number } {
        // Check if rebound is possible
        if (state.borderMode === 'bounce') {
            // Try standard shot first
            let solution = this.solveTrajectory(state, tank, target, terrain);
            if (solution) return solution;

            // Try Virtual Targets (Mirror)
            // Left Wall Mirror
            const virtualLeft = { ...target, x: -target.x };
            // Right Wall Mirror
            const virtualRight = { ...target, x: CONSTANTS.SCREEN_WIDTH + (CONSTANTS.SCREEN_WIDTH - target.x) };

            const sLeft = this.solveTrajectory(state, tank, virtualLeft, terrain);
            if (sLeft) return sLeft;

            const sRight = this.solveTrajectory(state, tank, virtualRight, terrain);
            if (sRight) return sRight;
        }

        return this.shooterShot(state, tank, target, terrain);
    }

    private tosserShot(tank: TankState, target: TankState): { angle: number, power: number } {
        // Init if null
        if (this.lastShotAngle === null || this.lastShotPower === null) {
            return this.moronShot();
        }

        // Adjust based on last miss
        if (tank.lastShotImpact) {
            const impact = tank.lastShotImpact;
            // Simple heuristic: adjust power for distance
            const distError = Math.abs(target.x - tank.x) - Math.abs(impact.x - tank.x);
            
            if (distError > 0) this.lastShotPower += 50;
            else this.lastShotPower -= 50;

            // Random jitter
            this.lastShotPower += (Math.random() - 0.5) * 20;
            this.lastShotAngle += (Math.random() - 0.5) * 5;
        }

        return { angle: this.lastShotAngle!, power: this.lastShotPower! };
    }

    private chooserShot(state: GameState, tank: TankState, target: TankState, terrain: TerrainSystem): { angle: number, power: number } {
        // Tries to pick the "safest" shot (high arc usually avoids obstacles)
        return this.spoilerShot(state, tank, target, terrain);
    }

    private spoilerShot(state: GameState, tank: TankState, target: TankState, terrain: TerrainSystem): { angle: number, power: number } {
        // Finds the BEST shot (closest to target)
        // Search high arcs first (usually better for bypassing terrain)
        const solution = this.solveTrajectory(state, tank, target, terrain, {
            minAngle: 0,
            maxAngle: 180,
            angleStep: 2,
            preferLowArc: false
        });

        if (solution) return solution;
        return this.moronShot();
    }

    private cyborgShot(state: GameState, tank: TankState, target: TankState, terrain: TerrainSystem): { angle: number, power: number } {
        // Same as spoiler but perfect aim
        return this.spoilerShot(state, tank, target, terrain);
    }

    // --- Core Solver ---

    /**
     * Tries to find an Angle/Power combination to hit the target.
     * Iterates angles and binary searches power.
     */
    private solveTrajectory(
        state: GameState, 
        tank: TankState, 
        target: TankState, 
        terrain: TerrainSystem,
        opts: { minAngle: number, maxAngle: number, angleStep: number, preferLowArc?: boolean } = { minAngle: 0, maxAngle: 180, angleStep: 5 }
    ): { angle: number, power: number } | null {

        const { gravity, wind } = state;
        const startX = tank.x;
        const startY = tank.y - 15; // Muzzle
        
        // Determine angle range based on target direction relative to tank
        // If target is Right, we want 0-90. If Left, 90-180.
        // Although wind can blow back, generally we aim towards target.
        // Let's sweep all valid angles just in case.

        const angles: number[] = [];
        for (let a = opts.minAngle; a <= opts.maxAngle; a += opts.angleStep) angles.push(a);

        // Heuristic sorting of angles
        if (opts.preferLowArc) {
            // Sort by deviation from direct line? Or just use as is.
        } else {
            // Prefer high arc (closer to 90) to go over mountains
            angles.sort((a, b) => Math.abs(a - 90) - Math.abs(b - 90));
        }

        for (const angle of angles) {
            // Binary Search for Power [100, 1000]
            let low = 100;
            let high = 1000;
            // We do a few iterations of binary search to find exact power for this angle
            for (let i = 0; i < 8; i++) {
                const power = (low + high) / 2;
                const result = this.simulateShot(startX, startY, angle, power, gravity, wind, terrain, target, state.borderMode);

                if (result.hitTarget) {
                    // Valid shot found!
                    // Optimization: We could return immediately, or try to find "best" center hit.
                    // For now, return first valid hit.
                    return { angle, power }; 
                }

                if (result.overshot) {
                    high = power;
                } else {
                    low = power;
                }
            }
        }

        return null;
    }

    private simulateShot(
        x0: number, y0: number, 
        angleDeg: number, power: number, 
        gravity: number, wind: number, 
        terrain: TerrainSystem,
        target: TankState,
        borderMode?: string
    ): { hitTarget: boolean, overshot: boolean, hitTerrain: boolean } {
        
        const rad = angleDeg * (Math.PI / 180);
        const speed = power * 0.5;
        let vx = Math.cos(rad) * speed;
        let vy = -Math.sin(rad) * speed;
        let x = x0;
        let y = y0;

        const dt = AI_CONSTANTS.SIMULATION_STEP;
        const targetRadius = 20; // Hitbox

        // Wrap handling helper
        const handleWrap = () => {
             if (x < 0) x += CONSTANTS.SCREEN_WIDTH;
             else if (x > CONSTANTS.SCREEN_WIDTH) x -= CONSTANTS.SCREEN_WIDTH;
        };

        // Determine "Forward" direction towards target for Overshot calculation
        // This is tricky with wind. Simple heuristic: if we pass target X.
        const direction = target.x > x0 ? 1 : -1;

        for (let t = 0; t < AI_CONSTANTS.SIMULATION_MAX_TIME; t += dt) {
            // Physics Step
            vx += wind * dt * 6; // Matching PhysicsSystem factors
            vy += gravity * dt * 10;
            x += vx * dt;
            y += vy * dt;

            // Border Logic
            if (borderMode === 'wrap') handleWrap();
            if (borderMode === 'bounce') {
                if (x < 0 || x > CONSTANTS.SCREEN_WIDTH) {
                     vx = -vx * 0.8;
                     x = Math.max(0, Math.min(CONSTANTS.SCREEN_WIDTH, x));
                }
            }
            if (borderMode === 'concrete' || borderMode === 'normal') {
                if (x < 0 || x > CONSTANTS.SCREEN_WIDTH) return { hitTarget: false, overshot: true, hitTerrain: false }; // Wall hit
            }

            // Check Hit Target
            const dx = x - target.x;
            const dy = y - (target.y - 10);
            if (dx*dx + dy*dy < targetRadius*targetRadius) {
                return { hitTarget: true, overshot: false, hitTerrain: false };
            }

            // Check Terrain
            if (terrain.isSolid(x, y)) {
                return { hitTarget: false, overshot: false, hitTerrain: true };
            }
            
            // Check Ground
            if (y > CONSTANTS.SCREEN_HEIGHT) {
                // Ground Hit
                 return { hitTarget: false, overshot: false, hitTerrain: true };
            }
        }

        // Time out - check if we passed the target (Overshot)
        // If direction is Right (1) and x > target.x, we overshot.
        const finalDist = (x - target.x) * direction;
        return { hitTarget: false, overshot: finalDist > 0, hitTerrain: false };
    }

    private chooseWeapon(tank: TankState, target: TankState): string {
        // Use inventory logic
        const dist = Math.abs(target.x - tank.x);
        
        if (dist > 400 && tank.inventory['nuke'] && tank.inventory['nuke'] > 0) return 'nuke';
        if (tank.inventory['mirv'] && tank.inventory['mirv'] > 0) return 'mirv';
        if (tank.inventory['missile'] && tank.inventory['missile'] > 0) return 'missile';
        
        return 'baby_missile';
    }
    
    public makePurchases(tank: TankState): { [itemId: string]: number } {
        // Keep simple purchasing logic
        const purchases: { [itemId: string]: number } = {};
        if (tank.credits > 2000) purchases['missile'] = 5;
        if (tank.credits > 10000) purchases['nuke'] = 1;
        return purchases;
    }
}