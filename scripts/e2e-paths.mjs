// Happy path and wrong path, driven through the product surface.
//
// The other suites prove the desk works. This one proves it refuses: bad input,
// an action the signed-in identity is not entitled to, a second quote from the
// same dealer, a filter that hides everything. A refusal that is silent, or that
// looks like success, is the failure this suite exists to catch.
//
//   npm run demo            (a FRESH ledger; PORT=8090 if something owns 8080)
//   npm run e2e:paths
import { chromium } from 'playwright';

const URL = process.env.TIRAI_URL ?? 'http://localhost:8080/app';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 950 } });

const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 160)));
// Every command the page actually submits, so a "rejected" path can be proven to
// have submitted nothing rather than merely to have looked rejected.
let submits = 0;
p.on('request', (r) => { if (/\/v2\/commands\//.test(r.url())) submits++; });

let pass = 0, total = 0;
const say = (n, ok, d = '') => { total++; if (ok) pass++; console.log(`${ok ? '  ok  ' : '  FAIL'} ${n}${d ? ' — ' + d : ''}`); };
const wait = (ms) => p.waitForTimeout(ms);
const acting = async (role) => { await p.selectOption('#acting-as', role); await wait(1800); };
const view = async (v) => { await p.click(`.side-nav a[data-view="${v}"]`); await wait(900); };
const toast = async () => (await p.locator('.toast').innerText().catch(() => '')).trim();
const rows = () => p.locator('.rfq-table tbody tr').count();

await p.goto(URL, { waitUntil: 'load' });
await p.waitForFunction(() => /\d/.test(document.getElementById('stat-offset')?.textContent ?? ''), null, { timeout: 60000 });
await wait(1500);

// ── wrong path · input validation ────────────────────────────────────────────
console.log('\n── Wrong path · input the desk must refuse ──');
await view('create');
const tryCreate = async (instrument, qty) => {
  await p.fill('#c-instrument', instrument);
  await p.fill('#c-qty', qty);
  const before = submits;
  await p.click('#c-submit');
  await wait(1200);
  return { sent: submits - before, toast: await toast() };
};

let r = await tryCreate('TBOND30', '0');
say('a zero quantity is refused, and nothing is submitted', r.sent === 0 && /positive/i.test(r.toast), `${r.sent} submitted · "${r.toast.slice(0, 40)}"`);

r = await tryCreate('TBOND30', '-5');
say('a negative quantity is refused', r.sent === 0 && /positive/i.test(r.toast), `${r.sent} submitted`);

r = await tryCreate('', '100');
say('an empty instrument is refused', r.sent === 0 && /required/i.test(r.toast), `${r.sent} submitted · "${r.toast.slice(0, 40)}"`);

// ── happy path · a request, a sealed quote, a settlement offer ───────────────
console.log('── Happy path · open, quote, and the buyer is offered settlement ──');
await p.fill('#c-instrument', 'TBOND30');
await p.fill('#c-qty', '1000');
await p.click('#c-submit');
await wait(3000);
say('a valid request lands and returns to the book', await p.locator('#view-rfqs').isVisible() && (await rows()) >= 1);

await acting('dealerA');
const quote = p.locator('.rfq-act[data-act="quote"]').first();
say('the invited dealer is offered a quote', (await quote.count()) === 1);
await quote.click();
await wait(900);

// ── wrong path · a quote the model would reject ──────────────────────────────
console.log('── Wrong path · a quote the desk must refuse ──');
await p.fill('#modal-ask', '0');
let before = submits;
await p.click('#modal-submit');
await wait(1200);
say('an ask of zero never reaches the ledger', submits - before === 0 && /positive/i.test(await toast()), `${submits - before} submitted`);
say('the dialog stays open after a refusal', await p.locator('#modal-host').isVisible());

await p.fill('#modal-ask', '4210000');
await p.click('#modal-submit');
await wait(3000);
say('a valid ask is sealed and the dialog closes', !(await p.locator('#modal-host').isVisible()));

// One quote per dealer: the model enforces it, the UI must not offer a second.
say('the same dealer is not offered a second quote', (await p.locator('.rfq-act[data-act="quote"]').count()) === 0);
say('its own row now reads as sealed', (await p.locator('.rfq-act', { hasText: 'Sealed' }).count()) >= 1);

// ── wrong path · entitlement ─────────────────────────────────────────────────
console.log('── Wrong path · actions this identity is not entitled to ──');
await acting('dealerB');
const bText = await p.locator('#view-rfqs').innerText();
say('the rival dealer cannot see the ask', !bText.includes('4,210,000') && !bText.includes('4210000'));
say('the rival is not offered anything to settle', (await p.locator('.rfq-act[data-act="settle"]').count()) === 0);

await acting('regulator');
const regActs = await p.locator('.rfq-act[data-act="quote"], .rfq-act[data-act="settle"], .rfq-act[data-act="cancel"]').count();
say('the regulator is offered no write action at all', regActs === 0, `${regActs} write actions`);
const newRfqHidden = await p.locator('#btn-new-rfq').isHidden();
say('only the buy side is offered New RFQ', newRfqHidden);

// ── wrong path · filters and search that find nothing ────────────────────────
console.log('── Wrong path · a filter that hides everything ──');
await acting('buyer');
await p.fill('#rfq-search', 'NOSUCHBOND');
await wait(700);
say('a search with no match says so', (await p.locator('.audit-empty').innerText()).includes('No request matches'), `${await rows()} rows`);
await p.fill('#rfq-search', '');
await wait(700);
say('clearing the search restores the book', (await rows()) >= 1);

await p.locator('.rfq-chip[data-filter="forme"]').click();
await wait(600);
say('"For me" is empty for the buy side', (await rows()) === 0);
await p.locator('.rfq-chip[data-filter="all"]').click();
await wait(600);

// ── happy path · the settlement is offered where it should be ────────────────
console.log('── Happy path · settlement offered to the party entitled to it ──');
const settle = await p.locator('.rfq-act[data-act="settle"]').count();
say('the buyer is offered settlement once a quote lands', settle >= 1, `${settle} settleable`);

// ── wrong path · a dialog on a request with no quotes ────────────────────────
await p.click('#btn-new-rfq');
await wait(700);
await p.fill('#c-instrument', 'GILT10');
await p.fill('#c-qty', '100');
await p.click('#c-submit');
await wait(3000);
const gilt = p.locator('.rfq-table tbody tr', { hasText: 'GILT10' }).first();
const giltAction = await gilt.locator('.rfq-act').innerText();
say('an unquoted request offers cancel, not settle', /cancel/i.test(giltAction), giltAction);

await gilt.locator('.rfq-act').click();
await wait(800);
say('cancelling opens a confirmation rather than acting immediately', await p.locator('#modal-host').isVisible() && (await p.locator('#modal-cancel').count()) === 1);
before = submits;
await p.keyboard.press('Escape');
await wait(600);
say('escaping the confirmation submits nothing', submits - before === 0 && !(await p.locator('#modal-host').isVisible()));

say('no uncaught page errors across the whole run', errs.length === 0, errs[0] ?? '');

await b.close();
console.log(`\n════ PATHS: ${pass}/${total} passed ════`);
process.exit(pass === total ? 0 : 1);
