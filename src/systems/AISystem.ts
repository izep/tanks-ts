import { type GameState } from '../core/GameState';
import { PhysicsSystem } from './PhysicsSystem';
import { SoundManager } from '../core/SoundManager';

export class AISystem {
    private physicsSystem: PhysicsSystem;
    private soundManager: SoundManager;
    private aiTurnTimer: number = 0;
    private readonly AI_TURN_DELAY = 1.0; // 1 second delay

    constructor(physicsSystem: PhysicsSystem, soundManager: SoundManager) {
        this.physicsSystem = physicsSystem;
        this.soundManager = soundManager;
    }

    public handleAiTurn(state: GameState, dt: number) {
        const tank = state.tanks[state.currentPlayerIndex];
        if (!tank || !tank.aiController) return;

        this.aiTurnTimer += dt;

        if (this.aiTurnTimer >= this.AI_TURN_DELAY) {
            this.aiTurnTimer = 0;

            const decision = tank.aiController.decideShot(state, state.currentPlayerIndex);
            tank.angle = decision.angle;
            tank.power = decision.power;

            // Fire
            this.soundManager.playFire();

            // Talking Tanks (AI)
            if (Math.random() < 0.5) {
                const phrases = ['Calculating...', 'Target Acquired', 'Exterminate!', 'Logic demands death'];
                tank.lastWords = phrases[Math.floor(Math.random() * phrases.length)];
                tank.sayTimer = 2;
            }

            this.physicsSystem.fireProjectile(state, tank.power, tank.angle, tank.currentWeapon);
        }
    }
}
