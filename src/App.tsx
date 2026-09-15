/**
 * BEN PRENSİP · Vesika 01 — statik şablon.
 *
 * Mimari (bkz. docs/AUDIT.md §8):
 *  · Metinlerin tamamı `src/content.ts` içinde; bu dosya yalnızca biçimlendirir.
 *  · Üretimde `scripts/prerender.mjs` bu ağacı statik HTML'e çevirir; tarayıcıda React
 *    sadece `src/islands.tsx` içindeki üç etkileşimi ayağa kaldırır.
 *  · Görseller `src/assets/opt/*.webp`: grayscale + render genişliğinde (8,35 MB → ~0,6 MB).
 *  · `dangerouslySetInnerHTML` yok: satır içi vurgular `**kalın** / *italik* / ~~üstü çizili~~`
 *    işaretlemesiyle `renderInline()` içinde React elemanına çevrilir.
 */
import "./index.css";
// alt kümeleştirilmiş, kendi barındırılan fontlar (scripts/subset-fonts.py üretir)
import "./fonts.css";
import { Fragment, type ReactNode } from "react";
import { site, vesika, type ImageRef, type Line } from "./content";

/* ---------- görsel köprüsü: content.ts yolu → Vite'ın hash'lenmiş URL'i ---------- */

const IMAGES = import.meta.glob("./assets/opt/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const resolve = (i: ImageRef): ImageRef => {
  const key = `./assets/opt/${i.src.split("/").pop()}`;
  const url = IMAGES[key];
  if (!url) throw new Error(`Görsel bulunamadı: ${key} (scripts/optimize-assets.mjs çalıştırın)`);
  return { ...i, src: url };
};

/* ---------- satır içi işaret dili → React ---------- */

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~)/g;

function renderInline(text: string): ReactNode {
  const parts = text.split(INLINE).filter(Boolean);
  return parts.map((p, i) => {
    if (p.startsWith("**")) return <b key={i}>{p.slice(2, -2)}</b>;
    if (p.startsWith("*")) return <i key={i}>{p.slice(1, -1)}</i>;
    if (p.startsWith("~~")) return <s key={i}>{p.slice(2, -2)}</s>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

/* ---------- primitives ---------- */

/** Kaydırma-animasyonu sarmalayıcısı. Animasyon CSS'te; JS yalnızca kilidi açar. */
function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`reveal ${className}`.trim()}>{children}</div>;
}

function Ornament() {
  return (
    <div className="ornament my-20 text-xs" aria-hidden="true">
      <span className="text-silver-dim">✦</span>
    </div>
  );
}

function ChapterMark({
  num,
  title,
  latin,
  id,
  align = "center",
}: {
  num: string;
  title: string;
  latin?: string;
  id: string;
  align?: "center" | "left";
}) {
  const isCenter = align === "center";
  return (
    <div className={`mb-14 ${isCenter ? "text-center" : "text-left"}`}>
      <div className="section-mark mb-4">Bölüm {num}</div>
      <h2
        id={id}
        className="font-display text-3xl font-bold uppercase leading-tight tracking-[0.14em] text-bone md:text-5xl"
      >
        {title}
      </h2>
      {latin && (
        <div className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.4em] text-silver-dim">
          {latin}
        </div>
      )}
      <div className={`mt-6 h-px w-16 bg-silver ${isCenter ? "mx-auto" : ""}`} aria-hidden="true" />
    </div>
  );
}

/** Alıntıyı kaynak + bağlantıyla panoya kopyalar (DM'de gönderilebilir hâle getirir). */
function CopyQuote({ text, inline = false }: { text: string; inline?: boolean }) {
  return (
    <span className={`group/copy ${inline ? "ml-4 align-middle" : "mt-5 block"}`}>
      <CopyButton text={text} />
    </span>
  );
}

/** Kopyalama yalnızca JS'li tarayıcıda anlamlı: adaya gerek yok, 12 satır vanilla. */
function CopyButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      data-copy={text}
      className="copy-quote font-mono text-[0.55rem] uppercase tracking-[0.3em] text-silver-dim/70 transition-colors hover:text-bone focus-visible:text-bone"
    >
      alıntıyı kopyala
    </button>
  );
}

