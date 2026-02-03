## Status: INCOMPLETE

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
- [ ] Baby Missile cost is $400
- [ ] Missile cost is $1,875
- [ ] Shop displays correct prices
- [ ] Can purchase at specified costs
- [ ] Tests verify costs match spec

## Output

**Output when complete:** `<promise>DONE</promise>`
