/**
 * Görsel optimizasyon hattı.
 *
 *   node scripts/optimize-assets.mjs            # kaynaklar varsa src/assets/opt/ altına üretir
 *   ASSETS_SRC=/yol/kaynaklar node scripts/optimize-assets.mjs
 *
 * Neden bu kadar agresif: sayfanın tamamı CSS ile grayscale + contrast filtresinden
 * geçiyor, yani renkte hiçbir bilgi taşınmıyor. Görselleri üretimde griye çevirmek,
 * 8,35 MB'lık görsel yükünü ~0,7 MB'a indiriyor (kalibre ölçüm: docs/AUDIT.md §2.1).
 *
 * Gerekli: ImageMagick (`convert`). Yoksa script uyarı verip çıkıyor; repoda zaten
 * üretilmiş dosyalar duruyor, build bundan bağımsız.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";

/* ham kareler repoda tutulmaz (9,5 MB); buraya koy, yeniden üret. */
const SRC = process.env.ASSETS_SRC ?? "assets-src";
const OUT = "src/assets/opt";
const GR_OUT = "src/assets";

const ITEMS = [
  ["salim_portrait_feather.jpg", "hero.webp", 1000, 80, null],
  ["salim_portrait_feather.jpg", "hero-bg.webp", 1400, 74, "16:9"],
  ["salim_fall_flame.jpg", "ek-yangin.webp", 420, 76, null],
  ["salim_fall_abyss.jpg", "ek-cakilis.webp", 420, 76, null],
  ["salim_angel_pure.webp", "ek-koken.webp", 420, 76, null],
  ["salim_fall_sky.webp", "ek-masumiyet.webp", 420, 76, null],
  ["salim_fall_ground.jpg", "yeniden-insa.webp", 1100, 78, null],
  ["bed.jpg", "yatak.webp", 1200, 78, null],
  ["soil.jpg", "toprak.webp", 1600, 74, null],
  ["table.jpg", "sofra.webp", 1600, 74, null],
  ["salim_dark_raven.jpg", "kuzgun.webp", 1300, 78, null],
].map(([file, out, w, q, mode, frame]) => ({ file: path.join(SRC, file), out, w, q, mode, frame }));

/**
 * mode söz dizimi: "W:H[@gravity]"  →  "16:9", "3:4@north", "1:1@center"
 *   gravity yoksa "north": yüz kadrajlarında baş yukarıda kalır.
 * frame: hareketli kaynaklar (GIF) için kare indeksi ya da aralığı.
 *   0  → ilk kare (donmuş an) · "0-27" → aralık (hareketli webp için).
 *   Yoksa kaynak olduğu gibi okunur (JPG/WebP).
 */

function has(name) {
  try {
    execFileSync(name, ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

if (!has("convert")) {
  console.warn("⚠ ImageMagick bulunamadı; `convert` kurulu değil. Optimizasyon atlandı.");
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });

let total = 0;
for (const { file, out, w, q, mode } of ITEMS) {
  const dst = path.join(OUT, out);
  if (!existsSync(file)) {
    console.warn(`⚠ kaynak yok: ${file} (atlandı)`);
    continue;
  }
  // GIF karesi / aralığı: yolun kendisine köşeli parantezle eklenir (IM söz dizimi)
  const src = frame === undefined ? file : `${file}[${frame}]`;
  const args = [src];
  if (mode) {
    const [ratio, gravity = "north"] = mode.split("@");
    const [rw, rh] = ratio.split(":").map(Number);
    const h = Math.round((w * rh) / rw);
    // önce hedefi doldur, sonra gravity yönünden kırp — kadraj BİLİNÇLİ, object-cover'a bırakılmaz
    args.push("-resize", `${w}x${h}^`, "-gravity", gravity, "-extent", `${w}x${h}`);
  } else {
    args.push("-resize", `${w}x`);
  }
  args.push("-colorspace", "Gray", "-quality", String(q), "-define", "webp:method=6", dst);
  execFileSync("convert", args, { stdio: "ignore" });
  const kb = (statSync(dst).size / 1024).toFixed(0);
  total += Number(kb);
  console.log(`✓ ${out.padEnd(18)} ${kb.padStart(5)} KB`);
}
// film grain: küçük, alfa'lı döşeme (CSS'te background-repeat ile kullanılır)
const grain = path.join(GR_OUT, "grain.png");
try {
  execFileSync("convert", [
    // plasma:fractal deterministik DEGIL: her çalışmada başka bayt üretir ve
    // commit'li grain.png'i "değişmiş" gösterir (negatif testte kanıtlandı:
    // iki çalışmada md5 farklı, -seed ile birebir aynı). Sabit tohum = yeniden
    // üretilebilir varlık.
    "-seed", "20260922",
    "-size", "256x256", "plasma:fractal", "-colorspace", "Gray",
    "-level", "30%,70%,70%", "-blur", "0x0.4",
    "-alpha", "set", "-channel", "Alpha", "-evaluate", "Multiply", "0.14", "+channel",
    "-colors", "16", "-depth", "8",
    "-strip", "-define", "png:compression-level=9", "-define", "png:compression-filter=5", grain,
  ], { stdio: "ignore" });
  console.log(`✓ grain.png            ${(statSync(grain).size / 1024).toFixed(1)} KB`);
} catch {
  console.warn("⚠ grain üretilemedi (plasma desteği yok mu?) — CSS'teki SVG filtresi çalışmaya devam eder");
}

console.log(`— toplam: ${(total / 1024).toFixed(2)} MB`);
