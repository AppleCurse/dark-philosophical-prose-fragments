# VESİKA · BEN PRENSİP — Salim Gümüş

Dört bölümlük manifestoyu tek sayfalık, **statik** bir artefakt olarak yayınlayan site.
Kaba sıva duvar, paslı çiviyle asılı kanıt fotoğrafları, divit mürekkebi ile yazılan imza
satırları: biçim ile içerik aynı dosyada konuşur.

**Yayın:** <https://soulvespera.com.tr/> · ayna: `applecurse.github.io/dark-philosophical-prose-fragments`

---

## Neden böyle bir mimari? (özet)

| Karar | Gerekçe |
|---|---|
| **`vite-plugin-singlefile` kaldırıldı** | Tek dosyaya gömülü base64 görseller 11,94 MB'lık `index.html` üretiyordu; lazy-load, cache ve responsive image imkânı kalmıyordu. |
| **Statik prerender** (`scripts/prerender.mjs`) | Bot'lar ve önizleme çekicileri JS çalıştırmaz. Manifesto artık ham HTML'de: 97 KB, 485 görünür kelime, `<h1>/<h2>/<h3>`, `og:*`, JSON-LD. |
| **React adaları** (`src/islands.tsx`) | Sayfada yalnızca 5 etkileşim var (kaydırma göstergesi, divit yazımı, ışık/paylaş, duvara kazı, mühür). Gerisi ölü JS değil. |
| **Ada kütüğü** (`src/islands-registry.ts`) | Yuvası olup dinleyicisi olmayan ada = **sessiz ölü kontrol**. Tek listeden tür türetiliyor; eksik ada typecheck'te patlıyor. |
| **İki davranış adasız** (`src/main.tsx`) | Kopyalama ve duvar feneri statik HTML'de zaten duran düğümlere dinleyici bağlar; kendi ağaçlarını render etmez, hidrasyon istemez. |
| **Görseller üretimde gri + render boyutunda** | Tüm görseller CSS'te zaten grayscale; renk verisi taşımak 8,35 MB israftı. Şimdi ~0,54 MB (`src/assets/opt`). |
| **Kendi barındırılan font alt kümeleri** | 5 aile / ~20 stil Google Fonts isteği → 4 aile / 13 minik `@font-face` (140 KB, render-blocking dış istek yok). Cinzel'de bulunmayan `İ` için `cinzel-tr.woff2` yaması. |
| **Metin = veri** (`src/content.ts`) | Site, sosyal gönderi seti ve arşiv aynı kaynaktan üretilir. Head bloğu da build'de bu kaynağa karşı **doğrulanır**. |
| **Ziyaretçi verisi cihazdan çıkmaz** | Kazınan satır ve nüsha numarası yalnızca `localStorage`. Sunucu, çerez, hesap, istek yok. |

Sayısal özet: `11,94 MB → 1,16 MB` toplam paket, `8,85 MB → 97 KB` ilk HTML isteği (`19,4 KB` gzip).
Lansman ölçümü ve gerekçe: [`docs/AUDIT.md`](docs/AUDIT.md) · bakım turu: [`docs/DENETIM.md`](docs/DENETIM.md).

## Sitenin beş imzası

1. **🔦 Tek ampul** — vesikanın yeri zaten "kaba sıva, tek ampul". Ampul artık ziyaretçinin
   elinde: imleç duvarda gezindikçe sıcak bir ışık onu izler, kazınmış satır yanal ışıkta okunur.
   `setState` yok, gradient değil **`transform`** animasyonu → kare başına paint yok. Yalnızca
   ince işaretçide bağlanır.
2. **✒️ Duvara kazı** — Bölüm III *"okunan metni değil, okuyan insanı seçiyorum"* der. Manifesto
   bitince duvar okuyucuya devredilir: bir satır kazır, duvara oturur, `localStorage`'da kalır,
   yazdırınca kâğıda geçer. En çok 3 satır.
3. **🕯️ Mühür + nüsha no** — vesika resmî belgedir, nüshası olur. Okuyucu kendi nüshasını
   mumla mühürler; numara (`10000–99999`) bir daha değişmez ve paylaşım metnine girer:
   *"— Salim Gümüş, Vesika 01 · Nüsha No: 48213"*.
4. **⎙ Kâğıt nüsha** — `Ctrl+P` siteyi mürekkep dostu tek renkli belgeye çevirir: künye basılır,
   her bölüm ayrı sayfaya düşer, fotoğraflar ve ekran arayüzü kalkar, kazınan satır kalır.
5. **🪶 Havada tüy** — kapak karesindeki tüylerden biri fotoğraftan sayfaya düşmeye devam eder.
   Tepe opaklık 0,16; döngünün yarısı görünmez. `prefers-reduced-motion`'da hiç yok.

Hepsi mevcut disipline sadık: JS'siz okuma bozulmaz, hareket hassasiyeti korunur, bütçe korunur.

## Komutlar

```bash
npm ci
npm run dev            # http://localhost:5173
npm run typecheck
npm run build          # prerender → dist/ (statik site) + 3 tutarlılık doğrulaması
npm run size           # bütçe bekçisi (varsayılan 1,8 MB)
npm run check          # typecheck + build + size (CI ile aynı)
npm run preview        # dist önizleme
```

Varlık/font üretimini sıfırdan yapmak istersen (opsiyonel):