function DuelRow({ devil, me }: { devil: string; me: string }) {
  return (
    <div className="duel-row">
      <div className="py-6 pr-0 font-serif text-2xl italic text-silver-dim md:pr-10 md:text-right md:text-3xl">
        <span className="mr-3 font-display text-xl not-italic tracking-widest text-silver-dim/70">O</span>
        {devil}
      </div>
      <div className="duel-divider" aria-hidden="true" />
      <div className="pb-6 pl-0 font-serif text-2xl font-medium text-bone md:py-6 md:pl-10 md:text-3xl">
        <span className="mr-3 font-display text-xl font-bold tracking-widest text-bone">Ben</span>
        {me}
      </div>
    </div>
  );
}

function BentNail() {
  return (
    <div
      className="pointer-events-none absolute -top-7 left-1/2 z-30 -translate-x-1/2 select-none"
      aria-hidden="true"
    >
      <svg
        width="54"
        height="58"
        viewBox="0 0 54 58"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
        focusable="false"
      >
        <defs>
          <linearGradient id="rustIron" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3d2a1b" />
            <stop offset="40%" stopColor="#7a4a2a" />
            <stop offset="70%" stopColor="#241a12" />
            <stop offset="100%" stopColor="#a35527" />
          </linearGradient>
        </defs>
        <ellipse cx="27" cy="12" rx="6" ry="3.5" fill="#000" opacity="0.95" />
        <path d="M22 11 L16 8 M32 13 L38 16 M27 15 L28 20" stroke="#222" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M27 12 C30 22 35 32 44 42" stroke="rgba(0,0,0,0.7)" strokeWidth="7" strokeLinecap="round" filter="blur(2px)" />
        <line x1="27" y1="12" x2="28" y2="23" stroke="#2a1e15" strokeWidth="5.5" strokeLinecap="round" />
        <line x1="27" y1="12" x2="28" y2="23" stroke="url(#rustIron)" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M28 23 Q29 28 40 40" stroke="#1c140e" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M28 23 Q29 28 40 40" stroke="url(#rustIron)" strokeWidth="3.8" strokeLinecap="round" />
        <path d="M28 23 Q29 28 40 40" stroke="#d4793b" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        <ellipse cx="26.5" cy="11.5" rx="6.5" ry="3.8" fill="#140e0a" transform="rotate(-18 26.5 11.5)" />
        <ellipse cx="26" cy="11" rx="5.5" ry="2.8" fill="#543722" transform="rotate(-18 26 11)" />
        <ellipse cx="25.5" cy="10.5" rx="4" ry="1.8" fill="#9e633a" transform="rotate(-18 25.5 10.5)" />
        <circle cx="31" cy="27" r="1.1" fill="#c45d25" />
        <circle cx="35" cy="33" r="1.2" fill="#943d16" />
        <circle cx="38" cy="38" r="0.9" fill="#d97230" />
      </svg>
    </div>
  );
}

