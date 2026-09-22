# DENETİM · 22.09.2026 — temizlik, üç gerçek bug, beş yeni katman

Bu belge `docs/AUDIT.md`'nin (lansman öncesi büyük denetim) devamı değil, **üzerinden geçen
bakım turu**: mevcut kod tabanı satır satır okundu, çalıştırıldı, ölçüldü; ölü ağırlık atıldı,
sessizce kırık olan şeyler onarıldı ve kırılmanın **tekrarlanmasını imkânsızlaştıran** bekçiler
kuruldu. Sonunda siteye beş yeni katman eklendi.

Önceki denetimde olduğu gibi: her bulguya kanıt, her iddiaya ölçüm.

---

## 0. Özet tablo

| | Önce | Sonra |
|---|---|---|
| Git'te izlenen dosya | 75 | **60** |
| `src/` içinde ölü kopya | `src/fonts/` (14 dosya, ~176 KB) | **yok** |
| Kullanılmayan npm bağımlılığı | `clsx`, `tailwind-merge` | **0** |
| Çalışmayan kullanıcı kontrolü | **5 buton** (`alıntıyı kopyala`) | **0** |
| Kimlik tutarlılığı (canonical ↔ JSON-LD) | **çelişkili** (iki ayrı domain) | tutarlı + build bekçisi |
| Ada (island) sayısı | 3 | **5** |
 *Adasız* davranış (dinleyici, hidrasyon yok) | 0 | **2** |
| Statik HTML'de görünür kelime | 471 | **485** |
| `dist/index.html` (gzip) | 17,7 KB | 19,4 KB |
| Toplam paket | 1,13 MB | **1,16 MB** (bütçe 1,8 MB) |
| Bir adanın haritadan düşmesi | sessiz ölüm | **TS2741** (typecheck patlar) |
| Kayıtsız ada yuvası açılması | sessiz ölüm | **TS2322** (typecheck patlar) |
| Head bloğunun `content.ts`'ten kayması | sessiz ölüm | **build patlar** |

Doğrulama: `npm run check` → typecheck 0 hata · prerender 3 doğrulama ✔ · bundle 1,16 MB < 1,8 MB.

---

## A. Temizlik — atılan ölü ağırlık

### A1. `src/fonts/` bütünüyle ölü bir kopyaydı (14 dosya, ~176 KB)

İki font dizini vardı ve **içerikleri farklıydı** (bayt boyutları birebir tutmuyordu) — yani biri
eski bir üretim turundan kalmaydı, ikisi de "doğru" görünüyordu:

```
src/fonts.css            → url("./assets/fonts/cinzel-latin.woff2")   ← AKTİF (App.tsx bunu import eder)
src/fonts/fonts.css      → url("./fonts/cinzel-latin.woff2")          ← ÖLÜ + yolları yanlış
scripts/subset-fonts.py  → OUT = "src/assets/fonts", CSS_OUT = "src/fonts.css"
```

Kanıt zinciri: `App.tsx:14` yalnızca `./fonts.css`'i import ediyor; `src/fonts/` altına bakan tek
şey **kendi içindeki** ölü CSS'ti. Yani `src/fonts/`'u okuyan hiçbir kod yolu yoktu.
`git rm -r src/fonts` sonrası `npm run check` yeşil → silme güvenliydi.

### A2. `src/utils/cn.ts` ve onun sürüklediği iki bağımlılık

`cn()` (clsx + tailwind-merge) hiçbir yerden import edilmiyordu:

```bash
grep -rn "utils/cn\|clsx\|twMerge" src --include="*.ts*" | grep -v "utils/cn.ts:"   # → 0 satır
```

Dosya silindi, `npm uninstall clsx tailwind-merge` ile iki bağımlılık `package.json`'dan düştü.
Kalan `@fontsource*` paketleri **bilerek duruyor**: `scripts/subset-fonts.py` woff2 kaynaklarını
`node_modules`'tan okuyor — onlar runtime değil, üretim hattı girdisi.

### A3. Ölü CSS

