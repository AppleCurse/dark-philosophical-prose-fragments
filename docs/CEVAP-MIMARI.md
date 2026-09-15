# "HTML + JS doğru mu?" — mimari cevabı, ölçümlerle

Kısa cevap: **evet, ama "React SPA + tek dosyaya gömülü her şey" değildi.** Şu anki kurulum
HTML + statik prerender + 3 React adası. Aşağıda neden bu kararı verdiğim ve neyi ölçtüğüm var.

## 1. Ölçülen eski durum

| Şey | Değer |
|---|---|
| `dist/index.html` (vite-plugin-singlefile) | 11,94 MB ham / 8,48 MB gzip |
| Kod + CSS (base64 görseller hariç) | 263 KB — yani paketin **%97,7'si görüntü** |
| JS'siz/botsuz görünür içerik | **0 kelime** (SPA: `#root` boş, `<img>` 0, `og:` 0) |
| Bot'ların okuyabildiği paylaşım kartı | yok |
| Font yükleme | 5 aile, ~20 stil, Google'dan (render-blocking dış istek) |
| Erişilebilirlik | `<h1>` 0, `<main>` 0, `prefers-reduced-motion` 0 |
| Kaydırma maliyeti | her `rAF`'te `setY` → 860 satırlık kök ağaç re-render |

Sorun HTML/JS'de değil, **mimari tercih**teydi: interaktif olmayan bir metin belgesini
bir uygulama gibi paketlemek.

## 2. Seçenekler ve gerekçem

| Seçenek | Doğru olduğu yer | Burada neden reddedildi/segildi |
|---|---|---|
| **A. Vite + React, singlefile (eski)** | Tek dosyayı USB/e-posta ile taşımak | Lazy-load, cache, `og:`, prerender hepsi ölü. 12 MB link = sosyalde ölüm. |
| **B. Astro / Eleventy / 11ty** | Uzun ömürlü, çok sayfalı arşiv; içerik = Markdown | Şu an **1 sayfa** var; göç 1-2 günlük iş, faydası Vesika 03'ten sonra belirgin. İçerik veri modeline geçti (§4), o yüzden bu kapı **yarın yarım saatlik** iş. |
| **C. Dümdüz statik HTML + 60 satır vanilla JS** | Sıfır bağımlılık, 20 KB paket | Tipografi (divit) ve ileride arşiv/rotalama için React'in bileşen/veri kolaylığı çöpe gider; şablonu elle senkron tutmak hata üretir. |
| **D. ✅ Vite + React → statik prerender + adalar** | Mevcut kodu korur; çıktı düz HTML; JS yalnızca 3 etkileşimde | Reddedilecek bir yanı yok: build 5 sn, çıktıda 0 satır içi görsel, HTML 87 KB. |

**Seçtiğim: D.** Yani: *yazım dili React, yayın biçimi HTML.* Bu, "sosyal medya için link"
ve "arama botu için belge" ihtiyaçlarının kesişimi.

## 3. Uygulanan şeyler ve sayısal sonuç

| Alan | Önce | Sonra | Nasıl |
|---|---|---|---|
| Toplam paket | 11,94 MB (tek dosya) | **1,13 MB** (26 dosya) | `singlefile` kaldırıldı, `base: '/dark-.../'` |
| İlk HTML isteği | 8,48 MB gzip | **17,7 KB gzip** (87 KB ham) | görseller ayrı dosya, CSS satır içi, 0 `data:` URI |
| Görsel yükü | 8,35 MB | **0,54 MB** | `scripts/optimize-assets.mjs`: gri + render boyutu + webp q74-80 |
| JS | her şeyi render eden tam ağaç | 224 KB (`%70` gzip) ama **yalnızca 3 ada** | `src/islands.tsx`, `main.tsx` yuva dolduruyor |
| Font | 5 aile / ~20 stil, Google | **13 `@font-face`, 140 KB, kendi sunucun** | `scripts/subset-fonts.py` + `cinzel-tr.woff2` (`İ` yaması) |
| JS'siz okunur içerik | 0 kelime | **471 kelime** | `renderToStaticMarkup` → `dist/index.html` |
| Semantik | `<h2>`×1 | `sr-only <h1>`, 5×`<h2 id>`, 3×`<h3>`, `<main id="icerik">`, `aria-labelledby`, skip-link, `loading="lazy"`×9 | `src/App.tsx` |
| Erişilebilirlik | 0 `prefers-reduced-motion` | reduced-motion + `@media (scripting:none)` + `@media (hover:hover)` + `:focus-visible` + **`IŞIĞI AÇ`** (kazı kontrastı) | `src/index.css` |
| Kaydırma | her karede re-render | ref + `--p` custom property (0 re-render) | `ScrollProgress` |
| Divit yazımı | mount'ta başlıyordu, `Math.random()`, ölü `pause1/2` durumu | görünüme girince başlar, deterministik ritim, **"↺ yeniden yaz"** butonu, `Stage` tipi düzgün | `InkWriter` |
| CI | build ancak typecheck yok (4 TS6133 yaşardı) | `npm run check` = typecheck + build + `size` (bütçe 1,8 MB) + statik-metin doğrulaması | `.github/workflows/{ci,deploy}.yml` |
| Paylaşım | boş gri kutu | `og:`/`twitter:` + **`public/og.png` (1200×630, 82 KB)** + favicon + `apple-touch-icon` + `llms.txt` | `index.html`, `scripts/make-og.mjs` |

