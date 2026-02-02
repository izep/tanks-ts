# Weapon Costs Regression Fix (Re-verification)

**Date:** 2026-02-02  
**Status:** Fixed

## What Was Found

During Ralph Loop re-verification, discovered that spec 001 was marked complete but had incorrect values compared to Requirements.md (the canonical source of truth per constitution).

### Discrepancies Found
- Baby Missile: $500 (spec 001) vs $400 (Requirements.md) ❌
- Nuke: $5,000 (spec 001) vs $12,000 (Requirements.md) ❌
- MIRV: $7,500 (spec 001) vs $10,000 (Requirements.md) ❌
- Funky Bomb: $15,000 (spec 001) vs $7,000 (Requirements.md) ❌

## Root Cause

Spec 001 was written with some incorrect target values that didn't match Requirements.md. The implementation followed spec 001, but the constitution clearly states: "When in doubt, refer to Requirements.md for the canonical specification."

## Fix Applied

Updated weapon costs to match Requirements.md:
- Baby Missile: $500 → $400
- Nuke: $5,000 → $12,000
- MIRV: $7,500 → $10,000
- Funky Bomb: $15,000 → $7,000

Also updated the test file to verify against Requirements.md values.

## Lessons Learned

1. **Always use Requirements.md as canonical source** - Specs can have errors
2. **Re-verification is critical** - Found regression in "complete" spec
3. **Constitution hierarchy matters** - Requirements.md > specs when conflicts exist
4. **Test against source of truth** - Tests should verify Requirements.md, not just specs
