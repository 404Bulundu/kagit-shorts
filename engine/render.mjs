// render.mjs — videoyu kare kare çizer (tarayıcıda window.render(t)), kareleri ffmpeg'e verir, sesi ekler.
//   node engine/render.mjs <ad>              -> stories/<ad>/out/<ad>.mp4
//   node engine/render.mjs <ad> --resim=5    -> 5. saniyenin karesi: stories/<ad>/out/kare_5.png (kontrol için)
import puppeteer from 'puppeteer-core';
import fs from 'node:fs'; import path from 'node:path'; import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.mjs';
import { findChrome } from './chrome.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const ad = process.argv[2] || 'ornek';
const args = Object.fromEntries(process.argv.slice(3).map(a => a.replace(/^--/, '').split(/=(.*)/s)).map(([k, v]) => [k, v ?? '1']));
const SD = path.join(here, '..', 'stories', ad), OUT = path.join(SD, 'out'); fs.mkdirSync(OUT, { recursive: true });

const { server, port } = await startServer();
const browser = await puppeteer.launch({ executablePath: findChrome(), headless: 'new', protocolTimeout: 0, args: ['--hide-scrollbars', '--force-device-scale-factor=1'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('HATA', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('UYARI', m.text()); });
await page.setViewport({ width: 540, height: 960 });
await page.goto(`http://127.0.0.1:${port}/engine/index.html?story=${ad}&capture=1`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready, { timeout: 120000 });
const { DUR, FPS } = await page.evaluate(() => window.__meta);
const kare = async t => { const u = await page.evaluate(t => { window.render(t); return document.getElementById('out').toDataURL('image/png'); }, t); return Buffer.from(u.slice(u.indexOf(',') + 1), 'base64'); };

if (args.resim) {
  const f = path.join(OUT, `kare_${args.resim}.png`); fs.writeFileSync(f, await kare(+args.resim)); console.log('->', f);
} else {
  const N = Math.round(DUR * FPS), sessiz = path.join(OUT, '_sessiz.mp4'), son = path.join(OUT, ad + '.mp4');
  console.log(`${ad}: ${N} kare (${DUR.toFixed(1)} sn)`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', sessiz], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t1 = Date.now();
  for (let i = 0; i < N; i++) { const b = await kare(i / FPS); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 30 === 0) process.stdout.write(`kare ${i}/${N}  (%${Math.round(100 * i / N)})  ${((Date.now() - t1) / 1000).toFixed(0)} sn\r`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  const ses = fs.existsSync(path.join(SD, 'voice', 'voice.wav')) ? path.join(SD, 'voice', 'voice.wav') : null;
  if (ses) { execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', sessiz, '-i', ses, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', son]); fs.unlinkSync(sessiz); }
  else { fs.renameSync(sessiz, son); console.log('\n(ses yok: voice klasörüne mp3 koyarsan video sesli olur)'); }
  console.log(`\nkare ${N}/${N} (%100) -> ${son}`);
}
await browser.close(); server.close();
