# Spec 012: Fix Leapfrog Mechanics - COMPLETE

**Date:** 2026-02-03 01:10
**Session:** Ralph Loop Implementation

## Problem

Leapfrog was incorrectly bouncing 3 times on terrain. Per Requirements.md, it should deploy 3 sequential warheads where each warhead fires AFTER the previous one explodes.

## Implementation

### Changes Made

1. **GameState.ts**: Added `leapfrogStage` field to `ProjectileState` interface
2. **WeaponBehavior.ts**: Completely rewrote `LeapfrogBehavior` class:
   - Removed bouncing logic
   - Added sequential warhead deployment
   - Each warhead explodes and launches the next one
   - Stops after 3 warheads

3. **weapons.test.ts**: Enhanced test to verify all 3 sequential explosions

### Technical Details

```typescript
// Sequential warhead launch logic:
if (hit) {
    // Explode current warhead
    context.triggerExplosion(state, projectile.x, projectile.y, projectile);
    
    // Increment stage
    projectile.leapfrogStage = (projectile.leapfrogStage || 0) + 1;
    
    // Launch next warhead if we haven't launched all 3
    if (projectile.leapfrogStage < 3) {
        // Launch next warhead from explosion point
        const nextWarhead = {
            ...projectile,
            id: generateId(),
            y: projectile.y - 10, // Launch slightly above explosion
            vx: projectile.vx * 0.8, // Dampened velocity
            vy: -100, // Launch upward
            leapfrogStage: projectile.leapfrogStage
        };
        context.addProjectile(nextWarhead);
    }
    return true; // Remove current warhead
}
```

## Verification

✅ All 9 acceptance criteria met:
1. First warhead deploys on impact - verified
2. First warhead explodes immediately - verified
3. Second warhead launches from explosion point - verified
4. Second warhead explodes on impact - verified
5. Third warhead launches from second explosion - verified
6. Third warhead explodes on impact - verified
7. Total: 3 sequential explosions (not bounces) - verified
8. Tests verify sequential firing pattern - enhanced test passes
9. Build succeeds - confirmed

**Test Output:**
```
MockExplode at 405 500
MockExplode at 413 500
MockExplode at 419.4 500
```

**Test Results:** 99/99 tests passing
**Build Status:** Success

## Lessons Learned

1. **Sequential behavior needs stage tracking:** Using `leapfrogStage` to track which warhead (0, 1, 2) is active
2. **Immediate launch works well:** No delay needed between explosion and next warhead launch
3. **Physics dampening improves gameplay:** Each warhead has slightly reduced velocity (0.8x) for natural spread

## Next Steps

Spec 012 complete. All current specs (001-012) are now complete.
