// Regenerate the Office Hours deck's screenshots from the real desk, and measure the
// box of everything the slides point at so the annotation overlays stay honest.
//
//   npm run demo          (a FRESH ledger — the seed carries exactly two auctions)
//   npm run deck:shots
//
// Writes deck/shots/*.png plus deck/shots/boxes.json (percentages of each shot).
//
// Order matters and is the whole reason this is a script rather than a click-through:
//   * the money shot is taken with Dealer B's suggested ask CLEARED — a number sitting
//     in an input reads, in a still frame with nobody narrating it, like a price B holds;
//   * the verifier is captured MID-auction, because after the award every count is zero
//     and "holds 0, rivals 0" is a much weaker sentence than "holds its own, rivals 0";
//   * both quotes are disclosed BY DEALER, not by clicking the first button twice —
//     doing that discloses one dealer to the regulator twice and the best-execution card
//     comes back "incomplete disclosure" with the same name on both rows;
//   * and disclosure happens BEFORE the award, which archives the quotes and takes the
//     disclose controls with them.
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const URL = process.env.TIRAI_URL ?? 'http://localhost:8080/app';
const A_ASK = '4210000', B_ASK = '4250000';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 });
const wait = (ms) => p.waitForTimeout(ms);
const view = async (v) => { await p.locator(`.side-nav a[data-view="${v}"]`).click(); await wait(1500); };
const shot = async (name, sel) => {
  await p.locator(sel).screenshot({ path: `deck/shots/${name}.png` });
  console.log('  ✓', name);
};

// Box of each target as a percentage of the shot's own box, so the deck can lay an
// overlay over the image at any size without knowing the pixel dimensions.
const boxes = (root, targets) => p.evaluate(([sel, targets]) => {
  const host = document.querySelector(sel);
  const r = host.getBoundingClientRect();
  const pct = (el) => {
    const x = el.getBoundingClientRect();
    return { l: +(((x.left - r.left) / r.width) * 100).toFixed(2),
             t: +(((x.top - r.top) / r.height) * 100).toFixed(2),
             w: +((x.width / r.width) * 100).toFixed(2),
             h: +((x.height / r.height) * 100).toFixed(2) };
  };
  const out = {};
  for (const [name, needle, up = 0] of targets) {
    // The innermost element that still contains the text, then walk up `up` levels
    // to reach the row/card that is actually worth drawing a box around.
    const hit = [...host.querySelectorAll('*')].filter((e) =>
      e.textContent.includes(needle) && [...e.children].every((c) => !c.textContent.includes(needle)));
    let el = hit[0];
    if (!el) { out[name] = null; continue; }
    for (let i = 0; i < up; i++) el = el.parentElement ?? el;
    out[name] = pct(el);
  }
  return out;
}, [root, targets]);

const out = {};
await p.goto(URL, { waitUntil: 'load' });
await wait(5000);

// ---- open the auction -----------------------------------------------------------
await view('create');
await p.click('.mode[data-mode="auction"]');
await p.fill('#c-instrument', 'TBOND30');
await p.fill('#c-qty', '1000');
await p.click('#c-submit');
await wait(2500);

// ---- dealer A seals; B has not answered yet: the money shot ---------------------
await view('desk');
await p.waitForSelector('input[id^="ask-dealerA-"]', { timeout: 20000 });
await p.fill('input[id^="ask-dealerA-"]', A_ASK);
await p.click('button[data-quote="dealerA"]');
await wait(3500);
// Clear B's suggested ask and shoot while the field still has focus: setHTML() skips
// the repaint whenever an input is focused, so blurring here hands the default number
// straight back within one 1.8s poll.
await p.fill('input[id^="ask-dealerB-"]', '');
await wait(250);
// Only the two dealer columns. Cropping the buyer away in CSS scales vertically as
// well as horizontally, and the measured boxes would then need remapping by hand —
// clip it here instead, so what the deck overlays matches what it shows.
const clip = await p.evaluate(() => {
  const a = document.querySelector('section.panel[data-role="dealerA"]').getBoundingClientRect();
  const b = document.querySelector('section.panel[data-role="dealerB"]').getBoundingClientRect();
  // Trim the empty tail: a dealer panel is as tall as the desk, and most of it is
  // whitespace once you drop the buyer's column of forms.
  const bottom = (root) => [...root.querySelectorAll('*')]
    .filter((e) => e.getBoundingClientRect().height > 0 && e.textContent.trim())
    .reduce((m, e) => Math.max(m, e.getBoundingClientRect().bottom), 0);
  const top = Math.min(a.top, b.top);
  const content = Math.max(bottom(document.querySelector('section.panel[data-role="dealerA"]')),
                           bottom(document.querySelector('section.panel[data-role="dealerB"]')));
  return { x: a.left, y: top, width: b.right - a.left,
           height: Math.min(Math.max(a.height, b.height), content - top + 28) };
});
await p.screenshot({ path: 'deck/shots/02-moneyshot.png', clip });
console.log('  ✓ 02-moneyshot');
out.moneyshot = await p.evaluate(([clip, ask]) => {
  const pct = (el) => { const x = el.getBoundingClientRect();
    return { l: +(((x.left - clip.x) / clip.width) * 100).toFixed(2),
             t: +(((x.top - clip.y) / clip.height) * 100).toFixed(2),
             w: +((x.width / clip.width) * 100).toFixed(2),
             h: +((x.height / clip.height) * 100).toFixed(2) }; };
  const find = (root, needle, up = 0) => {
    const hit = [...root.querySelectorAll('*')].filter((e) =>
      e.textContent.includes(needle) && [...e.children].every((c) => !c.textContent.includes(needle)));
    let el = hit[0]; if (!el) return null;
    for (let i = 0; i < up; i++) el = el.parentElement ?? el;
    return pct(el);
  };
  return {
    aQuote: find(document.querySelector('#body-dealerA'), ask, 1),
    bEmpty: find(document.querySelector('#body-dealerB'), 'never sent to your node', 1),
  };
}, [clip, A_ASK.replace(/\B(?=(\d{3})+(?!\d))/g, ',')]);

