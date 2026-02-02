# Weapon Bundle System (Spec 002)

**Date:** 2026-02-02  
**Status:** Complete

## What Was Done

Implemented weapon bundle purchase system per Requirements.md specification:

### Changes Made

1. **WeaponData.ts**
   - Added `bundleSize` property to `WeaponStats` interface
   - Set bundle sizes for all weapons based on Requirements.md table:
     - Baby Missile: 10 per purchase
     - Missile: 5 per purchase
     - Baby Nuke: 3 per purchase
     - Nuke: 1 per purchase
     - MIRV: 3 per purchase
     - Napalm: 10 per purchase
     - Heavy Roller: 2 per purchase
     - (and all other weapons per spec)

2. **ShopSystem.ts**
   - Modified `handleBuyWeapon()` to add `bundleSize` items instead of 1
   - Enforced 99 item maximum per inventory slot using `Math.min(currentCount + bundleSize, 99)`
   - Prevents purchase if already at 99 (no credit deduction)

3. **UIManager.ts**
   - Updated shop card display to show bundle size: `$1,875 (x5)` for bundles > 1
   - Single items show just the price

4. **Tests**
   - Updated `new_shop.test.ts` to expect bundleSize instead of 1
   - Created `weapon-bundles.test.ts` with comprehensive tests:
     - Bundle purchases (5, 10, etc.)
     - 99 max enforcement
     - No purchase at max
     - All weapons have bundleSize defined

## Testing

- All 57 tests pass
- Build succeeds
- Bundle purchases work correctly
- 99 max cap enforced
- UI displays bundle counts

## Lessons Learned

- Bundle system is straightforward: multiply purchases by bundleSize, cap at 99
- UI enhancement shows bundle info inline with price
- Test coverage verified all edge cases (at max, partial bundle)
- Requirements.md table was authoritative for bundle sizes
