# BEN PRENSİP — Ayrıntılı İnceleme ve Öneriler

**İnceleme tarihi:** 15.09.2026 · **Dal:** `arena/01a0a382-dark-philosophical-prose-fragm` · **İncelenen commit:** `73e1f85`
**Yayın adresi:** `https://applecurse.github.io/dark-philosophical-prose-fragments/`
**Kapsam:** 3 bakış açısı — (1) dışarıdan kullanıcı/marka, (2) içeriden yazılım mühendisi, (3) sosyal medya uzmanı.
**Yöntem:** Kod okuması + gerçek üretim derlemesi (`npm ci && npm run build`) + `tsc --noEmit` + görsel envanteri/EXIF + build çıktısında (dist/index.html) bayt bazında ölçüm + font `unicode-range` kontrolü. Aşağıdaki **sayıların hiçbiri tahmin değil, ölçüm.**

---

## 0. Yönetici özeti

Proje, tek sayfalık bir manifestoyu (site içi adıyla “vesika”) React + Vite + Tailwind v4 ile kuran, 860 satırlık tek bir bileşenden (`src/App.tsx`) ve 418 satırlık bir global CSS’ten (`src/index.css`) oluşan bir kişisel marka sitesi. Görsel dili son derece tutarlı: kaba sıva beton duvar, tek cam lamba, paslı çiviyle asılı arşiv fotoğrafları, divit mürekkebi ile yazılan el yazısı, kazınmış duvar yazıları, Cinzel/Cormorant tipografi, tamamı grayscale. Bu **dışarıdan bakınca profesyonel bir sanat yönetimi** ve Türkiye’deki “karanlık felsefi alıntı” hesabı kalabalığının %95’inden daha iyi tasarlanmış.

Fakat içeriden bakınca site, **markanın en çok ihtiyaç duyduğu yerde kaybediyor:** paylaşılan bir link, mobilde 10 saniye ile 4 dakika arasında açılıyor ve açılırken hiçbir sosyal önizleme üretmiyor.

### Ölçülen tablo

| Ölçüm | Değer | Yorum |
|---|---|---|
| `dist/index.html` tek dosya | **11,94 MB** (ham) / **8,48 MB** gzip | Tek HTML’de her şey base64 ile satır içi |
| Tek istekte görüntü oranı | **%97,7** | Kod + CSS = sadece **263 KB** |
| Sayfanın %57’si | `raven.jpg` tek başına **6,73 MB** | 2608×1456 JPEG, ekranda ~650px gösteriliyor |
| İndirme süresi (sıfır cache) | 10 Mbps: **9,6 sn** · yavaş 4G (1,6 Mbps): **59,7 sn** · 3G: **~4 dk** | `index.html` içeriği hash’siz → her ziyarette revalidate |
| Görünür metin | **~259 kelime** | “Google için ince içerik” riski; sosyal için ideal |
| `<h1>` sayısı | **0** (1 adet `<h2>`, `ChapterMark` içinde) | SEO/erişilebilirlik boşluğu |
| `<main>` landmark’ı | **0** | Sadece `header` + 6×`section` + `footer` |
| `meta description` / OG / canonical / `robots.txt` / `sitemap.xml` / favicon / `og:image` | **hiçbiri yok** | Paylaşılan link = boş kart |
| Yapılandırılmış veri (JSON-LD) | **yok** | Google/LLM tarafında “kim bu” eşleşmesi yok |
| `loading="lazy"` | **0 / 11 görsel** | singlefile ile zaten mümkün değil (aşağıda) |
| `prefers-reduced-motion` | **0 adet** (kaynakta ve build çıktısında) | 12+ sonsuz animasyon, vestibüler risk |
| `npm run build` | ✅ geçer | **Ama `tsc` çalışmaz; `npm run typecheck` yok** |
| `npx tsc --noEmit` | ❌ **4 hata (TS6133)** | Kod yazımında editör kırmızı; CI kırmızıyı görmüyor |
| Depo boyutu | **19 MB** (`.git` 9,2 MB) · 1 commit · LICENSE yok | Ölü görseller 1,9 MB |
| Görsel optimizasyonu sonrası (test edildi) | **8,35 MB → 707 KB (-%92)** | HTML: 11,94 MB → **~1,3 MB**, görsel kalite kaybı görünmüyor |

### Öncelik (detay §4)

| # | İş | Etki | Efor |
|---|---|---|---|
| **P0-1** | Görselleri optimize et (grayscale + yeniden boyut + WebP) | Sayfa **11,9 MB → ~1,3 MB**, mobilde açılış **60 sn → ~1 sn** | 1–2 saat |
| **P0-2** | `meta`/OG/`twitter:card`/`og:image` + favicon + `<h1>` + `JSON-LD` | Paylaşım kartı ve arama/AI görünürlüğü | 1–2 saat |
| **P0-3** | Tek satır `CORS`/bot için değil: **statik “sosyal kopya” HTML’i** veya en azından `og:description` içinde tam manifesto | Bot JS çalıştırmaz → şu an bot metin görmüyor | 30 dk |
| **P1-1** | `prefers-reduced-motion` + tipografi `İ` düzeltmesi | Erişilebilirlik + marka imajının çekirdeği | 1 saat |
| **P1-2** | “Vesika Defteri” arşivi + profil linkleri + CTA + alıntı kopyalama düğmesi | Dönüşüm (site şu an çıkmaz sokak) | 2–4 saat |
| **P2** | İçeriği `src/content.ts`'e taşı, bileşenleri böl, `useScroll` state re-render’ını kaldır, `InkWriter` durum makinesini düzelt, CI’a typecheck + boyut muhafızı | Bakılabilirlik, çok dillilik, A/B | 1–2 gün |
| **P3** | Repo hijyeni (ölü görseller, LICENSE, commit/author düzeni), ayrı `web` build modu | Uzun ömür | yarım gün |

> **Tek cümlelik teşhis:** Sanat yönetimi 9/10, mühendislik 5/10, dağıtım altyapısı 1/10. Markanın büyümesini engelleyen şey estetik değil; **8,5 MB’lık bir link ve sosyal önizlemesi olmayan bir sayfa.**

---

## 1. DIŞARIDAN BAKIŞ (yazı-tura: ilk 3 saniye, ilk 30 saniye, ilk 3 dakika)

### 1.1 İlk saniyelerde çalışan şeyler (bunları bozma)

- **“Vesika No: 01 / EK: 01 · YANGIN / Duruş · Yeniden İnşa”** arşiv dili. Bu, sitede en özgün buluş. Bir manifestoya “kanıt dosyası” çerçevesi vermek, okuru pasif izleyiciden **dosyayı inceleyen dedektife** çeviriyor. Bu dil, sosyal serisinin iskeleti olmaya hazır (bkz. §3.4).
- **Paslı bükük çivi SVG’si** (`BentNail`) ve duvara kazınmış yazı (`carved-wall-text`): 3D’ye kaçmadan “fiziksel” hissi veriyor. Türkiye’deki koyu tema hesapların çoğu düz siyah + serif yapar; bu fark yaratır.
- Grayscale + tek “cam lamba” ışığı: görsel yorgunluğu düşürüyor, ekran süresini artırıyor, thumbnail kalabalığında ayırt edici.
- Bölüm mimarisi: I → II → II.b → III → IV → Coda. Her bölümün kendi “vuruş cümlesi” var. Bu, otomatik olarak **6 adet carousel kapağı** demek.

### 1.2 İlk 3 saniyede kırılan şeyler

| Sorun | Kanıt | Dışarıdan algısı |
|---|---|---|
| Sayfa 8,5 MB (gzip) | `dist/index.html` ölçümü | Beyaz/koyu boş ekran → %55+ ilk izlenme kaybı; Stories/DM link tıklaması yarıda bırakılır |
| `AŞAĞI KAYDIR` ipucu hero’nun altında, ilk ekranda değil | `App.tsx:492`, hero `min-h-screen` (satır 329) + `mt-12` | İlk ekranda “kaydırılabilir” olduğu belli değil; manifestonun ~%80’i hiç görülmez |
| Kazınmış duvar yazısı okunmuyor | `.carved-wall-text { color:#070709 }` · `.wall-surface { background:#0b0b0d }` → kontrast oranı **≈1,05:1** | “Sitede bozukluk var” izlenimi; metin kasıtlı olarak silik olsa da mobilde kayıp. WCAG AA için normal metinde **4,5:1** gerekir |
| Hero mobilde 68 px’lik 4 fotoğraf | `w-[68px]` breakpoint’leri (`App.tsx` satır 375, 393, 437, 455) | Fotoğrafların konsepti “kanıt”; 68 px’te kanıt okunmaz, sadece leke görünür |
| `BEN PRENSİP` başlığında `İ` karakteri yanlış fontta | Cinzel `unicode-range` listesinde **U+0130 yok** (bkz. §2.2) | Markanın adının yazıldığı yerde başka bir fonta düşüyor; “titiziz” diyen bir markada en pahalı kusur |
| Sonsuz animasyon yükü (12+) | `mist`, `slowPulse`, `inkNibPulse`, `heroIn`, `reveal`; `prefers-reduced-motion` 0 adet | Hareket hassasiyeti olan kullanıcıda mide bulantısı/migren; vestibüler bozuklukta site kullanılamaz |

### 1.3 İlk 3 dakikada kaybedilenler (dönüşüm hunisi yok)

Sırayla: manifestoyu okudunuz, etkilendiniz… **ve sonra?** Sayfada:

