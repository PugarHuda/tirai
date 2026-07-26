// Render the value / problem statement to PDF (the submission platform wants a
// PDF upload). Uses the Playwright that is already a dev dependency — no LaTeX,
// no headless-chrome wrapper, no markdown-to-pdf package.
//   node scripts/make-value-pdf.mjs [out.pdf]
import { chromium } from 'playwright';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] ?? join(HERE, '..', 'media', 'tirai-value-statement.pdf');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 18mm 16mm 16mm; }
  *{box-sizing:border-box}
  body{margin:0;font:11pt/1.5 "Segoe UI",Inter,system-ui,sans-serif;color:#14181d}
  h1{font-size:23pt;line-height:1.15;margin:0 0 2mm;letter-spacing:-.01em}
  .sub{font-size:11.5pt;color:#3c4753;margin:0 0 6mm}
  h2{font-size:12.5pt;margin:7mm 0 2mm;text-transform:uppercase;letter-spacing:.08em;
     color:#0f766e;border-bottom:1.5pt solid #0f766e;padding-bottom:1.5mm}
  p{margin:0 0 3mm}
  strong{color:#0b1117}
  ul{margin:0 0 3mm;padding-left:5mm}
  li{margin:0 0 1.5mm}
  .rule{height:3pt;background:#0f766e;width:26mm;margin:0 0 5mm}
  .meta{font-size:9pt;color:#5b6673;margin:0 0 6mm}
  .meta b{color:#14181d}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:0 8mm}
  .facts{background:#f1f5f4;border-left:3pt solid #0f766e;padding:4mm 5mm;margin:0 0 4mm}
  .facts p{margin:0 0 1.5mm;font-size:10pt}
  .foot{margin-top:7mm;padding-top:3mm;border-top:.75pt solid #c9d2d8;font-size:9pt;color:#5b6673}
</style></head><body>

<h1>Tirai — the confidential dealer terminal, on-ledger</h1>
<p class="sub">A multi-dealer RFQ / OTC desk built native on Canton, settling in real
CIP-56 assets (cETH, CBTC, Canton Coin, USDCx).</p>
<div class="rule"></div>
<p class="meta"><b>HackCanton Season #2</b> · Financial Applications · solo builder: Pugar Huda
Mantoro · repo <b>github.com/PugarHuda/tirai</b> · live desk <b>tirai.vercel.app</b></p>

<h2>The problem</h2>
<p>When an institution moves a large block of bonds, <strong>the fact of the enquiry is
itself the market-moving information</strong>. Ask five dealers for a price on 50 million
of a 30-year sovereign and you have told the market your size and your direction
before you have traded a single unit.</p>
<p>On a transparent chain this leak is structural, not incidental. An RFQ in a public
mempool, a resting order in a public book, a quote visible to rival dealers — each is
free information for anyone willing to trade ahead of you. The result is front-running,
adverse selection and worse fills. This is precisely why institutional block trading has
<em>not</em> moved on-chain: it still happens over the phone and on closed dealer
terminals (Tradeweb, Bloomberg, MarketAxess), off-ledger, with all the settlement risk
and reconciliation cost that implies.</p>
<p>The industry's two answers are both unsatisfying. Trade in public and pay the leak.
Or trade off-chain and lose atomic settlement, auditability, and any hope of composing
with on-chain assets.</p>

<h2>The value: what Tirai changes</h2>
<p>Tirai is the dealer terminal itself, running on the ledger. A buyer sends an RFQ to a
chosen dealer panel; each dealer answers with a <strong>sealed quote</strong>. Rival
dealers never receive that contract — not hidden in a UI, <em>never delivered to their
participant node</em>. The market never sees the RFQ. Losing quotes are archived without
ever being revealed.</p>
<ul>
  <li><strong>Price discovery without disclosure.</strong> Reverse-Vickrey clears the
  cheapest ask at the second price, so honest quoting is the dominant strategy; or the
  buyer lifts a single ask bilaterally. Partial fills on both rails.</li>
  <li><strong>No counterparty risk.</strong> Quoting escrows the dealer's asset — a
  price is a commitment, not a bluff — and settlement is atomic delivery-versus-payment:
  bond and cash move in one transaction, or neither does.</li>
  <li><strong>Supervision without surveillance.</strong> The regulator observes executed
  trades only: full post-trade audit, zero pre-trade visibility.</li>
  <li><strong>Provable best execution.</strong> A buyer (or a dealer defending its
  pricing) can selectively disclose a single sealed quote to the regulator on demand —
  proving the clearing price beat every competing ask, without ever going public.</li>
  <li><strong>The cash leg is real.</strong> Settlement clears in cETH, CBTC, Canton Coin
  or USDCx through the CIP-56 token standard's allocation flow — one integration, every
  asset, against the frozen Splice v1 interfaces that live registries implement.</li>
</ul>

<h2>Why this matters now</h2>
<p>Tokenised fixed income only becomes interesting when institutions can trade it in
size. Every other part of the stack — issuance, custody, settlement — has a credible
on-chain story; the trading layer does not, because the trading layer is where
information leaks. Solve confidential price discovery and the rest of the tokenised
bond thesis stops being a pilot.</p>
<p>The same primitive travels: confidential RFQ with atomic DvP is what a cETH or CBTC
desk needs to quote size without being picked off, and what an OTC desk in any
institutional asset needs on day one.</p>

<h2>Why Canton, specifically</h2>
<p>We have built this exact product four times before — on Arbitrum with trusted
execution environments, on Stellar with Groth16 circuits, on Sui with threshold
encryption, on Ethereum with fully homomorphic encryption. Every one of those builds was
a fight against the chain's transparency, paid for in cryptographic machinery, latency
and audit surface.</p>
<p>On Canton we wrote none of it. "Dealer B cannot see dealer A's quote" is a
<code>signatory</code> / <code>observer</code> declaration — sub-transaction privacy is
the ledger model, not a layer on top. Atomic multi-party DvP across independently
administered registries (a bond issuer plus the onRails cETH registry) composes in a
single transaction. No other stack gives you confidential pre-trade, provable post-trade
and atomic cross-registry settlement together.</p>

<h2>Proof it exists (live on Canton Devnet)</h2>
<div class="facts">
  <p><strong>41 settled trades + 5 atomic multi-leg baskets</strong> on-ledger, across
  reverse-Vickrey, direct-OTC and partial-fill rails, over ~25 sovereign, supranational
  and corporate instruments.</p>
  <p><strong>16 best-execution attestations</strong> — clearing price provably at or
  below every disclosed competing ask.</p>
  <p><strong>36 Daml test scripts green</strong>; an automated on-ledger check asserts
  that each dealer sees only its own quotes and the regulator sees zero pre-trade
  contracts — and fails the build if a single quote ever leaks.</p>
  <p><strong>Hosted read-only desk</strong> at tirai.vercel.app over live Devnet state,
  plus a 6-tool MCP server so agents can read the desk and post RFQs.</p>
</div>

<h2>Who pays, and the path to production</h2>
<p><strong>Customers.</strong> Fixed-income and crypto-asset trading desks at banks,
asset managers and prop shops that trade in size and cannot afford to signal — plus the
venues that would host the desk for them.</p>
<p><strong>Revenue.</strong> A per-trade venue fee in the settlement asset (bps of
notional), taken atomically at settlement — the economics of an OTC venue, enforced by
the contract rather than invoiced. Featured-app activity markers (CIP-0047) accrue
network rewards on every settlement, so a live desk keeps earning from the volume it
clears.</p>
<p><strong>Next steps.</strong> (1) Wire the onRails cETH and BitSafe CBTC registries and
run live test-token settlements — the contract path is built and tested, blocked only on
the test-token grant. (2) Put the desk in front of one fixed-income and one crypto-native
design partner. (3) Supervised pilot at a hosting venue on a single instrument class,
with the venue fee and activity markers switched on.</p>

<p class="foot">Tirai — Indonesian for "curtain". Price discovery happens behind it.
You whisper quotes; the market hears nothing.</p>

</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await mkdir(dirname(OUT), { recursive: true });
await page.pdf({ path: OUT, format: 'A4', printBackground: true });
await browser.close();
console.log('wrote', OUT);
