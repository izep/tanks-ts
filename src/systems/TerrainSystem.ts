import type { GameState } from '../core/GameState';

// Simple seeded random number generator (LCG - Linear Congruential Generator)
class SeededRandom {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    // Generate a random number between 0 and 1
    next(): number {
        this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
        return this.seed / 0x7fffffff;
    }
}

export class TerrainSystem {
    public canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private terrainSeed: number = 0;

    // Colors
    private readonly COLOR_DIRT = 'rgb(139, 69, 19)';

    // Standard VGA Palette (0=Sky/Transparent handled separately)
    private readonly PALETTE = [
        '#000000', '#0000AA', '#00AA00', '#00AAAA',
        '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA',
        '#555555', '#5555FF', '#55FF55', '#55FFFF',
        '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'
    ];

    private availableMaps: string[] = [];
    private mapsLoaded: boolean = false;

    private terrainMask: Uint8Array;
    private dirtyColumns: Set<number> = new Set();

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
        this.terrainMask = new Uint8Array(width * height);
    }

    public async init() {
        if (this.mapsLoaded) return;
        try {
            const baseUrl = import.meta.env.BASE_URL;
            const manifestUrl = `${baseUrl}mountains/manifest.json`.replace('//', '/');
            const res = await fetch(manifestUrl);
            if (res.ok) {
                const json = await res.json();
                if (Array.isArray(json)) {
                    this.availableMaps = json.filter(s => typeof s === 'string' && s.toLowerCase().endsWith('.mtn'));
                    console.log(`Loaded ${this.availableMaps.length} maps.`);
                }
            }
        } catch (e) {
            console.warn("Failed to load map manifest", e);
        }
        this.mapsLoaded = true;
    }

    public async generate(gameState: GameState, seed?: number) {
        // Ensure manifest is loaded (if not already)
        if (!this.mapsLoaded) {
            await this.init();
        }

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.terrainMask.fill(0);
        this.dirtyColumns.clear();

        // Use seed if provided, otherwise generate new one
        if (seed !== undefined) {
            this.terrainSeed = seed;
        } else {
            this.terrainSeed = Math.floor(Math.random() * 1000000);
        }

        const rng = new SeededRandom(this.terrainSeed);

        // Try to load a random map
        let mapLoaded = false;
        if (this.availableMaps.length > 0) {
            const mapIndex = Math.floor(rng.next() * this.availableMaps.length);
            const mapName = this.availableMaps[mapIndex];
            console.log(`Loading map: ${mapName}`);
            try {
                mapLoaded = await this.loadAndDrawMtn(mapName);
            } catch (e) {
                console.error(`Failed to load map ${mapName}:`, e);
            }
        }

        if (!mapLoaded) {
            console.log("Generating procedural terrain...");
            this.generateProcedural(rng);
        }

        gameState.terrainDirty = false;
    }

    private async loadAndDrawMtn(filename: string): Promise<boolean> {
        const baseUrl = import.meta.env.BASE_URL;
        const fileUrl = `${baseUrl}mountains/${filename}`.replace('//', '/');
        const res = await fetch(fileUrl);
        if (!res.ok) return false;
        const buffer = await res.arrayBuffer();
        const data = new Uint8Array(buffer);

        if (data.length < 18) return false;

        // Header
        const fileWidth = data[6] | (data[7] << 8);

        // Find Data Start & Palette
        const HEADER_SIZE = 18;
        const body = data.subarray(HEADER_SIZE);

        let pixelDataOffset = HEADER_SIZE + 56; // Default fallback (MTTEST location 74)
        let palette: string[] | null = null;

        // Search for FF FF FF marker
        let markerIdx = -1;
        for (let i = 0; i < Math.min(body.length - 3, 200); i++) {
            if (body[i] === 0xFF && body[i + 1] === 0xFF && body[i + 2] === 0xFF) {
                markerIdx = i;
                break;
            }
        }

        if (markerIdx >= 0) {
            const afterMarkerIdx = markerIdx + 3;
            // Check for MTTEST special case: FF FF BF 00
            if (afterMarkerIdx + 4 <= body.length &&
                body[afterMarkerIdx] === 0xFF &&
                body[afterMarkerIdx + 1] === 0xFF &&
                body[afterMarkerIdx + 2] === 0xBF &&
                body[afterMarkerIdx + 3] === 0x00) {

                pixelDataOffset = HEADER_SIZE + afterMarkerIdx + 4;
            } else {
                // Standard case: 48 bytes of Palette follow
                if (afterMarkerIdx + 48 <= body.length) {
                    // Parse Palette
                    palette = [];
                    for (let i = 0; i < 16; i++) {
                        const r = body[afterMarkerIdx + i * 3];
                        const g = body[afterMarkerIdx + i * 3 + 1];
                        const b = body[afterMarkerIdx + i * 3 + 2];
                        palette.push(`rgb(${r}, ${g}, ${b})`);
                    }
                    pixelDataOffset = HEADER_SIZE + afterMarkerIdx + 48;
                }
            }
        }

        // Use custom palette or default
        const activePalette = palette || this.PALETTE;

        console.log(`Loading MTN: ${filename}, Width: ${fileWidth}, Offset: ${pixelDataOffset}, Palette: ${palette ? 'Custom' : 'Default'}`);

        // Parse Column-Major Data
        // Each column is terminated by 0x00 BYTE
        // Pixels are 4-bit packed (High-Low)

        const pixels = data.subarray(pixelDataOffset);

        // Center the mountain
        const offsetX = Math.floor((this.width - fileWidth) / 2);

        this.ctx.globalCompositeOperation = 'source-over';

        let ptr = 0;
        for (let x = 0; x < fileWidth; x++) {
            if (ptr >= pixels.length) break;

            // Read column bytes until terminator 0x00
            // Add safety limit to prevent reading too much data if terminator is missing
            const colBytes: number[] = [];
            const maxBytesPerColumn = this.height; // Max pixels = height, so max bytes = height (2 pixels per byte)
            while (ptr < pixels.length && pixels[ptr] !== 0x00 && colBytes.length < maxBytesPerColumn) {
                colBytes.push(pixels[ptr]);
                ptr++;
            }
            if (ptr < pixels.length && pixels[ptr] === 0x00) {
                ptr++; // Skip 0x00 terminator if found
            }

            // Decode pixels (High -> Low)
            const colPixels: number[] = [];
            for (const b of colBytes) {
                colPixels.push((b >> 4) & 0x0F);
                colPixels.push(b & 0x0F);
            }

            // Draw Bottom-Up
            const startY = this.height - 1;

            for (let i = 0; i < colPixels.length; i++) {
                const colorIdx = colPixels[i];
                if (colorIdx > 0 && colorIdx < activePalette.length) {
                    const canvasX = offsetX + x;
                    const canvasY = startY - i;

                    if (canvasX >= 0 && canvasX < this.width && canvasY >= 0) {
                        this.ctx.fillStyle = activePalette[colorIdx];
                        this.ctx.fillRect(canvasX, canvasY, 1, 1);
                        this.terrainMask[canvasY * this.width + canvasX] = 1;
                    }
                }
            }
        }

        return true;
    }

    private generateProcedural(rng: SeededRandom) {
        this.ctx.fillStyle = this.COLOR_DIRT;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height);

        // Multi-octave noise for natural terrain
        const offsets = [rng.next() * 100, rng.next() * 100, rng.next() * 100];

        for (let x = 0; x < this.width; x++) {
            // Octave 1: Large hills
            const y1 = Math.sin(x * 0.005 + offsets[0]) * 150;
            // Octave 2: Medium bumps
            const y2 = Math.sin(x * 0.02 + offsets[1]) * 40;
            // Octave 3: Roughness
            const y3 = Math.sin(x * 0.05 + offsets[2]) * 10;
            // Octave 4: Fine noise (using seeded random)
            const y4 = (rng.next() - 0.5) * 4;

            const baseHeight = this.height * 0.7; // Lower ground level
            const ySurface = Math.floor(baseHeight - (y1 + y2 + y3 + y4));

            // Clamp
            const clampedY = Math.max(100, Math.min(this.height - 20, ySurface));

            this.ctx.lineTo(x, clampedY);

            for (let y = clampedY; y < this.height; y++) {
                if (y >= 0) {
                    this.terrainMask[y * this.width + x] = 1;
                }
            }
        }

        this.ctx.lineTo(this.width, this.height);
        this.ctx.closePath();
        this.ctx.fill();
    }

    // Get the current terrain seed for reproducibility
    public getSeed(): number {
        return this.terrainSeed;
    }

    public explode(gameState: GameState, x: number, y: number, radius: number) {
        // 1. Visual Update
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalCompositeOperation = 'source-over';

        // 2. Mask Update & Dirty Columns
        const r2 = radius * radius;
        const minX = Math.max(0, Math.floor(x - radius));
        const maxX = Math.min(this.width - 1, Math.ceil(x + radius));
        const minY = Math.max(0, Math.floor(y - radius));
        const maxY = Math.min(this.height - 1, Math.ceil(y + radius));

        for (let py = minY; py <= maxY; py++) {
            for (let px = minX; px <= maxX; px++) {
                const dx = px - x;
                const dy = py - y;
                if (dx * dx + dy * dy <= r2) {
                    this.terrainMask[py * this.width + px] = 0;
                }
            }
        }

        // Mark Columns Dirty
        for (let c = minX; c <= maxX; c++) {
            this.dirtyColumns.add(c);
        }

        gameState.terrainDirty = true;
    }

    public addTerrain(gameState: GameState, x: number, y: number, radius: number, color?: string) {
        // Clamp coordinates to prevent drawing outside canvas (fixes freeze when off-screen)
        const clampedX = Math.max(0, Math.min(this.width - 1, x));
        const clampedY = Math.max(0, Math.min(this.height - 1, y));
        const clampedRadius = Math.min(radius, Math.min(clampedX, this.width - clampedX, clampedY, this.height - clampedY));

        // Only add if radius is valid
        if (clampedRadius <= 0) return;

        // 1. Visual Update (draw on base terrain canvas for settling)
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = color || this.COLOR_DIRT;
        this.ctx.beginPath();
        this.ctx.arc(clampedX, clampedY, clampedRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // 2. Mask Update (use clamped values)
        const r2 = clampedRadius * clampedRadius;
        const minX = Math.max(0, Math.floor(clampedX - clampedRadius));
        const maxX = Math.min(this.width - 1, Math.ceil(clampedX + clampedRadius));
        const minY = Math.max(0, Math.floor(clampedY - clampedRadius));
        const maxY = Math.min(this.height - 1, Math.ceil(clampedY + clampedRadius));

        for (let py = minY; py <= maxY; py++) {
            for (let px = minX; px <= maxX; px++) {
                const dx = px - clampedX;
                const dy = py - clampedY;
                if (dx * dx + dy * dy <= r2) {
                    this.terrainMask[py * this.width + px] = 1;
                }
            }
        }

        // Mark Columns Dirty
        for (let c = minX; c <= maxX; c++) {
            this.dirtyColumns.add(c);
        }

        gameState.terrainDirty = true;
    }

    public clearConicSection(gameState: GameState, startX: number, startY: number, angleDeg: number, length: number, spreadDeg: number) {
        const rad = (angleDeg * Math.PI) / 180;
        const spreadRad = (spreadDeg * Math.PI) / 180;

        // Triangle vertices
        const x1 = startX;
        const y1 = startY;
        const x2 = startX + Math.cos(rad - spreadRad / 2) * length;
        const y2 = startY - Math.sin(rad - spreadRad / 2) * length; // Canvas Y inverted
        const x3 = startX + Math.cos(rad + spreadRad / 2) * length;
        const y3 = startY - Math.sin(rad + spreadRad / 2) * length;

        // 1. Visual Update
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.lineTo(x3, y3);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.globalCompositeOperation = 'source-over';

        // 2. Mask Update - Bounding box optimization
        const minX = Math.floor(Math.max(0, Math.min(x1, x2, x3)));
        const maxX = Math.ceil(Math.min(this.width - 1, Math.max(x1, x2, x3)));
        const minY = Math.floor(Math.max(0, Math.min(y1, y2, y3)));
        const maxY = Math.ceil(Math.min(this.height - 1, Math.max(y1, y2, y3)));

        // Point in Triangle Check
        const sign = (p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number) => {
            return (p1x - p3x) * (p2y - p3y) - (p2x - p3x) * (p1y - p3y);
        };

        for (let py = minY; py <= maxY; py++) {
            for (let px = minX; px <= maxX; px++) {
                const d1 = sign(px, py, x1, y1, x2, y2);
                const d2 = sign(px, py, x2, y2, x3, y3);
                const d3 = sign(px, py, x3, y3, x1, y1);

                const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
                const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);

                if (!(hasNeg && hasPos)) {
                    // Inside triangle
                    this.terrainMask[py * this.width + px] = 0;
                }
            }
        }

        // Mark Columns Dirty
        for (let c = minX; c <= maxX; c++) {
            this.dirtyColumns.add(c);
        }
        gameState.terrainDirty = true;
    }


    public getGroundY(x: number): number {
        if (x < 0 || x >= this.width) return this.height;
        x = Math.floor(x);

        // Fast mask lookup
        for (let y = 0; y < this.height; y++) {
            if (this.terrainMask[y * this.width + x] === 1) {
                return y;
            }
        }
        return this.height;
    }

    public settle(gameState: GameState): boolean {
        if (this.dirtyColumns.size === 0) {
            gameState.terrainDirty = false;
            return false;
        }

        // Limit processing to prevent freeze - only process a subset of dirty columns per frame
        const MAX_COLUMNS_PER_FRAME = 50;
        const columnsToProcess = Array.from(this.dirtyColumns).slice(0, MAX_COLUMNS_PER_FRAME);

        if (columnsToProcess.length === 0) {
            return false;
        }

        const width = this.width;
        const height = this.height;
        let anyMoved = false;

        const imageData = this.ctx.getImageData(0, 0, width, height);
        const view = new Uint32Array(imageData.data.buffer);
        const mask = this.terrainMask;

        const settledColumns = new Set<number>();

        // Process each dirty column
        for (const x of columnsToProcess) {
            let colMoved = false;

            // Iterate bottom-up (Standard gravity)
            // Python version: one pass per frame.
            // But we simulate multiple passes to make it fast.
            const ITERATIONS = 20;
            for (let i = 0; i < ITERATIONS; i++) {
                let passMoved = false;
                for (let y = height - 1; y > 0; y--) {
                    const idx = y * width + x;
                    const idxAbove = (y - 1) * width + x;

                    // Logic based ONLY on Mask
                    if (mask[idxAbove] === 1 && mask[idx] === 0) {
                        // Apply Move
                        mask[idx] = 1;
                        mask[idxAbove] = 0;

                        // Visual Sync
                        view[idx] = view[idxAbove];
                        view[idxAbove] = 0;

                        passMoved = true;
                        colMoved = true;
                    }
                }
                if (!passMoved) break;
            }

            if (colMoved) {
                anyMoved = true;
            } else {
                settledColumns.add(x);
            }
        }

        // Remove settled columns
        for (const col of settledColumns) {
            this.dirtyColumns.delete(col);
        }

        if (anyMoved) {
            this.ctx.putImageData(imageData, 0, 0);
            gameState.terrainDirty = true;
        } else if (this.dirtyColumns.size === 0) {
            gameState.terrainDirty = false;
        }

        return anyMoved;
    }

    /**
     * Checks if a point in the terrain is solid.
     */
    public isSolid(x: number, y: number): boolean {
        const ix = Math.floor(x);
        const iy = Math.floor(y);

        if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) {
            return false; // Out of bounds is not solid
        }

        return this.terrainMask[iy * this.width + ix] === 1;
    }
}
