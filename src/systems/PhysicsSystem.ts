import { type GameState, GamePhase, type ProjectileState, CONSTANTS } from '../core/GameState';
import { TerrainSystem } from './TerrainSystem';
import { WEAPONS } from '../core/WeaponData';
import { SoundManager } from '../core/SoundManager';
import {
    type BorderStrategy,
    DefaultBorderStrategy,
    BorderAction
} from './physics/BorderStrategy';
import {
    type WeaponBehavior,
    StandardFlightBehavior,
    ParticleBehavior,
    RollingBehavior,
    DiggingBehavior,
    type PhysicsContext
} from './physics/WeaponBehavior';

export class PhysicsSystem {
    private terrainSystem: TerrainSystem;
    private soundManager: SoundManager;

    // Strategies & Behaviors
    private borderStrategy: BorderStrategy;
    private standardBehavior: StandardFlightBehavior;
    private particleBehavior: ParticleBehavior;
    private rollingBehavior: RollingBehavior;
    private diggingBehavior: DiggingBehavior;

    constructor(terrainSystem: TerrainSystem, soundManager: SoundManager) {
        this.terrainSystem = terrainSystem;
        this.soundManager = soundManager;

        // Default Config (Can be changed at runtime if needed)
        this.borderStrategy = new DefaultBorderStrategy();

        // Initialize Behaviors
        this.standardBehavior = new StandardFlightBehavior();
        this.particleBehavior = new ParticleBehavior();
        this.rollingBehavior = new RollingBehavior();
        this.diggingBehavior = new DiggingBehavior();
    }

    public setBorderStrategy(strategy: BorderStrategy) {
        this.borderStrategy = strategy;
    }

    public update(state: GameState, dt: number) {
        // 1. Update Projectiles
        if (state.phase === GamePhase.PROJECTILE_FLYING) {
            this.updateProjectiles(state, dt);
        }

        // 2. Update Tanks (Falling)
        this.updateTanks(state, dt);

        // 3. Update Explosions
        this.updateExplosions(state, dt);

        // 4. Update Talking Timers
        state.tanks.forEach(t => {
            if (t.sayTimer && t.sayTimer > 0) {
                t.sayTimer -= dt;
            }
        });
    }

