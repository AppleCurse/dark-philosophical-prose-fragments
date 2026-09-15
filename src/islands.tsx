/**
 * React adaları (islands).
 *
 * Manifestonun tamamı STATİK HTML olarak prerender ediliyor (scripts/prerender.mjs);
 * React yalnızca şu üç etkileşimi ayağa kaldırıyor:
 *   ScrollProgress · InkWriter (divit) · Tools (ışık + paylaş)
 * Böylece bot'lar metni JS olmadan görür, JS'siz tarayıcıda manifesto okunur ve
 * hidrasyon maliyeti birkaç KB'a iner.
 *
 * Adalar aynı veri dosyasını (`src/content.ts`) import eder — props'ta DOM/fonksiyon
 * taşımaya gerek yok.
 */
import { useEffect, useRef, useState } from "react";

/* ───────────────────────── helpers ───────────────────────── */

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/** Kaydırma-animasyonlarının kilidini açar (CSS: html.js-io). Yalnızca JS varken. */
export function armReveals() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.add("js-io");
}

/** Görünüme girince true olur; IO yoksa anında true (asla görünmez kalmaz). */
export function useInView(threshold = 0.3) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ───────────────────────── ScrollProgress ───────────────────────── */

/**
 * Kaydırma göstergesi. State KULLANMAZ: her karede setState → tüm ağacın
 * yeniden render'ı demekti (bkz. docs/AUDIT.md §2.5a). Burada yalnızca bir
 * CSS custom property yazılıyor.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const paint = () => {
      raf = 0;
      const de = document.documentElement;
      const p = de.scrollTop / Math.max(1, de.scrollHeight - de.clientHeight);
      ref.current?.style.setProperty("--p", String(Math.min(1, Math.max(0, p))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    paint();
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="h-full w-full origin-left bg-gradient-to-r from-silver-dim via-bone to-silver-dim"
      style={{ transform: "scaleX(var(--p, 0))" }}
      aria-hidden
    />
  );
}

/* ───────────────────────── InkWriter (divit) ───────────────────────── */

type Stage = "line1" | "line2" | "line3" | "done";

export type InkProps = {
  a: string;
  b: string;
  principle: string;
  lang: "tr" | "en";
};

export function InkWriter({ a, b, principle, lang }: InkProps) {
  const { ref, inView } = useInView(0.35);
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [line3, setLine3] = useState("");
  const [stage, setStage] = useState<Stage>("line1");
  const [runId, setRunId] = useState(0);

  /* hareket hassasiyeti: animasyonsuz, tam metin */
  useEffect(() => {
    if (!inView || !prefersReducedMotion()) return;
    setLine1(a);
    setLine2(b);
    setLine3(principle);
    setStage("done");
  }, [inView, a, b, principle]);

  /* yazım makinesi: tek setTimeout, deterministik ritim */
  useEffect(() => {
    if (!inView || prefersReducedMotion() || runId < 0) return;
    if (stage === "done") return;

    const current = stage === "line1" ? line1 : stage === "line2" ? line2 : line3;
    const full = stage === "line1" ? a : stage === "line2" ? b : principle;
    if (full.length === 0) return;

    if (current.length >= full.length) {
      const next: Stage = stage === "line1" ? "line2" : stage === "line2" ? "line3" : "done";
      const t = setTimeout(() => setStage(next), next === "done" ? 200 : 420);
      return () => clearTimeout(t);
    }

    const ch = full[current.length];
    // Küçük bir noktalama duraklaması: ritim rastgele değil, imla güdümlü.
    const pause = /[.,;:—”]/.test(ch) ? 118 : ch === " " ? 74 : 26 + (current.length % 5) * 4;
    const t = setTimeout(() => {
      const nextText = full.slice(0, current.length + 1);
      if (stage === "line1") setLine1(nextText);
      else if (stage === "line2") setLine2(nextText);
      else setLine3(nextText);
    }, pause);
    return () => clearTimeout(t);
  }, [inView, runId, stage, line1, line2, line3, a, b, principle]);

  const replay = () => {
    setLine1("");
    setLine2("");
    setLine3("");
    setStage("line1");
    setRunId((n) => n + 1);
  };

  const finished = stage === "done";

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="mt-12 max-w-3xl px-4 text-center sm:mt-16"
    >
      <div className="ink-script ink-bleed min-h-[5.5rem] font-hand text-3xl leading-[1.3] tracking-wide text-bone sm:min-h-[7rem] sm:text-4xl md:min-h-[8rem] md:text-5xl lg:text-[3.35rem]">
        <span className="block">
          {line1}
          {stage === "line1" && <span className="ink-nib-cursor" />}
        </span>
        <span className="mt-1 block text-silver/90 sm:mt-2">
          {line2}
          {stage === "line2" && <span className="ink-nib-cursor" />}
        </span>
      </div>

      <div
        className={`mt-7 flex flex-col items-center transition-all duration-700 ${
          line3 ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <div className="h-6 w-px bg-gradient-to-b from-silver-dim/60 to-transparent" />
        <div className="mt-3 inline-flex items-center gap-2.5 rounded-full border border-bone/15 bg-bone/[0.04] px-5 py-2 shadow-lg backdrop-blur-md">
          <span className="pulse-slow h-1.5 w-1.5 rounded-full bg-bone/80" aria-hidden />
          <p className="font-serif text-base italic tracking-wide text-bone sm:text-lg md:text-xl">
            {line3}
            {stage === "line3" && <span className="ink-nib-cursor" />}
          </p>
        </div>
        {finished && (
          <button
            type="button"
            onClick={replay}
            className="mt-4 font-mono text-[0.55rem] uppercase tracking-[0.35em] text-silver-dim transition-colors hover:text-bone focus-visible:text-bone"
          >
            {lang === "tr" ? "↺ yeniden yaz" : "↺ write again"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Tools ───────────────────────── */

/** `IŞIĞI AÇ`: kazınmış duvar yazısını okunur kılar (a11y) + tek etkileşim kanca. */
export function Tools() {
  const [light, setLight] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    document.documentElement.toggleAttribute("data-light", light);
  }, [light]);

  const flash = (t: string) => {
    setMsg(t);
    setTimeout(() => setMsg(""), 2400);
  };

  const share = async () => {
    const text = "Ben cennetin steril sakinlerinden değilim; meleklerle aynı notaya susmam.";
    const url = location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "BEN PRENSİP — Salim Gümüş", text, url });
        flash("paylaşıldı");
        return;
      }
      await navigator.clipboard.writeText(`“${text}” — Salim Gümüş · Vesika 01\n${url}`);
      flash("bağlantı kopyalandı");
    } catch {
      flash(`${location.host}${location.pathname}`);
    }
  };

  return (
    <div className="fixed right-3 top-3 z-50 flex items-center gap-2 sm:right-6 sm:top-6">
      <span aria-live="polite" className="sr-only">
        {msg}
      </span>
      <button
        type="button"
        onClick={() => setLight((v) => !v)}
        aria-pressed={light}
        title={msg || undefined}
        className="rounded-full border border-bone/15 bg-black/45 px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.28em] text-silver-dim backdrop-blur-md transition-colors hover:text-bone focus-visible:text-bone"
      >
        {light ? "IŞIĞI KAPAT" : "IŞIĞI AÇ"}
      </button>
      <button
        type="button"
        onClick={share}
        className="rounded-full border border-bone/15 bg-black/45 px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.28em] text-silver-dim backdrop-blur-md transition-colors hover:text-bone focus-visible:text-bone"
      >
        paylaş
      </button>
    </div>
  );
}
