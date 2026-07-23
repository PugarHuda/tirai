# Tirai — HackCanton Season #2 submission

**Confidential multi-dealer RFQ / OTC desk on Canton, settling in real
CIP-0056 assets (cETH, CBTC, Canton Coin, USDCx).**

- **Repo:** https://github.com/PugarHuda/tirai (public)
- **Live on Devnet:** package `tirai-desk` `4b1e408f…`, parties `tirai-v1-*`,
  shared 5N hackathon validator
- **Team:** solo (Pugar Huda Mantoro)
- **Demo video:** _(≤3 min — link on submission)_
- **Lineage, disclosed:** continues the codebase of
  [Bisik](https://github.com/PugarHuda/bisik) (Encode Build on Canton). The
  HackCanton build is the CIP-0056 settlement leg — cETH/CBTC as real cash —
  plus the Devnet redeploy under a clean package.

## Tracks & bounties

Submitting to **Track 2 — Financial Applications** (primary) and **Track 1 — RWA
& Business Workflows** (tokenised bonds: issue → quote → settle → audit). Targets
the **cETH (onRails)** and **CBTC (BitSafe)** ecosystem bounties — both bounty
briefs explicitly name "private RFQ / OTC" and "confidential RFQ, atomic DvP" as
wanted primitives; that is exactly what Tirai is.

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

**The cash leg is real.** Settlement clears in **cETH, CBTC, Canton Coin or
USDCx** via the CIP-0056 token standard's allocation flow — one integration, every
asset. cETH/CBTC drive the actual value movement to the winning dealer.

**Ideal customer profile.** Fixed-income and crypto-asset trading desks at banks,
asset managers, and prop shops that trade in size and cannot afford to signal;
plus the venues (Temple, Bron, Console, Canton Loop) that would host the desk.

**Who pays, and how.** A per-trade venue fee in the settlement asset (bps of
notional), taken atomically at settlement — the same economics as an OTC venue,
now enforced by the contract rather than invoiced. Featured-app activity markers
(CIP-0047) accrue network rewards on every settlement, so a live desk keeps
earning from the volume it clears.

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
- **Value movement:** every settlement is a real CIP-0056 `Allocation_ExecuteTransfer`
  of cETH/CBTC to the winning dealer, atomic against bond delivery. Each trade is
  an on-chain cETH/CBTC transaction — the exact "recurring settlement activity"
  the bounty rubric measures.
- **Incentive alignment:** sealed quotes remove the incentive to fade a visible
  order; escrow-on-quote removes counterparty risk; the regulator's post-trade-only
  view removes the surveillance objection to on-chain trading.

## Pilot plan

1. **Test-token integration (now → token grant).** Wire the onRails cETH Devnet
   registry: fetch the registry's allocation choice-context off-ledger, attach
   disclosed contracts to the JSON-API submission, and settle ~10 live RFQ/OTC
   trades in real cETH on the 5N validator. Add CBTC via the BitSafe registry the
   same way (asset-agnostic — already proven in `testCbtcDvp`). *Blocked only on
   the cETH/CBTC test-token grant; the contract path is built and tested.*
2. **Design-partner desk (2–4 weeks).** Stand up the hosted read-only desk against
   live Devnet state and put it in front of one fixed-income and one crypto-native
   trading desk for feedback on the quote/award/settle flow and the audit view.
3. **Mainnet pilot (4–8 weeks).** Deploy `tirai-desk` to a hosting venue (Temple /
   Bron / Console), turn on the per-trade venue fee and featured-app markers, and
   run a supervised pilot with a small dealer panel on a single instrument class.

**Required integrations:** onRails cETH registry (allocation API + faucet),
BitSafe CBTC registry, a validator/hosting venue, and wallet support (Canton Loop
/ Console) for the buyer's allocation step.

## What's built (verifiable now)

- **36 Daml test scripts green** (`cd test; daml test`) — happy path, the two
  privacy guarantees, Vickrey across 1/2/3 quotes, direct OTC, partial fills,
  baskets, selective disclosure, provable best execution, and the full CIP-0056
  DvP rail (cETH + CBTC, cancel, expiry, forged-allocation rejection, instrument
  binding, wallet-facing standard choices).
- **CIP-0056 settlement against the real Splice v1 interfaces** — see the "How the
  cash leg uses cETH / CBTC" section of the [README](README.md).
- **Deployed & privacy-verified on Devnet** — `node scripts/devnet.mjs verify`
  asserts on the live network that dealers see only their own quotes and the
  regulator sees zero pre-trade.
- Three-column web desk, read-only MCP server (5 tools), read-only hosted proxy.

## What's pending (honest)

- Live cETH/CBTC transactions on Devnet — blocked on the onRails/BitSafe
  test-token grant (contract path built & tested against a mock of the real
  interfaces).
- 3-minute demo video (own voice), hosted desk redeploy, cETH builder feedback
  form.