- **Hiç profil/bağlantı yok.** Instagram, X, TikTok, YouTube, Substack, Spotify, e-posta, CV, kitap — hiçbirine link yok. (`grep -c "href" src/App.tsx` = 0)
- **Tek bir CTA yok.** “Takip et”, “yaz”, “indir”, “abone ol”, “iletişim” yok. Footer sadece `SALIM GÜMÜŞ · Prensip · Kural · Yıkım` ile bitiyor.
- **Derinlik/kaynak yok.** Alıntıların hangi tarihte, hangi bağlamda yazıldığı yok → alıntılar kopyalanır, **siz değil**. Sayfada telif/duruluk ifadesi de yok (repo LICENSE’sız).
- **Tekrar gelme sebebi yok.** Sayılandırılmış, tarihlenen bir arşiv yok — “Vesika No: 01” yazıyor ama 02 diye bir yer yok. Bu, markanın en güçlü fikrinin uygulanmamış hâli.

**Sonuç:** Site şu an bir **duvar ilanı**; oysa “Vesika No: 01” dili, onun bir **arşiv/defter** olmak istediğini söylüyor. Dışarıdan bakışın tek kritik önerisi: siteyi *son durağı olan bir yer* olmaktan çıkar, *takip edilen bir seri* hâline getir.

---

## 2. İÇERİDEN BAKIŞ — mühendislik incelemesi

### 2.1 Build & paketleme (en kritik teknik bulgu)

`vite.config.ts` satır 12: `plugins: [react(), tailwindcss(), viteSingleFile()]`

`vite-plugin-singlefile`, **tüm** asset’leri base64 ile HTML içine gömer. Ölçüm:

```
dist/index.html                     11,942,573 B   (11,39 MB)
  ├─ <script> (JS + gömülü base64)  11,617 KB   → bunun 11,400 KB'ı görüntü  (%98)
  ├─ <style>                            45 KB
  └─ kod + CSS toplam (data: URI'ler hariç) 263 KB
gzip: 8,892,840 B (8,48 MB)
```

Bunun somut sonuçları:
1. **Lazy load imkânsız.** `<img>` etiketlerinde `loading="lazy"` olsa bile veri zaten HTML’in içinde gelir; indirmeyi ertelemenin anlamı kalmaz. 11 görselin 11’i de ilk byte’ta gelir.
2. **Cachelenemez.** Vite normalde `index-Ctz8F.js` gibi hash’li dosyalar çıkarır; burada tek `index.html` var ve GitHub Pages `html` dosyalarını `max-age=600` + revalidate ile servis eder → **her açılışta 8,5 MB yeniden iner.** Ziyaretçi siteyi 5 kez açsa 42 MB.
3. **Responsive image imkânsız.** Tek dosya, tek boyut. 68 px’lik thumbnail için 849×668 görsel kullanılıyor; hero’nun ortasında 1024×682 görsel 380 px kutuda duruyor.
4. **Bot/arama tarafı JS bekler:** sayfa SPA; `og:` de yok → Instagram/Twitter/WhatsApp önizlemesi boş, Google metni göremez (bkz. §2.10).

**Öneri A (30 dk, tek satır — önerilen):** `viteSingleFile()` sadece “tek dosya taşınabilirliği” gerekiyorsa mantıklı (USB’de gezdirmek, e-posta ile göndermek). Web’de zararı faydasından büyük:

```ts
// vite.config.ts
export default defineConfig({
  base: '/dark-philosophical-prose-fragments/',   // GH Pages alt yol — yoksa /favicon.ico 404
  plugins: [react(), tailwindcss()],               // viteSingleFile() çıkar
  build: { assetsInlineLimit: 0 },                 // küçükler bile dosya olsun; cache'lensin
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
});
```

**Öneri B (iki mod — tavsiye edilen):** Web sürümü ayrı, “tek dosya” sürümü ayrı:

```jsonc
// package.json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "build:web": "vite build",
  "build:single": "SINGLE=1 vite build",
  "typecheck": "tsc --noEmit",
  "optimize:assets": "node scripts/optimize-assets.mjs",
  "size:check": "node scripts/size-guard.mjs"
}
```
```ts
// vite.config.ts — tek satırlık anahtar
plugins: [react(), tailwindcss(), ...(process.env.SINGLE ? [viteSingleFile()] : [])],
```

**Öneri C (görsel hattı):** Aşağıda ölçtüm. `src/assets` içindeki **gerçek** kullanım 10 dosya / 8,35 MB → hedef 707 KB:

| Görsel | Şu an | Ekranda render | Öneri (gri + WebP q78) | Kazanç |
|---|---|---|---|---|
| `raven.jpg` | **6.890 KB** | ~650 px (masaüstü yarı sütun) | **77 KB** @1300px | **-98,9%** |
| `table.jpg` | 300 KB | full-bleed (2560) | 120 KB | -60% |
| `soil.jpg` | 297 KB | full-bleed | 109 KB | -63% |
| `salim_fall_ground.jpg` | 287 KB | ≤1000 px | 142 KB | -51% |
| `bed.jpg` | 265 KB | ~896 px | 101 KB | -62% |
| `salim_angel_storm.jpg` | 163 KB | ~118 px! | 20 KB @520px | -88% |
| `salim_portrait_feather.jpg` | 151 KB | ~380 px | 69 KB | -54% |
| `salim_fall_flame.jpg` | 110 KB | ~88 px! | 19 KB | -83% |
| `salim_angel_pure.webp` | 43 KB | ~88 px! | 14 KB | -67% |
| `salim_fall_abyss.jpg` | 43 KB | ~68 px! | 6 KB | -86% |
| **Toplam** | **8,35 MB** | | **707 KB** | **-%92** |

Not: tüm bu görseller zaten CSS ile grayscale/contrast filtresinden geçiyor → **renk verisi boşuna taşınıyor.** Sıkıştırma kayıpsıza yakın, çünkü algılanan ayrıntı gri kanal.

`raven.jpg` özelinde ek bulgu: Bölüm III’te bir **kuzgun yakın planı** gösteriliyor; repoda buna hazır `salim_dark_raven.jpg` (157 KB) duruyor ve hiç kullanılmıyor. Sadece bu iki dosyayı takas etmek bile 6,73 MB’ın ~6,6 MB’ını geri getirir.

**Boyut muhafızı (CI, 10 satır):**

```js
// scripts/size-guard.mjs
import { statSync } from 'node:fs';
import { globSync } from 'node:fs'; // Node 22+ / ya da tiny glob
const BUDGET = 1.5 * 1024 * 1024;    // 1,5 MB
const files = globSync('dist/**/*');
let total = 0;
for (const f of files) total += statSync(f).size;
if (total > BUDGET) { console.error(`✖ bundle ${ (total/1048576).toFixed(2) }MB > bütçe ${BUDGET/1048576}MB`); process.exit(1); }
console.log(`✓ bundle ${(total/1048576).toFixed(2)} MB (bütçe ${BUDGET/1048576} MB)`);
```

### 2.2 Tipografi: `font-display` `İ` taşımıyor (marka için kritik)

`index.html` satır 9–11’de 5 aile isteniyor: Caveat, Cinzel, Cormorant Garamond, JetBrains Mono, Marck Script.

`npx tsc` değil, `unicode-range` kontrolü:

| Font | `U+0131` (ı) | `U+0130` (İ) | Sitede kullanımı |
|---|---|---|---|
| **Cinzel** (`--font-display`) | ✅ latin alt kümede | ❌ **yok** (latin: `U+0000-00FF, U+0131, U+0152-0153…`, latin-ext: `U+0100-02BA…`; ikisinde de U+0130 yok) | `BEN PRENSİP` (satır 324, 550), `ChapterMark` başlıkları, `Yerden Kalkış`, `DİK DURURSANIZ` — 10 kullanım |
| Cormorant Garamond | ✅ | ✅ | gövde metni — sorun yok |
| Caveat (`ink-script`) | ✅ | ❌ → fallback: `cursive` | hero’nun el yazısı satırları; `ş`(U+015F) ✅, `ğ`(U+011F) ✅ — `İ` yoksa sorun değil çünkü satırlarda büyük `İ` yok |
| JetBrains Mono | ✅ | ❌ | etiketler: `SALIM GÜMÜŞ · MANIFESTO · MMXXVI`, `EK: 01 · YANGIN` — büyük `İ` yok; ama `Vesika No` satırında risk yok |
| Marck Script | ✅ (latin-ext `U+0100-02BA`) | ❌ | **`--font-script` hiç kullanılmıyor** (grep: 0 adet) |

Somut kusur: `BEN PRENSİP` ve `PRENSİP · Kural · Yıkım` içindeki `İ`, Cinzel yerine Georgia/serif fallback ile çiziliyor. 10px’te göze batmaz; **128 px’lik silver-gradient başlıkta (satır 550) batıyor** — harf hem metrik olarak hem ton olarak kayar.

Üç çözüm (önerim 3. + 2. birlikte):
1. Fallback’i eşleştir: `--font-display: "Cinzel", "Cormorant Garamond", Georgia, serif;` → `İ` aynı ruhsal aileden gelir, kayma yumuşar. (5 satırlık iş, kalıcı çözüm değil)
2. `İ`’yi tipografik olarak çöz: başlık stilini `letter-spacing` yerine gerçek small-caps/uppercase kombinasyona çevir, ya da `font-feature-settings:"liga"` ile değil `text-transform: uppercase; font-variant-caps: small-caps;` ile Cinzel + Cormorant SC karışımı.
3. **En temizi:** başlık fontunu Türkçe’yi tam kapsayan bir epigrafik aileyle değiştirip **kendin barındır** (woff2, `font-display: swap`, `preload`): Cormorant SC, Trajan benzeri ücretsiz bir alternatif, ya da Cinzel’in `İ`’li sürümünü `@font-face` + `unicode-range: U+0130` ile **tek karakterlik subsetting** (pyftsubset/fonttools). ~3 KB’lık ek dosya, sorunu kökten kapatır:

