import sys
import os

try:
    from PIL import Image
except ImportError:
    print("Installing Pillow...")
    os.system(f"{sys.executable} -m pip install Pillow")
    from PIL import Image

def remove_background(img_path):
    img = Image.open(img_path).convert("RGBA")
    datas = img.getdata()
    
    bg_color = datas[0]
    
    new_data = []
    if bg_color[0] > 127: # Background is white, drawing is black
        for item in datas:
            greyscale = int(0.299*item[0] + 0.587*item[1] + 0.114*item[2])
            alpha = 255 - greyscale
            new_data.append((0, 0, 0, alpha))
    else: # Background is black, drawing is white
        for item in datas:
            greyscale = int(0.299*item[0] + 0.587*item[1] + 0.114*item[2])
            alpha = greyscale
            new_data.append((255, 255, 255, alpha))
            
    img.putdata(new_data)
    img.save(img_path, "PNG")
    print(f"Background removed. Image is now transparent.")

remove_background("public/logo.png")
