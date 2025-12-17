# Tanks-a-Lot TS

A TypeScript Progressive Web App (PWA) port of the classic artillery game.

## Features
- Destructible Terrain (Canvas-based)
- Physics (Gravity, Wind, Projectile Motion)
- Tank Movement and Aiming
- Hotseat Multiplayer (Round-based)
- Unit Tests (Vitest)

## Controls
- **Arrow Left/Right**: Move Tank
- **Arrow Up/Down**: Adjust Angle
- **Page Up/Down**: Adjust Power
- **Space**: Fire

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
