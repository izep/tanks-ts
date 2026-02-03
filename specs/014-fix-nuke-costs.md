## Status: COMPLETE

# Spec 014: Fix Nuke Costs

**Priority:** Critical
**Phase:** 1 (Critical Fixes)
**Estimated Effort:** Tiny

## Problem

Nuke and Baby Nuke costs do not match Requirements.md Section 2. This affects game balance and economic strategy.

## Requirements

Update weapon costs in `src/core/WeaponData.ts`:
- **Baby Nuke:** $10,000
- **Nuke:** $12,000

## Acceptance Criteria
- [x] Baby Nuke cost is $10,000
- [x] Nuke cost is $12,000
- [x] Shop displays correct prices
- [x] Can purchase at specified costs
- [x] Tests verify costs match spec

## Output

**Output when complete:** `<promise>DONE</promise>`
