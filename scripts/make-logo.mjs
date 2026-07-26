// Render the Tirai logo (480x480 PNG) with the installed Playwright — no new deps.
import { chromium } from 'playwright';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';

const OUT = process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), 'tirai-logo.png');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;padding:0;width:480px;height:480px;background:#0b0d10}
  .wrap{position:relative;width:480px;height:480px;display:grid;place-items:center;
        font-family:"Consolas","SF Mono",monospace}
  /* the curtain: slats that hide what is behind them */
  .slats{position:absolute;inset:0;display:grid;grid-template-columns:repeat(8,1fr)}
  .slats i{background:linear-gradient(180deg,#111820 0%,#0d1218 100%);border-right:2px solid #0b0d10}
  .slats i:nth-child(2n){background:linear-gradient(180deg,#0f151c 0%,#0b1016 100%)}
  .glow{position:absolute;width:340px;height:340px;border-radius:50%;
        background:radial-gradient(circle,rgba(110,231,183,.28) 0%,rgba(110,231,183,0) 68%)}
  .mark{position:relative;width:300px;height:300px;display:grid;place-items:center;
        border:6px solid #6ee7b7;background:#0b0d10}
  .mark span{font-size:200px;font-weight:700;color:#6ee7b7;line-height:1;margin-top:-6px}
  /* the redaction bar: the price you never get to read */
  .bar{position:absolute;left:-26px;right:-26px;top:206px;height:40px;background:#0b0d10;padding:5px 0}
  .bar b{display:block;height:100%;background:#e5e7eb}
</style></head><body><div class="wrap">
  <div class="slats">${'<i></i>'.repeat(8)}</div>
  <div class="glow"></div>
  <div class="mark"><span>t</span><div class="bar"><b></b></div></div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 480, height: 480 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await mkdir(dirname(OUT), { recursive: true });
await page.screenshot({ path: OUT });
await browser.close();
console.log('wrote', OUT);
