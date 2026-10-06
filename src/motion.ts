/**
 * Hareket yardımcıları — adalardan VE ana bağlayıcıdan ortak kullanılır.
 *
 * Neden ayrı dosya: `src/islands.tsx` hem bileşen hem düz fonksiyon
 * (`armReveals`) dışa aktardığında vite-plugin-react Fast Refresh'i
 * reddediyor ("export is incompatible") ve her düzenlemede TAM SAYFA
 * yeniden yükleme tetikliyor. Geliştirme sekmesi o sırada yarı monte
 * edilmiş bir durumda kalabiliyordu — "divit satırları yok" bildirimine
 * giden yol buydu (bkz. docs/DENETIM.md §H). Bileşen olmayan her şey burada.
 */

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/** Kaydırma-animasyonlarının kilidini açar (CSS: html.js-io). Yalnızca JS varken. */
export function armReveals(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.add("js-io");
}
