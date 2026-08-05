// The desk's own cut, end to end through the product surface.
//
// The model tests prove the arithmetic. This proves the desk SHOWS it: the audit
// trail names the fee on the trade that paid one and a dash on the trades that
// did not, the revenue line adds up to the ledger, and the New RFQ form refuses
// a rate the model would reject before anything is submitted.
//
//   cd web && LEDGER_ENV_FILE=../scripts/.env.devnet PORT=8091 node server.mjs
//   TIRAI_URL=http://localhost:8091/app node scripts/e2e-fee.mjs
import { chromium } from 'playwright';

const URL = process.env.TIRAI_URL ?? 'http://localhost:8091/app';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 950 } });

const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 160)));
let submits = 0;
p.on('request', (r) => { if (/\/v2\/commands\//.test(r.url())) submits++; });

let pass = 0, total = 0;
const say = (n, ok, d = '') => { total++; if (ok) pass++; console.log(`${ok ? '  ok  ' : '  FAIL'} ${n}${d ? ' — ' + d : ''}`); };
const wait = (ms) => p.waitForTimeout(ms);
const view = async (v) => { await p.click(`.side-nav a[data-view="${v}"]`); await wait(1200); };
const toast = async () => (await p.locator('.toast').innerText().catch(() => '')).trim();

await p.goto(URL, { waitUntil: 'load' });
await p.waitForFunction(() => /\d/.test(document.getElementById('stat-offset')?.textContent ?? ''), null, { timeout: 60000 });
await wait(2500);

// ── the audit trail states the fee ───────────────────────────────────────────
console.log('\n── Audit trail · what the desk took ──');
await view('audit');
const head = await p.locator('#audit-table table.audit thead').first().innerText();
say('the settled-trades table has a Desk fee column', /desk fee/i.test(head), head.replace(/\s+/g, ' '));

const feeRow = p.locator('#audit-table tbody tr', { hasText: 'TBOND30-FEE' }).first();
say('the fee-charged trade is in the trail', (await feeRow.count()) === 1);
const cells = (await feeRow.innerText()).split('\t').map((s) => s.trim());
say('its row names the fee that moved', cells.some((c) => Number(c.replace(/,/g, '')) === 10625),
  cells.join(' | '));
say('its clearing price is the second price, not the winning ask', cells.some((c) => /4,250,000/.test(c)), cells.join(' | '));

// A trade settled before the desk charged anything must read as a dash, not a zero
// and not a blank: "free" and "not recorded" are different claims.
const rows = await p.locator('#audit-table tbody tr').all();
let dashes = 0;
for (const r of rows.slice(0, 12)) {
  const t = (await r.innerText());
  if (/—/.test(t)) dashes++;
}
say('older trades read as a dash rather than a zero', dashes >= 1, `${dashes} of ${Math.min(rows.length, 12)} sampled`);

const revenue = await p.locator('#audit-table .sub').first().innerText().catch(() => '');
say('a revenue line totals the fees', /desk revenue/i.test(revenue), revenue.slice(0, 90));
say('and the total is at least the one trade that paid', /10,625/.test(revenue), revenue.slice(0, 90));

// ── the form offers the rate, and guards it ─────────────────────────────────
console.log('── New RFQ · the rate the desk charges ──');
await view('create');
const fee = p.locator('#c-fee');
say('the create form offers a desk fee', (await fee.count()) === 1);
say('it is blank by default, so nothing is charged unless asked', (await fee.inputValue()) === '');

await p.fill('#c-instrument', 'TBOND30');
await p.fill('#c-qty', '1000');
await p.fill('#c-fee', '1200');            // above the model's 10 per cent ceiling
let before = submits;
await p.click('#c-submit');
await wait(1200);
say('a rate above the ceiling is refused before submission', submits - before === 0 && /basis points/i.test(await toast()),
  `${submits - before} submitted · "${(await toast()).slice(0, 48)}"`);

await p.fill('#c-fee', '-5');
before = submits;
await p.click('#c-submit');
await wait(1200);
say('a negative rate is refused too', submits - before === 0, `${submits - before} submitted`);

say('no uncaught page errors across the whole run', errs.length === 0, errs[0] ?? '');

await b.close();
console.log(`\n════ FEE: ${pass}/${total} passed ════`);
process.exit(pass === total ? 0 : 1);
