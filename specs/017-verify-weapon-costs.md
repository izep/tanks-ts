## Status: COMPLETE

# Spec 017: Verify Weapon Costs (Split from 001)

**Priority:** Critical
**Phase:** 1 (Critical Fixes)
**Estimated Effort:** Tiny

## Problem

Spec 001 has reached NR_OF_TRIES=12 and is unachievable as a single spec. All actionable cost fixes have been split into smaller specs (013-016). This spec exists to verify that all weapon costs in the codebase match Requirements.md and that no regressions occur.

## Requirements

1. Review all weapon costs in `src/core/WeaponData.ts`.
2. Compare each cost to Requirements.md Section 2.
3. If any mismatch is found, create a new targeted spec for that weapon.
4. Add/Update tests to ensure all costs match spec.
5. Mark this spec complete only if all costs are correct and tests pass.

## Acceptance Criteria

- [x] All weapon costs in `WeaponData.ts` match Requirements.md Section 2
- [x] Tests verify all costs are correct
- [x] No regressions from previous cost fixes
- [x] Build and tests succeed

## Output

**Output when complete:** `<promise>DONE</promise>`

<!-- NR_OF_TRIES: 1 -->