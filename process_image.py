import sys
from rembg import remove
from PIL import Image, ImageEnhance
import numpy as np

def process_image(input_path, output_path):
    print("Opening image...")
    input_img = Image.open(input_path)
    
    print("Removing background...")
    # Remove background
    no_bg = remove(input_img)
    
    # Get bounding box of non-transparent pixels
    print("Cropping tightly...")
    bbox = no_bg.getbbox()
    if bbox:
        cropped = no_bg.crop(bbox)
    else:
        cropped = no_bg
        
    # Center in a square canvas with padding
    print("Centering in square canvas...")
    padding = 20
    max_dim = max(cropped.width, cropped.height)
    square_size = max_dim + padding * 2
    
    final_img = Image.new('RGBA', (square_size, square_size), (0, 0, 0, 0))
    offset = (
        (square_size - cropped.width) // 2,
        (square_size - cropped.height) // 2
    )
    final_img.paste(cropped, offset)
    
    # Adjust contrast and exposure
    print("Adjusting contrast...")
    enhancer = ImageEnhance.Contrast(final_img)
    final_img = enhancer.enhance(1.2) # boost contrast slightly
    
    # Brightness adjustment
    print("Adjusting brightness...")
    enhancer = ImageEnhance.Brightness(final_img)
    final_img = enhancer.enhance(1.1)
    
    # Sharpness adjustment (helps edge detection for ASCII)
    print("Adjusting sharpness...")
    enhancer = ImageEnhance.Sharpness(final_img)
    final_img = enhancer.enhance(2.0)
    
    print(f"Saving to {output_path}...")
    final_img.save(output_path)
    print("Done!")

if __name__ == '__main__':
    process_image('public/assets/god.jpeg', 'public/assets/god_processed.png')
