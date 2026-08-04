// Render the Grand Final deck to a landscape PDF, one page per slide.
// Same approach as scripts/make-pdf.mjs: the Playwright that is already a dev
// dependency, no extra tooling.
//   node deck/render.mjs
//
// The page box is 1280x720 rather than A4 landscape because the deck is 16:9;
// deck/index.html pins its print root font-size to that box, so the PDF is
// proportionally identical to what the browser shows at 1920x1080.
import { chromium } from 'playwright';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, 'index.html');
const OUT = join(HERE, 'tirai-deck.pdf');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
// networkidle so the Google Fonts stylesheet lands; fonts.ready so the glyphs
// are actually rasterised before the print snapshot.
await page.goto(pathToFileURL(SRC).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: OUT, width: '1280px', height: '720px', printBackground: true });
await browser.close();
console.log('wrote', OUT);
