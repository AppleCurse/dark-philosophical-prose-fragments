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
export type ImageRef = {
  src: string;
  alt: string;
  w: number;
  h: number;
  /**
   * Bilinçli kadraj: `object-position`. Kutu oranı kaynaktan farklıysa kırpım
   * OLACAK; soru nerede olacağı. Varsayılan `object-center` yüzü/özneyi bilen
   * biri tarafından seçilmemiş demektir (docs/AUDIT.md §2.7/2). Değerler her
   * görsel tek tek açılıp bakılarak verildi (docs/DENETIM.md §I).
   */
  pos?: string;
};

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

/** Canlı video kaydı (paralel hattaki "canlı kanıt" monitörleri). */
export type VideoRef = {
  src: string;
  poster: string;
  tag: string;
  title: string;
  caption: string;
};

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
  video?: VideoRef;
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
  /** üç hal şeridi: BEYAZ · SİYAH · KIRMIZI */
  states: { label: string; sub: string; tag: string; tone: string }[];
  /** divit ile yazılan imza satırları */
  ink: { raw: [string, string]; clean: [string, string]; principle: string };
  /** kanıt klasörü: dört ek */
  exhibits: { tag: string; label: string; img: ImageRef }[];
  chapters: Chapter[];
  coda: [string, string];
  footer: { name: string; tagline: string; quote: string };
};

const image = (name: string, w: number, h: number, alt: string, pos?: string): ImageRef => ({
  src: `./assets/opt/${name}`,
  alt,
  w,
  h,
  pos,
});

export const site: Site = {
  brand: "VESİKA",
  person: "Salim Gümüş",
  base: "/",
  url: "https://soulvespera.com.tr/",
  title: "BEN PRENSİP — Salim Gümüş · Vesika No: 01",
  description:
    "Ben cennetin steril sakinlerinden değilim; meleklerle aynı notaya susmam. Benim sesim, yasak meyveyi ısıran çene kemiğinden yükselir. — Salim Gümüş, dört bölümlük manifesto.",
  ogImage: "og.png",
  datePublished: "2026-09-14",
  lang: "tr",
  // doldurulunca footer'da görünür olur (bkz. README "handle birliği")
  handle: { ig: "fallenvice", x: "", yt: "", mail: "fallenvice@soulvespera.com.tr" },
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
    1500,
    `${"Salim Gümüş"} — tahtta, koyu kızıl kadife kaftanı ve kırmızı kanatlarıyla. Vesika 01 kapak karesi`,
    "50% 22%",
  ),
  codaImage: image("kirmizi-kivilcim.webp", 1400, 932, "Kıvılcımlar ve kızıl kanatlar — Salim Gümüş"),
  states: [
    { label: "BEYAZ", sub: "ARINMIŞ", tag: "Cennet & Sükûnet", tone: "text-white" },
    { label: "SİYAH", sub: "KİRLENMİŞ", tag: "Düşüş & Şüphe", tone: "text-silver" },
    { label: "KIRMIZI", sub: "YANMIŞ", tag: "Prensip & Ateş", tone: "text-red-400" },
  ],
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
      img: image("ek-yangin.webp", 420, 617, "Kanıt 04: modern melek, ekrana bakan gözler — Salim Gümüş, Vesika 01", "50% 35%"),
    },
    {
      tag: "EK: 02",
      label: "ÇAKILIŞ",
      img: image("ek-cakilis.webp", 420, 617, "Kanıt 03: alaycı tebessüm, dünyaya geçiş — Salim Gümüş, Vesika 01", "50% 30%"),
    },
    {
      tag: "EK: 03",
      label: "KÖKEN",
      img: image("ek-koken.webp", 420, 617, "Kanıt 02: gözlüğü takarken, uyanış — Salim Gümüş, Vesika 01", "50% 35%"),
    },
    {
      tag: "EK: 04",
      label: "MASUMİYET",
      img: image("ek-masumiyet.webp", 420, 617, "Kanıt 01: bulutlarda huzurlu melek — Salim Gümüş, Vesika 01", "50% 30%"),
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
      video: {
        src: "./videos/video-arinma.mp4",
        poster: "./videos/video-arinma-poster.webp",
        tag: "01",
        title: "BEYAZ ARINMIŞ · STERİL CENNET",
        caption: "“Melek gibi davrandığım için kusura bakmayın.”",
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
        img: image("siyah-on.webp", 1400, 933, "Siyah devasa kanatlarıyla karanlığı kontrol eden dik duruş — Salim Gümüş, Vesika 01, Bölüm II", "50% 40%"),
        caption: "Hal: Siyah Kirlenmiş · Korkunun Kaynağı",
        quote: "“Korkunun kaynağını ortadan kaldırırım.”",
      },
      strike: "İşte bu, Salim Gümüş olmak.",
      copy: "Yatağın ayaklarını keserim; altı kalmayan yatağın korkusu da kalmaz.",
      note: "Vesika 01 · Bölüm II · 14.09.2026",
    },
    {
      id: "bolum-2b",
      num: "II · devam",
      title: "Toprak",
      video: {
        src: "./videos/video-cakilis.mp4",
        poster: "./videos/video-cakilis-poster.webp",
        tag: "02",
        title: "ÇAKILIŞ · FIRTINA VE DÜŞÜŞ",
        caption: "“Ayağa kalkıp dik durursanız sizi yükseltir.”",
      },
      fullBleed: image("siyah-dikey.webp", 900, 857, "Karanlık kanatların gölgesinde topraktan yükseliş — Salim Gümüş, Vesika 01, Bölüm II.b", "50% 40%"),
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
        img: image("siyah-profil.webp", 1400, 933, "Karanlıkta suskun ve sorgulayan profil silüeti, siyah kanatlar — Salim Gümüş, Vesika 01, Bölüm III", "50% 40%"),
        caption: "Hal: Siyah Kirlenmiş · Şüphe & Sessizlik",
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
        "kirmizi-taht.webp",
        1000,
        1500,
        "Koyu kızıl kadife kaftanı, tahtı ve devasa kırmızı kanatlarıyla masada oturan kudret — Salim Gümüş, Vesika 01, Bölüm IV",
        "50% 28%",
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
