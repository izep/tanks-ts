## Status: COMPLETE

# Spec 001: Fix Weapon Costs

**Priority:** Critical  
**Phase:** 1 (Critical Fixes)  
**Estimated Effort:** Small

## Problem

Current weapon costs don't match the Requirements.md specification. Incorrect pricing affects game balance and economic strategy.

## Requirements

Update weapon costs in `src/core/WeaponData.ts` to match Requirements.md specification:

- **Baby Missile:** $400 (was $500 in initial spec, corrected 2026-02-02)
- **Missile:** $1,875
- **Baby Nuke:** $10,000
- **Nuke:** $12,000 (was $5,000 in initial spec, corrected 2026-02-02)
- **MIRV:** $10,000 (was $7,500 in initial spec, corrected 2026-02-02)
- **Death's Head:** $20,000
- **Funky Bomb:** $7,000 (was $15,000 in initial spec, corrected 2026-02-02)
- **All other weapons:** Per Requirements.md Section 2

## Acceptance Criteria

- [x] All weapon costs match Requirements.md exactly
- [x] Shop displays correct prices
- [x] Can purchase weapons at specified costs
- [x] Tests verify weapon costs match spec

## Verification

1. Compare `WEAPONS` object costs against Requirements.md Section 2
2. Open shop UI and verify displayed prices
3. Purchase each weapon type and verify credit deduction
4. Run `npm test` - all tests pass
5. Run `npm run build` - build succeeds

## Output

**Output when complete:** `<promise>DONE</promise>`

<!-- NR_OF_TRIES: 10 -->
