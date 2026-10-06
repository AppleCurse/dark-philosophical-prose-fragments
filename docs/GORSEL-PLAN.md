# GÖRSEL PLAN · üç yeni kare, nereye ve nasıl

22.09.2026'da gelen üç ham kare için yerleşim + işleme planı. Kareler **görüldü** ama
baytları sandbox'a inmedi (`/home/user/uploads` boş çıktı); bu yüzden burası bir
*karakterizasyon ve karar* belgesi. Hamlar `assets-src/`'e düştüğü an §5'teki blok
çalışır ve site yeniden derlenir.

Disiplin hatırlatması (bozulmaz): üretimde her görsel **gri tonlamalı**, render
genişliğinde webp; toplam bütçe 1,8 MB; JS'siz okuma ve `prefers-reduced-motion`
asla görsel bir numaraya bağlanmaz.

---

## 1. Karelerin okuması

| Dosya | Ne görüyorum | Tür |
|---|---|---|
| `yagmurlu_dusus(1).gif` | Sağanak + şimşek, ıslak beyaz kanatlar, havada tüyler, yüz yukarıda | **animasyonlu** |
| `kahveli_melek.gif` | Kollar bağlı, saf beyaz kanatlar, dolunay, sakin duruş | **animasyonlu** |
| `white_suit_smoke_transformation.jpg` | Beyaz takım; sol kanat beyaz, sağ kanat **siyah duman**; omuzda kuzgun; tepeden ışık huzmeleri | statik, yüksek çözünürlük |

## 2. Önerilen eşleme

| Ham | Hedef | Gerekçe |
|---|---|---|
| `white_suit_smoke_transformation.jpg` | `hero.webp` (kapak) | Manifestonun çekirdek imgesi zaten bu: `content.ts` alt metni *"yarı siyah, yarı beyaz; omzunda kuzgun"* diyor. Bu kare o cümlenin birebir fotoğrafı. |
| aynı ham | `hero-bg.webp` (coda arka planı) | Yatay tam kadrajda kanatlar açılıyor; coda'da hero'yu yankılar. Tek hamdan iki hedef = sıfır ek kaynak. |
| `kahveli_melek.gif` | `ek-koken.webp` (EK:03 KÖKEN) | Etiket *"düşmeden önce, saf beyaz kanatlar"* — kare tam olarak bu. (`docs/AUDIT.md §2.7/3`'ün "etiketle çelişiyor" bulgusu da böyle kapanır.) |
| `yagmurlu_dusus(1).gif` | `ek-masumiyet.webp` (EK:04) | Islak kanat + sağanak = düşüş anı; masumiyetin ıslandığı an. Alternatifi §3'te. |

## 3. Kadraj çatışması (kapak için karar gerekli)

Asılı portre kutusu `aspect-[3/4]` (dikey polaroid). Yeni kapak karesi **yatay** ve
gücü kanatların yatay açılımında. İki yol var:

- **A (önerim): 3:4 kırpım, `@center`.** Kırpım yüzü, omuzdaki kuzgunu ve siyah duman
  yarımı birlikte tutar — yani *"yarı siyah yarı beyaz"* tezi tek dikey karede OKUNUR.
  Kanatların açıklığı feda edilir, tez kazanılır. Tasarım dili (çiviye asılı dikey
  polaroid) bozulmaz.
- **B: kutuyu yataylaştırmak.** Kanatlar yaşar ama "paslı çiviye asılı portre" metaforu
  ve hero'nun dikey ritmi değişir; dört EK karesiyle oran uyumu da yeniden düşünülür.

Ben A diyorum: bu sitede metafor, manzaradan önce gelir.

## 4. GIF'ler: donmuş an mı, akan yağmur mu?

İki animasyonlu kaynak var. Sitenin disiplini statik gri webp; ama burada gerçek bir
sanat kararı duruyor:

- **Tek kare (`frame: 0` ya da seçilmiş bir indeksi):** disiplin aynen korunur, maliyet
  ~20-30 KB/ek. Güvenli yol.
- **Hareketli gri webp (`frame: "0-23"`):** sağanak **gerçekten yağar**. Önerdiğim yer
  Bölüm II.b (Toprak) tam ekran katmanı ya da hero duvarının arkası: `loop=0`,
  ~900 px genişlik, gri, q≈60 → tahmini **+150-350 KB** (bütçe 1,16 → ~1,45 MB, hâlâ
  < 1,8 MB). `prefers-reduced-motion`'da ilk kare donuk kalır; JS'siz okumayı etkilemez
  çünkü dekor katmanıdır. Bu, sitenin "tek ampul / havada tüy" dilinin doğal devamı:
  tüy zaten düşüyordu, şimdi yağmur da düşer.

Ben: **ikisi birlikte** — EK'ler tek kare, yağmur tek bir atmosfer katmanında hareketli.
Ama bu en pahalı tercih; istemezsen tek kare yeter.

## 5. Hazır işleme bloğu (hamlar düşünce `ITEMS`'a eklenecek)

`scripts/optimize-assets.mjs` bu turda `frame` (GIF karesi/aralığı) ve `mode` içinde
`@gravity` desteği kazandı; kadraj artık `object-cover`'a bırakılmıyor, üretimde
bilinçli kırpılıyor. Hamlar `assets-src/`'e konunca şu satırlar `ITEMS`'a girer:

```js
["white_suit_smoke_transformation.jpg", "hero.webp",     1000, 80, "3:4@center"],
["white_suit_smoke_transformation.jpg", "hero-bg.webp",  1400, 74, "16:9@center"],
["kahveli_melek.gif",                   "ek-koken.webp",  420, 76, "3:4@north", 0],
["yagmurlu_dusus(1).gif",               "ek-masumiyet.webp", 420, 76, "3:4@north", 0],
// hareketli yağmur katmanı (karar §4):
// ["yagmurlu_dusus(1).gif",             "yagmur.webp",    900, 62, "16:9@center", "0-23"],
```

Notlar:
- `hero.webp` 3:4'e geçtiğinde `content.ts → portrait` boyutları (`w/h`) güncellenmeli;
  `App.tsx` kutusu zaten `aspect-[3/4]`, yani kırpım kaybı **sıfırlanır**
  (`docs/AUDIT.md §2.7/2` bulgusu kendiliğinden kapanır).
- Hareketli webp için `convert`'e `-define webp:loop=0` gerekecek; script'te henüz yok,
  karar çıkarsa tek satır.
- Bu sandbox'ın ImageMagick'i committed `grain.png`'den farklı (ve daha büyük) doku
  ürettiği için grain **yeniden üretilmedi**; `-seed` düzeltmesi yalnızca gelecek
  çalıştırmaların kendi içinde tutarlı olması için duruyor.

## 6. Benden ne lazım

1. **Baytlar:** üç dosya sandbox'a inmemiş. Yeniden ekle ya da eriştirebileceğim bir
   URL ver; indiği an §5 bloğunu çalıştırıp siteyi derlerim.
2. **Üç karar:** §3 (kapak kadrajı A/B), §4 (GIF tek kare / hareketli / ikisi),
   §2 (EK:04 eşlemesi onay mı, yoksa yağmurlu düşüş ÇAKILIŞ'a mı).
