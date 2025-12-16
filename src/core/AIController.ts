import type { GameState, TankState } from './GameState';
import { TerrainSystem } from '../systems/TerrainSystem';

const AI_CONSTANTS = {
    // Targeting
    CYBORG_HEALTH_WEIGHT: 1.5,
    CYBORG_DISTANCE_WEIGHT: 0.5,
    CYBORG_WEALTH_WEIGHT: 0.2,
    MAX_SCREEN_WIDTH: 800,

    // Spoiler/Cyborg Shot Simulation
    SPOILER_ANGLE_STEP: 5,
    SPOILER_POWER_STEP: 25,
    SPOILER_SIMULATION_TIME: 5,

    // Tosser
    TOSSER_ADJUST_ANGLE: 2,
    TOSSER_ADJUST_POWER: 20,
    TOSSER_RANDOM_ANGLE: 4,
    TOSSER_RANDOM_POWER: 20,
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

export const AI_NAMES = [
    "Destroyer", "Terminator", "Annihilator", "Obliterator", "Devastator",
    "Eliminator", "Exterminator", "Crusher", "Smasher", "Wrecker",
    "Demolisher", "Ravager", "Conqueror", "Dominator", "Subjugator",
    "HAL 9000", "Skynet", "WOPR", "GLaDOS", "Ultron",
    "Megatron", "Decepticon", "Predator", "Reaper", "Nemesis"
];

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

        const weapon = this.chooseWeapon(tank, target);
        tank.currentWeapon = weapon;

        const shot = (() => {
            switch (this.actualPersonality) {
                case AIPersonality.MORON: return this.moronShot();
                case AIPersonality.SHOOTER: return this.shooterShot(tank, target);
                case AIPersonality.POOLSHARK: return this.poolsharkShot(tank, target);
                case AIPersonality.TOSSER: return this.tosserShot(tank, target);
                case AIPersonality.CHOOSER: return this.chooserShot(gameState, tank, target, terrain);
                case AIPersonality.SPOILER: return this.spoilerShot(gameState, tank, target, terrain);
                case AIPersonality.CYBORG: return this.cyborgShot(gameState, tank, target, terrain);
                default: return { angle: 45, power: 500 };
            }
        })();
        return { ...shot, weapon };
    }

    private chooseTarget(gameState: GameState, tankIndex: number): TankState | null {
        const tank = gameState.tanks[tankIndex];
        const enemies = gameState.tanks.filter((t, i) => i !== tankIndex && t.health > 0);

        if (enemies.length === 0) return null;

        if (this.actualPersonality === AIPersonality.CYBORG) {
            let bestTarget = enemies[0];
            let maxScore = -Infinity;

            for (const enemy of enemies) {
                let score = 0;
                // Score based on low health
                score += (100 - enemy.health) * AI_CONSTANTS.CYBORG_HEALTH_WEIGHT;

                // Score based on proximity (closer is better)
                const distance = Math.abs(enemy.x - tank.x);
                score += (AI_CONSTANTS.MAX_SCREEN_WIDTH - distance) * AI_CONSTANTS.CYBORG_DISTANCE_WEIGHT;

                // Score based on wealth (target richer players)
                if (enemy.credits > tank.credits) {
                    score += (enemy.credits - tank.credits) * AI_CONSTANTS.CYBORG_WEALTH_WEIGHT;
                }

                if (score > maxScore) {
                    maxScore = score;
                    bestTarget = enemy;
                }
            }
            return bestTarget;
        }

        // Default: Closest target
        return enemies.reduce((closest, current) => {
            const distToClosest = Math.abs(closest.x - tank.x);
            const distToCurrent = Math.abs(current.x - tank.x);
            return distToCurrent < distToClosest ? current : closest;
        });
    }

    private moronShot(): { angle: number, power: number } {
        return {
            angle: Math.floor(Math.random() * 140) + 20,
            power: Math.floor(Math.random() * 700) + 200
        };
    }

    private shooterShot(tank: TankState, target: TankState): { angle: number, power: number } {
        const dx = target.x - tank.x;
        const dy = target.y - tank.y; // Y grows down

        let angle = 90;
        if (dx !== 0) {
            // angle in rads
            const angleRad = Math.atan2(-dy, Math.abs(dx));
            angle = angleRad * (180 / Math.PI);
        }

        angle = Math.max(0, Math.min(180, Math.floor(angle)));

        if (dx < 0) {
            angle = 180 - angle;
        }

        const dist = Math.sqrt(dx * dx + dy * dy);
        let power = Math.floor(dist * 1.2);
        power = Math.max(100, Math.min(1000, power));

        return { angle, power };
    }

    private poolsharkShot(tank: TankState, target: TankState) {
        // Poolshark requires rebounding walls, which are not implemented.
        // Falling back to shooter logic.
        return this.shooterShot(tank, target);
    }

    private tosserShot(tank: TankState, target: TankState) {
        if (this.lastShotAngle === null || this.lastShotPower === null) {
            // First shot is random
            this.lastShotAngle = Math.floor(Math.random() * 120) + 30;
            this.lastShotPower = Math.floor(Math.random() * 400) + 400;
        } else if (tank.lastShotImpact) {
            const dx = target.x - tank.lastShotImpact.x;
            const dy = target.y - tank.lastShotImpact.y;

            // Simple adjustment: if we missed by dx, adjust angle and power
            // This is a highly simplified feedback loop
            if (Math.abs(dx) > 10) { // If horizontal miss is significant
                this.lastShotAngle += (dx > 0 ? -AI_CONSTANTS.TOSSER_ADJUST_ANGLE : AI_CONSTANTS.TOSSER_ADJUST_ANGLE);
            }
            if (dy > 10) { // If we fell short
                this.lastShotPower += AI_CONSTANTS.TOSSER_ADJUST_POWER;
            } else if (dy < -10) { // If we overshot
                this.lastShotPower -= AI_CONSTANTS.TOSSER_ADJUST_POWER;
            }

            // Add some randomness to avoid getting stuck
            this.lastShotAngle += Math.floor(Math.random() * AI_CONSTANTS.TOSSER_RANDOM_ANGLE) - (AI_CONSTANTS.TOSSER_RANDOM_ANGLE / 2);
            this.lastShotPower += Math.floor(Math.random() * AI_CONSTANTS.TOSSER_RANDOM_POWER) - (AI_CONSTANTS.TOSSER_RANDOM_POWER / 2);
        }

        // Clamp values
        this.lastShotAngle = Math.max(10, Math.min(170, this.lastShotAngle || 90));
        this.lastShotPower = Math.max(100, Math.min(1000, this.lastShotPower || 500));

        return { angle: this.lastShotAngle, power: this.lastShotPower };
    }

    private chooserShot(gameState: GameState, tank: TankState, target: TankState, terrain: TerrainSystem) {
        const dx = Math.abs(target.x - tank.x);
        const dy = Math.abs(target.y - tank.y);

        if (dy < 50 && dx < 300) {
            return this.shooterShot(tank, target);
        }
        return this.spoilerShot(gameState, tank, target, terrain);
    }

    private spoilerShot(gameState: GameState, tank: TankState, target: TankState, terrain: TerrainSystem): { angle: number, power: number } {
        const g = gameState.gravity;
        const wind = gameState.wind;
        const dt = 1 / 60; // simulation time step

        let bestShot = { angle: 45, power: 500, error: Infinity };

        for (let angle = 10; angle < 170; angle += AI_CONSTANTS.SPOILER_ANGLE_STEP) {
            for (let power = 100; power < 1000; power += AI_CONSTANTS.SPOILER_POWER_STEP) {
                const rad = angle * (Math.PI / 180);
                const speed = power * 0.5;
                let vx = speed * Math.cos(rad);
                let vy = -speed * Math.sin(rad);

                // No need to manually flip vx, angle iteration from 10-170 covers all directions

                let x = tank.x;
                let y = tank.y - 10; // Muzzle position

                let closestDist = Infinity;
                let pathClear = true;

                for (let t = 0; t < AI_CONSTANTS.SPOILER_SIMULATION_TIME; t += dt) {
                    // Simplified physics update
                    vx += wind * dt;
                    vy += g * dt;
                    x += vx * dt;
                    y += vy * dt;

                    if (terrain.isSolid(x, y)) {
                        pathClear = false;
                        break;
                    }

                    const dist = Math.sqrt(Math.pow(target.x - x, 2) + Math.pow(target.y - y, 2));

                    if (dist < closestDist) {
                        closestDist = dist;
                    }

                    if (y > 600) break; // Fell off screen
                }

                if (pathClear && closestDist < bestShot.error) {
                    bestShot = { angle, power, error: closestDist };
                }
            }
        }

        return { angle: bestShot.angle, power: bestShot.power };
    }

    private cyborgShot(gameState: GameState, tank: TankState, target: TankState, terrain: TerrainSystem) {
        return this.spoilerShot(gameState, tank, target, terrain);
    }

    private chooseWeapon(tank: TankState, target: TankState): string {
        const distance = Math.abs(target.x - tank.x);

        // Simple logic: use bigger weapons for more distant targets
        if (distance > 400 && tank.inventory['nuke']) {
            return 'nuke';
        } else if (distance > 200 && tank.inventory['missile']) {
            return 'missile';
        }

        return 'baby_missile';
    }

    public makePurchases(tank: TankState): { [itemId: string]: number } {
        const purchases: { [itemId: string]: number } = {};
        let credits = tank.credits;

        switch (this.actualPersonality) {
            case AIPersonality.MORON:
                // Moron buys randomly
                if (Math.random() > 0.5 && credits >= 1875) {
                    purchases['missile'] = (purchases['missile'] || 0) + 1;
                    credits -= 1875;
                }
                break;
            case AIPersonality.SHOOTER:
                // Shooter prioritizes offense
                if (credits >= 10000 && !tank.inventory['baby_nuke']) {
                    purchases['baby_nuke'] = (purchases['baby_nuke'] || 0) + 1;
                    credits -= 10000;
                }
                break;
            case AIPersonality.CYBORG:
                // Cyborg buys strategically
                if ((tank.accessories['shield'] || 0) < 2 && credits >= 5000) {
                    purchases['shield'] = (purchases['shield'] || 0) + 1;
                    credits -= 5000;
                }
                if (tank.fuel < 100 && credits >= 1000) {
                    purchases['fuel_can'] = (purchases['fuel_can'] || 0) + 1;
                    credits -= 1000;
                }
                break;
        }

        return purchases;
    }
}
