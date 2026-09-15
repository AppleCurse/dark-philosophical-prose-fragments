import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { InkWriter, ScrollProgress, Tools, armReveals } from "./islands";
import { site, vesika } from "./content";
import "./index.css";

/**
 * İki çalışma modu:
 *  1) Üretim: `index.html` zaten prerender edilmiş statik manifestoyu içerir;
 *     burada yalnızca ada yuvaları (`[data-island]`) React ile doldurulur.
 *     → bot/JS'siz okuma tam, hidrasyon maliyeti birkaç KB.
 *  2) Geliştirme (`vite`): #root boş; tam React ağacı ayağa kalkar.
 */

const islands: Record<string, () => React.ReactNode> = {
  ScrollProgress: () => <ScrollProgress />,
  Tools: () => <Tools />,
  InkWriter: () => (
    <InkWriter
      a={vesika.ink.raw[0]}
      b={vesika.ink.raw[1]}
      principle={vesika.ink.principle}
      lang={site.lang}
    />
  ),
};

function mountIslands() {
  armReveals();
  document.querySelectorAll<HTMLElement>("[data-island]").forEach((node) => {
    const make = islands[node.dataset.island ?? ""];
    if (!make) return;
    createRoot(node).render(<StrictMode>{make()}</StrictMode>);
  });
}

const root = document.getElementById("root");
const prerendered = Boolean(root && root.children.length > 0);

if (prerendered) {
  mountIslands();
} else if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  // dev modu: App adaları kendi içinde render eder; yuva varsa yine de doldur
  queueMicrotask(() => {
    if (document.querySelectorAll("[data-island]").length) mountIslands();
  });
}
