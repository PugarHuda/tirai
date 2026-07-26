// Render the submission platform's PDF uploads (it takes each written section as
// a PDF). Shared house style, one body per document, rendered through the
// Playwright that is already a dev dependency — no LaTeX, no markdown-to-pdf.
//   node scripts/make-pdf.mjs           # all documents
//   node scripts/make-pdf.mjs icp       # just one
import { chromium } from 'playwright';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';

const HERE = dirname(fileURLToPath(import.meta.url));
const MEDIA = join(HERE, '..', 'media');

const CSS = `
  @page { size: A4; margin: 18mm 16mm 16mm; }
  *{box-sizing:border-box}
  body{margin:0;font:11pt/1.5 "Segoe UI",Inter,system-ui,sans-serif;color:#14181d}
  h1{font-size:23pt;line-height:1.15;margin:0 0 2mm;letter-spacing:-.01em}
  .sub{font-size:11.5pt;color:#3c4753;margin:0 0 6mm}
  h2{font-size:12.5pt;margin:7mm 0 2mm;text-transform:uppercase;letter-spacing:.08em;
     color:#0f766e;border-bottom:1.5pt solid #0f766e;padding-bottom:1.5mm}
  h3{font-size:11pt;margin:4mm 0 1.5mm;color:#0b1117}
  p{margin:0 0 3mm}
  strong{color:#0b1117}
  ul{margin:0 0 3mm;padding-left:5mm}
  li{margin:0 0 1.5mm}
  .rule{height:3pt;background:#0f766e;width:26mm;margin:0 0 5mm}
  .meta{font-size:9pt;color:#5b6673;margin:0 0 6mm}
  .meta b{color:#14181d}
  .facts{background:#f1f5f4;border-left:3pt solid #0f766e;padding:4mm 5mm;margin:0 0 4mm}
  .facts p{margin:0 0 1.5mm;font-size:10pt}
  table{width:100%;border-collapse:collapse;margin:0 0 4mm;font-size:9.5pt}
  th{text-align:left;background:#0f766e;color:#fff;padding:2mm 3mm;font-weight:600}
  td{padding:2mm 3mm;border-bottom:.75pt solid #d7dee3;vertical-align:top}
  tr{break-inside:avoid}
  .foot{margin-top:7mm;padding-top:3mm;border-top:.75pt solid #c9d2d8;font-size:9pt;color:#5b6673}
`;

const META = `<p class="meta"><b>HackCanton Season #2</b> · Financial Applications · solo
builder: Pugar Huda Mantoro · repo <b>github.com/PugarHuda/tirai</b> · live desk
<b>tirai.vercel.app</b></p>`;

const FOOT = `<p class="foot">Tirai — Indonesian for "curtain". Price discovery happens
behind it. You whisper quotes; the market hears nothing.</p>`;

