# Demo video script — Tirai (≤5 min, own voice)

**Rules that shape this script:** the narration must be **your own voice** (no AI
voice-over), the video must show **real transactions on Canton Devnet** — not a
mock-up — and it must run **≤ 5 minutes**.

**What to record:** the live hosted desk, https://tirai.vercel.app (real Devnet
state, read-only), plus one local run of `npm run demo` for the write actions
(award / settle), because the hosted proxy blocks writes by design.

Timings assume a normal speaking pace (~150 wpm). Total ≈ 4:40, leaving slack.

---

## 0:00 – 0:35 · The problem (landing page)

> When a bank moves a large block of bonds, the *fact that they are asking* is
> itself the market-moving information. Post that request on a transparent
> chain and every competitor sees your size and direction before you trade.
> That is why block trading still happens over the phone and on closed dealer
> terminals — off-chain.
>
> Tirai is that dealer terminal, on-ledger. Indonesian for "curtain": price
> discovery happens behind it.

*Screen: landing page hero, scroll once slowly.*

## 0:35 – 1:35 · The desk, live on Devnet (hosted, three columns)

> This is the desk running against Canton Devnet right now — buyer on the left,
> two dealers in the middle, the regulator on the right. Everything you see is
> live ledger state read through the JSON Ledger API.
>
> The buyer opens a request for quotes to a chosen dealer panel. Each dealer
> answers with a sealed quote, and quoting locks their bond into escrow, so a
> price is a commitment, not a bluff.
>
> Now look carefully at the two dealer columns. Dealer A sees its own quote.
> Dealer B sees its own. Neither can see the other's price — and that is not a
> UI filter, it is the ledger. Dealer B's participant node never received the
> contract.

*Screen: hosted desk, point at the RFQ, at each dealer column, then the
regulator column (empty pre-trade).*

## 1:35 – 2:15 · Proof, not a claim (Verify privacy view)

> Rather than ask you to believe me, the desk queries the live active-contract
> set for each party and counts what they can actually see. Dealers: only their
> own quotes. Regulator: zero pre-trade contracts. Green verdict, on the real
> network.
>
> The same assertion runs in CI as `devnet.mjs verify` — it exits non-zero if a
> single quote ever leaks.

*Screen: “Verify privacy” view, then the contrast panel (“what a transparent
chain would leak”).*

## 2:15 – 3:15 · Settlement in real cETH / CBTC (the HackCanton build)

> Here is what is new for HackCanton. The cash leg is not desk-minted play
> money — it is a real Canton Token Standard asset: cETH, CBTC, Canton Coin or
> USDCx, settled through the standard's allocation flow.
>
> Awarding a quote creates a `TokenTrade`, which implements the standard's
> `AllocationRequest` interface — so the buyer's ordinary wallet renders it as
> "allocate this much cETH to this settlement", with no Tirai-specific
> integration. The registry locks the cash.
>
> Then settlement runs as **one atomic transaction**: the registry transfers the
> cETH to the winning dealer, the escrowed bond is delivered to the buyer, and a
> trade report is created for the regulator. Delivery versus payment — or
> nothing at all. The instrument identity is bound end-to-end: a quote priced in
> cETH cannot be settled in CBTC, and a forged allocation is rejected.
>
> Because the cash instrument is just an administrator plus an id, cETH and CBTC
> are the same code path — proven by a second registry in the test suite.

*Screen: `daml/Tirai.daml` — `TokenTrade`, `TokenTrade_Settle`; then
`test/daml/TokenSettlementTest.daml`; then `cd test; daml test` scrolling to
**36 scripts ok**.*

## 3:15 – 4:05 · Driving it for real (local run, write path)

> Awarding is a write, and the public desk is deliberately read-only — the
> hosted proxy rejects every write path — so here is the same desk locally,
> driving the ledger.
>
> Buyer awards. Reverse-Vickrey: the cheapest dealer wins, but clears at the
> *second* price, so quoting honestly is the dominant strategy. One transaction
> later the bond has moved, the cash has moved, and the regulator's view — which
> was empty a moment ago — now shows exactly one settled trade. Post-trade
> transparency, zero pre-trade visibility.
>
> The buyer can also open a single sealed quote to the regulator on demand, to
> prove best execution — without ever going public.

*Screen: local desk (`npm run demo`), click Award, then regulator column, then
the “Provable best execution” view.*

## 4:05 – 4:40 · Why Canton, and what is honest about the state of it

> I have built this same product four times before: on Arbitrum with trusted
> hardware, on Stellar with zero-knowledge circuits, on Sui with threshold
> encryption, on Ethereum with fully homomorphic encryption. Every one of them
> was a fight against the chain's transparency.
>
> On Canton I wrote none of that. "Dealer B cannot see dealer A's quote" is a
> `signatory` and `observer` declaration.
>
> What is live today: the model deployed on Canton Devnet with privacy verified
> on-ledger, 36 test scripts green, and the full CIP-56 settlement path built
> against the real Splice interfaces and tested against a mock registry. What is
> not done yet: transactions in real cETH and CBTC on Devnet — that is waiting
> on the test-token grant, and it is the first thing that happens when it lands.
>
> Tirai. You whisper quotes. The market hears nothing.

---

## Recording checklist

- [ ] Own voice, no AI narration.
- [ ] Show the live Devnet desk (hosted) — real contracts, not a mock.
- [ ] Show `daml test` output (36 ok) on screen at least once.
- [ ] Show one write action end-to-end locally (award → settle → regulator).
- [ ] Keep under 5:00. Cut §3:15–4:05 first if you run long.
- [ ] Silent screen capture is available via `npm run record:demo` (writes
      `media/tirai-live-demo.webm` + `.srt`) — lay your voice over it.
