import os
import glob
from PIL import Image, ImageDraw

def simple_sky_removal(img, tolerance=30):
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Simple BFS Flood Fill from top points
    # We assume sky touches the top edge
    queue = []
    visited = set()
    
    # Add top row to queue
    for x in range(width):
        queue.append((x, 0))
        visited.add((x, 0))

    # Get reference color from top-left (or average of top row?)
    # Let's use dynamic reference: the neighbor pixel being checked against the current pixel?
    # No, usually sky is blue/white.
    # Let's clean alpha: 0.
    
    # Better approach: Flood fill turning pixels transparent.
    # We need a "start color" to diff against?
    # Sky gradients are tricky.
    # Let's assume the top-left pixel is sky.
    start_color = pixels[0, 0]
    
    # Use a seed-fill approach
    seeds = [(x, 0) for x in range(0, width, 10)] # Sample points along top
    
    for seed in seeds:
        if seed in visited: continue
        
        q = [seed]
        visited.add(seed)
        
        seed_color = pixels[seed[0], seed[1]]
        
        # If seed is already transparent, skip/continue?
        if seed_color[3] == 0: continue
        
        while q:
            x, y = q.pop(0)
            
            # Make transparent
            pixels[x, y] = (0, 0, 0, 0)
            
            # Check neighbors
            for dx, dy in [(-1,0), (1,0), (0,1), (0,-1)]:
                nx, ny = x + dx, y + dy
                
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        # Check color similarity
                        curr_col = pixels[nx, ny]
                        # Euclidean distance? Or just sum of diffs?
                        diff = abs(curr_col[0] - seed_color[0]) + abs(curr_col[1] - seed_color[1]) + abs(curr_col[2] - seed_color[2])
                        
                        if diff < tolerance * 3: # 3 channels * tolerance
                            visited.add((nx, ny))
                            q.append((nx, ny))
                            
    return img

def optimize_image(filepath):
    print(f"Processing {filepath}...")
    try:
        img = Image.open(filepath)
        
        # 1. Resize
        target_width = 800
        if img.width != target_width:
            cols = target_width
            rows = int(img.height * (target_width / img.width))
            img = img.resize((cols, rows), Image.Resampling.LANCZOS)
            
        # 2. Convert to RGBA
        img = img.convert("RGBA")
        
        # 3. Sky Removal (Heuristic)
        # Only do this if image doesn't look transparent yet?
        # Check center-top pixel?
        # Let's apply it aggressively since user asked for transparency.
        # But allow disabling if it ruins it.
        # Use a moderate tolerance.
        img = simple_sky_removal(img, tolerance=25)
        
        # Save
        img.save(filepath, "PNG")
        print(f"Saved optimized {filepath}")
        
    except Exception as e:
        print(f"Failed to process {filepath}: {e}")

def main():
    directory = r"c:\code\izep\tanks\tanks-a-lot-ts\public\mountains"
    
    # Get all PNGs
    files = glob.glob(os.path.join(directory, "*.png"))
    
    for f in files:
        optimize_image(f)

if __name__ == "__main__":
    main()
