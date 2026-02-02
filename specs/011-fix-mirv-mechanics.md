## Status: COMPLETE

# Spec 011: Fix MIRV Mechanics

**Priority:** Critical  
**Phase:** 1 (Core Weapons)  
**Estimated Effort:** Medium

## Problem

MIRV currently splits incorrectly (only 2 warheads instead of 5) and doesn't properly fizzle if it hits terrain before apogee.

## Requirements

Fix MIRV per Requirements.md and TODO.md:

1. **Split at apogee:** Deploy warheads when projectile reaches highest point (vy > 0, transitioning from upward to downward)
2. **Deploy 5 warheads:** Not 2 (current implementation only creates 2 with offsets -50, 50)
3. **Fizzle on early hit:** If MIRV hits terrain before reaching apogee, it should explode normally (no split)
4. **Warhead spread:** Evenly distribute 5 warheads across horizontal spread

## Current Implementation Issues

From `src/systems/physics/WeaponBehavior.ts` lines 27-45:
- Only creates 2 warheads (offsets -50, 50)
- Should create 5 warheads with proper spread
- Spec requires 5 missile-like warheads

## Acceptance Criteria

- [x] MIRV deploys exactly 5 warheads at apogee
- [x] Warheads spread evenly (e.g., offsets: -100, -50, 0, 50, 100)
- [x] Split only occurs when vy > 0 (past apogee, descending)
- [x] If MIRV hits terrain before apogee, explodes without splitting
- [x] Each warhead behaves like a missile (normal projectile)
- [x] Tests verify 5-warhead deployment
- [x] Tests verify fizzle on early terrain hit
- [x] Build succeeds

## Verification

1. Fire MIRV - verify reaches apogee before splitting
2. Count warheads - verify exactly 5 created
3. Fire MIRV into terrain - verify explodes without splitting
4. Check warhead spread - verify even distribution
5. Run `npm test` - all tests pass
6. Run `npm run build` - build succeeds

## Technical Notes

```typescript
// In StandardFlightBehavior.update()
if (!projectile.splitDone && projectile.vy > 0) {
    if (projectile.weaponType === 'mirv') {
        projectile.splitDone = true;
        
        // Create 5 warheads with even spread
        const offsets = [-100, -50, 0, 50, 100];
        offsets.forEach(off => {
            context.addProjectile({
                id: generateId(),
                x: projectile.x,
                y: projectile.y,
                vx: projectile.vx + off,
                vy: projectile.vy,
                weaponType: 'missile', // Each warhead is a missile
                ownerId: projectile.ownerId,
                elapsedTime: 0,
                trail: [],
                splitDone: true
            });
        });
        return true; // Remove parent MIRV
    }
}
```

## Output

**Output when complete:** `<promise>DONE</promise>`

<!-- NR_OF_TRIES: 1 -->
