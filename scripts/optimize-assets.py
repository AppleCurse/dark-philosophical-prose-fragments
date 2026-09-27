"""
Görsel optimizasyon ve üretim hattı (Pillow tabanlı, platformlar arası).
Kullanım: python scripts/optimize-assets.py
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets-src")
OUT = os.path.join(ROOT, "src", "assets", "opt")
PUB = os.path.join(ROOT, "public")

os.makedirs(OUT, exist_ok=True)

# 1. Angel 4 panels
angel_path = os.path.join(SRC, "angel_4panels.webp")
if os.path.exists(angel_path):
    p4 = Image.open(angel_path)
    boxes = [
        ("ek-masumiyet.webp", (44, 44, 514, 735)),
        ("ek-koken.webp", (576, 44, 1050, 735)),
        ("ek-cakilis.webp", (1114, 44, 1588, 735)),
        ("ek-yangin.webp", (1658, 44, 2128, 735)),
    ]
    for name, box in boxes:
        panel = p4.crop(box)
        target_h = int(panel.height * (420 / panel.width))
        resized = panel.resize((420, target_h), Image.Resampling.LANCZOS)
        resized.save(os.path.join(OUT, name), "WEBP", quality=84)
        print(f"✓ {name:18} {resized.size}")

# 2. Hero portrait
throne_path = os.path.join(SRC, "salim_throne_portrait.png")
if os.path.exists(throne_path):
    throne = Image.open(throne_path)
    th_h = int(throne.height * (1000 / throne.width))
    throne_resized = throne.resize((1000, th_h), Image.Resampling.LANCZOS)
    throne_resized.save(os.path.join(OUT, "hero.webp"), "WEBP", quality=84)
    print(f"✓ {'hero.webp':18} {throne_resized.size}")

    # apple-touch-icon
    w, h = throne_resized.size
    top_crop = throne_resized.crop((0, int(h * 0.08), w, int(h * 0.08) + w))
    icon = top_crop.resize((180, 180), Image.Resampling.LANCZOS)
    icon.save(os.path.join(PUB, "apple-touch-icon.png"), "PNG")
    print(f"✓ apple-touch-icon.png (180x180)")

# 3. Standing wings
standing_path = os.path.join(SRC, "salim_standing_wings.jpg")
if os.path.exists(standing_path):
    standing = Image.open(standing_path)
    # yeniden-insa (1100w)
    st_h1 = int(standing.height * (1100 / standing.width))
    standing.resize((1100, st_h1), Image.Resampling.LANCZOS).save(os.path.join(OUT, "yeniden-insa.webp"), "WEBP", quality=82)
    print(f"✓ {'yeniden-insa.webp':18} (1100, {st_h1})")
    # sofra (1600w)
    st_h2 = int(standing.height * (1600 / standing.width))
    standing.resize((1600, st_h2), Image.Resampling.LANCZOS).save(os.path.join(OUT, "sofra.webp"), "WEBP", quality=80)
    print(f"✓ {'sofra.webp':18} (1600, {st_h2})")

    # og.png (1200x630)
    bg_w, bg_h = standing.size
    target_ratio = 1200 / 630
    if bg_w / bg_h > target_ratio:
        new_h = 630
        new_w = int(bg_w * (630 / bg_h))
    else:
        new_w = 1200
        new_h = int(bg_h * (1200 / bg_w))
    resized_bg = standing.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = (new_w - 1200) // 2
    top = (new_h - 630) // 3
    og = resized_bg.crop((left, top, left + 1200, top + 630))
    og_quant = og.quantize(colors=256, method=Image.Resampling.LANCZOS)
    og_quant.save(os.path.join(PUB, "og.png"), "PNG", optimize=True)
    print(f"✓ og.png (1200x630)")

# 4. Sparks wings
sparks_path = os.path.join(SRC, "salim_sparks_wings.jpeg")
if os.path.exists(sparks_path):
    sparks = Image.open(sparks_path)
    for name, w, q in [
        ("yatak.webp", 1200, 82),
        ("kuzgun.webp", 1300, 82),
        ("toprak.webp", 1600, 80),
        ("hero-bg.webp", 1400, 78),
    ]:
        th = int(sparks.height * (w / sparks.width))
        sparks.resize((w, th), Image.Resampling.LANCZOS).save(os.path.join(OUT, name), "WEBP", quality=q)
        print(f"✓ {name:18} ({w}, {th})")

print("\n— Tüm üretim görselleri hazırlandı ve src/assets/opt/ altına kaydedildi.")