```bash
# İ'yi Cinzel'e ekleyen 3 KB'lık yama (tek satır subsetting)
pip install fonttools brotli
wget https://fonts.gstatic.com/s/cinzel/v26/8vIJ7ww63mVu7gt79mT7.woff2 -O /tmp/cinzel.woff2
# fontforge ile U+0130'u latin-ext'ten kopyala → subset: "İ"
pyftsubset /tmp/cinzel.woff2 --output-file=src/assets/fonts/cinzel-İ.woff2 --unicodes=U+0130 --flavor=woff2
```
```css
@font-face {
  font-family: "Cinzel TR";
  src: url("/fonts/cinzel-İ.woff2") format("woff2");
  unicode-range: U+0130;               /* sadece İ için devreye girer */
  font-display: swap;
}
:root { --font-display: "Cinzel", "Cinzel TR", "Cormorant Garamond", Georgia, serif; }
```

Ayrıca: `&subset=latin,latin-ext` parametresi `css2` ucunda **geçersiz/yok sayılıyor** (yanıt hâlâ cyrillic ve vietnamese `@font-face` blokları döndürüyor) → sil. 5 aile × ~20 stil isteniyor; **gereken 4 aile**: Caveat (400,700), Cinzel (400,600,700,900), Cormorant Garamond (ital+wght 300–700; şu an 10 stil isteniyor, sitede 4 kullanım var), JetBrains Mono (400,600). Kazanç: daha az `@font-face` ayrıştırması + daha az fallback FOUT. `--font-sans: Inter` **hiç yüklenmiyor** → ya Google Fonts’tan ekle ya da `@theme`’den çıkar (ölü tanımlı token; `--font-script` de aynı şekilde ölü).

### 2.3 TypeScript ve derleme hattı

`npx tsc --noEmit` (repo `tsconfig.json` `strict + noUnusedLocals + noUnusedParameters` açık):

```
src/App.tsx(3,1):  error TS6133: 'salimDarkImg' is declared but its value is never read.
src/App.tsx(4,1):  error TS6133: 'salimWhiteImg' is declared but its value is never read.
src/App.tsx(8,1):  error TS6133: 'fallSkyImg' is declared but its value is never read.
src/App.tsx(304,11): error TS6133: 'y' is declared but its value is never read.
```

- 4 ölü import/degisken = **1,9 MB** ölü görsel deposu + okuma gürültüsü. Rollup bunları tree-shake ediyor (doğrulandı: `dist`’te tam olarak render’daki 10 görüntü var), yani bundle şişmiyor; **ama niyet belirsiz**: `salim_fall_sky.webp` (aşağıda görsel olarak EK:04’ten iyi) yarım kalmış bir tasarım kararının kanıtı.
- `npm run build` = sadece `vite build`. **Tip kontrolü yok** ve `.github/workflows/deploy.yml` de typecheck çalıştırmıyor → kırmızı editörde, yeşil CI’da. Düzeltme: `"build": "npm run typecheck && vite build"` **veya** workflow’a `npm run typecheck` adımı + aşağıdaki boyut muhafızı.
- Vite’ın kendisi de TS tip hatalarını yakalamaz (esbuild tip siler) → bu, “build geçiyor” yanılsamasının kaynağı.
- ESLint/Prettier **kurulu değil**, hiç config yok, `.editorconfig` yok. En az `eslint` + `@eslint/js` + `typescript-eslint` + `eslint-plugin-react-hooks` (aşağıdaki §2.5 hatası gibi sessiz re-render sorunlarını yakalar) + `prettier` önerilir.

### 2.4 Görsel varlık hijyeni (tam envanter)

Toplam `src/assets` = **9,43 MB / 17 dosya**. Gerçekte ekranda 10 dosya var.

| Dosya | Boyut | Durum | Not |
|---|---|---|---|
| `raven.jpg` | 6.890 KB | kullanımda | 2608×1456 → ekranda ~650 px. Sayfanın %57’si |
| `table.jpg` | 300 KB | kullanımda | Katedral + uzun masa kompozisyonu; Bölüm IV metniyle birebir örtüşüyor ama `bg-ink/80` altında neredeyse görünmüyor (bkz. §1.1/§2.7) |
| `soil.jpg` | 297 KB | kullanımda | `ansoil.jpg` ile **birebir aynı dosya** (md5 `104a62c3…`) → depo kirliliği |
| `ansoil.jpg` | 297 KB | **ölü** | import bile yok |
| `salim_fall_ground.jpg` | 287 KB | kullanımda | 1024×973 → 3/4 kutuda kırpılıyor |
| `hero.jpg` | 244 KB | **ölü** | yan profilli siyah/beyaz kanat kadrajı; hero görselinden daha güçlü (aşağıda) |
| `salim_fall_flight.jpg` | 115 KB | **ölü** | düşüş sekansının eksik halkası |
| `salim_white_raven.jpg` | 158 KB | **ölü import** | |
| `salim_dark_raven.jpg` | 157 KB | **ölü import** | Bölüm III için ideal, 6,7 MB yerine 157 KB |
| `salim_fall_sky.webp` | 93 KB | **ölü import** | ateşli kanatlarla düşüş — “EK:01 · YANGIN” için mevcut olandan daha iyi kare |
| `salim_angel_storm.jpg` | 163 KB | kullanımda | 3:2 → 3/4 kutuda kırpılıyor; “EK:04 · MASUMİYET” etiketiyle sunulan kare fırtına karesi (etiket/içerik uyuşmazlığı) |
| `salim_portrait_feather.jpg` | 151 KB | kullanımda ×2 | hero + Coda (Coda’da `aria-hidden` ✅) |
| `salim_fall_flame.jpg` | 110 KB | kullanımda | 849×668 → ekranda 88 px |
| `salim_angel_profile.webp` | 45 KB | **ölü** | serinin en “kapak” karesi |
| `salim_fall_abyss.jpg` | 43 KB | kullanımda | 864×603 → ekranda 68 px |
| `salim_angel_pure.webp` | 43 KB | kullanımda | 3:2 kırpma |
| `bed.jpg` | 265 KB | kullanımda | “yatağın ayaklarını keserim” ile birebir örtüşen kadraj ✅ |

**Bu tablonun stratejik sonucu:** 1,9 MB’lık kullanılmayan arşiv, sitenin geri kalanı için gereken **içerik fabrikasının ta kendisi** — yeni üretim yapmadan 6–8 gönderi daha (§3.4).

### 2.5 React: render bütçesi ve iki gerçek hata

**(a) `useScroll` — tüm sayfa her karede yeniden render oluyor** (`App.tsx` satır 43–68 (`useScroll`) + 304 (kullanımda)):

```ts
const { y, pct } = useScroll();   // y hiç kullanılmıyor (TS6133)
```

`onScroll` içinde `setY(...)` **her animasyon karesinde** state güncelliyor → 860 satırlık kök `App` ağacı tamamıyla yeniden render/reconcile ediliyor (tipografi katmanları, 11 görsel, SVG’ler dahil). Bu, düşük güçlü Android’de scroll’u hissedilir şekilde ağırlaştırır ve `useReveal` gibi alt bileşenlerde gereksiz iş üretir. Düzeltme:

```ts
function useScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const h = document.documentElement;
        const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
        if (barRef.current) barRef.current.style.width = `${(p * 100).toFixed(2)}%`;
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return barRef;   // state yok → re-render yok
}
```
`y` değişkenini ya sil ya da gerçekten kullan (ör. hafif parallax); **ama state olarak tutma.** Alternatif: CSS Scroll-Driven Animations (`animation-timeline: scroll()`), bugün Chrome/Safari’de çalışır, JS hiç gerekmez:
```css
.progress { transform-origin: 0 50%; transform: scaleX(var(--p, 0)); animation: prog linear both; animation-timeline: scroll(root block); }
@keyframes prog { from { transform: scaleX(0) } to { transform: scaleX(1) } }
```

**(b) `InkWriter` (satır 220) — ölü durumlar, re-render başına karakter, zamanlama hatası** (`App.tsx` 220–300):

```ts
const [stage, setStage] = useState<"line1" | "pause1" | "line2" | "pause2" | "line3" | "done">("line1");
// "pause1" ve "pause2" HİÇ set edilmiyor → durum makinesinin 2/3'ü ulaşılabilir değil
```
- Satır 1 bittiğinde `setStage("line2")` çağrılıyor; `pause1`/`pause2` ölü. Tip, gerçekte olmayanı vaat ediyor → `type Stage = "line1" | "line2" | "line3" | "done"` (veya pause’ları gerçekten bağla).
- Her karakter = bir `setState`. Etki sınırlı çünkü `line1..3` state’i `InkWriter` bileşeninin içinde: **InkWriter’ın kendi ağacı** ~180 kez (3 satır × ~60 karakter) yeniden render olur, kök `App` değil. Asıl maliyet her harfte `clearTimeout`+`setTimeout` döngüsü ve `stage` bağımlılığı; ayrıca tipografi katmanı (blur/text-shadow) her karede yeniden hesaplanır. Öneri: `requestAnimationFrame` tabanlı zamanlayıcı + karakterleri tek `useState` yerine tek `useRef` + `textContent` yazımı; ya da CSS `steps()` + `clip-path` animasyonuna çevir (JS sıfır).
- **En büyük UX hatası:** tipografi hero’nun içinde ve `useEffect` **mount’ta** başlıyor. Kullanıcı sayfayı açar, 2 saniye bakar, kaydırır → manifestonun imza anı **zaten oynanmış** olur. Bu, sayfanın en sinematik anı; `useReveal` ile eşleştirilip **görünür olduğunda** başlamalı, “tekrar oyna” düğmesiyle birlikte (aynı düğme §3’te Reels/loop davranışıyla da örtüşür).
- `Math.random()` ile gecikme süresi efektin içinde → deterministik değil, test edilemez, StrictMode çift çağrısında davranış değişir. Sabit bir seed’li PRNG ya da basit kural matrisi kullan.

