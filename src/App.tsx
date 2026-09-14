import { useEffect, useRef, useState, type ReactNode } from "react";
import heroImg from "./assets/salim_portrait_feather.jpg";
import salimDarkImg from "./assets/salim_dark_raven.jpg";
import salimWhiteImg from "./assets/salim_white_raven.jpg";
import fallAbyssImg from "./assets/salim_fall_abyss.jpg";
import fallFlameImg from "./assets/salim_fall_flame.jpg";
import fallGroundImg from "./assets/salim_fall_ground.jpg";
import fallSkyImg from "./assets/salim_fall_sky.webp";
import angelPureImg from "./assets/salim_angel_pure.webp";
import angelStormImg from "./assets/salim_angel_storm.jpg";
import bedImg from "./assets/bed.jpg";
import soilImg from "./assets/soil.jpg";
import ravenImg from "./assets/raven.jpg";
import tableImg from "./assets/table.jpg";

/* ---------- hooks ---------- */

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function useScroll() {
  const [y, setY] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const h = document.documentElement;
        setY(window.scrollY);
        setPct((h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100);
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return { y, pct };
}

/* ---------- primitives ---------- */

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationPlayState: visible ? "running" : "paused",
      }}
    >
      {children}
    </div>
  );
}

function Ornament() {
  return (
    <div className="ornament my-20 text-xs">
      <span className="text-silver-dim">✦</span>
    </div>
  );
}

function ChapterMark({
  num,
  title,
  latin,
  align = "center",
}: {
  num: string;
  title: string;
  latin?: string;
  align?: "center" | "left";
}) {
  const isCenter = align === "center";
  return (
    <div className={`mb-14 ${isCenter ? "text-center" : "text-left"}`}>
      <div className="section-mark mb-4">Bölüm {num}</div>
      <h2 className="font-display text-3xl font-bold uppercase leading-tight tracking-[0.18em] text-bone md:text-5xl">
        {title}
      </h2>
      {latin && (
        <div className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.4em] text-silver-dim">
          {latin}
        </div>
      )}
      <div className={`mt-6 h-px w-16 bg-silver ${isCenter ? "mx-auto" : ""}`} />
    </div>
  );
}

function DuelRow({ devil, me }: { devil: string; me: string }) {
  return (
    <div className="duel-row">
      <div className="py-6 pr-0 font-serif text-2xl italic text-silver-dim md:pr-10 md:text-right md:text-3xl">
        <span className="mr-3 font-display text-xl not-italic tracking-widest text-silver-dim/70">
          O
        </span>
        {devil}
      </div>
      <div className="duel-divider" />
      <div className="pb-6 pl-0 font-serif text-2xl font-medium text-bone md:py-6 md:pl-10 md:text-3xl">
        <span className="mr-3 font-display text-xl font-bold tracking-widest text-bone">Ben</span>
        {me}
      </div>
    </div>
  );
}

