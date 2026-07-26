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
  gtm: {
    out: 'tirai-gtm.pdf',
    body: `
<h1>Tirai — go-to-market plan</h1>
<p class="sub">How a confidential RFQ desk gets its first real trade, its first paying
venue, and its first ten desks.</p>
<div class="rule"></div>
${META}

<h2>Positioning</h2>
<div class="facts">
  <p><strong>For</strong> institutional trading desks that move blocks in tokenised
  assets, <strong>Tirai</strong> is the confidential RFQ/OTC venue that lets them get a
  competitive price without telling the market they are trading —
  <strong>unlike</strong> public order books and AMMs, which leak size and direction
  before the trade prints, and <strong>unlike</strong> voice/chat trading, which leaks
  nothing but also settles nothing.</p>
</div>
<p><strong>The one sentence a trader remembers:</strong> "You whisper quotes; the market
hears nothing — and the regulator still gets the whole record."</p>
<p><strong>The three proof points</strong>, in the order they land: (1) dealer B's node
never receives dealer A's quote — verifiable on-ledger, not a UI promise; (2) settlement
is atomic DvP with a real cETH/CBTC cash leg, so nobody carries counterparty risk;
(3) best execution is provable after the fact without ever having been public.</p>

<h2>Business model</h2>
<ul>
  <li><strong>Per-trade venue fee</strong> in the settlement asset — basis points of
  notional, taken atomically inside the settlement transaction. No invoicing, no
  collection risk: if the trade settles, the fee is paid.</li>
  <li><strong>Network rewards.</strong> Featured-app activity markers (CIP-0047) accrue
  on every settlement, so a live desk earns from the volume it clears in addition to the
  fee.</li>
  <li><strong>Revenue share with the hosting venue</strong> — the venue brings the
  client relationship and custody, Tirai brings the primitive; the fee splits.</li>
  <li><strong>Not</strong> a per-seat licence. Institutional desks resent seat pricing,
  and it decouples our revenue from the thing we actually improve: executed volume.</li>
</ul>

<h2>Channels, in priority order</h2>
<table>
  <tr><th>Channel</th><th>Why it works</th><th>First action</th></tr>
  <tr>
    <td><strong>Asset-issuer ecosystems</strong> — onRails (cETH), BitSafe (CBTC)</td>
    <td>They need trading venues for their asset to be worth holding; we need their
    registry and their holders. Mutual, not a favour</td>
    <td>Settle live test-token trades, then ask to be listed as an app in their
    ecosystem materials</td>
  </tr>
  <tr>
    <td><strong>Hosting venues &amp; wallets</strong> — Temple, Bron, Console, Canton
    Loop</td>
    <td>They already hold the institutional relationship, the custody and the
    onboarding; we are a feature they cannot build in a week</td>
    <td>Ship as an embeddable app with the standard AllocationRequest flow — their
    wallet already renders it, so integration is small</td>
  </tr>
  <tr>
    <td><strong>Canton Network ecosystem</strong> — Canton Foundation, Digital Asset,
    validator operators, CIP process</td>
    <td>Distribution to exactly the institutions building on Canton; the privacy story
    is the network's own pitch, demonstrated</td>
    <td>Hackathon submission, then a written case study of the privacy verification with
    reproducible numbers</td>
  </tr>
  <tr>
    <td><strong>Direct desk outreach</strong> — crypto-native funds and prop shops
    first</td>
    <td>Short decision chains: a CIO can say yes to a pilot in one meeting</td>
    <td>Warm intros from the ecosystems above; demo on live Devnet state, not slides</td>
  </tr>
  <tr>
    <td><strong>Agent / MCP distribution</strong></td>
    <td>The desk is already exposed as MCP tools, so an institutional agent stack can
    read the market and post RFQs without a human UI — a channel nobody else in this
    category has</td>
    <td>Publish the MCP server and one worked agent example</td>
  </tr>
</table>

<h2>90-day plan</h2>
<h3>Days 0–30 — make it real</h3>
<ul>
  <li>Wire the onRails cETH registry end to end (off-ledger choice context, disclosed
  contracts) and settle live test-token trades; repeat for BitSafe CBTC.</li>
  <li>Publish the privacy verification as a reproducible artefact: anyone can run the
  check against the live ledger and get the same answer.</li>
  <li>Recruit <strong>one</strong> design-partner desk and a panel of 3–5 dealers it
  already faces bilaterally.</li>
</ul>
<h3>Days 30–60 — one venue, one instrument class</h3>
<ul>
  <li>Land one hosting venue integration; agree the fee split and the activity markers.</li>
  <li>Run the design partner on a single instrument class in shadow mode: real RFQs,
  real quotes, settlement compared against their existing execution.</li>
  <li>Instrument everything the desk cares about — fill quality vs. their current venue,
  time-to-quote, panel response rate.</li>
</ul>
<h3>Days 60–90 — evidence, then repeat</h3>
<ul>
  <li>Turn on the venue fee for live trades at the pilot desk.</li>
  <li>Publish the pilot's execution-quality numbers (with the desk's permission) — the
  only marketing that moves institutions.</li>
  <li>Use that reference to open the next three desks through the same venue.</li>
</ul>

<h2>Supporting materials (all live today)</h2>
<ul>
  <li><strong>Working product</strong> — hosted read-only desk at tirai.vercel.app over
  real Canton Devnet state; a prospect can look at live contracts, not a mock-up.</li>
  <li><strong>Public repository</strong> — github.com/PugarHuda/tirai: model, tests, CI,
  deployment scripts, and a build journal that shows the work rather than claiming it.</li>
  <li><strong>Reproducible privacy proof</strong> — an on-ledger check that fails the
  build if a quote ever leaks; the strongest sales asset we have, because a prospect can
  run it themselves.</li>
  <li><strong>Value statement and ICP documents</strong>, this plan, and a demo video
  walking through a real settlement.</li>
  <li><strong>MCP server</strong> — six tools, so an evaluating team can point their own
  agent at the desk during diligence.</li>
</ul>

<h2>Risks and how we handle them</h2>
<ul>
  <li><strong>Cold-start liquidity.</strong> An RFQ desk with one dealer is worthless.
  Mitigation: launch inside a venue that already has the dealers, and start with panels
  that already trade bilaterally — we digitise an existing relationship rather than
  creating a new market.</li>
  <li><strong>Long institutional sales cycles.</strong> Mitigation: beachhead with
  crypto-native desks whose decision chain is one person, and use their numbers to open
  the slower doors.</li>
  <li><strong>Registry dependency.</strong> The cash leg needs a live registry.
  Mitigation: the instrument is any {admin, id}, so cETH, CBTC, Canton Coin and USDCx
  are one code path — no single issuer can strand us.</li>
  <li><strong>Regulatory ambiguity around dark trading.</strong> Mitigation: the
  regulator role is built in, not bolted on — post-trade visibility by default and
  selective pre-trade disclosure on demand.</li>
</ul>

<h2>What we are asking for</h2>
<p>cETH and CBTC Devnet test tokens to complete live settlement; an introduction to one
hosting venue willing to pilot an embedded app; and one design-partner desk trading a
tokenised instrument in size.</p>
${FOOT}`,
  },

  metrics: {
    out: 'tirai-metrics.pdf',
    body: `
<h1>Tirai — metrics &amp; validation evidence</h1>
<p class="sub">What is measurably true today, how to verify each number yourself, and
what is honestly not yet proven.</p>
<div class="rule"></div>
${META}

<h2>Live on Canton Devnet — the ledger is the evidence</h2>
<div class="facts">
  <p><strong>41 settled trades + 5 atomic multi-leg baskets</strong> — real contracts on
  the shared 5N Devnet validator, package <code>tirai-desk</code>
  <code>4b1e408f…</code>, parties <code>tirai-v1-*</code>.</p>
  <p><strong>16 best-execution attestations</strong> — each with both dealers' asks
  disclosed to the regulator <em>before</em> settlement, so the clearing price is
  provably at or below every competing ask.</p>
  <p><strong>32 quote disclosures · 5 open RFQs, each with two sealed quotes</strong> —
  a live book, not a single demo trade.</p>
  <p><strong>Coverage:</strong> ~25 instruments across sovereigns (US, UK, Germany,
  Japan, France, Australia, Netherlands, Switzerland, Korea, Singapore, India,
  Indonesia), supranationals (IBRD, EIB, KfW) and corporates (Amazon, Nvidia, Goldman,
  JPM), traded on all three rails — reverse-Vickrey (including 3-dealer auctions),
  direct OTC, and partial fills.</p>
</div>

<h2>The privacy claim, verified on the network (not asserted)</h2>
<p>The central claim of this project is falsifiable, and we falsify it on every run.
<code>node scripts/devnet.mjs verify</code> queries the live active-contract set of each
party and asserts:</p>
<ul>
  <li>each dealer sees <strong>only its own quotes</strong> — never a rival's;</li>
  <li>the regulator sees <strong>zero pre-trade contracts</strong> — no RFQs, no quotes;</li>
  <li>the regulator does see <strong>every settled trade</strong> — 46 settlements in
  its audit view.</li>
</ul>
<p>It exits non-zero if a single quote ever leaks, so this is a test, not a dashboard.
The same result is reproduced independently through the read-only MCP server
(<code>party_view</code>) and through the hosted desk's "Verify privacy" view, which
counts live contracts in the browser.</p>

<h2>Engineering evidence</h2>
<table>
  <tr><th>Check</th><th>Result</th><th>How to run it</th></tr>
  <tr><td>Daml model test suite</td><td><strong>36 / 36 scripts green</strong></td>
      <td><code>cd test; daml test</code></td></tr>
  <tr><td>Hosted QA across three browsers</td><td><strong>66 / 66 checks</strong>
      (chromium, firefox, webkit)</td><td><code>node scripts/e2e-hosted.mjs</code></td></tr>
  <tr><td>MCP server against live Devnet</td><td><strong>25 / 25 checks</strong></td>
      <td><code>node scripts/e2e-mcp.mjs</code></td></tr>
  <tr><td>Read-only proxy security self-test</td><td><strong>14 / 14</strong>, including a
      party-enumeration bypass regression</td><td><code>node scripts/test-readonly-proxy.mjs</code></td></tr>
  <tr><td>On-ledger privacy assertion</td><td><strong>green</strong> after every seeding
      run</td><td><code>node scripts/devnet.mjs verify</code></td></tr>
  <tr><td>Write protection in production</td><td>every <code>/v2/commands/*</code> call
      <strong>403</strong></td><td>hosted proxy, verified in production</td></tr>
</table>

<h2>Hypotheses, and what the build actually validated</h2>
<table>
  <tr><th>Hypothesis</th><th>Status</th><th>Evidence</th></tr>
  <tr><td>Canton's sub-transaction privacy alone is enough — no ZK, TEE or FHE needed
      for a confidential RFQ desk</td><td><strong>Validated</strong></td>
      <td>Zero cryptographic machinery in the codebase; privacy asserted on the live
      network, where a rival dealer's participant node simply never receives the
      contract</td></tr>
  <tr><td>Confidential pre-trade and provable post-trade can coexist</td>
      <td><strong>Validated</strong></td>
      <td>16 attestations built from quotes disclosed to the regulator on demand, with
      the quotes never public</td></tr>
  <tr><td>One settlement integration can serve every asset (cETH, CBTC, CC, USDCx)</td>
      <td><strong>Validated in test</strong></td>
      <td>The cash instrument is any {admin, id}; a second, differently-administered mock
      registry settles through the identical code path (<code>testCbtcDvp</code>)</td></tr>
  <tr><td>The desk is usable by an institution's own automation, not just humans</td>
      <td><strong>Validated</strong></td>
      <td>Six MCP tools, 25/25 green against live Devnet, including a write path that
      posts a real RFQ on-ledger</td></tr>
  <tr><td>Desks will pay a per-trade fee for confidentiality</td>
      <td><strong>Not yet validated</strong></td>
      <td>No paying customer. This is the first thing a design-partner pilot must
      test</td></tr>
</table>

<h2>Reproduce every number in this document</h2>
<ul>
  <li><strong>Live desk:</strong> tirai.vercel.app — the tiles, audit trail and
  best-execution view read the live ledger; nothing is baked in.</li>
  <li><strong>Ledger:</strong> package <code>tirai-desk</code>
  <code>4b1e408f6eda27364a55da076d9251ee117f0641f03aaf20883995f1e507a7e3</code>, parties
  <code>tirai-v1-buyer / dealerA / dealerB / regulator / cashissuer / bondissuer</code>.</li>
  <li><strong>Code and history:</strong> github.com/PugarHuda/tirai — CI green, plus
  <code>JOURNAL.md</code>, a dated build log of what was built and what broke.</li>
</ul>

<h2>What is not proven yet (stated plainly)</h2>
<ul>
  <li><strong>No live cETH or CBTC transaction.</strong> The settlement path is built
  against the real Splice v1 interfaces and tested against a mock registry, but the
  Devnet test-token grant has not landed, so no value has moved in the real asset yet.</li>
  <li><strong>No paying users and no design partner signed.</strong> Every commercial
  claim in the GTM document is a hypothesis, not a result.</li>
  <li><strong>Not deployed on the HackCanton participant.</strong> The deploy is written
  and proven on another Devnet validator; on <code>hackcanton-01</code> a wallet-issued
  token authenticates for reads but DAR upload and party allocation return 403 — that is
  participant-admin only, and the request to the node operators is in.</li>
  <li><strong>No load or latency benchmarks.</strong> Volumes so far are demonstrative,
  not performance evidence.</li>
</ul>
${FOOT}`,
  },

  // The pitch deck: landscape slides, dark ground, one <section> per page —
  // same visual language as the desk itself.
  pitch: {
    out: 'tirai-pitch-deck.pdf',
    landscape: true,
    css: `
      @page { size: A4 landscape; margin: 0; }
      *{box-sizing:border-box}
      body{margin:0;font:12pt/1.5 "Segoe UI",Inter,system-ui,sans-serif;
           color:#e6edf3;background:#0b0d10}
      section{width:297mm;height:209mm;padding:16mm 18mm;background:#0b0d10;
              break-after:page;position:relative;display:flex;flex-direction:column;
              justify-content:center;border-top:3pt solid #6ee7b7}
      section:last-child{break-after:auto}
      .n{position:absolute;top:9mm;right:18mm;font-size:9pt;color:#5b6673;
         letter-spacing:.12em;text-transform:uppercase}
      .kicker{font-size:9.5pt;letter-spacing:.16em;text-transform:uppercase;
              color:#6ee7b7;margin:0 0 5mm}
      h1{font-size:40pt;line-height:1.05;margin:0 0 6mm;letter-spacing:-.02em;color:#fff}
      h2{font-size:26pt;line-height:1.15;margin:0 0 6mm;letter-spacing:-.01em;color:#fff}
      p{margin:0 0 4mm;font-size:13pt;color:#c5d0da;max-width:230mm}
      .lede{font-size:15pt;color:#e6edf3}
      strong{color:#6ee7b7;font-weight:600}
      ul{margin:0 0 3mm;padding-left:6mm}
      li{margin:0 0 3mm;font-size:12.5pt;color:#c5d0da}
      .cols{display:grid;grid-template-columns:1fr 1fr;gap:8mm}
      .card{border:1.5pt solid #2b3742;padding:6mm 7mm;background:#10151b}
      .card h3{margin:0 0 2mm;font-size:12pt;color:#fff}
      .card p{margin:0;font-size:11pt}
      .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6mm;margin-top:4mm}
      .stat{border:1.5pt solid #2b3742;background:#10151b;padding:6mm}
      .stat b{display:block;font-size:30pt;color:#6ee7b7;line-height:1}
      .stat span{font-size:10.5pt;color:#8b98a5}
      table{width:100%;border-collapse:collapse;font-size:11.5pt;margin-top:2mm}
      th{text-align:left;color:#6ee7b7;border-bottom:1.5pt solid #2b3742;padding:3mm 4mm;
         font-size:10pt;letter-spacing:.08em;text-transform:uppercase}
      td{padding:3mm 4mm;border-bottom:.75pt solid #1b2430;color:#c5d0da}
      td.hi{color:#fff}
      .flow{display:grid;grid-template-columns:repeat(5,1fr);gap:4mm;margin-top:4mm}
      .step{border:1.5pt solid #2b3742;background:#10151b;padding:5mm}
      .step b{display:block;color:#6ee7b7;font-size:10pt;margin-bottom:1.5mm}
      .step span{font-size:10.5pt;color:#c5d0da}
      .foot{position:absolute;bottom:9mm;left:18mm;font-size:9pt;color:#5b6673}
    `,
    body: `
<section>
  <p class="kicker">HackCanton Season #2 · Financial Applications</p>
  <h1>Tirai</h1>
  <p class="lede">The confidential multi-dealer RFQ / OTC desk, built native on Canton —
  settling in real CIP-56 assets: cETH, CBTC, Canton Coin, USDCx.</p>
  <p><strong>You whisper quotes. The market hears nothing.</strong></p>
  <p class="foot">github.com/PugarHuda/tirai · tirai.vercel.app · Pugar Huda Mantoro (solo)</p>
</section>

<section>
  <p class="n">01 · Problem</p>
  <p class="kicker">The trade that moves the market before it happens</p>
  <h2>Asking for a price <em>is</em> the information</h2>
  <p>Request a quote on 50 million of a 30-year sovereign and you have told the market
  your size and your direction — before a single unit changes hands.</p>
  <div class="cols">
    <div class="card"><h3>Trade in public</h3><p>Public books and mempools leak size and
    direction. Front-running and adverse selection are structural, not incidental.</p></div>
    <div class="card"><h3>Trade off-chain</h3><p>Phones and closed terminals leak nothing —
    and settle nothing. Counterparty risk, T+2, manual reconciliation.</p></div>
  </div>
  <p style="margin-top:5mm"><strong>That is why institutional block trading has not moved
  on-chain.</strong></p>
</section>

<section>
  <p class="n">02 · Product</p>
  <p class="kicker">The dealer terminal, on the ledger</p>
  <h2>Sealed quotes, atomic settlement, post-trade audit</h2>
  <div class="flow">
    <div class="step"><b>1 · RFQ</b><span>Buyer asks a chosen dealer panel. The market
    never sees it.</span></div>
    <div class="step"><b>2 · Sealed quote</b><span>Each dealer's price is delivered to the
    buyer alone — rivals never receive the contract.</span></div>
    <div class="step"><b>3 · Escrow</b><span>Quoting locks the dealer's asset. A price is
    a commitment, not a bluff.</span></div>
    <div class="step"><b>4 · Atomic DvP</b><span>Bond and cETH move in one transaction —
    or neither does.</span></div>
    <div class="step"><b>5 · Report</b><span>The regulator sees executed trades only.
    Zero pre-trade visibility.</span></div>
  </div>
  <p style="margin-top:6mm">Three rails: <strong>reverse-Vickrey</strong> (second price,
  honest quoting is dominant), <strong>direct bilateral OTC</strong>, and
  <strong>partial fills</strong> on both.</p>
</section>

<section>
  <p class="n">03 · The core claim</p>
  <p class="kicker">Not a UI promise — a ledger property</p>
  <h2>Dealer B's node never receives dealer A's quote</h2>
  <p>On Canton, privacy is <strong>sub-transaction</strong>: a contract is delivered only
  to its signatories and observers. There is no filtering, no encryption, nothing to
  misconfigure — the data simply never travels.</p>
  <p>So the claim is falsifiable, and we falsify it on every run: an automated check
  queries the live ledger and asserts each dealer sees <strong>only its own quotes</strong>
  and the regulator sees <strong>zero pre-trade contracts</strong>. It exits non-zero if a
  single quote ever leaks.</p>
</section>

<section>
  <p class="n">04 · Settlement</p>
  <p class="kicker">CIP-56 Canton Token Standard</p>
  <h2>The cash leg is a real registry asset</h2>
  <p>Award creates a <strong>TokenTrade</strong> implementing the standard's
  <strong>AllocationRequest</strong> interface — so any standard wallet renders
  <em>"allocate 1,240,000 cETH to this settlement"</em> with no Tirai-specific
  integration. The registry locks the cash.</p>
  <p>Settlement then runs in <strong>one atomic transaction</strong>: registry transfer of
  cETH to the winning dealer + escrowed bond delivered to the buyer + trade report to the
  regulator.</p>
  <p>The cash instrument is any <em>{admin, id}</em> — <strong>cETH, CBTC, Canton Coin and
  USDCx are one code path</strong>, proven by a second registry in the test suite.</p>
</section>

<section>
  <p class="n">05 · Differentiator</p>
  <p class="kicker">Confidential pre-trade, provable post-trade</p>
  <h2>Best execution without a public order book</h2>
  <p>A buyer — or a dealer defending its pricing — can disclose a single sealed quote to
  the regulator on demand. From those disclosures the desk proves the clearing price was
  at or below <strong>every competing ask</strong>.</p>
  <p>Compliance gets better evidence than a public tape, because it includes the quotes
  that were never executed. Competitors get nothing.</p>
</section>

<section>
  <p class="n">06 · Traction</p>
  <p class="kicker">Live on Canton Devnet — verifiable right now</p>
  <h2>Not a mock-up</h2>
  <div class="stats">
    <div class="stat"><b>41</b><span>settled trades on-ledger<br>+ 5 atomic baskets</span></div>
    <div class="stat"><b>16</b><span>best-execution attestations</span></div>
    <div class="stat"><b>36</b><span>Daml test scripts green</span></div>
    <div class="stat"><b>66</b><span>hosted QA checks, 3 browsers</span></div>
  </div>
  <p style="margin-top:6mm">~25 instruments across sovereigns, supranationals and
  corporates, on all three rails. Hosted read-only desk over live ledger state, plus a
  6-tool MCP server so an evaluator can point their own agent at the desk.</p>
</section>

<section>
  <p class="n">07 · Why Canton</p>
  <p class="kicker">The fifth implementation — and the first native one</p>
  <h2>Four chains, four cryptography stacks, one ledger that needed none</h2>
  <table>
    <tr><th>Build</th><th>Chain</th><th>Privacy machinery required</th></tr>
    <tr><td class="hi">Diam</td><td>Arbitrum (iExec)</td><td>TEE confidential compute, encrypted handles</td></tr>
    <tr><td class="hi">Segel</td><td>Stellar (Soroban)</td><td>Two Groth16 circuits, hand-rolled Poseidon</td></tr>
    <tr><td class="hi">Sealed Pair</td><td>Sui</td><td>Walrus commitments + Seal threshold encryption</td></tr>
    <tr><td class="hi">Samar</td><td>Ethereum (Zama)</td><td>FHE, branchless encrypted settlement</td></tr>
    <tr><td class="hi">Tirai</td><td>Canton</td><td><strong>None. Sub-transaction privacy is the ledger model.</strong></td></tr>
  </table>
</section>

<section>
  <p class="n">08 · Business</p>
  <p class="kicker">How it makes money, and who buys</p>
  <h2>A venue fee the contract collects itself</h2>
  <div class="cols">
    <div class="card"><h3>Revenue</h3><p>Basis points of notional in the settlement asset,
    taken atomically inside the settlement transaction — no invoicing, no collection risk.
    Plus CIP-0047 activity markers accruing network rewards on every trade.</p></div>
    <div class="card"><h3>Customer</h3><p>Desks whose tickets are large enough to leak
    ($1m–$100m), in an asset already tokenised, with an obligation to evidence best
    execution. Beachhead: crypto-native desks trading cETH and CBTC.</p></div>
  </div>
  <p style="margin-top:5mm">Distribution through hosting venues (Temple, Bron, Console,
  Canton Loop) that already hold the client relationship and custody — Tirai ships as an
  embedded app and shares the fee.</p>
</section>

<section>
  <p class="n">09 · Honest status</p>
  <p class="kicker">What is done, what is not</p>
  <h2>Built and verified · pending and stated</h2>
  <div class="cols">
    <div class="card"><h3>Done</h3><p>Model, three settlement rails, CIP-56 allocation
    path against the real Splice interfaces, privacy asserted on the live network, hosted
    desk, MCP server, 36 tests, full seeded audit trail.</p></div>
    <div class="card"><h3>Not yet</h3><p>No live cETH/CBTC transaction — blocked on the
    test-token grant. No paying customer, no design partner signed. Deployed on the shared
    5N validator; hackcanton-01 needs participant-admin rights (DAR upload 403).</p></div>
  </div>
  <p style="margin-top:5mm"><strong>The ask:</strong> cETH and CBTC Devnet test tokens, an
  introduction to one hosting venue, and one design-partner desk.</p>
</section>

<section>
  <p class="kicker">Tirai — Indonesian for "curtain"</p>
  <h1>Price discovery<br>happens behind it.</h1>
  <p class="lede">You whisper quotes. The market hears nothing —<br>and the regulator still
  gets the whole record.</p>
  <p class="foot">github.com/PugarHuda/tirai · tirai.vercel.app · hudapugar@gmail.com</p>
</section>`,
  },

};

const render = async (key) => {
  const doc = DOCS[key];
  if (!doc) throw new Error(`unknown document "${key}" — have: ${Object.keys(DOCS).join(', ')}`);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${doc.css ?? CSS}</style></head><body>${doc.body}</body></html>`, { waitUntil: 'load' });
  await mkdir(MEDIA, { recursive: true });
  const out = join(MEDIA, doc.out);
  await page.pdf({ path: out, format: 'A4', landscape: !!doc.landscape, printBackground: true });
  await browser.close();
  console.log('wrote', out);
};

const wanted = process.argv.slice(2);
for (const key of wanted.length ? wanted : Object.keys(DOCS)) await render(key);
