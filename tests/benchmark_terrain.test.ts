import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TerrainSystem } from '../src/systems/TerrainSystem';
import { GameState } from '../src/core/GameState';

// Realistic Mock Context that stores pixel data
class MockContext {
    public buffer: Uint8ClampedArray;
    public width: number;
    public height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.buffer = new Uint8ClampedArray(width * height * 4);
    }

    clearRect(x: number, y: number, w: number, h: number) {
        // Simple clear (set to 0)
        // In a real scenario this might be complex but for settling benchmark
        // we care about getImageData/putImageData cost.
    }

    getImageData(x: number, y: number, w: number, h: number) {
        // Simulate read cost by copying
        // In reality, we'd slice the buffer correctly.
        // For 0,0,width,height:
        if (x === 0 && y === 0 && w === this.width && h === this.height) {
            return { data: new Uint8ClampedArray(this.buffer) };
        }
        // Partial read (simulated cost)
        return { data: new Uint8ClampedArray(w * h * 4) };
    }

    putImageData(imageData: any, x: number, y: number) {
        // Simulate write cost
        if (x === 0 && y === 0 && imageData.data.length === this.buffer.length) {
            this.buffer.set(imageData.data);
        }
    }

    // Stubs for other methods
    beginPath() { }
    moveTo() { }
    lineTo() { }
    closePath() { }
    fill() { }
    arc() { }
    save() { }
    restore() { }
    translate() { }
    rotate() { }
    drawImage() { }
    fillRect() { }
    stroke() { }
}

class MockCanvas {
    width: number;
    height: number;
    ctx: MockContext;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.ctx = new MockContext(width, height);
    }

    getContext() { return this.ctx; }
}

// Global mocks
global.HTMLCanvasElement = MockCanvas as any;

global.document = {
    createElement: (tag: string) => {
        if (tag === 'canvas') {
            return new MockCanvas(800, 600);
        }
        return { style: {} };
    }
} as any;

describe('TerrainSystem Settle Benchmark', () => {
    let terrainSystem: TerrainSystem;
    let gameState: GameState;

    beforeEach(async () => {
        // Mock import.meta.env
        (global as any).import = { meta: { env: { BASE_URL: '/' } } };

        // TerrainSystem constructor calls document.createElement('canvas')
        terrainSystem = new TerrainSystem(800, 600);

        // Initialize with some "terrain"
        // We'll manually set the mask and mock buffer to simulate a scenario
        // where settling is needed.

        // Create a column of sand that needs to fall
        // Mask: 1 at top, 0 at bottom
        // But settle moves pixels DOWN.
        // So we need 1s above 0s.

        // Let's create a block of floating terrain
        const width = 800;
        const height = 600;

        // Access private members for setup (using any cast)
        const ts = terrainSystem as any;

        // Fill a 50x50 block at y=100 (floating)
        for(let y=100; y<150; y++) {
            for(let x=100; x<150; x++) {
                ts.terrainMask[y * width + x] = 1;

                // Set pixel color (ABGR: Full Alpha, Blue)
                const idx = (y * width + x) * 4;
                ts.ctx.buffer[idx] = 0;   // R
                ts.ctx.buffer[idx+1] = 0; // G
                ts.ctx.buffer[idx+2] = 255; // B
                ts.ctx.buffer[idx+3] = 255; // A
            }
        }

        // Mark columns dirty
        for(let x=100; x<150; x++) {
            ts.dirtyColumns.add(x);
        }

        gameState = { terrainDirty: true } as GameState;
    });

    it('benchmarks settle() performance', () => {
        const start = performance.now();
        const iterations = 100;

        for (let i = 0; i < iterations; i++) {
            // Force dirty columns to remain dirty or re-add them
            // to simulate continuous settling load
            const ts = terrainSystem as any;
             for(let x=100; x<150; x++) {
                ts.dirtyColumns.add(x);
            }

            terrainSystem.settle(gameState);
        }

        const end = performance.now();
        console.log(`\n\n>>> Benchmark Result: settle() x${iterations} took ${(end - start).toFixed(2)}ms <<<\n`);
    });
});
