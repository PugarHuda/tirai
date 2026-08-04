// The product path: sign in as one identity at a time and drive the desk the way
// a dealer or a buy-side trader would — the book, a dialog, and an identity switch.
// The privacy claim is checked from the rival's own session, not from a column.
//
//   npm run demo   (a FRESH ledger — a dealer can only quote a lot it still holds)
//   npm run e2e:shell
import { chromium } from 'playwright';
const URL = process.env.TIRAI_URL ?? 'http://localhost:8080/app';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 950 } });
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 160)));
// Which participant node each ACS read is actually addressed to — the pitch's
// central claim is checkable in the network tab, so check it here.
const reads = [];
p.on('request', (r) => {
  if (!/active-contracts/.test(r.url())) return;
  const party = Object.keys(JSON.parse(r.postData() ?? '{}').filter?.filtersByParty ?? {})[0] ?? '?';
  reads.push(party.split('::')[0]);
});
let pass = 0, total = 0;
const say = (n, ok, d = '') => { total++; if (ok) pass++; console.log(`${ok ? '  ok  ' : '  FAIL'} ${n}${d ? ' — ' + d : ''}`); };
const acting = async (role) => { await p.selectOption('#acting-as', role); await p.waitForTimeout(1500); };

await p.goto(URL, { waitUntil: 'load' });
await p.waitForTimeout(5000);

say('home is the book, not the three columns', await p.locator('#view-rfqs').isVisible() && !(await p.locator('.desk').isVisible()));
say('identity chip shows the party', /buyer/i.test(await p.locator('#ident-pid').innerText()));
say('balance renders', (await p.locator('#ident-balance').innerText()).length > 2, await p.locator('#ident-balance').innerText());

// Buyer opens a request from the product path.
await p.click('#btn-new-rfq');
await p.waitForTimeout(900);
say('create page opens with two modes', (await p.locator('#create-modes .mode').count()) === 2);
await p.click('.mode[data-mode="auction"]');
await p.fill('#c-instrument', 'TBOND30');
await p.fill('#c-qty', '1000');
await p.click('#c-submit');
await p.waitForTimeout(3500);
say('submitting returns to the book', await p.locator('#view-rfqs').isVisible());
const rows = await p.locator('.rfq-table tbody tr').count();
say('the request is listed', rows >= 1, `${rows} rows`);

// Switch identity: the dealer sees the request addressed to it, and can quote.
await acting('dealerA');
say('dealer sees the request', (await p.locator('.rfq-table tbody tr').count()) >= 1);
const quoteBtn = p.locator('.rfq-act[data-act="quote"]').first();
say('dealer is offered a Quote action', await quoteBtn.count() > 0);
await quoteBtn.click();
await p.waitForTimeout(800);
say('quote dialog opens', await p.locator('#modal-host').isVisible());
await p.fill('#modal-ask', '4210000');
await p.click('#modal-submit');
await p.waitForTimeout(3500);
say('dialog closes after sealing', !(await p.locator('#modal-host').isVisible()));

// The rival: same ledger, no sight of A's number.
await acting('dealerB');
const bText = await p.locator('#view-rfqs').innerText();
say('rival dealer never sees the other ask', !bText.includes('4,210,000') && !bText.includes('4210000'));

// Buyer again: the quote arrived, and settling is offered.
await acting('buyer');
const settle = await p.locator('.rfq-act[data-act="settle"]').count();
say('buyer is offered Settle once a quote lands', settle >= 1, `${settle} settleable`);

await p.click('.side-nav a[data-view="activity"]');
await p.waitForTimeout(700);
say('activity log recorded the session', (await p.locator('#activity-body').innerText()).includes('Opened a request'));

// --- the audit's findings, so they cannot come back quietly -----------------
console.log('  · regression checks from the front-end audit');
await p.click('.side-nav a[data-view="rfqs"]'); await p.waitForTimeout(1500);
reads.length = 0; await p.waitForTimeout(4000);
const partiesRead = [...new Set(reads)];
say('the home view reads only the signed-in node', partiesRead.every((x) => /buyer/i.test(x)), partiesRead.join(', '));

await p.locator('.rfq-chip[data-filter="mine"]').click(); await p.waitForTimeout(500);
await acting('dealerA');
say('a filter does not survive an identity switch', /All/i.test(await p.locator('.rfq-chip.on').innerText()));
say('the tiles follow the identity', /Requests to you/i.test(await p.locator('#lab-rfqs').innerText()));
say('the active filter is not colour-only', (await p.locator('.rfq-chip.on').getAttribute('aria-pressed')) === 'true');
say('rows are reachable from the keyboard', (await p.locator('.rfq-table tbody tr').first().getAttribute('tabindex')) === '0');

await p.locator('.rfq-chip[data-filter="mine"]').focus();
await p.waitForTimeout(4200); // two polls
say('the poll does not steal keyboard focus', /rfq-chip/.test(await p.evaluate(() => document.activeElement?.className ?? '')));

const opener = p.locator('.rfq-act').first();
await opener.click(); await p.waitForTimeout(900);
// Focus must move into the dialog. A body control wins; the close button is the
// correct fallback for a dialog that only reports something.
say('focus moves into the dialog', await p.evaluate(() => {
  const host = document.getElementById('modal-host');
  const a = document.activeElement;
  const bodyFirst = document.querySelector('#modal-body input, #modal-body select, #modal-body button');
  return !!host?.contains(a) && (bodyFirst ? a === bodyFirst : a?.id === 'modal-x');
}));
await p.keyboard.press('Escape'); await p.waitForTimeout(600);
say('closing returns focus to the row it came from',
  /rfq-act/.test(await p.evaluate(() => document.activeElement?.className ?? '')));

await p.click('.side-nav a[data-view="portfolio"]'); await p.waitForTimeout(2500);
const pf = await p.locator('#portfolio-body').innerText();
say('the portfolio shows one identity only', (pf.match(/— you/g) ?? []).length === 1, pf.split(/\r?\n/)[0]);

say('no page errors', errs.length === 0, errs[0] ?? '');
await b.close();
console.log(`
════ SHELL: ${pass}/${total} passed ════`);
process.exit(pass === total ? 0 : 1);
