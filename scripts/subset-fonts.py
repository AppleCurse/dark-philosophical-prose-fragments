#!/usr/bin/env python3
"""
Font alt kümesi (subset) üretimi — repoda ihtiyaç duyulan gliflerin minik hâli.

Neden: Google Fonts'tan 5 aile ~20 stil isteniyordu (render-blocking istek + Cyrillic/
Vietnamese alt kümeleri dahil). Sitede gereken: 4 aile, 5 stil, ~85 glif. Bu script
fontsource paketlerindeki kaynak woff2 dosyalarından `src/fonts/*.woff2` altına
küçük, aynı kaynaklı alt kümeler yazar.

Gereksinim: pip install fonttools brotli   (CI'da gerekmez — çıktı repoda commit'li)
Kullanım:   npm run patch:font
"""

import os
import sys

try:
    from fontTools import subset
    from fontTools.ttLib import TTFont
except ImportError:
    sys.exit(
        "✖ fonttools kurulu değil. Şunu çalıştır:\n"
        "  python3 -m venv .venv && .venv/bin/pip install fonttools brotli\n"
        "  .venv/bin/python scripts/subset-fonts.py"
    )

NODE = "node_modules"
OUT = "src/assets/fonts"
CSS_OUT = "src/fonts.css"

# Site metninde geçen karakterler + tipografik işaretler
CHARS = (
    " .,:;—–…“”’‘\"'()[]{}·✦ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "abcdefghijklmnopqrstuvwxyzÇĞİIŞÖÜçğıoşü0123456789/|*~`^#%&+=<>@"
)

# aile: [(çıktı adı, kaynak yolu, CSS unicode-range, stiller)]
JOBS = [
    ("cinzel-latin.woff2", f"{NODE}/@fontsource-variable/cinzel/files/cinzel-latin-wght-normal.woff2", "U+0020-007E,U+2018-201F,U+2026,U+00B7,U+2726,U+2013-2014"),
    ("cinzel-latin-ext.woff2", f"{NODE}/@fontsource-variable/cinzel/files/cinzel-latin-ext-wght-normal.woff2", "U+0100-017F,U+00A0-00FF"),
    ("cormorant-latin.woff2", f"{NODE}/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-normal.woff2", "U+0020-007E,U+2018-201F,U+2026,U+00B7,U+2726,U+2013-2014"),
    ("cormorant-latin-ext.woff2", f"{NODE}/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-ext-wght-normal.woff2", "U+0100-017F,U+00A0-00FF"),
    ("cormorant-italic.woff2", f"{NODE}/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-italic.woff2", "U+0020-007E,U+2018-201F,U+2026,U+00B7,U+2013-2014"),
    ("cormorant-italic-ext.woff2", f"{NODE}/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-ext-wght-italic.woff2", "U+0100-017F,U+00A0-00FF"),
    ("caveat-400.woff2", f"{NODE}/@fontsource/caveat/files/caveat-latin-400-normal.woff2", "U+0020-007E,U+2018-201F,U+2026,U+00B7,U+2013-2014"),
    ("caveat-400-ext.woff2", f"{NODE}/@fontsource/caveat/files/caveat-latin-ext-400-normal.woff2", "U+0100-017F,U+00A0-00FF"),
    ("jetbrains-400.woff2", f"{NODE}/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2", "U+0020-007E,U+00B7,U+2013-2014,U+2018-201F"),
    ("jetbrains-400-ext.woff2", f"{NODE}/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-ext-400-normal.woff2", "U+0100-017F,U+00A0-00FF"),
    ("jetbrains-600.woff2", f"{NODE}/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-600-normal.woff2", "U+0020-007E,U+00B7,U+2013-2014,U+2018-201F"),
    ("jetbrains-600-ext.woff2", f"{NODE}/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-ext-600-normal.woff2", "U+0100-017F,U+00A0-00FF"),
    # Cinzel'de olmayan İ (U+0130) için tek gliflik yama
    ("cinzel-tr.woff2", f"{NODE}/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-ext-wght-normal.woff2", "U+0130"),
]

if not os.path.isdir(NODE):
    sys.exit("✖ node_modules yok — önce `npm ci`.")

os.makedirs(OUT, exist_ok=True)
opts = subset.Options()
opts.name_IDs = ["*"]
opts.notdef_outline = True
opts.recalc_bounds = True
opts.pinch_glyphs = True

total = 0
css_lines = []
for out_name, src, unicode_range in JOBS:
    if not os.path.exists(src):
        print(f"⚠ kaynak yok: {src}")
        continue
    font = TTFont(src)
    sub = subset.Subsetter(options=opts)
    sub.populate(unicodes=[ord(c) for c in CHARS])
    sub.subset(font)
    if out_name == "cinzel-tr.woff2":
        for name_id, fam in ((1, "Cinzel TR"), (2, "Regular"), (3, "Cinzel TR Regular"), (4, "Cinzel TR"), (6, "CinzelTR")):
            try:
                font["name"].setName(fam, name_id, 3, 1, 0x409)
            except Exception:
                pass
    dst = os.path.join(OUT, out_name)
    font.flavor = "woff2"
    font.save(dst)
    size = os.path.getsize(dst)
    total += size
    print(f"✓ {out_name:26} {size/1024:6.1f} KB")

print(f"— toplam {total/1024:.1f} KB (500+ KB'lık font yükleme yerine)")

# üretilecek CSS'i de yaz: src/index.css bunu @import ile çekiyor
css = ["/* scripts/subset-fonts.py tarafından üretildi — elle düzenlemeyin. */"]
faces = [
    ("Cinzel Variable", "cinzel-latin.woff2", "normal", "400 900", "U+0020-007E,U+2018-201F,U+2026,U+00B7,U+2726,U+2013-2014", True),
    ("Cinzel Variable", "cinzel-latin-ext.woff2", "normal", "400 900", "U+0100-017F,U+00A0-00FF", True),
    ("Cinzel TR", "cinzel-tr.woff2", "normal", "400 900", "U+0130", True),
    ("Cormorant Garamond Variable", "cormorant-latin.woff2", "normal", "300 700", "U+0020-007E,U+2018-201F,U+2026,U+00B7,U+2013-2014", True),
    ("Cormorant Garamond Variable", "cormorant-latin-ext.woff2", "normal", "300 700", "U+0100-017F,U+00A0-00FF", True),
    ("Cormorant Garamond Variable", "cormorant-italic.woff2", "italic", "300 700", "U+0020-007E,U+2018-201F,U+2026,U+00B7,U+2013-2014", True),
    ("Cormorant Garamond Variable", "cormorant-italic-ext.woff2", "italic", "300 700", "U+0100-017F,U+00A0-00FF", True),
    ("Caveat", "caveat-400.woff2", "normal", "400", "U+0020-007E,U+2018-201F,U+2026,U+00B7,U+2013-2014", False),
    ("Caveat", "caveat-400-ext.woff2", "normal", "400", "U+0100-017F,U+00A0-00FF", False),
    ("JetBrains Mono", "jetbrains-400.woff2", "normal", "400", "U+0020-007E,U+00B7,U+2013-2014,U+2018-201F", False),
    ("JetBrains Mono", "jetbrains-400-ext.woff2", "normal", "400", "U+0100-017F,U+00A0-00FF", False),
    ("JetBrains Mono", "jetbrains-600.woff2", "normal", "600", "U+0020-007E,U+00B7,U+2013-2014,U+2018-201F", False),
    ("JetBrains Mono", "jetbrains-600-ext.woff2", "normal", "600", "U+0100-017F,U+00A0-00FF", False),
]
for fam, file, style, weight, urange, variable in faces:
    if not os.path.exists(os.path.join(OUT, file)):
        continue
    fmt = "woff2-variations" if variable else "woff2"
    css.append(
        "\n@font-face {\n"
        f"  font-family: \"{fam}\";\n"
        f"  font-style: {style};\n"
        f"  font-weight: {weight};\n"
        "  font-display: swap;\n"
        f"  src: url(\"./assets/fonts/{file}\") format(\"{fmt}\");\n"
        f"  unicode-range: {urange};\n"
        "}"
    )
open(CSS_OUT, "w", encoding="utf8").write("\n".join(css) + "\n")
print(f"✓ {CSS_OUT} ({len(faces)} @font-face)")
