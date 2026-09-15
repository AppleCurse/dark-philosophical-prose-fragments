/**
 * Vesika 01 — tek doğruluk kaynağı (metinler burada, DOM `src/App.tsx`'te).
 *
 * Bu ayrımın üç kazançları:
 *  1) prerender + sosyal kart + arama için içeriğin veri olarak okunabilmesi,
 *  2) EN sürümünün ayrı bir veri dosyası olarak gelebilmesi (`lang: "en"`),
 *  3) `scripts/make-posts.mjs` ile aynı veriden Instagram/X gönderi seti üretilebilmesi.
 *
 * Satır içi vurgu işaretlemesi: **kalın** · *italik* · ~~üstü çizili~~
 * (`App.tsx → renderInline()`; innerHTML kullanılmıyor.)
 *
 * Dil notu: özgün metindeki "Siz sağ pabucu mu giydi" satırı, telaffuzu düzeltilmiş
 * hâliyle ("Sağ pabucu mu, sol pabucu mu") alındı — imla düzeltmesi, anlam aynı.
 */

export type Site = {
  brand: string;
  person: string;
  /** GitHub Pages alt yolu; custom domain'e geçince "/" yapılır */
  base: string;
  url: string;
  title: string;
  description: string;
  ogImage: string;
  datePublished: string;
  lang: "tr" | "en";
  handle: { ig: string; x: string; yt: string; mail: string };
};

/** Görsel tarifi: `src` = `src/assets/opt` içindeki dosya adı (App.tsx resolve eder). */
export type ImageRef = { src: string; alt: string; w: number; h: number };

export type DuelRow = { devil: string; me: string };

export type LineRole =
  | "normal"
  | "lead"
  | "dim"
  | "strong"
  | "right"
  | "dropcap"
  | "strike"
  | "quote";

/** t: metin · as: tipografik rol */
export type Line = { t: string; as?: LineRole };

export type Chapter = {
  id: string;
  num: string;
  /** bölümün Latince defter etiketi */
  latin?: string;
  title: string;
  lead?: string;
  lines?: Line[];
  /** "O / Ben" karşılaştırma satırları */
  duel?: DuelRow[];
  /** tek cümlelik keskin vurgu */
  strike?: string;
  /** dev, gümüş gradyanlı satır */
  big?: string;
  image?: { img: ImageRef; caption: string; quote: string };
  fullBleed?: ImageRef;
  /** Bölüm IV'ün iki sütunlu "kime ne" bloğu */
  split?: { for: string; then: string }[];
  /** Bölüm IV'ün "hamle / dönüş" blokları */
  moves?: { open: string; turn: string }[];
  /** defter notu: tarih/yer/bağlam → Google'da E-E-A-T, insanda sahiplik sinyali */
  note?: string;
  /** "alıntıyı kopyala" metni (kaynak + bağlantı otomatik eklenir) */
  copy?: string;
};

export type Vesika = {
  no: string;
  slug: string;
  date: string;
  place: string;
  /** hero: duvara kazınmış iki satır + kapak etiketi + ana kareler */
  carving: { left: string[]; right: string[]; caption: string };
  portrait: ImageRef;
  codaImage: ImageRef;
  /** divit ile yazılan imza satırları */
  ink: { raw: [string, string]; clean: [string, string]; principle: string };
  /** kanıt klasörü: dört ek */
  exhibits: { tag: string; label: string; img: ImageRef }[];
  chapters: Chapter[];
  coda: [string, string];
  footer: { name: string; tagline: string; quote: string };
};

const image = (name: string, w: number, h: number, alt: string): ImageRef => ({
  src: `./assets/opt/${name}`,
  alt,
  w,
  h,
});

export const site: Site = {
  brand: "VESİKA",
  person: "Salim Gümüş",
  base: "/",
  url: "https://applecurse.github.io/dark-philosophical-prose-fragments/",
  title: "BEN PRENSİP — Salim Gümüş · Vesika No: 01",
  description:
    "Ben cennetin steril sakinlerinden değilim; meleklerle aynı notaya susmam. Benim sesim, yasak meyveyi ısıran çene kemiğinden yükselir. — Salim Gümüş, dört bölümlük manifesto.",
  ogImage: "og.png",
  datePublished: "2026-09-14",
  lang: "tr",
  // doldurulunca footer'da görünür olur (bkz. README "handle birliği")
  handle: { ig: "", x: "", yt: "", mail: "" },
};

