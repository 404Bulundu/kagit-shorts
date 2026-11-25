// main.js — hikâyeyi yükler; window.render(t) her kareyi çizer (render.mjs kare kare yakalar). Tarayıcıda açılırsa önizleme oynatır.
// URL: /engine/index.html?story=ornek
import * as kit from './kit.js';
const q = new URLSearchParams(location.search), STORY = q.get('story') || 'ornek', base = `/stories/${STORY}/`;
const out = document.getElementById('out'); out.width = kit.W_; out.height = kit.H_; const g = out.getContext('2d');

await kit.fontYukle();
const words = (await (await fetch(base + 'voice/words.json')).json()).words;
kit._kur(words);
const story = await import(base + 'story.js'); story.default();
const DUR = Math.ceil((words[words.length - 1].end + 2) * 30) / 30;   // son kelimeden sonra 2 sn
await new Promise(r => setTimeout(r, 300));                         // resimler yüklensin

window.render = t => { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; kit.ciz(g, t, DUR); };
window.__meta = { DUR, FPS: 30, NAME: STORY };
window.__ready = true;
if (!q.has('capture')) { const t0 = performance.now(); const loop = () => { window.render(((performance.now() - t0) / 1000) % DUR); requestAnimationFrame(loop); }; loop(); }
