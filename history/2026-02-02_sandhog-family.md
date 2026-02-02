# Sandhog Family Implementation

**Date:** 2026-02-02  
**Spec:** 008-implement-sandhog-family.md  
**Status:** Complete

## What Was Implemented

Successfully implemented the Sandhog weapon family (Baby Sandhog, Sandhog, Heavy Sandhog) with horizontal tunneling mechanics.

### Key Features

1. **Warhead Deployment:** On impact, Sandhogs deploy multiple warheads (3/5/7 based on variant)
2. **Horizontal Tunneling:** Each warhead tunnels horizontally through terrain
3. **Tunnel Distances:** Baby: 30px, Sandhog: 50px, Heavy: 80px
4. **Terminal Explosion:** Small explosive charge at end of each tunnel
5. **Tank Damage:** Warheads can destroy tanks from beneath

### Implementation Details

- Created `SandhogBehavior` class for main projectile
- Created `SandhogWarheadBehavior` class for deployed warheads
- Added warhead properties to `ProjectileState` interface:
  - `direction`: Horizontal direction (1 or -1)
  - `tunnelLength`: Total tunnel distance
  - `distanceRemaining`: Remaining distance to tunnel
  - `blastRadius`: Explosion size at end
  - `damage`: Damage to apply to tanks
- Separated Digger and Sandhog logic (previously used same behavior)
- Warheads tunnel at 60 pixels/second

### Testing

Created comprehensive test suite (`tests/sandhog.test.ts`) with 7 tests:
- Warhead deployment (3/5/7 for each variant)
- Horizontal tunneling mechanics
- Explosion at tunnel end
- Tank damage from explosions
- Terrain removal while tunneling

All tests pass. Full test suite: 69 tests pass.

## Lessons Learned

1. **Behavior Separation:** Initially tried to reuse `DiggingBehavior` for both Diggers and Sandhogs. This was wrong - Sandhogs need completely different mechanics (warhead deployment, horizontal tunneling). Separating into distinct behaviors made the code cleaner and more maintainable.

2. **Warhead Direction Logic:** Initially calculated direction from angle but simplified to left/right (±1). Warheads spread in a fan pattern from -90° to +90°.

3. **Context.addProjectile:** Used spread operator incorrectly (`...newQueue`). Should iterate and add each warhead individually using `forEach`.

4. **TypeScript Strictness:** Adding optional properties to `ProjectileState` required null coalescing in the warhead behavior to satisfy strict type checking.

5. **Test Environment Setup:** Tests need full mock environment (Canvas, AudioContext, etc). Followed pattern from existing tests rather than using `createInitialState()`.

## What Works Well

- Warhead deployment feels authentic to original game
- Horizontal tunneling creates interesting tactical opportunities
- Clear separation between Digger (vertical) and Sandhog (horizontal + explosion)
- Test coverage ensures future changes won't break functionality
- Visual explosions at tunnel end provide good feedback

## Potential Improvements

- Could add visual trail/particles during tunneling for better effect
- Warhead direction could be randomized slightly for more variation
- Tunnel depth could vary based on terrain hardness (future feature)
- Could add sound effects specific to tunneling

## Related Specs

- Spec 009: Add Riot Bombs (next priority)
- Spec 010: Implement Economy System
