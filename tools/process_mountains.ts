import { Jimp } from 'jimp';
import * as fs from 'fs';
import * as path from 'path';

// Using Special:FilePath for reliable downloading
// Format: https://commons.wikimedia.org/wiki/Special:FilePath/FILE_NAME?width=1280
const targets = [
    { name: "Bryce_Canyon.png", filename: "ignored", localFile: "public/mountains/Bryce_Canyon_Download.jpg" },
    { name: "Grand_Teton.png", filename: "ignored", localFile: "raw_Grand_Teton.jpg" },
    { name: "Everglades.png", filename: "ignored", localFile: "raw_Everglades.jpg" },
    { name: "Acadia_Coast.png", filename: "ignored", localFile: "raw_Acadia.jpg" }
];

async function main() {
    const outputDir = path.join(process.cwd(), 'public', 'mountains');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const processedFiles: string[] = [];

    for (const target of targets) {
        console.log(`Processing ${target.name}...`);
        try {
            let buffer: Buffer;
            // @ts-ignore
            if (target.localFile && fs.existsSync(target.localFile)) {
                // @ts-ignore
                console.log(`Using local file ${target.localFile}`);
                // @ts-ignore
                buffer = fs.readFileSync(target.localFile);
            } else {
                const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${target.filename}?width=1280`;

                // Fetch buffer with User-Agent
                const res = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });

                if (!res.ok) {
                    // Try redirect? fetch follows redirects by default.
                    console.error(`Fetch failed for ${target.filename}: ${res.status} ${res.statusText}`);
                    continue;
                }

                const arrayBuffer = await res.arrayBuffer();
                buffer = Buffer.from(arrayBuffer);
            }

            // Read with Jimp
            const image = await Jimp.read(buffer);

            // Resize (Cover 1280 wide, maintain aspect)
            if (image.bitmap.width > 1280) {
                image.resize({ w: 1280, h: Jimp.AUTO });
            }

            // Sky Removal
            const width = image.bitmap.width;
            const height = image.bitmap.height;

            // Manual pixel manipulation
            for (let x = 0; x < width; x++) {
                let hitGround = false;
                for (let y = 0; y < height; y++) {
                    const color = image.getPixelColor(x, y);

                    // Manual RGBA extraction
                    const r = (color >>> 24) & 0xff;
                    const g = (color >>> 16) & 0xff;
                    const b = (color >>> 8) & 0xff;
                    // const a = color & 0xff;

                    if (hitGround) {
                        // Ensure opaque if we already hit ground
                        // Set alpha to 255
                        const newColor = (r << 24) | (g << 16) | (b << 8) | 255;
                        image.setPixelColor(newColor >>> 0, x, y);
                        continue;
                    }

                    // Heuristics
                    const isBlue = (b > r * 1.1 && b > g * 1.1 && b > 100);

                    const brightness = (r + g + b) / 3;
                    const maxC = Math.max(r, g, b);
                    const minC = Math.min(r, g, b);
                    const saturation = (maxC - minC) / (maxC + 0.001);
                    const isCloud = (brightness > 180 && saturation < 0.2);

                    const isCyan = (b > 150 && g > 150 && r < 200);

                    if (isBlue || isCloud || isCyan) {
                        image.setPixelColor(0x00000000, x, y); // Transparent
                    } else {
                        hitGround = true;
                        // Set opaque
                        const newColor = (r << 24) | (g << 16) | (b << 8) | 255;
                        image.setPixelColor(newColor >>> 0, x, y);
                    }
                }
            }

            // Write
            await image.write(path.join(outputDir, target.name));
            processedFiles.push(target.name);
            console.log(`Saved ${target.name}`);

            // Wait to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 10000));

        } catch (e) {
            console.error(`Failed to process ${target.name}:`, e);
        }
    }

    // Update manifest
    const manifestPath = path.join(outputDir, 'manifest.json');
    let manifest: string[] = [];
    if (fs.existsSync(manifestPath)) {
        try {
            manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        } catch (e) { }
    }

    for (const f of processedFiles) {
        if (!manifest.includes(f)) {
            manifest.push(f);
        }
    }

    // Cleanup old GEN_ files from manifest if they exist
    manifest = manifest.filter(f => !f.startsWith('GEN_'));

    manifest.sort();
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

main().catch(console.error);
