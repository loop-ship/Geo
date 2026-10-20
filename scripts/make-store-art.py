"""Renders the store icon + splash source images in assets/ from earth_day.jpg.

@capacitor/assets (npm run assets) then slices these into every iOS/Android size. Re-run this only if
the look should change; the outputs are committed. Orthographic view centred on the Americas, matching
the existing icon-512.png, but rendered at full resolution (the stores require a 1024px icon).
Usage: python3 scripts/make-store-art.py
"""
import numpy as np
from PIL import Image
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BG = (5, 8, 13)                      # --bg in geo.html
tex = np.asarray(Image.open(ROOT / 'earth_day.jpg').convert('RGB')).astype(np.float32)
TH, TW = tex.shape[:2]
LAT0, LON0 = np.radians(12.0), np.radians(-62.0)

def globe(size, diameter_frac, ss=2):
    n = size * ss
    r = n * diameter_frac / 2
    y, x = np.mgrid[0:n, 0:n].astype(np.float32) + 0.5
    x = (x - n / 2) / r; y = (n / 2 - y) / r
    rho2 = x * x + y * y
    inside = rho2 <= 1.0
    z = np.sqrt(np.clip(1 - rho2, 0, 1))
    # inverse orthographic projection
    lat = np.arcsin(np.clip(y * np.cos(LAT0) + z * np.sin(LAT0), -1, 1))
    lon = LON0 + np.arctan2(x, z * np.cos(LAT0) - y * np.sin(LAT0))
    u = ((lon / (2 * np.pi) + 0.5) % 1.0) * (TW - 1)
    v = (0.5 - lat / np.pi) * (TH - 1)
    rgb = tex[v.astype(int), u.astype(int)]
    shade = (0.55 + 0.45 * z)[..., None]           # gentle limb darkening so it reads as a sphere
    rgb = rgb * shade
    rim = np.clip((rho2 - 0.93) / 0.07, 0, 1)[..., None] * inside[..., None]
    rgb = rgb * (1 - 0.35 * rim) + np.array([86, 196, 222]) * 0.35 * rim   # thin cyan atmosphere (--cyan)
    alpha = inside.astype(np.float32)
    img = np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8)
    return Image.fromarray(img, 'RGBA').resize((size, size), Image.LANCZOS)

def on_bg(fg, size):
    base = Image.new('RGBA', (size, size), BG + (255,))
    off = (size - fg.width) // 2
    base.alpha_composite(fg, (off, off))
    return base.convert('RGB')        # App Store rejects icons with an alpha channel

out = ROOT / 'assets'
out.mkdir(exist_ok=True)
on_bg(globe(1024, 0.86), 1024).save(out / 'icon-only.png')
# Android adaptive icon: launchers crop to a circle/squircle inside the central ~66%
globe(1024, 0.62).save(out / 'icon-foreground.png')
Image.new('RGB', (1024, 1024), BG).save(out / 'icon-background.png')
for name in ('splash.png', 'splash-dark.png'):
    on_bg(globe(1100, 1.0), 2732).save(out / name)
print('wrote', sorted(p.name for p in out.iterdir()))
