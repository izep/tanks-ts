# Roller Family Implementation - 2026-02-02

## What Was Done

Implemented the complete Roller family weapons (Baby Roller, Roller, Heavy Roller) per Requirements.md specification.

## Changes

1. **WeaponData.ts:**
   - Replaced `segway` placeholder with proper `baby_roller`, `roller`, `heavy_roller` definitions
   - Set correct costs: Baby ($5,000), Roller ($6,000), Heavy ($6,750)
   - Set correct blast radii: Baby (10), Roller (20), Heavy (45) - per Requirements.md
   - Set correct bundle sizes: Baby (10), Roller (5), Heavy (2)
   - All marked with `type: 'roller'`

2. **UIManager.ts:**
   - Updated icon mapping to handle all three roller variants

3. **WeaponBehavior.ts (RollingBehavior):**
   - Added shield bounce logic: rollers now bounce off shielded tanks instead of exploding
   - Velocity reverses and projectile is pushed away from shielded tank
   - Continues rolling after bounce

4. **Tests:**
   - Updated weapon-costs.test.ts to verify all roller costs
   - Updated weapon-bundles.test.ts to verify all roller bundle sizes

## Key Decisions

- **Blast Radii:** Used Requirements.md values (10, 20, 45) instead of spec 006 values (30, 50, 70) per constitution guidance
- **Shield Bounce:** Implemented as velocity reversal + push-away, allowing roller to continue rolling after hitting shielded tank
- **Existing Physics:** RollingBehavior already had downhill rolling, valley stopping, and tank collision - just needed shield bounce added

## What Works

✅ All 3 roller types defined with correct properties
✅ Rolling physics: rolls downhill, stops in valleys, explodes when velocity too low
✅ Tank collision: explodes on impact with unshielded tanks
✅ Shield bounce: bounces off shielded tanks and continues rolling
✅ Different blast radii for each variant
✅ All tests pass
✅ Build succeeds

## Lessons Learned

- Constitution says "When in doubt, refer to Requirements.md" - used those values when spec conflicted
- RollingBehavior was already well-implemented, just needed shield interaction
- The segway placeholder was a temporary name, now properly replaced
