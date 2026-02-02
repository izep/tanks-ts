# Spec 002: Weapon Bundle System

**Priority:** Critical  
**Phase:** 1 (Critical Fixes)  
**Estimated Effort:** Medium

## Problem

Shop purchases currently grant single items, but spec requires bundle purchases (e.g., buying "missiles" gives you multiple missiles, up to 99 max inventory).

## Requirements

Implement weapon bundle system:

1. Add `bundleSize` property to `WeaponStats` interface
2. Shop purchases grant `bundleSize` items (not 1)
3. Enforce 99 item maximum per inventory slot
4. Display bundle info in shop UI ("Missiles x5" or "5 for $1,875")

## Specification

```typescript
export interface WeaponStats {
    // ... existing fields
    bundleSize: number; // How many items per purchase
}
```

Bundle sizes (from Requirements.md):
- Most weapons: 1 per purchase
- Missiles: 5 per purchase
- Baby Missiles: 10 per purchase
- Fuel: 50 units per purchase
- (See Requirements.md Section 2 for complete list)

## Acceptance Criteria

- [ ] `bundleSize` added to `WeaponStats` interface
- [ ] All weapons have correct `bundleSize` from spec
- [ ] Purchasing adds `bundleSize` items to inventory
- [ ] Cannot exceed 99 items per slot
- [ ] Shop UI shows bundle size (e.g., "x5")
- [ ] Tests verify bundle purchases work correctly
- [ ] Build succeeds

## Verification

1. Purchase missiles - verify 5 added to inventory
2. Purchase baby missiles - verify 10 added
3. Purchase when inventory at 95 - verify caps at 99
4. Check shop UI displays bundle counts
5. Run `npm test` - all tests pass
6. Run `npm run build` - build succeeds

## Output

**Output when complete:** `<promise>DONE</promise>`

<!-- NR_OF_TRIES: 0 -->