    private updateProjectiles(state: GameState, dt: number) {
        const toRemove: number[] = [];
        const newQueue: any[] = []; // Temporary queue for new projectiles

        // Context for behaviors
        const context: PhysicsContext = {
            terrainSystem: this.terrainSystem,
            soundManager: this.soundManager,
            triggerExplosion: (s, x, y, p, q) => this.triggerExplosion(s, x, y, p, q),
            addProjectile: (p) => newQueue.push(p)
        };

        state.projectiles.forEach((proj, index) => {
            // 1. Select Behavior
            const behavior = this.getBehavior(proj);

            // 2. Update (returns true if behavior requested removal)
            let shouldRemove = behavior.update(proj, state, dt, context);

            // 3. Border Check (if not already removed)
            if (!shouldRemove) {
                const borderAction = this.borderStrategy.check(proj);
                if (borderAction !== BorderAction.NONE) {
                    if (borderAction === BorderAction.EXPLODE) {
                        // Explode at current position (at the edge)
                        this.triggerExplosion(state, proj.x, proj.y, proj, newQueue);
                        shouldRemove = true;
                    } else {
                        // Apply strategy (Bounce, Wrap, Destroy)
                        shouldRemove = this.borderStrategy.apply(proj, borderAction);
                    }
                }
            }

            // 4. Collision Check (Standard & Rolling)
            // Diggers handle their own collision in behavior
            // Particles handle their own collision/ground check in behavior
            if (!shouldRemove && !this.isParticle(proj.weaponType) && !this.isDigger(proj.weaponType)) {
                // Check Collision
                if (this.checkCollision(state, proj)) {
                    // Special Handling for Segway (Start Rolling)
                    if (proj.weaponType === 'segway' && proj.state !== 'rolling') {
                        this.startRolling(proj);
                    } else if (proj.weaponType === 'leapfrog') {
                        // Leapfrog Logic (handled in behavior mostly, but if we are here it hit something)
                        // Actually checkCollision returns true if it hits ground or tank.
                        // For leapfrog, we want to bounce.
                        // TODO: Move Leapfrog collision logic fully to behavior or handle here?
                        // Current legacy logic:
                        proj.bounces = (proj.bounces || 0) + 1;
                        this.triggerExplosion(state, proj.x, proj.y, { ...proj, weaponType: 'baby_missile' }); // bounce puff

                        if (proj.bounces < 3) {
                            // Bounce!
                            proj.vy = -Math.abs(proj.vy) * 0.7; // Dampen
                            proj.vx *= 0.8; // Friction
                            proj.y -= 5; // Lift up
                        } else {
                            shouldRemove = true;
                            this.triggerExplosion(state, proj.x, proj.y, proj, newQueue);
                        }
                    } else {
                        shouldRemove = true;
                        // Trigger Explosion
                        this.triggerExplosion(state, proj.x, proj.y, proj, newQueue);
                    }
                }
            }

            // Update Trail
            proj.trail.push({ x: proj.x, y: proj.y });
            const maxTrail = proj.weaponType === 'tracer' ? 300 : 50;
            if (proj.trail.length > maxTrail) proj.trail.shift();

            if (shouldRemove) {
                toRemove.push(index);
            }
        });

        // Add new projectiles
        if (newQueue.length > 0) {
            state.projectiles.push(...newQueue);
        }

        // Remove projectiles
        if (toRemove.length > 0) {
            let writeIdx = 0;
            let removePtr = 0;
            for (let readIdx = 0; readIdx < state.projectiles.length; readIdx++) {
                if (removePtr < toRemove.length && readIdx === toRemove[removePtr]) {
                    // Skip this element
                    removePtr++;
                } else {
                    // Keep this element
                    if (readIdx !== writeIdx) {
                        state.projectiles[writeIdx] = state.projectiles[readIdx];
                    }
                    writeIdx++;
                }
            }
            state.projectiles.length = writeIdx;
        }

        // Check for phase change
        // If no projectiles left, turn is over.
        if (state.projectiles.length === 0) {
            state.phase = GamePhase.EXPLOSION;
            state.lastExplosionTime = performance.now();
        }
    }

    private getBehavior(proj: ProjectileState): WeaponBehavior {
        if (proj.state === 'rolling') return this.rollingBehavior;
        if (this.isParticle(proj.weaponType)) return this.particleBehavior;
        if (this.isDigger(proj.weaponType)) return this.diggingBehavior;
        return this.standardBehavior;
    }

    private isParticle(type: string): boolean {
        return type === 'napalm_particle' || type === 'liquid_dirt_particle' || type === 'dirt_particle' || type === 'riot_particle';
    }

    private isDigger(type: string): boolean {
        return type === 'digger' || type === 'baby_digger' || type === 'heavy_digger' ||
            type === 'sandhog' || type === 'baby_sandhog' || type === 'heavy_sandhog';
    }

    private startRolling(proj: ProjectileState) {
        proj.state = 'rolling';
        // Dampen velocity
        proj.vx *= 0.8;
        proj.vy = 0;

        const groundY = this.terrainSystem.getGroundY(Math.floor(proj.x));
        proj.y = groundY;

        // Nudge
        if (Math.abs(proj.vx) < 10) {
            proj.vx = (proj.vx >= 0 ? 1 : -1) * 20;
        }
    }

    private checkCollision(state: GameState, proj: any): boolean {
        // 1. Terrain Collision
        const y = Math.floor(proj.y);
        const x = Math.floor(proj.x);

        // Sky check (handled by border strategy mostly, but checkCollision is for Impact)
        if (y < 0) return false;

        // Border Strategy handles Out of Bounds (Bottom/Sides), but here we check for TERRAIN hit.
        // If y > SCREEN_HEIGHT, it's a hit (handled by BorderStrategy -> Destroy, but strictly speaking it's a "collision" with floor)
        // We let BorderStrategy handle the removal of deep projectiles.
        // But if we want an explosion on floor hit?
        if (y >= CONSTANTS.SCREEN_HEIGHT) return true;

        if (this.isDigger(proj.weaponType)) return false; // Diggers don't collide with terrain surface

        const groundY = this.terrainSystem.getGroundY(x);
        if (y >= groundY) return true;

        // 2. Tank Collision
        for (const tank of state.tanks) {
            if (tank.health <= 0) continue;
            const dx = proj.x - tank.x;
            const dy = proj.y - (tank.y - 10);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 15) return true;
        }