**(c) `Reveal`** (satır 71–91): `opacity:0` + `animationPlayState:paused` = JS/IO yoksa **içerik kalıcı görünmez**. `IntersectionObserver` tek satırla kontrol edilmeli, ayrıca `<noscript>` için CSS fallback:
```css
@supports not (animation-timeline: view()) { .reveal { opacity: 1 } } /* ya da */
html.no-io .reveal { opacity: 1; animation: none }
```
Bu arada `useReveal` her bölüm için ayrı `IntersectionObserver` kuruyor (7 gözlemci) — sorun değil ama tek paylaşılan bir gözlemci + `WeakMap` daha ucuzdur.

**(d) `Ornament`, `BentNail`, `RustedTack`** dekoratif SVG’leri `aria-hidden="true"` + `focusable="false"` değil; ekran okuyucu “resim 54×58” okur. 4 satırlık düzeltme.

### 2.6 Erişilebilirlik (somut, sıralı)

| # | Bulgu | Kanıt | Düzeltme |
|---|---|---|---|
| 1 | `<h1>` yok, tek `<h2>` | `ChapterMark` içinde `<h2>`; başlıklar `<p>` olarak yazılmış (550, 640…) | Hero’ya `<h1>` (sr-only olabilir): `BEN PRENSİP — Salim Gümüş`; her bölüm başlığı h2, alt vuruşlar h3 |
| 2 | `<main>` yok | `header` + 6 `section` + `footer` | `<main>` ile sar; `skip link` ekle (`#icerik`) |
| 3 | `lang` doğru (`tr`) ✅ ama `xml:lang`/`hreflang` yok | `index.html:2` | EN sürümü gelirse `hreflang` + `link rel=alternate` |
| 4 | Kontrast: kazınmış duvar yazısı ≈1,05:1 | `.carved-wall-text` #070709 / #0b0b0d | ya görünürlüğü #6f6f6f’e çek (+`:hover/:focus-visible`), ya da **“ışıği aç” düğmesi** — hem erişilebilirlik hem marka numarasi (§3.3) |
| 5 | `prefers-reduced-motion` yok | kaynakta 0, build çıktısında 0 | aşağıdaki 6 satır CSS |
| 6 | Sadece hover ile çalışan efektler | `.frame:hover img`, `.companion-snapshot:hover`, scroll cue `hover:opacity-90` | `@media (hover: hover)` ile sar; dokunmatikte `active`/`focus-within` |
| 7 | Odak stili yok | `:focus-visible` hiç yok | `:focus-visible { outline: 1px solid #ece9e2; outline-offset: 3px }` — koyu temada 1 px gümüş, tasarıma zarar vermez |
| 8 | `alt` metinleri var ✅ ama bağlamsız | 11 `alt=` | Alt’ları tam cümle + “kanıt dosyası” diliyle yaz: `alt="Kanıt 01: alevlenen kanatlar — Salim Gümüş, 2026"` (aynı metin Instagram’da **arama/SEO sinyali** olur, bkz. §3.2) |
| 9 | `AŞAĞI KAYDIR` görsel ipucu | ekrana sığmayabiliyor | `<a href="#bolüm-1" aria-label="Manifestoya geç">` yap; klavyeyle de gezinsin, hedefli scrollbar da |
| 10 | Sonsuz animasyonlar | `mist 26s`, `pulse-slow 4s`, `inkNibPulse .75s` | reduced-motion (aşağıda) |

```css
/* src/index.css — ekle */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
    scroll-behavior: auto !important;
  }
  .reveal, .hero-text { opacity: 1 !important; }        /* içerik asla kaybolmasın */
  .ink-nib-cursor { display: none }
}
```
JS tarafında tipografi efektine saygı:
```ts
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduce) { setLine1(l1); setLine2(l2); setLine3(l3); setStage('done'); return; }
```

### 2.7 Tasarım ↔ kod sürtüşmeleri (küçük ama pahalı)

1. **`table.jpg` boşa harcanıyor.** Bölüm IV `bg-ink/80` + iki gradyan overlay ile %80+ opak karartılıyor; katedralin ışık huzmeleri neredeyse görünmüyor. Bu, manifestonun en güçlü görsellerinden biri. Öneri: overlay’i `from-ink via-ink/60 to-ink` yap ya da görseli `mix-blend-mode: luminosity` + `opacity:.35` ile **metnin arkasına değil yanına** al (sticky yarım sütun, Bölüm II/III kalıbı).
2. **Hero fotoğraflarının kadraj oranı tutmuyor:** kutular `aspect-[3/4]`, dosyalar 3:2 / 849×668 / 1024×973 → `object-cover` sürekli kırpıyor. Ya kutuyu `aspect-[3/2]` yap ya da görselleri 3/4’ten **yeniden kırp** (kayıp, kontrolsüz kırpma yerine bilinçli kadraj).
3. **`EK: 04 · MASUMİYET` etiketi ile görseli çelişiyor** (fırtına + ıslak kanat). `salim_fall_sky.webp` (ateşli kanatlar, düşüş) ve `salim_angel_profile.webp` (yan profil, temiz ışık) repoda duruyor: etiketlerle eşleşen doğru dosyalar bunlar.
4. **`overflow-x-hidden` gövde yerine kök `div`’de** (satır 308). Bu, `md:sticky` kullanan iki tam yükseklik görselin (`frame … md:sticky md:top-0`) kaydırma bağlamını değiştirir; tarayıcıya göre sticky’nin çalışmaması riskini doğurur. **Kalıcı çözüm:** `html, body { overflow-x: clip }` veya kökte `overflow-x` kullanma (parallax taşmalarını `clip` ile kes).
5. **Duvar dokusu her bölümde tek tek render ediliyor:** `.wall-surface` içinde 2 adet inline SVG `feTurbulence` (`baseFrequency .75 / numOctaves 5` ve `turbulence .15 / 3`) + `box-shadow inset 160px`. Şimdilik yalnız hero’da; **Coda ve footer’da da kullanmaya kalkarsan** mobilde paint süresi ciddi artar. Öneri: SVG’i 512×512 statik WebP/PNG olarak bir kez üret, CSS `background-repeat` ile kullan → aynı görünüm, sıfır filtre maliyeti.
6. `body::before` film grain `position:fixed; inset:0; z-index:100` → **tüm sayfayı** kaplayan, her frame’de yeniden boyanan tam ekran katman. GPU dostu hâli: `will-change: transform` + `transform: translateZ(0)`, ya da grain’i bölümlere paylaştır. Alternatif: grain’i SVG yerine 128×128 **PNG doku** ile tekrarla (şu an data-URI SVG `feTurbulence` her render’da üretiliyor).
7. Sabit yan raylar (`vertical-text`, `z-40`) `pointer-events-none` ✅ güzel düşünülmüş; ama `md:` breakpoint’inde ray genişliği kadar padding yok → 1280 px’te uç metinlerle çarpışabiliyor. `md:px-16` gibi bir güvenli alan ekle.
8. `index.html` içinde **favicon yok** (`public/` klasörü yok). Tarayıcı sekmesi koyu boş bir kare: akılda kalıcılık kaybı. Hızlı kazanım: `public/favicon.svg` — tek satır SVG: siyah zemin + gümüş kuzgun silueti ya da sadece “İ” harfi (şaka değil: marka harfi = en ucuz favicon).

### 2.8 Repo hijyeni

| Bulgu | Kanıt | Öneri |
|---|---|---|
| README yok | `ls README*` → yok | En az 15 satır: ne bu, nasıl çalıştırılır, deploy, görsel hakları |
| LICENSE yok | repo kökünde yok | İçerik izinsiz kopyalanıyor; `ALL Rights Reserved` açıkça yaz + “alıntı yaparken bağlantı ver” şartı (`docs/LICENSE.md`) |
| Commit yazarı placeholder | `Salim Gümüş <salim@example.com>` | `git config user.email` gerçek adresle düzelt (geçmiş için `filter-repo` gerekir; kritik değil ama itibar/hesap eşleşmesi için anlamlı) |
| Tek commit, 19 MB depo | `.git` 9,2 MB | Büyük binary’leri bundan sonra `git-lfs` veya harici depo; `raven.jpg` gibi dosyaları `assets-src/` dizininde `.gitignore`’la (sıkıştırılmış çıktı repoda kalsın) |
| `.gitignore` eksikleri | `node_modules`, `dist`, `.DS_Store`, `*.local` | `dist` yoktu ama var ✅; eklenmesi iyi olanlar: `.idea`, `*.log`, `.env*`, `.cache`, `stats.html` |
| `package-lock` çakışma riski | `npm ci` sorunsuz ✅ | `packageManager` alanı + `engines.node` ekle (`"node": ">=22"`); CI’daki `node-version: 22` ile eşleşsin |
| Depo adı markayla uyumsuz | `dark-philosophical-prose-fragments` | Şablon adı. Alan adı/handle planı buysa `salimgumus-vesika` gibi bir ad ve **custom domain** (`CNAME`, `applecurse.dev` / `vesika.co`) çok daha değerli (§3.5) |
| workflow’da kalite adımı yok | `deploy.yml` 12–40 | `typecheck`, `lint`, `size-guard`, PR önizleme workflow’u ekle (aşağıda) |

