# Spec 006: Implement Roller Family

**Priority:** High  
**Phase:** 1 (Core Weapons)  
**Estimated Effort:** Large

## Problem

Roller weapons (Baby Roller, Roller, Heavy Roller) not implemented. These weapons roll downhill after landing, creating unique tactical opportunities.

## Requirements

Implement Roller family per Requirements.md:

1. **Baby Roller:** Small blast, rolls downhill
2. **Roller:** Medium blast, rolls downhill  
3. **Heavy Roller:** Large blast, rolls downhill

**Physics:**
- Roll downhill when hitting ground (follow terrain slope)
- Stop in valleys or when hitting tanks
- Bounce off shields (roll over, don't explode)
- Explode when stopping or hitting tank

## Acceptance Criteria

- [ ] All 3 roller types in `WeaponData.ts` with correct costs
- [ ] Roller physics: rolls downhill on terrain contact
- [ ] Stops in valleys (slope changes direction)
- [ ] Explodes when stopped or hitting tank
- [ ] Bounces off shields (continues rolling)
- [ ] Different blast radii: Baby (30), Roller (50), Heavy (70)
- [ ] Visual rolling animation
- [ ] Tests verify rolling physics
- [ ] Build succeeds

## Verification

1. Fire roller at hill - verify rolls down slope
2. Fire into valley - verify stops at bottom
3. Fire at tank - verify explodes on contact
4. Fire at shielded tank - verify bounces and continues
5. Test all 3 variants - verify different blast sizes
6. Run `npm test` - all tests pass
7. Run `npm run build` - build succeeds

## Technical Notes

```typescript
interface RollerState {
    rolling: boolean;
    velocity: number; // Horizontal speed
}

// On terrain contact
if (hitTerrain && isRoller(projectile)) {
    projectile.rolling = true;
    projectile.velocity = 5; // pixels per frame
    
    // Follow slope
    const slope = getTerrainSlope(x, y);
    if (slope > 0) rollRight();
    else if (slope < 0) rollLeft();
    else stop(); // Valley detected
}
```

## Output

**Output when complete:** `<promise>DONE</promise>`

<!-- NR_OF_TRIES: 0 -->
