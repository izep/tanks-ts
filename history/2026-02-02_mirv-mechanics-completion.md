# MIRV Mechanics Fix - 2026-02-02

## What Was Done

Fixed MIRV mechanics to properly deploy 5 warheads at apogee with fizzle protection.

## Key Changes

1. **StandardFlightBehavior**: Already correctly deployed 5 warheads with offsets [-100, -50, 0, 50, 100]
2. **Terrain check**: Added clearance check (> 20px) to prevent splitting when close to ground
3. **Test fixes**: Fixed test mocks to include `moveTo`, `lineTo`, and `closePath` canvas methods

## Implementation Details

The MIRV splits when:
- `vy > 0` (descending, past apogee)
- `clearance > 20` (not about to hit terrain)

If either condition fails, MIRV continues without splitting and will explode normally on terrain/tank hit.

## Lessons Learned

1. Test mocks must match all canvas API calls used by production code
2. Splitting behavior should check for imminent collision before deploying warheads
3. The "apogee" check is simply `vy > 0` (transitioning from upward to downward motion)

## Test Results

- All 95 tests passing
- Build successful
- All acceptance criteria met