function RustedTack() {
  return (
    <div
      className="pointer-events-none absolute -top-3 left-1/2 z-20 -translate-x-1/2 select-none"
      aria-hidden="true"
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" focusable="false">
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

/** Kanıt klasörü görseli. */
function Plate({
  image,
  className = "",
  eager = false,
  ratio = "w-full",
  tint = "from-black/60 via-transparent to-transparent",
  caption,
  quote,
}: {
  image: ImageRef;
  className?: string;
  eager?: boolean;
  ratio?: string;
  tint?: string;
  caption?: string;
  quote?: string;
}) {
  const img = resolve(image);
  return (
    <div className={`frame relative overflow-hidden bg-[#0d0d0d] ${className}`.trim()}>
      <div className={`relative ${ratio}`}>
        <img
          src={img.src}
          alt={img.alt}
          width={img.w}
          height={img.h}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "auto"}
          className="h-full w-full object-cover object-center"
        />
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${tint}`} aria-hidden="true" />
        {(caption || quote) && (
          <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between">
            {caption && (
              <span className="font-mono text-[0.5rem] uppercase tracking-[0.25em] text-silver-dim">{caption}</span>
            )}
            {quote && <span className="font-serif text-xs italic text-bone sm:text-sm">{quote}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- satır tipografisi ---------- */

function lineClass(role: Line["as"]) {
  switch (role) {
    case "lead":
      return "font-serif text-3xl italic text-silver-dim md:text-4xl";
    case "dim":
      return "pl-6 font-serif text-xl text-bone/70 md:text-2xl";
    case "strong":
      return "font-display text-2xl font-bold uppercase tracking-[0.12em] text-white md:text-3xl";
    case "right":
      return "text-right font-serif text-xl font-semibold text-white md:text-2xl";
    case "dropcap":
      return "drop-cap font-serif text-xl leading-[1.9] text-bone/90 md:text-2xl md:leading-[1.9]";
    case "strike":
      return "font-display text-2xl font-bold uppercase leading-snug tracking-[0.12em] text-white md:text-3xl";
    case "quote":
      return "border-l border-silver/40 py-1 pl-8 font-serif text-xl leading-relaxed text-bone/85 md:text-2xl";
    default:
      return "font-serif text-xl leading-relaxed text-bone/85 md:text-2xl";
  }
}

function ChapterLines({ lines, only }: { lines: Line[]; only?: (l: Line) => boolean }) {
  const shown = lines.filter((l) => !String(l.as).startsWith("split") && (!only || only(l)));
  return (
    <div className="space-y-7">
      {shown.map((l, i) => (
        <p key={i} className={lineClass(l.as)}>
          {renderInline(l.t)}
        </p>
      ))}
    </div>
  );
}

/* ---------- hero ---------- */

function Exhibit({ ex, tilt }: { ex: (typeof vesika.exhibits)[number]; tilt: number }) {
  const img = resolve(ex.img);
  return (
    <div className="group relative">
      <RustedTack />
      <div
        className="companion-snapshot w-[84px] rounded-[2px] border border-white/10 bg-[#0c0c0c] p-1.5 sm:w-[96px] sm:p-2 md:w-[116px] lg:w-[128px]"
        style={{ rotate: `${tilt}deg` }}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-black">
          <img
            src={img.src}
            alt={img.alt}
            width={img.w}
            height={img.h}
            loading={tilt > 0 ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            aria-hidden="true"
          />
        </div>
        <div className="mt-1 text-center font-mono text-[0.4rem] uppercase tracking-[0.18em] text-silver-dim/80 sm:mt-1.5 sm:text-[0.46rem]">
          {ex.tag} · {ex.label}
        </div>
      </div>
    </div>
  );
}

function HeroCarving({ side }: { side: "left" | "right" }) {
  const lines = vesika.carving[side];
  return (
    <>
      {lines.map((t, i) => (
        <div key={i}>
          <p className={`carved-wall-text text-xs font-light leading-relaxed xl:text-[0.82rem] ${i > 0 ? "text-silver-dim/90" : ""}`}>
            {renderInline(t)}
          </p>
          {i === 0 && (
            <div
              className={`carved-groove-line my-3.5 h-px w-14 opacity-75 ${side === "left" ? "ml-auto" : "mr-auto"}`}
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </>
  );
}

/* ---------- app ---------- */

export default function App() {
  const [c1, c2, c2b, c3, c4] = vesika.chapters;
  const portrait = resolve(vesika.portrait);
  const coda = resolve(vesika.codaImage);

  return (
    <div className="relative min-h-[100svh] overflow-x-clip bg-ink text-bone">
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-full focus:border focus:border-bone/30 focus:bg-black focus:px-4 focus:py-2 focus:font-mono focus:text-[0.6rem] focus:uppercase focus:tracking-[0.3em]"
      >
        manifestoya geç
      </a>

      {/* adalar */}
      <div className="fixed left-0 top-0 z-50 h-px w-full" aria-hidden="true">
        <IslandSlot name="ScrollProgress" />
      </div>
      <IslandSlot name="Tools" />

      {/* yan raylar */}
      <div className="pointer-events-none fixed right-6 top-0 z-40 hidden h-full items-center md:flex" aria-hidden="true">
        <div className="vertical-text font-mono text-[0.58rem] tracking-[0.5em] text-silver-dim/50">
          {site.person.toUpperCase()} · MANIFESTO · MMXXVI
        </div>
      </div>
      <div className="pointer-events-none fixed left-6 top-0 z-40 hidden h-full items-center md:flex" aria-hidden="true">
        <div className="vertical-text font-mono text-[0.58rem] tracking-[0.5em] text-silver-dim/50">
          {site.brand} No: {vesika.no}
        </div>
      </div>

      <header className="wall-surface relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pb-24 pt-16 sm:px-6 md:px-8 md:pb-28 md:pt-20">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-24 left-1/2 h-[650px] max-w-full w-[850px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(236,233,226,0.08),transparent)] blur-3xl" />
        </div>

        <h1 className="sr-only">
          {site.title} — {vesika.chapters.length} bölüm: {vesika.chapters.map((c) => c.title).join(", ")}
        </h1>

        <div
          className="hero-text mb-10 flex items-center justify-center gap-4 text-silver-dim sm:mb-12"
          style={{ animationDelay: "120ms" }}
        >
          <span className="h-px w-10 bg-silver-dim/40 md:w-16" aria-hidden="true" />
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.4em] text-silver-dim sm:text-[0.62rem] sm:tracking-[0.5em]">
            {site.person} · Vesika No: {vesika.no}
          </span>
          <span className="h-px w-10 bg-silver-dim/40 md:w-16" aria-hidden="true" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center">
          {/* mobil / tablet kazısı */}
          <div className="mb-8 max-w-md select-none px-4 text-center lg:hidden">
            {vesika.carving.left.map((t, i) => (
              <p key={i} className={`carved-wall-text text-[0.72rem] font-light uppercase leading-relaxed sm:text-xs ${i > 0 ? "text-silver-dim" : ""}`}>
                {t}
              </p>
            ))}
            <div className="carved-groove-line mx-auto my-2.5 h-px w-16 opacity-70" aria-hidden="true" />
            {vesika.carving.right.map((t, i) => (
              <p key={i} className="carved-wall-text text-[0.72rem] font-light uppercase leading-relaxed sm:text-xs">
                {t}
              </p>
            ))}
          </div>

          <div className="relative flex w-full items-center justify-center gap-2 px-2 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
            <div className="hidden max-w-[170px] select-none flex-col justify-center pr-2 text-right lg:flex xl:max-w-[210px] xl:pr-4">
              <HeroCarving side="left" />
            </div>

            <div className="flex flex-col gap-3 self-center sm:gap-5">
              {vesika.exhibits.slice(0, 2).map((ex, i) => (
                <Exhibit key={ex.tag} ex={ex} tilt={i === 0 ? -3.5 : -1.8} />
              ))}
            </div>

            <div className="group relative mx-1 pt-4 sm:mx-2">
              <BentNail />
              <div className="hanging-portrait w-[190px] rounded-[2px] border border-white/10 bg-[#0c0c0c] p-2 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95)] sm:w-[260px] sm:p-3 md:w-[330px] md:p-4 lg:w-[380px]" style={{ rotate: "-0.6deg" }}>
                <div className="relative aspect-[3/4] overflow-hidden bg-black">
                  <img
                    src={portrait.src}
                    alt={portrait.alt}
                    width={portrait.w}
                    height={portrait.h}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    className="h-full w-full object-cover object-center"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" aria-hidden="true" />
                </div>
                <div className="mt-2 flex items-center justify-between px-1 font-mono text-[0.42rem] uppercase tracking-[0.22em] text-silver-dim sm:mt-3 sm:text-[0.5rem]">
                  <span>{vesika.carving.caption.split(" · ")[0]}</span>
                  <span className="font-semibold tracking-widest text-bone/50">{site.person}</span>
                  <span>{vesika.carving.caption.split(" · ")[1]}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 self-center sm:gap-5">
              {vesika.exhibits.slice(2, 4).map((ex, i) => (
                <Exhibit key={ex.tag} ex={ex} tilt={i === 0 ? 3.2 : 4.6} />
              ))}
            </div>

            <div className="hidden max-w-[170px] select-none flex-col justify-center pl-2 text-left lg:flex xl:max-w-[210px] xl:pl-4">
              <HeroCarving side="right" />
            </div>
          </div>

          <IslandSlot name="InkWriter" />

          <nav aria-label="Bölümler" className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:mt-12">
            {vesika.chapters.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-silver-dim transition-colors hover:text-bone focus-visible:text-bone"
              >
                {c.num} · {c.title}
              </a>
            ))}
          </nav>

          <div className="mt-8 flex flex-col items-center gap-2 opacity-60 transition-opacity hover:opacity-100">
            <span className="font-mono text-[0.52rem] uppercase tracking-[0.45em] text-silver-dim">aşağı kaydır</span>
            <div className="h-7 w-px bg-gradient-to-b from-silver-dim to-transparent" aria-hidden="true" />
          </div>
        </div>
      </header>

      <main id="icerik">
        {/* ================= I — BEN VE ŞEYTAN ================= */}
        <section id={c1.id} aria-labelledby={`${c1.id}-baslik`} className="relative px-6 py-28 md:py-36">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <ChapterMark num={c1.num} title={c1.title} latin={c1.latin} id={`${c1.id}-baslik`} />
              {c1.lead && <p className="mb-16 text-center font-serif text-2xl italic text-silver md:text-4xl">{c1.lead}</p>}
            </Reveal>

            <Reveal>
              <div className="mb-3 hidden grid-cols-[1fr_1px_1fr] md:grid">
                <div className="pr-10 text-right font-mono text-[0.58rem] uppercase tracking-[0.45em] text-silver-dim">Şeytan</div>
                <div />
                <div className="pl-10 font-mono text-[0.58rem] uppercase tracking-[0.45em] text-bone">Ben</div>
              </div>
              <div>
                {c1.duel?.map((d) => (
                  <DuelRow key={d.devil} devil={d.devil} me={d.me} />
                ))}
              </div>

              {c1.image && (
                <figure className="mx-auto mt-12 max-w-xl rounded-[2px] border border-white/10 bg-[#0c0c0c] p-2.5 shadow-2xl sm:p-3">
                  <Plate
                    image={c1.image.img}
                    ratio="aspect-[16/11]"
                    caption={c1.image.caption}
                    quote={c1.image.quote}
                    tint="from-black/80 via-transparent to-transparent"
                  />
                </figure>
              )}
            </Reveal>

            <Reveal>
              <div className="mt-20 space-y-8 text-center">
                <h3 className="font-serif text-2xl text-silver md:text-3xl">{c1.strike}</h3>
                <p className="silver-text text-5xl leading-none tracking-[0.06em] sm:text-7xl md:text-8xl lg:text-9xl">{c1.big}</p>
                {c1.copy && <CopyQuote text={c1.copy} />}
              </div>
            </Reveal>

            <Ornament />

            <Reveal>
              <div className="mx-auto max-w-3xl">
                {c1.lines && <ChapterLines lines={c1.lines} />}
                {c1.note && (
                  <p className="mt-16 text-center font-mono text-[0.55rem] uppercase tracking-[0.35em] text-silver-dim">{c1.note}</p>
                )}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= II — CANAVARIN ALTINDAKİ YATAK ================= */}
        <section id={c2.id} aria-labelledby={`${c2.id}-baslik`} className="relative border-t border-bone/5 bg-ash">
          <div className="grid md:grid-cols-2 md:items-start">
            <div className="relative hidden md:sticky md:top-0 md:block md:h-screen">
              {c2.image && (
                <Plate image={c2.image.img} className="absolute inset-0 h-full" ratio="h-full" tint="from-transparent via-transparent to-ash" />
              )}
            </div>

            <div className="relative z-10 px-6 py-24 md:px-14 md:py-36 lg:px-20">
              <Reveal>
                <ChapterMark num={c2.num} title={c2.title} latin={c2.latin} align="left" id={`${c2.id}-baslik`} />
                {c2.lead && <p className="font-serif text-3xl italic leading-snug text-silver md:text-4xl">{c2.lead}</p>}
              </Reveal>

              {c2.lines && (
                <Reveal>
                  <div className="mt-14">
                    <ChapterLines lines={c2.lines} only={(l) => l.as !== "normal"} />
                  </div>
                </Reveal>
              )}

              <div className="my-14 h-px w-full bg-gradient-to-r from-silver/50 to-transparent" aria-hidden="true" />

              <Reveal>
                <div className="space-y-5">
                  {c2.lines && <ChapterLines lines={c2.lines} only={(l) => l.as === "normal" || l.as === "strong"} />}
                </div>
                <p className="mt-14 font-mono text-[0.65rem] uppercase tracking-[0.45em] text-silver">{c2.strike}</p>
                {c2.copy && <CopyQuote text={c2.copy} />}
              </Reveal>
            </div>

            {/* mobilde görsel metnin altında */}
            {c2.image && (
              <div className="md:hidden">
                <Plate image={c2.image.img} ratio="aspect-[4/3]" caption={c2.image.caption} tint="from-ash via-transparent to-transparent" />
              </div>
            )}
          </div>
        </section>

        {/* ================= II.b — TOPRAK ================= */}
        <section id={c2b.id} aria-labelledby={`${c2b.id}-baslik`} className="relative">
          <div className="relative h-[80vh] min-h-[520px] overflow-hidden">
            {c2b.fullBleed && (
              <img
                src={resolve(c2b.fullBleed).src}
                alt={c2b.fullBleed.alt}
                width={c2b.fullBleed.w}
                height={c2b.fullBleed.h}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-ink/30 to-ink" aria-hidden="true" />
            <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
              <Reveal>
                <h2 id={`${c2b.id}-baslik`} className="sr-only">
                  Bölüm {c2b.num} · {c2b.title}
                </h2>
                <div className="section-mark mb-6">Bölüm {c2b.num}</div>
                <p className="mx-auto max-w-3xl font-serif text-2xl leading-snug text-bone md:text-4xl md:leading-snug">{c2b.lead}</p>
              </Reveal>
            </div>
          </div>

          <div className="mx-auto max-w-3xl px-6 py-24 md:py-32">
            {c2b.lines && <ChapterLines lines={c2b.lines} />}
            <Reveal>
              <div className="mt-20 text-right">
                <h3 className="silver-text text-3xl leading-tight tracking-[0.08em] md:text-5xl">{c2b.strike}</h3>
                {c2b.copy && <CopyQuote text={c2b.copy} />}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= III — ŞEYTANLA KONUŞMAK ================= */}
        <section id={c3.id} aria-labelledby={`${c3.id}-baslik`} className="relative border-t border-bone/5 bg-ash">
          <div className="grid md:grid-cols-2 md:items-start">
            <div className="order-1 px-6 py-24 md:order-none md:px-14 md:py-36 lg:px-20">
              <Reveal>
                <ChapterMark num={c3.num} title={c3.title} latin={c3.latin} align="left" id={`${c3.id}-baslik`} />
                {c3.lines && (
                  <div className="space-y-6">
                    {c3.lines.slice(0, 3).map((l, i) => (
                      <p key={i} className={i === 0 ? "font-serif text-2xl text-bone md:text-3xl" : lineClass("dim")}>
                        {renderInline(l.t)}
                      </p>
                    ))}
                  </div>
                )}
              </Reveal>

              {c3.lines && (
                <Reveal>
                  <blockquote className="my-14">
                    <p className={lineClass("quote")}>{renderInline(c3.lines[3].t)}</p>
                  </blockquote>
                </Reveal>
              )}

              {c3.lines && (
                <Reveal>
                  <div className="space-y-5">
                    {c3.lines.slice(4).map((l, i) => (
                      <p key={i} className={lineClass(l.as)}>
                        {renderInline(l.t)}
                      </p>
                    ))}
                  </div>
                  {c3.copy && <CopyQuote text={c3.copy} />}
                </Reveal>
              )}
            </div>

            <div className="relative order-none md:sticky md:top-0 md:h-screen">
              {c3.image && (
                <Plate image={c3.image.img} className="absolute inset-0 h-full" ratio="h-full" tint="from-transparent via-transparent to-ash" />
              )}
            </div>
          </div>
        </section>

        {/* ================= IV — CEHENNEME YATIRIM ================= */}
        <section id={c4.id} aria-labelledby={`${c4.id}-baslik`} className="relative overflow-hidden">
          {c4.fullBleed && (
            <>
              <img
                src={resolve(c4.fullBleed).src}
                alt={c4.fullBleed.alt}
                width={c4.fullBleed.w}
                height={c4.fullBleed.h}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-ink/60 to-ink" aria-hidden="true" />
            </>
          )}

          <div className="relative mx-auto max-w-3xl px-6 py-28 md:py-40">
            <Reveal>
              <ChapterMark num={c4.num} title={c4.title} latin={c4.latin} id={`${c4.id}-baslik`} />
              <div className="space-y-4 text-center">
                <p className="font-serif text-3xl italic leading-tight text-silver md:text-5xl">{c4.big}</p>
                <h3 className="silver-text text-4xl leading-tight tracking-[0.08em] md:text-6xl lg:text-7xl">{c4.strike}</h3>
                {c4.copy && <CopyQuote text={c4.copy} />}
              </div>
            </Reveal>

            {c4.lines && (
              <Reveal>
                <div className="mt-20 space-y-5">
                  {c4.lines.slice(0, 2).map((l, i) => (
                    <p key={i} className={lineClass(l.as)}>
                      {renderInline(l.t)}
                    </p>
                  ))}
                </div>
              </Reveal>
            )}

            {c4.lines && (
              <Reveal>
                <div className="my-16 grid gap-8 md:grid-cols-2">
                  {(c4.split ?? []).map((s, i) => (
                    <div key={i} className={i === 0 ? "border-l border-silver-dim/50 pl-6" : "border-l border-bone pl-6"}>
                      <p className={`font-mono text-[0.6rem] uppercase tracking-[0.3em] ${i === 0 ? "text-silver-dim" : "text-bone"}`}>{s.for}</p>
                      <p className="mt-2 font-serif text-2xl text-white/90 md:text-3xl">{s.then}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {c4.lines && (
              <Reveal>
                <div className="space-y-14">
                  {(c4.moves ?? []).map((m, i) => (
                    <div key={i} className="space-y-3">
                      <p className="font-serif text-xl leading-relaxed text-bone/85 md:text-2xl">{m.open}</p>
                      <p className="text-bone/70">
                        <span className="font-display text-2xl font-bold uppercase tracking-[0.15em] text-white md:text-4xl">
                          {m.turn}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </section>

        {/* ================= CODA ================= */}
        <section className="relative overflow-hidden border-t border-bone/5" aria-label="Kapanış">
          <img
            src={coda.src}
            alt=""
            aria-hidden="true"
            width={coda.w}
            height={coda.h}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full -scale-x-100 object-cover object-[50%_30%] opacity-40"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-ink/70 to-ink" aria-hidden="true" />
          <div className="relative mx-auto max-w-4xl px-6 py-32 text-center md:py-44">
            <Reveal>
              <p className="font-serif text-xl leading-relaxed text-bone/75 md:text-2xl">{vesika.coda[0]}</p>
              <p className="mt-4 font-serif text-xl italic leading-relaxed text-bone/75 md:text-2xl">{vesika.coda[1]}</p>
            </Reveal>
            <Reveal>
              <div className="mt-16">
                <p className="font-serif text-2xl text-bone md:text-3xl">Benim sesim,</p>
                <p className="silver-text mt-5 text-3xl leading-[1.15] tracking-[0.04em] sm:text-4xl md:text-6xl">
                  yasak meyveyi ısıran<br />
                  çene kemiğinden yükselir.
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="relative border-t border-bone/10 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 flex items-center justify-center gap-4" aria-hidden="true">
            <span className="h-px w-16 bg-silver-dim/60" />
            <span className="text-silver">✦</span>
            <span className="h-px w-16 bg-silver-dim/60" />
          </div>

          <p className="silver-text text-3xl tracking-[0.28em] md:text-5xl">{vesika.footer.name}</p>
          <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.5em] text-silver-dim">{vesika.footer.tagline}</p>
          <p className="mt-16 font-serif text-base italic text-bone/40">{vesika.footer.quote}</p>

          <div className="mt-14 flex flex-col items-center gap-4">
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.35em] text-silver-dim">
              Vesika No: {vesika.no} · {vesika.date} · {vesika.place}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {site.handle.ig && <FootLink href={`https://instagram.com/${site.handle.ig}`}>instagram</FootLink>}
              {site.handle.x && <FootLink href={`https://x.com/${site.handle.x}`}>x</FootLink>}
              {site.handle.yt && <FootLink href={`https://youtube.com/@${site.handle.yt}`}>youtube</FootLink>}
              {site.handle.mail && <FootLink href={`mailto:${site.handle.mail}`}>yaz</FootLink>}
              <FootLink href="#icerik">↑ başa dön</FootLink>
            </div>
            <p className="mt-6 max-w-md font-serif text-sm text-bone/40">
              Bu manifestodan alıntı yapabilirsiniz: bir cümle + bağlantı yeterli. Toplu kopyalama ve izinsiz
              türetme yapılmaz — bkz. <code className="font-mono text-[0.7rem]">docs/LISENS.md</code>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FootLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="font-mono text-[0.58rem] uppercase tracking-[0.3em] text-bone/70 underline decoration-silver-dim/40 underline-offset-4 transition-colors hover:text-bone focus-visible:text-bone"
    >
      {children}
    </a>
  );
}

/* ---------- ada yuvaları ----------
 * Buradaki boş `<div data-island>` düğümleri, `scripts/prerender.mjs` tarafından
 * olduğu gibi bırakılır; tarayıcıda `src/main.tsx` aynı düğümlerin içine gerçek
 * bileşenleri bağlar. JS yoksa yuva sessizce kaybolur, manifesto okunmaya devam eder.
 */
function IslandSlot({ name }: { name: "ScrollProgress" | "InkWriter" | "Tools" }) {
  return <div data-island={name} />;
}
