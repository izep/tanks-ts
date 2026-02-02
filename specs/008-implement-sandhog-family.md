## Status: COMPLETE

# Spec 008: Implement Sandhog Family

**Priority:** Medium  
**Phase:** 1 (Core Weapons)  
**Estimated Effort:** Large

## Problem

Sandhog weapons (Baby Sandhog, Sandhog, Heavy Sandhog) not implemented. These weapons tunnel horizontally through terrain before exploding.

## Requirements

Implement Sandhog family per Requirements.md:

1. **Baby Sandhog:** 3 warheads, short tunnels ($10,000)
2. **Sandhog:** 5 warheads, medium tunnels ($16,750)
3. **Heavy Sandhog:** 7 warheads, long tunnels ($25,000)

**Behavior:**
- Deploy multiple warheads on impact
- Each warhead tunnels horizontally through terrain
- Tunnels for specified distance (removes terrain)
- Small explosion at end of tunnel
- Useful for undermining tanks or creating passages

## Acceptance Criteria

- [x] All 3 Sandhog types in `WeaponData.ts` with correct costs
- [x] Deploy correct number of warheads (3/5/7)
- [x] Warheads tunnel horizontally through terrain
- [x] Tunneling removes terrain pixels
- [x] Explosion at end of each tunnel
- [x] Baby: 30px tunnels, Sandhog: 50px, Heavy: 80px
- [x] Visual tunneling effect
- [x] Tests verify tunneling mechanics
- [x] Build succeeds

## Verification

1. Fire Baby Sandhog - verify 3 tunnels created
2. Measure tunnel length - verify ~30px
3. Fire Sandhog - verify 5 tunnels, ~50px each
4. Fire Heavy Sandhog - verify 7 tunnels, ~80px each
5. Verify terrain removed along tunnel path
6. Verify explosion at end of tunnel
7. Run `npm test` - all tests pass
8. Run `npm run build` - build succeeds

## Technical Notes

```typescript
interface SandhogWarhead {
    x: number;
    y: number;
    direction: -1 | 1; // Left or right
    distanceRemaining: number;
}

// Each frame while tunneling
function updateSandhog(warhead: SandhogWarhead) {
    if (warhead.distanceRemaining > 0) {
        removeTerrain(warhead.x, warhead.y, 3); // Small radius
        warhead.x += warhead.direction * 2; // 2px per frame
        warhead.distanceRemaining -= 2;
    } else {
        explode(warhead.x, warhead.y, 20); // Small blast
    }
}
```

## Output

**Output when complete:** `<promise>DONE</promise>`

<!-- NR_OF_TRIES: 2 -->
