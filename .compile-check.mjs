import { transform } from '@astrojs/compiler';
import fs from 'node:fs';
for (const f of ['src/pages/index.astro','src/layouts/HomeLayout.astro']) {
  const r = await transform(fs.readFileSync(f,'utf8'), { filename: f });
  console.log(f, 'diagnostics:', JSON.stringify(r.diagnostics.map(d=>[d.severity,d.text])));
}
