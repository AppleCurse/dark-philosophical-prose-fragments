# VESİKA · BEN PRENSİP — Salim Gümüş

Dört bölümlük manifestoyu tek sayfalık, **statik** bir artefakt olarak yayınlayan site.
Kaba sıva duvar, paslı çiviyle asılı kanıt fotoğrafları, divit mürekkebi ile yazılan imza
satırları: biçim ile içerik aynı dosyada konuşur.

**Yayın:** <https://applecurse.github.io/dark-philosophical-prose-fragments/>

---

## Neden böyle bir mimari? (özet)

| Karar | Gerekçe |
|---|---|
| **`vite-plugin-singlefile` kaldırıldı** | Tek dosyaya gömülü base64 görseller 11,94 MB'lık `index.html` üretiyordu; lazy-load, cache ve responsive image imkânı kalmıyordu. |
| **Statik prerender** (`scripts/prerender.mjs`) | Bot'lar ve önizleme çekicileri JS çalıştırmaz. Manifesto artık ham HTML'de: 87 KB, 1000+ kelime, `<h1>/<h2>/<h3>`, `og:*`, JSON-LD. |
| **React adaları** (`src/islands.tsx`) | Sayfada yalnızca 3 etkileşim var (kayıdırma göstergesi, divit yazımı, ışık/paylaş). Gerisi ölü JS değil. |
| **Görseller üretimde gri + render boyutunda** | Tüm görseller CSS'te zaten grayscale; renk verisi taşımak 8,35 MB israftı. Şimdi ~0,54 MB (`src/assets/opt`). |
| **Kendi barındırılan font alt kümeleri** | 5 aile / ~20 stil Google Fonts isteği → 4 aile / 13 minik `@font-face` (140 KB, render-blocking dış istek yok). Cinzel'de bulunmayan `İ` için `cinzel-tr.woff2` yaması. |
| **Metin = veri** (`src/content.ts`) | Site, sosyal gönderi seti ve arşiv aynı kaynaktan üretilir. |

Sayısal özet: `11,94 MB → 1,3 MB` toplam paket, `8,85 MB → ~87 KB` ilk HTML isteği.
Tam ölçüm ve gerekçe: [`docs/AUDIT.md`](docs/AUDIT.md).

## Komutlar

```bash
npm ci
npm run dev            # http://localhost:5173
npm run typecheck
npm run build          # prerender → dist/ (statik site)
npm run size           # bütçe bekçisi (varsayılan 1,8 MB)
npm run check          # typecheck + build + size (CI ile aynı)
npm run preview        # dist önizleme
```

Varlık/font üretimini sıfırdan yapmak istersen (opsiyonel):

```bash
# 1) ham kaynak fotoğrafları assets-src/ içine koy (repo'da tutulmaz)
npm run optimize:assets
# 2) font alt kümeleri (fonttools + brotli gerekir; çıktı repoda commit'li)
python3 scripts/subset-fonts.py
# 3) sosyal kart görseli + apple-touch-icon
npm run make:og
# 4) gönderi seti (ve istersen 1080×1350 kartlar)
npm run make:posts
npm run make:cards
```

## Dizinler

```
index.html              head: meta/OG/JSON-LD (paylaşım kartı buradan doğar)
src/content.ts          manifestonun tek doğruluk kaynağı (metin + görsel tarifleri)
src/App.tsx             şablon: prerender edilir, tarayıcıda hidrate edilmez
src/islands.tsx         3 React adası
src/index.css           tema, tipografi, kaydırma animasyonları, reduced-motion
src/assets/opt/         üretim görselleri (grayscale, render boyutunda webp)
src/assets/fonts/       alt küme woff2'ler + src/fonts.css (üretim: scripts/subset-fonts.py)
public/                 favicon.svg, og.png, robots.txt, sitemap.xml, llms.txt
scripts/                optimize-assets · subset-fonts · prerender · size-guard · make-og · make-posts
docs/AUDIT.md           ölçümlü denetim + 30 günlük dağıtım planı
docs/LISENS.md          telif ve kullanım çerçevesi
```

## Yeni Vesika eklemek (ayda 1 ritmi)

1. `src/content.ts` içindeki `vesika`yı kopyala → `vesika02` (ya da bir `Vekas[]` dizisine taşı).
2. Bölüm metinlerini, `note` (tarih/yer) ve `copy` (alıntı) alanlarını doldur.
3. Görselleri `assets-src/`'e koy, `npm run optimize:assets`, isimleri `content.ts`'te güncelle.
4. `npm run make:posts` → `posts/` altında hazır gönderi seti; `index.html`'de `og:` başlıklarını güncelle.
5. `npm run check` (typecheck + build + bütçe) ve push.

**Kural:** çıplak satır sitede kalır; `og:*`, altyazı ve reklam metinlerinde
`vesika.ink.clean` kullanılır (Meta reklam politikası — `docs/AUDIT.md §3.3`).

## Özelleştirme notları

- **Custom domain:** `public/CNAME` ekle, `vite.config.ts` içinde `base: "/"` yap ve
  `index.html`/`content.ts`/`sitemap.xml`/`robots.txt` içindeki mutlak URL'leri değiştir.
- **Profil linkleri:** `src/content.ts → site.handle` doldurulunca footer'da otomatik görünür.
- **Bütçe:** `BUDGET_MB=1.2 npm run size` ile sıkılaştır.
- **Erişilebilirlik:** `prefers-reduced-motion` ve JS'siz okuma test edildi; değişikliklerde
  `npm run build` çıktısındaki statik metni kontrol et (CI bunu yapıyor).
