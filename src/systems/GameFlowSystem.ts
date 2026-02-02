import { type GameState, GamePhase, CONSTANTS } from '../core/GameState';
import { TerrainSystem } from './TerrainSystem';
import { PhysicsSystem } from './PhysicsSystem';
import { SoundManager } from '../core/SoundManager';

export class GameFlowSystem {
    private terrainSystem: TerrainSystem;
    private physicsSystem: PhysicsSystem;
    private soundManager: SoundManager;

    constructor(
        terrainSystem: TerrainSystem,
        physicsSystem: PhysicsSystem,
        soundManager: SoundManager
    ) {
        this.terrainSystem = terrainSystem;
        this.physicsSystem = physicsSystem;
        this.soundManager = soundManager;
    }

    public update(state: GameState) {
        // Logic moved to GameEngine to avoid duplication and split split-brain issues.
        // Eventually, GameEngine logic should be moved here, but for now we silence the duplicate execution.
    }

    public async handleNextRound(state: GameState) {
        // Start next round

        if (state.roundNumber >= state.maxRounds) {
            console.log('Max rounds reached - Game Over');
            state.phase = GamePhase.GAME_OVER;
            this.soundManager.playUI();
            return;
        }

        state.phase = GamePhase.AIMING;
        state.roundNumber++;

        // Randomize Wind
        // Wind range: -35 to 35 (High impact)
        state.wind = Math.random() * 70 - 35;
        console.log(`Wind changed to: ${state.wind.toFixed(1)}`);

        await this.terrainSystem.generate(state);

        // Reset positions
        const sectionWidth = CONSTANTS.SCREEN_WIDTH / state.tanks.length;
        state.tanks.forEach((t, i) => {
            t.x = sectionWidth * i + sectionWidth / 2;
            t.y = 100; // Will fall
            t.health = 100;
            t.isDead = false;
            t.hasLanded = false; // Reset land status
        });

        state.currentPlayerIndex = 0;
        this.soundManager.playUI();
    }
}
