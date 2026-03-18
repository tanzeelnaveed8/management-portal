import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.join(__dirname, '..', 'app', 'api');

function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name === 'route.js') {
      let s = fs.readFileSync(p, 'utf8');
      if (/export const runtime\s*=\s*['"]nodejs['"]/.test(s)) continue;
      fs.writeFileSync(p, "export const runtime = 'nodejs';\n\n" + s);
    }
  }
}

walk(apiDir);
console.log('Added runtime=nodejs to API routes where missing.');