export const vesika: Vesika = {
  no: "01",
  slug: "vesika-01",
  date: "14.09.2026",
  place: "kaba sıva, tek ampul",
  carving: {
    left: ["Ben cennetin steril sakinlerinden değilim.", "Meleklerle aynı notaya susmam."],
    right: ["Benim sesim,", "yasak meyveyi ısıran çene kemiğinden yükselir."],
    caption: "Sol: Melek · Sağ: Şeytan",
  },
  portrait: image(
    "hero.webp",
    1000,
    666,
    `${"Salim Gümüş"} — yarı siyah, yarı beyaz; omzunda kuzgun, havada tüyler. Vesika 01 kapak karesi`,
  ),
  codaImage: image("hero-bg.webp", 1400, 933, ""),
  ink: {
    raw: ["“Sikemeyeceğiniz kadar tecrübeli,", "sikemeyecek kadar yorgun.”"],
    /** reklam / önizleme / işbirliği hattında kullanılan temiz eşdeğer (docs/AUDIT.md §3.3) */
    clean: ["Tecrübem şüphe uyandırır,", "yorgunluğum cevap vermez."],
    principle: "“Ben iyi ya da kötü olan değilim. Gerekli olanım.”",
  },
  exhibits: [
    {
      tag: "EK: 01",
      label: "YANGIN",
      img: image("ek-yangin.webp", 420, 280, "Kanıt 01: alevlenen kanatlar — Salim Gümüş, Vesika 01"),
    },
    {
      tag: "EK: 02",
      label: "ÇAKILIŞ",
      img: image("ek-cakilis.webp", 420, 280, "Kanıt 02: uçuruma çakılış anı — Salim Gümüş, Vesika 01"),
    },
    {
      tag: "EK: 03",
      label: "KÖKEN",
      img: image("ek-koken.webp", 420, 280, "Kanıt 03: düşmeden önce, saf beyaz kanatlar — Salim Gümüş, Vesika 01"),
    },
    {
      tag: "EK: 04",
      label: "MASUMİYET",
      img: image("ek-masumiyet.webp", 420, 280, "Kanıt 04: ateşli kanatlarla düşüş — Salim Gümüş, Vesika 01"),
    },
  ],
  chapters: [
    {
      id: "bolum-1",
      num: "I",
      latin: "differentia",
      title: "Ben ve Şeytan",
      lead: "“Benimle Şeytan arasındaki fark ne biliyor musun?”",
      duel: [
        { devil: "düşürdü.", me: "yerden kalkıp yeniden yazdım." },
        { devil: "yemin etti.", me: "imzaladım." },
        { devil: "teklif etti.", me: "sistemi kurdum." },
      ],
      image: {
        img: image("yeniden-insa.webp", 1100, 1045, "Duruş: yerden kalkıp yeniden yazan adam — Vesika 01, Bölüm I"),
        caption: "Duruş · Yeniden İnşa",
        quote: "“Yerden kalkıp yeniden yazdım.”",
      },
      strike: "Şeytan hata yaptı.",
      big: "BEN PRENSİP.",
      copy: "Ben Külkedisi’ni Sindirella’ya dönüştüren ayakkabının satıcısı değilim; o pabucu giymeyi unutturan adamım.",
      lines: [
        {
          t: "Aslında Şeytan’ın bile aklına gelmeyecekleri akıl edebiliyorken, melek gibi davrandığım için kusura bakmayın.",
          as: "dropcap",
        },
        { t: "Ben Külkedisi’ni Sindirella’ya dönüştüren ayakkabının *satıcısı* değilim.", as: "normal" },
        { t: "Sağ pabucu mu, sol pabucu mu diye düşünürken,", as: "dim" },
        { t: "ben o pabucu giymeyi unutturan adamım.", as: "right" },
      ],
      note: "Vesika 01 · Bölüm I · 14.09.2026 · kaba sıva, tek ampul",
    },
    {
      id: "bolum-2",
      num: "II",
      latin: "sub lecto",
      title: "Canavarın Altındaki Yatak",
      lead: "Yatağınızın altında canavar var diye tedirgin misiniz?",
      lines: [
        { t: "Sizi terapiye gönderip olmayan bir canavarın yokluğuna ~~inandırmam~~.", as: "normal" },
        { t: "Yatağın ayaklarını keserim.", as: "strong" },
        { t: "Altı kalmayan yatağın korkusu da kalmaz.", as: "dim" },
        { t: "Çünkü ben korkuyla pazarlık etmem.", as: "normal" },
        { t: "Korkunun kaynağını ortadan kaldırırım.", as: "strong" },
      ],
      image: {
        img: image("yatak.webp", 1200, 675, "Ayakları kesilmiş demir yatak, sisli ormanda — Vesika 01, Bölüm II"),
        caption: "Kanıt · Ayakları kesilmiş yatak",
        quote: "“Altı kalmayan yatağın korkusu da kalmaz.”",
      },
      strike: "İşte bu, Salim Gümüş olmak.",
      copy: "Yatağın ayaklarını keserim; altı kalmayan yatağın korkusu da kalmaz.",
      note: "Vesika 01 · Bölüm II · 14.09.2026",
    },
    {
      id: "bolum-2b",
      num: "II · devam",
      title: "Toprak",
      fullBleed: image("toprak.webp", 1600, 893, "Toprak yığınının üzerinde dik duran adam — Vesika 01, Bölüm II.b"),
      lead: "Sizi çıkamayacağınız kadar derin bir mezara koyup üzerinize toprak atıyorlarsa sevinmelisiniz.",
      lines: [
        { t: "Çünkü o toprak ayağınızın altına girerse, sizi **yükseltecektir**.", as: "normal" },
        { t: "Tabii çaresizce yatıp kabullenmezseniz.", as: "quote" },
      ],
      strike: "AYAĞA KALKIP DİK DURURSANIZ.",
      copy: "Üzerinize toprak atanları sevin: o toprak ayağınızın altına girerse sizi yükseltir.",
    },
    {
      id: "bolum-3",
      num: "III",
      latin: "colloquium",
      title: "Şeytanla Konuşmak",
      lines: [
        { t: "Şeytan konuşmaz.", as: "normal" },
        { t: "Sana **sormayı** öğretir.", as: "dim" },
        { t: "Şüpheyi hediye eder.", as: "dim" },
        { t: "Ben *”okunan”* kutsal metinler yerine, **”okuyan”** insanı seçiyorum.", as: "quote" },
        { t: "Şeytanla konuştum.", as: "normal" },
        { t: "O susuyordu.", as: "lead" },
        { t: "Çünkü cevap vermek Tanrı’ya aittir.", as: "dim" },
        { t: "O bana soru sormayı öğretti.", as: "strong" },
      ],
      image: {
        img: image("kuzgun.webp", 1300, 866, "Kuzgun, yakın plan — Vesika 01, Bölüm III"),
        caption: "Kanıt · Kuzgun",
        quote: "“O susuyordu.”",
      },
      copy: "Şeytan konuşmaz; sana sormayı öğretir. Ben okunan metinleri değil, okuyan insanı seçerim.",
    },
    {
      id: "bolum-4",
      num: "IV",
      latin: "in infernum",
      title: "Cehenneme Yatırım",
      big: "Cehenneme düşmez.",
      strike: "ORAYA YATIRIM YAPAR.",
      fullBleed: image(
        "sofra.webp",
        1600,
        900,
        "Katedralin ortasındaki uzun masanın başında oturan adam — Vesika 01, Bölüm IV",
      ),
      lines: [
        { t: "Kurallar onun için yazılmadı.", as: "normal" },
        { t: "Yazarını işe aldı.", as: "strong" },
      ],
      split: [
        { for: "Kendini bilmeyenler için", then: "bir tehlikedir." },
        { for: "Kendini bilenler içinse", then: "bir ilham kaynağı." },
      ],
      moves: [
        { open: "Şeytan onunla pazarlık etmez.", turn: "çünkü masada oturan zaten odur." },
        { open: "İlk hamleyi yapmaz.", turn: "çünkü oyun zaten onun varlığıyla başlamıştır." },
      ],
      copy: "Cehenneme düşmez; oraya yatırım yapar.",
    },
  ],
  coda: ["Ben cennetin steril sakinlerinden değilim.", "Meleklerle aynı notaya susmam."],
  footer: {
    name: "SALIM GÜMÜŞ",
    tagline: "Prensip · Kural · Yıkım",
    quote: "“Korkunun kaynağını ortadan kaldırırım.”",
  },
};

/** Sosyal kart / arşiv için düz metin manifestosu (script'ler bunu kullanır). */
export function manifestText(v: Vesika = vesika): string {
  const out: string[] = [`${site.person} — ${v.chapters[0].big ?? ""}`.trim(), ""];
  out.push(`Vesika No: ${v.no} · ${v.date} · ${v.place}`, "");
  for (const c of v.chapters) {
    out.push(`— ${c.num}. ${c.title}${c.latin ? ` (${c.latin})` : ""} —`);
    if (c.lead) out.push(c.lead);
    for (const d of c.duel ?? []) out.push(`O ${d.devil} Ben ${d.me}`);
    for (const l of c.lines ?? []) out.push(l.t.replace(/[*~]/g, ""));
    for (const s of c.split ?? []) out.push(`${s.for} ${s.then}`);
    for (const m of c.moves ?? []) out.push(`${m.open} ${m.turn}`);
    if (c.strike) out.push(c.strike);
    out.push("");
  }
  out.push(...v.coda);
  return out.join("\n").trim();
}
