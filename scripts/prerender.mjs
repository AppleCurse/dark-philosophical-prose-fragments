/**
 * Statik prerender — "SPA sosyal/arama botuna görünmez" sorununun çözümü.
 *
 * Akış:
 *   1) vite build (client)  → dist/assets/index-*.js + index.html (boş #root)
 *   2) vite build (ssr)     → prerender/index.js (App + CSS, hash'li görsel URL'leri)
 *   3) renderToStaticMarkup → manifestonun TAMAMI statik HTML
 *   4) görsel/font URL'lerini göreli (./assets/…) hale çevir → dist/index.html içine yaz
 *   5) CSS'i dist/index.html içine satır içi göm → render-blocking dış istek kalmasın
 *
 * Sonuç: JS'siz tarayıcı ve önizleme çekicileri içeriği görür; React yalnızca
 * [data-island] yuvalarını doldurur (src/main.tsx).
 */
import { build } from "vite";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");
const SSR_DIR = path.join(ROOT, "prerender");
const DIST = path.join(ROOT, "dist");
const BASE = "/dark-philosophical-prose-fragments/";

const log = (...a) => console.log("·", ...a);

/* 1) client build */
await build({ root: ROOT, mode: "production", logLevel: "warn" });
log("client build bitti");

/* 2) ssr build */
rmSync(SSR_DIR, { recursive: true, force: true });
await build({
  root: ROOT,
  mode: "production",
  logLevel: "warn",
  build: {
    ssr: true,
    outDir: "prerender",
    emptyOutDir: true,
    rollupOptions: { input: path.join(ROOT, "src/prerender-entry.tsx") },
  },
});
log("ssr build bitti");

/* 3) render */
const require = createRequire(import.meta.url);
require("react-dom/server"); // node sürümünde server renderer'ın çözülmesi için
const entry = await import(pathToFileURL(path.join(SSR_DIR, "prerender-entry.js")).href);
const html = entry.render();

/* 4) CSS'i topla ve satır içi göm */
const distAssets = path.join(DIST, "assets");
const cssFiles = existsSync(distAssets) ? readdirSync(distAssets).filter((f) => f.endsWith(".css")) : [];
let css = cssFiles.map((f) => readFileSync(path.join(distAssets, f), "utf8")).join("\n");
if (css) {
  // css içindeki mutlak /assets/ yollarını göreli yap
  css = css
    // "/assets/x.woff2" ve "/repo/assets/x.woff2" → "./assets/x.woff2"
    .replace(/url\((['"]?)(?:\/[^)"']*)?\/assets\//g, "url($1./assets/")
    // src satır içi <style> içindeyken url() satır sonuna kadar uzayabilir; güvenli taraflı eşleme:
    .replace(/url\((['"]?)\.\/assets\/([^)"']*)\)/g, 'url($1./assets/$2)');
  // satır içi CSS'te node_modules kaynaklarını gömmek yerine dosyaya yaz (boş; Vite zaten kopyaladı)
}

/* 5) index.html'i yeniden kur */
let out = readFileSync(path.join(DIST, "index.html"), "utf8");
const jsFiles = existsSync(distAssets) ? readdirSync(distAssets).filter((f) => f.endsWith(".js")) : [];
const jsName = jsFiles[0];
if (!jsName) throw new Error("client JS bulunamadı");

const injected = `<!-- prebuilt-ssr:start -->${html}<!-- prebuilt-ssr:end -->`;
out = out.replace(/<div id="root"><\/div>/, `<div id="root">${injected}</div>`);
// module scripts / preloads → göreli yol
// mutlak yolları göreli yap: base="/repo/" → "./…"; böylece yerelde de açılır
out = out.replace(/((?:src|href)=")[^"]*\/assets\//g, "$1./assets/");
out = out.replace(/((?:src|href)=")\/(favicon\.svg|apple-touch-icon\.png|site\.webmanifest|llms\.txt|robots\.txt|sitemap\.xml)/g, "$1./$2");
// satır içi CSS
if (css) out = out.replace("</head>", `<style>${css}</style></head>`);

writeFileSync(path.join(DIST, "index.html"), out);

/* 6) özet */
const rows = [];
let total = 0;
for (const f of filesRecursive(DIST)) {
  const s = statSync(path.join(DIST, f)).size;
  total += s;
  rows.push([f, s]);
}
rows.sort((a, b) => b[1] - a[1]);
console.log("\n  prerender edilen site");
for (const [f, s] of rows.slice(0, 12)) console.log(`   ${(s / 1024).toFixed(0).padStart(6)} KB  ${f}`);
console.log(`   ${(total / 1048576).toFixed(2).padStart(6)} MB  — TOPLAM  (önceki tek dosya: 11,94 MB)\n`);

if (out.includes("prebuilt-ssr:start") === false) throw new Error("prerender enjekte edilmedi");
const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
for (const probe of ["Yatağın ayaklarını keserim", "BEN PRENSİP", "çene kemiğinden"]) {
  if (!text.includes(probe)) throw new Error(`prerender metninde eksik: ${probe}`);
}
log("doğrulama: manifestonun kritik cümleleri statik HTML'de ✔");

function filesRecursive(dir, prefix = "") {
  const res = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) res.push(...filesRecursive(path.join(dir, e.name), rel));
    else res.push(rel);
  }
  return res;
}