function BentNail() {
  return (
    <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none">
      <svg
        width="54"
        height="58"
        viewBox="0 0 54 58"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="rustIron" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3d2a1b" />
            <stop offset="40%" stopColor="#7a4a2a" />
            <stop offset="70%" stopColor="#241a12" />
            <stop offset="100%" stopColor="#a35527" />
          </linearGradient>
        </defs>

        {/* Crack / hole in the wall plaster */}
        <ellipse cx="27" cy="12" rx="6" ry="3.5" fill="#000000" opacity="0.95" />
        <path d="M22 11 L16 8 M32 13 L38 16 M27 15 L28 20" stroke="#222" strokeWidth="1.2" strokeLinecap="round" />

        {/* Cast shadow of the bent iron nail on photo */}
        <path
          d="M27 12 C30 22 35 32 44 42"
          stroke="rgba(0,0,0,0.7)"
          strokeWidth="7"
          strokeLinecap="round"
          filter="blur(2px)"
        />

        {/* Nail shank (hammered into wall, then bent sharply downwards) */}
        <line x1="27" y1="12" x2="28" y2="23" stroke="#2a1e15" strokeWidth="5.5" strokeLinecap="round" />
        <line x1="27" y1="12" x2="28" y2="23" stroke="url(#rustIron)" strokeWidth="3.5" strokeLinecap="round" />

        {/* Crooked, bent section overlapping the frame */}
        <path d="M28 23 Q29 28 40 40" stroke="#1c140e" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M28 23 Q29 28 40 40" stroke="url(#rustIron)" strokeWidth="3.8" strokeLinecap="round" />
        <path d="M28 23 Q29 28 40 40" stroke="#d4793b" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

        {/* Hammered nailhead (flattened, rustic, slightly cocked) */}
        <ellipse cx="26.5" cy="11.5" rx="6.5" ry="3.8" fill="#140e0a" transform="rotate(-18 26.5 11.5)" />
        <ellipse cx="26" cy="11" rx="5.5" ry="2.8" fill="#543722" transform="rotate(-18 26 11)" />
        <ellipse cx="25.5" cy="10.5" rx="4" ry="1.8" fill="#9e633a" transform="rotate(-18 25.5 10.5)" />

        {/* Rust corrosion flecks */}
        <circle cx="31" cy="27" r="1.1" fill="#c45d25" />
        <circle cx="35" cy="33" r="1.2" fill="#943d16" />
        <circle cx="38" cy="38" r="0.9" fill="#d97230" />
      </svg>
    </div>
  );
}

function RustedTack() {
  return (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <ellipse cx="11" cy="6" rx="3.5" ry="1.8" fill="#000" opacity="0.9" />
        <ellipse cx="11" cy="6" rx="4" ry="2.2" fill="#2d1c12" />
        <ellipse cx="10.5" cy="5.5" rx="3" ry="1.5" fill="#693d22" />
        <circle cx="12" cy="6.5" r="0.6" fill="#bf5b22" />
        <line x1="11" y1="7" x2="11.5" y2="13" stroke="#18110b" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="11" y1="7" x2="11.5" y2="13" stroke="#7e4827" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function InkWriter() {
  const line1Full = "“Sikemeyeceğiniz kadar tecrübeli,";
  const line2Full = "sikemeyecek kadar yorgun.”";
  const line3Full = "“Ben iyi ya da kötü olan değilim. Gerekli olanım.”";

  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [line3, setLine3] = useState("");
  const [stage, setStage] = useState<"line1" | "pause1" | "line2" | "pause2" | "line3" | "done">("line1");

  useEffect(() => {
    let timeoutId: number;

    if (stage === "line1") {
      if (line1.length < line1Full.length) {
        const nextChar = line1Full[line1.length];
        const delay = nextChar === "," || nextChar === " " ? 95 : 35 + Math.random() * 20;
        timeoutId = window.setTimeout(() => {
          setLine1(line1Full.slice(0, line1.length + 1));
        }, delay);
      } else {
        timeoutId = window.setTimeout(() => setStage("line2"), 350);
      }
    } else if (stage === "line2") {
      if (line2.length < line2Full.length) {
        const nextChar = line2Full[line2.length];
        const delay = nextChar === "." || nextChar === "”" ? 130 : 35 + Math.random() * 20;
        timeoutId = window.setTimeout(() => {
          setLine2(line2Full.slice(0, line2.length + 1));
        }, delay);
      } else {
        timeoutId = window.setTimeout(() => setStage("line3"), 600);
      }
    } else if (stage === "line3") {
      if (line3.length < line3Full.length) {
        const nextChar = line3Full[line3.length];
        const delay = nextChar === "." || nextChar === " " ? 85 : 28 + Math.random() * 18;
        timeoutId = window.setTimeout(() => {
          setLine3(line3Full.slice(0, line3.length + 1));
        }, delay);
      } else {
        timeoutId = window.setTimeout(() => setStage("done"), 300);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [line1, line2, line3, stage]);

  return (
    <div className="mt-12 sm:mt-16 max-w-3xl text-center px-4">
      {/* Hand-scratched divit ink lines that write in real time */}
      <div className="ink-script text-3xl sm:text-4xl md:text-5xl lg:text-[3.35rem] leading-[1.3] text-bone tracking-wide ink-bleed min-h-[5.5rem] sm:min-h-[7rem] md:min-h-[8rem]">
        <span className="block">
          {line1}
          {stage === "line1" && <span className="ink-nib-cursor" />}
        </span>
        <span className="block mt-1 sm:mt-2 text-silver/90">
          {line2}
          {stage === "line2" && <span className="ink-nib-cursor" />}
        </span>
      </div>

      {/* The Inscribed Principle: Gerekli Olanım */}
      <div
        className={`mt-7 flex flex-col items-center transition-all duration-700 ${
          line3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        <div className="h-6 w-px bg-gradient-to-b from-silver-dim/60 to-transparent" />
        <div className="mt-3 inline-flex items-center gap-2.5 rounded-full border border-bone/15 bg-bone/[0.04] px-5 py-2 backdrop-blur-md shadow-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-bone/80 animate-pulse" />
          <p className="font-serif italic text-base sm:text-lg md:text-xl tracking-wide text-bone">
            {line3}
            {stage === "line3" && <span className="ink-nib-cursor" />}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- app ---------- */

export default function App() {
  const { y, pct } = useScroll();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink text-bone">
      {/* progress */}
      <div className="fixed left-0 top-0 z-50 h-px w-full">
        <div
          className="h-full bg-gradient-to-r from-silver-dim via-bone to-silver-dim transition-[width] duration-150"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* side rails */}
      <div className="pointer-events-none fixed right-6 top-0 z-40 hidden h-full items-center md:flex">
        <div className="vertical-text font-mono text-[0.58rem] tracking-[0.5em] text-silver-dim/50">
          SALIM GÜMÜŞ · MANIFESTO · MMXXVI
        </div>
      </div>
      <div className="pointer-events-none fixed left-6 top-0 z-40 hidden h-full items-center md:flex">
        <div className="vertical-text font-mono text-[0.58rem] tracking-[0.5em] text-silver-dim/50">
          BEN PRENSİP
        </div>
      </div>

      {/* ================= HERO (KABA SIVA BETON DUVAR & 3'LÜ DELİL PANOSU) ================= */}
      <header className="wall-surface relative min-h-screen pt-20 pb-28 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-center overflow-hidden">
        {/* Overhead cold light beam hitting the concrete wall */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 -top-24 -translate-x-1/2 h-[650px] w-[850px] max-w-full rounded-full bg-[radial-gradient(closest-side,rgba(236,233,226,0.08),transparent)] blur-3xl" />
        </div>

        {/* Top header badge */}
        <div className="hero-text mb-10 sm:mb-12 flex items-center justify-center gap-4 text-silver-dim" style={{ animationDelay: "150ms" }}>
          <span className="h-px w-10 bg-silver-dim/40 md:w-16" />
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.55em] text-silver-dim">
            Salim Gümüş · Vesika No: 01
          </span>
          <span className="h-px w-10 bg-silver-dim/40 md:w-16" />
        </div>

        {/* Forensic Delil Panosu: Sol (Düşüş & Yangın), Orta (Denge), Sağ (Düşüşten Önce / Melek) */}
        <div className="relative z-10 mx-auto w-full max-w-6xl flex flex-col items-center">
          <div className="relative flex items-center justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 w-full px-2">
            
            {/* SOL TARAF: Düşüş & Yangın Halleri (2 Adet 1/4 Boyutlu Vesika) */}
            <div className="flex flex-col gap-3 sm:gap-5 self-center">
              {/* Sol Üst: Yangın / Alevlenen Kanatlar */}
              <div className="relative group">
                <RustedTack />
                <div className="companion-snapshot rotate-[-3.5deg] bg-[#0c0c0c] p-1.5 sm:p-2 rounded-[2px] border border-white/10 w-[72px] sm:w-[95px] md:w-[115px] lg:w-[125px]">
                  <div className="overflow-hidden relative aspect-[3/4] bg-black">
                    <img
                      src={fallFlameImg}
                      alt="Salim Gümüş — Alevlenen kanatlar"
                      className="h-full w-full object-cover object-center filter contrast-[1.08] brightness-[0.96] transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <div className="mt-1 sm:mt-1.5 text-center font-mono text-[0.38rem] sm:text-[0.45rem] tracking-[0.2em] uppercase text-silver-dim/80">
                    EK: 01 · YANGIN
                  </div>
                </div>
              </div>

              {/* Sol Alt: Uçuruma Düşüş Anı */}
              <div className="relative group">
                <RustedTack />
                <div className="companion-snapshot rotate-[-1.8deg] bg-[#0c0c0c] p-1.5 sm:p-2 rounded-[2px] border border-white/10 w-[72px] sm:w-[95px] md:w-[115px] lg:w-[125px]">
                  <div className="overflow-hidden relative aspect-[3/4] bg-black">
                    <img
                      src={fallAbyssImg}
                      alt="Salim Gümüş — Fırtınaya ve uçuruma çakılış"
                      className="h-full w-full object-cover object-center filter contrast-[1.08] brightness-[0.96] transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <div className="mt-1 sm:mt-1.5 text-center font-mono text-[0.38rem] sm:text-[0.45rem] tracking-[0.2em] uppercase text-silver-dim/80">
                    EK: 02 · ÇAKILIŞ
                  </div>
                </div>
              </div>
            </div>

            {/* ORTA: Ana Vesika (Denge: Yarı Siyah, Yarı Beyaz, Paslı Çiviyle Çakılı) */}
            <div className="relative group pt-4 mx-1 sm:mx-2">
              <BentNail />
              
              <div className="hanging-portrait rotate-[-0.6deg] bg-[#0c0c0c] p-2 sm:p-3 md:p-4 rounded-[2px] border border-white/10 w-[200px] sm:w-[280px] md:w-[360px] lg:w-[410px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95)]">
                <div className="overflow-hidden relative aspect-[3/4] bg-black">
                  <img
                    src={heroImg}
                    alt="Salim Gümüş — Yarı siyah, yarı beyaz; omzunda kuzgun, havada tüyler"
                    className="h-full w-full object-cover object-center filter contrast-[1.08] brightness-[0.98] transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                </div>

                {/* Archival caption on frame border */}
                <div className="mt-2 sm:mt-3 flex items-center justify-between px-1 font-mono text-[0.44rem] sm:text-[0.52rem] tracking-[0.22em] uppercase text-silver-dim">
                  <span>Sol: Melek</span>
                  <span className="text-bone/50 tracking-widest font-semibold">Salim Gümüş</span>
                  <span>Sağ: Şeytan</span>
                </div>
              </div>
            </div>

            {/* SAĞ TARAF: Düşüşten Önceki Halleri (Cennet & Saf Melek Hali - 2 Adet 1/4 Boyutlu Vesika) */}
            <div className="flex flex-col gap-3 sm:gap-5 self-center">
              {/* Sağ Üst: Düşmeden Önceki Saf Işık */}
              <div className="relative group">
                <RustedTack />
                <div className="companion-snapshot rotate-[3.2deg] bg-[#0c0c0c] p-1.5 sm:p-2 rounded-[2px] border border-white/10 w-[72px] sm:w-[95px] md:w-[115px] lg:w-[125px]">
                  <div className="overflow-hidden relative aspect-[3/4] bg-black">
                    <img
                      src={angelPureImg}
                      alt="Salim Gümüş — Düşmeden önce, saf beyaz kanatlar"
                      className="h-full w-full object-cover object-center filter contrast-[1.08] brightness-[0.96] transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <div className="mt-1 sm:mt-1.5 text-center font-mono text-[0.38rem] sm:text-[0.45rem] tracking-[0.2em] uppercase text-silver-dim/80">
                    EK: 03 · KÖKEN
                  </div>
                </div>
              </div>

              {/* Sağ Alt: Fırtına Başlarkenki Eşik */}
              <div className="relative group">
                <RustedTack />
                <div className="companion-snapshot rotate-[4.6deg] bg-[#0c0c0c] p-1.5 sm:p-2 rounded-[2px] border border-white/10 w-[72px] sm:w-[95px] md:w-[115px] lg:w-[125px]">
                  <div className="overflow-hidden relative aspect-[3/4] bg-black">
                    <img
                      src={angelStormImg}
                      alt="Salim Gümüş — Fırtına altında beyaz kanatlar"
                      className="h-full w-full object-cover object-center filter contrast-[1.08] brightness-[0.96] transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <div className="mt-1 sm:mt-1.5 text-center font-mono text-[0.38rem] sm:text-[0.45rem] tracking-[0.2em] uppercase text-silver-dim/80">
                    EK: 04 · MASUMİYET
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Real-time handwriting ink text */}
          <InkWriter />

          {/* Subtle Scroll Cue */}
          <div className="mt-12 flex flex-col items-center gap-2 opacity-50 hover:opacity-90 transition-opacity">
            <span className="font-mono text-[0.52rem] uppercase tracking-[0.45em] text-silver-dim">
              AŞAĞI KAYDIR
            </span>
            <div className="h-7 w-px bg-gradient-to-b from-silver-dim to-transparent" />
          </div>
        </div>
      </header>

      {/* ================= I — BEN VE ŞEYTAN ================= */}
      <section className="relative px-6 py-28 md:py-36">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <ChapterMark num="I" title="Ben ve Şeytan" latin="differentia" />
            <p className="mb-16 text-center font-serif text-2xl italic text-silver md:text-4xl">
              “Benimle Şeytan arasındaki fark ne biliyor musun?”
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="mb-3 hidden grid-cols-[1fr_1px_1fr] md:grid">
              <div className="pr-10 text-right font-mono text-[0.58rem] uppercase tracking-[0.45em] text-silver-dim">
                Şeytan
              </div>
              <div />
              <div className="pl-10 font-mono text-[0.58rem] uppercase tracking-[0.45em] text-bone">
                Ben
              </div>
            </div>
            <div>
              <DuelRow devil="düşürdü." me="yerden kalkıp yeniden yazdım." />
              <DuelRow devil="yemin etti." me="imzaladım." />
              <DuelRow devil="teklif etti." me="sistemi kurdum." />
            </div>

            {/* Yerden Kalkış Vesikası */}
            <div className="mt-12 mx-auto max-w-xl overflow-hidden rounded-[2px] border border-white/10 bg-[#0c0c0c] p-2.5 sm:p-3 shadow-2xl">
              <div className="relative aspect-[16/11] overflow-hidden bg-black">
                <img
                  src={fallGroundImg}
                  alt="Yerden kalkıp yeniden yazdım — Salim Gümüş"
                  className="h-full w-full object-cover object-center filter contrast-[1.08] brightness-[0.96]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3.5 right-3.5 flex justify-between items-end">
                  <span className="font-mono text-[0.5rem] uppercase tracking-[0.25em] text-silver-dim">
                    Duruş · Yeniden İnşa
                  </span>
                  <span className="font-serif italic text-xs sm:text-sm text-bone">
                    “Yerden kalkıp yeniden yazdım.”
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-20 space-y-8 text-center">
              <p className="font-serif text-2xl text-silver md:text-3xl">Şeytan hata yaptı.</p>
              <p className="silver-text text-5xl leading-none tracking-[0.06em] sm:text-7xl md:text-8xl lg:text-9xl">
                BEN PRENSİP.
              </p>
            </div>
          </Reveal>

          <Ornament />

          <Reveal>
            <div className="mx-auto max-w-3xl">
              <p className="drop-cap font-serif text-xl leading-[1.9] text-bone/90 md:text-2xl md:leading-[1.9]">
                Aslında Şeytan’ın bile aklına gelmeyecekleri akıl edebiliyorken, melek gibi
                davrandığım için kusura bakmayın.
              </p>

              <div className="mt-16 space-y-6 font-serif text-xl leading-[1.9] text-bone/80 md:text-2xl md:leading-[1.9]">
                <p>
                  Ben Külkedisi’ni Sindirella’ya dönüştüren ayakkabının{" "}
                  <span className="italic text-silver">satıcısı</span> değilim.
                </p>
                <p>Siz sağ pabucu mu giydi, sol pabucu mu diye düşünürken,</p>
                <p className="text-right font-semibold text-white">
                  ben o pabucunu giymeyi unutturan adamım.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= II — CANAVARIN ALTINDAKİ YATAK ================= */}
      <section className="relative border-t border-bone/5 bg-ash">
        <div className="grid md:grid-cols-2 md:items-start">
          <div className="frame aspect-[4/3] md:sticky md:top-0 md:aspect-auto md:h-screen">
            <img src={bedImg} alt="Ayakları kesilmiş demir yatak, sisli ormanda" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ash via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-ash" />
          </div>

          <div className="px-6 py-24 md:px-14 md:py-36 lg:px-20">
            <Reveal>
              <ChapterMark num="II" title="Canavarın Altındaki Yatak" latin="sub lecto" align="left" />
              <p className="font-serif text-3xl italic leading-snug text-silver md:text-4xl">
                Yatağınızın altında canavar var diye tedirgin misiniz?
              </p>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-14 space-y-7 font-serif text-xl leading-relaxed text-bone/80 md:text-2xl md:leading-relaxed">
                <p>
                  Sizi terapiye gönderip olmayan bir canavarın yokluğuna{" "}
                  <span className="text-silver-dim line-through">inandırmam</span>.
                </p>
                <p className="font-display text-2xl font-bold uppercase tracking-[0.12em] text-white md:text-3xl">
                  Yatağın ayaklarını keserim.
                </p>
                <p>Altı kalmayan yatağın korkusu da kalmaz.</p>
              </div>
            </Reveal>

            <div className="my-14 h-px w-full bg-gradient-to-r from-silver/50 to-transparent" />

            <Reveal delay={100}>
              <div className="space-y-5">
                <p className="font-serif text-xl text-bone/80 md:text-2xl">
                  Çünkü ben korkuyla pazarlık etmem.
                </p>
                <p className="font-serif text-2xl font-semibold text-white md:text-3xl">
                  Korkunun kaynağını ortadan kaldırırım.
                </p>
              </div>
              <p className="mt-14 font-mono text-[0.65rem] uppercase tracking-[0.45em] text-silver">
                İşte bu, Salim Gümüş olmak.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= II.b — TOPRAK ================= */}
      <section className="relative">
        <div className="relative h-[80vh] min-h-[520px] overflow-hidden">
          <img
            src={soilImg}
            alt="Toprak yığınının üzerinde dik duran adam"
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={{ filter: "grayscale(1) contrast(1.05)" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-ink/30 to-ink" />
          <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
            <Reveal>
              <div className="section-mark mb-6">Bölüm II · devam</div>
              <p className="mx-auto max-w-3xl font-serif text-2xl leading-snug text-bone md:text-4xl md:leading-snug">
                Sizi çıkamayacağınız kadar derin bir mezara koyup üzerinize toprak atıyorlarsa{" "}
                <span className="font-semibold text-white">sevinmelisiniz</span>.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-6 py-24 md:py-32">
          <Reveal>
            <p className="font-serif text-2xl leading-relaxed text-bone/85 md:text-3xl md:leading-relaxed">
              Çünkü o toprak ayağınızın altına girerse,
              <br />
              sizi{" "}
              <span className="font-display font-black uppercase tracking-wider text-white">
                yükseltecektir
              </span>
              .
            </p>
          </Reveal>

          <Reveal delay={150}>
            <div className="mt-20 space-y-5 text-right">
              <p className="font-serif text-lg italic text-silver-dim md:text-xl">
                Tabii çaresizce yatıp kabullenmezseniz.
              </p>
              <p className="silver-text text-3xl leading-tight tracking-[0.08em] md:text-5xl">
                AYAĞA KALKIP
                <br />
                DİK DURURSANIZ.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= III — ŞEYTANLA KONUŞMAK ================= */}
      <section className="relative border-t border-bone/5 bg-ash">
        <div className="grid md:grid-cols-2 md:items-start">
          <div className="order-1 px-6 py-24 md:order-none md:px-14 md:py-36 lg:px-20">
            <Reveal>
              <ChapterMark num="III" title="Şeytanla Konuşmak" latin="colloquium" align="left" />
              <div className="space-y-6 font-serif text-2xl leading-relaxed text-bone/85 md:text-3xl">
                <p>Şeytan konuşmaz.</p>
                <p className="pl-6 text-bone/70">
                  Sana{" "}
                  <span className="font-display text-xl font-bold uppercase tracking-wider text-white md:text-2xl">
                    sormayı
                  </span>{" "}
                  öğretir.
                </p>
                <p className="pl-6 text-bone/70">Şüpheyi hediye eder.</p>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="my-14 border-l border-silver/40 py-2 pl-8">
                <p className="font-serif text-xl leading-relaxed text-bone/85 md:text-2xl">
                  Ben <span className="italic text-silver-dim">“okunan”</span> kutsal metinler
                  yerine,
                  <br />
                  <span className="font-display text-lg font-bold uppercase tracking-wider text-white md:text-xl">
                    “okuyan”
                  </span>{" "}
                  insanı seçiyorum.
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="space-y-5">
                <p className="font-serif text-2xl text-bone md:text-3xl">Şeytanla konuştum.</p>
                <p className="font-serif text-3xl italic text-silver-dim md:text-4xl">O susuyordu.</p>
                <p className="font-serif text-lg text-bone/70 md:text-xl">
                  Çünkü cevap vermek Tanrı’ya aittir.
                </p>
                <p className="pt-6 font-display text-lg font-semibold uppercase tracking-[0.15em] text-white md:text-2xl">
                  O bana soru sormayı öğretti.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="frame aspect-[4/3] md:sticky md:top-0 md:aspect-auto md:h-screen">
            <img src={ravenImg} alt="Kuzgun, yakın plan" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ash via-transparent to-transparent md:bg-gradient-to-l md:from-transparent md:to-ash" />
          </div>
        </div>
      </section>

      {/* ================= IV — CEHENNEME YATIRIM ================= */}
      <section className="relative overflow-hidden">
        <img
          src={tableImg}
          alt="Masanın başında oturan adam"
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ filter: "grayscale(1) contrast(1.05)" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-ink/80" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink" />

        <div className="relative mx-auto max-w-3xl px-6 py-28 md:py-40">
          <Reveal>
            <ChapterMark num="IV" title="Cehenneme Yatırım" latin="in infernum" />
            <div className="space-y-4 text-center">
              <p className="font-serif text-3xl italic leading-tight text-silver md:text-5xl">
                Cehenneme düşmez.
              </p>
              <p className="silver-text text-4xl leading-tight tracking-[0.08em] md:text-6xl lg:text-7xl">
                ORAYA YATIRIM YAPAR.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-20 space-y-5 font-serif text-xl leading-relaxed text-bone/85 md:text-2xl">
              <p>Kurallar onun için yazılmadı.</p>
              <p className="pl-6 font-semibold text-white">Yazarını işe aldı.</p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="my-16 grid gap-8 md:grid-cols-2">
              <div className="border-l border-silver-dim/50 pl-6">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-silver-dim">
                  Kendini bilmeyenler için
                </p>
                <p className="mt-2 font-serif text-2xl text-bone/80 md:text-3xl">bir tehlikedir.</p>
              </div>
              <div className="border-l border-bone pl-6">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-bone">
                  Kendini bilenler içinse
                </p>
                <p className="mt-2 font-serif text-2xl text-white md:text-3xl">bir ilham kaynağı.</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="space-y-14 font-serif text-xl leading-relaxed text-bone/85 md:text-2xl">
              <div className="space-y-3">
                <p>Şeytan onunla pazarlık etmez.</p>
                <p className="text-bone/70">
                  Çünkü masada oturan
                  <br />
                  <span className="font-display text-2xl font-bold uppercase tracking-[0.15em] text-white md:text-4xl">
                    zaten odur.
                  </span>
                </p>
              </div>
              <div className="space-y-3">
                <p>İlk hamleyi yapmaz.</p>
                <p className="text-bone/70">
                  Çünkü oyun zaten
                  <br />
                  <span className="font-display text-2xl font-bold uppercase tracking-[0.15em] text-white md:text-4xl">
                    onun varlığıyla başlamıştır.
                  </span>
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= CODA ================= */}
      <section className="relative overflow-hidden border-t border-bone/5">
        <img
          src={heroImg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full -scale-x-100 object-cover object-[50%_30%] opacity-40"
          style={{ filter: "grayscale(1) contrast(1.1) blur(2px)" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-ink/70 to-ink" />

        <div className="relative mx-auto max-w-4xl px-6 py-32 text-center md:py-44">
          <Reveal>
            <p className="font-serif text-xl leading-relaxed text-bone/75 md:text-2xl">
              Ben cennetin steril sakinlerinden değilim.
            </p>
            <p className="mt-4 font-serif text-xl italic leading-relaxed text-bone/75 md:text-2xl">
              Meleklerle aynı notaya susmam.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-16">
              <p className="font-serif text-2xl text-bone md:text-3xl">Benim sesim,</p>
              <p className="silver-text mt-5 text-3xl leading-[1.15] tracking-[0.04em] sm:text-4xl md:text-6xl">
                yasak meyveyi ısıran
                <br />
                çene kemiğinden yükselir.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="relative border-t border-bone/10 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 flex items-center justify-center gap-4">
            <span className="h-px w-16 bg-silver-dim/60" />
            <span className="text-silver">✦</span>
            <span className="h-px w-16 bg-silver-dim/60" />
          </div>

          <p className="silver-text text-3xl tracking-[0.3em] md:text-5xl">SALIM GÜMÜŞ</p>
          <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.5em] text-silver-dim">
            Prensip · Kural · Yıkım
          </p>

          <p className="mt-16 font-serif text-base italic text-bone/40">
            “Korkunun kaynağını ortadan kaldırırım.”
          </p>
        </div>
      </footer>
    </div>
  );
}
