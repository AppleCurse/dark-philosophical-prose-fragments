"""
Görsel ve video optimizasyon ve üretim hattı (Pillow + ffmpeg tabanlı).
Kullanım: python scripts/optimize-assets.py
"""
import os, subprocess
from PIL import Image

try:
    import imageio_ffmpeg
    FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FFMPEG = "ffmpeg"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets-src")
OUT = os.path.join(ROOT, "src", "assets", "opt")
PUB = os.path.join(ROOT, "public")
PUB_VIDEOS = os.path.join(PUB, "videos")

os.makedirs(OUT, exist_ok=True)
os.makedirs(PUB_VIDEOS, exist_ok=True)

# 1. BEYAZ ARINMIŞ — 4 Panel Melek
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
        print(f"[ok] {name:18} {resized.size}")

# 2. SİYAH KİRLENMİŞ — Devasa Siyah Kanatlar (Önden ve Profil)
black_front = os.path.join(SRC, "salim_black_front.png")
if os.path.exists(black_front):
    im_bf = Image.open(black_front).convert("RGB")
    bw, bh = im_bf.size
    im_bf.resize((1400, int(1400 * bh / bw)), Image.Resampling.LANCZOS).save(
        os.path.join(OUT, "siyah-on.webp"), "WEBP", quality=82
    )
    # Dikey odak (900w)
    left = int(bw * 0.15)
    right = int(bw * 0.85)
    crop_bf = im_bf.crop((left, 0, right, bh))
    cw, ch = crop_bf.size
    crop_bf.resize((900, int(900 * ch / cw)), Image.Resampling.LANCZOS).save(
        os.path.join(OUT, "siyah-dikey.webp"), "WEBP", quality=82
    )
    print("[ok] siyah-on.webp & siyah-dikey.webp")

black_profile = os.path.join(SRC, "salim_black_profile.png")
if os.path.exists(black_profile):
    im_bp = Image.open(black_profile).convert("RGB")
    pw, ph = im_bp.size
    im_bp.resize((1400, int(1400 * ph / pw)), Image.Resampling.LANCZOS).save(
        os.path.join(OUT, "siyah-profil.webp"), "WEBP", quality=82
    )
    print("[ok] siyah-profil.webp")

# 3. KIRMIZI YANMIŞ — Taht ve Kıvılcımlar (ft.jpg KULLANILMAZ)
throne_path = os.path.join(SRC, "salim_throne_portrait.png")
if os.path.exists(throne_path):
    throne = Image.open(throne_path)
    th_h = int(throne.height * (1000 / throne.width))
    throne_resized = throne.resize((1000, th_h), Image.Resampling.LANCZOS)
    throne_resized.save(os.path.join(OUT, "hero.webp"), "WEBP", quality=84)
    throne_resized.save(os.path.join(OUT, "kirmizi-taht.webp"), "WEBP", quality=84)
    print("[ok] hero.webp & kirmizi-taht.webp")

    # apple-touch-icon
    w, h = throne_resized.size
    top_crop = throne_resized.crop((0, int(h * 0.08), w, int(h * 0.08) + w))
    icon = top_crop.resize((180, 180), Image.Resampling.LANCZOS)
    icon.save(os.path.join(PUB, "apple-touch-icon.png"), "PNG")
    print("[ok] apple-touch-icon.png (180x180)")

sparks_path = os.path.join(SRC, "salim_sparks_wings.jpeg")
if os.path.exists(sparks_path):
    sparks = Image.open(sparks_path)
    sw, sh = sparks.size
    sparks.resize((1400, int(1400 * sh / sw)), Image.Resampling.LANCZOS).save(
        os.path.join(OUT, "kirmizi-kivilcim.webp"), "WEBP", quality=82
    )
    sparks.resize((1400, int(1400 * sh / sw)), Image.Resampling.LANCZOS).save(
        os.path.join(OUT, "hero-bg.webp"), "WEBP", quality=80
    )
    print("[ok] kirmizi-kivilcim.webp & hero-bg.webp")

    # og.png (1200x630)
    target_ratio = 1200 / 630
    if sw / sh > target_ratio:
        new_h = 630
        new_w = int(sw * (630 / sh))
    else:
        new_w = 1200
        new_h = int(sh * (1200 / sw))
    resized_sp = sparks.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = (new_w - 1200) // 2
    top = (new_h - 630) // 3
    og = resized_sp.crop((left, top, left + 1200, top + 630))
    og_quant = og.quantize(colors=256, method=Image.Resampling.LANCZOS)
    og_quant.save(os.path.join(PUB, "og.png"), "PNG", optimize=True)
    print("[ok] og.png (1200x630)")

# 4. HAREKETLİ KAYITLAR — Web MP4 Videoları
v1_src = os.path.join(SRC, "video-arinma.mp4")
v1_dst = os.path.join(PUB_VIDEOS, "video-arinma.mp4")
v1_pos = os.path.join(PUB_VIDEOS, "video-arinma-poster.webp")
if os.path.exists(v1_src):
    subprocess.run([
        FFMPEG, "-y", "-i", v1_src,
        "-vf", "scale=540:540",
        "-c:v", "libx264", "-crf", "28", "-preset", "slow",
        "-an", "-movflags", "+faststart", v1_dst
    ], check=True)
    subprocess.run([FFMPEG, "-y", "-ss", "00:00:01.000", "-i", v1_dst, "-vframes", "1", "-q:v", "80", v1_pos], check=True)
    print("[ok] video-arinma.mp4 & poster")

v2_src = os.path.join(SRC, "video-cakilis.mp4")
v2_dst = os.path.join(PUB_VIDEOS, "video-cakilis.mp4")
v2_pos = os.path.join(PUB_VIDEOS, "video-cakilis-poster.webp")
if os.path.exists(v2_src):
    subprocess.run([
        FFMPEG, "-y", "-i", v2_src,
        "-vf", "scale=720:480",
        "-c:v", "libx264", "-crf", "28", "-preset", "slow",
        "-an", "-movflags", "+faststart", v2_dst
    ], check=True)
    subprocess.run([FFMPEG, "-y", "-ss", "00:00:01.000", "-i", v2_dst, "-vframes", "1", "-q:v", "80", v2_pos], check=True)
    print("[ok] video-cakilis.mp4 & poster")

print("\nOK: Tum uretim gorselleri ve videolari hazirlandi.")
