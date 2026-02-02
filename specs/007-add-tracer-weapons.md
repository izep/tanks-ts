## Status: COMPLETE

# Spec 007: Add Tracer Weapons

**Priority:** Medium  
**Phase:** 1 (Core Weapons)  
**Estimated Effort:** Small

## Problem

Tracer and Smoke Tracer not implemented. These are zero-damage weapons used for aiming practice and trajectory visualization.

## Requirements

Implement Tracer weapons per Requirements.md:

1. **Tracer:** Zero damage, shows trajectory, cheap ($50)
2. **Smoke Tracer:** Like Tracer but leaves colored trail, slightly more expensive ($100)

**Behavior:**
- Follow normal projectile physics
- Zero damage to terrain or tanks
- Smoke Tracer leaves persistent colored trail
- Trail fades over time (3-5 seconds)

## Acceptance Criteria

- [x] Tracer weapon in `WeaponData.ts` ($10)
- [x] Smoke Tracer weapon in `WeaponData.ts` ($500)
- [x] Both follow projectile physics (affected by wind/gravity)
- [x] Both deal zero damage
- [x] Smoke Tracer leaves visible colored trail
- [x] Trail persists for 3-5 seconds then fades
- [x] Can use for aiming practice
- [x] Tests verify zero damage
- [x] Build succeeds

## Verification

1. Fire Tracer at terrain - verify no damage
2. Fire Tracer at tank - verify no damage
3. Fire Smoke Tracer - verify trail appears
4. Wait 5 seconds - verify trail fades
5. Use Tracer to practice shot - verify trajectory visible
6. Run `npm test` - all tests pass
7. Run `npm run build` - build succeeds

## Technical Notes

```typescript
const TRACER = {
    id: 'tracer',
    name: 'Tracer',
    cost: 50,
    bundleSize: 10,
    blastRadius: 0,
    damage: 0,
    projectileType: 'tracer'
};

const SMOKE_TRACER = {
    id: 'smoke_tracer',
    name: 'Smoke Tracer',
    cost: 100,
    bundleSize: 5,
    blastRadius: 0,
    damage: 0,
    projectileType: 'smoke_tracer',
    trailColor: '#00FF00',
    trailDuration: 4000 // ms
};
```

## Output

**Output when complete:** `<promise>DONE</promise>`

<!-- NR_OF_TRIES: 1 -->
