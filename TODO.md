# Improvement Plan: Tanks-a-Lot TS
## Roadmap to Requirements Compliance

**Last Updated:** 2026-02-02  
**Target Completion:** 77% remaining features  
**Baseline:** 23% complete (see code-review.md)

---

## Phase 1: Critical Fixes & Core Weapons
**Goal:** Fix existing bugs and complete essential weapon mechanics

### Task Group 1.1: Weapon Cost Corrections
- [ ] **Fix weapon costs** to match spec (Missile: $1,875, Baby Nuke: $10,000, etc.)
- [ ] **Implement weapon bundle system**
  - Add `bundleSize` property to `WeaponStats`
  - Shop purchases grant bundleSize items, not single items
  - Maximum 99 per item inventory cap
- [ ] **Fix MIRV mechanics**
  - Split at apogee (highest point), not on impact
  - Deploy 5 missile warheads, not just generic explosions
  - Fizzle if hits terrain before apogee
- [ ] **Fix Leapfrog mechanics**
  - Sequential 3-warhead launches (not bouncing)
  - Each warhead fires after previous explodes
- [ ] **Fix Death's Head**
  - Deploy 9 large warheads at apogee
  - Functionally like MIRV but with more powerful sub-munitions

### Week 2: Rolling & Earth Weapons
- [ ] **Implement Roller family** (Baby Roller, Roller, Heavy Roller)
  - Roll downhill physics when hitting ground
  - Stop in valleys or when hitting tanks
  - Bounce off shields (roll over, don't explode)
  - Different blast radii based on variant
- [ ] **Add Tracer & Smoke Tracer**
  - Zero damage, trajectory visualization only
  - Smoke variant leaves colored trail
  - Trail persistence and clearing mechanics
- [ ] **Complete Sandhog family** (Baby, Standard, Heavy)
  - Horizontal tunneling physics
  - Multiple warheads that tunnel then explode
  - Small explosive charge at end of tunnel
- [ ] **Add Riot Bombs** (Riot Bomb, Heavy Riot Bomb)
  - Projectile versions of Riot Charge
  - Spherical dirt destruction, zero tank damage

---

## Phase 2: Economic System
**Goal:** Implement full economic mechanics

### Task Group 2.1: Economy System Core
- [ ] **Create EconomySystem.ts**

**Specification:**
```typescript
export interface MarketState {
    basePrices: Record<string, number>; // From WeaponData
    currentPrices: Record<string, number>; // Fluctuating
    purchaseCount: Record<string, number>; // Demand tracker
    salesCount: Record<string, number>; // Supply tracker
    volatility: 'none' | 'low' | 'medium' | 'high';
}

export class EconomySystem {
    private marketState: MarketState;
    
    // After each purchase
    updatePrice(itemId: string, purchased: boolean): void {
        if (purchased) {
            this.marketState.purchaseCount[itemId]++;
            // Increase price by volatility factor
            const increase = this.getVolatilityMultiplier();
            this.marketState.currentPrices[itemId] *= (1 + increase);
        } else {
            // Decrease on sale
            this.marketState.salesCount[itemId]++;
            const decrease = this.getVolatilityMultiplier();
            this.marketState.currentPrices[itemId] *= (1 - decrease * 0.5);
        }
        
        // Clamp: 50% to 200% of base price
        const basePrice = this.marketState.basePrices[itemId];
        this.marketState.currentPrices[itemId] = Math.max(
            basePrice * 0.5,
            Math.min(basePrice * 2.0, this.marketState.currentPrices[itemId])
        );
    }
    
    private getVolatilityMultiplier(): number {
        switch (this.marketState.volatility) {
            case 'none': return 0;
            case 'low': return 0.05;
            case 'medium': return 0.10;
            case 'high': return 0.20;
        }
    }
    
    // Market forces: gradual return to base price
    applyMarketForces(): void {
        for (const itemId in this.marketState.currentPrices) {
            const current = this.marketState.currentPrices[itemId];
            const base = this.marketState.basePrices[itemId];
            const drift = 0.02; // 2% drift toward base per round
            this.marketState.currentPrices[itemId] = 
                current + (base - current) * drift;
        }
    }
}
```

**Files:** Create `src/systems/EconomySystem.ts`  
**Acceptance:** Prices fluctuate based on purchases, trend toward base

---

- [ ] **Implement interest rate system**

**Specification:**
Add to GameState:
```typescript
export interface GameState {
    // ... existing fields
    economyConfig: {
        interestRate: number; // 0.0 to 0.20 (0% to 20%)
        startingMoney: number; // Default 10000
    }
}
```

Between rounds (in GameFlowSystem):
```typescript
applyInterest(tank: TankState): void {
    const interest = Math.floor(
        tank.credits * gameState.economyConfig.interestRate
    );
    tank.credits += interest;
    
    // Show notification: "You earned $X in interest!"
    if (interest > 0) {
        this.showInterestNotification(tank, interest);
    }
}
```

**File:** `src/systems/GameFlowSystem.ts`  
**Acceptance:** Interest applied between rounds, displayed in UI

---

- [ ] **Implement arms level restrictions**

**Specification:**
Add to WeaponStats:
```typescript
export interface WeaponStats {
    // ... existing
    armsLevel: number; // 1-10, determines unlock tier
}
```

Arms levels by weapon:
- Level 1: Baby Missile, Tracer
- Level 2: Missile, Fuel, Shield
- Level 3: Baby Nuke, Riot Charge, Digger
- Level 4: Roller, Dirt Clod, Parachute
- Level 5: MIRV, Baby Sandhog, Riot Bomb
- Level 6: Nuke, Napalm, Sandhog
- Level 7: Funky Bomb, Leapfrog, Plasma Blast
- Level 8: Heavy Roller, Heavy Digger, Heavy Sandhog
- Level 9: Hot Napalm, Heavy Riot Bomb, Laser
- Level 10: Death's Head, Ton of Dirt

Add to GameState config:
```typescript
maxArmsLevel: number; // 1-10, filters shop
```

In ShopSystem:
```typescript
getAvailableWeapons(): string[] {
    return Object.keys(WEAPONS).filter(
        id => WEAPONS[id].armsLevel <= gameState.maxArmsLevel
    );
}
```

**Files:** `src/core/WeaponData.ts`, `src/systems/ShopSystem.ts`  
**Acceptance:** Higher level weapons hidden when arms level restricts

---

- [ ] **Implement sellback mechanics**

**Specification:**
In ShopSystem:
```typescript
sellItem(tank: TankState, itemId: string): boolean {
    const count = tank.inventory[itemId];
    if (!count || count === 0) return false;
    
    // Sell one at a time
    const currentPrice = economySystem.getPrice(itemId);
    const sellPrice = Math.floor(currentPrice * 0.5); // 50% refund
    
    tank.credits += sellPrice;
    tank.inventory[itemId]--;
    
    // Update market (supply increases, price drops)
    economySystem.updatePrice(itemId, false);
    
    return true;
}
```

UI: Add "Sell" button next to each item in shop inventory view

**File:** `src/systems/ShopSystem.ts`  
**Acceptance:** Can sell items for 50% of current market value

---

- [ ] **Implement persistent market database**

**Specification:**
```typescript
// In EconomySystem
saveMarketState(): void {
    localStorage.setItem('tanks_market_state', 
        JSON.stringify(this.marketState)
    );
}

loadMarketState(): void {
    const saved = localStorage.getItem('tanks_market_state');
    if (saved) {
        this.marketState = JSON.parse(saved);
    } else {
        this.resetMarket();
    }
}

resetMarket(): void {
    // Initialize all prices to base
    this.marketState.currentPrices = { ...this.marketState.basePrices };
    this.marketState.purchaseCount = {};
    this.marketState.salesCount = {};
}
```

Save after each round, load on game start

**File:** `src/systems/EconomySystem.ts`  
**Acceptance:** Prices persist across browser sessions

---

### Task Group 2.2: Testing
- [ ] Unit test: price increase on purchase
- [ ] Unit test: price decrease on sale
- [ ] Unit test: price clamping (50%-200% of base)
- [ ] Unit test: market forces (drift to base)
- [ ] Unit test: interest calculation
- [ ] Unit test: arms level filtering
- [ ] Integration test: buy/sell round trip
- [ ] Integration test: market persistence

---

## Phase 3: AI Personality System
**Goal:** Implement all 8 AI types from spec

### Task Group 3.1: AI Architecture Refactor

- [ ] **Create AIPersonality interface**

**Specification:**
```typescript
export interface AIPersonality {
    name: string;
    
    // Calculate shot parameters
    calculateShot(
        tank: TankState,
        targets: TankState[],
        terrain: TerrainData,
        wind: number,
        gravity: number
    ): { angle: number; power: number; } | null;
    
    // Select target
    selectTarget(
        tank: TankState,
        targets: TankState[]
    ): TankState | null;
    
    // Decide what weapon to use
    selectWeapon(
        tank: TankState,
        target: TankState,
        situation: TacticalSituation
    ): string;
}

export interface TacticalSituation {
    distanceToTarget: number;
    terrainBetween: boolean; // Obstacles?
    targetAbove: boolean;
    targetBelow: boolean;
}
```

**File:** Create `src/core/ai/AIPersonality.ts`  
**Acceptance:** Base interface for all AI types

---

### Task Group 3.2: Basic Personalities

- [ ] **Implement Moron personality**

**Specification:**
```typescript
export class MoronPersonality implements AIPersonality {
    name = 'Moron';
    
    calculateShot(tank, targets, terrain, wind, gravity) {
        // Random angle: 0-180 degrees
        const angle = Math.random() * 180;
        
        // Random power: 100-800 (often too weak or too strong)
        const power = 100 + Math.random() * 700;
        
        return { angle, power };
    }
    
    selectTarget(tank, targets) {
        // Pick random alive target
        const alive = targets.filter(t => !t.isDead);
        return alive[Math.floor(Math.random() * alive.length)];
    }
    
    selectWeapon(tank, target, situation) {
        // Only use baby missile (free)
        return 'baby_missile';
    }
}
```

**File:** `src/core/ai/personalities/MoronPersonality.ts`  
**Acceptance:** Random aim, often misses badly

---

- [ ] **Implement Shooter personality**

**Specification:**
```typescript
export class ShooterPersonality implements AIPersonality {
    name = 'Shooter';
    
    calculateShot(tank, targets, terrain, wind, gravity) {
        const target = this.selectTarget(tank, targets);
        if (!target) return null;
        
        // Only shoot if clear line of sight
        if (this.hasLineOfSight(tank, target, terrain)) {
            // Calculate direct shot (low arc)
            const angle = this.calculateDirectAngle(tank, target);
            const power = this.calculateDirectPower(tank, target, angle);
            return { angle, power };
        }
        
        // No clear shot: random like Moron
        return {
            angle: Math.random() * 180,
            power: 100 + Math.random() * 700
        };
    }
    
    private hasLineOfSight(tank, target, terrain): boolean {
        // Raycast from tank to target
        // Return true if no terrain pixels intersect
        return rayCast(tank.x, tank.y, target.x, target.y, terrain);
    }
    
    private calculateDirectAngle(tank, target): number {
        const dx = target.x - tank.x;
        const dy = target.y - tank.y;
        return Math.atan2(-dy, dx) * 180 / Math.PI;
    }
    
    selectWeapon(tank, target, situation) {
        // Use best available missile
        if (tank.inventory.missile > 0) return 'missile';
        return 'baby_missile';
    }
}
```

**File:** `src/core/ai/personalities/ShooterPersonality.ts`  
**Acceptance:** Accurate when line of sight, random otherwise

---

- [ ] **Implement Tosser personality**

**Specification:**
```typescript
export class TosserPersonality implements AIPersonality {
    name = 'Tosser';
    private lastShots: Map<string, ShotHistory[]> = new Map();
    
    calculateShot(tank, targets, terrain, wind, gravity) {
        const target = this.selectTarget(tank, targets);
        if (!target) return null;
        
        const targetKey = `${tank.id}-${target.id}`;
        const history = this.lastShots.get(targetKey) || [];
        
        if (history.length === 0) {
            // First shot: random arc
            const angle = 30 + Math.random() * 120;
            const power = 300 + Math.random() * 400;
            return { angle, power };
        }
        
        // Refine based on last shot
        const last = history[history.length - 1];
        let angle = last.angle;
        let power = last.power;
        
        // If overshot, reduce
        if (last.impactX > target.x) {
            angle -= 5 + Math.random() * 10;
            power *= 0.9;
        } else {
            // Undershot, increase
            angle += 5 + Math.random() * 10;
            power *= 1.1;
        }
        
        return { angle, power };
    }
    
    // Store shot results for refinement
    recordShot(tankId, targetId, angle, power, impactX, impactY) {
        const key = `${tankId}-${targetId}`;
        const history = this.lastShots.get(key) || [];
        history.push({ angle, power, impactX, impactY });
        if (history.length > 5) history.shift(); // Keep last 5
        this.lastShots.set(key, history);
    }
}
```

**File:** `src/core/ai/personalities/TosserPersonality.ts`  
**Acceptance:** Gets closer with each shot, learns over time

---

- [ ] **Implement Unknown personality**

**Specification:**
```typescript
export class UnknownPersonality implements AIPersonality {
    name = 'Unknown';
    private delegate: AIPersonality;
    
    constructor() {
        // Randomly pick one of the other personalities
        const personalities = [
            new MoronPersonality(),
            new ShooterPersonality(),
            new TosserPersonality(),
            new PoolsharkPersonality(),
            new ChooserPersonality(),
            new SpoilerPersonality(),
            new CyborgPersonality()
        ];
        this.delegate = personalities[
            Math.floor(Math.random() * personalities.length)
        ];
    }
    
    // Delegate all calls
    calculateShot(...args) { return this.delegate.calculateShot(...args); }
    selectTarget(...args) { return this.delegate.selectTarget(...args); }
    selectWeapon(...args) { return this.delegate.selectWeapon(...args); }
}
```

**File:** `src/core/ai/personalities/UnknownPersonality.ts`  
**Acceptance:** Acts like random personality (not revealed to player)

---

### Task Group 3.3: Advanced Personalities

- [ ] **Implement Poolshark personality**

**Specification:**
Requires border mode 'bounce' or 'concrete' walls.

```typescript
export class PoolsharkPersonality implements AIPersonality {
    name = 'Poolshark';
    
    calculateShot(tank, targets, terrain, wind, gravity) {
        const target = this.selectTarget(tank, targets);
        if (!target) return null;
        
        // Try direct shot first (like Shooter)
        if (this.hasLineOfSight(tank, target, terrain)) {
            return this.calculateDirectShot(tank, target);
        }
        
        // Try rebound shots off walls/ceiling
        if (gameState.borderMode === 'bounce' || 
            gameState.borderMode === 'concrete') {
            const rebound = this.calculateReboundShot(tank, target);
            if (rebound) return rebound;
        }
        
        // Fallback: random
        return { angle: Math.random() * 180, power: 400 };
    }
    
    private calculateReboundShot(tank, target) {
        // Try bouncing off left wall
        const leftRebound = this.tryWallRebound(
            tank, target, 0, 'left'
        );
        if (leftRebound) return leftRebound;
        
        // Try bouncing off right wall
        const rightRebound = this.tryWallRebound(
            tank, target, CONSTANTS.SCREEN_WIDTH, 'right'
        );
        if (rightRebound) return rightRebound;
        
        // Try bouncing off ceiling
        const ceilingRebound = this.tryCeilingRebound(tank, target);
        return ceilingRebound;
    }
    
    private tryWallRebound(tank, target, wallX, side) {
        // Physics: calculate angle to hit wall such that
        // reflection reaches target
        // Returns { angle, power } or null
        // ... complex ballistic calculation ...
    }
}
```

**File:** `src/core/ai/personalities/PoolsharkPersonality.ts`  
**Note:** Requires Phase 10 border modes  
**Acceptance:** Bounces shots off walls when enabled

---

- [ ] **Implement Chooser personality**

**Specification:**
```typescript
export class ChooserPersonality implements AIPersonality {
    name = 'Chooser';
    private strategies: AIPersonality[];
    
    constructor() {
        this.strategies = [
            new ShooterPersonality(),
            new TosserPersonality(),
            new PoolsharkPersonality()
        ];
    }
    
    calculateShot(tank, targets, terrain, wind, gravity) {
        // Evaluate all strategies
        const evaluations = this.strategies.map(strategy => ({
            strategy,
            shot: strategy.calculateShot(tank, targets, terrain, wind, gravity),
            score: this.evaluateShot(strategy, tank, targets, terrain)
        }));
        
        // Pick best strategy
        evaluations.sort((a, b) => b.score - a.score);
        return evaluations[0].shot;
    }
    
    private evaluateShot(strategy, tank, targets, terrain): number {
        // Shooter: high score if clear line of sight
        if (strategy.name === 'Shooter') {
            return this.hasLineOfSight(tank, targets[0], terrain) ? 10 : 1;
        }
        // Tosser: medium score always
        if (strategy.name === 'Tosser') {
            return 5;
        }
        // Poolshark: high if walls available
        if (strategy.name === 'Poolshark') {
            return gameState.borderMode === 'bounce' ? 8 : 1;
        }
        return 3;
    }
}
```

**File:** `src/core/ai/personalities/ChooserPersonality.ts`  
**Acceptance:** Picks best available strategy per turn

---

- [ ] **Implement Spoiler personality**

**Specification:**
```typescript
export class SpoilerPersonality implements AIPersonality {
    name = 'Spoiler';
    
    calculateShot(tank, targets, terrain, wind, gravity) {
        const target = this.selectTarget(tank, targets);
        if (!target) return null;
        
        // Solve ballistic equation exactly
        const solution = this.solveBallistics(
            tank.x, tank.y,
            target.x, target.y,
            wind, gravity
        );
        
        if (solution) {
            // Add tiny random error (5% for realism)
            const angleError = (Math.random() - 0.5) * 5;
            const powerError = (Math.random() - 0.5) * 0.1;
            
            return {
                angle: solution.angle + angleError,
                power: solution.power * (1 + powerError)
            };
        }
        
        // No solution: fallback
        return { angle: 45, power: 500 };
    }
    
    private solveBallistics(x0, y0, x1, y1, wind, gravity) {
        // Quadratic formula to solve for angle/power
        // that hits (x1, y1) from (x0, y0)
        // Returns { angle, power } or null if impossible
        
        const dx = x1 - x0;
        const dy = y1 - y0;
        
        // Try multiple power levels, find angle
        for (let power = 200; power <= 1000; power += 50) {
            const v0 = power;
            
            // With wind: more complex
            // Ignoring wind for now (weakness)
            if (Math.abs(wind) > 10) {
                // Vulnerable to wind
                continue;
            }
            
            // Solve for angle
            const g = gravity;
            const discriminant = 
                v0*v0*v0*v0 - g*(g*dx*dx + 2*dy*v0*v0);
            
            if (discriminant >= 0) {
                const angle = Math.atan2(
                    v0*v0 + Math.sqrt(discriminant),
                    g * dx
                ) * 180 / Math.PI;
                
                if (angle >= 0 && angle <= 180) {
                    return { angle, power };
                }
            }
        }
        
        return null;
    }
}
```

**File:** `src/core/ai/personalities/SpoilerPersonality.ts`  
**Acceptance:** Near-perfect accuracy, vulnerable to wind

---

- [ ] **Implement Cyborg personality**

**Specification:**
```typescript
export class CyborgPersonality implements AIPersonality {
    name = 'Cyborg';
    private vendetta: Map<number, number> = new Map(); // tankId -> grudge
    
    calculateShot(tank, targets, terrain, wind, gravity) {
        // Use Spoiler-level accuracy
        const spoiler = new SpoilerPersonality();
        return spoiler.calculateShot(tank, targets, terrain, wind, gravity);
    }
    
    selectTarget(tank, targets): TankState | null {
        const alive = targets.filter(t => !t.isDead);
        if (alive.length === 0) return null;
        
        // Priority system
        let scores = alive.map(t => ({
            tank: t,
            score: this.calculateTargetScore(tank, t)
        }));
        
        // Pick highest score
        scores.sort((a, b) => b.score - a.score);
        return scores[0].tank;
    }
    
    private calculateTargetScore(self, target): number {
        let score = 100;
        
        // Target weakened tanks
        if (target.health < 50) score += 50;
        if (target.health < 20) score += 100;
        
        // Target winning players
        const avgCredits = targets.reduce((sum, t) => 
            sum + t.credits, 0) / targets.length;
        if (target.credits > avgCredits * 1.5) {
            score += 75;
        }
        
        // Revenge: prioritize who hit us
        const grudge = this.vendetta.get(target.id) || 0;
        score += grudge * 25;
        
        return score;
    }
    
    recordHit(attackerId: number) {
        const current = this.vendetta.get(attackerId) || 0;
        this.vendetta.set(attackerId, current + 1);
    }
    
    selectWeapon(tank, target, situation) {
        // Smart weapon selection
        if (situation.distanceToTarget > 400 && tank.inventory.nuke > 0) {
            return 'nuke'; // Long range
        }
        if (situation.terrainBetween && tank.inventory.sandhog > 0) {
            return 'sandhog'; // Tunnel through
        }
        if (tank.inventory.mirv > 0) {
            return 'mirv'; // Powerful
        }
        if (tank.inventory.missile > 0) {
            return 'missile';
        }
        return 'baby_missile';
    }
}
```

**File:** `src/core/ai/personalities/CyborgPersonality.ts`  
**Acceptance:** Strategic targeting, smart weapon choice

---

### Task Group 3.4: AI Buying Behavior

- [ ] **Implement AI shopping logic**

**Specification:**
Add to each AIPersonality:
```typescript
interface AIPersonality {
    // ... existing methods
    
    // Decide what to buy in shop
    decidePurchases(
        tank: TankState,
        availableWeapons: string[],
        prices: Record<string, number>
    ): string[]; // Returns list of items to buy
}
```

Example for Cyborg:
```typescript
decidePurchases(tank, availableWeapons, prices) {
    const toBuy: string[] = [];
    let budget = tank.credits * 0.7; // Spend 70%, save 30%
    
    // Priority: shields for defense
    if (tank.accessories.shield < 2 && prices.shield <= budget) {
        toBuy.push('shield');
        budget -= prices.shield;
    }
    
    // Priority: powerful weapons
    if (tank.inventory.mirv < 5 && prices.mirv <= budget) {
        toBuy.push('mirv');
        budget -= prices.mirv;
    }
    
    // Fill with missiles
    while (prices.missile <= budget && tank.inventory.missile < 50) {
        toBuy.push('missile');
        budget -= prices.missile;
    }
    
    return toBuy;
}
```

Moron: Buys randomly  
Tosser/Shooter: Buys cheap weapons  
Spoiler/Cyborg: Buys strategically  

**File:** Update all personality files  
**Acceptance:** AI makes personality-appropriate purchases

---

### Task Group 3.5: Testing
- [ ] Unit test: Moron random shots
- [ ] Unit test: Shooter line-of-sight detection
- [ ] Unit test: Tosser refinement (gets closer)
- [ ] Unit test: Spoiler ballistic solver
- [ ] Unit test: Cyborg target priority
- [ ] Integration test: Unknown picks random delegate
- [ ] Integration test: Chooser evaluates strategies
- [ ] Integration test: AI purchasing logic

---

## Phase 4: Configuration System
**Goal:** Expose all game options from spec

### Task Group 4.1: Configuration Data Structure

- [ ] **Create ConfigManager.ts**

**Specification:**
```typescript
export interface GameConfiguration {
    // Physics
    physics: {
        gravityMultiplier: number; // 0.5 to 3.0
        windMode: 'none' | 'constant' | 'per-round' | 'dynamic';
        windStrength: number; // -50 to 50
        explosionSizeMultiplier: number; // 0.5 to 2.0
        projectileSpeedMultiplier: number; // 0.5 to 2.0
    };
    
    // Economy
    economy: {
        startingMoney: number; // 0 to 1000000
        interestRate: number; // 0.0 to 0.2
        marketVolatility: 'none' | 'low' | 'medium' | 'high';
        maxArmsLevel: number; // 1 to 10
    };
    
    // Gameplay
    gameplay: {
        maxRounds: number; // 1 to 1000
        playerCount: number; // 2 to 10
        turnOrder: 'sequential' | 'random' | 'team';
        simultaneousFiring: boolean;
        maxPowerCap: number; // 500 to 1500
    };
    
    // Visual
    visual: {
        showTrajectories: boolean;
        talkingTanks: boolean;
        extendedStatusBar: boolean;
        windIndicatorStyle: 'arrow' | 'text' | 'both' | 'none';
    };
}

export class ConfigManager {
    private config: GameConfiguration;
    private readonly STORAGE_KEY = 'tanks_config';
    
    constructor() {
        this.config = this.loadConfig() || this.getDefaults();
    }
    
    getDefaults(): GameConfiguration {
        return {
            physics: {
                gravityMultiplier: 1.0,
                windMode: 'per-round',
                windStrength: 0,
                explosionSizeMultiplier: 1.0,
                projectileSpeedMultiplier: 1.0
            },
            economy: {
                startingMoney: 10000,
                interestRate: 0.05,
                marketVolatility: 'medium',
                maxArmsLevel: 10
            },
            gameplay: {
                maxRounds: 10,
                playerCount: 4,
                turnOrder: 'sequential',
                simultaneousFiring: false,
                maxPowerCap: 1000
            },
            visual: {
                showTrajectories: true,
                talkingTanks: true,
                extendedStatusBar: false,
                windIndicatorStyle: 'both'
            }
        };
    }
    
    saveConfig(): void {
        localStorage.setItem(this.STORAGE_KEY, 
            JSON.stringify(this.config));
    }
    
    loadConfig(): GameConfiguration | null {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    }
    
    resetToDefaults(): void {
        this.config = this.getDefaults();
        this.saveConfig();
    }
    
    exportConfig(): string {
        return JSON.stringify(this.config, null, 2);
    }
    
    importConfig(jsonString: string): boolean {
        try {
            this.config = JSON.parse(jsonString);
            this.saveConfig();
            return true;
        } catch (e) {
            return false;
        }
    }
}
```

**File:** Create `src/core/ConfigManager.ts`  
**Acceptance:** Configuration persists, can export/import JSON

---

### Task Group 4.2: Settings UI

- [ ] **Create settings menu screen**

**Specification:**
Create `src/ui/SettingsScreen.ts`:

```typescript
export class SettingsScreen {
    render(config: GameConfiguration) {
        // Render tabbed interface:
        // - Physics tab
        // - Economy tab
        // - Gameplay tab
        // - Visual tab
        
        // Each tab contains controls for relevant settings
    }
    
    renderPhysicsTab(physics: PhysicsConfig) {
        // Gravity slider: 0.5x to 3.0x
        // Wind mode dropdown
        // Wind strength slider (if not 'none')
        // Explosion size slider
        // Projectile speed slider
    }
    
    renderEconomyTab(economy: EconomyConfig) {
        // Starting money input (0-1000000)
        // Interest rate slider (0%-20%)
        // Market volatility dropdown
        // Max arms level slider (1-10)
    }
    
    renderGameplayTab(gameplay: GameplayConfig) {
        // Max rounds input (1-1000)
        // Player count selector (2-10)
        // Turn order radio buttons
        // Simultaneous firing checkbox
        // Max power cap slider (500-1500)
    }
    
    renderVisualTab(visual: VisualConfig) {
        // Show trajectories checkbox
        // Talking tanks checkbox
        // Extended status bar checkbox
        // Wind indicator style dropdown
    }
}
```

UI Controls:
- Sliders for continuous values
- Dropdowns for enums
- Checkboxes for booleans
- Number inputs for integers
- "Apply", "Cancel", "Reset to Defaults" buttons

**Files:** Create `src/ui/SettingsScreen.ts` and UI components  
**Acceptance:** All config options accessible via UI

---

### Task Group 4.3: Apply Configuration

- [ ] **Integrate config into GameEngine**

**Specification:**
In `GameEngine.ts`:
```typescript
export class GameEngine {
    private config: ConfigManager;
    
    initialize() {
        this.config = new ConfigManager();
        
        // Apply to GameState
        this.gameState.gravity = 
            CONSTANTS.GRAVITY * this.config.get().physics.gravityMultiplier;
        
        this.gameState.economyConfig = this.config.get().economy;
        
        this.gameState.maxRounds = this.config.get().gameplay.maxRounds;
        
        // ... apply all config values
    }
    
    updateConfig(newConfig: GameConfiguration) {
        this.config.set(newConfig);
        this.config.saveConfig();
        
        // Re-apply to game state
        this.applyConfig();
    }
}
```

Each system reads from config:
- PhysicsSystem: reads gravity, projectile speed multipliers
- EconomySystem: reads volatility, interest rate
- RenderSystem: reads visual settings

**Files:** `src/core/GameEngine.ts`, all system files  
**Acceptance:** Changing config affects gameplay immediately

---

### Task Group 4.4: Testing
- [ ] Unit test: default config values
- [ ] Unit test: save/load persistence
- [ ] Unit test: export/import JSON
- [ ] Unit test: reset to defaults
- [ ] Integration test: gravity multiplier affects projectiles
- [ ] Integration test: wind mode changes wind behavior
- [ ] Integration test: arms level filters shop
- [ ] Integration test: interest rate applied correctly

---

## Phase 5: Defense & Accessory Systems
**Goal:** Complete item mechanics

### Task Group 5.1: Enhanced Shield Mechanics

- [ ] **Implement shield health system**

**Specification:**
Update `TankState`:
```typescript
export interface TankState {
    // ... existing
    shields: {
        count: number; // How many shields owned
        active: boolean; // Is shield currently up
        health: number; // Current shield HP
        maxHealthPerShield: number; // 100 per shield
    };
}
```

In damage handling:
```typescript
applyDamage(tank: TankState, damage: number): void {
    if (tank.shields.active && tank.shields.health > 0) {
        // Shield absorbs damage first
        const absorbed = Math.min(damage, tank.shields.health);
        tank.shields.health -= absorbed;
        damage -= absorbed;
        
        if (tank.shields.health <= 0) {
            tank.shields.active = false;
            // Show shield break animation
            this.triggerShieldBreak(tank);
        }
    }
    
    // Remaining damage goes to tank
    tank.health -= damage;
}
```

Activating shield:
```typescript
activateShield(tank: TankState): boolean {
    if (tank.shields.count === 0) return false;
    
    tank.shields.active = true;
    tank.shields.health = tank.shields.count * 100;
    
    return true;
}
```

**Files:** `src/core/GameState.ts`, `src/systems/PhysicsSystem.ts`  
**Acceptance:** Shields absorb damage, break when depleted

---

- [ ] **Add shield visual effects**

**Specification:**
In RenderSystem:
```typescript
renderShield(ctx: CanvasRenderingContext2D, tank: TankState) {
    if (!tank.shields.active) return;
    
    const radius = 30;
    const alpha = tank.shields.health / 
        (tank.shields.count * 100); // Fade as damaged
    
    ctx.save();
    ctx.globalAlpha = alpha * 0.5;
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(tank.x, tank.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Add shimmer effect
    this.renderShieldShimmer(ctx, tank, radius);
    
    ctx.restore();
}
```

Shield break animation:
- Particle burst in cyan
- Flash effect
- Sound effect

**File:** `src/systems/RenderSystem.ts`  
**Acceptance:** Shield visible when active, breaks dramatically

---

### Task Group 5.2: Auto-Defense

- [ ] **Implement auto-defense system**

**Specification:**
Add to TankState:
```typescript
export interface TankState {
    // ... existing
    autoDefense: {
        autoShield: boolean; // Activate shield on incoming
        autoParachute: boolean; // Deploy parachute when falling
        configured: boolean;
    };
}
```

In PhysicsSystem, detect incoming projectiles:
```typescript
checkIncomingThreats(tank: TankState, projectiles: ProjectileState[]) {
    if (!tank.autoDefense.autoShield) return;
    if (tank.shields.active) return; // Already up
    if (tank.shields.count === 0) return;
    
    // Check if any projectile will hit soon
    for (const proj of projectiles) {
        const timeToImpact = this.calculateTimeToImpact(proj, tank);
        if (timeToImpact > 0 && timeToImpact < 1.0) { // < 1 second
            this.activateShield(tank);
            break;
        }
    }
}

checkFalling(tank: TankState) {
    if (!tank.isFalling) return;
    if (tank.isParachuteDeployed) return;
    if (!tank.autoDefense.autoParachute) return;
    if (tank.accessories.parachute === 0) return;
    
    // Auto-deploy if falling fast
    if (tank.vy > 5.0) {
        this.deployParachute(tank);
    }
}
```

**File:** `src/systems/PhysicsSystem.ts`  
**Acceptance:** Shield auto-activates on threat, parachute auto-deploys

---

### Task Group 5.3: Contact Triggers

- [ ] **Implement contact trigger mode**

**Specification:**
Add to WeaponStats:
```typescript
export interface WeaponStats {
    // ... existing
    allowTrigger: boolean; // Can use contact trigger
}
```

Add to TankState:
```typescript
export interface TankState {
    // ... existing
    triggerMode: boolean; // Use contact trigger for next shot
}
```

In PhysicsSystem collision:
```typescript
checkProjectileCollision(proj: ProjectileState) {
    const weapon = WEAPONS[proj.weaponType];
    const tank = this.getTankById(proj.ownerId);
    
    // Normal: check for terrain/tank hit
    const hit = this.detectCollision(proj);
    
    if (tank.triggerMode && weapon.allowTrigger) {
        // Contact trigger: explode on ANY contact
        if (hit) {
            this.explodeProjectile(proj);
            tank.triggerMode = false; // One-shot
        }
    } else {
        // Normal: specific hit detection
        if (hit && this.shouldExplode(proj, hit)) {
            this.explodeProjectile(proj);
        }
    }
}
```

UI: Add "Contact Trigger" checkbox in weapon selection

**Files:** `src/systems/PhysicsSystem.ts`, weapon selection UI  
**Acceptance:** Trigger mode causes instant detonation on contact

---

### Task Group 5.4: Guidance Systems (Advanced)

- [ ] **Implement homing device**

**Specification:**
Add accessory:
```typescript
{
    name: 'Homing Device',
    cost: 15000,
    bundleSize: 1,
    description: 'Guides projectile toward target.',
    type: 'item',
    effectValue: 1
}
```

Add to TankState:
```typescript
export interface TankState {
    // ... existing
    accessories: {
        // ... existing
        homingDevice: number;
    };
    homingActive: boolean; // Use homing for next shot
}
```

In PhysicsSystem update:
```typescript
updateProjectile(proj: ProjectileState, dt: number) {
    // ... normal physics
    
    if (proj.homing) {
        const target = this.findNearestEnemy(proj.ownerId);
        if (target) {
            const dx = target.x - proj.x;
            const dy = target.y - proj.y;
            const angle = Math.atan2(dy, dx);
            
            // Turn toward target (limited turning rate)
            const turnRate = 0.05; // radians per frame
            const currentAngle = Math.atan2(proj.vy, proj.vx);
            const angleDiff = angle - currentAngle;
            
            const newAngle = currentAngle + 
                Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), turnRate);
            
            const speed = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
            proj.vx = Math.cos(newAngle) * speed;
            proj.vy = Math.sin(newAngle) * speed;
        }
    }
}
```

**Files:** `src/core/WeaponData.ts`, `src/systems/PhysicsSystem.ts`  
**Acceptance:** Homing projectiles curve toward targets

---

- [ ] **Implement mag deflector**

**Specification:**
```typescript
{
    name: 'Mag Deflector',
    cost: 12000,
    bundleSize: 1,
    description: 'Deflects nearby projectiles.',
    type: 'item',
    effectValue: 1
}
```

Add to TankState:
```typescript
export interface TankState {
    // ... existing
    accessories: {
        // ... existing
        magDeflector: number;
    };
    magDeflectorActive: boolean;
}
```

In PhysicsSystem:
```typescript
checkMagneticFields(proj: ProjectileState) {
    for (const tank of this.gameState.tanks) {
        if (tank.id === proj.ownerId) continue;
        if (!tank.magDeflectorActive) continue;
        if (tank.accessories.magDeflector === 0) continue;
        
        const dx = tank.x - proj.x;
        const dy = tank.y - proj.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 100) { // Effect radius
            // Repel projectile
            const force = 50 / (dist + 1);
            proj.vx -= (dx / dist) * force * dt;
            proj.vy -= (dy / dist) * force * dt;
        }
    }
}
```

**Files:** `src/core/WeaponData.ts`, `src/systems/PhysicsSystem.ts`  
**Acceptance:** Mag deflector pushes projectiles away

---

### Task Group 5.5: Parachute Enhancements

- [ ] **Configurable parachute deployment**

**Specification:**
Add to TankState:
```typescript
export interface TankState {
    // ... existing
    parachuteSettings: {
        autoDeployHeight: number; // Pixels above ground
        autoDeploySpeed: number; // vy threshold
        mode: 'auto' | 'manual';
    };
}
```

In shop UI, add parachute configuration panel:
- Slider for deployment height (0-200 pixels)
- Slider for speed threshold (0-20 pixels/frame)
- Radio: Auto vs Manual

In PhysicsSystem:
```typescript
checkParachuteDeploy(tank: TankState) {
    if (tank.isParachuteDeployed) return;
    if (tank.accessories.parachute === 0) return;
    if (!tank.isFalling) return;
    
    if (tank.parachuteSettings.mode === 'auto') {
        const groundDist = this.getGroundDistance(tank);
        
        if (groundDist <= tank.parachuteSettings.autoDeployHeight ||
            tank.vy >= tank.parachuteSettings.autoDeploySpeed) {
            this.deployParachute(tank);
        }
    }
    // Manual: player presses key
}
```

**File:** `src/systems/PhysicsSystem.ts`, shop UI  
**Acceptance:** Parachute deploys based on configured thresholds

---

### Task Group 5.6: Testing
- [ ] Unit test: shield health absorption
- [ ] Unit test: shield break at zero HP
- [ ] Unit test: auto-shield activation timing
- [ ] Unit test: auto-parachute deployment
- [ ] Unit test: contact trigger on first hit
- [ ] Unit test: homing projectile tracking
- [ ] Unit test: mag deflector repulsion
- [ ] Integration test: shield + mag deflector combo
- [ ] Integration test: parachute settings

---

## Phase 6: Team Play & Multiplayer
**Goal:** Implement team mechanics

### Team System
- [ ] **Create TeamSystem.ts**
  - Assign tanks to teams (1-4 teams)
  - Team victory conditions (last team standing)
  - Shared score tracking
  
- [ ] **Friendly fire toggle**
  - Configuration option
  - Damage/no-damage modes
  - Team color indicators
  
- [ ] **Team communication** (optional)
  - Shared credits pool (configurable)
  - Team chat in hotseat mode
  
- [ ] **UI updates**
  - Team color borders on tanks
  - Team scoreboard
  - Victory announcement per team

### Hotseat Improvements
- [ ] Clear "Player X's Turn" indicator
- [ ] Input hiding (don't show aim to next player)
- [ ] Quick player skip (if dead)

**Testing:**
- [ ] Team victory condition tests
- [ ] Friendly fire on/off tests
- [ ] Multi-team scenarios
- [ ] Edge case: 1-person teams

---

## Phase 7: Enhanced UI/UX (1 week)
**Goal:** Implement missing UI features

### HUD Enhancements
- [ ] **Second status bar**
  - Show max power and current limit
  - Battery count for energy weapons
  - Fuel remaining display
  
- [ ] **Wind indicator arrow**
  - Arrow graphic with direction
  - Numeric value display
  - "No Wind" text when disabled
  
- [ ] **Advanced inventory display**
  - Show count / 99 for each item
  - Bundle size in shop tooltips
  - Quick-select hotkeys (1-9)

### Talking Tanks
- [ ] **Create TalkingTanksSystem.ts**
  - Pre-fire taunts (random selection)
  - Death last words
  - Victory celebrations
  - Hit reactions ("Ouch!", "Missed!", etc.)
  
- [ ] **Text display**
  - Speech bubble above tank
  - Timed display (2-3 seconds)
  - Optional voice synthesis (bonus)

### Player Setup Screen
- [ ] Tank icon selection (7 variants)
- [ ] Fixed emplacement toggle (disable fuel)
- [ ] Color picker
- [ ] Name input
- [ ] AI personality dropdown
- [ ] Team assignment

**Testing:**
- [ ] UI element positioning tests
- [ ] Text overflow handling
- [ ] Talking tanks message rotation
- [ ] Player setup validation

---

## Phase 8: Save/Load System (1 week)
**Goal:** Implement persistence

### Core Persistence
- [ ] **Create SaveLoadSystem.ts**
  - Serialize full GameState to JSON
  - Include all tanks, inventory, terrain
  - Store configuration with save
  
- [ ] **Save file management**
  - Multiple save slots (1-10)
  - Auto-save between rounds
  - Quick save/load hotkeys
  
- [ ] **Market database persistence**
  - Save price history separately
  - Load on game start
  - Reset option in menu

### UI
- [ ] Save/Load menu screen
- [ ] Save file browser with metadata
- [ ] Confirmation dialogs
- [ ] Overwrite warnings

**Testing:**
- [ ] Save/load round-trip integrity
- [ ] Large game state handling
- [ ] Corrupted save file handling
- [ ] Market history persistence

---

## Phase 9: Audio System (1 week)
**Goal:** Complete sound implementation

### Sound Effects
- [ ] **Weapon-specific sounds**
  - Firing sounds per weapon type
  - Explosion sounds (varied by size)
  - Special weapon effects (napalm sizzle, laser beam)
  
- [ ] **Environmental sounds**
  - Tank movement (wheels/treads)
  - Wind gusts (if high wind)
  - Terrain collapse
  
- [ ] **UI sounds**
  - Button clicks
  - Purchase confirmations
  - Invalid action buzzer
  
- [ ] **Talking tanks audio** (optional)
  - Text-to-speech integration
  - Or pre-recorded voice lines
  - Configurable volume

### Music
- [ ] Background music (chiptune style)
- [ ] Menu music
- [ ] Victory/defeat themes
- [ ] Music volume control separate from SFX

**Testing:**
- [ ] All sound effects trigger correctly
- [ ] Volume controls work
- [ ] No audio glitches during explosions
- [ ] Mute functionality

---

## Phase 10: Polish & Missing Mechanics (2 weeks)
**Goal:** Implement remaining spec features

### Terrain & Physics
- [ ] **Fixed emplacement tanks**
  - Icons without wheels/treads
  - Cannot purchase or use fuel
  - Stay fixed unless terrain collapses
  
- [ ] **Tank slipping mechanics**
  - Detect steep slopes (>45 degrees)
  - Apply sliding physics
  - Damage from collision at bottom
  
- [ ] **Height-based fall damage**
  - Calculate fall distance
  - Damage = distance * factor
  - Parachute prevents damage
  
- [ ] **Environmental hazards** (optional)
  - Meteor showers (random projectiles)
  - Lightning strikes
  - Configuration toggles

### Border Modes
- [ ] **Implement border options**
  - Normal (stops at edge)
  - Wrap (toroidal world)
  - Bounce (rebounds)
  - Concrete walls (solid barriers)
  
- [ ] **Poolshark AI** requires concrete walls for rebounds

### Triple-Turreted Tank (AI-only)
- [ ] **Special AI variant**
  - Fires 3 simultaneous shots (Baby Missile or Missile)
  - Only available to AI
  - Icon selection in AI setup
  - Balance testing

**Testing:**
- [ ] Fixed emplacement immobility
- [ ] Slope sliding physics
- [ ] Fall damage calculations
- [ ] Border mode physics
- [ ] Triple-turret firing

---

## Phase 11: Platform Adaptation (4+ weeks)
**Goal:** Multi-platform support (optional/future)

### Desktop Builds
- [ ] Electron wrapper for Windows/Mac/Linux
- [ ] Native file system access
- [ ] Gamepad support
- [ ] Fullscreen modes

### Mobile Adaptation
- [ ] Touch control UI redesign
- [ ] On-screen joystick/sliders
- [ ] Portrait/landscape layouts
- [ ] Performance optimization for mobile GPUs
- [ ] PWA manifest for installability

### Cross-Platform
- [ ] Save file format compatibility
- [ ] Cloud save sync (optional)
- [ ] Platform-specific input handling

**Note:** This phase is lower priority and can be deferred.

---

## Testing Strategy

### Unit Tests (Ongoing)
- Add tests for each new system as implemented
- Aim for >80% code coverage
- Focus on physics, economy, AI decision-making

### Integration Tests
- Full game loop tests
- Multi-round scenarios
- Edge cases (all tanks dead simultaneously, etc.)

### Playtesting Milestones
1. **After Phase 1:** Core weapons playable
2. **After Phase 3:** AI personalities challenging
3. **After Phase 6:** Team play functional
4. **After Phase 10:** Full feature set ready

### Performance Benchmarks
- [ ] 60 FPS with 10 tanks active
- [ ] Smooth explosion rendering (large nukes)
- [ ] Terrain settling <100ms
- [ ] AI decision time <500ms

---

## Documentation Improvements

### Code Documentation
- [ ] JSDoc comments for all public APIs
- [ ] Architecture diagram (systems flow)
- [ ] Weapon behavior reference table
- [ ] AI personality behavior documentation

### User Documentation
- [ ] In-game help system
- [ ] Weapon tooltips with detailed stats
- [ ] Tutorial mode (optional)
- [ ] README updates with feature status

---

## Priority Matrix

### Must-Have (Blocks Compliance):
1. ✅ Weapon bundle system
2. ✅ Economic system (pricing, interest)
3. ✅ AI personalities (all 8)
4. ✅ Complete weapon roster
5. ✅ Configuration system

### Should-Have (Major Features):
6. Team play
7. Save/Load
8. Defense systems
9. Talking tanks
10. Enhanced UI

### Nice-to-Have (Polish):
11. Environmental hazards
12. Mobile support
13. Online multiplayer
14. Spectator mode
15. Custom content support

---

## Risk Assessment

### High Risk:
- **Physics complexity** for Poolshark AI (wall rebounds)
- **Performance** with 10 tanks + many projectiles
- **Economic balancing** (price volatility may break gameplay)

### Medium Risk:
- **AI testing** (hard to validate "smart" behavior)
- **Cross-platform save compatibility**
- **Audio sync** with fast-paced explosions

### Low Risk:
- UI implementation (straightforward)
- Configuration system (well-defined)
- Save/Load mechanics (standard serialization)

---

## Success Metrics

### Completion Targets:
- **Phase 1-5 Complete:** 60% feature compliance
- **Phase 1-8 Complete:** 85% feature compliance
- **Phase 1-10 Complete:** 95% feature compliance

### Quality Gates:
- ✅ All tests passing
- ✅ No critical bugs
- ✅ Performance benchmarks met
- ✅ Code review approved
- ✅ Playtest feedback positive

---

## Resource Estimates

**Total Effort:** ~12-14 weeks (1 senior developer)

| Phase | Effort | Priority |
|-------|--------|----------|
| Phase 1: Core Weapons | 2 weeks | Critical |
| Phase 2: Economy | 1.5 weeks | Critical |
| Phase 3: AI | 2 weeks | Critical |
| Phase 4: Config | 1 week | High |
| Phase 5: Defense | 1 week | High |
| Phase 6: Teams | 1.5 weeks | High |
| Phase 7: UI | 1 week | Medium |
| Phase 8: Save/Load | 1 week | Medium |
| Phase 9: Audio | 1 week | Medium |
| Phase 10: Polish | 2 weeks | Medium |
| Phase 11: Platform | 4+ weeks | Low |

**Recommended Sprint Length:** 2 weeks  
**Suggested Team:** 1-2 developers + 1 part-time tester

---

## Next Steps

1. **Review this plan with stakeholders**
2. **Prioritize phases** based on business needs
3. **Set up sprint planning** (2-week sprints recommended)
4. **Create detailed tickets** for Phase 1 tasks
5. **Begin implementation** with weapon bundle system

---

## Appendix: Quick Reference

### Files to Create:
- `src/systems/EconomySystem.ts`
- `src/systems/TeamSystem.ts`
- `src/systems/SaveLoadSystem.ts`
- `src/systems/AudioSystem.ts`
- `src/systems/TalkingTanksSystem.ts`
- `src/core/ConfigManager.ts`
- `src/core/AIPersonalityFactory.ts`
- `src/core/InventoryManager.ts`

### Files to Refactor:
- `src/core/WeaponData.ts` - Add bundle sizes
- `src/core/AIController.ts` - Extract personalities
- `src/systems/ShopSystem.ts` - Integrate economy
- `src/systems/PhysicsSystem.ts` - Add border modes, slipping
- `src/ui/*` - Enhanced HUD components

### Configuration Updates:
- `package.json` - May need audio/TTS libraries
- `vite.config.ts` - Build optimizations
- `tsconfig.json` - (no changes expected)

---

**End of Improvement Plan**
**Goal:** Implement team mechanics

### Task Group 6.1: Team System Core

- [ ] **Create TeamSystem.ts**

**Specification:**
```typescript
export interface Team {
    id: number;
    name: string;
    color: string;
    memberIds: number[]; // Tank IDs
    sharedCredits: boolean; // Pool money?
    totalCredits: number; // If shared
}

export class TeamSystem {
    private teams: Team[] = [];
    
    createTeam(name: string, color: string, sharedCredits: boolean): Team {
        const team: Team = {
            id: this.teams.length + 1,
            name,
            color,
            memberIds: [],
            sharedCredits,
            totalCredits: 0
        };
        this.teams.push(team);
        return team;
    }
    
    assignToTeam(tankId: number, teamId: number): void {
        const team = this.teams.find(t => t.id === teamId);
        if (!team) return;
        
        // Remove from previous team
        this.teams.forEach(t => {
            t.memberIds = t.memberIds.filter(id => id !== tankId);
        });
        
        team.memberIds.push(tankId);
    }
    
    checkVictory(aliveTanks: TankState[]): Team | null {
        // Victory: only one team has living members
        const teamsAlive = new Set<number>();
        aliveTanks.forEach(tank => {
            const team = this.getTeamForTank(tank.id);
            if (team) teamsAlive.add(team.id);
        });
        
        if (teamsAlive.size === 1) {
            const winningTeamId = Array.from(teamsAlive)[0];
            return this.teams.find(t => t.id === winningTeamId) || null;
        }
        
        return null;
    }
    
    poolCredits(teamId: number, tanks: TankState[]): void {
        const team = this.teams.find(t => t.id === teamId);
        if (!team || !team.sharedCredits) return;
        
        // Sum all team member credits
        team.totalCredits = tanks
            .filter(t => team.memberIds.includes(t.id))
            .reduce((sum, t) => sum + t.credits, 0);
    }
    
    distributeCredits(teamId: number, tanks: TankState[]): void {
        const team = this.teams.find(t => t.id === teamId);
        if (!team || !team.sharedCredits) return;
        
        const members = tanks.filter(t => team.memberIds.includes(t.id));
        const share = Math.floor(team.totalCredits / members.length);
        
        members.forEach(tank => {
            tank.credits = share;
        });
    }
}
```

**File:** Create `src/systems/TeamSystem.ts`  
**Acceptance:** Teams track members, check victory, pool credits optionally

---

- [ ] **Implement friendly fire toggle**

**Specification:**
Add to GameConfiguration:
```typescript
export interface GameConfiguration {
    // ... existing
    gameplay: {
        // ... existing
        friendlyFire: boolean;
    };
}
```

In PhysicsSystem damage:
```typescript
applyExplosionDamage(explosion: ExplosionState, tanks: TankState[]) {
    for (const tank of tanks) {
        const dist = distance(explosion, tank);
        if (dist > explosion.maxRadius) continue;
        
        const damage = calculateDamage(dist, explosion.maxRadius);
        
        // Check team friendly fire
        const shooterTank = this.getTankById(explosion.ownerId);
        const shooterTeam = teamSystem.getTeamForTank(shooterTank.id);
        const targetTeam = teamSystem.getTeamForTank(tank.id);
        
        if (shooterTeam && targetTeam && 
            shooterTeam.id === targetTeam.id &&
            !config.gameplay.friendlyFire) {
            // Skip damage to teammates
            continue;
        }
        
        this.applyDamage(tank, damage);
    }
}
```

**File:** `src/systems/PhysicsSystem.ts`  
**Acceptance:** Friendly fire prevents team damage when disabled

---

### Task Group 6.2: UI Updates

- [ ] **Add team indicators**

**Specification:**
In RenderSystem:
```typescript
renderTank(ctx: CanvasRenderingContext2D, tank: TankState) {
    // ... normal tank rendering
    
    // Add team border
    const team = teamSystem.getTeamForTank(tank.id);
    if (team) {
        ctx.strokeStyle = team.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(
            tank.x - 20, tank.y - 20,
            40, 40
        );
        
        // Team name label above tank
        ctx.fillStyle = team.color;
        ctx.font = '10px monospace';
        ctx.fillText(team.name, tank.x - 15, tank.y - 25);
    }
}
```

**File:** `src/systems/RenderSystem.ts`  
**Acceptance:** Team members have colored borders/labels

---

- [ ] **Create team scoreboard**

**Specification:**
```typescript
renderTeamScoreboard(ctx: CanvasRenderingContext2D, teams: Team[]) {
    let y = 10;
    
    teams.forEach(team => {
        const members = gameState.tanks.filter(t => 
            team.memberIds.includes(t.id)
        );
        const aliveCount = members.filter(t => !t.isDead).length;
        
        ctx.fillStyle = team.color;
        ctx.font = 'bold 14px monospace';
        ctx.fillText(
            `${team.name}: ${aliveCount}/${members.length} alive`,
            10, y
        );
        
        if (team.sharedCredits) {
            ctx.font = '12px monospace';
            ctx.fillText(`$${team.totalCredits}`, 150, y);
        }
        
        y += 20;
    });
}
```

Display:
- Team name and color
- Alive/total members
- Shared credits if enabled

**File:** `src/systems/RenderSystem.ts` or UI component  
**Acceptance:** Scoreboard shows team status

---

- [ ] **Team victory screen**

**Specification:**
```typescript
showTeamVictory(team: Team) {
    // Large banner
    ctx.fillStyle = team.color;
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
        `${team.name} WINS!`,
        CONSTANTS.SCREEN_WIDTH / 2,
        CONSTANTS.SCREEN_HEIGHT / 2
    );
    
    // List surviving members
    const survivors = gameState.tanks.filter(t => 
        team.memberIds.includes(t.id) && !t.isDead
    );
    
    ctx.font = '24px monospace';
    let y = CONSTANTS.SCREEN_HEIGHT / 2 + 50;
    survivors.forEach(tank => {
        ctx.fillText(tank.name, CONSTANTS.SCREEN_WIDTH / 2, y);
        y += 30;
    });
}
```

**File:** Victory UI component  
**Acceptance:** Team victory displays team name and survivors

---

### Task Group 6.3: Player Setup

- [ ] **Create team setup screen**

**Specification:**
Pre-game setup UI:
```typescript
export class TeamSetupScreen {
    render() {
        // Show list of players (humans + AI)
        // For each player:
        //   - Name input
        //   - Tank icon selection (7 variants)
        //   - Color picker
        //   - Team assignment dropdown (None, Team 1-4)
        //   - AI personality (if AI player)
        
        // Team configuration:
        //   - Enable/disable teams
        //   - Shared credits toggle per team
        //   - Friendly fire global toggle
        
        // Buttons: Start Game, Cancel
    }
    
    validateSetup(): boolean {
        // At least 2 players
        // If teams enabled, at least 2 teams with members
        // No duplicate names
        return true;
    }
}
```

**File:** Create `src/ui/TeamSetupScreen.ts`  
**Acceptance:** Can configure players and assign to teams before game

---

### Task Group 6.4: Testing
- [ ] Unit test: team creation and member assignment
- [ ] Unit test: victory check (one team remaining)
- [ ] Unit test: shared credits pooling
- [ ] Unit test: friendly fire toggle
- [ ] Integration test: team game full flow
- [ ] Integration test: shared credits in shop

---

## Phase 7: Enhanced UI/UX
**Goal:** Implement missing UI features

### Task Group 7.1: Extended Status Bar

- [ ] **Implement second status line**

**Specification:**
```typescript
renderExtendedStatusBar(ctx: CanvasRenderingContext2D, tank: TankState) {
    // First line (existing): Player, Weapon, Angle, Power, Wind
    
    // Second line:
    const y = 35; // Below first line
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px monospace';
    
    let x = 10;
    
    // Max power indicator
    ctx.fillText(`Max Power: ${config.gameplay.maxPowerCap}`, x, y);
    x += 150;
    
    // Battery count (for energy weapons)
    if (tank.accessories.battery > 0) {
        ctx.fillText(`Batteries: ${tank.accessories.battery}`, x, y);
        x += 120;
    }
    
    // Fuel remaining
    ctx.fillText(`Fuel: ${tank.fuel}`, x, y);
    x += 100;
    
    // Shield status
    if (tank.shields.count > 0) {
        const status = tank.shields.active ? 
            `Active (${tank.shields.health}HP)` : `${tank.shields.count}x`;
        ctx.fillText(`Shield: ${status}`, x, y);
    }
}
```

Toggle via config: `visual.extendedStatusBar`

**File:** `src/systems/RenderSystem.ts`  
**Acceptance:** Second line shows additional info when enabled

---

### Task Group 7.2: Wind Indicator

- [ ] **Implement wind indicator arrow**

**Specification:**
```typescript
renderWindIndicator(ctx: CanvasRenderingContext2D, wind: number) {
    const style = config.visual.windIndicatorStyle;
    if (style === 'none') return;
    
    const x = CONSTANTS.SCREEN_WIDTH - 100;
    const y = 30;
    
    if (wind === 0) {
        if (style === 'text' || style === 'both') {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '14px monospace';
            ctx.fillText('No Wind', x, y);
        }
        return;
    }
    
    // Arrow
    if (style === 'arrow' || style === 'both') {
        const arrowLen = Math.min(Math.abs(wind) * 2, 50);
        const direction = Math.sign(wind);
        
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        
        // Arrow shaft
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + direction * arrowLen, y);
        ctx.stroke();
        
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(x + direction * arrowLen, y);
        ctx.lineTo(x + direction * (arrowLen - 5), y - 5);
        ctx.moveTo(x + direction * arrowLen, y);
        ctx.lineTo(x + direction * (arrowLen - 5), y + 5);
        ctx.stroke();
    }
    
    // Numeric value
    if (style === 'text' || style === 'both') {
        ctx.fillStyle = '#00FFFF';
        ctx.font = '14px monospace';
        const text = wind > 0 ? `→${wind}` : `←${Math.abs(wind)}`;
        ctx.fillText(text, x + 60, y + 5);
    }
}
```

**File:** `src/systems/RenderSystem.ts`  
**Acceptance:** Wind shown as arrow, text, both, or none

---

### Task Group 7.3: Inventory Display

- [ ] **Enhanced inventory panel**

**Specification:**
```typescript
renderInventoryPanel(ctx: CanvasRenderingContext2D, tank: TankState) {
    const x = 10;
    let y = 100;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, 200, 400);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('Inventory', x + 10, y + 20);
    
    y += 30;
    
    // List weapons
    for (const weaponId in tank.inventory) {
        const count = tank.inventory[weaponId];
        if (count === 0) continue;
        
        const weapon = WEAPONS[weaponId];
        const isSelected = tank.currentWeapon === weaponId;
        
        // Highlight selected
        if (isSelected) {
            ctx.fillStyle = '#FFFF00';
        } else {
            ctx.fillStyle = '#FFFFFF';
        }
        
        ctx.font = '12px monospace';
        
        // Show count / max
        const countText = weapon.cost === 0 ? 
            '∞' : `${count}/${weapon.maxInventory}`;
        
        ctx.fillText(
            `${weapon.name}: ${countText}`,
            x + 10, y
        );
        
        y += 18;
    }
}
```

Hotkeys: 1-9 to select weapons in order

**File:** `src/systems/RenderSystem.ts` or UI component  
**Acceptance:** Shows count/99, highlights selected, hotkey support

---

### Task Group 7.4: Talking Tanks

- [ ] **Create TalkingTanksSystem.ts**

**Specification:**
```typescript
export interface TankMessage {
    tankId: number;
    message: string;
    duration: number; // seconds
    elapsed: number;
}

export class TalkingTanksSystem {
    private messages: TankMessage[] = [];
    private enabled: boolean;
    
    // Message categories
    private preFire = [
        "Eat this!",
        "Say goodbye!",
        "Fire in the hole!",
        "Catch!",
        "Kaboom!",
        "Here comes the pain!",
        "Hasta la vista!",
        "You're toast!"
    ];
    
    private onHit = [
        "Ouch!",
        "That hurt!",
        "Hey!",
        "Stop that!",
        "Why me?!",
        "*&$#@!",
        "That's gonna leave a mark!"
    ];
    
    private onMiss = [
        "Missed!",
        "Ha! Nice try!",
        "You call that aiming?",
        "Whew!",
        "Close one!",
        "Amateur!",
        "Try again!"
    ];
    
    private onDeath = [
        "Argh!",
        "Noooo!",
        "Tell my family...",
        "I'll be back!",
        "Not like this...",
        "Game over, man!",
        "Remember me!"
    ];
    
    private onVictory = [
        "Yeah!",
        "Who's the best?",
        "Too easy!",
        "Victory!",
        "I am the champion!",
        "GG EZ",
        "That's how it's done!"
    ];
    
    // Trigger messages
    sayPreFire(tank: TankState): void {
        if (!this.enabled) return;
        this.addMessage(tank.id, this.random(this.preFire), 2.0);
    }
    
    sayOnHit(tank: TankState): void {
        if (!this.enabled) return;
        this.addMessage(tank.id, this.random(this.onHit), 1.5);
    }
    
    sayOnMiss(tank: TankState, shotX: number): void {
        if (!this.enabled) return;
        // Only if shot was close (within 100 pixels)
        const dist = Math.abs(shotX - tank.x);
        if (dist < 100) {
            this.addMessage(tank.id, this.random(this.onMiss), 1.5);
        }
    }
    
    sayOnDeath(tank: TankState): void {
        if (!this.enabled) return;
        const message = this.random(this.onDeath);
        tank.lastWords = message;
        this.addMessage(tank.id, message, 3.0);
    }
    
    sayOnVictory(tank: TankState): void {
        if (!this.enabled) return;
        this.addMessage(tank.id, this.random(this.onVictory), 3.0);
    }
    
    private random(arr: string[]): string {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    
    private addMessage(tankId: number, message: string, duration: number) {
        this.messages.push({ tankId, message, duration, elapsed: 0 });
    }
    
    update(dt: number): void {
        this.messages = this.messages.filter(msg => {
            msg.elapsed += dt;
            return msg.elapsed < msg.duration;
        });
    }
    
    render(ctx: CanvasRenderingContext2D, tanks: TankState[]): void {
        for (const msg of this.messages) {
            const tank = tanks.find(t => t.id === msg.tankId);
            if (!tank) continue;
            
            // Speech bubble above tank
            const bubbleX = tank.x;
            const bubbleY = tank.y - 40;
            
            // Bubble background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            
            const textWidth = ctx.measureText(msg.message).width;
            const padding = 10;
            
            ctx.fillRect(
                bubbleX - textWidth/2 - padding,
                bubbleY - 15,
                textWidth + padding * 2,
                20
            );
            ctx.strokeRect(
                bubbleX - textWidth/2 - padding,
                bubbleY - 15,
                textWidth + padding * 2,
                20
            );
            
            // Text
            ctx.fillStyle = '#000000';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(msg.message, bubbleX, bubbleY);
        }
    }
}
```

Enable via: `config.visual.talkingTanks`

**File:** Create `src/systems/TalkingTanksSystem.ts`  
**Acceptance:** Tanks display messages at appropriate times

---

### Task Group 7.5: Player Setup Screen

- [ ] **Create player setup UI**

**Specification:**
```typescript
export class PlayerSetupScreen {
    private players: PlayerConfig[] = [];
    
    render() {
        // Header: "Player Setup"
        
        // Player list (2-10 players)
        for (let i = 0; i < config.gameplay.playerCount; i++) {
            this.renderPlayerRow(i);
        }
        
        // Buttons:
        // - Add Player (+)
        // - Remove Player (-)
        // - Start Game
        // - Cancel
    }
    
    renderPlayerRow(index: number) {
        const player = this.players[index];
        
        // Name input field
        // Tank icon selector (7 variants, show sprites)
        // Color picker (swatch)
        // Human/AI toggle
        // If AI: personality dropdown
        // Team dropdown (None, Team 1-4)
    }
}

interface PlayerConfig {
    name: string;
    tankVariant: number; // 0-6
    color: string;
    isAI: boolean;
    aiPersonality?: string;
    teamId?: number;
}
```

Tank variants:
- 0-6: Different sprites (wheeled, treaded, turret styles)
- Icon without wheels: fixed emplacement (cannot move)

**File:** Create `src/ui/PlayerSetupScreen.ts`  
**Acceptance:** Full player customization before game start

---

### Task Group 7.6: Testing
- [ ] Visual test: extended status bar renders correctly
- [ ] Visual test: wind indicator all styles
- [ ] Unit test: talking tanks message selection
- [ ] Unit test: talking tanks timing
- [ ] Integration test: inventory hotkeys
- [ ] Integration test: player setup validation

---

## Phase 8: Save/Load System
**Goal:** Implement persistence

### Task Group 8.1: Save System

- [ ] **Create SaveLoadSystem.ts**

**Specification:**
```typescript
export interface SaveFile {
    version: string; // Game version
    timestamp: number;
    gameState: GameState;
    configuration: GameConfiguration;
    marketState: MarketState;
    playerNames: string[];
    roundNumber: number;
    thumbnail?: string; // Base64 canvas snapshot
}

export class SaveLoadSystem {
    private readonly STORAGE_KEY_PREFIX = 'tanks_save_';
    private readonly MAX_SAVES = 10;
    
    saveGame(slotNumber: number, gameState: GameState, 
             config: GameConfiguration, marketState: MarketState): boolean {
        try {
            const saveFile: SaveFile = {
                version: '1.0.0',
                timestamp: Date.now(),
                gameState: this.cloneGameState(gameState),
                configuration: config,
                marketState,
                playerNames: gameState.tanks.map(t => t.name),
                roundNumber: gameState.roundNumber,
                thumbnail: this.captureThumb nail()
            };
            
            const key = this.STORAGE_KEY_PREFIX + slotNumber;
            localStorage.setItem(key, JSON.stringify(saveFile));
            
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            return false;
        }
    }
    
    loadGame(slotNumber: number): SaveFile | null {
        try {
            const key = this.STORAGE_KEY_PREFIX + slotNumber;
            const data = localStorage.getItem(key);
            
            if (!data) return null;
            
            const saveFile: SaveFile = JSON.parse(data);
            
            // Validate version compatibility
            if (!this.isCompatible(saveFile.version)) {
                console.error('Incompatible save version');
                return null;
            }
            
            return saveFile;
        } catch (e) {
            console.error('Load failed:', e);
            return null;
        }
    }
    
    listSaves(): { slot: number; save: SaveFile }[] {
        const saves: { slot: number; save: SaveFile }[] = [];
        
        for (let i = 1; i <= this.MAX_SAVES; i++) {
            const key = this.STORAGE_KEY_PREFIX + i;
            const data = localStorage.getItem(key);
            
            if (data) {
                try {
                    saves.push({ slot: i, save: JSON.parse(data) });
                } catch (e) {
                    // Corrupted save, skip
                }
            }
        }
        
        return saves.sort((a, b) => b.save.timestamp - a.save.timestamp);
    }
    
    deleteSave(slotNumber: number): void {
        const key = this.STORAGE_KEY_PREFIX + slotNumber;
        localStorage.removeItem(key);
    }
    
    autoSave(gameState: GameState, config: GameConfiguration, 
             marketState: MarketState): void {
        this.saveGame(0, gameState, config, marketState); // Slot 0 = autosave
    }
    
    private cloneGameState(state: GameState): GameState {
        return JSON.parse(JSON.stringify(state));
    }
    
    private captureThumbnail(): string {
        // Capture current canvas as small thumbnail
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = 200;
        thumbCanvas.height = 150;
        
        const ctx = thumbCanvas.getContext('2d')!;
        ctx.drawImage(canvas, 0, 0, 200, 150);
        
        return thumbCanvas.toDataURL('image/jpeg', 0.5);
    }
    
    private isCompatible(version: string): boolean {
        // Version check logic
        return true; // For now, accept all
    }
}
```

**File:** Create `src/systems/SaveLoadSystem.ts`  
**Acceptance:** Can save/load full game state, multiple slots

---

### Task Group 8.2: Save/Load UI

- [ ] **Create save/load menu**

**Specification:**
```typescript
export class SaveLoadMenu {
    private mode: 'save' | 'load';
    
    render(saves: { slot: number; save: SaveFile }[]) {
        // Header: "Save Game" or "Load Game"
        
        // List of save slots
        for (let i = 1; i <= 10; i++) {
            const save = saves.find(s => s.slot === i);
            this.renderSaveSlot(i, save);
        }
        
        // Buttons: Back
    }
    
    renderSaveSlot(slot: number, save?: SaveFile) {
        if (save) {
            // Show thumbnail
            // Show metadata:
            //   - Players: "Alice, Bob, Charlie, Dave"
            //   - Round: "5 / 10"
            //   - Date: "2026-02-02 18:30"
            // Buttons: 
            //   - Load (if mode === 'load')
            //   - Overwrite (if mode === 'save')
            //   - Delete
        } else {
            // Empty slot
            // Button: Save Here (if mode === 'save')
        }
    }
    
    confirmOverwrite(slot: number): boolean {
        return window.confirm(
            `Overwrite save slot ${slot}?`
        );
    }
    
    confirmDelete(slot: number): boolean {
        return window.confirm(
            `Delete save slot ${slot}? This cannot be undone.`
        );
    }
}
```

**File:** Create `src/ui/SaveLoadMenu.ts`  
**Acceptance:** Can browse, load, save, and delete save files

---

### Task Group 8.3: Auto-save

- [ ] **Implement auto-save between rounds**

**Specification:**
In GameFlowSystem:
```typescript
endRound() {
    // ... existing round end logic
    
    // Auto-save
    saveLoadSystem.autoSave(
        this.gameState,
        configManager.getConfig(),
        economySystem.getMarketState()
    );
}
```

Auto-save:
- Triggered after each round
- Uses slot 0 (reserved)
- Shown at top of load menu as "Auto-save"
- Can be disabled in settings

**File:** `src/systems/GameFlowSystem.ts`  
**Acceptance:** Game auto-saves after each round

---

### Task Group 8.4: Market Persistence

- [ ] **Implement market database persistence**

**Specification:**
Already covered in Phase 2, but ensure integration:

```typescript
// On game start
economySystem.loadMarketState();

// On game save
saveFile.marketState = economySystem.getMarketState();

// On game load
economySystem.setMarketState(saveFile.marketState);
```

Market reset option in settings menu

**File:** `src/systems/EconomySystem.ts`  
**Acceptance:** Market prices persist across sessions and saves

---

### Task Group 8.5: Testing
- [ ] Unit test: serialize/deserialize GameState
- [ ] Unit test: save file versioning
- [ ] Unit test: corrupted save handling
- [ ] Integration test: save and load round-trip
- [ ] Integration test: market persistence
- [ ] Integration test: autosave triggers
- [ ] Storage test: LocalStorage quota handling

---

## Phase 9: Audio System
**Goal:** Complete sound implementation

### Task Group 9.1: Sound Effects

- [ ] **Expand SoundManager with weapon sounds**

**Specification:**
```typescript
export class SoundManager {
    private sounds: Record<string, HTMLAudioElement> = {};
    private enabled: boolean = true;
    private volume: number = 0.7;
    private sfxVolume: number = 0.8;
    private musicVolume: number = 0.5;
    
    // Load sound files
    loadSounds(): void {
        // Weapons
        this.load('fire_missile', '/sounds/fire_missile.mp3');
        this.load('fire_nuke', '/sounds/fire_nuke.mp3');
        this.load('fire_laser', '/sounds/fire_laser.mp3');
        
        // Explosions
        this.load('explosion_small', '/sounds/explosion_small.mp3');
        this.load('explosion_medium', '/sounds/explosion_medium.mp3');
        this.load('explosion_large', '/sounds/explosion_large.mp3');
        this.load('explosion_nuclear', '/sounds/explosion_nuclear.mp3');
        
        // Special
        this.load('roller_rolling', '/sounds/roller_rolling.mp3');
        this.load('digger_digging', '/sounds/digger_digging.mp3');
        this.load('napalm_sizzle', '/sounds/napalm_sizzle.mp3');
        this.load('laser_beam', '/sounds/laser_beam.mp3');
        
        // Environment
        this.load('tank_move', '/sounds/tank_move.mp3');
        this.load('terrain_collapse', '/sounds/terrain_collapse.mp3');
        this.load('wind_gust', '/sounds/wind_gust.mp3');
        
        // UI
        this.load('button_click', '/sounds/button_click.mp3');
        this.load('purchase', '/sounds/purchase.mp3');
        this.load('invalid', '/sounds/invalid.mp3');
        this.load('shield_break', '/sounds/shield_break.mp3');
        
        // Voice (talking tanks)
        this.load('tank_taunt_1', '/sounds/tank_taunt_1.mp3');
        // ... more taunts
    }
    
    playSoundForWeapon(weaponType: string): void {
        if (!this.enabled) return;
        
        const soundMap: Record<string, string> = {
            'missile': 'fire_missile',
            'baby_missile': 'fire_missile',
            'nuke': 'fire_nuke',
            'baby_nuke': 'fire_nuke',
            'laser': 'laser_beam',
            'plasma_blast': 'fire_laser',
            // ... map all weapons
        };
        
        const soundId = soundMap[weaponType] || 'fire_missile';
        this.play(soundId, this.sfxVolume);
    }
    
    playSoundForExplosion(radius: number): void {
        if (!this.enabled) return;
        
        let soundId: string;
        if (radius < 30) soundId = 'explosion_small';
        else if (radius < 80) soundId = 'explosion_medium';
        else if (radius < 120) soundId = 'explosion_large';
        else soundId = 'explosion_nuclear';
        
        this.play(soundId, this.sfxVolume);
    }
    
    // TTS integration (optional)
    speak(text: string): void {
        if (!window.speechSynthesis) return;
        if (!this.enabled) return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.2; // Slightly faster
        utterance.pitch = 1.0;
        utterance.volume = this.sfxVolume;
        
        window.speechSynthesis.speak(utterance);
    }
}
```

**File:** Update `src/core/SoundManager.ts`  
**Acceptance:** All weapon/explosion sounds trigger correctly

---

### Task Group 9.2: Background Music

- [ ] **Implement music system**

**Specification:**
```typescript
export class MusicManager {
    private currentTrack: HTMLAudioElement | null = null;
    private tracks: Record<string, string> = {
        'menu': '/music/menu_theme.mp3',
        'gameplay': '/music/gameplay_theme.mp3',
        'shop': '/music/shop_theme.mp3',
        'victory': '/music/victory_theme.mp3',
        'defeat': '/music/defeat_theme.mp3'
    };
    private volume: number = 0.5;
    private enabled: boolean = true;
    
    play(trackName: string, loop: boolean = true): void {
        if (!this.enabled) return;
        if (this.currentTrack) {
            this.currentTrack.pause();
        }
        
        const audio = new Audio(this.tracks[trackName]);
        audio.loop = loop;
        audio.volume = this.volume;
        audio.play().catch(e => console.error('Music play failed:', e));
        
        this.currentTrack = audio;
    }
    
    stop(): void {
        if (this.currentTrack) {
            this.currentTrack.pause();
            this.currentTrack = null;
        }
    }
    
    setVolume(vol: number): void {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.currentTrack) {
            this.currentTrack.volume = this.volume;
        }
    }
}
```

**File:** Create `src/core/MusicManager.ts`  
**Acceptance:** Background music plays, can adjust volume

---

### Task Group 9.3: Audio Settings

- [ ] **Add audio settings to config**

**Specification:**
```typescript
export interface GameConfiguration {
    // ... existing
    audio: {
        masterVolume: number; // 0.0 to 1.0
        sfxVolume: number;
        musicVolume: number;
        voiceVolume: number;
        muteSFX: boolean;
        muteMusic: boolean;
        muteVoice: boolean;
    };
}
```

Settings UI:
- Master volume slider
- SFX volume slider
- Music volume slider
- Voice volume slider
- Mute toggles for each category

**Files:** `src/core/ConfigManager.ts`, settings UI  
**Acceptance:** Independent volume control for all audio categories

---

### Task Group 9.4: Testing
- [ ] Audio test: weapon sounds trigger on fire
- [ ] Audio test: explosion sounds scale with size
- [ ] Audio test: music transitions between phases
- [ ] Audio test: volume controls work
- [ ] Audio test: mute toggles work
- [ ] Browser test: audio works across browsers
- [ ] Performance test: no audio lag during explosions

---

## Phase 10: Polish & Missing Mechanics
**Goal:** Implement remaining spec features

### Task Group 10.1: Fixed Emplacement Tanks

- [ ] **Implement fixed emplacement variant**

**Specification:**
Add to TankState:
```typescript
export interface TankState {
    // ... existing
    isFixedEmplacement: boolean;
}
```

In player setup:
- Tank icons 0-6: identify which have no wheels/treads
- If selected: mark as `isFixedEmplacement: true`

In movement system:
```typescript
canMove(tank: TankState): boolean {
    if (tank.isFixedEmplacement) {
        // Show message: "Fixed emplacements cannot move"
        return false;
    }
    if (tank.fuel <= 0) {
        return false;
    }
    return true;
}
```

In shop:
```typescript
canBuyFuel(tank: TankState): boolean {
    if (tank.isFixedEmplacement) {
        // Fuel option disabled/hidden
        return false;
    }
    return true;
}
```

**Files:** `src/core/GameState.ts`, `src/systems/PlayerInputSystem.ts`  
**Acceptance:** Fixed emplacements cannot move or buy fuel

---

### Task Group 10.2: Tank Slipping Physics

- [ ] **Implement slope sliding**

**Specification:**
```typescript
checkTankSlipping(tank: TankState, terrain: TerrainData): void {
    if (tank.isFalling) return; // Already falling
    if (tank.isFixedEmplacement) return; // Fixed tanks don't slip
    
    // Check terrain slope at tank position
    const slopeAngle = this.getTerrainSlope(tank.x, tank.y, terrain);
    
    if (Math.abs(slopeAngle) > 45) { // 45 degree threshold
        // Start sliding
        tank.isFalling = true;
        tank.vx = Math.sign(slopeAngle) * 2; // Slide sideways
        tank.vy = 1; // Start falling
    }
}

private getTerrainSlope(x: number, y: number, terrain: TerrainData): number {
    // Sample terrain height at x-5 and x+5
    const leftHeight = this.getTerrainHeight(x - 5, terrain);
    const rightHeight = this.getTerrainHeight(x + 5, terrain);
    
    const dy = rightHeight - leftHeight;
    const dx = 10;
    
    return Math.atan2(dy, dx) * 180 / Math.PI;
}
```

**File:** `src/systems/PhysicsSystem.ts`  
**Acceptance:** Tanks slide down steep slopes

---

### Task Group 10.3: Height-Based Fall Damage

- [ ] **Implement fall damage calculation**

**Specification:**
```typescript
checkFallDamage(tank: TankState): void {
    if (!tank.isFalling) return;
    if (!tank.hasLanded) return;
    
    // Calculate fall distance
    const fallDistance = tank.y - tank.fallStartY;
    
    if (fallDistance <= 20) {
        // Small fall, no damage
        return;
    }
    
    // Damage increases with distance
    const damagePerPixel = 0.5;
    const damage = Math.floor((fallDistance - 20) * damagePerPixel);
    
    // Apply damage
    this.applyDamage(tank, damage);
    
    // Show damage indicator
    this.showFallDamageText(tank, damage);
    
    // Reset fall tracking
    tank.isFalling = false;
    tank.fallStartY = undefined;
}

// Track fall start
startFalling(tank: TankState): void {
    tank.isFalling = true;
    tank.fallStartY = tank.y;
}
```

**File:** `src/systems/PhysicsSystem.ts`  
**Acceptance:** Falling damages tanks based on height

---

### Task Group 10.4: Border Modes

- [ ] **Implement border mode options**

**Specification:**
Add to GameConfiguration:
```typescript
export interface GameConfiguration {
    // ... existing
    physics: {
        // ... existing
        borderMode: 'normal' | 'wrap' | 'bounce' | 'concrete';
    };
}
```

In PhysicsSystem:
```typescript
handleBorderCollision(proj: ProjectileState): void {
    const mode = config.physics.borderMode;
    
    // Left border
    if (proj.x < 0) {
        switch (mode) {
            case 'normal':
                this.explodeProjectile(proj);
                break;
            case 'wrap':
                proj.x = CONSTANTS.SCREEN_WIDTH;
                break;
            case 'bounce':
            case 'concrete':
                proj.x = 0;
                proj.vx = -proj.vx * 0.8; // Bounce with energy loss
                break;
        }
    }
    
    // Right border
    if (proj.x > CONSTANTS.SCREEN_WIDTH) {
        switch (mode) {
            case 'normal':
                this.explodeProjectile(proj);
                break;
            case 'wrap':
                proj.x = 0;
                break;
            case 'bounce':
            case 'concrete':
                proj.x = CONSTANTS.SCREEN_WIDTH;
                proj.vx = -proj.vx * 0.8;
                break;
        }
    }
    
    // Top border (bounce or wrap modes)
    if (proj.y < 0 && (mode === 'bounce' || mode === 'wrap' || mode === 'concrete')) {
        if (mode === 'wrap') {
            proj.y = CONSTANTS.SCREEN_HEIGHT;
        } else {
            proj.y = 0;
            proj.vy = -proj.vy * 0.8;
        }
    }
}
```

**File:** `src/systems/PhysicsSystem.ts`  
**Acceptance:** All four border modes work correctly

---

### Task Group 10.5: Triple-Turreted Tank (AI-only)

- [ ] **Implement triple-turret variant**

**Specification:**
Add tank variant 7 (AI-only):
```typescript
const TANK_VARIANT_TRIPLE_TURRET = 7;

// In AI setup only
if (tank.isAI) {
    // Option to select variant 7
    tank.variant = TANK_VARIANT_TRIPLE_TURRET;
}

// In firing
fireTank(tank: TankState): void {
    if (tank.variant === TANK_VARIANT_TRIPLE_TURRET &&
        (tank.currentWeapon === 'baby_missile' || 
         tank.currentWeapon === 'missile')) {
        // Fire 3 shots simultaneously
        this.fireProjectile(tank, tank.angle - 5);
        this.fireProjectile(tank, tank.angle);
        this.fireProjectile(tank, tank.angle + 5);
    } else {
        // Normal single shot
        this.fireProjectile(tank, tank.angle);
    }
}
```

**Files:** `src/systems/PhysicsSystem.ts`, AI setup UI  
**Acceptance:** AI can use triple-turret, fires 3 shots at once

---

### Task Group 10.6: Environmental Hazards (Optional)

- [ ] **Implement meteor showers**

**Specification:**
```typescript
export class EnvironmentalHazardSystem {
    private meteorsEnabled: boolean;
    private meteorInterval: number = 10; // seconds
    private meteorTimer: number = 0;
    
    update(dt: number): void {
        if (!this.meteorsEnabled) return;
        
        this.meteorTimer += dt;
        if (this.meteorTimer >= this.meteorInterval) {
            this.spawnMeteor();
            this.meteorTimer = 0;
        }
    }
    
    private spawnMeteor(): void {
        const x = Math.random() * CONSTANTS.SCREEN_WIDTH;
        const y = 0;
        
        const meteor: ProjectileState = {
            id: 'meteor_' + Date.now(),
            x, y,
            vx: (Math.random() - 0.5) * 5,
            vy: 10, // Falling down
            weaponType: 'meteor',
            ownerId: -1, // Environmental
            elapsedTime: 0,
            trail: []
        };
        
        gameState.projectiles.push(meteor);
    }
}
```

Add to config:
```typescript
export interface GameConfiguration {
    // ... existing
    gameplay: {
        // ... existing
        environmentalHazards: {
            meteors: boolean;
            lightning: boolean;
        };
    };
}
```

**File:** Create `src/systems/EnvironmentalHazardSystem.ts`  
**Acceptance:** Random meteors fall when enabled

---

- [ ] **Implement lightning strikes**

**Specification:**
```typescript
private spawnLightning(): void {
    // Random target location
    const x = Math.random() * CONSTANTS.SCREEN_WIDTH;
    const y = this.getTerrainHeight(x);
    
    // Instant explosion
    const explosion: ExplosionState = {
        id: explosionId++,
        x, y,
        maxRadius: 40,
        currentRadius: 0,
        duration: 0.5,
        elapsed: 0,
        color: '#FFFFFF' // White flash
    };
    
    gameState.explosions.push(explosion);
    
    // Visual: lightning bolt from top to target
    this.renderLightningBolt(x, y);
    
    // Sound
    soundManager.play('lightning');
}
```

**File:** `src/systems/EnvironmentalHazardSystem.ts`  
**Acceptance:** Lightning strikes random locations

---

### Task Group 10.7: Testing
- [ ] Unit test: fixed emplacement movement blocked
- [ ] Unit test: slope angle calculation
- [ ] Unit test: fall damage scaling
- [ ] Unit test: border modes (all 4 types)
- [ ] Unit test: triple-turret fires 3 projectiles
- [ ] Integration test: slipping on steep terrain
- [ ] Integration test: wrap mode toroidal world
- [ ] Integration test: meteor/lightning hazards

---

## Success Metrics

### Completion Targets:
- **Phases 1-5 Complete:** ~60% feature compliance
- **Phases 1-8 Complete:** ~85% feature compliance
- **Phases 1-10 Complete:** ~95% feature compliance

### Quality Gates:
- ✅ All tests passing
- ✅ No critical bugs
- ✅ Performance benchmarks met (60 FPS with 10 tanks)
- ✅ Code review approved
- ✅ Playtest feedback positive

---

## Priority Recommendations

### Critical Path (Must Do):
1. Phase 1: Core weapons (rollers, tracers, sandhogs, riot bombs)
2. Phase 2: Economic system (dynamic pricing, bundles, interest)
3. Phase 3: AI personalities (all 8 types)
4. Phase 4: Configuration system (expose all options)

### High Priority (Should Do):
5. Phase 5: Defense systems (shields, auto-defense)
6. Phase 6: Team play
7. Phase 7: Enhanced UI (talking tanks, wind indicator)
8. Phase 8: Save/load

### Medium Priority (Nice to Have):
9. Phase 9: Audio (sounds, music, TTS)
10. Phase 10: Polish (border modes, hazards, triple-turret)

---

## Next Steps

1. **Start with Phase 1, Task Group 1.1** (weapon cost corrections)
2. **Work through tasks sequentially within each phase**
3. **Test after each task group completion**
4. **Commit frequently with descriptive messages**
5. **Update this plan's checkboxes as tasks complete**

---

**End of Improvement Plan**
