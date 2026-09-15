/**
 * Sosyal önizleme kartı (1200×630) + apple-touch-icon üretimi.
 * Kullanım: node scripts/make-og.mjs   (ImageMagick gerekir)
 *
 * Not: kartta kasıtlı olarak küfürlü satır YOK — Meta'da hem creative hem
 * landing page metninde küfür reklam yasağı sebebi (docs/AUDIT.md §3.3).
 * Marka fontu (Cinzel) sandbox'ta olmadığı için DejaVu Serif kullanılıyor;
 * tasarımcıysan Figma/Canva şablonuyla değiştirebilirsin: public/og.png.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const IM = (args) => execFileSync("convert", args, { stdio: "inherit" });
const serif = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf";
const mono = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf";
const src = existsSync(serif) ? serif : "";

if (!existsSync("src/assets/opt/hero-bg.webp")) {
  console.warn("⚠ önce `node scripts/optimize-assets.mjs` (hero-bg.webp gerekiyor)");
  process.exit(0);
}

const W = 1200, H = 630;
IM(["-size", `${W}x${H}`, "src/assets/opt/hero-bg.webp", "-resize", `${W}x${H}^`, "-gravity", "center", "-extent", `${W}x${H}`,
    "-colorspace", "Gray", "-blur", "0x1.5", "-brightness-contrast", "-18x12", "/tmp/og-bg.png"]);
IM(["-size", `${W}x${H}`, "gradient:none-#040405", "-channel", "A", "-evaluate", "Multiply", "0.72", "+channel", "/tmp/og-shade.png"]);
IM(["/tmp/og-bg.png", "/tmp/og-shade.png", "-compose", "overlay", "-composite",
    "-gravity", "West", "-size", `${W / 2}x${H}`, "gradient:#040405-#04040500", "-compose", "dst-over", "-composite",
    "/tmp/og-base.png"]);

const draw = [
  "-gravity", "West", "-fill", "#ece9e2",
  ...(src ? ["-font", src] : []), "-pointsize", "88", "-annotate", "+84-70", "BEN PRENSİP",
  "-pointsize", "30", "-fill", "#b9b9b9", "-annotate", "+86+10", "Salim Gümüş · Vesika No: 01",
  "-pointsize", "25", "-fill", "#9a9a9a", ...(src ? ["-font", src] : []), "-annotate", "+86+110", "“Meleklerle aynı notaya susmam.”",
];
IM(["/tmp/og-base.png", "-strip", "-draw", "line 86,44 240,44", "-draw", "line 86,146 300,146",
    ...(src ? ["-font", mono] : []), "-pointsize", "19", "-fill", "#6f6f6f",
    "-gravity", "SouthWest", "-annotate", "+86+46", "VESİKA · DÖRT BÖLÜM · MMXXVI",
    ...draw, "-quality", "72", "-colors", "128", "-define", "png:compression-level=9", "public/og.png"]);

// apple-touch-icon (180×180, kare kırpım)
IM(["src/assets/opt/hero.webp", "-resize", "180x180^", "-gravity", "north", "-extent", "180x180",
    "-colorspace", "Gray", "-brightness-contrast", "-10x8", "public/apple-touch-icon.png"]);

console.log("✓ public/og.png, public/apple-touch-icon.png");
