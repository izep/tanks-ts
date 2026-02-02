# 2026-02-02: MIRV Mechanics Fix

## What Was Implemented

Fixed MIRV weapon to properly deploy 5 missile warheads at apogee:

- Changed from 2 warheads to 5 warheads with even spread (-100, -50, 0, 50, 100)
- Parent MIRV now removed after split (was staying before)
- Added terrain clearance check to prevent split if close to ground (< 20px)
- Changed warhead type from 'mirv' to 'missile' for proper behavior
- Added fizzle logic: MIRV explodes normally if it hits terrain before apogee

## Key Decisions

1. **Clearance Check**: Added `clearance > 20` check before splitting to prevent split when MIRV is too close to ground. This ensures fizzle behavior works correctly.

2. **Parent Removal**: Changed behavior to return `true` which removes parent MIRV. Previously it stayed as a 3rd projectile, creating confusion.

3. **Warhead Type**: Each warhead is now a 'missile' instead of 'mirv', preventing recursive splitting.

## Tests Added

Created `/tests/mirv.test.ts` with 4 comprehensive tests:
- Deploy 5 warheads at apogee
- Even spread of warheads
- Fizzle on terrain hit before apogee
- Only split once (no recursive splitting)

Also updated `/tests/physics_advanced.test.ts` to expect new behavior (5 missiles, parent removed).

## Gotchas

- Mock canvas context needed for tests (document.createElement)
- Terrain generation in tests requires proper mocking
- Clearance threshold (20px) is a balance: too low allows ground splits, too high prevents legitimate apogee splits

## Performance

No measurable performance impact - split logic only runs once per MIRV at apogee.

## Next Steps

Similar fixes needed for:
- LeapFrog (sequential 3-warhead launches)
- Death's Head (9 large warheads at apogee)
