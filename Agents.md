# Tanks-a-Lot TS Project Context

## Project Overview

**Tanks-a-Lot TS** is a modern, web-based clone of the classic artillery game "Scorched Earth," built with TypeScript and the HTML5 Canvas API. It features turn-based combat, destructible terrain, realistic physics (gravity, wind), a variety of weapons, and an in-game economy.

**Tech Stack:**
*   **Language:** TypeScript (Strict Mode)
*   **Build System:** Vite
*   **Testing:** Vitest
*   **Rendering:** HTML5 Canvas (no 3D engine libraries)
*   **Icons:** FontAwesome
*   **Platform:** Web / Progressive Web App (PWA)

**Architecture:**
The project follows an **Entity-Component-System (ECS) inspired architecture**, though adapted for this specific use case:
*   **State (`src/core/GameState.ts`):** A centralized, JSON-serializable object (`GameState`) holds all game data (tanks, projectiles, terrain status, game phase).
*   **Systems (`src/systems/*.ts`):** Stateless logic classes (e.g., `PhysicsSystem`, `TerrainSystem`, `AISystem`) that operate on the `GameState`.
*   **Engine (`src/core/GameEngine.ts`):** The central coordinator that manages the game loop, initializes systems, and handles top-level state transitions.

## Building and Running

The project uses `npm` scripts defined in `package.json`.

*   **Install Dependencies:**
    ```bash
    npm install
    ```

*   **Run Development Server:**
    ```bash
    npm run dev
    ```
    Starts the Vite dev server (usually at `http://localhost:5173`).

*   **Run Tests:**
    ```bash
    npm test
    ```
    Runs the Vitest test suite.

*   **Build for Production:**
    ```bash
    npm run build
    ```
    Compiles TypeScript and bundles assets into the `dist/` directory.

*   **Preview Production Build:**
    ```bash
    npm run preview
    ```

*   **Deploy:**
    ```bash
    npm run deploy
    ```
    Deploys the `dist/` folder to GitHub Pages.

## Development Conventions

### Code Structure & Style
*   **Entry Point:** `src/main.ts` initializes the DOM and the `GameEngine`.
*   **Core Logic:** `src/core/` contains the `GameEngine`, `GameState`, and managers (`InputManager`, `SoundManager`).
*   **Systems:** `src/systems/` contains the heavy lifting logic.
    *   `PhysicsSystem.ts`: Projectile motion, collisions, tank movement.
    *   `TerrainSystem.ts`: Pixel-perfect terrain destruction (canvas manipulation).
    *   `AISystem.ts`: AI decision making.
*   **Naming:** PascalCase for classes (`GameEngine`), camelCase for methods/variables (`handleInput`), UPPER_SNAKE_CASE for constants (`CONSTANTS.GRAVITY`).
*   **Type Safety:** Heavy usage of TypeScript interfaces (`GameState`, `Tank`, `Projectile`). `any` is discouraged.

### Testing Strategy
*   **Framework:** Vitest is used for unit testing.
*   **Mocking:** Since the game relies heavily on the DOM (Canvas, Audio), tests typically mock these dependencies.
    *   **Canvas Mocks:** Tests mock `CanvasRenderingContext2D` to verify drawing calls or collision logic without a real browser.
    *   **System Isolation:** Systems are often tested in isolation by passing a mock `GameState` and asserting on the mutations.
*   **Test Location:** All tests are located in the `tests/` directory (e.g., `tests/physics.test.ts`).

### Key Implementation Details
*   **Terrain:** The terrain is not a set of polygons but a bitmap (canvas pixel data). Destruction removes pixels directly. Gravity checks for "floating" pixels or tanks are computationally expensive and handled in `TerrainSystem`.
*   **Game Loop:** The `GameEngine` runs a standard `requestAnimationFrame` loop, calculating `dt` (delta time) and passing it to `update()` methods of various systems.
*   **Game Phases:** The game flow is strictly controlled via `GamePhase` enums (SETUP, AIMING, FIRING, EXPLOSION, SHOP, etc.).

### Common Tasks
*   **Adding a Weapon:**
    1.  Define properties in `src/core/WeaponData.ts`.
    2.  If it has special physics (like splitting or digging), implement logic in `src/systems/PhysicsSystem.ts`.
    3.  Add unit tests in `tests/weapons.test.ts`.
*   **Adjusting AI:**
    1.  Modify `src/core/AIController.ts` for decision logic.
    2.  Update `src/systems/AISystem.ts` if interaction timing needs changing.
