# Ralph Re-Verification: Spec 001 - Regression Found and Fixed

**Date:** 2026-02-02  
**Spec:** 001-fix-weapon-costs.md  
**Status:** Fixed regression

## What Happened

During re-verification mode (all specs marked complete), randomly selected spec 001 for strict verification. Found **4 accessory prices were incorrect**, failing the spec's acceptance criteria.

## Regression Details

Weapon costs were correct, but accessory prices were wrong:
- **Fuel:** $2,000 (should be $10,000)
- **Battery:** $1,500 (should be $5,000)
- **Shield:** $5,000 (should be $20,000)
- **Parachute:** $1,000 (should be $10,000)

Source of truth: `Screenshots/SCORCH.txt` (original game data).

## Fix Applied

Updated `src/core/WeaponData.ts` with correct prices:
- Fuel: 2000 → 10000
- Battery: 1500 → 5000
- Shield: 5000 → 20000
- Parachute: 1000 → 10000

Updated test files to reflect new prices:
- `tests/accessories.test.ts` - increased starting credits in two tests
- `tests/new_shop.test.ts` - increased starting credits in two tests

## Verification

- All tests pass (95/95)
- Build succeeds
- Spec 001 acceptance criteria now 100% met

## Lesson Learned

**Always verify accessory/item prices, not just weapon prices.** The Requirements.md didn't have explicit accessory pricing table, but `SCORCH.txt` had the reference data.

Re-verification mode caught this regression - the process works!
