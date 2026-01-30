import { type GameState, type ProjectileState, CONSTANTS } from '../../core/GameState';
import { TerrainSystem } from '../TerrainSystem';
import { SoundManager } from '../../core/SoundManager';
import { WEAPONS } from '../../core/WeaponData';

export interface PhysicsContext {
    terrainSystem: TerrainSystem;
    soundManager: SoundManager;
    triggerExplosion: (state: GameState, x: number, y: number, proj?: any, newQueue?: any[]) => void;
    addProjectile: (proj: any) => void; // To add new projectiles (mirv, fragments)
}

export interface WeaponBehavior {
    update(projectile: ProjectileState, state: GameState, dt: number, context: PhysicsContext): boolean; // returns true if removed
}

export class StandardFlightBehavior implements WeaponBehavior {
    update(projectile: ProjectileState, state: GameState, dt: number, context: PhysicsContext): boolean {
        // Normal flying
        projectile.vx += state.wind * dt * 6;
        projectile.vy += state.gravity * dt * 10;
        projectile.x += projectile.vx * dt;
        projectile.y += projectile.vy * dt;

        // MIRV and Death's Head Logic
        if (!projectile.splitDone && projectile.vy > 0) {
            if (projectile.weaponType === 'mirv') {
                projectile.splitDone = true;
                const offsets = [-50, 50];
                offsets.forEach(off => {
                    context.addProjectile({
                        id: crypto.randomUUID(),
                        x: projectile.x,
                        y: projectile.y,
                        vx: projectile.vx + off,
                        vy: projectile.vy,
                        weaponType: 'mirv',
                        ownerId: projectile.ownerId,
                        elapsedTime: 0,
                        trail: [],
                        splitDone: true,
                        generation: (projectile.generation || 0) + 1
                    });
                });
            } else if (projectile.weaponType === 'death_head') {
                projectile.splitDone = true;
                const numFragments = 5;
                for (let i = 0; i < numFragments; i++) {
                    const spread = -100 + (i * 50);
                    context.addProjectile({
                        id: crypto.randomUUID(),
                        x: projectile.x,
                        y: projectile.y,
                        vx: projectile.vx + spread,
                        vy: projectile.vy,
                        weaponType: 'baby_nuke',
                        ownerId: projectile.ownerId,
                        elapsedTime: 0,
                        trail: [],
                        splitDone: true
                    });
                }
                return true; // Remove parent
            }
        }

        // Leapfrog (Bouncer) Logic
        if (projectile.weaponType === 'leapfrog') {
             // Check for ground collision to bounce
             // Note: Standard collision check usually handles this, but for bouncer we need interception
             // This is handled in collision check in PhysicsSystem usually.
             // But if we move logic here, we need to know if it HIT something.
             // StandardFlight just updates position. Collision is external or needs to be injected?
        }

        return false;
    }
}

export class ParticleBehavior implements WeaponBehavior {
    update(proj: ProjectileState, state: GameState, dt: number, context: PhysicsContext): boolean {
        const weaponId = proj.weaponType;

        // Gravity
        proj.vy += state.gravity * dt * 5;

        // Movement
        proj.x += proj.vx * dt;
        proj.y += proj.vy * dt;

        // Ground Check
        const groundY = context.terrainSystem.getGroundY(Math.floor(proj.x));

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
                    context.terrainSystem.addTerrain(state, tank.x, tank.y, 6, WEAPONS['liquid_dirt']?.color);
                    return true;
                }
            }
        }

        if (proj.y >= groundY) {
            proj.y = groundY;

            // Simple "Ooze" / Rolling physics for particles
            const groundYNext = context.terrainSystem.getGroundY(Math.floor(proj.x + (proj.vx > 0 ? 5 : -5)));
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
                    context.terrainSystem.explode(state, proj.x, proj.y, 5);
                }
            }

            // Stop condition
            if (Math.abs(proj.vx) < 5) {
                if (weaponId === 'liquid_dirt_particle' || weaponId === 'dirt_particle') {
                    const color = weaponId === 'liquid_dirt_particle' ? WEAPONS['liquid_dirt']?.color : undefined;
                    context.terrainSystem.addTerrain(state, proj.x, proj.y, 6, color);
                    return true;
                } else if (weaponId === 'napalm_particle') {
                    // Napalm dies out eventually (handled by elapsedTime below) or stops and burns a bit more
                }
            }
        }

        proj.elapsedTime += dt;
        if (proj.elapsedTime > 2.0) { // Lifetime
            if (weaponId === 'napalm_particle') {
                    context.terrainSystem.explode(state, proj.x, proj.y, 8); // Final poof
            }
            return true;
        }
        return false;
    }
}

