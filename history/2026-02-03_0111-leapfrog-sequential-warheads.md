# Leapfrog Sequential Warhead Implementation

**Date:** 2026-02-03 01:11 UTC  
**Spec:** 012-fix-leapfrog-mechanics.md  
**Status:** ✅ COMPLETE

## Summary

Fixed Leapfrog mechanics to match Requirements.md specification: "The Leapfrog has three warheads which launch one after another."

## What Changed

### Code Changes
1. **WeaponBehavior.ts (LeapfrogBehavior):** Replaced bouncing logic with sequential warhead deployment
2. **GameState.ts:** Added `leapfrogStage?: number` to `ProjectileState` interface
3. **leapfrog.test.ts:** Created comprehensive test suite (4 tests)
4. **weapons.test.ts:** Updated existing test to verify sequential behavior

### Key Implementation Details
- Each warhead tracks its stage (0, 1, 2)
- On impact, current warhead explodes and launches next warhead
- Next warhead inherits dampened velocity but launches upward
- After 3 warheads (stages 0, 1, 2), no more launches

## Lessons Learned

1. **Spec clarity matters:** Requirements.md was clear ("launch one after another"), but previous implementation incorrectly used bouncing
2. **State tracking:** Added `leapfrogStage` property to track which warhead in sequence
3. **Test coverage:** Sequential behavior requires multi-step testing to verify all 3 warheads fire
4. **Physics inheritance:** Each new warhead inherits position and velocity from explosion point

## Test Results

```
✓ tests/leapfrog.test.ts (4 tests) 5ms
  ✓ should deploy 3 sequential warheads
  ✓ should explode each warhead on impact
  ✓ should follow normal projectile physics
  ✓ should be effective against shields (3 sequential hits)

All 99 tests pass
Build succeeds
```

## Verification Notes

- Sequential explosions create "walking" effect toward target
- Effective for shield penetration (3 separate attacks)
- Each warhead follows standard projectile physics (wind/gravity)
- Visual: 3 distinct explosions in progression

## Related Specs

- Spec 011 (MIRV): Similar multi-warhead concept but deploys simultaneously at apogee
- Death's Head (not yet specced): 9 warheads, similar to MIRV pattern
