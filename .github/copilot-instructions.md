# Copilot Instructions for Tanks-a-Lot TS

## Project Overview

Tanks-a-Lot TS is a TypeScript Progressive Web App (PWA) port of the classic artillery game Scorched Earth. It features destructible terrain, realistic physics, tank combat, and hotseat multiplayer gameplay.

## Technology Stack

- **Language**: TypeScript (strict mode enabled)
- **Build Tool**: Vite
- **Testing**: Vitest with mocking support
- **UI**: Vanilla TypeScript with Canvas API
- **Icons**: Font Awesome
- **Target**: ES2022, DOM environment

## Project Structure

```
src/
├── core/           # Core game engine and state management
│   ├── GameEngine.ts      # Main game loop and orchestration
│   ├── GameState.ts       # Game state types and interfaces
│   ├── AIController.ts    # AI personalities and behavior
│   ├── InputManager.ts    # Keyboard/mouse input handling
│   ├── SoundManager.ts    # Audio management
│   └── WeaponData.ts      # Weapon definitions and properties
├── systems/        # Game systems (modular architecture)
│   ├── PhysicsSystem.ts   # Projectile physics and collision
│   ├── TerrainSystem.ts   # Destructible terrain management
│   ├── ShopSystem.ts      # Economy and purchasing
│   ├── AISystem.ts        # AI decision making
│   └── GameFlowSystem.ts  # Turn management and game flow
├── ui/             # User interface components
│   ├── UIManager.ts       # HUD and menus
│   └── TouchControls.ts   # Mobile touch controls
├── assets/         # Static assets (sprites, sounds)
└── main.ts         # Application entry point

tests/              # Vitest unit tests
```

## Development Workflow

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

### Run Tests
```bash
npm test
```
Executes all Vitest tests.

## Coding Conventions

### TypeScript

- **Strict Mode**: All TypeScript strict checks are enabled
- **No Unused Variables**: `noUnusedLocals` and `noUnusedParameters` are enforced
- **Module System**: Use ES modules (`import`/`export`)
- **Type Safety**: Prefer explicit types over `any`; use type annotations for function parameters and return types

### Code Style

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

### Canvas Rendering

- Canvas is managed by GameEngine
- Terrain uses pixel-based collision detection
- Coordinate system: (0,0) is top-left, y increases downward
- Always clear and redraw the canvas each frame

## Testing Guidelines

### Test Structure

- Tests use **Vitest** (`describe`, `it`, `expect`, `beforeEach`)
- Mock external dependencies using `vi.mock()`
- Use `vi.fn()` for mock functions
- Group related tests in `describe` blocks

### Mocking Patterns

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

### Test Coverage Focus

- **Physics**: Projectile trajectories, collision detection, gravity, wind
- **Weapons**: Special weapon behaviors (MIRV, LeapFrog, Napalm, Digger, etc.)
- **Accessories**: Parachutes, shields, batteries, fuel
- **Shop**: Purchase mechanics, inventory limits
- **Player Input**: Control handling and state updates

## Game Architecture

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
- Gravity affects vy (vertical velocity)
- Wind affects vx (horizontal velocity)
- Collision detection uses pixel-perfect terrain checks
- Special weapons have custom update logic (bouncing, splitting, digging)

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

1. Define weapon properties in `WeaponData.ts`
2. Add projectile update logic in `PhysicsSystem.ts`
3. Add explosion/effect logic in `PhysicsSystem.ts`
4. Add shop integration in `ShopSystem.ts`
5. Write unit tests in `tests/weapons.test.ts`

### Adding a New AI Personality

1. Define personality in `AIController.ts`
2. Implement targeting logic in `calculateShot()`
3. Add weapon selection logic if needed
4. Test against different scenarios

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

## Resources

- Original game reference: See `Requirements.md` and `Screenshots/scorch.txt`
- Game can be debugged via browser console: `window.game` exposes GameEngine instance
