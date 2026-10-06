/**
 * Ada kütüğü — tek liste, üç taraf da buradan okur.
 *
 * Neden ayrı bir dosya: `App.tsx` (şablon) ve `main.tsx` (bağlayıcı) ada adlarını
 * ayrı ayrı yazıyordu. Bir ada eklenip yuvası açılır ama `main.tsx`'teki `islands`
 * haritasına yazılmazsa, sonuç **sessizce ölü bir düğüm** olur: HTML'de boş
 * `<div data-island="X">` durur, typecheck geçer, build geçer, sitede hiçbir şey
 * çalışmaz. (`data-copy` butonlarının başına gelen tam olarak buydu — bkz.
 * docs/DENETIM.md §B1.)
 *
 * Bu listeyle:
 *  · `App.tsx` → `IslandSlot({ name }: { name: IslandName })`  (typo = typecheck hatası)
 *  · `main.tsx` → `Record<IslandName, …>`                      (eksik ada = typecheck hatası)
 *  · `scripts/prerender.mjs` → render edilen HTML'deki her yuvanın listede olduğunu doğrular
 *
 * Runtime maliyeti: sıfır — iki taraf da yalnızca TİP olarak import eder, silinir.
 */
export const ISLAND_NAMES = [
  "ScrollProgress",
  "InkWriter",
  "Tools",
  "Carve",
  "Seal",
] as const;

export type IslandName = (typeof ISLAND_NAMES)[number];

/**
 * `data-island` özniteliği DOM'dan `string` olarak gelir; `Record<IslandName, …>`
 * ise keyfi string indekslemeyi reddeder (reddetmesi istenen şey — eksik ada
 * typecheck'te patlasın). Bu daraltıcı iki tarafı güvenle buluşturur: listede
 * olmayan bir ad `false` döner ve düğüm sessizce atlanır, çökme olmaz.
 */
export function isIslandName(value: unknown): value is IslandName {
  return typeof value === "string" && (ISLAND_NAMES as readonly string[]).includes(value);
}
