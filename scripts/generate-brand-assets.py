"""Generate Whyrl brand assets (Orbit Mark icon, splash, glass background, web icons).

Usage: python scripts/generate-brand-assets.py [path-to-whyrl-site]
Requires Pillow + numpy. Fonts are read from node_modules/@expo-google-fonts.
"""
import os
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
SITE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(ROOT), "whyrl-site")

DEEP = (21, 45, 53)       # #152D35
SAGE = (212, 236, 221)    # #D4ECDD
SAGE_DEEP = (179, 220, 192)  # #B3DCC0
TEAL = (45, 212, 191)
SKY = (56, 189, 248)
INK = (21, 45, 53)

SS = 4  # supersample factor

# Orbit Mark geometry on a 200-unit grid (ring + comet rotated 45deg clockwise)
RING_C = (100, 95)
RING_R = 46
COMET = (132.5, 62.5)


def sg(weight, size):
    name = {"700Bold": "SpaceGrotesk_700Bold", "600SemiBold": "SpaceGrotesk_600SemiBold",
            "500Medium": "SpaceGrotesk_500Medium"}[weight]
    return ImageFont.truetype(os.path.join(ROOT, "node_modules/@expo-google-fonts/space-grotesk",
                                           weight, name + ".ttf"), size)


def manrope(weight, size):
    name = {"500Medium": "Manrope_500Medium", "700Bold": "Manrope_700Bold"}[weight]
    return ImageFont.truetype(os.path.join(ROOT, "node_modules/@expo-google-fonts/manrope",
                                           weight, name + ".ttf"), size)


def draw_mark(size, color, scale=1.0, stroke=9.0, dot_r=14.0, center_shift=(0, 0)):
    """Orbit Mark on a transparent size x size RGBA layer."""
    big = size * SS
    layer = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    u = big / 200.0

    def pt(p):
        # scale around the 200-grid center so `scale` grows the whole mark
        x = 100 + (p[0] - 100) * scale + center_shift[0]
        y = 100 + (p[1] - 100) * scale + center_shift[1]
        return x * u, y * u

    cx, cy = pt(RING_C)
    r = RING_R * scale * u
    w = stroke * scale * u
    d.ellipse([cx - r - w / 2, cy - r - w / 2, cx + r + w / 2, cy + r + w / 2], fill=color + (255,))
    d.ellipse([cx - r + w / 2, cy - r + w / 2, cx + r - w / 2, cy + r - w / 2], fill=(0, 0, 0, 0))
    kx, ky = pt(COMET)
    kr = dot_r * scale * u
    d.ellipse([kx - kr, ky - kr, kx + kr, ky + kr], fill=color + (255,))
    return layer.resize((size, size), Image.LANCZOS)


def gradient_tile(size, c0, c1):
    """135deg linear gradient, opaque RGB."""
    y, x = np.mgrid[0:size, 0:size].astype(np.float32)
    t = (x + y) / (2.0 * (size - 1))
    arr = np.stack([c0[i] + (c1[i] - c0[i]) * t for i in range(3)], axis=-1)
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8), "RGB")


def icon_tile(size, mark_scale=1.0, stroke=9.0, dot_r=14.0, shift=(0, 0)):
    tile = gradient_tile(size, SAGE, SAGE_DEEP)
    mark = draw_mark(size, INK, mark_scale, stroke, dot_r, shift)
    tile.paste(mark, (0, 0), mark)
    return tile


def rounded(img, radius_frac=0.225):
    size = img.size[0]
    mask = Image.new("L", (size * SS, size * SS), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size * SS - 1, size * SS - 1],
                                           radius=int(size * SS * radius_frac), fill=255)
    mask = mask.resize((size, size), Image.LANCZOS)
    out = img.convert("RGBA")
    out.putalpha(mask)
    return out


def bloom(width, height, blobs, seed=7):
    """Dark-teal ground with soft radial light blooms. blobs: (cx, cy, diameter, rgb, alpha) in 0-1 units of width."""
    y, x = np.mgrid[0:height, 0:width].astype(np.float32)
    canvas = np.zeros((height, width, 3), np.float32) + np.array(DEEP, np.float32)
    for cx, cy, dia, rgb, alpha in blobs:
        px, py, pd = cx * width, cy * width, dia * width
        dist = np.sqrt((x - px) ** 2 + (y - py) ** 2)
        radius = pd * 0.46
        t = np.clip(1 - dist / radius, 0, 1)
        a = (t * t * (3 - 2 * t)) * alpha
        canvas = canvas * (1 - a[..., None]) + np.array(rgb, np.float32) * a[..., None]
    rng = np.random.default_rng(seed)
    canvas += rng.uniform(-1.2, 1.2, canvas.shape)  # dither to avoid banding
    return Image.fromarray(canvas.clip(0, 255).astype(np.uint8), "RGB")