| Silinen | Neden ölü |
|---|---|
| `@keyframes heroIn` + `.hero-img` | `.hero-img` sınıfını hiçbir TSX kullanmıyor (2 eşleşme de CSS'in kendi içinde) |
| `@keyframes heroInFallback` | tanımlı, hiç referans yok |
| `.carved-wall-italic` | seçicide duruyor, sınıfa basan yok |
| reduced-motion içindeki `.hero-img` | yukarıdakiyle aynı |

### A4. Tema jetonları: biri atıldı, biri işe koyuldu

`--color-smoke` hiç kullanılmıyordu → silindi.
`--color-blood` da kullanılmıyordu → **silinmedi**, mühür mumunun taban rengi oldu; yanına
`--color-wax` ve `--color-wax-lit` eklendi. Sitede tek bir kırmızı ailesi var ve o da yalnızca
mumda görünüyor: renk, anlam taşıdığı tek yerde kullanılıyor.

### A5. Var olmayan bir rol için filtre

`ChapterLines` içinde `!String(l.as).startsWith("split")` vardı — ama `LineRole` birleşiminde
`split` diye bir rol **yok** (bölüm IV'ün `split` alanı ayrı bir dizi, satır rolü değil). Filtre
her satır için `true` dönüyordu; yani kod çalışıyordu ama hiçbir iş yapmıyordu. Sadeleştirildi:

```ts
const shown = only ? lines.filter(only) : lines;
```

### A6. `prerender.mjs`'te kendisini üreten regex

```js
.replace(/url\((['"]?)\.\/assets\/([^)"']*)\)/g, 'url($1./assets/$2)')   // girdi == çıktı
```

İkinci `.replace` birebir aynı metni üretiyordu (no-op) ve üzerindeki yorum başka bir şey
anlatıyordu. Silindi; birinci `replace` zaten işi yapıyor.

### A7–A9. Doküman kaymaları (hepsi gerçek yolu gösterir hâle getirildi)

| Yer | Diyordu | Doğrusu |
|---|---|---|
| `src/index.css` | "bkz. `src/fonts/fonts.css`" | tanım `src/fonts.css`, dosyalar `src/assets/fonts/` |
| `index.html` | "alt kümeler (`src/fonts/*.woff2`)" | `src/assets/fonts/*.woff2` |
| `scripts/subset-fonts.py` | "`src/fonts/*.woff2` altına yazar" | `src/assets/fonts/*.woff2` + `src/fonts.css` |
| `scripts/subset-fonts.py` | "Kullanım: `npm run patch:font`" | **böyle bir script yok** → `npm run fonts:subset` |
| `README.md` | yayın: `applecurse.github.io/…` | `soulvespera.com.tr` (canonical/CNAME bunu diyor) |

`docs/AUDIT.md` içindeki eski adreslere **dokunulmadı**: o belge bir denetim kaydı, yazıldığı
andaki durumu anlatıyor; tarihi yeniden yazmak denetimin değerini öldürür.

---

## B. Üç gerçek bug

### B1. "alıntıyı kopyala" butonları hiçbir şey yapmıyordu 🔴

Sitede 5 adet buton render ediliyordu (`dist/index.html` içinde 5 × `data-copy`). Tıklanınca
olan şey: **hiç**. Ne panoya yazan bir dinleyici, ne bir ada, ne bir `onclick`.

Kök neden izlenebilir: `docs/AUDIT.md §5.4` bu düğmeyi `onClick`'li bir React bileşeni olarak
tasarlamıştı. Uygulamada prerender dostu olması için `data-copy` özniteliğine geçildi — doğru
karar — ama özniteliği dinleyiciyle buluşturan kod hiç yazılmadı. `App.tsx`'teki yorum bile
niyeti ilan ediyordu:

> *"Kopyalama yalnızca JS'li tarayıcıda anlamlı: adaya gerek yok, **12 satır vanilla**."*

O 12 satır yoktu. Bu, "dağıtım için en değerli" özellik olarak planlanmıştı (alıntı → DM →
yayılım) ve tam olarak o yüzden sessiz ölümü pahalı: kimse hata görmez, sadece kimse alıntı
kopyalamaz.

**Onarım** (`src/main.tsx → armCopyButtons`): tek delege dinleyici, 5 buton için 5 hidrate
bileşen gerekmez. Üç detay bilerek eklendi:

1. **`navigator.clipboard` güvenli bağlam ister.** `file://`'dan açan ya da eski tarayıcı için
   `execCommand("copy")` yedeği var.
2. **Başarısızlıkta yalan söylemiyor.** Kopyalama olmazsa buton `✓ kopyalandı` değil
   `✖ kopyalanamadı` diyor (`.is-failed`, mum renginde).
3. **Ekran okuyucu duyuyor.** Tembel oluşturulan tek `role="status"` bölgesi (`#vesika-live`).
   Etiket değişimi görsel; durum duyurusu ayrı.

Ardından **geri bildirim metni 1,8 sn sonra eski hâline döner** ve hızlı çift tıklamada
zamanlayıcılar `WeakMap` ile ezilir (iki `setTimeout` yarışıp etiketi bozuk bırakmaz).

### B2. Aynı belge iki ayrı kimlik taşıyordu 🔴

```html
<link rel="canonical" href="https://soulvespera.com.tr/" />   <meta property="og:url" …aynı… />
"url": "https://applecurse.github.io/dark-philosophical-prose-fragments/"   ← JSON-LD Person
"url": "https://applecurse.github.io/dark-philosophical-prose-fragments/"   ← JSON-LD WebSite
```

`public/CNAME` = `soulvespera.com.tr` ve `vite.config.ts` `base: "/"` → custom domain zaten
canlı. Yani JSON-LD, sitenin **kendi beyan ettiği kanonik adresi** çürütüyordu. Arama motoruna
"bu belge iki yerde yaşıyor" sinyali; `docs/AUDIT.md §4.4`'ün uyardığı şey tam olarak buydu
("`og:url`/`canonical`/`sitemap` aynı anda güncellenmeli") — üçü güncellenmiş, dördüncüsü unutulmuştu.

**Onarım:** JSON-LD domain'e çekildi. Ama asıl onarım bir daha olmaması (bkz. §C1).

### B3. `llms.txt` yanlış kaynağı işaret ediyordu 🟡

"Resmî kaynak" satırı `applecurse.github.io` diyordu. `llms.txt`'in bütün varlık nedeni
alıntılayan makineye **doğru kaynağı** vermek; yanlış adres, dosyanın tek işlevini iptal ediyor.
Düzeltildi.

---

## C. Kalıcı önlemler — "bir daha olmasın" kısmı

Bug düzeltmek ucuz; aynı sınıfın tekrar oluşmasını engellemek denetimin asıl kazancı.
Üç sessiz ölüm sınıfı için üç ayrı katmanda bekçi kuruldu.

### C1. Head bloğu ↔ `content.ts` tutarlılığı (build zamanı)

`content.ts` "tek doğruluk kaynağı" iddiasında, ama `index.html`'deki `title` / `description` /
`og:*` / JSON-LD **elle** yazılıyor. İki tarafın ayrışmasını hiçbir şey kontrol etmiyordu — B2
böyle oldu.

`src/prerender-entry.tsx` artık `meta()` dışa aktarıyor ve `scripts/prerender.mjs` render sonrası
karşılaştırıyor: `title`, `meta description`, `canonical`, `og:url`, `og:image`/`twitter:image`,
JSON-LD `datePublished`, JSON-LD içinde `site.url`'in **en az 2 kez** geçmesi (Person + WebSite)
ve çıktıda hiç `applecurse.github.io` kalmaması. Boşluklar normalize edilir, yani `index.html`'in
satır kırma biçimi bekçiyi atlatamaz. Kayma varsa build patlar.

```
· doğrulama: head bloğu content.ts ile tutarlı (https://soulvespera.com.tr/) ✔
```

### C2. Ada kütüğü — eksik ada artık **derlenemiyor** (typecheck zamanı)

En sinsi hata sınıfı: şablonda yuva açılır, `main.tsx`'teki haritaya yazılmaz → HTML'de boş
`<div data-island="X">` durur, typecheck geçer, build geçer, sayfada hiçbir şey çalışmaz.
B1'in morfolojisi buydu.

`src/islands-registry.ts` tek listeyi tutuyor ve üç taraf da ondan okuyor:

```ts
export const ISLAND_NAMES = ["ScrollProgress", "InkWriter", "Tools", "Carve", "Seal"] as const;
export type IslandName = (typeof ISLAND_NAMES)[number];
export function isIslandName(value: unknown): value is IslandName { … }
```

- `App.tsx` → `IslandSlot({ name }: { name: IslandName })` — **typo derlenmez**
- `main.tsx` → `Record<IslandName, () => ReactNode>` — **eksik ada derlenmez**
- `prerender.mjs` → HTML'deki her yuvanın kütükte olduğunu doğrular (ters yön)

`isIslandName` gerekli çünkü `dataset.island` DOM'dan `string` gelir; `Record<IslandName,…>` ise
keyfi string indekslemeyi reddeder. Reddetmesi istenen şey bu — daraltıcı iki tarafı güvenle
buluşturuyor, listede olmayan ad `false` dönüp düğüm sessizce atlanıyor (çökme yok).

Runtime maliyeti: 5 elemanlı string dizisi. `App.tsx` yalnızca **tip** import eder, silinir.

### C3. CI: "ölü kontrol" adımı — ve bekçinin kendisi de test edildi

`.github/workflows/ci.yml`'e yeni adım eklendi: pakette etkileşim dinleyicilerinin gerçekten
durduğunu doğrular.

Burada bir hata yapıldı ve düzeltildi, çünkü kayda değer: **ilk sürüm `data-copy` literali arıyordu
ve negatif testi geçemedi.** `data-copy` adı `App.tsx`'te JSX özniteliği olarak da geçtiği için
dinleyici silinse bile pakette kalıyordu — yani bekçi dekoratifti. Ölçüt, **yalnızca dinleyiciyi
kuran kodda bulunan seçici literallerine** çekildi: `button[data-copy]`, `[data-torch]`.

Dört negatif test (hepsi bu repoda çalıştırıldı, hepsi geri alındı):

| # | Bozulan şey | Beklenen | Sonuç |
|---|---|---|---|
| 1 | `armCopyButtons()` çağrısı silindi | `button[data-copy]` paketten düşer | **YOK ✔** (CI patlar) |
| 2 | `armWallTorch()` çağrısı silindi | `[data-torch]` paketten düşer | **YOK ✔** (CI patlar) |
| 3 | `Carve` haritadan çıkarıldı | typecheck hatası | **TS2741 ✔** |
| 4 | Kayıtsız `<IslandSlot name="Hayalet">` | typecheck hatası | **TS2322 ✔** |

Tree-shaking burada müttefik: haritadan düşen ada pakete hiç girmez, dolayısıyla `localStorage`
anahtarı da (`vesika.nusha.v1`, `vesika.kazinti.v1`) paketten düşer → CI adımı bunu da yakalar.

---

## D. Yeni katmanlar — siteyi "özel" yapan beş şey

Tasarım ilkesi: **eklenen her şey manifestonun zaten söylediği bir şeyin etkileşime dönmesi.**
Süs değil, iddianın kanıtı. Ve mevcut mimari disipline sadık: statik HTML bozulmaz, JS'siz
okuma bozulmaz, `prefers-reduced-motion` bozulmaz, bütçe bozulmaz.

### D1. 🔦 Tek ampul — ışık artık ziyaretçinin elinde

Vesikanın yeri veride zaten yazılı: `place: "kaba sıva, tek ampul"`. Kazınmış duvar yazısı bilinçli
olarak ~1:1 kontrastta (bkz. `docs/AUDIT.md §2.6/4`) ve okunması `IŞIĞI AÇ` düğmesine bağlıydı —
yani ışık **sitenin** elindeydi.

Artık ampul ziyaretçinin elinde: işaretçi hero duvarında gezindikçe sıcak bir ışık lekesi onu
izliyor, yanal ışıkta kalan kazı gerçek bir yazıt gibi okunur hâle geliyor. `ışığı duvara gezdir`
ipucu ilk hareketten sonra solarak kaybolur.

Mühendislik tarafı, `ScrollProgress`'in kurduğu disiplinin aynısı:

- **`setState` yok.** `pointermove` → `requestAnimationFrame` → iki `style.setProperty`. React
  yeniden render etmiyor.
- **Gradient'in konumu değil, katmanın `transform`'u değişiyor.** `will-change: transform` ile ayrı
  kompozit katman → kare başına **paint yok**. (Gradient pozisyonunu animasyonlaştırmak tam
  ekran repaint demekti.)
- **`mix-blend-mode: screen`** koyu oyuğu silmez: hem duvar hem oyuk aydınlanır, oyuk çevresinden
  daha koyu kalır. Kazının okunmasının fizik sebebi bu.
- **Yalnızca `(hover: hover) and (pointer: fine)`'da bağlanır.** Dokunmatikte hiç oluşmaz — "takılı
  kalan" ışık lekesi olmaz.
- Yazdırırken yok (`no-print`).

### D2. ✒️ Duvara kazı — "okuyan insan" iddiasının etkileşimi

Bölüm III'ün cümlesi: *"Ben 'okunan' kutsal metinler yerine, **'okuyan'** insanı seçiyorum."*
Site o cümleyi söylüyor ama okuyucuya sadece okumayı veriyordu. Artık manifesto bittiğinde
(coda'nın hemen altında) duvar okuyucuya devrediliyor:

> **DUVAR SENİN.** — *Manifesto bitti. Şimdi bir satır da sen kazı; bu duvar yalnızca okunanı
> değil, yazanı da hatırlar.*

- Ziyaretçi bir satır yazar (≤ 96 karakter, kalan sayaç canlı), satır duvara **kazınmış** görünür
  (`.carved-lit`: koyu üst gölge + açık alt kenar = lambanın altında oyuk).
- En çok **3 satır**; her biri `KZ · 01 · 22.09.2026` künyesiyle, `sil` ile geri alınabilir.
- **Yalnızca `localStorage`.** Sunucu yok, çerez yok, hesap yok, istek yok. Bunu söylemek de
  tasarımın parçası: panelin altında *"bu satır yalnızca senin tarayıcında kalır"* yazıyor.
  Kişisel bir manifestoda okuyucunun sırrını toplamamak, metnin iddiasıyla tutarlı olmanın şartı.
- Panel `wall-surface` dokusunu yeniden kullanır ve üstünde tek ampulün sıcak lekesi vardır —
  yani kazı, sayfaya yapıştırılmış bir form değil, **duvardan bir parça** gibi durur.
- Yeni satır `carveSettle` ile oturur: toz dağılır, oyuk keskinleşir.
- **Kâğıda geçer.** Yazdırınca form değil, kazınmış satırlar basılır → kişinin nüshası gerçekten
  kişisel olur.
- Depolama yoksa (Safari gizli mod, kota) çökmez; `readStore`/`writeStore` her yolu `try` içinde.

Erişilebilirlik notu: okuyucunun **kendi** satırı için kazı estetiğinin düşük kontrastıyla oyun
oynanmadı — `.carved-lit` ≈ 13:1. Marka numarası hero'daki kazıda kalıyor; kullanıcının sözünü
okunmaz yapmak "okuyan insanı seçiyorum" cümlesini çürütürdü.

### D3. 🕯️ Mühür ve nüsha numarası — vesika sahiplenilebilir bir belge oluyor

Vesika resmî bir belgedir; resmî belgenin nüshası olur. Footer'da mum bir mühür duruyor.
Mühürlenmemiş hâlde soğuk ve mat (gri-kahve), `-7°` eğik, üzerinde `—`.

Tıklayınca: mühür basılır (`sealPress` — 0,84'e çöker, 1,07'ye geri yayılır, eğiklik sıfırlanır),
mum ısınır (`--color-wax` ailesi), damla kenarları kızarır, monogramın altındaki `—` yerini
vesika numarasına bırakır ve altta nüsha kaydı belirir:

```
NÜSHA No: 48213
SALİM GÜMÜŞ · mühürlendi 22.09.2026
```

Numara ilk mühürlemede üretilir (`10000–99999`) ve **bir daha değişmez**. Yani ekran görüntüsü
alan kişi genel bir link değil, kendine ait tekrarlanamaz bir kayıt paylaşır. Bu yüzden paylaşım
metnine de girer — `Tools.share()` mühürlenmiş nüshayı okur:

> *"Ben cennetin steril sakinlerinden değilim…" — Salim Gümüş, Vesika 01 · Nüsha No: 48213*

Detaylar:
- Mum damlaları deterministik (8 açı, modüler yarıçap) — her derlemede aynı mühür, "rastgele
  organik" görünüm korunur.
- Monogram **basılmış** görünür: açık alt kenar + koyu oyuk, iki `<text>` katmanı.
- `prefers-reduced-motion`'da 620 ms'lik basma animasyonu atlanır, mühür anında oturur.
- Depolama kapalıysa yalan söylemez: *"Tarayıcın kayıt tutmuyor (gizli mod); bu nüsha yenilenince
  kaybolur."*
- Mühürlendikten sonra düğme `disabled` — numara tek kullanımlık, tekrar basılamaz. Bu kısıt
  özelliğin anlamı; "yeniden dene" konforu numarayı değersizleştirirdi.

### D4. ⎙ Kâğıt nüsha — yazdırılabilir belge

Bir vesika eninde sonunda kâğıda geçer. `Ctrl+P` ya da mühür altındaki `⎙ vesikayı yazdır`
siteyi mürekkep dostu tek renkli bir belgeye çevirir:

- **Künye basılır** (`.print-masthead`, ekranda `display: none`):
  `VESİKA No: 01 — BEN PRENSİP` / `SALİM GÜMÜŞ · 14.09.2026 · kaba sıva, tek ampul · 5 bölüm`.
- Fotoğraf, doku, grain, fener, tüy, sabit arayüz, kopyalama düğmeleri, bölüm navigasyonu,
  kazı formu ve mühür **yok** — kâğıtta mürekkep israfı ve anlamı olmayan her şey.
- Kazınmış satırlar okunur siyaha döner (`color: #111 !important`, `text-shadow: none`),
  `.silver-text` gradyanı düz siyaha iner, `html[data-light]` durumu fark etmez.
- **Her bölüm kendi sayfasına düşer** (`break-before: page`), başlıklar satır sonunda yalnız
  kalmaz (`break-after: avoid`), düello satırları ve kazılar ortadan kopmaz (`break-inside: avoid`).
- Footer'daki dış bağlantıların adresi kâğıda yazılır (`a[href^="http"]::after { content: " (" attr(href) ")" }`)
  — tıklanamayan mediumda kaynak kaybolmasın.
- Animasyona bağlı görünürlük kâğıtta asla içerik saklamaz (`.reveal`, `.carve-line`, `.pulse-slow`
  → `opacity: 1`, `animation: none`). Mühür okuması ise **yalnızca gerçekten mühürlendiyse**
  basılır (`.seal-readout:not(.is-on)` gizli) — ekrandaki solma geçişi bozulmadan.

Bilinçli tercih: yazdırma **fotoğrafsız**. Kanıt levhalarının altyazıları (`Kanıt · Ayakları
kesilmiş yatak`) metin olarak kaldığı için belge anlamını yitirmiyor; karşılığında çıktı hem
mürekkep dostu hem de ekran için tasarlanmış `object-cover` kadrajlarının kâğıtta bozulma riski
sıfır. Bu, görsel olarak doğrulanamayan bir ortamda güvenli tarafı seçmek.

### D5. 🪶 Havada kalan tüy

Kapak karesinde zaten havada tüyler var (`hero.webp` alt metni: *"omzunda kuzgun, havada tüyler"*).
Biri fotoğraftan sayfaya düşmeye devam ediyor: tek SVG, `featherFall` 34 sn, 6 sn gecikme, tepe
opaklık **0,16**, döngünün %52'si tamamen görünmez.

Sürpriz gibi gelir, dikkat çekmez. Yalnızca `transform` + `opacity` animasyonu → paint yok.
Global reduced-motion kuralı (`animation-duration: .001ms`) onu zaten öldürüyor; temel opaklığı
`0` olduğu için hareket hassasiyeti olan kullanıcı **hiç** tüy görmez. Yazdırmada `svg` ile birlikte
yok olur.

---

## E. Bilerek yapılmayanlar

| Konu | Neden şimdi değil |
|---|---|
| EN sürüm | Mimari hazır (`lang: "tr" \| "en"`, adalar `lang` prop'u alıyor) ama çeviri **metin işi**, kod işi değil. Yazarın onayı olmadan manifesto çevrilmez. |
| `vesika[]` dizisi + arşiv rotaları | `docs/AUDIT.md §4.1-2`'de duruyor. Vesika 02 yazıldığında ~30 satır; şu an soyutlama için ikinci veri noktası yok. |
| Ölçüm (Plausible / GoatCounter) | Mühür ve kazı `localStorage`'da kaldığı için **hiçbir ölçüm aracı gerekmeden** "kaç kişi sahiplendi" sorusunun cevabı yok — ama çerezsiz bir sayaç eklemek ürün kararı, teknik karar değil. |
| Duvar dokusunu statik WebP'ye çevirme | `docs/AUDIT.md §2.7/5` ve §5'te "görsel sonuç yeterince iyi çıkmadı" diye kayıtlı. Aynı hatayı tekrarlamaktansa bırakıldı; fener `transform` tabanlı olduğu için dokuya paint yükü **eklemedi**. |
| Hero kadraj oranları / `EK:04` etiket-görsel çelişkisi | `docs/AUDIT.md §2.7/2-3`. Ham kareler `assets-src/`'te değil; bilinçli yeniden kadraj için kaynak fotoğraflar gerekiyor. |
| İkinci bir tüy / daha çok ambient efekt | Tek tüy sürpriz, iki tüy dekorasyon. Sınır bilerek çizildi. |

---

## F. Nasıl doğrulanır

```bash
npm run check        # typecheck + prerender (3 doğrulama) + bütçe → 1,16 MB < 1,8 MB
npm run dev          # http://localhost:5173  → fener, kazı, mühür, kopyalama, Ctrl+P
```

Prerender'ın üç doğrulaması:

```
· doğrulama: manifestonun kritik cümleleri statik HTML'de ✔
· doğrulama: head bloğu content.ts ile tutarlı (https://soulvespera.com.tr/) ✔
· doğrulama: 5 ada yuvası kütükle eşleşiyor ✔
```

CI'daki iki doğrulama adımı:

```
✓ manifesto statik HTML içinde
✓ 4 etkileşim de dinleyicisiyle pakete girmiş
```

Elle kontrol listesi:

- [ ] Hero'da imleci gezdir → sıcak ışık duvarı takip eder, kazı okunur, ipucu solar
- [ ] `alıntıyı kopyala` → `✓ kopyalandı`, pano içeriğinde alıntı + kaynak + bağlantı var
- [ ] Coda'da satır kazı → duvara oturur; sayfayı yenile → **duruyor**; 4.'te "yer kalmadı" der
- [ ] Mühürle → basma animasyonu, `NÜSHA No: #####`; yenile → **aynı numara**, düğme kilitli
- [ ] Mühürden sonra `paylaş` → metinde `· Nüsha No: #####` var
- [ ] `Ctrl+P` → künyeli, fotoğrafsız, bölümleri ayrı sayfalarda belge; kazınan satır kâğıtta
- [ ] Sistemde "hareketi azalt" aç → tüy yok, divit tam metin, mühür anında oturur
- [ ] JS'i kapat → manifesto tam okunur (485 kelime), ada yuvaları sessizce kaybolur

---

## G. Mühür: çizmeden önce **çizdirerek** doğrulama

Sandbox'ta tarayıcı yok, SVG rasterizer yok (`playwright` CDN'i TLS'te kesildi, `rsvg-convert`
kurulu değil). Yani elle çizilmiş SVG'yi "gözle" kontrol etmenin yolu kapanmıştı. Kapatmadım:
geometriyi **sayısal** olarak doğrulayıp silueti ImageMagick çizim ilkelleriyle birebir
kodaki değerlerden rasterleştirdim (`translate/rotate/ellipse` — gerçek SVG'deki elemanlarla
aynı koordinatlar). Üç turda üç gerçek kusur çıktı:

| # | Kusur | Kanıt | Onarım |
|---|---|---|---|
| G1 | 8 damladan 2'si viewBox'ın dışına taşıyor (61,6 / 60) ve SVG'nin `overflow: hidden`'ı uçlarını **düz kesiyordu** | radyal erişim = `r + rx` hesabı | elle ayarlanmış damla seti, sınır `r + rx ≤ 58` |
| G2 | Damlalar **güneş ışını / dişli** gibi duruyordu: radyal erişim (`rx`) teğetsel genişlikten (`ry`) büyüktü | raster önizleme | `ry > rx` → loblar kenara yapıştı, erimiş mum kenarı |
| G3 | Damlalar gövdeden **ayrı renkte** iki ton üretiyor, siluet "çiçek" gibi okunuyordu | raster önizleme | gradyan `gradientUnits="userSpaceOnUse"` → tek ışık kaynağı, süreli mum kütlesi |

Yan ürün: önizleme aracının kendisi de iki kez hata yaptı ve ikisi de kayda değer —
ImageMagick'te `translate/rotate` **kümülatif** (tek `-draw` string'inde 8 damla üst üste
bindi; gerçek SVG'de her `<ellipse>` kendi transform'una sahip olduğu için eser etkilenmedi)
ve ilk kompozit zinciri sessizce boş çıktı üretti. Yani "doğrulama aracı" da doğrulanmalı.

Son durum: 9 damla, en kötü radyal erişim **52,5 / 60**, hepsi yuvarlak, hiçbiri kırpık değil;
iç halka inceltilip sönükleştirildi (parlakken "bozuk para" gibi duruyordu).

## H. "Divit satırları yok" bildirimi — kök neden ve üç kalıcı onarım

Bildirim: hero'daki divit satırları (`ink.raw` + `ink.principle`) görünmüyordu. Kod
doğrulandı: `InkWriter` bileşeni, `main.tsx` haritası, `App.tsx` yuvası ve statik HTML'deki
`data-island="InkWriter"` **hepsi yerinde ve değişmemiş** (`git diff bd16f52 HEAD` yalnızca
yorum satırları). Yani metin silinmemişti; **görünmezdi**. Kök neden zinciri:

1. `vite` günlüğünde tekrar tekrar:
   `hmr invalidate /src/islands.tsx — Could not Fast Refresh ("armReveals" export is incompatible)`
   → her düzenlemede **tam sayfa yeniden yükleme**. `islands.tsx` hem bileşen hem düz fonksiyon
   dışa aktardığı için vite-plugin-react Fast Refresh'i reddediyordu. Geliştirme sekmesi bu
   türbülansda yarı monte edilmiş bir durumda kalabiliyor.
2. `useInView` yalnızca IntersectionObserver'a güveniyordu; IO ilk geri çağrısını geciktirirse
   (sekme arka planda, ekran görüntüsü araçları, bazı webview'ler) üst katmandaki içerik
   "yokmuş" gibi görünüyordu — divit tam olarak üst katmandaydı.

Onarımlar:

- **`src/motion.ts` (yeni):** `prefersReducedMotion` + `armReveals` taşındı. `islands.tsx`
  artık yalnızca bileşen/hook/tip dışa aktarıyor → Fast Refresh çalışıyor → tam sayfa
  yeniden yükleme türbülansı yok.
- **`useInView` montaj anında dikdörtgen kontrolü:** eleman zaten görünür alandaysa IO'yu
  hiç beklemiyor. IO gecikmesi/eksikliği artık içerik saklayamıyor.
- **Sunucu temiz yeniden başlatıldı** (bayat modül grafı sıfırlandı).

Not: `IŞIĞI AÇ / IŞIĞI KAPAT` bir **anahtardır ve etiket yapılabilir eylemi** söyler —
ışık kapalıyken "IŞIĞI AÇ", açıkken "IŞIĞI KAPAT" yazar. Bu davranış bu turda değişmedi;
yeni olan tek şey yanında artık el fenerinin de olması (§D1): ampul oda ışığı, fener senin elin.

### Bu turdaki ek bulgu: yeniden üretilemeyen varlıklar

`npm run optimize:assets` ve `npm run make:og` çalıştırıldığında commit'li binary'ler
**farklı baytlarla** yeniden yazılıyordu:

| Dosya | Neden | Kanıt | Onarım |
|---|---|---|---|
| `src/assets/grain.png` | `plasma:fractal` **deterministik değil** | iki çalışmada md5 farklı; `-seed 20260922` ile birebir aynı | `-seed` eklendi |
| `public/apple-touch-icon.png` | `-strip` yoktu; commit'li sürüm eski hatattan | üretilen ≠ commit'li (aynı boyut, farklı md5) | `-strip` + `png:compression-level=9`; yeniden üretildi (**piksel farkı 0**, −306 B) |

Önemi: README bu script'leri belgeliyor; deterministik olmayan çıktı, her çalıştırmada
"gereksiz binary diff" ve ziyaretçiye gereksiz cache invalidation demek.
