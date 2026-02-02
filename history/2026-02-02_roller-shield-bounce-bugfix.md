# Roller Shield Bounce Bugfix

**Date:** 2026-02-02  
**Context:** Re-verification of Spec 006 (Implement Roller Family)

## Issue Found

During re-verification, discovered that roller shield bounce behavior was incomplete:
- Test coverage: Only 1 test existed (downhill rolling)
- Missing tests for: valley stops, tank collisions, shield bounces, blast radii

## Root Cause

PhysicsSystem collision check (lines 126-152) didn't skip rollers in 'rolling' state. 

**Bug:** Rollers already rolling would hit the collision check and explode, even after bouncing off shields. The RollingBehavior correctly handled shield bounces internally, but then PhysicsSystem would override that decision.

## Solution

Added `proj.state !== 'rolling'` to the collision check exclusion list at line 137. Now rollers in rolling state handle all their own collisions (including shield bounces) without interference.

## Tests Added

1. **Roller stops and explodes when velocity too low** - ✅
2. **Roller explodes on tank collision** - ✅  
3. **Roller bounces off shielded tank** - ✅ (was failing, now fixed)

## Lessons Learned

1. **Re-verification catches regressions** - Even "complete" specs may have bugs or incomplete tests
2. **State-based behavior needs careful collision handling** - When objects transition states (projectile → rolling), collision logic must account for both states
3. **Internal behavior vs external collision** - When behaviors handle collisions internally, the main physics loop must skip duplicate checks
4. **Test coverage matters** - The original implementation looked complete but lacked tests for edge cases

## Files Changed

- `src/systems/PhysicsSystem.ts` - Added rolling state to collision skip list
- `tests/physics_roller.test.ts` - Added 3 comprehensive tests

## Verification

- ✅ All 4 roller tests pass
- ✅ All 91 project tests pass
- ✅ Build succeeds

## Impact

This was a critical bug that prevented shield interactions with rollers from working correctly. Now rollers properly:
- Roll downhill
- Stop in valleys
- Explode on unshielded tanks
- Bounce off shielded tanks

