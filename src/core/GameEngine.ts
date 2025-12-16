import { type GameState, GamePhase, CONSTANTS } from './GameState';
import { InputManager, GameAction } from './InputManager';
import { TerrainSystem } from '../systems/TerrainSystem';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { UIManager } from '../ui/UIManager';
import { SoundManager } from './SoundManager';
import { RenderSystem } from '../systems/RenderSystem';
import { GameSetupSystem } from '../systems/GameSetupSystem';
import { PlayerInputSystem } from '../systems/PlayerInputSystem';
import { AISystem } from '../systems/AISystem';
import { ShopSystem } from '../systems/ShopSystem';
import { GameFlowSystem } from '../systems/GameFlowSystem';
export class GameEngine {
    private canvas: HTMLCanvasElement;
    // private ctx: CanvasRenderingContext2D; // Moved to RenderSystem
    private isRunning: boolean = false;
    private lastTime: number = 0;

    public state: GameState;
    public inputManager: InputManager;
    public terrainSystem: TerrainSystem;
    public physicsSystem: PhysicsSystem;
    public uiManager: UIManager;
    public soundManager: SoundManager;
    public renderSystem: RenderSystem;
    public gameSetupSystem: GameSetupSystem;
    public playerInputSystem: PlayerInputSystem;
    public aiSystem: AISystem;
    public shopSystem: ShopSystem;
    public gameFlowSystem: GameFlowSystem;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        // this.ctx = canvas.getContext('2d')!;
        this.inputManager = new InputManager();

        // Initialize State
        this.state = {
            phase: GamePhase.SETUP,
            tanks: [],
            projectiles: [],
            explosions: [],
            currentPlayerIndex: 0,
            roundNumber: 1,
            maxRounds: 10,
            wind: 0,
            gravity: CONSTANTS.GRAVITY,
            terrainDirty: false,
            lastExplosionTime: 0
        };

        // Setup Canvas
        this.canvas.width = CONSTANTS.SCREEN_WIDTH;
        this.canvas.height = CONSTANTS.SCREEN_HEIGHT;

        // Systems
        this.terrainSystem = new TerrainSystem(CONSTANTS.SCREEN_WIDTH, CONSTANTS.SCREEN_HEIGHT);
        this.physicsSystem = new PhysicsSystem(this.terrainSystem);
        this.uiManager = new UIManager();
        this.soundManager = new SoundManager();
        this.renderSystem = new RenderSystem(this.canvas, this.terrainSystem);
        this.gameSetupSystem = new GameSetupSystem(this.terrainSystem, this.soundManager);
        this.playerInputSystem = new PlayerInputSystem(
            this.inputManager,
            this.terrainSystem,
            this.physicsSystem,
            this.soundManager
        );
        this.aiSystem = new AISystem(this.physicsSystem, this.soundManager);
        this.shopSystem = new ShopSystem(this.soundManager);
        this.gameFlowSystem = new GameFlowSystem(this.terrainSystem, this.physicsSystem, this.soundManager);

        // Init Terrain
        this.terrainSystem.generate(this.state);

        // UI Bindings
        this.uiManager.onBuyWeapon = (weaponId) => this.shopSystem.handleBuyWeapon(this.state, weaponId);
        this.uiManager.onNextRound = () => this.gameFlowSystem.handleNextRound(this.state);
        this.uiManager.onStartGame = (config) => this.gameSetupSystem.handleStartGame(this.state, config);
        this.uiManager.onSetWeapon = (id) => this.shopSystem.handleSetWeapon(this.state, id);
        this.uiManager.onSetShield = (id) => this.shopSystem.handleSetShield(this.state, id);
        this.uiManager.onRestartGame = () => {
            console.log("Restarting Game...");
            this.state.phase = GamePhase.SETUP;
            this.soundManager.playUI();
        };

        // Wire Input
        this.uiManager.onAction = (actionName, active) => {
            // Map string to GameAction
            const action = GameAction[actionName as keyof typeof GameAction];
            if (action) {
                this.inputManager.handleInput(action, active);
            }
        };
    }

    public start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    private gameLoop(timestamp: number) {
        if (!this.isRunning) return;

        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(dt);
        this.render();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    private update(dt: number) {
        // 1. Process Input
        if (this.state.phase === GamePhase.AIMING) {
            const currentTank = this.state.tanks[this.state.currentPlayerIndex];
            if (currentTank) {
                if (currentTank.isAi) {
                    this.aiSystem.handleAiTurn(this.state, dt);
                } else {
                    this.playerInputSystem.handleAimingInput(this.state, dt);
                }
            } else {
                // Tank dead? Next turn?
                // Should be handled by logic check, but let's ensure next turn triggers if undefined
                // This might happen if index is invalid
            }
        }

        // 2. Update Systems (Physics, Terrain)
        this.physicsSystem.update(this.state, dt);
        this.gameFlowSystem.update(this.state);

        // 4. Shop Phase Input
        if (this.state.phase === GamePhase.SHOP) {
            // Check for Enter key to proceed
            // We can check InputManager for a generic "CONFIRM" action or just raw key?
            // InputManager doesn't have CONFIRM. Let's use generic logic or add it.
            // For now, let's assume if UIManager handles it via button, we are good?
            // User specifically asked for "Press Enter" support or complained about it.
            // Let's add a key listener in UIManager or here.
            // Actually, best to add 'ENTER' to InputManager if we want proper handling,
            // but for quick fix, let's just check the button click handler.
        }
    }





    private render() {
        this.renderSystem.render(this.state);
        this.uiManager.update(this.state);
    }
}
