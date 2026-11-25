// kit.js — Shorts şablonunun çizim kiti (1080x1920, Canvas 2D).
// Hikâye (stories/<ad>/story.js) sadece şunu yazar:  kart(W('kelime'), 'METİN')
//   W('kelime')      : o kelimenin söylendiği saniye (voice/words.json'dan). Aynı kelime birden çok geçiyorsa W('kelime', 2)
//   sahne(t)         : yeni ekran (öncekiler temizlenir). Sahneye eklenen öğeler yukarıdan aşağı otomatik dizilir, üst üste binmez.
//   baslik(t, üst, ana)  kart(t, metin)  not(t, metin)  damga(t, metin)  sayac(t, sayı, { ek })  resim(t, 'dosya.png')
// Shorts güvenli alanı: YouTube arayüzü üstte ~240 px, altta y>1480 ve sağ alttaki buton sütununu kapatır. İçerik y 280–1270 arasına dizilir.

export const W_ = 1080, H_ = 1920;
// RENKLER — videonun bütün renkleri buradan değişir (her videoda farklı bir palet dene)
const RENK = { zemin: '#fbf9f4', zemin2: '#e9e4d8', yazi: '#16181d', vurgu: '#ff5a1f', gri: '#6b6f78', kart: '#ffffff', not: '#ffe27a', kirmizi: '#e5372b', yesil: '#1f9d55' };
const MONT = '"Montserrat Black", "Segoe UI", sans-serif', UI = '"Segoe UI", system-ui, sans-serif';
const UST = 280, ALT = 1270, BOSLUK = 40, BUTON_UST = 960;      // içerik alanı ve sağdaki buton sütununun başladığı y
const ortaX = (y, h) => (y + h > BUTON_UST ? (60 + 890) / 2 : 540);   // buton sütunu bölgesinde içerik sola, üstte tam ortada

let KELIMELER = [], SAHNELER = [], aktif = null;
const norm = s => s.toLocaleLowerCase('tr-TR').replace(/[^\p{L}\p{N}]/gu, '');

export function _kur(words) { KELIMELER = words; SAHNELER = []; aktif = null; }
export function _sahneler() { return SAHNELER; }

// ---- kelime → saniye ----
export function W(kelime, n = 1) {
  const q = norm(kelime); let c = 0;
  for (const w of KELIMELER) if (norm(w.word) === q && ++c === n) return w.start;
  throw new Error(`W('${kelime}'${n > 1 ? ', ' + n : ''}): bu kelime script.txt içinde yok (ya da ${n}. kez geçmiyor)`);
}

// ---- sahne ve öğeler ----
export function sahne(t) { aktif = { t, ogeler: [] }; SAHNELER.push(aktif); return aktif; }
function ekle(t, h, ciz) {
  if (!aktif) sahne(0);
  const y = aktif.ogeler.reduce((a, o) => a + o.h + BOSLUK, UST);
  if (y + h > ALT) console.error(`Sahne dolu: ${t.toFixed(1)}. saniyedeki öğe alt sınırı aşıyor. Yeni bir sahne(...) başlat.`);
  aktif.ogeler.push({ t, h, y, ciz }); }

export function baslik(t, ust, ana) { ekle(t, 190, (g, u, x, y) => { g.globalAlpha *= u; g.translate(0, (1 - u) * -20);
  yazi(g, ust, x, y + 40, 50, RENK.yazi); yazi(g, ana, x, y + 135, 92, RENK.vurgu, { golge: true }); }); }

export function kart(t, metin, { renk = RENK.kart, yazi: yr = RENK.yazi } = {}) { ekle(t, 150, (g, u, x, y) => { const s = zipla(u);
  g.translate(x, y + 75); g.scale(s, s); g.font = `900 58px ${UI}`; const w = Math.min(820, g.measureText(metin).width + 110);
  golge(g); rr(g, -w / 2, -66, w, 132, 30); g.fillStyle = renk; g.fill(); g.shadowColor = 'transparent';
  yazi(g, metin, 0, 2, 58, yr, { font: `900 58px ${UI}`, max: w - 70 }); }); }

export function not(t, metin) { ekle(t, 250, (g, u, x, y) => { const s = zipla(u), w = 620, h = 220;
  g.translate(x, y + 125); g.rotate(.03); g.scale(s, s); golge(g); g.fillStyle = RENK.not; g.fillRect(-w / 2, -h / 2, w, h); g.shadowColor = 'transparent';
  g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(-60, -h / 2 - 16, 120, 32);
  const satir = satirla(g, metin, 60, w - 80); satir.forEach((s2, i) => yazi(g, s2, 0, (i - (satir.length - 1) / 2) * 70, 60, RENK.yazi, { font: `900 60px ${UI}` })); }); }

export function damga(t, metin, { renk = RENK.kirmizi } = {}) { ekle(t, 160, (g, u, x, y) => { const k = 1 + (1 - u) * .8;
  g.translate(x, y + 80); g.rotate(-.06); g.scale(k, k); g.globalAlpha *= Math.min(1, u * 1.4); g.font = `76px ${MONT}`;
  const w = Math.min(800, g.measureText(metin).width + 70); g.strokeStyle = renk; g.lineWidth = 9; rr(g, -w / 2, -60, w, 120, 14); g.fillStyle = 'rgba(251,249,244,.94)'; g.fill(); g.stroke();
  yazi(g, metin, 0, 4, 76, renk, { max: w - 50 }); }); }

