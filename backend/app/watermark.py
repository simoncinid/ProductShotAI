from PIL import Image, ImageDraw, ImageFont
import io
from typing import Optional


async def apply_watermark(image_bytes: bytes) -> bytes:
    """Apply watermark to image and return watermarked image bytes"""
    # Open image from bytes
    image = Image.open(io.BytesIO(image_bytes))
    
    # Convert to RGB if necessary
    if image.mode != "RGB":
        image = image.convert("RGB")
    
    # Create a copy for drawing
    draw = ImageDraw.Draw(image)
    
    # Get image dimensions
    width, height = image.size
    
    # Watermark text
    watermark_text = "AI SAMPLE – UPGRADE FOR CLEAN IMAGE"
    
    # Font: percorsi per macOS, Linux (Debian/Ubuntu/Render), fallback default
    font_size = max(width, height) // 20
    font = None
    for path in (
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ):
        try:
            font = ImageFont.truetype(path, font_size)
            break
        except Exception:
            continue
    if font is None:
        font = ImageFont.load_default()

    # Bounding box testo (textbbox in Pillow 8+; fallback per versioni vecchie)
    try:
        bbox = draw.textbbox((0, 0), watermark_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
    except AttributeError:
        text_width = width // 2
        text_height = max(font_size, height // 20)
    
    # Calculate diagonal position (from top-left to bottom-right)
    # Position text in center with rotation
    angle = -45  # 45 degrees counter-clockwise
    
    # Create a temporary image for rotated text
    temp_img = Image.new("RGBA", (width, height), (255, 255, 255, 0))
    temp_draw = ImageDraw.Draw(temp_img)
    
    # Calculate center position
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    # Draw text with high opacity
    temp_draw.text(
        (x, y),
        watermark_text,
        font=font,
        fill=(255, 215, 0, 230),  # Vivid yellow with high opacity (RGB + Alpha)
    )
    
    # Rotate the text image
    rotated = temp_img.rotate(angle, expand=False)
    
    # Paste rotated text onto original image
    image = Image.alpha_composite(
        image.convert("RGBA"),
        rotated
    ).convert("RGB")
    
    # Also add a semi-transparent overlay for extra protection
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    
    # Draw multiple diagonal watermarks
    for i in range(-2, 3):
        offset_x = i * (width // 4)
        offset_y = i * (height // 4)
        overlay_draw.text(
            (x + offset_x, y + offset_y),
            watermark_text,
            font=font,
            fill=(255, 215, 0, 180),
        )
    
    rotated_overlay = overlay.rotate(angle, expand=False)
    image = Image.alpha_composite(
        image.convert("RGBA"),
        rotated_overlay
    ).convert("RGB")
    
    # Convert back to bytes
    output = io.BytesIO()
    image.save(output, format="JPEG", quality=95)
    return output.getvalue()
