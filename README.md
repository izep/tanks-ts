# Tanks-a-Lot TS

A TypeScript Progressive Web App (PWA) port of the classic artillery game.

## Gameplay

Tanks-a-Lot is a turn-based artillery game where players control tanks and try to destroy each other on a destructible 2D terrain.

### Core Mechanics
- **Turn-Based Combat:** Players take turns moving their tanks, aiming, and firing a variety of weapons.
- **Economy:** Players earn credits by dealing damage to opponents. These credits can be used to purchase a wide array of weapons and items from the in-game shop.
- **Destructible Terrain:** The terrain is fully destructible, so strategy and positioning are key.
- **Physics:** Projectiles are affected by gravity and wind, and tanks are subject to fall damage.
- **AI Opponents:** The game features AI-controlled opponents for single-player action.

## Features
- Destructible Terrain (Canvas-based)
- Physics (Gravity, Wind, Projectile Motion)
- Tank Movement and Aiming
- Hotseat Multiplayer & AI Opponents
- In-Game Shop for Weapons and Items
- Unit Tests (Vitest)

## Controls
- **A / D**: Move Tank (consumes fuel)
- **Arrow Up / Down**: Adjust Angle
- **Page Up / Down**: Adjust Power
- **Space**: Fire Weapon
- **Tab**: Cycle to Next Weapon
- **S**: Toggle Shield
- **B**: Use Battery (restores health)

## Weapons & Items

Tanks-a-Lot features a large arsenal of weapons and a variety of items to aid you in battle. Here are a few examples:

### Weapons
- **Missile:** A standard explosive projectile.
- **Nuke:** A massive explosive that causes widespread devastation.
- **MIRV:** A missile that splits into multiple warheads before impact.
- **Digger:** A weapon that tunnels through the terrain.
- **Roller:** A projectile that rolls along the ground.
- **Napalm:** A fiery weapon that burns the terrain and damages tanks over time.

### Items
- **Fuel:** Replenishes your tank's fuel supply.
- **Shield:** Protects your tank from a limited amount of damage.
- **Parachute:** Saves your tank from fall damage.
- **Battery:** Restores a small amount of your tank's health.

## Development

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Run Tests
```bash
npm test
```

## Deployment

This project is configured to automatically deploy to GitHub Pages on every merge to the `main` branch.

### Setup GitHub Pages (First Time Only)

1. Go to your repository Settings → Pages
2. Under "Build and deployment" → Source, select "GitHub Actions"
3. The workflow will automatically deploy on the next push to `main`

The site will be available at: `https://izep.github.io/tanks-ts/`

### Manual Deployment

You can also deploy manually using:
```bash
npm run deploy
```
