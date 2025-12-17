# Copilot Instructions for Tanks-a-Lot TS

## Project Overview

Tanks-a-Lot TS is a TypeScript Progressive Web App (PWA) port of a classic artillery game featuring destructible terrain, realistic physics, and hotseat multiplayer gameplay.

## Technology Stack

- **Language**: TypeScript (strict mode enabled)
- **Build Tool**: Vite
- **Testing**: Vitest
- **UI**: Canvas-based rendering with FontAwesome icons
- **Architecture**: Component-based with separate systems for game logic

## Project Structure

```
src/
  core/          - Core game classes (GameEngine, GameState, InputManager, etc.)
  systems/       - Game systems (Physics, Terrain, AI, Shop, etc.)
  ui/            - UI components (UIManager, TouchControls)
  assets/        - Game assets
tests/           - Unit tests organized by feature
public/          - Static assets
```

## Development Commands

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

### Preview Production Build
```bash
npm run preview
```

## Code Style and Conventions

### TypeScript Conventions

- **Strict Mode**: Always use TypeScript strict mode features
- **Type Annotations**: Prefer explicit type annotations for public APIs and function parameters
- **Interfaces**: Use `type` for state objects (e.g., `GameState`, `TankState`, `ProjectileState`)
- **Classes**: Use classes for systems and managers (e.g., `GameEngine`, `PhysicsSystem`, `TerrainSystem`)
- **No Unused Variables**: Code must not have unused variables or parameters (enforced by tsconfig)

### Naming Conventions

- **Classes**: PascalCase (e.g., `GameEngine`, `PhysicsSystem`)
- **Files**: PascalCase for class files (e.g., `GameEngine.ts`, `PhysicsSystem.ts`)
- **Variables/Functions**: camelCase (e.g., `currentPlayerIndex`, `updateProjectiles`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `CONSTANTS.GRAVITY`)
- **Enums**: PascalCase for enum names, UPPER_CASE for values (e.g., `GamePhase.SETUP`)

### Code Organization

- **Imports**: Group imports by category (external libraries, core modules, systems, types)
- **Access Modifiers**: Use `private` for internal methods, `public` for exposed APIs
- **Systems Pattern**: Game logic is organized into systems that operate on shared `GameState`
- **Dependency Injection**: Systems receive dependencies via constructor

## Testing Practices

### Test Structure

- **Framework**: Vitest with `describe`, `it`, `expect` patterns
- **Mocking**: Use `vi.fn()` for mocking functions and `beforeEach` for test setup
- **Canvas Mocking**: Tests mock Canvas and CanvasRenderingContext2D for Node environment
- **Test Files**: Name test files as `*.test.ts` and place them in the `tests/` directory

### Testing Conventions

- Mock external dependencies (Canvas, DOM, SoundManager)
- Test game systems in isolation with controlled state
- Use descriptive test names that explain the behavior being tested
- Verify state changes and system interactions
- Example test patterns can be found in `tests/physics.test.ts` and `tests/weapons.test.ts`

### Mock Patterns

```typescript
// Mock Canvas Context
class MockContext {
    clearRect() { }
    beginPath() { }
    // ... other canvas methods
    getImageData() {
        return { data: new Uint8ClampedArray(4) };
    }
}

// Mock SoundManager
const mockSound = {
    init: vi.fn(),
    playExplosion: vi.fn(),
    // ... other sound methods
};
```

## Architecture Patterns

### Systems Architecture

The game uses a systems-based architecture where each system is responsible for a specific aspect:

- **GameEngine**: Main game loop coordinator
- **PhysicsSystem**: Handles projectile physics, tank falling, collisions
- **TerrainSystem**: Manages terrain rendering and destruction
- **RenderSystem**: Handles all canvas drawing operations
- **AISystem**: Controls AI player behavior
- **ShopSystem**: Manages the weapon/item shop
- **PlayerInputSystem**: Processes player input during turns
- **GameFlowSystem**: Controls game state transitions

### State Management

- Central `GameState` object holds all game state
- Systems operate on the shared state but don't own it
- State includes: tanks, projectiles, explosions, current phase, etc.
- Use immutable patterns where possible for state updates

### Game Phases

The game progresses through defined phases (enum `GamePhase`):
- `SETUP` - Game initialization
- `PLAYER_TURN` - Player is aiming/adjusting
- `PROJECTILE_FLYING` - Projectile is in flight
- `POST_IMPACT` - Handling explosions and terrain destruction
- `SHOP` - Between-round shopping phase

## Important Implementation Details

### Physics

- Gravity affects projectiles and falling tanks
- Wind affects projectile trajectories
- Delta time (`dt`) is used for frame-rate independent physics
- Collision detection uses terrain pixel data

### Weapons System

- Weapons are defined in `WEAPONS` constant (imported from `WeaponData.ts`)
- Each weapon has properties: damage, blastRadius, speed, bounces, etc.
- Special weapons have unique behaviors (Napalm, Digger, LeapFrog, Roller, etc.)
- Weapon IDs are strings (e.g., 'missile', 'napalm', 'digger')

### Terrain Destruction

- Terrain is canvas-based with pixel-perfect collision
- Explosions create circular craters using canvas compositing
- Terrain changes trigger tank fall detection
- Use `getImageData` for collision detection

## Common Tasks

### Adding a New Weapon

1. Add weapon definition to `WEAPONS` in `WeaponData.ts`
2. Add weapon ID to `WEAPON_ORDER` array
3. Implement special behavior in `PhysicsSystem.updateProjectiles()` if needed
4. Add tests in `tests/weapons.test.ts`

### Adding a New Game System

1. Create new class in `src/systems/` directory
2. Inject required dependencies via constructor
3. Implement `update(state: GameState, dt: number)` method if needed
4. Register system in `GameEngine` constructor
5. Call system methods from game loop as appropriate

### Modifying Game State

1. Locate the relevant system that should handle the logic
2. Modify the `GameState` type if adding new properties
3. Update the system's logic to handle the new state
4. Add tests to verify the new behavior

## Notes

- The game uses canvas for all rendering - no DOM elements for game objects
- FontAwesome icons are used for UI elements (loaded via library)
- Touch controls are provided for mobile support
- The game exposes `window.game` for debugging in development
- PWA manifest is located in `public/manifest.json`
