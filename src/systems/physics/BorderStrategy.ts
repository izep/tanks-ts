import { type ProjectileState, CONSTANTS } from '../../core/GameState';

export const BorderAction = {
    NONE: 0,
    DESTROY: 1,
    BOUNCE: 2,
    WRAP: 3,
    EXPLODE: 4
} as const;

export type BorderAction = typeof BorderAction[keyof typeof BorderAction];

export interface BorderStrategy {
    check(projectile: ProjectileState): BorderAction;
    /**
     * Applies the border action to the projectile.
     * Returns true if the projectile should be removed/destroyed.
     */
    apply(projectile: ProjectileState, action: BorderAction): boolean;
}

export class DefaultBorderStrategy implements BorderStrategy {
    check(projectile: ProjectileState): BorderAction {
        const { x, y } = projectile;
        const { SCREEN_WIDTH, SCREEN_HEIGHT } = CONSTANTS;

        if (y > SCREEN_HEIGHT) return BorderAction.EXPLODE;
        if (x < 0 || x > SCREEN_WIDTH) return BorderAction.DESTROY;

        return BorderAction.NONE;
    }

    apply(_projectile: ProjectileState, action: BorderAction): boolean {
        return action === BorderAction.DESTROY || action === BorderAction.EXPLODE;
    }
}

export class WrapBorderStrategy implements BorderStrategy {
    check(projectile: ProjectileState): BorderAction {
        const { x, y } = projectile;
        const { SCREEN_WIDTH, SCREEN_HEIGHT } = CONSTANTS;

        if (y > SCREEN_HEIGHT) return BorderAction.DESTROY;
        if (x < 0 || x > SCREEN_WIDTH) return BorderAction.WRAP;

        return BorderAction.NONE;
    }

    apply(projectile: ProjectileState, action: BorderAction): boolean {
        if (action === BorderAction.DESTROY) return true;

        if (action === BorderAction.WRAP) {
            const { SCREEN_WIDTH } = CONSTANTS;
            if (projectile.x < 0) projectile.x += SCREEN_WIDTH;
            else if (projectile.x > SCREEN_WIDTH) projectile.x -= SCREEN_WIDTH;
            return false;
        }

        return false;
    }
}

export class BounceBorderStrategy implements BorderStrategy {
    check(projectile: ProjectileState): BorderAction {
        const { x, y } = projectile;
        const { SCREEN_WIDTH, SCREEN_HEIGHT } = CONSTANTS;

        if (y > SCREEN_HEIGHT) return BorderAction.DESTROY;
        if (x < 0 || x > SCREEN_WIDTH) return BorderAction.BOUNCE;

        return BorderAction.NONE;
    }

    apply(projectile: ProjectileState, action: BorderAction): boolean {
        if (action === BorderAction.DESTROY) return true;

        if (action === BorderAction.BOUNCE) {
            projectile.vx = -projectile.vx * 0.8; // Lose some energy
            // Push back in
            if (projectile.x < 0) projectile.x = 0;
            else if (projectile.x > CONSTANTS.SCREEN_WIDTH) projectile.x = CONSTANTS.SCREEN_WIDTH;
            return false;
        }

        return false;
    }
}

export class ConcreteBorderStrategy implements BorderStrategy {
    check(projectile: ProjectileState): BorderAction {
        const { x, y } = projectile;
        const { SCREEN_WIDTH, SCREEN_HEIGHT } = CONSTANTS;

        if (y > SCREEN_HEIGHT) return BorderAction.EXPLODE;
        if (x < 0 || x > SCREEN_WIDTH) return BorderAction.EXPLODE;

        return BorderAction.NONE;
    }

    apply(_projectile: ProjectileState, action: BorderAction): boolean {
        return action === BorderAction.DESTROY || action === BorderAction.EXPLODE;
    }
}
