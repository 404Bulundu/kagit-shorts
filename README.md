# kagit-shorts

Kamera yok, kurgu programı yok. Metnini yaz, sesini koy, tek komutla dikey Shorts videosu çıksın.
**404 Bulundu** kanalındaki videolar bu yöntemle yapılıyor. Ücretsiz, abone olmak şart değil.

![kart örneği](https://img.shields.io/badge/çıktı-1080×1920%20·%2030%20fps-ff5a1f)

## 5 adım

### 1. Şablonu indir, Node ve ffmpeg kur
- Bu sayfada **Code → Download ZIP**, sonra ZIP'i bir klasöre çıkar.
- [Node.js](https://nodejs.org) (LTS) ve [ffmpeg](https://ffmpeg.org/download.html) kur. İkisi de ücretsiz.
- Bilgisayarda **Chrome** ya da **Edge** olmalı (videoyu o çizer). Bulamazsa yolunu ver: `set CHROME_PATH=C:\...\msedge.exe`
- Klasörde terminal aç, bir kez çalıştır:
  ```
  npm install
  ```

### 2. Metnini yaz
`stories/ornek/script.txt` dosyasına anlatacağın metni yaz. **Bir dakikalık video için yaklaşık 140 kelime yeter.**
Paragraflar arasında boş satır bırakabilirsin.

### 3. Sesini koy
Metni kendi sesinle oku ya da sesini klonla, dosyayı `stories/ornek/voice/` klasörüne koy (mp3, wav, m4a; adı önemli değil).
YouTube'a göre kendi sesini klonlayıp seslendirme yapmak "yapay zekâ içeriği" etiketi gerektirmiyor
([YouTube Yardım](https://support.google.com/youtube/answer/14328491)).

### 4. Kartları kelimelere bağla
`stories/ornek/story.js` içinde her satır bir kart:
```js
kart(W('kelimede'), 'BURADA');      // 'kelimede' söylendiği an "BURADA" kartı çıkar
```
Kelimenin saniyesini motor kendisi buluyor: sesi bilgisayarında dinler (Whisper, internet yalnız ilk seferde modeli indirmek için)
ve metindeki her kelimeye gerçek zamanını verir.

| Kart | Örnek |
|---|---|
| `sahne(t)` | yeni ekran (öncekiler temizlenir) |
| `baslik(t, 'ÜST', 'ANA BAŞLIK')` | iki satır başlık |
| `kart(t, 'metin')` | beyaz hap kart |
| `not(t, 'metin')` | sarı yapışkan not |
| `damga(t, 'METİN')` | kırmızı damga |
| `sayac(t, 120, { ek: ' ₺' })` | dönen sayı |
| `resim(t, '/stories/ornek/resim.png')` | görsel |

Aynı kelime metinde iki kez geçiyorsa: `W('kelime', 2)`. Kartlar ekranda kendiliğinden dizilir, üst üste binmez,
YouTube'un Shorts arayüzünün kapattığı yerlere (üst, alt, sağdaki beğen/yorum sütunu) girmez. Altyazı otomatik.

### 5. Tek komutla render al
```
npm run video
```
Video: `stories/ornek/out/ornek.mp4`. Yeni video için `stories/ornek` klasörünü kopyala (ör. `stories/ilk-videom`) ve
`npm run video -- ilk-videom` çalıştır. Tek kareye bakmak için: `npm run resim -- ornek --resim=5`

## Aynen bırakma
YouTube, **şablondan çıkmış gibi görünen** ve arka arkaya izleyince birbirinin aynısı gibi gelen videolara para vermiyor
([YouTube kanal para kazanma politikaları](https://support.google.com/youtube/answer/1311392), 15 Temmuz 2025 güncellemesi).
Bu şablon iskelet: **renkleri** (`engine/src/kit.js` → `RENK`), **kartları**, **konuyu** değiştir; her videoya **kendi verini** koy.

## Lisans
Kod: MIT (`LICENSE`). Font: Montserrat, SIL Open Font License (`fonts/OFL-Montserrat.txt`).