const DOCS = {
  value: {
    out: 'tirai-value-statement.pdf',
    body: `
<h1>Tirai — the confidential dealer terminal, on-ledger</h1>
<p class="sub">A multi-dealer RFQ / OTC desk built native on Canton, settling in real
CIP-56 assets (cETH, CBTC, Canton Coin, USDCx).</p>
<div class="rule"></div>
${META}

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
${FOOT}`,
  },

  icp: {
    out: 'tirai-icp.pdf',
    body: `
<h1>Tirai — ideal customer profile &amp; audience</h1>
<p class="sub">Who trades on a confidential RFQ desk, who pays for it, and who is
deliberately not the customer.</p>
<div class="rule"></div>
${META}

<h2>The one-line ICP</h2>
<div class="facts">
  <p><strong>A trading desk that moves single tickets large enough to move the price,
  in an asset that is already tokenised (or about to be), and that is required to
  evidence best execution to someone.</strong> All three conditions must hold: size
  creates the leak, tokenisation makes on-ledger settlement possible, and the evidence
  requirement is why they cannot simply trade in a private chat.</p>
</div>
<p>Below roughly $1m a ticket, information leakage is a rounding error and a public
order book is fine — those users are not the customer. Tirai earns its keep exactly
where the spread lost to signalling exceeds every other cost of trading.</p>

<h2>Primary segments</h2>
<table>
  <tr><th>Segment</th><th>Who signs</th><th>The pain today</th><th>Why now</th></tr>
  <tr>
    <td><strong>Buy-side fixed income</strong> — asset managers, insurers, pension funds
    trading sovereigns, supranationals and IG credit</td>
    <td>Head of trading / COO of the desk; compliance signs off</td>
    <td>RFQ to 5 dealers on a phone or a closed terminal; no atomic settlement, T+1/T+2
    risk, manual reconciliation, best-execution evidence assembled after the fact</td>
    <td>Their bonds are becoming tokenised; they need a venue that does not leak, or
    they simply will not trade the tokenised line</td>
  </tr>
  <tr>
    <td><strong>Sell-side dealer desks</strong> — bank rates/credit desks, market
    makers, ETF and RWA liquidity providers</td>
    <td>Desk head; e-trading lead</td>
    <td>Quotes visible to rivals get faded and picked off; showing a price on-chain
    means showing the whole market your axe</td>
    <td>They want to quote tokenised inventory without publishing their book — sealed
    quotes make on-chain market making survivable</td>
  </tr>
  <tr>
    <td><strong>Crypto-native institutional desks</strong> — funds, treasuries and prop
    shops trading cETH / CBTC in size</td>
    <td>CIO / head of trading (short chain of command — fastest to pilot)</td>
    <td>Large on-chain transfers are watched in real time; mempool visibility and wallet
    surveillance turn a block trade into a public event</td>
    <td>cETH and CBTC exist now and settle on Canton; the desk they need to trade them
    confidentially does not</td>
  </tr>
  <tr>
    <td><strong>Venues &amp; hosting apps</strong> — Temple, Bron, Console, Canton Loop
    (channel, not end user)</td>
    <td>Product lead / BD</td>
    <td>They have distribution and custody but no confidential RFQ primitive to offer
    their institutional users</td>
    <td>Tirai plugs in as an app and shares the per-trade fee — the fastest route to
    real users</td>
  </tr>
  <tr>
    <td><strong>Regulators &amp; compliance</strong> (mandatory third party, not a
    payer)</td>
    <td>Head of compliance; supervisory authority</td>
    <td>Either total opacity (off-chain voice trading) or total exposure (public chain).
    Nothing in between</td>
    <td>Post-trade-only visibility plus on-demand quote disclosure is exactly the middle
    they have been asking for</td>
  </tr>
</table>

<h2>Firmographics of the ideal first customer</h2>
<ul>
  <li><strong>Ticket size:</strong> $1m–$100m notional per trade; anything smaller does
  not leak enough to care.</li>
  <li><strong>Asset:</strong> tokenised government or corporate bonds, or cETH / CBTC —
  an asset with a real registry on Canton, so the cash leg is a CIP-56 asset rather
  than an IOU.</li>
  <li><strong>Panel size:</strong> 3–8 dealers. Enough for competitive pricing, small
  enough that every participant is known and onboarded.</li>
  <li><strong>Regulatory posture:</strong> subject to best-execution or transaction
  reporting obligations (MiFID II RTS 27/28-style, or an internal equivalent). This is
  a feature, not an obstacle: the requirement is what rules out a private chat.</li>
  <li><strong>Technical posture:</strong> already runs — or is willing to be hosted on —
  a Canton validator, and holds assets in a wallet that supports the token standard's
  allocation flow.</li>
  <li><strong>Geography:</strong> wherever tokenised issuance is already live — EU/UK
  and Singapore first, then US and Middle East institutional desks.</li>
</ul>

<h2>Jobs to be done</h2>
<ul>
  <li>"Get me a competitive price on this block <em>without</em> telling the market I am
  a seller."</li>
  <li>"Make sure the asset and the cash move together, so I am not carrying settlement
  risk against a counterparty I just met."</li>
  <li>"Let me prove to compliance — months later — that I got the best price available,
  without having published my order."</li>
  <li>(Dealer) "Let me show a real price to one client without showing my axe to my
  competitors."</li>
  <li>(Regulator) "Give me a complete record of what was executed, without giving me a
  live feed of everything that was merely contemplated."</li>
</ul>

<h2>Who is explicitly not the audience</h2>
<ul>
  <li><strong>Retail and small-ticket flow.</strong> An AMM or a public order book is
  cheaper and better for them; sealed quotes solve a problem they do not have.</li>
  <li><strong>Anonymous / permissionless counterparties.</strong> Tirai's privacy is
  <em>selective</em>, not anonymity: every party is a known, onboarded institution, and
  the regulator sees every executed trade. Anyone who wants to hide from a supervisor
  is a bad fit by design.</li>
  <li><strong>High-frequency and continuous two-sided markets.</strong> RFQ is an
  episodic, negotiated workflow; microsecond central-limit-order-book trading is a
  different product.</li>
  <li><strong>Desks with no tokenised asset.</strong> Without a real registry on the
  other side, this is a private chat with extra steps.</li>
</ul>

<h2>Reaching them</h2>
<p><strong>Beachhead:</strong> crypto-native institutional desks trading cETH and CBTC.
Short decision chains, assets already on Canton, and pain they feel weekly — the fastest
path to a live pilot with real volume.</p>
<p><strong>Expansion:</strong> from that reference, into tokenised-bond desks at asset
managers, arriving through the venue rather than cold: Tirai ships as an app inside a
hosting venue (Temple, Bron, Console, Canton Loop) that already holds the client
relationship and the custody. The venue takes distribution; Tirai takes the per-trade
fee in the settlement asset.</p>
<p><strong>Design-partner profile for the first pilot:</strong> one desk that trades a
single instrument class in size, a panel of 3–5 dealers it already faces bilaterally,
and a compliance function willing to accept an on-ledger post-trade record in place of
its current spreadsheet.</p>
${FOOT}`,
  },
};

const render = async (key) => {
  const doc = DOCS[key];
  if (!doc) throw new Error(`unknown document "${key}" — have: ${Object.keys(DOCS).join(', ')}`);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${doc.body}</body></html>`, { waitUntil: 'load' });
  await mkdir(MEDIA, { recursive: true });
  const out = join(MEDIA, doc.out);
  await page.pdf({ path: out, format: 'A4', printBackground: true });
  await browser.close();
  console.log('wrote', out);
};

const wanted = process.argv.slice(2);
for (const key of wanted.length ? wanted : Object.keys(DOCS)) await render(key);
