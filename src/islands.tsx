/**
 * React adaları (islands).
 *
 * Manifestonun tamamı STATİK HTML olarak prerender ediliyor (scripts/prerender.mjs);
 * React yalnızca şu beş etkileşimi ayağa kaldırıyor:
 *   ScrollProgress · InkWriter (divit) · Tools (ışık + paylaş) · Carve (duvara kazı) · Seal (mühür)
 * Böylece bot'lar metni JS olmadan görür, JS'siz tarayıcıda manifesto okunur ve
 * hidrasyon maliyeti birkaç KB'a iner.
 *
 * Adalar aynı veri dosyasını (`src/content.ts`) import eder — props'ta DOM/fonksiyon
 * taşımaya gerek yok.
 *
 * İki davranış bilinçli olarak ada DEĞİL: `[data-copy]` kopyalama ve `[data-torch]`
 * fener. İkisi de statik HTML'de zaten duran düğümlere dinleyici bağlar; kendi
 * ağaçlarını render etmedikleri için React hidrasyonu gerektirmezler (src/main.tsx).
 *
 * `Carve` ve `Seal` yalnızca `localStorage` kullanır: ziyaretçinin satırı ve nüsha
 * numarası cihazından çıkmaz, sunucuya istek gitmez, çerez yoktur.
 */
import { useEffect, useRef, useState, type FormEvent } from "react";
import { prefersReducedMotion } from "./motion";

/* ───────────────────────── helpers ───────────────────────── */

/** Görünüme girince true olur; IO yoksa anında true (asla görünmez kalmaz).
 *  Ek güvence: montaj anında bir kez dikdörtgen kontrolü. IntersectionObserver
 *  ilk geri çağrısını geciktirebiliyor (sekme arka planda, ekran görüntüsü
 *  araçları, bazı webview'ler) ve o sırada üst katmandaki içerik "yokmuş" gibi
 *  görünüyor — divit satırlarının başına gelen tam olarak buydu. Eleman zaten
 *  görünür alandaysa IO'yu hiç beklemiyoruz. */
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
    const r0 = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (r0.top < vh && r0.bottom > 0) {
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
    const quote = "Ben cennetin steril sakinlerinden değilim; meleklerle aynı notaya susmam.";
    // Mühürlenmiş nüsha paylaşım metnine girer: paylaşılan şey artık genel bir link
    // değil, kişinin kendi kaydı ("Nüsha No 48213"). Ekran görüntüsü almaya değer.
    const nusha = readNusha();
    const tail = nusha ? ` · Nüsha No: ${nusha.no}` : "";
    const text = `${quote} — Salim Gümüş, Vesika 01${tail}`;
    const url = location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "BEN PRENSİP — Salim Gümüş", text, url });
        flash("paylaşıldı");
        return;
      }
      await navigator.clipboard.writeText(`“${text}”\n${url}`);
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

/* ───────────────────────── yerel bellek yardımcıları ───────────────────────── */

