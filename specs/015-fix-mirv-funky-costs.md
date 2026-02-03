## Status: INCOMPLETE

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
- [ ] MIRV cost is $10,000
- [ ] Funky Bomb cost is $7,000
- [ ] Shop displays correct prices
- [ ] Can purchase at specified costs
- [ ] Tests verify costs match spec

## Output

**Output when complete:** `<promise>DONE</promise>`
