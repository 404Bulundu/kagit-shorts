// ffmpeg.mjs — ffmpeg'in yolu. Elle kurmana gerek yok: `npm install` ffmpeg'i de indirir (@ffmpeg-installer/ffmpeg).
// Sırası: FFMPEG_PATH (kendin verirsen) → npm ile gelen ffmpeg → bilgisayarda kurulu ffmpeg (PATH).
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);

function bul() {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  try { const p = require('@ffmpeg-installer/ffmpeg').path; if (p && fs.existsSync(p)) return p; } catch (e) { /* paket yoksa PATH'tekini dene */ }
  return 'ffmpeg';
}
export const FFMPEG = bul();
