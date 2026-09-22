import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Carve, InkWriter, ScrollProgress, Seal, Tools, armReveals } from "./islands";
import { site, vesika } from "./content";
import { isIslandName, type IslandName } from "./islands-registry";
import "./index.css";

/**
 * İki çalışma modu:
 *  1) Üretim: `index.html` zaten prerender edilmiş statik manifestoyu içerir;
 *     burada yalnızca ada yuvaları (`[data-island]`) React ile doldurulur.
 *     → bot/JS'siz okuma tam, hidrasyon maliyeti birkaç KB.
 *  2) Geliştirme (`vite`): #root boş; tam React ağacı ayağa kalkar.
 *
 * Ayrıca iki "adasız" davranış burada bağlanır (`armCopyButtons`, `armWallTorch`):
 * bunlar statik HTML'de zaten duran düğümleri dinleyiciyle buluşturur, kendi
 * ağaçlarını render etmezler — yani React hidrasyonu gerektirmezler.
 */

// Record<IslandName, …>: listede olup burada OLMAYAN bir ada typecheck'i patlatır.
// Yani "HTML'de yuva var ama dinleyici yok" durumu artık derlenemez.
const islands: Record<IslandName, () => React.ReactNode> = {
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
  Carve: () => <Carve lang={site.lang} />,
  Seal: () => <Seal person={site.person} no={vesika.no} lang={site.lang} />,
};

function mountIslands() {
  armReveals();
  document.querySelectorAll<HTMLElement>("[data-island]").forEach((node) => {
    if (!isIslandName(node.dataset.island)) return;
    createRoot(node).render(<StrictMode>{islands[node.dataset.island]()}</StrictMode>);
  });
}

/* ---------- adasız davranış 1: alıntı kopyalama ---------- */

/** Ekran okuyucu için tek, tembel oluşturulan canlı bölge. */
function announce(msg: string) {
  let live = document.getElementById("vesika-live");
  if (!live) {
    live = document.createElement("div");
    live.id = "vesika-live";
    live.className = "sr-only";
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");
    document.body.appendChild(live);
  }
  live.textContent = msg;
}

/**
 * `navigator.clipboard` yalnızca güvenli bağlamda (https/localhost) var.
 * GitHub Pages + custom domain https, ama dosyadan (`file://`) açan ya da
 * eski tarayıcı için `execCommand` yedeği duruyor.
 */
async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* yedeğe düş */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

/**
 * `[data-copy]` düğümleri statik HTML'de buton olarak durur; dinleyici tek ve
 * delege — 5 buton için 5 hidrate bileşen gerekmez (bkz. docs/AUDIT.md §5.4).
 */
function armCopyButtons() {
  const timers = new WeakMap<HTMLElement, number>();

  document.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement | null)?.closest?.<HTMLButtonElement>("button[data-copy]");
    if (!btn) return;

    const quote = btn.dataset.copy;
    if (!quote) return;

    const payload = `“${quote}” — ${site.person} · Vesika No: ${vesika.no}\n${location.href}`;
    const original = btn.dataset.label ?? btn.textContent ?? "";
    btn.dataset.label = original;

    // kopyalama başarısız olursa kullanıcıya yalan söyleme
    void writeClipboard(payload).then((ok) => {
      btn.textContent = ok ? "✓ kopyalandı" : "✖ kopyalanamadı";
      btn.classList.toggle("is-done", ok);
      btn.classList.toggle("is-failed", !ok);
      announce(ok ? "Alıntı panoya kopyalandı" : "Alıntı kopyalanamadı");
      const prev = timers.get(btn);
      if (prev) clearTimeout(prev);
      timers.set(
        btn,
        window.setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove("is-done", "is-failed");
        }, 1800),
      );
    });
  });
}

/* ---------- adasız davranış 2: tek ampul (duvar feneri) ---------- */

/**
 * `[data-torch]` duvarı: işaretçi konumu bir CSS custom property'ye yazılır.
 * ScrollProgress ile aynı disiplin — setState yok, her karede yalnızca iki
 * `style.setProperty`; React bu yüzden hiç yeniden render etmez.
 */
function armWallTorch() {
  const wall = document.querySelector<HTMLElement>("[data-torch]");
  if (!wall) return;
  // Dokunmatikte "fener" olmaz: ince işaretçi yoksa hiç bağlanma (CSS de kapalı).
  if (!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches) return;

  let raf = 0;
  let x = 0;
  let y = 0;

  const paint = () => {
    raf = 0;
    const r = wall.getBoundingClientRect();
    wall.style.setProperty("--tx", `${x - r.left}px`);
    wall.style.setProperty("--ty", `${y - r.top}px`);
  };

  wall.addEventListener("pointermove", (e) => {
    x = e.clientX;
    y = e.clientY;
    if (!wall.hasAttribute("data-torch-on")) wall.setAttribute("data-torch-on", "");
    if (!raf) raf = requestAnimationFrame(paint);
  });

  wall.addEventListener("pointerleave", () => {
    wall.removeAttribute("data-torch-on");
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

armCopyButtons();
armWallTorch();
