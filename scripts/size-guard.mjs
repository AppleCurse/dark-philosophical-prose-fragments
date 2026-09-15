/**
 * Bütçe bekçisi: bundle'ı CI'da ölçer, eşiği aşarsa build'i patlatır.
 * Bütçe = dist içindeki tüm dosyaların toplamı (HTML + JS + CSS + görsel + font).
 */
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

const BUDGET_MB = Number(process.env.BUDGET_MB ?? 1.8);
const DIST = path.resolve(import.meta.dirname, "..", "dist");
if (!existsDist()) {
  console.error("✖ dist/ yok — önce `npm run build`.");
  process.exit(1);
}

let total = 0;
const rows = [];
walk(DIST, "");
rows.sort((a, b) => b[1] - a[1]);
for (const [f, s] of rows) console.log(`  ${(s / 1024).toFixed(0).padStart(6)} KB  ${f}`);
const mb = total / 1048576;
if (mb > BUDGET_MB) {
  console.error(`✖ bundle ${mb.toFixed(2)} MB > bütçe ${BUDGET_MB} MB`);
  process.exit(1);
}
console.log(`✓ bundle ${mb.toFixed(2)} MB (bütçe ${BUDGET_MB} MB)`);

function walk(dir, prefix) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) walk(abs, rel);
    else {
      const s = statSync(abs).size;
      total += s;
      rows.push([rel, s]);
    }
  }
}
function existsDist() {
  try {
    return statSync(DIST).isDirectory();
  } catch {
    return false;
  }
}
