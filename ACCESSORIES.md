# Accessory/Misc Items Implementation

## Overview
This document describes the implementation of accessory and miscellaneous items in Tanks-TS, based on the original Scorched Earth specifications.

## Implemented Features

### 1. Shield System
**Activation**: Press 'S' key to toggle shield on/off  
**Cost**: 5000 credits  
**Effect**: Protects tank from damage, absorbs 200 damage points  
**Visual**: Animated cyan glow with pulsing hexagon particles  

#### Behavior:
- Shield must be purchased and in inventory
- Each shield can absorb 200 damage before breaking
- When activated, one shield is consumed from inventory
- Shield breaks automatically when health reaches 0
- Can be deactivated manually to save for later
- Damage is absorbed from explosions and direct hits
- When shield breaks, remaining damage goes through to tank health

#### Testing:
- Unit tests verify activation, damage absorption, and breaking
- Integration tests verify complete lifecycle
- All tests passing ✓

### 2. Parachute System
**Activation**: Automatic deployment when falling fast (velocity > 150)  
**Cost**: 1000 credits  
**Effect**: Prevents fall damage  
**Visual**: White parachute canopy displayed above tank  

#### Behavior:
- Automatically deploys when falling velocity exceeds 150 units
- Can also emergency deploy on impact if fall damage >= threshold (default 15)
- Threshold is configurable per tank (default: 15)
- One parachute consumed per use
- Visible white parachute sprite rendered when deployed
- Reduces fall damage to 0 when deployed

#### Testing:
- Unit tests verify deployment conditions and damage prevention
- Integration tests verify complete fall sequence
- All tests passing ✓

### 3. Battery System  
**Activation**: Press 'B' key to use battery  
**Cost**: 1500 credits  
**Effect**: Restores 10 health points  
**Visual**: None (instant health bar update)  

#### Behavior:
- Must be purchased and in inventory
- Can only be used when health < 100
- Restores 10 health points per battery
- Cannot exceed max health (100)
- Plays UI sound when used successfully
- Displays console message for feedback

#### Testing:
- Unit tests verify health restoration and max health capping
- Integration tests verify usage during combat
- All tests passing ✓

### 4. Fuel System
**Activation**: Press 'A' (move left) or 'D' (move right)  
**Cost**: 2000 credits per fuel can (restores 250 fuel)  
**Effect**: Enables tank movement  
**Consumption**: 1 fuel per pixel moved  

#### Behavior:
- Tank starts with 250 fuel
- Movement consumes fuel at rate of 1 fuel per pixel
- Cannot move when fuel is depleted (fuel = 0)
- Can only move when tank has landed (hasLanded = true)
- Cannot climb slopes steeper than 15 pixels
- Movement speed: 50 pixels per second
- Fuel can be replenished by purchasing fuel cans

#### Testing:
- Unit tests verify fuel consumption and movement restrictions
- Integration tests verify complete movement lifecycle
- All tests passing ✓

## Controls Summary

| Key | Action | Item Required |
|-----|--------|---------------|
| S | Toggle Shield | Shield in inventory |
| B | Use Battery | Battery in inventory |
| A | Move Left | Fuel > 0, tank landed |
| D | Move Right | Fuel > 0, tank landed |
| - | Deploy Parachute | Automatic (parachute in inventory) |

## Shop Items

| Item | Cost | Effect | Notes |
|------|------|--------|-------|
| Shield | 5000 | Absorbs 200 damage | Toggle with 'S' |
| Parachute | 1000 | Prevents fall damage | Auto-deploys |
| Battery | 1500 | Restores 10 health | Use with 'B' |
| Fuel Can | 2000 | Restores 250 fuel | For movement |

## Visual Effects

### Shield
- Animated cyan glow around tank
- Pulsing effect synced to time
- Hexagon particles orbiting the shield
- Opacity varies with shield health
- Inner and outer shield layers
- Shadow blur for glow effect

### Parachute
- White canopy displayed above tank
- SVG-based parachute sprite
- Visible only when deployed
- Positioned above tank sprite