```bash
# 1) ham kaynak fotoğrafları assets-src/ içine koy (repo'da tutulmaz)
npm run optimize:assets
# 2) font alt kümeleri (fonttools + brotli gerekir; çıktı repoda commit'li)
npm run fonts:subset
# 3) sosyal kart görseli + apple-touch-icon
npm run make:og
# 4) gönderi seti (ve istersen 1080×1350 kartlar)
npm run make:posts
npm run make:cards
```

## Dizinler

```
index.html                 head: meta/OG/JSON-LD (paylaşım kartı buradan doğar)
src/content.ts             manifestonun tek doğruluk kaynağı (metin + görsel tarifleri)
src/islands-registry.ts    ada adlarının tek listesi → tip (eksik ada = typecheck hatası)
src/App.tsx                şablon: prerender edilir, tarayıcıda hidrate edilmez
src/islands.tsx            5 React adası
src/main.tsx               ada bağlayıcı + 2 adasız davranış (kopyalama, fener)
src/index.css              tema, tipografi, kaydırma animasyonları, reduced-motion, @media print
src/fonts.css              @font-face tanımları (üretim: scripts/subset-fonts.py)
src/assets/fonts/          alt küme woff2'ler
src/assets/opt/            üretim görselleri (grayscale, render boyutunda webp)
public/                    favicon.svg, og.png, robots.txt, sitemap.xml, llms.txt, CNAME
scripts/                   optimize-assets · subset-fonts · prerender · size-guard · make-og · make-posts
docs/AUDIT.md              lansman denetimi + 30 günlük dağıtım planı
docs/DENETIM.md            bakım turu: temizlik, 3 bug, bekçiler, 5 yeni katman (ölçümlü)
docs/CEVAP-MIMARI.md       "HTML + JS doğru mu?" sorusunun mimari cevabı
docs/LISENS.md             telif ve kullanım çerçevesi
```

## Build'de ne doğrulanır

`npm run build` yalnızca üretmez, **denetler** — üçü de kayma olursa build'i patlatır:

| Doğrulama | Yakaladığı hata sınıfı |
|---|---|
| Kritik cümleler statik HTML'de | prerender sessizce boş çıktı üretirse |
| Head bloğu ↔ `content.ts` tutarlı | `canonical` başka, JSON-LD başka domain derse (gerçekten olmuştu) |
| Her `data-island` kütükte kayıtlı | şablonda yuva açılıp dinleyicisi yazılmamışsa |

CI ayrıca JS'siz okunurluğu ve **ölü kontrol** olmamasını doğrular (`button[data-copy]`,
`[data-torch]`, iki `localStorage` anahtarı pakette mi). Bu bekçiler negatif testle sınandı —
bkz. `docs/DENETIM.md §C3`.

## Yeni Vesika eklemek (ayda 1 ritmi)

1. `src/content.ts` içindeki `vesika`yı kopyala → `vesika02` (ya da bir `Vesika[]` dizisine taşı).
2. Bölüm metinlerini, `note` (tarih/yer) ve `copy` (alıntı) alanlarını doldur.
3. Görselleri `assets-src/`'e koy, `npm run optimize:assets`, isimleri `content.ts`'te güncelle.
4. `npm run make:posts` → `posts/` altında hazır gönderi seti; `index.html`'de `og:` başlıklarını güncelle.
5. `npm run check` (typecheck + build + bütçe + 3 doğrulama) ve push.

**Kural:** çıplak satır sitede kalır; `og:*`, altyazı ve reklam metinlerinde
`vesika.ink.clean` kullanılır (Meta reklam politikası — `docs/AUDIT.md §3.3`).

## Özelleştirme notları

- **Custom domain zaten aktif:** `public/CNAME` = `soulvespera.com.tr`, `vite.config.ts` `base: "/"`.
  Adres değişirse `content.ts → site.url` **tek yer**: build bekçisi `index.html`'i ona göre denetler
  (elle `sitemap.xml` / `robots.txt` / `llms.txt` kalıyor).
- **Profil linkleri:** `src/content.ts → site.handle` doldurulunca footer'da otomatik görünür
  (`ig` dolu; `x` ve `yt` boş, boşken link hiç render edilmez).
- **Kazı/mühür limitleri:** `src/islands.tsx` içinde `CARVE_MAX` (96), `CARVE_LIMIT` (3),
  nüsha aralığı `Seal.press()`. Anahtarlar `vesika.kazinti.v1` / `vesika.nusha.v1` — sürüm eki
  taşıyor, şema değişince eski kayıtlar sessizce yok sayılır.
- **Fener hissi:** `src/index.css → .wall-torch` (520 px çap, `rgba(255,232,194,.22)`).
  Daha sert bir ampul için çapı küçült, opaklığı artır.
- **Kâğıt nüsha:** `src/index.css → @media print`. Fotoğraflı baskı istersen `img, svg`
  satırındaki gizlemeyi daralt; ekran kadrajları (`object-cover`) kâğıtta bozulabildiği için
  bilerek fotoğrafsız.
- **Bütçe:** `BUDGET_MB=1.2 npm run size` ile sıkılaştır.
- **Erişilebilirlik:** `prefers-reduced-motion` ve JS'siz okuma test edildi; değişikliklerde
  `npm run build` çıktısındaki statik metni kontrol et (CI bunu yapıyor).
