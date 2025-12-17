import { type GameState, GamePhase, type ProjectileState, CONSTANTS } from '../core/GameState';
import { TerrainSystem } from './TerrainSystem';
import { WEAPONS } from '../core/WeaponData';
import { SoundManager } from '../core/SoundManager';

export class PhysicsSystem {
    private terrainSystem: TerrainSystem;
    private soundManager: SoundManager;

    constructor(terrainSystem: TerrainSystem, soundManager: SoundManager) {
        this.terrainSystem = terrainSystem;
        this.soundManager = soundManager;
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
        let collided = false;

        state.projectiles.forEach((proj, index) => {
            const weaponId = proj.weaponType || 'missile';

            // --- Particle Update Logic ---
            if (weaponId === 'napalm_particle' || weaponId === 'liquid_dirt_particle' || weaponId === 'dirt_particle') {
                // Gravity
                proj.vy += state.gravity * dt * 5;

                // Movement
                proj.x += proj.vx * dt;
                proj.y += proj.vy * dt;

                // Ground Check
                const groundY = this.terrainSystem.getGroundY(Math.floor(proj.x));

                // Tank Collision Logic (for Napalm/Dirt)
                for (const tank of state.tanks) {
                    if (tank.health <= 0) continue;
                    const dx = proj.x - tank.x;
                    const dy = proj.y - (tank.y - 10);
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 15) {
                        if (weaponId === 'napalm_particle') {
                             // Damage tank
                             tank.health -= 0.5; // DoT per particle
                             if (tank.health <= 0) tank.isDead = true;
                        } else if (weaponId === 'dirt_particle' || weaponId === 'liquid_dirt_particle') {
                            // Hit tank -> Become dirt at tank position
                            this.terrainSystem.addTerrain(state, tank.x, tank.y, 6, WEAPONS['liquid_dirt']?.color);
                            toRemove.push(index);
                        }
                    }
                }

                if (proj.y >= groundY) {
                    proj.y = groundY;

                    // Simple "Ooze" / Rolling physics for particles
                    const groundYNext = this.terrainSystem.getGroundY(Math.floor(proj.x + (proj.vx > 0 ? 5 : -5)));
                    const slope = groundYNext - groundY;

                    if (Math.abs(slope) > 2) {
                        proj.vx += slope * 5 * dt; // Slide down
                    } else {
                        proj.vx *= 0.9; // Friction
                    }

                    // Napalm Burns terrain
                    if (weaponId === 'napalm_particle') {
                        // Burn chance/effect
                        if (Math.random() < 0.1) {
                            this.terrainSystem.explode(state, proj.x, proj.y, 5);
                        }
                    }

                    // Stop condition
                    if (Math.abs(proj.vx) < 5) {
                        if (weaponId === 'liquid_dirt_particle' || weaponId === 'dirt_particle') {
                            const color = weaponId === 'liquid_dirt_particle' ? WEAPONS['liquid_dirt']?.color : undefined;
                            this.terrainSystem.addTerrain(state, proj.x, proj.y, 6, color);
                            toRemove.push(index);
                        } else if (weaponId === 'napalm_particle') {
                            // Napalm dies out eventually (handled by elapsedTime below) or stops and burns a bit more
                        }
                    }
                }

                proj.elapsedTime += dt;
                if (proj.elapsedTime > 2.0) { // Lifetime
                    toRemove.push(index);
                    if (weaponId === 'napalm_particle') {
                         this.terrainSystem.explode(state, proj.x, proj.y, 8); // Final poof
                    }
                }
                return; // Skip standard logic
            } else if (weaponId === 'riot_particle') {
                // Should not happen now as Riot Charge is instant, but kept for safety/legacy
                 proj.vy += state.gravity * dt * 5;
                 proj.x += proj.vx * dt;
                 proj.y += proj.vy * dt;

                 const groundY = this.terrainSystem.getGroundY(Math.floor(proj.x));
                 if (proj.y >= groundY) {
                     this.terrainSystem.explode(state, proj.x, proj.y, 8);
                     toRemove.push(index);
                 }
                 proj.elapsedTime += dt;
                 if (proj.elapsedTime > 2.0) toRemove.push(index);
                 return;
            }

            // --- Standard Projectile Logic ---

            // Rolling Logic
            if (proj.state === 'rolling') {
                // Get slope
                const groundY = this.terrainSystem.getGroundY(Math.floor(proj.x));
                const groundYNext = this.terrainSystem.getGroundY(Math.floor(proj.x + (proj.vx > 0 ? 5 : -5)));

                // Slope angle
                const dy = groundYNext - groundY;
                const dx = (proj.vx > 0 ? 5 : -5);
                const angle = Math.atan2(dy, dx); // Radians

                // Gravity component: F = m * g * sin(theta)
                // ax = g * sin(theta)
                const gravity = 100; // or state.gravity
                const ax = gravity * Math.sin(angle);

                // Friction
                const friction = 30; // Reduced friction for better rolling
                if (proj.vx > 0) proj.vx -= friction * dt;
                else if (proj.vx < 0) proj.vx += friction * dt;

                // Apply Slope Gravity
                proj.vx += ax * dt * 8; // Stronger slope effect

                proj.x += proj.vx * dt;

                // Snap to ground
                const newGroundY = this.terrainSystem.getGroundY(Math.floor(proj.x));

                // Wall Check / steep slope check
                if (Math.abs(dy) > 15) { // More forgiving slope check (was 10)
                    // Too steep/Wall -> Bounce or Explode?
                    // Reflect velocity slightly
                    proj.vx = -proj.vx * 0.5;
                    // If still stuck, explode
                    if (Math.abs(proj.vx) < 5) {
                         collided = true;
                         toRemove.push(index);
                         this.triggerExplosion(state, proj.x, proj.y);
                    }
                } else {
                    proj.y = newGroundY;
                }

                // Stop if too slow
                if (Math.abs(proj.vx) < 5) {
                    collided = true;
                    toRemove.push(index);
                    this.triggerExplosion(state, proj.x, proj.y);
                }

                // Check Tank Collision
                for (const tank of state.tanks) {
                    if (tank.health <= 0) continue;
                    const dx = proj.x - tank.x;
                    const dy = proj.y - (tank.y - 10);
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 20) {
                        collided = true;
                        toRemove.push(index);
                        this.triggerExplosion(state, proj.x, proj.y);
                        break;
                    }
                }
            } else if (proj.weaponType === 'digger' || proj.weaponType === 'baby_digger' || proj.weaponType === 'heavy_digger') {
                // Digger Logic - Weaving
                proj.vx += state.wind * dt * 0.1;
                proj.vy += state.gravity * dt * 10;

                // Add weaving noise
                const time = performance.now() / 100;
                proj.vx += Math.sin(time) * 50 * dt; // Wiggle X

                proj.x += proj.vx * dt;
                proj.y += proj.vy * dt;

                // Digging effect
                const groundY = this.terrainSystem.getGroundY(Math.floor(proj.x));
                if (proj.y > groundY) {
                    this.terrainSystem.explode(state, proj.x, proj.y, 10);
                }
            } else if (proj.weaponType === 'sandhog' || proj.weaponType === 'baby_sandhog' || proj.weaponType === 'heavy_sandhog') {
                 // Sandhog Logic - Weaving
                 proj.vx += state.wind * dt * 0.1;
                 proj.vy += state.gravity * dt * 10;

                 // Add weaving noise
                 const time = performance.now() / 100;
                 proj.vx += Math.cos(time) * 50 * dt; // Wiggle X different phase

                 proj.x += proj.vx * dt;
                 proj.y += proj.vy * dt;

                 const groundY = this.terrainSystem.getGroundY(Math.floor(proj.x));
                 if (proj.y > groundY) {
                     this.terrainSystem.explode(state, proj.x, proj.y, 8);
                     if (proj.y >= CONSTANTS.SCREEN_HEIGHT - 10) {
                         collided = true;
                         toRemove.push(index);
                         this.triggerExplosion(state, proj.x, proj.y, proj, newQueue);
                     }
                 }
            } else if (proj.weaponType === 'funky_bomb') {
                // Funky logic? Handled in explosion but movement could be erratic too?
                // Standard flight for now.
                proj.vx += state.wind * dt * 6;
                proj.vy += state.gravity * dt * 10;
                proj.x += proj.vx * dt;
                proj.y += proj.vy * dt;
            } else {
                // Normal flying
                proj.vx += state.wind * dt * 6;
                proj.vy += state.gravity * dt * 10;
                proj.x += proj.vx * dt;
                proj.y += proj.vy * dt;
            }

            // MIRV and Death's Head Logic
            if (!proj.splitDone && proj.vy > 0) {
                if (proj.weaponType === 'mirv') {
                    proj.splitDone = true;
                    const offsets = [-50, 50];
                    offsets.forEach(off => {
                        newQueue.push({
                            id: crypto.randomUUID(),
                            x: proj.x,
                            y: proj.y,
                            vx: proj.vx + off,
                            vy: proj.vy,
                            weaponType: 'mirv',
                            ownerId: proj.ownerId,
                            elapsedTime: 0,
                            trail: [],
                            splitDone: true,
                            generation: (proj.generation || 0) + 1
                        });
                    });
                } else if (proj.weaponType === 'death_head') {
                    proj.splitDone = true;
                    const numFragments = 5;
                    for (let i = 0; i < numFragments; i++) {
                        const spread = -100 + (i * 50);
                        newQueue.push({
                            id: crypto.randomUUID(),
                            x: proj.x,
                            y: proj.y,
                            vx: proj.vx + spread,
                            vy: proj.vy,
                            weaponType: 'baby_nuke',
                            ownerId: proj.ownerId,
                            elapsedTime: 0,
                            trail: [],
                            splitDone: true
                        });
                    }
                    toRemove.push(index);
                }
            }

            proj.elapsedTime += dt;

            // Trail
            proj.trail.push({ x: proj.x, y: proj.y });
            const maxTrail = proj.weaponType === 'tracer' ? 300 : 50;
            if (proj.trail.length > maxTrail) proj.trail.shift();

            // Check Collision
            if (this.checkCollision(state, proj)) {
                const owner = state.tanks.find(t => t.id === proj.ownerId);
                if (owner) {
                    owner.lastShotImpact = { x: proj.x, y: proj.y };
                }

                if (proj.weaponType === 'segway') {
                    // Start Rolling Unconditionally on ground contact
                    proj.state = 'rolling';
                    // Preserve some velocity but clamp it to be safe, don't zero it or explode
                    // Dampen velocity to prevent immediate explosion from speed check
                    proj.vx *= 0.8;
                    proj.vy = 0;

                    const groundY = this.terrainSystem.getGroundY(Math.floor(proj.x));
                    proj.y = groundY;

                    // Give a small nudge if stopped to ensure it rolls
                    if (Math.abs(proj.vx) < 10) {
                        proj.vx = (proj.vx >= 0 ? 1 : -1) * 20;
                    }
                } else if (proj.weaponType === 'leapfrog') {
                    // Bouncer Logic
                    proj.bounces = (proj.bounces || 0) + 1;

                    // Spawn small explosion at bounce point
                    this.triggerExplosion(state, proj.x, proj.y, { ...proj, weaponType: 'baby_missile' });

                    if (proj.bounces < 3) { // Bounce 2 times (explode on 3rd contact)
                        // Bounce!
                        proj.vy = -Math.abs(proj.vy) * 0.7; // Dampen
                        proj.vx *= 0.8; // Friction
                        proj.y -= 5; // Lift up
                    } else {
                        // Explode
                        collided = true;
                        toRemove.push(index);
                        this.triggerExplosion(state, proj.x, proj.y, proj, newQueue);
                    }
                } else if (proj.weaponType === 'digger' || proj.weaponType === 'baby_digger' || proj.weaponType === 'heavy_digger' ||
                           proj.weaponType === 'sandhog' || proj.weaponType === 'baby_sandhog' || proj.weaponType === 'heavy_sandhog') {
                    for (const tank of state.tanks) {
                        const dx = proj.x - tank.x;
                        const dy = proj.y - (tank.y - 10);
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 20) {
                            collided = true;
                            toRemove.push(index);
                            this.triggerExplosion(state, proj.x, proj.y, proj, newQueue);
                            break;
                        }
                    }
                } else {
                    collided = true;
                    toRemove.push(index);
                    // Trigger Explosion
                    this.triggerExplosion(state, proj.x, proj.y, proj, newQueue);
                }
            }

