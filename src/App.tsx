import { useEffect, useRef, useState, type ReactNode } from "react";
import heroImg from "./assets/hero.jpg";
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

      {/* ================= HERO ================= */}
      <header className="relative h-[100svh] min-h-[640px] overflow-hidden">
        {/* image w/ parallax */}
        <div
          className="absolute -inset-y-[10%] inset-x-0 will-change-transform"
          style={{ transform: `translate3d(0, ${y * 0.22}px, 0)` }}
        >
          <div className="hero-img h-full w-full">
            <img
              src={heroImg}
              alt="Bir kanadı beyaz, bir kanadı siyah; omzunda karga — Salim Gümüş"
              className="h-full w-full object-cover object-[50%_35%]"
              style={{ filter: "grayscale(1) contrast(1.05)" }}
            />
          </div>
        </div>

        {/* mist */}
        <div className="mist pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute left-1/4 top-1/3 h-[60vh] w-[60vw] rounded-full bg-[radial-gradient(closest-side,rgba(236,233,226,0.12),transparent)] blur-3xl" />
        </div>

        {/* overlays */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/10 to-ink" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/50 via-transparent to-ink/50" />

        {/* top label */}
        <div className="hero-text absolute left-0 right-0 top-10 flex items-center justify-center gap-4 text-silver" style={{ animationDelay: "200ms" }}>
          <span className="h-px w-10 bg-silver/60 md:w-16" />
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.55em]">Salim Gümüş</span>
          <span className="h-px w-10 bg-silver/60 md:w-16" />
        </div>

        {/* wing labels */}
        <div className="hero-text absolute bottom-10 left-8 hidden md:block" style={{ animationDelay: "1100ms" }}>
          <div className="font-mono text-[0.58rem] uppercase tracking-[0.5em] text-bone/70">Melek</div>
          <div className="mt-1 font-mono text-[0.5rem] uppercase tracking-[0.3em] text-silver-dim">
            sol kanat
          </div>
        </div>
        <div className="hero-text absolute bottom-10 right-8 hidden text-right md:block" style={{ animationDelay: "1200ms" }}>
          <div className="font-mono text-[0.58rem] uppercase tracking-[0.5em] text-silver-dim">Şeytan</div>
          <div className="mt-1 font-mono text-[0.5rem] uppercase tracking-[0.3em] text-silver-dim/60">
            sağ kanat
          </div>
        </div>

        {/* headline */}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-24 md:pb-28">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="font-serif text-4xl font-light italic leading-[1.1] text-bone sm:text-5xl md:text-7xl lg:text-8xl">
              <span className="hero-text block" style={{ animationDelay: "500ms" }}>
                Sikemeyeceğiniz kadar{" "}
                <span className="font-semibold not-italic text-white">tecrübeli</span>,
              </span>
              <span className="hero-text block" style={{ animationDelay: "800ms" }}>
                sikemeyecek kadar{" "}
                <span className="font-semibold not-italic text-silver-dim">yorgun</span>.
              </span>
            </h1>

            <div className="hero-text mt-14 flex flex-col items-center gap-3" style={{ animationDelay: "1500ms" }}>
              <div className="pulse-slow font-mono text-[0.58rem] tracking-[0.45em] text-silver-dim">
                AŞAĞI KAYDIR
              </div>
              <div className="pulse-slow h-10 w-px bg-gradient-to-b from-silver to-transparent" />
            </div>
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
