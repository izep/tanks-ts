# Riot Bombs Code Clarity Improvement

**Date:** 2026-02-03  
**Spec:** 009 - Riot Bombs  
**Type:** Code Clarity Enhancement

## Context

During re-verification of Spec 009 (Riot Bombs), all acceptance criteria were passing and tests confirmed correct behavior. However, the implementation had a subtle clarity issue.

## Issue

Riot bombs use type `dirt_destroyer` but the `triggerExplosion()` method only explicitly handled `riot_charge` type. Riot bombs were falling through to the default explosion handler, which worked correctly but was not immediately obvious from reading the code.

## Fix

Added `dirt_destroyer` type to the explicit handler:

```typescript
// Before:
} else if (weaponStats.type === 'riot_charge') {
    this.terrainSystem.explode(state, x, y, radius);
}

// After:
} else if (weaponStats.type === 'riot_charge' || weaponStats.type === 'dirt_destroyer') {
    this.terrainSystem.explode(state, x, y, radius);
}
```

## Result

- All 95 tests still pass
- Build succeeds
- Code intent is now explicit and clear
- No behavior changed - purely a clarity improvement

## Lesson Learned

Even when functionality is correct, explicit type handling improves code maintainability and makes intent obvious to future developers.
