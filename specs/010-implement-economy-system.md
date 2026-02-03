## Status: COMPLETE

# Spec 010: Implement Economy System

**Priority:** High  
**Phase:** 2 (Economic System)  
**Estimated Effort:** Large

## Problem

No dynamic market pricing system. Weapon prices should fluctuate based on supply/demand, with configurable volatility.

## Requirements

Create EconomySystem per TODO.md Phase 2:

1. **Market state tracking:** Base prices, current prices, purchase/sales counts
2. **Price fluctuation:** Increase on purchase, decrease on sale
3. **Volatility levels:** None, Low, Medium, High
4. **Price bounds:** 50% to 200% of base price
5. **Market forces:** Gradual drift back toward base prices

## Specification

See TODO.md lines 54-115 for full implementation details.

## Acceptance Criteria

- [x] `EconomySystem.ts` created in `src/systems/`
- [x] `MarketState` interface with price tracking
- [x] `updatePrice()` increases price on purchase
- [x] `updatePrice()` decreases price on sale
- [x] Prices clamped to 50%-200% of base
- [x] Volatility setting affects price change rate
- [x] `applyMarketForces()` drifts prices toward base
- [x] Integration with ShopSystem
- [x] Tests verify price fluctuations
- [x] Tests verify bounds enforcement
- [x] Build succeeds

## Verification

1. Buy 10 missiles - verify price increases
2. Sell 5 missiles - verify price decreases
3. Set high volatility - verify larger price swings
4. Wait multiple rounds - verify drift toward base price
5. Test price bounds - verify never below 50% or above 200%
6. Run `npm test` - all tests pass
7. Run `npm run build` - build succeeds

## Technical Notes

```typescript
export class EconomySystem {
    private marketState: MarketState;
    
    updatePrice(itemId: string, purchased: boolean): void {
        // See TODO.md lines 70-89
    }
    
    applyMarketForces(): void {
        // See TODO.md lines 101-109
    }
}
```

## Output

**Output when complete:** `<promise>DONE</promise>`

<!-- NR_OF_TRIES: 3 -->