            // Bounds Check
            if (proj.x < 0 || proj.x > CONSTANTS.SCREEN_WIDTH || proj.y > CONSTANTS.SCREEN_HEIGHT) {
                if (proj.state === 'rolling') {
                    toRemove.push(index);
                    collided = true;
                } else {
                    toRemove.push(index);
                    if (proj.y > 600) collided = true;
                }
            }
        });

        // Add new projectiles
        if (newQueue.length > 0) {
            state.projectiles.push(...newQueue);
        }

        // Remove projectiles
        const uniqueToRemove = [...new Set(toRemove)].sort((a, b) => b - a);
        for (const idx of uniqueToRemove) {
            state.projectiles.splice(idx, 1);
        }

        if (state.projectiles.length === 0 && collided) {
            state.phase = GamePhase.EXPLOSION;
            state.lastExplosionTime = performance.now();
        }
    }

    private checkCollision(state: GameState, proj: any): boolean {
        // 1. Terrain Collision
        const y = Math.floor(proj.y);
        const x = Math.floor(proj.x);

        if (y < 0) return false;
        if (y >= CONSTANTS.SCREEN_HEIGHT) return true;

        if (proj.weaponType === 'digger' || proj.weaponType === 'baby_digger' || proj.weaponType === 'heavy_digger' ||
            proj.weaponType === 'sandhog' || proj.weaponType === 'baby_sandhog' || proj.weaponType === 'heavy_sandhog') return false;

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

    private triggerExplosion(state: GameState, x: number, y: number, proj?: any, newQueue?: any[]) {
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
                 for (let i = 0; i < 15; i++) { // Reduced count for performance
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
            for (let i = 0; i < 15; i++) { // Reduced count
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
             // Legacy fallback
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
                    // Hit a tank - position dirt at tank's Y coordinate
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

                // Higher launch for funky bomb
                newQueue.push({
                    id: crypto.randomUUID(),
                    x: x,
                    y: y - 20,
                    vx: Math.cos(rad) * speed,
                    vy: -Math.abs(Math.sin(rad) * speed) * 1.5, // Force UP
                    weaponType: 'baby_missile', // Just use baby missile for physics
                    ownerId: proj.ownerId || -1,
                    elapsedTime: 0,
                    trail: [],
                    color: colors[Math.floor(Math.random() * colors.length)] // Custom prop?
                });
            }
        }

        // Add visual explosion (skip if already handled or specific types)
        if (weaponId !== 'digger') {
            state.explosions.push({
                id: Math.random(),
                x, y,
                maxRadius: radius * (weaponId === 'nuke' ? 1.5 : 1.2),
                currentRadius: 0,
                duration: 0.5,
                elapsed: 0,
                color: proj?.color || weaponStats.color || 'orange' // Use proj color for funky
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
        const startY = tank.y - Math.sin(rad) * barrelLength;
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
             this.soundManager.playExplosion(); // Or custom sound?

             state.phase = GamePhase.TERRAIN_SETTLING; // Skip flying
             state.lastExplosionTime = performance.now();
             return;
        }

        // --- Particle Fire Logic ---
        if (weaponId === 'dirt_charge') {
            const count = 20; // Reduced for performance
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
