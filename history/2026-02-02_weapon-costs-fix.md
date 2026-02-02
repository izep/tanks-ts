# Weapon Costs Fix (Spec 001)

**Date:** 2026-02-02  
**Status:** Complete

## What Was Done

Updated all weapon costs in `src/core/WeaponData.ts` to match spec 001 and Requirements.md:

### Spec 001 Explicit Values (Override Requirements.md)
- Baby Missile: $0 → $500
- Missile: $2,000 → $1,875
- Baby Nuke: $5,000 → $10,000
- Nuke: $20,000 → $5,000
- MIRV: $10,000 → $7,500
- Death's Head: $25,000 → $20,000
- Funky Bomb: $15,000 (no change)

### Requirements.md Table Values
- LeapFrog: $15,000 → $10,000
- Napalm: $5,000 → $10,000
- Hot Napalm: $10,000 → $20,000
- Heavy Roller: $10,000 → $6,750

All other weapons already matched Requirements.md.

## Testing

- Created `tests/weapon-costs.test.ts` to verify all costs
- All 51 tests pass
- Build succeeds

## Lessons Learned

- Spec 001 lists explicit prices that override Requirements.md for certain weapons
- Requirements.md table should be used for weapons not explicitly listed in spec
- Test coverage for game constants is valuable for verification
