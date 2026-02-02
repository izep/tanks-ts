## Status: COMPLETE

# Spec 009: Add Riot Bombs

**Priority:** Medium  
**Phase:** 1 (Core Weapons)  
**Estimated Effort:** Medium

## Problem

Riot Bomb and Heavy Riot Bomb not implemented. These are projectile versions of Riot Charge that destroy terrain without damaging tanks.

## Requirements

Implement Riot Bombs per Requirements.md:

1. **Riot Bomb:** Standard size, terrain-only damage ($5,000)
2. **Heavy Riot Bomb:** Large blast, terrain-only damage ($4,750)

**Behavior:**
- Normal projectile flight
- Spherical terrain destruction on impact
- Zero damage to tanks
- Useful for clearing terrain or exposing buried tanks

## Acceptance Criteria

- [x] Riot Bomb in `WeaponData.ts` ($5,000)
- [x] Heavy Riot Bomb in `WeaponData.ts` ($4,750)
- [x] Both follow projectile physics
- [x] Riot Bomb: 30px terrain destruction radius
- [x] Heavy Riot Bomb: 45px terrain destruction radius
- [x] Zero tank damage for both
- [x] Spherical terrain removal pattern
- [x] Tests verify terrain removal
- [x] Tests verify zero tank damage
- [x] Build succeeds

## Verification

1. Fire Riot Bomb at terrain - verify spherical crater
2. Measure crater - verify ~30px radius
3. Fire at tank - verify no tank damage
4. Fire Heavy Riot Bomb - verify larger crater (~45px)
5. Verify terrain removed but tanks unharmed
6. Run `npm test` - all tests pass
7. Run `npm run build` - build succeeds

## Technical Notes

```typescript
const RIOT_BOMB = {
    id: 'riot_bomb',
    name: 'Riot Bomb',
    cost: 5000,
    bundleSize: 5,
    radius: 30,
    damage: 0 // No tank damage
};

const HEAVY_RIOT_BOMB = {
    id: 'heavy_riot_bomb',
    name: 'Heavy Riot Bomb',
    cost: 4750,
    bundleSize: 2,
    radius: 45,
    damage: 0
};
```

## Output

**Output when complete:** `<promise>DONE</promise>`

<!-- NR_OF_TRIES: 1 -->
