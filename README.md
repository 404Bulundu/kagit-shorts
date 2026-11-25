# kagit-shorts

Kamera yok, kurgu programı yok. Metnini yaz, sesini koy, tek komutla dikey Shorts videosu (1080×1920) çıksın.
**404 Bulundu** kanalındaki videolar bu yöntemle yapılıyor. Ücretsiz, abone olmak şart değil.

> Windows'ta denendi. macOS / Linux'ta da çalışması beklenir (Chrome ya da Edge gerekir).

---

## 5 adım

### 1. Şablonu indir, Node kur
1. Bu sayfada yeşil **Code** düğmesi → **Download ZIP**. ZIP'e sağ tık → **Tümünü ayıkla**.
2. [Node.js](https://nodejs.org) kur (**LTS** yazan sürüm, kurulumda hep "İleri").
3. Çıkardığın klasörü aç, adres çubuğuna `powershell` yazıp Enter'a bas (o klasörde terminal açılır) ve bir kez çalıştır:
   ```
   npm install
   ```
   Bu komut **ffmpeg'i de indirir**, ayrıca kurmana gerek yok. 1–3 dakika sürer.
4. Her şey hazır mı, kontrol et:
   ```
   npm run kontrol
   ```
   Hepsi ✓ ise devam et. ✗ varsa altındaki → satırı ne yapacağını söyler.

Videoyu **Chrome** ya da **Edge** çizer (Edge her Windows'ta vardır, kendisi bulur).

### 2. Metnini yaz
`stories/ornek/script.txt` dosyasını Not Defteri ile aç, anlatacağın metni yaz, kaydet.
- **1 dakikalık video ≈ 140 kelime.** `npm run kontrol` kelime sayısını ve tahmini süreyi gösterir.
- Paragraflar arasında boş satır bırakabilirsin.

### 3. Sesini koy
Metni kendi sesinle oku (telefonun ses kaydedicisi yeter) ya da sesini klonla. Dosyayı `stories/ornek/voice/` klasörüne koy.
- mp3, wav, m4a olur; **adı önemli değil**.
- Ses yoksa da video çıkar (konuşma hızına göre tahmini zamanla, sessiz).
- YouTube'a göre **kendi sesini klonlayıp seslendirme yapmak "yapay zekâ içeriği" etiketi gerektirmiyor**
  ([YouTube Yardım](https://support.google.com/youtube/answer/14328491), "Cloning one’s own voice to create voice overs or dubs").

### 4. Kartları kelimelere bağla
`stories/ornek/story.js` dosyasını aç (Not Defteri ya da [VS Code](https://code.visualstudio.com)). Her satır bir kart:
```js
kart(W('kelimede'), 'BURADA');      // metinde 'kelimede' söylendiği an "BURADA" kartı çıkar
```
`W('kelime')` = o kelimenin söylendiği saniye. **Kelimenin saniyesini motor kendisi bulur**: sesini bilgisayarında dinler
(Whisper; internet yalnızca ilk seferde modeli indirmek için) ve metindeki her kelimeye gerçek zamanını verir.

| Yaz | Ne olur |
|---|---|
| `sahne(W('kelime'))` | yeni ekran başlar (öncekiler temizlenir) |
| `baslik(W('kelime'), 'ÜST SATIR', 'ANA BAŞLIK')` | iki satır başlık |
| `kart(W('kelime'), 'metin')` | beyaz kart |
| `kart(W('kelime'), 'metin', { renk: '#ff5a1f', yazi: '#fff' })` | renkli kart |
| `not(W('kelime'), 'metin')` | sarı yapışkan not |
| `damga(W('kelime'), 'METİN')` | kırmızı damga |
| `sayac(W('kelime'), 120, { ek: ' ₺' })` | 0'dan 120'ye dönen sayı |
| `resim(W('kelime'), '/stories/ornek/resim.png')` | görsel (dosyayı hikâye klasörüne koy) |

Kurallar:
- Kelimeyi **metinde yazdığın gibi** yaz, büyük/küçük harf ve noktalama önemli değil: `W('Shorts\'u')` = `W('shortsu')`.
- Aynı kelime metinde iki kez geçiyorsa: `W('kelime', 2)` ikincisi.
- Kartlar ekranda **kendiliğinden dizilir**, üst üste binmez; YouTube'un Shorts arayüzünün kapattığı yerlere
  (üst, alt, sağdaki beğen/yorum sütunu) girmez. Bir sahneye çok kart koyarsan uyarır: yeni `sahne(...)` başlat.
- Altyazı otomatik.

### 5. Tek komutla render al
```
npm run video
```
- Video: `stories/ornek/out/ornek.mp4`.
- **Süre:** bilgisayarına göre değişir; bizde 1 dakikalık video ~7 dakikada çıktı (her kare tek tek çizilir).
  Terminalde `kare 300/1680 (%18)` gibi ilerleme görürsün.
- Bitmeden tek kareye bakmak için: `npm run resim -- ornek --resim=5` → `stories/ornek/out/kare_5.png`

**Yeni video:** `stories/ornek` klasörünü kopyala (ör. `stories/ilk-videom`), içindeki metni/sesi/kartları değiştir,
`npm run video -- ilk-videom` çalıştır.

---

## Aynen bırakma: neyi nerede değiştirirsin?
YouTube, **şablondan çıkmış gibi görünen** ve arka arkaya izleyince birbirinin aynısı gibi gelen videolara para vermiyor
([YouTube kanal para kazanma politikaları](https://support.google.com/youtube/answer/1311392), 15 Temmuz 2025 güncellemesi:
"content that looks like it’s made with a template"). Bu şablon iskelet; kendi görünüşünü ver:

| Ne | Nerede | Nasıl |
|---|---|---|
| **Renkler** | `engine/src/kit.js` → en üstte `const RENK = {...}` | `vurgu` (turuncu), `zemin`/`zemin2` (arka plan), `kart`, `not`… renk kodlarını değiştir. Renk seçmek için: [coolors.co](https://coolors.co) |
| **Yazı tipi** | `fonts/` + `kit.js` → `fontYukle()` ve `const MONT` | Kendi .ttf dosyanı `fonts/` klasörüne koy, `fontYukle` içindeki dosya adını ve `MONT` adını değiştir. Lisansı ticari kullanıma açık font seç (ör. Google Fonts) |
| **Kart görünüşü** | `kit.js` → `kart`, `not`, `damga`, `sayac` fonksiyonları | Boyut (`58px`), köşe (`rr(..., 30)`), gölge (`golge`), eğim (`rotate`) değerleri |
| **Yeni kart türü** | `kit.js` | `kart` fonksiyonunu kopyala, adını değiştir, içini çiz (Canvas 2D). `story.js`'te `import` satırına ekle |
| **Altyazı** | `kit.js` → `altyazi()` | Kaç kelime birden (`4`), boyut (`52px`), konum (`y = 1375`) |
| **Doku** | `kit.js` → `gren()` | `globalAlpha = .18` → 0 yaparsan doku kalkar |
| **Konu ve veri** | `script.txt` + `story.js` | En önemlisi: **kendi konun, kendi araştırman, kendi rakamların.** Şablon bunu senin yerine yapamaz |

---

## Sık sorunlar
| Görürsen | Anlamı / çözüm |
|---|---|
| `'npm' is not recognized` | Node kurulu değil ya da terminal kurulumdan önce açıldı. Node'u kur, terminali kapatıp yeniden aç |
| `✗ Chrome ya da Edge bulunamadı` | Chrome kur ya da yolunu ver: `$env:CHROME_PATH="C:\...\msedge.exe"` |
| `model iniyor: ... %40` | İlk seferde ses modeli iniyor (~250 MB), bir kez olur |
| `W('...'): bu kelime script.txt içinde yok` | `story.js`'teki kelime metinde yok ya da yazımı farklı. Metindeki hâliyle yaz |
| `Sahne dolu` | Bir sahneye fazla kart koydun; araya `sahne(W('...'))` ekle |
| `kelime zamanı: 40/120 bulundu` | Sesteki konuşma metinle uyuşmuyor. Sesi metne birebir okuduğundan emin ol |
| Video sessiz | `voice` klasöründe ses dosyası yok |
| Çok yavaş | Normal: her kare tek tek çizilir. Önce `npm run resim` ile tek kareye bak, sonra tam videoyu al |

## Lisans
Kod: MIT (`LICENSE`). Font: Montserrat, SIL Open Font License (`fonts/OFL-Montserrat.txt`). ffmpeg: `@ffmpeg-installer/ffmpeg` ile gelen derleme (LGPL/GPL).