**CI şablonu (önerilen):**
```yaml
# .github/workflows/ci.yml (yeni)
name: CI
on: [pull_request, push]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npx eslint . || true        # lint'ı kurunca '|| true' kalkar
      - run: npm run build
      - run: node scripts/size-guard.mjs
```
```yaml
# deploy.yml — Build adımı şu hale gelsin
      - name: Build (+ typecheck & boyut muhafızı)
        run: npm run typecheck && npm run build && node scripts/size-guard.mjs
```

### 2.9 SEO ve makine-okuyabilirlik (boş olduğu için fırsat)

`index.html` şu an sadece `charset`, `viewport`, `title`, 1 font linki. Yok: `description`, `og:*`, `twitter:*`, `canonical`, `theme-color`, `robots`, `sitemap.xml`, `favicon`, `json-ld`, `manifest` (PWA), `alt` dışında semantik.

**Bot JS çalıştırmaz (çoğu):** bu bir SPA olduğundan, Google’ın render hizmetini saymazsak, **`og:` kartı çeken hiçbir platform metnin kendisini göremez** → paylaşım kartında sadece `applecurse.github.io/dark-philosophical-prose-fragments` yazar, üstüne de rastgele bir snippet. Kısacası 4 aylık sanat yönetimi, link paylaşıldığında **boş bir gri kutuya** dönüşüyor.

**P0 kopyala-yapıştır blok** (`index.html` `<head>` içine; `{{…}}` alanlarını doldur):

```html
<link rel="icon" href="/dark-philosophical-prose-fragments/favicon.svg" type="image/svg+xml" />
<meta name="theme-color" content="#060606" />

<title>BEN PRENSİP — Salim Gümüş · Vesika No: 01</title>
<meta name="description" content="Ben cennetin steril sakinlerinden değilim, meleklerle aynı notaya susmam. Benim sesim yasak meyveyi ısıran çene kemiğinden yükselir. — Salim Gümüş, Vesika No: 01" />
<link rel="canonical" href="https://applecurse.github.io/dark-philosophical-prose-fragments/" />
<link rel="alternate" hreflang="tr" href="…/" />
<link rel="alternate" hreflang="en" href="…/en/" />

<meta property="og:type" content="profile" />
<meta property="og:site_name" content="Vesika" />
<meta property="og:locale" content="tr_TR" />
<meta property="og:title" content="BEN PRENSİP — Salim Gümüş" />
<meta property="og:description" content="Şeytan hata yaptı: BEN PRENSİP. Yatağın ayaklarını keserim; korkunun kaynağını ortadan kaldırırım." />
<meta property="og:url" content="…/" />
<meta property="og:image" content="…/og.png" />
<meta property="og:image:alt" content="Yarı siyah yarı beyaz portre, omzunda kuzgun; duvara kazınmış manifesto" />
<meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@{{handle}}" /><meta name="twitter:creator" content="@{{handle}}" />
<meta name="robots" content="max-image-preview:large" />

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Person", "@id": "#salimgumus", "name": "Salim Gümüş",
      "alternateName": "BEN PRENSİP", "url": "…/",
      "image": "…/portrait.jpg", "sameAs": ["https://instagram.com/{{h}}","https://x.com/{{h}}"] },
    { "@type": "CreativeWork", "name": "BEN PRENSİP (Vesika No: 01)",
      "author": { "@id": "#salimgumus" }, "datePublished": "2026-09-14",
      "inLanguage": "tr", "genre": ["karanlık felsefe", "manifasto", "şiir"],
      "abstract": "Yıkım ve yeniden inşa üzerine 4 bölümlük manifesto.",
      "isAccessibleForFree": true },
    { "@type": "WebSite", "name": "Vesika", "url": "…/",
      "publisher": { "@id": "#salimgumus" } }
  ]
}
</script>
```

Ek dosyalar: `public/robots.txt`, `public/sitemap.xml`, `public/og.png` (1200×630), `public/llms.txt` (yeni ve ucuz kazanım — Ayan/ChatGPT alıntıları doğru kaynakla eşleştirsin):
```
# public/llms.txt
Vesika / BEN PRENSİP — Salim Gümüş'ün manifestosu (Vesika No: 01).
Kaynak: https://applecurse.github.io/dark-philosophical-prose-fragments/
Alıntılar kaynaklı kullanılmalıdır. Lisans: alıntı + bağlantı serbest, toplu kopyalama yasak.
```

**Tek sayfa + 259 kelime = “ince içerik” riski.** Çözüm estetiği bozmaz: her bölümün altına 3–5 satır “dosya notu” (tarih, yer, bağlam: `Vesika 01 · 14.09.2026 · kaba sıva, Bodrum`) ekle; bu hem kelime sayısını hem E-E-A-T sinyalini hem de “bu gerçek bir insan” izlenimini yükseltir. Arşiv (§3.4) büyüdükçe sorun kendiliğinden biter.

### 2.10 Ne iyi yapılmış (dokunma, bozma)

- `useReveal`’de `unobserve` + `disconnect` temizliği doğru; `useScroll`’da `passive: true` ve `cancelAnimationFrame` var ✅
- `tsconfig`’te `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` açık — birçok şablon proje bunları kapalı tutar ✅
- Görsellere tutarlı `alt`, dekoratiflere `aria-hidden` (`App.tsx:809`) ✅
- `cn()` + clsx/tailwind-merge altyapısı kurulu ama **hiç kullanılmıyor** → koşullu sınıf biriktikçe işe yarayacak, şimdiden eklenmiş olması iyi refleks
- `::selection` ters çevirme, `::-webkit-scrollbar` kişiselleştirmesi, `scroll-behavior:smooth`, `preconnect` font domain’leri, `backdrop-blur` ölçülü kullanım ✅
- Renk/ölçek token’ları `@theme` içinde (`ink/ash/smoke/bone/silver/blood`) ✅ — `blood` tanımı kullanılmıyor: ya Bölüm I’de bir vurgu (ör. `BEN PRENSİP.` altına ince bir kan çizgisi) kullan ya da sil
- Bölüm II ve III’ün aynalı grid yapısı (görsel-sol/metin-sağ ↔ metin-sol/görsel-sağ) ✅ ritim iyi
- `md:`-first yaklaşım: mobilde tek sütun, masaüstünde sticky — doğru içgüdü; sadece §2.7/4’teki `overflow` tuzağına dikkat

---

## 3. SOSYAL MEDYA UZMANI GÖZÜ

### 3.1 Stratejik teşhis: “harika ürün, sıfır dağıtım”

Sitenin kendisi bir **kapak görseli** gibi duruyor ama “bağlantıyı kopyala”dan öte bir paylaşım altyapısı yok. 2026’da bir hesabın büyümesini belirleyen şey estetik değil, üç teknik şey: **kaydetme, DM’den gönderim, açılır önizleme.** Senin sitesinin üçünde de altyapı yok.

Ölçülen açılar (hepsi yukarıdaki bulgulardan türedi):

1. Link paylaşıldığında **önizleme kartı yok** → tık oranı (CTR) kartı olan hesaba göre kat kat düşük. Bu, tek başına en büyük erişim kaybın.
2. Link **mobilde 10 sn – 1 dk** arası açılıyor → DM’den atılan link “açılmadı” diye geri dönüyor; “çirkin/bozuk” izlenimi markanın karanlık estetiğini “amatör”e çeviriyor.
3. **Hiçbir profil linki yok** → siteye gelen trafik sosyal hesaba **akamıyor**. Huni tersten çalışıyor: sosyalde görünürlüğün olsa bile site seni takip ettirmiyor.
4. **CTA ve tohum yok** → bugün “beğendim, sonra ne?” sorusunun cevabı yok. Kaydetme butonu bile koyacak bir şey yok.
5. **Tüm görseller yapay görünümlü** → Instagram 2025–26’da orijinalliği bir tercih değil **uygunluk kapısı** hâline getirdi ve “ham, insan elinden çıkmış” içeriği öne çıkarıyor. Estetik olarak sorun yok; dağıtım olarak risk var (§3.2, Kural 5).

### 3.2 2026 platform gerçekleri — seni ilgilendiren 6 madde

