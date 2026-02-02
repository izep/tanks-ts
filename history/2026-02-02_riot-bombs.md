# 2026-02-02: Riot Bombs Implementation

## What Was Learned

**Discovery:** Riot Bombs were already fully implemented in WeaponData.ts and PhysicsSystem.

**Key Points:**
1. Riot Bomb and Heavy Riot Bomb already existed with `type: 'dirt_destroyer'`
2. The default explosion handler (line 432 in PhysicsSystem.ts) correctly processes them
3. Zero damage is enforced by the `damage: 0` property in WeaponData
4. Damage system only applies damage when `damageAmount > 0` (line 481)

**Spec vs Requirements Discrepancy:**
- Spec 009 said: Riot Bomb $2,500/50px, Heavy $8,000/90px
- Requirements.md canonical spec: Riot Bomb $5,000/30px, Heavy $4,750/45px
- Constitution says: "When in doubt, refer to Requirements.md for the canonical specification"
- **Resolution:** Kept existing implementation matching Requirements.md

**Testing Approach:**
- Created comprehensive test suite (tests/riot-bombs.test.ts)
- Mocked TerrainSystem to avoid complex terrain setup
- Verified weapon specs, terrain destruction, zero tank damage, and projectile physics
- All 8 tests pass

## Implementation Details

No code changes needed - just verification and tests:
- Riot Bomb: cost $5,000, radius 30px, damage 0, bundleSize 5
- Heavy Riot Bomb: cost $4,750, radius 45px, damage 0, bundleSize 2
- Both use `type: 'dirt_destroyer'` which falls through to default explosion handler
- Default handler calls `terrainSystem.explode(state, x, y, radius)` to remove terrain
- Damage system skips riot bombs due to `damage: 0` property

## Gotchas

1. **Type handling**: The `'dirt_destroyer'` type isn't explicitly handled in triggerExplosion, but the default case (line 432) works correctly
2. **Spec conflicts**: Always trust Requirements.md over individual specs when they conflict
3. **Testing terrain**: Mock TerrainSystem instead of trying to manipulate real terrain in tests
4. **SoundManager mocking**: Need to mock AudioContext for Node test environment

## Future Considerations

None - implementation is complete and correct per specification.
