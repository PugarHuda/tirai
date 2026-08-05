// Record the desk being driven for real: a screen capture of the product, with a
// cursor, at human speed. Not a slideshow of screenshots.
//
// The flow is the pitch's flow. Open a request, sign in as the dealer that was
// invited, seal a quote, sign in as its rival and watch the number not be there,
// come back and settle. Then the two proof views.
//
//   npm run demo                      (a FRESH ledger; PORT=8090 if 8080 is taken)
//   TIRAI_URL=http://localhost:8090/app npm run record:desk
import { chromium } from 'playwright';
import { readdir, rename, rm, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const URL = process.env.TIRAI_URL ?? 'http://localhost:8080/app';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'media', '.capture');
const OUT = join(ROOT, 'media', 'tirai-live-capture.mp4');

await rm(RAW, { recursive: true, force: true });
await mkdir(RAW, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1,
  recordVideo: { dir: RAW, size: { width: 1600, height: 900 } },
});
const p = await ctx.newPage();

// A visible cursor, so the recording reads as somebody using the thing. Playwright
// does not render one, and a demo where controls change with no pointer looks fake.
const CURSOR = `
  <div id="cursor" style="position:fixed;z-index:99999;width:22px;height:22px;margin:-11px 0 0 -11px;
    border-radius:50%;background:rgba(14,159,110,.22);border:2px solid #0e9f6e;pointer-events:none;
    transition:transform .18s ease-out;left:0;top:0"></div>`;
await p.addInitScript(`
  window.__cursor = () => {
    if (document.getElementById('cursor')) return;
    document.body.insertAdjacentHTML('beforeend', ${JSON.stringify(CURSOR)});
  };
  document.addEventListener('DOMContentLoaded', () => window.__cursor());
`);

const at = async (sel) => {
  const box = await p.locator(sel).first().boundingBox();
  if (!box) return null;
  return { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2) };
};
// Move the pointer the way a hand does: to the control, a beat, then the click.
const point = async (sel) => {
  const c = await at(sel);
  if (!c) return;
  await p.evaluate(({ x, y }) => {
    const el = document.getElementById('cursor');
    if (el) el.style.transform = `translate(${x}px, ${y}px)`;
  }, c);
  await p.mouse.move(c.x, c.y, { steps: 18 });
  await p.waitForTimeout(420);
};
const click = async (sel) => { await point(sel); await p.locator(sel).first().click(); await p.waitForTimeout(700); };
const type = async (sel, text) => {
  await point(sel);
  await p.locator(sel).first().fill('');
  await p.locator(sel).first().type(text, { delay: 55 });
  await p.waitForTimeout(300);
};
const beat = (ms = 1200) => p.waitForTimeout(ms);
const sign = async (role) => { await point('#acting-as'); await p.selectOption('#acting-as', role); await beat(2200); };

await p.goto(URL, { waitUntil: 'load' });
await p.waitForFunction(() => /\d/.test(document.getElementById('stat-offset')?.textContent ?? ''), null, { timeout: 60000 });
await p.evaluate(() => window.__cursor?.());
await beat(1800);

// 1 · the book, as the buy side
await beat(1400);

// 2 · open a request
await click('#btn-new-rfq');
await type('#c-instrument', 'TBOND30');
await type('#c-qty', '1000');
await click('#c-submit');
await beat(2600);

// 3 · the invited dealer answers
await sign('dealerA');
await click('.rfq-act[data-act="quote"]');
await beat(900);
await type('#modal-ask', '4210000');
await click('#modal-submit');
await beat(2600);

// 4 · the rival's own session: the request is there, the number is not
await sign('dealerB');
await beat(2600);

// 5 · back to the buy side, now settleable
await sign('buyer');
await beat(2200);

// 6 · the proof views
await click('.side-nav a[data-view="verify"]');
await beat(4200);
await click('.side-nav a[data-view="rails"]');
await beat(3600);
await click('.side-nav a[data-view="rfqs"]');
await beat(1600);

await ctx.close();          // flushes the video file
await browser.close();

const file = (await readdir(RAW)).find((f) => f.endsWith('.webm'));
if (!file) { console.error('no capture was written'); process.exit(1); }
const webm = join(RAW, file);
try {
  execFileSync('ffmpeg', ['-y', '-i', webm, '-c:v', 'libx264', '-crf', '20', '-preset', 'slow',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT], { stdio: ['ignore', 'ignore', 'pipe'] });
  await rm(RAW, { recursive: true, force: true });
  console.log('wrote', OUT);
} catch {
  await rename(webm, OUT.replace(/\.mp4$/, '.webm'));
  console.log('ffmpeg not available; kept the webm at', OUT.replace(/\.mp4$/, '.webm'));
}
