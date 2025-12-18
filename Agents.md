# Agent Instructions for Tanks-a-Lot TS

## Project Overview

Tanks-a-Lot TS is a TypeScript Progressive Web App (PWA) port of a classic artillery game featuring destructible terrain, realistic physics, and hotseat multiplayer gameplay.

## Technology Stack

- **Language**: TypeScript (strict mode enabled)
- **Build Tool**: Vite
- **Testing**: Vitest
- **UI**: Canvas-based rendering with FontAwesome icons
- **Architecture**: Component-based with separate systems for game logic
- **Target**: ES2022, DOM environment

## Project Structure

```
src/
├── core/           # Core game classes (GameEngine, GameState, InputManager, etc.)
│   ├── GameEngine.ts      # Main game loop coordinator
│   ├── GameState.ts       # Game state types and interfaces
│   ├── AIController.ts    # AI personalities and behavior
│   ├── InputManager.ts    # Keyboard/mouse input handling
│   ├── SoundManager.ts    # Audio management
│   └── WeaponData.ts      # Weapon definitions and properties
├── systems/        # Game systems (Physics, Terrain, AI, Shop, etc.)
│   ├── PhysicsSystem.ts   # Projectile physics and collision
│   ├── TerrainSystem.ts   # Destructible terrain management
│   ├── ShopSystem.ts      # Economy and purchasing
│   ├── AISystem.ts        # AI decision making
│   ├── GameFlowSystem.ts  # Turn management and game flow
│   ├── RenderSystem.ts    # Canvas drawing operations
│   └── PlayerInputSystem.ts # Player input processing
├── ui/             # UI components (UIManager, TouchControls)
│   ├── UIManager.ts       # HUD and menus
│   └── TouchControls.ts   # Mobile touch controls
├── assets/         # Game assets
└── main.ts         # Application entry point

tests/              # Unit tests organized by feature
public/             # Static assets
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
Server runs on port 5173 by default.

### Build for Production
```bash
npm run build
```
Compiles TypeScript and bundles with Vite.

### Preview Production Build
```bash
npm run preview
```

### Run Tests
```bash
npm test
```
Executes all Vitest tests.

## Code Style and Conventions

### TypeScript Conventions

- **Strict Mode**: Always use TypeScript strict mode features
- **Type Annotations**: Prefer explicit type annotations for public APIs and function parameters
- **Interfaces**: Use `type` for state objects (e.g., `GameState`, `TankState`, `ProjectileState`)
- **Classes**: Use classes for systems and managers (e.g., `GameEngine`, `PhysicsSystem`, `TerrainSystem`)
- **No Unused Variables**: Code must not have unused variables or parameters (enforced by `tsconfig`)
- **Module System**: Use ES modules (`import`/`export`)

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
- Use **descriptive variable names** (e.g., `currentPlayerIndex`, not `idx`)
- Prefer `const` over `let` when variables won't be reassigned
- Use **template literals** for string concatenation
- Use **arrow functions** for callbacks and short functions
- Use **object destructuring** where appropriate
- Keep functions focused and single-purpose

### Game State Management

- All game state is centralized in `GameState` interface
- State is passed to systems; systems should not mutate state directly without clear ownership
- Use `GamePhase` enum to track game flow states
- Projectiles, tanks, and explosions are managed as arrays in the state
- Use immutable patterns where possible for state updates

### Canvas Rendering

- Canvas is managed by GameEngine
- Terrain uses pixel-based collision detection
- Coordinate system: (0,0) is top-left, y increases downward
- Always clear and redraw the canvas each frame
- The game uses canvas for all rendering - no DOM elements for game objects
- Use `getImageData` for collision detection

## Testing Practices

### Test Structure

- **Framework**: Vitest with `describe`, `it`, `expect` patterns
- **Mocking**: Use `vi.fn()` for mocking functions and `beforeEach` for test setup
- **Canvas Mocking**: Tests mock Canvas and CanvasRenderingContext2D for Node environment
- **Test Files**: Name test files as `*.test.ts` and place them in the `tests/` directory
- Mock external dependencies using `vi.mock()`
- Group related tests in `describe` blocks

### Testing Conventions

- Mock external dependencies (Canvas, DOM, SoundManager)
- Test game systems in isolation with controlled state
- Use descriptive test names that explain the behavior being tested
- Verify state changes and system interactions
- Example test patterns can be found in `tests/physics.test.ts` and `tests/weapons.test.ts`

### Mock Patterns

Common mocking pattern for TerrainSystem:
```typescript
vi.mock('../src/systems/TerrainSystem', () => {
    return {
        TerrainSystem: class {
            public canvas = { width: 800, height: 600 };
            constructor(public width: number, public height: number) { }
            getGroundY(x: number) { return 500; } // Flat ground
            explode(state: any, x: number, y: number, r: number) { }
            isSolid(x: number, y: number) { return y >= 500; }
        }
    };
});
```

Canvas context mock:
```typescript
class MockContext {
    clearRect() { }
    beginPath() { }
    // ... other canvas methods
    getImageData() {
        return { data: new Uint8ClampedArray(4) };
    }
}
```

SoundManager mock:
```typescript
const mockSound = {
    init: vi.fn(),
    playExplosion: vi.fn(),
    // ... other sound methods
};
```

### Test Coverage Focus

- **Physics**: Projectile trajectories, collision detection, gravity, wind
- **Weapons**: Special weapon behaviors (MIRV, LeapFrog, Napalm, Digger, etc.)
- **Accessories**: Parachutes, shields, batteries, fuel
- **Shop**: Purchase mechanics, inventory limits
- **Player Input**: Control handling and state updates

## Game Architecture

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

The game progresses through defined phases (constant `GamePhase`):

- **SETUP** - Game initialization
- **AIMING** - Player is aiming and adjusting angle/power
- **FIRING** - Weapon firing phase
- **PROJECTILE_FLYING** - Projectile is in flight
- **EXPLOSION** - Handling explosion animations and effects
- **TERRAIN_SETTLING** - Terrain particles settling after destruction
- **DEATH_SEQUENCE** - Handling tank death animations
- **SHOP** - Between-round shopping phase
- **GAME_OVER** - Game has ended

### Entity-Component-System (ECS) Inspired

While not pure ECS, the architecture separates concerns:
- **Entities**: Tanks, projectiles, explosions (stored in GameState)
- **Systems**: PhysicsSystem, TerrainSystem, AISystem, etc.
- **State**: Single source of truth (GameState)

### Game Loop

1. **Input** → InputManager captures player input
2. **Update** → Systems update state based on current phase
3. **Render** → GameEngine renders state to canvas
4. **Phase Transitions** → GameFlowSystem manages phase changes

### Physics System

- Projectile motion uses standard kinematic equations
- Gravity affects projectiles and falling tanks
- Wind affects projectile trajectories
- Delta time (dt) is used for frame-rate independent physics
- Collision detection uses pixel-perfect terrain checks using terrain pixel data
- Special weapons have custom update logic (bouncing, splitting, digging)

### Weapons System

- Weapons are defined in `WEAPONS` constant (imported from `WeaponData.ts`)
- Each weapon has properties: damage, blastRadius, speed, bounces, etc.
- Special weapons have unique behaviors (Napalm, Digger, LeapFrog, Roller, etc.)
- Weapon IDs are strings (e.g., `'missile'`, `'napalm'`, `'digger'`)

### Terrain Destruction

- Terrain is canvas-based with pixel-perfect collision
- Explosions create circular craters using canvas compositing
- Terrain changes trigger tank fall detection
- Use `getImageData` for collision detection

### AI System

AI personalities (from AIController.ts):
- **Moron**: Random shots
- **Shooter**: Direct line of sight only
- **Tosser**: Iteratively improves aim
- **Poolshark**: Uses wall bounces
- **Chooser**: Selects best method
- **Spoiler**: Perfect calculation (without air resistance)
- **Cyborg**: Advanced targeting with strategic priorities

### Weapon Types

Refer to `WeaponData.ts` for complete definitions. Key categories:
- **Standard**: Baby Missile, Missile, Baby Nuke, Nuke
- **Multi-warhead**: MIRV, Death's Head, LeapFrog
- **Special**: Funky Bomb, Napalm, Hot Napalm
- **Terrain**: Diggers, Sandhogs, Rollers, Dirt Bombs, Riot Bombs
- **Energy**: Plasma Blast, Laser (require batteries)
- **Utility**: Tracers

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
4. Register system in GameEngine constructor
5. Call system methods from game loop as appropriate

### Adding a New AI Personality

1. Define personality in `AIController.ts`
2. Implement targeting logic in `calculateShot()`
3. Add weapon selection logic if needed
4. Test against different scenarios

### Modifying Game State

1. Locate the relevant system that should handle the logic
2. Modify the `GameState` type if adding new properties
3. Update the system's logic to handle the new state
4. Add tests to verify the new behavior

### Modifying Physics

1. Update `PhysicsSystem.ts` for projectile behavior
2. Update `TerrainSystem.ts` for terrain interactions
3. Ensure tests in `tests/physics.test.ts` pass
4. Add new tests for new behaviors

## Deployment

- GitHub Pages deployment via `.github/workflows/deploy.yml`
- Base URL: `/tanks-ts/` (configured in `vite.config.ts`)
- Automatic deployment on push to `main`

## Important Notes

- **Requirements.md** contains the complete game specification based on Scorched Earth
- The game aims to faithfully recreate classic mechanics while modernizing for web
- Destructible terrain is a core mechanic; all weapon/terrain interactions must respect pixel-level collision
- The shop system and economy are integral to gameplay progression
- Mobile/touch support is a priority for PWA functionality
- FontAwesome icons are used for UI elements (loaded via library)
- Touch controls are provided for mobile support
- The game exposes `window.game` for debugging in development
- PWA manifest is located in `public/manifest.json`

## Resources

- Original game reference: See `Requirements.md` and `Screenshots/scorch.txt`
- Game can be debugged via browser console: `window.game` exposes GameEngine instance
