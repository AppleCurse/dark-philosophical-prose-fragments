/** `scripts/prerender.mjs` girişi: App'i statik HTML metnine çevirir. */
import { renderToStaticMarkup } from "react-dom/server";
import App from "./App";
import { site, vesika } from "./content";
import { ISLAND_NAMES } from "./islands-registry";

export function render(): string {
  return renderToStaticMarkup(<App />);
}

/**
 * Build sırasında `index.html`'i doğrulamak için gereken tek doğruluk kaynağı.
 *
 * Neden var: `index.html` içindeki `title`/`description`/`og:*`/JSON-LD elle yazılıyor;
 * `content.ts` ise "tek kaynak" iddiasında. İkisi ayrışabiliyor — nitekim JSON-LD
 * `applecurse.github.io`'da kalırken `canonical` custom domain'e geçmişti (bkz.
 * docs/DENETIM.md §B2). Bu dışa aktarım, prerender'ın iki tarafı karşılaştırıp
 * kayma varsa build'i PATLATMASINI sağlar.
 */
export function meta() {
  return {
    url: site.url,
    title: site.title,
    description: site.description,
    person: site.person,
    brand: site.brand,
    vesikaNo: vesika.no,
    datePublished: site.datePublished,
    ogImage: `${site.url}${site.ogImage}`,
  };
}

/** prerender.mjs: HTML'deki ada yuvalarını bu listeyle doğrular. */
export function islandNames(): readonly string[] {
  return ISLAND_NAMES;
}
