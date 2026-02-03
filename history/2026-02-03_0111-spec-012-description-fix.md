# Spec 012 Re-Verification: Leapfrog Description Fix

**Date:** 2026-02-03 01:11 UTC  
**Spec:** 012-fix-leapfrog-mechanics.md  
**Status:** Minor documentation error fixed

## Issue Found

During re-verification of spec 012, discovered that `WeaponData.ts` line 364 had incorrect description:
- **Incorrect:** "Bounces 3 times before exploding."
- **Correct:** "Fires 3 sequential warheads, each launching after the previous explodes."

## Root Cause

The implementation in `WeaponBehavior.ts` (LeapfrogBehavior class, lines 80-154) was correctly implementing sequential warhead launches, but the weapon description text was never updated from the old bouncing behavior.

## Fix Applied

Updated `src/core/WeaponData.ts` line 364 to accurately describe the sequential warhead mechanic.

## Verification

- ✅ All tests pass (99/99)
- ✅ Build succeeds
- ✅ Leapfrog tests confirm 3 sequential warheads
- ✅ Implementation matches specification

## Lessons Learned

1. **Descriptions matter:** User-facing text should match actual behavior
2. **Re-verification works:** Found subtle inconsistency that didn't affect functionality but would confuse players
3. **Test coverage good:** Tests correctly verify the sequential behavior, not the old bouncing behavior