# Phone-layout blooms (coordinates from the approved Deep Teal glass mockup, 390pt wide)
PHONE_BLOBS = [
    (310 / 390, 100 / 390, 340 / 390, SAGE, 0.50),
    (50 / 390, 440 / 390, 320 / 390, TEAL, 0.42),
    (290 / 390, 710 / 390, 340 / 390, SKY, 0.32),
    (150 / 390, 830 / 390, 260 / 390, SAGE, 0.30),
]


def save(img, *parts, **kw):
    path = os.path.join(*parts)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, **kw)
    print("wrote", os.path.relpath(path, os.path.dirname(ROOT)))


def main():
    # ---- iOS / app icon (1024, opaque, no alpha) ----
    icon = icon_tile(1024)
    save(icon, ASSETS, "icon.png")

    # ---- Android adaptive icon foreground (transparent) + background color set in app.json ----
    save(draw_mark(1024, INK), ASSETS, "adaptive-icon.png")

    # ---- Notification icon (Android: white on transparent) ----
    save(draw_mark(192, (255, 255, 255), 1.15, 11, 16), ASSETS, "notification-icon.png")

    # ---- Favicon 48 (bolder mark for tiny sizes) ----
    fav = rounded(icon_tile(192, 1.35, 12, 17), 0.22).resize((48, 48), Image.LANCZOS)
    save(fav, ASSETS, "favicon.png")

    # ---- In-app glass background ----
    bg = bloom(780, 1688, PHONE_BLOBS)
    save(bg, ASSETS, "bg-bloom.jpg", quality=90, optimize=True)

    # ---- Splash (1284x2778): bloom ground + rounded icon tile ----
    sw, sh = 1284, 2778
    splash = bloom(sw, sh, PHONE_BLOBS, seed=11).convert("RGBA")
    tile_size = 380
    tile = rounded(icon_tile(tile_size * 2), 0.225).resize((tile_size, tile_size), Image.LANCZOS)
    shadow = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        [(sw - tile_size) // 2, (sh - tile_size) // 2 + 24, (sw + tile_size) // 2, (sh + tile_size) // 2 + 24],
        radius=int(tile_size * 0.225), fill=(0, 0, 0, 90))
    shadow = shadow.filter(ImageFilter.GaussianBlur(28))
    splash = Image.alpha_composite(splash, shadow)
    splash.paste(tile, ((sw - tile_size) // 2, (sh - tile_size) // 2), tile)
    save(splash.convert("RGB"), ASSETS, "splash.png", optimize=True)

    # ---- Web (whyrl.app) ----
    if os.path.isdir(SITE):
        save(icon_tile(360, 1.0, 9, 14).resize((180, 180), Image.LANCZOS), SITE, "apple-touch-icon.png")
        f32 = rounded(icon_tile(256, 1.35, 12, 17), 0.22).resize((32, 32), Image.LANCZOS)
        f16 = rounded(icon_tile(256, 1.4, 13, 18), 0.22).resize((16, 16), Image.LANCZOS)
        f48 = rounded(icon_tile(256, 1.35, 12, 17), 0.22).resize((48, 48), Image.LANCZOS)
        save(f32, SITE, "favicon-32.png")
        save(f16, SITE, "favicon-16.png")
        f48.save(os.path.join(SITE, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)],
                 append_images=[f16, f32])
        print("wrote whyrl-site/favicon.ico")

        # Open Graph card 1200x630
        ow, oh = 1200, 630
        og = bloom(ow, oh, [
            (0.86, 0.10, 0.55, SAGE, 0.50),
            (0.05, 0.62, 0.50, TEAL, 0.42),
            (0.60, 1.00, 0.55, SKY, 0.30),
        ], seed=3).convert("RGBA")
        panel = Image.new("RGBA", (ow, oh), (0, 0, 0, 0))
        pd = ImageDraw.Draw(panel)
        pd.rounded_rectangle([64, 64, ow - 64, oh - 64], radius=40,
                             fill=(255, 255, 255, 20), outline=(255, 255, 255, 46), width=2)
        pd.line([(104, 65), (ow - 104, 65)], fill=(255, 255, 255, 70), width=2)
        og = Image.alpha_composite(og, panel)
        t = 200
        mark_tile = rounded(icon_tile(t * 2), 0.225).resize((t, t), Image.LANCZOS)
        og.paste(mark_tile, (120, 120), mark_tile)
        d = ImageDraw.Draw(og)
        x = 356
        for ch in "WHYRL":
            d.text((x, 150), ch, font=sg("700Bold", 84), fill=(234, 246, 242))
            x += d.textlength(ch, font=sg("700Bold", 84)) + 14
        d.text((356, 262), "AI-POWERED NEWS DIGEST", font=sg("600SemiBold", 24), fill=SAGE)
        head = sg("700Bold", 72)
        d.text((120, 380), "Trending news,", font=head, fill=(234, 246, 242))
        d.text((120, 462), "summarized by AI.", font=head, fill=SAGE)
        save(og.convert("RGB"), SITE, "og-image.png", optimize=True)
    else:
        print("whyrl-site not found at", SITE, "- skipped web assets")


if __name__ == "__main__":
    main()
