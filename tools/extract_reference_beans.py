from pathlib import Path
from collections import deque
from PIL import Image, ImageChops, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"C:\Users\byeng\Downloads\cb0231fe7d7fe8a7.webp")
OUT = ROOT / "bean_grow_html" / "assets" / "beans"
OUT.mkdir(parents=True, exist_ok=True)


# Coordinates are measured from the user-provided collection reference image.
# Each crop targets only the bean character inside the card, not the whole UI card.
CROPS = {
    "basic": (47, 413, 127, 516),
    "blossom": (158, 413, 239, 516),
    "sky": (269, 413, 351, 516),
    "lemon": (381, 413, 463, 516),
    "night": (492, 413, 575, 516),
    "sunset": (48, 565, 128, 669),
    "mint": (159, 565, 240, 669),
    "sand": (271, 565, 351, 669),
    "milk": (383, 565, 463, 669),
    "locked-normal": (495, 575, 570, 668),
    "rainbow": (43, 782, 133, 873),
    "cat": (157, 774, 241, 873),
    "space": (269, 780, 353, 873),
    "lucky": (382, 774, 464, 873),
    "locked-special": (495, 760, 570, 858),
    "mascot": (388, 10, 565, 190),
}


def edge_background(crop):
    w, h = crop.size
    points = [
        crop.getpixel((0, 0)),
        crop.getpixel((w - 1, 0)),
        crop.getpixel((0, h - 1)),
        crop.getpixel((w - 1, h - 1)),
    ]
    return tuple(sum(p[i] for p in points) // len(points) for i in range(3))


def keep_largest_alpha_component(image):
    alpha = image.getchannel("A")
    pixels = alpha.load()
    w, h = image.size
    seen = set()
    components = []

    for y in range(h):
        for x in range(w):
            if (x, y) in seen or pixels[x, y] == 0:
                continue
            queue = deque([(x, y)])
            seen.add((x, y))
            component = []
            while queue:
                px, py = queue.popleft()
                component.append((px, py))
                for nx, ny in ((px + 1, py), (px - 1, py), (px, py + 1), (px, py - 1)):
                    if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in seen and pixels[nx, ny] > 0:
                        seen.add((nx, ny))
                        queue.append((nx, ny))
            components.append(component)

    if not components:
        return image

    largest = set(max(components, key=len))
    cleaned = Image.new("L", image.size, 0)
    cleaned_pixels = cleaned.load()
    for x, y in largest:
        cleaned_pixels[x, y] = pixels[x, y]
    image.putalpha(cleaned)
    return image


def transparent_crop(crop):
    crop = crop.convert("RGBA")
    rgb = crop.convert("RGB")
    bg = Image.new("RGB", crop.size, edge_background(rgb))
    diff = ImageChops.difference(rgb, bg).convert("L")

    # The reference is a screenshot, so pale card backgrounds and labels can be
    # close to the character colors. Use both background difference and color
    # saturation, then keep only the main connected character component.
    mask = Image.new("L", crop.size, 0)
    diff_pixels = diff.load()
    rgb_pixels = rgb.load()
    mask_pixels = mask.load()
    for y in range(crop.height):
        for x in range(crop.width):
            r, g, b = rgb_pixels[x, y]
            saturation = max(r, g, b) - min(r, g, b)
            value = max(r, g, b)
            if diff_pixels[x, y] > 18 and (saturation > 18 or value < 232):
                mask_pixels[x, y] = 255

    mask = mask.filter(ImageFilter.GaussianBlur(0.45))

    # Keep soft character shadows, but remove the flat screenshot/card background.
    alpha = mask.point(lambda value: 255 if value > 26 else (value * 4 if value > 5 else 0))
    crop.putalpha(alpha)

    box = crop.getbbox()
    if box:
        crop = crop.crop(box)
    crop = keep_largest_alpha_component(crop)
    box = crop.getbbox()
    if box:
        crop = crop.crop(box)
    return crop


def place_on_square(crop, size=256):
    square = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    target = size - 16
    scale = target / max(crop.width, crop.height)
    crop = crop.resize((max(1, round(crop.width * scale)), max(1, round(crop.height * scale))), Image.Resampling.LANCZOS)
    x = (size - crop.width) // 2
    y = max(0, (size - crop.height) // 2 + 2)
    square.alpha_composite(crop, (x, y))
    return square


def main():
    source = Image.open(SOURCE).convert("RGB")
    for name, box in CROPS.items():
        extracted = transparent_crop(source.crop(box))
        place_on_square(extracted).save(OUT / f"{name}.png")


if __name__ == "__main__":
    main()