/** `22.09.2026` — vesikanın kendi tarih biçimi (Intl yok, deterministik). */
function stamp(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

/** localStorage her bağlamda yok (Safari gizli mod, dosya://, kota). Okuma asla çökmez. */
function readStore<T>(key: string, guard: (v: unknown) => T | null): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? guard(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function writeStore(key: string, value: unknown): boolean {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/* ───────────────────────── Seal (mühür + nüsha no) ───────────────────────── */

const SEAL_KEY = "vesika.nusha.v1";

export type Nusha = { no: string; at: string };

function asNusha(v: unknown): Nusha | null {
  const o = v as Partial<Nusha> | null;
  return o && typeof o.no === "string" && /^\d{5}$/.test(o.no)
    ? { no: o.no, at: typeof o.at === "string" ? o.at : "" }
    : null;
}

/** `Tools` paylaşım metnine nüsha numarasını koyabilsin diye dışa açık. */
export function readNusha(): Nusha | null {
  return readStore<Nusha>(SEAL_KEY, asNusha);
}

/** Mum damlaları: deterministik, elle ayarlanmış kenar.
 *
 *  İlk sürüm formülseldi (`i % 3` / `i % 4`) ve iki hatası vardı:
 *   1) iki damla viewBox'ın dışına taşıyor, `overflow: hidden` uçlarını düz kesiyordu;
 *   2) radyal erişim (`rx`) teğetsel genişlikten (`ry`) BÜYÜKTÜ — damlalar erimiş mum
 *      kenarı gibi değil, güneş ışını / dişli gibi duruyordu.
 *
 *  Şimdi her damla elle çizilmiş: `r` merkezin yarıçapı, `rx` dışa erişim, `ry` kenar
 *  boyunca genişlik. `ry > rx` lobları kenara yapıştırır; erişim farkı `(r+rx)-45`
 *  3,5–7,5 arası kalır (azı görünmez, çoğu karikatür). Sınır: `r + rx ≤ 58`
 *  (viewBox 120, merkez 60,60) — raster önizlemeyle doğrulandı (docs/DENETIM.md §G).
 */
const DRIPS = [
  { deg: 8, r: 44.5, rx: 6.5, ry: 10.5 },
  { deg: 49, r: 43.0, rx: 9.5, ry: 8.0 },
  { deg: 97, r: 45.0, rx: 5.5, ry: 12.0 },
  { deg: 138, r: 42.5, rx: 8.0, ry: 9.5 },
  { deg: 176, r: 44.0, rx: 4.5, ry: 7.0 },
  { deg: 214, r: 43.5, rx: 9.0, ry: 11.0 },
  { deg: 259, r: 44.5, rx: 5.0, ry: 8.5 },
  { deg: 306, r: 42.8, rx: 7.5, ry: 10.0 },
  { deg: 337, r: 44.2, rx: 4.0, ry: 6.5 },
].map((d) => {
  const rad = (d.deg * Math.PI) / 180;
  return {
    ...d,
    cx: 60 + Math.cos(rad) * d.r,
    cy: 60 + Math.sin(rad) * d.r,
  };
});

function WaxSeal({ sealed, pressing, no }: { sealed: boolean; pressing: boolean; no: string }) {
  const body = sealed ? "url(#waxLit)" : "url(#waxCold)";
  return (
    <svg
      viewBox="0 0 120 120"
      className={`wax-seal${pressing ? " is-pressing" : ""}${sealed ? " is-sealed" : ""}`}
      width="108"
      height="108"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* userSpaceOnUse ŞART: objectBoundingBox'da her eleman kendi gradyanını
            alıyor, damlalar gövdeden ayrı renkte "çiçek yaprağı" gibi duruyordu.
            Tek gradyan alanı = tek ışık kaynağı = süreli bir mum kütlesi. */}
        <radialGradient id="waxLit" gradientUnits="userSpaceOnUse" cx="43" cy="36" r="68">
          <stop offset="0%" stopColor="#d9573c" />
          <stop offset="38%" stopColor="#9c1f14" />
          <stop offset="78%" stopColor="#6d1009" />
          <stop offset="100%" stopColor="#3d0705" />
        </radialGradient>
        <radialGradient id="waxCold" gradientUnits="userSpaceOnUse" cx="43" cy="36" r="68">
          <stop offset="0%" stopColor="#4d2b26" />
          <stop offset="52%" stopColor="#2d1614" />
          <stop offset="100%" stopColor="#150a09" />
        </radialGradient>
      </defs>

      {DRIPS.map((d) => (
        <ellipse
          key={d.deg}
          cx={d.cx}
          cy={d.cy}
          rx={d.rx}
          ry={d.ry}
          fill={body}
          transform={`rotate(${d.deg} ${d.cx} ${d.cy})`}
        />
      ))}

      <circle cx="60" cy="60" r="45" fill={body} />
      {/* çember içi kabartma: tek koyu oyuk + çok ince açık kenar.
          İkinci halka parlakken mühür "bozuk para" gibi duruyordu; inceltilip
          sönükleştirildi — baskı izi, madalyon değil. */}
      <circle cx="60" cy="60" r="34.4" fill="none" stroke="rgba(0,0,0,0.42)" strokeWidth="1.9" />
      <circle cx="60" cy="60" r="33.1" fill="none" stroke="rgba(255,214,196,0.10)" strokeWidth="0.9" />

      {/* kazınmış monogram: açık alt gölge, koyu üst oyuk */}
      <g className="wax-glyph">
        <text x="60" y="60.5" textAnchor="middle" className="wax-lo">
          V
        </text>
        <text x="60" y="59" textAnchor="middle" className="wax-hi">
          V
        </text>
        <text x="60" y="80" textAnchor="middle" className="wax-lo wax-sm">
          {sealed ? no : "—"}
        </text>
        <text x="60" y="78.8" textAnchor="middle" className="wax-hi wax-sm">
          {sealed ? no : "—"}
        </text>
      </g>
    </svg>
  );
}

export type SealProps = { person: string; no: string; lang: "tr" | "en" };

/**
 * Vesika resmî bir belgedir; okuyan kişi kendi **nüshasını** mühürler.
 * Numara ilk mühürlemede üretilir ve bir daha değişmez — yani ekran görüntüsü
 * alan herkes kendine ait, tekrarlanamaz bir kayıt taşır.
 */
export function Seal({ person, no, lang }: SealProps) {
  const tr = lang === "tr";
  // Lazy initializer: useEffect boyamadan SONRA calistigi icin geri dönen kullanıcı
  // bir kare soğuk (mühürlenmemiş) mühür görüyordu. İlk render'da doğru durum.
  const [nusha, setNusha] = useState<Nusha | null>(() =>
    typeof window === "undefined" ? null : readNusha(),
  );
  const [pressing, setPressing] = useState(false);
  const [stored, setStored] = useState(true);

  const press = () => {
    if (nusha || pressing) return;
    const next: Nusha = {
      no: String(Math.floor(10000 + Math.random() * 90000)),
      at: stamp(),
    };
    setPressing(true);
    setStored(writeStore(SEAL_KEY, next));
    const settle = () => {
      setNusha(next);
      setPressing(false);
    };
    if (prefersReducedMotion()) settle();
    else window.setTimeout(settle, 620);
  };

  return (
    <div className="mt-14 flex flex-col items-center">
      <button
        type="button"
        onClick={press}
        disabled={Boolean(nusha)}
        aria-label={
          nusha
            ? tr
              ? `Nüsha No ${nusha.no}, ${nusha.at} tarihinde mühürlendi`
              : `Copy No ${nusha.no}, sealed on ${nusha.at}`
            : tr
              ? "Bu nüshayı mühürle"
              : "Seal this copy"
        }
        className={`seal-btn no-print group flex flex-col items-center${nusha ? " is-sealed" : ""}`}
      >
        <WaxSeal sealed={Boolean(nusha)} pressing={pressing} no={no} />
        <span className="mt-4 font-mono text-[0.55rem] uppercase tracking-[0.35em] text-silver-dim transition-colors group-hover:text-bone group-focus-visible:text-bone">
          {nusha ? (tr ? "mühürlendi" : "sealed") : tr ? "nüshanı mühürle" : "seal your copy"}
        </span>
      </button>

      <div
        className={`seal-readout mt-6 flex flex-col items-center transition-all duration-700 ${
          nusha ? "is-on translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <p className="font-display text-lg uppercase tracking-[0.3em] text-bone md:text-xl">
          {tr ? "Nüsha No" : "Copy No"}: {nusha?.no}
        </p>
        <p className="mt-2 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-silver-dim">
          {person} · {tr ? "mühürlendi" : "sealed"} {nusha?.at}
        </p>
        {!stored && (
          <p className="mt-3 max-w-xs font-serif text-sm text-silver-dim">
            {tr
              ? "Tarayıcın kayıt tutmuyor (gizli mod); bu nüsha yenilenince kaybolur."
              : "Your browser blocks storage (private mode); this copy is lost on reload."}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => window.print()}
        className="mt-8 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-silver-dim underline decoration-silver-dim/30 underline-offset-4 transition-colors hover:text-bone focus-visible:text-bone"
      >
        {tr ? "⎙ vesikayı yazdır" : "⎙ print the document"}
      </button>
    </div>
  );
}

/* ───────────────────────── Carve (duvara kazı) ───────────────────────── */

const CARVE_KEY = "vesika.kazinti.v1";
const CARVE_MAX = 96;
const CARVE_LIMIT = 3;

export type CarveEntry = { t: string; at: string };

function asEntries(v: unknown): CarveEntry[] | null {
  if (!Array.isArray(v)) return null;
  return v
    .filter((e): e is { t: unknown; at?: unknown } => Boolean(e) && typeof e === "object")
    .map((e) => ({
      t: String(e.t ?? "").slice(0, CARVE_MAX),
      at: typeof e.at === "string" ? e.at : "",
    }))
    .filter((e) => e.t.trim().length > 0)
    .slice(0, CARVE_LIMIT);
}

export type CarveProps = { lang: "tr" | "en" };

/**
 * Bölüm III'ün iddiası: *"okunan"* metin değil, **"okuyan"** insan.
 * Bu ada o iddianın etkileşimi — manifesto bittiğinde duvar okuyucuya devredilir.
 * Kazınan satır yalnızca kendi cihazında kalır; sunucu, çerez, hesap yok.
 */
export function Carve({ lang }: CarveProps) {
  const tr = lang === "tr";
  // Lazy initializer: geri dönen okuyucu kendi satırlarını ilk karede görür.
  const [entries, setEntries] = useState<CarveEntry[]>(() =>
    typeof window === "undefined" ? [] : readStore<CarveEntry[]>(CARVE_KEY, asEntries) ?? [],
  );
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");
  const noteTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (noteTimer.current) clearTimeout(noteTimer.current);
    },
    [],
  );

  const say = (msg: string) => {
    setNote(msg);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => setNote(""), 2600);
  };

  const commit = (next: CarveEntry[]) => {
    setEntries(next);
    writeStore(CARVE_KEY, next.length ? next : null);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const t = draft.trim().replace(/\s+/g, " ");
    if (!t) return;
    if (entries.length >= CARVE_LIMIT) {
      say(tr ? "duvarda yer kalmadı — önce bir satır sil" : "no room left — erase a line first");
      return;
    }
    commit([{ t, at: stamp() }, ...entries]);
    setDraft("");
    say(tr ? "kazındı" : "carved");
  };

  const erase = (i: number) => {
    commit(entries.filter((_, n) => n !== i));
    say(tr ? "silindi" : "erased");
  };

  const left = CARVE_MAX - draft.length;

  return (
    <div className="carve-panel wall-surface mx-auto mt-24 max-w-2xl px-6 py-14 text-center md:px-12 md:py-16">
      <p className="section-mark mb-5">{tr ? "okuyan insan" : "the one who reads"}</p>
      <h3 className="font-display text-2xl font-bold uppercase leading-tight tracking-[0.14em] text-bone md:text-4xl">
        {tr ? "Duvar senin." : "The wall is yours."}
      </h3>
      <p className="mx-auto mt-5 max-w-md font-serif text-lg italic leading-relaxed text-silver-dim md:text-xl">
        {tr
          ? "Manifesto bitti. Şimdi bir satır da sen kazı — bu duvar yalnızca okunanı değil, yazanı da hatırlar."
          : "The manifesto is done. Now carve a line of your own — this wall remembers the one who writes, not only the one who reads."}
      </p>

      {entries.length > 0 && (
        <ul className="mx-auto mt-11 max-w-lg space-y-5">
          {entries.map((en, i) => (
            <li key={`${en.t}-${i}`} className="carve-line group" style={{ ["--i" as string]: i }}>
              <span className="mb-2 block font-mono text-[0.45rem] uppercase tracking-[0.3em] text-silver-dim/70">
                {tr ? "KZ" : "CR"} · {String(entries.length - i).padStart(2, "0")}
                {en.at ? ` · ${en.at}` : ""}
              </span>
              <p className="carved-lit break-words font-display text-base uppercase leading-relaxed tracking-[0.16em] md:text-lg">
                {en.t}
              </p>
              <button
                type="button"
                onClick={() => erase(i)}
                className="mt-2.5 font-mono text-[0.45rem] uppercase tracking-[0.3em] text-silver-dim/50 opacity-0 transition-opacity hover:text-bone focus-visible:text-bone focus-visible:opacity-100 group-hover:opacity-100"
              >
                {tr ? "sil" : "erase"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onSubmit} className="no-print mx-auto mt-11 max-w-lg">
        <div className="chisel-field flex items-baseline gap-3 border-b border-bone/15 pb-3 transition-colors focus-within:border-bone/45">
          <span className="font-display text-lg text-silver-dim/60" aria-hidden="true">
            ✒
          </span>
          <input
            type="text"
            value={draft}
            maxLength={CARVE_MAX}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={tr ? "duvara bir satır kazı…" : "carve a line…"}
            aria-label={tr ? "Duvara kazıyacağın satır" : "The line you carve"}
            className="w-full bg-transparent font-serif text-lg text-bone placeholder:text-silver-dim/50 focus:outline-none md:text-xl"
          />
          <span
            className={`font-mono text-[0.5rem] tabular-nums tracking-[0.2em] ${
              left < 12 ? "text-wax-lit" : "text-silver-dim/60"
            }`}
            aria-hidden="true"
          >
            {left}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <button
            type="submit"
            disabled={draft.trim().length === 0}
            className="font-mono text-[0.58rem] uppercase tracking-[0.35em] text-bone transition-opacity hover:opacity-70 focus-visible:opacity-100 disabled:opacity-25 disabled:hover:opacity-25"
          >
            {tr ? "⚒ kazı" : "⚒ carve"}
          </button>
          <span aria-live="polite" className="font-mono text-[0.5rem] uppercase tracking-[0.3em] text-wax-lit">
            {note}
          </span>
        </div>
      </form>

      <p className="mx-auto mt-10 max-w-sm font-mono text-[0.48rem] uppercase leading-relaxed tracking-[0.22em] text-silver-dim/55">
        {tr
          ? "bu satır yalnızca senin tarayıcında kalır — sunucuya gitmez, çerez yok"
          : "this line stays in your browser only — no server, no cookie"}
      </p>
    </div>
  );
}