### Battery
- No visual effect (instant health bar update)
- Console feedback message
- UI sound plays on use

### Fuel
- No visual effect during consumption
- Fuel value tracked in tank state
- Can be displayed in UI if needed

## Technical Implementation

### State Management
All accessories are tracked in `TankState.accessories` record:
```typescript
accessories: {
  'shield': number,      // Count of shields owned
  'parachute': number,   // Count of parachutes owned
  'battery': number      // Count of batteries owned
}
```

Active shield state:
```typescript
activeShield?: string;    // Type of active shield (e.g., 'shield')
shieldHealth?: number;    // Remaining shield health (0-200)
```

Parachute state:
```typescript
isParachuteDeployed?: boolean;  // Whether parachute is currently active
parachuteThreshold?: number;    // Min damage to trigger emergency deploy
```

Fuel state:
```typescript
fuel: number;  // Remaining fuel (0-500+)
```

### Physics Integration

#### Shield Damage Absorption
Located in `PhysicsSystem.ts`:
```typescript
if (tank.activeShield && tank.shieldHealth > 0) {
    const absorbed = Math.min(damage, tank.shieldHealth);
    tank.shieldHealth -= absorbed;
    damage -= absorbed;
    if (tank.shieldHealth <= 0) {
        tank.activeShield = undefined;
    }
}
```

#### Parachute Deployment
Located in `PhysicsSystem.ts`:
```typescript
if (!tank.isParachuteDeployed && 
    (tank.accessories['parachute'] || 0) > 0 && 
    tank.vy > 150) {
    tank.isParachuteDeployed = true;
    tank.accessories['parachute']--;
}
```

#### Fuel Consumption
Located in `GameEngine.ts`:
```typescript
const FUEL_COST_PER_PIXEL = 1;
const moveAmount = MOVE_SPEED * dt;
const fuelNeeded = Math.ceil(moveAmount * FUEL_COST_PER_PIXEL);

if (tank.fuel >= fuelNeeded) {
    tank.x = newX;
    tank.fuel -= fuelNeeded;
}
```

## Testing Coverage

### Unit Tests (20 tests)
- Shield activation and deactivation
- Shield damage absorption
- Shield breaking behavior
- Parachute deployment conditions
- Parachute damage prevention
- Battery health restoration
- Battery max health capping
- Fuel consumption during movement
- Fuel depletion prevention
- Item purchasing validation

### Integration Tests (8 tests)
- Complete shield lifecycle (activate → absorb → break → reactivate)
- Complete parachute lifecycle (fall → deploy → land safely)
- Battery usage during combat
- Fuel consumption and movement lifecycle
- Multi-player accessory interactions
- Shop purchasing of multiple items
- Combination scenarios (shield + parachute + battery)

### Test Results
```
Test Files  7 passed (7)
Tests      39 passed (39)
```

## Future Enhancements

Potential improvements for future iterations:

1. **Additional Shield Types**
   - Mag Deflectors (deflect projectiles)
   - Force Shields (stronger absorption)
   - Heavy Shields (immune to certain attacks)
   - Super Mags (best shields)

2. **Advanced Parachute Features**
   - Configurable deployment altitude
   - Different parachute types
   - Visual feedback for threshold setting

3. **Battery Enhancements**
   - Different battery capacities
   - Restore power in addition to health
   - Visual charging effect

4. **Fuel Improvements**
   - Different fuel tank sizes
   - Fuel efficiency upgrades
   - Visual fuel gauge in UI

5. **Auto-Defense System**
   - Automatic shield activation
   - Automatic parachute deployment
   - Pre-configured defense strategies

## Known Limitations

1. Shield visual effects may have performance impact on very slow systems
2. Parachute deployment is automatic - no manual trigger option
3. Battery usage requires key press - no automatic low-health trigger
4. Fuel consumption is constant - no efficiency upgrades yet
5. No visual fuel gauge in current UI (only in tank state)

## References

- Original Scorched Earth documentation (Screenshots/SCORCH.txt)
- Requirements.md specification
- PhysicsSystem.ts implementation
- GameEngine.ts input handling
- RenderSystem.ts visual effects