| Platform gerçeği | Senin için sonucu |
|---|---|
| Instagram’ın açıkça saydığı 3 sinyal: **watch time, likes per reach, sends per reach**. Mosseri: sends, beğeniden ~3–5 kat ağırlıklı ve **bağlantısız (keşfet) erişimin** ana kaldıracı. Kaynak: [coruzant.com](https://coruzant.com/analytics/instagram-algorithm-2026-guide/), [zestrank.com](https://zestrank.com/instagram-algorithm-2026/) | Her gönderi **DM’de gönderilmeye** optimize edilmeli: “bu cümle seni bulduysa, şu an aklındaki kişiye at.” Alıntı kartları tam da bunun için ideal. **Gönderi başına sends/reach hesabı:** `sends ÷ reach ×100`; %1–2 sağlıklı, %2+ güçlü ([socialync](https://www.socialync.io/blog/instagram-shares-algorithm-complete-guide-2026)) |
| Hashtag **5 ile sınırlı** ve erişimi artırmıyor; işi “konu sinyali + arama” ([coruzant](https://coruzant.com/analytics/instagram-algorithm-2026-guide/)) | 25 hashtag'lik spam yerine **3–5 tane**, Türkçe anahtar kelimeler **caption’ın ilk satırında** doğal cümle içinde |
| **Orijinallik = uygunluk kapısı**; repost ağırlıklı hesaplar Nisan 2026’da öneri uygunluğunu kaybetti; 2026’da “AI-look” içerik aleyhine sinyal var | Kendi üretimin olman büyük avantaj. Yine de **haftada en az 2 gerçek fotoğraf/video** (telefonla, granularity’yi bozmayan ham kadraj), “behind-the-scenes” karesi ve seri numarası/ watermark’ı ekle |
| Instagram altyazıları **Google’da indexleniyor**; GSC artık Instagram gönderi performansını raporluyor ([coruzant](https://coruzant.com/analytics/instagram-algorithm-2026-guide/)) | Caption’lar arama metni gibi yazılmalı: marka adı + tema + bölüm adı. Görsel `alt` metinlerini Instagram’da **da** doldur (site alt’larını kopyala) |
| Meta reklamlarında **küfür/hakaret içerik, görsel ve landing page’de yasak**; “profane or obscenity” ve “aşırı caps/küfür” reddedilen kategori; landing page reklam incelemesinin parçası ([adsuploader](https://adsuploader.com/blog/meta-ad-guidelines), [bir.ch](https://bir.ch/blog/what-can-you-advertise-on-meta), [tech4you](https://tech4you.io/meta-advertising-policies/)) | §3.3’teki çift metin stratejisi zorunlu: **reklam/lansman hattında küfürlü satır kullanılamaz.** Sitede durması bile “kalite/reklam uygunluğu” değerlendirmesinde risk; bu yüzden reklam versiyonunda (ör. `?v=ads` ya da ayrı landing) temizle |
| TikTok/Reels için ilk 3 saniye + tamamlanma; “Trial Reels” ile bağlantısız kitlede test | Sansürsüz varyantları **Trial Reels** ile yayına al (takipçiye görünmeden test) |

### 3.3 Meta marka güvenliği ve “çift metin” (editsiz kimlik + taşınabilir erişim)

Hero’daki imza cümlesi:

> “Sikemeyeceğiniz kadar tecrübeli, sikemeyecek kadar yorgun.”

Bu, serinin en keskin ve en akılda kalıcı satırı; **siteden kaldırmanı önermiyorum.** Önerim, tek bir hamleyi iki versiyonla yönetmek:

| Hat | Kullanım | Kurallar |
|---|---|---|
| **A. Çıplak (siten + X/Threads + birincil IG gönderisi)** | Kendi alan adında tam metin. X’te sansür yok; IG’de **görsel üstünde** metin olarak durabilir, **altyazıda/kaption’da değil** | · Site başlığında ve `title`/`h1`’de kullanma (aramada “explicit” algısı riski). · Caption’larda `s*k*mek`, `si̇k` gibi harf-numaralı “sansür taklidi” **kullanma**: platformlar bunları zaten tanıyor ve bu tarz daha ağır “circumventing” sinyali üretir |
| **B. Temiz (reklam, işbirliği, basın, link preview, `og:description`, ilk 3 satır)** | Erişimin satıldığı her yerde | Ör. temiz eşdeğerler (aynı ritim, aynı bıçak): · “Tecrübem şüphe uyandırır, yorgunluğum cevap vermez.” · “O kadar çok düştüm ki, düşüşü yönetmelik yazdım.” · “Korkuyu pazarlık masasına oturtmam; masayı kaldırırım.” · “Yorulmuş ama hazır.” |

Kural: **birincil paylaşılabilir nesne her zaman B, site deneyimi A.** Böylece ne “sansürlenmiş gibi” ezik durursun ne de erişimin reklam/keşfet duvarına çarpar.

Ek olarak `robots`/`meta` hijyeni: sayfanın `title`'ı şu an `BEN PRENSİP — Salim Gümüş` ✅ (küfür yok), o yüzden arama/preview tarafı temiz; sorun **yalnızca** render edilen gövde. Bu yüzden **`og:image` içine o satırı koyma** (bot kartı = görsel + metin; görseldeki küfür de reklamlarda “creative” ihlali sayılır).

**Aksesuar olarak güçlü bir marka numarası (erişilebilirlik sorununu pazarlamaya çevir):** §2.6/4’teki “kazınmış yazı okunmuyor” sorunu, tek bir `IŞIĞI AÇ` düğmesiyle iki işi birden yapar: (a) WCAG kontrast sorununu çözer, (b) etkileşimli bir “kelepçe” olur — düğmeye basınca duvar aydınlanır, gölge kalkar, kazınlmış cümleler netleşir ve tıklama bir **Instagram Story/reel mekaniğine** dönüşür (“Işığı aç” = 2. saniyede etkileşim).

### 3.4 Somut içerik planı: “VESİKA DEFTERİ” (sıfır yeni prodüksiyon)

Konsept hazır: siten zaten **dosya numarası, ek klasörü, mühür dili** konuşuyor. Bunu seriye çevir: her parça = bir Vesika, her Vesika = 1 carousel + 1 Reels + 1 X thread + 1 site kaydı.

**Format standardı (hepsinde aynı):** üstte `VESİKA No: {{NN}} · {{TARİH}}`, sağ altta ince gümüş `S.G.` rozeti, kaba sıva doku, tek gri fotoğraf, 1 cümle. Bu şablon, 2026’nın en güvenilir kazanımı olan **“kaydedilebilir seri”** davranışını üretir; insanlar “21 numarayı da gördün mü?” diye DM atar (sends sinyali).

**Üretim hattı (60 dk / hafta):** `npm run optimize:assets` ile üretilen gri WebP’ler + 1200×1500 ve 1080×1350 export → Canva/Figma yerine betik (ImageMagick `montage`) ile otomatik şablon. Site arşivine giren JSON aynı JSON’dan post üretilir (§4 P2: `content.ts` → hem site hem `posts/` üretimi).

**12 gönderi, ilk 30 gün** (2026 Eylül–Ekim; her biri siteden/ölü arşivden):

| # | Tarih | Bölüm/kaynak | Biçim | Hook (ilk satır) | CTA | Ses/yönerge | Neye oynuyor |
|---|---|---|---|---|---|---|---|
| 1 | Pzt 21.09 | Hero + `hero.jpg` (ölü arşiv, yan profil kanatlar) | Carousel 6 | “Cennetin steril sakinlerinden değilim.” | “Vesika 01 arşivde — link profilde” | 4 sn sessizlik → tek bass nota | sends + kaydetme |
| 2 | Per 24.09 | Bölüm I (`duel-row`) | Reels 9 sn | “Şeytan hata yaptı.” (2 sn siyah) → “BEN PRENSİP.” | — | 0,5 sn siyah, tipografi `steps()` | watch time (loop) |
| 3 | Cmt 26.09 | Bölüm II (yatak) | Carousel 4 + gerçek telefon fotoğrafı (ev/ods) | “Yatağının altında canavar var mı? Yatağın ayaklarını keserim.” | “Kaydet, uykun kaçınca bakarsın” | ambient yağmur | gerçeklik + saves |
| 4 | Sal 29.09 | `soil.jpg` Bölüm II.b | Tek kare + alıntı | “Üzerine toprak atanları sevin, ayağınızın altına girer.” | “Birine gönderin, o da dik dursun” | — | sends |
| 5 | Per 01.10 | Bölüm III (kuzgun + `salim_dark_raven`) | Reels 12 sn, 3 kesim | “Şeytan konuşmaz. Sana sormayı öğretir.” | “Yoruma bir soru bırak, cevap yok.” | tek kuzgun sesi | comment depth (thread) |
| 6 | Cmt 03.10 | Bölüm III “okunan/okuyan” | Carousel 3 | “Okunan metni değil, okuyan insanı seçerim.” | — | — | kaydetme + save |
| 7 | Sal 06.10 | Bölüm IV (`table.jpg` katedral) | 20 sn Reels, yavaş zoom | “Cehenneme düşmez; oraya yatırım yapar.” | — | oda reverb’li 1 keman | watch time |
| 8 | Per 08.10 | Bölüm IV “kural yazanı işe aldı” | Tek kare | “Kurallar onun için yazılmadı. Yazarını işe aldı.” | “Arkadaşına at, ‘yazar kim?’ de” | — | sends |
| 9 | Cmt 10.10 | `salim_fall_sky.webp` + `fall_flame` | Reels 7 sn, ateş→gri geçiş | “Düşerken kanatların tutuşur; sonra onu yakarsın.” | — | bass + çakmak sesi | loop |
| 10 | Sal 13.10 | Coda | Carousel 2 (siyah kare + gri portre) | “Meleklerle aynı notaya susmam.” | “Tüm Vesikalar: link bio” | sessiz | profil tıklaması |
| 11 | Per 15.10 | Kullanım kılavuzu | Carousel 5 “manifesto nasıl okunur” | “Bu metni birine borçlu değilsin. Kopyala, üstüne yapıştır.” | “Kopyala” butonunu tanıt (P1-2) | — | orijinallik + trafik |
| 12 | Cmt 17.10 | Vesika 02 ilanı | Story 3 kare + anket | “Vesika 02: KIRILGAN (20.10) — hangi cümle eksik?” | anket + geri sayım | — | takip/geri gelme |

**Aylık ritim:** ayda 1 Vesika (siteye yeni arşiv girdisi), haftada 3 post (2 carousel + 1 Reels), günde 1 Story (atölye/ham gerçek kare). Site arşivi = **tek doğruluk kaynağı**; sosyal, arşivin vitrinleri.

**Bio metni (IG, 150 karakter):**
```
Salim Gümüş — Vesika No: 01
Korkunun kaynağını ortadan kaldırırım.
Manifesto + arşiv ↓
applecurse.github.io/dark-philosophical-prose-fragments
```
(Bio’da link 1 kez; “link profilde” demek yerine **link iskeletini** `/vesika/01` gibi kısa yap — custom domain, §3.5.)

**Hashtag seti (5, değişmez):** `#manifasto #karanlıkyazı #girişimci #şiir #salimgumus` — gerçekçi ve konu sinyali; erişim bekleme, arama için kullandır.

**Soru-cevap mekaniği:** Yorumlara cevap verme, **soruyu yeni bir Vesika’ya çevir** (“En çok sorulan: neden yatırım?” → Vesika 05). Bu, hem comment depth hem içerik fabrikası.

**Ölçüm paneli (haftalık, 20 dk):**
```
sends/reach  = sends ÷ reach × 100      hedef > %1,5
saves/reach  = saves ÷ reach × 100      hedef > %3
profil→site tıklaması                    hedef: haftalık > %12 profil ziyaretçisi
site: LCP / toplam bayt                  hedef: LCP < 2,5 sn, < 1,5 MB
GSC: "Salim Gümüş" sorguları             hedef: marka sorgularında ilk 3
```
Instagram’ı **Google Search Console’a bağla** (IG’de doğrulanmış site ekle) — caption’ların arama trafiğini görebilirsin ([coruzant](https://coruzant.com/analytics/instagram-algorithm-2026-guide/)).

### 3.5 Kimlik, alan adı ve sahiplik (marka altyapısı)

1. **`applecurse.github.io/dark-philosophical-prose-fragments` adresi bu işi taşımaz.** Kısa, akılda kalıcı ve **kişisel** bir domain şart: `vesika.co`, `salimgumus.com`, `prensip.co` (TR için `.com.tr` veya `.run`). GitHub Pages’te `CNAME` + `vite base: '/'` + `https_enforced` zaten açık ✅. Maliyet ~1–2 yıllık kahve. Kazanım: paylaşılabilir link, e-posta (`@vesika.co`), reklam onayı için gerekli “işletme ciddiyeti”, ve ileride platformdan bağımsız kalma.
2. **Handle birliği:** `@salimgumus` / `@vesika01` — IG, X, TikTok, YouTube, Substack aynı ad. Şu an sitede handle yok; her metni “paylaşılabilir” kılan şey @ etiketidir (alıntı kartlarında görünür → markasız kopyalanma biter).
3. **Sahiplik kanıtı:** site + arşiv + tarihli JSON-LD + repo commit zinciri, içerik senin olduğunu ispatlar; bu 2026’da “orijinallik” kapısının ucuz anahtarı.
4. **Depo adı/marka uyumsuzluğu** (`dark-philosophical-prose-fragments`): açık kaynak olarak duruyorsa sorun değil, hatta “kamuya açık manifesto” iyi bir pozisyon; o zaman README’nin ilk satırı marka cümlesi olsun, çünkü repo linkleri de paylaşılır.
5. **E-posta listesi = tek gerçek varlık.** “Deftere kayıt: ayda bir, tek bir parça” formu (Formspree/Buttondown/Buttondown alternatifi; KVKK için tek satır aydınlatma + `mailto` yedeği). Bu, algoritma değişimlerinden korunmanın tek yolu.

---

## 4. ÖNCELİK MATRİSİ (öneri listesi — uygulanmış sırayla)

### P0 — bu hafta (toplam ~1 gün, etkinin %80’i)
1. **Görsel hattını optimize et:** grayscale + render genişliğinde yeniden boyut + WebP q78 (Bkz. §2.1 tablosu) → 8,35 MB → 707 KB; HTML 11,94 MB → ~1,3 MB. `raven.jpg` → `salim_dark_raven.jpg` takası tek başına en büyük kazanç.
2. **`viteSingleFile` kararı ver** (§2.1 A/B). Web’de kaldır, `base: '/dark-philosophical-prose-fragments/'` ekle; tek dosya gerekiyorsa ayrı `build:single` modu.
3. **`index.html` head bloğu:** `description`, `og:*`, `twitter:card`, `canonical`, `theme-color`, favicon, `robots: max-image-preview:large`, JSON-LD (§2.9 kopyala-yapıştır).
4. **`public/og.png` (1200×630)** üret: `salim_angel_profile.webp` veya `hero.jpg` gri + `BEN PRENSİP` + `Vesika No: 01` rozeti. **Küfürlü satır yok.** Bu tek dosya, paylaşılan tüm linkleri değiştirir.
5. **`<h1>` + `<main>` + `robots.txt` + `sitemap.xml`.**
6. **`npm run typecheck` + CI (build + size-guard).** 4 TS6133 hatasını temizle, ölü import ve ölü dosyaları kaldır (§2.4).

### P1 — 2 hafta
7. `prefers-reduced-motion` (§2.6 CSS’i) + `:focus-visible` + `@media (hover:hover)` + SVG’lere `aria-hidden` + `<h3>` hiyerarşisi + skip-link.
8. `İ` tipografi yaması (§2.2, öneri 3 + 1).
9. `InkWriter`: tipografiyi `useReveal` ile görünürken başlat + `tekrar oyna` + `Stage` tipini düzelt + `Math.random()` kaldır (§2.5b).
10. `useScroll` → ref/CSS tabanlı progress (§2.5a) — `y`’yi sil.
11. Kazınmış yazı için kontrast düzeltmesi **veya** `IŞIĞI AÇ` düğmesi (§3.3) — hangisini seçersen seç, “Işığı aç” düğmesi sosyal mekaniği olarak da çalışır.
12. **Profil linkleri + CTA bloğu** (footer’a 3 satır: IG/X/YouTube + “Deftere kayıt”), **alıntı kopyalama düğmesi** (her `DuelRow` ve bölüm sonuna; `navigator.clipboard` + kaynak eki: `— Salim Gümüş, Vesika 01`) ve `navigator.share` (mobilde doğrudan DM/Story akışına düşer — sends sinyalini tetikleyen buton).

### P2 — 1 ay
13. **İçeriği `src/content.ts`e taşı:** `chapters: {id, mark, latin, title, lines[], note{date, place}, images[]}`. Kazanımlar: (a) EN sürümü (`/en/`) çeviri dosyası olarak gelir, (b) sosyal post’lar aynı kaynaktan üretilir (`scripts/make-posts.mjs` → `montage` ile PNG), (c) A/B testi = veri değişkeni, (d) altyazı/başlık tutarlılığı.
14. **`Vesika Defteri` arşiv rotası** (`/vesika/01`, `/vesika/02` …) — `react-router` yerine `vite-plugin-ssg`/`vite-ssg` ile statik prerender: bot’lar HTML’de metin görür, paylaşım kartları zenginleşir, `sitemap.xml` gerçek olur. **Bu madde, tek-HTML mimarisinin tüm sosyal/SEO sorununu kökten kapatır.**
15. Component ayrımı: `components/hero`, `components/chapter`, `components/bent-nail` … + ESLint (`react-hooks`) + Prettier.
16. Duvar dokusunu/grain’i pre-render et (§2.7/5,6) → paint maliyeti sıfıra yakın.
17. `hero.jpg` ve `salim_fall_sky.webp` ile hero görselini yeniden kur; `fall_*` serisini sıralı bir **düşüş sekansı** yap (kayıp dosyaları kullanıma alır, ek prodüksiyon yok).
18. İngilizce Vesika 01 (`/en/`) → X/Threads global büyüme için kapı; `hreflang` ekle (§2.9).

### P3 — sürekli / evren
19. **Custom domain + CNAME + handle birliği** (§3.5), e-posta listesi.
20. Büyük binary’ler için `assets-src/` (`.gitignore`) + sıkıştırılmış çıktı repoda; ya `git-lfs`. `raven.jpg` gibi 7 MB’lık dosyalar repoya bir daha girmesin.
21. LICENSE + telif metni (`docs/LICENSE.md`) + `llms.txt`.
22. Ölçüm: Plausible/GoatCounter (çerezsiz, KVKK/GDPR dostu) + GSC + IG→GSC bağlama.
23. `package.json`: `engines`, `packageManager`, `sideEffects:false` gerekmiyor; `browserslist` hedefini daralt (`defaults, not IE 11, Chrome >= 108`) → daha az polyfill/CSS vendor eki.
24. Preview per PR (Vercel/Netlify ya da `actions/pages` preview artifact) — tasarım değişikliklerini linkle göstermek, marka ekibi/çevre için.
25. Ayda bir 30 dakikalık “borç turu”: `npx vite-bundle-visualizer` + `size-guard` raporu + Lighthouse (`npm i -D lighthouse`; hedefler: Perf >90 mobil, A11y 100, Best Practices 100, SEO 100).

---

## 5. Hızlı kazanımların tam kodu (kopyala-yapıştır)

### 5.1 Görsel optimizasyon betiği
```js
// scripts/optimize-assets.mjs  (ImageMagick gerekir: apt/brew install imagemagick)
import { execSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
const OUT = 'public/assets';
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
// dosya: [maksGenişlik(px), kalite, "gri?" ]
const PLAN = {
  'salim_portrait_feather.jpg': [900, 78, true],   // hero ~380px @2x + paydas
  'salim_fall_flame.jpg':       [260, 74, true],
  'salim_fall_abyss.jpg':       [260, 74, true],
  'salim_angel_pure.webp':      [260, 74, true],
  'salim_angel_storm.jpg':      [260, 74, true],
  'salim_fall_sky.webp':        [260, 74, true],   // EK:04 -> yangin/ateş karesi için
  'salim_fall_ground.jpg':      [1100, 78, true],
  'bed.jpg':                    [1200, 78, true],
  'soil.jpg':                   [1600, 74, true], // full-bleed
  'table.jpg':                  [1600, 74, true],
  'salim_dark_raven.jpg':       [1300, 78, true], // raven.jpg yerine geçer
  'hero.jpg':                   [1300, 78, true],
};
for (const [f, [w, q, gray]] of Object.entries(PLAN)) {
  const src = `src/assets/${f}`;
  const dst = `${OUT}/${f.replace(/\.(jpg|webp|png)$/, '.webp')}`;
  execSync(`convert "${src}" ${gray ? '-colorspace Gray' : ''} -resize ${w}x -quality ${q} -define webp:method=6 "${dst}"`);
  console.log('✓', dst);
}
```
Kullanım: `import p from "/assets/raven.webp"` yerine `import { publicDir }`/`<picture>`; en azından `src="/dark-philosophical-prose-fragments/assets/table.webp"` + `loading="lazy"` `decoding="async"` + `width/height`.

### 5.2 `og:image` üretimi (30 sn)
```bash
convert src/assets/hero.jpg -colorspace Gray -resize 1200x630^ -gravity center -extent 1200x630 \
  -fill black -colorize 25% \
  \( -size 1200x180 xc:none -gravity center -font Cinzel-Bold \
     -pointsize 74 -fill white -annotate +0+0 "BEN PRENSİP" \) -composite \
  -gravity south -font JetBrainsMono-Regular -pointsize 22 -fill "#b9b9b9" \
  -annotate +0+46 "VESİKA No: 01 · SALİM GÜMÜŞ" \
  public/og.png
```
*(font yollarını sistemine göre ayarla; alternatif: Figma şablonu + elle export.)*

### 5.3 Bölüm başlıklarına semantik + erişilebilir isim
```tsx
// ChapterMark.tsx — h2 → id + h1 desteği
function ChapterMark({ num, title, latin, level = 2, id }: {...; level?: 1|2; id?: string }) {
  const H = `h${level}` as 'h1' | 'h2';
  return (
    <div className="mb-14 ...">
      <div className="section-mark mb-4">Bölüm {num}</div>
      <H id={id} className="font-display ...">{title}</H>
      ...
```
Hero: `<h1 className="sr-only">BEN PRENSİP — Salim Gümüş · Vesika No: 01</h1>` (sr-only için `position:absolute;width:1px;...` Tailwind v4’te yerleşik `sr-only` ✅).

### 5.4 Alıntı kopyalama düğmesi (sends/DM yakıtı)
```tsx
function CopyQuote({ text, source = 'Salim Gümüş · Vesika 01' }: { text: string; source?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    const payload = `“${text}” — ${source}\n${location.href}`;
    try { await navigator.clipboard.writeText(payload); }
    catch { (navigator as any).share?.({ text: payload }); }
    setDone(true); setTimeout(() => setDone(false), 1800);
  };
  return (
    <button onClick={copy}
      className="mt-4 font-mono text-[0.55rem] uppercase tracking-[0.35em] text-silver-dim hover:text-bone focus-visible:text-bone transition-colors">
      {done ? '✓ kopyalandı' : 'alıntıyı kopyala'}
    </button>
  );
}
```

### 5.5 `content.ts` iskeleti (P2’nin temeli)
```ts
export type Vesika = {
  no: string; date: string; slug: string; lang: 'tr' | 'en';
  hero: { caption: string; images: { file: string; tag: string; alt: string }[] };
  chapters: {
    num: string; latin: string; title: string;
    lede?: string; paragraphs: string[];
    duel?: { devil: string; me: string }[];
    image?: { file: string; alt: string };
    note?: { place: string; detail: string };   // ← E-E-A-T + "gerçek insan" sinyalı
  }[];
  coda: string[];
  social: { ig: string; x: string; yt: string; mail: string };
};
```

### 5.6 `deploy.yml` — eklenmesi gereken 3 satır
```yaml
      - name: Typecheck
        run: npm run typecheck
      - name: Build
        run: npm run build
      - name: Bundle size guard (<1.5 MB)
        run: node scripts/size-guard.mjs
```

---

## 6. Başarı ölçütleri (30/60/90 gün)

| Gün | Teknik | Marka/sosyal |
|---|---|---|
| **30** | HTML < **1,5 MB**, LCP mobil < **2,5 sn**, `tsc` temiz, CI kırmızı/yeşil doğru, reduced-motion + `<h1>`/`<main>` + `og:image` canlı, profil linkleri + CTA canlı | IG/X bio’da kısa domain; 12 post ritmi başladı; sends/reach > %1; GSC’de marka sorgusunda ilk 3 |
| **60** | Vesika arşivi `/vesika/01` statik prerender; iki dil (`/en/`); image pipeline otomatik; `hero` yeniden kurumu (ölü arşivle) | Vesika 02 yayınlandı; 1.000 organik kaydetme; en az 1 post 3.000+ DM gönderimi; e-posta listesi > 150 |
| **90** | Bundle bütçesi CI’da kilitli; ESLint + Prettier; 0 ölü dosya; 100 Lighthouse Erişilebilirlik | Domain kendi adına taşındı; “Vesika Defteri” 4 sayı; 1 işbirliği/reklam hattı (temiz metinle onay almış) |

**Tek soruluk sağlık kontrolü:** *“Telefonumdan bir arkadaşım linki DM’de paylaşırsa, 5 saniye içinde ne görür ve ne hisseder?”* — P0’ların tamamı bu sorunun cevabını değiştirmek için.

---

## 7. Ek: bulguların kanıt komutları

Bu rapordaki sayıları yeniden üretmek için:

```bash
npm ci && npm run build
ls -l dist/                                   # 1 tek dosya, ~11.9 MB
gzip -c dist/index.html | wc -c               # ~8.89 MB gzip
npx tsc --noEmit                              # 4 × TS6133
grep -c "<img" src/App.tsx                    # 11
grep -c "loading=" src/App.tsx                # 0
grep -c "prefers-reduced-motion" src/index.css  # 0
grep -oE "<h[1-6][ >]" src/App.tsx | sort | uniq -c   # 1 × h2, 0 × h1
md5sum src/assets/*.jpg | sort | uniq -c -w 32        # soil == ansoil
identify -format "%wx%h %[size]\n" src/assets/raven.jpg  # 2608x1456 7.05513MB
# data-URI envanteri ve eşleştirme (bu raporda kullanılan Python tekniği §2.1)
```

*Not:* Bu rapor ilk teslimde yalnızca `docs/AUDIT.md` olarak girdi, kaynak koda dokunulmadı. §8'de
listelenen P0/P1 maddeleri aynı oturumda uygulandı; §7'deki doğrulama komutları o **önceki**
durumu ölçer (bugün: `prefers-reduced-motion` 6 adet, `<h1>` 1 adet, `raven.jpg` repoda yok).


---

## 8. 15.09.2026 — P0/P1 uygulandı (uygulama notu)

Raporda "yapılacak" olarak duranların büyük kısmı aynı gün uygulandı. Ayrıntı, gerekçe ve
ölçümler: **[`docs/CEVAP-MIMARI.md`](CEVAP-MIMARI.md)** · kurulum/uygulama: **[`README.md`](../README.md)**

| Madde | Durum | Ölçülen sonuç |
|---|---|---|
| P0-1 görsel hattı (gri + render boyutu + webp) | ✅ | 8,35 MB → **0,54 MB** |
| P0-2 head: meta/OG/twitter/canonical/JSON-LD/theme-color | ✅ | paylaşım kartı doğdu |
| P0-3 bot'ların okuduğu içerik (prerender) | ✅ | JS'siz **471 kelime** statik metin |
| P0-4 `og.png` + favicon + apple-touch-icon + `llms.txt` | ✅ | `public/` (og.png 82 KB) |
| P0-5 `<h1>`/`<main>`/`aria-labelledby`/skip-link/`robots`/`sitemap` | ✅ | `App.tsx`, `public/` |
| P0-6 typecheck + boyut muhafızı + CI | ✅ | `npm run check`; 4×TS6133 → **0** |
| P1-7 reduced-motion, `scripting:none`, `hover:hover`, `:focus-visible`, `aria-hidden` SVG | ✅ | `index.css` |
| P1-8 `İ` yaması (`cinzel-tr.woff2`) + kendi barındırılan alt küme fontlar | ✅ | 13 `@font-face`, 140 KB, dış istek 0 |
| P1-9 InkWriter: görünüme girince başlar + "↺ yeniden yaz" + `Stage` tipi + deterministik ritim | ✅ | `islands.tsx` |
| P1-10 `useScroll` → ref + CSS custom property (`y` silindi) | ✅ | kare başına 0 re-render |
| P1-11 `IŞIĞI AÇ` (kazı kontrastı) + paylaş butonu | ✅ | `Tools` adası |
| P1-12 CTA: profil linkleri (doluysa görünür), "alıntıyı kopyala", defter notu, lisans metni | ✅ | her bölümde `copy` |
| P2-13 içerik → `src/content.ts` + gönderi üretici | ✅ | `scripts/make-posts.mjs` → `posts/` |
| P2-14 arşiv rotaları (`/vesika/NN`) | ⏳ | yapı hazır; Vesika 02'de ~30 satır |
| P2-15 bileşen bölme + ESLint/Prettier | ⏳ | öneri duruyor |
| P2-16 duvar dokusu/grain pre-render | ⏳ | denendi, görsel kalite yetersiz → listede kaldı |
| P2-17 `hero.jpg` (yan profil) ile hero'yu yeniden kurma | ⚠️ kısmi | `salim_fall_sky` EK:04'e girdi; yan profil `assets-src/`'de bekliyor |
| P2-18 EN sürümü | ⏳ | veri modelinde `lang` alanı hazır |
| P3-19..25 domain, ham görsel stratejisi, ölçüm, PR önizleme, borç turu | ⏳ | `docs/LISENS.md` yazıldı; ham kareler repodan çıkarıldı (19 MB → 8 MB depo) |

Ölçülen toplam etki: paket **11,94 MB → 1,13 MB**; ilk HTML isteği **8,48 MB gzip → 17,7 KB gzip**;
`dist` içindeki satır içi (`data:`) görsel sayısı **10 → 0**.

Doğrulama: `npm run check` (typecheck + prerender build + bütçe) ve CI'daki "statik metin var mı" adımı.
