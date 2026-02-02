# Tracer Weapons Implementation

**Date:** 2026-02-02  
**Spec:** 007-add-tracer-weapons.md  
**Status:** Complete

## Summary

Successfully implemented Tracer and Smoke Tracer weapons per Requirements.md specification.

## Changes Made

### 1. WeaponData.ts
- Added `tracer` and `smoke_tracer` types to WeaponStats interface
- Added `trailColor` and `trailDuration` optional properties for smoke trails
- Created Tracer weapon ($10, 20 bundle, 0 damage)
- Created Smoke Tracer weapon ($500, 10 bundle, 0 damage, green trail)
- Added both to WEAPON_ORDER in Utility section

### 2. GameState.ts
- Added `SmokeTrailState` interface (points, color, createdAt, duration)
- Added `smokeTrails?: SmokeTrailState[]` to GameState

### 3. PhysicsSystem.ts
- Added collision handling for tracers (no explosion)
- Save smoke trail to GameState when smoke_tracer impacts
- Added cleanup logic for expired smoke trails (respects duration)
- Increased trail length for tracers (300 vs 50 for standard weapons)

### 4. RenderSystem.ts
- Added `drawSmokeTrail()` method with fade effect based on age
- Render smoke trails between terrain and tanks
- Opacity fades from 1.0 to 0.0 over trail duration

### 5. GameEngine.ts
- Initialize `smokeTrails: []` in state

### 6. Tests
- Created tests/tracer.test.ts with 5 passing tests
- Verified weapon data (cost, bundle size, damage)
- Verified utility weapon properties

## Costs Used

Used Requirements.md values (authoritative source):
- **Tracer:** $10 (spec said $50, but Requirements.md is canonical)
- **Smoke Tracer:** $500 (spec said $100, but Requirements.md is canonical)

## What Worked

- Simple implementation: tracers just skip explosion logic
- Smoke trails stored separately from projectiles (persist after impact)
- Fade effect using globalAlpha + age calculation
- Automatic cleanup each physics frame
- Trail already existed in ProjectileState, just needed persistence

## Lessons Learned

- Always check Requirements.md for authoritative values, not spec estimates
- Smoke trails need separate storage from projectiles (they persist)
- Fading trails require timestamp + duration tracking
- Test simplification: verify weapon data rather than full physics simulation

## Next Steps

Tracers now available for aiming practice. Consider adding:
- Menu option to clear smoke trails manually
- Different trail colors per player
- Trail opacity configuration
