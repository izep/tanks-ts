import sys
from PIL import Image, ImageDraw

def process_image(input_path, output_path, tolerance=30):
    try:
        img = Image.open(input_path).convert("RGBA")
        width, height = img.size
        
        # We assume the sky starts at (0,0) and (width-1, 0)
        # We'll use a flood fill (breadcrumb) approach or just simple color keying if the background is uniform.
        # Since generated images might not be perfectly uniform, flood fill is safer if the sky is contiguous.
        
        # Get the color of the top-left pixel
        bg_color = img.getpixel((0, 0))
        
        # Prepare a queue for flood fill
        queue = [(0, 0), (width-1, 0), (0, 0), (width//2, 0)]
        visited = set(queue)
        
        pixels = img.load()
        
        # Helper to check color difference
        def is_similar(c1, c2, tol):
            return abs(c1[0] - c2[0]) < tol and \
                   abs(c1[1] - c2[1]) < tol and \
                   abs(c1[2] - c2[2]) < tol

        # Optimization: If we just directed the AI to make a white background, we stick to white-ish removal.
        # But flood fill is better.
        
        # BFS
        while queue:
            x, y = queue.pop(0)
            
            p = pixels[x, y]
            # Make it transparent
            pixels[x, y] = (0, 0, 0, 0)
            
            # Check neighbors
            for dx, dy in [(-1, 0), (1, 0), (0, 1), (0, -1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        neighbor_color = pixels[nx, ny]
                        # If neighbor is solid enough and similar to the background color we started with (or current text pixel)
                        # Actually we should compare with the reference background color (top-left) to avoid drifting into the mountain.
                        if is_similar(neighbor_color, bg_color, tolerance):
                            visited.add((nx, ny))
                            queue.append((nx, ny))

        # Also explicit check: If alpha is 0, it's sky.
        # Ensure we save as PNG
        img.save(output_path, "PNG")
        print(f"Processed {input_path} -> {output_path}")

    except Exception as e:
        print(f"Error processing {input_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python process_transparency.py <input> <output>")
    else:
        process_image(sys.argv[1], sys.argv[2])
