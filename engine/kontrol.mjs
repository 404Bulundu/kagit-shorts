// kontrol.mjs — `npm run kontrol`: kurulum tamam mı? Her şeyi tek tek dener, eksik olanı Türkçe söyler.
import fs from 'node:fs'; import path from 'node:path'; import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let sorun = 0;
const iyi = s => console.log('  ✓ ' + s), kotu = (s, cozum) => { sorun++; console.log('  ✗ ' + s + '\n      → ' + cozum); };
console.log('\nkagit-shorts kurulum kontrolü\n');

// 1) Node sürümü
const ana = +process.versions.node.split('.')[0];
ana >= 18 ? iyi(`Node ${process.versions.node}`) : kotu(`Node ${process.versions.node} eski`, 'https://nodejs.org adresinden LTS sürümü kur (18 ya da üstü).');

// 2) npm install yapılmış mı
const paket = p => fs.existsSync(path.join(KOK, 'node_modules', ...p.split('/')));
if (paket('puppeteer-core') && paket('@huggingface/transformers') && paket('@ffmpeg-installer/ffmpeg')) iyi('paketler kurulu (npm install)');
else kotu('paketler eksik', 'Bu klasörde terminal aç ve bir kez çalıştır:  npm install');

// 3) ffmpeg (npm ile gelir; yoksa bilgisayardaki)
try { const { FFMPEG } = await import('./ffmpeg.mjs'); const r = spawnSync(FFMPEG, ['-hide_banner', '-encoders'], { encoding: 'utf8' });
  if (r.status === 0 && /libx264/.test(r.stdout)) iyi(`ffmpeg hazır (${FFMPEG === 'ffmpeg' ? 'bilgisayardaki' : 'npm ile gelen'})`);
  else kotu('ffmpeg çalışmadı', 'Önce  npm install  çalıştır. Olmazsa https://ffmpeg.org adresinden kur ya da FFMPEG_PATH ile yolunu ver.');
} catch (e) { kotu('ffmpeg bulunamadı', 'npm install çalıştır.'); }

// 4) Tarayıcı (Chrome ya da Edge)
try { const { findChrome } = await import('./chrome.mjs'); const t = findChrome({ cik: false });
  if (t) iyi(`tarayıcı: ${path.basename(t)}`); else sorun++;
} catch (e) { kotu('tarayıcı aranamadı', 'npm install çalıştır.'); }

// 5) Hikâyeler: metin ve ses var mı
const SD = path.join(KOK, 'stories');
for (const ad of fs.existsSync(SD) ? fs.readdirSync(SD) : []) {
  const d = path.join(SD, ad); if (!fs.statSync(d).isDirectory()) continue;
  const metin = fs.existsSync(path.join(d, 'script.txt')) ? fs.readFileSync(path.join(d, 'script.txt'), 'utf8').split(/\s+/).filter(Boolean).length : 0;
  const ses = fs.existsSync(path.join(d, 'voice')) && fs.readdirSync(path.join(d, 'voice')).find(f => /\.(mp3|wav|m4a|ogg)$/i.test(f) && f !== 'voice.wav');
  if (!metin) kotu(`stories/${ad}: script.txt boş ya da yok`, 'Anlatacağın metni script.txt dosyasına yaz.');
  else iyi(`stories/${ad}: ${metin} kelime (≈ ${Math.round(metin / 2.4)} sn)${ses ? ', ses: ' + ses : ', ses yok (tahmini zamanla çizilir)'}`);
}

// 6) Ses modeli (ilk kelime bulmada iner)
fs.existsSync(path.join(KOK, '.cache', 'models')) ? iyi('ses modeli indirilmiş') : console.log('  • ses modeli ilk "npm run video" sırasında bir kez iner (~250 MB, internet gerekir)');

console.log(sorun ? `\n${sorun} sorun var. Yukarıdaki → satırlarını uygula, sonra tekrar:  npm run kontrol\n` : '\nHer şey hazır. Video için:  npm run video\n');
process.exit(sorun ? 1 : 0);