export class RollingBehavior implements WeaponBehavior {
    update(proj: ProjectileState, state: GameState, dt: number, context: PhysicsContext): boolean {
        // Get slope
        const groundY = context.terrainSystem.getGroundY(Math.floor(proj.x));
        const groundYNext = context.terrainSystem.getGroundY(Math.floor(proj.x + (proj.vx > 0 ? 5 : -5)));

        // Slope angle
        const dy = groundYNext - groundY;
        const dx = (proj.vx > 0 ? 5 : -5);
        const angle = Math.atan2(dy, dx); // Radians

        // Gravity component
        const gravity = 100;
        const ax = gravity * Math.sin(angle);

        // Friction
        const friction = 30;
        if (proj.vx > 0) proj.vx -= friction * dt;
        else if (proj.vx < 0) proj.vx += friction * dt;

        // Apply Slope Gravity
        proj.vx += ax * dt * 8;

        proj.x += proj.vx * dt;

        // Snap to ground
        const newGroundY = context.terrainSystem.getGroundY(Math.floor(proj.x));

        // Wall Check / steep slope check
        if (Math.abs(dy) > 15) {
            // Reflect velocity slightly
            proj.vx = -proj.vx * 0.5;
            // If still stuck, explode
            if (Math.abs(proj.vx) < 5) {
                    context.triggerExplosion(state, proj.x, proj.y, proj);
                    return true;
            }
        } else {
            proj.y = newGroundY;
        }

        // Stop if too slow
        if (Math.abs(proj.vx) < 5) {
            context.triggerExplosion(state, proj.x, proj.y, proj);
            return true;
        }

        // Check Tank Collision
        for (const tank of state.tanks) {
            if (tank.health <= 0) continue;
            const tdx = proj.x - tank.x;
            const tdy = proj.y - (tank.y - 10);
            const dist = Math.sqrt(tdx * tdx + tdy * tdy);
            if (dist < 20) {
                context.triggerExplosion(state, proj.x, proj.y, proj);
                return true;
            }
        }

        return false;
    }
}

export class DiggingBehavior implements WeaponBehavior {
    update(proj: ProjectileState, state: GameState, dt: number, context: PhysicsContext): boolean {
        proj.vx += state.wind * dt * 0.1;
        proj.vy += state.gravity * dt * 10;

        // Add weaving noise
        const time = performance.now() / 100;
        
        // Sandhog vs Digger weave
        if (proj.weaponType.includes('sandhog')) {
             proj.vx += Math.cos(time) * 50 * dt; 
        } else {
             proj.vx += Math.sin(time) * 50 * dt;
        }

        proj.x += proj.vx * dt;
        proj.y += proj.vy * dt;

        // Digging effect
        const groundY = context.terrainSystem.getGroundY(Math.floor(proj.x));
        if (proj.y > groundY) {
            context.terrainSystem.explode(state, proj.x, proj.y, 10);
            
            // Sandhog deep explosion check
             if (proj.weaponType.includes('sandhog') && proj.y >= CONSTANTS.SCREEN_HEIGHT - 10) {
                 context.triggerExplosion(state, proj.x, proj.y, proj);
                 return true;
             }
        }
        
        // Digger/Sandhog Collision Logic with Tanks (Explicit check needed as they ignore terrain)
        for (const tank of state.tanks) {
            const dx = proj.x - tank.x;
            const dy = proj.y - (tank.y - 10);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 20) {
                context.triggerExplosion(state, proj.x, proj.y, proj);
                return true;
            }
        }

        return false;
    }
}
