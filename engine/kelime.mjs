// kelime.mjs — "kelimenin saniyesini bulur": script.txt'deki her kelimeye, ses kaydındaki gerçek zamanını verir.
//   node engine/kelime.mjs <ad>
// Girdi : stories/<ad>/script.txt + stories/<ad>/voice/ içindeki ses (mp3 / wav / m4a; adı ne olursa olsun)
// Çıktı : voice/voice.wav (videoya eklenen ses) + voice/words.json ({ words: [{ word, start, end }] })
// Nasıl : sesi bilgisayarında Whisper ile dinler (internet yalnız ilk seferde modeli indirmek için), duyduğu kelimeleri
//         senaryodaki kelimelerle eşler; duyulamayan kelimeye komşularının arasındaki zamanı paylaştırır.
// Ses yoksa: konuşma hızına göre (saniyede 2,4 kelime) TAHMİNİ zaman yazar, video yine çizilir.
import fs from 'node:fs'; import path from 'node:path'; import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const KOK = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ad = process.argv[2] || 'ornek', SD = path.join(KOK, 'stories', ad), VD = path.join(SD, 'voice');
const metin = fs.readFileSync(path.join(SD, 'script.txt'), 'utf8');
const kelimeler = metin.split(/\s+/).filter(Boolean);
const norm = s => s.toLocaleLowerCase('tr-TR').replace(/[^\p{L}\p{N}]/gu, '');
const yaz = w => { fs.mkdirSync(VD, { recursive: true }); fs.writeFileSync(path.join(VD, 'words.json'), JSON.stringify({ words: w }, null, 1)); };

const ses = fs.existsSync(VD) && fs.readdirSync(VD).find(f => /\.(mp3|wav|m4a|ogg)$/i.test(f) && f !== 'voice.wav');
if (!ses) {
  let t = .2; const w = kelimeler.map(k => { const d = .2 + k.length * .045, o = { word: k, start: +t.toFixed(3), end: +(t + d).toFixed(3) }; t += d + (/[.?!]$/.test(k) ? .45 : /[,:]$/.test(k) ? .2 : .06); return o; });
  yaz(w); console.log(`ses yok → tahmini zaman: ${w.length} kelime, ${t.toFixed(1)} sn (voice klasörüne mp3 koyunca gerçek zamanı bulur)`); process.exit(0);
}

// 1) ses: video için 48 kHz wav, Whisper için 16 kHz ham veri
const src = path.join(VD, ses), wav = path.join(VD, 'voice.wav');
spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s16le', wav]);
const ham = spawnSync('ffmpeg', ['-v', 'error', '-i', src, '-ar', '16000', '-ac', '1', '-f', 'f32le', '-'], { maxBuffer: 1 << 30 }).stdout;
const audio = new Float32Array(ham.buffer, ham.byteOffset, ham.length / 4), sure = audio.length / 16000;

// 2) Whisper (yerel): duyulan kelimeler + zamanları
console.log(`${ses}: ${sure.toFixed(1)} sn dinleniyor (ilk seferde model iniyor, ~250 MB)...`);
const { pipeline, env } = await import('@huggingface/transformers');
env.cacheDir = path.join(KOK, '.cache', 'models');
const asr = await pipeline('automatic-speech-recognition', 'onnx-community/whisper-small_timestamped', { dtype: 'q8' });
// Whisper uzun dosyada zamanları kaydırır: ses, duraklamalardan 12–20 sn'lik parçalara bölünür, her parça ayrı dinlenir.
const SR = 16000, KARE = SR / 50, enerji = [];   // 20 ms'lik karelerin enerjisi
for (let i = 0; i + KARE <= audio.length; i += KARE) { let e = 0; for (let j = i; j < i + KARE; j++) e += audio[j] * audio[j]; enerji.push(e); }
const sinir = [0]; while (enerji.length - sinir[sinir.length - 1] > 20 * 50) { const a = sinir[sinir.length - 1] + 12 * 50, b = Math.min(enerji.length - 1, sinir[sinir.length - 1] + 20 * 50);
  let en = a, ev = Infinity; for (let k = a; k <= b; k++) { let v = 0; for (let j = Math.max(0, k - 5); j <= Math.min(enerji.length - 1, k + 5); j++) v += enerji[j]; if (v < ev) { ev = v; en = k; } } sinir.push(en); }
sinir.push(enerji.length);
const duy = [];
for (let p = 0; p < sinir.length - 1; p++) { const a = sinir[p] * KARE, b = sinir[p + 1] * KARE, t0 = a / SR;
  const out = await asr(audio.subarray(a, b), { language: 'turkish', task: 'transcribe', return_timestamps: 'word' });
  for (const c of out.chunks || []) { const n2 = norm(c.text); if (n2) duy.push({ n: n2, s: t0 + c.timestamp[0], e: t0 + (c.timestamp[1] ?? c.timestamp[0] + .3) }); }
  console.log(`  parça ${p + 1}/${sinir.length - 1}: ${t0.toFixed(1)}–${(b / SR).toFixed(1)} sn`); }

// 3) eşleme: senaryo kelimeleri ↔ duyulan kelimeler (en çok benzeyen sıra; benzerlik = harf düzeyinde)
const benzer = (a, b) => { if (a === b) return 1; const m = a.length, n = b.length; if (!m || !n) return 0; const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]); for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return 1 - d[m][n] / Math.max(m, n); };
const S = kelimeler.map(norm), n = S.length, m = duy.length, P = Array.from({ length: n + 1 }, () => new Float64Array(m + 1)), Y = Array.from({ length: n + 1 }, () => new Int8Array(m + 1));
for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) { const b = benzer(S[i - 1], duy[j - 1].n), es = b >= .6 ? P[i - 1][j - 1] + b : -1;
  if (es >= P[i - 1][j] && es >= P[i][j - 1]) { P[i][j] = es; Y[i][j] = 1; } else if (P[i - 1][j] >= P[i][j - 1]) { P[i][j] = P[i - 1][j]; Y[i][j] = 2; } else { P[i][j] = P[i][j - 1]; Y[i][j] = 3; } }
const zam = Array(n).fill(null); for (let i = n, j = m; i > 0 && j > 0;) { if (Y[i][j] === 1) { zam[i - 1] = { s: duy[j - 1].s, e: duy[j - 1].e }; i--; j--; } else if (Y[i][j] === 2) i--; else j--; }
const bulunan = zam.filter(Boolean).length;

// 4) duyulamayanlar: önceki ve sonraki bulunan kelimenin arasına, harf sayısına göre paylaştır
for (let i = 0; i < n; i++) { if (zam[i]) continue; let j = i; while (j < n && !zam[j]) j++;
  const a = i > 0 ? zam[i - 1].e : 0, b = j < n ? zam[j].s : sure, L = S.slice(i, j).reduce((x, s) => x + s.length + 1, 0); let t = a;
  for (let k = i; k < j; k++) { const d = (b - a) * (S[k].length + 1) / L; zam[k] = { s: t, e: t + d }; t += d; } i = j - 1; }
yaz(kelimeler.map((k, i) => ({ word: k, start: +zam[i].s.toFixed(3), end: +Math.max(zam[i].e, zam[i].s + .05).toFixed(3) })));
console.log(`kelime zamanı: ${bulunan}/${n} kelime sesten birebir bulundu, kalanı aralarına paylaştırıldı → voice/words.json`);