export function sayac(t, deger, { ek = '', sure = 1.1 } = {}) { ekle(t, 190, (g, u, x, y, tt) => { g.globalAlpha *= Math.min(1, u * 2);
  const v = deger * easeOut(clamp((tt - t) / sure)); const s = Math.round(v).toLocaleString('tr-TR') + ek; yazi(g, s, x, y + 95, 150, RENK.vurgu, { font: `900 150px ${UI}` }); }); }

const RESIM = {};
export function resim(t, dosya, { h = 420 } = {}) { const img = new Image(); img.src = dosya; RESIM[dosya] = img;
  ekle(t, h, (g, u, x, y) => { if (!img.complete || !img.naturalWidth) return; const s = zipla(u), hh = h, ww = Math.min(900, hh * img.naturalWidth / img.naturalHeight);
    g.translate(x, y + hh / 2); g.scale(s, s); golge(g); rr(g, -ww / 2, -hh / 2, ww, hh, 24); g.fillStyle = '#fff'; g.fill(); g.shadowColor = 'transparent'; g.clip(); g.drawImage(img, -ww / 2, -hh / 2, ww, hh); }); }

// ---- çizim ----
export async function fontYukle() { const f = new FontFace('Montserrat Black', 'url(/fonts/Montserrat-Black.ttf)'); await f.load(); document.fonts.add(f); }
export function ciz(g, t, DUR) {
  let i = SAHNELER.findIndex((s, j) => t >= s.t && (j === SAHNELER.length - 1 || t < SAHNELER[j + 1].t)); if (i < 0) i = 0;
  const s = SAHNELER[i], e = i + 1 < SAHNELER.length ? SAHNELER[i + 1].t : DUR;
  zemin(g);
  const son = s && s.ogeler.length ? s.ogeler[s.ogeler.length - 1] : null, kay = son ? Math.max(0, (ALT - (son.y + son.h)) / 2) : 0;   // sahneyi dikeyde ortala
  if (s) for (const o of s.ogeler) { if (t < o.t) continue; const u = clamp((t - o.t) / .35), y = o.y + kay; g.save(); o.ciz(g, u, ortaX(y, o.h), y, t); g.restore(); }
  const a = Math.max(i > 0 ? 1 - (t - s.t) / .15 : 0, i + 1 < SAHNELER.length ? (t - (e - .15)) / .15 : 0);   // sahne geçişi: kısa açık perde
  if (a > 0) { g.save(); g.globalAlpha = clamp(a); g.fillStyle = RENK.zemin; g.fillRect(0, 0, W_, H_); g.restore(); }
  altyazi(g, t); gren(g);
}

// ALTYAZI: 4 kelimelik parçalar, söylenen kelime turuncu; Shorts'ta y≈1375 (buton sütununun solunda)
function altyazi(g, t) {
  let i = -1; for (let k = 0; k < KELIMELER.length; k++) if (KELIMELER[k].start <= t + .05) i = k; if (i < 0 || t > KELIMELER[KELIMELER.length - 1].end + .6) return;
  const p0 = Math.floor(i / 4) * 4, par = KELIMELER.slice(p0, p0 + 4); g.save(); g.font = `52px ${MONT}`; g.textBaseline = 'middle';
  const sp = 16, ws = par.map(w => g.measureText(w.word).width), tw = ws.reduce((a, b) => a + b, 0) + sp * (par.length - 1), k = Math.min(1, 760 / tw), cx = 475, y = 1375;
  g.translate(cx, y); g.scale(k, k); rr(g, -tw / 2 - 28, -48, tw + 56, 96, 22); g.fillStyle = 'rgba(251,249,244,.95)'; g.fill();
  let x = -tw / 2; par.forEach((w, j) => { g.fillStyle = p0 + j === i ? RENK.vurgu : p0 + j < i ? RENK.yazi : 'rgba(22,24,29,.35)'; g.textAlign = 'left'; g.fillText(w.word, x, 3); x += ws[j] + sp; }); g.restore();
}

// ---- yardımcılar ----
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = u => 1 - Math.pow(1 - u, 3);
const zipla = u => { const c = 1.6; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
const golge = g => { g.shadowColor = 'rgba(0,0,0,.16)'; g.shadowBlur = 26; g.shadowOffsetY = 10; };
function yazi(g, s, x, y, boy, renk, { font = MONT, max = 900, golge: gl = false } = {}) {
  const F = b => font.includes('px') ? font.replace(/\d+px/, b + 'px') : `${b}px ${font}`; g.font = F(boy); const w = g.measureText(s).width; if (w > max) g.font = F(boy * max / w);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = renk; if (gl) { g.shadowColor = 'rgba(255,90,31,.35)'; g.shadowBlur = 24; } g.fillText(s, x, y); g.shadowColor = 'transparent'; }
function satirla(g, s, boy, maxW) { g.font = `900 ${boy}px ${UI}`; const L = []; let c = ''; for (const w of s.split(/\s+/)) { const d = c ? c + ' ' + w : w; if (g.measureText(d).width > maxW && c) { L.push(c); c = w; } else c = d; } if (c) L.push(c); return L; }
function zemin(g) { const bg = g.createRadialGradient(540, 690, 0, 540, 690, 1440); bg.addColorStop(0, RENK.zemin); bg.addColorStop(1, RENK.zemin2); g.fillStyle = bg; g.fillRect(0, 0, W_, H_); }
let _gren = null;   // basılı kâğıt hissi: hafif gren (bir kez üretilir)
function gren(g) { if (!_gren) { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), d = x.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (Math.random() - .5) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); _gren = c; }
  g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = .18; g.fillStyle = g.createPattern(_gren, 'repeat'); g.fillRect(0, 0, W_, H_); g.restore(); }
