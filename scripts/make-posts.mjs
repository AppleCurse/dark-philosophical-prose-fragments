/**
 * Aynı veri dosyasından (src/content.ts) sosyal gönderi seti üretir.
 *
 *   node scripts/make-posts.mjs            → posts/vesika-01.md (metin seti)
 *   node scripts/make-posts.mjs --cards    → posts/cards/*.png (1080×1350 kartlar, ImageMagick)
 *
 * Neden: sitede duran her cümle zaten bir carousel kapağı. Metni veriye
 * çıkardığımız için gönderi üretimi "yeni içerik yazmak" değil, dönüştürmek.
 * Marka güvenliği: üretim hattı varsayılan olarak TEMİZ metni kullanır
 * (vesika.ink.clean); çıplak satır yalnızca sitede kalır — docs/AUDIT.md §3.3.
 */
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "posts");
const CARDS = path.join(OUT, "cards");
const wantCards = process.argv.includes("--cards");

const { vesika, site, manifestText } = await import(pathToFile());

function pathToFile() {
  // Node 22+ type-stripping: .ts dosyasını doğrudan import edebiliyoruz.
  return path.join(ROOT, "src/content.ts");
}

const clean = (s = "") => s.replace(/[*~]/g, "").replace(/\s+/g, " ").trim();
const brand = `${site.person} · Vesika No: ${vesika.no}`;

const slides = [];
for (const c of vesika.chapters) {
  const cover = [c.big, c.strike, c.lead].filter(Boolean).map(clean);
  const body = (c.lines ?? []).map((l) => clean(l.t));
  const duel = (c.duel ?? []).map((d) => `O ${clean(d.devil)} — Ben ${clean(d.me)}`);
  slides.push({
    id: c.id,
    num: c.num,
    title: c.title,
    latin: c.latin ?? "",
    cover,
    duel,
    body,
    note: c.note ?? "",
    image: c.image?.img.src.replace("./assets/opt/", "src/assets/opt/") ?? c.fullBleed?.src.replace("./assets/opt/", "src/assets/opt/"),
    copy: clean(c.copy ?? ""),
  });
}

let md = `# ${site.title} — gönderi seti\n\n`;
md += `> Üretim: scripts/make-posts.mjs · kaynak: src/content.ts · tarih: ${new Date().toISOString().slice(0, 10)}\n`;
md += `> Kural: altyazılarda çıplak satır kullanılmaz (reklam/öneri politikası). Site hariç.\n\n`;
md += `## Hesap bio (150 krk)\n\n\`\`\`\n${site.person} — ${site.brand} No: ${vesika.no}\nKorkunun kaynağını ortadan kaldırırım.\nManifesto + arşiv ↓\n${site.url}\n\`\`\`\n\n`;
md += `## Manifesto (düz metin — altyazı/erişim kolaylığı için)\n\n\`\`\`\n${manifestText(vesika)}\n\`\`\`\n\n`;
md += `## 30 günlük ritim\n\n- Haftada 3: 2 carousel + 1 kısa dikey video (7–12 sn, tek plan, sessiz ya da tek nota)\n- Günde 1 Story: atölye/ham kare (gerçek fotoğraf — orijinallik sinyali)\n- Ayda 1 yeni Vesika: siteye arşiv girdisi + bio linki güncellemesi\n\n| Ölçüm | Hedef |\n|---|---|\n| sends/reach | > %1,5 |\n| saves/reach | > %3 |\n| profil → site tıklaması | > %12 |\n| LCP (mobil) | < 2,5 sn |\n\n`;
md += `## Gönderiler\n\n`;

slides.forEach((s, i) => {
  md += `### G${i + 1} · ${s.num}. ${s.title}\n\n`;
  md += `**Biçim:** Carousel (${1 + s.cover.length + Math.min(3, s.body.length)} slayt) · **Kapak metni:** ${s.cover[0] ?? s.title}\n\n`;
  md += `**Slaytlar**\n\n`;
  md += `1. ${s.cover.join(" ") || s.title}\n`;
  s.duel.slice(0, 3).forEach((d, j) => (md += `${j + 2}. ${d}\n`));
  s.body.slice(0, 2).forEach((b, j) => (md += `${s.duel.length + j + 2}. ${b}\n`));
  md += `\n**Altyazı (temiz)**\n\n> ${s.copy || s.cover[0] || s.title}\n> ${brand}${s.note ? ` · ${s.note}` : ""}\n\n`;
  md += `**İlk yorum:** Tam metin tek sayfalık arşivde — ${site.url}\n\n`;
  md += `**Hashtag (5):** #manifasto #karanlıkyazı #şiir #düşünce #${site.person.toLocaleLowerCase("tr").replace(/[^a-z0-9]/g, "")}\n\n---\n\n`;
});

mkdirSync(OUT, { recursive: true });
writeFileSync(path.join(OUT, "vesika-01.md"), md);
console.log(`✓ posts/vesika-01.md (${slides.length} gönderi, ${(md.length / 1024).toFixed(1)} KB)`);

if (wantCards) {
  mkdirSync(CARDS, { recursive: true });
  const serif = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf";
  const mono = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf";
  const W = 1080, H = 1350;
  slides.forEach((s, i) => {
    const bg = existsSync(path.join(ROOT, s.image ?? "")) ? path.join(ROOT, s.image) : "src/assets/opt/hero-bg.webp";
    const text = (s.cover[0] || s.title).slice(0, 90);
    execFileSync("convert", [
      bg, "-resize", `${W}x${H}^`, "-gravity", "north", "-extent", `${W}x${H}`,
      "-colorspace", "Gray", "-brightness-contrast", "-20x10",
      "-gravity", "center", "-background", "#05050680", "-annotate", "+0+0", " ",
      ...(existsSync(serif) ? ["-font", serif] : []), "-pointsize", "64", "-fill", "#ece9e2",
      "-gravity", "SouthWest", "-annotate", "+72+210", text,
      ...(existsSync(mono) ? ["-font", mono] : []), "-pointsize", "24", "-fill", "#8a8a8a",
      "-annotate", "+72+150", `${s.num}. ${s.title.toUpperCase("tr")}`,
      "-annotate", "+72+108", brand.toUpperCase("tr"),
      "-strip", path.join(CARDS, `${String(i + 1).padStart(2, "0")}-${s.id}.png`),
    ]);
    console.log(`✓ kart ${i + 1}`);
  });
  console.log(`— ${CARDS}`);
}
