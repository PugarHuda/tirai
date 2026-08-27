# Tirai — HackCanton Season #2 submission

**Confidential multi-dealer RFQ / OTC desk on Canton, settling in real
CIP-0056 assets: live in Canton Coin and CBTC, with cETH on the same code path.**

- **Repo:** https://github.com/PugarHuda/tirai (public)
- **Live desk:** https://tirai.vercel.app — read-only, over real Devnet state
- **Live on Devnet:** package `tirai-desk` `4b1e408f…`, parties `tirai-v1-*`, on
  **HackCanton's own `hackcanton-01` participant** *and* the shared 5N validator
- **Build journal:** [JOURNAL.md](JOURNAL.md) — daily entries, 22–26 Jul
- **Team:** solo (Pugar Huda Mantoro)
- **Demo video:** **https://youtu.be/_iHMouFdNA4** (4:27 — the desk driven for
  real on a Canton participant, closing on the public Devnet deployment)
- **Lineage, disclosed:** continues the codebase of
  [Bisik](https://github.com/PugarHuda/bisik) (Encode Build on Canton). The
  HackCanton build is the CIP-0056 settlement leg — cETH/CBTC as real cash —
  plus the Devnet redeploy under a clean package.

## Tracks & bounties

Primary fit: **financial applications — DeFi, exchanges and trading venues**.
Tirai is a trading venue with real price discovery, real settlement and a real
fee model. Secondary fit: **real-world assets / business workflows** — the full
tokenised-bond lifecycle, issue → quote → settle → audit, is what the demo
drives end to end.

It also lands squarely on the **privacy & compliance** wishlist: selective
disclosure and a regulator portal are not add-ons here, they are two of the four
views in the product.

Ecosystem bounties targeted: **cETH (onRails)** and **CBTC (BitSafe)** — both
briefs name "private RFQ / OTC" and "confidential RFQ, atomic DvP" as wanted
primitives, and that is precisely what the settlement leg implements.

## 1-page business brief

**The problem.** When an institution moves a large block of bonds, the *fact of
the enquiry* is itself market-moving information. On a transparent chain, posting
an RFQ or a resting order leaks size and direction to every competitor before the
trade prints — front-running, adverse selection, and information leakage are
structural, not incidental. This is why block trading still happens over the phone
and on closed dealer terminals (Tradeweb, Bloomberg, MarketAxess), off-chain.

**The product.** Tirai is that dealer terminal, on-ledger. A buyer sends an RFQ to
a chosen dealer panel; each dealer's quote is **sealed** — rival dealers never
receive it, the market never sees the RFQ, losing quotes are archived unrevealed.
Settlement is **atomic DvP**: the bond and the cash leg move in one transaction or
neither does. A regulator sees **executed trades only** — full post-trade audit,
zero pre-trade visibility. On Canton this privacy is not cryptography bolted on;
it is the ledger's `signatory`/`observer` model.

**The cash leg is real.** Settlement clears through the CIP-0056 token standard's
allocation flow, and the desk has done it twice over: **Canton Coin** issued by the
DSO, and **CBTC** issued by BitSafe through the DA Utility Registry. One integration,
any registry: `cashInstrument` is any `{admin, id}`. **cETH has not moved yet** — it is
the same code path, waiting on the token grant.

**Ideal customer profile.** Fixed-income and crypto-asset trading desks at banks,
asset managers, and prop shops that trade in size and cannot afford to signal;
plus the venues (Temple, Bron, Console, Canton Loop) that would host the desk.

**Who pays, and how.** A per-trade venue fee in the settlement asset, basis
points of notional, taken inside the settlement transaction — which is what makes
it uncollectable-by-accident rather than invoiced: if the trade settles, the fee
settled with it. **That is in the model and it has collected on Devnet**: one
auction cleared 4,250,000 at 25 bps, 10,625 to the venue party and 4,239,375 to
the winning dealer, with the buyer paying exactly the clearing price. What is
still open is the **rate**, deliberately — blank charges nothing, and the number
should come out of a design partner arguing about it rather than out of our heads.
Two gaps we would rather state than have found: the registry rail (Canton Coin,
CBTC) takes no fee, because that cash moves through the issuer's allocation and
never becomes a holding this desk can split; and featured-app activity markers
(CIP-0047) are the intended second revenue line and are **not** implemented.

**Why Canton, specifically.** Sub-transaction privacy makes sealed quotes native —
no ZK circuits, no TEEs, no FHE (we built this thesis four other ways on four other
chains; each needed heavy crypto machinery). Atomic multi-party DvP across
independently-administered assets (a bond registry + the onRails cETH registry)
composes in a single transaction. Selective disclosure lets a buyer prove best
execution to a regulator on demand without ever going public. No other stack gives
you confidential-pre-trade + provable-post-trade + atomic-cross-registry-DvP
together.

## Economic flows & incentives (Track 2)

- **Price discovery:** competitive multi-dealer RFQ. Reverse-Vickrey clears the
  cheapest ask at the *second* price (truthful bidding), or the buyer lifts a
  single ask directly (direct OTC). Partial fills on both rails.
- **Value movement:** a settlement on a registry rail is a real CIP-0056
  `Allocation_ExecuteTransfer` to the winning dealer, atomic against bond delivery.
  Eight of them exist on-ledger today: six in Canton Coin, two in CBTC. That is the
  "recurring settlement activity" the bounty rubric measures, and cETH joins it the
  day its tokens land.
- **Incentive alignment:** sealed quotes remove the incentive to fade a visible
  order; escrow-on-quote removes counterparty risk; the regulator's post-trade-only
  view removes the surveillance objection to on-chain trading.

## Pilot plan

1. **Test-token integration — CBTC done, cETH pending.** The BitSafe rail is live:
   the faucet grant was accepted on-ledger and spent through the desk's own auctions.
   The same command settles cETH the day onRails grants tokens to
   `tirai-v1-buyer`; the deployer learns the registrar from the holding, so no code
   changes when it lands.
2. **Design-partner desk (2–4 weeks).** Stand up the hosted read-only desk against
   live Devnet state and put it in front of one fixed-income and one crypto-native
   trading desk for feedback on the quote/award/settle flow and the audit view.
3. **Mainnet pilot (4–8 weeks).** Deploy `tirai-desk` to a hosting venue (Temple /
   Bron / Console), set the fee rate with that partner and extend the collection to
   the registry rail, add the featured-app markers, and run a supervised pilot with a
   small dealer panel on a single instrument class.

**Required integrations:** onRails cETH registry (allocation API + faucet),
BitSafe CBTC registry, a validator/hosting venue, and wallet support (Canton Loop
/ Console) for the buyer's allocation step.

## What's built (verifiable now)

- **44 Daml test scripts green** (`cd test; daml test`) — happy path, the two
  privacy guarantees, Vickrey across 1/2/3 quotes, direct OTC, partial fills,
  baskets, selective disclosure, provable best execution, and the full CIP-0056
  DvP rail (cETH + CBTC, cancel, expiry, forged-allocation rejection, instrument
  binding, wallet-facing standard choices).
- **CIP-0056 settlement against the real Splice v1 interfaces** — see the "How the
  cash leg uses cETH / CBTC" section of the [README](README.md).
- **Settled live against two registries we do not control** — on the 5N Devnet
  validator, and driven entirely by each registry's own transfer and allocation
  factories over HTTP:
  - **Canton Coin**, issued and administered by the DSO (`seed-cc`): six trades,
    four reverse-Vickrey and two direct OTC, 60,900 CC moved to the winning dealers.
  - **CBTC**, issued by BitSafe through the DA Utility Registry (`seed-foreign CBTC`):
    a faucet grant accepted on-ledger, then spent through the desk — 0.34 CBTC cleared
    at the Vickrey second price, 0.22 CBTC hit directly at the ask.

  Each is bond-against-cash in one atomic transaction, and nothing in the model is
  per-asset: `cashInstrument` is any `{admin, id}`. **cETH differs by one field**,
  the `InstrumentId` admin, and waits only on its token grant.
- **The venue fee is collected by the settlement, not invoiced** (`seed-fee`) — an RFQ
  can name a venue and a rate in basis points; the cut is split off the cleared amount
  before the winning dealer is paid, so if the trade settles the fee settled with it and
  there is nothing to chase. All three cash settlement paths go through one function, so
  a settlement route cannot skip the fee by being written later, and the trade report
  records the amount, so an auditor reads the fee off the trade rather than off somebody's
  wallet. Live on the validator: **4,250,000 cleared at 25 bps → 10,625 to the venue,
  4,239,375 to the dealer**, and the buyer paid exactly the clearing price. Three limits,
  stated rather than buried: the rate is unset by default (blank charges nothing), the
  registry rail takes no fee because that cash moves through the issuer's allocation, and
  revenue is zero — test assets, our own parties, no paying customer.
- **Upgraded in place, with the compiler checking** — `daml.yaml` declares the deployed
  0.1.0 DAR as the upgrade base, so a change that would strand an existing contract fails
  the build. 0.1.0, 0.2.0 and 0.3.0 are vetted side by side on the validator; contracts
  written under the first still read under the last.
- **Deployed & privacy-verified on Devnet** — `node scripts/devnet.mjs verify`
  asserts on the live network that dealers see only their own quotes and the
  regulator sees zero pre-trade.
- **Hosted desk live** at https://tirai.vercel.app — real Devnet contracts
  through a serverless proxy that holds the token server-side and 403s every
  write path (`/v2/commands/*` verified rejected in production).
- MCP server for agent access — 6 tools, 5 read-only plus `post_rfq`, which
  posts a real RFQ on Devnet (25/25 MCP checks green against live state);
  read-only proxy self-test
  14/14, including a `filtersForAnyParty` enumeration-bypass regression test.

## Deployed on both Devnet participants

**HackCanton's own node, `hackcanton-01`** — package `tirai-desk`
`4b1e408f…` vetted by the node operators, parties `tirai-v1-*` under namespace
`122003aa7c49…`. Seeded and settled live on that node: **20 settled trades + 1
atomic basket, 16 best-execution attestations, 32 quote disclosures** and 3 open
RFQs, across reverse-Vickrey, direct-OTC and partial-fill rails. `devnet.mjs
verify` asserts there that **each dealer sees only its own quotes and the
regulator sees zero pre-trade contracts**.

**The shared 5N validator** — same package id, parties `tirai-v1-*`, carrying
the richer history: 50 settled trades (6 of them settled in real Canton
Coin through the DSO's registry), 5 atomic baskets, 16 best-execution
attestations. The hosted desk at https://tirai.vercel.app reads this deployment,
because its proxy holds a long-lived machine credential; `hackcanton-01` issues
only 3-hour user tokens (the account is Google SSO, so there is no machine
credential to hold), which a public read-only site cannot keep alive.

Worth recording for other teams: on `hackcanton-01`, DAR upload and party
allocation are participant-admin only — a wallet-session bearer authenticates
for reads and command submission but gets **403** on `POST /v2/packages` and
`POST /v2/parties`. The node operators do both on request, quickly. The deployer
treats that 403 as "already done for us" and addresses the operator-allocated
parties directly.

## What's pending (honest)

- Live cETH/CBTC transactions on Devnet — blocked on the onRails/BitSafe
  test-token grant (contract path built & tested against a mock of the real
  interfaces).
- Demo video (≤5 min, own voice) and the cETH builder feedback form.
