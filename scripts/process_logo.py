import sys
from PIL import Image

def remove_bg():
    input_path = r"d:\Affobe\THELOVESIDES\src\assets\images\Logo.jpeg"
    output_path = r"d:\Affobe\THELOVESIDES\src\assets\images\LogoProcessed.png"
    
    print("Opening image...")
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    tolerance = 90 # If R+G+B < 90, it's considered black/very dark grey
    
    print("Replacing all near-black pixels globally...")
    replaced = 0
    for x in range(width):
        for y in range(height):
            r, g, b, a = pixels[x, y]
            if (r + g + b) < tolerance:
                pixels[x, y] = (0, 0, 0, 0)
                replaced += 1

    print("Saving processed image...")
    img.save(output_path, "PNG")
    print(f"Success: {replaced} black pixels removed globally")

if __name__ == "__main__":
    remove_bg()
