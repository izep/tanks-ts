import zlib
import struct
import math
import random
import os
import json

def write_png(buf, width, height, filename):
    """Writes a raw RGBA buffer to a PNG file using standard libraries."""
    # PNG Header
    png_sig = b'\x89PNG\r\n\x1a\n'
    
    # IHDR Chunk
    # Width (4), Height (4), BitDepth (1), ColorType (1), Compress (1), Filter (1), Interlace (1)
    # ColorType 6 = Truecolor with Alpha
    ihdr_data = struct.pack('!I I B B B B B', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff
    ihdr = struct.pack('!I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('!I', ihdr_crc)
    
    # IDAT Chunk (Image Data)
    # Scanlines must be prepended with filter type (0 = None)
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # Filter type 0
        # Row data is width * 4 bytes
        row_start = y * width * 4
        raw_data.extend(buf[row_start : row_start + width * 4])
        
    compressed = zlib.compress(raw_data)
    idat_crc = zlib.crc32(b'IDAT' + compressed) & 0xffffffff
    idat = struct.pack('!I', len(compressed)) + b'IDAT' + compressed + struct.pack('!I', idat_crc)
    
    # IEND Chunk
    iend_crc = zlib.crc32(b'IEND') & 0xffffffff
    iend = struct.pack('!I', 0) + b'IEND' + struct.pack('!I', iend_crc)
    
    with open(filename, 'wb') as f:
        f.write(png_sig)
        f.write(ihdr)
        f.write(idat)
        f.write(iend)

def generate_terrain(width, height, type_name):
    buffer = bytearray(width * height * 4)
    
    # Base colors
    sky = (0, 0, 0, 0)
    
    # Palettes
    stone = (120, 110, 100, 255)
    red_rock = (180, 80, 40, 255)
    snow = (240, 240, 255, 255)
    green = (50, 150, 50, 255)
    
    main_color = stone
    if "red" in type_name: main_color = red_rock
    if "green" in type_name: main_color = green
    if "snow" in type_name: main_color = stone # Snow cap logic later
    
    for x in range(width):
        # Calculate Height
        nx = x / width
        
        h = 0
        if "arch" in type_name:
            # Arch: Sin wave with a hole?
            # Simple Arch: Semicircle
            cx = (x - width/2) / (width/2) # -1 to 1
            h = math.sqrt(max(0, 1 - cx*cx)) * height * 0.8
            # Inner arch (hole)
            h_inner = math.sqrt(max(0, 1 - (cx*1.5)*(cx*1.5))) * height * 0.5
        elif "dome" in type_name:
            # Half dome
            cx = (x - width/3) / (width/4)
            if cx > 0: cx = cx * 2 # Steeper one side
            h = math.exp(-cx*cx) * height * 0.9
        elif "spikes" in type_name:
            h = (math.sin(nx * 20) + 1) * height * 0.4 + (math.sin(nx * 50)*0.2)
        else:
            # Perlin-ish noise (simple sum of sines)
            h = height * 0.2
            h += math.sin(nx * 5) * height * 0.2
            h += math.sin(nx * 13) * height * 0.1
            h += math.sin(nx * 29) * height * 0.05
        
        ground_y = height - int(h)
        
        for y in range(height):
            idx = (y * width + x) * 4
            
            is_ground = False
            
            if "arch" in type_name:
                # Special logic for arch hole
                cx = (x - width/2) / (width/2)
                outer_h = math.sqrt(max(0, 1 - cx*cx)) * height * 0.8
                inner_h = math.sqrt(max(0, 1 - (cx*1.5)*(cx*1.5))) * height * 0.5
                
                my_h = height - y
                if my_h < outer_h and my_h > inner_h:
                    is_ground = True
                elif my_h < 100: # Base
                    is_ground = True
            else:
                if y >= ground_y:
                    is_ground = True
            
            if is_ground:
                # Texture / Color
                col = main_color
                
                # Noise texture
                noise = random.randint(-20, 20)
                r = max(0, min(255, col[0] + noise))
                g = max(0, min(255, col[1] + noise))
                b = max(0, min(255, col[2] + noise))
                
                # Snow cap
                if "snow" in type_name and y < ground_y + 50:
                    r, g, b = 255, 255, 255
                
                buffer[idx] = r
                buffer[idx+1] = g
                buffer[idx+2] = b
                buffer[idx+3] = 255
            else:
                buffer[idx] = 0
                buffer[idx+1] = 0
                buffer[idx+2] = 0
                buffer[idx+3] = 0

    return buffer

output_dir = "public/mountains"
os.makedirs(output_dir, exist_ok=True)

generated_files = []

maps = [
    ("GEN_01_HalfDome.png", "dome"),
    ("GEN_02_ArchDelicate.png", "arch_red"),
    ("GEN_03_ZionCanyon.png", "red_noise"),
    ("GEN_04_Yellowstone.png", "green_noise"),
    ("GEN_05_GrandTeton.png", "spikes_snow"),
    ("GEN_06_BryceCanyon.png", "spikes_red"),
    ("GEN_07_MonumentValley.png", "dome_red"),
    ("GEN_08_Glacier.png", "snow_noise"),
    ("GEN_09_RockyMtn.png", "spikes_snow"),
    ("GEN_10_SmokyMtn.png", "green_noise"),
    ("GEN_11_Everglades.png", "green_flat"),
    ("GEN_12_DeathValley.png", "red_flat"),
    ("GEN_13_JoshuaTree.png", "dome_red"),
    ("GEN_14_Yosemite.png", "dome_stone"),
    ("GEN_15_Rainier.png", "dome_snow"),
    ("GEN_16_Denali.png", "spikes_snow"),
    ("GEN_17_Badlands.png", "spikes_red"),
    ("GEN_18_Canyonlands.png", "red_noise"),
    ("GEN_19_ArchesDouble.png", "arch_red"),
    ("GEN_20_Sequioa.png", "green_noise"),
    ("GEN_21_Olympus.png", "snow_noise")
]

width = 1280
height = 800

for name, type_name in maps:
    print(f"Generating {name}...")
    buf = generate_terrain(width, height, type_name)
    write_png(buf, width, height, os.path.join(output_dir, name))
    generated_files.append(name)

# Update manifest
manifest_path = os.path.join(output_dir, "manifest.json")
try:
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)
except:
    manifest = []

# Add new files if not present
for f in generated_files:
    if f not in manifest:
        manifest.append(f)

with open(manifest_path, 'w') as f:
    json.dump(manifest, f, indent=4)

print("Done.")
