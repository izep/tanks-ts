import { type GameState, GamePhase } from '../core/GameState';
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
        // Terrain Settling
        if (state.phase === GamePhase.TERRAIN_SETTLING || state.terrainDirty) {
            try {
                const moved = this.terrainSystem.settle(state);
                if (!moved && state.phase === GamePhase.TERRAIN_SETTLING) {
                    // Settling done
                    console.log('Settling done, calling nextTurn');

                    // Check Win Condition before next turn
                    const alive = state.tanks.filter((t) => !t.isDead && t.health > 0);
                    if (alive.length <= 1) {
                        // Round Over
                        if (alive.length === 1) {
                            const winner = alive[0];
                            winner.credits += 1000; // Win bonus
                            console.log(`Round Winner: ${winner.name}`);
                        }

                        if (state.roundNumber >= state.maxRounds) {
                            console.log('Game Over - Max rounds reached');
                            state.phase = GamePhase.GAME_OVER;
                            this.soundManager.playUI();
                        } else {
                            console.log('Round Over - Going to Shop');
                            state.phase = GamePhase.SHOP;
                        }
                    } else {
                        this.physicsSystem.nextTurn(state);
                    }
                }
            } catch (e) {
                console.error('Terrain settling error:', e);
                state.terrainDirty = false;
            }
        }
    }

    public handleNextRound(state: GameState) {
        // Just start next round for now
        // TODO: Logic for multiple players shopping

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

        this.terrainSystem.generate(state);

        // Reset positions?
        // Simple respawn
        state.tanks.forEach((t, i) => {
            t.x = 100 + i * 400;
            t.y = 100; // Will fall
            t.health = 100;
            t.isDead = false;
            t.hasLanded = false; // Reset land status
        });

        state.currentPlayerIndex = 0;
        this.soundManager.playUI();
    }
}
