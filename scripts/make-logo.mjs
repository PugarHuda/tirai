// Render the Tirai logo (480x480 PNG) with the installed Playwright — no new deps.
//   node scripts/make-logo.mjs                 # all variants -> media/logo-<name>.png
//   node scripts/make-logo.mjs curtain out.png # one variant to a chosen path
import { chromium } from 'playwright';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';

const HERE = dirname(fileURLToPath(import.meta.url));
const MEDIA = join(HERE, '..', 'media');

const BASE = `
  html,body{margin:0;padding:0;width:480px;height:480px;background:#0b0d10}
  .wrap{position:relative;width:480px;height:480px;display:grid;place-items:center;
        font-family:"Segoe UI",Inter,system-ui,sans-serif}
  .mono{font-family:"Consolas","SF Mono",monospace}
  .glow{position:absolute;width:360px;height:360px;border-radius:50%;
        background:radial-gradient(circle,rgba(110,231,183,.26) 0%,rgba(110,231,183,0) 68%)}
`;

const VARIANTS = {
  // 1. the letter behind the curtain, with the price redacted out of it
  curtain: `
    <style>
      .slats{position:absolute;inset:0;display:grid;grid-template-columns:repeat(8,1fr)}
      .slats i{background:linear-gradient(180deg,#111820,#0d1218);border-right:2px solid #0b0d10}
      .slats i:nth-child(2n){background:linear-gradient(180deg,#0f151c,#0b1016)}
      .mark{position:relative;width:300px;height:300px;display:grid;place-items:center;
            border:6px solid #6ee7b7;background:#0b0d10}
      .mark span{font-size:200px;font-weight:700;color:#6ee7b7;line-height:1;margin-top:-6px;
                 font-family:"Consolas","SF Mono",monospace}
      .bar{position:absolute;left:-26px;right:-26px;top:206px;height:40px;background:#0b0d10;padding:5px 0}
      .bar b{display:block;height:100%;background:#e5e7eb}
    </style>
    <div class="wrap">
      <div class="slats">${'<i></i>'.repeat(8)}</div>
      <div class="glow"></div>
      <div class="mark"><span>t</span><div class="bar"><b></b></div></div>
    </div>`,

  // 2. the curtain itself: slats parting, a "T" cut out of the gap as negative space
  parting: `
    <style>
      .stage{position:relative;width:340px;height:340px;background:#0f151c;overflow:hidden;
             border:3px solid #1e2833}
      .half{position:absolute;top:0;bottom:0;width:128px;
            background:repeating-linear-gradient(90deg,#131b24 0 14px,#0e141b 14px 28px)}
      .half.l{left:0}.half.r{right:0}
      .gap{position:absolute;left:128px;right:128px;top:0;bottom:0;
           background:linear-gradient(180deg,#6ee7b7,#2f9e77)}
      .cut{position:absolute;inset:0}
      .cut b{position:absolute;background:#0f151c}
      .t-stem{left:50%;transform:translateX(-50%);top:96px;bottom:64px;width:26px}
      .t-arm{left:50%;transform:translateX(-50%);top:96px;width:96px;height:26px}
      .edge{position:absolute;top:0;bottom:0;width:10px;
            background:linear-gradient(90deg,rgba(0,0,0,.55),rgba(0,0,0,0))}
    </style>
    <div class="wrap">
      <div class="glow"></div>
      <div class="stage">
        <div class="gap"></div>
        <div class="cut">
          <b class="t-arm"></b><b class="t-stem"></b>
        </div>
        <div class="half l"></div><div class="half r"></div>
        <div class="edge" style="left:128px"></div>
        <div class="edge" style="right:128px;transform:scaleX(-1)"></div>
      </div>
    </div>`,

  // 3. the redacted ticket: a price you are not allowed to read
  ticket: `
    <style>
      .card{position:relative;width:344px;height:250px;background:#f4f6f5;color:#0b0d10;
            padding:20px 22px 0;display:flex;flex-direction:column;gap:14px}
      .card .k{font-size:12.5px;letter-spacing:.22em;text-transform:uppercase;color:#5b6673}
      .card .inst{font-size:28px;font-weight:700;letter-spacing:-.01em;margin-top:2px}
      .row{display:flex;justify-content:space-between;align-items:center;margin-top:4px}
      .price{position:relative;font-size:31px;font-weight:700;
             font-family:"Consolas","SF Mono",monospace}
      .price em{position:absolute;left:52px;right:-6px;top:4px;height:31px;background:#0b0d10}
      .stamp{font-size:10.5px;letter-spacing:.14em;color:#b0342d;border:2px solid #b0342d;
             padding:3px 7px;transform:rotate(-4deg)}
      .wm{margin:auto -22px 0;padding:11px 0;background:#0b0d10;text-align:center;
          font-size:31px;font-weight:700;color:#fff;letter-spacing:-.02em}
      .wm i{color:#6ee7b7;font-style:normal}
    </style>
    <div class="wrap">
      <div class="glow"></div>
      <div class="card">
        <div><div class="k">RFQ · sealed quote</div>
             <div class="inst">TBOND30 · 1,000</div></div>
        <div class="row">
          <div class="price">4,2<em></em>10,000</div>
          <div class="stamp">PRIVATE</div>
        </div>
        <div class="wm">tirai<i>.</i></div>
      </div>
    </div>`,

  // 4. wordmark: the site's own lockup, square-cropped for an avatar
  wordmark: `
    <style>
      .lock{position:relative;text-align:center}
      .word{font-size:96px;font-weight:700;letter-spacing:-.03em;color:#fff;line-height:1}
      .word i{color:#6ee7b7;font-style:normal}
      .bar{margin:22px auto 0;width:210px;height:26px;background:#e5e7eb}
      .sub{margin-top:20px;font-size:13.5px;letter-spacing:.26em;text-transform:uppercase;
           color:#6b7785}
    </style>
    <div class="wrap">
      <div class="glow"></div>
      <div class="lock">
        <div class="word">tirai<i>.</i></div>
        <div class="bar"></div>
        <div class="sub">confidential otc</div>
      </div>
    </div>`,
};

const [name, outArg] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 480, height: 480 }, deviceScaleFactor: 1 });
await mkdir(MEDIA, { recursive: true });
for (const [key, markup] of Object.entries(VARIANTS)) {
  if (name && key !== name) continue;
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${BASE}</style></head><body>${markup}</body></html>`, { waitUntil: 'load' });
  const out = name && outArg ? outArg : join(MEDIA, `logo-${key}.png`);
  await page.screenshot({ path: out });
  console.log('wrote', out);
}
await browser.close();
