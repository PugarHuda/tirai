// Capture the images that go with a social post, from the LIVE hosted desk —
// nothing staged, nothing mocked. Writes into media/.
//   node scripts/make-social.mjs            (hosted)
//   TIRAI_BASE=http://localhost:8090 node scripts/make-social.mjs
import { chromium } from 'playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BASE = (process.env.TIRAI_BASE ?? 'https://tirai.vercel.app').replace(/\/$/, '');
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'media');
await mkdir(OUT, { recursive: true });

const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1600, height: 980 }, deviceScaleFactor: 2 });
const settle = async (ms = 6000) => page.waitForTimeout(ms);
const view = async (v) => { await page.click(`.side-nav a[data-view="${v}"]`).catch(() => {}); await settle(2600); };
const sign = async (role) => { await page.selectOption('#acting-as', role); await settle(3500); };
const shot = async (name, opts = {}) => {
  const path = join(OUT, `x-${name}.png`);
  await page.screenshot({ path, ...opts });
  console.log('·', path);
};

await page.goto(BASE + '/app', { waitUntil: 'networkidle' });
await settle();

// 1 · the book, as the buy side sees it
await view('rfqs');
await shot('1-book');

// 2 · ONE request, in both dealers' own sessions. Showing each dealer's whole book
// proves nothing — both are full of prices. Filtering to a single instrument that
// A has quoted and B has not is the only framing where the claim is legible.
const INSTRUMENT = process.env.SOCIAL_INSTRUMENT ?? 'UST10Y';
const oneRow = async (role) => {
  await sign(role);
  await page.fill('#rfq-search', INSTRUMENT);
  await page.waitForTimeout(1200);
  // Crop to the header and the single row: a tall panel around one line of data
  // is mostly empty space, and empty space is what people scroll past.
  const box = await page.locator('.audit-view#view-rfqs').boundingBox();
  return (await page.screenshot({ clip: { x: box.x, y: box.y, width: box.width, height: 250 } })).toString('base64');
};
const dealerA = await oneRow('dealerA');
const dealerB = await oneRow('dealerB');
await page.fill('#rfq-search', '');

// 3 · the privacy verifier and the contrast panel
await sign('buyer');
await view('verify');
await shot('3-verify', { fullPage: true });

// 4 · balances in an asset issued by a registry this app does not control
await view('portfolio');
await shot('4-registry');

// 5 · best execution without a public order book
await view('bestexec');
await shot('5-bestexec');

// Compose the two dealer sessions into one frame, captioned. Same trick the deck
// renderer uses: lay it out in the browser and screenshot it.
const compose = await b.newPage({ viewport: { width: 1640, height: 700 }, deviceScaleFactor: 2 });
await compose.setContent(`
<style>
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;800&display=swap');
  body { margin:0; background:#0e1116; font-family:Manrope,system-ui,sans-serif; }
  .wrap { display:grid; grid-template-columns:1fr 1fr; gap:18px; padding:22px 22px 10px; }
  figure { margin:0; }
  figcaption { color:#e7ecf2; font-size:19px; font-weight:800; padding:0 0 10px 2px; letter-spacing:-.01em; }
  figcaption span { color:#6ee7b7; }
  img { width:100%; border:1px solid #3a4553; display:block; }
  .foot { color:#8b97a6; font-size:17px; font-weight:600; padding:6px 24px 22px; line-height:1.5; }
</style>
<div class="wrap">
  <figure><figcaption>Dealer A's session — <span>its own sealed ask</span></figcaption>
    <img src="data:image/png;base64,${dealerA}" /></figure>
  <figure><figcaption>Dealer B's session — <span>the number is not there</span></figcaption>
    <img src="data:image/png;base64,${dealerB}" /></figure>
</div>
<div class="foot">One request, the same ledger, the same moment — in each dealer's own session.
Dealer B is not being shown a redacted view: its participant node never received the quote contract at all.</div>
`);
await compose.waitForTimeout(2500);
// Clip to the content, so the image is not mostly empty background.
const box = await compose.evaluate(() => {
  const f = document.querySelector('.foot');
  return { height: Math.ceil(f.getBoundingClientRect().bottom) };
});
await compose.screenshot({ path: join(OUT, 'x-2-privacy.png'), clip: { x: 0, y: 0, width: 1640, height: box.height } });
console.log('·', join(OUT, 'x-2-privacy.png'));

await b.close();
