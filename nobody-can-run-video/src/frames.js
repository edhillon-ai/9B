// node frames.js out_dir f1 f2 ... | or  node frames.js out_dir --range a b
const { chromium } = require('playwright');
(async () => {
  const [out, ...rest] = process.argv.slice(2);
  let list = rest; if (rest[0] === '--range') { list = []; for (let f = +rest[1]; f < +rest[2]; f++) list.push(f); }
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('console', m => { if (!/GL Driver/.test(m.text())) console.log('PAGE:', m.text()); });
  p.on('pageerror', e => console.log('ERR:', e.message));
  await p.goto('http://localhost:8770/film.html');
  await p.waitForFunction('window.ready', null, { timeout: 120000 });
  const t0 = Date.now();
  for (const f of list) {
    await p.evaluate(f => window.renderFrame(+f), f);
    await p.screenshot({ path: `${out}/f${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 });
  }
  console.log('done', list.length, 'frames', ((Date.now() - t0) / list.length).toFixed(0), 'ms/frame');
  await b.close();
})();
