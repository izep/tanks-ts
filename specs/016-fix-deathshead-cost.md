## Status: COMPLETE

# Spec 016: Fix Death's Head Cost

**Priority:** Critical
**Phase:** 1 (Critical Fixes)
**Estimated Effort:** Tiny

## Problem

Death's Head cost does not match Requirements.md Section 2. This affects game balance and economic strategy.

## Requirements

Update weapon cost in `src/core/WeaponData.ts`:
- **Death's Head:** $20,000

## Acceptance Criteria
- [x] Death's Head cost is $20,000
- [x] Shop displays correct price
- [x] Can purchase at specified cost
- [x] Tests verify cost matches spec

## Output

**Output when complete:** `<promise>DONE</promise>`
