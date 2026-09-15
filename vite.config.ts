import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * NOT: `vite-plugin-singlefile` bilinçli olarak kaldırıldı.
 * Tek dosyaya gömülü base64 görseller 11,9 MB'lık bir index.html üretiyordu;
 * lazy-load, cache ve responsive image imkânını sıfırlıyordu (docs/AUDIT.md §2.1).
 * Statik prerender'ı `scripts/prerender.mjs` yapıyor.
 */
export default defineConfig({
  // GitHub Pages alt yolu; custom domain'e geçince "/" yapın
  base: "/dark-philosophical-prose-fragments/",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(dirname, "src") } },
  build: {
    // görseller asla satır içi olmasın: ayrı dosya → cache'lenebilir, ertelenebilir
    assetsInlineLimit: 0,
    cssCodeSplit: true,
    reportCompressedSize: false,
  },
});
