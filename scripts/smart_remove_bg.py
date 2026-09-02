import sys
from PIL import Image
from collections import deque

def smart_remove_bg(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Start flood fill from the 4 corners
    queue = deque([(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)])
    
    tolerance = 80 # Generous tolerance for JPG artifacts
    bg_color = pixels[0, 0][:3]
    
    visited = bytearray(width * height)
    
    while queue:
        x, y = queue.popleft()
        
        idx = y * width + x
        if visited[idx]:
            continue
        visited[idx] = 1
        
        r, g, b, a = pixels[x, y]
        # Calculate color distance
        dist = ((r - bg_color[0])**2 + (g - bg_color[1])**2 + (b - bg_color[2])**2) ** 0.5
        
        if dist <= tolerance:
            # It's background! Make it transparent
            pixels[x, y] = (r, g, b, 0) 
            
            # Add neighbors
            if x > 0 and not visited[y * width + (x - 1)]: queue.append((x - 1, y))
            if x < width - 1 and not visited[y * width + (x + 1)]: queue.append((x + 1, y))
            if y > 0 and not visited[(y - 1) * width + x]: queue.append((x, y - 1))
            if y < height - 1 and not visited[(y + 1) * width + x]: queue.append((x, y + 1))
            
    img.save(output_path, "PNG")
    print(f"Successfully processed {input_path} -> {output_path}")

if __name__ == "__main__":
    smart_remove_bg(sys.argv[1], sys.argv[2])
