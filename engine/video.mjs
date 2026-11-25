// video.mjs — TEK KOMUT: kelime zamanlarını bulur, sonra videoyu çizer.
//   npm run video -- <ad>        (ad verilmezse: ornek)   →  stories/<ad>/out/<ad>.mp4
import { execFileSync } from 'node:child_process'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const E = path.dirname(fileURLToPath(import.meta.url)), ad = process.argv[2] || 'ornek';
for (const f of ['kelime.mjs', 'render.mjs']) execFileSync(process.execPath, [path.join(E, f), ad], { stdio: 'inherit' });
