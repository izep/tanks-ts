import { type GameState, GamePhase, CONSTANTS } from './GameState';
import { InputManager, GameAction } from './InputManager';
import { AIController, AIPersonality } from './AIController';
import { TerrainSystem } from '../systems/TerrainSystem';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { UIManager } from '../ui/UIManager';
import { SoundManager } from './SoundManager';
import { RenderSystem } from '../systems/RenderSystem';
import { WEAPONS, WEAPON_ORDER } from './WeaponData';

export class GameEngine {
    private canvas: HTMLCanvasElement;
    // private ctx: CanvasRenderingContext2D; // Moved to RenderSystem
    private isRunning: boolean = false;
    private lastTime: number = 0;
    private aiTurnTimer: number = 0;
    private readonly AI_TURN_DELAY = 1.0; // 1 second delay

    // Input scaling
    private inputHoldTime: number = 0;

    public state: GameState;
    public inputManager: InputManager;
    public terrainSystem: TerrainSystem;
    public physicsSystem: PhysicsSystem;
    public uiManager: UIManager;
    public soundManager: SoundManager;
    public renderSystem: RenderSystem;

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

        // Init Terrain
        this.terrainSystem.generate(this.state);

        // UI Bindings
        this.uiManager.onBuyWeapon = (weaponId) => this.handleBuyWeapon(weaponId);
        this.uiManager.onNextRound = () => this.handleNextRound();
        this.uiManager.onStartGame = (config) => this.handleStartGame(config);
        this.uiManager.onSetWeapon = (id) => this.handleSetWeapon(id);
        this.uiManager.onSetShield = (id) => this.handleSetShield(id);
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
                    this.handleAiTurn(dt);
                } else {
                    this.handleAimingInput(dt);
                }
            } else {
                // Tank dead? Next turn?
                // Should be handled by logic check, but let's ensure next turn triggers if undefined
                // This might happen if index is invalid
            }
        }

        // 2. Update Systems (Physics, Terrain)
        this.physicsSystem.update(this.state, dt);

        // 3. Terrain Settling
        if (this.state.phase === GamePhase.TERRAIN_SETTLING || this.state.terrainDirty) {
            try {
                const moved = this.terrainSystem.settle(this.state);
                if (!moved && this.state.phase === GamePhase.TERRAIN_SETTLING) {
                    // Settling done
                    console.log("Settling done, calling nextTurn");

                    // Check Win Condition before next turn
                    const alive = this.state.tanks.filter(t => !t.isDead && t.health > 0);
                    if (alive.length <= 1) {
                        // Round Over
                        // Award points/credits to winner?
                        if (alive.length === 1) {
                            const winner = alive[0];
                            winner.credits += 1000; // Win bonus
                            console.log(`Round Winner: ${winner.name}`);
                        }

                        if (this.state.roundNumber >= this.state.maxRounds) {
                            console.log("Game Over - Max rounds reached");
                            this.state.phase = GamePhase.GAME_OVER;
                            this.soundManager.playUI();
                        } else {
                            console.log("Round Over - Going to Shop");
                            this.state.phase = GamePhase.SHOP;
                        }
                    } else {
                        this.physicsSystem.nextTurn(this.state);
                    }
                }
            } catch (e) {
                console.error('Terrain settling error:', e);
                this.state.terrainDirty = false;
            }
        }

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

    private handleAimingInput(dt: number) {
        const tank = this.state.tanks[this.state.currentPlayerIndex];
        if (!tank) return;

        if (this.inputManager.isActionActive(GameAction.AIM_UP) ||
            this.inputManager.isActionActive(GameAction.AIM_DOWN) ||
            this.inputManager.isActionActive(GameAction.POWER_UP) ||
            this.inputManager.isActionActive(GameAction.POWER_DOWN)) {

            this.inputHoldTime += dt;
        } else {
            this.inputHoldTime = 0;
        }

        const multiplier = this.inputHoldTime > 0.5 ? 4.0 : 1.0; // Speed up after 0.5s hold

        if (this.inputManager.isActionActive(GameAction.AIM_UP)) {
            tank.angle = Math.min(180, tank.angle + 20 * dt * multiplier);
        }
        if (this.inputManager.isActionActive(GameAction.AIM_DOWN)) {
            tank.angle = Math.max(0, tank.angle - 20 * dt * multiplier);
        }
        if (this.inputManager.isActionActive(GameAction.POWER_UP)) {
            tank.power = Math.min(3000, tank.power + 100 * dt * multiplier);
        }
        if (this.inputManager.isActionActive(GameAction.POWER_DOWN)) {
            tank.power = Math.max(0, tank.power - 100 * dt * multiplier);
        }

        if (this.inputManager.isActionTriggered(GameAction.NEXT_WEAPON)) {
            const currentIdx = WEAPON_ORDER.indexOf(tank.currentWeapon);
            let nextIdx = (currentIdx + 1) % WEAPON_ORDER.length;
            // Scan for weapon we have
            let count = 0;
            while ((!tank.inventory[WEAPON_ORDER[nextIdx]] || tank.inventory[WEAPON_ORDER[nextIdx]] === 0) && count < WEAPON_ORDER.length) {
                nextIdx = (nextIdx + 1) % WEAPON_ORDER.length;
                count++;
            }
            tank.currentWeapon = WEAPON_ORDER[nextIdx];
            console.log("Switched to", tank.currentWeapon);
        }

        if (this.inputManager.isActionTriggered(GameAction.TOGGLE_SHIELD)) {
            if (tank.activeShield) {
                console.log("Deactivating Shield");
                tank.activeShield = undefined;
                tank.shieldHealth = 0;
            } else {
                if (tank.accessories['shield'] > 0) {
                    console.log("Activating Shield");
                    tank.accessories['shield']--;
                    tank.activeShield = 'shield';
                    tank.shieldHealth = 200; // Standard shield health
                } else {
                    console.log("No shields!");
                }
            }
        }

        // Battery usage to restore health
        if (this.inputManager.isActionTriggered(GameAction.USE_BATTERY)) {
            if ((tank.accessories['battery'] || 0) > 0 && tank.health < 100) {
                const restoreAmount = WEAPONS['battery'].effectValue || 10;
                const oldHealth = tank.health;
                tank.health = Math.min(100, tank.health + restoreAmount);
                tank.accessories['battery']--;
                console.log(`Battery used! Health: ${oldHealth} -> ${tank.health}`);
                this.soundManager.playUI();
            } else if (tank.health >= 100) {
                console.log("Health already full!");
            } else {
                console.log("No batteries!");
            }
        }

        // Movement with fuel consumption
        const MOVE_SPEED = 50; // pixels per second
        const FUEL_COST_PER_PIXEL = 1;
        
        if (this.inputManager.isActionActive(GameAction.MOVE_LEFT) && tank.fuel > 0 && tank.hasLanded) {
            const moveAmount = MOVE_SPEED * dt;
            const fuelNeeded = Math.ceil(moveAmount * FUEL_COST_PER_PIXEL);
            
            if (tank.fuel >= fuelNeeded) {
                const newX = Math.max(0, tank.x - moveAmount);
                const groundY = this.terrainSystem.getGroundY(Math.floor(newX));
                
                // Check if slope is not too steep
                const currentGroundY = this.terrainSystem.getGroundY(Math.floor(tank.x));
                const slopeDiff = Math.abs(groundY - currentGroundY);
                
                if (slopeDiff < 15) { // Max climbable slope
                    tank.x = newX;
                    tank.y = groundY;
                    tank.fuel -= fuelNeeded;
                }
            }
        }
        
        if (this.inputManager.isActionActive(GameAction.MOVE_RIGHT) && tank.fuel > 0 && tank.hasLanded) {
            const moveAmount = MOVE_SPEED * dt;
            const fuelNeeded = Math.ceil(moveAmount * FUEL_COST_PER_PIXEL);
            
            if (tank.fuel >= fuelNeeded) {
                const newX = Math.min(CONSTANTS.SCREEN_WIDTH - 1, tank.x + moveAmount);
                const groundY = this.terrainSystem.getGroundY(Math.floor(newX));
                
                // Check if slope is not too steep
                const currentGroundY = this.terrainSystem.getGroundY(Math.floor(tank.x));
                const slopeDiff = Math.abs(groundY - currentGroundY);
                
                if (slopeDiff < 15) { // Max climbable slope
                    tank.x = newX;
                    tank.y = groundY;
                    tank.fuel -= fuelNeeded;
                }
            }
        }

        // Testing phase switch
        if (this.inputManager.isActionTriggered(GameAction.FIRE)) {
            // Cannot fire if projectile already in air (simple check)
            if (this.state.projectiles.length === 0) {
                console.log("Fire!");
                this.soundManager.playFire();

                // Talking Tanks
                if (Math.random() < 0.3) {
                    const phrases = ["Eat this!", "Take cover!", "Incoming!", "Bye bye!"];
                    tank.lastWords = phrases[Math.floor(Math.random() * phrases.length)];
                    tank.sayTimer = 2;
                }

                this.physicsSystem.fireProjectile(this.state, tank.power, tank.angle, tank.currentWeapon);
            }
        }
    }

    private handleAiTurn(dt: number) {
        const tank = this.state.tanks[this.state.currentPlayerIndex];
        if (!tank || !tank.aiController) return;

        this.aiTurnTimer += dt;

        if (this.aiTurnTimer >= this.AI_TURN_DELAY) {
            this.aiTurnTimer = 0;

            // Allow reroll of logic for visualization? No, just decide and fire.
            // Python version effectively did both instantlyframe of fire.

            const decision = tank.aiController.decideShot(this.state, this.state.currentPlayerIndex);
            tank.angle = decision.angle;
            tank.power = decision.power;

            // Fire
            this.soundManager.playFire();

            // Talking Tanks (AI)
            if (Math.random() < 0.5) {
                const phrases = ["Calculating...", "Target Acquired", "Exterminate!", "Logic demands death"];
                tank.lastWords = phrases[Math.floor(Math.random() * phrases.length)];
                tank.sayTimer = 2;
            }

            this.physicsSystem.fireProjectile(this.state, tank.power, tank.angle, tank.currentWeapon);
        }
    }

    private handleBuyWeapon(weaponId: string) {
        const tank = this.state.tanks[this.state.currentPlayerIndex];
        const weapon = WEAPONS[weaponId];

        if (tank.credits >= weapon.cost) {
            // Check for Items
            if (weapon.type === 'item') {
                tank.credits -= weapon.cost;
                this.soundManager.playUI(); // Success sound

                if (weaponId === 'fuel_can') {
                    tank.fuel += (weapon.effectValue || 250);
                    console.log(`Bought Fuel. Current: ${tank.fuel}`);
                } else if (weaponId === 'shield') {
                    tank.accessories['shield'] = (tank.accessories['shield'] || 0) + (weapon.effectValue || 1);
                    console.log(`Bought Shield. Count: ${tank.accessories['shield']}`);
                } else if (weaponId === 'parachute') {
                    tank.accessories['parachute'] = (tank.accessories['parachute'] || 0) + (weapon.effectValue || 1);
                    console.log(`Bought Parachute. Count: ${tank.accessories['parachute']}`);
                } else if (weaponId === 'battery') {
                    tank.accessories['battery'] = (tank.accessories['battery'] || 0) + 1;
                    console.log(`Bought Battery. Count: ${tank.accessories['battery']}`);
                }
                return;
            }

            // Infinite check for weapons
            if (tank.inventory[weaponId] === -1) {
                this.soundManager.playUI(); // Already have it
                return;
            }

            tank.credits -= weapon.cost;
            tank.inventory[weaponId] = (tank.inventory[weaponId] || 0) + 1;
            this.soundManager.playUI(); // Success sound
        } else {
            // Fail sound
        }
    }

    private handleSetWeapon(id: string) {
        const tank = this.state.tanks[this.state.currentPlayerIndex];
        if (!tank) return;
        // Verify
        if (tank.inventory[id] !== undefined && tank.inventory[id] !== 0) {
            tank.currentWeapon = id;
            this.soundManager.playUI();
        }
    }

    private handleSetShield(id: string) {
        const tank = this.state.tanks[this.state.currentPlayerIndex];
        if (!tank) return;
        // Verify
        if ((tank.accessories[id] || 0) > 0) {
            if (!tank.activeShield) {
                tank.activeShield = id;
                tank.shieldHealth = (id === 'super_shield') ? 400 : 200;
            } else if (tank.activeShield !== id) {
                // Switch shield type?
                tank.activeShield = id;
                // Don't reset HP fully maybe? Or yes?
                tank.shieldHealth = (id === 'super_shield') ? 400 : 200;
            }
            this.soundManager.playUI();
        }
    }

    private handleNextRound() {
        // Just start next round for now
        // TODO: Logic for multiple players shopping

        if (this.state.roundNumber >= this.state.maxRounds) {
            console.log("Max rounds reached - Game Over");
            this.state.phase = GamePhase.GAME_OVER;
            this.soundManager.playUI();
            return;
        }

        this.state.phase = GamePhase.AIMING;
        this.state.roundNumber++;

        // Randomize Wind
        // Wind range: -35 to 35 (High impact)
        this.state.wind = (Math.random() * 70) - 35;
        console.log(`Wind changed to: ${this.state.wind.toFixed(1)}`);

        this.terrainSystem.generate(this.state);

        // Reset positions?
        // Simple respawn
        this.state.tanks.forEach((t, i) => {
            t.x = 100 + i * 400;
            t.y = 100; // Will fall
            t.health = 100;
            t.isDead = false;
            t.hasLanded = false; // Reset land status
        });

        this.state.currentPlayerIndex = 0;
        this.soundManager.playUI();
    }

    private handleStartGame(config: any) {
        // Init tanks based on config
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan'];
        this.state.tanks = [];
        const sectionWidth = CONSTANTS.SCREEN_WIDTH / config.playerCount;

        config.players.forEach((pConfig: any, i: number) => {
            // Determine AI Logic
            let aiCtrl: AIController | undefined;
            let aiPers: AIPersonality | undefined;

            if (pConfig.isAi) {
                // Parse personality string to Enum
                // Enum keys match strings? AIPersonality.MORON is 'MORON'? YES.
                const key = pConfig.aiPersonality as keyof typeof AIPersonality;
                aiPers = AIPersonality[key] || AIPersonality.UNKNOWN;
                aiCtrl = new AIController(aiPers!);
            }

            this.state.tanks.push({
                id: i + 1,
                name: pConfig.name || `Player ${i + 1}`,
                x: sectionWidth * i + sectionWidth / 2,
                y: 100, // Will fall
                vy: 0,
                angle: 90,
                power: 600,
                health: 100,
                fuel: 250,
                color: colors[i % colors.length],
                variant: pConfig.variant || 0,
                isAi: pConfig.isAi,
                aiPersonality: aiPers,
                aiController: aiCtrl,
                isFalling: true,
                hasLanded: false, // Initial fall
                parachuteThreshold: 15,
                isDead: false,
                credits: 0,
                currentWeapon: 'baby_missile',
                inventory: pConfig.testMode || config.testMode ? this.getTestInventory() : { 'missile': -1, 'baby_missile': -1 },
                accessories: { 'parachute': config.testMode ? 10 : 0 } // Give parachutes too
            });
        });

        this.state.maxRounds = config.rounds || 10;
        this.state.phase = GamePhase.AIMING;

        // Initial Wind
        this.state.wind = (Math.random() * 70) - 35;
        console.log(`Initial Wind: ${this.state.wind.toFixed(1)}`);

        this.terrainSystem.generate(this.state);
        this.soundManager.playUI(); // Will also resume AudioContext
    }

    private getTestInventory(): Record<string, number> {
        const inv: Record<string, number> = {};
        WEAPON_ORDER.forEach(w => {
            const stats = WEAPONS[w];
            if (stats.cost === 0) {
                inv[w] = -1;
            } else {
                inv[w] = 100;
            }
        });
        return inv;
    }

    private render() {
        this.renderSystem.render(this.state);
        this.uiManager.update(this.state);
    }
}