        return false;
    }

    // Exposed for Context
    public triggerExplosion(state: GameState, x: number, y: number, proj?: any, newQueue?: any[]) {
        if (proj) {
            const owner = state.tanks.find(t => t.id === proj.ownerId);
            if (owner) {
                owner.lastShotImpact = { x: x, y: y };
            }
        }

        const weaponId = proj?.weaponType || 'missile';
        const weaponStats = WEAPONS[weaponId] || WEAPONS['missile'];
        const radius = weaponStats.radius;

        // --- Explosion Logic based on Type ---
        if (weaponStats.type === 'dirt_charge') {
            this.terrainSystem.addTerrain(state, x, y, radius);
        } else if (weaponStats.type === 'liquid_dirt') {
            // Spawn Liquid Dirt Particles
            if (newQueue) {
                for (let i = 0; i < 15; i++) {
                    const angle = Math.random() * 360;
                    const speed = Math.random() * 50 + 20;
                    const rad = (angle * Math.PI) / 180;
                    newQueue.push({
                        id: crypto.randomUUID(),
                        x: x,
                        y: y - 5,
                        vx: Math.cos(rad) * speed,
                        vy: Math.sin(rad) * speed,
                        weaponType: 'liquid_dirt_particle',
                        ownerId: proj.ownerId,
                        elapsedTime: 0,
                        trail: []
                    });
                }
            }
        } else if (weaponStats.type === 'napalm' && newQueue) {
            // Spawn Napalm Particles
            for (let i = 0; i < 15; i++) {
                const sprayAngle = Math.random() * 360;
                const rad = (sprayAngle * Math.PI) / 180;
                const speed = Math.random() * 100 + 50;

                newQueue.push({
                    id: crypto.randomUUID(),
                    x: x,
                    y: y - 10,
                    vx: Math.cos(rad) * speed,
                    vy: Math.sin(rad) * speed,
                    weaponType: 'napalm_particle',
                    ownerId: proj.ownerId || -1,
                    elapsedTime: 0,
                    trail: []
                });
            }
            this.terrainSystem.explode(state, x, y, 20); // Initial blast
        } else if (weaponStats.type === 'riot_charge') {
            this.terrainSystem.explode(state, x, y, radius);
        } else if (weaponStats.type === 'earth_disrupter') {
            state.terrainDirty = true;
        } else if (weaponId === 'baby_missile') { // Leapfrog bounce explosion
            this.terrainSystem.explode(state, x, y, 20);
            state.explosions.push({
                id: Math.random(),
                x, y,
                maxRadius: 20,
                currentRadius: 0,
                duration: 0.3,
                elapsed: 0,
                color: 'orange'
            });
            this.soundManager.playExplosion();
            return;
        } else if (weaponStats.type === 'dirt') {
            // Dirt bomb - check if it hit a tank
            let dirtX = x;
            let dirtY = y;

            for (const tank of state.tanks) {
                if (tank.health <= 0) continue;
                const dx = x - tank.x;
                const dy = y - (tank.y - 10);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 20) {
                    dirtX = tank.x;
                    dirtY = tank.y;
                    break;
                }
            }
            this.terrainSystem.addTerrain(state, dirtX, dirtY, radius);
        } else {
            // Default Explosion
            this.terrainSystem.explode(state, x, y, radius);
        }

        // Funky Bomb Logic
        if (proj && proj.weaponType === 'funky_bomb' && newQueue) {
            const colors = ['red', 'green', 'blue', 'purple', 'yellow'];
            for (let i = 0; i < 5; i++) {
                const angle = Math.random() * 180;
                const power = 100 + Math.random() * 200;
                const rad = (angle * Math.PI) / 180;
                const speed = power * 0.5;

                newQueue.push({
                    id: crypto.randomUUID(),
                    x: x,
                    y: y - 20,
                    vx: Math.cos(rad) * speed,
                    vy: -Math.abs(Math.sin(rad) * speed) * 1.5,
                    weaponType: 'baby_missile',
                    ownerId: proj.ownerId || -1,
                    elapsedTime: 0,
                    trail: [],
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
            }
        }

        // Add visual explosion 
        if (weaponId !== 'digger') {
            state.explosions.push({
                id: Math.random(),
                x, y,
                maxRadius: radius * (weaponId === 'nuke' ? 1.5 : 1.2),
                currentRadius: 0,
                duration: 0.5,
                elapsed: 0,
                color: proj?.color || weaponStats.color || 'orange'
            });
            this.soundManager.playExplosion();
        }

        // Damage Tanks
        const damageAmount = weaponStats.damage;
        if (damageAmount > 0) {
            state.tanks.forEach(tank => {
                const dx = tank.x - x;
                const dy = (tank.y - 10) - y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < radius + 10) {
                    let damage = Math.floor(damageAmount * (1 - dist / (radius + 20)));

                    if (damage > 0) {
                        if (tank.activeShield && tank.shieldHealth && tank.shieldHealth > 0) {
                            const absorbed = Math.min(damage, tank.shieldHealth);
                            tank.shieldHealth -= absorbed;
                            damage -= absorbed;
                            if (tank.shieldHealth <= 0) tank.activeShield = undefined;
                        }

                        if (damage > 0) {
                            tank.health -= damage;
                            this.soundManager.playHit();
                            if (tank.health <= 0) {
                                tank.isDead = true;
                                tank.lastWords = ["Ouch!", "Nooo!", "Darn!", "Avenge me!"][Math.floor(Math.random() * 4)];
                                tank.sayTimer = 3;
                            }
                        }
                    }
                }
            });
        }
    }

    private updateTanks(state: GameState, dt: number) {
        state.tanks.forEach(tank => {
            if (tank.health <= 0) return;

            const groundY = this.terrainSystem.getGroundY(Math.floor(tank.x));

            if (tank.y < groundY) {
                // Falling
                tank.isFalling = true;
                tank.vy += state.gravity * dt;

                // Parachute Logic
                if (tank.hasLanded && !tank.isParachuteDeployed && (tank.accessories['parachute'] || 0) > 0 && tank.vy > 150) {
                    tank.isParachuteDeployed = true;
                    tank.accessories['parachute']--;
                }

                if (tank.isParachuteDeployed) {
                    const terminal = 60;
                    if (tank.vy > terminal) {
                        tank.vy = Math.max(terminal, tank.vy - 300 * dt);
                    }
                }

                tank.y += tank.vy * dt;

                if (tank.y > groundY) {
                    tank.y = groundY;

                    if (tank.hasLanded === false) {
                        tank.hasLanded = true;
                        tank.vy = 0;
                        tank.isFalling = false;
                        return;
                    }

                    let finalDamage = 0;
                    if (tank.isParachuteDeployed) {
                        tank.isParachuteDeployed = false;
                    } else {
                        const rawDamage = Math.max(0, (tank.vy - 100) / 5);
                        finalDamage = Math.floor(rawDamage);
                    }

                    if (finalDamage > 0) {
                        if ((tank.accessories['parachute'] || 0) > 0 && finalDamage >= (tank.parachuteThreshold || 15)) {
                            tank.accessories['parachute']--;
                            finalDamage = 0;
                        }

                        if (finalDamage > 0) {
                            tank.health -= finalDamage;
                            if (tank.health <= 0) tank.isDead = true;
                        }
                    }
                    tank.vy = 0;
                    tank.isFalling = false;
                    tank.isParachuteDeployed = false;
                }
            } else if (tank.y > groundY + 2 && tank.isFalling) {
                tank.y = groundY;
                tank.vy = 0;
                tank.isFalling = false;
            } else {
                tank.vy = 0;
                tank.isFalling = false;
            }
        });
    }

    private updateExplosions(state: GameState, dt: number) {
        const toRemove: number[] = [];
        state.explosions.forEach((exp, i) => {
            exp.elapsed += dt;
            exp.currentRadius = exp.maxRadius * (exp.elapsed / exp.duration);

            if (exp.elapsed >= exp.duration) {
                toRemove.push(i);
            }
        });

        for (let i = toRemove.length - 1; i >= 0; i--) {
            state.explosions.splice(toRemove[i], 1);
        }

        if (state.phase === GamePhase.EXPLOSION && state.explosions.length === 0) {
            state.phase = GamePhase.TERRAIN_SETTLING;
            state.terrainDirty = true;
        }
    }

    public nextTurn(state: GameState) {
        const alive = state.tanks.filter(t => t.health > 0);
        if (alive.length <= 1) {
            state.phase = GamePhase.SHOP;
            return;
        }

        let nextIdx = (state.currentPlayerIndex + 1) % state.tanks.length;
        while (state.tanks[nextIdx].health <= 0) {
            nextIdx = (nextIdx + 1) % state.tanks.length;
        }
        state.currentPlayerIndex = nextIdx;
        state.phase = GamePhase.AIMING;
    }

    public fireProjectile(state: GameState, power: number, angle: number, weaponId: string) {
        const tank = state.tanks[state.currentPlayerIndex];
        if (!tank) return;

        const rad = (angle * Math.PI) / 180;
        const barrelLength = 20;
        const startX = tank.x + Math.cos(rad) * barrelLength;
        const startY = (tank.y - 12) - Math.sin(rad) * barrelLength;
        const speed = power * 0.5;

        // --- Instant Cone Logic (Riot Weapons) ---
        if (weaponId === 'riot_charge' || weaponId === 'riot_blast') {
            // Instant effect
            const spread = 45; // Degrees
            const length = weaponId === 'riot_blast' ? 150 : 100;
            this.terrainSystem.clearConicSection(state, startX, startY, angle, length, spread);

            // Visual flash
            state.explosions.push({
                id: Math.random(),
                x: startX + Math.cos(rad) * length * 0.5,
                y: startY - Math.sin(rad) * length * 0.5,
                maxRadius: 10,
                currentRadius: 0,
                duration: 0.2,
                elapsed: 0,
                color: 'white'
            });
            this.soundManager.playExplosion();

            state.phase = GamePhase.TERRAIN_SETTLING; // Skip flying
            state.lastExplosionTime = performance.now();
            return;
        }

        // --- Particle Fire Logic ---
        if (weaponId === 'dirt_charge') {
            const count = 20;
            const particleType = 'dirt_particle';

            for (let i = 0; i < count; i++) {
                const spread = (Math.random() - 0.5) * 40;
                const newRad = ((angle + spread) * Math.PI) / 180;
                const pSpeed = speed * (0.8 + Math.random() * 0.4);

                state.projectiles.push({
                    id: crypto.randomUUID(),
                    x: startX,
                    y: startY,
                    vx: Math.cos(newRad) * pSpeed,
                    vy: -Math.sin(newRad) * pSpeed,
                    weaponType: particleType,
                    ownerId: tank.id,
                    elapsedTime: 0,
                    trail: []
                });
            }
            state.phase = GamePhase.PROJECTILE_FLYING;
            return;
        }

        // --- Standard Fire Logic ---
        const vx = Math.cos(rad) * speed;
        const vy = -Math.sin(rad) * speed;

        const projectile: ProjectileState = {
            id: crypto.randomUUID(),
            x: startX,
            y: startY,
            vx: vx,
            vy: vy,
            weaponType: weaponId,
            ownerId: tank.id,
            elapsedTime: 0,
            trail: []
        };
        state.projectiles.push(projectile);

        // Triple Turret Logic
        if (tank.variant === 6 && (weaponId === 'baby_missile' || weaponId === 'missile')) {
            const offsets = [-10, 10];
            offsets.forEach(off => {
                const newRad = ((angle + off) * Math.PI) / 180;
                const newVx = Math.cos(newRad) * speed;
                const newVy = -Math.sin(newRad) * speed;

                state.projectiles.push({
                    id: crypto.randomUUID(),
                    x: startX,
                    y: startY,
                    vx: newVx,
                    vy: newVy,
                    weaponType: weaponId,
                    ownerId: tank.id,
                    elapsedTime: 0,
                    trail: []
                });
            });
        }

        state.phase = GamePhase.PROJECTILE_FLYING;
    }
}

