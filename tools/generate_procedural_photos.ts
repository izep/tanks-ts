import { Jimp } from 'jimp';
import * as fs from 'fs';
import * as path from 'path';

// --- Noise Library (Simplex-ish) ---
class FastNoise {
    seed: number;
    constructor(seed = 123) { this.seed = seed; }
    
    // Simple pseudo-random
    random(x: number, y: number) {
        let n = Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453;
        return n - Math.floor(n);
    }

    // 1D Noise
    noise(x: number) {
        const i = Math.floor(x);
        const f = x - i;
        const u = f * f * (3.0 - 2.0 * f);
        return this.lerp(this.random(i, 0), this.random(i + 1, 0), u);
    }

    // FBM (Fractal Brownian Motion)
    fbm(x: number, octaves: number, persistence: number, lacunarity: number) {
        let total = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;
        for (let i = 0; i < octaves; i++) {
            total += this.noise(x * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }
        return total / maxValue;
    }

    lerp(a: number, b: number, t: number) { return a + t * (b - a); }
}

// --- Generator ---

interface MountainConfig {
    name: string;
    type: 'peak' | 'mesa' | 'arch' | 'dome' | 'canyon';
    colorTop: number;   // hex
    colorBot: number;   // hex
    skyColor?: number; // Not used (transparent)
    roughness: number;  // 0-1
    scale: number;      // Frequency
    seed: number;
}

const PARKS: MountainConfig[] = [
    { name: "Arches_Delicate", type: 'arch', colorTop: 0xD66C44FF, colorBot: 0x8B3E2FFF, roughness: 0.2, scale: 0.01, seed: 1 },
    { name: "Zion_Angels", type: 'peak', colorTop: 0xEEDDCCFF, colorBot: 0x8B4513FF, roughness: 0.6, scale: 0.005, seed: 2 },
    { name: "Yosemite_HalfDome", type: 'dome', colorTop: 0xDDDDDDFF, colorBot: 0x777777FF, roughness: 0.1, scale: 0.003, seed: 3 },
    { name: "Yellowstone_Prismatic", type: 'peak', colorTop: 0xFFD700FF, colorBot: 0x008000FF, roughness: 0.3, scale: 0.02, seed: 4 }, // Weird colors for prismatic
    { name: "GrandCanyon_Mather", type: 'canyon', colorTop: 0xCD5C5CFF, colorBot: 0x8B0000FF, roughness: 0.8, scale: 0.01, seed: 5 },
    { name: "Monument_Valley", type: 'mesa', colorTop: 0xB22222FF, colorBot: 0x8B0000FF, roughness: 0.1, scale: 0.008, seed: 6 },
    { name: "Bryce_Canyon", type: 'peak', colorTop: 0xFF7F50FF, colorBot: 0xA52A2AFF, roughness: 0.9, scale: 0.03, seed: 7 }, // Spiky
    { name: "Glacier_NP", type: 'peak', colorTop: 0xFFFFFFFF, colorBot: 0x708090FF, roughness: 0.7, scale: 0.01, seed: 8 },
    { name: "Grand_Teton", type: 'peak', colorTop: 0xAAAAAAFF, colorBot: 0x2F4F4FFF, roughness: 0.8, scale: 0.015, seed: 9 },
    { name: "Smoky_Mtns", type: 'peak', colorTop: 0x228B22FF, colorBot: 0x006400FF, roughness: 0.4, scale: 0.005, seed: 10 },
    { name: "Joshua_Tree", type: 'peak', colorTop: 0xF4A460FF, colorBot: 0x8B4513FF, roughness: 0.3, scale: 0.02, seed: 11 },
    { name: "Denali", type: 'peak', colorTop: 0xFFFFFFFF, colorBot: 0x778899FF, roughness: 0.6, scale: 0.008, seed: 12 },
    { name: "Rainier", type: 'peak', colorTop: 0xFFFAFAFF, colorBot: 0x2F4F4FFF, roughness: 0.5, scale: 0.006, seed: 13 },
    { name: "Death_Valley", type: 'peak', colorTop: 0xF0E68CFF, colorBot: 0xD2691EFF, roughness: 0.2, scale: 0.01, seed: 14 },
    { name: "Badlands", type: 'peak', colorTop: 0xF5DEB3FF, colorBot: 0x8B4513FF, roughness: 0.7, scale: 0.02, seed: 15 },
    { name: "Olympic_Hoh", type: 'peak', colorTop: 0x00FF7FFF, colorBot: 0x006400FF, roughness: 0.5, scale: 0.01, seed: 16 },
    { name: "Sequoia", type: 'peak', colorTop: 0x228B22FF, colorBot: 0x8B0000FF, roughness: 0.4, scale: 0.01, seed: 17 },
    { name: "Canyonlands", type: 'canyon', colorTop: 0xCD5C5CFF, colorBot: 0x8B0000FF, roughness: 0.8, scale: 0.01, seed: 18 },
    { name: "Everglades", type: 'peak', colorTop: 0x32CD32FF, colorBot: 0x006400FF, roughness: 0.1, scale: 0.05, seed: 19 }, // Flat-ish
    { name: "Acadia_Coast", type: 'peak', colorTop: 0x708090FF, colorBot: 0x00008BFF, roughness: 0.6, scale: 0.01, seed: 20 }
];

async function main() {
    const outputDir = path.join(process.cwd(), 'public', 'mountains');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const width = 1280;
    const height = 720; // 16:9 aspect for better looking landscapes

    const processedFiles: string[] = [];

    for (const config of PARKS) {
        console.log(`Generating ${config.name}...`);
        
        const image = new Jimp({ width, height, color: 0x00000000 }); // Transparent background
        const noise = new FastNoise(config.seed);

        // Terrain generation loop
        for (let x = 0; x < width; x++) {
            let h = 0;
            const nx = x * config.scale;

            if (config.type === 'arch') {
                // Base hill
                h = height * 0.8 - noise.fbm(nx, 3, 0.5, 2.0) * 100;
                // Arch cutout happens in y-loop
            } else if (config.type === 'mesa') {
                // Steep sides, flat top
                const n = noise.fbm(nx, 2, 0.5, 2.0);
                if (n > 0.6) h = height * 0.4;
                else if (n > 0.4) h = height * 0.6; // step
                else h = height * 0.8;
                // Add some roughness
                h += noise.random(x, 0) * 10;
            } else if (config.type === 'dome') {
                // Half dome shape: Smooth curve + sharp drop
                // Normalized x (-1 to 1)
                const cx = (x - width/2) / (width * 0.3);
                const domeShape = Math.exp(-cx*cx) * height * 0.6;
                h = height - domeShape;
                // Cliff face on one side
                if (x > width/2 + 50) h += (x - (width/2 + 50)) * 1.5; 
                h = Math.min(height, h);
            } else if (config.type === 'canyon') {
                // Inverted noise? Or layers.
                h = height * 0.5 + noise.fbm(nx, 4, 0.5, 2.0) * 300;
            } else {
                // Standard Peak
                h = height * 0.7 - noise.fbm(nx, 5, config.roughness, 2.0) * 300;
            }

            // Clamp
            h = Math.max(100, Math.min(height - 10, h));
            const groundY = Math.floor(h);

            for (let y = 0; y < height; y++) {
                let isSolid = false;
                
                if (config.type === 'arch') {
                    // Arch logic: Solid below groundY, BUT exclude the "hole"
                    if (y > groundY) {
                        isSolid = true;
                        // Circle hole
                        const cx = width / 2;
                        const cy = height * 0.6;
                        const rx = 100 + noise.random(y, x)*10;
                        const ry = 80 + noise.random(x, y)*10;
                        const dx = x - cx;
                        const dy = y - cy;
                        if ((dx*dx)/(rx*rx) + (dy*dy)/(ry*ry) < 1) {
                            isSolid = false;
                        }
                    }
                } else {
                    if (y >= groundY) isSolid = true;
                }

                if (isSolid) {
                    // Texture / Gradient
                    // Top to Bot gradient
                    const t = (y - groundY) / (height - groundY); // 0 to 1
                    
                    const r1 = (config.colorTop >>> 24) & 0xff;
                    const g1 = (config.colorTop >>> 16) & 0xff;
                    const b1 = (config.colorTop >>> 8) & 0xff;
                    
                    const r2 = (config.colorBot >>> 24) & 0xff;
                    const g2 = (config.colorBot >>> 16) & 0xff;
                    const b2 = (config.colorBot >>> 8) & 0xff;

                    let r = r1 + t * (r2 - r1);
                    let g = g1 + t * (g2 - g1);
                    let b = b1 + t * (b2 - b1);

                    // Add Noise texture
                    const n = noise.random(x, y);
                    const variation = 30;
                    r += (n - 0.5) * variation;
                    g += (n - 0.5) * variation;
                    b += (n - 0.5) * variation;

                    // Clamp
                    r = Math.max(0, Math.min(255, r));
                    g = Math.max(0, Math.min(255, g));
                    b = Math.max(0, Math.min(255, b));

                    const color = (Math.floor(r) << 24) | (Math.floor(g) << 16) | (Math.floor(b) << 8) | 0xFF;
                    image.setPixelColor(color >>> 0, x, y);
                }
            }
        }

        const filename = `${config.name}.png`;
        await image.write(path.join(outputDir, filename));
        processedFiles.push(filename);
    }

    // Update manifest
    const manifestPath = path.join(outputDir, 'manifest.json');
    let manifest: string[] = [];
    if (fs.existsSync(manifestPath)) {
        try {
            manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        } catch (e) {}
    }

    for (const f of processedFiles) {
        if (!manifest.includes(f)) {
            manifest.push(f);
        }
    }
    manifest = manifest.filter(f => !f.startsWith('GEN_'));
    manifest.sort();
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

main().catch(console.error);
