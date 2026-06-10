"""Generate the Weather Wardrobe app icon set: a silky blush-to-lavender
gradient with a white coat-hanger glyph. Regenerate with:
    python3 scripts/make_icon.py
"""
import math
from PIL import Image, ImageDraw, ImageFilter

SIZE = 1024
BLUSH = (255, 149, 184)
LAVENDER = (183, 156, 237)
WHITE = (255, 255, 255, 255)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient_bg(size=SIZE):
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        for xx in range(size):
            t = (xx + y) / (2 * size - 2)  # diagonal blend
            px[xx, y] = lerp(BLUSH, LAVENDER, t)
    return img.convert("RGBA")


def sheen(img):
    """Soft radial highlight, upper-left, for the silky feel."""
    overlay = Image.new("L", (SIZE, SIZE), 0)
    d = ImageDraw.Draw(overlay)
    cx, cy, r = 300, 240, 900
    for i in range(r, 0, -6):
        alpha = int(70 * (1 - i / r))
        d.ellipse([cx - i, cy - i, cx + i, cy + i], fill=alpha)
    white = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 255))
    img.paste(white, (0, 0), overlay)
    return img


def hanger(scale=4):
    """White hanger glyph drawn oversized then downsampled (anti-aliasing)."""
    s = SIZE * scale
    layer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    w = 42 * scale

    def L(x):
        return x * scale

    # hook + stem as one smooth polyline: rises from the pivot, then curls
    # counter-clockwise around the hook circle, opening to the lower-right
    hook_pts = [(L(512), L(452)), (L(512), L(382))]
    for ang in range(90, 351, 10):
        a = math.radians(ang)
        hook_pts.append(
            (L(512 + 64 * math.cos(a)), L(318 + 64 * math.sin(a)))
        )
    d.line(hook_pts, fill=WHITE, width=w, joint="curve")
    for p in (hook_pts[0], hook_pts[-1]):
        d.ellipse(
            [p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2], fill=WHITE
        )
    # shoulders + bar
    pts = [(L(512), L(452)), (L(208), L(668)), (L(816), L(668))]
    d.line(pts + [pts[0]], fill=WHITE, width=w, joint="curve")
    for p in pts:
        d.ellipse([p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2], fill=WHITE)
    return layer.resize((SIZE, SIZE), Image.LANCZOS)


def soft_shadow(glyph):
    shadow_img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    alpha = glyph.split()[3].point(lambda a: int(a * 0.30))
    tinted = Image.new("RGBA", (SIZE, SIZE), (99, 70, 160, 255))
    shadow_img.paste(tinted, (0, 14), alpha)
    return shadow_img.filter(ImageFilter.GaussianBlur(18))


icon = sheen(gradient_bg())
glyph = hanger()
icon = Image.alpha_composite(icon, soft_shadow(glyph))
icon = Image.alpha_composite(icon, glyph)
icon = icon.convert("RGB")

icon.save("assets/icon.png")
icon.save("assets/splash-icon.png")
icon.resize((512, 512), Image.LANCZOS).save("public/icons/icon-512.png")
icon.resize((192, 192), Image.LANCZOS).save("public/icons/icon-192.png")
icon.resize((48, 48), Image.LANCZOS).save("assets/favicon.png")

# Android adaptive: glyph-only foreground (with safe-zone padding),
# flat lavender background, white monochrome glyph.
fg = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
small = glyph.resize((640, 640), Image.LANCZOS)
fg.paste(small, ((SIZE - 640) // 2, (SIZE - 640) // 2), small)
fg.save("assets/android-icon-foreground.png")
Image.new("RGB", (SIZE, SIZE), LAVENDER).save("assets/android-icon-background.png")
fg.save("assets/android-icon-monochrome.png")
print("icon set written")