Doğrulama komutları (bu repoda çalıştırıldı):
```bash
npm run check          # ✓ typecheck 0 hata · ✓ prerender · ✓ bundle 1,13 MB < 1,8 MB
python3 - <<'PY'       # dist/index.html'de: 17,7 KB gzip, 471 kelime statik, 0 data URI,
#  tüm ./assets/ referansları diskte mevcut  → hepsi ✔
PY
```

## 4. Bundan sonrası için mimari (kademeli, bugünün işi değil)

1. **İçerik zaten veri:** `src/content.ts` → `vesika[]` oldu mu arşiv `/vesika/02` sayfaları
   sadece dosya eklemek. (Bu geçiş Astro'ya göçün 90'ı; o yüzden B'ye hazır.)
2. **Prerender'ı çoğul yap:** `scripts/prerender.mjs`'de bir rota listesi oku →
   `dist/vesika/02/index.html` üret. 30 satır.
3. **Astro'ya geçiş kriteri:** Vesika ≥ 3, ya da EN sürümü, ya da RSS/abonelik istenirse.
   O gün yapılacak tek şey: `App.tsx` şablonunu `.astro`ya çevirmek (CSS ve font script'leri
   olduğu gibi taşınır; adalar zaten ayrı dosyada).
4. **Alan adı:** `vite.config.ts`'te `base: "/"` + `public/CNAME`. Paylaşılabilir link kısa
   olursa CTR artar; ayrıca `og:url`/`canonical`/`sitemap` aynı anda güncellenmeli.
5. **Ölçüm:** Plausible/GoatCounter (çerezsiz) ekle; `sends/reach` için önce site linkinin
   tıklanma sayısı lazım → bio linkine `?utm_source=ig` ekle, GSC'de izle.

## 5. Bilerek yapmadıklarım

- **Duvar dokusunu/grain'i statik dosyaya çevirmeyi yarıda bıraktım** (script yazdım,
  görsel sonuç "yeterince iyi" çıkmadı; 1. denemede üretilen doku çok karanlık kaldı).
  CSS'teki `feTurbulence` + `wall-surface` şu an hero'da ve doğru görünüyor. Doku
  sayısını artırmadan (bölüm bölüm çoğaltmadan) bu maliyet kabul edilebilir. **Yapılacaklar
  listesinde duruyor** — `docs/AUDIT.md §2.7/5`.
- **Metinde kelime/ton değişikliği yapmadım**; tek izin verdiğim kendi düzeltmem
  `Siz sağ pabucu mu giydi → Sağ pabucu mu, sol pabucu mu` (imla). Beğenmezsen
  `src/content.ts` içinde tek satır.
- **Küfürlü satırı silmedim**, sitenin ilk ekranında kaldı. Reklam/altyazı hattı için
  temiz eşdeğeri `vesika.ink.clean` olarak veriye ekledim; `scripts/make-posts.mjs`
  varsayılan olarak temiz metni kullanıyor.
- **Görsel üretim hattı `assets-src/` klasörüne bağlandı** ve ham JPEG'leri repodan çıkardım
  (9,5 MB → 768 KB). Ham kareleri `assets-src/`'e koyarsan `npm run optimize:assets` yeniden
  üretir; koymazsan build yine çalışır çünkü sıkıştırılmış webp'ler commit'li.
