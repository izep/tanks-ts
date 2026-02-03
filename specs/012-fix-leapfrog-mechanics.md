## Status: COMPLETE

# Spec 012: Fix Leapfrog Mechanics

**Priority:** Critical  
**Phase:** 1 (Critical Fixes)  
**Estimated Effort:** Medium

## Problem

Leapfrog currently bounces on terrain (incorrect behavior). Per Requirements.md, Leapfrog should deploy 3 sequential warheads, where each warhead fires AFTER the previous one explodes.

## Requirements

Fix Leapfrog per Requirements.md and TODO.md:

1. **Sequential launches:** Deploy 3 warheads one at a time
2. **Timing:** Each warhead fires only after previous warhead explodes
3. **Trajectory:** Each warhead follows normal projectile physics
4. **Spacing:** Warheads land progressively further (not simultaneously)

**Current incorrect behavior:**
- Leapfrog bounces 3 times on terrain
- Should instead fire 3 separate warheads sequentially

## Acceptance Criteria

- [x] Leapfrog deploys first warhead on impact
- [x] First warhead explodes immediately
- [x] Second warhead launches from explosion point
- [x] Second warhead explodes on impact
- [x] Third warhead launches from second explosion
- [x] Third warhead explodes on impact
- [x] Total: 3 sequential explosions (not 3 bounces)
- [x] Tests verify sequential firing pattern
- [x] Build succeeds

## Verification

1. Fire Leapfrog - verify no bouncing behavior
2. Count explosions - verify exactly 3 sequential blasts
3. Observe timing - verify each warhead waits for previous explosion
4. Check spacing - verify progressive landing pattern
5. Run `npm test` - all tests pass
6. Run `npm run build` - build succeeds

## Technical Notes

```typescript
// Remove bouncing logic
// Replace with sequential warhead deployment

interface LeapfrogState {
    stage: 0 | 1 | 2 | 3; // Which warhead is active
    lastExplosionTime: number;
    launchDelay: number; // ms between explosion and next launch
}

// On first impact
if (projectile.weaponType === 'leapfrog' && projectile.stage === 0) {
    explode(projectile.x, projectile.y);
    projectile.stage = 1;
    projectile.lastExplosionTime = Date.now();
    
    // Launch next warhead after delay
    setTimeout(() => {
        launchWarhead(projectile.x, projectile.y, 2);
    }, launchDelay);
}
```

## Output

**Output when complete:** `<promise>DONE</promise>`

<!-- NR_OF_TRIES: 1 -->