// The buyer's own column at the same moment: escrow, and the one-quote refusal.
await shot('08-escrow-guard', '#buyer-quotes');
out.escrow = await boxes('#buyer-quotes', [
  ['escrow', 'return escrow', 0],
  ['guard', 'no auction to run', 0],
]);

// ---- dealer B answers blind ------------------------------------------------------
await p.fill('input[id^="ask-dealerB-"]', B_ASK);
await p.click('button[data-quote="dealerB"]');
await p.waitForSelector('#btn-award:not([disabled])', { timeout: 20000 });
await wait(1200);

// ---- the verifier, while both quotes are still live ------------------------------
await view('verify');
await wait(3000);
// Only the verdict and the three node rows. The whole view also carries the
// transparent-chain comparison table, and at slide scale that makes every number
// on it unreadable — the slide is about the three counts.
const vclip = await p.evaluate(() => {
  const a = document.querySelector('.vf-verdict').getBoundingClientRect();
  const z = document.querySelector('.vf-note').getBoundingClientRect();
  return { x: a.left - 14, y: a.top - 14, width: Math.max(a.width, z.width) + 28,
           height: z.bottom - a.top + 28 };
});
await p.screenshot({ path: 'deck/shots/05-verify.png', clip: vclip });
console.log('  ✓ 05-verify');
out.verify = await p.evaluate((clip) => {
  const pct = (el) => { const x = el.getBoundingClientRect();
    return { l: +(((x.left - clip.x) / clip.width) * 100).toFixed(2),
             t: +(((x.top - clip.y) / clip.height) * 100).toFixed(2),
             w: +((x.width / clip.width) * 100).toFixed(2),
             h: +((x.height / clip.height) * 100).toFixed(2) }; };
  const rows = [...document.querySelectorAll('.vf-row')];
  return { dealerA: pct(rows[0]), dealerB: pct(rows[1]), regulator: pct(rows[2]) };
}, vclip);

// ---- disclose ONE PER DEALER, then award -----------------------------------------
await view('desk');
await wait(1200);
const cids = await p.$$eval('button[data-disclose]', (bs) => bs.map((x) => x.dataset.disclose));
if (cids.length < 2) throw new Error(`expected 2 disclosable quotes, saw ${cids.length}`);
for (const cid of cids) {
  await p.locator(`button[data-disclose="${cid}"]`).click({ force: true });
  await wait(2400);
}
await p.click('#btn-award');
await wait(5000);

await view('bestexec');
await wait(2500);
const be = await p.locator('#view-bestexec').innerText();
if (/incomplete disclosure|below clearing/.test(be)) {
  throw new Error('best-execution card is not clean — the two disclosures did not land on different dealers');
}
await shot('06-bestexec', '#bestexec-body');
out.bestexec = await boxes('#bestexec-body', [
  ['verdict', 'best execution attested', 0],
  ['winnerRow', 'winner', 3],
]);

await view('panel');
await wait(2500);
await shot('07-panel', '#panel-body');
out.panel = await boxes('#panel-body', [
  ['loserRow', 'DealerB', 2],
  ['note', 'never the ask itself', 0],
]);

writeFileSync('deck/shots/boxes.json', JSON.stringify(out, null, 2) + '\n');
console.log('\n' + JSON.stringify(out, null, 2));
await b.close();
