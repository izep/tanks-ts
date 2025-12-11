import { type GameState, GamePhase, type ProjectileState } from '../core/GameState';
import { TerrainSystem } from './TerrainSystem';
import { WEAPONS } from '../core/WeaponData';

export class PhysicsSystem {
    private terrainSystem: TerrainSystem;

    constructor(terrainSystem: TerrainSystem) {
        this.terrainSystem = terrainSystem;
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
            // Physics: Gravity + Wind
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
                const friction = 50; // Deceleration
                if (proj.vx > 0) proj.vx -= friction * dt;
                else if (proj.vx < 0) proj.vx += friction * dt;

                // Apply Slope Gravity
                proj.vx += ax * dt * 5; // Multiplier for effect

                proj.x += proj.vx * dt;

                // Snap to ground
                const newGroundY = this.terrainSystem.getGroundY(Math.floor(proj.x));

                // Wall Check / steep slope check
                // If we hit a vertical wall (diff huge), explode or reflect?
                // For roller, explode on wall.
                if (Math.abs(dy) > 10) {
                    // Too steep/Wall
                    collided = true;
                    toRemove.push(index);
                    this.triggerExplosion(state, proj.x, proj.y);
                } else {
                    proj.y = newGroundY;
                }

                // Stop if too slow
                if (Math.abs(proj.vx) < 10) {
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
            } else if (proj.weaponType === 'digger') {
                // Digger Logic
                proj.vx += state.wind * dt * 0.1; // Less wind effect
                proj.vy += state.gravity * dt * 10;
                proj.x += proj.vx * dt;
                proj.y += proj.vy * dt;

                // Digging effect
                const groundY = this.terrainSystem.getGroundY(Math.floor(proj.x));
                if (proj.y > groundY) {
                    // We are underground. Dig!
                    this.terrainSystem.explode(state, proj.x, proj.y, 10); // Small tunnel radius
                }
            } else if (proj.weaponType === 'napalm_particle') {
                // Napalm Particle Logic (Simple falling, burns on contact)
                proj.vy += state.gravity * dt * 5; // Light gravity
                proj.x += proj.vx * dt;
                proj.y += proj.vy * dt;

                // If hits ground, burn and die
                const groundY = this.terrainSystem.getGroundY(Math.floor(proj.x));
                if (proj.y >= groundY) {
                    collided = true;
                    toRemove.push(index);
                    this.triggerExplosion(state, proj.x, proj.y, proj, newQueue); // Will trigger burn logic
                }
            } else {
                // Normal flying
                proj.vx += state.wind * dt;
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
                    // MIRV stays alive but marked split? Python says keep it.
                    // But usually MIRV splits essentially converting itself. 
                    // If we keep it, we get 3 projectiles (parent + 2 children).
                    // Fine for now.
                } else if (proj.weaponType === 'death_head') {
                    // Death's Head: Splits into multiple powerful warheads
                    proj.splitDone = true;
                    const numFragments = 5;
                    for (let i = 0; i < numFragments; i++) {
                        // Spread downwards
                        const spread = -100 + (i * 50); // -100 to 100
                        newQueue.push({
                            id: crypto.randomUUID(),
                            x: proj.x,
                            y: proj.y,
                            vx: proj.vx + spread,
                            vy: proj.vy, // Keep falling
                            weaponType: 'baby_nuke', // Powerful sub-munitions
                            ownerId: proj.ownerId,
                            elapsedTime: 0,
                            trail: [],
                            splitDone: true
                        });
                    }
                    // Remove parent
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
                if (proj.weaponType === 'segway' && proj.state !== 'rolling') {
                    // Start Rolling
                    proj.state = 'rolling';
                    const groundY = this.terrainSystem.getGroundY(Math.floor(proj.x));
                    proj.y = groundY;
                } else if (proj.weaponType === 'leapfrog') {
                    // Bouncer Logic
                    proj.bounces = (proj.bounces || 0) + 1;
                    if (proj.bounces < 3) {
                        // Bounce!
                        proj.vy = -Math.abs(proj.vy) * 0.7; // Dampen
                        proj.vx *= 0.8; // Friction
                        proj.y -= 5; // Lift up slightly to avoid getting stuck
                        // Maybe add sound?
                    } else {
                        // Explode
                        collided = true;
                        toRemove.push(index);
                        this.triggerExplosion(state, proj.x, proj.y, proj, newQueue);
                    }
                } else if (proj.weaponType === 'digger') {
                    // Digger keeps going until offscreen or hits tank (handled inside Digger loop branch?)
                    // Actually Digger loop handled movement. Bounds/Tank collision check needed.
                    // We check tank collision here for Digger too.
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
                } else if (proj.weaponType !== 'napalm_particle') { // Napalm particles handled in loop
                    collided = true;
                    toRemove.push(index);
                    // Trigger Explosion
                    this.triggerExplosion(state, proj.x, proj.y, proj, newQueue);
                }
            }

            // Bounds Check
            if (proj.x < 0 || proj.x > 800 || proj.y > 600) {
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
        // Use a Set to avoid duplicates if added multiple times (logic above is careful though)
        // Reverse sort for splice safety
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
        if (y >= 600) return true;

        // Optim: Don't check terrain for 'digger' here, handled in loop?
        // Actually keep it generic. Digger needs special casing in calling code.
        // Calling call checks weapon type.
        if (proj.weaponType === 'digger') return false;

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
        const weaponId = proj?.weaponType || 'missile';
        const weaponStats = WEAPONS[weaponId] || WEAPONS['missile'];
        const radius = weaponStats.radius;

        // Special Logic based on type
        if (weaponStats.type === 'dirt') {
            // Riot Bomb
            this.terrainSystem.addTerrain(state, x, y, radius);
        } else if (weaponStats.type === 'napalm' && newQueue) {
            // Napalm: Spawn particles
            for (let i = 0; i < 20; i++) {
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
            this.terrainSystem.explode(state, x, y, 20);
        } else if (weaponId === 'napalm_particle') {
            this.terrainSystem.explode(state, x, y, 10);
        } else {
            this.terrainSystem.explode(state, x, y, radius);
        }

        // Funky Bomb Logic
        if (proj && proj.weaponType === 'funky_bomb' && newQueue) {
            for (let i = 0; i < 5; i++) {
                const angle = Math.random() * 180;
                const power = 100 + Math.random() * 200;
                const rad = (angle * Math.PI) / 180;
                const speed = power * 0.5;

                newQueue.push({
                    id: crypto.randomUUID(),
                    x: x,
                    y: y - 10,
                    vx: Math.cos(rad) * speed,
                    vy: -Math.sin(rad) * speed,
                    weaponType: 'baby_missile',
                    ownerId: proj.ownerId || -1,
                    elapsedTime: 0,
                    trail: []
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
                color: weaponStats.color || 'orange'
            });
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
                        // Shield Logic
                        if (tank.activeShield && tank.shieldHealth && tank.shieldHealth > 0) {
                            const absorbed = Math.min(damage, tank.shieldHealth);
                            tank.shieldHealth -= absorbed;
                            damage -= absorbed;
                            console.log(`Shield absorbed ${absorbed} damage! Remaining Shield: ${tank.shieldHealth} `);
                            if (tank.shieldHealth <= 0) {
                                tank.activeShield = undefined;
                                console.log("Shield broken!");
                            }
                        }

                        if (damage > 0) {
                            tank.health -= damage;
                            console.log(`Tank ${tank.name} took ${damage} damage! Remaining: ${tank.health}`);
                            if (tank.health <= 0) {
                                tank.isDead = true;
                                console.log(`Tank ${tank.name} died!`);
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
                    console.log("Parachute deployed mid-air!");
                }

                if (tank.isParachuteDeployed) {
                    // Drag / Cap velocity
                    const terminal = 60; // Slow descent
                    if (tank.vy > terminal) {
                        // Decelerate strongly
                        tank.vy = Math.max(terminal, tank.vy - 300 * dt);
                    }
                }

                tank.y += tank.vy * dt;

                if (tank.y > groundY) {
                    tank.y = groundY;

                    // Initial spawn check
                    if (tank.hasLanded === false) {
                        tank.hasLanded = true;
                        tank.vy = 0;
                        tank.isFalling = false;
                        return;
                    }

                    // Damage Calculation
                    let finalDamage = 0;
                    if (tank.isParachuteDeployed) {
                        // Safe landing
                        tank.isParachuteDeployed = false;
                    } else {
                        const rawDamage = Math.max(0, (tank.vy - 100) / 5);
                        finalDamage = Math.floor(rawDamage);
                    }

                    if (finalDamage > 0) {
                        // Fallback impact check (if chute didn't deploy for some reason?)
                        // If we consumed chute mid-air, we are safe.
                        // If we didn't, maybe we check if we HAVE one and velocity is high?
                        // Consistent with old logic:
                        if ((tank.accessories['parachute'] || 0) > 0 && finalDamage >= (tank.parachuteThreshold || 15)) {
                            // Emergency deploy on impact (too late for visual but saves life)
                            tank.accessories['parachute']--;
                            finalDamage = 0;
                            console.log("Emergency Parachute on impact!");
                        }

                        if (finalDamage > 0) {
                            tank.health -= finalDamage;
                            console.log(`Fall damage: ${finalDamage}`);
                            if (tank.health <= 0) {
                                tank.isDead = true;
                                console.log(`Tank ${tank.name} died from fall!`);
                            }
                        }
                    }
                    tank.vy = 0;
                    tank.isFalling = false;
                    tank.isParachuteDeployed = false; // Ensure reset
                }
            } else if (tank.y > groundY + 2) {
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
            console.log("Round Over! (Physics)");
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

        // Triple Turret Logic (Variant 6)
        // Only for basic missiles
        if (tank.variant === 6 && (weaponId === 'baby_missile' || weaponId === 'missile')) {
            const offsets = [-10, 10]; // Degrees offset
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
