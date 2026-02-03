## Status: COMPLETE

# Spec 013: Fix Missile Costs

**Priority:** Critical
**Phase:** 1 (Critical Fixes)
**Estimated Effort:** Tiny

## Problem

Missile and Baby Missile costs do not match Requirements.md Section 2. This affects game balance and economic strategy.

## Requirements

Update weapon costs in `src/core/WeaponData.ts`:
- **Baby Missile:** $400
- **Missile:** $1,875

## Acceptance Criteria
- [x] Baby Missile cost is $400
- [x] Missile cost is $1,875
- [x] Shop displays correct prices
- [x] Can purchase at specified costs
- [x] Tests verify costs match spec

## Output

**Output when complete:** `<promise>DONE</promise>`
