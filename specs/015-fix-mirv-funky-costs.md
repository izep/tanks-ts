## Status: COMPLETE

# Spec 015: Fix MIRV and Funky Bomb Costs

**Priority:** Critical
**Phase:** 1 (Critical Fixes)
**Estimated Effort:** Tiny

## Problem

MIRV and Funky Bomb costs do not match Requirements.md Section 2. This affects game balance and economic strategy.

## Requirements

Update weapon costs in `src/core/WeaponData.ts`:
- **MIRV:** $10,000
- **Funky Bomb:** $7,000

## Acceptance Criteria
- [x] MIRV cost is $10,000
- [x] Funky Bomb cost is $7,000
- [x] Shop displays correct prices
- [x] Can purchase at specified costs
- [x] Tests verify costs match spec

## Output

**Output when complete:** `<promise>DONE</promise>`
