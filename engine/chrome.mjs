// chrome.mjs — videoyu çizecek tarayıcıyı bulur: önce CHROME_PATH, sonra Chrome, sonra Edge (her Windows'ta vardır).
import fs from 'node:fs';
import path from 'node:path';

export function tarayicilar() {
  const local = process.env.LOCALAPPDATA;
  return [
    process.env.CHROME_PATH,
    // Windows: Chrome
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    local && path.join(local, 'Google/Chrome/Application/chrome.exe'),
    // Windows: Edge (varsayılan olarak kurulu)
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    // Linux
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium', '/usr/bin/microsoft-edge',
  ].filter(Boolean);
}

export function findChrome({ cik = true } = {}) {
  if (process.env.CHROME_PATH && !fs.existsSync(process.env.CHROME_PATH)) {
    console.error(`✗ CHROME_PATH ile verdiğin tarayıcı yok: ${process.env.CHROME_PATH}`);
    if (cik) process.exit(1); return null;
  }
  const hit = tarayicilar().find(p => fs.existsSync(p));
  if (!hit) {
    console.error('✗ Chrome ya da Edge bulunamadı. Birini kur (https://www.google.com/chrome) ya da yolunu ver:\n' +
      '    Windows (PowerShell):  $env:CHROME_PATH="C:\\...\\msedge.exe"\n' +
      '    macOS / Linux:         export CHROME_PATH="/yol/chrome"');
    if (cik) process.exit(1); return null;
  }
  return hit;
}
