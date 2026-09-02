import sys
from PIL import Image
from collections import Counter

def remove_bg(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()

    corners = [data[0], data[img.width-1], data[-img.width], data[-1]]
    c = Counter(corners)
    bg_color = c.most_common(1)[0][0]

    # Thresholds
    solid_bg_tolerance = 60
    edge_tolerance = 90
    
    new_data = []
    for item in data:
        dist = ((item[0] - bg_color[0])**2 + (item[1] - bg_color[1])**2 + (item[2] - bg_color[2])**2) ** 0.5
        
        if dist <= solid_bg_tolerance:
            # Definitely background -> perfectly transparent
            new_data.append((item[0], item[1], item[2], 0))
        elif dist <= edge_tolerance:
            # Edge transition (anti-aliasing)
            # Map distance from solid_bg_tolerance -> edge_tolerance to alpha 0 -> 255
            ratio = (dist - solid_bg_tolerance) / (edge_tolerance - solid_bg_tolerance)
            alpha = int(ratio * 255)
            new_data.append((item[0], item[1], item[2], alpha))
        else:
            # Definitely foreground -> solid
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    remove_bg(sys.argv[1], sys.argv[2])
