import type { GameState, TankState } from './GameState';

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

    public decideShot(gameState: GameState, tankIndex: number): { angle: number, power: number } {
        const tank = gameState.tanks[tankIndex];
        const target = this.chooseTarget(gameState, tankIndex);

        if (!target) {
            return {
                angle: Math.floor(Math.random() * 120) + 30,
                power: Math.floor(Math.random() * 500) + 300
            };
        }

        switch (this.actualPersonality) {
            case AIPersonality.MORON: return this.moronShot();
            case AIPersonality.SHOOTER: return this.shooterShot(tank, target);
            case AIPersonality.POOLSHARK: return this.poolsharkShot(tank, target); // Fallback to shooter for now
            case AIPersonality.TOSSER: return this.tosserShot(); // Need feedback loop for true Tosser, simplifying for now
            case AIPersonality.CHOOSER: return this.chooserShot(gameState, tank, target);
            case AIPersonality.SPOILER: return this.spoilerShot(gameState, tank, target);
            case AIPersonality.CYBORG: return this.cyborgShot(gameState, tank, target);
            default: return { angle: 45, power: 500 };
        }
    }

    private chooseTarget(gameState: GameState, tankIndex: number): TankState | null {
        const tank = gameState.tanks[tankIndex];
        const enemies = gameState.tanks.filter((t, i) => i !== tankIndex && t.health > 0);

        if (enemies.length === 0) return null;

        if (this.actualPersonality === AIPersonality.CYBORG) {
            // Weakest
            let weakest = enemies[0];
            for (const e of enemies) if (e.health < weakest.health) weakest = e;
            if (weakest.health < 50) return weakest;

            // Richest (simplified as credits not fully tracking logic yet? or rely on state)
            let richest = enemies[0];
            for (const e of enemies) if (e.credits > richest.credits) richest = e;
            if (richest.credits > tank.credits + 500) return richest;
        }

        // Closest
        let closest = enemies[0];
        let minDesc = Infinity;
        enemies.forEach(e => {
            const dist = Math.abs(e.x - tank.x);
            if (dist < minDesc) {
                minDesc = dist;
                closest = e;
            }
        });
        return closest;
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
        return this.shooterShot(tank, target);
    }

    private tosserShot() {
        if (this.lastShotAngle === null || this.lastShotPower === null) {
            this.lastShotAngle = Math.floor(Math.random() * 120) + 30;
            this.lastShotPower = Math.floor(Math.random() * 400) + 400;
        } else {
            // Random walk
            this.lastShotAngle += Math.floor(Math.random() * 10) - 5;
            this.lastShotPower += Math.floor(Math.random() * 100) - 50;
            this.lastShotAngle = Math.max(10, Math.min(170, this.lastShotAngle));
            this.lastShotPower = Math.max(100, Math.min(1000, this.lastShotPower));
        }
        return { angle: this.lastShotAngle, power: this.lastShotPower };
    }

    private chooserShot(gameState: GameState, tank: TankState, target: TankState) {
        const dx = Math.abs(target.x - tank.x);
        const dy = Math.abs(target.y - tank.y);

        if (dy < 50 && dx < 300) {
            return this.shooterShot(tank, target);
        }
        return this.spoilerShot(gameState, tank, target);
    }

    private spoilerShot(gameState: GameState, tank: TankState, target: TankState): { angle: number, power: number } {
        const dx = target.x - tank.x;
        const dy = (target.y - 10) - (tank.y - 10); // Target center roughly

        // Use gravity from state
        // Physics system: vy += state.gravity * dt * 10. state.gravity is 9.8 (or 98 in TS CONSTANTS).
        // If CONSTANTS.GRAVITY = 98, then g ~ 98.
        const g = gameState.gravity;

        // Iterate angles to find best V
        let bestAngle = 45;
        let bestPower = 500;
        let bestError = Infinity;

        for (let angle = 20; angle < 160; angle += 5) {
            const rad = angle * (Math.PI / 180);

            // v^2 = (g * dx^2) / (2 * cos^2 * (dx * tan - dy))

            const dxAbs = Math.abs(dx);

            const cos = Math.cos(rad);
            const tan = Math.tan(rad);

            if (Math.abs(cos) < 0.01) continue;

            // Physics y grows down, so if target is below, dy is positive.
            // Standard projectile formula assumes y grows UP.
            // So relative Y for formula is -dy; 
            const physicsDy = -dy;

            // v^2 = (g * x^2) / (2 * cos^2 * (x * tan - y))
            const denomPhys = dxAbs * tan - physicsDy;

            if (denomPhys <= 0) continue;

            const vSq = (g * dxAbs * dxAbs) / (2 * cos * cos * denomPhys);
            if (vSq < 0) continue;

            const v = Math.sqrt(vSq);
            // Power factor? In Physics: speed = power * 0.5
            // So power = speed * 2

            const power = v * 2;

            if (power < 100 || power > 1000) continue;

            // Prefer 500 power range
            const error = Math.abs(power - 500);
            if (error < bestError) {
                bestError = error;
                bestAngle = angle;
                bestPower = power;
            }
        }

        if (dx < 0) {
            bestAngle = 180 - bestAngle;
        }

        return { angle: bestAngle, power: bestPower };
    }

    private cyborgShot(gameState: GameState, tank: TankState, target: TankState) {
        return this.spoilerShot(gameState, tank, target);
    }
}
